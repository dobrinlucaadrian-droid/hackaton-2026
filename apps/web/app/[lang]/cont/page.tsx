"use client";
// "Contul meu" (in the page language): shows who is signed in (username, name and email; the name can be changed) the saved questionnaire result and the favourite universities, a small link to "Datele mele", and lets the student sign out or delete the account.
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHref, useLang, useT } from "@/components/LangProvider";
import Link from "@/components/LocalLink";
import { Shell } from "@/components/Shell";
import { domainStyle } from "@/components/domainStyle";
import { api } from "@/convex/_generated/api";
import { cityList } from "@/lib/cities";
import { domains, profiles } from "@/lib/data";
import { cityName, localDomain, localProfile } from "@/lib/i18n-data";
import { cleanName } from "@/lib/name";
import { takePendingFavorite, takePendingResult } from "@/lib/pendingSave";

const WHERE_LABEL = { ro: "În România", abroad: "În străinătate", any: "Oriunde" } as const;
const WHERE_LABEL_EN = { ro: "In Romania", abroad: "Abroad", any: "Anywhere" } as const;

export default function AccountPage() {
  const router = useRouter();
  const lang = useLang();
  const t = useT();
  const href = useHref();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");
  const result = useQuery(api.results.mine, isAuthenticated ? {} : "skip");
  const save = useMutation(api.results.save);
  const favorites = useQuery(api.favorites.mine, isAuthenticated ? {} : "skip");
  const addFavorite = useMutation(api.favorites.add);
  const removeFavorite = useMutation(api.favorites.remove);
  const removeResult = useMutation(api.results.remove);
  const removeAccount = useMutation(api.account.remove);
  const setName = useMutation(api.account.setName);
  const [nameDraft, setNameDraft] = useState<string | null>(null); // null = not editing
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const savedPending = useRef(false);
  const leaving = useRef(false); // signing out or deleting: go home, not to the sign-in page

  // A result or a hearted university waiting from before the sign-in is saved once, as soon as the session is ready.
  useEffect(() => {
    if (!isAuthenticated || savedPending.current) return;
    savedPending.current = true;
    const favorite = takePendingFavorite();
    if (favorite) {
      addFavorite(favorite)
        .then(() => setNote(t(`Am adăugat ${favorite.name} la favorite.`, `We added ${favorite.name} to your favourites.`)))
        .catch(() => setNote(t("Nu am putut adăuga universitatea la favorite. Încearcă din nou de pe pagina ei.", "We could not add the university to your favourites. Try again from its page.")));
    }
    const pending = takePendingResult();
    if (pending) {
      save(pending)
        .then(() => setNote(t("Am salvat rezultatul tău în cont.", "We saved your result in your account.")))
        .catch(() => setNote(t("Nu am putut salva rezultatul. Reia chestionarul și încearcă din nou.", "We could not save the result. Retake the quiz and try again.")));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the language only picks the wording of a message
  }, [isAuthenticated, save, addFavorite]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !leaving.current) router.replace(href("/conectare"));
  }, [isLoading, isAuthenticated, router, href]);

  if (isLoading || !isAuthenticated || me === undefined) {
    return <Shell><p className="mt-10 text-center text-ink-soft">{t("Se încarcă...", "Loading...")}</p></Shell>;
  }

  async function deleteAccount() {
    setBusy(true);
    try {
      await removeAccount({});
      leaving.current = true;
      await signOut().catch(() => undefined);
      router.replace(href("/"));
    } catch {
      setNote(t("Nu am putut șterge contul. Încearcă din nou.", "We could not delete the account. Try again."));
      setBusy(false);
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (nameDraft === null) return;
    const fullName = cleanName(nameDraft);
    if (!fullName) {
      setNameError(t("Scrie numele tău complet (prenume și nume).", "Write your full name (first name and surname)."));
      return;
    }
    setNameError(null);
    try {
      await setName({ name: fullName });
      setNameDraft(null);
    } catch {
      setNameError(t("Scrie numele tău complet (prenume și nume).", "Write your full name (first name and surname)."));
    }
  }

  const profile0 = result ? profiles.find((p) => p.id === result.profileId) : undefined;
  const profile = profile0 ? localProfile(profile0, lang) : undefined;
  const top = result ? result.topDomains.map((id) => domains.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d).map((d) => localDomain(d, lang)) : [];
  const whereLabel = lang === "en" ? WHERE_LABEL_EN : WHERE_LABEL;
  const cities = (list: string[]) => {
    const names = list.map((c) => cityName(c, lang));
    if (lang !== "en" || names.length <= 1) return cityList(names);
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  };

  return (
    <Shell>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">{t("Contul meu", "My account")}</h1>
      <p className="mt-2 text-ink-soft" data-who>
        {me?.name ? <>{t("Bună", "Hello")}, <span className="font-bold text-ink">{me.name}</span>! </> : null}
        {t("Ești conectat ca", "You are signed in as")} <span className="font-bold text-ink">{me?.username ?? t("contul tău", "your account")}</span>{me?.email ? <> (email: <span className="font-bold text-ink">{me.email}</span>)</> : null}
        {me?.isAdmin ? t(" · administrator", " · administrator") : ""}.
      </p>
      {me?.isAdmin && (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" data-admin-links>
          <Link href="/admin/statistici" className="font-bold text-primary underline underline-offset-2">{t("Statistici și mentenanță →", "Statistics and maintenance →")}</Link>
          <Link href="/admin/pareri" className="font-bold text-primary underline underline-offset-2">{t("Păreri de aprobat →", "Opinions to approve →")}</Link>
        </p>
      )}
      {note && (
        <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm font-bold text-primary-dark" role="status">
          {note}
        </p>
      )}

      <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line" aria-labelledby="rezultat-salvat">
        <h2 id="rezultat-salvat" className="text-2xl font-black tracking-tight text-ink">{t("Rezultatul tău salvat", "Your saved result")}</h2>
        {result === undefined ? (
          <p className="mt-2 text-ink-soft">{t("Se încarcă...", "Loading...")}</p>
        ) : result === null ? (
          <>
            <p className="mt-2 text-ink-soft">{t("Încă nu ai salvat un rezultat. Completează chestionarul și apasă „Salvează în contul meu”.", "You have not saved a result yet. Complete the quiz and press “Save in my account”.")}</p>
            <Link href="/test" className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 hover:bg-primary-dark">
              {t("Completează chestionarul", "Complete the quiz")}
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              {t("Salvat pe", "Saved on")} {new Date(result.savedAt).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", { day: "numeric", month: "long", year: "numeric" })}
              {profile ? ` · ${profile.name}` : ""} · {whereLabel[result.where]}
              {result.cities?.length ? ` · ${cities(result.cities)}` : ""}
            </p>
            <ol className="mt-4 space-y-2" data-saved-domains>
              {top.map((d, i) => (
                <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">{i + 1}</span>
                  <span aria-hidden>{domainStyle(d.id).emoji}</span>
                  <span className="min-w-0 flex-1 font-extrabold text-ink">{d.name}</span>
                  <Link href={`/universitati?domeniu=${d.id}`} className="shrink-0 text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2">
                    {t("Universități →", "Universities →")}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/test" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
                {t("Reia chestionarul", "Retake the quiz")}
              </Link>
              <button type="button" onClick={() => void removeResult({})} className="min-h-11 rounded-full px-5 font-bold text-ink-soft underline underline-offset-2 hover:text-primary-dark">
                {t("Șterge rezultatul", "Delete the result")}
              </button>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line" aria-labelledby="favorite">
        <h2 id="favorite" className="text-2xl font-black tracking-tight text-ink">{t("Universități favorite", "Favourite universities")}</h2>
        {favorites === undefined ? (
          <p className="mt-2 text-ink-soft">{t("Se încarcă...", "Loading...")}</p>
        ) : favorites.length === 0 ? (
          <>
            <p className="mt-2 text-ink-soft">{t("Încă nu ai nicio universitate la favorite. Pe pagina unei universități, apasă „♡ Adaugă la favorite”.", "You have no favourite universities yet. On a university page, press “♡ Add to favourites”.")}</p>
            <Link href="/universitati" className="mt-4 inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint">
              {t("Caută universități", "Search universities")}
            </Link>
          </>
        ) : (
          <ul className="mt-4 space-y-2" data-favorites>
            {favorites.map((f) => (
              <li key={f.universityId} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
                <span aria-hidden className="text-lg text-primary">♥</span>
                <Link href={`/universitati/${f.universityId}`} className="min-w-0 flex-1">
                  <span className="block font-extrabold text-ink underline decoration-primary/30 underline-offset-2">{f.name}</span>
                  <span className="block text-sm text-ink-soft">{f.place}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void removeFavorite({ universityId: f.universityId })}
                  aria-label={t(`Scoate ${f.name} de la favorite`, `Remove ${f.name} from favourites`)}
                  className="min-h-11 shrink-0 rounded-full px-3 text-sm font-bold text-ink-soft underline underline-offset-2 hover:text-primary-dark"
                >
                  {t("Scoate", "Remove")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line" aria-labelledby="cont-setari">
        <h2 id="cont-setari" className="text-2xl font-black tracking-tight text-ink">{t("Cont", "Account")}</h2>
        <div className="mt-3" data-name-box>
          <p className="text-sm font-extrabold uppercase tracking-wide text-primary">{t("Numele tău", "Your name")}</p>
          {nameDraft === null && me?.name ? (
            <p className="mt-1 flex flex-wrap items-center gap-3 text-ink">
              <span className="font-bold">{me.name}</span>
              <button type="button" onClick={() => setNameDraft(me.name ?? "")} className="min-h-11 font-bold text-primary underline underline-offset-2">
                {t("Schimbă", "Change")}
              </button>
            </p>
          ) : (
            <form onSubmit={saveName} className="mt-1 flex flex-wrap items-start gap-2" noValidate>
              <input
                aria-label={t("Numele tău complet", "Your full name")}
                autoComplete="name"
                maxLength={80}
                value={nameDraft ?? ""}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder={t("Prenume și nume", "First name and surname")}
                className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-transparent bg-paper px-4 text-ink ring-1 ring-line focus:border-primary focus:outline-none"
              />
              <button type="submit" className="min-h-11 rounded-full bg-primary px-5 font-black text-white hover:bg-primary-dark">
                {t("Salvează", "Save")}
              </button>
              {me?.name && (
                <button type="button" onClick={() => { setNameDraft(null); setNameError(null); }} className="min-h-11 rounded-full px-3 font-bold text-ink-soft underline underline-offset-2">
                  {t("Renunță", "Cancel")}
                </button>
              )}
              {!me?.name && !nameError && <p className="w-full text-sm text-ink-soft">{t("Nu avem încă numele tău. Scrie-l aici.", "We do not have your name yet. Write it here.")}</p>}
              {nameError && <p className="w-full text-sm font-bold text-primary-dark" role="alert">{nameError}</p>}
            </form>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              leaving.current = true;
              void signOut().then(() => router.replace(href("/")));
            }}
            className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint"
          >
            {t("Deconectare", "Sign out")}
          </button>
          {!confirming && (
            <button type="button" onClick={() => setConfirming(true)} className="min-h-11 rounded-full px-5 font-bold text-ink-soft underline underline-offset-2 hover:text-primary-dark">
              {t("Șterge contul", "Delete the account")}
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          {t("Vrei să vezi tot ce păstrăm despre contul tău?", "Do you want to see everything we keep about your account?")} <Link href="/cont/datele-mele" className="font-bold text-primary underline underline-offset-2">{t("Datele mele", "My data")}</Link> · <Link href="/confidentialitate" className="font-bold text-primary underline underline-offset-2">{t("Confidențialitate", "Privacy")}</Link>
        </p>
        {confirming && (
          <div className="mt-4 rounded-2xl bg-primary-tint p-4" role="alertdialog" aria-labelledby="sterge-titlu">
            <p id="sterge-titlu" className="font-extrabold text-primary-dark">{t("Sigur vrei să ștergi contul?", "Are you sure you want to delete the account?")}</p>
            <p className="mt-1 text-sm text-primary-dark">{t("Ștergem numele de utilizator, numele, adresa de email, parola, rezultatul salvat și universitățile favorite. Nu se poate anula.", "We delete your username, your name, your email address, your password, your saved result and your favourite universities. This cannot be undone.")}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={() => void deleteAccount()} className="min-h-11 rounded-full bg-primary px-5 font-black text-white hover:bg-primary-dark disabled:opacity-50">
                {busy ? t("Se șterge...", "Deleting...") : t("Da, șterge contul", "Yes, delete the account")}
              </button>
              <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-card">
                {t("Nu, păstrează-l", "No, keep it")}
              </button>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}
