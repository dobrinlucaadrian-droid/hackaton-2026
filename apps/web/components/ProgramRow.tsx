// One bachelor programme from the official list, as a compact row: name and small facts (language, study form, years, places, status).
import Link from "next/link";

export type ProgramView = {
  key: string;
  institutionId: string;
  institutionName: string;
  city: string;
  faculty: string;
  domain: string;
  domainId: string;
  name: string;
  language: string;
  status: "A" | "AP";
  form: "IF" | "IFR" | "ID";
  credits: number;
  years: number;
  maxStudents: number;
};

export const FORM_LABEL: Record<ProgramView["form"], string> = { IF: "cu frecvență", IFR: "frecvență redusă", ID: "la distanță" };

const chip = "rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold text-ink-soft ring-1 ring-line";

/** `where` adds the institution (linked when it has a sheet) and the city: used in lists that mix institutions. */
export function ProgramRow({ p, where, sheetIds }: { p: ProgramView; where?: boolean; sheetIds?: string[] }) {
  return (
    <li className="rounded-2xl bg-paper px-4 py-3" data-program>
      <p className="font-bold leading-snug text-ink">{p.name}</p>
      {where && (
        <p className="mt-0.5 text-sm text-ink-soft">
          {sheetIds?.includes(p.institutionId) ? (
            <Link href={`/universitati/${p.institutionId}`} className="font-semibold text-primary-dark underline decoration-primary/40 underline-offset-2">
              {p.institutionName}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{p.institutionName}</span>
          )}
          {" · "}
          {p.city}
        </p>
      )}
      <p className="mt-1.5 flex flex-wrap gap-1.5">
        {p.language !== "română" && <span className={`${chip} !bg-primary-tint !text-primary-dark`}>limba {p.language}</span>}
        <span className={chip}>{FORM_LABEL[p.form]}</span>
        <span className={chip}>{p.years} ani</span>
        <span className={chip}>{p.maxStudents > 0 ? `cel mult ${p.maxStudents} locuri` : "fără locuri anul acesta"}</span>
        {p.status === "AP" && <span className={`${chip} !bg-teal/15 !text-teal-ink`} title="Program nou, autorizat să funcționeze provizoriu">autorizat provizoriu</span>}
      </p>
    </li>
  );
}
