// Tests the faculty sheets: each one belongs to a real faculty of the official list, has valid values and official links, and gets a unique page address.
import { describe, expect, it } from "vitest";
import programsJson from "../data/catalog/ro-programs.json";
import { faculties, facultyBySlug, facultyHref, facultySlug } from "./faculties";
import { universities } from "./sheets";

const ADMISSION = ["examen", "bac", "dosar", "interviu", "aptitudini", "test-standardizat"];
const official = new Set((programsJson as { institutionId: string; faculty?: string }[]).map((p) => `${p.institutionId}|${p.faculty ?? ""}`));

describe("faculty sheets", () => {
  it("each sheet is a faculty of the official list, at a university that has a sheet", () => {
    const ids = new Set(universities.map((u) => u.id));
    for (const f of faculties) {
      expect(ids.has(f.universityId), f.universityId).toBe(true);
      expect(official.has(`${f.universityId}|${f.name}`), `${f.universityId}: ${f.name}`).toBe(true);
    }
  });

  it("each sheet has its texts, valid admission types and official links", () => {
    for (const f of faculties) {
      const where = `${f.universityId}: ${f.name}`;
      expect(f.about.trim().length, where).toBeGreaterThan(40);
      expect(f.about.length, where).toBeLessThanOrEqual(600);
      expect(f.admission.trim().length, where).toBeGreaterThan(20);
      expect(f.admission.length, where).toBeLessThanOrEqual(600);
      expect(f.admissionTypes.length, where).toBeGreaterThan(0);
      for (const a of f.admissionTypes) expect(ADMISSION, where).toContain(a);
      expect(f.sources.length, where).toBeGreaterThan(0);
      for (const url of [f.website, f.admissionUrl, f.curriculumUrl, ...f.sources]) {
        if (url !== undefined) expect(url, where).toMatch(/^https?:\/\/[^\s]+$/);
      }
      for (const s of f.examSubjects ?? []) expect(s.trim().length, where).toBeGreaterThan(1);
    }
  });

  it("no sheet gives amounts, numbers of places or admission averages", () => {
    for (const f of faculties) {
      const text = `${f.about} ${f.admission}`;
      expect(text, f.name).not.toMatch(/\d+\s*(lei|euro|eur|ron|€)|\d+\s*(de\s+)?locuri|ultima\s+medie|media\s+de\s+\d/i);
    }
  });

  it("each sheet has its own page address and is found by it", () => {
    const seen = new Set<string>();
    for (const f of faculties) {
      const href = facultyHref(f);
      expect(seen.has(href), href).toBe(false);
      seen.add(href);
      expect(facultyBySlug(f.universityId, facultySlug(f.name))).toBe(f);
    }
    expect(facultySlug("Facultatea de Automatică și Calculatoare")).toBe("facultatea-de-automatica-si-calculatoare");
    expect(facultyBySlug("upb", "nu-exista")).toBeUndefined();
  });
});
