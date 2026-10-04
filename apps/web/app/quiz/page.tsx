"use client";
// Quiz screen: the high-school profile first, then one question per step with progress and encouragement, the activities step and the "where" step (with the Romanian city).
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Books, Cap, Diploma, Sparkle } from "@/components/Illustrations";
import { ActivitiesStep } from "@/components/ActivitiesStep";
import { Notice, Shell } from "@/components/Shell";
import { profiles, questions } from "@/lib/data";
import { loadDraft, saveDraft, type Draft } from "@/lib/session";
import { romanianCities } from "@/lib/universities";
import type { StudyPlace } from "@/lib/types";

const places: { value: StudyPlace; label: string }[] = [
  { value: "ro", label: "În România" },
  { value: "abroad", label: "În străinătate" },
  { value: "any", label: "Oriunde" },
];

const cities = romanianCities();

const profileGroups = Array.from(new Set(profiles.map((p) => p.filiera))).map((f) => ({
  name: f,
  items: profiles.filter((p) => p.filiera === f),
}));

/** Short cheer under the progress bar, computed from how far along the student is (step counts questions only). */
function encouragement(step: number, count: number): string {
  if (step < 0) return "Începem cu liceul tău.";
  if (step === count) return "Ai terminat întrebările! Spune-ne și ce ai făcut până acum.";
  if (step > count) return "Aproape gata! Mai spune-ne un singur lucru.";
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
  const [askCity, setAskCity] = useState(false); // second half of the last step: the Romanian city

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadDraft());
  }, []);

  if (!draft) return <Shell><p className="mt-10 text-center text-ink-soft">Se încarcă...</p></Shell>;
  if (questions.length === 0) {
    return (
      <Shell>
        <Notice title="Ceva nu a mers" text="Nu am găsit întrebările. Reîncarcă pagina sau încearcă din nou mai târziu." href="/test" cta="Înapoi la start" />
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
    if (where === "abroad") {
      saveDraft({ ...draft, where, city: undefined });
      router.push("/rezultat");
      return;
    }
    update({ ...draft, where });
    setAskCity(true);
  }

  function pickCity(city: string | undefined) {
    if (!draft) return;
    saveDraft({ ...draft, city });
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
            {isProfile ? "Primul pas" : isWhere ? "Ultimul pas" : isActivities ? "Pasul bonus" : `Întrebarea ${qi + 1} din ${questions.length}`}
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
            {encouragement(qi, questions.length)}
          </p>
        </div>
        <div key={step} className="float slide-in shrink-0">
          <Art className={`h-14 w-14 ${ART_FILL[step % ART.length]}`} />
        </div>
      </div>

      <div key={step} className="slide-in">
        <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
          {isProfile ? "Ce profil de liceu urmezi?" : isWhere ? (askCity ? "În ce oraș vrei să studiezi?" : "Unde vrei să studiezi?") : isActivities ? "Ce ai făcut până acum?" : q.text}
        </h1>

        {isProfile ? (
          <div className="mt-2">
            {profileGroups.map((g) => (
              <fieldset key={g.name} className="mt-5">
                <legend className="text-sm font-extrabold uppercase tracking-wide text-primary">{g.name}</legend>
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
              Concursuri, voluntariat, activități — ne ajută să te cunoaștem mai bine. Poți sări peste.
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
                Continuă
              </button>
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="min-h-12 rounded-2xl border-2 border-primary px-6 py-3 font-bold text-primary hover:bg-primary-tint"
              >
                Sar peste
              </button>
            </div>
          </>
        ) : isWhere && askCity ? (
          <>
            <p className="mt-2 text-ink-soft">
              Alege orașul tău sau cel în care vrei să înveți. Îți arătăm universitățile din România doar din acel oraș.
            </p>
            <button type="button" onClick={() => pickCity(undefined)} className={`mt-5 ${optionClass(false)}`}>
              Oricare oraș
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" data-cities>
              {cities.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={draft.city === c}
                  onClick={() => pickCity(c)}
                  className={`opt min-h-12 rounded-2xl border-2 px-4 py-3 text-left font-semibold ${
                    draft.city === c
                      ? "border-primary bg-primary-tint text-primary-dark"
                      : "border-transparent bg-card text-ink ring-1 ring-line hover:ring-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
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
            ← Înapoi
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/test")}
            className="min-h-11 rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint"
          >
            ← Înapoi la început
          </button>
        )}
      </div>
    </Shell>
  );
}
