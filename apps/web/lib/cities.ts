// Romanian cities that have at least one university sheet, the ones with most universities first. A small generated list (scripts/data/sheets-index.mjs), so the questionnaire does not load the university data.
import citiesJson from "../data/ro-cities.json";

export function romanianCities(): string[] {
  return citiesJson as string[];
}

/** "Iași", "Iași și Cluj-Napoca", "Iași, Cluj-Napoca și Timișoara". */
export function cityList(cities: string[]): string {
  if (cities.length <= 1) return cities[0] ?? "";
  return `${cities.slice(0, -1).join(", ")} și ${cities[cities.length - 1]}`;
}
