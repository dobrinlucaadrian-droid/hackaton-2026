// The signed-in user's own account: who they are (username, name and email), whether email codes can be sent, and deleting the account with everything saved in it.
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { cleanName } from "../lib/name";
import { cleanUsername } from "../lib/username";
import { userMutation } from "./access";

/** The signed-in user (username, name, email and whether they are an administrator), or null when nobody is signed in. */
export const me = query({
  args: {},
  returns: v.union(v.object({ username: v.optional(v.string()), name: v.optional(v.string()), email: v.optional(v.string()), isAdmin: v.boolean() }), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { ...(user.username ? { username: user.username } : {}), ...(user.name ? { name: user.name } : {}), ...(user.email ? { email: user.email } : {}), isAdmin: user.role === "admin" };
  },
});

/** Whether a username can still be chosen at sign-up (the sign-up itself checks again on the server). */
export const usernameFree = query({
  args: { username: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { username }) => {
    const clean = cleanUsername(username);
    if (!clean) return false;
    return (await ctx.db.query("users").withIndex("username", (q) => q.eq("username", clean)).unique()) === null;
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

/** Whether accounts can be created right now: creating one and resetting a password need an email code. Contains no secrets. */
export const signInMethods = query({
  args: {},
  returns: v.object({ email: v.boolean() }),
  handler: async () => ({
    email: !!process.env.AUTH_RESEND_KEY || process.env.AUTH_DEV_LOG_LINKS === "1",
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
