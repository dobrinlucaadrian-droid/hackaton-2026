"use client";
// "← Înapoi la universități" on a university sheet: returns to the student's last search with its text and filters (plain search page when there is none).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lastSearchHref } from "@/lib/lastSearch";

export function BackToSearch() {
  const router = useRouter();
  return (
    <Link
      href="/universitati"
      onClick={(e) => {
        // The remembered search is read only on click, in the browser; without JavaScript the link opens the plain search.
        e.preventDefault();
        router.push(lastSearchHref());
      }}
      className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition hover:bg-primary-tint"
    >
      ← Înapoi la universități
    </Link>
  );
}
