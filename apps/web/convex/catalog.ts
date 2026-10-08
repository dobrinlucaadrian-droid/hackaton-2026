// The catalogue of institutions and bachelor programmes from official national datasets: public, read-only queries the pages use to list and search.
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

const programView = v.object({
  key: v.string(),
  country: v.string(),
  institutionId: v.string(),
  institutionName: v.string(),
  city: v.string(),
  faculty: v.optional(v.string()),
  domain: v.string(),
  domainId: v.optional(v.string()),
  name: v.string(),
  language: v.string(),
  form: v.optional(v.string()),
  credits: v.optional(v.number()),
  years: v.optional(v.number()),
  maxStudents: v.optional(v.number()),
  status: v.optional(v.string()),
  url: v.optional(v.string()),
});

/** Only the fields the pages show (not the search text, the source string or internal ids). */
function view(p: Doc<"programs">) {
  const { _id, _creationTime, search, source, ...rest } = p;
  void _id; void _creationTime; void search; void source;
  return rest;
}

const short = (s: string, max: number) => s.length > 0 && s.length <= max;
/** Lower-case text without diacritics, the same shape as the stored search text. */
const plain = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const FORM_ORDER: Record<string, number> = { "full-time": 0, dual: 1, "part-time": 2, distance: 3 };

/** All bachelor programmes of one institution, in the order of the source. At most 600. */
export const programsOf = query({
  args: { institutionId: v.string() },
  returns: v.array(programView),
  handler: async (ctx, { institutionId }) => {
    if (!short(institutionId, 80)) return [];
    const rows = await ctx.db.query("programs").withIndex("by_institution", (q) => q.eq("institutionId", institutionId)).take(600);
    return rows.map(view);
  },
});

/** Programmes of one study domain in a country, optionally in one city. At most 200, full-time first. */
export const programsFor = query({
  args: { domainId: v.string(), country: v.string(), city: v.optional(v.string()) },
  returns: v.array(programView),
  handler: async (ctx, { domainId, country, city }) => {
    if (!short(domainId, 60) || !short(country, 3) || (city !== undefined && !short(city, 80))) return [];
    const rows = await ctx.db
      .query("programs")
      .withIndex("by_domain_country_city", (q) => (city ? q.eq("domainId", domainId).eq("country", country).eq("city", city) : q.eq("domainId", domainId).eq("country", country)))
      .take(200);
    return rows
      .sort((a, b) => (FORM_ORDER[a.form ?? "full-time"] ?? 9) - (FORM_ORDER[b.form ?? "full-time"] ?? 9) || a.city.localeCompare(b.city) || a.institutionName.localeCompare(b.institutionName))
      .map(view);
  },
});

/** Free-text search over programme, field, faculty, institution and city. At most 40 results. */
export const searchPrograms = query({
  args: { q: v.string(), country: v.optional(v.string()), city: v.optional(v.string()), domainId: v.optional(v.string()) },
  returns: v.array(programView),
  handler: async (ctx, { q, country, city, domainId }) => {
    const text = plain(q).slice(0, 80);
    if (text.length < 2) return [];
    if ((country && !short(country, 3)) || (city && !short(city, 80)) || (domainId && !short(domainId, 60))) return [];
    const rows = await ctx.db
      .query("programs")
      .withSearchIndex("search", (s) => {
        let f = s.search("search", text);
        if (country) f = f.eq("country", country);
        if (city) f = f.eq("city", city);
        if (domainId) f = f.eq("domainId", domainId);
        return f;
      })
      .take(40);
    return rows.map(view);
  },
});

/** The institutions of a country, with how many programmes each has. At most 3,000. */
export const institutions = query({
  args: { country: v.string() },
  returns: v.array(v.object({ id: v.string(), name: v.string(), city: v.string(), kind: v.string(), hasSheet: v.boolean(), programs: v.number() })),
  handler: async (ctx, { country }) => {
    if (!short(country, 3)) return [];
    const rows = await ctx.db.query("institutions").withIndex("by_country", (q) => q.eq("country", country)).take(3000);
    return rows.map((i) => ({ id: i.id, name: i.name, city: i.city, kind: i.kind, hasSheet: i.hasSheet, programs: i.programs }));
  },
});
