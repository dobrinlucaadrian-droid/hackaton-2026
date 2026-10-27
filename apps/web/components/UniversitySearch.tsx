"use client";
// Search and filters for universities (in the page language); all state lives in the URL query so links and the Back button work.
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categories, domains } from "@/lib/data";
import type { AdmissionType, Budget, CertificateId, Filters, Prestige, UniversitySummary } from "@/lib/types";
import { tr, type Lang } from "@/lib/i18n";
import { cityName, countryName, localCategory, localDomain } from "@/lib/i18n-data";
import { ADMISSION_LABEL, BUDGET_LABEL, CERTIFICATE_LABEL, FEE_STEPS, PRESTIGE_LABEL, formatNumber, labelsFor } from "@/lib/labels";
import { rememberSearch } from "@/lib/lastSearch";
import { citiesIn, cityCounts, countries, feeFrom, filterUniversities, searchUniversities, suggest } from "@/lib/universities";
import { NothingFound } from "./Illustrations";
import { useHref, useLang, useT } from "./LangProvider";
import { SearchBox } from "./SearchBox";
import { UniversityCard } from "./UniversityCard";

const NOTE = "Informațiile sunt orientative. Verifică mereu site-ul universității.";
const NOTE_EN = "The information is only a guide. Always check the university's website.";
// No "Ivy League" button: it only confused students; the Ivy League shows up under "De top mondial".
const PRESTIGE_CHOICES: Prestige[] = ["top", "international"];
// How many city chips are shown before "Vezi toate orașele".
const CITY_PREVIEW = 12;
const PRESTIGE_CHIP: Record<string, string> = { ivy: "Ivy League", top: "De top mondial", international: "Cunoscută internațional" };
const PRESTIGE_CHIP_EN: Record<string, string> = { ivy: "Ivy League", top: "World top", international: "Known internationally" };

/** "Fără taxă", "Până la 3.000 €" (as a chip of the active filters: "Taxă: până la 3.000 €/an"). */
function feeStepLabel(eur: number, active = false, lang: Lang = "ro"): string {
  if (lang === "en") {
    if (eur === 0) return active ? "Fee: no tuition fee" : "No tuition fee";
    const sum = `€${formatNumber(eur, "en")}`;
    return active ? `Fee: up to ${sum}/year` : `Up to ${sum}`;
  }
  if (eur === 0) return active ? "Taxă: fără taxă" : "Fără taxă";
  const sum = `${new Intl.NumberFormat("ro-RO").format(eur)} €`;
  return active ? `Taxă: până la ${sum}/an` : `Până la ${sum}`;
}


function pick<T extends string>(value: string | null, allowed: Record<string, unknown>): T | undefined {
  return value && value in allowed ? (value as T) : undefined;
}

function readFilters(p: URLSearchParams): Filters {
  const f: Filters = {};
  const tara = p.get("tara");
  if (tara) f.country = tara;
  const regiune = p.get("regiune");
  if (regiune === "ro" || regiune === "abroad") f.region = regiune;
  const orase = [...new Set(p.getAll("oras").filter(Boolean))];
  if (orase.length) f.cities = orase;
  // Domains, prestige levels and admission types may be chosen several at once (?domeniu=a&domeniu=b).
  const domenii = [...new Set(p.getAll("domeniu").filter((d) => domains.some((x) => x.id === d)))];
  if (domenii.length) f.domainIds = domenii;
  const engleza = p.get("engleza");
  if (engleza === "unele") f.english = "some";
  if (engleza === "toate") f.english = "all";
  const taxa = Number(p.get("taxa"));
  if (p.get("taxa") !== null && (FEE_STEPS as readonly number[]).includes(taxa)) f.maxFee = taxa;
  // older links used the cost levels: turn them into the amount each level ends at
  const buget = pick<Budget>(p.get("buget"), BUDGET_LABEL);
  if (buget && f.maxFee === undefined && buget !== "mare") f.maxFee = { gratuit: 0, mic: 2000, mediu: 6000 }[buget];
  // an older link with "ivy" now means "top", which includes the Ivy League
  const prestigii = [...new Set(p.getAll("prestigiu").map((x) => (x === "ivy" ? "top" : x)))].filter((x): x is Prestige => x in PRESTIGE_LABEL && x !== "national");
  if (prestigii.length) f.prestiges = prestigii;
  const admiteri = [...new Set(p.getAll("admitere"))].filter((x): x is AdmissionType => x in ADMISSION_LABEL);
  if (admiteri.length) f.admissionTypes = admiteri;
  if (p.get("burse") === "1") f.scholarships = true;
  if (p.get("camin") === "1") f.dorms = true;
  const fara = pick<CertificateId>(p.get("fara"), CERTIFICATE_LABEL);
  if (fara) f.withoutCertificate = fara;
  return f;
}

