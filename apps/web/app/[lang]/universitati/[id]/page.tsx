// Full profile sheet of one university in the page language, statically generated for every university.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackToSearch } from "@/components/BackToSearch";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { UniversityPhoto } from "@/components/UniversityPhoto";
import { OfficialPrograms } from "@/components/OfficialPrograms";
import { ProgramGroups } from "@/components/ProgramGroups";
import { Shell } from "@/components/Shell";
import { UniversityOpinions } from "@/components/UniversityOpinions";
import { BudgetBadge, PrestigeBadge } from "@/components/UniversityBadges";
import { UniversityDomains } from "@/components/UniversityDomains";
import { RELATED_SHEETS, campusGroups } from "@/lib/campuses";
import { SCHOOL_PROGRAMS, catalogCountryOfSheet } from "@/lib/catalog";
import { curriculumLinkFor } from "@/lib/curricula";
import { feeOf, feeText } from "@/lib/fees";
import { testimonialsFor } from "@/lib/testimonials";
import { domains } from "@/lib/data";
import { facultiesOf, facultyHref } from "@/lib/faculties";
import { guideForCountry } from "@/lib/guides";
import { hasLang, localHref, tr, type Lang } from "@/lib/i18n";
import { localDomain, localSpecialization } from "@/lib/i18n-data";
import { hasEnglishSheet, localFaculty, localUniversity } from "@/lib/i18n-sheets";
import { labelsFor, specializationsFor } from "@/lib/labels";
import { roProgramsOf } from "@/lib/roPrograms";
import { clip } from "@/lib/seo";
import { universities, universityById } from "@/lib/sheets";

type Props = { params: Promise<{ lang: string; id: string }> };

