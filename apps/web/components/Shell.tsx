// Page frame shared by all screens: header with the UniPath logo, a centered content column and a footer with the privacy link.
import Link from "next/link";
import type { ReactNode } from "react";
import { NavLinks } from "./NavLinks";

export function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="relative flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg font-bold tracking-tight text-ink">
          <span
            aria-hidden
            className="h-11 w-11 shrink-0 bg-[url('/logo.png')] bg-[length:123px_123px] bg-[position:-40px_-24px] bg-no-repeat"
          />
          <span className="font-serif text-2xl">
            Uni<span className="text-primary">Path</span>
          </span>
        </Link>
        <NavLinks />
      </header>
      <main className={`mx-auto w-full flex-1 px-5 pb-16 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>{children}</main>
      <footer className="mx-auto w-full max-w-5xl px-5 pb-8 text-center text-sm text-ink-soft">
        <Link href="/confidentialitate" className="inline-flex min-h-11 items-center font-bold underline decoration-primary/40 underline-offset-2 hover:text-primary-dark">
          Confidențialitate
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
