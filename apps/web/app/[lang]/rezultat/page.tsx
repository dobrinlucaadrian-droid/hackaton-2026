"use client";
// Result screen (in the page language): top 3 study domains from the saved answers, with a live "Ce-ar fi dacă?" slider panel.
import { useMutation } from "convex/react";
import Link from "@/components/LocalLink";
import { useEffect, useMemo, useState } from "react";
import { ActivitiesSummary } from "@/components/ActivitiesSummary";
import { Confetti } from "@/components/Confetti";
import { Diploma, Sparkle } from "@/components/Illustrations";
import { useLang, useT } from "@/components/LangProvider";
import { MatchCard } from "@/components/MatchCard";
import { SaveResult } from "@/components/SaveResult";
import { ShareResult } from "@/components/ShareResult";
import { Notice, Shell } from "@/components/Shell";
import { WhatIf } from "@/components/WhatIf";
import { api } from "@/convex/_generated/api";
import { cityList } from "@/lib/cities";
import { TRAITS, matchByTraits, matchDomains, studentTraits } from "@/lib/match";
import { clearDraft, loadDraft, toAnswers, type StoredActivity } from "@/lib/session";
import type { Answers, Match, TraitId } from "@/lib/types";

type Traits = Record<TraitId, number>;
const COUNTED_KEY = "findmyuni-counted";
type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "ok"; answers: Answers; matches: Match[]; initial: Traits };

