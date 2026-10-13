"use client";
// On a faculty sheet: the bachelor programmes of that faculty from the official list, read from the database.
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { ProgramRow } from "./ProgramRow";

export function FacultyPrograms({ institutionId, faculty, year }: { institutionId: string; faculty: string; year: string }) {
  const rows = useQuery(api.catalog.programsOf, { institutionId });
  if (rows === undefined) return <p className="text-sm text-ink-soft">Se încarcă lista de programe...</p>;
  const mine = rows.filter((p) => p.faculty === faculty);
  if (mine.length === 0) return <p className="text-sm text-ink-soft">Nu am găsit programele acestei facultăți în lista oficială.</p>;
  return (
    <div data-faculty-programs>
      <p className="text-sm text-ink-soft">
        {mine.length} {mine.length === 1 ? "program" : "programe"} de licență ({year}), după lista oficială.
      </p>
      <ul className="mt-3 space-y-2 [&>li]:bg-paper">
        {mine.map((p) => (
          <ProgramRow key={p.key} p={p} />
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-soft">
        „Locuri” înseamnă numărul maxim de studenți care pot fi înscriși în anul I, la buget și la taxă împreună.{" "}
        <Link href="/surse" className="font-bold text-primary underline underline-offset-2">De unde sunt datele</Link>
      </p>
    </div>
  );
}
