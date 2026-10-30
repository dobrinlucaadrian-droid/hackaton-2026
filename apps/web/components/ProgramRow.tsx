"use client";
// One bachelor programme from the catalogue, as a compact row: name and the small facts its source gives (language, study form, years, places, status) and, for Romania, the last admission average with its official source.
import { cityName, universityName } from "@/lib/i18n-data";
import { languageName } from "@/lib/labels";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";

/** The score of the last candidate admitted in one admission year, from the official results (Romanian programmes only). */
export type AdmissionAverage = { year: string; budget?: number; fee?: number; scale?: number; group?: string; url: string; feeUrl?: string }; // feeUrl: the fee list, when it is a separate document

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
  admission?: AdmissionAverage;
};

export const FORM_LABEL: Record<string, string> = { "full-time": "cu frecvență", "part-time": "frecvență redusă", distance: "la distanță", dual: "dual (cu practică în firmă)" };

const FORM_LABEL_EN: Record<string, string> = { "full-time": "full-time", "part-time": "part-time", distance: "distance learning", dual: "dual (with work placement)" };

const chip = "rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold text-ink-soft ring-1 ring-line";
const score = (n: number, en: boolean) => (en ? String(n) : String(n).replace(".", ","));
const years = (n: number, en: boolean) => (en ? `${n} years` : Number.isInteger(n) ? `${n} ani` : `${String(n).replace(".", ",")} ani`);

/** `where` adds the institution (linked when it has a sheet) and the city: used in lists that mix institutions. */
export function ProgramRow({ p, where, sheetIds }: { p: ProgramView; where?: boolean; sheetIds?: string[] }) {
  const lang = useLang();
  const t = useT();
  const en = lang === "en";
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
              {universityName({ id: p.institutionId, name: p.institutionName }, lang)}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{universityName({ id: p.institutionId, name: p.institutionName }, lang)}</span>
          )}
          {" · "}
          {cityName(p.city, lang)}
        </p>
      )}
      <p className="mt-1.5 flex flex-wrap gap-1.5">
        {p.language !== "română" && p.language !== "nespecificată" && <span className={`${chip} !bg-primary-tint !text-primary-dark`}>{en ? `taught in ${languageName(p.language, lang)}` : `limba ${p.language}`}</span>}
        {p.form && FORM_LABEL[p.form] && <span className={chip}>{en ? FORM_LABEL_EN[p.form] : FORM_LABEL[p.form]}</span>}
        {p.years !== undefined && <span className={chip}>{years(p.years, en)}</span>}
        {p.maxStudents !== undefined && <span className={chip}>{p.maxStudents > 0 ? t(`cel mult ${p.maxStudents} locuri`, `up to ${p.maxStudents} places`) : t("fără locuri anul acesta", "no places this year")}</span>}
        {p.status && /provizoriu/.test(p.status) && (
          <span className={`${chip} !bg-teal/15 !text-teal-ink`} title={t("Program nou, autorizat să funcționeze provizoriu", "New programme, provisionally authorised to run")}>
            {t("autorizat provizoriu", "provisionally authorised")}
          </span>
        )}
      </p>
      {p.admission && (
        <p className="mt-1.5 text-sm text-ink-soft" data-admission>
          <span className="font-semibold text-ink">{t(`Ultima medie de intrare, iulie ${p.admission.year}`, `Last admission score, July ${p.admission.year}`)}:</span>{" "}
          {[
            p.admission.budget !== undefined && `${t("buget", "state-funded")} ${score(p.admission.budget, en)}`,
            p.admission.fee !== undefined && `${t("taxă", "fee-paying")} ${score(p.admission.fee, en)}`,
          ]
            .filter(Boolean)
            .join(" · ")}
          {p.admission.scale && p.admission.scale !== 10 ? t(` (puncte din ${p.admission.scale})`, ` (points out of ${p.admission.scale})`) : ""}
          {p.admission.group ? t(` (lista comună: ${p.admission.group})`, ` (common list: ${p.admission.group})`) : ""}{" "}
          <a href={p.admission.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline decoration-primary/40 underline-offset-2">
            {p.admission.feeUrl ? t("rezultate buget", "state-funded results") : t("rezultate oficiale", "official results")} <span aria-hidden>↗</span>
          </a>
          {p.admission.feeUrl && (
            <>
              {" · "}
              <a href={p.admission.feeUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline decoration-primary/40 underline-offset-2">
                {t("rezultate taxă", "fee-paying results")} <span aria-hidden>↗</span>
              </a>
            </>
          )}
        </p>
      )}
    </li>
  );
}
