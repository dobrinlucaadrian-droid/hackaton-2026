"use client";
// On a result card: real bachelor programmes of the matched study domain in Romania (in the student's chosen cities when there are any), and the other countries where the catalogue has some.
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { catalogCountries } from "@/lib/catalog";
import { cityList } from "@/lib/cities";
import { ProgramRow } from "./ProgramRow";

const SHOWN = 4;
const linkClass = "inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

/** Programmes in Romania for a domain, in the chosen `cities` when they have any. */
export function DomainPrograms({ domainId, cities, sheetIds }: { domainId: string; cities?: string[]; sheetIds: string[] }) {
  const city = cities?.length ? cityList(cities) : undefined;
  const inCity = useQuery(api.catalog.programsFor, cities?.length ? { domainId, country: "RO", cities } : "skip");
  const everywhere = useQuery(api.catalog.programsFor, { domainId, country: "RO" });
  if (everywhere === undefined || (city && inCity === undefined)) return <p className="text-sm text-ink-soft">Se încarcă programele...</p>;
  if (everywhere.length === 0) return null;

  const useCity = !!city && !!inCity && inCity.length > 0;
  const list = useCity ? inCity! : everywhere;
  const href = `/programe?tara=RO&domeniu=${domainId}${useCity && cities?.length === 1 ? `&oras=${encodeURIComponent(cities[0])}` : ""}`;
  return (
    <div data-domain-programs>
      <p className="text-sm text-ink-soft">
        {useCity
          ? `Programe de licență în ${city}, după lista oficială pentru 2026–2027.`
          : city
            ? `În ${city} nu am găsit programe pentru acest domeniu. Iată câteva din restul țării.`
            : `Programe de licență în România, după lista oficială pentru 2026–2027.`}
      </p>
      <ul className="mt-2 space-y-2">
        {list.slice(0, SHOWN).map((p) => (
          <ProgramRow key={p.key} p={p} where sheetIds={sheetIds} />
        ))}
      </ul>
      {list.length > SHOWN && (
        <Link href={href} className={`mt-1 ${linkClass}`}>
          Vezi toate programele →
        </Link>
      )}
    </div>
  );
}

/** The countries other than Romania where the catalogue has programmes of a domain, each linking to the search. */
export function DomainAbroad({ domainId }: { domainId: string }) {
  const rows = catalogCountries.filter((c) => c.cc !== "RO" && (c.domains[domainId] ?? 0) > 0).sort((a, b) => a.name.localeCompare(b.name, "ro"));
  if (rows.length === 0) return null;
  return (
    <div data-domain-abroad>
      <p className="text-sm text-ink-soft">Programe de licență din acest domeniu, din datele oficiale ale fiecărei țări. Apasă pe o țară ca să le vezi.</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {rows.map((c) => (
          <li key={c.cc}>
            <Link href={`/programe?tara=${c.cc}&domeniu=${domainId}`} className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-bold text-ink ring-1 ring-line hover:ring-primary/50">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
