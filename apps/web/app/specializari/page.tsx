// All study fields: category tiles, or filtered domains and specializations when the student types.
import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { SpecializationsBrowser } from "@/components/SpecializationsBrowser";

export const metadata: Metadata = { title: "Specializări | UniPath" };

export default function SpecializationsPage() {
  return (
    <Shell wide>
      <h1 className="rise text-4xl font-black tracking-tighter text-ink sm:text-5xl">Ce poți studia</h1>
      <p className="mt-2 mb-5 text-ink-soft">Alege o categorie sau caută direct o specializare.</p>
      <SpecializationsBrowser />
    </Shell>
  );
}
