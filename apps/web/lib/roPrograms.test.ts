// Tests the programme lists the Romanian sheets render on the server: every faculty sheet finds its programmes and the rows carry only what a page shows.
import { describe, expect, it } from "vitest";
import programsJson from "../data/catalog/ro-programs.json";
import { faculties } from "./faculties";
import { admission, roProgramsOf, roProgramsOfFaculty } from "./roPrograms";

describe("Romanian programme lists", () => {
  it("gives an institution all its programmes, in the order of the official list, without internal fields", () => {
    const official = (programsJson as { institutionId: string; key: string }[]).filter((p) => p.institutionId === "ubb-cluj");
    const rows = roProgramsOf("ubb-cluj");
    expect(rows.map((r) => r.key)).toEqual(official.map((p) => p.key));
    expect(rows.length).toBeGreaterThan(100);
    for (const r of rows) {
      expect(r).not.toHaveProperty("search");
      expect(r).not.toHaveProperty("source");
      expect(r.domainId === undefined || typeof r.domainId === "string").toBe(true);
    }
    expect(roProgramsOf("nu-exista")).toEqual([]);
  });

  it("finds at least one programme for every faculty that has a sheet", () => {
    for (const f of faculties) {
      const rows = roProgramsOfFaculty(f.universityId, f.name);
      expect(rows.length, `${f.universityId}: ${f.name}`).toBeGreaterThan(0);
      expect(rows.every((r) => r.faculty === f.name)).toBe(true);
    }
  });

  it("keeps the admission averages tied to real programmes, with a value in range and an official link", () => {
    const keys = new Set((programsJson as { key: string }[]).map((p) => p.key));
    expect(admission.year).toMatch(/^20\d\d$/);
    for (const [key, a] of Object.entries(admission.entries)) {
      expect(keys.has(key), key).toBe(true);
      expect(a.budget !== undefined || a.fee !== undefined, key).toBe(true);
      const max = a.scale ?? 10;
      for (const v of [a.budget, a.fee]) if (v !== undefined) expect(v > 0 && v <= max, `${key}: ${v}`).toBe(true);
      expect(a.url, key).toMatch(/^https?:\/\//);
    }
  });
});
