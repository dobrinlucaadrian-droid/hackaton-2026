// Favourite universities: each signed-in student can add, list and remove only their own, at most 30.
import { ConvexError, v } from "convex/values";
import { userMutation, userQuery } from "./access";

export const MAX_FAVORITES = 30;
const ID = /^[a-z0-9-]{1,100}$/;
const MAX_TEXT = 150;

const favorite = v.object({ universityId: v.string(), name: v.string(), place: v.string(), addedAt: v.number() });

/** The signed-in student's favourite universities, newest first. */
export const mine = userQuery({
  args: {},
  returns: v.array(favorite),
  handler: async (ctx) => {
    const rows = await ctx.db.query("favorites").withIndex("by_user", (q) => q.eq("userId", ctx.userId)).order("desc").take(MAX_FAVORITES);
    return rows.map(({ universityId, name, place, addedAt }) => ({ universityId, name, place, addedAt }));
  },
});

/** Adds a university to the signed-in student's favourites (nothing happens when it is already there). */
export const add = userMutation({
  args: { universityId: v.string(), name: v.string(), place: v.string() },
  returns: v.null(),
  handler: async (ctx, { universityId, name, place }) => {
    const text = (s: string) => s.trim().length > 0 && s.length <= MAX_TEXT;
    if (!ID.test(universityId) || !text(name) || !text(place)) throw new ConvexError("Date nevalide.");
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_university", (q) => q.eq("userId", ctx.userId).eq("universityId", universityId))
      .unique();
    if (existing) return null;
    const count = (await ctx.db.query("favorites").withIndex("by_user", (q) => q.eq("userId", ctx.userId)).take(MAX_FAVORITES)).length;
    if (count >= MAX_FAVORITES) throw new ConvexError(`Poți avea cel mult ${MAX_FAVORITES} universități favorite. Scoate una ca să adaugi alta.`);
    await ctx.db.insert("favorites", { userId: ctx.userId, universityId, name: name.trim(), place: place.trim(), addedAt: Date.now() });
    return null;
  },
});

/** Removes a university from the signed-in student's favourites. */
export const remove = userMutation({
  args: { universityId: v.string() },
  returns: v.null(),
  handler: async (ctx, { universityId }) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_university", (q) => q.eq("userId", ctx.userId).eq("universityId", universityId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return null;
  },
});
