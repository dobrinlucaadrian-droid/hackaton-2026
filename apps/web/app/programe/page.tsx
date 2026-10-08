// Programme finder: search the bachelor programmes of every Romanian university from the official government list.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProgramSearch } from "@/components/ProgramSearch";
import { Shell } from "@/components/Shell";
import institutionsJson from "@/data/ro-institutions.json";
import programsJson from "@/data/ro-programs.json";
import { domains } from "@/lib/data";
import type { CatalogInstitution, CatalogProgram } from "@/lib/types";

export const metadata: Metadata = {
  title: "Programe de licență — UniPath",
  description: "Caută printre toate programele de licență din România, după lista oficială pentru 2026–2027.",
};

// Read on the server only: the browser receives just the short lists below, the programmes themselves come from the database.
const programs = programsJson as CatalogProgram[];
const institutions = institutionsJson as CatalogInstitution[];
const count = new Map<string, number>();
for (const p of programs) count.set(p.city, (count.get(p.city) ?? 0) + 1);
const cities = [...count.keys()].sort((a, b) => count.get(b)! - count.get(a)! || a.localeCompare(b, "ro"));
const sheetIds = institutions.filter((i) => i.hasSheet).map((i) => i.id);
const domainList = [...domains].sort((a, b) => a.name.localeCompare(b.name, "ro")).map((d) => ({ id: d.id, name: d.name }));

export default function ProgramsPage() {
  return (
    <Shell wide>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink sm:text-5xl">Programe de licență</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        {programs.length.toLocaleString("ro-RO")} de programe de la {institutions.length} de universități din România, după lista oficială a Guvernului pentru anul 2026–2027.{" "}
        <Link href="/surse" className="font-bold text-primary underline underline-offset-2">De unde sunt datele</Link>
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-ink-soft">Se încarcă...</p>}>
          <ProgramSearch domains={domainList} cities={cities} sheetIds={sheetIds} />
        </Suspense>
      </div>
    </Shell>
  );
}
