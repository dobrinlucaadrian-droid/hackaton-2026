"use client";
// "Contul meu": shows who is signed in and the saved questionnaire result, and lets the student sign out or delete the account.
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { domainStyle } from "@/components/domainStyle";
import { api } from "@/convex/_generated/api";
import { domains, profiles } from "@/lib/data";
import { takePendingResult } from "@/lib/pendingSave";

const WHERE_LABEL = { ro: "În România", abroad: "În străinătate", any: "Oriunde" } as const;

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");
  const result = useQuery(api.results.mine, isAuthenticated ? {} : "skip");
  const save = useMutation(api.results.save);
  const removeResult = useMutation(api.results.remove);
  const removeAccount = useMutation(api.account.remove);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const savedPending = useRef(false);

  // A result waiting from before the sign-in is saved once, as soon as the session is ready.
  useEffect(() => {
    if (!isAuthenticated || savedPending.current) return;
    savedPending.current = true;
    const pending = takePendingResult();
    if (pending) {
      save(pending)
        .then(() => setNote("Am salvat rezultatul tău în cont."))
        .catch(() => setNote("Nu am putut salva rezultatul. Reia chestionarul și încearcă din nou."));
    }
  }, [isAuthenticated, save]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/conectare");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || me === undefined) {
    return <Shell><p className="mt-10 text-center text-ink-soft">Se încarcă...</p></Shell>;
  }

  async function deleteAccount() {
    setBusy(true);
    try {
      await removeAccount({});
      await signOut().catch(() => undefined);
      router.replace("/");
    } catch {
      setNote("Nu am putut șterge contul. Încearcă din nou.");
      setBusy(false);
    }
  }

  const profile = result ? profiles.find((p) => p.id === result.profileId) : undefined;
  const top = result ? result.topDomains.map((id) => domains.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d) : [];

  return (
    <Shell>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">Contul meu</h1>
      <p className="mt-2 text-ink-soft">
        Ești conectat ca <span className="font-bold text-ink">{me?.email ?? "utilizator"}</span>
        {me?.isAdmin ? " · administrator" : ""}.
      </p>
      {note && (
        <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm font-bold text-primary-dark" role="status">
          {note}
        </p>
      )}

      <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line" aria-labelledby="rezultat-salvat">
        <h2 id="rezultat-salvat" className="text-2xl font-black tracking-tight text-ink">Rezultatul tău salvat</h2>
        {result === undefined ? (
          <p className="mt-2 text-ink-soft">Se încarcă...</p>
        ) : result === null ? (
          <>
            <p className="mt-2 text-ink-soft">Încă nu ai salvat un rezultat. Completează chestionarul și apasă „Salvează în contul meu”.</p>
            <Link href="/test" className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 hover:bg-primary-dark">
              Completează chestionarul
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              Salvat pe {new Date(result.savedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
              {profile ? ` · ${profile.name}` : ""} · {WHERE_LABEL[result.where]}
              {result.city ? ` · ${result.city}` : ""}
            </p>
            <ol className="mt-4 space-y-2" data-saved-domains>
              {top.map((d, i) => (
                <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">{i + 1}</span>
                  <span aria-hidden>{domainStyle(d.id).emoji}</span>
                  <span className="min-w-0 flex-1 font-extrabold text-ink">{d.name}</span>
                  <Link href={`/universitati?domeniu=${d.id}`} className="shrink-0 text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2">
                    Universități →
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/test" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
                Reia chestionarul
              </Link>
              <button type="button" onClick={() => void removeResult({})} className="min-h-11 rounded-full px-5 font-bold text-ink-soft underline underline-offset-2 hover:text-primary-dark">
                Șterge rezultatul
              </button>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line" aria-labelledby="cont-setari">
        <h2 id="cont-setari" className="text-2xl font-black tracking-tight text-ink">Cont</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void signOut().then(() => router.replace("/"))}
            className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint"
          >
            Deconectare
          </button>
          {!confirming && (
            <button type="button" onClick={() => setConfirming(true)} className="min-h-11 rounded-full px-5 font-bold text-ink-soft underline underline-offset-2 hover:text-primary-dark">
              Șterge contul
            </button>
          )}
        </div>
        {confirming && (
          <div className="mt-4 rounded-2xl bg-primary-tint p-4" role="alertdialog" aria-labelledby="sterge-titlu">
            <p id="sterge-titlu" className="font-extrabold text-primary-dark">Sigur vrei să ștergi contul?</p>
            <p className="mt-1 text-sm text-primary-dark">Ștergem adresa de email și rezultatul salvat. Nu se poate anula.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={() => void deleteAccount()} className="min-h-11 rounded-full bg-primary px-5 font-black text-white hover:bg-primary-dark disabled:opacity-50">
                {busy ? "Se șterge..." : "Da, șterge contul"}
              </button>
              <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-card">
                Nu, păstrează-l
              </button>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}
