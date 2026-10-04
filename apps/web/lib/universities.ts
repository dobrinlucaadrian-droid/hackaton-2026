// Search and filter over the universities with a profile sheet, plus labels for the filter values.
import { domains, specializations, universities } from "./data";
import type { AdmissionType, Budget, CertificateId, Filters, Prestige, Specialization, University, WorldUniversity } from "./types";

export const PRESTIGE_LABEL: Record<Prestige, string> = {
  ivy: "Ivy League",
  top: "De top mondial",
  international: "Cunoscută internațional",
  national: "Cunoscută în țara ei",
};
export const BUDGET_LABEL: Record<Budget, string> = {
  gratuit: "Fără taxă",
  mic: "Taxă mică",
  mediu: "Taxă medie",
  mare: "Taxă mare",
};
export const ADMISSION_LABEL: Record<AdmissionType, string> = {
  examen: "Examen de admitere",
  bac: "Media de la bacalaureat",
  dosar: "Dosar de aplicare",
  interviu: "Interviu",
  aptitudini: "Probe de aptitudini",
  "test-standardizat": "Test standardizat (SAT, ACT etc.)",
};
export const CERTIFICATE_LABEL: Record<CertificateId, string> = {
  bac: "Diplomă de bacalaureat",
  engleza: "Certificat de limba engleză (IELTS, TOEFL, Cambridge)",
  "alta-limba": "Certificat pentru altă limbă străină",
  "sat-act": "Test SAT sau ACT",
  portofoliu: "Portofoliu",
  motivatie: "Scrisoare de motivație",
  recomandari: "Scrisori de recomandare",
  medical: "Aviz medical",
};

const PRESTIGE_ORDER: Prestige[] = ["ivy", "top", "international", "national"];
const BUDGET_ORDER: Budget[] = ["gratuit", "mic", "mediu", "mare"];

/** Lower-cases, strips diacritics (including the cedilla forms ş/ţ) and collapses whitespace, so "Bucuresti" finds "București". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Countries that have at least one university, Romania first, then alphabetical (Romanian collation). */
export function countries(): string[] {
  const all = Array.from(new Set(universities.map((u) => u.country)));
  const rest = all.filter((c) => c !== "România").sort((a, b) => a.localeCompare(b, "ro"));
  return all.includes("România") ? ["România", ...rest] : rest;
}

export function universityById(id: string): University | undefined {
  return universities.find((u) => u.id === id);
}

export function specializationsFor(domainId: string): Specialization[] {
  return specializations.filter((s) => s.domainId === domainId);
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

type Rank = 0 | 1 | 2 | 3 | 4;
type Index = { u: University; name: string; alias: string[]; own: string[]; keywords: string[]; about: string[] };

const tokens = (text: string): string[] => normalize(text).replace(/[^a-z0-9]+/g, " ").split(" ").filter(Boolean);

const domainName = new Map(domains.map((d) => [d.id, d.name]));

function buildIndex(u: University): Index {
  const prefix = ["umf", "usamv", "uad", "amgd"].find((p) => u.id.startsWith(`${p}-`));
  const aliasText = [
    u.id,
    prefix ?? "",
    ALIASES[u.id] ?? "",
    u.city,
    u.country,
    COUNTRY_ALIASES[u.country] ?? "",
    u.prestige === "ivy" ? "ivy league" : "",
  ].join(" ");
  const keywordText = u.domainIds
    .flatMap((id) => [domainName.get(id) ?? "", ...specializationsFor(id).map((s) => s.name)])
    .join(" ");
  // the university's own faculties and bachelor programmes, when we have them: they rank above generic domain words
  const ownText = (u.faculties ?? []).flatMap((f) => [f.name, ...f.programs]).join(" ");
  return { u, name: normalize(u.name), alias: tokens(aliasText), own: tokens(ownText), keywords: tokens(keywordText), about: tokens(u.about ?? "") };
}

let index: Index[] | null = null;
let indexedFor = 0;
function getIndex(): Index[] {
  if (!index || indexedFor !== universities.length) {
    index = universities.map(buildIndex);
    indexedFor = universities.length;
  }
  return index;
}

const hasPrefix = (list: string[], word: string) => list.some((t) => t.startsWith(word));

/** Best (lowest) rank at which one word matches the university, or null. */
function wordRank(e: Index, word: string): Rank | null {
  if (e.name.includes(word)) return 0;
  if (hasPrefix(e.alias, word)) return 1;
  if (hasPrefix(e.own, word)) return 2;
  if (hasPrefix(e.keywords, word)) return 3;
  if (hasPrefix(e.about, word)) return 4;
  return null;
}

/** Universities matching a free-text query (name, city, country, domain, specialization, keywords), best first. */
export function searchUniversities(query: string, limit = 20): University[] {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return [];
  const hits: { u: University; rank: number }[] = [];
  for (const e of getIndex()) {
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

/** The best universities for the given filters (all conditions together), at most `limit`, best first. */
export function filterUniversities(filters: Filters, limit = 10): University[] {
  const maxBudget = filters.budget ? BUDGET_ORDER.indexOf(filters.budget) : -1;
  const maxPrestige = filters.prestige && filters.prestige !== "national" ? PRESTIGE_ORDER.indexOf(filters.prestige) : -1;
  return universities
    .filter((u) => {
      if (filters.country && u.country !== filters.country) return false;
      if (filters.region && u.region !== filters.region) return false;
      if (filters.domainId && !u.domainIds.includes(filters.domainId)) return false;
      if (maxBudget >= 0 && BUDGET_ORDER.indexOf(u.budget) > maxBudget) return false;
      if (maxPrestige >= 0 && PRESTIGE_ORDER.indexOf(u.prestige) > maxPrestige) return false;
      if (filters.admissionType && !u.admissionTypes.includes(filters.admissionType)) return false;
      if (filters.scholarships && !u.scholarships) return false;
      if (filters.dorms && !u.dorms) return false;
      if (filters.withoutCertificate && u.certificates.includes(filters.withoutCertificate)) return false;
      return true;
    })
    .sort(
      (a, b) =>
        PRESTIGE_ORDER.indexOf(a.prestige) - PRESTIGE_ORDER.indexOf(b.prestige) ||
        BUDGET_ORDER.indexOf(a.budget) - BUDGET_ORDER.indexOf(b.budget) ||
        a.name.localeCompare(b.name, "ro"),
    )
    .slice(0, limit);
}

/** Entries of the world list (name, country, website only) matching the query, excluding ones we already have a sheet for. */
export function searchWorld(list: WorldUniversity[], query: string, limit = 20): WorldUniversity[] {
  const q = normalize(query);
  const words = q.split(" ").filter(Boolean);
  if (words.length === 0) return [];
  const known = new Set(universities.map((u) => normalize(u.name)));
  const hits: { w: WorldUniversity; prefix: boolean }[] = [];
  for (const w of list) {
    const name = normalize(w.n);
    if (known.has(name)) continue;
    const text = `${name} ${normalize(w.c)}`;
    if (words.every((x) => text.includes(x))) hits.push({ w, prefix: name.startsWith(q) });
  }
  hits.sort((a, b) => Number(b.prefix) - Number(a.prefix)); // stable: keeps list order inside each group
  return hits.slice(0, limit).map((h) => h.w);
}
