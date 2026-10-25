"use client";
// Country guides index body (Romanian pages): a search box with a magnifier that filters the country tiles as you type (diacritics do not matter).
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
      <div className="relative mt-6 max-w-xl">
        <label htmlFor="cauta-tara" className="sr-only">{t("Caută o țară", "Search for a country")}</label>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-ink-soft"
          strokeWidth="2.2"
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
          className="min-h-12 w-full rounded-2xl border-2 border-transparent bg-card py-3 pl-12 pr-4 text-ink shadow-sm ring-1 ring-line placeholder:text-ink-soft/80 focus:border-primary focus:outline-none"
        />
      </div>
      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-card p-6 text-ink-soft ring-1 ring-line" aria-live="polite">
          {t(`Nu avem încă un ghid pentru „${query.trim()}”. Încearcă altă țară.`, `We do not have a guide for “${query.trim()}” yet. Try another country.`)}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-guides>
          {shown.map((g) => (
            <li key={g.id}>
              <Link href={`/ghiduri/${g.id}`} className="opt flex h-full min-h-36 flex-col rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line hover:ring-primary/50">
                <span className="text-2xl font-black tracking-tight text-ink">{countryName(g.country, lang)}</span>
                <span className="mt-2 text-sm text-ink-soft">{g.intro}</span>
                <span className="mt-auto pt-3 text-sm font-bold text-primary">{t("Citește ghidul →", "Read the guide →")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
