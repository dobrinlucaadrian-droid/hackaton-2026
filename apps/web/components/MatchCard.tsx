// One result card, in the page language: the best match is a full emphasised card, the others are collapsed rows that open on tap; details sit in compact rows.
import type { CSSProperties, ReactNode } from "react";
import Link from "@/components/LocalLink";
import { useLang, useT } from "@/components/LangProvider";
import { cityList } from "@/lib/cities";
import type { Match, StudyPlace, UniversitySummary } from "@/lib/types";
import { curriculumFor } from "@/lib/curricula";
import { CurriculumPlan } from "./CurriculumPlan";
import { DomainAbroad, DomainPrograms } from "./DomainPrograms";
import { catalogCountries } from "@/lib/catalog";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";
import { UniversityList } from "./UniversityList";

function Ring({ percent, stroke }: { percent: number; stroke: string }) {
  const t = useT();
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={t(`${percent} la sută potrivire`, `${percent} percent match`)}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-white" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          style={{ "--c": c } as CSSProperties}
          className={`ring-anim ${stroke}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-ink">{percent}%</span>
    </div>
  );
}

/** A closed-by-default row with a label and a rotating chevron. */
function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl bg-paper ring-1 ring-line">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 font-extrabold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-primary transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export function MatchCard({ match, rank, where, cities }: { match: Match; rank: number; where?: StudyPlace; cities?: string[] }) {
  const lang = useLang();
  const t = useT();
  const best = rank === 1;
  const { domain } = match;
  const { family, emoji } = domainStyle(domain.id);
  const f = FAMILY_CLASSES[family];
  const regionParam = where === "ro" ? "&regiune=ro" : where === "abroad" ? "&regiune=abroad" : "";
  // The chosen cities are used in titles and links only when they really have universities for this domain.
  const chosen = cities?.length ? cities : undefined;
  const inCity = chosen && !match.cityMissing ? cityList(chosen, lang) : undefined;
  // The link to the university search carries every chosen city.
  const cityParam = inCity && chosen ? chosen.map((c) => `&oras=${encodeURIComponent(c)}`).join("") : "";
  const hasUnis = match.universitiesRo.length > 0 || match.universitiesAbroad.length > 0;
  const lists: { title: string; items: UniversitySummary[]; abroad: boolean }[] = [
    { title: inCity ? t(`În ${inCity}`, `In ${inCity}`) : match.cityMissing ? t("În alte orașe din România", "In other cities in Romania") : t("În România", "In Romania"), items: match.universitiesRo, abroad: false },
    { title: t("În străinătate", "Abroad"), items: match.universitiesAbroad, abroad: true },
  ];
  const base = `/universitati?domeniu=${domain.id}`;

  const body = (
    <div className={`space-y-3 p-6 ${best ? "sm:p-8" : ""}`}>
      {match.reasons.length > 0 && (
        <section>
          <h3 className="font-extrabold text-ink">{t("De ce ți se potrivește", "Why it suits you")}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft marker:text-primary">
            {match.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <Row title={t("Ce îți trebuie la admitere", "What you need to get in")}>
        <p className="text-ink-soft">{domain.admission}</p>
      </Row>

      {domain.careers.length > 0 && (
        <Row title={t("Ce poți lucra", "What you can work as")}>
          <ul className="flex flex-wrap gap-2">
            {domain.careers.map((c) => (
              <li key={c} className={`rounded-full px-3 py-1 text-sm font-semibold ${f.chip}`}>
                {c}
              </li>
            ))}
          </ul>
        </Row>
      )}

      {match.specializations.length > 0 && (
        <Row title={t("Specializări care ți se potrivesc", "Specialisations that suit you")}>
          <ul className="space-y-2">
            {match.specializations.map((s) => (
              <li key={s.id} className={`rounded-xl ${f.band} px-4 py-3`}>
                <p className={`font-bold ${f.text}`}>{s.name}</p>
                {s.short && <p className="text-sm text-ink-soft">{s.short}</p>}
              </li>
            ))}
          </ul>
        </Row>
      )}

      {curriculumFor(domain.id) && (
        <Row title={t("Ce înveți, an cu an", "What you learn, year by year")}>
          <CurriculumPlan domainId={domain.id} />
        </Row>
      )}

      {where !== "abroad" && (
        <Row title={chosen ? t(`Programe de licență în ${cityList(chosen)}`, `Bachelor's programmes in ${cityList(chosen, lang)}`) : t("Programe de licență în România", "Bachelor's programmes in Romania")}>
          <DomainPrograms domainId={domain.id} cities={chosen} sheetIds={[...match.universitiesRo, ...match.universitiesAbroad].map((u) => u.id)} />
        </Row>
      )}
      {where !== "ro" && catalogCountries.some((c) => c.cc !== "RO" && (c.domains[domain.id] ?? 0) > 0) && (
        <Row title={t("Programe de licență în alte țări", "Bachelor's programmes in other countries")}>
          <DomainAbroad domainId={domain.id} />
        </Row>
      )}

      <section className="border-t border-line pt-4">
        <h3 className="font-extrabold text-ink">{t("Unde poți studia", "Where you can study")}</h3>
        {match.cityMissing && match.universitiesRo.length > 0 && (
          <p className="mt-2 rounded-xl bg-primary-tint px-4 py-3 text-sm text-primary-dark" role="note">
            {t(
              `În ${match.cityMissing} nu am găsit universități pentru acest domeniu. Iată din alte orașe:`,
              `We found no universities for this field in ${match.cityMissing}. Here are some from other cities:`,
            )}
          </p>
        )}
        {hasUnis ? (
          lists
            .filter((l) => l.items.length > 0)
            .map((l) => (
              <UniversityList key={l.title} title={l.title} items={l.items} abroad={l.abroad} allHref={`${base}&regiune=${l.abroad ? "abroad" : `ro${cityParam}`}`} />
            ))
        ) : (
          <p className="mt-2 text-ink-soft">
            {t(
              "Nu avem încă facultăți listate pentru această alegere. Caută pe site-urile universităților.",
              "We have no faculties listed for this choice yet. Look on the universities' websites.",
            )}
          </p>
        )}
      </section>

      <Link
        href={`${base}${regionParam}${where === "ro" ? cityParam : ""}`}
        className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-6 py-3 text-center font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98]"
      >
        {t("Vezi universitățile pentru acest domeniu", "See the universities for this field")}
      </Link>
    </div>
  );

  if (best) {
    return (
      <article className={`overflow-hidden rounded-3xl bg-card shadow-xl shadow-primary/15 ring-2 ${f.ring}`}>
        <div className={`${f.band} p-6 sm:p-8`}>
          <p className={`mb-3 inline-block rounded-full ${f.badge} px-3 py-1 text-sm font-bold text-white`}>{t("Cea mai bună potrivire", "Best match")}</p>
          <div className="flex items-center gap-4">
            <Ring percent={match.percent} stroke={f.stroke} />
            <div className="min-w-0">
              <p className={`text-sm font-bold ${f.text}`}>{t(`Locul ${rank}`, `Place ${rank}`)}</p>
              {/* On a phone the title is smaller and the emoji is hidden, so a long word such as "kinetoterapie" fits on one line. */}
              <h2 className="flex items-center gap-2 text-xl font-black leading-tight tracking-tight text-ink sm:text-3xl">
                <span aria-hidden className="hidden shrink-0 sm:inline">{emoji}</span>
                <span className="min-w-0 hyphens-auto break-words">{domain.name}</span>
              </h2>
            </div>
          </div>
          <p className="mt-4 text-ink-soft">{domain.short}</p>
        </div>
        {body}
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-line">
      <details className="group">
        <summary className={`flex min-h-20 cursor-pointer list-none items-center gap-3 ${f.band} p-4 [&::-webkit-details-marker]:hidden`}>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${f.badge} text-sm font-black text-white`}>{rank}</span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-black leading-tight text-ink">
              <span aria-hidden>{emoji}</span>
              <span>{domain.name}</span>
            </span>
            {match.reasons[0] && <span className="mt-0.5 block truncate text-sm text-ink-soft">{match.reasons[0]}</span>}
          </span>
          <span className="shrink-0 text-lg font-black text-ink">{match.percent}%</span>
          <span aria-hidden className="shrink-0 text-primary transition-transform group-open:rotate-180">▾</span>
        </summary>
        <p className="px-6 pt-4 text-ink-soft">{domain.short}</p>
        {body}
      </details>
    </article>
  );
}
