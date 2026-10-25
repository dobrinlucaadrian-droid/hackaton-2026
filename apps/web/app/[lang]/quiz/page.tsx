"use client";
// Quiz screen (in the page language): the high-school profile first (on English pages a general "what did you focus on"), then one question per step with progress and encouragement, the activities step and the "where" step (with one or more Romanian cities; on English pages no city step).
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Books, Cap, Diploma, Sparkle } from "@/components/Illustrations";
import { ActivitiesStep } from "@/components/ActivitiesStep";
import { useHref, useLang, useT } from "@/components/LangProvider";
import { Notice, Shell } from "@/components/Shell";
import { profiles as allProfiles, questions as allQuestions } from "@/lib/data";
import { cityName, localProfile, localQuestion } from "@/lib/i18n-data";
import type { Lang } from "@/lib/i18n";
import { MAX_CITIES, loadDraft, saveDraft, type Draft } from "@/lib/session";
import { romanianCities } from "@/lib/cities";
import type { StudyPlace } from "@/lib/types";

const cities = romanianCities();
// The high-school tracks a student from any country can recognise (shown on the English pages with general names, data/en/profiles.json).
const FOREIGN_PROFILES = ["real-mate-info", "real-stiinte-naturii", "uman-filologie", "uman-stiinte-sociale", "tehnologic-tehnic", "voc-artistic", "voc-sportiv"];

/** Short cheer under the progress bar, computed from how far along the student is (step counts questions only). */
function encouragement(step: number, count: number, lang: Lang): string {
  const t = (ro: string, en: string) => (lang === "en" ? en : ro);
  if (step < 0) return t("Începem cu liceul tău.", "We start with your high school.");
  if (step === count) return t("Ai terminat întrebările! Spune-ne și ce ai făcut până acum.", "You finished the questions! Tell us what you have done so far.");
  if (step > count) return t("Aproape gata! Mai spune-ne un singur lucru.", "Almost done! Just one more thing.");
  if (step === 0) return t("Bun început!", "Good start!");
  if (step === count - 1) return t("Ultima întrebare!", "Last question!");
  const p = step / count;
  if (p >= 0.75) return t("Încă puțin!", "Just a little more!");
  if (p >= 0.45) return t("Ești la jumătate!", "You are halfway there!");
  if (p >= 0.25) return t("Merge bine!", "Going well!");
  return t("Continuă tot așa!", "Keep it up!");
}

const ART = [Cap, Books, Diploma, Sparkle];
const ART_FILL = ["", "", "", "fill-violet"];

