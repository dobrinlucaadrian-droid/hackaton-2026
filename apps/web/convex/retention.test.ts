// @vitest-environment edge-runtime
// Tests the daily clean-up: it deletes only what is older than its keeping period and never a confirmed account or an approved review.
/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { KEEP } from "./retention";

const modules = import.meta.glob("./**/*.ts");
const DAY = 24 * 60 * 60 * 1000;
const REVIEW = { name: "Ana Test", faculty: "Informatică", text: "Un text de probă destul de lung pentru formular.", consent: true };

async function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  return t;
}

describe("daily clean-up", () => {
  it("deletes unconfirmed accounts after their period and keeps confirmed ones", async () => {
    const t = await setup();
    const [unconfirmed, confirmed] = await t.run(async (ctx) => [
      await ctx.db.insert("users", { username: "nou01", email: "nou@example.com" }),
      await ctx.db.insert("users", { username: "bun01", email: "bun@example.com", emailVerificationTime: 1 }),
    ]);
    // the same day: nothing is deleted
    expect((await t.mutation(internal.retention.cleanup, {})).accounts).toBe(0);
    // after the period: only the unconfirmed one
    const later = Date.now() + (KEEP.unconfirmedAccount + 1) * DAY;
    expect((await t.mutation(internal.retention.cleanup, { now: later })).accounts).toBe(1);
    const left = await t.run(async (ctx) => [await ctx.db.get(unconfirmed as Id<"users">), await ctx.db.get(confirmed as Id<"users">)]);
    expect(left[0]).toBeNull();
    expect(left[1]?.username).toBe("bun01");
  });

  it("deletes rejected and never-moderated reviews after their periods, never approved ones", async () => {
    const t = await setup();
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("reviews", { ...REVIEW, state: "approved", submittedAt: now - 1000 * DAY });
      await ctx.db.insert("reviews", { ...REVIEW, state: "rejected", submittedAt: now - 100 * DAY, moderatedAt: now - (KEEP.rejectedReview + 1) * DAY });
      await ctx.db.insert("reviews", { ...REVIEW, state: "rejected", submittedAt: now - 2 * DAY, moderatedAt: now - DAY });
      await ctx.db.insert("reviews", { ...REVIEW, state: "pending", submittedAt: now - (KEEP.pendingReview + 1) * DAY });
      await ctx.db.insert("reviews", { ...REVIEW, state: "pending", submittedAt: now - DAY });
    });
    expect((await t.mutation(internal.retention.cleanup, { now })).reviews).toBe(2);
    const states = (await t.run(async (ctx) => ctx.db.query("reviews").collect())).map((r) => r.state).sort();
    expect(states).toEqual(["approved", "pending", "rejected"]);
  });

  it("deletes statistics older than their period", async () => {
    const t = await setup();
    const now = Date.now();
    const day = (d: number) => new Date(now - d * DAY).toISOString().slice(0, 10);
    await t.run(async (ctx) => {
      await ctx.db.insert("dailyStats", { day: day(KEEP.dailyStats + 5), kind: "views", key: "/", count: 3 });
      await ctx.db.insert("dailyStats", { day: day(1), kind: "views", key: "/", count: 3 });
    });
    expect((await t.mutation(internal.retention.cleanup, { now })).dailyStats).toBe(1);
  });
});

describe("deleting a review", () => {
  it("is allowed only to administrators", async () => {
    const t = await setup();
    const [admin, student, review] = await t.run(async (ctx) => [
      await ctx.db.insert("users", { email: "admin@example.com", role: "admin" }),
      await ctx.db.insert("users", { email: "elev@example.com" }),
      await ctx.db.insert("reviews", { ...REVIEW, state: "approved", submittedAt: Date.now() }),
    ]);
    await t.run(async (ctx) => { await ctx.db.insert("adminUnlocks", { userId: admin as Id<"users">, sessionId: "test-session", until: Date.now() + 3_600_000 }); });
    const as = (id: Id<"users">) => t.withIdentity({ subject: `${id}|test-session` });
    await expect(t.mutation(api.reviews.remove, { id: review as Id<"reviews"> })).rejects.toThrow();
    await expect(as(student as Id<"users">).mutation(api.reviews.remove, { id: review as Id<"reviews"> })).rejects.toThrow();
    await as(admin as Id<"users">).mutation(api.reviews.remove, { id: review as Id<"reviews"> });
    expect(await t.run(async (ctx) => ctx.db.get(review as Id<"reviews">))).toBeNull();
  });
});
