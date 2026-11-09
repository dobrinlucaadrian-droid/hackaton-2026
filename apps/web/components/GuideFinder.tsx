"use client";
// Country guides index body (Romanian pages): a drawn search box that filters the country postcards as you type (diacritics do not matter); each postcard has a dashed stamp with a plane.
import { useState } from "react";
import { countryName } from "@/lib/i18n-data";
import { normalize } from "@/lib/labels";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";

export type GuideTile = { id: string; country: string; intro: string };

export function GuideFinder({ tiles }: { tiles: GuideTile[] }) {
  const lang = useLang();
  const t = useT();
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const shown = q ? tiles.filter((tile) => normalize(countryName(tile.country, lang)).includes(q)) : tiles;
  return (
    <>
      <div className="relative mx-auto mt-2 max-w-xl md:mx-0">
        <label htmlFor="cauta-tara" className="sr-only">{t("Caută o țară", "Search for a country")}</label>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 fill-none stroke-ink"
          strokeWidth="2.6"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="cauta-tara"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Caută o țară, de exemplu „Spania”…", "Search for a country, for example “Spain”…")}
          className="min-h-14 w-full rounded-[1.4rem] border-[3px] border-ink bg-card py-3 pl-12 pr-4 text-lg text-ink shadow-[0_4px_0_var(--color-ink)] placeholder:text-ink-soft/80 focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </div>
      {shown.length === 0 ? (
        <p className="drawn mt-8 rounded-2xl bg-card p-6 text-ink-soft" aria-live="polite">
          {t(`Nu avem încă un ghid pentru „${query.trim()}”. Încearcă altă țară.`, `We do not have a guide for “${query.trim()}” yet. Try another country.`)}
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-guides>
          {shown.map((g, i) => (
            <li key={g.id}>
              <Link
                href={`/ghiduri/${g.id}`}
                className={`drawn drawn-link relative flex h-full min-h-40 flex-col rounded-[1.25rem] bg-card p-5 ${i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-[0.8deg]" : ""}`}
              >
                <span aria-hidden className="absolute right-4 top-4 flex h-12 w-10 items-center justify-center rounded-md border-2 border-dashed border-ink/50">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l7-2 3-7 2 7 6 2-6 2-2 7-3-7z" />
                  </svg>
                </span>
                <span className="min-h-12 pr-12 text-xl font-extrabold leading-tight tracking-tight text-ink">{countryName(g.country, lang)}</span>
                <span className="mt-2 line-clamp-3 text-sm text-ink-soft">{g.intro}</span>
                <span className="hand mt-auto pt-3 text-xl leading-none text-primary">{t("citește ghidul →", "read the guide →")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
