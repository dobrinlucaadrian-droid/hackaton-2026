"use client";
// Administration page (in the page language) for student opinions: the team reads what came through the form (with the photo, when there is one) and approves, rejects, deletes the photo or deletes the opinion. Only administrators get any data.
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { useLang, useT } from "@/components/LangProvider";
import Link from "@/components/LocalLink";
import { Notice, Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type State = "pending" | "approved" | "rejected";

function Queue({ state }: { state: State }) {
  const t = useT();
  const lang = useLang();
  const rows = useQuery(api.reviews.listByState, { state });
  const moderate = useMutation(api.reviews.moderate);
  const remove = useMutation(api.reviews.remove);
  const removePhoto = useMutation(api.reviews.removePhoto);
  const [busy, setBusy] = useState<Id<"reviews"> | null>(null);

  async function set(id: Id<"reviews">, next: "approved" | "rejected") {
    setBusy(id);
    try {
      await moderate({ id, state: next });
    } finally {
      setBusy(null);
    }
  }

  // Deleting cannot be undone, so the browser asks once more.
  async function del(id: Id<"reviews">) {
    if (!window.confirm(t("Ștergi definitiv această părere? Nu se poate anula.", "Delete this opinion for good? This cannot be undone."))) return;
    setBusy(id);
    try {
      await remove({ id });
    } finally {
      setBusy(null);
    }
  }

  // The opinion stays; only its photo is deleted (for example when it is not a real face).
  async function delPhoto(id: Id<"reviews">) {
    if (!window.confirm(t("Ștergi poza? Părerea rămâne, fără poză.", "Delete the photo? The opinion stays, without it."))) return;
    setBusy(id);
    try {
      await removePhoto({ id });
    } finally {
      setBusy(null);
    }
  }

  if (rows === undefined) return <p className="mt-6 text-ink-soft">{t("Se încarcă...", "Loading...")}</p>;
  if (rows.length === 0) return <p className="mt-6 rounded-2xl bg-card p-6 text-ink-soft ring-1 ring-line">{t("Nu este nimic aici.", "There is nothing here.")}</p>;
  return (
    <ul className="mt-6 space-y-4" data-queue={state}>
      {rows.map((r) => (
        <li key={r._id} className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
          {r.photoUrl && (
            <div className="mb-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- the photo sent with the opinion */}
              <img src={r.photoUrl} alt={t(`Poza trimisă de ${r.name}`, `Photo sent by ${r.name}`)} className="h-20 w-20 rounded-full object-cover ring-2 ring-teal" />
              <div>
                <p className="text-xs text-ink-soft">{t("A bifat că e de acord să i se afișeze fața.", "Ticked that they agree to show their face.")}</p>
                <button type="button" disabled={busy === r._id} onClick={() => void delPhoto(r._id)} className="mt-1 text-sm font-bold text-primary underline underline-offset-2 disabled:opacity-50">
                  {t("Șterge doar poza", "Delete only the photo")}
                </button>
              </div>
            </div>
          )}
          <p className="text-xl font-extrabold text-ink">{r.name}</p>
          <p className="mt-1 text-sm font-bold text-primary">
            {r.faculty}
            {r.university ? `, ${r.university}` : ""}
            {r.status ? ` · ${r.status}` : ""}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {t("Trimisă pe", "Sent on")} {new Date(r.submittedAt).toLocaleString(lang === "en" ? "en-GB" : "ro-RO")}
            {r.universityId ? t(` · legată de fișa „${r.universityId}”`, ` · linked to the sheet “${r.universityId}”`) : t(" · fără fișă de universitate", " · no university sheet")}
          </p>
          {/* Plain text only: React escapes it, so nothing typed in the form can run as code. */}
          <blockquote className="mt-4 whitespace-pre-line border-l-4 border-teal pl-4 text-ink-soft">{r.text}</blockquote>
          <div className="mt-4 flex flex-wrap gap-3">
            {state !== "approved" && (
              <button type="button" disabled={busy === r._id} onClick={() => void set(r._id, "approved")} className="min-h-11 rounded-full bg-primary px-5 font-black text-white hover:bg-primary-dark disabled:opacity-50">
                {t("Aprobă", "Approve")}
              </button>
            )}
            {state !== "rejected" && (
              <button type="button" disabled={busy === r._id} onClick={() => void set(r._id, "rejected")} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint disabled:opacity-50">
                {state === "approved" ? t("Scoate de pe site", "Take off the site") : t("Respinge", "Reject")}
              </button>
            )}
            <button type="button" disabled={busy === r._id} onClick={() => void del(r._id)} className="min-h-11 rounded-full px-5 font-bold text-ink-soft underline underline-offset-2 hover:text-primary-dark disabled:opacity-50">
              {t("Șterge definitiv", "Delete for good")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminReviewsPage() {
  const t = useT();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");
  const [tab, setTab] = useState<State>("pending");
  const TABS: [State, string][] = [["pending", t("În așteptare", "Pending")], ["approved", t("Aprobate", "Approved")], ["rejected", t("Respinse", "Rejected")]];

  if (isLoading || (isAuthenticated && me === undefined)) return <Shell><p className="mt-10 text-center text-ink-soft">{t("Se încarcă...", "Loading...")}</p></Shell>;
  if (!isAuthenticated) {
    return <Shell><Notice title={t("Trebuie să fii conectat", "You need to be signed in")} text={t("Pagina aceasta este pentru echipa FindMyUni.", "This page is for the FindMyUni team.")} href="/conectare" cta={t("Conectare", "Sign in")} /></Shell>;
  }
  if (!me?.isAdmin) {
    return <Shell><Notice title={t("Nu ai acces aici", "You do not have access here")} text={t("Pagina aceasta este doar pentru administratorii FindMyUni.", "This page is only for FindMyUni administrators.")} href="/" cta={t("Înapoi acasă", "Back home")} /></Shell>;
  }

  return (
    <Shell>
      <AdminGate>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">{t("Păreri de aprobat", "Opinions to approve")}</h1>
        <p className="mt-2 text-ink-soft">
          {t("Citește fiecare părere. Aprob-o doar dacă e reală, respectuoasă și fără date personale ale altor oameni.", "Read every opinion. Approve it only if it is real, respectful and has no personal data of other people.")}{" "}
          <Link href="/studenti" className="font-bold text-primary underline underline-offset-2">{t("Vezi pagina publică →", "See the public page →")}</Link>{" "}
          <Link href="/admin/statistici" className="font-bold text-primary underline underline-offset-2">{t("Statistici și mentenanță →", "Statistics and maintenance →")}</Link>
        </p>
        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label={t("Starea părerilor", "State of the opinions")}>
          {TABS.map(([id, text]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${tab === id ? "bg-primary text-white" : "bg-card text-ink-soft ring-1 ring-line hover:ring-primary/50"}`}
            >
              {text}
            </button>
          ))}
        </div>
        <Queue key={tab} state={tab} />
      </AdminGate>
    </Shell>
  );
}
