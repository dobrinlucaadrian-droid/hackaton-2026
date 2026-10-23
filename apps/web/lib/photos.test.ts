// Tests the university photos: each one belongs to a real sheet, its file is in public/photos, its licence is free (no NC/ND) and it carries an author and a link to Wikimedia Commons.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import photos from "../data/photos.json";
import { universities } from "./sheets";

const ids = new Set(universities.map((u) => u.id));

describe("university photos", () => {
  it("are freely licensed, credited and present on disk", () => {
    expect(photos.length).toBeGreaterThan(0);
    for (const p of photos) {
      expect(ids.has(p.id), p.id).toBe(true);
      expect(p.file).toBe(`/photos/${p.id}.webp`);
      expect(existsSync(join(__dirname, "..", "public", p.file)), p.file).toBe(true);
      expect(p.license, p.id).toMatch(/^(cc0|cc[- ]by|public domain|pd)/i);
      expect(p.license, p.id).not.toMatch(/\b(nc|nd)\b/i);
      expect(p.author.length, p.id).toBeGreaterThan(0);
      expect(p.source, p.id).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });

  it("are listed once each", () => {
    expect(new Set(photos.map((p) => p.id)).size).toBe(photos.length);
  });
});
