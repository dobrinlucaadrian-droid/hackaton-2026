// Anonymous usage statistics: page views and finished questionnaires are counted without any name, cookie, IP address or visitor id; only administrators read the numbers.
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { adminQuery } from "./access";

/** The public counter on the questionnaire page stays hidden until this many questionnaires were finished. */
export const PUBLIC_MIN = 50;

// Site-wide ceilings: far above real use, low enough that a script cannot fill the database.
const rateLimiter = new RateLimiter(components.rateLimiter, {
  trackVisit: { kind: "fixed window", rate: 30000, period: HOUR },
  quizRun: { kind: "fixed window", rate: 3000, period: HOUR },
});

// The sections of the site that are counted. Anything else is counted as "/altele"; the administration pages are not counted at all.
const SECTIONS = new Set(["", "test", "quiz", "rezultat", "universitati", "specializari", "programe", "studenti", "surse", "conectare", "cont", "confidentialitate"]);
const ID = /^[a-z0-9-]{1,60}$/;

// Days are counted in Romanian time, so "today" in the statistics matches the team's calendar.
const DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" });
const dayOf = (ms: number) => DAY.format(new Date(ms));
const today = () => dayOf(Date.now());

async function bumpDay(ctx: MutationCtx, day: string, kind: string, key: string) {
  const row = await ctx.db
    .query("dailyStats")
    .withIndex("by_day_kind_key", (q) => q.eq("day", day).eq("kind", kind).eq("key", key))
    .unique();
  if (row) await ctx.db.patch(row._id, { count: row.count + 1 });
  else await ctx.db.insert("dailyStats", { day, kind, key, count: 1 });
}

async function bumpQuiz(ctx: MutationCtx, kind: string, key: string) {
  const row = await ctx.db
    .query("quizStats")
    .withIndex("by_kind_key", (q) => q.eq("kind", kind).eq("key", key))
    .unique();
  if (row) await ctx.db.patch(row._id, { count: row.count + 1 });
  else await ctx.db.insert("quizStats", { kind, key, count: 1 });
}

/** "/universitati/ase-bucuresti?x=1" -> "/universitati/ase-bucuresti"; unknown sections -> "/altele"; admin pages -> null (not counted). */
function cleanPath(raw: string): string | null {
  const parts = raw.split(/[?#]/)[0].split("/").filter(Boolean).slice(0, 2);
  const section = parts[0] ?? "";
  if (section === "admin") return null;
  if (!SECTIONS.has(section)) return "/altele";
  if (parts.length === 2 && !ID.test(parts[1])) return `/${section}`;
  return `/${parts.join("/")}`;
}

/** Keeps only the site name of the page the visitor came from ("https://www.google.com/search?q=..." -> "google.com"). */
function cleanReferrer(raw: string | undefined): string {
  if (!raw) return "direct";
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    return /^[a-z0-9.-]{1,60}$/.test(host) ? host : "necunoscut";
  } catch {
    return "necunoscut";
  }
}

/** Counts one page view. `first` marks the first page of a visit; only then are the country and the referring site counted. */
export const trackVisit = mutation({
  args: { path: v.string(), first: v.boolean(), referrer: v.optional(v.string()), country: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { path, first, referrer, country }) => {
    if (path.length > 200 || (referrer && referrer.length > 500)) return null;
    const clean = cleanPath(path);
    if (clean === null) return null;
    const { ok } = await rateLimiter.limit(ctx, "trackVisit");
    if (!ok) return null;
    const day = today();
    await bumpDay(ctx, day, "views", "all");
    await bumpDay(ctx, day, "path", clean);
    if (first) {
      await bumpDay(ctx, day, "visits", "all");
      await bumpDay(ctx, day, "country", country && /^[A-Z]{2}$/.test(country) ? country : "necunoscut");
      await bumpDay(ctx, day, "ref", cleanReferrer(referrer));
    }
    return null;
  },
});

/** Stores one finished questionnaire without any identity and updates the counters. Badly shaped data is dropped silently. */
export const recordQuizRun = mutation({
  args: {
    profileId: v.string(),
    where: v.union(v.literal("ro"), v.literal("abroad"), v.literal("any")),
    city: v.optional(v.string()),
    choices: v.record(v.string(), v.number()),
    topDomains: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { profileId, where, city, choices, topDomains }) => {
    const entries = Object.entries(choices);
    const cleanCity = city?.trim();
    if (!ID.test(profileId)) return null;
    if (entries.length === 0 || entries.length > 40) return null;
    if (entries.some(([q, i]) => !ID.test(q) || !Number.isInteger(i) || i < 0 || i > 9)) return null;
    if (topDomains.length === 0 || topDomains.length > 3 || topDomains.some((d) => !ID.test(d))) return null;
    if (cleanCity !== undefined && (cleanCity.length === 0 || cleanCity.length > 60)) return null;
    const { ok } = await rateLimiter.limit(ctx, "quizRun");
    if (!ok) return null;

    const day = today();
    await ctx.db.insert("quizRuns", { day, profileId, where, ...(cleanCity ? { city: cleanCity } : {}), choices, topDomains });
    await bumpDay(ctx, day, "quiz", "all");
    await bumpQuiz(ctx, "total", "all");
    await bumpQuiz(ctx, "profile", profileId);
    await bumpQuiz(ctx, "where", where);
    if (cleanCity) await bumpQuiz(ctx, "city", cleanCity);
    await bumpQuiz(ctx, "top1", topDomains[0]);
    for (const d of new Set(topDomains)) await bumpQuiz(ctx, "top", d);
    for (const [q, i] of entries) await bumpQuiz(ctx, "answer", `${q}:${i}`);
    return null;
  },
});

/** How many questionnaires were finished so far, for the public questionnaire page. Null while the number is still small. */
export const quizCount = query({
  args: {},
  returns: v.union(v.number(), v.null()),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("quizStats")
      .withIndex("by_kind_key", (q) => q.eq("kind", "total").eq("key", "all"))
      .unique();
    const n = row?.count ?? 0;
    return n >= PUBLIC_MIN ? n : null;
  },
});

