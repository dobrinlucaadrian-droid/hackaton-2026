// A student's saved questionnaire result: each signed-in user can save, read and delete only their own.
import { ConvexError, v } from "convex/values";
import { userMutation, userQuery } from "./access";

const MAX_CHOICES = 40;
const MAX_TEXT = 80;

const savedResult = v.object({
  profileId: v.string(),
  where: v.union(v.literal("ro"), v.literal("abroad"), v.literal("any")),
  city: v.optional(v.string()),
  choices: v.record(v.string(), v.number()),
  topDomains: v.array(v.string()),
  savedAt: v.number(),
});

/** The signed-in student's saved result, or null. */
export const mine = userQuery({
  args: {},
  returns: v.union(savedResult, v.null()),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("results")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .unique();
    if (!row) return null;
    const { profileId, where, city, choices, topDomains, savedAt } = row;
    return { profileId, where, ...(city ? { city } : {}), choices, topDomains, savedAt };
  },
});

/** Saves the signed-in student's result, replacing the previous one. */
export const save = userMutation({
  args: {
    profileId: v.string(),
    where: v.union(v.literal("ro"), v.literal("abroad"), v.literal("any")),
    city: v.optional(v.string()),
    choices: v.record(v.string(), v.number()),
    topDomains: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const keys = Object.keys(args.choices);
    const tooLong = (s: string) => s.length === 0 || s.length > MAX_TEXT;
    if (tooLong(args.profileId) || (args.city !== undefined && tooLong(args.city))) throw new ConvexError("Date nevalide.");
    if (keys.length > MAX_CHOICES || keys.some(tooLong)) throw new ConvexError("Date nevalide.");
    if (Object.values(args.choices).some((n) => !Number.isInteger(n) || n < 0 || n > 10)) throw new ConvexError("Date nevalide.");
    if (args.topDomains.length > 3 || args.topDomains.some(tooLong)) throw new ConvexError("Date nevalide.");

    const existing = await ctx.db
      .query("results")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .unique();
    const doc = { ...args, userId: ctx.userId, savedAt: Date.now() };
    if (existing) await ctx.db.replace(existing._id, doc);
    else await ctx.db.insert("results", doc);
    return null;
  },
});

/** Deletes the signed-in student's saved result. */
export const remove = userMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("results")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return null;
  },
});