const PARAM_OF: Record<keyof Filters, string> = {
  country: "tara",
  region: "regiune",
  cities: "oras",
  domainId: "domeniu",
  budget: "buget",
  maxFee: "taxa",
  english: "engleza",
  prestige: "prestigiu",
  admissionType: "admitere",
  scholarships: "burse",
  dorms: "camin",
  withoutCertificate: "fara",
  domainIds: "domeniu",
  admissionTypes: "admitere",
  prestiges: "prestigiu",
};

const selectClass = "mt-1 min-h-11 w-full rounded-xl border-2 border-transparent bg-paper px-3 text-ink ring-1 ring-line focus:border-primary focus:outline-none";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-sm font-bold transition ${
        on ? "bg-primary text-white" : "bg-paper text-ink-soft ring-1 ring-line hover:ring-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ title, children, hint }: { title: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-extrabold uppercase tracking-wide text-primary">{title}</legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
      {hint && <div className="mt-2 text-sm text-ink-soft">{hint}</div>}
    </fieldset>
  );
}

/** "o universitate", "7 universități", "83 de universități" (Romanian puts "de" after 20 and above). */
function universitiesCount(n: number, lang: Lang = "ro"): string {
  if (lang === "en") return n === 1 ? "1 university" : `${formatNumber(n, "en")} universities`;
  if (n === 1) return "o universitate";
  const r = n % 100;
  return `${n} ${r === 0 || r >= 20 ? "de " : ""}universități`;
}

/** The universities for a text search and filters together (the text search alone when there are no filters). */
function findMatches(q: string, filters: Filters, lang: Lang = "ro"): UniversitySummary[] {
  if (!q) return filterUniversities(filters, 10000);
  const found = searchUniversities(q, 100, lang);
  if (Object.keys(filters).length === 0) return found;
  const ok = new Set(filterUniversities(filters, 10000).map((u) => u.id));
  return found.filter((u) => ok.has(u.id));
}

/** The same filters without one of them (or without one value of a group where several can be chosen). */
function dropFilter(filters: Filters, key: keyof Filters, value?: string): Filters {
  const next: Filters = { ...filters };
  const current = next[key];
  if (value !== undefined && Array.isArray(current)) {
    const left = (current as string[]).filter((v) => v !== value);
    if (left.length) (next as Record<string, unknown>)[key] = left;
    else delete next[key];
  } else delete next[key];
  return next;
}

/** A plain explanation for filter combinations that can never match in Romania, so an empty list does not look like a broken site. */
/**
 * Plain explanations of why a search found nothing, worked out from the data: for the chosen place (a country, România or "străinătate"),
 * each other filter that alone already finds nothing there gets one sentence (at most two are shown).
 */
