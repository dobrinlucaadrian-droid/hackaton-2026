// Shared data contract for UniPath: profiles, questions, domains, universities and match results.

/** What a student can be drawn to; profiles, answers and domains are all scored on these. */
export type TraitId =
  | "logic" // maths, numbers, logical problems
  | "tehnic" // building things, machines, code
  | "stiinte" // biology, chemistry, physics, nature
  | "ingrijire" // health, caring for people or animals
  | "oameni" // working with and helping people
  | "limbaj" // words, languages, writing, speaking
  | "creativ" // art, design, performance
  | "business" // money, organising, leading
  | "societate" // law, history, politics, how society works
  | "miscare"; // sport, physical activity, field work

export type TraitWeights = Partial<Record<TraitId, number>>;

/** High-school profile and specialization, e.g. "Real — Matematică-Informatică". */
export type Profile = {
  id: string;
  filiera: string; // "Teoretică", "Tehnologică", "Vocațională"
  name: string;
  traits: TraitWeights; // 0..3 head start this profile gives
};

export type QuestionOption = {
  label: string;
  traits: TraitWeights; // 0..3 added when this option is picked
};

export type Question = {
  id: string;
  text: string;
  options: QuestionOption[];
};

/** Where the student wants to study. Asked as its own step, not part of `questions`. */
export type StudyPlace = "ro" | "abroad" | "any";

export type Domain = {
  id: string; // one of the fixed domain ids, e.g. "medicina", "informatica"
  name: string;
  short: string; // one sentence: what you study
  traits: TraitWeights; // 0..3 how much the domain needs each trait
  admission: string; // general admission requirements in Romania, no numbers
  careers: string[]; // 3-5 typical jobs
};

/** How widely a university is known. "ivy" is only for the eight Ivy League universities. */
export type Prestige = "ivy" | "top" | "international" | "national";

/** Tuition level for a Romanian (EU) student, per year, in general terms:
 *  gratuit = no tuition or state-funded places; mic = low; mediu = medium; mare = high. */
export type Budget = "gratuit" | "mic" | "mediu" | "mare";

/** How admission to bachelor programmes usually works. */
export type AdmissionType = "examen" | "bac" | "dosar" | "interviu" | "aptitudini" | "test-standardizat";

/** Documents or certificates usually needed when applying. */
export type CertificateId = "bac" | "engleza" | "alta-limba" | "sat-act" | "portofoliu" | "motivatie" | "recomandari" | "medical";

export type University = {
  id: string;
  name: string;
  city: string;
  country: string; // in Romanian, e.g. "România", "Olanda"
  region: "ro" | "abroad";
  website: string;
  domainIds: string[];
  language?: string; // abroad only, general
  tuition?: string; // abroad only, general, no amounts
  // Profile sheet — indicative information, written in Romanian for a teenager, no exact amounts or grades.
  about: string; // 1-2 sentences: what the university is and is known for
  prestige: Prestige;
  budget: Budget;
  budgetNote: string; // one sentence explaining the cost for a Romanian student
  admissionTypes: AdmissionType[]; // at least one
  admission: string; // 1-2 sentences: how admission works in general
  scholarships: boolean; // scholarships or financial aid a Romanian student can realistically get
  scholarshipsNote: string;
  dorms: boolean; // student housing offered by the university
  dormsNote: string;
  certificates: CertificateId[];
  pros: string[]; // 2-3 short advantages
  cons: string[]; // 2-3 short disadvantages
  faculties?: Faculty[]; // optional: the real faculties with their bachelor programmes, from the official site
};

/** One faculty of a university with its bachelor (licență) study programmes, official names. */
export type Faculty = { name: string; programs: string[] };

/** A bachelor specialization inside a study domain, e.g. "Finanțe și bănci" inside "economie-finante". */
export type Specialization = {
  id: string;
  domainId: string;
  name: string;
  short: string; // 1-2 sentences: what you study and what it leads to
  traits: TraitWeights; // 0..3, used to rank specializations for a student
};

/** A group of study domains shown together on the home page, e.g. "Business și economie". */
export type Category = {
  id: string;
  name: string;
  emoji: string;
  short: string; // one sentence
  domainIds: string[];
};

/** An entry of the world list (name, country, website only), used for search. */
export type WorldUniversity = { n: string; c: string; w: string };

