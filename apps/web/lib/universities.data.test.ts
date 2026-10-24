// Tests the integrated university data: complete profile sheets, the eight Ivy League entries, and search and filters on real entries.
import { describe, expect, it } from "vitest";
import feesJson from "../data/fees.json";
import { domains } from "./data";
import { EUR_PER } from "./fees";
import { universities, universityById } from "./sheets";
import { feeFrom, filterUniversities, RO_FIRST, searchUniversities, universities as summaries } from "./universities";

const IVY = ["harvard", "yale", "princeton", "columbia", "upenn", "brown", "dartmouth", "cornell"];

describe("integrated university data", () => {
  it("has unique ids and complete profile sheets", () => {
    const ids = universities.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
    const domainIds = domains.map((d) => d.id);
    for (const u of universities) {
      for (const text of [u.name, u.city, u.country, u.website, u.about, u.budgetNote, u.admission, u.scholarshipsNote, u.dormsNote]) {
        expect(text.trim().length, `${u.id} has an empty text`).toBeGreaterThan(0);
      }
      expect(u.website).toMatch(/^https?:\/\//);
      expect(u.admissionTypes.length).toBeGreaterThan(0);
      expect(u.pros.length).toBeGreaterThanOrEqual(2);
      expect(u.cons.length).toBeGreaterThanOrEqual(2);
      expect(u.domainIds.length).toBeGreaterThan(0);
      for (const d of u.domainIds) expect(domainIds, `${u.id} has unknown domain ${d}`).toContain(d);
      if (u.region === "ro") expect(u.country).toBe("România");
      else expect(u.country).not.toBe("România");
    }
  });

  it("every domain can be studied somewhere in Romania", () => {
    for (const d of domains) {
      expect(universities.some((u) => u.region === "ro" && u.domainIds.includes(d.id)), d.id).toBe(true);
    }
  });

  it("has exactly the eight Ivy League universities marked ivy", () => {
    const ivy = universities.filter((u) => u.prestige === "ivy").map((u) => u.id).sort();
    expect(ivy).toEqual([...IVY].sort());
    for (const id of IVY) expect(universityById(id)?.country).toBe("SUA");
  });

  it("the Ivy filter returns only Ivy League universities, and 'top' includes them", () => {
    const ivy = filterUniversities({ prestige: "ivy" });
    expect(ivy.map((u) => u.id).sort()).toEqual([...IVY].sort());
    const top = filterUniversities({ prestige: "top" }, 1000);
    for (const id of IVY) expect(top.some((u) => u.id === id)).toBe(true);
    expect(top.every((u) => u.prestige === "ivy" || u.prestige === "top")).toBe(true);
  });

  it("finds well-known universities by name and short name", () => {
    expect(searchUniversities("harvard")[0]?.id).toBe("harvard");
    expect(searchUniversities("mit").some((u) => u.id === "mit")).toBe(true);
    expect(searchUniversities("ivy league").map((u) => u.id).sort()).toEqual([...IVY].sort());
    expect(searchUniversities("ubb")[0]?.id).toBe("ubb-cluj");
    expect(searchUniversities("cluj").length).toBeGreaterThan(3);
  });

  it("the top 10 for Romania with no tuition contains only Romanian universities without tuition", () => {
    const res = filterUniversities({ region: "ro", budget: "gratuit" });
    expect(res).toHaveLength(10);
    expect(res.every((u) => u.region === "ro" && u.budget === "gratuit")).toBe(true);
  });
});

describe("Politehnica București faculties", () => {
  const upb = universityById("upb");

  it("lists its faculties with bachelor programmes", () => {
    expect(upb?.faculties?.length).toBeGreaterThanOrEqual(15);
    for (const f of upb?.faculties ?? []) {
      expect(f.name.trim().length).toBeGreaterThan(0);
      expect(f.programs.length).toBeGreaterThan(0);
      for (const p of f.programs) expect(p.trim().length).toBeGreaterThan(0);
    }
    expect(upb?.faculties?.some((f) => f.name === "Facultatea de Automatică și Calculatoare")).toBe(true);
  });

  it("is found by its short name, by a faculty and by a programme", () => {
    expect(searchUniversities("politehnica bucuresti")[0]?.id).toBe("upb");
    expect(searchUniversities("aerospatiala").some((u) => u.id === "upb")).toBe(true);
    expect(searchUniversities("mecatronica").some((u) => u.id === "upb")).toBe(true);
  });
});

describe("sources of the newer profile sheets", () => {
  it("every listed sheet exists and points to official web pages", async () => {
    const sources = (await import("../data/university-sources.json")).default as Record<string, string[]>;
    const ids = new Set(universities.map((u) => u.id));
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(272);
    for (const [id, urls] of Object.entries(sources)) {
      expect(ids.has(id), id).toBe(true);
      expect(urls.length, id).toBeGreaterThan(0);
      for (const url of urls) expect(url, id).toMatch(/^https?:\/\/[^\s]+$/);
    }
  });
});

describe("fee filter", () => {
  it("keeps only universities whose cheapest tuition fits, using the level when there is no exact fee", () => {
    const res = filterUniversities({ maxFee: 3000 }, 10000);
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((u) => feeFrom(u) <= 3000)).toBe(true);
    expect(res.some((u) => u.id === "unibuc")).toBe(true); // paid places from about 1.100 €
    expect(res.some((u) => u.id === "oxford")).toBe(false);
    const free = filterUniversities({ maxFee: 0 }, 10000);
    expect(free.every((u) => feeFrom(u) === 0)).toBe(true);
    expect(free.some((u) => u.id === "tum")).toBe(true);
    expect(filterUniversities({ maxFee: 1_000_000 }, 10000).length).toBe(summaries.length);
  });
});

describe("Romanian lists", () => {
  it("start with the team's chosen universities, in their order, only when the list is all Romanian", () => {
    const ro = filterUniversities({ region: "ro" }, 20).map((u) => u.id);
    expect(ro.slice(0, RO_FIRST.length)).toEqual(RO_FIRST);
    const bucharest = filterUniversities({ cities: ["București"] }, 5).map((u) => u.id);
    expect(bucharest.slice(0, 4)).toEqual(["ase-bucuresti", "upb", "umf-carol-davila", "unibuc"]);
    expect(filterUniversities({}, 1)[0].region).toBe("abroad"); // the mixed list keeps its usual order
  });
});

describe("generated index of the sheets", () => {
  it("matches the full sheets (run node scripts/data/sheets-index.mjs after changing a sheet)", async () => {
    const LONG = ["about", "budgetNote", "admission", "scholarshipsNote", "dormsNote", "pros", "cons"];
    const index = (await import("../data/universities-index.json")).default as Record<string, unknown>[];
    const cities = (await import("../data/ro-cities.json")).default as string[];
    const fees = new Map(feesJson.map((f) => [f.id, f]));
    const expected = universities.map((u) => {
      const s: Record<string, unknown> = Object.fromEntries(Object.entries(u).filter(([k]) => !LONG.includes(k)));
      const fee = fees.get(u.id);
      if (fee) s.feeFromEur = Math.round(fee.min * EUR_PER[fee.currency]);
      return s;
    });
    expect(index).toEqual(expected);
    const count = new Map<string, number>();
    for (const u of universities) if (u.region === "ro") count.set(u.city, (count.get(u.city) ?? 0) + 1);
    expect(cities).toEqual([...count.keys()].sort((a, b) => count.get(b)! - count.get(a)! || a.localeCompare(b, "ro")));
  });
});
