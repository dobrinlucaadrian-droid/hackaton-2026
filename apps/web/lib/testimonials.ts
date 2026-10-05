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
};

/** The id of the university an opinion is about, or undefined when that university has no sheet in the app. */
export function universityIdOf(t: Testimonial): string | undefined {
  return UNIVERSITY_ID[t.university ?? t.faculty];
}

/** All student opinions about one university, in the order they were added. */
export function testimonialsFor(universityId: string): Testimonial[] {
  return testimonials.filter((t) => universityIdOf(t) === universityId);
}
