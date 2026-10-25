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
    <article className="relative h-full rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line transition hover:ring-primary/50 focus-within:ring-2 focus-within:ring-primary">
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton compact university={{ universityId: u.id, name: u.name, place: `${u.city}, ${u.country}` }} />
      </div>
      <div className="flex items-start gap-3 pr-12">
        {rank !== undefined && (
          <span aria-label={t(`Locul ${rank}`, `Place ${rank}`)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-black text-white">
            {rank}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-black leading-tight tracking-tight text-ink">{universityName(u, lang)}</h3>
          <p className="text-sm text-ink-soft">
            {cityName(u.city, lang)}, {countryName(u.country, lang)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PrestigeBadge prestige={u.prestige} />
        <BudgetBadge budget={u.budget} />
        {domain && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${FAMILY_CLASSES[domainStyle(domain.id).family].chip}`}>
            <span aria-hidden>{domainStyle(domain.id).emoji} </span>
            {domainShown?.name}
          </span>
        )}
        {opinions > 0 && (
          <span data-opinions className="rounded-full bg-teal/15 px-3 py-1 text-xs font-bold text-teal-ink">
            <span aria-hidden>💬 </span>
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
