// Student voices: real opinions from students and graduates (name, faculty, year or graduate, their words).
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { testimonials } from "@/lib/data";

export const metadata = { title: "Ce spun studenții — UniPath" };

export default function Students() {
  return (
    <Shell>
      <section className="pt-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Ce spun studenții</h1>
        <p className="mx-auto mt-3 max-w-md text-navy-soft">
          Păreri adevărate de la studenți și absolvenți, despre facultatea lor.
        </p>
      </section>

      {testimonials.length === 0 ? (
        <p className="mt-10 rounded-3xl bg-cream p-8 text-center text-navy-soft shadow-sm ring-1 ring-line">
          Adunăm acum primele păreri. Revino în curând.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {testimonials.map((t) => (
            <li key={`${t.name}-${t.faculty}`} className="rounded-3xl bg-cream p-6 shadow-sm ring-1 ring-line">
              <p className="text-lg font-bold text-navy">{t.name}</p>
              <p className="mt-1 text-sm font-semibold text-burgundy">
                {t.faculty} · {t.status}
              </p>
              <blockquote className="mt-4 border-l-4 border-burgundy pl-4 text-navy-soft">„{t.text}”</blockquote>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block rounded-2xl bg-burgundy px-6 py-3 font-semibold text-cream hover:bg-burgundy-dark"
        >
          Fă testul și află ce ți se potrivește
        </Link>
      </div>
    </Shell>
  );
}
