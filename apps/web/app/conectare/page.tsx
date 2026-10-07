"use client";
// Sign-in page: the visitor types their full name and email and receives a sign-in link, which also creates the account the first time. A Google button appears when Google sign-in is configured. No passwords.
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";
import { cleanName } from "@/lib/name";
import { setPendingName } from "@/lib/pendingSave";

const field = "mt-1 min-h-12 w-full rounded-xl border-2 border-transparent bg-paper px-4 text-ink ring-1 ring-line focus:border-primary focus:outline-none";
const label = "text-sm font-extrabold uppercase tracking-wide text-primary";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const methods = useQuery(api.account.signInMethods);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [nameError, setNameError] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    const fullName = cleanName(name);
    if (!fullName) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setState("sending");
    try {
      // The name is saved to the account right after the link is opened (see the account page).
      setPendingName(fullName);
      await signIn("resend", { email: value, redirectTo: "/cont" });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <Shell>
      <div className="rise mx-auto mt-6 max-w-md rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-ink">Conectare</h1>
        <p className="mt-2 text-ink-soft">
          Scrie numele și emailul tău. Îți trimitem un link de conectare; dacă ești la prima vizită, îți facem contul pe loc. Nu ai nevoie de parolă.
        </p>

        {state === "sent" ? (
          <div className="mt-6 rounded-2xl bg-primary-tint p-4 text-primary-dark" role="status">
            <p className="font-extrabold">Verifică-ți emailul</p>
            <p className="mt-1 text-sm">
              Ți-am trimis un link de conectare la <span className="font-bold">{email.trim()}</span>. Este valabil 15 minute. Dacă nu îl
              vezi, uită-te și în Spam.
            </p>
            <button type="button" onClick={() => setState("idle")} className="mt-3 min-h-11 font-bold underline underline-offset-2">
              Folosește altă adresă
            </button>
          </div>
        ) : (
          <form onSubmit={sendLink} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="nume" className={label}>Numele tău complet</label>
              <input
                id="nume"
                name="name"
                type="text"
                required
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(false);
                }}
                aria-invalid={nameError}
                aria-describedby={nameError ? "nume-eroare" : undefined}
                placeholder="Prenume și nume"
                className={field}
              />
              {nameError && (
                <p id="nume-eroare" className="mt-1 text-sm font-bold text-primary-dark" role="alert">
                  Scrie numele tău complet (prenume și nume).
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={label}>Adresa ta de email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@exemplu.ro"
                className={field}
              />
            </div>
            <button
              type="submit"
              disabled={state === "sending" || methods?.email === false}
              className="min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state === "sending" ? "Se trimite..." : "Trimite-mi linkul de conectare"}
            </button>
            {methods?.email === false && (
              <p className="text-sm text-ink-soft" role="note">
                Conectarea prin email nu este încă pornită. Revino în curând.
              </p>
            )}
            {state === "error" && (
              <p className="text-sm font-bold text-primary-dark" role="alert">
                Nu am putut trimite emailul. Verifică adresa și încearcă din nou peste un minut.
              </p>
            )}
          </form>
        )}

        {methods?.google && state !== "sent" && (
          <>
            <p className="my-4 text-center text-sm text-ink-soft">sau</p>
            <button
              type="button"
              onClick={() => void signIn("google", { redirectTo: "/cont" })}
              className="min-h-12 w-full rounded-2xl border-2 border-primary px-6 py-3 font-bold text-primary hover:bg-primary-tint"
            >
              Continuă cu Google
            </button>
          </>
        )}

        <p className="mt-6 text-sm text-ink-soft" role="note">
          Păstrăm numele tău, adresa de email și rezultatul chestionarului, dacă îl salvezi. Îți poți șterge contul oricând, din pagina „Contul meu”.{" "}
          <Link href="/confidentialitate" className="font-bold text-primary underline underline-offset-2">Află mai multe</Link>
        </p>
      </div>
    </Shell>
  );
}
