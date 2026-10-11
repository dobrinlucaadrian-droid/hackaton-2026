"use client";
// Welcome window shown once per device on the first visit: the visitor chooses to make an account or to go on without one. The header's "Conectare" button opens the same window.
import { useConvexAuth } from "convex/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SignInForm } from "./SignInForm";

const KEY = "unipath-welcome"; // remembers on this device that the choice was made; not a cookie, never sent anywhere
const OPEN_EVENT = "unipath:open-signin";

/** Opens the window directly on the account form (used by the header's "Conectare" button). */
export function openSignIn() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function remember() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // storage blocked: the window will simply show again on the next visit
  }
}

export function WelcomeDialog() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [step, setStep] = useState<"closed" | "choice" | "form">("closed");
  const firstButton = useRef<HTMLButtonElement>(null);
  // Pages that are about the account already; the welcome question would only get in the way there.
  const quietPage = pathname.startsWith("/conectare") || pathname.startsWith("/cont") || pathname.startsWith("/admin");

  // First visit on this device: ask once.
  useEffect(() => {
    if (isLoading || isAuthenticated || quietPage) return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(KEY) !== null;
    } catch {
      seen = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!seen) setStep((s) => (s === "closed" ? "choice" : s));
  }, [isLoading, isAuthenticated, quietPage]);

  // The header button opens the account form at any time.
  useEffect(() => {
    const open = () => {
      remember();
      setStep("form");
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const open = step !== "closed" && !isAuthenticated;

  useEffect(() => {
    if (!open) return;
    if (step === "choice") firstButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  function close() {
    remember();
    setStep("closed");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/50 p-4 sm:items-center" data-welcome>
      <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="rise w-full max-w-md rounded-3xl bg-card p-6 shadow-xl ring-1 ring-line sm:p-8">
        {step === "choice" ? (
          <>
            <h2 id="welcome-title" className="text-3xl font-black tracking-tight text-ink">Bine ai venit pe UniPath!</h2>
            <p className="mt-2 text-ink-soft">
              Poți folosi tot site-ul fără cont. Cu un cont gratuit îți păstrezi rezultatul chestionarului și îl găsești oricând, de pe orice dispozitiv.
            </p>
            <div className="mt-6 space-y-3">
              <button
                ref={firstButton}
                type="button"
                onClick={() => {
                  remember();
                  setStep("form");
                }}
                className="min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
              >
                Îmi fac cont
              </button>
              <button type="button" onClick={close} className="min-h-12 w-full rounded-2xl border-2 border-primary px-6 py-3 text-lg font-bold text-primary hover:bg-primary-tint">
                Continui fără cont
              </button>
            </div>
            <p className="mt-4 text-sm text-ink-soft">Te poți răzgândi oricând: butonul „Conectare” rămâne sus, în meniu.</p>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <h2 id="welcome-title" className="text-3xl font-black tracking-tight text-ink">Contul tău</h2>
              <button type="button" onClick={close} aria-label="Închide" className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-ink-soft hover:bg-primary-tint hover:text-primary-dark">
                <span aria-hidden>×</span>
              </button>
            </div>
            <p className="mt-2 text-ink-soft">
              Scrie numele și emailul tău. Îți trimitem un link; dacă ești la prima vizită, îți facem contul pe loc. Nu ai nevoie de parolă.
            </p>
            <SignInForm idPrefix="bun-venit-" />
            <button type="button" onClick={close} className="mt-4 min-h-11 w-full font-bold text-primary underline underline-offset-2">
              Continui fără cont
            </button>
          </>
        )}
      </div>
    </div>
  );
}
