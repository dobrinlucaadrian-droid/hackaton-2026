"use client";
// "Toate specializările": categories as accordions with their domains and specializations, plus a live text filter.
import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, domains } from "@/lib/data";
import { normalize, specializationsFor } from "@/lib/universities";
import { FAMILY_CLASSES, domainStyle } from "./domainStyle";

export function SpecializationsBrowser() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const q = normalize(query.trim());

  const view = useMemo(
    () =>
      categories
        .map((c) => {
          const catHit = q !== "" && normalize(`${c.name} ${c.short}`).includes(q);
          const items = c.domainIds
            .map((id) => domains.find((d) => d.id === id))
            .filter((d): d is NonNullable<typeof d> => !!d)
            .map((d) => {
              const all = specializationsFor(d.id);
              if (!q || catHit) return { domain: d, specs: all };
              const domHit = normalize(`${d.name} ${d.short}`).includes(q);
              const specs = domHit ? all : all.filter((s) => normalize(`${s.name} ${s.short}`).includes(q));
              return domHit || specs.length ? { domain: d, specs } : null;
            })
            .filter((x): x is NonNullable<typeof x> => !!x);
          return { category: c, items };
        })
        .filter((c) => c.items.length > 0),
    [q],
  );

  return (
    <section aria-labelledby="specializari" className="mx-auto mt-12 max-w-3xl">
      <h2 id="specializari" className="text-3xl font-black tracking-tight text-ink">
        Toate specializările
      </h2>
      <p className="mt-1 text-ink-soft">Răsfoiește domeniile și vezi ce poți studia în fiecare.</p>
      <label htmlFor="filtru-spec" className="sr-only">
        Caută o specializare
      </label>
      <input
        id="filtru-spec"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Caută o specializare…"
        className="mt-4 min-h-12 w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 text-ink shadow-sm ring-1 ring-line focus:border-primary focus:outline-none"
      />

      {view.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card p-6 text-center ring-1 ring-line" role="status">
          <p className="font-bold text-ink">Nu am găsit nimic pentru „{query.trim()}”.</p>
          <p className="mt-1 text-ink-soft">Încearcă un cuvânt mai scurt sau altă scriere.</p>
          <button type="button" onClick={() => setQuery("")} className="mt-3 min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
            Șterge căutarea
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {view.map(({ category: c, items }, idx) => {
            const isOpen = q !== "" || (open[c.id] ?? idx === 0);
            return (
              <div key={c.id} className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`cat-${c.id}`}
                    onClick={() => setOpen((o) => ({ ...o, [c.id]: !isOpen }))}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span aria-hidden className="text-2xl">{c.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-black text-ink">{c.name}</span>
                      <span className="block text-sm text-ink-soft">{c.short}</span>
                    </span>
                    <span aria-hidden className={`text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </button>
                </h3>
                {isOpen && (
                  <div id={`cat-${c.id}`} className="space-y-3 border-t border-line p-4">
                    {items.map(({ domain: d, specs }) => {
                      const { family, emoji } = domainStyle(d.id);
                      const f = FAMILY_CLASSES[family];
                      return (
                        <article key={d.id} className="rounded-xl bg-paper p-4">
                          <h4 className="flex items-center gap-2 font-extrabold text-ink">
                            <span aria-hidden className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${f.band}`}>{emoji}</span>
                            {d.name}
                          </h4>
                          <p className="mt-1 text-sm text-ink-soft">{d.short}</p>
                          {specs.length > 0 && (
                            <ul className="mt-3 space-y-2">
                              {specs.map((s) => (
                                <li key={s.id} className="border-l-4 border-line pl-3">
                                  <p className={`text-sm font-bold ${f.text}`}>{s.name}</p>
                                  <p className="text-sm text-ink-soft">{s.short}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                          <Link
                            href={`/universitati?domeniu=${d.id}`}
                            className="mt-3 inline-flex min-h-11 items-center rounded-full px-1 font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
                          >
                            Vezi universitățile →
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
