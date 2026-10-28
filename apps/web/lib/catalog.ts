// The per-country summary of the programme catalogue (counts, cities, sources), small enough to ship to the browser; the programmes themselves stay in the database.
import indexJson from "../data/catalog/index.json";
import type { CatalogCountry } from "./types";

export const catalogCountries = indexJson as CatalogCountry[];

export const catalogTotals = {
  countries: catalogCountries.length,
  institutions: catalogCountries.reduce((n, c) => n + c.institutions, 0),
  programs: catalogCountries.reduce((n, c) => n + c.programs, 0),
};

/** Schools with their own sheet whose programmes the official list files under their university: the sheet shows the university's faculties whose name contains `faculty`. */
export const SCHOOL_PROGRAMS: Record<string, { institutionId: string; faculty: string }> = {
  esade: { institutionId: "es-universidad-ramon-llull", faculty: "ESADE" },
};

/** The country whose catalogue includes this university sheet (or the university of a school sheet), if any. */
export function catalogCountryOfSheet(sheetId: string): CatalogCountry | undefined {
  const id = SCHOOL_PROGRAMS[sheetId]?.institutionId ?? sheetId;
  return catalogCountries.find((c) => c.sheetIds.includes(id));
}

/** Every university sheet id that has programmes in the catalogue. */
export const catalogSheetIds = catalogCountries.flatMap((c) => c.sheetIds);