export function generateStaticParams() {
  return universities.map((u) => ({ id: u.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const base = universityById(id);
  if (lang === "en") {
    if (!base) return { title: "University | FindMyUni" };
    const e = localUniversity(base, "en");
    const description = clip(`${e.city}, ${e.country}. ${e.about}`);
    return {
      title: `${e.name}: admission, costs, programmes | FindMyUni`,
      description,
      openGraph: { title: e.name, description, url: `/en/universitati/${e.id}`, siteName: "FindMyUni", locale: "en_GB", type: "website" },
    };
  }
  const u = base;
  if (!u) return { title: "Universitate | FindMyUni" };
  const description = clip(`${u.city}, ${u.country}. ${u.about}`);
  return {
    title: `${u.name}: admitere, costuri, programe | FindMyUni`,
    description,
    // what WhatsApp, Instagram or Facebook show when the sheet is shared (the picture comes from opengraph-image.tsx next to this page)
    openGraph: { title: u.name, description, url: `/universitati/${u.id}`, siteName: "FindMyUni", locale: "ro_RO", type: "website" },
  };
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

function Yes({ on, lang }: { on: boolean; lang: Lang }) {
  return (
    <p className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${on ? "bg-teal-tint text-teal-ink" : "bg-paper text-ink-soft ring-1 ring-line"}`}>
      {on ? tr(lang)("Da", "Yes") : tr(lang)("Nu", "No")}
    </p>
  );
}

export default async function UniversityPage({ params }: Props) {
  const { lang: langParam, id } = await params;
  const lang: Lang = hasLang(langParam) ? langParam : "ro";
  const t = tr(lang);
  const L = labelsFor(lang);
  const href = (path: string) => localHref(lang, path);
  const base = universityById(id);
  if (!base) notFound();
  const u = localUniversity(base, lang);
  const untranslated = lang === "en" && !hasEnglishSheet(id);
  const uniDomains = u.domainIds.map((d) => domains.find((x) => x.id === d)).filter((d): d is NonNullable<typeof d> => !!d).map((d) => localDomain(d, lang));
  const planLink = u.region === "ro" ? curriculumLinkFor(u.id) : undefined;
  // the "how to apply" guide of this country, when there is one; those guides are written for Romanian students and exist only in Romanian
  const guide = lang === "ro" ? guideForCountry(base.country) : undefined;
  const catalog = catalogCountryOfSheet(u.id); // the country dataset that lists this university's programmes, if any
  const certs = u.certificates.map((c) => L.CERTIFICATE[c]).filter(Boolean);
  const fee = feeOf(u.id); // exact yearly tuition, only when an official page confirmed it
  const admission = u.admissionTypes.map((a) => L.ADMISSION[a]).filter(Boolean);
  const hasPros = u.pros.length > 0 || u.cons.length > 0;
  const faculties = u.faculties ?? [];
  const opinions = testimonialsFor(u.id);
  const facultySheets = facultiesOf(u.id).sort((a, b) => a.name.localeCompare(b.name, "ro"));
  const anchors: [string, string][] = [
    ["admitere", t("Admitere", "Admission")],
    ["costuri", t("Costuri", "Costs")],
    ["despre", t("Despre", "About")],
    ...(opinions.length > 0 ? ([["studenti", t("Ce spun studenții", "What students say")]] as [string, string][]) : []),
    ...(hasPros ? ([["plusuri", t("Plusuri și minusuri", "Pros and cons")]] as [string, string][]) : []),
  ];

  return (
    <Shell wide>
      <div className="mx-auto max-w-3xl">
        <BackToSearch />

        {untranslated && (
          <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm text-primary-dark" role="note">
            This sheet is not translated into English yet; the details below are in Romanian.
          </p>
        )}

        <UniversityPhoto universityId={u.id} alt={`${u.name}, ${u.city}`} lang={lang} />

        <header className="rise mt-5">
          <h1 className="text-3xl font-black leading-tight tracking-tighter text-ink sm:text-5xl">{u.name}</h1>
          <p className="mt-1 text-lg text-ink-soft">
            {u.city}, {u.country}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PrestigeBadge prestige={u.prestige} />
            <BudgetBadge budget={u.budget} />
          </div>
          <div className="mt-4 flex flex-wrap items-start gap-3">
            <FavoriteButton university={{ universityId: base.id, name: base.name, place: `${base.city}, ${base.country}` }} />
            <ShareButton title={u.name} text={t(`${u.name} (${u.city}, ${u.country}) pe FindMyUni`, `${u.name} (${u.city}, ${u.country}) on FindMyUni`)} path={`/universitati/${u.id}`} />
          </div>
          {u.about && <p className="mt-4 text-lg text-ink">{u.about}</p>}
          {guide && (
            <p className="mt-2">
              <Link href={href(`/ghiduri/${guide.id}`)} className="inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
                {guide.title}: {t("ghidul pas cu pas →", "the step-by-step guide →")}
              </Link>
            </p>
          )}
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tile label={t("Admitere", "Admission")} value={admission.length ? admission.join(", ") : t("Vezi detaliile mai jos", "See the details below")} />
          <Tile label={t("Cost", "Cost")} value={L.BUDGET[u.budget]} />
          <Tile label={t("Burse și cămin", "Scholarships and dormitories")} value={t(`Burse: ${u.scholarships ? "da" : "nu"} · Cămin: ${u.dorms ? "da" : "nu"}`, `Scholarships: ${u.scholarships ? "yes" : "no"} · Dormitory: ${u.dorms ? "yes" : "no"}`)} />
        </div>

        <nav aria-label={t("Secțiunile fișei", "Sections of the sheet")} className="sticky top-0 z-20 -mx-5 mt-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-paper/95 px-5 py-2 backdrop-blur">
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

        <Group id="admitere" title={t("Admitere", "Admission")}>
          {(admission.length > 0 || u.admission) && (
            <Section title={t("Cum intri", "How you get in")}>
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
            <Section title={t("Ce acte și certificate îți trebuie", "Which documents and certificates you need")}>
              <ul className="list-disc space-y-1 pl-5 marker:text-primary">
                {certs.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Section>
          )}
        </Group>

        <Group id="costuri" title={t("Costuri", "Costs")}>
          <Section title={t("Cât costă", "What it costs")}>
            <p>
              <span className="font-bold text-ink">{L.BUDGET[u.budget]}</span>
              {u.budgetNote ? ` — ${u.budgetNote}` : ""}
            </p>
            {u.tuition && <p>{t("Taxe", "Fees")}: {u.tuition}</p>}
            {/* The costs on the Romanian sheets are written for Romanian (and EU) students; students from outside the EU have their own route (see the guide). */}
            {lang === "en" && u.region === "ro" && (
              <p className="rounded-2xl bg-sky-tint/60 p-3 text-sm">
                These costs are for Romanian and EU students. Students from outside the EU apply through a different route, with different fees:{" "}
                <Link href={localHref(lang, "/ghiduri")} className="font-bold text-primary underline underline-offset-2">
                  How to apply to a university in Romania
                </Link>
                .
              </p>
            )}
            {fee && (
              <div className="mt-2 rounded-2xl bg-primary-tint/60 p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">{t("Taxa de școlarizare pe an", "Tuition fee per year")} ({fee.year})</p>
                {fee.budgetFree && fee.max === 0 ? (
                  <p className="mt-1 font-black text-ink">{t("0 lei — doar locuri la buget", "0 lei — state-funded places only")}</p>
                ) : fee.budgetFree ? (
                  <p className="mt-1 text-ink">
                    <span className="font-black">{t("0 lei la buget", "0 lei on state-funded places")}</span>{t("; la locurile cu taxă:", "; on fee-paying places:")}{" "}
                    <span className="font-black">{feeText(fee, lang)}</span>
                  </p>
                ) : (
                  <p className="mt-1 font-black text-ink">{feeText(fee, lang)}</p>
                )}
                {fee.note && <p className="mt-1">{fee.note}</p>}
                <p className="mt-2 text-sm">
                  <a href={fee.url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline underline-offset-2">
                    {t("Pagina oficială cu taxele ↗", "Official fees page ↗")}
                  </a>
                  {fee.currency !== "EUR" && fee.max > 0 && t(" · suma în euro e orientativă", " · the amount in euro is approximate")}
                </p>
              </div>
            )}
          </Section>
          <div className="grid gap-4 sm:grid-cols-2">
            <Section title={t("Burse", "Scholarships")}>
              <Yes on={u.scholarships} lang={lang} />
              {u.scholarshipsNote && <p>{u.scholarshipsNote}</p>}
            </Section>
            <Section title={t("Cămin", "Dormitory")}>
              <Yes on={u.dorms} lang={lang} />
              {u.dormsNote && <p>{u.dormsNote}</p>}
            </Section>
          </div>
        </Group>

        <Group id="despre" title={t("Despre", "About")}>
          {planLink && (
            <Section title={t("Planuri de învățământ", "Curricula")}>
              <p>
                {planLink.kind === "plans"
                  ? t("Universitatea publică pe site-ul ei planurile de învățământ: materiile din fiecare an.", "The university publishes its curricula on its website: the subjects of each year.")
                  : t("Pe site-ul universității găsești lista programelor de studii; de acolo ajungi la planul de învățământ al fiecărei facultăți.", "On the university's website you find the list of study programmes; from there you reach the curriculum of each faculty.")}
              </p>
              <a
                href={planLink.url}
                target="_blank"
                rel="noopener noreferrer"
                data-plan-link
                className="mt-1 inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
              >
                {planLink.kind === "plans" ? t("Vezi planurile de învățământ pe site-ul oficial ↗", "See the curricula on the official website ↗") : t("Vezi programele de studii pe site-ul oficial ↗", "See the study programmes on the official website ↗")}
              </a>
            </Section>
          )}
          {u.language && (
            <Section title={t("Limba de predare", "Language of teaching")}>
              <p>{u.language}</p>
            </Section>
          )}
          {uniDomains.length > 0 && (
            <Section title={t("Ce poți studia aici", "What you can study here")}>
              {RELATED_SHEETS[u.id] && (
                <p className="mb-3">
                  <Link href={localHref(lang, `/universitati/${RELATED_SHEETS[u.id].id}`)} className="font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
                    {t(RELATED_SHEETS[u.id].ro, RELATED_SHEETS[u.id].en)}
                  </Link>
                </p>
              )}
              {(() => {
                const toItems = (list: typeof uniDomains) =>
                  list.map((d) => ({
                    id: d.id,
                    name: d.name,
                    short: d.short,
                    specs: specializationsFor(d.id).map((x) => localSpecialization(x, lang)).map((x) => ({ id: x.id, name: x.name, short: x.short })),
                  }));
                // a university that teaches some domains only in other cities (e.g. Politehnica: Pitești) shows one group per city
                const groups = u.region === "ro" ? campusGroups(u.id, base.city, uniDomains.map((d) => d.id)) : undefined;
                if (!groups) return <UniversityDomains showPlan={u.region === "ro"} items={toItems(uniDomains)} />;
                return groups.map((g) => (
                  <div key={g.ro} className="mt-4 first:mt-0" data-campus>
                    <h3 className="text-lg font-black text-ink">{t(g.ro, g.en)}</h3>
                    {g.noteRo && <p className="text-sm">{t(g.noteRo, g.noteEn ?? g.noteRo)}</p>}
                    <UniversityDomains showPlan items={toItems(uniDomains.filter((d) => g.domainIds.includes(d.id)))} />
                  </div>
                ));
              })()}
            </Section>
          )}
          {facultySheets.length > 0 && (
            <Section title={t("Fișe de facultăți", "Faculty sheets")}>
              <p className="text-sm">
                {t("Pentru unele facultăți avem fișă proprie: ce studiezi acolo, cum intri și linkurile oficiale.", "For some faculties we have a sheet of their own: what you study there, how you get in and the official links.")}
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2" data-faculty-sheets>
                {facultySheets.map((f) => (
                  <li key={f.name}>
                    <Link href={href(facultyHref(f))} className="flex min-h-11 items-center rounded-2xl bg-paper px-4 py-2 text-sm font-bold text-ink ring-1 ring-line transition hover:ring-primary/50">
                      {localFaculty(f, lang).name} →
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {/* Romania: the list is small enough to come with the page; other countries read it from the database. */}
          {catalog?.cc === "RO" && (
            <ProgramGroups
              rows={roProgramsOf(u.id)}
              city={base.city}
              sourceLabel={catalog.source.attribution}
              year={catalog.source.year}
              hasCapacity
              facultyLinks={Object.fromEntries(facultySheets.map((f) => [f.name, facultyHref(f)]))}
              lang={lang}
            />
          )}
          {catalog && catalog.cc !== "RO" && (
            <OfficialPrograms institutionId={SCHOOL_PROGRAMS[u.id]?.institutionId ?? u.id} faculty={SCHOOL_PROGRAMS[u.id]?.faculty} city={base.city} sourceLabel={catalog.source.attribution} year={catalog.source.year} hasCapacity={false} />
          )}
          {!catalog && faculties.length > 0 && (
            <Section title={t("Facultăți și specializări", "Faculties and specialisations")}>
              <p className="text-sm text-ink-soft">
                {t("Facultățile și specializările de licență, după site-ul oficial al universității. Apasă pe o facultate ca să-i vezi specializările.", "The faculties and bachelor's specialisations, from the university's official website. Tap a faculty to see its specialisations.")}
              </p>
              <ul className="mt-3 space-y-2">
                {faculties.map((f) => (
                  <li key={f.name}>
                    {f.programs.length > 0 ? (
                      <details className="group rounded-2xl bg-paper px-4 py-1">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink [&::-webkit-details-marker]:hidden">
                          <span>{f.name}</span>
                          <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-soft">
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

        <UniversityOpinions universityId={u.id} />

        {hasPros && (
          <Group id="plusuri" title={t("Plusuri și minusuri", "Pros and cons")}>
            <div className="grid gap-4 sm:grid-cols-2">
              {u.pros.length > 0 && (
                <Section title={t("Avantaje", "Advantages")}>
                  <ul className="list-disc space-y-1 pl-5 marker:text-teal">
                    {u.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {u.cons.length > 0 && (
                <Section title={t("Dezavantaje", "Disadvantages")}>
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
            {t("Site-ul oficial ↗", "Official website ↗")}
          </a>
        </div>

        <p className="mt-6 rounded-2xl bg-primary-tint p-4 text-sm text-primary-dark" role="note">
          {t("Informațiile sunt orientative. Verifică mereu site-ul universității.", "The information is only a guide. Always check the university's website.")}
        </p>
      </div>
    </Shell>
  );
}
