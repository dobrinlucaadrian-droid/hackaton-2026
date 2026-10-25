"use client";
// On a result card, in the page language: real bachelor programmes of the matched study domain in Romania (in the student's chosen cities when there are any), and the other countries where the catalogue has some.
import { useQuery } from "convex/react";
import Link from "@/components/LocalLink";
import { useLang, useT } from "@/components/LangProvider";
import { api } from "@/convex/_generated/api";
import { catalogCountries } from "@/lib/catalog";
import { cityList } from "@/lib/cities";
import { countryName } from "@/lib/i18n-data";
import { ProgramRow } from "./ProgramRow";

const SHOWN = 4;
const linkClass = "inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

/** Programmes in Romania for a domain, in the chosen `cities` when they have any. */
export function DomainPrograms({ domainId, cities, sheetIds }: { domainId: string; cities?: string[]; sheetIds: string[] }) {
  const lang = useLang();
  const t = useT();
  const city = cities?.length ? cityList(cities, lang) : undefined;
  const inCity = useQuery(api.catalog.programsFor, cities?.length ? { domainId, country: "RO", cities } : "skip");
  const everywhere = useQuery(api.catalog.programsFor, { domainId, country: "RO" });
  if (everywhere === undefined || (city && inCity === undefined)) return <p className="text-sm text-ink-soft">{t("Se încarcă programele...", "Loading the programmes...")}</p>;
  if (everywhere.length === 0) return null;

  const useCity = !!city && !!inCity && inCity.length > 0;
  const list = useCity ? inCity! : everywhere;
  const href = `/programe?tara=RO&domeniu=${domainId}${useCity && cities?.length === 1 ? `&oras=${encodeURIComponent(cities[0])}` : ""}`;
  return (
    <div data-domain-programs>
      <p className="text-sm text-ink-soft">
        {useCity
          ? t(`Programe de licență în ${city}, după lista oficială pentru 2026–2027.`, `Bachelor's programmes in ${city}, from the official list for 2026–2027.`)
          : city
            ? t(`În ${city} nu am găsit programe pentru acest domeniu. Iată câteva din restul țării.`, `We found no programmes for this field in ${city}. Here are some from the rest of the country.`)
            : t(`Programe de licență în România, după lista oficială pentru 2026–2027.`, `Bachelor's programmes in Romania, from the official list for 2026–2027.`)}
      </p>
      <ul className="mt-2 space-y-2">
        {list.slice(0, SHOWN).map((p) => (
          <ProgramRow key={p.key} p={p} where sheetIds={sheetIds} />
        ))}
      </ul>
      {list.length > SHOWN && (
        <Link href={href} className={`mt-1 ${linkClass}`}>
          {t("Vezi toate programele →", "See all programmes →")}
        </Link>
      )}
    </div>
  );
}

/** The countries other than Romania where the catalogue has programmes of a domain, each linking to the search. */
export function DomainAbroad({ domainId }: { domainId: string }) {
  const lang = useLang();
  const t = useT();
  const rows = catalogCountries.filter((c) => c.cc !== "RO" && (c.domains[domainId] ?? 0) > 0).sort((a, b) => countryName(a.name, lang).localeCompare(countryName(b.name, lang), lang));
  if (rows.length === 0) return null;
  return (
    <div data-domain-abroad>
      <p className="text-sm text-ink-soft">{t("Programe de licență din acest domeniu, din datele oficiale ale fiecărei țări. Apasă pe o țară ca să le vezi.", "Bachelor's programmes in this field, from each country's official data. Tap a country to see them.")}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {rows.map((c) => (
          <li key={c.cc}>
            <Link href={`/programe?tara=${c.cc}&domeniu=${domainId}`} className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-bold text-ink ring-1 ring-line hover:ring-primary/50">
              {countryName(c.name, lang)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
