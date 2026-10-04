// Tests that competitions, volunteering and extracurriculars are weighed and used by the matching.
import { describe, expect, it } from "vitest";
import { ACTIVITY_AREAS, MAX_ACTIVITIES, activityTraits, describeActivity } from "./activities";
import { questions } from "./data";
import { matchDomains, studentTraits, TRAITS } from "./match";
import type { Answers } from "./types";

const base: Answers = {
  profileId: "uman-filologie",
  where: "any",
  choices: Object.fromEntries(questions.map((q) => [q.id, 0])),
};

describe("activities in the matching", () => {
  it("every activity area uses valid traits", () => {
    for (const a of ACTIVITY_AREAS) for (const t of Object.keys(a.traits)) expect(TRAITS).toContain(t);
  });

  it("a higher competition level weighs more", () => {
    const school = activityTraits({ kind: "concurs", areaId: "stiinte", level: "scoala" });
    const national = activityTraits({ kind: "concurs", areaId: "stiinte", level: "national" });
    expect(national.stiinte!).toBeGreaterThan(school.stiinte!);
  });

  it("science activities raise the science inclination", () => {
    const acts = Array.from({ length: 5 }, () => ({ kind: "concurs" as const, areaId: "stiinte", level: "international" as const }));
    expect(studentTraits({ ...base, activities: acts }).stiinte).toBeGreaterThan(studentTraits(base).stiinte);
    expect(matchDomains({ ...base, activities: acts })).toHaveLength(3);
  });

  it("a matching activity is mentioned in the reasons", () => {
    const res = matchDomains({
      profileId: "real-stiinte-naturii",
      where: "any",
      choices: {},
      activities: [{ kind: "concurs", areaId: "stiinte", level: "national", name: "Olimpiada de biologie" }],
    });
    expect(res.some((m) => m.reasons.some((r) => r.includes("Olimpiada de biologie")))).toBe(true);
    for (const m of res) expect(m.reasons.length).toBeLessThanOrEqual(3);
  });

  it("invalid activities are ignored and the list is capped", () => {
    const junk = [{ kind: "concurs", areaId: "nu-exista" }, null, { kind: "altceva", areaId: "sport" }] as unknown as Answers["activities"];
    expect(matchDomains({ ...base, activities: junk }).map((m) => m.domain.id)).toEqual(matchDomains(base).map((m) => m.domain.id));
    const many = Array.from({ length: 50 }, () => ({ kind: "extra" as const, areaId: "sport" }));
    const capped = many.slice(0, MAX_ACTIVITIES);
    expect(studentTraits({ ...base, activities: many })).toEqual(studentTraits({ ...base, activities: capped }));
  });

  it("describeActivity writes a readable line", () => {
    expect(describeActivity({ kind: "concurs", areaId: "stiinte", level: "national", name: "Olimpiada de biologie" })).toBe(
      "Olimpiada de biologie — concurs, Științe (biologie, chimie, fizică), nivel național",
    );
    expect(describeActivity({ kind: "voluntariat", areaId: "sanatate-oameni" })).toBe("Voluntariat, Sănătate și ajutorarea oamenilor");
  });
});
