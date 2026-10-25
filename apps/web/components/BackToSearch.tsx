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
      className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint"
    >
      {t("← Înapoi la universități", "← Back to universities")}
    </Link>
  );
}
