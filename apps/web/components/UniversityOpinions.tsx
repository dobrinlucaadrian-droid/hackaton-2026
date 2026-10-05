"use client";
// "Ce spun studenții" on a university sheet: the opinions about this university, including approved ones from the database. Renders nothing when there are none.
import Link from "next/link";
import { useTestimonialsFor } from "@/lib/useTestimonials";
import { StudentCard } from "./StudentCard";

export function UniversityOpinions({ universityId }: { universityId: string }) {
  const opinions = useTestimonialsFor(universityId);
  if (opinions.length === 0) return null;
  return (
    <section id="studenti" aria-labelledby="studenti-t" className="mt-8 scroll-mt-20">
      <h2 id="studenti-t" className="text-2xl font-black tracking-tight text-ink">Ce spun studenții</h2>
      <div className="mt-3 space-y-4">
        <p className="text-ink-soft">
          {opinions.length === 1 ? "O părere reală de la un student de aici." : `${opinions.length} păreri reale de la studenți de aici.`}
        </p>
        {opinions.map((t, i) => (
          <StudentCard key={`${t.name}-${t.faculty}-${i}`} t={t} as="div" />
        ))}
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <Link href="/studenti" className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
            Vezi părerile de la toate universitățile →
          </Link>
          <Link href="/studenti/parere" className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
            Ești student aici? Scrie și tu →
          </Link>
        </div>
      </div>
    </section>
  );
}
