// Student reviews: anyone can read the approved ones and send a new one (optionally with a photo of their face) through the checked public form; only administrators see the queue, approve, reject, remove a photo or delete.
import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError, v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, query, type MutationCtx } from "./_generated/server";
import { adminMutation, adminQuery } from "./access";
import { verifyTurnstile } from "./turnstile";
import { reviewState } from "./schema";

export const LIMITS = { name: 60, faculty: 120, university: 120, status: 40, textMin: 40, textMax: 3000 };
/** The photo comes already cropped to a small square JPEG in the browser; anything larger or not a JPEG is refused. */
export const PHOTO_MAX_BYTES = 300_000;

// At most 20 new reviews per hour for the whole site; enough for real use, small enough to stop a flood.
const rateLimiter = new RateLimiter(components.rateLimiter, {
  submitReview: { kind: "fixed window", rate: 20, period: HOUR },
});

const reviewFields = {
  name: v.string(),
  faculty: v.string(),
  university: v.optional(v.string()),
  universityId: v.optional(v.string()),
  status: v.optional(v.string()),
  text: v.string(),
  consent: v.boolean(),
};

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
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_state", (q) => q.eq("state", state))
      .order("desc")
      .take(200);
    return Promise.all(rows.map(async (r) => ({ ...r, photoUrl: r.photoId ? await ctx.storage.getUrl(r.photoId) : null })));
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

/** Deletes a review for good (for example when its author asks for it to be removed). Administrators only. */
export const remove = adminMutation({
  args: { id: v.id("reviews") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const review = await ctx.db.get(id);
    if (!review) throw new ConvexError("Părerea nu mai există.");
    if (review.photoId) await ctx.storage.delete(review.photoId);
    await ctx.db.delete(id);
    return null;
  },
});

/** Deletes only the photo of a review (for example when it is not a real face); the opinion stays. Administrators only. */
export const removePhoto = adminMutation({
  args: { id: v.id("reviews") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const review = await ctx.db.get(id);
    if (!review) throw new ConvexError("Părerea nu mai există.");
    if (review.photoId) await ctx.storage.delete(review.photoId);
    await ctx.db.patch(id, { photoId: undefined, photoConsent: undefined });
    return null;
  },
});

/** Checks and cleans a review, then stores it as "pending". Nobody can publish directly. */
async function insertChecked(
  ctx: MutationCtx,
  args: { name: string; faculty: string; university?: string; universityId?: string; status?: string; text: string; consent: boolean },
  photoId?: Id<"_storage">,
) {
  const clean = (s: string) => s.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
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
  if (args.universityId && !/^[a-z0-9-]{1,60}$/.test(args.universityId)) throw new ConvexError("Date nevalide.");
  if (text.length < LIMITS.textMin || text.length > LIMITS.textMax) throw new ConvexError("Părerea este prea scurtă sau prea lungă.");
  return ctx.db.insert("reviews", {
    name,
    faculty,
    ...(university ? { university } : {}),
    ...(args.universityId ? { universityId: args.universityId } : {}),
    ...(status ? { status } : {}),
    text,
    consent: true,
    // A photo is stored only when its author ticked the separate "show my face" box.
    ...(photoId ? { photoId, photoConsent: true } : {}),
    state: "pending",
    submittedAt: Date.now(),
  });
}

/** Adds a review as "pending". Internal: for trusted server code only. */
export const insertPending = internalMutation({
  args: reviewFields,
  returns: v.id("reviews"),
  handler: (ctx, args) => insertChecked(ctx, args),
});

/** Like insertPending, but counted against the hourly limit. Internal: called by the public form after the bot check. */
export const insertLimited = internalMutation({
  args: { ...reviewFields, photoId: v.optional(v.id("_storage")) },
  returns: v.null(),
  handler: async (ctx, { photoId, ...args }) => {
    const { ok } = await rateLimiter.limit(ctx, "submitReview");
    if (!ok) throw new ConvexError("Am primit foarte multe păreri în ultima oră. Te rugăm să încerci din nou mai târziu.");
    await insertChecked(ctx, args, photoId);
    return null;
  },
});

/** The public review form. No account needed: a bot check (Cloudflare Turnstile) and the hourly limit protect it. */
export const submit = action({
  args: {
    ...reviewFields,
    token: v.string(), // Turnstile token from the form
    website: v.optional(v.string()), // hidden field that people never fill in; bots do
    photo: v.optional(v.bytes()), // the cropped JPEG, stored only together with photoConsent
    photoConsent: v.optional(v.boolean()), // the separate "show my face" box
  },
  returns: v.null(),
  handler: async (ctx, { token, website, photo, photoConsent, ...review }) => {
    if (website) return null; // pretend it worked, store nothing
    await verifyTurnstile(token);
    let photoId: Id<"_storage"> | undefined;
    if (photo && photoConsent === true) {
      const b = new Uint8Array(photo);
      const jpeg = b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
      if (!jpeg || b.length > PHOTO_MAX_BYTES) throw new ConvexError("Poza nu este bună. Alege altă poză sau trimite părerea fără poză.");
      photoId = await ctx.storage.store(new Blob([photo], { type: "image/jpeg" }));
    }
    try {
      await ctx.runMutation(internal.reviews.insertLimited, { ...review, ...(photoId ? { photoId } : {}) });
    } catch (e) {
      if (photoId) await ctx.storage.delete(photoId); // nothing is kept when the review is refused
      throw e;
    }
    return null;
  },
});
