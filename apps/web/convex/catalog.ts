// The catalogue of institutions and bachelor programmes from official national lists: public, read-only queries the pages use to list and search.
import { v } from "convex/values";
import { query } from "./_generated/server";

const programView = v.object({
  key: v.string(),
  institutionId: v.string(),
  institutionName: v.string(),
  city: v.string(),
  faculty: v.string(),
  domain: v.string(),
  domainId: v.string(),
  name: v.string(),
  language: v.string(),
  status: v.union(v.literal("A"), v.literal("AP")),
  form: v.union(v.literal("IF"), v.literal("IFR"), v.literal("ID")),
  credits: v.number(),
  years: v.number(),
  maxStudents: v.number(),
});

type Row = { key: string; institutionId: string; institutionName: string; city: string; faculty: string; domain: string; domainId: string; name: string; language: string; status: "A" | "AP"; form: "IF" | "IFR" | "ID"; credits: number; years: number; maxStudents: number };
/** Only the fields the pages show (not the search text or internal ids). */
const view = (p: Row) => ({
  key: p.key, institutionId: p.institutionId, institutionName: p.institutionName, city: p.city, faculty: p.faculty, domain: p.domain, domainId: p.domainId,
  name: p.name, language: p.language, status: p.status, form: p.form, credits: p.credits, years: p.years, maxStudents: p.maxStudents,
});

const short = (s: string, max: number) => s.length > 0 && s.length <= max;
/** Lower-case text without diacritics, the same shape as the stored search text. */
const plain = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** All bachelor programmes of one institution, in the order of the official list. */
export const programsOf = query({
  args: { institutionId: v.string() },
  returns: v.array(programView),
  handler: async (ctx, { institutionId }) => {
    if (!short(institutionId, 60)) return [];
    const rows = await ctx.db.query("programs").withIndex("by_institution", (q) => q.eq("institutionId", institutionId)).take(400);
    return rows.map(view);
  },
});

/** Programmes of one study domain in a country, optionally in one city. At most 200, full-time first. */
export const programsFor = query({
  args: { domainId: v.string(), country: v.string(), city: v.optional(v.string()) },
  returns: v.array(programView),
  handler: async (ctx, { domainId, country, city }) => {
    if (!short(domainId, 60) || !short(country, 3) || (city !== undefined && !short(city, 60))) return [];
    const rows = await ctx.db
      .query("programs")
      .withIndex("by_domain_country_city", (q) => (city ? q.eq("domainId", domainId).eq("country", country).eq("city", city) : q.eq("domainId", domainId).eq("country", country)))
      .take(200);
    const order = { IF: 0, IFR: 1, ID: 2 } as const;
    return rows.sort((a, b) => order[a.form] - order[b.form] || a.city.localeCompare(b.city, "ro") || a.institutionName.localeCompare(b.institutionName, "ro")).map(view);
  },
});

/** Free-text search over programme, domain, faculty, institution and city. At most 40 results. */
export const searchPrograms = query({
  args: { q: v.string(), country: v.optional(v.string()), city: v.optional(v.string()), domainId: v.optional(v.string()) },
  returns: v.array(programView),
  handler: async (ctx, { q, country, city, domainId }) => {
    const text = plain(q).slice(0, 80);
    if (text.length < 2) return [];
    if ((country && !short(country, 3)) || (city && !short(city, 60)) || (domainId && !short(domainId, 60))) return [];
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

/** The institutions of a country from the official list, with how many faculties and programmes each has. */
export const institutions = query({
  args: { country: v.string() },
  returns: v.array(v.object({ id: v.string(), name: v.string(), city: v.string(), kind: v.string(), hasSheet: v.boolean(), faculties: v.number(), programs: v.number() })),
  handler: async (ctx, { country }) => {
    if (!short(country, 3)) return [];
    const rows = await ctx.db.query("institutions").withIndex("by_country", (q) => q.eq("country", country)).take(500);
    return rows.map((i) => ({ id: i.id, name: i.name, city: i.city, kind: i.kind, hasSheet: i.hasSheet, faculties: i.faculties, programs: i.programs }));
  },
});
