// On a faculty sheet: the bachelor programmes of that faculty from the official list. Plain markup: the faculty page gives it the rows (read on the server) and the page language.
import { tr, type Lang } from "@/lib/i18n";
import Link from "./LocalLink";
import { ProgramRow, type ProgramView } from "./ProgramRow";

export function FacultyPrograms({ rows, year, lang = "ro" }: { rows: ProgramView[]; year: string; lang?: Lang }) {
  const t = tr(lang);
  if (rows.length === 0) return <p className="text-sm text-ink-soft">{t("Nu am găsit programele acestei facultăți în lista oficială.", "We did not find this faculty's programmes in the official list.")}</p>;
  return (
    <div data-faculty-programs>
      <p className="text-sm text-ink-soft">
        {t(`Programele de licență (${year}), după lista oficială.`, `Bachelor's programmes (${year}), from the official list.`)}
      </p>
      <ul className="mt-3 space-y-2 [&>li]:bg-paper">
        {rows.map((p) => (
          <ProgramRow key={p.key} p={p} />
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-soft">
        {t("„Locuri” înseamnă numărul maxim de studenți care pot fi înscriși în anul I, la buget și la taxă împreună.", "“Places” is the maximum number of students who can enrol in the first year, state-funded and fee-paying places together.")}{" "}
        <Link href="/surse" className="font-bold text-primary underline underline-offset-2">{t("De unde sunt datele", "Where the data comes from")}</Link>
      </p>
    </div>
  );
}
