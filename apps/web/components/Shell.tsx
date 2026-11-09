"use client";
// Page frame shared by all screens: header with the FindMyUni logo, faint pen doodles behind the page, a centered content column and a footer with the privacy link, in the page language.
import type { ReactNode } from "react";
import { Doodles } from "./Doodles";
import { useT } from "./LangProvider";
import Link from "./LocalLink";
import { NavLinks } from "./NavLinks";

export function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const t = useT();
  return (
    <div className="relative isolate flex flex-1 flex-col">
      <Doodles />
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-lg text-2xl font-extrabold tracking-tight text-ink">
          <span
            aria-hidden
            className="h-10 w-10 shrink-0 bg-[url('/logo-cap.png')] bg-contain bg-center bg-no-repeat"
          />
          <span>
            <span className="text-primary">FindMy</span>
            <span className="text-[#a8761a]">Uni</span>
          </span>
        </Link>
        <NavLinks />
      </header>
      <main className={`mx-auto w-full flex-1 px-5 pb-16 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>{children}</main>
      <footer className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-x-5 px-5 pb-8 text-sm text-ink-soft">
        <Link href="/confidentialitate" className="inline-flex min-h-11 items-center font-bold underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
          {t("Confidențialitate", "Privacy")}
        </Link>
      </footer>
    </div>
  );
}

export function Notice({ title, text, href, cta, art }: { title: string; text: string; href: string; cta: string; art?: ReactNode }) {
  return (
    <div className="rise drawn mt-10 rounded-3xl bg-card p-8 text-center">
      {art && <div className="mx-auto mb-2 w-full max-w-xs">{art}</div>}
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 text-ink-soft">{text}</p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 font-extrabold text-white shadow-[0_3px_0_var(--color-primary-dark)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
      >
        {cta}
      </Link>
    </div>
  );
}
