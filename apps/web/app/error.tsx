"use client";
// Shown instead of a page that broke while loading: the usual header, the broken-road drawing, a short message that it is not the student's fault and a "try again" button. Nothing technical is shown.
import { useEffect } from "react";
import { BrokenPath } from "@/components/Illustrations";
import { Shell } from "@/components/Shell";

export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Only in the browser console, for the team; the student never sees it.
    console.error(error);
  }, [error]);

  return (
    <Shell>
      <div role="alert" className="mt-8 text-center">
        <BrokenPath className="mx-auto w-56" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Ups, drumul s-a întrerupt aici</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Pagina asta a avut o problemă, nu e vina ta. Încearcă din nou sau folosește meniul de sus.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 min-h-12 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
        >
          Încearcă din nou
        </button>
      </div>
    </Shell>
  );
}
