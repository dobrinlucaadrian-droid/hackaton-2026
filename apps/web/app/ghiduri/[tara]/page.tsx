// One country guide: the steps to apply, the documents, language, costs, money and housing, with the official links.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { guideById, guides } from "@/lib/guides";
import { universities } from "@/lib/universities";

type Props = { params: Promise<{ tara: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ tara: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tara } = await params;
  const g = guideById(tara);
  return g ? { title: `${g.title} | FindMyUni`, description: g.intro } : { title: "Ghiduri pe țări | FindMyUni" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line sm:p-6">
      <h2 className="text-xl font-black tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

const linkClass = "inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

export default async function GuidePage({ params }: Props) {
  const { tara } = await params;
  const g = guideById(tara);
  if (!g) notFound();
  const count = universities.filter((u) => u.country === g.country).length;

  return (
    <Shell wide>
      <div className="mx-auto max-w-3xl">
        <Link href="/ghiduri" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint">
          ← Toate ghidurile
        </Link>

        <header className="rise mt-5">
          <p className="text-sm font-extrabold uppercase tracking-wide text-primary">Ghid pe țară</p>
          <h1 className="mt-1 text-3xl font-black leading-tight tracking-tighter text-ink sm:text-5xl">{g.title}</h1>
          <p className="mt-4 text-lg text-ink">{g.intro}</p>
        </header>

        <Section title="Pașii, pe rând">
          <ol className="space-y-3" data-guide-steps>
            {g.steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-black text-white">
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
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
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
