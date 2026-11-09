// All study fields: the drawn opening with a search box, then category tiles (five to a row) and a "what do you like" picker, or filtered domains and specializations when the student types, in the page language.
import type { Metadata } from "next";
import { FieldsDrawing } from "@/components/PageScenes";
import { Shell } from "@/components/Shell";
import { SpecializationsBrowser } from "@/components/SpecializationsBrowser";
import { categories, domains, specializations } from "@/lib/data";
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
  // Counts come from the data, so the text stays true when the lists grow.
  const nCat = categories.length;
  const nDom = domains.length;
  const nSpec = specializations.length;
  return (
    <Shell wide>
      <SpecializationsBrowser
        title={
          <>
            {t("Ce poți", "What can you")} <span className="text-primary">{t("studia?", "study?")}</span>
          </>
        }
        lead={t(
          `${nCat} categorii, ${nDom} de domenii și ${nSpec} de specializări, explicate simplu. Alege o categorie sau caută direct.`,
          `${nCat} categories, ${nDom} fields and ${nSpec} specialisations, explained simply. Pick a category or search directly.`,
        )}
        scene={<FieldsDrawing label={t("Desen: cărți, o eprubetă, o paletă de pictor și o roată dințată", "Drawing: books, a flask, a painter's palette and a gear")} />}
      />
    </Shell>
  );
}
