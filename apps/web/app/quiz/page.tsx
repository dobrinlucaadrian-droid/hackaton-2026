"use client";
// Quiz screen: one question per step, then the "where do you want to study" step.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Notice, Shell } from "@/components/Shell";
import { questions } from "@/lib/data";
import { loadDraft, saveDraft, type Draft } from "@/lib/session";
import type { StudyPlace } from "@/lib/types";

const places: { value: StudyPlace; label: string }[] = [
  { value: "ro", label: "În România" },
  { value: "abroad", label: "În străinătate" },
  { value: "any", label: "Oriunde" },
];

export default function QuizPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadDraft());
  }, []);

  if (!draft) return <Shell><p className="mt-10 text-center text-navy-soft">Se încarcă...</p></Shell>;
  if (!draft.profileId) {
    return (
      <Shell>
        <Notice title="Hai să începem de la început" text="Nu știm încă ce profil de liceu urmezi. Alege-l pe prima pagină." href="/" cta="Alege profilul" />
      </Shell>
    );
  }
  if (questions.length === 0) {
    return (
      <Shell>
        <Notice title="Ceva nu a mers" text="Nu am găsit întrebările. Reîncarcă pagina sau încearcă din nou mai târziu." href="/" cta="Înapoi la start" />
      </Shell>
    );
  }

  const total = questions.length + 1; // questions + where step
  const isWhere = step >= questions.length;
  const q = questions[step];

  function update(next: Draft) {
    setDraft(next);
    saveDraft(next);
  }

  function pickChoice(index: number) {
    if (!draft) return;
    update({ ...draft, choices: { ...draft.choices, [q.id]: index } });
    setStep(step + 1);
  }

  function pickWhere(where: StudyPlace) {
    if (!draft) return;
    saveDraft({ ...draft, where });
    router.push("/rezultat");
  }

  const optionClass = (on: boolean) =>
    `w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-medium transition ${
      on ? "border-burgundy bg-burgundy-tint text-burgundy-dark" : "border-transparent bg-cream text-navy-soft ring-1 ring-line hover:ring-burgundy/40"
    }`;

  return (
    <Shell>
      <div className="mt-2">
        <p className="text-sm font-semibold text-burgundy">
          {isWhere ? "Ultimul pas" : `Întrebarea ${step + 1} din ${questions.length}`}
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step + 1}
          aria-label="Progres"
          className="mt-2 h-3 overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-burgundy to-burgundy-dark transition-all"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-bold leading-snug text-navy sm:text-3xl">
        {isWhere ? "Unde vrei să studiezi?" : q.text}
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        {isWhere
          ? places.map((p) => (
              <button key={p.value} type="button" onClick={() => pickWhere(p.value)} className={optionClass(draft.where === p.value)}>
                {p.label}
              </button>
            ))
          : q.options.map((o, i) => (
              <button key={i} type="button" onClick={() => pickChoice(i)} className={optionClass(draft.choices[q.id] === i)}>
                {o.label}
              </button>
            ))}
      </div>

      <div className="mt-8">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="rounded-xl px-4 py-2 font-semibold text-burgundy-dark hover:bg-burgundy-tint">
            ← Înapoi
          </button>
        ) : (
          <button type="button" onClick={() => router.push("/")} className="rounded-xl px-4 py-2 font-semibold text-burgundy-dark hover:bg-burgundy-tint">
            ← Schimbă profilul
          </button>
        )}
      </div>
    </Shell>
  );
}
