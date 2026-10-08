// Home page: the hero with the two main actions and "UniPath în cifre" (counts taken from the data); search and specializations have their own pages.
import Link from "next/link";
import { HeroScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { catalogTotals } from "@/lib/catalog";
import { specializations, testimonials, universities } from "@/lib/data";

const nf = new Intl.NumberFormat("ro-RO");

const numbers: { value: string; label: string; href: string; tone: string }[] = [
  { value: nf.format(universities.length), label: "universități cu fișă completă", href: "/universitati", tone: "text-primary" },
  { value: nf.format(specializations.length), label: "specializări explicate pe înțeles", href: "/specializari", tone: "text-teal-ink" },
  { value: nf.format(testimonials.length), label: "păreri de la studenți adevărați", href: "/studenti", tone: "text-sky" },
  { value: nf.format(catalogTotals.institutions), label: `universități și instituții din ${catalogTotals.countries} țări, din date oficiale`, href: "/programe", tone: "text-violet" },
];

export default function Home() {
  return (
    <Shell wide>
      <section className="mt-2 grid items-center gap-4 md:grid-cols-2">
        <div className="rise text-center md:text-left">
          <h1 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
            Ghidul tău între <span className="text-primary">liceu</span> și <span className="text-teal">facultate</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft md:mx-0">afli ce să studiezi și unde.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/test"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98]"
            >
              Completează chestionarul
            </Link>
            <Link
              href="/universitati"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary px-6 py-3 font-black text-primary transition hover:bg-primary-tint"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Găsește top 10 universități
              <span className="rounded-full bg-primary-tint px-2 py-0.5 text-xs">Filtre</span>
            </Link>
          </div>
          <Link
            href="/studenti"
            className="mt-4 inline-flex min-h-11 items-center px-2 font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
          >
            Ce spun studenții
          </Link>
        </div>
        <HeroScene className="float mx-auto w-full max-w-[9rem] sm:max-w-sm md:max-w-none" />
      </section>

      <section aria-labelledby="in-cifre" className="rise mx-auto mt-12 max-w-4xl">
        <h2 id="in-cifre" className="text-center text-3xl font-black tracking-tight text-ink">
          UniPath în cifre
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {numbers.map((n) => (
            <li key={n.label}>
              <Link
                href={n.href}
                className="opt flex h-full min-h-28 flex-col justify-center rounded-3xl bg-card p-4 text-center shadow-sm ring-1 ring-line hover:ring-primary/50"
              >
                <span className={`text-3xl font-black tracking-tight sm:text-4xl ${n.tone}`}>{n.value}</span>
                <span className="mt-1 text-sm font-semibold text-ink-soft">{n.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
