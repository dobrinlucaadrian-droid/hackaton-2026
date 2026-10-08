// Parses annexes 2 (state) and 3 (private) of HG 606/2026 from raw.json into one row per bachelor programme, using the table rules to find each cell.
import { readFileSync, writeFileSync } from "node:fs";
const pages = JSON.parse(readFileSync(new URL("raw.json", import.meta.url), "utf8"));

const COL = { nr: [22, 50], faculty: [50, 142], domain: [142, 220], program: [220, 376], status: [376, 433], form: [433, 469], credits: [469, 519], max: [519, 570] };
const FIRST = 29, LAST = 141;
const mid = ([a, b]) => (a + b) / 2;
const inCol = (it, c) => it.x >= COL[c][0] - 1 && it.x < COL[c][1] - 1;
const text = (its) => {
  // join by lines (top to bottom), then left to right; glue hyphenated line breaks
  const lines = new Map();
  for (const it of its) { const k = [...lines.keys()].find((y) => Math.abs(y - it.y) <= 2.5) ?? it.y; lines.set(k, [...(lines.get(k) || []), it]); }
  const parts = [...lines].sort((a, b) => b[0] - a[0]).map(([, l]) => l.sort((a, b) => a.x - b.x).map((i) => i.s).join(" ").replace(/\s+/g, " ").trim());
  let out = "";
  for (const p of parts) out = out === "" ? p : /[A-Za-zăâîșțşţ]-$/.test(out) && /^[a-zăâîșțşţ]/.test(p) ? out.slice(0, -1) + p : out + " " + p;
  return out.replace(/\s+/g, " ").replace(/\s+([,;)])/g, "$1").replace(/\(\s+/g, "(").trim();
};

/** y positions of rules that cover the middle of a column, top first, de-duplicated. */
function boundaries(rules, col) {
  const m = mid(COL[col]);
  const ys = rules.filter((r) => r.x0 <= m && r.x1 >= m).map((r) => r.y).sort((a, b) => b - a);
  return ys.filter((y, i) => i === 0 || ys[i - 1] - y > 1.5);
}
const bands = (ys) => ys.slice(0, -1).map((top, i) => ({ top, bottom: ys[i + 1] }));
const within = (it, b) => it.y < b.top - 0.5 && it.y > b.bottom - 3; // text baseline sits inside the band (a little slack below the top rule)

const rows = [];
const problems = [];
let annex = null, inst = null, instNo = null, pendingHeading = null;
let lastFaculty = null, lastDomain = null; // carried across page breaks
const facultySegments = [], domainSegments = [];

