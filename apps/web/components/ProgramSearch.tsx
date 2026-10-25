"use client";
// Search over the bachelor programmes of the catalogue: country, free text, study domain and city; the state lives in the URL so links and Back work.
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { catalogCountries, catalogSheetIds } from "@/lib/catalog";
import { cityName, countryName } from "@/lib/i18n-data";
import { useHref, useLang, useT } from "./LangProvider";
import { ProgramRow } from "./ProgramRow";
import { SearchBox } from "./SearchBox";

const selectClass = "mt-1 min-h-11 w-full rounded-xl border-2 border-transparent bg-paper px-3 text-ink ring-1 ring-line focus:border-primary focus:outline-none";
const labelClass = "text-sm font-extrabold uppercase tracking-wide text-primary";

export function ProgramSearch({ domains }: { domains: { id: string; name: string }[] }) {
  const router = useRouter();
  const lang = useLang();
  const t = useT();
  const href = useHref();
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const country = catalogCountries.find((c) => c.cc === params.get("tara")) ?? catalogCountries[0];
  const domainId = domains.some((d) => d.id === params.get("domeniu")) ? params.get("domeniu")! : "";
  const city = country.cities.includes(params.get("oras") ?? "") ? params.get("oras")! : "";

  function set(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const s = next.toString();
    router.push(href(s ? `/programe?${s}` : "/programe"), { scroll: false });
  }

  const searching = q.length >= 2;
  const found = useQuery(api.catalog.searchPrograms, searching ? { q, country: country.cc, ...(city ? { city } : {}), ...(domainId ? { domainId } : {}) } : "skip");
  const listed = useQuery(api.catalog.programsFor, !searching && domainId ? { domainId, country: country.cc, ...(city ? { city } : {}) } : "skip");
  const rows = searching ? found : domainId ? listed : [];
  const idle = !searching && !domainId;
  const cap = searching ? 40 : 200;

  return (
    <div>
      <SearchBox key={q} initial={q} id="cauta-program" onSearch={(v) => set({ q: v })} />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="p-tara" className={labelClass}>{t("Țara", "Country")}</label>
          <select id="p-tara" value={country.cc} onChange={(e) => set({ tara: e.target.value, oras: "" })} className={selectClass}>
            {catalogCountries.map((c) => (
              <option key={c.cc} value={c.cc}>{countryName(c.name, lang)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-domeniu" className={labelClass}>{t("Domeniu", "Field")}</label>
          <select id="p-domeniu" value={domainId} onChange={(e) => set({ domeniu: e.target.value })} className={selectClass}>
            <option value="">{t("Oricare", "Any")}</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-oras" className={labelClass}>{t("Oraș", "City")}</label>
          <select id="p-oras" value={city} onChange={(e) => set({ oras: e.target.value })} className={selectClass}>
            <option value="">{t("Oricare", "Any")}</option>
            {country.cities.map((c) => (
              <option key={c} value={c}>{cityName(c, lang)}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-soft" data-source-note>
        {countryName(country.name, lang)} ({country.source.year}). {t("Sursa", "Source")}: {country.source.attribution}.
        {country.cc !== "RO" ? t(" Numele programelor sunt în limba sursei.", " Programme names are in the language of the source.") : ""}
      </p>

      <div className="mt-6" aria-live="polite">
        {idle ? (
          <p className="rounded-2xl bg-card p-6 text-ink-soft ring-1 ring-line">{t("Scrie ce cauți (de exemplu „informatică” sau „medicine”) sau alege un domeniu.", "Type what you are looking for (for example “computer science” or “medicine”) or pick a field.")}</p>
        ) : rows === undefined ? (
          <p className="text-ink-soft">{t("Se caută...", "Searching...")}</p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-ink-soft ring-1 ring-line">{t("Nu am găsit programe. Încearcă alt cuvânt, alt oraș sau scoate filtrele.", "We found no programmes. Try another word or city, or remove the filters.")}</p>
        ) : (
          <>
            <h2 className="text-2xl font-black tracking-tight text-ink">
              {t("Programe", "Programmes")}
              {city ? t(` în ${city}`, ` in ${cityName(city, lang)}`) : t(` în ${country.name}`, ` in ${countryName(country.name, lang)}`)}
            </h2>
            {rows.length >= cap && <p className="mt-1 text-sm text-ink-soft">{t("Arătăm doar o parte. Alege un oraș sau scrie mai multe cuvinte ca să restrângi lista.", "We show only some of them. Pick a city or type more words to narrow the list.")}</p>}
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 [&>li]:bg-card [&>li]:ring-1 [&>li]:ring-line" data-program-results>
              {rows.map((p) => (
                <ProgramRow key={p.key} p={p} where sheetIds={catalogSheetIds} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
