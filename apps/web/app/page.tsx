// Home page: search box, hero with the two main actions, and the browsable list of all specializations.
import Image from "next/image";
import Link from "next/link";
import { HeroScene } from "@/components/Illustrations";
import { SearchBox } from "@/components/SearchBox";
import { Shell } from "@/components/Shell";
import { SpecializationsBrowser } from "@/components/SpecializationsBrowser";

export default function Home() {
  return (
    <Shell wide>
      <div className="mx-auto max-w-2xl">
        <SearchBox />
      </div>

      <section className="mt-4 grid items-center gap-6 md:grid-cols-2">
        <div className="rise text-center md:text-left">
          <h1>
            <Image src="/logo.png" alt="UniPath" width={1254} height={1254} priority className="mx-auto -my-6 h-auto w-40 md:mx-0 md:-ml-3" />
          </h1>
          <p className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
            Ghidul tău între <span className="text-primary">liceu</span> și <span className="text-teal">facultate</span>
          </p>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft md:mx-0">afli ce să studiezi și unde.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/test"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark active:scale-[0.98]"
            >
              Fă testul de personalitate
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
        <HeroScene className="float mx-auto w-full max-w-sm md:max-w-none" />
      </section>

      <SpecializationsBrowser />
    </Shell>
  );
}
