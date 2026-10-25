// The ten inclinations the questionnaire measures and their names in Romanian and English. Kept apart from the matching so pages can show them without loading the university data.
import type { Lang } from "./i18n";
import type { TraitId } from "./types";

export const TRAITS: TraitId[] = ["logic", "tehnic", "stiinte", "ingrijire", "oameni", "limbaj", "creativ", "business", "societate", "miscare"];

export const TRAIT_LABEL: Record<TraitId, string> = {
  logic: "Logică și cifre",
  tehnic: "Tehnică și construit",
  stiinte: "Științe și natură",
  ingrijire: "Grijă pentru alții",
  oameni: "Lucru cu oamenii",
  limbaj: "Cuvinte și limbi",
  creativ: "Creativitate",
  business: "Bani și organizare",
  societate: "Societate și legi",
  miscare: "Mișcare și teren",
};

export const TRAIT_LABEL_EN: Record<TraitId, string> = {
  logic: "Logic and numbers",
  tehnic: "Technology and building",
  stiinte: "Science and nature",
  ingrijire: "Caring for others",
  oameni: "Working with people",
  limbaj: "Words and languages",
  creativ: "Creativity",
  business: "Money and organisation",
  societate: "Society and law",
  miscare: "Movement and fieldwork",
};

/** The name of a trait in the page language. */
export function traitLabel(t: TraitId, lang: Lang = "ro"): string {
  return lang === "en" ? TRAIT_LABEL_EN[t] : TRAIT_LABEL[t];
}
