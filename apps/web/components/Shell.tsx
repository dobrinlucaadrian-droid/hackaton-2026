// Page frame shared by all screens: header with the UniPath logo and a centered content column.
import Link from "next/link";
import type { ReactNode } from "react";

export function Shell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center px-5 py-5">
        <Link href="/" className="flex items-center gap-2 rounded-lg font-bold tracking-tight text-navy">
          <span
            aria-hidden
            className="h-11 w-11 shrink-0 bg-[url('/logo.jpg')] bg-[length:123px_123px] bg-[position:-40px_-24px] bg-no-repeat"
          />
          <span className="font-serif text-2xl">
            Uni<span className="text-burgundy">Path</span>
          </span>
        </Link>
      </header>
      <main className={`mx-auto w-full flex-1 px-5 pb-16 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>{children}</main>
    </div>
  );
}

export function Notice({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="mt-10 rounded-3xl bg-cream p-8 text-center shadow-sm ring-1 ring-line">
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="mt-3 text-navy-soft">{text}</p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-2xl bg-burgundy px-6 py-3 font-semibold text-cream hover:bg-burgundy-dark"
      >
        {cta}
      </Link>
    </div>
  );
}
