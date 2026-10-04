"use client";
// Start screen: tagline, 3-step explanation and the high-school profile picker.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { profiles } from "@/lib/data";
import { loadDraft, saveDraft } from "@/lib/session";

const steps = [
  ["1", "Alegi profilul de liceu", "Spune-ne ce clasă sau specializare urmezi."],
  ["2", "Răspunzi la întrebări", "Sunt scurte și nu există răspunsuri greșite."],
  ["3", "Primești 3 domenii", "Cu procente, motive și facultăți unde poți studia."],
];

export default function Home() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | undefined>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileId(loadDraft().profileId);
  }, []);

  const groups = Array.from(new Set(profiles.map((p) => p.filiera))).map((f) => ({
    name: f,
    items: profiles.filter((p) => p.filiera === f),
  }));

  function start() {
    if (!profileId) return;
    saveDraft({ profileId, choices: {} });
    router.push("/quiz");
  }

  return (
    <Shell>
      <section className="pt-4 text-center">
        <h1 className="bg-gradient-to-r from-burgundy to-burgundy-dark bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          UniPath
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-navy-soft">
          Ghidul tău între liceu și facultate: afli ce să studiezi și unde.
        </p>
      </section>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {steps.map(([n, title, text]) => (
          <li key={n} className="rounded-2xl bg-cream p-4 shadow-sm ring-1 ring-line">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy-tint font-bold text-burgundy-dark">
              {n}
            </span>
            <p className="mt-2 font-semibold text-navy">{title}</p>
            <p className="mt-1 text-sm text-navy-soft">{text}</p>
          </li>
        ))}
      </ol>

      <section className="mt-10" aria-labelledby="profil">
        <h2 id="profil" className="text-2xl font-bold text-navy">
          Ce profil de liceu urmezi?
        </h2>
        {groups.map((g) => (
          <fieldset key={g.name} className="mt-5">
            <legend className="text-sm font-semibold uppercase tracking-wide text-burgundy">{g.name}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {g.items.map((p) => {
                const on = p.id === profileId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setProfileId(p.id)}
                    className={`rounded-2xl border-2 px-4 py-3 text-left font-medium transition ${
                      on
                        ? "border-burgundy bg-burgundy-tint text-burgundy-dark"
                        : "border-transparent bg-cream text-navy-soft ring-1 ring-line hover:ring-burgundy/40"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </section>

      <div className="sticky bottom-0 -mx-5 mt-8 bg-gradient-to-t from-beige via-beige to-transparent px-5 pb-4 pt-6">
        <button
          type="button"
          disabled={!profileId}
          onClick={start}
          className="w-full rounded-2xl bg-burgundy px-6 py-4 text-lg font-bold text-cream shadow-lg shadow-burgundy/30 transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-navy-soft disabled:shadow-none"
        >
          Începe
        </button>
        {!profileId && <p className="mt-2 text-center text-sm text-navy-soft">Alege mai întâi un profil.</p>}
      </div>
    </Shell>
  );
}
