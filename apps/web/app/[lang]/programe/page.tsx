// Programme finder: search the bachelor programmes of every country in the catalogue (official national datasets).
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProgramSearch } from "@/components/ProgramSearch";
import { Shell } from "@/components/Shell";
import { domains } from "@/lib/data";
import { hasLang, localHref, tr } from "@/lib/i18n";
import { localDomain } from "@/lib/i18n-data";

const roMetadata: Metadata = {
  title: "Programe de licență — FindMyUni",
  description: "Caută printre programele de licență din România și din alte țări, din datele oficiale ale fiecărei țări.",
};

export async function generateMetadata({ params }: PageProps<"/[lang]/programe">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") return roMetadata;
  return {
    title: "Bachelor's programmes — FindMyUni",
    description: "Search the bachelor's programmes of Romania and other countries, from each country's official data.",
  };
}

export default async function ProgramsPage({ params }: PageProps<"/[lang]/programe">) {
  const { lang: langParam } = await params;
  const lang = hasLang(langParam) ? langParam : "ro";
  const t = tr(lang);
  const domainList = [...domains]
    .map((d) => ({ id: d.id, name: localDomain(d, lang).name }))
    .sort((a, b) => a.name.localeCompare(b.name, lang === "en" ? "en" : "ro"));
  return (
    <Shell wide>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink sm:text-5xl">{t("Programe de licență", "Bachelor's programmes")}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        {t("Programele de licență din mai multe țări, luate din datele oficiale ale fiecărei țări.", "Bachelor's programmes from several countries, taken from each country's official data.")}{" "}
        <Link href={localHref(lang, "/surse")} className="font-bold text-primary underline underline-offset-2">{t("De unde sunt datele", "Where the data comes from")}</Link>
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-ink-soft">{t("Se încarcă...", "Loading...")}</p>}>
          <ProgramSearch domains={domainList} />
        </Suspense>
      </div>
    </Shell>
  );
}
