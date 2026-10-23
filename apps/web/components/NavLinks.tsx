"use client";
// Header navigation links with the current page highlighted; signed-in visitors also get "Contul meu" (signing in starts from the home page).
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/", "Acasă"],
  ["/specializari", "Specializări"],
  ["/universitati", "Universități"],
  ["/test", "Chestionar"],
  ["/studenti", "Studenți"],
] as const;

export function NavLinks() {
  const path = usePathname();
  const { isAuthenticated } = useConvexAuth();
  // On a phone the links wrap onto a second row instead of hiding off-screen to the right.
  return (
    <nav aria-label="Navigare principală" className="-mx-1 w-full sm:w-auto">
      <ul className="flex flex-wrap items-center gap-1 px-1">
        {[...LINKS, ...(isAuthenticated ? ([["/cont", "Contul meu"]] as const) : [])].map(([href, label]) => {
          const on = href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
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
      </ul>
    </nav>
  );
}
