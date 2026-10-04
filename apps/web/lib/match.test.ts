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

  // The team chose 18 scenario questions on 2026-10-05 (was 10-12): at least 3-4 items per trait are needed for a usable short scale.
  it("has 16-20 questions with 4-5 options each and unique ids", () => {
    expect(questions.length).toBeGreaterThanOrEqual(16);
    expect(questions.length).toBeLessThanOrEqual(20);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      expect(q.options.length).toBeLessThanOrEqual(5);
      expect(q.text.trim().length).toBeGreaterThan(0);
      for (const o of q.options) expect(o.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("every trait is the main trait of at least 6 options, so no inclination depends on one or two questions", () => {
    const main: Record<string, number> = Object.fromEntries(TRAIT_IDS.map((t) => [t, 0]));
    for (const q of questions) for (const o of q.options) for (const [t, v] of Object.entries(o.traits)) if (v === 3) main[t]++;
    for (const t of TRAIT_IDS) expect(main[t], t).toBeGreaterThanOrEqual(6);
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

describe("what-if matching by traits", async () => {
  const { TRAITS, TRAIT_LABEL, matchByTraits, studentTraits } = await import("./match");
  const answers: Answers = {
    profileId: "real-mate-info",
    where: "any",
    choices: Object.fromEntries(questions.map((q) => [q.id, 0])),
  };

  it("has a label for every trait", () => {
    expect([...TRAITS].sort()).toEqual([...TRAIT_IDS].sort());
    for (const t of TRAITS) expect(TRAIT_LABEL[t].length).toBeGreaterThan(0);
  });

  it("studentTraits returns integers 0..100 with the strongest at 100", () => {
    const traits = studentTraits(answers);
    const values = TRAITS.map((t) => traits[t]);
    for (const v of values) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(Math.max(...values)).toBe(100);
  });

  it("studentTraits is all zeros with no answers and an unknown profile", () => {
    const traits = studentTraits({ profileId: "nope", where: "any", choices: {} });
    expect(TRAITS.every((t) => traits[t] === 0)).toBe(true);
  });

  it("matchByTraits on the student's own traits gives the same top domain as matchDomains", () => {
    const own = matchByTraits(studentTraits(answers), "any", answers.profileId);
    expect(own).toHaveLength(3);
    expect(own[0].domain.id).toBe(matchDomains(answers)[0].domain.id);
  });

  it("pure creativity ranks an arts domain first and respects where", () => {
    const zero = Object.fromEntries(TRAITS.map((t) => [t, 0])) as Record<(typeof TRAITS)[number], number>;
    const res = matchByTraits({ ...zero, creativ: 100 }, "ro");
    expect(["arte-vizuale-design", "muzica", "teatru-film", "arhitectura"]).toContain(res[0].domain.id);
    expect(res.every((m) => m.universitiesAbroad.length === 0)).toBe(true);
  });

  it("all-zero traits do not throw and give 3 matches without NaN", () => {
    const zero = Object.fromEntries(TRAITS.map((t) => [t, 0])) as Record<(typeof TRAITS)[number], number>;
    const res = matchByTraits(zero, "any");
    expect(res).toHaveLength(3);
    for (const m of res) expect(Number.isNaN(m.percent)).toBe(false);
  });
});

describe("chosen city", async () => {
  const { romanianCities } = await import("./universities");
  const base = answersFor("real-mate-info", ["logic", "tehnic"]);

  it("lists only Romanian universities from the chosen city", () => {
    const res = matchDomains({ ...base, where: "ro", city: "București" });
    expect(res.some((m) => m.universitiesRo.length > 0 && !m.cityMissing)).toBe(true);
    for (const m of res) {
      if (m.cityMissing) continue;
      expect(m.universitiesRo.length).toBeGreaterThan(0);
      expect(m.universitiesRo.every((u) => u.city === "București")).toBe(true);
    }
  });

  it("falls back to other cities, and says so, when the city has no university for the domain", () => {
    for (const city of romanianCities()) {
      for (const m of matchDomains({ ...base, where: "any", city })) {
        if (m.cityMissing) {
          expect(m.cityMissing).toBe(city);
          expect(m.universitiesRo.every((u) => u.city !== city)).toBe(true);
        } else {
          expect(m.universitiesRo.every((u) => u.city === city)).toBe(true);
        }
      }
    }
  });

  it("does not change the domains or the universities abroad", () => {
    const plain = matchDomains({ ...base, where: "any" });
    const withCity = matchDomains({ ...base, where: "any", city: "Alba Iulia" });
    expect(withCity.map((m) => m.domain.id)).toEqual(plain.map((m) => m.domain.id));
    expect(withCity.map((m) => m.universitiesAbroad.length)).toEqual(plain.map((m) => m.universitiesAbroad.length));
  });

  it("offers every Romanian city that has a university, Bucharest first", () => {
    const list = romanianCities();
    expect(list[0]).toBe("București");
    expect(list).toContain("Alba Iulia");
    expect(new Set(list).size).toBe(list.length);
  });
});
