// @vitest-environment edge-runtime
// Tests the access rules of the Convex functions: who may read and change what.
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const RESULT = { profileId: "real-mate-info", where: "ro" as const, city: "București", choices: { "proiect-de-grup": 1 }, topDomains: ["informatica"] };
const REVIEW = {
  name: "Ana Test",
  faculty: "Informatică, Universitatea de Test",
  text: "Un text de probă destul de lung ca să treacă de limita minimă de caractere.",
  consent: true,
};

async function setup() {
  const t = convexTest(schema, modules);
  const [alice, bob, admin] = await t.run(async (ctx) => [
    await ctx.db.insert("users", { email: "alice@example.com" }),
    await ctx.db.insert("users", { email: "bob@example.com" }),
    await ctx.db.insert("users", { email: "admin@example.com", role: "admin" }),
  ]);
  // Convex Auth puts "<user id>|<session id>" in the token subject.
  const as = (id: Id<"users">) => t.withIdentity({ subject: `${id}|test-session` });
  return { t, alice, bob, admin, as };
}

describe("saved results", () => {
  it("refuse anyone who is not signed in", async () => {
    const { t } = await setup();
    await expect(t.query(api.results.mine, {})).rejects.toThrow("Trebuie să fii conectat");
    await expect(t.mutation(api.results.save, RESULT)).rejects.toThrow("Trebuie să fii conectat");
    await expect(t.mutation(api.results.remove, {})).rejects.toThrow("Trebuie să fii conectat");
  });

  it("each student sees, replaces and deletes only their own result", async () => {
    const { t, alice, bob, as } = await setup();
    await as(alice).mutation(api.results.save, RESULT);
    expect((await as(alice).query(api.results.mine, {}))?.city).toBe("București");
    expect(await as(bob).query(api.results.mine, {})).toBeNull();

    await as(bob).mutation(api.results.save, { ...RESULT, city: "Iași" });
    await as(alice).mutation(api.results.save, { ...RESULT, city: "Cluj-Napoca" });
    expect((await as(alice).query(api.results.mine, {}))?.city).toBe("Cluj-Napoca");
    expect((await as(bob).query(api.results.mine, {}))?.city).toBe("Iași");
    expect(await t.run((ctx) => ctx.db.query("results").collect())).toHaveLength(2);

    await as(bob).mutation(api.results.remove, {});
    expect(await as(bob).query(api.results.mine, {})).toBeNull();
    expect((await as(alice).query(api.results.mine, {}))?.city).toBe("Cluj-Napoca");
  });

  it("there is no way to pass another user's id, and bad data is refused", async () => {
    const { bob, alice, as } = await setup();
    // @ts-expect-error userId is not an accepted argument
    await expect(as(alice).mutation(api.results.save, { ...RESULT, userId: bob })).rejects.toThrow();
    await expect(as(alice).mutation(api.results.save, { ...RESULT, topDomains: ["a", "b", "c", "d"] })).rejects.toThrow("Date nevalide");
    await expect(as(alice).mutation(api.results.save, { ...RESULT, choices: { q: 99 } })).rejects.toThrow("Date nevalide");
    await expect(as(alice).mutation(api.results.save, { ...RESULT, profileId: "x".repeat(200) })).rejects.toThrow("Date nevalide");
  });
});

describe("reviews", () => {
  it("a new review is always pending and is not public", async () => {
    const { t } = await setup();
    const id = await t.mutation(internal.reviews.insertPending, REVIEW);
    expect((await t.run((ctx) => ctx.db.get(id)))?.state).toBe("pending");
    expect(await t.query(api.reviews.listApproved, {})).toEqual([]);
  });

  it("the queue and the approval are for administrators only", async () => {
    const { t, alice, as } = await setup();
    const id = await t.mutation(internal.reviews.insertPending, REVIEW);
    await expect(t.query(api.reviews.listByState, { state: "pending" })).rejects.toThrow("Trebuie să fii conectat");
    await expect(as(alice).query(api.reviews.listByState, { state: "pending" })).rejects.toThrow("Nu ai drept de administrator");
    await expect(t.mutation(api.reviews.moderate, { id, state: "approved" })).rejects.toThrow("Trebuie să fii conectat");
    await expect(as(alice).mutation(api.reviews.moderate, { id, state: "approved" })).rejects.toThrow("Nu ai drept de administrator");
    expect(await t.query(api.reviews.listApproved, {})).toEqual([]);
  });

  it("an administrator approves; the public list shows it without moderation fields; rejecting hides it again", async () => {
    const { t, admin, as } = await setup();
    const id = await t.mutation(internal.reviews.insertPending, REVIEW);
    expect(await as(admin).query(api.reviews.listByState, { state: "pending" })).toHaveLength(1);
    await as(admin).mutation(api.reviews.moderate, { id, state: "approved" });

    const shown = await t.query(api.reviews.listApproved, {});
    expect(shown).toHaveLength(1);
    expect(Object.keys(shown[0]).sort()).toEqual(["faculty", "id", "name", "text"]);
    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.moderatedBy).toBe(admin);

    await as(admin).mutation(api.reviews.moderate, { id, state: "rejected" });
    expect(await t.query(api.reviews.listApproved, {})).toEqual([]);
  });

  it("the role cannot be faked: a user with no role in the database is refused", async () => {
    const { t, bob } = await setup();
    const fake = t.withIdentity({ subject: `${bob}|s`, role: "admin", name: "admin" });
    await expect(fake.query(api.reviews.listByState, { state: "pending" })).rejects.toThrow("Nu ai drept de administrator");
  });

  it("refuses reviews without consent or with text that is too short or too long", async () => {
    const { t } = await setup();
    await expect(t.mutation(internal.reviews.insertPending, { ...REVIEW, consent: false })).rejects.toThrow("acordul");
    await expect(t.mutation(internal.reviews.insertPending, { ...REVIEW, text: "prea scurt" })).rejects.toThrow("prea scurtă");
    await expect(t.mutation(internal.reviews.insertPending, { ...REVIEW, text: "x".repeat(3001) })).rejects.toThrow("prea lungă");
  });
});

describe("account", () => {
  it("me is null for visitors and never says admin unless the database does", async () => {
    const { t, alice, admin, as } = await setup();
    expect(await t.query(api.account.me, {})).toBeNull();
    expect(await as(alice).query(api.account.me, {})).toEqual({ email: "alice@example.com", isAdmin: false });
    expect(await as(admin).query(api.account.me, {})).toEqual({ email: "admin@example.com", isAdmin: true });
  });

  it("deleting the account removes that user's data and nobody else's", async () => {
    const { t, alice, bob, as } = await setup();
    await as(alice).mutation(api.results.save, RESULT);
    await as(bob).mutation(api.results.save, RESULT);
    await expect(t.mutation(api.account.remove, {})).rejects.toThrow("Trebuie să fii conectat");

    await as(alice).mutation(api.account.remove, {});
    const left = await t.run(async (ctx) => ({ users: await ctx.db.query("users").collect(), results: await ctx.db.query("results").collect() }));
    expect(left.users.map((u) => u.email).sort()).toEqual(["admin@example.com", "bob@example.com"]);
    expect(left.results).toHaveLength(1);
    expect(left.results[0].userId).toBe(bob);
    // The deleted user's old session can no longer read anything.
    expect(await as(alice).query(api.account.me, {})).toBeNull();
  });
});
