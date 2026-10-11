// The ten inclinations the questionnaire measures and their Romanian names. Kept apart from the matching so pages can show them without loading the university data.
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
