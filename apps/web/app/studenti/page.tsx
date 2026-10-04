// Student voices: real opinions from students and graduates; people from the same university are shown side by side.
import Image from "next/image";
import Link from "next/link";
import { Books, Cap, Sparkle } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { testimonials } from "@/lib/data";
import type { Testimonial } from "@/lib/types";

export const metadata = { title: "Ce spun studenții — UniPath" };

/** Groups testimonials by university, keeping the order in which each university first appears. */
function byUniversity(list: Testimonial[]): { university: string; people: Testimonial[] }[] {
  const groups: { university: string; people: Testimonial[] }[] = [];
  for (const t of list) {
    const university = t.university ?? t.faculty;
    const group = groups.find((g) => g.university === university);
    if (group) group.people.push(t);
    else groups.push({ university, people: [t] });
  }
  return groups;
}

function Card({ t }: { t: Testimonial }) {
  return (
    <li className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <div className="flex items-center gap-4">
        {t.photo ? (
          <Image
            src={t.photo}
            alt={`Poză: ${t.name}`}
            width={320}
            height={320}
            loading="eager"
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-teal"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-tint text-3xl font-black text-primary ring-2 ring-teal"
          >
            {t.name.charAt(0)}
          </span>
        )}
        <div>
          <p className="text-xl font-extrabold text-ink">{t.name}</p>
          <p className="mt-1 text-sm font-bold text-primary">
            {t.faculty}
            {t.status ? ` · ${t.status}` : ""}
          </p>
        </div>
      </div>
      <blockquote className="mt-4 whitespace-pre-line border-l-4 border-teal pl-4 text-ink-soft">„{t.text}”</blockquote>
    </li>
  );
}

export default function Students() {
  const groups = byUniversity(testimonials);

  return (
    <Shell wide>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint"
        >
          ← Înapoi
        </Link>
        <section className="rise pt-6 text-center">
          <Cap className="float mx-auto h-16 w-16" />
          <h1 className="mt-2 text-4xl font-black tracking-tighter text-ink sm:text-5xl">Ce spun studenții</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            Păreri adevărate de la studenți și absolvenți, despre facultatea lor.
          </p>
        </section>
      </div>

      {groups.length === 0 ? (
        <div className="rise mx-auto mt-10 max-w-2xl rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line">
          <div className="flex items-end justify-center gap-3">
            <Books className="h-16 w-16" />
            <Sparkle className="twinkle h-6 w-6 fill-violet" />
          </div>
          <p className="mt-4 text-ink-soft">Adunăm acum primele păreri. Revino în curând.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          {groups.map((g, i) => {
            const together = g.people.length > 1;
            return (
              <section
                key={g.university}
                style={{ animationDelay: `${i * 80}ms` }}
                className={`rise mx-auto w-full ${together ? "max-w-5xl" : "max-w-2xl"}`}
              >
                {together && (
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-teal-ink">
                    {g.university} · {g.people.length} studenți
                  </h2>
                )}
                <ul className={`grid gap-4 ${together ? "md:grid-cols-2" : ""}`}>
                  {g.people.map((t) => (
                    <Card key={`${t.name}-${t.faculty}`} t={t} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/test"
          className="inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark"
        >
          Fă testul și află ce ți se potrivește
        </Link>
      </div>
    </Shell>
  );
}
