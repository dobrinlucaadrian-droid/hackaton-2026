// Tests the curricula data: every plan belongs to a real domain, covers its years in order and links to an official web page.
import { describe, expect, it } from "vitest";
import { curricula, curriculumFor, curriculumLinkFor, curriculumLinks } from "./curricula";
import { domains, universities } from "./data";

const isWebLink = (url: string) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(url);

describe("domain curricula", () => {
  it("each belongs to a real domain, once", () => {
    const ids = curricula.map((c) => c.domainId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(domains.some((d) => d.id === id), id).toBe(true);
  });

  it("each covers its years in order, with 2-7 subjects a year", () => {
    for (const c of curricula) {
      expect(c.plan.length, c.domainId).toBeGreaterThanOrEqual(2);
      expect(c.plan.length, c.domainId).toBeLessThanOrEqual(6);
      c.plan.forEach((y, i) => {
        expect(y.year, c.domainId).toBe(i + 1);
        expect(y.subjects.length, c.domainId).toBeGreaterThanOrEqual(2);
        expect(y.subjects.length, c.domainId).toBeLessThanOrEqual(7);
        for (const s of y.subjects) expect(s.trim().length, c.domainId).toBeGreaterThan(2);
      });
    }
  });

  it("each names its source and links to it", () => {
    for (const c of curricula) {
      expect(c.source.university.length, c.domainId).toBeGreaterThan(3);
      expect(c.source.program.length, c.domainId).toBeGreaterThan(2);
      expect(isWebLink(c.source.url), c.source.url).toBe(true);
    }
  });

  it("covers most of the 40 domains", () => {
    expect(curricula.length).toBeGreaterThanOrEqual(30);
    expect(curriculumFor("nu-exista")).toBeUndefined();
  });
});

describe("university curriculum links", () => {
  it("each belongs to a Romanian university, once, and is a web link", () => {
    const ids = curriculumLinks.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of curriculumLinks) {
      const u = universities.find((x) => x.id === l.id);
      expect(u?.region, l.id).toBe("ro");
      expect(isWebLink(l.url), l.url).toBe(true);
      expect(["plans", "programs"]).toContain(l.kind);
    }
  });

  it("covers most Romanian universities", () => {
    const ro = universities.filter((u) => u.region === "ro").length;
    expect(curriculumLinks.length).toBeGreaterThanOrEqual(Math.floor(ro * 0.6));
    expect(curriculumLinkFor("nu-exista")).toBeUndefined();
  });
});
