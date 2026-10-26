"use client";
// Header navigation links with the current page highlighted (centred on phones), the RO / EN language switch; signed-in visitors also get "Contul meu" (signing in starts from the home page).
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchLangHref } from "@/lib/i18n";
import { useHref, useLang, useT } from "./LangProvider";

export function NavLinks() {
  const lang = useLang();
  const t = useT();
  const href = useHref();
  const full = usePathname();
  // the page's address without the /en in front, so both languages highlight the same link
  const path = full === "/en" ? "/" : full.startsWith("/en/") ? full.slice(3) : full;
  const { isAuthenticated } = useConvexAuth();
  const links: [string, string][] = [
    ["/", t("Acasă", "Home")],
    ["/specializari", t("Specializări", "Fields")],
    ["/universitati", t("Universități", "Universities")],
    ["/ghiduri", t("Ghiduri", "Guides")],
    ["/test", t("Chestionar", "Quiz")],
    ["/studenti", t("Studenți", "Students")],
    ...(isAuthenticated ? ([["/cont", t("Contul meu", "My account")]] as [string, string][]) : []),
  ];
  const other = lang === "en" ? "ro" : "en";
  // On a phone the links wrap onto a second row instead of hiding off-screen to the right.
  return (
    <nav aria-label={t("Navigare principală", "Main navigation")} className="-mx-1 w-full sm:w-auto">
      <ul className="flex flex-wrap items-center justify-center gap-1 px-1 sm:justify-start">
        {links.map(([to, label]) => {
          const on = to === "/" ? path === "/" : path === to || path.startsWith(`${to}/`);
          return (
            <li key={to}>
              <Link
                href={href(to)}
                prefetch
                aria-current={on ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold transition sm:px-4 sm:text-base ${
                  on ? "bg-primary text-white" : "text-ink-soft hover:bg-primary-tint hover:text-primary-dark"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={switchLangHref(full, other)}
            hrefLang={other}
            lang={other}
            aria-label={other === "en" ? "English version" : "Versiunea în română"}
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-black text-primary ring-1 ring-primary/40 transition hover:bg-primary-tint"
          >
            {other === "en" ? "EN" : "RO"}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
