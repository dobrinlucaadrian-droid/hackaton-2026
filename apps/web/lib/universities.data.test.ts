// Tests the integrated university data: complete profile sheets, the eight Ivy League entries, and search and filters on real entries.
import { describe, expect, it } from "vitest";
import { domains, universities } from "./data";
import { filterUniversities, searchUniversities, universityById } from "./universities";

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
