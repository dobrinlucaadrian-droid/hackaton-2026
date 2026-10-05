// Tests the specializations and categories data and the university search/filter logic.
import { describe, expect, it } from "vitest";
import { categories, domains, specializations, universities } from "./data";
import { TRAITS } from "./match";
import {
  countries,
  filterUniversities,
  normalize,
  searchUniversities,
  searchWorld,
  specializationsFor,
  universityById,
} from "./universities";

const PRESTIGE = ["ivy", "top", "international", "national"];
const BUDGET = ["gratuit", "mic", "mediu", "mare"];

describe("specializations data", () => {
  it("gives every domain 3 to 6 specializations", () => {
    for (const d of domains) {
      const n = specializationsFor(d.id).length;
      expect(n, d.id).toBeGreaterThanOrEqual(3);
      expect(n, d.id).toBeLessThanOrEqual(6);
    }
  });
  it("has unique ids and valid domain ids", () => {
    const ids = specializations.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const domainIds = new Set(domains.map((d) => d.id));
    for (const s of specializations) expect(domainIds.has(s.domainId), s.id).toBe(true);
  });
  it("uses only valid trait keys with weights 0 to 3", () => {
    for (const s of specializations) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.short.length).toBeGreaterThan(0);
      for (const [k, v] of Object.entries(s.traits)) {
        expect(TRAITS as string[], `${s.id}.${k}`).toContain(k);
        expect(v as number).toBeGreaterThanOrEqual(0);
        expect(v as number).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe("categories data", () => {
  it("covers every domain exactly once", () => {
    const all = categories.flatMap((c) => c.domainIds);
    expect(all.length).toBe(domains.length);
    expect(new Set(all).size).toBe(domains.length);
    for (const d of domains) expect(all).toContain(d.id);
    expect(categories.length).toBeGreaterThanOrEqual(8);
    expect(categories.length).toBeLessThanOrEqual(10);
  });
});

describe("normalize", () => {
  it("strips diacritics and collapses spaces", () => {
    expect(normalize("Științe București")).toBe("stiinte bucuresti");
    expect(normalize("  ŞŢ   ș ț  ")).toBe("st s t");
  });
});

describe("helpers", () => {
  it("lists Romania first in countries()", () => {
    const c = countries();
    expect(c[0]).toBe("România");
    expect(new Set(c).size).toBe(c.length);
  });
  it("finds a university by id", () => {
    expect(universityById("ubb-cluj")?.id).toBe("ubb-cluj");
    expect(universityById("nu-exista")).toBeUndefined();
  });
});

describe("searchUniversities", () => {
  it("returns nothing for an empty query", () => {
    expect(searchUniversities("")).toEqual([]);
    expect(searchUniversities("   ")).toEqual([]);
  });
  it("finds by name, with or without diacritics", () => {
    expect(searchUniversities("delft").map((u) => u.id)).toContain("tu-delft");
    expect(searchUniversities("DELFT")[0].id).toBe("tu-delft");
  });
  it("finds by alias", () => {
    expect(searchUniversities("ubb")[0].id).toBe("ubb-cluj");
    expect(searchUniversities("umf").map((u) => u.id)).toContain("umf-carol-davila");
  });
  it("finds by city without diacritics", () => {
    const res = searchUniversities("bucuresti", 100);
    expect(res.length).toBeGreaterThan(0);
    expect(res.map((u) => u.id)).toContain("umf-carol-davila");
  });
  it("finds by country and by country alias", () => {
    const olanda = searchUniversities("olanda", 100);
    expect(olanda.map((u) => u.id)).toContain("tu-delft");
    expect(searchUniversities("netherlands", 100).map((u) => u.id)).toContain("tu-delft");
    expect(searchUniversities("uk", 100).every((u) => u.country === "Marea Britanie" || normalize(`${u.name} ${u.about}`).includes("uk"))).toBe(true);
  });
  it("requires every word to match", () => {
    const res = searchUniversities("cluj medicina", 100);
    expect(res.map((u) => u.id)).toContain("umf-cluj");
    for (const u of res) expect(u.city === "Cluj-Napoca" || normalize(`${u.name} ${u.about}`).includes("cluj")).toBe(true);
    expect(searchUniversities("delft zzzzqq")).toEqual([]);
  });
  it("finds by specialization keyword", () => {
    const res = searchUniversities("kinetoterapie", 1000).map((u) => u.id);
    for (const u of universities.filter((x) => x.domainIds.includes("sport-kinetoterapie"))) expect(res).toContain(u.id);
  });
  it("finds by domain name", () => {
    const res = searchUniversities("medicina dentara", 1000).map((u) => u.id);
    for (const u of universities.filter((x) => x.domainIds.includes("medicina-dentara"))) expect(res).toContain(u.id);
  });
  it("respects the limit and puts name matches first", () => {
    expect(searchUniversities("universitatea", 3).length).toBeLessThanOrEqual(3);
    const res = searchUniversities("delft", 5);
    expect(normalize(res[0].name)).toContain("delft");
  });
});

describe("filterUniversities", () => {
  it("filters by region and country", () => {
    const ro = filterUniversities({ region: "ro" }, 1000);
    expect(ro.length).toBeGreaterThan(0);
    expect(ro.every((u) => u.region === "ro")).toBe(true);
    const nl = filterUniversities({ country: "Olanda" }, 1000);
    expect(nl.map((u) => u.id)).toContain("tu-delft");
    expect(nl.every((u) => u.country === "Olanda")).toBe(true);
  });
  it("filters by domain", () => {
    const res = filterUniversities({ domainId: "medicina" }, 1000);
    expect(res.map((u) => u.id)).toContain("umf-carol-davila");
    expect(res.every((u) => u.domainIds.includes("medicina"))).toBe(true);
  });
  it("treats budget as this level or cheaper and sorts by prestige then budget", () => {
    const res = filterUniversities({ budget: "mic" }, 1000);
    expect(res.every((u) => BUDGET.indexOf(u.budget) <= BUDGET.indexOf("mic"))).toBe(true);
    const all = filterUniversities({}, 1000);
    expect(all.length).toBe(universities.length);
    for (let i = 1; i < all.length; i++) {
      const p = PRESTIGE.indexOf(all[i - 1].prestige) - PRESTIGE.indexOf(all[i].prestige);
      expect(p).toBeLessThanOrEqual(0);
      if (p === 0) expect(BUDGET.indexOf(all[i - 1].budget)).toBeLessThanOrEqual(BUDGET.indexOf(all[i].budget));
    }
  });
  it("treats prestige as this level or better", () => {
    expect(filterUniversities({ prestige: "ivy" }, 1000).every((u) => u.prestige === "ivy")).toBe(true);
    expect(filterUniversities({ prestige: "top" }, 1000).every((u) => ["ivy", "top"].includes(u.prestige))).toBe(true);
    expect(filterUniversities({ prestige: "international" }, 1000).every((u) => u.prestige !== "national")).toBe(true);
    expect(filterUniversities({ prestige: "national" }, 1000).length).toBe(universities.length);
  });
  it("filters by admission type, scholarships, dorms and certificates", () => {
    expect(filterUniversities({ admissionType: "examen" }, 1000).every((u) => u.admissionTypes.includes("examen"))).toBe(true);
    expect(filterUniversities({ scholarships: true }, 1000).every((u) => u.scholarships === true)).toBe(true);
    expect(filterUniversities({ dorms: true }, 1000).every((u) => u.dorms === true)).toBe(true);
    const noEng = filterUniversities({ withoutCertificate: "engleza" }, 1000);
    expect(noEng.every((u) => !u.certificates.includes("engleza"))).toBe(true);
    expect(noEng.length).toBe(universities.filter((u) => !u.certificates.includes("engleza")).length);
  });
  it("combines conditions and applies the limit", () => {
    const res = filterUniversities({ region: "ro", dorms: true, budget: "mediu" }, 1000);
    expect(res.every((u) => u.region === "ro" && u.dorms && BUDGET.indexOf(u.budget) <= 2)).toBe(true);
    expect(filterUniversities({}).length).toBe(Math.min(10, universities.length));
    expect(filterUniversities({}, 3).length).toBe(Math.min(3, universities.length));
  });
});

describe("searchWorld", () => {
  const list = [
    { n: "Universitatea Alfa", c: "Franța", w: "https://alfa.example" },
    { n: "Institut Beta", c: "Norvegia", w: "https://beta.example" },
    { n: "Alfa Institute of Technology", c: "Norvegia", w: "https://alfa-it.example" },
    { n: "Ştiinţe Gamma University", c: "Japonia", w: "https://gamma.example" },
  ];
  it("returns nothing for an empty query", () => {
    expect(searchWorld(list, "")).toEqual([]);
  });
  it("matches name and country, ignoring diacritics, and puts name-prefix matches first", () => {
    expect(searchWorld(list, "alfa").map((w) => w.w)).toEqual(["https://alfa-it.example", "https://alfa.example"]);
    expect(searchWorld(list, "institute alfa").map((w) => w.n)).toEqual(["Alfa Institute of Technology"]);
    expect(searchWorld(list, "norvegia").length).toBe(2);
    expect(searchWorld(list, "stiinte gamma").length).toBe(1);
    expect(searchWorld(list, "norvegia", 1).length).toBe(1);
  });
  it("excludes universities we already have a sheet for", () => {
    const ubb = universityById("ubb-cluj")!;
    const withKnown = [{ n: ubb.name.toUpperCase(), c: ubb.country, w: "x" }, ...list];
    expect(searchWorld(withKnown, ubb.name).length).toBe(0);
  });
});

describe("student opinions per university", async () => {
  const { testimonialsFor, universityIdOf } = await import("./testimonials");
  const { testimonials, universities } = await import("./data");

  it("every linked opinion points to a university that has a sheet", () => {
    for (const t of testimonials) {
      const id = universityIdOf(t);
      if (id) expect(universities.some((u) => u.id === id), id).toBe(true);
    }
  });

  it("finds the opinions of a university and nothing for one without opinions", () => {
    expect(testimonialsFor("ase-bucuresti").map((t) => t.name)).toContain("Tudor Demușcă");
    expect(testimonialsFor("umf-carol-davila").length).toBeGreaterThanOrEqual(2);
    expect(testimonialsFor("bocconi").length).toBeGreaterThanOrEqual(2);
    expect(testimonialsFor("harvard")).toEqual([]);
  });
});
