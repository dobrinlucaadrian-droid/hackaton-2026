"use client";
// Questionnaire start screen: its own title, the 3-step explanation and the button that starts the quiz (the profile is asked inside the quiz).
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { Cap, Sparkle } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { questions } from "@/lib/data";
import { saveDraft } from "@/lib/session";

const steps = [
  ["1", "Alegi profilul de liceu", "E prima întrebare din chestionar.", "bg-primary-tint text-primary-dark"],
  ["2", "Răspunzi la întrebări", "Sunt scurte și nu există răspunsuri greșite.", "bg-teal-tint text-teal-ink"],
  ["3", "Primești 3 domenii", "Cu procente, motive și facultăți unde poți studia.", "bg-violet-tint text-violet-ink"],
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function QuestionnaireStart() {
  const router = useRouter();
  function start() {
    saveDraft({ choices: {} }); // a fresh questionnaire: earlier answers are dropped
    router.push("/quiz");
  }

  return (
    <Shell>
      <section className="rise pt-4 text-center">
        <div className="flex items-end justify-center gap-2">
          <Sparkle className="twinkle h-5 w-5 fill-teal" />
          <Cap className="float h-16 w-16" />
          <Sparkle className="twinkle h-5 w-5 fill-violet" />
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tighter text-ink sm:text-5xl">Chestionarul UniPath</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-ink-soft">
          Răspunzi la {questions.length} situații din viața de zi cu zi și afli ce domenii ți se potrivesc. Durează cam 6 minute.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-6 min-h-14 w-full rounded-2xl bg-primary px-8 py-4 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98] sm:w-auto"
        >
          Începe chestionarul
        </button>
      </section>

      <div aria-hidden className="my-8 flex items-center gap-0">
        <span className="h-px flex-1 bg-primary/30" />
        <span className="rounded-full border-2 border-primary bg-paper px-6 py-1.5 text-sm font-bold text-primary">
          3 pași simpli
        </span>
        <span className="h-px flex-1 bg-primary/30" />
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map(([n, title, text, tone], i) => (
          <li key={n} style={delay(100 + i * 100)} className="rise rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full font-black ${tone}`}>{n}</span>
            <p className="mt-2 font-extrabold text-ink">{title}</p>
            <p className="mt-1 text-sm text-ink-soft">{text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Nu îți cerem nume sau cont. Răspunsurile rămân pe dispozitivul tău.
      </p>
    </Shell>
  );
}
