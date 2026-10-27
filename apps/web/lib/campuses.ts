// Universities whose official programme list spans separate campuses: on their sheet, "Ce poți studia aici" is split by campus,
// using the city of each programme in the official list (data/catalog/ro-programs.json). Server only (it reads the catalogue).
import { roProgramsOf } from "./roPrograms";

type Campus = { ro: string; en: string; noteRo?: string; noteEn?: string; cities: string[] | "rest" };

// Politehnica București's official list also holds the faculties in Pitești and their branches in nearby towns.
const CAMPUSES: Record<string, Campus[]> = {
  upb: [
    { ro: "Politehnica București", en: "Politehnica Bucharest", cities: ["București"] },
    {
      ro: "Politehnica Pitești",
      en: "Politehnica Pitești",
      noteRo: "Facultățile din Pitești, cu extensii în Alexandria, Câmpulung, Râmnicu Vâlcea și Slatina.",
      noteEn: "The faculties in Pitești, with branches in Alexandria, Câmpulung, Râmnicu Vâlcea and Slatina.",
      cities: "rest",
    },
  ],
};

export type CampusGroup = { ro: string; en: string; noteRo?: string; noteEn?: string; domainIds: string[] };

/**
 * The sheet's domains split by campus, or undefined for a university with one campus. A domain taught on several campuses
 * appears under each; a domain the official list does not show on any campus stays with the first (main) campus.
 */
export function campusGroups(universityId: string, domainIds: string[]): CampusGroup[] | undefined {
  const campuses = CAMPUSES[universityId];
  if (!campuses) return undefined;
  const named = new Set(campuses.flatMap((c) => (c.cities === "rest" ? [] : c.cities)));
  const programs = roProgramsOf(universityId);
  const taught = (c: Campus) =>
    new Set(programs.filter((p) => p.domainId && (c.cities === "rest" ? !named.has(p.city) : c.cities.includes(p.city))).map((p) => p.domainId as string));
  const sets = campuses.map(taught);
  const anywhere = new Set(sets.flatMap((s) => [...s]));
  return campuses
    .map((c, k) => ({
      ro: c.ro,
      en: c.en,
      noteRo: c.noteRo,
      noteEn: c.noteEn,
      domainIds: domainIds.filter((d) => sets[k].has(d) || (k === 0 && !anywhere.has(d))),
    }))
    .filter((g) => g.domainIds.length > 0);
}
