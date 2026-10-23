// Tests the search suggestions: they start at 2 letters, ignore diacritics, put places first and lead universities to their sheets.
import { describe, expect, it } from "vitest";
import { suggest } from "./universities";

describe("search suggestions", () => {
  it("wait for 2 letters", () => {
    expect(suggest("i")).toEqual([]);
  });

  it("find a city without diacritics, then its universities", () => {
    const s = suggest("iasi");
    expect(s[0]).toMatchObject({ label: "Iași", query: "Iași" });
    expect(s.some((x) => x.href === "/universitati/uaic")).toBe(true);
  });

  it("find universities by the start of a word, at most 6 plus 2 places", () => {
    const s = suggest("politehnica");
    expect(s.filter((x) => x.href).length).toBeGreaterThan(0);
    expect(s.filter((x) => x.href).length).toBeLessThanOrEqual(6);
    expect(s.filter((x) => !x.href).length).toBeLessThanOrEqual(2);
  });

  it("find a country", () => {
    expect(suggest("germ").some((x) => x.label === "Germania" && !x.href)).toBe(true);
  });
});
