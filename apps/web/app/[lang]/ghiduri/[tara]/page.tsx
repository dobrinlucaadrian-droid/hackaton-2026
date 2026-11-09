// One country guide (Romanian pages only; English pages show 404): the steps to apply, the documents, language, costs, money and housing, with the official links.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { guideById, guides } from "@/lib/guides";
import { universities } from "@/lib/universities";

type Props = PageProps<"/[lang]/ghiduri/[tara]">;

export function generateStaticParams() {
  return guides.map((g) => ({ tara: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, tara } = await params;
  if (lang === "en") return { title: "Guides | FindMyUni" };
  const g = guideById(tara);
  return g ? { title: `${g.title} | FindMyUni`, description: g.intro } : { title: "Ghiduri pe țări | FindMyUni" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl bg-card p-5 drawn sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

const linkClass = "inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

export default async function GuidePage({ params }: Props) {
  const { lang, tara } = await params;
  if (lang === "en") notFound();
  const g = guideById(tara);
  if (!g) notFound();
  const count = universities.filter((u) => u.country === g.country).length;

  return (
    <Shell wide>
      <div className="mx-auto max-w-3xl">
        <Link href="/ghiduri" className="inline-flex min-h-11 items-center gap-2 font-extrabold text-primary transition hover:text-primary-dark">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          Toate ghidurile
        </Link>

        <header className="rise mt-5">
          <h1 className="text-4xl font-extrabold leading-none tracking-tight text-ink sm:text-5xl">{g.title}</h1>
          <svg aria-hidden viewBox="0 0 300 16" className="mt-2 block h-4 w-56 sm:w-72"><path d="M3 10c36-9 62 7 98-2s62 7 98-2 62 7 98-4" fill="none" stroke="#c8962e" strokeWidth="5" strokeLinecap="round" /></svg>
          <p className="mt-4 text-lg text-ink">{g.intro}</p>
        </header>

        <Section title="Pașii, pe rând">
          <ol className="relative space-y-3 before:absolute before:top-6 before:bottom-6 before:left-[1.4rem] before:border-l-[3px] before:border-dashed before:border-ink/40 before:content-['']" data-guide-steps>
            {g.steps.map((s, i) => (
              <li key={s.title} className="relative flex gap-3 rounded-2xl p-2">
                <span aria-hidden className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink text-base font-extrabold ${i === g.steps.length - 1 ? "bg-teal text-ink" : "bg-primary text-white"}`}>
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-extrabold text-ink">{s.title}</h3>
                  <p className="mt-1">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Ce acte îți trebuie de obicei">
          <ul className="list-disc space-y-1 pl-5 marker:text-primary">
            {g.documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Section>

        <Section title="În ce limbă înveți">
          <p>{g.language}</p>
        </Section>

        <Section title="Cât costă">
          <p>{g.costs}</p>
        </Section>

        <Section title="Burse și împrumuturi">
          <p>{g.funding}</p>
        </Section>

        <Section title="Cazare">
          <p>{g.housing}</p>
        </Section>

        <Section title="Bine de știut">
          <ul className="list-disc space-y-1 pl-5 marker:text-primary">
            {g.goodToKnow.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Section>

        <Section title="Linkuri oficiale">
          <ul className="flex flex-col">
            {g.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {count > 0 && (
          <p className="mt-6">
            <Link
              href={`/universitati?tara=${encodeURIComponent(g.country)}`}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-[0_3px_0_var(--color-primary-dark)] transition hover:bg-primary-dark"
            >
              Vezi universitățile din {g.country} →
            </Link>
          </p>
        )}

        <p className="mt-6 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">
          Ghidul este scris după paginile oficiale și este orientativ. Regulile, taxele și termenele se schimbă de la an la an: verifică mereu la sursă înainte să aplici.
        </p>
      </div>
    </Shell>
  );
}