const counted = v.array(v.object({ key: v.string(), count: v.number() }));

/** Everything the statistics page shows, for the last `days` days (questionnaire answers are all-time). Administrators only. */
export const overview = adminQuery({
  args: { days: v.number() },
  returns: v.object({
    days: v.array(v.object({ day: v.string(), views: v.number(), visits: v.number(), quiz: v.number() })),
    paths: counted,
    countries: counted,
    referrers: counted,
    quiz: v.object({ total: v.number(), profiles: counted, where: counted, cities: counted, top1: counted, top: counted, answers: counted }),
    database: v.object({
      users: v.number(),
      admins: v.number(),
      savedResults: v.number(),
      reviews: v.object({ pending: v.number(), approved: v.number(), rejected: v.number() }),
      catalogLoadedAt: v.union(v.number(), v.null()),
    }),
    truncated: v.boolean(),
  }),
  handler: async (ctx, { days }) => {
    const span = Math.min(90, Math.max(1, Math.floor(days)));
    const daySet = new Set<string>();
    for (let i = span - 1; i >= 0; i--) daySet.add(dayOf(Date.now() - i * 86400000));
    const dayList = [...daySet];

    const LIMIT = 8000;
    const rows = await ctx.db
      .query("dailyStats")
      .withIndex("by_day_kind_key", (q) => q.gte("day", dayList[0]))
      .take(LIMIT);

    const perDay = new Map(dayList.map((day) => [day, { day, views: 0, visits: 0, quiz: 0 }]));
    const sums: Record<string, Map<string, number>> = { path: new Map(), country: new Map(), ref: new Map() };
    for (const r of rows) {
      const d = perDay.get(r.day);
      if (d && (r.kind === "views" || r.kind === "visits" || r.kind === "quiz")) d[r.kind] += r.count;
      const sum = sums[r.kind];
      if (sum) sum.set(r.key, (sum.get(r.key) ?? 0) + r.count);
    }
    const sorted = (m: Map<string, number>, max: number) =>
      [...m].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)).slice(0, max);

    const quizRows = await ctx.db.query("quizStats").take(3000);
    const ofKind = (kind: string, max = 500) =>
      quizRows.filter((r) => r.kind === kind).map(({ key, count }) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)).slice(0, max);

    const users = await ctx.db.query("users").take(5000);
    const savedResults = await ctx.db.query("results").take(5000);
    const reviewCount = async (state: "pending" | "approved" | "rejected") =>
      (await ctx.db.query("reviews").withIndex("by_state", (q) => q.eq("state", state)).take(2000)).length;
    const firstInstitution = await ctx.db.query("institutions").first();

    return {
      days: [...perDay.values()],
      paths: sorted(sums.path, 40),
      countries: sorted(sums.country, 40),
      referrers: sorted(sums.ref, 40),
      quiz: {
        total: ofKind("total")[0]?.count ?? 0,
        profiles: ofKind("profile"),
        where: ofKind("where"),
        cities: ofKind("city", 60),
        top1: ofKind("top1"),
        top: ofKind("top"),
        answers: ofKind("answer", 1000),
      },
      database: {
        users: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        savedResults: savedResults.length,
        reviews: { pending: await reviewCount("pending"), approved: await reviewCount("approved"), rejected: await reviewCount("rejected") },
        catalogLoadedAt: firstInstitution?._creationTime ?? null,
      },
      truncated: rows.length === LIMIT,
    };
  },
});
