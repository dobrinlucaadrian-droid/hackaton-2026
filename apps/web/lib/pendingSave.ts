// Keeps a questionnaire result or a hearted university on this device while the student signs in or makes an account, so it can be saved to the account afterwards.
import type { StudyPlace } from "./types";

export type PendingResult = {
  profileId: string;
  where: StudyPlace;
  cities?: string[];
  choices: Record<string, number>;
  topDomains: string[];
};

const KEY = "findmyuni-pending-result";

export function setPendingResult(result: PendingResult): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // ignore: storage blocked
  }
}

/** A university the student hearted before signing in; added to the favourites once the account is ready. */
export type PendingFavorite = { universityId: string; name: string; place: string };

const FAVORITE_KEY = "findmyuni-pending-favorite";

export function setPendingFavorite(favorite: PendingFavorite): void {
  try {
    window.localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorite));
  } catch {
    // ignore: storage blocked
  }
}

export function takePendingFavorite(): PendingFavorite | null {
  try {
    const raw = window.localStorage.getItem(FAVORITE_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(FAVORITE_KEY);
    const f = JSON.parse(raw) as PendingFavorite;
    if (typeof f?.universityId !== "string" || typeof f.name !== "string" || typeof f.place !== "string") return null;
    return f;
  } catch {
    return null;
  }
}

export function takePendingResult(): PendingResult | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    window.localStorage.removeItem(KEY);
    const r = JSON.parse(raw) as PendingResult;
    if (typeof r?.profileId !== "string" || !["ro", "abroad", "any"].includes(r.where) || !Array.isArray(r.topDomains)) return null;
    return r;
  } catch {
    return null;
  }
}
