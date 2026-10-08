"use client";
// "Facultăți și programe de licență" on a Romanian university sheet: every faculty and bachelor programme from the official government list, read from the database.
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { ProgramRow, type ProgramView } from "./ProgramRow";

export function OfficialPrograms({ institutionId, city }: { institutionId: string; city: string }) {
  const rows = useQuery(api.catalog.programsOf, { institutionId });
  if (rows === undefined) return <p className="text-sm text-ink-soft">Se încarcă lista oficială de programe...</p>;
  if (rows.length === 0) return null;

  const faculties = new Map<string, ProgramView[]>();
  for (const p of rows) faculties.set(p.faculty, [...(faculties.get(p.faculty) ?? []), p]);

  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line sm:p-6" data-official-programs>
      <h3 className="text-xl font-black tracking-tight text-ink">Facultăți și programe de licență</h3>
      <p className="mt-2 text-sm text-ink-soft">
        {faculties.size} {faculties.size === 1 ? "facultate" : "facultăți"} · {rows.length} programe de licență în anul 2026–2027, după lista oficială a Guvernului. Apasă pe o facultate ca să-i vezi programele.
      </p>
      <ul className="mt-3 space-y-2">
        {[...faculties].map(([name, list]) => {
          const elsewhere = [...new Set(list.map((p) => p.city))].filter((c) => c !== city);
          return (
            <li key={name}>
              <details className="group rounded-2xl bg-paper px-4 py-1 ring-1 ring-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink [&::-webkit-details-marker]:hidden">
                  <span>{name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-soft">
                    {list.length}
                    <span aria-hidden className="text-primary-dark transition-transform group-open:rotate-180">▾</span>
                  </span>
                </summary>
                {elsewhere.length > 0 && <p className="mb-2 text-xs text-ink-soft">Unele cursuri se țin în: {elsewhere.join(", ")}.</p>}
                <ul className="mb-3 space-y-2 [&>li]:bg-card">
                  {list.map((p) => (
                    <ProgramRow key={p.key} p={p} />
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-soft">
        „Locuri” înseamnă numărul maxim de studenți care pot fi înscriși în anul I, la buget și la taxă împreună.{" "}
        <Link href="/surse" className="font-bold text-primary underline underline-offset-2">De unde sunt datele</Link>
      </p>
    </section>
  );
}
