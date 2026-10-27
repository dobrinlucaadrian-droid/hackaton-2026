// Search and filter over the universities with a profile sheet (names also searchable in English). Works on the index (sheets without their long texts), which is what the browser loads.
import indexJson from "../data/universities-index.json";
import { domains } from "./data";
import type { Lang } from "./i18n";
import { cityName, countryName, universityName } from "./i18n-data";
import { normalize, specializationsFor } from "./labels";
import type { Budget, Filters, Prestige, UniversitySummary } from "./types";

/** Every university that has a sheet, without the long texts of the sheet. */
export const universities = indexJson as UniversitySummary[];

const PRESTIGE_ORDER: Prestige[] = ["ivy", "top", "international", "national"];
const BUDGET_ORDER: Budget[] = ["gratuit", "mic", "mediu", "mare"];

/** Countries that have at least one university, Romania first, then alphabetical (Romanian collation). */
export function countries(): string[] {
  const all = Array.from(new Set(universities.map((u) => u.country)));
  const rest = all.filter((c) => c !== "România").sort((a, b) => a.localeCompare(b, "ro"));
  return all.includes("România") ? ["România", ...rest] : rest;
}

/** Cities that have at least one university sheet in the given country (or in Romania / abroad), the ones with most universities first. */
export function citiesIn(where: { country?: string; region?: "ro" | "abroad" }): string[] {
  return [...cityCounts(where)].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ro")).map(([c]) => c);
}

/** How many universities with a sheet each city of the country (or region) has; with neither, every city. */
export function cityCounts(where: { country?: string; region?: "ro" | "abroad" }): Map<string, number> {
  const count = new Map<string, number>();
  for (const u of universities) {
    if (where.country ? u.country !== where.country : where.region ? u.region !== where.region : false) continue;
    count.set(u.city, (count.get(u.city) ?? 0) + 1);
  }
  return count;
}

// Extra words people type for a country; applied to every university of that country.
const COUNTRY_ALIASES: Record<string, string> = {
  "România": "ro romania",
  SUA: "sua usa us america statele unite",
  "Marea Britanie": "uk anglia scotia britanie regatul unit england great britain",
  Olanda: "netherlands holland tarile de jos",
  Germania: "germany deutschland",
  "Franța": "franta france",
  Italia: "italy",
  Spania: "spain",
  "Elveția": "elvetia switzerland",
  Suedia: "sweden",
  Danemarca: "denmark",
  Belgia: "belgium",
  Austria: "osterreich",
};

// Extra names for well-known universities, by id (the id itself is always searchable too).
const ALIASES: Record<string, string> = {
  "ubb-cluj": "ubb babes bolyai",
  "ase-bucuresti": "ase academia de studii economice",
  upb: "upb politehnica bucuresti poli",
  utcn: "politehnica cluj utcluj",
  upt: "politehnica timisoara",
  uaic: "uaic cuza iasi",
  tuiasi: "politehnica iasi gheorghe asachi",
  uvt: "uvt vest timisoara",
  snspa: "snspa scoala nationala de studii politice",
  unibuc: "universitatea din bucuresti",
  "umf-carol-davila": "umf carol davila",
  mit: "mit massachusetts institute of technology",
  ucl: "ucl university college london",
  "eth-zurich": "eth zurich",
  epfl: "epfl lausanne",
  tum: "tum munchen munich",
  lmu: "lmu munchen munich",
  kcl: "kcl kings college london",
  rwth: "rwth aachen",
  "tu-delft": "delft",
  "ku-leuven": "leuven",
  "ub-barcelona": "barcelona",
  "sciences-po": "sciences po",
  "hu-berlin": "humboldt",
};

type Rank = 0 | 1 | 2 | 3;
type Index = { u: UniversitySummary; name: string; alias: string[]; own: string[]; keywords: string[] };

const tokens = (text: string): string[] => normalize(text).replace(/[^a-z0-9]+/g, " ").split(" ").filter(Boolean);

const domainName = new Map(domains.map((d) => [d.id, d.name]));

