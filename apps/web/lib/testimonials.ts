// Links student opinions to the universities that have a profile sheet, so the search and the sheets can show them.
import { testimonials } from "./data";
import type { Testimonial } from "./types";

// Name used in the opinions (`university`, or `faculty` when missing) -> university id. Universities without a sheet are not listed.
const UNIVERSITY_ID: Record<string, string> = {
  "University of Cambridge": "cambridge",
  "Universitatea din București": "unibuc",
  "IE University": "ie-university",
  "ASE București": "ase-bucuresti",
  "Universitatea din Amsterdam": "uva",
  "Sciences Po Paris": "sciences-po",
  "Universitatea Babeș-Bolyai": "ubb-cluj",
  "Universitatea Bocconi": "bocconi",
  "Columbia University": "columbia",
  "UMF „Carol Davila” București": "umf-carol-davila",
  "Universitatea de Vest din Timișoara": "uvt",
  "Université Jean Moulin Lyon 3": "lyon-3",
  "Universitatea Paris-Saclay": "paris-saclay",
  "University of Wisconsin–Madison": "us-university-of-wisconsin-madison",
  "Hogeschool Inholland": "inholland",
  // the student studies medicine at Lyon 1 (confirmed by the team)
  "Medicină, Lyon (Franța)": "lyon-1",
  // ESADE has its own sheet; La Salle is a school of Universitat Ramon Llull
  ESADE: "esade",
  "La Salle Barcelona": "es-universidad-ramon-llull",
  "Institut Lyfe": "institut-lyfe",
  // the Swiss campus (Crans-Montana), confirmed by the team
  "Les Roches": "les-roches",
  // the Madrid university of the group, confirmed by the team
  "Universidad Europea": "es-universidad-europea-de-madrid",
};

/** The id of the university an opinion is about, or undefined when that university has no sheet in the app. */
export function universityIdOf(t: Testimonial): string | undefined {
  return t.universityId ?? UNIVERSITY_ID[t.university ?? t.faculty];
}

/** All student opinions about one university, in the order they were added. */
export function testimonialsFor(universityId: string): Testimonial[] {
  return testimonials.filter((t) => universityIdOf(t) === universityId);
}
