"use client";
// (In the page language.) Shown on the admin pages until this device is unlocked: sends a 6-digit code to the admin's email and checks it; the pages open for 8 hours, then it asks again.
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import { serverMessage } from "@/lib/serverMessages";
import { useLang, useT } from "./LangProvider";

export function AdminGate({ children }: { children: ReactNode }) {
  const lang = useLang();
  const t = useT();
  const status = useQuery(api.adminUnlock.status, {});
  const sendCode = useAction(api.adminUnlock.sendCode);
  const verify = useMutation(api.adminUnlock.verify);
  const [now, setNow] = useState(() => Date.now());
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Re-check the time every minute, so the pages lock again when the 8 hours are over.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (status === undefined) return <p className="mt-10 text-center text-ink-soft">{t("Se încarcă...", "Loading...")}</p>;
  if (status.admin && status.unlockedUntil !== null && status.unlockedUntil > now) return <>{children}</>;

  async function send() {
    setBusy(true);
    setMessage(null);
    try {
      await sendCode({});
      setSent(true);
      setMessage(t("Ți-am trimis un cod pe emailul de administrator. Este valabil 10 minute.", "We sent a code to the administrator email. It is valid for 10 minutes."));
    } catch (e) {
      setMessage(e instanceof ConvexError ? serverMessage(String(e.data), lang) : t("Nu am putut trimite codul. Încearcă din nou.", "We could not send the code. Try again."));
    } finally {
      setBusy(false);
    }
  }

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const r = await verify({ code });
      if (!r.ok) setMessage(serverMessage(r.message ?? "Codul nu este corect.", lang));
      else setNow(Date.now());
    } catch (err) {
      setMessage(err instanceof ConvexError ? serverMessage(String(err.data), lang) : t("Nu a mers. Încearcă din nou.", "It did not work. Try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl bg-card p-6 text-center shadow-sm ring-1 ring-line" data-admin-gate>
      <h1 className="text-2xl font-black tracking-tight text-ink">{t("Confirmă că ești tu", "Confirm it is you")}</h1>
      <p className="mt-2 text-ink-soft">
        {t("Pentru administrare, pe lângă parolă îți trimitem un cod pe email. După ce îl scrii, paginile de administrare rămân deschise 8 ore pe acest dispozitiv.", "For administration, besides your password we send you a code by email. After you enter it, the administration pages stay open for 8 hours on this device.")}
      </p>
      <button
        type="button"
        onClick={() => void send()}
        disabled={busy}
        className="mt-5 min-h-12 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50"
      >
        {sent ? t("Trimite alt cod", "Send another code") : t("Trimite codul pe email", "Send the code by email")}
      </button>
      {sent && (
        <form onSubmit={(e) => void check(e)} className="mt-5 flex flex-col items-center gap-3">
          <label htmlFor="cod-admin" className="text-sm font-bold text-ink">{t("Codul de 6 cifre", "The 6-digit code")}</label>
          <input
            id="cod-admin"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-40 rounded-xl border border-line bg-paper px-4 py-3 text-center text-2xl font-black tracking-[0.3em] text-ink"
          />
          <button type="submit" disabled={busy || code.length !== 6} className="min-h-11 rounded-full border-2 border-primary px-6 font-bold text-primary hover:bg-primary-tint disabled:opacity-50">
            {t("Deblochează", "Unlock")}
          </button>
        </form>
      )}
      {message && <p className="mt-4 text-sm font-bold text-primary-dark" role="status">{message}</p>}
    </div>
  );
}
