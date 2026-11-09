// Student voices in the drawn look: the opening with three students talking, a box inviting students to write, then real opinions with a search by faculty or university, in the page language (the opinions keep their original words).
import type { Metadata } from "next";
import { PageOpening } from "@/components/Drawn";
import { VoicesDrawing } from "@/components/PageScenes";
import Link from "@/components/LocalLink";
import { Shell } from "@/components/Shell";
import { StudentVoices } from "@/components/StudentVoices";
import { hasLang, tr } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/studenti">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") {
    return {
      title: "Ce spun studenții — FindMyUni",
      description: "Păreri reale ale studenților și absolvenților despre facultățile lor. Caută după facultate sau universitate.",
    };
  }
  return {
    title: "What students say — FindMyUni",
    description: "Real opinions from students and graduates about their faculties. Search by faculty or university.",
  };
}

export default async function Students({ params }: PageProps<"/[lang]/studenti">) {
  const { lang } = await params;
  const t = tr(hasLang(lang) ? lang : "ro");
  return (
    <Shell wide>
      <PageOpening
        title={
          <>
            {t("Ce spun", "What")} <span className="text-primary">{t("studenții", "students say")}</span>
          </>
        }
        lead={
          <>
            {t("Păreri adevărate de la studenți și absolvenți, despre facultatea lor, cu cuvintele lor.", "Real opinions from students and graduates about their faculty, in their own words.")}
            {lang === "en" && <span className="mt-2 block text-sm">Opinions are shown in the words their authors wrote them, mostly in Romanian.</span>}
          </>
        }
        scene={<VoicesDrawing label={t("Desen: trei studenți care vorbesc, cu bule de dialog deasupra", "Drawing: three students talking, with speech bubbles above them")} />}
      />
      <section aria-labelledby="scrie-parere" className="drawn mx-auto mt-4 flex max-w-5xl flex-col items-center gap-4 rounded-[1.8rem] bg-primary-tint p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 id="scrie-parere" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{t("Ești student? Spune-le și altora cum e.", "Are you a student? Tell others what it is like.")}</h2>
          <p className="mt-1 text-ink-soft">{t("Nu ai nevoie de cont. Părerea apare după ce o citește echipa.", "You do not need an account. Your opinion appears after the team reads it.")}</p>
        </div>
        <Link
          href="/studenti/parere"
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-extrabold text-white shadow-[0_3px_0_var(--color-primary-dark)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
          {t("Scrie părerea ta", "Write your opinion")}
        </Link>
      </section>

      <StudentVoices />

      <div className="mt-10 text-center">
        <Link
          href="/test"
          className="inline-block rounded-2xl bg-primary px-6 py-3 font-extrabold text-white shadow-[0_3px_0_var(--color-primary-dark)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          {t("Completează chestionarul și află ce ți se potrivește", "Take the quiz and find out what suits you")}
        </Link>
      </div>
    </Shell>
  );
}