function whyNothing(filters: Filters, place: { name: string; filter: Filters } | null, lang: Lang = "ro"): string[] {
  const t = tr(lang);
  const L = labelsFor(lang);
  const out: string[] = [];
  const alone = (extra: Filters) => filterUniversities({ ...(place?.filter ?? {}), ...extra }, 10000).length;
  if (filters.withoutCertificate === "bac" && alone({ withoutCertificate: "bac" }) === 0)
    out.push(t("Aproape toate universitățile cer diploma de bacalaureat; doar câteva academii de artă și muzică primesc studenți după probele de talent.", "Almost all universities require the baccalaureate diploma; only a few art and music academies accept students after talent tests."));
  if (!place) return out.slice(0, 2);
  const loc = place.name === "România" ? t("România", "Romania") : place.name === "străinătate" ? t("străinătate", "abroad") : countryName(place.name, lang);
  const here = filterUniversities(place.filter, 10000);
  const ro = place.name === "România";
  if (filters.maxFee !== undefined && alone({ maxFee: filters.maxFee }) === 0) {
    // the cheapest confirmed fee; universities without an exact fee only tell their level, so then the honest wording is "peste" the level's lower end
    const exact = here.filter((u) => u.feeFromEur !== undefined).map((u) => u.feeFromEur!);
    const levels = here.filter((u) => u.feeFromEur === undefined).map(feeFrom);
    const minExact = exact.length ? Math.min(...exact) : Infinity;
    const minLevel = levels.length ? Math.min(...levels) : Infinity;
    const fmt = (n: number) => (lang === "en" ? `€${formatNumber(Math.round(n / 100) * 100, "en")}` : `${new Intl.NumberFormat("ro-RO").format(Math.round(n / 100) * 100)} €`);
    const from = minExact <= minLevel ? t(`pornește de la aproximativ ${fmt(minExact)}`, `starts at about ${fmt(minExact)}`) : t(`este de peste ${fmt(minLevel)}`, `is over ${fmt(minLevel)}`);
    out.push(
      filters.maxFee === 0
        ? t(`În ${loc} nu există universități fără taxă pentru un student din România; cea mai mică taxă ${from} pe an.`, `In ${loc} there are no tuition-free universities for a student from Romania; the lowest fee ${from} per year.`)
        : t(`În ${loc}, cea mai mică taxă pentru un student din România ${from} pe an.`, `In ${loc}, the lowest fee for a student from Romania ${from} per year.`),
    );
  }
  if (filters.english && alone({ english: filters.english }) === 0) {
    const some = here.filter((u) => u.english === "some" || u.english === "all").length;
    out.push(
      filters.english === "all" && some > 0
        ? t(`În ${loc} nicio universitate de pe site nu are toate licențele în engleză, dar ${some} au cel puțin o licență în engleză.`, `In ${loc} no university on the site has all its bachelor's programmes in English, but ${some} have at least one bachelor's programme in English.`)
        : t(`În ${loc} nu avem nicio universitate cu licențe predate în engleză.`, `In ${loc} we have no university with bachelor's programmes taught in English.`),
    );
  }
  if (filters.prestiges?.length && alone({ prestiges: filters.prestiges }) === 0)
    out.push(
      ro && filters.prestiges.every((p) => p === "top" || p === "ivy")
        ? t("Nicio universitate din România nu este printre primele aproximativ 100 din lume; cele mai cunoscute sunt la „Cunoscută internațional”.", "No university in Romania is among the top 100 or so in the world; the best known are under “Known internationally”.")
        : t(`Dintre universitățile din ${loc} de pe site, niciuna nu este marcată „${filters.prestiges.map((p) => PRESTIGE_CHIP[p]).join("” sau „")}”.`, `Of the universities in ${loc} on the site, none is marked “${filters.prestiges.map((p) => PRESTIGE_CHIP_EN[p]).join("” or “")}”.`),
    );
  if (filters.admissionTypes?.length && alone({ admissionTypes: filters.admissionTypes }) === 0) {
    if (ro && filters.admissionTypes.every((a) => a === "test-standardizat"))
      out.push(t("În România nu se dă SAT, ACT sau alt test standardizat: admiterea se face după media de la bacalaureat, un examen, probe de aptitudini sau un dosar.", "In Romania you do not take the SAT, the ACT or another standardised test: admission is based on the baccalaureate average, an exam, aptitude tests or an application file."));
    else {
      const used = (Object.keys(L.ADMISSION) as AdmissionType[]).filter((a) => here.some((u) => u.admissionTypes.includes(a)));
      const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1); // "test standardizat (SAT, ACT etc.)" keeps its capitals
      out.push(t(`La universitățile din ${loc} de pe site, admiterea se face prin: ${used.map((a) => lower(L.ADMISSION[a])).join(", ")}.`, `At the universities in ${loc} on the site, admission is by: ${used.map((a) => lower(L.ADMISSION[a])).join(", ")}.`));
    }
  }
  if (filters.scholarships && alone({ scholarships: true }) === 0)
    out.push(t(`Niciuna dintre universitățile din ${loc} de pe site nu are burse pe care un student din România le poate obține.`, `None of the universities in ${loc} on the site has scholarships that a student from Romania can get.`));
  if (filters.dorms && alone({ dorms: true }) === 0)
    out.push(t(`Niciuna dintre universitățile din ${loc} de pe site nu are cămin propriu sau al unui partener oficial.`, `None of the universities in ${loc} on the site has its own dormitory or one of an official partner.`));
  if (filters.withoutCertificate && filters.withoutCertificate !== "bac" && alone({ withoutCertificate: filters.withoutCertificate }) === 0)
    out.push(t(`Toate universitățile din ${loc} de pe site cer: ${CERTIFICATE_LABEL[filters.withoutCertificate].charAt(0).toLowerCase()}${CERTIFICATE_LABEL[filters.withoutCertificate].slice(1)}.`, `All universities in ${loc} on the site require: ${L.CERTIFICATE[filters.withoutCertificate].charAt(0).toLowerCase()}${L.CERTIFICATE[filters.withoutCertificate].slice(1)}.`));
  if (filters.domainIds?.length && alone({ domainIds: filters.domainIds }) === 0)
    out.push(t(`În ${loc} nu avem nicio universitate cu ${filters.domainIds.map((d) => domains.find((x) => x.id === d)?.name ?? d).join(" sau ")}.`, `In ${loc} we have no university with ${filters.domainIds.map((d) => { const x = domains.find((y) => y.id === d); return x ? localDomain(x, lang).name : d; }).join(" or ")}.`));
  return out.slice(0, 2);
}

