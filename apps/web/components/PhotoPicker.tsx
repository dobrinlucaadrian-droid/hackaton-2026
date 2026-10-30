"use client";
// Optional face photo on the opinion form (in the page language): the student picks a picture, moves and zooms it inside the same circle the site shows, and keeps a small square JPEG of exactly that view (kept automatically if the form is sent while the circle is still open).
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { useT } from "./LangProvider";

const VIEW = 240; // size of the circle on screen, in CSS pixels
const OUT = 400; // size of the saved square photo, in pixels

type Pick = { url: string; w: number; h: number };
/** The cropped photo and a local address to preview it. */
export type Photo = { blob: Blob; url: string };
/** Lets the form keep a photo that is still being placed in the circle when it is sent. */
export type PhotoPickerHandle = { finish: () => Promise<Photo | null> };

export function PhotoPicker({ photo, onChange, ref }: { photo: Photo | null; onChange: (photo: Photo | null) => void; ref?: Ref<PhotoPickerHandle> }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // offset of the picture centre from the circle centre
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; px: number; py: number } | null>(null);

  function set(next: Photo | null) {
    if (photo) URL.revokeObjectURL(photo.url);
    onChange(next);
  }

  useEffect(() => () => { if (pick) URL.revokeObjectURL(pick.url); }, [pick]);

  // At zoom 1 the shorter side of the picture just fills the circle.
  const base = pick ? VIEW / Math.min(pick.w, pick.h) : 1;
  const dw = pick ? pick.w * base * zoom : 0;
  const dh = pick ? pick.h * base * zoom : 0;
  const clamp = (p: { x: number; y: number }, w = dw, h = dh) => ({
    x: Math.max(-(w - VIEW) / 2, Math.min((w - VIEW) / 2, p.x)),
    y: Math.max(-(h - VIEW) / 2, Math.min((h - VIEW) / 2, p.y)),
  });

  function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError(t("Alege o poză (JPG sau PNG).", "Choose a photo (JPG or PNG)."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setZoom(1);
      setPos({ x: 0, y: 0 });
      setPick({ url, w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError(t("Poza aceasta nu se poate deschide. Încearcă alta.", "This photo cannot be opened. Try another one."));
    };
    img.src = url;
  }

  function onZoom(z: number) {
    if (!pick) return;
    setZoom(z);
    setPos((p) => clamp(p, pick.w * base * z, pick.h * base * z));
  }

  // Draws exactly what the circle shows onto a square canvas and keeps it as a JPEG; resolves to the kept photo (or null when it failed).
  function accept(): Promise<Photo | null> {
    if (!pick) return Promise.resolve(photo);
    return new Promise((resolve) => {
      const failed = () => {
        setError(t("Poza nu a putut fi pregătită. Încearcă alta.", "The photo could not be prepared. Try another one."));
        resolve(null);
      };
      const img = new Image();
      img.onerror = failed;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = OUT;
        canvas.height = OUT;
        const ctx = canvas.getContext("2d");
        if (!ctx) return failed();
        const k = OUT / VIEW;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, OUT, OUT);
        ctx.drawImage(img, (VIEW / 2 + pos.x - dw / 2) * k, (VIEW / 2 + pos.y - dh / 2) * k, dw * k, dh * k);
        canvas.toBlob((blob) => {
          if (!blob) return failed();
          const kept = { blob, url: URL.createObjectURL(blob) };
          set(kept);
          setPick(null);
          resolve(kept);
        }, "image/jpeg", 0.85);
      };
      img.src = pick.url;
    });
  }

  useImperativeHandle(ref, () => ({ finish: accept }));

  const btn = "min-h-11 rounded-full px-5 text-sm font-bold";
  return (
    <div>
      <p className="text-sm font-extrabold uppercase tracking-wide text-primary">{t("Poza ta (opțional)", "Your photo (optional)")}</p>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />

      {pick ? (
        <div className="mt-2 rounded-2xl bg-paper p-4 ring-1 ring-line">
          <p className="text-sm text-ink">{t("Așa va apărea poza lângă părere. Trage de ea ca să-ți potrivești fața în cerc și mărește-o cu cursorul.", "This is how the photo will look next to your opinion. Drag it to fit your face in the circle and zoom with the slider.")}</p>
          <div
            className="relative mx-auto mt-4 cursor-grab touch-none select-none overflow-hidden rounded-full ring-4 ring-teal active:cursor-grabbing"
            style={{ width: VIEW, height: VIEW }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; }}
            onPointerMove={(e) => { const d = drag.current; if (d && d.id === e.pointerId) setPos(clamp({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y })); }}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of the picked file */}
            <img src={pick.url} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ width: dw, height: dh, left: VIEW / 2 + pos.x - dw / 2, top: VIEW / 2 + pos.y - dh / 2 }} />
          </div>
          <label className="mx-auto mt-4 flex max-w-xs items-center gap-3 text-sm font-bold text-ink-soft">
            <span aria-hidden>−</span>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => onZoom(Number(e.target.value))} className="w-full accent-primary" aria-label={t("Mărește poza", "Zoom the photo")} />
            <span aria-hidden>+</span>
          </label>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => void accept()} className={`${btn} bg-primary text-white hover:bg-primary-dark`}>{t("E bine, păstrez poza", "Looks good, keep it")}</button>
            <button type="button" onClick={() => input.current?.click()} className={`${btn} border-2 border-primary text-primary hover:bg-primary-tint`}>{t("Altă poză", "Another photo")}</button>
            <button type="button" onClick={() => setPick(null)} className={`${btn} text-ink-soft underline underline-offset-2`}>{t("Renunță", "Cancel")}</button>
          </div>
        </div>
      ) : photo ? (
        <div className="mt-2 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of the cropped photo */}
          <img src={photo.url} alt={t("Poza aleasă", "Chosen photo")} className="h-20 w-20 rounded-full object-cover ring-2 ring-teal" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className={`${btn} border-2 border-primary text-primary hover:bg-primary-tint`}>{t("Schimbă poza", "Change photo")}</button>
            <button type="button" onClick={() => set(null)} className={`${btn} text-ink-soft underline underline-offset-2`}>{t("Scoate poza", "Remove photo")}</button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <button type="button" onClick={() => input.current?.click()} className={`${btn} border-2 border-primary text-primary hover:bg-primary-tint`}>{t("📷 Adaugă o poză cu tine", "📷 Add a photo of yourself")}</button>
          <p className="mt-1 text-xs text-ink-soft">{t("Fără poză, lângă părere apare inițiala numelui.", "Without a photo, the first letter of your name appears next to your opinion.")}</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm font-bold text-primary-dark" role="alert">{error}</p>}
    </div>
  );
}
