// One study domain as a native <details>: summary with emoji, name, count and chevron; inside the short text, specializations, the subjects per year and a link to universities.
import Link from "next/link";
import type { Domain, Specialization } from "@/lib/types";
import { curriculumFor } from "@/lib/curricula";
import { CurriculumPlan } from "./CurriculumPlan";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";

export function DomainDetails({ domain, specs, open = false }: { domain: Domain; specs: Specialization[]; open?: boolean }) {
  const { family, emoji } = domainStyle(domain.id);
  const f = FAMILY_CLASSES[family];
  return (
    <details open={open} className="group overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${f.band}`}>{emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold leading-tight text-ink">{domain.name}</span>
          <span className="block text-xs text-ink-soft">{specs.length} specializări</span>
        </span>
        <span aria-hidden className="text-primary transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="border-t border-line p-4">
        <p className="text-sm text-ink-soft">{domain.short}</p>
        {specs.length > 0 && (
          <ul className="mt-3 space-y-3">
            {specs.map((s) => (
              <li key={s.id} className="border-l-4 border-line pl-3">
                <p className={`font-bold ${f.text}`}>{s.name}</p>
                <p className="text-xs text-ink-soft">{s.short}</p>
              </li>
            ))}
          </ul>
        )}
        {curriculumFor(domain.id) && (
          <details className="group/plan mt-3 rounded-2xl bg-paper ring-1 ring-line">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 font-bold text-ink [&::-webkit-details-marker]:hidden">
              Ce înveți, an cu an
              <span aria-hidden className="text-primary transition-transform group-open/plan:rotate-180">▾</span>
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
          Vezi universitățile →
        </Link>
      </div>
    </details>
  );
}
