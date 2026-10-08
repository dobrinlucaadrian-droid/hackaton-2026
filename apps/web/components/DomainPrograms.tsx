"use client";
// On a result card: real bachelor programmes of the matched study domain in Romania, in the student's chosen city when there is one.
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { ProgramRow } from "./ProgramRow";

const SHOWN = 4;

export function DomainPrograms({ domainId, city, sheetIds }: { domainId: string; city?: string; sheetIds: string[] }) {
  const inCity = useQuery(api.catalog.programsFor, city ? { domainId, country: "RO", city } : "skip");
  const everywhere = useQuery(api.catalog.programsFor, { domainId, country: "RO" });
  if (everywhere === undefined || (city && inCity === undefined)) return <p className="text-sm text-ink-soft">Se încarcă programele...</p>;
  if (everywhere.length === 0) return null;

  const useCity = !!city && !!inCity && inCity.length > 0;
  const list = useCity ? inCity! : everywhere;
  const href = `/programe?domeniu=${domainId}${useCity ? `&oras=${encodeURIComponent(city!)}` : ""}`;
  return (
    <div data-domain-programs>
      <p className="text-sm text-ink-soft">
        {useCity
          ? `${list.length} ${list.length === 1 ? "program" : "programe"} de licență în ${city}, după lista oficială pentru 2026–2027.`
          : city
            ? `În ${city} nu am găsit programe pentru acest domeniu. În toată România sunt ${list.length}${list.length === 200 ? " sau mai multe" : ""}.`
            : `${list.length}${list.length === 200 ? " sau mai multe" : ""} programe de licență în România, după lista oficială pentru 2026–2027.`}
      </p>
      <ul className="mt-2 space-y-2">
        {list.slice(0, SHOWN).map((p) => (
          <ProgramRow key={p.key} p={p} where sheetIds={sheetIds} />
        ))}
      </ul>
      {list.length > SHOWN && (
        <Link href={href} className="mt-1 inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
          Vezi toate programele →
        </Link>
      )}
    </div>
  );
}
