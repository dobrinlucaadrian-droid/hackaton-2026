// @vitest-environment edge-runtime
// Tests the public catalogue queries: they filter correctly, return only display fields and refuse oversized input.
/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const base = { country: "RO", faculty: "Facultatea de Test", domain: "Informatică", domainId: "informatica", language: "română", status: "acreditat", form: "full-time", credits: 180, years: 3, maxStudents: 100, source: "test" };
const rows = [
  { ...base, key: "a", institutionId: "uni-a", institutionName: "Universitatea A", city: "Iași", name: "Informatică", search: "informatica informatica facultatea de test universitatea a iasi romana" },
  { ...base, key: "b", institutionId: "uni-a", institutionName: "Universitatea A", city: "Iași", name: "Informatică aplicată", form: "distance", search: "informatica aplicata informatica facultatea de test universitatea a iasi romana" },
  { ...base, key: "c", institutionId: "uni-b", institutionName: "Universitatea B", city: "Cluj-Napoca", name: "Informatică", language: "engleză", search: "informatica informatica facultatea de test universitatea b cluj napoca engleza" },
  { ...base, key: "d", institutionId: "uni-b", institutionName: "Universitatea B", city: "Cluj-Napoca", name: "Drept", domain: "Drept", domainId: "drept", credits: 240, years: 4, search: "drept drept facultatea de test universitatea b cluj napoca romana" },
];

async function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  await t.run(async (ctx) => {
    for (const r of rows) await ctx.db.insert("programs", r);
    await ctx.db.insert("institutions", { id: "uni-a", country: "RO", source: "test", name: "Universitatea A", officialName: "UNIVERSITATEA A", city: "Iași", kind: "public", hasSheet: true, programs: 2 });
    // a programme without an app domain: searchable, but never listed under a domain
    const { domainId, ...noDomain } = rows[0];
    void domainId;
    await ctx.db.insert("programs", { ...noDomain, key: "e", name: "Studii generale", search: "studii generale universitatea a iasi romana" });
  });
  return t;
}

describe("catalogue queries", () => {
  it("lists the programmes of one institution, with display fields only", async () => {
    const t = await setup();
    const list = await t.query(api.catalog.programsOf, { institutionId: "uni-a" });
    expect(list.map((p) => p.key).sort()).toEqual(["a", "b", "e"]);
    expect(Object.keys(list[0])).not.toContain("source");
    expect(Object.keys(list[0])).not.toContain("search");
    expect(Object.keys(list[0])).not.toContain("_id");
    expect(await t.query(api.catalog.programsOf, { institutionId: "nu-exista" })).toEqual([]);
  });

  it("filters by study domain, country and city, full-time programmes first", async () => {
    const t = await setup();
    const all = await t.query(api.catalog.programsFor, { domainId: "informatica", country: "RO" });
    expect(all).toHaveLength(3);
    expect(all[all.length - 1].form).toBe("distance");
    const iasi = await t.query(api.catalog.programsFor, { domainId: "informatica", country: "RO", city: "Iași" });
    expect(iasi.map((p) => p.key).sort()).toEqual(["a", "b"]);
    expect(await t.query(api.catalog.programsFor, { domainId: "informatica", country: "RO", city: "Oradea" })).toEqual([]);
    expect(await t.query(api.catalog.programsFor, { domainId: "informatica", country: "FR" })).toEqual([]);
  });

  it("searches without diacritics and respects the filters", async () => {
    const t = await setup();
    const found = await t.query(api.catalog.searchPrograms, { q: "Informatică", country: "RO" });
    expect(found.map((p) => p.key).sort()).toEqual(["a", "b", "c"]);
    const cluj = await t.query(api.catalog.searchPrograms, { q: "informatica", city: "Cluj-Napoca" });
    expect(cluj.map((p) => p.key)).toEqual(["c"]);
    expect(await t.query(api.catalog.searchPrograms, { q: "x" })).toEqual([]);
    expect((await t.query(api.catalog.searchPrograms, { q: "studii generale" })).map((p) => p.key)).toEqual(["e"]);
  });

  it("answers with nothing, not an error, for oversized or empty input", async () => {
    const t = await setup();
    const long = "x".repeat(500);
    expect(await t.query(api.catalog.programsOf, { institutionId: long })).toEqual([]);
    expect(await t.query(api.catalog.programsFor, { domainId: long, country: "RO" })).toEqual([]);
    expect(await t.query(api.catalog.programsFor, { domainId: "informatica", country: "ROMANIA" })).toEqual([]);
    expect(await t.query(api.catalog.searchPrograms, { q: "informatica", city: long })).toEqual([]);
    expect(await t.query(api.catalog.institutions, { country: "RO" })).toHaveLength(1);
  });
});
