// Profile sheet of one Romanian faculty: what you study there, how you get in, its bachelor programmes from the official list and the official links.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FacultyPrograms } from "@/components/FacultyPrograms";
import { Shell } from "@/components/Shell";
import { catalogCountryOfSheet } from "@/lib/catalog";
import { faculties, facultyBySlug, facultySlug } from "@/lib/faculties";
import { ADMISSION_LABEL } from "@/lib/labels";
import { roProgramsOfFaculty } from "@/lib/roPrograms";
import { universityById } from "@/lib/sheets";

type Props = { params: Promise<{ id: string; facultate: string }> };

export function generateStaticParams() {
  return faculties.map((f) => ({ id: f.universityId, facultate: facultySlug(f.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, facultate } = await params;
  const f = facultyBySlug(id, facultate);
  const u = universityById(id);
  return { title: f && u ? `${f.name} — ${u.name} | FindMyUni` : "Facultate | FindMyUni" };
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
  const { id, facultate } = await params;
  const f = facultyBySlug(id, facultate);
  const u = universityById(id);
  if (!f || !u) notFound();
  const catalog = catalogCountryOfSheet(u.id);
  const admission = f.admissionTypes.map((a) => ADMISSION_LABEL[a]).filter(Boolean);
  // A page that serves two purposes on the faculty's site (for example the same address for the site and for the curricula) is listed once.
  const links: [string, string][] = [
    [f.website, "Site-ul facultății ↗"],
    ...(f.admissionUrl && f.admissionUrl !== f.website ? ([[f.admissionUrl, "Pagina de admitere ↗"]] as [string, string][]) : []),
    ...(f.curriculumUrl && f.curriculumUrl !== f.website && f.curriculumUrl !== f.admissionUrl ? ([[f.curriculumUrl, "Planuri de învățământ ↗"]] as [string, string][]) : []),
  ];

  return (
    <Shell wide>
      <div className="mx-auto max-w-3xl">
        <Link href={`/universitati/${u.id}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint">
          ← {u.name}
        </Link>

        <header className="rise mt-5">
          <p className="text-sm font-extrabold uppercase tracking-wide text-primary">Fișa facultății</p>
          <h1 className="mt-1 text-3xl font-black leading-tight tracking-tighter text-ink sm:text-4xl">{f.name}</h1>
          <p className="mt-1 text-lg text-ink-soft">
            {u.name} · {u.city}
          </p>
          <p className="mt-4 text-lg text-ink">{f.about}</p>
        </header>

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
          <p>{f.admission}</p>
          {f.examSubjects && f.examSubjects.length > 0 && (
            <p>
              <span className="font-bold text-ink">Materii la examen:</span> {f.examSubjects.join(", ")}.
            </p>
          )}
          <p className="text-sm">Mediile, numărul de locuri și datele se schimbă în fiecare an: verifică pagina de admitere a facultății.</p>
        </Section>

        {catalog && (
          <Section title="Ce poți studia aici">
            <FacultyPrograms rows={roProgramsOfFaculty(u.id, f.name)} year={catalog.source.year} />
          </Section>
        )}

        <Section title="Linkuri oficiale și contact">
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
              <span className="font-bold text-ink">Adresă:</span> {f.address}
            </p>
          )}
        </Section>

        <p className="mt-6 rounded-2xl bg-primary-tint p-4 text-sm text-primary-dark" role="note">
          Fișa este scrisă după site-ul oficial al facultății și este orientativă. Verifică mereu informațiile la sursă.
        </p>
      </div>
    </Shell>
  );
}
