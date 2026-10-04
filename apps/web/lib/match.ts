// Rule-based matching: turns a student's answers into the top 3 study domains (cosine similarity on 10 traits).
import { domains, profiles, questions, universities } from "./data";
import type { Answers, Match, Profile, StudyPlace, TraitId, TraitWeights } from "./types";

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

const PROFILE_SHARE = 0.25; // how much of the student vector comes from the high-school profile

const TRAIT_REASON: Record<TraitId, string> = {
  logic: "Îți plac cifrele și problemele de logică, iar aici le folosești zilnic.",
  tehnic: "Îți place să construiești și să faci lucrurile să funcționeze, iar aici ai de lucru practic.",
  stiinte: "Te atrage știința și vrei să afli cum funcționează lumea, exact ce faci aici.",
  ingrijire: "Vrei să ai grijă de oameni sau de animale, iar domeniul ăsta e despre asta.",
  oameni: "Te simți bine printre oameni, iar aici lucrezi mult cu ei.",
  limbaj: "Ai talent la cuvinte, iar aici scrisul și vorbitul contează mult.",
  creativ: "Ești creativ și ai idei originale, iar aici ai loc să le arăți.",
  business: "Te gândești la bani, organizare și afaceri, iar aici înveți exact asta.",
  societate: "Te interesează cum funcționează societatea, legile și istoria, iar aici le studiezi.",
  miscare: "Îți place mișcarea și munca în aer liber, iar aici nu stai mereu pe scaun.",
};

type Vec = Record<TraitId, number>;

function emptyVec(): Vec {
  return Object.fromEntries(TRAITS.map((t) => [t, 0])) as Vec;
}

function addWeights(vec: Vec, w: TraitWeights | undefined) {
  if (!w) return;
  for (const t of TRAITS) {
    const v = w[t];
    if (typeof v === "number" && Number.isFinite(v)) vec[t] += v;
  }
}

function norm(v: Vec): number {
  return Math.sqrt(TRAITS.reduce((s, t) => s + v[t] * v[t], 0));
}

function unit(v: Vec): Vec {
  const n = norm(v);
  const out = emptyVec();
  if (n > 0) for (const t of TRAITS) out[t] = v[t] / n;
  return out;
}

function toVec(w: TraitWeights): Vec {
  const v = emptyVec();
  addWeights(v, w);
  return v;
}

function cosine(a: Vec, b: Vec): number {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return TRAITS.reduce((s, t) => s + a[t] * b[t], 0) / (na * nb);
}

/** Student vector (profile + picked options) and the vector of picked options alone. */
function vectors(answers: Answers): { student: Vec; picks: Vec; profile: Profile | undefined } {
  const profile = profiles.find((p) => p.id === answers?.profileId);
  const picks = emptyVec();
  for (const q of questions) {
    const idx = answers?.choices?.[q.id];
    if (typeof idx === "number") addWeights(picks, q.options[idx]?.traits);
  }
  const profileVec = profile ? unit(toVec(profile.traits)) : emptyVec();
  const pickVec = unit(picks);
  const share = profile ? PROFILE_SHARE : 0;
  const student = emptyVec();
  for (const t of TRAITS) student[t] = share * profileVec[t] + (1 - share) * pickVec[t];
  return { student, picks: pickVec, profile };
}

/** Ranks all domains against a student vector and builds the top 3 matches. */
function rank(student: Vec, liked: Vec, profile: Profile | undefined, where: StudyPlace | undefined): Match[] {
  const scored = domains
    .map((domain) => {
      const dv = toVec(domain.traits);
      const sim = cosine(student, dv);
      return { domain, dv, sim };
    })
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3);

  let prev = Infinity;
  return scored.map(({ domain, dv, sim }) => {
    let percent = Math.round(100 * Math.pow(Math.max(sim, 0), 0.8));
    percent = Math.min(97, Math.max(0, percent));
    if (percent >= prev) percent = Math.max(0, prev - 1); // avoid identical percents unless truly stuck at 0
    prev = percent;

    const ranked = TRAITS.filter((t) => dv[t] > 0 && liked[t] > 0)
      .sort((a, b) => dv[b] * (student[b] + 0.001) - dv[a] * (student[a] + 0.001))
      .slice(0, 2);
    const reasons = ranked.map((t) => TRAIT_REASON[t]);
    if (profile) {
      const shared = TRAITS.some((t) => (profile.traits[t] ?? 0) >= 2 && dv[t] >= 2);
      if (shared) reasons.push(`Profilul tău de liceu (${profile.name}) te pregătește bine pentru acest domeniu.`);
    }
    if (reasons.length < 2) reasons.push("Domeniul se potrivește cu ce ai ales în test.");

    const offered = universities.filter((u) => u.domainIds.includes(domain.id));
    const ro = offered.filter((u) => u.region === "ro").sort((a, b) => a.city.localeCompare(b.city, "ro") || a.name.localeCompare(b.name, "ro"));
    const abroad = offered.filter((u) => u.region === "abroad");
    return {
      domain,
      percent,
      reasons: reasons.slice(0, 3),
      universitiesRo: where === "abroad" ? [] : ro,
      universitiesAbroad: where === "ro" ? [] : abroad,
    };
  });
}

export function matchDomains(answers: Answers): Match[] {
  const { student, picks, profile } = vectors(answers);
  return rank(student, picks, profile, answers?.where);
}

/** The student's inclinations from profile + answers, each an integer 0..100 (strongest = 100; all 0 when there are no answers). */
export function studentTraits(answers: Answers): Record<TraitId, number> {
  const { student } = vectors(answers);
  const max = Math.max(...TRAITS.map((t) => student[t]));
  const out = emptyVec();
  if (max > 0) for (const t of TRAITS) out[t] = Math.round((100 * student[t]) / max);
  return out;
}

/** Top 3 matches for an arbitrary trait vector (values 0..100), e.g. from the "what if" sliders. */
export function matchByTraits(traits: Record<TraitId, number>, where: StudyPlace, profileId?: string): Match[] {
  const vec = emptyVec();
  for (const t of TRAITS) {
    const v = Number(traits?.[t]);
    vec[t] = Number.isFinite(v) && v > 0 ? v : 0;
  }
  const profile = profiles.find((p) => p.id === profileId);
  return rank(vec, vec, profile, where);
}
