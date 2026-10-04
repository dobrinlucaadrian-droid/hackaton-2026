// All study fields: category tiles and a "surprise me" card, or filtered domains and specializations when the student types.
import type { Metadata } from "next";
import { Books, Sparkle } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { SpecializationsBrowser } from "@/components/SpecializationsBrowser";

export const metadata: Metadata = { title: "Specializări | UniPath" };

export default function SpecializationsPage() {
  return (
    <Shell wide>
      <div className="rise mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-ink sm:text-5xl">Ce poți studia</h1>
          <p className="mt-2 text-ink-soft">Alege o categorie sau caută direct o specializare.</p>
        </div>
        <div aria-hidden className="flex shrink-0 items-end gap-1">
          <Sparkle className="twinkle h-5 w-5 fill-teal" />
          <Books className="float h-20 w-20 sm:h-24 sm:w-24" />
          <Sparkle className="twinkle h-4 w-4 fill-violet" />
        </div>
      </div>
      <SpecializationsBrowser />
    </Shell>
  );
}
