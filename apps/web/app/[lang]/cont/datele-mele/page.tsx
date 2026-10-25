"use client";
// "Datele mele" (in the page language): opened only from a small link in "Contul meu" or the privacy page, only when signed in; shows everything the site keeps about the account and lets the student download a copy (GDPR right of access and portability).
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHref, useLang, useT } from "@/components/LangProvider";
import Link from "@/components/LocalLink";
import { Shell } from "@/components/Shell";
import { api } from "@/convex/_generated/api";
import { domains, profiles } from "@/lib/data";
import { cityName, localDomain, localProfile } from "@/lib/i18n-data";

const WHERE_LABEL: Record<string, string> = { ro: "În România", abroad: "În străinătate", any: "Oriunde" };
const WHERE_LABEL_EN: Record<string, string> = { ro: "In Romania", abroad: "Abroad", any: "Anywhere" };

type Copy = {
  exportat: string;
  cont: { numeUtilizator: string | null; numeComplet: string | null; email: string | null; emailConfirmat: string | null; creat: string; administrator: boolean };
  universitatiFavorite?: { universitate: string; loc: string; adaugat: string }[];
  rezultatSalvat: { profil: string; unde: string; orase: string[]; raspunsuri: Record<string, number>; domenii: string[]; salvat: string } | null;
  sesiuniDeConectare: { inceput: string; expira: string }[];
  parola: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2 last:border-0 sm:flex-row sm:gap-4">
      <dt className="w-48 shrink-0 text-sm font-extrabold uppercase tracking-wide text-primary">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{value}</dd>
    </div>
  );
}

export default function MyDataPage() {
  const lang = useLang();
  const t = useT();
  const href = useHref();
  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "ro-RO", { dateStyle: "long", timeStyle: "short" }) : "—");
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const copy = useQuery(api.account.exportMine, isAuthenticated ? {} : "skip") as Copy | null | undefined;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(href("/conectare"));
  }, [isLoading, isAuthenticated, router, href]);

  if (isLoading || !isAuthenticated || copy === undefined) {
    return <Shell><p className="mt-10 text-center text-ink-soft">{t("Se încarcă...", "Loading...")}</p></Shell>;
  }
  if (copy === null) {
    return <Shell><p className="mt-10 text-center text-ink-soft">{t("Nu am găsit contul. Conectează-te din nou.", "We could not find the account. Sign in again.")}</p></Shell>;
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
        <Link href="/cont" className="font-bold text-primary underline underline-offset-2">{t("← Contul meu", "← My account")}</Link>
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tighter text-ink">{t("Datele mele", "My data")}</h1>
      <p className="mt-2 text-ink-soft">{t("Aici vezi tot ce păstrăm despre contul tău. Doar tu poți vedea această pagină.", "Here you see everything we keep about your account. Only you can see this page.")}</p>

      <section className="mt-6 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line" data-my-data>
        <h2 className="text-xl font-black text-ink">{t("Contul", "The account")}</h2>
        <dl className="mt-2">
          <Row label={t("Nume de utilizator", "Username")} value={copy.cont.numeUtilizator ?? "—"} />
          <Row label={t("Numele complet", "Full name")} value={copy.cont.numeComplet ?? "—"} />
          <Row label="Email" value={copy.cont.email ?? "—"} />
          <Row label={t("Email confirmat", "Email confirmed")} value={day(copy.cont.emailConfirmat)} />
          <Row label={t("Cont creat", "Account created")} value={day(copy.cont.creat)} />
          <Row label={t("Parola", "Password")} value={t("păstrată doar ca amprentă; nimeni, nici noi, nu o poate citi", "kept only as a fingerprint; nobody, not even us, can read it")} />
        </dl>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line">
        <h2 className="text-xl font-black text-ink">{t("Rezultatul salvat", "The saved result")}</h2>
        {r ? (
          <dl className="mt-2">
            <Row label={t("Profilul de liceu", "High-school profile")} value={(() => { const p = profiles.find((x) => x.id === r.profil); return p ? localProfile(p, lang).name : r.profil; })()} />
            <Row label={t("Unde vrei să studiezi", "Where you want to study")} value={(lang === "en" ? WHERE_LABEL_EN : WHERE_LABEL)[r.unde] ?? r.unde} />
            <Row label={t("Orașe", "Cities")} value={r.orase.length ? r.orase.map((c) => cityName(c, lang)).join(", ") : t("oricare", "any")} />
            <Row label={t("Domenii potrivite", "Matching fields")} value={r.domenii.map((id) => { const d = domains.find((x) => x.id === id); return d ? localDomain(d, lang).name : id; }).join(", ")} />
            <Row label={t("Răspunsuri", "Answers")} value={t(`${Object.keys(r.raspunsuri).length} întrebări (în fișierul descărcat apar toate)`, `${Object.keys(r.raspunsuri).length} questions (all of them are in the downloaded file)`)} />
            <Row label={t("Salvat", "Saved")} value={day(r.salvat)} />
          </dl>
        ) : (
          <p className="mt-2 text-ink-soft">{t("Nu ai salvat niciun rezultat.", "You have not saved any result.")}</p>
        )}
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line">
        <h2 className="text-xl font-black text-ink">{t("Universități favorite", "Favourite universities")}</h2>
        {copy.universitatiFavorite?.length ? (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {copy.universitatiFavorite.map((f) => (
              <li key={f.universitate + f.adaugat}>{f.universitate} ({f.loc}) · {t("adăugată pe", "added on")} {day(f.adaugat)}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ink-soft">{t("Nu ai nicio universitate la favorite.", "You have no favourite universities.")}</p>
        )}
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line">
        <h2 className="text-xl font-black text-ink">{t("Conectări", "Sign-ins")}</h2>
        {copy.sesiuniDeConectare.length ? (
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {copy.sesiuniDeConectare.map((x) => (
              <li key={x.inceput}>{t("Conectat pe", "Signed in on")} {day(x.inceput)} · {t("valabil până pe", "valid until")} {day(x.expira)}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ink-soft">{t("Nicio conectare activă.", "No active sign-in.")}</p>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={download} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
          {t("Descarcă o copie", "Download a copy")}
        </button>
        <p className="text-sm text-ink-soft">
          {t("Un fișier cu aceleași date, pe care îl poți păstra sau duce în altă parte. Vezi și", "A file with the same data, which you can keep or take somewhere else. See also")}{" "}
          <Link href="/confidentialitate" className="font-bold text-primary underline underline-offset-2">{t("Confidențialitate", "Privacy")}</Link>.
        </p>
      </div>
    </Shell>
  );
}
