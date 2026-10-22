// The signed-in user's own account: who they are (username, name and email), a copy of everything saved about them, whether email codes can be sent, and deleting the account with everything saved in it.
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { TOO_MANY } from "./authLimits";
import { deleteUserEverywhere } from "./retention";
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
export const usernameFree = mutation({
  args: { username: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { username }) => {
    // A mutation, not a query, so the checks can be counted and limited (see convex/authLimits.ts).
    if (!(await ctx.runMutation(internal.authLimits.hit, { name: "usernameCheck" }))) throw new ConvexError(TOO_MANY);
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
    // The notice goes to a confirmed email only, and is scheduled before the account (and its email) are gone.
    const user = await ctx.db.get(ctx.userId);
    if (user?.emailVerificationTime && typeof user.email === "string") {
      await ctx.scheduler.runAfter(0, internal.email.securityNotice, { to: user.email, kind: "accountDeleted" });
    }
    await deleteUserEverywhere(ctx, ctx.userId);
    return null;
  },
});

/** A copy of everything the site keeps about the signed-in user (GDPR right of access and portability), for the "Descarcă datele mele" button. Never the password, which is stored only as a hash. */
export const exportMine = query({
  args: {},
  returns: v.union(v.any(), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const result = await ctx.db.query("results").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    const favorites = await ctx.db.query("favorites").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
    const sessions = await ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect();
    return {
      exportat: new Date().toISOString(),
      cont: {
        numeUtilizator: user.username ?? null,
        numeComplet: user.name ?? null,
        email: user.email ?? null,
        emailConfirmat: user.emailVerificationTime ? new Date(user.emailVerificationTime).toISOString() : null,
        creat: new Date(user._creationTime).toISOString(),
        administrator: user.role === "admin",
      },
      rezultatSalvat: result
        ? { profil: result.profileId, unde: result.where, orase: result.cities ?? (result.city ? [result.city] : []), raspunsuri: result.choices, domenii: result.topDomains, salvat: new Date(result.savedAt).toISOString() }
        : null,
      universitatiFavorite: favorites.map((f) => ({ universitate: f.name, loc: f.place, adaugat: new Date(f.addedAt).toISOString() })),
      sesiuniDeConectare: sessions.map((x) => ({ inceput: new Date(x._creationTime).toISOString(), expira: new Date(x.expirationTime).toISOString() })),
      parola: "păstrată doar ca amprentă (hash), nu poate fi citită",
    };
  },
});
