"use client";
// /specializari body: the page opening (title, text, a drawn search box and the drawing), then a text filter over all categories, domains and specializations (in the page language); without text it shows the drawn category tiles, five to a row, and the interest picker.
import { useMemo, useState, type ReactNode } from "react";
import { categories, domains } from "@/lib/data";
import { localCategory, localDomain, localSpecialization } from "@/lib/i18n-data";
import { normalize, specializationsFor } from "@/lib/labels";
import { CategoryIcon } from "./CategoryIcon";
import { CategoryTiles } from "./CategoryTiles";
import { PageOpening, SectionTitle } from "./Drawn";
import { DomainDetails } from "./DomainDetails";
import { InterestPicker } from "./InterestPicker";
import { useLang, useT } from "./LangProvider";

export function SpecializationsBrowser({ title, lead, scene }: { title: ReactNode; lead: ReactNode; scene: ReactNode }) {
  const lang = useLang();
  const t = useT();
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  const view = useMemo(() => {
    if (!q) return [];
    return categories
      .map((rawCat) => {
        const c = localCategory(rawCat, lang);
        const catHit = normalize(`${c.name} ${c.short}`).includes(q);
        const items = c.domainIds
          .map((id) => domains.find((d) => d.id === id))
          .filter((d): d is NonNullable<typeof d> => !!d)
          .map((rawDomain) => {
            const d = localDomain(rawDomain, lang);
            const all = specializationsFor(d.id).map((s) => localSpecialization(s, lang));
            if (catHit) return { domain: d, specs: all };
            const domHit = normalize(`${d.name} ${d.short}`).includes(q);
            const specs = domHit ? all : all.filter((s) => normalize(`${s.name} ${s.short}`).includes(q));
            return domHit || specs.length ? { domain: d, specs } : null;
          })
          .filter((x): x is NonNullable<typeof x> => !!x);
        return { category: c, items };
      })
      .filter((c) => c.items.length > 0);
  }, [q, lang]);

  return (
    <div>
      <PageOpening title={title} lead={lead} scene={scene}>
        <div className="drawn mx-auto mt-6 flex max-w-xl items-center gap-3 rounded-[1.4rem] bg-card py-1.5 pr-2 pl-4 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-primary md:mx-0">
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <label htmlFor="filtru-spec" className="sr-only">
            {t("Caută o specializare", "Search for a specialisation")}
          </label>
          <input
            id="filtru-spec"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ex: psihologie, robotică, design", "e.g. psychology, robotics, design")}
            className="min-h-12 min-w-0 flex-1 bg-transparent text-lg text-ink placeholder:text-ink-soft/80 focus:outline-none focus-visible:outline-none"
          />
        </div>
      </PageOpening>

      {!q ? (
        <div>
          <SectionTitle center>{t("Alege o categorie", "Pick a category")}</SectionTitle>
          <CategoryTiles />
          <InterestPicker />
        </div>
      ) : view.length === 0 ? (
        <div className="drawn mt-8 rounded-3xl bg-card p-6 text-center" role="status">
          <p className="font-bold text-ink">{t(`Nu am găsit nimic pentru „${query.trim()}”.`, `We found nothing for “${query.trim()}”.`)}</p>
          <p className="mt-1 text-ink-soft">{t("Încearcă un cuvânt mai scurt sau altă scriere.", "Try a shorter word or a different spelling.")}</p>
          <button type="button" onClick={() => setQuery("")} className="mt-3 min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
            {t("Șterge căutarea", "Clear search")}
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-6" aria-live="polite">
          {view.map(({ category: c, items }) => (
            <section key={c.id} aria-label={c.name}>
              <h2 className="flex items-center gap-3 text-xl font-extrabold text-ink">
                <CategoryIcon id={c.id} className="h-10 w-10" />
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
