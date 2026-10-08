"use client";
// On a university sheet: every bachelor programme of the institution from its country's official dataset, grouped by faculty (or by field when the source has no faculties), read from the database.
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { domains } from "@/lib/data";
import { ProgramRow, type ProgramView } from "./ProgramRow";

export function OfficialPrograms({ institutionId, city, sourceLabel, year, hasCapacity }: { institutionId: string; city: string; sourceLabel: string; year: string; hasCapacity: boolean }) {
  const rows = useQuery(api.catalog.programsOf, { institutionId });
  if (rows === undefined) return <p className="text-sm text-ink-soft">Se încarcă lista de programe...</p>;
  if (rows.length === 0) return null;

  const byFaculty = rows.some((p) => p.faculty);
  const groups = new Map<string, ProgramView[]>();
  // Some sources give only a classification code as the field label: show the app's own domain name instead.
  const fieldLabel = (p: ProgramView) => (/^ISCED-F/.test(p.domain) ? (domains.find((d) => d.id === p.domainId)?.name ?? "Alte domenii") : p.domain);
  for (const p of rows) {
    const k = byFaculty ? (p.faculty ?? "Alte programe") : fieldLabel(p);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const list = byFaculty ? [...groups] : [...groups].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line sm:p-6" data-official-programs>
      <h3 className="text-xl font-black tracking-tight text-ink">{byFaculty ? "Facultăți și programe de licență" : "Programe de licență, pe domenii"}</h3>
      <p className="mt-2 text-sm text-ink-soft">
        {byFaculty ? `${groups.size} ${groups.size === 1 ? "facultate" : "facultăți"} · ` : ""}
        {rows.length}
        {rows.length === 600 ? " sau mai multe" : ""} programe de licență ({year}), după {sourceLabel}. Apasă pe {byFaculty ? "o facultate" : "un domeniu"} ca să vezi programele.
      </p>
      <ul className="mt-3 space-y-2">
        {list.map(([name, items]) => {
          const elsewhere = [...new Set(items.map((p) => p.city))].filter((c) => c !== city);
          return (
            <li key={name}>
              <details className="group rounded-2xl bg-paper px-4 py-1 ring-1 ring-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink [&::-webkit-details-marker]:hidden">
                  <span>{name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-soft">
                    {items.length}
                    <span aria-hidden className="text-primary-dark transition-transform group-open:rotate-180">▾</span>
                  </span>
                </summary>
                {byFaculty && elsewhere.length > 0 && <p className="mb-2 text-xs text-ink-soft">Unele cursuri se țin în: {elsewhere.join(", ")}.</p>}
                <ul className="mb-3 space-y-2 [&>li]:bg-card">
                  {items.map((p) => (
                    <ProgramRow key={p.key} p={p} />
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-soft">
        {hasCapacity ? "„Locuri” înseamnă numărul maxim de studenți care pot fi înscriși în anul I, la buget și la taxă împreună. " : "Numele programelor sunt în limba sursei. "}
        <Link href="/surse" className="font-bold text-primary underline underline-offset-2">De unde sunt datele</Link>
      </p>
    </section>
  );
}
