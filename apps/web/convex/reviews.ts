// Student reviews: anyone can read the approved ones; only administrators see the queue and approve or reject. New reviews enter only through an internal function.
import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { adminMutation, adminQuery } from "./access";
import { reviewState } from "./schema";

export const LIMITS = { name: 60, faculty: 120, university: 120, status: 40, textMin: 40, textMax: 3000 };

const publicReview = v.object({
  id: v.id("reviews"),
  name: v.string(),
  faculty: v.string(),
  university: v.optional(v.string()),
  universityId: v.optional(v.string()),
  status: v.optional(v.string()),
  text: v.string(),
  photoUrl: v.optional(v.string()),
});

/** Approved reviews, oldest first. Returns only what the page shows: no moderation fields. */
export const listApproved = query({
  args: {},
  returns: v.array(publicReview),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_state", (q) => q.eq("state", "approved"))
      .take(500);
    return Promise.all(
      rows.map(async (r) => {
        const photoUrl = r.photoId ? await ctx.storage.getUrl(r.photoId) : null;
        return {
          id: r._id,
          name: r.name,
          faculty: r.faculty,
          ...(r.university ? { university: r.university } : {}),
          ...(r.universityId ? { universityId: r.universityId } : {}),
          ...(r.status ? { status: r.status } : {}),
          text: r.text,
          ...(photoUrl ? { photoUrl } : {}),
        };
      }),
    );
  },
});

/** The moderation queue: reviews in the given state, newest first. Administrators only. */
export const listByState = adminQuery({
  args: { state: reviewState },
  handler: async (ctx, { state }) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_state", (q) => q.eq("state", state))
      .order("desc")
      .take(200);
  },
});

/** Approves or rejects a review and records who did it and when. Administrators only. */
export const moderate = adminMutation({
  args: { id: v.id("reviews"), state: v.union(v.literal("approved"), v.literal("rejected")) },
  returns: v.null(),
  handler: async (ctx, { id, state }) => {
    const review = await ctx.db.get(id);
    if (!review) throw new ConvexError("Părerea nu mai există.");
    await ctx.db.patch(id, { state, moderatedBy: ctx.userId, moderatedAt: Date.now() });
    return null;
  },
});

/** Adds a review as "pending". Internal: the public form will call it only after its own checks (bot check, rate limit). */
export const insertPending = internalMutation({
  args: {
    name: v.string(),
    faculty: v.string(),
    university: v.optional(v.string()),
    universityId: v.optional(v.string()),
    status: v.optional(v.string()),
    text: v.string(),
    photoId: v.optional(v.id("_storage")),
    consent: v.boolean(),
  },
  returns: v.id("reviews"),
  handler: async (ctx, args) => {
    const clean = (s: string) => s.trim().replace(/\s+\n/g, "\n");
    const name = clean(args.name);
    const faculty = clean(args.faculty);
    const text = clean(args.text);
    const university = args.university ? clean(args.university) : undefined;
    const status = args.status ? clean(args.status) : undefined;
    if (!args.consent) throw new ConvexError("Este nevoie de acordul tău pentru publicare.");
    if (name.length < 2 || name.length > LIMITS.name) throw new ConvexError("Numele este prea scurt sau prea lung.");
    if (faculty.length < 2 || faculty.length > LIMITS.faculty) throw new ConvexError("Facultatea este prea scurtă sau prea lungă.");
    if (university && university.length > LIMITS.university) throw new ConvexError("Universitatea este prea lungă.");
    if (status && status.length > LIMITS.status) throw new ConvexError("Textul despre an este prea lung.");
    if (args.universityId && args.universityId.length > 60) throw new ConvexError("Date nevalide.");
    if (text.length < LIMITS.textMin || text.length > LIMITS.textMax) throw new ConvexError("Părerea este prea scurtă sau prea lungă.");
    return ctx.db.insert("reviews", {
      name,
      faculty,
      ...(university ? { university } : {}),
      ...(args.universityId ? { universityId: args.universityId } : {}),
      ...(status ? { status } : {}),
      text,
      ...(args.photoId ? { photoId: args.photoId } : {}),
      consent: true,
      state: "pending", // always pending: nobody can publish directly
      submittedAt: Date.now(),
    });
  },
});
