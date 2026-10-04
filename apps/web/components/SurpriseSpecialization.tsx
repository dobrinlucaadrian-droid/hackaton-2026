"use client";
// "Surprinde-mă": a button that shows one specialization picked at random, with its domain, a short description and a link to universities.
import Link from "next/link";
import { useState } from "react";
import { domains, specializations } from "@/lib/data";
import type { Specialization } from "@/lib/types";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";

export function SurpriseSpecialization() {
  const [pick, setPick] = useState<Specialization | null>(null);
  const [count, setCount] = useState(0);

  // Picks on click only (never during render), and never the same one twice in a row.
  function surprise() {
    if (specializations.length === 0) return;
    let next = specializations[Math.floor(Math.random() * specializations.length)];
    if (pick && specializations.length > 1) {
      while (next.id === pick.id) next = specializations[Math.floor(Math.random() * specializations.length)];
    }
    setPick(next);
    setCount((c) => c + 1);
  }

  const domain = pick ? domains.find((d) => d.id === pick.domainId) : undefined;
  const style = pick ? domainStyle(pick.domainId) : undefined;
  const family = style ? FAMILY_CLASSES[style.family] : undefined;

  return (
    <section aria-labelledby="surpriza" className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="surpriza" className="text-2xl font-black tracking-tight text-ink">
            Nu știi de unde să începi?
          </h2>
          <p className="mt-1 text-ink-soft">Apasă și îți arătăm o specializare la întâmplare. Poate descoperi ceva la care nu te-ai gândit.</p>
        </div>
        <button
          type="button"
          onClick={surprise}
          className="min-h-12 shrink-0 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98]"
        >
          <span aria-hidden className="mr-2">🎲</span>
          {pick ? "Arată-mi alta" : "Surprinde-mă"}
        </button>
      </div>

      <div aria-live="polite">
        {pick && domain && style && family && (
          <div key={count} className={`rise mt-5 rounded-2xl p-5 ${family.band}`}>
            <p className={`text-sm font-bold ${family.text}`}>
              <span aria-hidden className="mr-1">{style.emoji}</span>
              {domain.name}
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-ink">{pick.name}</p>
            <p className="mt-2 text-ink-soft">{pick.short}</p>
            <Link
              href={`/universitati?domeniu=${pick.domainId}`}
              className="mt-4 inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
            >
              Vezi universitățile unde se studiază →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
