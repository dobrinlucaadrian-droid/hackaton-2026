// The one rule for a person's full name, used by the sign-in form, the account page and the server.

export const NAME_MAX = 80;

/** Trims a full name and collapses repeated spaces; returns null when it is not a usable name. */
export function cleanName(raw: string): string | null {
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length < 3 || name.length > NAME_MAX) return null;
  if (!/\p{L}/u.test(name) || /[<>@\\/{}[\]|]/.test(name) || /https?:/i.test(name)) return null;
  return name;
}
