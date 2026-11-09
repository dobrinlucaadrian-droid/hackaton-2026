"use client";
// Grid of short drawn category tiles (a small ink drawing, the name and how many domains), five to a row on wide screens, centred, each linking to its category page, in the page language.
import { categories } from "@/lib/data";
import { localCategory } from "@/lib/i18n-data";
import { CategoryIcon } from "./CategoryIcon";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";

export function CategoryTiles() {
  const lang = useLang();
  const t = useT();
  return (
    <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((raw) => {
        const c = localCategory(raw, lang);
        const n = c.domainIds.length;
        return (
          <li key={c.id}>
            <Link
              href={`/specializari/${c.id}`}
              className="drawn drawn-link flex h-full flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-card px-3 py-4 text-center [border-width:2.5px] [box-shadow:0_3px_0_var(--color-ink)]"
            >
              <CategoryIcon id={c.id} className="h-12 w-12" />
              <span className="text-base font-extrabold leading-tight text-ink">{c.name}</span>
              <span className="text-sm font-extrabold text-primary">{t(`${n} ${n === 1 ? "domeniu" : "domenii"} →`, `${n} ${n === 1 ? "field" : "fields"} →`)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
