"use client";
// Administration page with statistics and maintenance: visits, where they come from, finished questionnaires and how people answered, the state of the database, and a CSV download. Only administrators get any data.
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { Notice, Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";
import { catalogCountries, catalogTotals } from "@/lib/catalog";
import { domains, profiles, questions } from "@/lib/data";

type Counted = { key: string; count: number }[];
const PERIODS: [number, string][] = [[7, "7 zile"], [30, "30 de zile"], [90, "90 de zile"]];
const WHERE_LABEL: Record<string, string> = { ro: "În România", abroad: "În străinătate", any: "Oriunde" };
const nr = (n: number) => n.toLocaleString("ro-RO");
const sum = (rows: Counted) => rows.reduce((n, r) => n + r.count, 0);

function countryName(code: string) {
  if (code === "necunoscut") return "Necunoscută (de exemplu, de pe calculatorul de lucru)";
  try {
    return new Intl.DisplayNames(["ro"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

/** A list of labelled bars; the widest bar is the biggest value in the list. */
function Bars({ rows, label, total, empty = "Încă nu sunt date." }: { rows: Counted; label?: (key: string) => string; total?: number; empty?: string }) {
  if (rows.length === 0) return <p className="text-sm text-ink-soft">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.key} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 break-words text-ink">{label ? label(r.key) : r.key}</span>
            <span className="shrink-0 font-bold text-ink">
              {nr(r.count)}
              {total ? <span className="font-normal text-ink-soft"> · {Math.round((r.count / total) * 100)}%</span> : null}
            </span>
          </div>
          <div className="mt-0.5 h-1.5 rounded-full bg-primary-tint">
            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(2, Math.round((r.count / max) * 100))}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-black tracking-tight text-ink">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
      <h3 className="mb-3 font-extrabold text-ink">{title}</h3>
      {children}
    </div>
  );
}

const csvCell = (v: string | number) => {
  // A leading = + - @ would be run as a formula by spreadsheet programs; a quote in front makes it plain text.
  const s = typeof v === "string" && /^[=+\-@]/.test(v) ? `'${v}` : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function Statistics() {
  const [days, setDays] = useState(30);
  const data = useQuery(api.analytics.overview, { days });
  if (data === undefined) return <p className="mt-6 text-ink-soft">Se încarcă...</p>;

  const views = data.days.reduce((n, d) => n + d.views, 0);
  const visits = data.days.reduce((n, d) => n + d.visits, 0);
  const quizInPeriod = data.days.reduce((n, d) => n + d.quiz, 0);
  const maxDay = Math.max(...data.days.map((d) => d.views), 1);
  const domainName = (id: string) => domains.find((d) => d.id === id)?.name ?? id;
  const profileName = (id: string) => profiles.find((p) => p.id === id)?.name ?? id;
  const answersOf = (qid: string, optionCount: number): Counted =>
    Array.from({ length: optionCount }, (_, i) => ({ key: String(i), count: data.quiz.answers.find((a) => a.key === `${qid}:${i}`)?.count ?? 0 }));

  function download() {
    const lines: (string | number)[][] = [["sectiune", "cheie", "numar"]];
    for (const d of data!.days) lines.push(["zi: afisari", d.day, d.views], ["zi: vizite", d.day, d.visits], ["zi: chestionare", d.day, d.quiz]);
    for (const r of data!.paths) lines.push(["pagina", r.key, r.count]);
    for (const r of data!.countries) lines.push(["tara", countryName(r.key), r.count]);
    for (const r of data!.referrers) lines.push(["sursa", r.key, r.count]);
    lines.push(["chestionare: total", "toate", data!.quiz.total]);
    for (const r of data!.quiz.top1) lines.push(["chestionar: primul domeniu", domainName(r.key), r.count]);
    for (const r of data!.quiz.top) lines.push(["chestionar: in primele 3", domainName(r.key), r.count]);
    for (const r of data!.quiz.profiles) lines.push(["chestionar: profil", profileName(r.key), r.count]);
    for (const r of data!.quiz.where) lines.push(["chestionar: unde", WHERE_LABEL[r.key] ?? r.key, r.count]);
    for (const r of data!.quiz.cities) lines.push(["chestionar: oras", r.key, r.count]);
    for (const q of questions) answersOf(q.id, q.options.length).forEach((r, i) => lines.push([`intrebare: ${q.text}`, q.options[i].label, r.count]));
    const csv = "﻿" + lines.map((l) => l.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `unipath-statistici-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div data-stats>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {PERIODS.map(([n, text]) => (
          <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)} className={`min-h-11 rounded-full px-4 text-sm font-bold ${days === n ? "bg-primary text-white" : "bg-card text-ink-soft ring-1 ring-line hover:ring-primary/50"}`}>
            {text}
          </button>
        ))}
        <button type="button" onClick={download} className="ml-auto min-h-11 rounded-full border-2 border-primary px-5 text-sm font-bold text-primary hover:bg-primary-tint">
          Descarcă statisticile (CSV)
        </button>
      </div>
      {data.truncated && <p className="mt-3 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark">Sunt foarte multe date pentru perioada aleasă; cifrele de mai jos sunt parțiale. Alege o perioadă mai scurtă.</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Afișări de pagini" value={nr(views)} hint={`în ultimele ${days} zile`} />
        <Card label="Vizite" value={nr(visits)} hint="o vizită = o deschidere a site-ului" />
        <Card label="Chestionare terminate" value={nr(quizInPeriod)} hint={`în ultimele ${days} zile`} />
        <Card label="Chestionare, în total" value={nr(data.quiz.total)} hint="de când numărăm" />
      </div>

      <Section title="Accesări pe zile" hint="Bara arată afișările de pagini; în dreapta: afișări · vizite · chestionare terminate.">
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
          <ul className="space-y-1" data-days>
            {[...data.days].reverse().map((d) => (
              <li key={d.day} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="text-ink-soft">{d.day.slice(8)}.{d.day.slice(5, 7)}</span>
                <span className="h-2 rounded-full bg-primary-tint">
                  <span className="block h-2 rounded-full bg-primary" style={{ width: `${d.views ? Math.max(2, Math.round((d.views / maxDay) * 100)) : 0}%` }} />
                </span>
                <span className="font-bold text-ink">{nr(d.views)} · {nr(d.visits)} · {nr(d.quiz)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="De unde vin vizitele" hint="Țara și site-ul de pe care a venit omul se numără o dată pe vizită. „direct” înseamnă că a scris adresa sau a apăsat pe un link dintr-o aplicație.">
        <div className="grid gap-3 lg:grid-cols-3">
          <Panel title="Țări"><Bars rows={data.countries} label={countryName} total={sum(data.countries)} /></Panel>
          <Panel title="Site-uri de pe care vin"><Bars rows={data.referrers} total={sum(data.referrers)} /></Panel>
          <Panel title="Cele mai văzute pagini"><Bars rows={data.paths.slice(0, 15)} label={(k) => (k === "/" ? "/ (prima pagină)" : k)} /></Panel>
        </div>
      </Section>

      <Section title="Chestionarul" hint={`Chestionare terminate în total: ${nr(data.quiz.total)}. Cifrele de mai jos sunt de când numărăm, nu doar din perioada aleasă.`}>
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Domeniul de pe primul loc"><Bars rows={data.quiz.top1.slice(0, 12)} label={domainName} total={data.quiz.total} /></Panel>
          <Panel title="Domenii apărute în primele 3"><Bars rows={data.quiz.top.slice(0, 12)} label={domainName} total={data.quiz.total} /></Panel>
          <Panel title="Profilul de liceu"><Bars rows={data.quiz.profiles} label={profileName} total={data.quiz.total} /></Panel>
          <Panel title="Unde vor să studieze">
            <Bars rows={data.quiz.where} label={(k) => WHERE_LABEL[k] ?? k} total={data.quiz.total} />
            <h4 className="mb-2 mt-4 text-sm font-extrabold text-ink">Orașul ales din România</h4>
            <Bars rows={data.quiz.cities.slice(0, 10)} empty="Încă nu a ales nimeni un oraș." />
          </Panel>
        </div>
      </Section>

      <Section title="Cine a răspuns ce" hint="Pentru fiecare întrebare: câți au ales fiecare variantă.">
        <div className="space-y-2">
          {questions.map((q, i) => {
            const rows = answersOf(q.id, q.options.length);
            const total = sum(rows);
            return (
              <details key={q.id} className="group rounded-2xl bg-card px-4 py-1 shadow-sm ring-1 ring-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink [&::-webkit-details-marker]:hidden">
                  <span>{i + 1}. {q.text}</span>
                  <span className="shrink-0 text-sm font-semibold text-ink-soft">{nr(total)} <span aria-hidden className="text-primary-dark transition-transform group-open:rotate-180">▾</span></span>
                </summary>
                <div className="mb-3"><Bars rows={rows} label={(k) => q.options[Number(k)].label} total={total} /></div>
              </details>
            );
          })}
        </div>
      </Section>

      <Section title="Mentenanță: starea bazei de date">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Conturi" value={nr(data.database.users)} hint={`${nr(data.database.admins)} administrator${data.database.admins === 1 ? "" : "i"}`} />
          <Card label="Rezultate salvate în cont" value={nr(data.database.savedResults)} />
          <Card label="Păreri în așteptare" value={nr(data.database.reviews.pending)} hint={`${nr(data.database.reviews.approved)} aprobate · ${nr(data.database.reviews.rejected)} respinse`} />
          <Card label="Catalog de programe" value={nr(catalogTotals.programs)} hint={`${nr(catalogTotals.institutions)} instituții · ${catalogTotals.countries} țări`} />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {data.database.catalogLoadedAt
            ? `Catalogul a fost încărcat ultima dată în baza de date pe ${new Date(data.database.catalogLoadedAt).toLocaleString("ro-RO")}.`
            : "Catalogul nu este încărcat în baza de date. Se încarcă cu „node scripts/data/import.mjs”."}
          {data.database.reviews.pending > 0 && (
            <> <Link href="/admin/pareri" className="font-bold text-primary underline underline-offset-2">Vezi părerile de aprobat →</Link></>
          )}
        </p>
        <div className="mt-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
          <h3 className="mb-3 font-extrabold text-ink">Programe pe țări (fișierele catalogului)</h3>
          <Bars rows={catalogCountries.map((c) => ({ key: `${c.name} · ${nr(c.institutions)} instituții`, count: c.programs }))} />
        </div>
      </Section>
    </div>
  );
}

export default function AdminStatsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && me === undefined)) return <Shell><p className="mt-10 text-center text-ink-soft">Se încarcă...</p></Shell>;
  if (!isAuthenticated) {
    return <Shell><Notice title="Trebuie să fii conectat" text="Pagina aceasta este pentru echipa UniPath." href="/conectare" cta="Conectare" /></Shell>;
  }
  if (!me?.isAdmin) {
    return <Shell><Notice title="Nu ai acces aici" text="Pagina aceasta este doar pentru administratorii UniPath." href="/" cta="Înapoi acasă" /></Shell>;
  }

  return (
    <Shell wide>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">Statistici și mentenanță</h1>
      <p className="mt-2 text-ink-soft">
        Toate cifrele sunt anonime: nu păstrăm nume, adrese IP sau cookie-uri pentru ele.{" "}
        <Link href="/admin/pareri" className="font-bold text-primary underline underline-offset-2">Păreri de aprobat →</Link>
      </p>
      <Statistics />
    </Shell>
  );
}
