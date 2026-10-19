"use client";
// "Datele mele": opened only from a small link in "Contul meu" or the privacy page, only when signed in; shows everything the site keeps about the account and lets the student download a copy (GDPR right of access and portability).
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";
import { domains, profiles } from "@/lib/data";

const WHERE_LABEL: Record<string, string> = { ro: "În România", abroad: "În străinătate", any: "Oriunde" };

type Copy = {
  exportat: string;
  cont: { numeUtilizator: string | null; numeComplet: string | null; email: string | null; emailConfirmat: string | null; creat: string; administrator: boolean };
  rezultatSalvat: { profil: string; unde: string; orase: string[]; raspunsuri: Record<string, number>; domenii: string[]; salvat: string } | null;
  sesiuniDeConectare: { inceput: string; expira: string }[];
  parola: string;
};

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleString("ro-RO", { dateStyle: "long", timeStyle: "short" }) : "—");

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2 last:border-0 sm:flex-row sm:gap-4">
      <dt className="w-48 shrink-0 text-sm font-extrabold uppercase tracking-wide text-primary">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{value}</dd>
    </div>
  );
}

export default function MyDataPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const copy = useQuery(api.account.exportMine, isAuthenticated ? {} : "skip") as Copy | null | undefined;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/conectare");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || copy === undefined) {
    return <Shell><p className="mt-10 text-center text-ink-soft">Se încarcă...</p></Shell>;
  }
  if (copy === null) {
    return <Shell><p className="mt-10 text-center text-ink-soft">Nu am găsit contul. Conectează-te din nou.</p></Shell>;
  }

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(copy, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "findmyuni-datele-mele.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const r = copy.rezultatSalvat;
  return (
    <Shell>
      <p className="mt-4">
        <Link href="/cont" className="font-bold text-primary underline underline-offset-2">← Contul meu</Link>
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tighter text-ink">Datele mele</h1>
      <p className="mt-2 text-ink-soft">Aici vezi tot ce păstrăm despre contul tău. Doar tu poți vedea această pagină.</p>

      <section className="mt-6 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line" data-my-data>
        <h2 className="text-xl font-black text-ink">Contul</h2>
        <dl className="mt-2">
          <Row label="Nume de utilizator" value={copy.cont.numeUtilizator ?? "—"} />
          <Row label="Numele complet" value={copy.cont.numeComplet ?? "—"} />
          <Row label="Email" value={copy.cont.email ?? "—"} />
          <Row label="Email confirmat" value={day(copy.cont.emailConfirmat)} />
          <Row label="Cont creat" value={day(copy.cont.creat)} />
          <Row label="Parola" value="păstrată doar ca amprentă; nimeni, nici noi, nu o poate citi" />
        </dl>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line">
        <h2 className="text-xl font-black text-ink">Rezultatul salvat</h2>
        {r ? (
          <dl className="mt-2">
            <Row label="Profilul de liceu" value={profiles.find((p) => p.id === r.profil)?.name ?? r.profil} />
            <Row label="Unde vrei să studiezi" value={WHERE_LABEL[r.unde] ?? r.unde} />
            <Row label="Orașe" value={r.orase.length ? r.orase.join(", ") : "oricare"} />
            <Row label="Domenii potrivite" value={r.domenii.map((id) => domains.find((d) => d.id === id)?.name ?? id).join(", ")} />
            <Row label="Răspunsuri" value={`${Object.keys(r.raspunsuri).length} întrebări (în fișierul descărcat apar toate)`} />
            <Row label="Salvat" value={day(r.salvat)} />
          </dl>
        ) : (
          <p className="mt-2 text-ink-soft">Nu ai salvat niciun rezultat.</p>
        )}
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line">
        <h2 className="text-xl font-black text-ink">Conectări</h2>
        {copy.sesiuniDeConectare.length ? (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {copy.sesiuniDeConectare.map((x) => (
              <li key={x.inceput}>Conectat pe {day(x.inceput)} · valabil până pe {day(x.expira)}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ink-soft">Nicio conectare activă.</p>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={download} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
          Descarcă o copie
        </button>
        <p className="text-sm text-ink-soft">
          Un fișier cu aceleași date, pe care îl poți păstra sau duce în altă parte. Vezi și{" "}
          <Link href="/confidentialitate" className="font-bold text-primary underline underline-offset-2">Confidențialitate</Link>.
        </p>
      </div>
    </Shell>
  );
}
