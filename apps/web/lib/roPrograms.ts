// The Romanian bachelor programmes from the official list, read straight from the catalogue file so a sheet can show them without waiting for the database. Large: import it only from server code (the university and faculty pages) and from tests.
import programsJson from "../data/catalog/ro-programs.json";
import type { ProgramView } from "@/components/ProgramRow";
import type { CatalogProgram } from "./types";

const all = programsJson as CatalogProgram[];

/** The fields a page shows, the same shape the database query returns (no search text, no source string). */
function view(p: CatalogProgram): ProgramView {
  const { search, source, domainId, ...rest } = p;
  void search; void source;
  return domainId ? { ...rest, domainId } : rest;
}

/** All bachelor programmes of one Romanian institution, in the order of the official list. */
export function roProgramsOf(institutionId: string): ProgramView[] {
  return all.filter((p) => p.institutionId === institutionId).map(view);
}

/** The bachelor programmes of one faculty of a Romanian institution. */
export function roProgramsOfFaculty(institutionId: string, faculty: string): ProgramView[] {
  return all.filter((p) => p.institutionId === institutionId && p.faculty === faculty).map(view);
}
