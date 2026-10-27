// Universities whose official programme list spans several cities: on their sheet, "Ce poți studia aici" is split by city, using
// the city of each programme in the official list (data/catalog/ro-programs.json), so a domain taught only in a branch (e.g. Teologie
// of Politehnica, taught in Pitești) is not shown as if it were in the main city. Server only (it reads the catalogue).
import { roProgramsOf } from "./roPrograms";

export type CampusGroup = { ro: string; en: string; noteRo?: string; noteEn?: string; domainIds: string[] };

// Names for the groups of universities whose campuses are known by their own name.
const NAMES: Record<string, Record<string, Omit<CampusGroup, "domainIds">>> = {
  upb: {
    București: { ro: "Politehnica București", en: "Politehnica Bucharest" },
    // the Pitești faculties also teach in their branches in nearby towns, listed under Pitești
    Pitești: {
      ro: "Politehnica Pitești",
      en: "Politehnica Pitești",
      noteRo: "Facultățile din Pitești, cu extensii în Alexandria, Câmpulung, Râmnicu Vâlcea și Slatina.",
      noteEn: "The faculties in Pitești, with branches in Alexandria, Câmpulung, Râmnicu Vâlcea and Slatina.",
    },
  },
};
// Branch towns counted with a larger campus of the same university (same faculties in the official list).
const BRANCH_OF: Record<string, Record<string, string>> = {
  upb: { Alexandria: "Pitești", Câmpulung: "Pitești", "Râmnicu Vâlcea": "Pitești", Slatina: "Pitești" },
};

/**
 * The sheet's domains split by city, or undefined when every domain is taught in the sheet's own city. The sheet's city comes
 * first, with every domain taught there (and the domains the official list does not place anywhere); then one group for each
 * other city that teaches at least one domain the sheet's city does not, with all the domains taught in that city.
 */
export function campusGroups(universityId: string, sheetCity: string, domainIds: string[]): CampusGroup[] | undefined {
  const programs = roProgramsOf(universityId).filter((p) => p.domainId && domainIds.includes(p.domainId));
  if (!programs.length) return undefined;
  const cityOf = (c: string) => BRANCH_OF[universityId]?.[c] ?? c;
  const byCity = new Map<string, Set<string>>();
  for (const p of programs) {
    const c = cityOf(p.city);
    if (!byCity.has(c)) byCity.set(c, new Set());
    byCity.get(c)!.add(p.domainId as string);
  }
  const main = byCity.get(sheetCity) ?? new Set<string>();
  const others = [...byCity.entries()].filter(([c, set]) => c !== sheetCity && [...set].some((d) => !main.has(d)));
  if (!others.length) return undefined;
  const placed = new Set([...byCity.values()].flatMap((s) => [...s]));
  const name = (c: string) => NAMES[universityId]?.[c] ?? { ro: `În ${c}`, en: `In ${c}` };
  // the other cities with the most programmes first
  const count = (c: string) => programs.filter((p) => cityOf(p.city) === c).length;
  others.sort((a, b) => count(b[0]) - count(a[0]));
  return [
    { ...name(sheetCity), domainIds: domainIds.filter((d) => main.has(d) || !placed.has(d)) },
    ...others.map(([c, set]) => ({ ...name(c), domainIds: domainIds.filter((d) => set.has(d)) })),
  ].filter((g) => g.domainIds.length > 0);
}