for (const p of pages) {
  if (p.n < FIRST || p.n > LAST) continue;
  const items = p.items;
  const fullRules = boundaries(p.rules, "program");
  // A band is a programme row only when its status cell says A or AP; headings between two tables also sit between rules.
  const progBands = bands(fullRules).filter((b) => /^(A|AP)$/.test(text(items.filter((it) => inCol(it, "status") && within(it, b)))));
  const facBands = bands(boundaries(p.rules, "faculty"));
  const domBands = bands(boundaries(p.rules, "domain"));
  const tableTop = fullRules[0] ?? -1, tableBottom = fullRules[fullRules.length - 1] ?? -1;

  // Everything on the page in reading order: headings (outside any band) and table bands.
  const events = [];
  const outside = items.filter((it) => !progBands.some((b) => within(it, b)));
  const lineMap = new Map();
  for (const it of outside) { const k = [...lineMap.keys()].find((y) => Math.abs(y - it.y) <= 2.5) ?? it.y; lineMap.set(k, [...(lineMap.get(k) || []), it]); }
  for (const [y, its] of lineMap) events.push({ y, kind: "line", s: its.sort((a, b) => a.x - b.x).map((i) => i.s).join(" ").replace(/\s+/g, " ").trim() });
  for (const b of progBands) events.push({ y: b.top, kind: "band", b });
  events.sort((a, b) => b.y - a.y);

  for (const ev of events) {
    if (ev.kind === "line") {
      const s = ev.s;
      const a = s.match(/^Anexa nr\.\s*(\d+)/);
      if (a) { annex = Number(a[1]); inst = null; pendingHeading = null; continue; }
      const h = s.match(/^(\d+)\.\s*(.+)$/);
      if (h && /^[A-ZĂÂÎȘȚŞŢ"„“”' .\-–,0-9()]+/.test(h[2]) && h[2].slice(0, 12) === h[2].slice(0, 12).toUpperCase() && /[A-ZĂÂÎȘȚŞŢ]{4}/.test(h[2])) {
        instNo = Number(h[1]); inst = h[2].trim(); pendingHeading = { y: ev.y }; lastFaculty = null; lastDomain = null;
        continue;
      }
      // a heading that wraps onto the next line, right under it and before the table starts
      if (pendingHeading && pendingHeading.y - ev.y < 16 && !/^(Nr\.|crt\.|Facultatea|Domeniul|Specializarea|Număr|Acreditare|Forma|\*A|MONITORUL|\d+$)/.test(s) && s.length < 90) { inst += " " + s; pendingHeading.y = ev.y; }
      continue;
    }
    pendingHeading = null;
    const b = ev.b;
    const cell = (c) => items.filter((it) => inCol(it, c) && within(it, b));
    const status = text(cell("status")), form = text(cell("form")), credits = text(cell("credits")), max = text(cell("max")), program = text(cell("program"));
    if (!/^(A|AP)$/.test(status)) {
      if (program && !/^Specializarea|universitare de licență|predare\)/.test(program) && !/Acreditare/.test(status)) problems.push({ page: p.n, issue: "band without A/AP", program, status, form, credits, max });
      continue; // header rows and oddities
    }
    if (annex !== 2 && annex !== 3) continue;
    const fb = facBands.find((f) => b.top <= f.top + 0.5 && b.bottom >= f.bottom - 0.5);
    const db = domBands.find((d) => b.top <= d.top + 0.5 && b.bottom >= d.bottom - 0.5);
    const facText = fb ? text(items.filter((it) => inCol(it, "faculty") && within(it, fb))) : "";
    const nrText = fb ? text(items.filter((it) => inCol(it, "nr") && within(it, fb))) : "";
    const domText = db ? text(items.filter((it) => inCol(it, "domain") && within(it, db))) : "";
    const facKey = fb ? `${p.n}:${fb.top}` : `${p.n}:none`;
    const domKey = db ? `${p.n}:${db.top}` : `${p.n}:none`;
    rows.push({ annex, instNo, institution: inst, page: p.n, facKey, domKey, facTop: fb ? fb.top === tableTopBand(facBands) : false, facultyNo: nrText, faculty: facText, domain: domText, program, status, form, credits: Number(credits) || credits, max: /^\d+$/.test(max) ? Number(max) : max });
  }
  function tableTopBand(list) { return list.length ? Math.max(...list.map((x) => x.top)) : null; }
}

// Merged cells split by a page break keep their text on one page only: fill the empty part from its neighbour.
function fillAcross(key, field, extra) {
  const segs = [];
  for (const r of rows) { const last = segs[segs.length - 1]; if (!last || last.key !== r[key] || last.inst !== r.institution) segs.push({ key: r[key], inst: r.institution, page: r.page, value: r[field], extra: extra ? r[extra] : undefined, rows: [r] }); else last.rows.push(r); }
  let filled = 0;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (s.value) continue;
    const prev = segs[i - 1], next = segs[i + 1];
    const fromPrev = prev && prev.inst === s.inst && prev.page === s.page - 1 && prev.value;
    const fromNext = next && next.inst === s.inst && next.page === s.page + 1 && next.value;
    const src = fromPrev ? prev : fromNext ? next : null;
    if (src) { s.value = src.value; s.extra = src.extra; for (const r of s.rows) { r[field] = src.value; if (extra) r[extra] = src.extra; } filled += s.rows.length; }
  }
  return filled;
}
const filledFac = fillAcross("facKey", "faculty", "facultyNo");
const filledDom = fillAcross("domKey", "domain");

const clean = rows.map(({ facKey, domKey, facTop, ...r }) => r);
writeFileSync(new URL("rows.json", import.meta.url), JSON.stringify(clean, null, 1));
writeFileSync(new URL("problems.json", import.meta.url), JSON.stringify(problems, null, 1));

const insts = [...new Map(clean.map((r) => [`${r.annex}|${r.instNo}`, r.institution])).entries()];
const count = (f) => clean.reduce((m, r) => ((m[r[f]] = (m[r[f]] || 0) + 1), m), {});
console.log("programme rows:", clean.length, "| institutions:", insts.length, "(annex 2:", insts.filter(([k]) => k.startsWith("2|")).length, ", annex 3:", insts.filter(([k]) => k.startsWith("3|")).length, ")");
console.log("status:", count("status"), "form:", count("form"), "credits:", count("credits"));
console.log("filled across pages: faculty rows", filledFac, "domain rows", filledDom);
console.log("empty faculty:", clean.filter((r) => !r.faculty).length, "| empty domain:", clean.filter((r) => !r.domain).length, "| empty program:", clean.filter((r) => !r.program).length, "| no institution:", clean.filter((r) => !r.institution).length, "| max not a number:", clean.filter((r) => typeof r.max !== "number").length);
console.log("bands without A/AP that have a programme text:", problems.length);
