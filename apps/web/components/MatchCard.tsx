// One result card: tinted header band with emoji and animated percent ring, reasons, admission, careers and universities.
import type { CSSProperties } from "react";
import type { Match, University } from "@/lib/types";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";
import { UniversityList } from "./UniversityList";

function Ring({ percent, stroke }: { percent: number; stroke: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${percent} la sută potrivire`}>
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

export function MatchCard({ match, rank }: { match: Match; rank: number }) {
  const best = rank === 1;
  const { domain } = match;
  const { family, emoji } = domainStyle(domain.id);
  const f = FAMILY_CLASSES[family];
  const hasUnis = match.universitiesRo.length > 0 || match.universitiesAbroad.length > 0;
  const lists: { title: string; items: University[]; abroad: boolean }[] = [
    { title: "În România", items: match.universitiesRo, abroad: false },
    { title: "În străinătate", items: match.universitiesAbroad, abroad: true },
  ];
  return (
    <article
      className={`overflow-hidden rounded-3xl bg-card shadow-sm ${
        best ? `ring-2 ${f.ring} shadow-xl shadow-primary/15` : "ring-1 ring-line"
      }`}
    >
      <div className={`${f.band} p-6 ${best ? "sm:p-8" : ""}`}>
        {best && (
          <p className={`mb-3 inline-block rounded-full ${f.badge} px-3 py-1 text-sm font-bold text-white`}>
            Cea mai bună potrivire
          </p>
        )}
        <div className="flex items-center gap-4">
          <Ring percent={match.percent} stroke={f.stroke} />
          <div>
            <p className={`text-sm font-bold ${f.text}`}>Locul {rank}</p>
            <h2 className={`flex items-center gap-2 font-black leading-tight tracking-tight text-ink ${best ? "text-3xl" : "text-2xl"}`}>
              <span aria-hidden className="shrink-0">{emoji}</span>
              <span>{domain.name}</span>
            </h2>
          </div>
        </div>
        <p className="mt-4 text-ink-soft">{domain.short}</p>
      </div>

      <div className={`p-6 ${best ? "sm:p-8" : ""}`}>
        {match.reasons.length > 0 && (
          <section>
            <h3 className="font-extrabold text-ink">De ce ți se potrivește</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft marker:text-primary">
              {match.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-5">
          <h3 className="font-extrabold text-ink">Ce îți trebuie la admitere</h3>
          <p className="mt-2 text-ink-soft">{domain.admission}</p>
        </section>

        {domain.careers.length > 0 && (
          <section className="mt-5">
            <h3 className="font-extrabold text-ink">Ce poți lucra</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {domain.careers.map((c) => (
                <li key={c} className={`rounded-full px-3 py-1 text-sm font-semibold ${f.chip}`}>
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6 border-t border-line pt-5">
          <h3 className="font-extrabold text-ink">Unde poți studia</h3>
          {hasUnis ? (
            lists
              .filter((l) => l.items.length > 0)
              .map((l) => <UniversityList key={l.title} title={l.title} items={l.items} abroad={l.abroad} />)
          ) : (
            <p className="mt-2 text-ink-soft">
              Nu avem încă facultăți listate pentru această alegere. Caută pe site-urile universităților.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
