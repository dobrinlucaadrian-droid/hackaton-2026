// Full profile sheet of one university, statically generated for every university.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { StudentCard } from "@/components/StudentCard";
import { BudgetBadge, PrestigeBadge } from "@/components/UniversityBadges";
import { UniversityDomains } from "@/components/UniversityDomains";
import { curriculumLinkFor } from "@/lib/curricula";
import { testimonialsFor } from "@/lib/testimonials";
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
    <section className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line sm:p-6">
      <h3 className="text-xl font-black tracking-tight text-ink">{title}</h3>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

function Group({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="mt-8 scroll-mt-20">
      <h2 id={`${id}-t`} className="text-2xl font-black tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">{label}</p>
      <p className="mt-1 font-bold leading-snug text-ink">{value}</p>
    </div>
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
  const planLink = u.region === "ro" ? curriculumLinkFor(u.id) : undefined;
  const certs = u.certificates.map((c) => CERTIFICATE_LABEL[c]).filter(Boolean);
  const admission = u.admissionTypes.map((a) => ADMISSION_LABEL[a]).filter(Boolean);
  const hasPros = u.pros.length > 0 || u.cons.length > 0;
  const faculties = u.faculties ?? [];
  const programCount = faculties.reduce((n, f) => n + f.programs.length, 0);
  const opinions = testimonialsFor(u.id);
  const anchors: [string, string][] = [
    ["admitere", "Admitere"],
    ["costuri", "Costuri"],
    ["despre", "Despre"],
    ...(opinions.length > 0 ? ([["studenti", "Ce spun studenții"]] as [string, string][]) : []),
    ...(hasPros ? ([["plusuri", "Plusuri și minusuri"]] as [string, string][]) : []),
  ];

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

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tile label="Admitere" value={admission.length ? admission.join(", ") : "Vezi detaliile mai jos"} />
          <Tile label="Cost" value={BUDGET_LABEL[u.budget]} />
          <Tile label="Burse și cămin" value={`Burse: ${u.scholarships ? "da" : "nu"} · Cămin: ${u.dorms ? "da" : "nu"}`} />
        </div>

        <nav aria-label="Secțiunile fișei" className="sticky top-0 z-20 -mx-5 mt-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-paper/95 px-5 py-2 backdrop-blur">
          <ul className="flex gap-2 whitespace-nowrap">
            {anchors.map(([a, label]) => (
              <li key={a}>
                <a href={`#${a}`} className="inline-flex min-h-11 items-center rounded-full bg-card px-4 text-sm font-bold text-primary-dark ring-1 ring-line transition hover:bg-primary-tint">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Group id="admitere" title="Admitere">
          {(admission.length > 0 || u.admission) && (
            <Section title="Cum intri">
              {admission.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {admission.map((a) => (
                    <li key={a} className="rounded-full bg-primary-tint px-3 py-1 text-sm font-semibold text-primary-dark">
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              {u.admission && <p>{u.admission}</p>}
            </Section>
          )}
          {certs.length > 0 && (
            <Section title="Ce acte și certificate îți trebuie">
              <ul className="list-disc space-y-1 pl-5 marker:text-primary">
                {certs.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Section>
          )}
        </Group>

        <Group id="costuri" title="Costuri">
          <Section title="Cât costă">
            <p>
              <span className="font-bold text-ink">{BUDGET_LABEL[u.budget]}</span>
              {u.budgetNote ? ` — ${u.budgetNote}` : ""}
            </p>
            {u.tuition && <p>Taxe: {u.tuition}</p>}
          </Section>
          <div className="grid gap-4 sm:grid-cols-2">
            <Section title="Burse">
              <Yes on={u.scholarships} />
              {u.scholarshipsNote && <p>{u.scholarshipsNote}</p>}
            </Section>
            <Section title="Cămin">
              <Yes on={u.dorms} />
              {u.dormsNote && <p>{u.dormsNote}</p>}
            </Section>
          </div>
        </Group>

        <Group id="despre" title="Despre">
          {planLink && (
            <Section title="Planuri de învățământ">
              <p>
                {planLink.kind === "plans"
                  ? "Universitatea publică pe site-ul ei planurile de învățământ: materiile din fiecare an."
                  : "Pe site-ul universității găsești lista programelor de studii; de acolo ajungi la planul de învățământ al fiecărei facultăți."}
              </p>
              <a
                href={planLink.url}
                target="_blank"
                rel="noopener noreferrer"
                data-plan-link
                className="mt-1 inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
              >
                {planLink.kind === "plans" ? "Vezi planurile de învățământ pe site-ul oficial ↗" : "Vezi programele de studii pe site-ul oficial ↗"}
              </a>
            </Section>
          )}
          {u.language && (
            <Section title="Limba de predare">
              <p>{u.language}</p>
            </Section>
          )}
          {uniDomains.length > 0 && (
            <Section title="Ce poți studia aici">
              <UniversityDomains
                showPlan={u.region === "ro"}
                items={uniDomains.map((d) => ({
                  id: d.id,
                  name: d.name,
                  short: d.short,
                  specs: specializationsFor(d.id).map((x) => ({ id: x.id, name: x.name, short: x.short })),
                }))}
              />
            </Section>
          )}
          {faculties.length > 0 && (
            <Section title="Facultăți și specializări">
              <p className="text-sm text-ink-soft">
                {faculties.length} facultăți{programCount > 0 ? ` · ${programCount} specializări de licență` : ""}, după site-ul oficial al
                universității. Apasă pe o facultate ca să-i vezi specializările.
              </p>
              <ul className="mt-3 space-y-2">
                {faculties.map((f) => (
                  <li key={f.name}>
                    {f.programs.length > 0 ? (
                      <details className="group rounded-2xl bg-paper px-4 py-1">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink [&::-webkit-details-marker]:hidden">
                          <span>{f.name}</span>
                          <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-soft">
                            {f.programs.length}
                            <span aria-hidden className="text-primary-dark transition-transform group-open:rotate-180">▾</span>
                          </span>
                        </summary>
                        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm marker:text-primary">
                          {f.programs.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <p className="flex min-h-11 items-center rounded-2xl bg-paper px-4 font-bold text-ink">{f.name}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </Group>

        {opinions.length > 0 && (
          <Group id="studenti" title="Ce spun studenții">
            <p className="text-ink-soft">
              {opinions.length === 1 ? "O părere reală de la un student de aici." : `${opinions.length} păreri reale de la studenți de aici.`}
            </p>
            {opinions.map((t) => (
              <StudentCard key={`${t.name}-${t.faculty}`} t={t} as="div" />
            ))}
            <Link href="/studenti" className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
              Vezi părerile de la toate universitățile →
            </Link>
          </Group>
        )}

        {hasPros && (
          <Group id="plusuri" title="Plusuri și minusuri">
            <div className="grid gap-4 sm:grid-cols-2">
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
          </Group>
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
