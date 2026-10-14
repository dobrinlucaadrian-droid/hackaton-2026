// Country guides ("how a Romanian student applies to bachelor studies in ..."), written from official pages and checked twice. Small: pages may import it freely.
import guidesJson from "../data/guides.json";
import type { Guide } from "./types";

export const guides = guidesJson as Guide[];

export function guideById(id: string): Guide | undefined {
  return guides.find((g) => g.id === id);
}

/** The guide of a country, by the country name used on the university sheets. */
export function guideForCountry(country: string): Guide | undefined {
  return guides.find((g) => g.country === country);
}
