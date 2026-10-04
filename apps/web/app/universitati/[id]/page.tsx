// Full profile sheet of one university, statically generated for every university.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { BudgetBadge, PrestigeBadge } from "@/components/UniversityBadges";
import { FAMILY_CLASSES, domainStyle } from "@/components/domainStyle";
import { domains, universities } from "@/lib/data";
import { ADMISSION_LABEL, BUDGET_LABEL, CERTIFICATE_LABEL, specializationsFor, universityById } from "@/lib/universities";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return universities.map((u) => ({ id: u.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const u = universityById(id);
  return { title: u ? `${u.name} | UniPath` : "Universitate | UniPath" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line sm:p-6">
      <h2 className="text-xl font-black tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

function Yes({ on }: { on: boolean }) {
  return (
    <p className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${on ? "bg-teal-tint text-teal-ink" : "bg-paper text-ink-soft ring-1 ring-line"}`}>
      {on ? "Da" : "Nu"}
    </p>
  );
}

export default async function UniversityPage({ params }: Props) {
  const { id } = await params;
  const u = universityById(id);
  if (!u) notFound();
  const uniDomains = u.domainIds.map((d) => domains.find((x) => x.id === d)).filter((d): d is NonNullable<typeof d> => !!d);
  const specs = uniDomains.flatMap((d) => specializationsFor(d.id).map((s) => ({ ...s, domainName: d.name })));
  const certs = u.certificates.map((c) => CERTIFICATE_LABEL[c]).filter(Boolean);
  const admission = u.admissionTypes.map((a) => ADMISSION_LABEL[a]).filter(Boolean);

  return (
    <Shell wide>
      <div className="mx-auto max-w-3xl">
        <Link href="/universitati" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint">
          ← Înapoi la universități
        </Link>

        <header className="rise mt-5">
          <h1 className="text-3xl font-black leading-tight tracking-tighter text-ink sm:text-5xl">{u.name}</h1>
          <p className="mt-1 text-lg text-ink-soft">
            {u.city}, {u.country}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PrestigeBadge prestige={u.prestige} />
            <BudgetBadge budget={u.budget} />
          </div>
          {u.about && <p className="mt-4 text-lg text-ink">{u.about}</p>}
        </header>

        {(admission.length > 0 || u.admission) && (
          <Section title="Cum intri">
            {admission.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {admission.map((a) => (
                  <li key={a} className="rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary-dark">{a}</li>
                ))}
              </ul>
            )}
            {u.admission && <p>{u.admission}</p>}
          </Section>
        )}

        <Section title="Cât costă">
          <p>
            <span className="font-bold text-ink">{BUDGET_LABEL[u.budget]}</span>
            {u.budgetNote ? ` — ${u.budgetNote}` : ""}
          </p>
          {u.tuition && <p>Taxe: {u.tuition}</p>}
        </Section>

        {u.language && (
          <Section title="Limba de predare">
            <p>{u.language}</p>
          </Section>
        )}

        <div className="grid gap-0 sm:grid-cols-2 sm:gap-6">
          <Section title="Burse">
            <Yes on={u.scholarships} />
            {u.scholarshipsNote && <p>{u.scholarshipsNote}</p>}
          </Section>
          <Section title="Cămin">
            <Yes on={u.dorms} />
            {u.dormsNote && <p>{u.dormsNote}</p>}
          </Section>
        </div>

        {certs.length > 0 && (
          <Section title="Ce acte și certificate îți trebuie">
            <ul className="list-disc space-y-1 pl-5 marker:text-primary">
              {certs.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>
        )}

        {(u.pros.length > 0 || u.cons.length > 0) && (
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-6">
            {u.pros.length > 0 && (
              <Section title="Avantaje">
                <ul className="list-disc space-y-1 pl-5 marker:text-teal">
                  {u.pros.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Section>
            )}
            {u.cons.length > 0 && (
              <Section title="Dezavantaje">
                <ul className="list-disc space-y-1 pl-5 marker:text-violet">
                  {u.cons.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        )}

        {uniDomains.length > 0 && (
          <Section title="Ce poți studia aici">
            <ul className="flex flex-wrap gap-2">
              {uniDomains.map((d) => {
                const { family, emoji } = domainStyle(d.id);
                return (
                  <li key={d.id}>
                    <Link
                      href={`/universitati?domeniu=${d.id}`}
                      className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition hover:opacity-80 ${FAMILY_CLASSES[family].chip}`}
                    >
                      <span aria-hidden className="mr-1">{emoji}</span>
                      {d.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {specs.length > 0 && (
              <details className="mt-3 rounded-2xl bg-paper p-4">
                <summary className="min-h-11 cursor-pointer font-bold text-primary-dark">Vezi specializările din aceste domenii ({specs.length})</summary>
                <ul className="mt-3 space-y-3">
                  {specs.map((s) => (
                    <li key={s.id} className="border-l-4 border-line pl-3">
                      <p className="text-sm font-bold text-ink">{s.name}</p>
                      <p className="text-xs text-ink-soft">{s.domainName}</p>
                      <p className="text-sm">{s.short}</p>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </Section>
        )}

        <div className="mt-8 text-center">
          <a
            href={u.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center rounded-2xl bg-primary px-8 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
          >
            Site-ul oficial ↗
          </a>
        </div>

        <p className="mt-6 rounded-2xl bg-primary-tint p-4 text-sm text-primary-dark" role="note">
          Informațiile sunt orientative. Verifică mereu site-ul universității.
        </p>
      </div>
    </Shell>
  );
}
