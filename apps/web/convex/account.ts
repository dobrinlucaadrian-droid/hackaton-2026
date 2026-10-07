// The signed-in user's own account: who they are (name and email), which sign-in methods exist, and deleting the account with everything saved in it.
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { cleanName } from "../lib/name";
import { userMutation } from "./access";

/** The signed-in user (name, email and whether they are an administrator), or null when nobody is signed in. */
export const me = query({
  args: {},
  returns: v.union(v.object({ name: v.optional(v.string()), email: v.optional(v.string()), isAdmin: v.boolean() }), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { ...(user.name ? { name: user.name } : {}), ...(user.email ? { email: user.email } : {}), isAdmin: user.role === "admin" };
  },
});

/** Saves the signed-in user's own full name. */
export const setName = userMutation({
  args: { name: v.string() },
  returns: v.null(),
  handler: async (ctx, { name }) => {
    const clean = cleanName(name);
    if (!clean) throw new ConvexError("Scrie numele tău complet (prenume și nume).");
    await ctx.db.patch(ctx.userId, { name: clean });
    return null;
  },
});

/** Which sign-in methods the sign-in page may offer. Contains no secrets. */
export const signInMethods = query({
  args: {},
  returns: v.object({ email: v.boolean(), google: v.boolean() }),
  handler: async () => ({
    email: !!process.env.AUTH_RESEND_KEY || process.env.AUTH_DEV_LOG_LINKS === "1",
    google: !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET,
  }),
});

/** Deletes the signed-in user's account: saved result, sessions, sign-in records and the user itself. */
export const remove = userMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = ctx.userId;
    for (const r of await ctx.db.query("results").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(r._id);
    }
    for (const s of await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect()) {
      for (const t of await ctx.db.query("authRefreshTokens").withIndex("sessionId", (q) => q.eq("sessionId", s._id)).collect()) {
        await ctx.db.delete(t._id);
      }
      await ctx.db.delete(s._id);
    }
    for (const a of await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId)).collect()) {
      for (const c of await ctx.db.query("authVerificationCodes").withIndex("accountId", (q) => q.eq("accountId", a._id)).collect()) {
        await ctx.db.delete(c._id);
      }
      await ctx.db.delete(a._id);
    }
    await ctx.db.delete(userId);
    return null;
  },
});
