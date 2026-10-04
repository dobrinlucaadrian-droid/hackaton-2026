// One category: its study domains as collapsible rows with their specializations.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DomainDetails } from "@/components/DomainDetails";
import { Shell } from "@/components/Shell";
import { categories, domains } from "@/lib/data";
import { specializationsFor } from "@/lib/universities";

type Props = { params: Promise<{ categorie: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ categorie: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;
  const c = categories.find((x) => x.id === categorie);
  return { title: c ? `${c.name} | UniPath` : "Specializări | UniPath" };
}

export default async function CategoryPage({ params }: Props) {
  const { categorie } = await params;
  const c = categories.find((x) => x.id === categorie);
  if (!c) notFound();
  const items = c.domainIds.map((id) => domains.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d);

  return (
    <Shell wide>
      <div className="mx-auto max-w-3xl">
        <Link href="/specializari" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint">
          ← Toate categoriile
        </Link>
        <header className="rise mt-5">
          <p aria-hidden className="text-5xl">{c.emoji}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tighter text-ink sm:text-5xl">{c.name}</h1>
          <p className="mt-2 text-ink-soft">{c.short}</p>
        </header>
        <div className="mt-6 space-y-3">
          {items.map((d, i) => (
            <DomainDetails key={d.id} domain={d} specs={specializationsFor(d.id)} open={i === 0} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
