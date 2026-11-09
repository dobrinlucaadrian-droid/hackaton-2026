// Guides index: Romanian pages show the drawn opening (a globe with a plane) and one postcard per country guide; English pages show the single guide "How to apply to a university in Romania".
import type { Metadata } from "next";
import { GuideFinder } from "@/components/GuideFinder";
import { GuideRomania, romaniaGuide } from "@/components/GuideRomania";
import { PageOpening } from "@/components/Drawn";
import { GuidesDrawing } from "@/components/PageScenes";
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
      <PageOpening
        title={
          <>
            Vrei să studiezi <span className="text-primary">afară?</span>
          </>
        }
        lead={`Câte un ghid scurt pentru fiecare dintre cele ${guides.length} de țări: pe ce platformă te înscrii, ce acte îți trebuie, cât costă pentru un elev din România, ce burse poți primi și cum găsești cazare.`}
        scene={<GuidesDrawing label="Desen: un glob pământesc, un avion care zboară în jurul lui și o valiză" />}
      />
      <GuideFinder tiles={guides.map(({ id, country, intro }) => ({ id, country, intro }))} />
      <p className="mt-6 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">
        Ghidurile sunt scrise după paginile oficiale ale fiecărei țări și sunt orientative. Regulile, taxele și termenele se schimbă: verifică mereu la sursă.
      </p>
    </Shell>
  );
}
