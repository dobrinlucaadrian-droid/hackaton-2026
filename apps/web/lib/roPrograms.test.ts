// Tests the programme lists the Romanian sheets render on the server: every faculty sheet finds its programmes and the rows carry only what a page shows.
import { describe, expect, it } from "vitest";
import programsJson from "../data/catalog/ro-programs.json";
import { faculties } from "./faculties";
import { roProgramsOf, roProgramsOfFaculty } from "./roPrograms";

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
});
