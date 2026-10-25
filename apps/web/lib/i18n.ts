// The site's two languages: Romanian at the plain addresses (/universitati) and English under /en (/en/universitati), plus the helper that builds a link in the current language.
export const LANGS = ["ro", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ro";

export function hasLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** An address inside the site in the given language: localHref("en", "/universitati") → "/en/universitati". */
export function localHref(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG || !path.startsWith("/")) return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** The same page in the other language, from the address the visitor is on now. */
export function switchLangHref(pathname: string, to: Lang): string {
  const plain = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return localHref(to, plain);
}

/** Picks the text of the page's language: const t = tr(lang); t("Universități", "Universities"). */
export function tr(lang: Lang): (ro: string, en: string) => string {
  return (ro, en) => (lang === "en" ? en : ro);
}
