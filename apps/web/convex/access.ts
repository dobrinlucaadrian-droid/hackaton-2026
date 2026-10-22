// Shared access rules: every function that needs a signed-in user or an administrator is built from these wrappers, so the check cannot be forgotten. Administrators also need the email code of convex/adminUnlock.ts.
import { getAuthUserId } from "@convex-dev/auth/server";
import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { ADMIN_LOCKED, unlockedUntil } from "./adminUnlock";

/** The signed-in user's id, taken from the session and never from the browser's arguments. */
async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError("Trebuie să fii conectat.");
  return userId;
}

/** Like requireUserId, but only for users whose `role` is "admin" in the database and who unlocked this session with the email code. */
async function requireAdminId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await requireUserId(ctx);
  const user = await ctx.db.get(userId);
  if (user?.role !== "admin") throw new ConvexError("Nu ai drept de administrator.");
  if ((await unlockedUntil(ctx, userId)) === null) throw new ConvexError(ADMIN_LOCKED);
  return userId;
}

/** Query for signed-in users; the handler receives `ctx.userId`. */
export const userQuery = customQuery(query, customCtx(async (ctx) => ({ userId: await requireUserId(ctx) })));

/** Mutation for signed-in users; the handler receives `ctx.userId`. */
export const userMutation = customMutation(mutation, customCtx(async (ctx) => ({ userId: await requireUserId(ctx) })));

/** Query for administrators only; the handler receives `ctx.userId`. */
export const adminQuery = customQuery(query, customCtx(async (ctx) => ({ userId: await requireAdminId(ctx) })));

/** Mutation for administrators only; the handler receives `ctx.userId`. */
export const adminMutation = customMutation(mutation, customCtx(async (ctx) => ({ userId: await requireAdminId(ctx) })));
