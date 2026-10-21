// The list of every public page for search engines (/sitemap.xml): the main pages, every university and faculty sheet, every country guide and study category.
import type { MetadataRoute } from "next";
import { categories } from "../lib/data";
import { faculties, facultyHref } from "../lib/faculties";
import { guides } from "../lib/guides";
import { SITE_URL } from "../lib/seo";
import { universities } from "../lib/sheets";

const MAIN = ["/", "/specializari", "/universitati", "/programe", "/ghiduri", "/test", "/studenti", "/studenti/parere", "/surse", "/confidentialitate"];

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${path === "/" ? "" : path}`, priority });
  return [
    ...MAIN.map((p) => page(p, p === "/" ? 1 : 0.8)),
    ...categories.map((c) => page(`/specializari/${c.id}`, 0.6)),
    ...guides.map((g) => page(`/ghiduri/${g.id}`, 0.7)),
    ...universities.map((u) => page(`/universitati/${u.id}`, 0.6)),
    ...faculties.map((f) => page(facultyHref(f), 0.5)),
  ];
}
