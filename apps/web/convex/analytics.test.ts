// @vitest-environment edge-runtime
// Tests the anonymous statistics: what is counted, what is refused, and that only administrators can read the numbers.
/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { PUBLIC_MIN } from "./analytics";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const RUN = { profileId: "real-mate-info", where: "ro" as const, city: "Iași", choices: { "proiect-de-grup": 1, "zi-de-lucru": 4 }, topDomains: ["informatica", "matematica", "fizica"] };

async function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  const [user, admin] = await t.run(async (ctx) => [
    await ctx.db.insert("users", { email: "elev@example.com" }),
    await ctx.db.insert("users", { email: "admin@example.com", role: "admin" }),
  ]);
  const as = (id: Id<"users">) => t.withIdentity({ subject: `${id}|test-session` });
  return { t, user, admin, as };
}

describe("statistics access", () => {
  it("only an administrator can read the overview", async () => {
    const { t, user, admin, as } = await setup();
    await expect(t.query(api.analytics.overview, { days: 7 })).rejects.toThrow("Trebuie să fii conectat");
    await expect(as(user).query(api.analytics.overview, { days: 7 })).rejects.toThrow("Nu ai drept de administrator");
    const data = await as(admin).query(api.analytics.overview, { days: 7 });
    expect(data.days.length).toBeGreaterThanOrEqual(6); // 7, or 6 on the day the clock changes
    expect(data.database).toMatchObject({ users: 2, admins: 1, savedResults: 0, catalogLoadedAt: null });
  });
});

describe("visits", () => {
  it("counts views per page and the country and source once per visit", async () => {
    const { t, admin, as } = await setup();
    await t.mutation(api.analytics.trackVisit, { path: "/", first: true, referrer: "https://www.google.com/search?q=facultate", country: "RO" });
    await t.mutation(api.analytics.trackVisit, { path: "/universitati/ase-bucuresti?x=1", first: false });
    await t.mutation(api.analytics.trackVisit, { path: "/test", first: false, country: "DE" });
    const data = await as(admin).query(api.analytics.overview, { days: 1 });
    expect(data.days[0]).toMatchObject({ views: 3, visits: 1, quiz: 0 });
    expect(data.countries).toEqual([{ key: "RO", count: 1 }]);
    expect(data.referrers).toEqual([{ key: "google.com", count: 1 }]);
    expect(data.paths.map((p) => p.key).sort()).toEqual(["/", "/test", "/universitati/ase-bucuresti"]);
  });

  it("does not count administration pages and keeps no free text from the browser", async () => {
    const { t, admin, as } = await setup();
    await t.mutation(api.analytics.trackVisit, { path: "/admin/statistici", first: true });
    await t.mutation(api.analytics.trackVisit, { path: "/ceva-necunoscut/<script>", first: true, referrer: "nu e o adresă", country: "România" });
    await t.mutation(api.analytics.trackVisit, { path: "/universitati/Nume Cu Spații", first: false });
    const data = await as(admin).query(api.analytics.overview, { days: 1 });
    expect(data.days[0]).toMatchObject({ views: 2, visits: 1 });
    expect(data.paths.map((p) => p.key).sort()).toEqual(["/altele", "/universitati"]);
    expect(data.countries).toEqual([{ key: "necunoscut", count: 1 }]);
    expect(data.referrers).toEqual([{ key: "necunoscut", count: 1 }]);
    // Nothing that could identify a visitor is stored: only the counters.
    const rows = await t.run((ctx) => ctx.db.query("dailyStats").collect());
    expect(rows.every((r) => Object.keys(r).sort().join() === "_creationTime,_id,count,day,key,kind")).toBe(true);
  });
});

describe("questionnaire statistics", () => {
  it("stores a finished questionnaire without identity and counts every answer", async () => {
    const { t, admin, user, as } = await setup();
    await as(user).mutation(api.analytics.recordQuizRun, RUN); // even when signed in, no user id is kept
    await t.mutation(api.analytics.recordQuizRun, { ...RUN, city: undefined, where: "abroad", choices: { "proiect-de-grup": 1 }, topDomains: ["medicina"] });
    const runs = await t.run((ctx) => ctx.db.query("quizRuns").collect());
    expect(runs).toHaveLength(2);
    expect(Object.keys(runs[0]).sort()).toEqual(["_creationTime", "_id", "choices", "city", "day", "profileId", "topDomains", "where"]);

    const { quiz, days } = await as(admin).query(api.analytics.overview, { days: 1 });
    expect(quiz.total).toBe(2);
    expect(days[0].quiz).toBe(2);
    expect(quiz.answers).toContainEqual({ key: "proiect-de-grup:1", count: 2 });
    expect(quiz.answers).toContainEqual({ key: "zi-de-lucru:4", count: 1 });
    expect(quiz.top1).toContainEqual({ key: "informatica", count: 1 });
    expect(quiz.top).toContainEqual({ key: "fizica", count: 1 });
    expect(quiz.cities).toEqual([{ key: "Iași", count: 1 }]);
    expect(quiz.where).toContainEqual({ key: "abroad", count: 1 });
  });

  it("drops badly shaped data without storing anything", async () => {
    const { t } = await setup();
    await t.mutation(api.analytics.recordQuizRun, { ...RUN, profileId: "<script>" });
    await t.mutation(api.analytics.recordQuizRun, { ...RUN, choices: {} });
    await t.mutation(api.analytics.recordQuizRun, { ...RUN, choices: { "proiect-de-grup": 99 } });
    await t.mutation(api.analytics.recordQuizRun, { ...RUN, topDomains: ["a", "b", "c", "d"] });
    await t.mutation(api.analytics.recordQuizRun, { ...RUN, city: "x".repeat(61) });
    expect(await t.run((ctx) => ctx.db.query("quizRuns").collect())).toHaveLength(0);
    expect(await t.run((ctx) => ctx.db.query("quizStats").collect())).toHaveLength(0);
  });

  it("the public counter stays hidden until enough questionnaires were finished", async () => {
    const { t } = await setup();
    await t.mutation(api.analytics.recordQuizRun, RUN);
    expect(await t.query(api.analytics.quizCount, {})).toBeNull();
    await t.run(async (ctx) => {
      const row = await ctx.db.query("quizStats").withIndex("by_kind_key", (q) => q.eq("kind", "total").eq("key", "all")).unique();
      await ctx.db.patch(row!._id, { count: PUBLIC_MIN - 1 });
    });
    expect(await t.query(api.analytics.quizCount, {})).toBeNull();
    await t.mutation(api.analytics.recordQuizRun, RUN);
    expect(await t.query(api.analytics.quizCount, {})).toBe(PUBLIC_MIN);
  });
});
