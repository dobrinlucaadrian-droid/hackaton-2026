// The per-country summary of the programme catalogue (counts, cities, sources), small enough to ship to the browser; the programmes themselves stay in the database.
import indexJson from "../data/catalog/index.json";
import type { CatalogCountry } from "./types";

export const catalogCountries = indexJson as CatalogCountry[];

export const catalogTotals = {
  countries: catalogCountries.length,
  institutions: catalogCountries.reduce((n, c) => n + c.institutions, 0),
  programs: catalogCountries.reduce((n, c) => n + c.programs, 0),
};

/** The country whose catalogue includes this university sheet, if any. */
export function catalogCountryOfSheet(sheetId: string): CatalogCountry | undefined {
  return catalogCountries.find((c) => c.sheetIds.includes(sheetId));
}

/** Every university sheet id that has programmes in the catalogue. */
export const catalogSheetIds = catalogCountries.flatMap((c) => c.sheetIds);
