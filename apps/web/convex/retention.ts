// How long the site keeps each kind of data, and the daily clean-up that deletes what is older (GDPR storage limitation). The periods are the team's choice and are written on the privacy page; change them only together.
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const DAY = 24 * 60 * 60 * 1000;

/** Keeping periods, in days. */
export const KEEP = {
  unconfirmedAccount: 7, // an account whose email was never confirmed with the code
  rejectedReview: 30, // a review the team rejected (counted from the decision)
  pendingReview: 90, // a review nobody moderated
  quizRun: 365, // one finished questionnaire, without name or account (statistics)
  dailyStats: 730, // anonymous counts per day (page views, countries, referring sites)
  failedSignIns: 2, // the Convex Auth counter of wrong passwords/codes, which holds the account email (it refills within an hour)
} as const;

/** At most this many rows of each kind per run, so one run stays small; the next day continues. */
const BATCH = 300;

/** "YYYY-MM-DD" of the day `days` days ago (UTC; one day of difference does not matter here). */
function dayAgo(now: number, days: number): string {
  return new Date(now - days * DAY).toISOString().slice(0, 10);
}

/** Deletes a user and everything Convex Auth keeps for them (sessions, refresh tokens, sign-in records, codes), their saved result and their favourite universities. */
export async function deleteUserEverywhere(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  for (const f of await ctx.db.query("favorites").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) await ctx.db.delete(f._id);
  for (const r of await ctx.db.query("results").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) await ctx.db.delete(r._id);
  for (const s of await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect()) {
    for (const t of await ctx.db.query("authRefreshTokens").withIndex("sessionId", (q) => q.eq("sessionId", s._id)).collect()) await ctx.db.delete(t._id);
    await ctx.db.delete(s._id);
  }
  for (const a of await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId)).collect()) {
    for (const c of await ctx.db.query("authVerificationCodes").withIndex("accountId", (q) => q.eq("accountId", a._id)).collect()) await ctx.db.delete(c._id);
    await ctx.db.delete(a._id);
  }
  await ctx.db.delete(userId);
}

/** The daily clean-up (scheduled in convex/crons.ts). Returns how many rows of each kind it deleted. */
export const cleanup = internalMutation({
  args: { now: v.optional(v.number()) },
  returns: v.object({ accounts: v.number(), reviews: v.number(), quizRuns: v.number(), dailyStats: v.number(), failedSignIns: v.number() }),
  handler: async (ctx, { now = Date.now() }) => {
    let accounts = 0, reviews = 0, quizRuns = 0, dailyStats = 0, failedSignIns = 0;

    // Accounts that never confirmed their email, oldest first (the index keeps them in order of creation).
    const unconfirmed = await ctx.db
      .query("users")
      .withIndex("by_email_verified", (q) => q.eq("emailVerificationTime", undefined).lt("_creationTime", now - KEEP.unconfirmedAccount * DAY))
      .take(BATCH);
    for (const user of unconfirmed) {
      if (user.role === "admin") continue;
      await deleteUserEverywhere(ctx, user._id);
      accounts++;
    }

    // Rejected reviews, counted from the decision; pending ones nobody moderated, counted from when they came.
    for (const r of await ctx.db.query("reviews").withIndex("by_state", (q) => q.eq("state", "rejected")).take(BATCH)) {
      if ((r.moderatedAt ?? r.submittedAt) < now - KEEP.rejectedReview * DAY) {
        await ctx.db.delete(r._id);
        reviews++;
      }
    }
    for (const r of await ctx.db
      .query("reviews")
      .withIndex("by_state", (q) => q.eq("state", "pending").lt("submittedAt", now - KEEP.pendingReview * DAY))
      .take(BATCH)) {
      await ctx.db.delete(r._id);
      reviews++;
    }

    // Statistics older than their period.
    for (const q of await ctx.db.query("quizRuns").withIndex("by_day", (i) => i.lt("day", dayAgo(now, KEEP.quizRun))).take(BATCH)) {
      await ctx.db.delete(q._id);
      quizRuns++;
    }
    for (const s of await ctx.db.query("dailyStats").withIndex("by_day_kind_key", (i) => i.lt("day", dayAgo(now, KEEP.dailyStats))).take(BATCH)) {
      await ctx.db.delete(s._id);
      dailyStats++;
    }

    // The Convex Auth wrong-password counters: old rows only (a recent one still protects the account). Small table, read in batches.
    for (const row of await ctx.db.query("authRateLimits").take(BATCH)) {
      if (row.lastAttemptTime < now - KEEP.failedSignIns * DAY) {
        await ctx.db.delete(row._id);
        failedSignIns++;
      }
    }

    if (accounts + reviews + quizRuns + dailyStats + failedSignIns > 0) console.log(`[cleanup] accounts ${accounts}, reviews ${reviews}, quizRuns ${quizRuns}, dailyStats ${dailyStats}, failedSignIns ${failedSignIns}`);
    return { accounts, reviews, quizRuns, dailyStats, failedSignIns };
  },
});