export default function ResultPage() {
  const lang = useLang();
  const t = useT();
  const [state, setState] = useState<State>({ status: "loading" });
  const [values, setValues] = useState<Traits | null>(null);
  const recordRun = useMutation(api.analytics.recordQuizRun);

  useEffect(() => {
    const answers = toAnswers(loadDraft());
    if (!answers) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "empty" });
      return;
    }
    try {
      const matches = matchDomains(answers, lang);
      const initial = studentTraits(answers);
      setValues(initial);
      setState(matches.length ? { status: "ok", answers, matches, initial } : { status: "error" });
      if (matches.length) countOnce(answers, matches.map((m) => m.domain.id));
    } catch {
      setState({ status: "error" });
    }
    // Counts this finished questionnaire once, anonymously: the same answers are not counted again on reload.
    function countOnce(answers: Answers, topDomains: string[]) {
      const mark = JSON.stringify([answers.profileId, answers.where, answers.cities ?? [], answers.choices]);
      try {
        if (window.sessionStorage.getItem(COUNTED_KEY) === mark) return;
        window.sessionStorage.setItem(COUNTED_KEY, mark);
      } catch {
        return; // storage blocked: better not counted than counted on every reload
      }
      recordRun({ profileId: answers.profileId, where: answers.where, ...(answers.cities?.length ? { cities: answers.cities } : {}), choices: answers.choices, topDomains }).catch(() => {
        // statistics must never break the result page
      });
    }
  }, [recordRun, lang]);

  const changed = state.status === "ok" && values !== null && TRAITS.some((id) => values[id] !== state.initial[id]);

  const shown = useMemo(() => {
    if (state.status !== "ok") return [];
    if (!changed || !values) return state.matches;
    try {
      return matchByTraits(values, state.answers.where, state.answers.profileId, state.answers.cities, lang);
    } catch {
      return state.matches;
    }
  }, [state, values, changed, lang]);

  if (state.status === "loading") return <Shell><p className="mt-10 text-center text-ink-soft">{t("Se încarcă...", "Loading...")}</p></Shell>;
  if (state.status === "empty") {
    return (
      <Shell>
        <Notice
          title={t("Nu avem încă rezultate", "No results yet")}
          text={t("Răspunde mai întâi la întrebări și apoi îți arătăm domeniile potrivite.", "Answer the questions first and then we will show you the fields that suit you.")}
          href="/test"
          cta={t("Începe chestionarul", "Start the quiz")}
        />
      </Shell>
    );
  }
  if (state.status === "error") {
    return (
      <Shell>
        <Notice
          title={t("Ceva nu a mers", "Something went wrong")}
          text={t("Nu am putut calcula rezultatele. Reia chestionarul și încearcă din nou.", "We could not work out your results. Retake the quiz and try again.")}
          href="/test"
          cta={t("Reia chestionarul", "Retake the quiz")}
        />
      </Shell>
    );
  }

  const initial = state.initial;

  return (
    <Shell wide>
      <Confetti />
      <div className="rise mx-auto max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3">
          <Sparkle className="twinkle h-6 w-6 fill-teal" />
          <Diploma className="float h-16 w-16" />
          <Sparkle className="twinkle h-5 w-5 fill-violet" />
        </div>
        <h1 className="mt-2 text-4xl font-black tracking-tighter text-ink sm:text-5xl">{t("Domeniile tale potrivite", "Your matching fields")}</h1>
        <p className="mt-2 text-ink-soft">
          {t("Iată cele 3 domenii care ți se potrivesc cel mai bine.", "Here are the 3 fields that suit you best.")}
          {state.answers.cities?.length
            ? t(
                ` Universitățile din România sunt din ${state.answers.cities.length === 1 ? "orașul ales" : "orașele alese"} de tine: ${cityList(state.answers.cities)}.`,
                ` The universities in Romania are from the ${state.answers.cities.length === 1 ? "city" : "cities"} you chose: ${cityList(state.answers.cities, lang)}.`,
              )
            : ""}
        </p>
      </div>

      {/* The account card comes first, right after the quiz ends; the domains follow under it. */}
      <SaveResult
        result={{
          profileId: state.answers.profileId,
          where: state.answers.where,
          ...(state.answers.cities?.length ? { cities: state.answers.cities } : {}),
          choices: state.answers.choices,
          topDomains: state.matches.map((m) => m.domain.id),
        }}
      />

      <ActivitiesSummary activities={(state.answers.activities ?? []) as StoredActivity[]} />

      {values && (
        <WhatIf
          values={values}
          changed={changed}
          onChange={(id, v) => setValues((cur) => (cur ? { ...cur, [id]: v } : cur))}
          onReset={() => setValues(initial)}
        />
      )}

      {changed && (
        <p className="mx-auto mt-6 max-w-2xl text-center">
          <span className="inline-block rounded-full bg-violet-ink px-4 py-1 text-sm font-bold text-white">
            {t("Rezultat modificat de tine", "Result changed by you")}
          </span>
        </p>
      )}

      <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-6">
        {shown.map((m, i) => (
          <div key={m.domain.id} className="rise" style={{ animationDelay: `${i * 120}ms` }}>
            <div key={i} className={changed ? "card-flash" : undefined}>
              <MatchCard match={m} rank={i + 1} where={state.answers.where} cities={state.answers.cities} />
            </div>
          </div>
        ))}
      </div>

      <ShareResult matches={shown} />

      <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-primary-tint p-4 text-sm text-primary-dark" role="note">
        {t(
          "Chestionarul nu este un test psihologic validat: rezultatul e un punct de pornire, nu un verdict. Vorbește și cu consilierul școlar, cu părinții și cu studenți de la facultățile care te atrag. Informațiile sunt orientative — verifică mereu site-ul facultății pentru condiții, termene și taxe actuale.",
          "The quiz is not a validated psychological test: the result is a starting point, not a verdict. Also talk to your school counsellor, your parents and students at the faculties that interest you. The information is indicative — always check the faculty's website for current conditions, deadlines and fees.",
        )}
      </p>

      <div className="mt-8 text-center">
        <Link href="/test" onClick={clearDraft} className="inline-flex min-h-12 items-center rounded-full border-2 border-primary px-8 py-3 font-black text-primary hover:bg-primary-tint">
          {t("Reia chestionarul", "Retake the quiz")}
        </Link>
      </div>
    </Shell>
  );
}
