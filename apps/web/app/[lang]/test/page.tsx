"use client";
// Questionnaire start screen in the page language: its own title, the 3-step explanation and the button that starts the quiz (the profile is asked inside the quiz).
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { QuizScene } from "@/components/Illustrations";
import { useHref, useT } from "@/components/LangProvider";
import { Shell } from "@/components/Shell";
import { questions } from "@/lib/data";
import { saveDraft } from "@/lib/session";

const tones = ["bg-primary-tint text-primary-dark", "bg-teal-tint text-teal-ink", "bg-violet-tint text-violet-ink"];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function QuestionnaireStart() {
  const router = useRouter();
  const t = useT();
  const href = useHref();
  const steps = [
    ["1", t("Alegi profilul de liceu", "You tell us what you focused on in high school"), t("E prima întrebare din chestionar.", "It is the first question of the quiz.")],
    ["2", t("Răspunzi la întrebări", "You answer the questions"), t("Sunt scurte și nu există răspunsuri greșite.", "They are short and there are no wrong answers.")],
    ["3", t("Primești 3 domenii", "You get 3 fields"), t("Cu procente, motive și facultăți unde poți studia.", "With percentages, reasons and faculties where you can study.")],
  ];
  function start() {
    saveDraft({ choices: {} }); // a fresh questionnaire: earlier answers are dropped
    router.push(href("/quiz"));
  }

  return (
    <Shell>
      <section className="rise pt-4 text-center">
        <QuizScene className="float mx-auto h-24 w-32" />
        <h1 className="mt-3 text-4xl font-black tracking-tighter text-ink sm:text-5xl">{t("Chestionarul FindMyUni", "The FindMyUni quiz")}</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-ink-soft">
          {t(
            `Răspunzi la ${questions.length} situații din viața de zi cu zi și afli ce domenii ți se potrivesc. Durează cam 6 minute.`,
            `You answer ${questions.length} everyday situations and find out which fields suit you. It takes about 6 minutes.`,
          )}
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-6 min-h-14 w-full rounded-2xl bg-primary px-8 py-4 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98] sm:w-auto"
        >
          {t("Începe chestionarul", "Start the quiz")}
        </button>
      </section>

      <div aria-hidden className="my-8 flex items-center gap-0">
        <span className="h-px flex-1 bg-primary/30" />
        <span className="rounded-full border-2 border-primary bg-paper px-6 py-1.5 text-sm font-bold text-primary">
          {t("3 pași simpli", "3 simple steps")}
        </span>
        <span className="h-px flex-1 bg-primary/30" />
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map(([n, title, text], i) => (
          <li key={n} style={delay(100 + i * 100)} className="rise rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full font-black ${tones[i]}`}>{n}</span>
            <p className="mt-2 font-extrabold text-ink">{title}</p>
            <p className="mt-1 text-sm text-ink-soft">{text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {t(
          "Nu îți cerem nume sau cont. La final, răspunsurile sunt numărate anonim, doar pentru statistici.",
          "We do not ask for your name or an account. At the end, answers are counted anonymously, for statistics only.",
        )}
      </p>
    </Shell>
  );
}
