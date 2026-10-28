// The list of an institution's bachelor programmes, grouped by faculty (or by field when the source has no faculties). Plain markup, so a page can render it on the server; the page language comes in as `lang`.
import { domains } from "@/lib/data";
import { tr, type Lang } from "@/lib/i18n";
import { cityName, localDomain } from "@/lib/i18n-data";
import Link from "./LocalLink";
import { ProgramRow, type ProgramView } from "./ProgramRow";

export type ProgramGroupsProps = {
  rows: ProgramView[];
  city: string;
  sourceLabel: string;
  year: string;
  hasCapacity: boolean;
  facultyLinks?: Record<string, string>; // faculty name -> address of its own sheet, for the faculties that have one
  lang?: Lang; // the page language (Romanian when missing)
};

export function ProgramGroups({ rows, city, sourceLabel, year, hasCapacity, facultyLinks = {}, lang = "ro" }: ProgramGroupsProps) {
  const t = tr(lang);
  if (rows.length === 0) return null;

  const byFaculty = rows.some((p) => p.faculty);
  const groups = new Map<string, ProgramView[]>();
  // Some sources give only a classification code as the field label: show the app's own domain name instead.
  const fieldLabel = (p: ProgramView) => (/^ISCED-F/.test(p.domain) ? (localDomain(domains.find((d) => d.id === p.domainId) ?? { id: "", name: t("Alte domenii", "Other fields") } as (typeof domains)[number], lang).name) : p.domain);
  for (const p of rows) {
    const k = byFaculty ? (p.faculty ?? t("Alte programe", "Other programmes")) : fieldLabel(p);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const list = byFaculty ? [...groups] : [...groups].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line sm:p-6" data-official-programs>
      <h3 className="text-xl font-black tracking-tight text-ink">{byFaculty ? t("Facultăți și programe de licență", "Faculties and bachelor's programmes") : t("Programe de licență, pe domenii", "Bachelor's programmes, by field")}</h3>
      <p className="mt-2 text-sm text-ink-soft">
        {t(`Programele de licență (${year}), după ${sourceLabel}. Apasă pe ${byFaculty ? "o facultate" : "un domeniu"} ca să vezi programele.`, `Bachelor's programmes (${year}), from ${sourceLabel}. Tap ${byFaculty ? "a faculty" : "a field"} to see its programmes.`)}
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
                    <span aria-hidden className="text-primary-dark transition-transform group-open:rotate-180">▾</span>
                  </span>
                </summary>
                {byFaculty && facultyLinks[name] && (
                  <Link href={facultyLinks[name]} className="mb-2 inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
                    {t("Vezi fișa facultății →", "See the faculty sheet →")}
                  </Link>
                )}
                {byFaculty && elsewhere.length > 0 && <p className="mb-2 text-xs text-ink-soft">{t("Unele cursuri se țin în", "Some courses are taught in")}: {elsewhere.map((c) => cityName(c, lang)).join(", ")}.</p>}
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
        {hasCapacity
          ? t("„Locuri” înseamnă numărul maxim de studenți care pot fi înscriși în anul I, la buget și la taxă împreună. ", "“Places” is the maximum number of students who can enrol in the first year, state-funded and fee-paying places together. ")
          : t("Numele programelor sunt în limba sursei. ", "Programme names are in the language of the source. ")}
        {rows.some((p) => p.admission) && t("„Ultima medie de intrare” este media ultimului candidat admis în sesiunea din iulie, din rezultatele oficiale ale facultății (fără locurile speciale, de exemplu pentru romi sau pentru absolvenții din mediul rural); anul acesta poate fi alta. ", "“Last admission score” is the score of the last candidate admitted in the July session, from the faculty's official results (not counting special places, e.g. for Roma or rural graduates); this year it may differ. ")}
        <Link href="/surse" className="font-bold text-primary underline underline-offset-2">{t("De unde sunt datele", "Where the data comes from")}</Link>
      </p>
    </section>
  );
}
