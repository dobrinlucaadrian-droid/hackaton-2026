// Grid of category tiles (emoji, name, domain and specialization counts), each linking to its category page.
import Link from "next/link";
import { categories } from "@/lib/data";
import { specializationsFor } from "@/lib/universities";

export function CategoryTiles() {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {categories.map((c) => {
        const specs = c.domainIds.reduce((n, id) => n + specializationsFor(id).length, 0);
        return (
          <li key={c.id}>
            <Link
              href={`/specializari/${c.id}`}
              className="opt flex h-full min-h-24 flex-col rounded-2xl bg-card p-3 shadow-sm ring-1 ring-line hover:ring-primary/50"
            >
              <span aria-hidden className="text-2xl">{c.emoji}</span>
              <span className="mt-1 text-sm font-black leading-tight text-ink">{c.name}</span>
              <span className="mt-auto pt-2 text-xs text-ink-soft">
                {c.domainIds.length} domenii · {specs} specializări
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
