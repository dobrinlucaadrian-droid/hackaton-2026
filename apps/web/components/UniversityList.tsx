"use client";
// Labelled list of universities with links; shows 5 first and a "Vezi toate" toggle.
import Link from "next/link";
import { useState } from "react";
import type { University } from "@/lib/types";

const LIMIT = 5;

export function UniversityList({ title, items, abroad }: { title: string; items: University[]; abroad: boolean }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, LIMIT);
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-dark">{title}</h4>
      <ul className="mt-2 space-y-2">
        {shown.map((u) => (
          <li key={u.id} className="rounded-xl bg-paper px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/universitati/${u.id}`}
                className="font-semibold text-primary-dark underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
              >
                {u.name}
              </Link>
              <a
                href={u.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Site-ul ${u.name} (se deschide într-o pagină nouă)`}
                className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-ink-soft hover:text-primary"
              >
                Site ↗
              </a>
            </div>
            <p className="text-sm text-ink-soft">
              {abroad ? `${u.city}, ${u.country}` : u.city}
              {abroad && u.language ? ` · limba: ${u.language}` : ""}
              {abroad && u.tuition ? ` · taxe: ${u.tuition}` : ""}
            </p>
          </li>
        ))}
      </ul>
      {items.length > LIMIT && (
        <button
          type="button"
          onClick={() => setAll(!all)}
          aria-expanded={all}
          className="mt-2 rounded-lg px-3 py-1 text-sm font-semibold text-primary-dark hover:bg-primary-tint"
        >
          {all ? "Arată mai puține" : `Vezi toate (${items.length})`}
        </button>
      )}
    </div>
  );
}
