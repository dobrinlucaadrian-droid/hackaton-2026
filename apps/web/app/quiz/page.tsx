"use client";
// Quiz screen: one question per step with progress, encouragement and a floating illustration, then the "where" step.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Books, Cap, Diploma, Sparkle } from "@/components/Illustrations";
import { Notice, Shell } from "@/components/Shell";
import { questions } from "@/lib/data";
import { loadDraft, saveDraft, type Draft } from "@/lib/session";
import type { StudyPlace } from "@/lib/types";

const places: { value: StudyPlace; label: string }[] = [
  { value: "ro", label: "În România" },
  { value: "abroad", label: "În străinătate" },
  { value: "any", label: "Oriunde" },
];

/** Short cheer under the progress bar, computed from how far along the student is. */
function encouragement(step: number, count: number): string {
  if (step >= count) return "Aproape gata! Mai spune-ne un singur lucru.";
  if (step === 0) return "Bun început!";
  if (step === count - 1) return "Ultima întrebare!";
  const p = step / count;
  if (p >= 0.75) return "Încă puțin!";
  if (p >= 0.45) return "Ești la jumătate!";
  if (p >= 0.25) return "Merge bine!";
  return "Continuă tot așa!";
}

const ART = [Cap, Books, Diploma, Sparkle];
const ART_FILL = ["", "", "", "fill-violet"];

export default function QuizPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadDraft());
  }, []);

  if (!draft) return <Shell><p className="mt-10 text-center text-ink-soft">Se încarcă...</p></Shell>;
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
  const Art = ART[step % ART.length];

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
    `opt min-h-14 w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold ${
      on ? "border-primary bg-primary-tint text-primary-dark" : "border-transparent bg-card text-ink ring-1 ring-line hover:ring-primary/50"
    }`;

  return (
    <Shell>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-extrabold text-primary">
            {isWhere ? "Ultimul pas" : `Întrebarea ${step + 1} din ${questions.length}`}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={step + 1}
            aria-label="Progres"
            className="mt-2 h-4 overflow-hidden rounded-full bg-white ring-1 ring-line"
          >
            <div
              className="bar-anim h-full rounded-full bg-gradient-to-r from-primary via-sky to-teal"
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
          <p className="mt-2 font-bold text-teal-ink" aria-live="polite">
            {encouragement(step, questions.length)}
          </p>
        </div>
        <div key={step} className="float slide-in shrink-0">
          <Art className={`h-14 w-14 ${ART_FILL[step % ART.length]}`} />
        </div>
      </div>

      <div key={step} className="slide-in">
        <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
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
      </div>

      <div className="mt-8">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="min-h-11 rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint"
          >
            ← Înapoi
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="min-h-11 rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint"
          >
            ← Schimbă profilul
          </button>
        )}
      </div>
    </Shell>
  );
}
