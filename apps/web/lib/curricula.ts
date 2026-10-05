// Curricula data: for each study domain one official "plan de învățământ" (subjects per year), and for Romanian universities the official page with their curricula.
import type { Curriculum, CurriculumLink } from "./types";
import curriculaJson from "../data/curricula.json";
import linksJson from "../data/curriculum-links.json";

export const curricula = curriculaJson as Curriculum[];
export const curriculumLinks = linksJson as CurriculumLink[];

/** The example curriculum of a domain, or undefined when we have no verified one. */
export function curriculumFor(domainId: string): Curriculum | undefined {
  return curricula.find((c) => c.domainId === domainId && c.plan.length > 0);
}

/** The official curricula page of a university, or undefined when we have no verified link. */
export function curriculumLinkFor(universityId: string): CurriculumLink | undefined {
  return curriculumLinks.find((l) => l.id === universityId);
}
