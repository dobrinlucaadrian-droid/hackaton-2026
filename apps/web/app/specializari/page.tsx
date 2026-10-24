// All study fields: category tiles and a "what do you like" picker, or filtered domains and specializations when the student types.
import type { Metadata } from "next";
import { FieldsScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { SpecializationsBrowser } from "@/components/SpecializationsBrowser";

export const metadata: Metadata = {
  title: "Specializări și domenii de studiu | FindMyUni",
  description: "Toate domeniile de studiu și specializările de licență, pe categorii, cu ce înveți în fiecare an și unde poți studia.",
};

export default function SpecializationsPage() {
  return (
    <Shell wide>
      <div className="rise mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-ink sm:text-5xl">Ce poți studia</h1>
          <p className="mt-2 text-ink-soft">Alege o categorie sau caută direct o specializare.</p>
        </div>
        <FieldsScene className="float h-20 w-28 shrink-0 sm:h-28 sm:w-36 md:h-32 md:w-44" />
      </div>
      <SpecializationsBrowser />
    </Shell>
  );
}
