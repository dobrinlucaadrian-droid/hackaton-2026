// Keeps the student's answers (and optional activities with photos) in sessionStorage between pages (safe on the server).
import { ACTIVITY_AREAS, ACTIVITY_KINDS, ACTIVITY_LEVELS, MAX_ACTIVITIES } from "./activities";
import type { Activity, Answers, StudyPlace } from "./types";

export type StoredActivity = Activity & { photo?: string };
export type Draft = {
  profileId?: string;
  where?: StudyPlace;
  city?: string;
  choices: Record<string, number>;
  activities?: StoredActivity[];
};

const KEY = "unipath-draft";

function cleanActivities(raw: unknown): StoredActivity[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredActivity[] = [];
  for (const a of raw as Partial<StoredActivity>[]) {
    if (!a || !ACTIVITY_KINDS.some((k) => k.id === a.kind)) continue;
    if (!ACTIVITY_AREAS.some((x) => x.id === a.areaId)) continue;
    if (a.level !== undefined && !ACTIVITY_LEVELS.some((l) => l.id === a.level)) continue;
    const item: StoredActivity = { kind: a.kind!, areaId: a.areaId! };
    if (a.level) item.level = a.level;
    if (typeof a.name === "string" && a.name.trim()) item.name = a.name.slice(0, 60);
    if (typeof a.photo === "string" && a.photo.startsWith("data:image/")) item.photo = a.photo;
    out.push(item);
    if (out.length >= MAX_ACTIVITIES) break;
  }
  return out;
}

export function loadDraft(): Draft {
  try {
    const raw = typeof window === "undefined" ? null : window.sessionStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Draft;
      return {
        profileId: d.profileId,
        where: d.where,
        ...(typeof d.city === "string" && d.city ? { city: d.city } : {}),
        choices: d.choices ?? {},
        activities: cleanActivities(d.activities),
      };
    }
  } catch {
    // ignore: storage blocked or corrupted
  }
  return { choices: {}, activities: [] };
}

/** Returns false when the browser refused to store the draft (for example, too big). */
export function saveDraft(draft: Draft): boolean {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
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
  const activities = d.activities ?? [];
  return {
    profileId: d.profileId,
    where: d.where,
    ...(d.city && d.where !== "abroad" ? { city: d.city } : {}),
    choices: d.choices,
    ...(activities.length ? { activities } : {}),
  };
}

/** Shrinks a picked image in the browser to at most ~480px (JPEG, quality 0.7) and returns a data URL. */
export function shrinkImage(file: File, maxSide = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) {
        reject(new Error("no canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}
