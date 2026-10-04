// One result card: domain, percent ring, reasons, admission, careers and the university lists.
import type { Match, University } from "@/lib/types";
import { UniversityList } from "./UniversityList";

function Ring({ percent, best }: { percent: number; best: boolean }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${percent} la sută potrivire`}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-line" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          className={best ? "stroke-burgundy" : "stroke-burgundy"}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-navy">
        {percent}%
      </span>
    </div>
  );
}

export function MatchCard({ match, rank }: { match: Match; rank: number }) {
  const best = rank === 1;
  const { domain } = match;
  const hasUnis = match.universitiesRo.length > 0 || match.universitiesAbroad.length > 0;
  const lists: { title: string; items: University[]; abroad: boolean }[] = [
    { title: "În România", items: match.universitiesRo, abroad: false },
    { title: "În străinătate", items: match.universitiesAbroad, abroad: true },
  ];
  return (
    <article
      className={`rounded-3xl bg-cream p-6 shadow-sm ${
        best ? "ring-2 ring-burgundy shadow-xl shadow-burgundy/15 sm:p-8" : "ring-1 ring-line"
      }`}
    >
      {best && (
        <p className="mb-3 inline-block rounded-full bg-burgundy px-3 py-1 text-sm font-bold text-cream">
          Cea mai bună potrivire
        </p>
      )}
      <div className="flex items-center gap-4">
        <Ring percent={match.percent} best={best} />
        <div>
          <p className="text-sm font-semibold text-burgundy">Locul {rank}</p>
          <h2 className={`font-bold text-navy ${best ? "text-3xl" : "text-2xl"}`}>{domain.name}</h2>
        </div>
      </div>
      <p className="mt-4 text-navy-soft">{domain.short}</p>

      {match.reasons.length > 0 && (
        <section className="mt-5">
          <h3 className="font-bold text-navy">De ce ți se potrivește</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy-soft">
            {match.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-5">
        <h3 className="font-bold text-navy">Ce îți trebuie la admitere</h3>
        <p className="mt-2 text-navy-soft">{domain.admission}</p>
      </section>

      {domain.careers.length > 0 && (
        <section className="mt-5">
          <h3 className="font-bold text-navy">Ce poți lucra</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {domain.careers.map((c) => (
              <li key={c} className="rounded-full bg-sand px-3 py-1 text-sm font-medium text-navy">
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 border-t border-line pt-5">
        <h3 className="font-bold text-navy">Unde poți studia</h3>
        {hasUnis ? (
          lists
            .filter((l) => l.items.length > 0)
            .map((l) => <UniversityList key={l.title} title={l.title} items={l.items} abroad={l.abroad} />)
        ) : (
          <p className="mt-2 text-navy-soft">
            Nu avem încă facultăți listate pentru această alegere. Caută pe site-urile universităților.
          </p>
        )}
      </section>
    </article>
  );
}
