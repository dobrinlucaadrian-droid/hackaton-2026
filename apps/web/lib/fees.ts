// Exact yearly tuition of the university sheets (data/fees.json), each with its academic year and the official page it comes from; amounts in the university's own currency plus an approximate value in euro. Server only.
import ratesJson from "../data/eur-rates.json";
import feesJson from "../data/fees.json";
import type { Lang } from "./i18n";

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

/** Approximate euro value of one unit of each currency (rounded rates, autumn 2026, data/eur-rates.json); for the "aprox." figure and the fee filter. */
export const EUR_PER: Record<string, number> = ratesJson;

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

const NAME_EN: Record<string, string> = {
  EUR: "€",
  RON: "Romanian lei",
  MDL: "Moldovan lei",
  GBP: "pounds sterling",
  USD: "US dollars",
  CHF: "Swiss francs",
  DKK: "Danish kroner",
  SEK: "Swedish kronor",
  NOK: "Norwegian kroner",
  PLN: "zloty",
  CZK: "Czech koruna",
  CAD: "Canadian dollars",
  AUD: "Australian dollars",
  KRW: "South Korean won",
  HKD: "Hong Kong dollars",
  SGD: "Singapore dollars",
};

const byId = new Map((feesJson as Fee[]).map((f) => [f.id, f]));

/** The confirmed yearly tuition of a sheet, if one was found on an official page. */
export function feeOf(universityId: string): Fee | undefined {
  return byId.get(universityId);
}

const num = (n: number, lang: Lang) => new Intl.NumberFormat(lang === "en" ? "en-GB" : "ro-RO").format(n);
const range = (a: number, b: number, lang: Lang) => (a === b ? num(a, lang) : `${num(a, lang)}–${num(b, lang)}`);
// euro rounded so it does not look more exact than the rate: to 10 under 1.000, to 100 above
const roundEur = (n: number) => (n < 1000 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100);

/** "24.730 lire sterline/an (aprox. 28.900 €)", "1.100–1.300 €/an", or "fără taxă (0 €)"; in English "24,730 pounds sterling/year (approx. €28,900)", "€1,100–1,300/year", "no tuition fee (€0)". */
export function feeText(f: Pick<Fee, "currency" | "min" | "max">, lang: Lang = "ro"): string {
  const en = lang === "en";
  if (f.max === 0) return en ? `no tuition fee (${f.currency === "EUR" ? "€0" : `0 ${NAME_EN[f.currency]}`})` : `fără taxă (0 ${NAME[f.currency]})`;
  const local = en
    ? f.currency === "EUR" ? `€${range(f.min, f.max, lang)}/year` : `${range(f.min, f.max, lang)} ${NAME_EN[f.currency]}/year`
    : `${range(f.min, f.max, lang)} ${NAME[f.currency]}/an`;
  if (f.currency === "EUR") return local;
  const rate = EUR_PER[f.currency];
  const eur = range(roundEur(f.min * rate), roundEur(f.max * rate), lang);
  return en ? `${local} (approx. €${eur})` : `${local} (aprox. ${eur} €)`;
}
