"use client";
// Search box with a magnifier icon; submits to /universitati?q=... or calls onSearch when given.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchBox({ initial = "", onSearch, id = "cauta" }: { initial?: string; onSearch?: (q: string) => void; id?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (onSearch) onSearch(q);
    else router.push(q ? `/universitati?q=${encodeURIComponent(q)}` : "/universitati");
  }

  return (
    <form onSubmit={submit} role="search" className="flex w-full gap-2">
      <label htmlFor={id} className="sr-only">
        Caută o universitate, un oraș, o țară sau un domeniu
      </label>
      <div className="relative flex-1">
        <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-ink-soft" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Caută o universitate, un oraș, o țară sau un domeniu…"
          className="min-h-12 w-full rounded-2xl border-2 border-transparent bg-card py-3 pl-12 pr-4 text-ink shadow-sm ring-1 ring-line placeholder:text-ink-soft/80 focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="min-h-12 rounded-2xl bg-primary px-5 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98]"
      >
        Caută
      </button>
    </form>
  );
}
