// The Romanian bachelor programmes from the official list, read straight from the catalogue file so a sheet can show them without waiting for the database. Large: import it only from server code (the university and faculty pages) and from tests.
// One institution of the official list can be split into several sheets by city (Politehnica București: București and the Pitești centre).
import programsJson from "../data/catalog/ro-programs.json";
import type { ProgramView } from "@/components/ProgramRow";
import type { CatalogProgram } from "./types";

const all = programsJson as CatalogProgram[];

/** Sheets made from part of an official institution: sheet id -> the institution and which of its cities belong to the sheet. */
export const SPLIT_SHEETS: Record<string, { institution: string; inSheet: (city: string) => boolean }> = {
  upb: { institution: "upb", inSheet: (city) => city === "București" },
  "upb-pitesti": { institution: "upb", inSheet: (city) => city !== "București" },
};

function ofSheet(sheetId: string): CatalogProgram[] {
  const split = SPLIT_SHEETS[sheetId];
  return split ? all.filter((p) => p.institutionId === split.institution && split.inSheet(p.city)) : all.filter((p) => p.institutionId === sheetId);
}

/** The fields a page shows, the same shape the database query returns (no search text, no source string). */
function view(p: CatalogProgram): ProgramView {
  const { search, source, domainId, ...rest } = p;
  void search; void source;
  return domainId ? { ...rest, domainId } : rest;
}

/** All bachelor programmes of one Romanian sheet, in the order of the official list. */
export function roProgramsOf(sheetId: string): ProgramView[] {
  return ofSheet(sheetId).map(view);
}

/** The bachelor programmes of one faculty of a Romanian sheet. */
export function roProgramsOfFaculty(sheetId: string, faculty: string): ProgramView[] {
  return ofSheet(sheetId).filter((p) => p.faculty === faculty).map(view);
}
