// Tests the country guides: complete texts, a country that has university sheets, official links, and no amounts or calendar dates (they change every year).
import { describe, expect, it } from "vitest";
import { guideById, guideForCountry, guides } from "./guides";
import { universities } from "./universities";

const AMOUNT = /\d+\s*(lei|euro|eur|ron|kr|dkk|gbp|usd|chf)\b|[€£$]\s?\d|\d\s?[€£$]/i;
const DATE = /\b\d{1,2}\s+(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\b|\b20\d\d\b/i;

describe("country guides", () => {
  it("there is a guide for each of the six countries, each with its own address", () => {
    expect(guides.map((g) => g.country).sort()).toEqual(["Danemarca", "Franța", "Germania", "Italia", "Marea Britanie", "Olanda"]);
    expect(new Set(guides.map((g) => g.id)).size).toBe(guides.length);
    for (const g of guides) {
      expect(g.id).toMatch(/^[a-z][a-z-]*$/);
      expect(guideById(g.id)).toBe(g);
      expect(guideForCountry(g.country)).toBe(g);
      expect(universities.some((u) => u.country === g.country), g.country).toBe(true);
    }
    expect(guideById("nu-exista")).toBeUndefined();
    expect(guideForCountry("România")).toBeUndefined();
  });

  it("every guide has all its parts, within the length a page can show", () => {
    for (const g of guides) {
      for (const t of [g.title, g.intro, g.language, g.costs, g.funding, g.housing]) {
        expect(t.trim().length, g.id).toBeGreaterThan(20);
        expect(t.length, g.id).toBeLessThanOrEqual(700);
      }
      expect(g.steps.length, g.id).toBeGreaterThanOrEqual(4);
      expect(g.steps.length, g.id).toBeLessThanOrEqual(8);
      for (const s of g.steps) {
        expect(s.title.trim().length, g.id).toBeGreaterThan(3);
        expect(s.text.trim().length, g.id).toBeGreaterThan(20);
        expect(s.text.length, g.id).toBeLessThanOrEqual(700);
      }
      expect(new Set(g.steps.map((s) => s.title)).size, g.id).toBe(g.steps.length);
      expect(g.documents.length, g.id).toBeGreaterThanOrEqual(3);
      expect(g.goodToKnow.length, g.id).toBeGreaterThanOrEqual(3);
      expect(g.links.length, g.id).toBeGreaterThanOrEqual(3);
      expect(new Set(g.links.map((l) => l.url)).size, g.id).toBe(g.links.length);
      for (const l of g.links) {
        expect(l.label.trim().length, g.id).toBeGreaterThan(3);
        expect(l.url, g.id).toMatch(/^https:\/\/[^\s]+$/);
      }
      expect(g.sources.length, g.id).toBeGreaterThanOrEqual(3);
      for (const s of g.sources) expect(s, g.id).toMatch(/^https:\/\/[^\s]+$/);
    }
  });

  it("no guide gives amounts or calendar dates", () => {
    for (const g of guides) {
      const texts = [g.intro, g.language, g.costs, g.funding, g.housing, ...g.documents, ...g.goodToKnow, ...g.steps.flatMap((s) => [s.title, s.text])];
      for (const t of texts) {
        expect(t, `${g.id}: ${t.slice(0, 60)}`).not.toMatch(AMOUNT);
        expect(t, `${g.id}: ${t.slice(0, 60)}`).not.toMatch(DATE);
      }
    }
  });
});
