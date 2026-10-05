// Keeps a questionnaire result on this device while the student signs in (the email link may open in another tab), so it can be saved to the account afterwards.
import type { StudyPlace } from "./types";

export type PendingResult = {
  profileId: string;
  where: StudyPlace;
  city?: string;
  choices: Record<string, number>;
  topDomains: string[];
};

const KEY = "unipath-pending-result";

export function setPendingResult(result: PendingResult): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // ignore: storage blocked
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
