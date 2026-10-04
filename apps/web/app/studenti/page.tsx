// Student voices: real opinions from students and graduates (name, faculty, year or graduate, their words).
import Image from "next/image";
import Link from "next/link";
import { Books, Cap, Sparkle } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { testimonials } from "@/lib/data";

export const metadata = { title: "Ce spun studenții — UniPath" };

export default function Students() {
  return (
    <Shell>
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

      {testimonials.length === 0 ? (
        <div className="rise mt-10 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line">
          <div className="flex items-end justify-center gap-3">
            <Books className="h-16 w-16" />
            <Sparkle className="twinkle h-6 w-6 fill-violet" />
          </div>
          <p className="mt-4 text-ink-soft">Adunăm acum primele păreri. Revino în curând.</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {testimonials.map((t, i) => (
            <li
              key={`${t.name}-${t.faculty}`}
              style={{ animationDelay: `${i * 80}ms` }}
              className="rise rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line"
            >
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
              <blockquote className="mt-4 whitespace-pre-line border-l-4 border-teal pl-4 text-ink-soft">
                „{t.text}”
              </blockquote>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark"
        >
          Fă testul și află ce ți se potrivește
        </Link>
      </div>
    </Shell>
  );
}
