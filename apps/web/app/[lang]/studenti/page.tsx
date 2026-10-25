// Student voices: real opinions from students and graduates, with a search by faculty or university, in the page language (the opinions keep their original words).
import type { Metadata } from "next";
import { VoicesScene } from "@/components/Illustrations";
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
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint"
        >
          {t("← Înapoi", "← Back")}
        </Link>
        <section className="rise pt-6 text-center">
          <VoicesScene className="float mx-auto h-24 w-32" />
          <h1 className="mt-2 text-4xl font-black tracking-tighter text-ink sm:text-5xl">{t("Ce spun studenții", "What students say")}</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            {t("Păreri adevărate de la studenți și absolvenți, despre facultatea lor.", "Real opinions from students and graduates about their faculty.")}
          </p>
          {lang === "en" && (
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">Opinions are shown in the words their authors wrote them, mostly in Romanian.</p>
          )}
          <Link
            href="/studenti/parere"
            className="mt-2 inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark"
          >
            {t("Ești student? Scrie și tu o părere →", "Are you a student? Write an opinion too →")}
          </Link>
        </section>
      </div>

      <StudentVoices />

      <div className="mt-10 text-center">
        <Link
          href="/test"
          className="inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark"
        >
          {t("Completează chestionarul și află ce ți se potrivește", "Take the quiz and find out what suits you")}
        </Link>
      </div>
    </Shell>
  );
}
