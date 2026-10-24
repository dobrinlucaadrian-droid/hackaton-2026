// University finder page: search box, filters and the results, 10 at a time (the client part reads the URL query).
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UniversityScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { UniversitySearch } from "@/components/UniversitySearch";

export const metadata: Metadata = {
  title: "Caută universități în România și în străinătate | FindMyUni",
  description: "Caută o universitate după nume, oraș, țară sau domeniu și vezi admiterea, costurile, bursele și programele de licență.",
};

export default function UniversitiesPage() {
  return (
    <Shell wide>
      <div className="rise flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-ink sm:text-5xl">Găsește universitatea potrivită</h1>
          <p className="mt-2 text-ink-soft">Caută după nume, oraș sau țară, sau alege filtrele; îți arătăm câte 10, iar cu „Arată încă 10” vezi mai multe.</p>
        </div>
        <UniversityScene className="float hidden h-28 w-36 shrink-0 sm:block md:h-32 md:w-44" />
      </div>
      <p className="mb-5">
        <Link href="/programe" className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
          Cauți un program anume? Vezi toate programele de licență din România →
        </Link>
      </p>
      <Suspense fallback={<p className="mt-6 text-ink-soft">Se încarcă...</p>}>
        <UniversitySearch />
      </Suspense>
    </Shell>
  );
}
