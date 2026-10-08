// Tests the Romanian catalogue built from the official government list: institutions and bachelor programmes are complete and consistent.
import { describe, expect, it } from "vitest";
import institutionsJson from "../data/ro-institutions.json";
import programsJson from "../data/ro-programs.json";
import { domains, universities } from "./data";
import type { CatalogInstitution, CatalogProgram } from "./types";

const institutions = institutionsJson as CatalogInstitution[];
const programs = programsJson as CatalogProgram[];

describe("Romanian institutions (official list 2026-2027)", () => {
  it("has the 84 institutions with bachelor programmes: 52 state and 32 private, each once", () => {
    expect(institutions).toHaveLength(84);
    expect(institutions.filter((i) => i.kind === "stat")).toHaveLength(52);
    expect(institutions.filter((i) => i.kind === "particular")).toHaveLength(32);
    expect(new Set(institutions.map((i) => i.id)).size).toBe(84);
  });

  it("links every university sheet in the app to the official list, and the other way round", () => {
    const ro = universities.filter((u) => u.region === "ro").map((u) => u.id);
    for (const id of ro) expect(institutions.some((i) => i.id === id && i.hasSheet), id).toBe(true);
    for (const i of institutions.filter((x) => x.hasSheet)) expect(ro, i.id).toContain(i.id);
    expect(institutions.filter((i) => !i.hasSheet)).toHaveLength(10);
  });

  it("counts on each institution match its programmes", () => {
    for (const i of institutions) {
      const mine = programs.filter((p) => p.institutionId === i.id);
      expect(mine.length, i.id).toBe(i.programs);
      expect(new Set(mine.map((p) => p.faculty)).size, i.id).toBe(i.faculties);
      expect(i.programs, i.id).toBeGreaterThan(0);
    }
  });
});

describe("Romanian bachelor programmes (official list 2026-2027)", () => {
  it("has every programme row of the list, with unique keys", () => {
    expect(programs).toHaveLength(2673);
    expect(new Set(programs.map((p) => p.key)).size).toBe(programs.length);
  });

  it("every programme has clean, valid fields", () => {
    const domainIds = new Set(domains.map((d) => d.id));
    const instIds = new Set(institutions.map((i) => i.id));
    for (const p of programs) {
      expect(instIds.has(p.institutionId), p.key).toBe(true);
      expect(domainIds.has(p.domainId), `${p.key}: ${p.domainId}`).toBe(true);
      expect(p.name.length, p.key).toBeGreaterThan(2);
      expect(p.name, p.key).not.toMatch(/\*|\s{2}|^[^\p{L}\d]/u);
      expect(p.faculty, p.key).toMatch(/^(Facultatea|Departamentul|Școala|Institutul|Colegiul|Centrul)/);
      expect(p.domain.length, p.key).toBeGreaterThan(2);
      expect(["A", "AP"], p.key).toContain(p.status);
      expect(["IF", "IFR", "ID"], p.key).toContain(p.form);
      expect([180, 240, 300, 360], p.key).toContain(p.credits);
      expect(p.years, p.key).toBe(p.credits / 60);
      expect(Number.isInteger(p.maxStudents) && p.maxStudents >= 0, p.key).toBe(true);
      expect(p.city.length, p.key).toBeGreaterThan(2);
      expect(p.country, p.key).toBe("RO");
      // no old cedilla letters, which look the same but break searching
      expect(`${p.name}${p.faculty}${p.domain}${p.city}`, p.key).not.toMatch(/[şţŞŢ]/);
      expect(p.search, p.key).toMatch(/^[a-z0-9 ]+$/);
    }
  });

  it("every one of the 40 study domains of the questionnaire has programmes", () => {
    for (const d of domains) expect(programs.some((p) => p.domainId === d.id), d.id).toBe(true);
  });

  it("knows the teaching language and the place when the list says them", () => {
    const langs = new Set(programs.map((p) => p.language));
    expect([...langs].sort()).toEqual(["engleză", "franceză", "germană", "maghiară", "română", "română, maghiară"]);
    expect(programs.filter((p) => p.language === "engleză").length).toBeGreaterThan(150);
    // Sapientia teaches in Miercurea Ciuc, Târgu Mureș and Sfântu Gheorghe, not only in Cluj-Napoca
    const sapientia = new Set(programs.filter((p) => p.institutionId === "sapientia").map((p) => p.city));
    expect(sapientia.has("Miercurea Ciuc") && sapientia.has("Târgu Mureș")).toBe(true);
  });

  it("spot checks against the printed list", () => {
    const find = (inst: string, name: string, language = "română") => programs.filter((p) => p.institutionId === inst && p.name === name && p.language === language);
    const medicine = find("umf-carol-davila", "Medicină");
    expect(medicine).toHaveLength(1);
    expect(medicine[0]).toMatchObject({ faculty: "Facultatea de Medicină", domain: "Sănătate", domainId: "medicina", status: "A", form: "IF", credits: 360, years: 6, maxStudents: 1266 });
    expect(find("umf-carol-davila", "Medicină", "engleză")[0]).toMatchObject({ maxStudents: 300, credits: 360 });
    expect(find("upb", "Mecatronică")[0]).toMatchObject({ faculty: "Facultatea de Inginerie Mecanică și Mecatronică", domain: "Mecatronică și robotică", credits: 240, maxStudents: 120 });
    expect(find("upb", "Media digitală")[0]).toMatchObject({ status: "AP", credits: 180, maxStudents: 60, domain: "Științe ale comunicării", domainId: "comunicare-jurnalism" });
  });
});
