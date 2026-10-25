// Romanian (and English, by language) labels for the values on a university sheet, plus two small helpers every list uses. Kept apart from the university data so pages can use the labels without loading the sheets.
import { specializations } from "./data";
import type { Lang } from "./i18n";
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
/** The cost filter keeps everything up to the chosen level, so its buttons say so. */
export const BUDGET_FILTER_LABEL: Record<Budget, string> = {
  gratuit: "Fără taxă",
  mic: "Până la o taxă mică",
  mediu: "Până la o taxă medie",
  mare: "Oricât",
};
/** The amounts of the "Cât poți plăti pe an?" filter, in euro per year (0 = only free). */
export const FEE_STEPS = [0, 1000, 3000, 6000, 10000, 20000] as const;
/** The yearly tuition band of each cost level (tuition only), checked against official fee pages on 2026-10-22 (docs/taxe.md). */
export const BUDGET_RANGE: Record<Budget, string> = {
  gratuit: "0 €",
  mic: "până la 2.000 €/an",
  mediu: "2.000–6.000 €/an",
  mare: "peste 6.000 €/an",
};
/** What each cost level means, with countries where most of our sheets have that level. */
export const BUDGET_EXPLAINED: Record<Budget, string> = {
  gratuit: "nu plătești taxă de școlarizare, de exemplu la universitățile de stat din România (pe locurile de la buget) sau în Germania și Danemarca",
  mic: "de exemplu universitățile de stat din Franța, Italia sau Spania",
  mediu: "de exemplu multe universități din Olanda, Irlanda sau Lituania",
  mare: "de exemplu în Marea Britanie, SUA sau Canada",
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

/** A number with its noun, the Romanian way: "1 program", "19 programe", "20 de programe", "4.117 instituții". */
export function counted(n: number, one: string, many: string, lang: Lang = "ro"): string {
  if (lang === "en") return `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;
  const last = n % 100;
  const de = n >= 20 && (last === 0 || last >= 20) ? " de" : "";
  return `${n.toLocaleString("ro-RO")}${de} ${n === 1 ? one : many}`;
}

export function specializationsFor(domainId: string): Specialization[] {
  return specializations.filter((s) => s.domainId === domainId);
}

/** The same label maps in English; `labelsFor("ro")` returns the Romanian ones above, unchanged. */
const EN = {
  PRESTIGE: { ivy: "Ivy League", top: "World top", international: "Known internationally", national: "Known in its own country" } as Record<Prestige, string>,
  BUDGET: { gratuit: "No tuition fee", mic: "Low fee", mediu: "Medium fee", mare: "High fee" } as Record<Budget, string>,
  BUDGET_FILTER: { gratuit: "No tuition fee", mic: "Up to a low fee", mediu: "Up to a medium fee", mare: "Any amount" } as Record<Budget, string>,
  BUDGET_RANGE: { gratuit: "€0", mic: "up to €2,000/year", mediu: "€2,000–6,000/year", mare: "over €6,000/year" } as Record<Budget, string>,
  BUDGET_EXPLAINED: {
    gratuit: "you pay no tuition fee, for example at Romanian state universities (on state-funded places) or in Germany and Denmark",
    mic: "for example state universities in France, Italy or Spain",
    mediu: "for example many universities in the Netherlands, Ireland or Lithuania",
    mare: "for example in the United Kingdom, the USA or Canada",
  } as Record<Budget, string>,
  ADMISSION: {
    examen: "Admission exam",
    bac: "Baccalaureate average",
    dosar: "Application file",
    interviu: "Interview",
    aptitudini: "Aptitude tests",
    "test-standardizat": "Standardised test (SAT, ACT etc.)",
  } as Record<AdmissionType, string>,
  CERTIFICATE: {
    bac: "Baccalaureate diploma",
    engleza: "English certificate (IELTS, TOEFL, Cambridge)",
    "alta-limba": "Certificate for another foreign language",
    "sat-act": "SAT or ACT test",
    portofoliu: "Portfolio",
    motivatie: "Motivation letter",
    recomandari: "Recommendation letters",
    medical: "Medical certificate",
  } as Record<CertificateId, string>,
};
export function labelsFor(lang: Lang) {
  return lang === "en"
    ? { PRESTIGE: EN.PRESTIGE, BUDGET: EN.BUDGET, BUDGET_FILTER: EN.BUDGET_FILTER, BUDGET_RANGE: EN.BUDGET_RANGE, BUDGET_EXPLAINED: EN.BUDGET_EXPLAINED, ADMISSION: EN.ADMISSION, CERTIFICATE: EN.CERTIFICATE }
    : { PRESTIGE: PRESTIGE_LABEL, BUDGET: BUDGET_LABEL, BUDGET_FILTER: BUDGET_FILTER_LABEL, BUDGET_RANGE, BUDGET_EXPLAINED, ADMISSION: ADMISSION_LABEL, CERTIFICATE: CERTIFICATE_LABEL };
}

/** A number written the page's way: "1.234" in Romanian, "1,234" in English. */
export function formatNumber(n: number, lang: Lang = "ro"): string {
  return n.toLocaleString(lang === "en" ? "en-GB" : "ro-RO");
}

/** Language names of the programme rows (as the catalogue writes them, in Romanian) in English. */
export const LANGUAGE_EN: Record<string, string> = {
  engleză: "English", franceză: "French", germană: "German", italiană: "Italian", spaniolă: "Spanish", maghiară: "Hungarian", română: "Romanian",
  rusă: "Russian", poloneză: "Polish", olandeză: "Dutch", portugheză: "Portuguese", suedeză: "Swedish", finlandeză: "Finnish", greacă: "Greek",
  bulgară: "Bulgarian", slovenă: "Slovenian", lituaniană: "Lithuanian", estonă: "Estonian", daneză: "Danish", sârbă: "Serbian",
  ucraineană: "Ukrainian", turcă: "Turkish", cehă: "Czech", slovacă: "Slovak", croată: "Croatian", norvegiană: "Norwegian",
  irlandeză: "Irish", galeză: "Welsh", catalană: "Catalan", flamandă: "Flemish", letonă: "Latvian",
};
/** "română, maghiară" → "Romanian, Hungarian"; names without an entry stay as the source writes them. */
export function languageName(language: string, lang: Lang): string {
  return lang === "en" ? language.split(", ").map((l) => LANGUAGE_EN[l] ?? l).join(", ") : language;
}
