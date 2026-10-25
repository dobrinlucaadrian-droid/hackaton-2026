// Tests the search-engine helpers: descriptions are trimmed at a word, and the sitemap lists every public sheet once, on the official address, never a personal page.
import { describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { guides } from "./guides";
import { clip, SITE_URL } from "./seo";
import { universities } from "./sheets";

describe("clip", () => {
  it("keeps short texts and cuts long ones at a word", () => {
    expect(clip("Scurt.")).toBe("Scurt.");
    const out = clip("cuvânt ".repeat(60));
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("cuvânt…")).toBe(true);
  });
});

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("lists every university sheet and country guide, once, on findmyuni.ro", () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((u) => u.startsWith(SITE_URL))).toBe(true);
    for (const u of universities) expect(urls).toContain(`${SITE_URL}/universitati/${u.id}`);
    for (const g of guides) expect(urls).toContain(`${SITE_URL}/ghiduri/${g.id}`);
  });

  it("pairs the English address with the Romanian one, but never for the Romanian country guides", () => {
    expect(urls).toContain(`${SITE_URL}/en`);
    expect(urls).toContain(`${SITE_URL}/en/universitati`);
    for (const g of guides) expect(urls).not.toContain(`${SITE_URL}/en/ghiduri/${g.id}`);
    const home = sitemap().find((e) => e.url === SITE_URL);
    expect(home?.alternates?.languages).toEqual({ ro: SITE_URL, en: `${SITE_URL}/en` });
  });

  it("never lists personal pages", () => {
    expect(urls.some((u) => /\/(cont|admin|conectare|rezultat|quiz)(\/|$)/.test(u))).toBe(false);
  });
});

describe("robots", () => {
  it("blocks everything outside the live site", () => {
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });
});
