"use client";
// Test start screen: big headline, the 3-step explanation and the button that starts the quiz (the profile is asked inside the quiz).
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { HeroScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { saveDraft } from "@/lib/session";

const steps = [
  ["1", "Alegi profilul de liceu", "E prima întrebare din chestionar.", "bg-primary-tint text-primary-dark"],
  ["2", "Răspunzi la întrebări", "Sunt scurte și nu există răspunsuri greșite.", "bg-teal-tint text-teal-ink"],
  ["3", "Primești 3 domenii", "Cu procente, motive și facultăți unde poți studia.", "bg-violet-tint text-violet-ink"],
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Home() {
  const router = useRouter();
  function start() {
    saveDraft({ choices: {} }); // a fresh test: earlier answers are dropped
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

      </div>

      <div className="sticky bottom-0 -mx-5 mt-8 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-4 pt-6">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={start}
            className="min-h-14 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft disabled:shadow-none"
          >
            Începe chestionarul
          </button>
        </div>
      </div>
    </Shell>
  );
}
