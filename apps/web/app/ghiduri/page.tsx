// Country guides index: a search box and one tile per country that has a "how to apply" guide.
import type { Metadata } from "next";
import { GuideFinder } from "@/components/GuideFinder";
import { Shell } from "@/components/Shell";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Ghiduri pe țări | FindMyUni",
  description: "Cum aplici la facultate în alte țări: pași, acte, costuri, burse și cazare, pe înțelesul unui licean.",
};

export default function GuidesPage() {
  return (
    <Shell wide>
      <h1 className="rise text-4xl font-black tracking-tighter text-ink sm:text-5xl">Cum aplici în altă țară</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Câte un ghid scurt pentru fiecare țară: pe ce platformă te înscrii, ce acte îți trebuie, cât costă pentru un elev din România, ce burse poți primi și cum găsești cazare.
      </p>
      <GuideFinder tiles={guides.map(({ id, country, intro }) => ({ id, country, intro }))} />
      <p className="mt-6 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">
        Ghidurile sunt scrise după paginile oficiale ale fiecărei țări și sunt orientative. Regulile, taxele și termenele se schimbă: verifică mereu la sursă.
      </p>
    </Shell>
  );
}
