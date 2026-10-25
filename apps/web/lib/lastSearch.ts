// Remembers the student's last university search (text, filters, how many results) in this browser tab, so the "back" button on a sheet returns to it.
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
export function lastSearchHref(): string {
  try {
    const q = window.sessionStorage.getItem(KEY);
    return q ? `/universitati?${q}` : "/universitati";
  } catch {
    return "/universitati";
  }
}
