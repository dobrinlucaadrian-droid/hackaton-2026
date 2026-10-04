"use client";
// "Ce îți place?": the student picks up to three interests and sees the specializations that fit them best, ranked, with links to universities.
import Link from "next/link";
import { useMemo, useState } from "react";
import { domains, specializations } from "@/lib/data";
import { TRAITS, TRAIT_LABEL } from "@/lib/match";
import type { TraitId } from "@/lib/types";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";

const MAX_PICKS = 3;
const SHOWN = 6;

/** How well a specialization fits the picked interests: cosine similarity between its traits and the picks (0..1). */
function fit(traits: Partial<Record<TraitId, number>>, picked: TraitId[]): number {
  let dot = 0;
  let norm = 0;
  for (const t of TRAITS) {
    const v = traits[t] ?? 0;
    norm += v * v;
    if (picked.includes(t)) dot += v;
  }
  if (norm === 0 || picked.length === 0) return 0;
  return dot / (Math.sqrt(norm) * Math.sqrt(picked.length));
}

export function InterestPicker() {
  const [picked, setPicked] = useState<TraitId[]>([]);

  function toggle(t: TraitId) {
    setPicked((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.length < MAX_PICKS ? [...cur, t] : cur));
  }

  const results = useMemo(() => {
    if (picked.length === 0) return [];
    return specializations
      .map((s) => ({ s, score: fit(s.traits, picked) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.s.name.localeCompare(b.s.name, "ro"))
      .slice(0, SHOWN);
  }, [picked]);

  const full = picked.length >= MAX_PICKS;

  return (
    <section aria-labelledby="ce-iti-place" className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <h2 id="ce-iti-place" className="text-2xl font-black tracking-tight text-ink">
        Nu știi de unde să începi?
      </h2>
      <p className="mt-1 text-ink-soft">
        Alege până la {MAX_PICKS} lucruri care ți se potrivesc și îți arătăm specializările apropiate de ele.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TRAITS.map((t) => {
          const on = picked.includes(t);
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => toggle(t)}
              className={`opt min-h-11 rounded-full border-2 px-4 py-2 text-sm font-bold ${
                on
                  ? "border-primary bg-primary text-white"
                  : "border-transparent bg-paper text-ink ring-1 ring-line hover:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              {TRAIT_LABEL[t]}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-ink-soft" aria-live="polite">
        {picked.length === 0
          ? "Încă nu ai ales nimic."
          : full
            ? `Ai ales ${MAX_PICKS}. Scoate una ca să alegi alta.`
            : `Ai ales ${picked.length} din ${MAX_PICKS}.`}
      </p>

      {results.length > 0 && (
        <>
          <h3 className="mt-5 text-lg font-black text-ink">Specializări care se potrivesc cu ce ai ales</h3>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2">
            {results.map(({ s, score }, i) => {
              const domain = domains.find((d) => d.id === s.domainId);
              const style = domainStyle(s.domainId);
              const family = FAMILY_CLASSES[style.family];
              return (
                <li key={s.id} className={`rounded-2xl p-4 ${family.band}`}>
                  <p className={`flex items-center justify-between gap-2 text-sm font-bold ${family.text}`}>
                    <span>
                      <span aria-hidden className="mr-1">{style.emoji}</span>
                      {domain?.name}
                    </span>
                    <span className="shrink-0">
                      {i + 1}. · potrivire {Math.min(97, Math.round(score * 100))}%
                    </span>
                  </p>
                  <p className="mt-1 text-lg font-black tracking-tight text-ink">{s.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{s.short}</p>
                  <Link
                    href={`/universitati?domeniu=${s.domainId}`}
                    className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
                  >
                    Vezi universitățile unde se studiază →
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-soft">
              Acesta e doar un prim pas. Chestionarul ține cont și de profilul tău de liceu și de ce ai făcut până acum.
            </p>
            <Link
              href="/test"
              className="inline-flex min-h-11 shrink-0 items-center rounded-2xl bg-primary px-5 py-2 font-black text-white shadow-lg shadow-primary/30 hover:bg-primary-dark"
            >
              Completează chestionarul
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
