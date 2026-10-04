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
};

export type Answers = {
  profileId: string;
  where: StudyPlace;
  choices: Record<string, number>; // question id -> index of the picked option
};

export type Match = {
  domain: Domain;
  percent: number; // 0..100, integer
  reasons: string[]; // 2-3 short Romanian sentences: why it fits this student
  universitiesRo: University[]; // empty when where === "abroad"
  universitiesAbroad: University[]; // empty when where === "ro"
};

/** A real opinion from a student or graduate, shown with their consent. */
export type Testimonial = {
  name: string; // exactly as the person agreed to be shown
  faculty: string; // faculty and university, as given by the team
  status: string; // e.g. "studentă în anul 3", "absolvent"
  text: string; // their own words
};
