"use client";
// "Ce îți place?": the student picks up to three interests and sees the specializations that fit them best, ranked, with links to universities (in the page language).
import { useMemo, useState } from "react";
import { domains, specializations } from "@/lib/data";
import { localDomain, localSpecialization } from "@/lib/i18n-data";
import { TRAITS, TRAIT_LABEL } from "@/lib/traits";
import type { TraitId } from "@/lib/types";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";

const TRAIT_LABEL_EN: Record<TraitId, string> = {
  logic: "Logic and numbers",
  tehnic: "Technology and building",
  stiinte: "Science and nature",
  ingrijire: "Caring for others",
  oameni: "Working with people",
  limbaj: "Words and languages",
  creativ: "Creativity",
  business: "Money and organising",
  societate: "Society and law",
  miscare: "Movement and outdoors",
};

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
  const lang = useLang();
  const t = useT();
  const [picked, setPicked] = useState<TraitId[]>([]);

  function toggle(id: TraitId) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < MAX_PICKS ? [...cur, id] : cur));
  }

  const results = useMemo(() => {
    if (picked.length === 0) return [];
    return specializations
      .map((raw) => ({ s: localSpecialization(raw, lang), score: fit(raw.traits, picked) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.s.name.localeCompare(b.s.name, lang))
      .slice(0, SHOWN);
  }, [picked, lang]);

  const full = picked.length >= MAX_PICKS;

  return (
    <section aria-labelledby="ce-iti-place" className="drawn mx-auto mt-12 max-w-5xl rounded-[1.75rem] bg-teal-tint p-6 text-center sm:p-8">
      <h2 id="ce-iti-place" className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {t("Nu știi de unde să începi?", "Not sure where to start?")}
      </h2>
      <p className="mt-1 text-ink-soft">
        {t(
          `Alege până la ${MAX_PICKS} lucruri care ți se potrivesc și îți arătăm specializările apropiate de ele.`,
          `Pick up to ${MAX_PICKS} things that suit you and we will show you the specialisations closest to them.`,
        )}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {TRAITS.map((tid) => {
          const on = picked.includes(tid);
          return (
            <button
              key={tid}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => toggle(tid)}
              className={`min-h-11 rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-ink bg-card text-ink hover:-translate-y-0.5 hover:bg-teal-tint disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              {lang === "en" ? TRAIT_LABEL_EN[tid] : TRAIT_LABEL[tid]}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-ink-soft" aria-live="polite">
        {picked.length === 0
          ? t("Încă nu ai ales nimic.", "You have not picked anything yet.")
          : full
            ? t(`Ai ales ${MAX_PICKS}. Scoate una ca să alegi alta.`, `You have picked ${MAX_PICKS}. Remove one to pick another.`)
            : t(`Ai ales ${picked.length} din ${MAX_PICKS}.`, `You have picked ${picked.length} of ${MAX_PICKS}.`)}
      </p>

      {results.length > 0 && (
        <>
          <h3 className="mt-5 text-lg font-black text-ink">{t("Specializări care se potrivesc cu ce ai ales", "Specialisations that match what you picked")}</h3>
          <ol className="mt-3 grid gap-3 text-left sm:grid-cols-2">
            {results.map(({ s, score }, i) => {
              const found = domains.find((d) => d.id === s.domainId);
              const domain = found && localDomain(found, lang);
              const style = domainStyle(s.domainId);
              const family = FAMILY_CLASSES[style.family];
              return (
                <li key={s.id} className={`drawn rounded-2xl p-4 [border-width:2.5px] [box-shadow:0_3px_0_var(--color-ink)] ${family.band}`}>
                  <p className={`flex items-center justify-between gap-2 text-sm font-bold ${family.text}`}>
                    <span>
                      <span aria-hidden className="mr-1">{style.emoji}</span>
                      {domain?.name}
                    </span>
                    <span className="shrink-0">
                      {i + 1}. · {t("potrivire", "match")} {Math.min(97, Math.round(score * 100))}%
                    </span>
                  </p>
                  <p className="mt-1 text-lg font-black tracking-tight text-ink">{s.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{s.short}</p>
                  <Link
                    href={`/universitati?domeniu=${s.domainId}`}
                    className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
                  >
                    {t("Vezi universitățile unde se studiază →", "See the universities where it is taught →")}
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl bg-card p-4 text-left sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-soft">
              {t(
                "Acesta e doar un prim pas. Chestionarul ține cont și de profilul tău de liceu și de ce ai făcut până acum.",
                "This is only a first step. The quiz also takes into account your high-school profile and what you have done so far.",
              )}
            </p>
            <Link
              href="/test"
              className="inline-flex min-h-11 shrink-0 items-center rounded-2xl bg-primary px-5 py-2 font-extrabold text-white shadow-[0_3px_0_var(--color-primary-dark)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              {t("Completează chestionarul", "Take the quiz")}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
