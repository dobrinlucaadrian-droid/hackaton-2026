// Small coloured badges for a university's prestige and budget level, shared by result cards and the profile sheet.
import type { Budget, Prestige } from "@/lib/types";
import { BUDGET_LABEL, PRESTIGE_LABEL } from "@/lib/universities";

const PRESTIGE_TONE: Record<Prestige, string> = {
  ivy: "bg-primary text-white",
  top: "bg-teal-tint text-teal-ink",
  international: "bg-sky-tint text-sky-ink",
  national: "bg-mint-tint text-mint-ink",
};

export function PrestigeBadge({ prestige }: { prestige: Prestige }) {
  const label = PRESTIGE_LABEL[prestige];
  if (!label) return null;
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${PRESTIGE_TONE[prestige] ?? PRESTIGE_TONE.national}`}>{label}</span>;
}

export function BudgetBadge({ budget }: { budget: Budget }) {
  const label = BUDGET_LABEL[budget];
  if (!label) return null;
  return <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink-soft ring-1 ring-line">{label}</span>;
}
