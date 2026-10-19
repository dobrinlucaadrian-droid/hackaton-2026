"use client";
// Account window: opens over the current page when the home page's "Intră în cont" button is pressed, with the account form (sign in, new account, forgotten password). It never opens by itself.
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { SignInForm } from "./SignInForm";

const OPEN_EVENT = "unipath:open-signin";

/** Opens the account window on the current page. */
export function openSignIn() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function WelcomeDialog() {
  const { isAuthenticated } = useConvexAuth();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const open = () => setShown(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const open = shown && !isAuthenticated;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShown(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/50 p-4 sm:items-center" data-welcome>
      <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="rise w-full max-w-md rounded-3xl bg-card p-6 shadow-xl ring-1 ring-line sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h2 id="welcome-title" className="text-3xl font-black tracking-tight text-ink">Contul tău</h2>
          <button type="button" onClick={() => setShown(false)} aria-label="Închide" className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-ink-soft hover:bg-primary-tint hover:text-primary-dark">
            <span aria-hidden>×</span>
          </button>
        </div>
        <p className="mt-2 text-ink-soft">
          Intră cu numele de utilizator și parola sau fă-ți un cont nou. Contul e gratuit și îți păstrează rezultatul chestionarului.
        </p>
        <SignInForm idPrefix="bun-venit-" />
        <button type="button" onClick={() => setShown(false)} className="mt-4 min-h-11 w-full font-bold text-primary underline underline-offset-2">
          Continui fără cont
        </button>
      </div>
    </div>
  );
}
