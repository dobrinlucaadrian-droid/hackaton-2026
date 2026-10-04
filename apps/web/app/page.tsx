"use client";
// Start screen: big headline with hero illustration, 3-step explanation and the high-school profile picker.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { HeroScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { profiles } from "@/lib/data";
import { loadDraft, saveDraft } from "@/lib/session";

const steps = [
  ["1", "Alegi profilul de liceu", "Spune-ne ce clasă sau specializare urmezi.", "bg-primary-tint text-primary-dark"],
  ["2", "Răspunzi la întrebări", "Sunt scurte și nu există răspunsuri greșite.", "bg-teal-tint text-teal-ink"],
  ["3", "Primești 3 domenii", "Cu procente, motive și facultăți unde poți studia.", "bg-violet-tint text-violet-ink"],
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

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
    <Shell wide>
      <section className="grid items-center gap-6 md:grid-cols-2">
        <div className="rise text-center md:text-left">
          <h1>
            <Image src="/logo.png" alt="UniPath" width={1254} height={1254} priority className="mx-auto -my-6 h-auto w-40 md:mx-0 md:-ml-3" />
          </h1>
          <p className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
            Ghidul tău între <span className="text-primary">liceu</span> și <span className="text-teal">facultate</span>
          </p>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft md:mx-0">afli ce să studiezi și unde.</p>
          <Link
            href="/studenti"
            className="mt-5 inline-flex min-h-11 items-center rounded-full border-2 border-primary px-6 py-2 font-bold text-primary transition hover:bg-primary-tint"
          >
            Ce spun studenții
          </Link>
        </div>
        <HeroScene className="float mx-auto w-full max-w-sm md:max-w-none" />
      </section>

      <div aria-hidden className="my-8 hidden items-center gap-0 sm:flex">
        <span className="h-px flex-1 bg-primary/30" />
        <span className="rounded-full border-2 border-primary bg-paper px-6 py-1.5 text-sm font-bold text-primary">
          3 pași simpli
        </span>
        <span className="h-px flex-1 bg-primary/30" />
      </div>

      <div className="mx-auto max-w-2xl">
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map(([n, title, text, tone], i) => (
            <li key={n} style={delay(100 + i * 100)} className="rise rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full font-black ${tone}`}>{n}</span>
              <p className="mt-2 font-extrabold text-ink">{title}</p>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>

        <section className="mt-10" aria-labelledby="profil">
          <h2 id="profil" className="text-3xl font-black tracking-tight text-ink">
            Ce profil de liceu urmezi?
          </h2>
          {groups.map((g) => (
            <fieldset key={g.name} className="mt-5">
              <legend className="text-sm font-extrabold uppercase tracking-wide text-primary">{g.name}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {g.items.map((p) => {
                  const on = p.id === profileId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setProfileId(p.id)}
                      className={`opt min-h-12 rounded-2xl border-2 px-4 py-3 text-left font-semibold ${
                        on
                          ? "border-primary bg-primary-tint text-primary-dark"
                          : "border-transparent bg-card text-ink-soft ring-1 ring-line hover:ring-primary/50"
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
      </div>

      <div className="sticky bottom-0 -mx-5 mt-8 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-4 pt-6">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            disabled={!profileId}
            onClick={start}
            className="min-h-14 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft disabled:shadow-none"
          >
            Începe
          </button>
          {!profileId && <p className="mt-2 text-center text-sm text-ink-soft">Alege mai întâi un profil.</p>}
        </div>
      </div>
    </Shell>
  );
}
