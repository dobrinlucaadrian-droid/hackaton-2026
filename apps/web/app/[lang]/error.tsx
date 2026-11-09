"use client";
// Shown instead of a page that broke while loading: the usual header, the broken-road drawing, a short message that it is not the student's fault and a "try again" button, in the page language. Nothing technical is shown.
import { useEffect } from "react";
import { BrokenRoadDrawing } from "@/components/PageScenes";
import { useT } from "@/components/LangProvider";
import { Shell } from "@/components/Shell";

export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useT();
  useEffect(() => {
    // Only in the browser console, for the team; the student never sees it.
    console.error(error);
  }, [error]);

  return (
    <Shell>
      <div role="alert" className="drawn mt-10 rounded-3xl bg-card p-8 text-center">
        <div className="mx-auto mb-2 w-full max-w-xs">
          <BrokenRoadDrawing label={t("Desen: un drum rupt și un semn de atenție", "Drawing: a broken road and a warning sign")} />
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{t("Ups, drumul s-a întrerupt aici", "Oops, the road broke off here")}</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          {t("Pagina asta a avut o problemă, nu e vina ta. Încearcă din nou sau folosește meniul de sus.", "This page had a problem, it is not your fault. Try again or use the menu at the top.")}
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 min-h-12 rounded-2xl bg-primary px-6 py-3 font-extrabold text-white shadow-[0_3px_0_var(--color-primary-dark)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          {t("Încearcă din nou", "Try again")}
        </button>
      </div>
    </Shell>
  );
}
