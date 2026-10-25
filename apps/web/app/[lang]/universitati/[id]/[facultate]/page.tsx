// Profile sheet of one Romanian faculty (in the page language): what you study there, how you get in, its bachelor programmes from the official list and the official links.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FacultyPrograms } from "@/components/FacultyPrograms";
import { Shell } from "@/components/Shell";
import { catalogCountryOfSheet } from "@/lib/catalog";
import { faculties, facultyBySlug, facultySlug } from "@/lib/faculties";
import { hasLang, localHref, tr, type Lang } from "@/lib/i18n";
import { localFaculty, localUniversity } from "@/lib/i18n-sheets";
import { labelsFor } from "@/lib/labels";
import { roProgramsOfFaculty } from "@/lib/roPrograms";
import { universityById } from "@/lib/sheets";
import { clip } from "@/lib/seo";
import { UniversityPhoto } from "@/components/UniversityPhoto";

type Props = { params: Promise<{ lang: string; id: string; facultate: string }> };

export function generateStaticParams() {
  return faculties.map((f) => ({ id: f.universityId, facultate: facultySlug(f.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id, facultate } = await params;
  const base = facultyBySlug(id, facultate);
  const baseUni = universityById(id);
  if (lang === "en") {
    if (!base || !baseUni) return { title: "Faculty | FindMyUni" };
    const f = localFaculty(base, "en");
    const u = localUniversity(baseUni, "en");
    return { title: `${f.name} — ${u.name} | FindMyUni`, description: clip(`${f.about} How to get in, bachelor's programmes and official links.`) };
  }
  const f = base;
  const u = baseUni;
  return f && u
    ? { title: `${f.name} — ${u.name} | FindMyUni`, description: clip(`${f.about} Cum intri, programele de licență și linkurile oficiale.`) }
    : { title: "Facultate | FindMyUni" };
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

export default async function FacultyPage({ params }: Props) {
  const { lang: langParam, id, facultate } = await params;
  const lang: Lang = hasLang(langParam) ? langParam : "ro";
  const t = tr(lang);
  const baseFaculty = facultyBySlug(id, facultate);
  const baseUni = universityById(id);
  if (!baseFaculty || !baseUni) notFound();
  const f = localFaculty(baseFaculty, lang);
  const u = localUniversity(baseUni, lang);
  const untranslated = lang === "en" && f.about === baseFaculty.about;
  const catalog = catalogCountryOfSheet(u.id);
  const admission = f.admissionTypes.map((a) => labelsFor(lang).ADMISSION[a]).filter(Boolean);
  // A page that serves two purposes on the faculty's site (for example the same address for the site and for the curricula) is listed once.
  const links: [string, string][] = [
    [f.website, t("Site-ul facultății ↗", "Faculty website ↗")],
    ...(f.admissionUrl && f.admissionUrl !== f.website ? ([[f.admissionUrl, t("Pagina de admitere ↗", "Admission page ↗")]] as [string, string][]) : []),
    ...(f.curriculumUrl && f.curriculumUrl !== f.website && f.curriculumUrl !== f.admissionUrl ? ([[f.curriculumUrl, t("Planuri de învățământ ↗", "Curricula ↗")]] as [string, string][]) : []),
  ];

  return (
    <Shell wide>
      <div className="mx-auto max-w-3xl">
        <Link href={localHref(lang, `/universitati/${u.id}`)} className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint">
          ← {u.name}
        </Link>

        {untranslated && (
          <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm text-primary-dark" role="note">
            This sheet is not translated into English yet; the details below are in Romanian.
          </p>
        )}

        <UniversityPhoto universityId={u.id} alt={`${u.name}, ${u.city}`} lang={lang} />

        <header className="rise mt-5">
          <p className="text-sm font-extrabold uppercase tracking-wide text-primary">{t("Fișa facultății", "Faculty sheet")}</p>
          <h1 className="mt-1 text-3xl font-black leading-tight tracking-tighter text-ink sm:text-4xl">{f.name}</h1>
          <p className="mt-1 text-lg text-ink-soft">
            {u.name} · {u.city}
          </p>
          <p className="mt-4 text-lg text-ink">{f.about}</p>
        </header>

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
          <p>{f.admission}</p>
          {f.examSubjects && f.examSubjects.length > 0 && (
            <p>
              <span className="font-bold text-ink">{t("Materii la examen:", "Exam subjects:")}</span> {f.examSubjects.join(", ")}.
            </p>
          )}
          <p className="text-sm">{t("Mediile, numărul de locuri și datele se schimbă în fiecare an: verifică pagina de admitere a facultății.", "Admission averages, the number of places and the dates change every year: check the faculty's admission page.")}</p>
        </Section>

        {catalog && (
          <Section title={t("Ce poți studia aici", "What you can study here")}>
            <FacultyPrograms rows={roProgramsOfFaculty(u.id, baseFaculty.name)} year={catalog.source.year} lang={lang} />
          </Section>
        )}

        <Section title={t("Linkuri oficiale și contact", "Official links and contact")}>
          <ul className="flex flex-col">
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          {f.address && (
            <p>
              <span className="font-bold text-ink">{t("Adresă:", "Address:")}</span> {f.address}
            </p>
          )}
        </Section>

        <p className="mt-6 rounded-2xl bg-primary-tint p-4 text-sm text-primary-dark" role="note">
          {t("Fișa este scrisă după site-ul oficial al facultății și este orientativă. Verifică mereu informațiile la sursă.", "This sheet is based on the faculty's official website and is only a guide. Always check the information at the source.")}
        </p>
      </div>
    </Shell>
  );
}
