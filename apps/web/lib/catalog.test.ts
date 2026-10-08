// Tests the programme catalogue files: every country follows the shared contract, the summary matches the files, and Romania matches the official list.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { catalogCountries, catalogCountryOfSheet, catalogTotals } from "./catalog";
import { domains, universities } from "./data";
import type { CatalogInstitution, CatalogProgram } from "./types";

const DIR = new URL("../data/catalog/", import.meta.url);
function read<T>(cc: string, name: "institutions" | "programs"): T[] {
  const json = new URL(`${cc}-${name}.json`, DIR), gz = new URL(`${cc}-${name}.jsonl.gz`, DIR);
  if (existsSync(json)) return JSON.parse(readFileSync(json, "utf8")) as T[];
  return gunzipSync(readFileSync(gz)).toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as T);
}
// A country counts only once its source and licence are recorded in scripts/data/sources.json (files of countries still being built are ignored).
const approved = Object.keys(JSON.parse(readFileSync(new URL("../../../scripts/data/sources.json", import.meta.url), "utf8")) as Record<string, unknown>);
const onDisk = [...new Set(readdirSync(DIR).map((f) => f.match(/^([a-z]{2})-programs\.(json|jsonl\.gz)$/)?.[1]).filter((x): x is string => !!x))].filter((cc) => approved.includes(cc)).sort();
const domainIds = new Set(domains.map((d) => d.id));
const sheetIds = new Set(universities.map((u) => u.id));

