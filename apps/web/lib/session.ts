// Keeps the student's answers in sessionStorage between pages (safe on the server).
import type { Answers, StudyPlace } from "./types";

export type Draft = { profileId?: string; where?: StudyPlace; choices: Record<string, number> };

const KEY = "unipath-draft";

export function loadDraft(): Draft {
  try {
    const raw = typeof window === "undefined" ? null : window.sessionStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Draft;
      return { profileId: d.profileId, where: d.where, choices: d.choices ?? {} };
    }
  } catch {
    // ignore: storage blocked or corrupted
  }
  return { choices: {} };
}

export function saveDraft(draft: Draft): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // ignore: storage blocked
  }
}

export function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Returns complete answers, or null when something is missing. */
export function toAnswers(d: Draft): Answers | null {
  if (!d.profileId || !d.where) return null;
  return { profileId: d.profileId, where: d.where, choices: d.choices };
}
