"use client";
// On a result card: real bachelor programmes of the matched study domain in Romania (in the student's chosen city when there is one), and how many the catalogue has in other countries.
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { catalogCountries } from "@/lib/catalog";
import { ProgramRow } from "./ProgramRow";

const SHOWN = 4;
const linkClass = "inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

/** Programmes in Romania for a domain, in `city` when it has any. */
export function DomainPrograms({ domainId, city, sheetIds }: { domainId: string; city?: string; sheetIds: string[] }) {
  const inCity = useQuery(api.catalog.programsFor, city ? { domainId, country: "RO", city } : "skip");
  const everywhere = useQuery(api.catalog.programsFor, { domainId, country: "RO" });
  if (everywhere === undefined || (city && inCity === undefined)) return <p className="text-sm text-ink-soft">Se încarcă programele...</p>;
  if (everywhere.length === 0) return null;

  const useCity = !!city && !!inCity && inCity.length > 0;
  const list = useCity ? inCity! : everywhere;
  const total = catalogCountries.find((c) => c.cc === "RO")?.domains[domainId] ?? list.length;
  const href = `/programe?tara=RO&domeniu=${domainId}${useCity ? `&oras=${encodeURIComponent(city!)}` : ""}`;
  return (
    <div data-domain-programs>
      <p className="text-sm text-ink-soft">
        {useCity
          ? `${list.length} ${list.length === 1 ? "program" : "programe"} de licență în ${city}, după lista oficială pentru 2026–2027.`
          : city
            ? `În ${city} nu am găsit programe pentru acest domeniu. În toată România sunt ${total}.`
            : `${total} programe de licență în România, după lista oficială pentru 2026–2027.`}
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

/** How many programmes of a domain the catalogue has in each country other than Romania, each linking to the search. */
export function DomainAbroad({ domainId }: { domainId: string }) {
  const rows = catalogCountries.filter((c) => c.cc !== "RO" && (c.domains[domainId] ?? 0) > 0).sort((a, b) => (b.domains[domainId] ?? 0) - (a.domains[domainId] ?? 0));
  if (rows.length === 0) return null;
  return (
    <div data-domain-abroad>
      <p className="text-sm text-ink-soft">Programe de licență din acest domeniu, din datele oficiale ale fiecărei țări. Apasă pe o țară ca să le vezi.</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {rows.map((c) => (
          <li key={c.cc}>
            <Link href={`/programe?tara=${c.cc}&domeniu=${domainId}`} className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-bold text-ink ring-1 ring-line hover:ring-primary/50">
              {c.name} <span className="ml-2 font-semibold text-ink-soft">{c.domains[domainId].toLocaleString("ro-RO")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