function buildIndex(u: UniversitySummary, lang: Lang): Index {
  const prefix = ["umf", "usamv", "uad", "amgd"].find((p) => u.id.startsWith(`${p}-`));
  const aliasText = [
    u.id,
    prefix ?? "",
    ALIASES[u.id] ?? "",
    u.city,
    u.country,
    lang === "en" ? `${cityName(u.city, "en")} ${countryName(u.country, "en")} ${universityName(u, "en")}` : "",
    COUNTRY_ALIASES[u.country] ?? "",
    u.prestige === "ivy" ? "ivy league" : "",
  ].join(" ");
  const keywordText = u.domainIds
    .flatMap((id) => [domainName.get(id) ?? "", ...specializationsFor(id).map((s) => s.name)])
    .join(" ");
  // the university's own faculties and bachelor programmes, when we have them: they rank above generic domain words
  const ownText = (u.faculties ?? []).flatMap((f) => [f.name, ...f.programs]).join(" ");
  return { u, name: normalize(universityName(u, lang)), alias: tokens(aliasText), own: tokens(ownText), keywords: tokens(keywordText) };
}

// One search index per page language; on English pages the Romanian name still finds the university (it stays in the alias words).
const indexes: Partial<Record<Lang, { list: Index[]; size: number }>> = {};
function getIndex(lang: Lang): Index[] {
  const cached = indexes[lang];
  if (!cached || cached.size !== universities.length) {
    const list = universities.map((u) => {
      const e = buildIndex(u, lang);
      if (lang === "en") e.alias = [...e.alias, ...tokens(u.name)];
      return e;
    });
    indexes[lang] = { list, size: universities.length };
    return list;
  }
  return cached.list;
}

const hasPrefix = (list: string[], word: string) => list.some((t) => t.startsWith(word));

/** Best (lowest) rank at which one word matches the university, or null. */
function wordRank(e: Index, word: string): Rank | null {
  if (e.name.includes(word)) return 0;
  if (hasPrefix(e.alias, word)) return 1;
  if (hasPrefix(e.own, word)) return 2;
  if (hasPrefix(e.keywords, word)) return 3;
  return null;
}

/** Universities matching a free-text query (name, city, country, domain, specialization, keywords), best first. */
export function searchUniversities(query: string, limit = 20, lang: Lang = "ro"): UniversitySummary[] {
  // split like the index, so punctuation in the query ("Stanford (California)", "Cluj-Napoca") does not stop a match
  const words = tokens(query);
  if (words.length === 0) return [];
  const hits: { u: UniversitySummary; rank: number }[] = [];
  for (const e of getIndex(lang)) {
    let rank = 0;
    let ok = true;
    for (const w of words) {
      const r = wordRank(e, w);
      if (r === null) {
        ok = false;
        break;
      }
      rank = Math.max(rank, r);
    }
    if (ok) hits.push({ u: e.u, rank });
  }
  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      PRESTIGE_ORDER.indexOf(a.u.prestige) - PRESTIGE_ORDER.indexOf(b.u.prestige) ||
      a.u.name.localeCompare(b.u.name, "ro"),
  );
  return hits.slice(0, limit).map((h) => h.u);
}

/** Lowest yearly tuition of each cost level in euro, used for universities without an exact fee. */
const LEVEL_FROM_EUR: Record<Budget, number> = { gratuit: 0, mic: 1, mediu: 2000, mare: 6000 };

/** The cheapest yearly tuition in euro: the confirmed fee when there is one, otherwise the lower end of the university's level. */
export function feeFrom(u: UniversitySummary): number {
  return u.feeFromEur ?? LEVEL_FROM_EUR[u.budget];
}

/** The team's choice (2026-10-24) of the Romanian universities shown first, in this order, when a list holds only Romanian universities. */
export const RO_FIRST = ["ase-bucuresti", "upb", "umf-carol-davila", "unibuc", "ubb-cluj", "uaic", "utcn", "uvt", "upt", "umf-cluj"];
const roFirstRank = (u: UniversitySummary) => {
  const i = RO_FIRST.indexOf(u.id);
  return i < 0 ? RO_FIRST.length : i;
};

