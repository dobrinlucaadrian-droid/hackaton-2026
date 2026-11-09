"use client";
// Questionnaire start screen in the page language, in the drawn look: the clipboard drawing, its own title, the button that starts the quiz and the 3-step explanation (the profile is asked inside the quiz).
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { SectionTitle, Squiggle } from "@/components/Drawn";
import { QuizDrawing } from "@/components/PageScenes";
import { useHref, useT } from "@/components/LangProvider";
import { Shell } from "@/components/Shell";
import { questions } from "@/lib/data";
import { saveDraft } from "@/lib/session";

const tones = ["bg-primary text-white", "bg-teal text-ink", "bg-sky text-white"];

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
        <div className="mx-auto w-full max-w-[16rem]">
          <QuizDrawing label={t("Desen: un clipboard cu bife și un creion mare", "Drawing: a clipboard with ticks and a big pencil")} />
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t("Chestionarul", "The")} <span className="text-primary">FindMyUni</span>{t("", " quiz")}
        </h1>
        <Squiggle className="mx-auto" />
        <p className="mx-auto mt-3 max-w-md text-lg text-ink-soft">
          {t(
            `Răspunzi la ${questions.length} situații din viața de zi cu zi și afli ce domenii ți se potrivesc. Durează cam 6 minute.`,
            `You answer ${questions.length} everyday situations and find out which fields suit you. It takes about 6 minutes.`,
          )}
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-6 min-h-14 w-full rounded-2xl bg-primary px-8 py-4 text-lg font-extrabold text-white shadow-[0_3px_0_var(--color-primary-dark),0_14px_26px_-12px_rgb(97_18_45_/_0.6)] transition hover:-translate-y-0.5 hover:bg-primary-dark active:scale-[0.98] sm:w-auto"
        >
          {t("Începe chestionarul", "Start the quiz")}
        </button>
      </section>

      <SectionTitle center>{t("3 pași simpli", "3 simple steps")}</SectionTitle>

      <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-4">
        {steps.map(([n, title, text], i) => (
          <li key={n} style={delay(100 + i * 100)} className="rise drawn relative rounded-3xl bg-card px-5 pt-8 pb-5">
            <span className={`absolute -top-5 left-5 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink text-lg font-extrabold ${tones[i]}`}>{n}</span>
            <p className="text-lg font-extrabold text-ink">{title}</p>
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
