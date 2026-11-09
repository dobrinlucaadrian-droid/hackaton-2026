"use client";
// The two choices under the welcome on the home page: make an account (opens the account window) or go on without one (opens the questionnaire start page), with a handwritten "it works without an account" note. Signed-in visitors see a greeting with their name instead (the account is in the top menu).
import { useConvexAuth, useQuery } from "convex/react";
import Link from "./LocalLink";
import { useT } from "./LangProvider";
import { api } from "@/convex/_generated/api";
import { openSignIn } from "./WelcomeDialog";

const BIG = "inline-flex whitespace-nowrap min-h-14 items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-lg font-extrabold transition active:translate-y-px active:scale-[0.98]";

export function WelcomeActions() {
  const t = useT();
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");
  if (isAuthenticated) {
    const who = me?.name ?? me?.username;
    return (
      <p className="mt-6 text-2xl font-extrabold text-ink" role="status">
        {t("Bine ai revenit", "Welcome back")}{who ? `, ${who}` : ""}!
      </p>
    );
  }
  return (
    <div className="mt-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:flex-col md:items-start xl:flex-row">
        {/* The link works without JavaScript (sign-in page); with it, the account window opens here. */}
        <Link
          href="/conectare"
          onClick={(e) => {
            e.preventDefault();
            openSignIn();
          }}
          className={`${BIG} bg-primary text-white shadow-[0_3px_0_var(--color-primary-dark),0_14px_26px_-12px_rgb(97_18_45_/_0.6)] hover:-translate-y-0.5 hover:bg-primary-dark`}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </svg>
          {t("Intră în cont", "Sign in")}
        </Link>
        <Link href="/test" className={`${BIG} border-[2.5px] border-primary bg-card text-primary hover:-translate-y-0.5 hover:bg-primary-tint`}>
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          {t("Continui fără cont", "Continue without an account")}
        </Link>
      </div>
      <p aria-hidden className="hand mt-2 hidden items-start gap-1 pl-2 text-2xl leading-none text-primary md:flex">
        <svg viewBox="0 0 46 40" className="h-9 w-11 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M40 36C24 36 10 28 8 8M3 14l5-7 6 6" />
        </svg>
        {t("merge și fără cont!", "works without one too!")}
      </p>
    </div>
  );
}
