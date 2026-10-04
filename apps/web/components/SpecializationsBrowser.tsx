"use client";
// /specializari body: a text filter over all categories, domains and specializations; without text it shows the category tiles.
import { useMemo, useState } from "react";
import { categories, domains } from "@/lib/data";
import { normalize, specializationsFor } from "@/lib/universities";
import { CategoryTiles } from "./CategoryTiles";
import { DomainDetails } from "./DomainDetails";
import { InterestPicker } from "./InterestPicker";

export function SpecializationsBrowser() {
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  const view = useMemo(() => {
    if (!q) return [];
    return categories
      .map((c) => {
        const catHit = normalize(`${c.name} ${c.short}`).includes(q);
        const items = c.domainIds
          .map((id) => domains.find((d) => d.id === id))
          .filter((d): d is NonNullable<typeof d> => !!d)
          .map((d) => {
            const all = specializationsFor(d.id);
            if (catHit) return { domain: d, specs: all };
            const domHit = normalize(`${d.name} ${d.short}`).includes(q);
            const specs = domHit ? all : all.filter((s) => normalize(`${s.name} ${s.short}`).includes(q));
            return domHit || specs.length ? { domain: d, specs } : null;
          })
          .filter((x): x is NonNullable<typeof x> => !!x);
        return { category: c, items };
      })
      .filter((c) => c.items.length > 0);
  }, [q]);

  return (
    <div>
      <label htmlFor="filtru-spec" className="sr-only">
        Caută o specializare
      </label>
      <input
        id="filtru-spec"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Caută o specializare…"
        className="min-h-12 w-full rounded-2xl border-2 border-transparent bg-card px-4 py-3 text-ink shadow-sm ring-1 ring-line focus:border-primary focus:outline-none"
      />

      {!q ? (
        <div className="mt-5">
          <CategoryTiles />
          <InterestPicker />
        </div>
      ) : view.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card p-6 text-center ring-1 ring-line" role="status">
          <p className="font-bold text-ink">Nu am găsit nimic pentru „{query.trim()}”.</p>
          <p className="mt-1 text-ink-soft">Încearcă un cuvânt mai scurt sau altă scriere.</p>
          <button type="button" onClick={() => setQuery("")} className="mt-3 min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
            Șterge căutarea
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-6" aria-live="polite">
          {view.map(({ category: c, items }) => (
            <section key={c.id} aria-label={c.name}>
              <h2 className="flex items-center gap-2 text-lg font-black text-ink">
                <span aria-hidden>{c.emoji}</span>
                {c.name}
              </h2>
              <div className="mt-2 space-y-2">
                {items.map(({ domain, specs }) => (
                  <DomainDetails key={`${q}-${domain.id}`} domain={domain} specs={specs} open />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