describe("catalogue: every country", () => {
  it("has Romania and a summary entry for each country on disk", () => {
    expect(onDisk).toContain("ro");
    expect(catalogCountries.map((c) => c.cc.toLowerCase()).sort()).toEqual(onDisk);
    expect(catalogCountries[0].cc).toBe("RO");
    expect(catalogTotals.programs).toBe(catalogCountries.reduce((n, c) => n + c.programs, 0));
  });

  for (const cc of onDisk) {
    it(`${cc.toUpperCase()}: follows the contract and matches its summary`, () => {
      const institutions = read<CatalogInstitution>(cc, "institutions");
      const programs = read<CatalogProgram>(cc, "programs");
      const summary = catalogCountries.find((c) => c.cc === cc.toUpperCase())!;
      expect(summary.institutions).toBe(institutions.length);
      expect(summary.programs).toBe(programs.length);
      expect(summary.source.url).toMatch(/^https?:\/\//);
      expect(summary.source.attribution.length).toBeGreaterThan(3);

      const instIds = new Set(institutions.map((i) => i.id));
      expect(instIds.size).toBe(institutions.length);
      for (const i of institutions) {
        expect(i.country, i.id).toBe(cc.toUpperCase());
        expect(["public", "private", "unknown"], i.id).toContain(i.kind);
        // an institution marked as having a sheet must really be one of the app's sheets
        if (i.hasSheet) expect(sheetIds.has(i.id), i.id).toBe(true);
        expect(i.city.trim().length, i.id).toBeGreaterThan(0);
      }
      const keys = new Set<string>();
      const perInst = new Map<string, number>();
      let bad = 0;
      for (const p of programs) {
        keys.add(p.key);
        perInst.set(p.institutionId, (perInst.get(p.institutionId) ?? 0) + 1);
        const ok =
          p.key.startsWith(`${cc}-`) && p.country === cc.toUpperCase() && instIds.has(p.institutionId) && p.name.trim().length > 1 && p.city.trim().length > 0 &&
          (p.domainId === null || domainIds.has(p.domainId)) && /^[a-z0-9 ]+$/.test(p.search) && p.language === p.language.toLowerCase() &&
          (p.form === undefined || ["full-time", "part-time", "distance", "dual"].includes(p.form));
        if (!ok) bad++;
      }
      expect(bad, "programmes breaking the contract").toBe(0);
      expect(keys.size, "unique keys").toBe(programs.length);
      for (const i of institutions) expect(perInst.get(i.id) ?? 0, i.id).toBe(i.programs);
      expect(summary.sheetIds.sort()).toEqual(institutions.filter((i) => i.hasSheet).map((i) => i.id).sort());
    });
  }
});

describe("catalogue: Romania (HG 606/2026, academic year 2026-2027)", () => {
  const institutions = read<CatalogInstitution>("ro", "institutions");
  const programs = read<CatalogProgram>("ro", "programs");

  it("has the 84 institutions with bachelor programmes: 52 state and 32 private", () => {
    expect(institutions).toHaveLength(84);
    expect(institutions.filter((i) => i.kind === "public")).toHaveLength(52);
    expect(institutions.filter((i) => i.kind === "private")).toHaveLength(32);
  });

  it("links every Romanian university sheet to the official list, and the other way round", () => {
    const ro = universities.filter((u) => u.region === "ro").map((u) => u.id);
    for (const id of ro) expect(institutions.some((i) => i.id === id && i.hasSheet), id).toBe(true);
    expect(institutions.filter((i) => !i.hasSheet)).toHaveLength(10);
    expect(catalogCountryOfSheet("upb")?.cc).toBe("RO");
    expect(catalogCountryOfSheet("nu-exista")).toBeUndefined();
  });

  it("has every programme row of the list, each with complete official fields", () => {
    expect(programs).toHaveLength(2673);
    for (const p of programs) {
      expect(p.domainId, p.key).not.toBeNull();
      expect(p.name, p.key).not.toMatch(/\*|\s{2}|^[^\p{L}\d]/u);
      expect(p.faculty, p.key).toMatch(/^(Facultatea|Departamentul|Școala|Institutul|Colegiul|Centrul)/);
      expect(["acreditat", "autorizat provizoriu"], p.key).toContain(p.status);
      expect(["full-time", "part-time", "distance"], p.key).toContain(p.form);
      expect([180, 240, 300, 360], p.key).toContain(p.credits);
      expect(p.years, p.key).toBe(p.credits! / 60);
      expect(Number.isInteger(p.maxStudents) && p.maxStudents! >= 0, p.key).toBe(true);
      // no old cedilla letters, which look the same but break searching
      expect(`${p.name}${p.faculty}${p.domain}${p.city}`, p.key).not.toMatch(/[şţŞŢ]/);
    }
  });

  it("every one of the 40 study domains of the questionnaire has programmes", () => {
    for (const d of domains) expect(programs.some((p) => p.domainId === d.id), d.id).toBe(true);
  });

  it("knows the teaching language and the place when the list says them", () => {
    expect([...new Set(programs.map((p) => p.language))].sort()).toEqual(["engleză", "franceză", "germană", "maghiară", "română", "română, maghiară"]);
    expect(programs.filter((p) => p.language === "engleză").length).toBeGreaterThan(150);
    const sapientia = new Set(programs.filter((p) => p.institutionId === "sapientia").map((p) => p.city));
    expect(sapientia.has("Miercurea Ciuc") && sapientia.has("Târgu Mureș")).toBe(true);
  });

  it("spot checks against the printed list", () => {
    const find = (inst: string, name: string, language = "română") => programs.filter((p) => p.institutionId === inst && p.name === name && p.language === language);
    const medicine = find("umf-carol-davila", "Medicină");
    expect(medicine).toHaveLength(1);
    expect(medicine[0]).toMatchObject({ faculty: "Facultatea de Medicină", domain: "Sănătate", domainId: "medicina", status: "acreditat", form: "full-time", credits: 360, years: 6, maxStudents: 1266 });
    expect(find("umf-carol-davila", "Medicină", "engleză")[0]).toMatchObject({ maxStudents: 300, credits: 360 });
    expect(find("upb", "Mecatronică")[0]).toMatchObject({ faculty: "Facultatea de Inginerie Mecanică și Mecatronică", domain: "Mecatronică și robotică", credits: 240, maxStudents: 120 });
    expect(find("upb", "Media digitală")[0]).toMatchObject({ status: "autorizat provizoriu", credits: 180, maxStudents: 60, domain: "Științe ale comunicării", domainId: "comunicare-jurnalism" });
  });
});
