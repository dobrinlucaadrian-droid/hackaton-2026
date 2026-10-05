"use client";
// Student opinions with a search box: type a faculty or university and see every opinion we have from there.
import Link from "next/link";
import { useState } from "react";
import { Books, Sparkle } from "@/components/Illustrations";
import { StudentCard } from "@/components/StudentCard";
import { useTestimonials } from "@/lib/useTestimonials";
import type { Testimonial } from "@/lib/types";

/** Lower-cases, strips diacritics and punctuation, so "bucuresti" finds "București". */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Extra words people may type for a university (city, country, short names).
const EXTRA_WORDS: Record<string, string> = {
  "University of Cambridge": "anglia marea britanie uk",
  "Universitatea din București": "ub unibuc",
  "IE University": "madrid segovia spania",
  "ASE București": "academia de studii economice",
  "Universitatea din Amsterdam": "uva olanda amsterdam university",
  "Sciences Po Paris": "franta",
  "Universitatea Babeș-Bolyai": "ubb cluj napoca",
  ESADE: "barcelona spania business",
  "Institut Lyfe": "franta gastronomie ospitalitate",
  "Université Jean Moulin Lyon 3": "franta",
  "Medicină, Lyon (Franța)": "medicina",
  "Universitatea Bocconi": "milano italia",
  "La Salle Barcelona": "spania",
  "Columbia University": "ivy league america statele unite usa",
  "University of Wisconsin–Madison": "wisconsin madison america statele unite usa comunicare",
  "Les Roches": "elvetia spania ospitalitate hotel",
  "UMF „Carol Davila” București": "umfcd stomatologie medicina",
  "Universitatea Paris-Saclay": "franta paris saclay",
  "Hogeschool Inholland": "olanda amsterdam asistenta medicala",
  "Universitatea de Vest din Timișoara": "uvt securitate",
  "Universidad Europea": "spania madrid valencia europeana",
};

type Group = { university: string; people: Testimonial[] };

/** Groups opinions by university, keeping the order in which each university first appears. */
function byUniversity(list: Testimonial[]): Group[] {
  const groups: Group[] = [];
  for (const t of list) {
    const university = t.university ?? t.faculty;
    const group = groups.find((g) => g.university === university);
    if (group) group.people.push(t);
    else groups.push({ university, people: [t] });
  }
  return groups;
}

/** True when every word of the query starts some word of the opinion's university, faculty or the student's name. */
function matches(t: Testimonial, query: string): boolean {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const university = t.university ?? t.faculty;
  const haystack = normalize(`${university} ${t.faculty} ${EXTRA_WORDS[university] ?? ""} ${t.name}`).split(" ");
  return words.every((w) => haystack.some((h) => h.startsWith(w)));
}

export function StudentVoices() {
  const testimonials = useTestimonials();
  const [query, setQuery] = useState("");
  const q = query.trim();
  const found = testimonials.filter((t) => matches(t, q));
  const groups = byUniversity(found);

  if (testimonials.length === 0) {
    return (
      <div className="rise mx-auto mt-10 max-w-2xl rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line">
        <div className="flex items-end justify-center gap-3">
          <Books className="h-16 w-16" />
          <Sparkle className="twinkle h-6 w-6 fill-violet" />
        </div>
        <p className="mt-4 text-ink-soft">Adunăm acum primele păreri. Revino în curând.</p>
      </div>
    );
  }

  return (
    <>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="mx-auto mt-6 max-w-2xl">
        <label htmlFor="cauta-studenti" className="sr-only">
          Caută o facultate sau o universitate
        </label>
        <div className="relative">
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
            id="cauta-studenti"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută o facultate sau o universitate…"
            className="min-h-12 w-full rounded-2xl border-2 border-transparent bg-card py-3 pl-12 pr-4 text-ink shadow-sm ring-1 ring-line placeholder:text-ink-soft/80 focus:border-primary focus:outline-none"
          />
        </div>
        <p className="mt-2 text-center text-sm text-ink-soft" aria-live="polite">
          {q === ""
            ? `Avem ${testimonials.length} păreri. Scrie numele unei facultăți ca să le vezi doar pe cele de acolo.`
            : found.length === 0
              ? ""
              : found.length === 1
                ? "Am găsit o părere."
                : `Am găsit ${found.length} păreri.`}
        </p>
      </form>

      {found.length === 0 ? (
        <div className="mx-auto mt-6 max-w-2xl rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line">
          <p className="text-lg font-extrabold text-ink">Nu avem încă o părere de la un student de acolo.</p>
          <p className="mt-2 text-ink-soft">Poți vedea totuși informații despre universitate.</p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/universitati?q=${encodeURIComponent(q)}`}
              className="inline-flex min-h-11 items-center rounded-2xl bg-primary px-5 py-2 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark"
            >
              Caută „{q}” la Universități
            </Link>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="min-h-11 rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint"
            >
              Vezi toate părerile
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6">
          {groups.map((g) => {
            const together = g.people.length > 1;
            return (
              <section key={g.university} className={`mx-auto w-full ${together ? "max-w-5xl" : "max-w-2xl"}`}>
                {together && (
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-teal-ink">
                    {g.university} · {g.people.length} studenți
                  </h2>
                )}
                <ul className={`grid gap-4 ${together ? "md:grid-cols-2" : ""}`}>
                  {g.people.map((t) => (
                    <StudentCard key={`${t.name}-${t.faculty}`} t={t} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
