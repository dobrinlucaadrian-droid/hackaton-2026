// Remembers the student's last university search (text, filters, how many results) in this browser tab, so the "back" button on a sheet returns to it (in the page language).
import { localHref, type Lang } from "./i18n";

const KEY = "findmyuni-last-search";

/** Called by the search page with its current address query. */
export function rememberSearch(query: string): void {
  try {
    window.sessionStorage.setItem(KEY, query);
  } catch {
    // storage blocked: the back button then opens the empty search
  }
}

/** The address of the last search, or the plain search page. */
export function lastSearchHref(lang: Lang = "ro"): string {
  try {
    const q = window.sessionStorage.getItem(KEY);
    return localHref(lang, q ? `/universitati?${q}` : "/universitati");
  } catch {
    return localHref(lang, "/universitati");
  }
}
