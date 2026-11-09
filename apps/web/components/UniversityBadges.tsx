"use client";
// Small outlined badges for a university's prestige and budget level, shared by result cards and the profile sheet (in the page language).
import type { Budget, Prestige } from "@/lib/types";
import { labelsFor } from "@/lib/labels";
import { useLang } from "./LangProvider";

const PRESTIGE_TONE: Record<Prestige, string> = {
  ivy: "bg-primary text-white",
  top: "bg-teal-tint text-teal-ink",
  international: "bg-sky-tint text-sky-ink",
  national: "bg-mint-tint text-mint-ink",
};

export function PrestigeBadge({ prestige }: { prestige: Prestige }) {
  const label = labelsFor(useLang()).PRESTIGE[prestige];
  if (!label) return null;
  return <span className={`rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${PRESTIGE_TONE[prestige] ?? PRESTIGE_TONE.national}`}>{label}</span>;
}

export function BudgetBadge({ budget }: { budget: Budget }) {
  const label = labelsFor(useLang()).BUDGET[budget];
  if (!label) return null;
  return <span className="rounded-full border-2 border-ink bg-sky-tint px-3 py-0.5 text-xs font-extrabold text-ink">{label}</span>;
}
