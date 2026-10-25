"use client";
// Under the result, in the page language: signed-in students save it with one button; the others see a card with the benefits of an account, which opens the account window on "new account" and saves the result once the account exists.
import { useConvexAuth, useMutation } from "convex/react";
import Link from "@/components/LocalLink";
import { useT } from "@/components/LangProvider";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { setPendingResult, type PendingResult } from "@/lib/pendingSave";
import { openSignIn } from "./WelcomeDialog";

// Only what the site really does today.
const BENEFITS_RO = [
  ["💾", "Îți păstrezi rezultatul", "Nu se pierde când închizi pagina: îl găsești oricând în „Contul meu”."],
  ["📱", "Îl vezi de pe orice dispozitiv", "Intri de pe telefon sau de pe calculator și ai același rezultat."],
  ["⚡", "Gratuit și rapid", "Durează sub un minut: nume, parolă și email (emailul doar pentru codul de confirmare)."],
] as const;

const BENEFITS_EN = [
  ["💾", "You keep your result", "It is not lost when you close the page: you can always find it in “My account”."],
  ["📱", "See it on any device", "Sign in from your phone or your computer and you have the same result."],
  ["⚡", "Free and quick", "It takes under a minute: username, password and email (the email only for the confirmation code)."],
] as const;

export function SaveResult({ result }: { result: PendingResult }) {
  const t = useT();
  const BENEFITS = t("ro", "en") === "en" ? BENEFITS_EN : BENEFITS_RO;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const save = useMutation(api.results.save);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // The result waits on this device; the account page saves it as soon as the new account is signed in.
  function startAccount(startWith: "signIn" | "signUp") {
    setPendingResult(result);
    openSignIn(startWith);
  }

  async function onClick() {
    setState("saving");
    try {
      await save(result);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  if (!isLoading && !isAuthenticated) {
    return (
      <section aria-labelledby="cont-titlu" className="rise mx-auto mt-8 max-w-2xl rounded-3xl bg-primary-tint p-6 shadow-sm ring-1 ring-primary/20 sm:p-8" data-save-result>
        <h2 id="cont-titlu" className="text-center text-2xl font-black tracking-tight text-ink sm:text-3xl">{t("Nu-ți pierde rezultatul", "Do not lose your result")}</h2>
        <p className="mt-2 text-center text-ink-soft">{t("Fă-ți un cont gratuit și rezultatul se salvează singur în el.", "Make a free account and your result is saved in it automatically.")}</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {BENEFITS.map(([icon, title, text]) => (
            <li key={title} className="rounded-2xl bg-card p-4 text-center ring-1 ring-line">
              <span aria-hidden className="text-3xl">{icon}</span>
              <p className="mt-1 font-black text-ink">{title}</p>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => startAccount("signUp")}
            className="min-h-12 rounded-2xl bg-primary px-8 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
          >
            {t("Fă-mi cont și salvează", "Create my account and save")}
          </button>
          <p className="mt-3 text-sm text-ink-soft">
            {t("Ai deja cont?", "Already have an account?")}{" "}
            <button type="button" onClick={() => startAccount("signIn")} className="min-h-11 font-bold text-primary underline underline-offset-2">
              {t("Intră și salvează", "Sign in and save")}
            </button>
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-3xl bg-card p-5 text-center shadow-sm ring-1 ring-line" data-save-result>
      {state === "saved" ? (
        <p className="font-bold text-teal-ink" role="status">
          {t("Rezultatul e salvat în contul tău.", "Your result is saved in your account.")}{" "}
          <Link href="/cont" className="text-primary underline underline-offset-2">{t("Vezi contul meu →", "See my account →")}</Link>
        </p>
      ) : (
        <>
          <p className="text-ink-soft">
            {t("Păstrează rezultatul ca să-l găsești și altă dată.", "Keep the result so you can find it another time.")}
          </p>
          <button
            type="button"
            onClick={() => void onClick()}
            disabled={isLoading || state === "saving"}
            className="mt-3 min-h-12 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-50"
          >
            {state === "saving" ? t("Se salvează...", "Saving...") : t("Salvează în contul meu", "Save to my account")}
          </button>
          {state === "error" && (
            <p className="mt-2 text-sm font-bold text-primary-dark" role="alert">{t("Nu am putut salva. Încearcă din nou.", "We could not save it. Try again.")}</p>
          )}
        </>
      )}
    </div>
  );
}
