"use client";
// Gives every component in the browser the language of the page (ro or en), set once by the root layout from the address.
import { createContext, useContext } from "react";
import { DEFAULT_LANG, localHref, tr, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

/** Builds links in the page's language: const href = useHref(); href("/universitati"). */
export function useHref(): (path: string) => string {
  const lang = useLang();
  return (path) => localHref(lang, path);
}

/** Texts in the page's language, in the browser: const t = useT(); t("Universități", "Universities"). */
export function useT(): (ro: string, en: string) => string {
  return tr(useLang());
}
