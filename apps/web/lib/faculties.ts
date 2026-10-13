// Profile sheets of Romanian faculties (data/faculties-ro.json) and the address of each one. Used on the server: by the faculty page and by the university page, which links to them.
import facultiesJson from "../data/faculties-ro.json";
import { normalize } from "./labels";
import type { FacultySheet } from "./types";

export const faculties = facultiesJson as FacultySheet[];

/** "Facultatea de Automatică și Calculatoare" -> "facultatea-de-automatica-si-calculatoare" (the last part of the page address). */
export function facultySlug(name: string): string {
  return normalize(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function facultyHref(sheet: Pick<FacultySheet, "universityId" | "name">): string {
  return `/universitati/${sheet.universityId}/${facultySlug(sheet.name)}`;
}

export function facultiesOf(universityId: string): FacultySheet[] {
  return faculties.filter((f) => f.universityId === universityId);
}

export function facultyBySlug(universityId: string, slug: string): FacultySheet | undefined {
  return faculties.find((f) => f.universityId === universityId && facultySlug(f.name) === slug);
}
