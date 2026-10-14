// On a faculty sheet: the bachelor programmes of that faculty from the official list. Plain markup: the faculty page gives it the rows, read on the server.
import Link from "next/link";
import { counted } from "@/lib/labels";
import { ProgramRow, type ProgramView } from "./ProgramRow";

export function FacultyPrograms({ rows, year }: { rows: ProgramView[]; year: string }) {
  if (rows.length === 0) return <p className="text-sm text-ink-soft">Nu am găsit programele acestei facultăți în lista oficială.</p>;
  return (
    <div data-faculty-programs>
      <p className="text-sm text-ink-soft">
        {counted(rows.length, "program", "programe")} de licență ({year}), după lista oficială.
      </p>
      <ul className="mt-3 space-y-2 [&>li]:bg-paper">
        {rows.map((p) => (
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
