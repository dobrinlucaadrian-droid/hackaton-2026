// Romanian cities that have at least one university sheet, the ones with most universities first. A small generated list (scripts/data/sheets-index.mjs), so the questionnaire does not load the university data.
import { cityName } from "./i18n-data";
import type { Lang } from "./i18n";
import citiesJson from "../data/ro-cities.json";

export function romanianCities(): string[] {
  return citiesJson as string[];
}

/** "Iași", "Iași și Cluj-Napoca", "Iași, Cluj-Napoca și Timișoara" (English: "Iași and Cluj-Napoca"). */
export function cityList(cities: string[], lang: Lang = "ro"): string {
  const names = cities.map((c) => cityName(c, lang));
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} ${lang === "en" ? "and" : "și"} ${names[names.length - 1]}`;
}
