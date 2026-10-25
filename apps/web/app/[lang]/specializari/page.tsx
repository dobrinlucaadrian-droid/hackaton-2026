// All study fields: category tiles and a "what do you like" picker, or filtered domains and specializations when the student types, in the page language.
import type { Metadata } from "next";
import { FieldsScene } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { SpecializationsBrowser } from "@/components/SpecializationsBrowser";
import { hasLang, tr } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/specializari">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") {
    return {
      title: "Specializări și domenii de studiu | FindMyUni",
      description: "Toate domeniile de studiu și specializările de licență, pe categorii, cu ce înveți în fiecare an și unde poți studia.",
    };
  }
  return {
    title: "Fields of study and specialisations | FindMyUni",
    description: "All bachelor's fields of study and specialisations, by category, with what you learn each year and where you can study them.",
  };
}

export default async function SpecializationsPage({ params }: PageProps<"/[lang]/specializari">) {
  const { lang } = await params;
  const t = tr(hasLang(lang) ? lang : "ro");
  return (
    <Shell wide>
      <div className="rise mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-ink sm:text-5xl">{t("Ce poți studia", "What you can study")}</h1>
          <p className="mt-2 text-ink-soft">{t("Alege o categorie sau caută direct o specializare.", "Pick a category or search for a specialisation directly.")}</p>
        </div>
        <FieldsScene className="float h-20 w-28 shrink-0 sm:h-28 sm:w-36 md:h-32 md:w-44" />
      </div>
      <SpecializationsBrowser />
    </Shell>
  );
}
