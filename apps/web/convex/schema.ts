// Database tables for UniPath: users (from Convex Auth, plus a server-written role), saved questionnaire results, student reviews, the catalogue of institutions and programmes, and anonymous usage statistics.
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

  // Institutions from official or openly licensed national datasets (scripts/data/CONTRACT.md). Loaded with scripts/data/import.mjs, never written by users.
  institutions: defineTable({
    id: v.string(), // same id as the university sheet when the app has one
    country: v.string(), // ISO code, e.g. "RO"
    source: v.string(),
    name: v.string(),
    officialName: v.string(),
    city: v.string(),
    kind: v.string(), // public | private | unknown
    hasSheet: v.boolean(),
    website: v.optional(v.string()),
    programs: v.number(),
  })
    .index("by_public_id", ["id"])
    .index("by_country", ["country"]),

  // Bachelor-level study programmes from the same datasets, one row per programme. Only the fields the source has are present.
  programs: defineTable({
    key: v.string(),
    country: v.string(),
    institutionId: v.string(),
    institutionName: v.string(),
    city: v.string(), // where the programme is taught
    faculty: v.optional(v.string()),
    domain: v.string(), // the source's own field-of-study label
    domainId: v.optional(v.string()), // one of the app's 40 study domains (our own mapping); missing when none clearly fits
    name: v.string(),
    language: v.string(),
    form: v.optional(v.string()), // full-time | part-time | distance | dual
    credits: v.optional(v.number()),
    years: v.optional(v.number()),
    maxStudents: v.optional(v.number()),
    status: v.optional(v.string()),
    url: v.optional(v.string()),
    source: v.string(),
    search: v.string(), // lower-case text without diacritics
  })
    .index("by_key", ["key"])
    .index("by_institution", ["institutionId"])
    .index("by_domain_country_city", ["domainId", "country", "city"])
    .searchIndex("search", { searchField: "search", filterFields: ["country", "city", "domainId"] }),

  // One finished questionnaire, stored without any name, account or device id. Used only for statistics.
  quizRuns: defineTable({
    day: v.string(), // "YYYY-MM-DD", Romanian time
    profileId: v.string(),
    where: v.union(v.literal("ro"), v.literal("abroad"), v.literal("any")),
    city: v.optional(v.string()),
    choices: v.record(v.string(), v.number()), // question id -> index of the picked option
    topDomains: v.array(v.string()),
  }).index("by_day", ["day"]),

  // Anonymous counters per day: page views, visits, countries, referring sites, finished questionnaires. No IP address, no cookie, no visitor id.
  dailyStats: defineTable({
    day: v.string(), // "YYYY-MM-DD", Romanian time
    kind: v.string(), // views | visits | path | country | ref | quiz
    key: v.string(),
    count: v.number(),
  }).index("by_day_kind_key", ["day", "kind", "key"]),

  // All-time questionnaire counters: total, per profile, per place, per city, per result domain and per answer.
  quizStats: defineTable({
    kind: v.string(), // total | profile | where | city | top1 | top | answer
    key: v.string(),
    count: v.number(),
  }).index("by_kind_key", ["kind", "key"]),

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
