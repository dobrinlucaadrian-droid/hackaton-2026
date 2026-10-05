"use client";
// Administration page for student opinions: the team reads what came through the form and approves or rejects it. Only administrators get any data.
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { Notice, Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type State = "pending" | "approved" | "rejected";
const TABS: [State, string][] = [["pending", "În așteptare"], ["approved", "Aprobate"], ["rejected", "Respinse"]];

function Queue({ state }: { state: State }) {
  const rows = useQuery(api.reviews.listByState, { state });
  const moderate = useMutation(api.reviews.moderate);
  const [busy, setBusy] = useState<Id<"reviews"> | null>(null);

  async function set(id: Id<"reviews">, next: "approved" | "rejected") {
    setBusy(id);
    try {
      await moderate({ id, state: next });
    } finally {
      setBusy(null);
    }
  }

  if (rows === undefined) return <p className="mt-6 text-ink-soft">Se încarcă...</p>;
  if (rows.length === 0) return <p className="mt-6 rounded-2xl bg-card p-6 text-ink-soft ring-1 ring-line">Nu este nimic aici.</p>;
  return (
    <ul className="mt-6 space-y-4" data-queue={state}>
      {rows.map((r) => (
        <li key={r._id} className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
          <p className="text-xl font-extrabold text-ink">{r.name}</p>
          <p className="mt-1 text-sm font-bold text-primary">
            {r.faculty}
            {r.university ? `, ${r.university}` : ""}
            {r.status ? ` · ${r.status}` : ""}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Trimisă pe {new Date(r.submittedAt).toLocaleString("ro-RO")}
            {r.universityId ? ` · legată de fișa „${r.universityId}”` : " · fără fișă de universitate"}
          </p>
          {/* Plain text only: React escapes it, so nothing typed in the form can run as code. */}
          <blockquote className="mt-4 whitespace-pre-line border-l-4 border-teal pl-4 text-ink-soft">{r.text}</blockquote>
          <div className="mt-4 flex flex-wrap gap-3">
            {state !== "approved" && (
              <button type="button" disabled={busy === r._id} onClick={() => void set(r._id, "approved")} className="min-h-11 rounded-full bg-primary px-5 font-black text-white hover:bg-primary-dark disabled:opacity-50">
                Aprobă
              </button>
            )}
            {state !== "rejected" && (
              <button type="button" disabled={busy === r._id} onClick={() => void set(r._id, "rejected")} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint disabled:opacity-50">
                {state === "approved" ? "Scoate de pe site" : "Respinge"}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminReviewsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");
  const [tab, setTab] = useState<State>("pending");

  if (isLoading || (isAuthenticated && me === undefined)) return <Shell><p className="mt-10 text-center text-ink-soft">Se încarcă...</p></Shell>;
  if (!isAuthenticated) {
    return <Shell><Notice title="Trebuie să fii conectat" text="Pagina aceasta este pentru echipa UniPath." href="/conectare" cta="Conectare" /></Shell>;
  }
  if (!me?.isAdmin) {
    return <Shell><Notice title="Nu ai acces aici" text="Pagina aceasta este doar pentru administratorii UniPath." href="/" cta="Înapoi acasă" /></Shell>;
  }

  return (
    <Shell>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">Păreri de aprobat</h1>
      <p className="mt-2 text-ink-soft">
        Citește fiecare părere. Aprob-o doar dacă e reală, respectuoasă și fără date personale ale altor oameni.{" "}
        <Link href="/studenti" className="font-bold text-primary underline underline-offset-2">Vezi pagina publică →</Link>
      </p>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Starea părerilor">
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
    </Shell>
  );
}
