// Guides index: Romanian pages show one tile per country guide; English pages show the single guide "How to apply to a university in Romania".
import type { Metadata } from "next";
import { GuideFinder } from "@/components/GuideFinder";
import { GuideRomania, romaniaGuide } from "@/components/GuideRomania";
import { GlobeScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { guides } from "@/lib/guides";

export async function generateMetadata({ params }: PageProps<"/[lang]/ghiduri">): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "en") {
    return { title: `${romaniaGuide.title} | FindMyUni`, description: romaniaGuide.intro };
  }
  return {
    title: "Ghiduri pe țări | FindMyUni",
    description: "Cum aplici la facultate în alte țări: pași, acte, costuri, burse și cazare, pe înțelesul unui licean.",
  };
}

export default async function GuidesPage({ params }: PageProps<"/[lang]/ghiduri">) {
  const { lang } = await params;
  if (lang === "en") {
    return (
      <Shell wide>
        <GuideRomania />
      </Shell>
    );
  }
  return (
    <Shell wide>
      <div className="rise flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-ink sm:text-5xl">Cum aplici în altă țară</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Câte un ghid scurt pentru fiecare țară: pe ce platformă te înscrii, ce acte îți trebuie, cât costă pentru un elev din România, ce burse poți primi și cum găsești cazare.
          </p>
        </div>
        <GlobeScene className="float hidden h-28 w-36 shrink-0 sm:block md:h-32 md:w-44" />
      </div>
      <GuideFinder tiles={guides.map(({ id, country, intro }) => ({ id, country, intro }))} />
      <p className="mt-6 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">
        Ghidurile sunt scrise după paginile oficiale ale fiecărei țări și sunt orientative. Regulile, taxele și termenele se schimbă: verifică mereu la sursă.
      </p>
    </Shell>
  );
}
