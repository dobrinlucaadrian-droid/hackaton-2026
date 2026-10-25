// English versions of the seeded data, read from data/en/*.json (keyed by id) and laid over the Romanian data; anything not translated yet stays in Romanian. Small: safe in the browser (the long sheet texts are in lib/i18n-sheets.ts, server only).
import categoriesEn from "../data/en/categories.json";
import curriculaEn from "../data/en/curricula.json";
import domainsEn from "../data/en/domains.json";
import profilesEn from "../data/en/profiles.json";
import questionsEn from "../data/en/questions.json";
import specializationsEn from "../data/en/specializations.json";
import universityNamesEn from "../data/en/university-names.json";
import type { Lang } from "./i18n";
import type { Category, Curriculum, Domain, Profile, Question, Specialization, UniversitySummary } from "./types";

// The shapes of the files in data/en: each one maps an id to the translated fields only.
export type DomainEn = Pick<Domain, "name" | "short" | "admission" | "careers">;
export type SpecializationEn = Pick<Specialization, "name" | "short">;
export type CategoryEn = Pick<Category, "name" | "short">;
export type QuestionEn = { text: string; options: string[] }; // option labels in the same order as data/questions.json
export type ProfileEn = Pick<Profile, "filiera" | "name">;
export type CurriculumEn = { plan: Curriculum["plan"] }; // keyed by domainId

const DOMAINS = domainsEn as Record<string, Partial<DomainEn>>;
const SPECS = specializationsEn as Record<string, Partial<SpecializationEn>>;
const CATS = categoriesEn as Record<string, Partial<CategoryEn>>;
const QUESTIONS = questionsEn as Record<string, Partial<QuestionEn>>;
const PROFILES = profilesEn as Record<string, Partial<ProfileEn>>;
const CURRICULA = curriculaEn as Record<string, Partial<CurriculumEn>>;
/** Official English names of the Romanian universities, keyed by sheet id (sheets abroad keep their own name). */
const UNI_NAMES = universityNamesEn as Record<string, string>;

/** Country names as the sheets write them (in Romanian) → English. */
export const COUNTRY_EN: Record<string, string> = {
  România: "Romania",
  Olanda: "Netherlands",
  Danemarca: "Denmark",
  "Marea Britanie": "United Kingdom",
  Germania: "Germany",
  Austria: "Austria",
  Italia: "Italy",
  Franța: "France",
  Belgia: "Belgium",
  Elveția: "Switzerland",
  Suedia: "Sweden",
  Spania: "Spain",
  SUA: "USA",
  Canada: "Canada",
  Australia: "Australia",
  "Hong Kong": "Hong Kong",
  "Coreea de Sud": "South Korea",
  Singapore: "Singapore",
  Polonia: "Poland",
  Norvegia: "Norway",
  Estonia: "Estonia",
  Letonia: "Latvia",
  Lituania: "Lithuania",
  Slovenia: "Slovenia",
  Malta: "Malta",
  Irlanda: "Ireland",
  Finlanda: "Finland",
  Portugalia: "Portugal",
  Cehia: "Czechia",
  "Republica Moldova": "Moldova",
  Bulgaria: "Bulgaria",
  Grecia: "Greece",
  Cipru: "Cyprus",
  "Belgia (doar Flandra)": "Belgium (Flanders only)",
};

/** City names that have a usual English form; every other city keeps its own name. */
const CITY_EN: Record<string, string> = { București: "Bucharest" };

export function countryName(country: string, lang: Lang): string {
  return lang === "en" ? (COUNTRY_EN[country] ?? country) : country;
}

export function cityName(city: string, lang: Lang): string {
  return lang === "en" ? (CITY_EN[city] ?? city) : city;
}

/** The name a university is shown with: the official English name of a Romanian university on the English pages. */
export function universityName(u: Pick<UniversitySummary, "id" | "name">, lang: Lang): string {
  return lang === "en" ? (UNI_NAMES[u.id] ?? u.name) : u.name;
}

export function localDomain<T extends Domain>(d: T, lang: Lang): T {
  return lang === "en" ? { ...d, ...DOMAINS[d.id] } : d;
}

export function localSpecialization<T extends Specialization>(s: T, lang: Lang): T {
  return lang === "en" ? { ...s, ...SPECS[s.id] } : s;
}

export function localCategory<T extends Category>(c: T, lang: Lang): T {
  return lang === "en" ? { ...c, ...CATS[c.id] } : c;
}

export function localProfile<T extends Profile>(p: T, lang: Lang): T {
  return lang === "en" ? { ...p, ...PROFILES[p.id] } : p;
}

export function localQuestion(q: Question, lang: Lang): Question {
  const en = lang === "en" ? QUESTIONS[q.id] : undefined;
  if (!en) return q;
  return {
    ...q,
    text: en.text ?? q.text,
    options: q.options.map((o, i) => ({ ...o, label: en.options?.[i] ?? o.label })),
  };
}

export function localCurriculum(c: Curriculum, lang: Lang): Curriculum {
  const en = lang === "en" ? CURRICULA[c.domainId] : undefined;
  return en?.plan ? { ...c, plan: en.plan } : c;
}
