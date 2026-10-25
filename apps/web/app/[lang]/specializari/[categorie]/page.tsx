// One category: its study domains as collapsible rows with their specializations, in the page language.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DomainDetails } from "@/components/DomainDetails";
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
      <div className="mx-auto max-w-3xl">
        <Link href="/specializari" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint">
          {t("← Toate categoriile", "← All categories")}
        </Link>
        <header className="rise mt-5">
          <p aria-hidden className="text-5xl">{c.emoji}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tighter text-ink sm:text-5xl">{c.name}</h1>
          <p className="mt-2 text-ink-soft">{c.short}</p>
        </header>
        <div className="mt-6 space-y-3">
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
