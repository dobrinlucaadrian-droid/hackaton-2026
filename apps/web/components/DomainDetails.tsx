"use client";
// One study domain as a native <details> in the drawn look: summary with its category drawing, name and a drawn chevron; inside the short text, the specializations as small cards, the subjects per year and a link to universities.
import { categories } from "@/lib/data";
import { localDomain, localSpecialization } from "@/lib/i18n-data";
import type { Domain, Specialization } from "@/lib/types";
import { curriculumFor } from "@/lib/curricula";
import { CategoryIcon } from "./CategoryIcon";
import { CurriculumPlan } from "./CurriculumPlan";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";

export function DomainDetails({ domain: baseDomain, specs: baseSpecs, open = false }: { domain: Domain; specs: Specialization[]; open?: boolean }) {
  const lang = useLang();
  const t = useT();
  const domain = localDomain(baseDomain, lang);
  const specs = baseSpecs.map((s) => localSpecialization(s, lang));
  const { family } = domainStyle(domain.id);
  const f = FAMILY_CLASSES[family];
  const categoryId = categories.find((c) => c.domainIds.includes(domain.id))?.id ?? "";
  return (
    <details open={open} className="drawn group overflow-hidden rounded-[1.4rem] bg-card [border-width:2.5px] [box-shadow:0_3px_0_var(--color-ink)]">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <CategoryIcon id={categoryId} className="h-11 w-11 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-extrabold leading-tight text-ink">{domain.name}</span>
        </span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-primary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </summary>
      <div className="border-t-2 border-dashed border-line p-4 sm:p-5">
        <p className="text-ink-soft">{domain.short}</p>
        {specs.length > 0 && (
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {specs.map((s) => (
              <li key={s.id} className="rounded-2xl bg-paper px-3.5 py-2.5 ring-2 ring-line">
                <p className={`font-bold ${f.text}`}>{s.name}</p>
                <p className="text-sm text-ink-soft">{s.short}</p>
              </li>
            ))}
          </ul>
        )}
        {curriculumFor(domain.id) && (
          <details className="group/plan mt-4 rounded-2xl bg-teal-tint ring-2 ring-line">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 font-bold text-ink [&::-webkit-details-marker]:hidden">
              {t("Ce înveți, an cu an", "What you study, year by year")}
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-primary transition-transform group-open/plan:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </summary>
            <div className="px-4 pb-4">
              <CurriculumPlan domainId={domain.id} />
            </div>
          </details>
        )}
        <Link
          href={`/universitati?domeniu=${domain.id}`}
          className="mt-3 inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
        >
          {t("Vezi universitățile →", "See the universities →")}
        </Link>
      </div>
    </details>
  );
}
