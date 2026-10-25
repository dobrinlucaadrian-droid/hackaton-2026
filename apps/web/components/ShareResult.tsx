"use client";
// Under the result: draws a story-sized picture (1080×1920) of the 3 matched domains with their percentages and "findmyuni.ro", in the browser only
// (nothing is sent anywhere), and shares it through the phone's menu (Instagram, WhatsApp …) or downloads it where sharing files is not possible.
import { useState } from "react";
import type { Match } from "@/lib/types";
import { domainStyle } from "./domainStyle";

const W = 1080;
const H = 1920;
const C = { paper: "#f6efe4", card: "#fffdf9", line: "#e0d3c0", ink: "#1a2a4c", soft: "#4a5674", primary: "#61122d", gold: "#c8962e" };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** The largest font size (down to `min`) at which the text fits the width. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, family: string, size: number, min: number, width: number): number {
  let s = size;
  for (; s > min; s -= 2) {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= width) break;
  }
  return s;
}

async function draw(matches: Match[]): Promise<Blob> {
  await document.fonts.ready;
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // background with the site's dotted paper
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.line;
  for (let y = 24; y < H; y += 48) for (let x = 24; x < W; x += 48) ctx.fillRect(x, y, 4, 4);

  // logo
  const logo = await loadImage("/logo-cap.png").catch(() => null);
  if (logo) ctx.drawImage(logo, 96, 140, 110, 110);
  ctx.textBaseline = "middle";
  ctx.font = `900 64px ${family}`;
  ctx.fillStyle = C.ink;
  ctx.fillText("FindMy", 226, 198);
  const fm = ctx.measureText("FindMy").width;
  ctx.fillStyle = C.gold;
  ctx.fillText("Uni", 226 + fm, 198);

  // title
  ctx.fillStyle = C.ink;
  ctx.font = `900 104px ${family}`;
  ctx.fillText("Mi se potrivesc:", 96, 420);

  // the three domains
  let y = 540;
  matches.slice(0, 3).forEach((m, i) => {
    const h = 300;
    ctx.fillStyle = C.card;
    roundRect(ctx, 80, y, W - 160, h, 48);
    ctx.fill();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 4;
    ctx.stroke();
    // rank
    ctx.fillStyle = i === 0 ? C.primary : C.ink;
    ctx.beginPath();
    ctx.arc(170, y + h / 2, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `900 52px ${family}`;
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), 170, y + h / 2 + 2);
    ctx.textAlign = "left";
    // emoji and name
    ctx.font = `96px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.fillText(domainStyle(m.domain.id).emoji, 250, y + 110);
    // the name on one line when it fits at a readable size, otherwise on two lines
    const room = W - 80 - 48 - 380;
    const nameSize = fit(ctx, m.domain.name, 900, family, 64, 48, room);
    ctx.font = `900 ${nameSize}px ${family}`;
    ctx.fillStyle = C.ink;
    if (ctx.measureText(m.domain.name).width <= room) ctx.fillText(m.domain.name, 380, y + 110);
    else {
      const words = m.domain.name.split(" ");
      let cut = words.length - 1;
      while (cut > 1 && ctx.measureText(words.slice(0, cut).join(" ")).width > room) cut--;
      ctx.fillText(words.slice(0, cut).join(" "), 380, y + 82);
      ctx.fillText(words.slice(cut).join(" "), 380, y + 140);
    }
    // percent bar
    ctx.fillStyle = C.line;
    roundRect(ctx, 250, y + 196, W - 160 - 380, 28, 14);
    ctx.fill();
    ctx.fillStyle = i === 0 ? C.primary : C.gold;
    roundRect(ctx, 250, y + 196, ((W - 160 - 380) * m.percent) / 100, 28, 14);
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = `900 56px ${family}`;
    ctx.textAlign = "right";
    ctx.fillText(`${m.percent}%`, W - 120, y + 210);
    ctx.textAlign = "left";
    y += h + 48;
  });

  // call to action
  ctx.fillStyle = C.soft;
  ctx.font = `600 48px ${family}`;
  ctx.textAlign = "center";
  ctx.fillText("Fă și tu chestionarul pe", W / 2, 1640);
  ctx.fillStyle = C.primary;
  ctx.font = `900 88px ${family}`;
  ctx.fillText("findmyuni.ro", W / 2, 1750);
  ctx.textAlign = "left";

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"));
}

export function ShareResult({ matches }: { matches: Match[] }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function share() {
    setBusy(true);
    setNote(null);
    try {
      const file = new File([await draw(matches)], "findmyuni-rezultat.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: "Fă și tu chestionarul pe findmyuni.ro" });
        } catch (e) {
          if (!(e instanceof DOMException && e.name === "AbortError")) throw e;
        }
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNote("Imaginea s-a descărcat. Pune-o la story de pe telefon.");
      }
    } catch {
      setNote("Nu am putut face imaginea. Încearcă din nou.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-2xl rounded-3xl bg-card p-6 text-center shadow-sm ring-1 ring-line">
      <h2 className="text-xl font-black text-ink">Arată-le și prietenilor</h2>
      <p className="mt-1 text-ink-soft">Facem o imagine cu cele 3 domenii, bună de pus la story. Fără numele tău sau alte date.</p>
      <button
        type="button"
        onClick={() => void share()}
        disabled={busy}
        className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-60"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        {busy ? "Se face imaginea…" : "Distribuie rezultatul"}
      </button>
      {note && (
        <p className="mt-3 text-sm font-bold text-primary-dark" role="status">
          {note}
        </p>
      )}
    </section>
  );
}