/** The best universities for the given filters (all conditions together), at most `limit`, best first. */
export function filterUniversities(filters: Filters, limit = 10): UniversitySummary[] {
  const maxBudget = filters.budget ? BUDGET_ORDER.indexOf(filters.budget) : -1;
  const maxPrestige = filters.prestige && filters.prestige !== "national" ? PRESTIGE_ORDER.indexOf(filters.prestige) : -1;
  const found = universities.filter((u) => {
    if (filters.country && u.country !== filters.country) return false;
    if (filters.region && u.region !== filters.region) return false;
    if (filters.cities?.length && !filters.cities.includes(u.city)) return false;
    if (filters.domainId && !u.domainIds.includes(filters.domainId)) return false;
    if (maxBudget >= 0 && BUDGET_ORDER.indexOf(u.budget) > maxBudget) return false;
    if (filters.maxFee !== undefined && feeFrom(u) > filters.maxFee) return false;
    if (filters.english === "all" && u.english !== "all") return false;
    if (filters.english === "some" && u.english !== "all" && u.english !== "some") return false;
    if (maxPrestige >= 0 && PRESTIGE_ORDER.indexOf(u.prestige) > maxPrestige) return false;
    if (filters.admissionType && !u.admissionTypes.includes(filters.admissionType)) return false;
    if (filters.scholarships && !u.scholarships) return false;
    if (filters.dorms && !u.dorms) return false;
    if (filters.withoutCertificate && u.certificates.includes(filters.withoutCertificate)) return false;
    if (filters.domainIds?.length && !filters.domainIds.some((d) => u.domainIds.includes(d))) return false;
    if (filters.admissionTypes?.length && !filters.admissionTypes.some((a) => u.admissionTypes.includes(a))) return false;
    if (filters.prestiges?.length && !filters.prestiges.some((p) => u.prestige === p || (p === "top" && u.prestige === "ivy"))) return false;
    return true;
  });
  const onlyRomanian = found.length > 0 && found.every((u) => u.region === "ro");
  return found
    .sort(
      (a, b) =>
        (onlyRomanian ? roFirstRank(a) - roFirstRank(b) : 0) ||
        PRESTIGE_ORDER.indexOf(a.prestige) - PRESTIGE_ORDER.indexOf(b.prestige) ||
        BUDGET_ORDER.indexOf(a.budget) - BUDGET_ORDER.indexOf(b.budget) ||
        a.name.localeCompare(b.name, "ro"),
    )
    .slice(0, limit);
}

/** One line under the search box while typing: a university (opens its sheet) or a city / country (searches that place). */
export type Suggestion = { label: string; sub: string; href?: string; query?: string };

/** Up to 2 matching places and up to 6 universities for what the student has typed so far (from 2 letters; diacritics do not matter). */
export function suggest(query: string, lang: Lang = "ro"): Suggestion[] {
  const q = normalize(query).trim();
  if (q.length < 2) return [];
  const starts = (text: string) => normalize(text).split(/[\s-]+/).some((w) => w.startsWith(q)) || normalize(text).startsWith(q);
  const places: Suggestion[] = [];
  for (const c of countries()) if (places.length < 2 && (starts(c) || (lang === "en" && starts(countryName(c, "en"))))) places.push({ label: countryName(c, lang), sub: lang === "en" ? "Country · all universities there" : "Țară · toate universitățile de acolo", query: countryName(c, lang) });
  const cities = new Map<string, string>();
  for (const u of universities) if (!cities.has(u.city) && (starts(u.city) || (lang === "en" && starts(cityName(u.city, "en"))))) cities.set(u.city, u.country);
  for (const [city, country] of cities) if (places.length < 2) places.push({ label: cityName(city, lang), sub: lang === "en" ? `City, ${countryName(country, "en")} · all universities there` : `Oraș, ${country} · toate universitățile de acolo`, query: cityName(city, lang) });
  // Romanian universities first (the site is for Romanian pupils), keeping the search order inside each group.
  const found = searchUniversities(query, 40, lang);
  const unis = [...found.filter((u) => u.region === "ro"), ...found.filter((u) => u.region !== "ro")]
    .slice(0, 6)
    .map((u) => ({ label: universityName(u, lang), sub: `${cityName(u.city, lang)}, ${countryName(u.country, lang)}`, href: `/universitati/${u.id}` }));
  return [...places, ...unis];
}
