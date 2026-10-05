"use client";
// Sign-in page: the student types an email and receives a sign-in link; a Google button appears when Google sign-in is configured. No passwords.
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const methods = useQuery(api.account.signInMethods);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setState("sending");
    try {
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
          Cu un cont îți poți salva rezultatul chestionarului și îl găsești oricând, de pe orice dispozitiv. Nu ai nevoie de parolă.
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
          <form onSubmit={sendLink} className="mt-6">
            <label htmlFor="email" className="text-sm font-extrabold uppercase tracking-wide text-primary">
              Adresa ta de email
            </label>
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
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-transparent bg-paper px-4 text-ink ring-1 ring-line focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === "sending" || methods?.email === false}
              className="mt-4 min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state === "sending" ? "Se trimite..." : "Trimite-mi linkul de conectare"}
            </button>
            {methods?.email === false && (
              <p className="mt-3 text-sm text-ink-soft" role="note">
                Conectarea prin email nu este încă pornită. Revino în curând.
              </p>
            )}
            {state === "error" && (
              <p className="mt-3 text-sm font-bold text-primary-dark" role="alert">
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
          Păstrăm doar adresa ta de email și rezultatul chestionarului. Îți poți șterge contul oricând, din pagina „Contul meu”.
        </p>
      </div>
    </Shell>
  );
}
