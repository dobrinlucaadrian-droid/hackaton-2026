// Dumps, for every page of the official list, the text items with positions and the horizontal table rules, into raw.json (a cache for the parser).
import { readFileSync, writeFileSync } from "node:fs";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
const data = new Uint8Array(readFileSync(new URL("HG606.pdf", import.meta.url)));
const doc = await getDocument({ data, useSystemFonts: true, disableFontFace: true }).promise;
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const r1 = (v) => Math.round(v * 10) / 10;
const pages = [];
const from = Number(process.argv[2] || 1), to = Math.min(doc.numPages, Number(process.argv[3] || doc.numPages));
for (let n = from; n <= to; n++) {
  const page = await doc.getPage(n);
  const tc = await page.getTextContent();
  const items = tc.items.filter((i) => i.str && i.str.trim()).map((i) => ({ x: r1(i.transform[4]), y: r1(i.transform[5]), w: r1(i.width), h: r1(i.height), s: i.str }));
  const ops = await page.getOperatorList();
  let ctm = [1, 0, 0, 1, 0, 0]; const stack = []; const rules = []; const vx = new Set();
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i], a = ops.argsArray[i];
    if (fn === OPS.save) stack.push(ctm);
    else if (fn === OPS.restore) ctm = stack.pop() || ctm;
    else if (fn === OPS.transform) ctm = mul(ctm, a);
    else if (fn === OPS.constructPath) {
      const mm = a[2];
      if (!mm || mm.length < 4) continue;
      const p0 = [ctm[0] * mm[0] + ctm[2] * mm[1] + ctm[4], ctm[1] * mm[0] + ctm[3] * mm[1] + ctm[5]];
      const p1 = [ctm[0] * mm[2] + ctm[2] * mm[3] + ctm[4], ctm[1] * mm[2] + ctm[3] * mm[3] + ctm[5]];
      const b = [Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])];
      if (b[3] - b[1] < 2 && b[2] - b[0] > 15) rules.push({ y: r1((b[1] + b[3]) / 2), x0: r1(b[0]), x1: r1(b[2]) });
      if (b[2] - b[0] < 2 && b[3] - b[1] > 8) vx.add(Math.round((b[0] + b[2]) / 2));
    }
  }
  pages.push({ n, items, rules, vx: [...vx].sort((a, b) => a - b) });
}
writeFileSync(new URL("raw.json", import.meta.url), JSON.stringify(pages));
console.log("pages dumped:", pages.length, "items:", pages.reduce((s, p) => s + p.items.length, 0), "rules:", pages.reduce((s, p) => s + p.rules.length, 0));
// headings overview: lines that look like institution titles or annex titles
for (const p of pages) {
  const lines = new Map();
  for (const it of p.items) { const k = Math.round(it.y); lines.set(k, [...(lines.get(k) || []), it]); }
  for (const [y, its] of [...lines].sort((a, b) => b[0] - a[0])) {
    const text = its.sort((a, b) => a.x - b.x).map((i) => i.s).join(" ").replace(/\s+/g, " ").trim();
    if (/^(\d+\.\s*)?(UNIVERSITATEA|ACADEMIA|ȘCOALA|ŞCOALA|INSTITUTUL)\b/.test(text) || /^(ANEXA|Anexa)\b/.test(text) || /^[A-Z]\.\s|^[IVX]+\.\s/.test(text)) console.log(`p${p.n} y${y}: ${text.slice(0, 150)}`);
  }
}
