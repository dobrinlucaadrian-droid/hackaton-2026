// One university result card: badges, matching domain chips, short about text, admission/scholarship/dorm rows and a link to the full sheet.
import Link from "next/link";
import { domains } from "@/lib/data";
import type { University } from "@/lib/types";
import { ADMISSION_LABEL } from "@/lib/universities";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";
import { BudgetBadge, PrestigeBadge } from "./UniversityBadges";

function Row({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <p className="text-sm text-ink-soft">
      <span className="font-bold text-ink">{label}: </span>
      {text}
    </p>
  );
}

export function UniversityCard({ u, rank, domainId }: { u: University; rank?: number; domainId?: string }) {
  const shownIds = domainId && u.domainIds.includes(domainId) ? [domainId] : u.domainIds.slice(0, 4);
  const admission = u.admissionTypes.map((a) => ADMISSION_LABEL[a]).filter(Boolean).join(", ");
  const schol = u.scholarships ? u.scholarshipsNote || "Are burse." : u.scholarshipsNote || "";
  const dorm = u.dorms ? u.dormsNote || "Are cămin." : u.dormsNote || "";
  return (
    <article className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line">
      <div className="flex items-start gap-3">
        {rank !== undefined && (
          <span aria-label={`Locul ${rank}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-black text-white">
            {rank}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-xl font-black leading-tight tracking-tight text-ink">{u.name}</h3>
          <p className="text-sm text-ink-soft">
            {u.city}, {u.country}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PrestigeBadge prestige={u.prestige} />
        <BudgetBadge budget={u.budget} />
      </div>
      {shownIds.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {shownIds.map((id) => {
            const d = domains.find((x) => x.id === id);
            if (!d) return null;
            const { family, emoji } = domainStyle(id);
            return (
              <li key={id} className={`rounded-full px-3 py-1 text-xs font-semibold ${FAMILY_CLASSES[family].chip}`}>
                <span aria-hidden>{emoji} </span>
                {d.name}
              </li>
            );
          })}
        </ul>
      )}
      {u.about && <p className="mt-3 text-ink-soft">{u.about}</p>}
      <div className="mt-3 space-y-1">
        <Row label="Admitere" text={admission} />
        <Row label="Burse" text={schol} />
        <Row label="Cămin" text={dorm} />
      </div>
      <Link
        href={`/universitati/${u.id}`}
        className="mt-4 inline-flex min-h-11 items-center rounded-2xl bg-primary px-5 font-bold text-white shadow-md shadow-primary/25 transition hover:bg-primary-dark"
      >
        Vezi fișa completă
      </Link>
    </article>
  );
}
