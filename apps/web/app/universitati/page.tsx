// University finder page: search box, filters and top 10 results (the client part reads the URL query).
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Shell } from "@/components/Shell";
import { UniversitySearch } from "@/components/UniversitySearch";

export const metadata: Metadata = { title: "Universități | UniPath" };

export default function UniversitiesPage() {
  return (
    <Shell wide>
      <h1 className="rise text-4xl font-black tracking-tighter text-ink sm:text-5xl">Găsește universitatea potrivită</h1>
      <p className="mt-2 text-ink-soft">Caută după nume, oraș sau țară, sau alege filtrele și îți arătăm primele 10.</p>
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
