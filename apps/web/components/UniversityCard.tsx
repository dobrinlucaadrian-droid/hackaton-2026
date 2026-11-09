// Compact university result card: name, place, badges, three short facts, whether we have student opinions, a heart for the favourites and a link to the full sheet (the whole card is clickable, the heart sits above it).
import { domains } from "@/lib/data";
import { cityName, countryName, localDomain, universityName } from "@/lib/i18n-data";
import type { UniversitySummary } from "@/lib/types";
import { useTestimonialsFor } from "@/lib/useTestimonials";
import { labelsFor } from "@/lib/labels";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";
import { FavoriteButton } from "./FavoriteButton";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";
import { BudgetBadge, PrestigeBadge } from "./UniversityBadges";

export function UniversityCard({ u, rank, domainId }: { u: UniversitySummary; rank?: number; domainId?: string }) {
  const lang = useLang();
  const t = useT();
  const admission = u.admissionTypes.map((a) => labelsFor(lang).ADMISSION[a]).filter(Boolean).join(", ");
  const opinions = useTestimonialsFor(u.id).length;
  const domain = domainId && u.domainIds.includes(domainId) ? domains.find((d) => d.id === domainId) : undefined;
  const domainShown = domain ? localDomain(domain, lang) : undefined;
  return (
    <article className="drawn drawn-link relative h-full rounded-[1.6rem] bg-card p-5 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-primary">
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton compact university={{ universityId: u.id, name: u.name, place: `${u.city}, ${u.country}` }} />
      </div>
      <div className="flex items-start gap-3 pr-12">
        {rank !== undefined && (
          <span aria-label={t(`Locul ${rank}`, `Place ${rank}`)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-primary font-extrabold text-white">
            {rank}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold leading-tight tracking-tight text-ink">{universityName(u, lang)}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
            {cityName(u.city, lang)}, {countryName(u.country, lang)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PrestigeBadge prestige={u.prestige} />
        <BudgetBadge budget={u.budget} />
        {domain && (
          <span className={`rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${FAMILY_CLASSES[domainStyle(domain.id).family].chip}`}>
            {domainShown?.name}
          </span>
        )}
        {opinions > 0 && (
          <span data-opinions className="hand inline-flex items-center gap-1 text-lg leading-none text-primary">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4z" /></svg>
            {opinions === 1 ? t("o părere de la un student", "one opinion from a student") : t("păreri de la studenți", "opinions from students")}
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-0.5 text-sm text-ink-soft">
        {admission && (
          <li>
            <span className="font-bold text-ink">{t("Admitere: ", "Admission: ")}</span>
            {admission}
          </li>
        )}
        <li>
          <span className="font-bold text-ink">{t("Burse: ", "Scholarships: ")}</span>
          {u.scholarships ? t("da", "yes") : t("nu", "no")}
          <span aria-hidden> · </span>
          <span className="font-bold text-ink">{t("Cămin: ", "Dorm: ")}</span>
          {u.dorms ? t("da", "yes") : t("nu", "no")}
        </li>
      </ul>
      <Link
        href={`/universitati/${u.id}`}
        className="mt-3 inline-flex min-h-11 items-center font-bold text-primary after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:outline-none"
      >
        {t("Vezi fișa →", "See the sheet →")}
      </Link>
    </article>
  );
}