export default function QuizPage() {
  const router = useRouter();
  const lang = useLang();
  const t = useT();
  const href = useHref();
  const questions = useMemo(() => allQuestions.map((q) => localQuestion(q, lang)), [lang]);
  const profiles = useMemo(() => allProfiles.map((p) => localProfile(p, lang)), [lang]);
  // Romanian pupils pick their high-school track; students from other countries answer a general "what did you focus on" with
  // the tracks that have an equivalent everywhere (one list, no Romanian group names).
  const profileGroups = useMemo(
    () =>
      lang === "en"
        ? [{ name: "", items: profiles.filter((p) => FOREIGN_PROFILES.includes(p.id)) }]
        : Array.from(new Set(profiles.map((p) => p.filiera))).map((f) => ({ name: f, items: profiles.filter((p) => p.filiera === f) })),
    [profiles, lang],
  );
  // On the English pages the "where" step has the same three choices, but no Romanian city step after it.
  const askCities = lang !== "en";
  const places: { value: StudyPlace; label: string }[] = [
    { value: "ro", label: t("În România", "In Romania") },
    { value: "abroad", label: t("În străinătate", "Outside Romania") },
    { value: "any", label: t("Oriunde", "Anywhere") },
  ];
  const [draft, setDraft] = useState<Draft | null>(null);
  const [step, setStep] = useState(0);
  const [askCity, setAskCity] = useState(false); // second half of the last step: the Romanian city

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadDraft());
  }, []);

  if (!draft) return <Shell><p className="mt-10 text-center text-ink-soft">{t("Se încarcă...", "Loading...")}</p></Shell>;
  if (questions.length === 0) {
    return (
      <Shell>
        <Notice
          title={t("Ceva nu a mers", "Something went wrong")}
          text={t("Nu am găsit întrebările. Reîncarcă pagina sau încearcă din nou mai târziu.", "We could not find the questions. Reload the page or try again later.")}
          href="/test"
          cta={t("Înapoi la start", "Back to the start")}
        />
      </Shell>
    );
  }

  // Steps: 0 = high-school profile, 1..N = questions, N+1 = activities, N+2 = where.
  const total = questions.length + 3;
  const qi = step - 1; // index of the current question
  const isProfile = step === 0;
  const isActivities = qi === questions.length;
  const isWhere = qi > questions.length;
  const q = questions[qi];
  const Art = ART[step % ART.length];

  function update(next: Draft): boolean {
    setDraft(next);
    return saveDraft(next);
  }

  function pickProfile(profileId: string) {
    if (!draft) return;
    update({ ...draft, profileId });
    setStep(1);
  }

  function pickChoice(index: number) {
    if (!draft) return;
    update({ ...draft, choices: { ...draft.choices, [q.id]: index } });
    setStep(step + 1);
  }

  function pickWhere(where: StudyPlace) {
    if (!draft) return;
    if (!draft.profileId) {
      setStep(0); // the profile is needed for the result
      return;
    }
    if (where === "abroad" || !askCities) {
      saveDraft({ ...draft, where, cities: undefined });
      router.push(href("/rezultat"));
      return;
    }
    update({ ...draft, where });
    setAskCity(true);
  }

  const chosenCities = draft.cities ?? [];

  function toggleCity(city: string) {
    if (!draft) return;
    const next = chosenCities.includes(city) ? chosenCities.filter((c) => c !== city) : [...chosenCities, city].slice(0, MAX_CITIES);
    update({ ...draft, cities: next });
  }

  /** Goes to the result with the chosen cities, or with any city when `any` is true. */
  function finishCities(any: boolean) {
    if (!draft) return;
    if (!draft.profileId) {
      setStep(0); // the profile is needed for the result
      return;
    }
    saveDraft({ ...draft, cities: any ? undefined : chosenCities });
    router.push(href("/rezultat"));
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
            {isProfile
              ? t("Primul pas", "First step")
              : isWhere
                ? t("Ultimul pas", "Last step")
                : isActivities
                  ? t("Pasul bonus", "Bonus step")
                  : t(`Întrebarea ${qi + 1} din ${questions.length}`, `Question ${qi + 1} of ${questions.length}`)}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={step + 1}
            aria-label={t("Progres", "Progress")}
            className="mt-2 h-4 overflow-hidden rounded-full bg-white ring-1 ring-line"
          >
            <div
              className="bar-anim h-full rounded-full bg-gradient-to-r from-primary via-sky to-teal"
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
          <p className="mt-2 font-bold text-teal-ink" aria-live="polite">
            {encouragement(qi, questions.length, lang)}
          </p>
        </div>
        <div key={step} className="float slide-in shrink-0">
          <Art className={`h-14 w-14 ${ART_FILL[step % ART.length]}`} />
        </div>
      </div>

      <div key={step} className="slide-in">
        <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
          {isProfile
            ? t("Ce profil de liceu urmezi?", "What did you focus on most in high school?")
            : isWhere
              ? askCity
                ? t("În ce orașe vrei să studiezi?", "In which cities do you want to study?")
                : t("Unde vrei să studiezi?", "Where do you want to study?")
              : isActivities
                ? t("Ce ai făcut până acum?", "What have you done so far?")
                : q.text}
        </h1>

        {isProfile ? (
          <div className="mt-2">
            {profileGroups.map((g) => (
              <fieldset key={g.name} className="mt-5">
                {g.name && <legend className="text-sm font-extrabold uppercase tracking-wide text-primary">{g.name}</legend>}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {g.items.map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      aria-pressed={pr.id === draft.profileId}
                      onClick={() => pickProfile(pr.id)}
                      className={`opt min-h-12 rounded-2xl border-2 px-4 py-3 text-left font-semibold ${
                        pr.id === draft.profileId
                          ? "border-primary bg-primary-tint text-primary-dark"
                          : "border-transparent bg-card text-ink-soft ring-1 ring-line hover:ring-primary/50"
                      }`}
                    >
                      {pr.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        ) : isActivities ? (
          <>
            <p className="mt-2 text-ink-soft">
              {t(
                "Concursuri, voluntariat, activități — ne ajută să te cunoaștem mai bine. Poți sări peste.",
                "Competitions, volunteering, activities — they help us get to know you better. You can skip this.",
              )}
            </p>
            <div className="mt-6">
              <ActivitiesStep
                activities={draft.activities ?? []}
                onChange={(list) => update({ ...draft, activities: list })}
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="min-h-12 flex-1 rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
              >
                {t("Continuă", "Continue")}
              </button>
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="min-h-12 rounded-2xl border-2 border-primary px-6 py-3 font-bold text-primary hover:bg-primary-tint"
              >
                {t("Sar peste", "Skip")}
              </button>
            </div>
          </>
        ) : isWhere && askCity ? (
          <>
            <p className="mt-2 text-ink-soft">
              {t(
                "Alege unul sau mai multe orașe în care ai vrea să înveți. Îți arătăm universitățile din România doar din orașele alese.",
                "Choose one or more cities where you would like to study. We show you universities in Romania only from the cities you choose.",
              )}
            </p>
            <button type="button" onClick={() => finishCities(true)} className={`mt-5 ${optionClass(false)}`}>
              {t("Oricare oraș", "Any city")}
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" data-cities>
              {cities.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={chosenCities.includes(c)}
                  onClick={() => toggleCity(c)}
                  className={`opt min-h-12 rounded-2xl border-2 px-4 py-3 text-left font-semibold ${
                    chosenCities.includes(c)
                      ? "border-primary bg-primary-tint text-primary-dark"
                      : "border-transparent bg-card text-ink ring-1 ring-line hover:ring-primary/50"
                  }`}
                >
                  {chosenCities.includes(c) ? "✓ " : ""}
                  {cityName(c, lang)}
                </button>
              ))}
            </div>
            <div className="sticky bottom-3 mt-5">
              <button
                type="button"
                disabled={chosenCities.length === 0}
                onClick={() => finishCities(false)}
                className="min-h-14 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                data-cities-done
              >
                {chosenCities.length === 0
                  ? t("Alege cel puțin un oraș", "Choose at least one city")
                  : chosenCities.length === 1
                    ? t("Vezi rezultatul pentru 1 oraș", "See the result for 1 city")
                    : t(`Vezi rezultatul pentru ${chosenCities.length} orașe`, `See the result for ${chosenCities.length} cities`)}
              </button>
            </div>
          </>
        ) : (
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
        )}
      </div>

      <div className="mt-8">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => (isWhere && askCity ? setAskCity(false) : setStep(step - 1))}
            className="min-h-11 rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint"
          >
            {t("← Înapoi", "← Back")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push(href("/test"))}
            className="min-h-11 rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint"
          >
            {t("← Înapoi la început", "← Back to the start")}
          </button>
        )}
      </div>
    </Shell>
  );
}
