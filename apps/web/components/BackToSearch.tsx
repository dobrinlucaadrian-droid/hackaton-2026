"use client";
// "← Înapoi la universități" on a university sheet: returns to the student's last search with its text and filters (plain search page when there is none).
import { useRouter } from "next/navigation";
import { lastSearchHref } from "@/lib/lastSearch";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";

export function BackToSearch() {
  const router = useRouter();
  const lang = useLang();
  const t = useT();
  return (
    <Link
      href="/universitati"
      onClick={(e) => {
        // The remembered search is read only on click, in the browser; without JavaScript the link opens the plain search.
        e.preventDefault();
        router.push(lastSearchHref(lang));
      }}
      className="inline-flex min-h-11 items-center gap-2 font-extrabold text-primary transition hover:text-primary-dark"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
      {t("Înapoi la universități", "Back to universities")}
    </Link>
  );
}
