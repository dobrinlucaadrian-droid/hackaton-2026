// Compact university result card: name, place, badges, three short facts and a link to the full sheet (the whole card is clickable).
import Link from "next/link";
import { domains } from "@/lib/data";
import type { University } from "@/lib/types";
import { ADMISSION_LABEL } from "@/lib/universities";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";
import { BudgetBadge, PrestigeBadge } from "./UniversityBadges";

export function UniversityCard({ u, rank, domainId }: { u: University; rank?: number; domainId?: string }) {
  const admission = u.admissionTypes.map((a) => ADMISSION_LABEL[a]).filter(Boolean).join(", ");
  const domain = domainId && u.domainIds.includes(domainId) ? domains.find((d) => d.id === domainId) : undefined;
  return (
    <article className="relative h-full rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line transition hover:ring-primary/50 focus-within:ring-2 focus-within:ring-primary">
      <div className="flex items-start gap-3">
        {rank !== undefined && (
          <span aria-label={`Locul ${rank}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-black text-white">
            {rank}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-black leading-tight tracking-tight text-ink">{u.name}</h3>
          <p className="text-sm text-ink-soft">
            {u.city}, {u.country}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PrestigeBadge prestige={u.prestige} />
        <BudgetBadge budget={u.budget} />
        {domain && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${FAMILY_CLASSES[domainStyle(domain.id).family].chip}`}>
            <span aria-hidden>{domainStyle(domain.id).emoji} </span>
            {domain.name}
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-0.5 text-sm text-ink-soft">
        {admission && (
          <li>
            <span className="font-bold text-ink">Admitere: </span>
            {admission}
          </li>
        )}
        <li>
          <span className="font-bold text-ink">Burse: </span>
          {u.scholarships ? "da" : "nu"}
          <span aria-hidden> · </span>
          <span className="font-bold text-ink">Cămin: </span>
          {u.dorms ? "da" : "nu"}
        </li>
      </ul>
      <Link
        href={`/universitati/${u.id}`}
        className="mt-3 inline-flex min-h-11 items-center font-bold text-primary after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:outline-none"
      >
        Vezi fișa →
      </Link>
    </article>
  );
}
