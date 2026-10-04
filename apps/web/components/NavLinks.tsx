"use client";
// Header navigation links with the current page highlighted.
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/", "Acasă"],
  ["/specializari", "Specializări"],
  ["/universitati", "Universități"],
  ["/test", "Test"],
  ["/studenti", "Studenți"],
] as const;

export function NavLinks() {
  const path = usePathname();
  return (
    <nav aria-label="Navigare principală" className="-mx-1 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex items-center gap-1 whitespace-nowrap px-1">
        {LINKS.map(([href, label]) => {
          const on = href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
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
