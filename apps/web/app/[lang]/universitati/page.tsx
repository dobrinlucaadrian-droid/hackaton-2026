// University finder page: search box, filters and the results, 10 at a time (the client part reads the URL query).
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UniversityScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { UniversitySearch } from "@/components/UniversitySearch";
import { hasLang, localHref, tr } from "@/lib/i18n";

const roMetadata: Metadata = {
  title: "Caută universități în România și în străinătate | FindMyUni",
  description: "Caută o universitate după nume, oraș, țară sau domeniu și vezi admiterea, costurile, bursele și programele de licență.",
};

export async function generateMetadata({ params }: PageProps<"/[lang]/universitati">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") return roMetadata;
  return {
    title: "Search universities in Romania and abroad | FindMyUni",
    description: "Search for a university by name, city, country or field and see admission, costs, scholarships and bachelor's programmes.",
  };
}

export default async function UniversitiesPage({ params }: PageProps<"/[lang]/universitati">) {
  const { lang: langParam } = await params;
  const lang = hasLang(langParam) ? langParam : "ro";
  const t = tr(lang);
  return (
    <Shell wide>
      <div className="rise flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-ink sm:text-5xl">{t("Găsește universitatea potrivită", "Find the right university")}</h1>
          <p className="mt-2 text-ink-soft">{t("Caută după nume, oraș sau țară, sau alege filtrele; îți arătăm câte 10, iar cu „Arată încă 10” vezi mai multe.", "Search by name, city or country, or use the filters; we show 10 at a time, and “Show 10 more” gives you more.")}</p>
        </div>
        <UniversityScene className="float hidden h-28 w-36 shrink-0 sm:block md:h-32 md:w-44" />
      </div>
      <p className="mb-5">
        <Link href={localHref(lang, "/programe")} className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
          {t("Cauți un program anume? Vezi toate programele de licență din România →", "Looking for a specific programme? See all bachelor's programmes in Romania →")}
        </Link>
      </p>
      <Suspense fallback={<p className="mt-6 text-ink-soft">{t("Se încarcă...", "Loading...")}</p>}>
        <UniversitySearch />
      </Suspense>
    </Shell>
  );
}
