"use client";
// Administration page (in the page language) with statistics and maintenance: visits, where they come from, finished questionnaires and how people answered, the state of the database, and a CSV download. Only administrators get any data.
import { useConvexAuth, useQuery } from "convex/react";
import { useState } from "react";
import { AdminGate } from "@/components/AdminGate";
import { useLang, useT } from "@/components/LangProvider";
import Link from "@/components/LocalLink";
import { Notice, Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";
import { catalogCountries, catalogTotals } from "@/lib/catalog";
import { domains, profiles, questions } from "@/lib/data";
import { localDomain, localProfile, localQuestion } from "@/lib/i18n-data";
import type { Lang } from "@/lib/i18n";

type Counted = { key: string; count: number }[];
const WHERE_LABEL: Record<string, string> = { ro: "În România", abroad: "În străinătate", any: "Oriunde" };
const WHERE_LABEL_EN: Record<string, string> = { ro: "In Romania", abroad: "Abroad", any: "Anywhere" };
const sum = (rows: Counted) => rows.reduce((n, r) => n + r.count, 0);

function countryName(code: string, lang: Lang) {
  if (code === "necunoscut") return lang === "en" ? "Unknown (for example, from a work computer)" : "Necunoscută (de exemplu, de pe calculatorul de lucru)";
  try {
    return new Intl.DisplayNames([lang], { type: "region" }).of(code) ?? code;
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
function Bars({ rows, label, total, empty }: { rows: Counted; label?: (key: string) => string; total?: number; empty?: string }) {
  const t = useT();
  const lang = useLang();
  const nr = (n: number) => n.toLocaleString(lang === "en" ? "en-GB" : "ro-RO");
  if (rows.length === 0) return <p className="text-sm text-ink-soft">{empty ?? t("Încă nu sunt date.", "No data yet.")}</p>;
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
  const t = useT();
  const lang = useLang();
  const nr = (n: number) => n.toLocaleString(lang === "en" ? "en-GB" : "ro-RO");
  const PERIODS: [number, string][] = [[7, t("7 zile", "7 days")], [30, t("30 de zile", "30 days")], [90, t("90 de zile", "90 days")]];
  const whereLabel = (k: string) => (lang === "en" ? WHERE_LABEL_EN : WHERE_LABEL)[k] ?? k;
  const [days, setDays] = useState(30);
  const data = useQuery(api.analytics.overview, { days });
  if (data === undefined) return <p className="mt-6 text-ink-soft">{t("Se încarcă...", "Loading...")}</p>;

  const views = data.days.reduce((n, d) => n + d.views, 0);
  const visits = data.days.reduce((n, d) => n + d.visits, 0);
  const quizInPeriod = data.days.reduce((n, d) => n + d.quiz, 0);
  const maxDay = Math.max(...data.days.map((d) => d.views), 1);
  const domainName = (id: string) => { const d = domains.find((x) => x.id === id); return d ? localDomain(d, lang).name : id; };
  const profileName = (id: string) => { const p = profiles.find((x) => x.id === id); return p ? localProfile(p, lang).name : id; };
  const answersOf = (qid: string, optionCount: number): Counted =>
    Array.from({ length: optionCount }, (_, i) => ({ key: String(i), count: data.quiz.answers.find((a) => a.key === `${qid}:${i}`)?.count ?? 0 }));

  function download() {
    const lines: (string | number)[][] = [["sectiune", "cheie", "numar"]];
    for (const d of data!.days) lines.push(["zi: afisari", d.day, d.views], ["zi: vizite", d.day, d.visits], ["zi: chestionare", d.day, d.quiz]);
    for (const r of data!.paths) lines.push(["pagina", r.key, r.count]);
    for (const r of data!.countries) lines.push(["tara", countryName(r.key, lang), r.count]);
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
    a.download = `findmyuni-statistici-${new Date().toISOString().slice(0, 10)}.csv`;
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
          {t("Descarcă statisticile (CSV)", "Download the statistics (CSV)")}
        </button>
      </div>
      {data.truncated && <p className="mt-3 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark">{t("Sunt foarte multe date pentru perioada aleasă; cifrele de mai jos sunt parțiale. Alege o perioadă mai scurtă.", "There is a lot of data for the chosen period; the figures below are partial. Choose a shorter period.")}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label={t("Afișări de pagini", "Page views")} value={nr(views)} hint={t(`în ultimele ${days} zile`, `in the last ${days} days`)} />
        <Card label={t("Vizite", "Visits")} value={nr(visits)} hint={t("o vizită = o deschidere a site-ului", "one visit = one opening of the site")} />
        <Card label={t("Chestionare terminate", "Quizzes finished")} value={nr(quizInPeriod)} hint={t(`în ultimele ${days} zile`, `in the last ${days} days`)} />
        <Card label={t("Chestionare, în total", "Quizzes, in total")} value={nr(data.quiz.total)} hint={t("de când numărăm", "since we started counting")} />
      </div>

      <Section title={t("Accesări pe zile", "Visits per day")} hint={t("Bara arată afișările de pagini; în dreapta: afișări · vizite · chestionare terminate.", "The bar shows page views; on the right: views · visits · quizzes finished.")}>
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

      <Section title={t("De unde vin vizitele", "Where the visits come from")} hint={t("Țara și site-ul de pe care a venit omul se numără o dată pe vizită. „direct” înseamnă că a scris adresa sau a apăsat pe un link dintr-o aplicație.", "The country and the site the person came from are counted once per visit. “direct” means they typed the address or tapped a link in an app.")}>
        <div className="grid gap-3 lg:grid-cols-3">
          <Panel title={t("Țări", "Countries")}><Bars rows={data.countries} label={(k) => countryName(k, lang)} total={sum(data.countries)} /></Panel>
          <Panel title={t("Site-uri de pe care vin", "Sites they come from")}><Bars rows={data.referrers} total={sum(data.referrers)} /></Panel>
          <Panel title={t("Cele mai văzute pagini", "Most viewed pages")}><Bars rows={data.paths.slice(0, 15)} label={(k) => (k === "/" ? t("/ (prima pagină)", "/ (home page)") : k)} /></Panel>
        </div>
      </Section>

      <Section title={t("Chestionarul", "The quiz")} hint={t(`Chestionare terminate în total: ${nr(data.quiz.total)}. Cifrele de mai jos sunt de când numărăm, nu doar din perioada aleasă.`, `Quizzes finished in total: ${nr(data.quiz.total)}. The figures below are since we started counting, not only from the chosen period.`)}>
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title={t("Domeniul de pe primul loc", "The field in first place")}><Bars rows={data.quiz.top1.slice(0, 12)} label={domainName} total={data.quiz.total} /></Panel>
          <Panel title={t("Domenii apărute în primele 3", "Fields that appeared in the top 3")}><Bars rows={data.quiz.top.slice(0, 12)} label={domainName} total={data.quiz.total} /></Panel>
          <Panel title={t("Profilul de liceu", "High-school profile")}><Bars rows={data.quiz.profiles} label={profileName} total={data.quiz.total} /></Panel>
          <Panel title={t("Unde vor să studieze", "Where they want to study")}>
            <Bars rows={data.quiz.where} label={whereLabel} total={data.quiz.total} />
            <h4 className="mb-2 mt-4 text-sm font-extrabold text-ink">{t("Orașul ales din România", "The city chosen in Romania")}</h4>
            <Bars rows={data.quiz.cities.slice(0, 10)} empty={t("Încă nu a ales nimeni un oraș.", "Nobody has chosen a city yet.")} />
          </Panel>
        </div>
      </Section>

      <Section title={t("Cine a răspuns ce", "Who answered what")} hint={t("Pentru fiecare întrebare: câți au ales fiecare variantă.", "For each question: how many chose each option.")}>
        <div className="space-y-2">
          {questions.map((q0, i) => {
            const q = localQuestion(q0, lang);
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

      <Section title={t("Mentenanță: starea bazei de date", "Maintenance: state of the database")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card label={t("Conturi", "Accounts")} value={nr(data.database.users)} hint={t(`${nr(data.database.admins)} administrator${data.database.admins === 1 ? "" : "i"}`, `${nr(data.database.admins)} administrator${data.database.admins === 1 ? "" : "s"}`)} />
          <Card label={t("Rezultate salvate în cont", "Results saved in accounts")} value={nr(data.database.savedResults)} />
          <Card label={t("Păreri în așteptare", "Opinions pending")} value={nr(data.database.reviews.pending)} hint={t(`${nr(data.database.reviews.approved)} aprobate · ${nr(data.database.reviews.rejected)} respinse`, `${nr(data.database.reviews.approved)} approved · ${nr(data.database.reviews.rejected)} rejected`)} />
          <Card label={t("Catalog de programe", "Programme catalogue")} value={nr(catalogTotals.programs)} hint={t(`${nr(catalogTotals.institutions)} instituții · ${catalogTotals.countries} țări`, `${nr(catalogTotals.institutions)} institutions · ${catalogTotals.countries} countries`)} />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {data.database.catalogLoadedAt
            ? t(`Catalogul a fost încărcat ultima dată în baza de date pe ${new Date(data.database.catalogLoadedAt).toLocaleString("ro-RO")}.`, `The catalogue was last loaded into the database on ${new Date(data.database.catalogLoadedAt).toLocaleString("en-GB")}.`)
            : t("Catalogul nu este încărcat în baza de date. Se încarcă cu „node scripts/data/import.mjs”.", "The catalogue is not loaded into the database. Load it with “node scripts/data/import.mjs”.")}
          {data.database.reviews.pending > 0 && (
            <> <Link href="/admin/pareri" className="font-bold text-primary underline underline-offset-2">{t("Vezi părerile de aprobat →", "See the opinions to approve →")}</Link></>
          )}
        </p>
        <div className="mt-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line">
          <h3 className="mb-3 font-extrabold text-ink">{t("Programe pe țări (fișierele catalogului)", "Programmes per country (catalogue files)")}</h3>
          <Bars rows={catalogCountries.map((c) => ({ key: `${c.name} · ${nr(c.institutions)} ${t("instituții", "institutions")}`, count: c.programs }))} />
        </div>
      </Section>
    </div>
  );
}

export default function AdminStatsPage() {
  const t = useT();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && me === undefined)) return <Shell><p className="mt-10 text-center text-ink-soft">{t("Se încarcă...", "Loading...")}</p></Shell>;
  if (!isAuthenticated) {
    return <Shell><Notice title={t("Trebuie să fii conectat", "You need to be signed in")} text={t("Pagina aceasta este pentru echipa FindMyUni.", "This page is for the FindMyUni team.")} href="/conectare" cta={t("Conectare", "Sign in")} /></Shell>;
  }
  if (!me?.isAdmin) {
    return <Shell><Notice title={t("Nu ai acces aici", "You do not have access here")} text={t("Pagina aceasta este doar pentru administratorii FindMyUni.", "This page is only for FindMyUni administrators.")} href="/" cta={t("Înapoi acasă", "Back home")} /></Shell>;
  }

  return (
    <Shell wide>
      <AdminGate>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">{t("Statistici și mentenanță", "Statistics and maintenance")}</h1>
        <p className="mt-2 text-ink-soft">
          {t("Toate cifrele sunt anonime: nu păstrăm nume, adrese IP sau cookie-uri pentru ele.", "All figures are anonymous: we keep no names, IP addresses or cookies for them.")}{" "}
          <Link href="/admin/pareri" className="font-bold text-primary underline underline-offset-2">{t("Păreri de aprobat →", "Opinions to approve →")}</Link>
        </p>
        <Statistics />
      </AdminGate>
    </Shell>
  );
}
