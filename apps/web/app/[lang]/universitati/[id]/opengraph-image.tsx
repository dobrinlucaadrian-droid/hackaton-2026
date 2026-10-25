// The picture shown when a university's sheet is shared (WhatsApp, Instagram, Facebook …): FindMyUni, the university's name, place and yearly tuition when we have it.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { feeOf, feeText } from "@/lib/fees";
import { cityName, countryName, universityName } from "@/lib/i18n-data";
import { universities, universityById } from "@/lib/sheets";

export const alt = "Fișa universității pe FindMyUni";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ lang: string; id: string }> };

// Every picture is drawn once, when the site is built; an unknown address gets a 404 instead of a new drawing, so nobody can make the server draw on demand.
export const dynamicParams = false;
export function generateStaticParams() {
  return universities.map((u) => ({ id: u.id }));
}

/**
 * Text laid out letter by letter inside each word, with even gaps between words. The image renderer measures kerned words
 * ("Ta", "ty", "fl" …) wider than it draws them, which left odd gaps; single letters are measured exactly.
 */
function Words({ text, gap }: { text: string; gap: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: gap }}>
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

export default async function Image({ params }: Props) {
  const { lang: langParam, id } = await params;
  const lang = langParam === "en" ? "en" : "ro";
  const en = lang === "en";
  const base = universityById(id);
  const u = base ? { ...base, name: universityName(base, lang), city: cityName(base.city, lang), country: countryName(base.country, lang) } : undefined;
  const fee = u ? feeOf(u.id) : undefined;
  // the cap from the logo, as a data URL (the image renderer cannot read files by URL at build time)
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public", "logo-cap.png"))).toString("base64")}`;
  // the amount in the university's own currency only (the sheet also gives the euro value)
  const local = fee ? feeText(fee, lang).split(/ \((?:aprox|approx)\./)[0] : "";
  const feeLine = fee
    ? fee.budgetFree && fee.max === 0
      ? en ? "0 lei, state-funded places only" : "0 lei, doar locuri la buget"
      : fee.budgetFree
        ? en ? `0 lei on state-funded places, ${local} fee-paying` : `0 lei la buget, ${local} cu taxă`
        : local
    : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f6efe4", padding: "64px 72px", color: "#1a2a4c", fontFamily: "Geist" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only understands plain <img> */}
          <img src={logo} width={72} height={72} alt="" />
          <span style={{ display: "flex" }}>
            FindMy<span style={{ color: "#c8962e" }}>Uni</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontSize: u && u.name.length > 48 ? 58 : 72, lineHeight: 1.05, letterSpacing: -2, color: "#1a2a4c", display: "flex" }}>
            <Words text={u?.name ?? (en ? "University" : "Universitate")} gap={u && u.name.length > 48 ? 16 : 20} />
          </div>
          {u && (
            <div style={{ marginTop: 18, fontSize: 36, color: "#4a5674", display: "flex" }}>
              <Words text={`${u.city}, ${u.country}`} gap={10} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 40 }}>
          {feeLine ? (
            <div style={{ display: "flex", background: "#61122d", color: "white", fontSize: 30, padding: "16px 28px", borderRadius: 999 }}>
              <Words text={`${en ? "Yearly tuition" : "Taxa pe an"}: ${feeLine}`} gap={9} />
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 30, color: "#61122d" }}>
              <Words text={en ? "Admission, costs and bachelor's programmes" : "Admitere, costuri și programe de licență"} gap={9} />
            </div>
          )}
          <div style={{ display: "flex", fontSize: 28, color: "#4a5674" }}>findmyuni.ro</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: await readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf")), style: "normal", weight: 400 }] },
  );
}
