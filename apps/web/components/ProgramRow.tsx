// One bachelor programme from the catalogue, as a compact row: name and the small facts its source gives (language, study form, years, places, status).
import Link from "next/link";

export type ProgramView = {
  key: string;
  country: string;
  institutionId: string;
  institutionName: string;
  city: string;
  faculty?: string;
  domain: string;
  domainId?: string;
  name: string;
  language: string;
  form?: string;
  credits?: number;
  years?: number;
  maxStudents?: number;
  status?: string;
  url?: string;
};

export const FORM_LABEL: Record<string, string> = { "full-time": "cu frecvență", "part-time": "frecvență redusă", distance: "la distanță", dual: "dual (cu practică în firmă)" };

const chip = "rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold text-ink-soft ring-1 ring-line";
const years = (n: number) => (Number.isInteger(n) ? `${n} ani` : `${String(n).replace(".", ",")} ani`);

/** `where` adds the institution (linked when it has a sheet) and the city: used in lists that mix institutions. */
export function ProgramRow({ p, where, sheetIds }: { p: ProgramView; where?: boolean; sheetIds?: string[] }) {
  return (
    <li className="rounded-2xl bg-paper px-4 py-3" data-program>
      <p className="font-bold leading-snug text-ink">
        {p.url ? (
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
            {p.name} <span aria-hidden>↗</span>
          </a>
        ) : (
          p.name
        )}
      </p>
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
        {p.language !== "română" && p.language !== "nespecificată" && <span className={`${chip} !bg-primary-tint !text-primary-dark`}>limba {p.language}</span>}
        {p.form && FORM_LABEL[p.form] && <span className={chip}>{FORM_LABEL[p.form]}</span>}
        {p.years !== undefined && <span className={chip}>{years(p.years)}</span>}
        {p.maxStudents !== undefined && <span className={chip}>{p.maxStudents > 0 ? `cel mult ${p.maxStudents} locuri` : "fără locuri anul acesta"}</span>}
        {p.status && /provizoriu/.test(p.status) && (
          <span className={`${chip} !bg-teal/15 !text-teal-ink`} title="Program nou, autorizat să funcționeze provizoriu">
            autorizat provizoriu
          </span>
        )}
      </p>
    </li>
  );
}
