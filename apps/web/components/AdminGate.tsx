"use client";
// Shown on the admin pages until this device is unlocked: sends a 6-digit code to the admin's email and checks it; the pages open for 8 hours, then it asks again.
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";

export function AdminGate({ children }: { children: ReactNode }) {
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

  if (status === undefined) return <p className="mt-10 text-center text-ink-soft">Se încarcă...</p>;
  if (status.admin && status.unlockedUntil !== null && status.unlockedUntil > now) return <>{children}</>;

  async function send() {
    setBusy(true);
    setMessage(null);
    try {
      await sendCode({});
      setSent(true);
      setMessage("Ți-am trimis un cod pe emailul de administrator. Este valabil 10 minute.");
    } catch (e) {
      setMessage(e instanceof ConvexError ? String(e.data) : "Nu am putut trimite codul. Încearcă din nou.");
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
      if (!r.ok) setMessage(r.message ?? "Codul nu este corect.");
      else setNow(Date.now());
    } catch (err) {
      setMessage(err instanceof ConvexError ? String(err.data) : "Nu a mers. Încearcă din nou.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl bg-card p-6 text-center shadow-sm ring-1 ring-line" data-admin-gate>
      <h1 className="text-2xl font-black tracking-tight text-ink">Confirmă că ești tu</h1>
      <p className="mt-2 text-ink-soft">
        Pentru administrare, pe lângă parolă îți trimitem un cod pe email. După ce îl scrii, paginile de administrare rămân deschise 8 ore pe acest dispozitiv.
      </p>
      <button
        type="button"
        onClick={() => void send()}
        disabled={busy}
        className="mt-5 min-h-12 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50"
      >
        {sent ? "Trimite alt cod" : "Trimite codul pe email"}
      </button>
      {sent && (
        <form onSubmit={(e) => void check(e)} className="mt-5 flex flex-col items-center gap-3">
          <label htmlFor="cod-admin" className="text-sm font-bold text-ink">Codul de 6 cifre</label>
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
            Deblochează
          </button>
        </form>
      )}
      {message && <p className="mt-4 text-sm font-bold text-primary-dark" role="status">{message}</p>}
    </div>
  );
}
