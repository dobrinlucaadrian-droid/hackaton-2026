// The rules for a username and a password, used by the account forms and by the server, so both check exactly the same thing.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** Lower-cases and trims a username; returns null unless it is 3-20 characters of letters a-z, digits, dot or underscore, starting with a letter or digit. */
export function cleanUsername(raw: string): string | null {
  const name = raw.trim().toLowerCase();
  return new RegExp(`^[a-z0-9][a-z0-9._]{${USERNAME_MIN - 1},${USERNAME_MAX - 1}}$`).test(name) ? name : null;
}

/** A password is accepted when it has at least 8 characters (and is not absurdly long). */
export function validPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX;
}

/** Trims and lower-cases an email address; returns null when it does not look like one. */
export function cleanEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  return email.length <= 120 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null;
}