/** Filters for the "top 10" search; an absent field means "any". */
export type Filters = {
  country?: string; // exact `country` value
  region?: "ro" | "abroad";
  city?: string; // exact `city` value (Romanian cities from the questionnaire)
  domainId?: string;
  budget?: Budget; // this level or cheaper
  prestige?: Prestige; // "ivy" = Ivy only; "top" = ivy + top; "international" = ivy + top + international
  admissionType?: AdmissionType;
  scholarships?: boolean; // true = only with scholarships
  dorms?: boolean; // true = only with student housing
  withoutCertificate?: CertificateId; // exclude universities that need this certificate
};

export type ActivityKind = "concurs" | "voluntariat" | "extra";
export type ActivityLevel = "scoala" | "judet" | "national" | "international";

/** A competition, volunteering or extracurricular activity the student adds after the questions. */
export type Activity = {
  kind: ActivityKind;
  areaId: string; // id from ACTIVITY_AREAS in lib/activities.ts
  level?: ActivityLevel; // only meaningful for kind "concurs"
  name?: string; // optional free text, e.g. "Olimpiada de biologie"
};

export type Answers = {
  profileId: string;
  where: StudyPlace;
  city?: string; // Romanian city the student wants to study in; missing = any city
  choices: Record<string, number>; // question id -> index of the picked option
  activities?: Activity[];
};

export type Match = {
  domain: Domain;
  percent: number; // 0..100, integer
  reasons: string[]; // 2-3 short Romanian sentences: why it fits this student
  universitiesRo: University[]; // empty when where === "abroad"; only the chosen city when it has this domain
  cityMissing?: string; // the chosen city, when it has no university for this domain (universitiesRo then lists other cities)
  universitiesAbroad: University[]; // empty when where === "ro"
  specializations: Specialization[]; // up to 3 specializations of this domain that fit the student best, best first
};

/** A real opinion from a student or graduate, shown with their consent. */
export type Testimonial = {
  name: string; // exactly as the person agreed to be shown
  faculty: string; // faculty and university, as given by the team
  university?: string; // used to show people from the same university side by side; defaults to `faculty`
  universityId?: string; // set on opinions from the database when the university has a sheet in the app
  status?: string; // optional, e.g. "studentă în anul 3", "absolvent"
  photo?: string; // optional path under public/, shown with the person's consent
  text: string; // their own words; paragraphs separated by a blank line
};

/** One official curriculum used as the example for a study domain. */
export type Curriculum = {
  domainId: string;
  years: number; // length of the programme
  plan: { year: number; subjects: string[] }[]; // main subjects of each year, as named in the source
  source: { university: string; program: string; url: string; academicYear?: string }; // the official plan the subjects come from
};

/** The official page where a Romanian university publishes its curricula. */
export type CurriculumLink = {
  id: string; // university id
  url: string;
  kind: "plans" | "programs"; // "plans" = the curricula themselves; "programs" = the list of programmes that leads to them
};

/** An institution from an official or openly licensed national dataset (see scripts/data/CONTRACT.md). */
export type CatalogInstitution = {
  id: string; // same id as the university sheet when there is one
  country: string; // ISO code, e.g. "RO"
  source: string;
  name: string; // display name
  officialName: string; // as written in the source
  city: string;
  kind: "public" | "private" | "unknown";
  hasSheet: boolean; // true when the app has a full profile sheet for it
  website?: string;
  programs: number;
};

/** One bachelor-level study programme from the same datasets. Only the fields the source really has are present. */
export type CatalogProgram = {
  key: string; // unique and stable, starts with the country code
  country: string;
  institutionId: string;
  institutionName: string;
  city: string; // where the programme is taught
  faculty?: string;
  domain: string; // the source's own field-of-study label
  domainId: string | null; // one of the app's 40 study domains (our own mapping), or null when none clearly fits
  name: string; // in the source language
  language: string; // Romanian lower-case name, e.g. "engleză"
  form?: "full-time" | "part-time" | "distance" | "dual";
  credits?: number;
  years?: number;
  maxStudents?: number; // only when the source gives a capacity
  status?: string; // accreditation status in the source's words
  url?: string;
  source: string;
  search: string; // lower-case text without diacritics, for searching
};

/** Summary of one country's catalogue (apps/web/data/catalog/index.json, built by scripts/data/index.mjs). */
export type CatalogCountry = {
  cc: string;
  name: string; // Romanian country name
  institutions: number;
  programs: number;
  withDomain: number;
  cities: string[]; // the cities with most programmes first
  sheetIds: string[]; // institutions that have a profile sheet in the app
  domains: Record<string, number>; // programmes per app domain
  source: { name: string; url: string; licence: string; attribution: string; year: string; note: string };
};
