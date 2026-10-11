// Romanian labels for the values on a university sheet, plus two small helpers every list uses. Kept apart from the university data so pages can use the labels without loading the sheets.
import { specializations } from "./data";
import type { AdmissionType, Budget, CertificateId, Prestige, Specialization } from "./types";

export const PRESTIGE_LABEL: Record<Prestige, string> = {
  ivy: "Ivy League",
  top: "De top mondial",
  international: "Cunoscută internațional",
  national: "Cunoscută în țara ei",
};
export const BUDGET_LABEL: Record<Budget, string> = {
  gratuit: "Fără taxă",
  mic: "Taxă mică",
  mediu: "Taxă medie",
  mare: "Taxă mare",
};
export const ADMISSION_LABEL: Record<AdmissionType, string> = {
  examen: "Examen de admitere",
  bac: "Media de la bacalaureat",
  dosar: "Dosar de aplicare",
  interviu: "Interviu",
  aptitudini: "Probe de aptitudini",
  "test-standardizat": "Test standardizat (SAT, ACT etc.)",
};
export const CERTIFICATE_LABEL: Record<CertificateId, string> = {
  bac: "Diplomă de bacalaureat",
  engleza: "Certificat de limba engleză (IELTS, TOEFL, Cambridge)",
  "alta-limba": "Certificat pentru altă limbă străină",
  "sat-act": "Test SAT sau ACT",
  portofoliu: "Portofoliu",
  motivatie: "Scrisoare de motivație",
  recomandari: "Scrisori de recomandare",
  medical: "Aviz medical",
};

/** Lower-cases, strips diacritics (including the cedilla forms ş/ţ) and collapses whitespace, so "Bucuresti" finds "București". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function specializationsFor(domainId: string): Specialization[] {
  return specializations.filter((s) => s.domainId === domainId);
}
