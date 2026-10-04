// Tests the seeded data (domains, profiles, questions) and the rule-based matching.
import { describe, expect, it } from "vitest";
import { domains, profiles, questions } from "./data";
import { matchDomains } from "./match";
import type { Answers, StudyPlace } from "./types";

const TRAIT_IDS = ["logic", "tehnic", "stiinte", "ingrijire", "oameni", "limbaj", "creativ", "business", "societate", "miscare"];
const DOMAIN_IDS = [
  "medicina", "medicina-dentara", "farmacie", "medicina-veterinara", "asistenta-medicala", "informatica", "calculatoare-it",
  "inginerie-electrica-electronica", "inginerie-mecanica", "inginerie-civila", "arhitectura", "inginerie-chimica-materiale",
  "energie-petrol-mediu", "matematica", "fizica", "chimie", "biologie", "geografie-mediu", "agronomie-silvicultura",
  "economie-finante", "business-management", "marketing", "drept", "stiinte-politice-relatii-internationale",
  "administratie-publica", "comunicare-jurnalism", "psihologie", "sociologie-asistenta-sociala", "stiintele-educatiei",
  "litere-limbi-straine", "istorie", "filosofie", "teologie", "arte-vizuale-design", "muzica", "teatru-film",
  "sport-kinetoterapie", "militar-politie", "marina-transporturi", "turism-servicii",
];

// Pick, for each question, the option with the highest total weight on the wanted traits.
function answersFor(profileId: string, wanted: string[], where: StudyPlace = "any"): Answers {
  const choices: Record<string, number> = {};
  for (const q of questions) {
    let best = 0;
    let bestScore = -1;
    q.options.forEach((o, i) => {
      const s = wanted.reduce((sum, t) => sum + ((o.traits as Record<string, number>)[t] ?? 0), 0);
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    });
    choices[q.id] = best;
  }
  return { profileId, where, choices };
}

describe("seeded data", () => {
  it("has all 40 domain ids, unique", () => {
    const ids = domains.map((d) => d.id);
    expect(ids.length).toBe(40);
    expect(new Set(ids).size).toBe(40);
    expect([...ids].sort()).toEqual([...DOMAIN_IDS].sort());
  });

  it("uses only valid trait keys with weights 0..3", () => {
    const all = [
      ...domains.map((d) => d.traits),
      ...profiles.map((p) => p.traits),
      ...questions.flatMap((q) => q.options.map((o) => o.traits)),
    ];
    for (const w of all) {
      for (const [k, v] of Object.entries(w)) {
        expect(TRAIT_IDS).toContain(k);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(3);
      }
    }
  });

  it("domains have admission ending in the standard phrase and 3-5 careers", () => {
    for (const d of domains) {
      expect(d.admission.endsWith("Verifică pe site-ul facultății.")).toBe(true);
      expect(d.careers.length).toBeGreaterThanOrEqual(3);
      expect(d.careers.length).toBeLessThanOrEqual(5);
    }
  });

  it("has 10-12 questions with 3-5 options each and unique ids", () => {
    expect(questions.length).toBeGreaterThanOrEqual(10);
    expect(questions.length).toBeLessThanOrEqual(12);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(5);
    }
  });

  it("covers every trait in the questions", () => {
    for (const t of TRAIT_IDS) {
      const used = questions.some((q) => q.options.some((o) => (o.traits as Record<string, number>)[t] > 0));
      expect(used).toBe(true);
    }
  });
});

describe("matchDomains", () => {
  it("returns exactly 3 matches sorted by percent, in 0..100", () => {
    const m = matchDomains(answersFor("real-mate-info", ["logic", "tehnic"]));
    expect(m.length).toBe(3);
    for (let i = 0; i < 3; i++) {
      expect(Number.isInteger(m[i].percent)).toBe(true);
      expect(m[i].percent).toBeGreaterThanOrEqual(0);
      expect(m[i].percent).toBeLessThanOrEqual(100);
      expect(m[i].reasons.length).toBeGreaterThanOrEqual(2);
      expect(m[i].reasons.length).toBeLessThanOrEqual(3);
      if (i > 0) expect(m[i - 1].percent).toBeGreaterThanOrEqual(m[i].percent);
    }
  });

  it("filters universities by where", () => {
    const base = answersFor("real-mate-info", ["logic", "tehnic"]);
    for (const m of matchDomains({ ...base, where: "ro" })) {
      expect(m.universitiesAbroad).toEqual([]);
      expect(m.universitiesRo.every((u) => u.region === "ro")).toBe(true);
    }
    for (const m of matchDomains({ ...base, where: "abroad" })) {
      expect(m.universitiesRo).toEqual([]);
      expect(m.universitiesAbroad.every((u) => u.region === "abroad")).toBe(true);
    }
    for (const m of matchDomains({ ...base, where: "any" })) {
      expect(m.universitiesRo.every((u) => u.region === "ro")).toBe(true);
      expect(m.universitiesAbroad.every((u) => u.region === "abroad")).toBe(true);
    }
  });

  it("ranks a tech domain first for a maths/tech student", () => {
    const top = matchDomains(answersFor("real-mate-info", ["logic", "tehnic"]))[0].domain.id;
    expect(["informatica", "calculatoare-it", "matematica", "inginerie-electrica-electronica", "inginerie-mecanica", "inginerie-civila"]).toContain(top);
  });

  it("ranks a health domain first for a biology/caring student", () => {
    const top = matchDomains(answersFor("real-stiinte-naturii", ["stiinte", "ingrijire"]))[0].domain.id;
    expect(["medicina", "medicina-dentara", "farmacie", "medicina-veterinara", "asistenta-medicala"]).toContain(top);
  });

  it("ranks a humanities/social domain first for a language/people student", () => {
    const top = matchDomains(answersFor("uman-filologie", ["limbaj", "oameni", "societate"]))[0].domain.id;
    expect([
      "litere-limbi-straine", "comunicare-jurnalism", "drept", "istorie", "filosofie", "psihologie", "sociologie-asistenta-sociala",
      "stiintele-educatiei", "stiinte-politice-relatii-internationale", "administratie-publica", "teologie",
    ]).toContain(top);
  });

  it("ranks an arts domain first for an arts student", () => {
    const top = matchDomains(answersFor("voc-artistic", ["creativ"]))[0].domain.id;
    expect(["arte-vizuale-design", "muzica", "teatru-film", "arhitectura"]).toContain(top);
  });

  it("does not throw on unknown profile or missing answers", () => {
    expect(() => matchDomains({ profileId: "nu-exista", where: "any", choices: {} })).not.toThrow();
    expect(matchDomains({ profileId: "nu-exista", where: "any", choices: { x: 99 } }).length).toBe(3);
    expect(matchDomains({ profileId: "", where: "ro", choices: {} }).length).toBe(3);
  });
});
