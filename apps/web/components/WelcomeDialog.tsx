"use client";
// Account window: opens over the current page when the home page's "Intră în cont" button or the result page's account card is pressed, with the account form (sign in, new account, forgotten password). It never opens by itself.
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { SignInForm } from "./SignInForm";

const OPEN_EVENT = "unipath:open-signin";

/** Opens the account window on the current page, on the sign-in form or straight on "new account". */
export function openSignIn(startWith: "signIn" | "signUp" = "signIn") {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: startWith }));
}

export function WelcomeDialog() {
  const { isAuthenticated } = useConvexAuth();
  const [shown, setShown] = useState(false);
  const [startWith, setStartWith] = useState<"signIn" | "signUp">("signIn");

  useEffect(() => {
    const open = (e: Event) => {
      setStartWith((e as CustomEvent).detail === "signUp" ? "signUp" : "signIn");
      setShown(true);
    };
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

  // Auto margins (not flex centring) keep a tall form scrollable from its top on short screens.

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-ink/50 p-4" data-welcome>
      <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="rise mt-auto w-full max-w-md rounded-3xl sm:mb-auto bg-card p-6 shadow-xl ring-1 ring-line sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h2 id="welcome-title" className="text-3xl font-black tracking-tight text-ink">Contul tău</h2>
          <button type="button" onClick={() => setShown(false)} aria-label="Închide" className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-ink-soft hover:bg-primary-tint hover:text-primary-dark">
            <span aria-hidden>×</span>
          </button>
        </div>
        <p className="mt-2 text-ink-soft">
          Intră cu numele de utilizator și parola sau fă-ți un cont nou. Contul e gratuit și îți păstrează rezultatul chestionarului și universitățile favorite.
        </p>
        <SignInForm key={startWith} idPrefix="bun-venit-" startWith={startWith} />
        <button type="button" onClick={() => setShown(false)} className="mt-4 min-h-11 w-full font-bold text-primary underline underline-offset-2">
          Continui fără cont
        </button>
      </div>
    </div>
  );
}
