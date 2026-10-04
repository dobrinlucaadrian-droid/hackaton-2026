"use client";
// Collapsible "Ce-ar fi dacă?" panel: one slider per inclination, controlled by the result page.
import { useState } from "react";
import { TRAITS, TRAIT_LABEL } from "@/lib/match";
import type { TraitId } from "@/lib/types";

type Props = {
  values: Record<TraitId, number>;
  changed: boolean;
  onChange: (id: TraitId, value: number) => void;
  onReset: () => void;
};

export function WhatIf({ values, changed, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mx-auto mt-6 max-w-2xl rounded-3xl bg-cream p-5 ring-1 ring-line sm:max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy">Ce-ar fi dacă?</h2>
          <p className="text-navy-soft">Mută cursoarele și vezi cum se schimbă domeniile potrivite.</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="whatif-panel"
          onClick={() => setOpen(!open)}
          className="rounded-2xl border-2 border-burgundy px-5 py-2 font-bold text-burgundy hover:bg-burgundy-tint"
        >
          {open ? "Închide" : "Încearcă"}
        </button>
      </div>
      {open && (
        <div id="whatif-panel" className="mt-5">
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {TRAITS.map((id) => (
              <div key={id}>
                <label htmlFor={`trait-${id}`} className="flex justify-between font-medium text-navy">
                  <span>{TRAIT_LABEL[id]}</span>
                  <span className="tabular-nums text-burgundy">{values[id]}</span>
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
              className="mt-4 rounded-2xl bg-burgundy px-5 py-2 font-bold text-cream hover:bg-burgundy-dark"
            >
              Revino la răspunsurile mele
            </button>
          )}
        </div>
      )}
    </section>
  );
}
