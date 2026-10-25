// The picture shown when the site itself is shared (WhatsApp, Instagram, Facebook …): the cap from the logo, "FindMyUni" and what the site does. Drawn once, when the site is built.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LANGS } from "@/lib/i18n";

export const alt = "FindMyUni — alege facultatea potrivită";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// One picture per language, drawn at build time; nothing is drawn on demand.
export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/** Text laid out letter by letter (the image renderer leaves odd gaps after kerned words), with even gaps between words. */
function Words({ text, gap }: { text: string; gap: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: gap }}>
      {text.split(" ").map((w, i) => (
        <div key={i} style={{ display: "flex" }}>
          {[...w].map((c, j) => (
            <span key={j}>{c}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function Image() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public", "logo-cap.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f6efe4", color: "#1a2a4c", fontFamily: "Geist" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only understands plain <img> */}
        <img src={logo} width={220} height={220} alt="" />
        <div style={{ display: "flex", marginTop: 24, fontSize: 120, letterSpacing: -4 }}>
          <Words text="FindMy" gap={0} />
          <div style={{ display: "flex", color: "#c8962e" }}>
            <Words text="Uni" gap={0} />
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 40, color: "#61122d" }}>
          <Words text="Alege facultatea potrivită" gap={12} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: await readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf")), style: "normal", weight: 400 }] },
  );
}
