"use client";
// The two choices under the welcome on the home page: make an account (opens the account window) or go on without one (scrolls to the big buttons). Signed-in visitors see a greeting with their name instead (the account is in the top menu).
import { useConvexAuth, useQuery } from "convex/react";
import Link from "./LocalLink";
import { useT } from "./LangProvider";
import { api } from "@/convex/_generated/api";
import { openSignIn } from "./WelcomeDialog";

const BIG = "inline-flex whitespace-nowrap min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-black transition active:scale-[0.98]";

export function WelcomeActions() {
  const t = useT();
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.account.me, isAuthenticated ? {} : "skip");
  if (isAuthenticated) {
    const who = me?.name ?? me?.username;
    return (
      <p className="mt-6 text-2xl font-black text-ink" role="status">
        <span aria-hidden>👋</span> {t("Bine ai revenit", "Welcome back")}{who ? `, ${who}` : ""}!
      </p>
    );
  }
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:flex-col md:items-start xl:flex-row">
      {/* The link works without JavaScript (sign-in page); with it, the account window opens here. */}
      <Link
        href="/conectare"
        onClick={(e) => {
          e.preventDefault();
          openSignIn();
        }}
        className={`${BIG} bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark`}
      >
        <span aria-hidden>👤</span> {t("Intră în cont", "Sign in")}
      </Link>
      <a href="#exploreaza" className={`${BIG} border-2 border-primary text-primary hover:bg-primary-tint`}>
        <span aria-hidden>👋</span> {t("Continui fără cont", "Continue without an account")}
      </a>
    </div>
  );
}
