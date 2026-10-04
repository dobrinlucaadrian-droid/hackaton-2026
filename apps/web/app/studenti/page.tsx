// Student voices: real opinions from students and graduates, with a search by faculty or university.
import Link from "next/link";
import { Cap } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";
import { StudentVoices } from "@/components/StudentVoices";

export const metadata = { title: "Ce spun studenții — UniPath" };

export default function Students() {
  return (
    <Shell wide>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint"
        >
          ← Înapoi
        </Link>
        <section className="rise pt-6 text-center">
          <Cap className="float mx-auto h-16 w-16" />
          <h1 className="mt-2 text-4xl font-black tracking-tighter text-ink sm:text-5xl">Ce spun studenții</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            Păreri adevărate de la studenți și absolvenți, despre facultatea lor.
          </p>
        </section>
      </div>

      <StudentVoices />

      <div className="mt-10 text-center">
        <Link
          href="/test"
          className="inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark"
        >
          Completează chestionarul și află ce ți se potrivește
        </Link>
      </div>
    </Shell>
  );
}
