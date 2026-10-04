"use client";
// Result screen: top 3 study domains computed in the browser from the saved answers.
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearDraft } from "@/lib/session";
import { MatchCard } from "@/components/MatchCard";
import { Notice, Shell } from "@/components/Shell";
import { matchDomains } from "@/lib/match";
import { loadDraft, toAnswers } from "@/lib/session";
import type { Match } from "@/lib/types";

type State = { status: "loading" } | { status: "empty" } | { status: "error" } | { status: "ok"; matches: Match[] };

export default function ResultPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const answers = toAnswers(loadDraft());
    if (!answers) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "empty" });
      return;
    }
    try {
      const matches = matchDomains(answers);
      setState(matches.length ? { status: "ok", matches } : { status: "error" });
    } catch {
      setState({ status: "error" });
    }
  }, []);

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

  return (
    <Shell wide>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">Domeniile tale potrivite</h1>
        <p className="mt-2 text-navy-soft">Iată cele 3 domenii care ți se potrivesc cel mai bine.</p>
      </div>

      <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-6">
        {state.matches.map((m, i) => (
          <MatchCard key={m.domain.id} match={m} rank={i + 1} />
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
