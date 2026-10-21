// The site's one official address and a helper that trims a text to the length search engines show under a result.
export const SITE_URL = "https://findmyuni.ro";

/** A text cut to about `max` characters at a word boundary, for meta descriptions. */
export function clip(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}
