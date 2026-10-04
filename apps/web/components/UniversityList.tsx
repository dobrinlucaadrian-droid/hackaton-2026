"use client";
// Labelled list of universities with links; shows 5 first and a "Vezi toate" toggle.
import { useState } from "react";
import type { University } from "@/lib/types";

const LIMIT = 5;

export function UniversityList({ title, items, abroad }: { title: string; items: University[]; abroad: boolean }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, LIMIT);
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-burgundy-dark">{title}</h4>
      <ul className="mt-2 space-y-2">
        {shown.map((u) => (
          <li key={u.id} className="rounded-xl bg-sand px-4 py-3">
            <a
              href={u.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-burgundy-dark underline decoration-burgundy/40 underline-offset-2 hover:text-burgundy-dark"
            >
              {u.name}
            </a>
            <p className="text-sm text-navy-soft">
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
          className="mt-2 rounded-lg px-3 py-1 text-sm font-semibold text-burgundy-dark hover:bg-burgundy-tint"
        >
          {all ? "Arată mai puține" : `Vezi toate (${items.length})`}
        </button>
      )}
    </div>
  );
}
