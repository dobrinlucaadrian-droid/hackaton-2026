// Database tables for UniPath: users (from Convex Auth, plus a server-written role), saved questionnaire results and student reviews.
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const reviewState = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"));

export default defineSchema({
  ...authTables,
  // Same fields as Convex Auth's users table, plus `role`, which only server code may write.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.literal("admin")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // One saved questionnaire result per student (the newest replaces the old one).
  results: defineTable({
    userId: v.id("users"),
    profileId: v.string(),
    where: v.union(v.literal("ro"), v.literal("abroad"), v.literal("any")),
    city: v.optional(v.string()),
    choices: v.record(v.string(), v.number()), // question id -> index of the picked option
    topDomains: v.array(v.string()), // the three domain ids shown to the student
    savedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Student reviews: sent through the public form, shown only when an administrator approves them.
  reviews: defineTable({
    name: v.string(),
    faculty: v.string(),
    university: v.optional(v.string()),
    universityId: v.optional(v.string()), // id of a university that has a sheet in the app
    status: v.optional(v.string()), // e.g. "absolventă", "anul 2"
    text: v.string(),
    photoId: v.optional(v.id("_storage")),
    consent: v.boolean(), // the author agreed to publication
    state: reviewState,
    submittedAt: v.number(),
    moderatedBy: v.optional(v.id("users")),
    moderatedAt: v.optional(v.number()),
  }).index("by_state", ["state", "submittedAt"]),
});
