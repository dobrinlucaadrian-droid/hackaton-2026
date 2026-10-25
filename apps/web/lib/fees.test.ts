// Tests the exact tuition data: each entry belongs to a real sheet, has a known currency, a sane range, an academic year and an official link, and is written the way the sheet shows it.
import { describe, expect, it } from "vitest";
import feesJson from "../data/fees.json";
import { EUR_PER, feeText, type Fee } from "./fees";
import { universities } from "./sheets";

const fees = feesJson as Fee[];
const ids = new Set(universities.map((u) => u.id));

describe("tuition data", () => {
  it("one entry per real sheet, complete and sane", () => {
    const seen = new Set<string>();
    for (const f of fees) {
      expect(ids.has(f.id), f.id).toBe(true);
      expect(seen.has(f.id), `${f.id} twice`).toBe(false);
      seen.add(f.id);
      expect(EUR_PER[f.currency], `${f.id} currency`).toBeDefined();
      expect(Number.isInteger(f.min) && Number.isInteger(f.max) && f.min >= 0 && f.min <= f.max, `${f.id} range`).toBe(true);
      expect(f.year, f.id).toMatch(/^20\d\d(\/\d\d)?$/); // academic year, or a calendar year (Australia, Asia)
      expect(f.url, f.id).toMatch(/^https?:\/\//);
      if (f.budgetFree) expect(f.currency, f.id).toBe("RON");
    }
  });
});

describe("tuition text", () => {
  it("euro without conversion, other currencies with an approximate euro value", () => {
    expect(feeText({ currency: "EUR", min: 1100, max: 1300 })).toBe("1.100–1.300 €/an");
    expect(feeText({ currency: "GBP", min: 24730, max: 24730 })).toBe("24.730 lire sterline/an (aprox. 28.900 €)");
    expect(feeText({ currency: "EUR", min: 0, max: 0 })).toBe("fără taxă (0 €)");
  });
});

describe("tuition text in English", () => {
  it("writes currencies and the approximate euro value in English", () => {
    expect(feeText({ currency: "EUR", min: 1100, max: 1300 }, "en")).toBe("€1,100–1,300/year");
    expect(feeText({ currency: "GBP", min: 24730, max: 24730 }, "en")).toBe("24,730 pounds sterling/year (approx. €28,900)");
    expect(feeText({ currency: "EUR", min: 0, max: 0 }, "en")).toBe("no tuition fee (€0)");
  });
});
