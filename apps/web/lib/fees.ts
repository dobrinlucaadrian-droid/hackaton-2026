// Exact yearly tuition of the university sheets (data/fees.json), each with its academic year and the official page it comes from; amounts in the university's own currency plus an approximate value in euro. Server only.
import feesJson from "../data/fees.json";

export type Fee = {
  id: string;
  currency: string;
  min: number;
  max: number;
  year: string;
  url: string;
  note?: string;
  /** Romanian state universities: 0 on state-funded places; min–max is the fee for paid places. */
  budgetFree?: boolean;
};

/** Approximate euro value of one unit of each currency (rounded rates, autumn 2026); only for the "aprox." figure. */
export const EUR_PER: Record<string, number> = {
  EUR: 1,
  RON: 0.2,
  MDL: 0.051,
  GBP: 1.17,
  USD: 0.88,
  CHF: 1.05,
  DKK: 0.134,
  SEK: 0.09,
  NOK: 0.086,
  PLN: 0.235,
  CZK: 0.04,
  CAD: 0.64,
  AUD: 0.58,
  KRW: 0.00067,
  HKD: 0.113,
  SGD: 0.68,
};

const NAME: Record<string, string> = {
  EUR: "€",
  RON: "lei",
  MDL: "lei moldovenești",
  GBP: "lire sterline",
  USD: "dolari americani",
  CHF: "franci elvețieni",
  DKK: "coroane daneze",
  SEK: "coroane suedeze",
  NOK: "coroane norvegiene",
  PLN: "zloți",
  CZK: "coroane cehe",
  CAD: "dolari canadieni",
  AUD: "dolari australieni",
  KRW: "woni coreeni",
  HKD: "dolari din Hong Kong",
  SGD: "dolari din Singapore",
};

const byId = new Map((feesJson as Fee[]).map((f) => [f.id, f]));

/** The confirmed yearly tuition of a sheet, if one was found on an official page. */
export function feeOf(universityId: string): Fee | undefined {
  return byId.get(universityId);
}

const num = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const range = (a: number, b: number) => (a === b ? num(a) : `${num(a)}–${num(b)}`);
// euro rounded so it does not look more exact than the rate: to 10 under 1.000, to 100 above
const roundEur = (n: number) => (n < 1000 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100);

/** "24.730 lire sterline/an (aprox. 28.900 €)", "1.100–1.300 €/an", or "fără taxă (0 €)". */
export function feeText(f: Pick<Fee, "currency" | "min" | "max">): string {
  if (f.max === 0) return `fără taxă (0 ${NAME[f.currency]})`;
  const local = `${range(f.min, f.max)} ${NAME[f.currency]}/an`;
  if (f.currency === "EUR") return local;
  const rate = EUR_PER[f.currency];
  return `${local} (aprox. ${range(roundEur(f.min * rate), roundEur(f.max * rate))} €)`;
}
