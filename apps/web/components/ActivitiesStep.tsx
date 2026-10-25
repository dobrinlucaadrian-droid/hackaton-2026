"use client";
// Quiz step "Ce ai făcut până acum?" in the page language: add up to 5 activities (kind, area, level, name, optional diploma photo).
import { useState } from "react";
import { useLang, useT } from "@/components/LangProvider";
import {
  ACTIVITY_AREAS,
  ACTIVITY_KINDS,
  ACTIVITY_LEVELS,
  MAX_ACTIVITIES,
  describeActivity,
  labelOf,
} from "@/lib/activities";
import { shrinkImage, type StoredActivity } from "@/lib/session";
import type { ActivityKind, ActivityLevel } from "@/lib/types";

type Props = {
  activities: StoredActivity[];
  /** Saves the new list; returns false when the browser could not store it. */
  onChange: (list: StoredActivity[]) => boolean;
};

const chip = (on: boolean) =>
  `opt min-h-11 rounded-full border-2 px-4 py-2 text-left font-semibold ${
    on ? "border-primary bg-primary-tint text-primary-dark" : "border-transparent bg-card text-ink-soft ring-1 ring-line hover:ring-primary/50"
  }`;

export function ActivitiesStep({ activities, onChange }: Props) {
  const lang = useLang();
  const t = useT();
  const [kind, setKind] = useState<ActivityKind | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [level, setLevel] = useState<ActivityLevel | null>(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [msg, setMsg] = useState<string | null>(null);

  const full = activities.length >= MAX_ACTIVITIES;
  const ready = kind !== null && areaId !== null && (kind !== "concurs" || level !== null);

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await shrinkImage(file));
      setMsg(null);
    } catch {
      setMsg(t("Nu am putut citi poza. Încearcă altă imagine sau continuă fără ea.", "We could not read the photo. Try another image or continue without it."));
    }
  }

  function add() {
    if (!kind || !areaId || !ready) return;
    const item: StoredActivity = { kind, areaId };
    if (kind === "concurs" && level) item.level = level;
    if (name.trim()) item.name = name.trim();
    let note: string | null = null;
    if (photo) {
      item.photo = photo;
      if (!onChange([...activities, item])) {
        delete item.photo;
        onChange([...activities, item]);
        note = t("Poza e prea mare, am păstrat activitatea fără ea.", "The photo is too big, so we kept the activity without it.");
      }
    } else {
      onChange([...activities, item]);
    }
    setKind(null);
    setAreaId(null);
    setLevel(null);
    setName("");
    setPhoto(undefined);
    setMsg(note);
  }

  return (
    <div>
      {activities.length > 0 && (
        <ul className="mb-6 space-y-2" aria-label={t("Activitățile adăugate", "Added activities")}>
          {activities.map((a, i) => {
            const text = describeActivity(a, lang);
            const emoji = ACTIVITY_AREAS.find((x) => x.id === a.areaId)?.emoji ?? "⭐";
            return (
              <li key={i} className="slide-in flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-line">
                <span aria-hidden className="text-2xl">{emoji}</span>
                <span className="flex-1 font-semibold text-ink">{text}</span>
                {a.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photo} alt={t(`Poza diplomei pentru ${text}`, `Certificate photo for ${text}`)} className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-line" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    onChange(activities.filter((_, j) => j !== i));
                    setMsg(null);
                  }}
                  aria-label={t(`Șterge: ${text}`, `Delete: ${text}`)}
                  className="min-h-11 min-w-11 shrink-0 rounded-full border-2 border-line font-bold text-ink-soft hover:border-primary hover:text-primary"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {full ? (
        <p className="rounded-2xl bg-primary-tint p-4 font-semibold text-primary-dark" role="note">
          {t(
            `Ai adăugat ${MAX_ACTIVITIES} activități, cât se poate. Poți șterge una dacă vrei să adaugi alta.`,
            `You have added ${MAX_ACTIVITIES} activities, which is the maximum. You can delete one to add another.`,
          )}
        </p>
      ) : (
        <div className="space-y-5 rounded-3xl bg-card p-5 ring-1 ring-line">
          <fieldset>
            <legend className="font-extrabold text-ink">{t("Ce fel de activitate este?", "What kind of activity is it?")}</legend>
            <div className="mt-2 grid gap-2">
              {ACTIVITY_KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={kind === k.id}
                  onClick={() => setKind(k.id)}
                  className={`opt min-h-14 w-full rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold ${
                    kind === k.id ? "border-primary bg-primary-tint text-primary-dark" : "border-transparent bg-paper text-ink ring-1 ring-line hover:ring-primary/50"
                  }`}
                >
                  <span aria-hidden className="mr-2">{k.emoji}</span>
                  {labelOf(k, lang)}
                </button>
              ))}
            </div>
          </fieldset>

          {kind && (
            <fieldset className="slide-in">
              <legend className="font-extrabold text-ink">{t("În ce domeniu?", "In which area?")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIVITY_AREAS.map((a) => (
                  <button key={a.id} type="button" aria-pressed={areaId === a.id} onClick={() => setAreaId(a.id)} className={chip(areaId === a.id)}>
                    <span aria-hidden className="mr-1">{a.emoji}</span>
                    {labelOf(a, lang)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {kind === "concurs" && (
            <fieldset className="slide-in">
              <legend className="font-extrabold text-ink">{t("La ce nivel? (obligatoriu)", "At what level? (required)")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIVITY_LEVELS.map((l) => (
                  <button key={l.id} type="button" aria-pressed={level === l.id} onClick={() => setLevel(l.id)} className={chip(level === l.id)}>
                    {labelOf(l, lang)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {kind && (
            <div className="slide-in space-y-4">
              <div>
                <label htmlFor="act-name" className="font-extrabold text-ink">
                  {t("Cum se numește?", "What is it called?")} <span className="font-medium text-ink-soft">{t("(opțional)", "(optional)")}</span>
                </label>
                <input
                  id="act-name"
                  type="text"
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("De exemplu: Olimpiada de biologie", "For example: Biology Olympiad")}
                  className="mt-2 min-h-12 w-full rounded-2xl border-2 border-line bg-paper px-4 py-2 text-ink placeholder:text-ink-soft/70 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="act-photo"
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary focus-within:outline-3 hover:bg-primary-tint has-[:focus-visible]:outline-3"
                >
                  {photo ? t("Schimbă poza", "Change the photo") : t("Adaugă poza diplomei", "Add a photo of the certificate")}
                </label>
                <input
                  id="act-photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    void pickPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <span className="ml-2 text-sm text-ink-soft">{t("(opțional)", "(optional)")}</span>
                <p className="mt-2 text-sm text-ink-soft">{t("Poza rămâne doar pe dispozitivul tău. Nu o trimitem nicăieri.", "The photo stays on your device only. We do not send it anywhere.")}</p>
                {photo && (
                  <div className="mt-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={t("Previzualizarea pozei alese", "Preview of the chosen photo")} className="h-20 w-20 rounded-xl object-cover ring-1 ring-line" />
                    <button
                      type="button"
                      onClick={() => setPhoto(undefined)}
                      className="min-h-11 rounded-full border-2 border-line px-4 py-2 font-bold text-ink-soft hover:border-primary hover:text-primary"
                    >
                      {t("Șterge poza", "Remove the photo")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!ready}
            onClick={add}
            className="min-h-12 w-full rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft disabled:shadow-none"
          >
            {t("Adaugă activitatea", "Add the activity")}
          </button>
        </div>
      )}

      {msg && (
        <p className="mt-3 rounded-2xl bg-sky-tint p-3 font-semibold text-sky-ink" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
