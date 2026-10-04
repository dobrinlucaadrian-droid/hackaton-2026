"use client";
// Result screen: top 3 study domains from the saved answers, with a live "Ce-ar fi dacă?" slider panel.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { Notice, Shell } from "@/components/Shell";
import { WhatIf } from "@/components/WhatIf";
import { TRAITS, matchByTraits, matchDomains, studentTraits } from "@/lib/match";
import { clearDraft, loadDraft, toAnswers } from "@/lib/session";
import type { Answers, Match, TraitId } from "@/lib/types";

type Traits = Record<TraitId, number>;
type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "ok"; answers: Answers; matches: Match[]; initial: Traits };

export default function ResultPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [values, setValues] = useState<Traits | null>(null);

  useEffect(() => {
    const answers = toAnswers(loadDraft());
    if (!answers) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "empty" });
      return;
    }
    try {
      const matches = matchDomains(answers);
      const initial = studentTraits(answers);
      setValues(initial);
      setState(matches.length ? { status: "ok", answers, matches, initial } : { status: "error" });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  const changed = state.status === "ok" && values !== null && TRAITS.some((t) => values[t] !== state.initial[t]);

  const shown = useMemo(() => {
    if (state.status !== "ok") return [];
    if (!changed || !values) return state.matches;
    try {
      return matchByTraits(values, state.answers.where, state.answers.profileId);
    } catch {
      return state.matches;
    }
  }, [state, values, changed]);

  if (state.status === "loading") return <Shell><p className="mt-10 text-center text-navy-soft">Se încarcă...</p></Shell>;
  if (state.status === "empty") {
    return (
      <Shell>
        <Notice title="Nu avem încă rezultate" text="Răspunde mai întâi la întrebări și apoi îți arătăm domeniile potrivite." href="/" cta="Începe testul" />
      </Shell>
    );
  }
  if (state.status === "error") {
    return (
      <Shell>
        <Notice title="Ceva nu a mers" text="Nu am putut calcula rezultatele. Reia testul și încearcă din nou." href="/" cta="Reia testul" />
      </Shell>
    );
  }

  const initial = state.initial;

  return (
    <Shell wide>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">Domeniile tale potrivite</h1>
        <p className="mt-2 text-navy-soft">Iată cele 3 domenii care ți se potrivesc cel mai bine.</p>
      </div>

      {values && (
        <WhatIf
          values={values}
          changed={changed}
          onChange={(id, v) => setValues({ ...values, [id]: v })}
          onReset={() => setValues(initial)}
        />
      )}

      {changed && (
        <p className="mx-auto mt-6 max-w-2xl text-center">
          <span className="inline-block rounded-full bg-burgundy px-4 py-1 text-sm font-bold text-cream">
            Rezultat modificat de tine
          </span>
        </p>
      )}

      <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-6">
        {shown.map((m, i) => (
          <div key={m.domain.id}>
            <div key={i} className={changed ? "card-flash" : undefined}>
              <MatchCard match={m} rank={i + 1} />
            </div>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-burgundy-tint p-4 text-sm text-burgundy-dark" role="note">
        Informațiile sunt orientative. Verifică mereu site-ul facultății pentru condiții, termene și taxe actuale.
      </p>

      <div className="mt-8 text-center">
        <Link href="/" onClick={clearDraft} className="inline-block rounded-2xl bg-burgundy px-8 py-3 font-bold text-cream hover:bg-burgundy-dark">
          Reia testul
        </Link>
      </div>
    </Shell>
  );
}
