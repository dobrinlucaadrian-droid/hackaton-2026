"use client";
// Search box (in the page language) with a magnifier icon; submits to /universitati?q=... or calls onSearch when given. With `suggest`, a list of suggestions opens while typing (arrows, Enter and Escape work; screen readers hear it as a combobox).
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Suggestion } from "@/lib/universities";
import { useHref, useT } from "./LangProvider";

export function SearchBox({
  initial = "",
  onSearch,
  id = "cauta",
  suggest,
}: {
  initial?: string;
  onSearch?: (q: string) => void;
  id?: string;
  suggest?: (q: string) => Suggestion[];
}) {
  const router = useRouter();
  const t = useT();
  const href = useHref();
  const listId = useId();
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const items = suggest && open ? suggest(value) : [];

  function search(q: string) {
    setOpen(false);
    if (onSearch) onSearch(q);
    else router.push(href(q ? `/universitati?q=${encodeURIComponent(q)}` : "/universitati"));
  }

  function pick(s: Suggestion) {
    setOpen(false);
    if (s.href) router.push(href(s.href));
    else {
      setValue(s.query ?? s.label);
      search(s.query ?? s.label);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (active >= 0 && items[active]) pick(items[active]);
    else search(value.trim());
  }

  function keys(e: KeyboardEvent<HTMLInputElement>) {
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <form onSubmit={submit} role="search" className="flex w-full gap-2">
      <label htmlFor={id} className="sr-only">
        {t("Caută o universitate, un oraș, o țară sau un domeniu", "Search for a university, a city, a country or a field")}
      </label>
      <div className="relative flex-1">
        <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 fill-none stroke-ink" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={id}
          type="search"
          value={value}
          autoComplete="off"
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={keys}
          onBlur={() => setOpen(false)}
          placeholder={t("Universitate, oraș, țară, domeniu…", "University, city, country, field…")}
          {...(suggest
            ? {
                role: "combobox",
                "aria-expanded": items.length > 0,
                "aria-controls": listId,
                "aria-autocomplete": "list" as const,
                ...(active >= 0 ? { "aria-activedescendant": `${listId}-${active}` } : {}),
              }
            : {})}
          className="min-h-14 w-full rounded-[1.4rem] border-[3px] border-ink bg-card py-3 pl-12 pr-4 text-lg text-ink shadow-[0_4px_0_var(--color-ink)] placeholder:text-ink-soft/80 focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        {items.length > 0 && (
          <ul id={listId} role="listbox" aria-label={t("Sugestii", "Suggestions")} className="drawn absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-card">
            {items.map((s, i) => (
              <li
                key={`${s.href ?? s.query}-${s.label}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // Mouse down, not click: the input loses focus (and closes the list) before a click would arrive.
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-12 cursor-pointer flex-col justify-center px-4 py-2 ${i === active ? "bg-primary-tint" : ""} ${i > 0 ? "border-t border-line" : ""}`}
              >
                <span className="flex items-center gap-1.5 font-bold text-ink">
                  {!s.href && (
                    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  )}
                  {s.label}
                </span>
                <span className="text-sm text-ink-soft">{s.sub}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="submit"
        className="min-h-14 rounded-[1.4rem] bg-primary px-6 font-extrabold text-white shadow-[0_3px_0_var(--color-primary-dark)] transition hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-px active:scale-[0.98]"
      >
        {t("Caută", "Search")}
      </button>
    </form>
  );
}