/** How many universities the list shows at first and adds with each "Arată încă 10". */
const PAGE = 10;

export function UniversitySearch() {
  const router = useRouter();
  const lang = useLang();
  const t = useT();
  const href = useHref();
  const L = labelsFor(lang);
  const chipOf = lang === "en" ? PRESTIGE_CHIP_EN : PRESTIGE_CHIP;
  const domainName = (id: string) => {
    const d = domains.find((x) => x.id === id);
    return d ? localDomain(d, lang).name : id;
  };
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const filters = useMemo(() => readFilters(params), [params]);
  const activeCount = Object.keys(filters).length;
  const [panel, setPanel] = useState(false);
  const [allCities, setAllCities] = useState(false);

  // Any new search or filter starts again from the first 10 results.
  function go(next: URLSearchParams) {
    next.delete("arata");
    const s = next.toString();
    router.push(href(s ? `/universitati?${s}` : "/universitati"), { scroll: false });
  }
  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "taxa") next.delete("buget"); // the amount replaces an old level from a saved link
    go(next);
  }
  /** Choosing another country or region drops the chosen cities, which belong to the old one. */
  function setPlace(key: "tara" | "regiune", value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("oras");
    go(next);
  }
  function toggleCity(city: string) {
    const next = new URLSearchParams(params.toString());
    const chosen = next.getAll("oras");
    next.delete("oras");
    for (const c of chosen.includes(city) ? chosen.filter((x) => x !== city) : [...chosen, city]) next.append("oras", c);
    go(next);
  }
  /** Adds or removes one value of a group where several can be chosen (domains, prestige, admission). */
  function toggleMulti(param: string, value: string) {
    const next = new URLSearchParams(params.toString());
    const chosen = next.getAll(param);
    next.delete(param);
    for (const v of chosen.includes(value) ? chosen.filter((x) => x !== value) : [...chosen, value]) next.append(param, v);
    go(next);
  }
  function clearFilters() {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    go(next);
  }

  const matches = useMemo(() => findMatches(q, filters, lang), [q, filters, lang]);

  // 10 at first, 10 more on each "Arată încă 10"; back to 10 whenever the search or the filters change.
  // How many results are open is kept in the address too (?arata=20), so coming back to the search shows the same list.
  const count = Math.max(PAGE, Math.min(Number(params.get("arata")) || PAGE, 1000));
  function showMore() {
    const next = new URLSearchParams(params.toString());
    next.set("arata", String(count + PAGE));
    router.replace(href(`/universitati?${next.toString()}`), { scroll: false });
  }
  // The sheet's "back" button returns to this exact search (lib/lastSearch.ts).
  useEffect(() => {
    rememberSearch(params.toString());
  }, [params]);
  const results = matches.slice(0, count);


  const grouped = categories
    .map((c) => ({ c, ds: c.domainIds.map((id) => domains.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d) }))
    .filter((g) => g.ds.length > 0);
  const inCat = new Set(grouped.flatMap((g) => g.ds.map((d) => d.id)));
  const rest = domains.filter((d) => !inCat.has(d.id));

  const countryList = countries();
  const hiddenCount = (["maxFee", "english", "prestiges", "admissionTypes", "scholarships", "dorms", "withoutCertificate"] as const).filter((k) => filters[k] !== undefined).length;
  // Cities to choose from: those of the chosen country or region; with nothing chosen, the Romanian ones.
  const cityPlace = filters.country ? { country: filters.country } : { region: filters.region ?? ("ro" as const) };
  const cityOptions = filters.region === "abroad" && !filters.country ? [] : citiesIn(cityPlace);
  const cityCount = cityCounts(cityPlace);
  const chosenCities = filters.cities ?? [];
  const chosenDomains = filters.domainIds ?? [];
  const cityTitle = filters.country ? t(`Orașe din ${filters.country}`, `Cities in ${countryName(filters.country, lang)}`) : t("Orașe din România", "Cities in Romania");
  const cityShown = allCities ? cityOptions : cityOptions.filter((c, i) => i < CITY_PREVIEW || chosenCities.includes(c));
  // Each active filter as a removable chip; `without` is the same search without it (used to suggest what to remove when nothing is found).
  const chips: { key: string; label: string; remove: () => void; without: Filters }[] = [];
  const add = (key: keyof Filters, label: string) => chips.push({ key, label, remove: () => setParam(PARAM_OF[key], undefined), without: dropFilter(filters, key) });
  const addOne = <K extends "cities" | "domainIds" | "prestiges" | "admissionTypes">(key: K, value: string, label: string, remove: () => void) =>
    chips.push({ key: `${key}-${value}`, label, remove, without: dropFilter(filters, key, value) });
  if (filters.region) add("region", filters.region === "ro" ? t("În România", "In Romania") : t("În străinătate", "Abroad"));
  for (const c of chosenCities) addOne("cities", c, t(`Oraș: ${c}`, `City: ${cityName(c, lang)}`), () => toggleCity(c));
  if (filters.country) add("country", countryName(filters.country, lang));
  for (const d of filters.domainIds ?? []) addOne("domainIds", d, domainName(d), () => toggleMulti("domeniu", d));
  if (filters.maxFee !== undefined) add("maxFee", feeStepLabel(filters.maxFee, true, lang));
  if (filters.english) add("english", filters.english === "all" ? t("Toate licențele în engleză", "All bachelor's programmes in English") : t("Licență în engleză", "Bachelor's programme in English"));
  for (const p of filters.prestiges ?? []) addOne("prestiges", p, chipOf[p], () => toggleMulti("prestigiu", p));
  for (const a of filters.admissionTypes ?? []) addOne("admissionTypes", a, L.ADMISSION[a], () => toggleMulti("admitere", a));
  if (filters.scholarships) add("scholarships", t("Are burse", "Has scholarships"));
  if (filters.dorms) add("dorms", t("Are cămin", "Has dormitories"));
  if (filters.withoutCertificate) add("withoutCertificate", t(`Fără: ${CERTIFICATE_LABEL[filters.withoutCertificate]}`, `Without: ${L.CERTIFICATE[filters.withoutCertificate]}`));
  // When nothing is found: which single filter to remove to get results again (the biggest gains first), and why, for the known Romanian cases.
  const nothing = matches.length === 0 && activeCount > 0;
  const suggestions = nothing
    ? chips
        .map((c) => ({ ...c, count: findMatches(q, c.without, lang).length }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    : [];
  // The place the explanations talk about: the chosen country, otherwise România (region or Romanian cities) or "străinătate".
  const place: { name: string; filter: Filters } | null = filters.country
    ? { name: filters.country, filter: { country: filters.country } }
    : filters.region === "ro" || (chosenCities.length > 0 && filters.region !== "abroad")
      ? { name: "România", filter: { region: "ro" } }
      : filters.region === "abroad"
        ? { name: "străinătate", filter: { region: "abroad" } }
        : null;
  const why = nothing ? whyNothing(filters, place, lang) : [];

  return (
    <div>
      <SearchBox key={q} initial={q} id="cauta-uni" suggest={(v) => suggest(v, lang)} onSearch={(v) => setParam("q", v || undefined)} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="f-tara" className="text-sm font-extrabold uppercase tracking-wide text-primary">{t("Țara", "Country")}</label>
          <select id="f-tara" value={filters.country ?? ""} onChange={(e) => setPlace("tara", e.target.value || undefined)} className={selectClass}>
            <option value="">{t("Oricare", "Any")}</option>
            {countryList.map((c) => (
              <option key={c} value={c}>{countryName(c, lang)}</option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip on={filters.region === "ro"} onClick={() => setPlace("regiune", filters.region === "ro" ? undefined : "ro")}>{t("În România", "In Romania")}</Chip>
            <Chip on={filters.region === "abroad"} onClick={() => setPlace("regiune", filters.region === "abroad" ? undefined : "abroad")}>{t("În străinătate", "Abroad")}</Chip>
          </div>
        </div>
        <div>
          <label htmlFor="f-domeniu" className="text-sm font-extrabold uppercase tracking-wide text-primary">{t("Domeniu (poți alege mai multe)", "Field (you can pick several)")}</label>
          {/* each choice is added to the list below; the select always goes back to its prompt */}
          <select
            id="f-domeniu"
            value=""
            onChange={(e) => e.target.value && !chosenDomains.includes(e.target.value) && toggleMulti("domeniu", e.target.value)}
            className={selectClass}
          >
            <option value="">{chosenDomains.length ? t("Adaugă încă un domeniu", "Add another field") : t("Oricare", "Any")}</option>
            {grouped.map(({ c, ds }) => (
              <optgroup key={c.id} label={localCategory(c, lang).name}>
                {ds.map((d) => (
                  <option key={d.id} value={d.id} disabled={chosenDomains.includes(d.id)}>{localDomain(d, lang).name}</option>
                ))}
              </optgroup>
            ))}
            {rest.length > 0 && (
              <optgroup label={t("Alte domenii", "Other fields")}>
                {rest.map((d) => (
                  <option key={d.id} value={d.id} disabled={chosenDomains.includes(d.id)}>{localDomain(d, lang).name}</option>
                ))}
              </optgroup>
            )}
          </select>
          {chosenDomains.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {chosenDomains.map((d) => (
                <Chip key={d} on onClick={() => toggleMulti("domeniu", d)}>
                  {domainName(d)}
                  <span aria-hidden className="ml-1.5">✕</span>
                  <span className="sr-only"> {t("(scoate)", "(remove)")}</span>
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {cityOptions.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("Alege o țară ca să poți alege și orașele.", "Pick a country to be able to pick cities too.")}</p>
        ) : (
          <Group title={`${cityTitle} ${t("(poți alege mai multe)", "(you can pick several)")}`}>
            {cityShown.map((c) => (
              <Chip key={c} on={chosenCities.includes(c)} onClick={() => toggleCity(c)}>
                {cityName(c, lang)}
                {/* how many universities the city has on the site, whatever the other filters */}
                <span aria-hidden className="ml-1.5 font-semibold opacity-60">
                  {cityCount.get(c)}
                </span>
                <span className="sr-only">, {universitiesCount(cityCount.get(c) ?? 0, lang)}</span>
              </Chip>
            ))}
            {cityOptions.length > cityShown.length && (
              <button type="button" onClick={() => setAllCities(true)} className="min-h-11 rounded-full px-3 text-sm font-bold text-primary underline underline-offset-2">
                {t("Vezi toate orașele", "Show all cities")}
              </button>
            )}
            {allCities && cityOptions.length > CITY_PREVIEW && (
              <button type="button" onClick={() => setAllCities(false)} className="min-h-11 rounded-full px-3 text-sm font-bold text-primary underline underline-offset-2">
                {t("Arată mai puține", "Show fewer")}
              </button>
            )}
          </Group>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-expanded={panel}
          aria-controls="panou-filtre"
          onClick={() => setPanel(!panel)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-primary px-5 font-bold text-primary transition hover:bg-primary-tint"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          {t("Mai multe filtre", "More filters")}
          {hiddenCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">{hiddenCount}</span>}
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={clearFilters} className="min-h-11 rounded-full px-3 font-bold text-ink-soft underline underline-offset-2 hover:text-primary">
            {t("Șterge filtrele", "Clear filters")}
          </button>
        )}
      </div>

      {panel && <div aria-hidden onClick={() => setPanel(false)} className="fixed inset-0 z-30 bg-ink/40 sm:hidden" />}
      {panel && (
        <section
          id="panou-filtre"
          aria-label={t("Filtre", "Filters")}
          className="slide-in z-40 mt-3 space-y-5 bg-card p-5 shadow-sm ring-1 ring-line max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:mt-0 max-sm:max-h-[88vh] max-sm:overflow-y-auto max-sm:rounded-t-3xl sm:rounded-3xl"
        >
          <div className="flex items-center justify-between sm:hidden">
            <h2 className="text-xl font-black text-ink">{t("Mai multe filtre", "More filters")}</h2>
            <button type="button" onClick={() => setPanel(false)} className="min-h-11 rounded-full bg-primary px-5 font-bold text-white">
              {t("Gata", "Done")}
            </button>
          </div>

          <Group
            title={t("Cât poți plăti pe an?", "How much can you pay per year?")}
            hint={
              <p>
                {t(
                  "Arătăm universitățile unde cel mai ieftin program de licență costă cel mult suma aleasă (doar taxa de școlarizare, fără cazare și masă). La universitățile de stat din România contează taxa de la locurile cu taxă; unde nu avem suma exactă, folosim nivelul taxei. Sumele în alte monede sunt transformate orientativ în euro; suma exactă scrie pe fișa fiecărei universități.",
                  "We show the universities where the cheapest bachelor's programme costs at most the amount you choose (tuition only, without accommodation and food). At Romanian state universities the fee for fee-paying places counts; where we do not have the exact amount, we use the fee level. Amounts in other currencies are converted roughly into euro; the exact amount is on each university's sheet.",
                )}
              </p>
            }
          >
            <Chip on={filters.maxFee === undefined} onClick={() => setParam("taxa", undefined)}>{t("Oricât", "Any amount")}</Chip>
            {FEE_STEPS.map((s) => (
              <Chip key={s} on={filters.maxFee === s} onClick={() => setParam("taxa", filters.maxFee === s ? undefined : String(s))}>
                {feeStepLabel(s, false, lang)}
              </Chip>
            ))}
          </Group>

          <Group
            title={t("Predare în engleză", "Taught in English")}
            hint={<p>{t("Doar programele de licență complete contează; cursurile sau semestrele în engleză și masteratele nu. Lista exactă a programelor e pe fișa fiecărei universități.", "Only complete bachelor's programmes count; single courses or semesters in English and master's programmes do not. The exact list of programmes is on each university's sheet.")}</p>}
          >
            <Chip on={!filters.english} onClick={() => setParam("engleza", undefined)}>{t("Oricare", "Any")}</Chip>
            <Chip on={filters.english === "some"} onClick={() => setParam("engleza", filters.english === "some" ? undefined : "unele")}>
              {t("Cel puțin o licență în engleză", "At least one bachelor's programme in English")}
            </Chip>
            <Chip on={filters.english === "all"} onClick={() => setParam("engleza", filters.english === "all" ? undefined : "toate")}>
              {t("Toate licențele în engleză", "All bachelor's programmes in English")}
            </Chip>
          </Group>

          <Group title={t("Prestigiu (poți alege mai multe)", "Prestige (you can pick several)")}>
            <Chip on={!filters.prestiges} onClick={() => setParam("prestigiu", undefined)}>{t("Oricare", "Any")}</Chip>
            {PRESTIGE_CHOICES.map((p) => (
              <Chip key={p} on={!!filters.prestiges?.includes(p)} onClick={() => toggleMulti("prestigiu", p)}>
                {chipOf[p]}
              </Chip>
            ))}
          </Group>

          <Group title={t("Modalitate de admitere (poți alege mai multe)", "How you are admitted (you can pick several)")} hint={<p>{t("Apar universitățile care au oricare dintre modalitățile alese.", "Universities that use any of the chosen ways are shown.")}</p>}>
            {(Object.keys(ADMISSION_LABEL) as AdmissionType[]).map((a) => (
              <Chip key={a} on={!!filters.admissionTypes?.includes(a)} onClick={() => toggleMulti("admitere", a)}>
                {L.ADMISSION[a]}
              </Chip>
            ))}
          </Group>

          <div className="flex flex-wrap gap-2">
            <Chip on={!!filters.scholarships} onClick={() => setParam("burse", filters.scholarships ? undefined : "1")}>{t("Are burse", "Has scholarships")}</Chip>
            <Chip on={!!filters.dorms} onClick={() => setParam("camin", filters.dorms ? undefined : "1")}>{t("Are cămin", "Has dormitories")}</Chip>
          </div>

          <div>
            <label htmlFor="f-fara" className="text-sm font-extrabold uppercase tracking-wide text-primary">{t("Fără acest certificat", "Without this certificate")}</label>
            <select id="f-fara" value={filters.withoutCertificate ?? ""} onChange={(e) => setParam("fara", e.target.value || undefined)} className={selectClass}>
              <option value="">{t("Oricare", "Any")}</option>
              {(Object.keys(CERTIFICATE_LABEL) as CertificateId[]).map((c) => (
                <option key={c} value={c}>{L.CERTIFICATE[c]}</option>
              ))}
            </select>
          </div>

          <button type="button" onClick={clearFilters} disabled={activeCount === 0} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint disabled:cursor-not-allowed disabled:opacity-40">
            {t("Șterge filtrele", "Clear filters")}
          </button>
        </section>
      )}

      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("Filtre active", "Active filters")}>
          {chips.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onClick={c.remove}
                aria-label={t(`Scoate filtrul ${c.label}`, `Remove filter ${c.label}`)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-tint px-4 text-sm font-bold text-primary-dark transition hover:bg-primary hover:text-white"
              >
                {c.label}
                <span aria-hidden>✕</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">{t(NOTE, NOTE_EN)}</p>

      <h2 className="mt-6 text-2xl font-black tracking-tight text-ink" aria-live="polite">
        {q ? t(`Rezultate pentru „${q}”`, `Results for “${q}”`) : t("Universități pentru tine", "Universities for you")}
      </h2>

      {results.length === 0 ? (
        <div className="mt-4 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line" role="status">
          <NothingFound className="float mx-auto h-24 w-32" />
          <p className="mt-2 text-lg font-black text-ink">{t("Nu am găsit nicio universitate.", "We did not find any university.")}</p>
          {why.map((w) => (
            <p key={w} className="mx-auto mt-2 max-w-xl rounded-2xl bg-teal-tint p-3 text-sm font-bold text-teal-ink">
              {w}
            </p>
          ))}
          <p className="mt-2 text-ink-soft">
            {activeCount === 0
              ? t("Încearcă alt cuvânt, de exemplu un oraș sau o țară.", "Try another word, for example a city or a country.")
              : suggestions.length > 0
                ? t("Filtrele alese nu se potrivesc împreună. Scoate unul dintre ele:", "The chosen filters do not fit together. Remove one of them:")
                : t("Încearcă să scoți unele filtre sau schimbă ce cauți.", "Try removing some filters or change what you are looking for.")}
          </p>
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={s.remove}
                  className="min-h-11 rounded-full bg-primary-tint px-4 text-sm font-bold text-primary-dark transition hover:bg-primary hover:text-white"
                >
                  {t(`Scoate „${s.label}” → ${universitiesCount(s.count)}`, `Remove “${s.label}” → ${universitiesCount(s.count, lang)}`)}
                </button>
              ))}
            </div>
          )}
          {activeCount > 0 && (
            <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-2xl bg-primary px-6 font-bold text-white hover:bg-primary-dark">
              {t("Șterge filtrele", "Clear filters")}
            </button>
          )}
        </div>
      ) : (
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {results.map((u, i) => (
            <li key={u.id}>
              <UniversityCard u={u} rank={q ? undefined : i + 1} domainId={chosenDomains.find((d) => u.domainIds.includes(d))} />
            </li>
          ))}
        </ol>
      )}

      {matches.length > results.length && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={showMore}
            className="min-h-12 rounded-full border-2 border-primary px-8 py-3 font-black text-primary hover:bg-primary-tint"
          >
            {t("Arată încă 10", "Show 10 more")}
          </button>
        </div>
      )}

    </div>
  );
}
