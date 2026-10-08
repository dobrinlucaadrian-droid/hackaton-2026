// Programme finder: search the bachelor programmes of every country in the catalogue (official national datasets).
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProgramSearch } from "@/components/ProgramSearch";
import { Shell } from "@/components/Shell";
import { catalogCountries, catalogTotals } from "@/lib/catalog";
import { domains } from "@/lib/data";

export const metadata: Metadata = {
  title: "Programe de licență — UniPath",
  description: "Caută printre programele de licență din România și din alte țări, din datele oficiale ale fiecărei țări.",
};

const domainList = [...domains].sort((a, b) => a.name.localeCompare(b.name, "ro")).map((d) => ({ id: d.id, name: d.name }));
const nf = (n: number) => n.toLocaleString("ro-RO");

export default function ProgramsPage() {
  return (
    <Shell wide>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink sm:text-5xl">Programe de licență</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        {nf(catalogTotals.programs)} de programe de la {nf(catalogTotals.institutions)} de instituții din{" "}
        {catalogTotals.countries === 1 ? catalogCountries[0].name : `${catalogTotals.countries} țări`}, luate din datele oficiale ale fiecărei țări.{" "}
        <Link href="/surse" className="font-bold text-primary underline underline-offset-2">De unde sunt datele</Link>
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-ink-soft">Se încarcă...</p>}>
          <ProgramSearch domains={domainList} />
        </Suspense>
      </div>
    </Shell>
  );
}
