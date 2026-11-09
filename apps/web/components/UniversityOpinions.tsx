"use client";
// "Ce spun studenții" on a university sheet: the opinions about this university, including approved ones from the database. Renders nothing when there are none.
import { useTestimonialsFor } from "@/lib/useTestimonials";
import { useT } from "./LangProvider";
import Link from "./LocalLink";
import { StudentCard } from "./StudentCard";

export function UniversityOpinions({ universityId }: { universityId: string }) {
  const t = useT();
  const opinions = useTestimonialsFor(universityId);
  if (opinions.length === 0) return null;
  return (
    <section id="studenti" aria-labelledby="studenti-t" className="mt-10 scroll-mt-20">
      <h2 id="studenti-t" className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        <svg aria-hidden viewBox="0 0 40 30" className="h-7 w-9 shrink-0" fill="none" stroke="#61122d" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22c10-14 20 6 32-12" /><path d="M28 8l8 2-2 8" /></svg>
        {t("Ce spun studenții", "What students say")}
      </h2>
      <div className="mt-3 space-y-4">
        <p className="text-ink-soft">
          {opinions.length === 1 ? t("O părere reală de la un student de aici.", "A real opinion from a student here.") : t("Păreri reale de la studenți de aici.", "Real opinions from students here.")}
        </p>
        {opinions.map((o, i) => (
          <StudentCard key={`${o.name}-${o.faculty}-${i}`} t={o} as="div" />
        ))}
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <Link href="/studenti" className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
            {t("Vezi părerile de la toate universitățile →", "See opinions from all universities →")}
          </Link>
          <Link href="/studenti/parere" className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
            {t("Ești student aici? Scrie și tu →", "Are you a student here? Write yours →")}
          </Link>
        </div>
      </div>
    </section>
  );
}
