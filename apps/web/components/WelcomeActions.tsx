"use client";
// The two choices under the welcome on the home page: make an account (opens the account window) or go on without one (scrolls to the big buttons). Signed-in visitors see "Contul meu" instead.
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { openSignIn } from "./WelcomeDialog";

const BIG = "inline-flex whitespace-nowrap min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-black transition active:scale-[0.98]";

export function WelcomeActions() {
  const { isAuthenticated } = useConvexAuth();
  if (isAuthenticated) {
    return (
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:flex-col md:items-start xl:flex-row">
        <Link href="/cont" className={`${BIG} bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark`}>
          <span aria-hidden>👤</span> Contul meu
        </Link>
      </div>
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
        <span aria-hidden>👤</span> Intră în cont
      </Link>
      <a href="#exploreaza" className={`${BIG} border-2 border-primary text-primary hover:bg-primary-tint`}>
        <span aria-hidden>👋</span> Continui fără cont
      </a>
    </div>
  );
}
