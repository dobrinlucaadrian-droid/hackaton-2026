"use client";
// Page frame shared by all screens: header with the FindMyUni logo, a centered content column and a footer with the TikTok and Instagram links and the privacy link, in the page language.
import type { ReactNode } from "react";
import { useT } from "./LangProvider";
import Link from "./LocalLink";
import { NavLinks } from "./NavLinks";

// The TikTok and Instagram links in the footer (the site's own accounts, opened in a new tab).
const social = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-bold ring-1 ring-line hover:text-primary-dark hover:ring-primary/50";

export function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const t = useT();
  return (
    <div className="relative flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg font-bold tracking-tight text-ink">
          <span
            aria-hidden
            className="h-11 w-11 shrink-0 bg-[url('/logo-cap.png')] bg-contain bg-center bg-no-repeat"
          />
          <span className="font-serif text-2xl">
            FindMy<span className="text-primary">Uni</span>
          </span>
        </Link>
        <NavLinks />
      </header>
      <main className={`mx-auto w-full flex-1 px-5 pb-16 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>{children}</main>
      <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 pb-8 text-center text-sm text-ink-soft">
        <a href="https://www.tiktok.com/@findmyuni.ro" target="_blank" rel="noopener noreferrer" className={social}>
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M16.6 2h-3.3v13.1a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V8.9a6.3 6.3 0 1 0 5.4 6.2V8.4a7.9 7.9 0 0 0 4.6 1.5V6.6a4.6 4.6 0 0 1-4.6-4.6Z" /></svg>
          TikTok
        </a>
        <a href="https://www.instagram.com/findmyuni.ro/" target="_blank" rel="noopener noreferrer" className={social}>
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
          Instagram
        </a>
        <span aria-hidden>·</span>
        <Link href="/confidentialitate" className="inline-flex min-h-11 items-center font-bold underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
          {t("Confidențialitate", "Privacy")}
        </Link>
      </footer>
    </div>
  );
}

export function Notice({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="rise mt-10 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line">
      <h1 className="text-3xl font-black tracking-tight text-ink">{title}</h1>
      <p className="mt-3 text-ink-soft">{text}</p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
      >
        {cta}
      </Link>
    </div>
  );
}
