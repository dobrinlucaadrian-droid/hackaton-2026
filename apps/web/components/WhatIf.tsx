"use client";
// Collapsible "Ce-ar fi dacă?" panel (in the page language): one slider per inclination, controlled by the result page.
import { useState } from "react";
import { useLang, useT } from "@/components/LangProvider";
import { TRAITS, traitLabel } from "@/lib/traits";
import type { TraitId } from "@/lib/types";

type Props = {
  values: Record<TraitId, number>;
  changed: boolean;
  onChange: (id: TraitId, value: number) => void;
  onReset: () => void;
};

export function WhatIf({ values, changed, onChange, onReset }: Props) {
  const lang = useLang();
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <section className="mx-auto mt-6 max-w-2xl rounded-3xl bg-card p-5 ring-1 ring-line sm:max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{t("Ce-ar fi dacă?", "What if?")}</h2>
          <p className="text-ink-soft">{t("Mută cursoarele și vezi cum se schimbă domeniile potrivite.", "Move the sliders and see how the matching fields change.")}</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="whatif-panel"
          onClick={() => setOpen(!open)}
          className="rounded-2xl border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint"
        >
          {open ? t("Închide", "Close") : t("Încearcă", "Try it")}
        </button>
      </div>
      {open && (
        <div id="whatif-panel" className="mt-5">
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {TRAITS.map((id) => (
              <div key={id}>
                <label htmlFor={`trait-${id}`} className="flex justify-between font-medium text-ink">
                  <span>{traitLabel(id, lang)}</span>
                  <span className="tabular-nums text-primary">{values[id]}</span>
                </label>
                <input
                  id={`trait-${id}`}
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={values[id]}
                  onChange={(e) => onChange(id, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          {changed && (
            <button
              type="button"
              onClick={onReset}
              className="mt-4 rounded-2xl bg-primary px-5 py-2 font-bold text-white hover:bg-primary-dark"
            >
              {t("Revino la răspunsurile mele", "Back to my answers")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
