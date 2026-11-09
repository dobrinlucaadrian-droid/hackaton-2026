// One category in the drawn look: a back link, the opening with the category drawing, then its study domains as collapsible rows with their specializations, in the page language.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/CategoryIcon";
import { DomainDetails } from "@/components/DomainDetails";
import { PageOpening, SectionTitle } from "@/components/Drawn";
import Link from "@/components/LocalLink";
import { Shell } from "@/components/Shell";
import { categories, domains } from "@/lib/data";
import { hasLang, tr } from "@/lib/i18n";
import { localCategory, localDomain, localSpecialization } from "@/lib/i18n-data";
import { specializationsFor } from "@/lib/labels";

type Props = PageProps<"/[lang]/specializari/[categorie]">;

export function generateStaticParams() {
  return categories.map((c) => ({ categorie: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, categorie } = await params;
  const en = lang === "en";
  const found = categories.find((x) => x.id === categorie);
  const c = found && localCategory(found, en ? "en" : "ro");
  if (en) {
    return c
      ? { title: `${c.name}: fields and specialisations | FindMyUni`, description: `${c.short} See the fields of study, the specialisations and what you learn each year.` }
      : { title: "Fields of study | FindMyUni" };
  }
  return c
    ? { title: `${c.name}: domenii și specializări | FindMyUni`, description: `${c.short} Vezi domeniile de studiu, specializările și ce înveți în fiecare an.` }
    : { title: "Specializări | FindMyUni" };
}

export default async function CategoryPage({ params }: Props) {
  const { lang: rawLang, categorie } = await params;
  const lang = hasLang(rawLang) ? rawLang : "ro";
  const t = tr(lang);
  const found = categories.find((x) => x.id === categorie);
  if (!found) notFound();
  const c = localCategory(found, lang);
  const items = found.domainIds.map((id) => domains.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d);

  return (
    <Shell wide>
      <div className="mx-auto max-w-4xl">
        <Link href="/specializari" className="inline-flex min-h-11 items-center gap-2 font-extrabold text-primary hover:text-primary-dark">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          {t("Înapoi la specializări", "Back to fields of study")}
        </Link>
        <PageOpening
          title={c.name}
          lead={c.short}
          scene={<CategoryIcon id={c.id} className="bob mx-auto h-48 w-48 sm:h-60 sm:w-60" />}
        />
        <SectionTitle>{t(`Cele ${items.length} domenii`, `The ${items.length} fields`)}</SectionTitle>
        <div className="space-y-3.5">
          {items.map((d, i) => (
            <DomainDetails
              key={d.id}
              domain={localDomain(d, lang)}
              specs={specializationsFor(d.id).map((s) => localSpecialization(s, lang))}
              open={i === 0}
            />
          ))}
        </div>
      </div>
    </Shell>
  );
}
