// The list of every public page for search engines (/sitemap.xml): the main pages, every university and faculty sheet, every country guide and study category, with the English address (/en/...) next to the Romanian one wherever the page exists in English.
import type { MetadataRoute } from "next";
import { categories } from "../lib/data";
import { faculties, facultyHref } from "../lib/faculties";
import { guides } from "../lib/guides";
import { hasEnglishSheet } from "../lib/i18n-sheets";
import { SITE_URL } from "../lib/seo";
import { universities } from "../lib/sheets";

const MAIN = ["/", "/specializari", "/universitati", "/programe", "/ghiduri", "/test", "/studenti", "/studenti/parere", "/surse", "/confidentialitate"];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
  const en = (path: string) => `${SITE_URL}/en${path === "/" ? "" : path}`;
  // A Romanian page, and its English twin when there is one: both entries name each other (hreflang), so search engines show the right language.
  const page = (path: string, priority: number, english = true): MetadataRoute.Sitemap => {
    if (!english) return [{ url: url(path), priority }];
    const alternates = { languages: { ro: url(path), en: en(path) } };
    return [
      { url: url(path), priority, alternates },
      { url: en(path), priority, alternates },
    ];
  };
  return [
    ...MAIN.flatMap((p) => page(p, p === "/" ? 1 : 0.8)),
    ...categories.flatMap((c) => page(`/specializari/${c.id}`, 0.6)),
    // the country guides are for Romanian students only; English has one guide, at /en/ghiduri
    ...guides.flatMap((g) => page(`/ghiduri/${g.id}`, 0.7, false)),
    ...universities.flatMap((u) => page(`/universitati/${u.id}`, 0.6, hasEnglishSheet(u.id))),
    ...faculties.flatMap((f) => page(facultyHref(f), 0.5)),
  ];
}
