"use client";
// Labelled list of the first 3 universities with links, then a "Vezi toate (N)" link to the full search.
import { cityName, countryName, universityName } from "@/lib/i18n-data";
import type { UniversitySummary } from "@/lib/types";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";

const LIMIT = 3;

export function UniversityList({ title, items, abroad, allHref }: { title: string; items: UniversitySummary[]; abroad: boolean; allHref: string }) {
  const lang = useLang();
  const t = useT();
  const shown = items.slice(0, LIMIT);
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-dark">{title}</h4>
      <ul className="mt-2 space-y-2">
        {shown.map((u) => (
          <li key={u.id} className="rounded-xl bg-paper px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/universitati/${u.id}`}
                className="font-semibold text-primary-dark underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
              >
                {universityName(u, lang)}
              </Link>
              <a
                href={u.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`Site-ul ${u.name} (se deschide într-o pagină nouă)`, `${universityName(u, lang)} website (opens in a new page)`)}
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-ink-soft hover:text-primary"
              >
                {t("Site ↗", "Website ↗")}
              </a>
            </div>
            <p className="text-sm text-ink-soft">
              {abroad ? `${cityName(u.city, lang)}, ${countryName(u.country, lang)}` : cityName(u.city, lang)}
              {abroad && u.language ? ` · ${t("limba", "language")}: ${u.language}` : ""}
              {abroad && u.tuition ? ` · ${t("taxe", "fees")}: ${u.tuition}` : ""}
            </p>
          </li>
        ))}
      </ul>
      {items.length > LIMIT && (
        <Link href={allHref} className="mt-1 inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
          {t("Vezi toate →", "See all →")}
        </Link>
      )}
    </div>
  );
}
