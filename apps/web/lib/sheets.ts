// The full university sheets, with all their long texts. Large: import it only from server code (the university page) and from tests, never from a component that runs in the browser — those use lib/universities.ts.
import universitiesAbroadJson from "../data/universities-abroad.json";
import universitiesRoJson from "../data/universities-ro.json";
import type { University } from "./types";

export const universities = [...(universitiesRoJson as University[]), ...(universitiesAbroadJson as University[])];

export function universityById(id: string): University | undefined {
  return universities.find((u) => u.id === id);
}
