"use client";
// "Ce poți studia aici" on a university sheet: tapping a domain opens, on the same page, its specializations and the subjects per year.
import Link from "next/link";
import { useState } from "react";
import { curriculumFor } from "@/lib/curricula";
import { CurriculumPlan } from "./CurriculumPlan";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";

type Item = { id: string; name: string; short: string; specs: { id: string; name: string; short: string }[] };

export function UniversityDomains({ items, showPlan = true }: { items: Item[]; showPlan?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((d) => d.id === openId);

  return (
    <div>
      <p className="text-sm">Apasă pe un domeniu ca să vezi ce poți studia.</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((d) => {
          const { family, emoji } = domainStyle(d.id);
          const on = d.id === openId;
          return (
            <li key={d.id}>
              <button
                type="button"
                aria-expanded={on}
                aria-controls="domeniu-deschis"
                onClick={() => setOpenId(on ? null : d.id)}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition hover:opacity-80 ${
                  on ? "bg-primary text-white" : FAMILY_CLASSES[family].chip
                }`}
              >
                <span aria-hidden className="mr-1">{emoji}</span>
                {d.name}
                <span aria-hidden className={`ml-2 transition-transform ${on ? "rotate-180" : ""}`}>▾</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div id="domeniu-deschis" aria-live="polite">
        {open && (
          <div key={open.id} className="slide-in mt-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
            <h4 className="text-lg font-black tracking-tight text-ink">{open.name}</h4>
            <p className="mt-1 text-sm">{open.short}</p>

            {open.specs.length > 0 && (
              <>
                <p className="mt-3 text-sm font-extrabold text-primary-dark">Specializări din acest domeniu</p>
                <ul className="mt-2 space-y-3">
                  {open.specs.map((s) => (
                    <li key={s.id} className="border-l-4 border-line pl-3">
                      <p className="text-sm font-bold text-ink">{s.name}</p>
                      <p className="text-sm">{s.short}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">Lista exactă a specializărilor de la această universitate o găsești pe site-ul ei.</p>
              </>
            )}

            {showPlan && curriculumFor(open.id) && (
              <details className="group mt-3 rounded-2xl bg-card ring-1 ring-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 font-bold text-ink [&::-webkit-details-marker]:hidden">
                  Ce înveți, an cu an
                  <span aria-hidden className="text-primary transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="px-4 pb-4">
                  <CurriculumPlan domainId={open.id} />
                </div>
              </details>
            )}

            <Link
              href={`/universitati?domeniu=${open.id}`}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
            >
              Vezi și alte universități cu acest domeniu →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
