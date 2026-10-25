"use client";
// "Trimite" on a university sheet: on a phone it opens the phone's own share menu (WhatsApp, Instagram, messages …); where that menu does not exist, it copies the link.
import { useState } from "react";
import { useHref, useT } from "./LangProvider";

export function ShareButton({ title, text, path }: { title: string; text: string; path: string }) {
  const t = useT();
  const href = useHref();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(href(path), window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        // closing the menu is not an error; anything else falls back to copying
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t("Copiază linkul:", "Copy the link:"), url);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-primary px-5 font-bold text-primary transition hover:bg-primary-tint"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </svg>
      <span aria-live="polite">{copied ? t("Link copiat ✓", "Link copied ✓") : t("Trimite", "Share")}</span>
    </button>
  );
}
