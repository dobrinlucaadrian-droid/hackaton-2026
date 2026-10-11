// Builds the small files the browser needs from the full university sheets: apps/web/data/universities-index.json (each sheet without its long texts,
// for search, filters and result cards) and apps/web/data/ro-cities.json (Romanian cities with at least one sheet). Run after the sheets change:
//   node scripts/data/sheets-index.mjs
// A test (apps/web/lib/universities.data.test.ts) fails when these files no longer match the sheets.
import { readFileSync, writeFileSync } from "node:fs";

const dir = new URL("../../apps/web/data/", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dir), "utf8"));

/** The long texts shown only on a university's own page; everything else stays in the index. */
export const LONG_TEXT_FIELDS = ["about", "budgetNote", "admission", "scholarshipsNote", "dormsNote", "pros", "cons"];

export function summaryOf(sheet) {
  const out = { ...sheet };
  for (const key of LONG_TEXT_FIELDS) delete out[key];
  return out;
}

/** Romanian cities that have at least one university sheet, the ones with most universities first. */
export function romanianCitiesOf(sheets) {
  const count = new Map();
  for (const u of sheets) if (u.region === "ro") count.set(u.city, (count.get(u.city) ?? 0) + 1);
  return [...count.keys()].sort((a, b) => count.get(b) - count.get(a) || a.localeCompare(b, "ro"));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const sheets = [...read("universities-ro.json"), ...read("universities-abroad.json")];
  // One sheet per line: small on disk and readable in a diff.
  writeFileSync(new URL("universities-index.json", dir), "[\n" + sheets.map((u) => JSON.stringify(summaryOf(u))).join(",\n") + "\n]\n");
  writeFileSync(new URL("ro-cities.json", dir), JSON.stringify(romanianCitiesOf(sheets), null, 1) + "\n");
  console.log(`index: ${sheets.length} sheets, ${romanianCitiesOf(sheets).length} Romanian cities`);
}
