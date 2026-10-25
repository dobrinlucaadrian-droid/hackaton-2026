// English versions of the long texts of the university and faculty sheets (data/en/universities.json and data/en/faculties.json), laid over the Romanian sheets. Large: server only, like lib/sheets.ts.
import facultiesEn from "../data/en/faculties.json";
import universitiesEn from "../data/en/universities.json";
import type { Lang } from "./i18n";
import { cityName, countryName, universityName } from "./i18n-data";
import type { FacultySheet, University } from "./types";

/** The translated fields of a university sheet, keyed by sheet id. */
export type UniversityEn = Pick<University, "about" | "budgetNote" | "admission" | "scholarshipsNote" | "dormsNote" | "pros" | "cons"> &
  Partial<Pick<University, "language" | "tuition">>;
/** The translated fields of a faculty sheet, keyed by `${universityId}|${Romanian name}`. The page address keeps the Romanian name. */
export type FacultyEn = Pick<FacultySheet, "name" | "about" | "admission"> & Partial<Pick<FacultySheet, "examSubjects">>;

const UNIS = universitiesEn as Record<string, Partial<UniversityEn>>;
const FACS = facultiesEn as Record<string, Partial<FacultyEn>>;

/** Whether the long texts of this sheet exist in English (the page shows a note in English when they do not). */
export function hasEnglishSheet(id: string): boolean {
  return Boolean(UNIS[id]?.about);
}

export function localUniversity(u: University, lang: Lang): University {
  if (lang !== "en") return u;
  return { ...u, ...UNIS[u.id], name: universityName(u, lang), city: cityName(u.city, lang), country: countryName(u.country, lang) };
}

export function localFaculty(f: FacultySheet, lang: Lang): FacultySheet {
  return lang === "en" ? { ...f, ...FACS[`${f.universityId}|${f.name}`] } : f;
}
