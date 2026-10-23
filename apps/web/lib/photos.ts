// Freely licensed photos of the universities (Wikimedia Commons, saved small in public/photos by scripts/data/photos.mjs), with the author and licence the page must show. Server only.
import photosJson from "../data/photos.json";

export type Photo = { id: string; file: string; author: string; license: string; licenseUrl: string | null; source: string };

const byId = new Map((photosJson as Photo[]).map((p) => [p.id, p]));

/** The photo of a university sheet, if one was found. */
export function photoOf(universityId: string): Photo | undefined {
  return byId.get(universityId);
}
