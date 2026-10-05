// "Ce înveți, an cu an": the main subjects of each study year for a domain, taken from one official curriculum, with a link to it.
import { curriculumFor } from "@/lib/curricula";

export function CurriculumPlan({ domainId }: { domainId: string }) {
  const c = curriculumFor(domainId);
  if (!c) return null;
  return (
    <div data-plan={domainId}>
      <ol className="space-y-3">
        {c.plan.map((y) => (
          <li key={y.year}>
            <p className="text-sm font-extrabold text-primary-dark">Anul {y.year}</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {y.subjects.map((s) => (
                <li key={s} className="rounded-lg bg-card px-2.5 py-1 text-sm text-ink ring-1 ring-line">
                  {s}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-ink-soft">
        Exemplu: {c.source.program}, {c.source.university}
        {c.source.academicYear ? ` (${c.source.academicYear})` : ""}. Materiile diferă de la o facultate la alta.
      </p>
      <a
        href={c.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
      >
        Vezi planul de învățământ oficial ↗
      </a>
    </div>
  );
}
