// Activities a student can add (competitions, volunteering, extracurriculars): labels (Romanian and English), areas and how much each one weighs in the matching.
import type { Lang } from "./i18n";
import type { Activity, ActivityKind, ActivityLevel, TraitWeights } from "./types";

export const MAX_ACTIVITIES = 5;

export const ACTIVITY_KINDS: { id: ActivityKind; label: string; en: string; emoji: string }[] = [
  { id: "concurs", label: "Concurs sau olimpiadă", en: "Competition or olympiad", emoji: "🏆" },
  { id: "voluntariat", label: "Voluntariat", en: "Volunteering", emoji: "🤝" },
  { id: "extra", label: "Activitate extra (club, sport, artă)", en: "Extra activity (club, sport, art)", emoji: "⭐" },
];

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; en: string }[] = [
  { id: "scoala", label: "Pe școală", en: "School level" },
  { id: "judet", label: "Județean", en: "County level" },
  { id: "national", label: "Național", en: "National" },
  { id: "international", label: "Internațional", en: "International" },
];

export const ACTIVITY_AREAS: { id: string; label: string; en: string; emoji: string; traits: TraitWeights }[] = [
  { id: "mate-info", label: "Matematică și informatică", en: "Mathematics and computer science", emoji: "➗", traits: { logic: 3, tehnic: 1 } },
  { id: "stiinte", label: "Științe (biologie, chimie, fizică)", en: "Sciences (biology, chemistry, physics)", emoji: "🔬", traits: { stiinte: 3, logic: 1 } },
  { id: "limbi-literatura", label: "Limbi și literatură", en: "Languages and literature", emoji: "📖", traits: { limbaj: 3, creativ: 1 } },
  { id: "istorie-societate", label: "Istorie, societate, dezbateri", en: "History, society, debating", emoji: "🏛️", traits: { societate: 3, limbaj: 1 } },
  { id: "arte", label: "Arte (desen, muzică, teatru)", en: "Arts (drawing, music, theatre)", emoji: "🎨", traits: { creativ: 3 } },
  { id: "sport", label: "Sport", en: "Sport", emoji: "⚽", traits: { miscare: 3 } },
  { id: "afaceri", label: "Afaceri și antreprenoriat", en: "Business and entrepreneurship", emoji: "💼", traits: { business: 3, oameni: 1 } },
  { id: "sanatate-oameni", label: "Sănătate și ajutorarea oamenilor", en: "Health and helping people", emoji: "❤️", traits: { ingrijire: 3, oameni: 1 } },
  { id: "tehnic-robotica", label: "Tehnic și robotică", en: "Technology and robotics", emoji: "🤖", traits: { tehnic: 3, logic: 1 } },
];

// A competition weighs more the higher its level; all five activities together stay close to 3-4 quiz answers.
const LEVEL_WEIGHT: Record<ActivityLevel, number> = { scoala: 0.5, judet: 0.75, national: 1, international: 1.25 };
const KIND_WEIGHT: Record<ActivityKind, number> = { concurs: 1, voluntariat: 0.6, extra: 0.6 };
const VOLUNTEER_BONUS: TraitWeights = { oameni: 1, ingrijire: 1 };
const LEVEL_TEXT: Record<ActivityLevel, string> = {
  scoala: "nivel școală",
  judet: "nivel județean",
  national: "nivel național",
  international: "nivel internațional",
};

export function activityArea(a: Activity) {
  return ACTIVITY_AREAS.find((x) => x.id === a?.areaId);
}

/** Trait points one activity adds to the student's vector (empty for an unknown area or kind). */
export function activityTraits(a: Activity): TraitWeights {
  const area = activityArea(a);
  const kind = KIND_WEIGHT[a?.kind];
  if (!area || !kind) return {};
  const level = a.kind === "concurs" ? (LEVEL_WEIGHT[a.level ?? "scoala"] ?? LEVEL_WEIGHT.scoala) : 1;
  const out: TraitWeights = {};
  for (const [t, v] of Object.entries(area.traits)) out[t as keyof TraitWeights] = (v ?? 0) * kind * level;
  if (a.kind === "voluntariat") {
    for (const [t, v] of Object.entries(VOLUNTEER_BONUS)) {
      const k = t as keyof TraitWeights;
      out[k] = (out[k] ?? 0) + (v ?? 0) * kind;
    }
  }
  return out;
}

/** A label in the page language (Romanian when lang is omitted). */
export function labelOf(item: { label: string; en: string }, lang: Lang = "ro"): string {
  return lang === "en" ? item.en : item.label;
}

const LEVEL_TEXT_EN: Record<ActivityLevel, string> = {
  scoala: "school level",
  judet: "county level",
  national: "national level",
  international: "international level",
};

/** One line describing an activity in the page language, e.g. "Olimpiada de biologie — concurs, Științe (biologie, chimie, fizică), nivel național". */
export function describeActivity(a: Activity, lang: Lang = "ro"): string {
  const area = activityArea(a);
  const en = lang === "en";
  const parts = [
    a.kind === "concurs" ? (en ? "competition" : "concurs") : a.kind === "voluntariat" ? (en ? "volunteering" : "voluntariat") : en ? "extra activity" : "activitate extra",
  ];
  if (area) parts.push(labelOf(area, lang));
  if (a.kind === "concurs" && a.level && LEVEL_TEXT[a.level]) parts.push(en ? LEVEL_TEXT_EN[a.level] : LEVEL_TEXT[a.level]);
  const text = parts.join(", ");
  const name = a.name?.trim();
  return name ? `${name} — ${text}` : text.charAt(0).toUpperCase() + text.slice(1);
}
