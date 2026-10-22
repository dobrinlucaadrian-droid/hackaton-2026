// Second step for administrators: the admin pages unlock only after a 6-digit code sent to the admin's email, for 8 hours on that device (sign-in session). Without it the admin functions refuse, even with the right password.
import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { TOO_MANY } from "./authLimits";
import { sendEmail } from "./email";

const MINUTE = 60 * 1000;
export const CODE_MINUTES = 10;
export const MAX_TRIES = 5;
export const UNLOCK_HOURS = 8;
export const ADMIN_LOCKED = "Administrarea este blocată: confirmă cu codul primit pe email.";

async function sha256(text: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** When the current sign-in session's admin unlock ends, or null when it is locked. */
export async function unlockedUntil(ctx: QueryCtx | MutationCtx, userId: Id<"users">): Promise<number | null> {
  const sessionId = await getAuthSessionId(ctx);
  if (sessionId === null) return null;
  const row = await ctx.db.query("adminUnlocks").withIndex("by_session", (q) => q.eq("sessionId", sessionId)).unique();
  return row && row.userId === userId && row.until > Date.now() ? row.until : null;
}

/** For the admin pages: is this user an administrator, and until when are the admin pages unlocked on this device. */
export const status = query({
  args: {},
  returns: v.object({ admin: v.boolean(), unlockedUntil: v.union(v.number(), v.null()) }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    if (!user || user.role !== "admin") return { admin: false, unlockedUntil: null };
    return { admin: true, unlockedUntil: await unlockedUntil(ctx, user._id) };
  },
});

/** The confirmed email of an administrator, or null for anyone else. */
export const adminEmail = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user?.role === "admin" && user.emailVerificationTime && typeof user.email === "string" ? user.email : null;
  },
});

/** Keeps only the fingerprint of the new code (never the code itself), replacing any earlier one. */
export const storeCode = internalMutation({
  args: { userId: v.id("users"), codeHash: v.string(), now: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, { userId, codeHash, now = Date.now() }) => {
    for (const old of await ctx.db.query("adminCodes").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) await ctx.db.delete(old._id);
    await ctx.db.insert("adminCodes", { userId, codeHash, expires: now + CODE_MINUTES * MINUTE, attempts: 0 });
    return null;
  },
});

/** Sends a new code to the administrator's email. */
export const sendCode = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Trebuie să fii conectat.");
    const email = await ctx.runQuery(internal.adminUnlock.adminEmail, { userId });
    if (email === null) throw new ConvexError("Nu ai drept de administrator.");
    if (!(await ctx.runMutation(internal.authLimits.hit, { name: "adminCode", key: email }))) throw new ConvexError(TOO_MANY);
    const n = new Uint32Array(1);
    crypto.getRandomValues(n);
    const code = String(n[0] % 1_000_000).padStart(6, "0");
    await ctx.runMutation(internal.adminUnlock.storeCode, { userId, codeHash: await sha256(code) });
    await sendEmail({
      to: email,
      subject: "Codul pentru administrarea FindMyUni",
      paragraphs: [`Codul pentru a deschide paginile de administrare este: ${code}`, `Codul este valabil ${CODE_MINUTES} minute. Dacă nu l-ai cerut tu, schimbă-ți imediat parola contului.`],
      devLog: `adminCode ${email} ${code}`,
    });
    return null;
  },
});

/** Checks the typed code; on success unlocks the admin pages on this device for 8 hours. Wrong tries are counted (a refusal is returned, not thrown, so the count is kept). */
export const verify = mutation({
  args: { code: v.string() },
  returns: v.object({ ok: v.boolean(), message: v.optional(v.string()) }),
  handler: async (ctx, { code }) => {
    const userId = await getAuthUserId(ctx);
    const sessionId = await getAuthSessionId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    if (!user || sessionId === null || user.role !== "admin") throw new ConvexError("Nu ai drept de administrator.");
    const row = await ctx.db.query("adminCodes").withIndex("by_user", (q) => q.eq("userId", user._id)).unique();
    if (!row || row.expires <= Date.now()) return { ok: false, message: "Codul a expirat sau nu a fost cerut. Cere un cod nou." };
    if (row.attempts >= MAX_TRIES) return { ok: false, message: "Prea multe coduri greșite. Cere un cod nou." };
    if ((await sha256(code.trim())) !== row.codeHash) {
      await ctx.db.patch(row._id, { attempts: row.attempts + 1 });
      return { ok: false, message: "Codul nu este corect." };
    }
    await ctx.db.delete(row._id);
    for (const old of await ctx.db.query("adminUnlocks").withIndex("by_session", (q) => q.eq("sessionId", sessionId)).collect()) await ctx.db.delete(old._id);
    await ctx.db.insert("adminUnlocks", { userId: user._id, sessionId, until: Date.now() + UNLOCK_HOURS * 60 * MINUTE });
    return { ok: true };
  },
});
