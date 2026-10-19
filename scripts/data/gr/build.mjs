// Builds the Greek catalogue (institutions + one row per university department entered through the 2025 Panhellenic exams) from two Ministry of Education files on data.gov.gr. Usage: node scripts/data/gr/build.mjs <raw folder>
// Files (downloaded into the folder when missing): 6_vaseis_gel_epal_2025.xlsx (admission file: the list of departments, codes and towns) and aei_aeaa-tmhmata-7.8.2025.xls
// (the ministry's list of AEI departments: institution full name, school, semesters, website). No admission scores are read or written.
const CC = "GR";
const SOURCE = "Υπουργείο Παιδείας, data.gov.gr, Πανελλαδικές 2025";
const FILES = {
  bases: ["6_vaseis_gel_epal_2025.xlsx", "https://data.gov.gr/dataset/7b0af060-b1d7-4a05-8c0a-521c25430ca0/resource/0cc43d37-c2e3-4995-af77-7f27f5bc30c2/download/6_vaseis_gel_epal_2025.xlsx"],
  depts: ["aei_aeaa-tmhmata-7.8.2025.xls", "https://data.gov.gr/dataset/82418b57-3254-44f0-8c69-b61ed67023d2/resource/4d20289a-870e-47b7-83e5-3e62fb101e8c/download/aei_aeaa-tmhmata-7.8.2025.xls"],
};
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);
const raw = process.argv[2];
if (!raw) { console.error("usage: node scripts/data/gr/build.mjs <raw folder>"); process.exit(1); }
mkdirSync(raw, { recursive: true });
for (const [name, url] of Object.values(FILES)) {
  if (existsSync(`${raw}/${name}`)) continue;
  console.log("downloading", url);
  const r = await fetch(url); if (!r.ok) throw new Error(`download failed: ${r.status}`);
  writeFileSync(`${raw}/${name}`, Buffer.from(await r.arrayBuffer()));
}

// ---------- readers ----------
/** Minimal XLSX reader: first worksheet as an array of { A: "...", B: "..." } rows (shared and inline strings, numbers). */
function readXlsx(file) {
  const b = readFileSync(file); const files = {}; let e = b.length - 22;
  while (e >= 0 && b.readUInt32LE(e) !== 0x06054b50) e--;
  let p = b.readUInt32LE(e + 16);
  for (let i = 0, n = b.readUInt16LE(e + 10); i < n; i++) {
    const method = b.readUInt16LE(p + 10), csize = b.readUInt32LE(p + 20), nl = b.readUInt16LE(p + 28), xl = b.readUInt16LE(p + 30), cl = b.readUInt16LE(p + 32), off = b.readUInt32LE(p + 42);
    const name = b.toString("utf8", p + 46, p + 46 + nl); p += 46 + nl + xl + cl;
    const start = off + 30 + b.readUInt16LE(off + 26) + b.readUInt16LE(off + 28), data = b.subarray(start, start + csize);
    files[name] = (method === 0 ? data : inflateRawSync(data)).toString("utf8");
  }
  const dec = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");
  const ss = [...(files["xl/sharedStrings.xml"] || "").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => dec([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")));
  const rows = [];
  for (const r of files["xl/worksheets/sheet1.xml"].matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = {};
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const t = (c[2].match(/t="(\w+)"/) || [])[1], v = (c[3] || "").match(/<v>([\s\S]*?)<\/v>/), is = (c[3] || "").match(/<t[^>]*>([\s\S]*?)<\/t>/);
      row[c[1]] = t === "s" ? ss[+v[1]] : dec(v ? v[1] : is ? is[1] : "");
    }
    rows.push(row);
  }
  return rows;
}

/** Minimal legacy .xls (BIFF8 in a compound file) reader: first worksheet as rows of { A, B, ... } (strings and numbers). */
function readXls(file) {
  const b = readFileSync(file);
  const ss = 1 << b.readUInt16LE(30), mss = 1 << b.readUInt16LE(32), cutoff = b.readUInt32LE(56);
  const sec = (n) => 512 + n * ss;
  const difat = []; for (let i = 0; i < 109; i++) difat.push(b.readInt32LE(76 + i * 4));
  for (let d = b.readInt32LE(68), left = b.readUInt32LE(72); left > 0 && d >= 0; left--) {
    for (let i = 0; i < ss / 4 - 1; i++) difat.push(b.readInt32LE(sec(d) + i * 4));
    d = b.readInt32LE(sec(d) + ss - 4);
  }
  const fat = []; for (const s of difat) if (s >= 0) for (let i = 0; i < ss / 4; i++) fat.push(b.readInt32LE(sec(s) + i * 4));
  const chain = (start) => { const out = []; for (let s = start; s >= 0 && out.length < fat.length; s = fat[s]) out.push(s); return out; };
  const stream = (start, size) => Buffer.concat(chain(start).map((s) => b.subarray(sec(s), sec(s) + ss))).subarray(0, size);
  const dir = stream(b.readInt32LE(48), Infinity);
  const entries = [];
  for (let o = 0; o + 128 <= dir.length; o += 128) {
    const nl = dir.readUInt16LE(o + 64); if (!nl) continue;
    entries.push({ name: dir.toString("utf16le", o, o + nl - 2), type: dir[o + 66], start: dir.readInt32LE(o + 116), size: dir.readUInt32LE(o + 120) });
  }
  const wb = entries.find((x) => x.name === "Workbook" || x.name === "Book");
  if (!wb) throw new Error("no Workbook stream");
  let w;
  if (wb.size >= cutoff) w = stream(wb.start, wb.size);
  else {
    const root = entries.find((x) => x.type === 5), ministream = stream(root.start, root.size);
    const minifat = []; for (const s of chain(b.readInt32LE(60))) for (let i = 0; i < ss / 4; i++) minifat.push(b.readInt32LE(sec(s) + i * 4));
    const parts = []; for (let s = wb.start; s >= 0; s = minifat[s]) parts.push(ministream.subarray(s * mss, (s + 1) * mss));
    w = Buffer.concat(parts).subarray(0, wb.size);
  }
  // records
  const recs = []; for (let o = 0; o + 4 <= w.length;) { const t = w.readUInt16LE(o), l = w.readUInt16LE(o + 2); recs.push({ t, d: w.subarray(o + 4, o + 4 + l) }); o += 4 + l; }
  // shared strings (SST + CONTINUE), strings may break across records
  const sst = [];
  const si = recs.findIndex((r) => r.t === 0x00fc);
  if (si >= 0) {
    const segs = [recs[si].d.subarray(8)]; for (let k = si + 1; recs[k] && recs[k].t === 0x003c; k++) segs.push(recs[k].d);
    let sg = 0, o = 0;
    const need = () => { while (sg < segs.length && o >= segs[sg].length) { sg++; o = 0; } };
    const u8 = () => { need(); return segs[sg][o++]; };
    const u16 = () => u8() | (u8() << 8);
    const u32 = () => (u16() | (u16() << 16)) >>> 0;
    const skip = (n) => { while (n > 0) { need(); const k = Math.min(n, segs[sg].length - o); o += k; n -= k; } };
    const total = recs[si].d.readUInt32LE(4);
    for (let n = 0; n < total && sg < segs.length; n++) {
      let cch = u16(), flags = u8(); const rich = flags & 8 ? u16() : 0, ext = flags & 4 ? u32() : 0;
      let s = "", high = flags & 1;
      while (cch > 0) {
        if (o >= segs[sg].length) { sg++; o = 0; high = segs[sg][o++] & 1; } // a CONTINUE record restarts with an option byte
        const seg = segs[sg], avail = high ? Math.floor((seg.length - o) / 2) : seg.length - o, k = Math.min(cch, avail);
        s += high ? seg.toString("utf16le", o, o + 2 * k) : seg.toString("latin1", o, o + k);
        o += high ? 2 * k : k; cch -= k;
      }
      skip(rich * 4 + ext); sst.push(s);
    }
  }
  const col = (c) => { let s = ""; c++; while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
  const rk = (v) => { let n = v & 2 ? v >> 2 : (() => { const t = Buffer.alloc(8); t.writeUInt32LE((v & 0xfffffffc) >>> 0, 4); return t.readDoubleLE(0); })(); return v & 1 ? n / 100 : n; };
  const rows = [];
  const set = (r, c, v) => { (rows[r] ??= {})[col(c)] = String(v); };
  let sheet = -1;
  for (const { t, d } of recs) {
    if (t === 0x0809 && d.readUInt16LE(2) === 0x0010) { sheet++; continue; }
    if (sheet !== 0) continue;
    if (t === 0x000a && sheet === 0) { sheet = 1; continue; } // EOF of the first worksheet
    if (t === 0x00fd) set(d.readUInt16LE(0), d.readUInt16LE(2), sst[d.readUInt32LE(6)]);
    else if (t === 0x0203) set(d.readUInt16LE(0), d.readUInt16LE(2), d.readDoubleLE(6));
    else if (t === 0x027e) set(d.readUInt16LE(0), d.readUInt16LE(2), rk(d.readInt32LE(6)));
    else if (t === 0x00bd) { const r = d.readUInt16LE(0); let c = d.readUInt16LE(2); for (let o = 4; o + 6 <= d.length - 2; o += 6) set(r, c++, rk(d.readInt32LE(o + 2))); }
    else if (t === 0x0204) { const n = d.readUInt16LE(6), hi = d[8] & 1; set(d.readUInt16LE(0), d.readUInt16LE(2), hi ? d.toString("utf16le", 9, 9 + 2 * n) : d.toString("latin1", 9, 9 + n)); }
    else if (t === 0x0006 && d.readUInt16LE(12) === 0xffff) { /* string/bool formula results are not used */ }
    else if (t === 0x0006) set(d.readUInt16LE(0), d.readUInt16LE(2), d.readDoubleLE(6));
  }
  return Array.from(rows, (r) => r || {});
}

// ---------- text helpers ----------
const LATIN = { A: "Α", B: "Β", E: "Ε", H: "Η", I: "Ι", K: "Κ", M: "Μ", N: "Ν", O: "Ο", P: "Ρ", T: "Τ", X: "Χ", Y: "Υ", Z: "Ζ" };
/** Latin capitals typed by mistake inside Greek words (for example "KAI", "ΑΝΑΠTΥΞΗΣ") become the Greek letters they look like. */
const fixGreek = (s) => s.replace(/[A-Z]+/g, (w, i) => {
  const near = (s.slice(Math.max(0, i - 1), i) + s.slice(i + w.length, i + w.length + 1));
  return [...w].every((c) => LATIN[c]) && (/[Ͱ-Ͽ]/.test(near) || w === "KAI") ? [...w].map((c) => LATIN[c]).join("") : w;
});
const tidy = (s) => fixGreek(String(s ?? "")).replace(/\s+/g, " ").trim();
/** Greek upper case without accents, "&" as "ΚΑΙ", only letters and digits: used to compare names between the two files. */
const key = (s) => tidy(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/&/g, " ΚΑΙ ").replace(/[^0-9A-ZΑ-Ω]+/g, " ").trim();
const GR = { Α: "a", Β: "v", Γ: "g", Δ: "d", Ε: "e", Ζ: "z", Η: "i", Θ: "th", Ι: "i", Κ: "k", Λ: "l", Μ: "m", Ν: "n", Ξ: "x", Ο: "o", Π: "p", Ρ: "r", Σ: "s", Τ: "t", Υ: "y", Φ: "f", Χ: "ch", Ψ: "ps", Ω: "o" };
/** Lower-case ASCII (Greek letters transliterated in the ELOT 743 manner) for slugs and the search field. */
const ascii = (s) => key(s).replace(/ΟΥ/g, "ou").replace(/[Α-Ω]/g, (c) => GR[c]).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");

// ---------- institutions ----------
// The admission file names institutions by abbreviation. Each abbreviation is mapped to the full name in the ministry's list of AEI departments
// (aei_aeaa-tmhmata-7.8.2025.xls, column "Ονομασία Πανεπιστημίου"); the build checks the mapping by comparing the department names of both files.
const INSTITUTIONS = {
  "Α.Π.Θ.": "ΑΡΙΣΤΟΤΕΛΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΟΝΙΚΗΣ",
  "Α.Σ.ΠΑΙ.Τ.Ε.": "ΑΝΩΤΑΤΗ ΣΧΟΛΗ ΠΑΙΔΑΓΩΓΙΚΗΣ & ΤΕΧΝΟΛΟΓΙΚΗΣ ΕΚΠΑΙΔΕΥΣΗΣ",
  "ΑΣΚΤ": "ΑΝΩΤΑΤΗ ΣΧΟΛΗ ΚΑΛΩΝ ΤΕΧΝΩΝ",
  "ΓΕΩΠΟΝΙΚΟ ΠΑΝ.": "ΓΕΩΠΟΝΙΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ",
  "Δ.Π.Θ.": "ΔΗΜΟΚΡΙΤΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΡΑΚΗΣ",
  "ΔΙ.ΠΑ.Ε.": "ΔΙΕΘΝΕΣ ΠΑΝΕΠΙΣΤΗΜΙΟ ΤΗΣ ΕΛΛΑΔΟΣ",
  "Ε.Κ.Π.Α.": "ΕΘΝΙΚΟ ΚΑΙ ΚΑΠΟΔΙΣΤΡΙΑΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ",
  "Ε.Μ.Π.": "ΕΘΝΙΚΟ ΜΕΤΣΟΒΙΟ ΠΟΛΥΤΕΧΝΕΙΟ",
  "ΕΛ.ΜΕ.ΠΑ.": "ΕΛΛΗΝΙΚΟ ΜΕΣΟΓΕΙΑΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ",
  "ΙΟΝΙΟ ΠΑΝ/ΜΙΟ": "ΙΟΝΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ",
  "Ο.Π.Α.": "ΟΙΚΟΝΟΜΙΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ",
  "ΠΑ. ΜΑΚ.": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΜΑΚΕΔΟΝΙΑΣ",
  "ΠΑΝ. ΑΙΓΑΙΟΥ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΙΓΑΙΟΥ",
  "ΠΑΝ. ΔΥΤ. ΑΤΤΙΚΗΣ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ",
  "ΠΑΝ. ΔΥΤ. ΜΑΚ.": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΔΥΤΙΚΗΣ ΜΑΚΕΔΟΝΙΑΣ",
  "ΠΑΝ. ΘΕΣΣΑΛΙΑΣ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ",
  "ΠΑΝ. ΙΩΑΝΝΙΝΩΝ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΙΩΑΝΝΙΝΩΝ",
  "ΠΑΝ. ΚΡΗΤΗΣ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΚΡΗΤΗΣ",
  "ΠΑΝ. ΠΑΤΡΩΝ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΑΤΡΩΝ",
  "ΠΑΝ. ΠΕΙΡΑΙΑ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΕΙΡΑΙΩΣ",
  "ΠΑΝ. ΠΕΛ/ΝΗΣΟΥ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΕΛΟΠΟΝΝΗΣΟΥ",
  "ΠΑΝΤΕΙΟ": "ΠΑΝΤΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΚΟΙΝΩΝΙΚΩΝ ΚΑΙ ΠΟΛΙΤΙΚΩΝ ΕΠΙΣΤΗΜΩΝ",
  "ΠΟΛ/ΧΝΕΙΟ ΚΡΗΤΗΣ": "ΠΟΛΥΤΕΧΝΕΙΟ ΚΡΗΤΗΣ",
  "ΧΑΡΟΚΟΠΕΙΟ": "ΧΑΡΟΚΟΠΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ",
};
// Abbreviations in the ministry department list itself (column "Ονομασία Πανεπιστημίου") -> the same full names.
const LIST_ALIASES = { "ΔΙ.ΠΑ.Ε": "ΔΙΕΘΝΕΣ ΠΑΝΕΠΙΣΤΗΜΙΟ ΤΗΣ ΕΛΛΑΔΟΣ", "ΔΙ.ΠΑ.Ε.": "ΔΙΕΘΝΕΣ ΠΑΝΕΠΙΣΤΗΜΙΟ ΤΗΣ ΕΛΛΑΔΟΣ", "ΕΜΠ": "ΕΘΝΙΚΟ ΜΕΤΣΟΒΙΟ ΠΟΛΥΤΕΧΝΕΙΟ", "ΠΑΔΑ": "ΠΑΝΕΠΙΣΤΗΜΙΟ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ" };
// Not universities: military, police, coast-guard, fire-service, merchant-marine, tourism and ecclesiastical schools that also admit through the exams.
const DROP = {
  "Α.Ε.Α. ΑΘΗΝΑΣ": "ecclesiastical academy", "Π.Α.Ε.Α. ΚΡΗΤΗΣ": "ecclesiastical academy", "Α.Ε.Ν.": "merchant marine academy", "Α.Σ.Τ.Ε.": "higher school of tourism education (not an AEI)",
  "ΑΣΤ. ΣΧΟΛΕΣ": "police schools", "Λ.Σ. - ΕΛ. ΑΚΤ.": "coast guard schools", "Σ.Π.Α.": "fire academy",
  "ΣΑΝ": "military", "ΣΙ": "military", "ΣΜΥ": "military", "ΣΜΥΑ": "military", "ΣΜΥΝ": "military", "ΣΝΔ": "military", "ΣΣΑΣ": "military", "ΣΣΕ": "military",
};
// Existing university sheets in apps/web/data/universities-abroad.json (country "Grecia") that are the same institution.
const SHEETS = {
  "ΕΘΝΙΚΟ ΚΑΙ ΚΑΠΟΔΙΣΤΡΙΑΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ": "uoa-atena", "ΑΡΙΣΤΟΤΕΛΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΟΝΙΚΗΣ": "auth-salonic", "ΕΘΝΙΚΟ ΜΕΤΣΟΒΙΟ ΠΟΛΥΤΕΧΝΕΙΟ": "ntua-atena",
  "ΟΙΚΟΝΟΜΙΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ": "aueb-atena", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΚΡΗΤΗΣ": "uoc-heraklion", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΑΤΡΩΝ": "upatras-patras", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ": "uth-volos",
  "ΔΗΜΟΚΡΙΤΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΡΑΚΗΣ": "duth-komotini", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΙΩΑΝΝΙΝΩΝ": "uoi-ioannina", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΕΙΡΑΙΩΣ": "unipi-pireu",
};
// Suffixes the admission file adds to tell same-named departments of different institutions apart; they are not part of the department name.
const INST_SUFFIX = /\s+-\s+(ΑΠΘ|ΕΚΠΑ|ΔΙ\.ΠΑ\.Ε\.|ΠΑΝ\. ΜΑΚΕΔ\.|ΠΑΝΤΕΙΟ|ΠΑΝ\. ΠΑΤΡΩΝ|ΠΑΝ\. ΠΕΛ\/ΝΗΣΟΥ)(?=\s|$)/g;

// ---------- domain from the department name (careful keywords on the accent-free name; null when unsure) ----------
const RULES = [
  [/^ΙΑΤΡΙΚΗΣ$/, "medicina"], [/^ΟΔΟΝΤΙΑΤΡΙΚΗΣ$/, "medicina-dentara"], [/^ΦΑΡΜΑΚΕΥΤΙΚΗΣ$/, "farmacie"], [/^ΚΤΗΝΙΑΤΡΙΚΗΣ$/, "medicina-veterinara"],
  [/^(ΝΟΣΗΛΕΥΤΙΚΗΣ|ΜΑΙΕΥΤΙΚΗΣ)$/, "asistenta-medicala"], [/^ΦΥΣΙΚΟΘΕΡΑΠΕΙΑΣ$/, "sport-kinetoterapie"], [/^ΕΠΙΣΤΗΜΗΣ ΦΥΣΙΚΗΣ ΑΓΩΓΗΣ ΚΑΙ ΑΘΛΗΤΙΣΜΟΥ$/, "sport-kinetoterapie"],
  [/^(ΠΛΗΡΟΦΟΡΙΚΗΣ|ΕΠΙΣΤΗΜΗΣ ΥΠΟΛΟΓΙΣΤΩΝ|ΠΛΗΡΟΦΟΡΙΚΗΣ ΚΑΙ ΤΗΛΕΠΙΚΟΙΝΩΝΙΩΝ|ΠΛΗΡΟΦΟΡΙΚΗΣ ΚΑΙ ΤΗΛΕΜΑΤΙΚΗΣ)$/, "informatica"],
  [/^ΜΗΧΑΝΙΚΩΝ (ΗΛΕΚΤΡΟΝΙΚΩΝ ΥΠΟΛΟΓΙΣΤΩΝ ΚΑΙ ΠΛΗΡΟΦΟΡΙΚΗΣ|ΠΛΗΡΟΦΟΡΙΚΗΣ ΚΑΙ ΥΠΟΛΟΓΙΣΤΩΝ|ΠΛΗΡΟΦΟΡΙΚΗΣ ΥΠΟΛΟΓΙΣΤΩΝ ΚΑΙ ΤΗΛΕΠΙΚΟΙΝΩΝΙΩΝ|ΠΛΗΡΟΦΟΡΙΚΗΣ ΚΑΙ ΗΛΕΚΤΡΟΝΙΚΩΝ ΣΥΣΤΗΜΑΤΩΝ)$/, "calculatoare-it"],
  [/^(ΗΛΕΚΤΡΟΛΟΓΩΝ ΜΗΧΑΝΙΚΩΝ ΚΑΙ ΜΗΧΑΝΙΚΩΝ ΥΠΟΛΟΓΙΣΤΩΝ|ΗΛΕΚΤΡΟΛΟΓΩΝ ΚΑΙ ΗΛΕΚΤΡΟΝΙΚΩΝ ΜΗΧΑΝΙΚΩΝ|ΗΛΕΚΤΡΟΝΙΚΩΝ ΜΗΧΑΝΙΚΩΝ|ΗΛΕΚΤΡΟΛΟΓΩΝ ΜΗΧΑΝΙΚΩΝ ΚΑΙ ΤΕΧΝΟΛΟΓΙΑΣ ΥΠΟΛΟΓΙΣΤΩΝ)$/, "inginerie-electrica-electronica"],
  [/^(ΜΗΧΑΝΟΛΟΓΩΝ ΜΗΧΑΝΙΚΩΝ|ΜΗΧΑΝΟΛΟΓΩΝ ΚΑΙ ΑΕΡΟΝΑΥΠΗΓΩΝ ΜΗΧΑΝΙΚΩΝ|ΝΑΥΠΗΓΩΝ ΜΗΧΑΝΟΛΟΓΩΝ ΜΗΧΑΝΙΚΩΝ|ΝΑΥΠΗΓΩΝ ΜΗΧΑΝΙΚΩΝ)$/, "inginerie-mecanica"],
  [/^ΠΟΛΙΤΙΚΩΝ ΜΗΧΑΝΙΚΩΝ$/, "inginerie-civila"], [/^ΑΡΧΙΤΕΚΤΟΝΩΝ ΜΗΧΑΝΙΚΩΝ$/, "arhitectura"],
  [/^(ΧΗΜΙΚΩΝ ΜΗΧΑΝΙΚΩΝ|ΕΠΙΣΤΗΜΗΣ ΚΑΙ ΜΗΧΑΝΙΚΗΣ ΥΛΙΚΩΝ|ΜΗΧΑΝΙΚΩΝ ΕΠΙΣΤΗΜΗΣ ΥΛΙΚΩΝ|ΕΠΙΣΤΗΜΗΣ ΤΩΝ ΥΛΙΚΩΝ)$/, "inginerie-chimica-materiale"],
  [/^(ΜΗΧΑΝΙΚΩΝ ΠΕΡΙΒΑΛΛΟΝΤΟΣ|ΜΗΧΑΝΙΚΩΝ ΟΡΥΚΤΩΝ ΠΟΡΩΝ|ΜΕΤΑΛΛΕΙΟΛΟΓΩΝ ΜΕΤΑΛΛΟΥΡΓΩΝ ΜΗΧΑΝΙΚΩΝ|ΣΥΣΤΗΜΑΤΩΝ ΕΝΕΡΓΕΙΑΣ)$/, "energie-petrol-mediu"],
  [/^(ΜΑΘΗΜΑΤΙΚΩΝ|ΣΤΑΤΙΣΤΙΚΗΣ|ΣΤΑΤΙΣΤΙΚΗΣ ΚΑΙ ΑΣΦΑΛΙΣΤΙΚΗΣ ΕΠΙΣΤΗΜΗΣ|ΜΑΘΗΜΑΤΙΚΩΝ ΚΑΙ ΕΦΑΡΜΟΣΜΕΝΩΝ ΜΑΘΗΜΑΤΙΚΩΝ ΜΑΘΗΜΑΤΙΚΩΝ|ΜΑΘΗΜΑΤΙΚΩΝ ΚΑΙ ΕΦΑΡΜΟΣΜΕΝΩΝ ΜΑΘΗΜΑΤΙΚΩΝ ΕΦΑΡΜΟΣΜΕΝΩΝ ΜΑΘΗΜΑΤΙΚΩΝ)$/, "matematica"],
  [/^ΣΤΑΤΙΣΤΙΚΗΣ ΚΑΙ ΑΝΑΛΟΓΙΣΤΙΚΩΝ ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΩΝ ΜΑΘΗΜΑΤΙΚΩΝ$/, "matematica"], [/^ΕΦΑΡΜΟΣΜΕΝΗΣ ΠΛΗΡΟΦΟΡΙΚΗΣ .+$/, "informatica"],
  [/^ΧΗΜΙΚΩΝ ΜΗΧΑΝΙΚΩΝ ΚΑΙ ΜΗΧΑΝΙΚΩΝ ΠΕΡΙΒΑΛΛΟΝΤΟΣ$/, "inginerie-chimica-materiale"], [/^ΠΟΛΙΤΙΚΗΣ ΕΠΙΣΤΗΜΗΣ ΚΑΙ (ΔΗΜΟΣΙΑΣ ΔΙΟΙΚΗΣΗΣ|ΙΣΤΟΡΙΑΣ)$/, "stiinte-politice-relatii-internationale"],
  [/^ΙΣΤΟΡΙΑΣ ΑΡΧΑΙΟΛΟΓΙΑΣ ΚΑΙ .+$/, "istorie"], [/^ΚΟΙΝΩΝΙΚΗΣ ΘΕΟΛΟΓΙΑΣ ΚΑΙ .+$/, "teologie"],
  [/^ΦΥΣΙΚΗΣ$/, "fizica"], [/^ΧΗΜΕΙΑΣ$/, "chimie"],
  [/^(ΒΙΟΛΟΓΙΑΣ|ΜΟΡΙΑΚΗΣ ΒΙΟΛΟΓΙΑΣ ΚΑΙ ΓΕΝΕΤΙΚΗΣ|ΒΙΟΧΗΜΕΙΑΣ ΚΑΙ ΒΙΟΤΕΧΝΟΛΟΓΙΑΣ|ΒΙΟΛΟΓΙΚΩΝ ΕΦΑΡΜΟΓΩΝ ΚΑΙ ΤΕΧΝΟΛΟΓΙΩΝ)$/, "biologie"],
  [/^(ΓΕΩΛΟΓΙΑΣ|ΓΕΩΛΟΓΙΑΣ ΚΑΙ ΓΕΩΠΕΡΙΒΑΛΛΟΝΤΟΣ|ΓΕΩΓΡΑΦΙΑΣ|ΠΕΡΙΒΑΛΛΟΝΤΟΣ)$/, "geografie-mediu"],
  [/^(ΓΕΩΠΟΝΙΑΣ|ΓΕΩΠΟΝΙΑΣ .+|ΔΑΣΟΛΟΓΙΑΣ .+|ΕΠΙΣΤΗΜΗΣ ΖΩΙΚΗΣ ΠΑΡΑΓΩΓΗΣ|ΕΠΙΣΤΗΜΗΣ ΦΥΤΙΚΗΣ ΠΑΡΑΓΩΓΗΣ|ΑΛΙΕΙΑΣ ΚΑΙ ΥΔΑΤΟΚΑΛΛΙΕΡΓΕΙΩΝ|ΑΜΠΕΛΟΥΡΓΙΑΣ ΚΑΙ ΟΙΝΟΛΟΓΙΑΣ|ΑΕΙΦΟΡΙΚΗΣ ΓΕΩΡΓΙΑΣ)$/, "agronomie-silvicultura"],
  [/^(ΟΙΚΟΝΟΜΙΚΩΝ ΕΠΙΣΤΗΜΩΝ|ΟΙΚΟΝΟΜΙΚΗΣ ΕΠΙΣΤΗΜΗΣ|ΛΟΓΙΣΤΙΚΗΣ ΚΑΙ ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΗΣ|ΧΡΗΜΑΤΟΟΙΚΟΝΟΜΙΚΗΣ ΚΑΙ ΤΡΑΠΕΖΙΚΗΣ ΔΙΟΙΚΗΤΙΚΗΣ|ΔΙΕΘΝΩΝ ΚΑΙ ΕΥΡΩΠΑΙΚΩΝ ΟΙΚΟΝΟΜΙΚΩΝ ΣΠΟΥΔΩΝ)$/, "economie-finante"],
  [/^(ΔΙΟΙΚΗΣΗΣ ΕΠΙΧΕΙΡΗΣΕΩΝ|ΔΙΟΙΚΗΣΗΣ ΕΠΙΧΕΙΡΗΣΕΩΝ ΚΑΙ ΟΡΓΑΝΙΣΜΩΝ|ΟΡΓΑΝΩΣΗΣ ΚΑΙ ΔΙΟΙΚΗΣΗΣ ΕΠΙΧΕΙΡΗΣΕΩΝ)$/, "business-management"],
  [/^ΜΑΡΚΕΤΙΝΓΚ ΚΑΙ ΕΠΙΚΟΙΝΩΝΙΑΣ$/, "marketing"], [/^(ΔΙΟΙΚΗΣΗΣ ΤΟΥΡΙΣΜΟΥ|ΤΟΥΡΙΣΤΙΚΩΝ ΣΠΟΥΔΩΝ|ΤΟΥΡΙΣΜΟΥ|ΟΙΚΟΝΟΜΙΚΗΣ ΚΑΙ ΔΙΟΙΚΗΣΗΣ ΤΟΥΡΙΣΜΟΥ)$/, "turism-servicii"],
  [/^ΝΟΜΙΚΗΣ$/, "drept"], [/^ΔΗΜΟΣΙΑΣ ΔΙΟΙΚΗΣΗΣ$/, "administratie-publica"],
  [/^(ΠΟΛΙΤΙΚΗΣ ΕΠΙΣΤΗΜΗΣ|ΠΟΛΙΤΙΚΩΝ ΕΠΙΣΤΗΜΩΝ|ΠΟΛΙΤΙΚΗΣ ΕΠΙΣΤΗΜΗΣ ΚΑΙ ΔΙΕΘΝΩΝ ΣΧΕΣΕΩΝ|ΔΙΕΘΝΩΝ ΚΑΙ ΕΥΡΩΠΑΙΚΩΝ ΣΠΟΥΔΩΝ)$/, "stiinte-politice-relatii-internationale"],
  [/^(ΚΟΙΝΩΝΙΟΛΟΓΙΑΣ|ΚΟΙΝΩΝΙΚΗΣ ΕΡΓΑΣΙΑΣ|ΚΟΙΝΩΝΙΚΗΣ ΠΟΛΙΤΙΚΗΣ|ΚΟΙΝΩΝΙΚΗΣ ΑΝΘΡΩΠΟΛΟΓΙΑΣ)$/, "sociologie-asistenta-sociala"], [/^ΨΥΧΟΛΟΓΙΑΣ$/, "psihologie"],
  [/^(ΔΗΜΟΣΙΟΓΡΑΦΙΑΣ ΚΑΙ ΜΕΣΩΝ ΜΑΖΙΚΗΣ ΕΠΙΚΟΙΝΩΝΙΑΣ|ΕΠΙΚΟΙΝΩΝΙΑΣ ΚΑΙ ΜΕΣΩΝ ΜΑΖΙΚΗΣ ΕΝΗΜΕΡΩΣΗΣ|ΕΠΙΚΟΙΝΩΝΙΑΣ ΜΕΣΩΝ ΚΑΙ ΠΟΛΙΤΙΣΜΟΥ|ΕΠΙΚΟΙΝΩΝΙΑΣ ΚΑΙ ΨΗΦΙΑΚΩΝ ΜΕΣΩΝ|ΨΗΦΙΑΚΩΝ ΜΕΣΩΝ ΚΑΙ ΕΠΙΚΟΙΝΩΝΙΑΣ)$/, "comunicare-jurnalism"],
  [/^(ΠΑΙΔΑΓΩΓΙΚΟ .+|ΕΠΙΣΤΗΜΩΝ ΠΡΟΣΧΟΛΙΚΗΣ ΑΓΩΓΗΣ ΚΑΙ ΕΚΠΑΙΔΕΥΣΗΣ|ΕΠΙΣΤΗΜΩΝ ΤΗΣ ΕΚΠΑΙΔΕΥΣΗΣ .+|ΕΚΠΑΙΔΕΥΣΗΣ ΚΑΙ ΑΓΩΓΗΣ ΣΤΗΝ ΠΡΟΣΧΟΛΙΚΗ ΗΛΙΚΙΑ|ΕΠΙΣΤΗΜΩΝ ΤΗΣ ΠΡΟΣΧΟΛΙΚΗΣ ΑΓΩΓΗΣ .+|ΑΓΩΓΗΣ ΚΑΙ ΦΡΟΝΤΙΔΑΣ ΣΤΗΝ ΠΡΩΙΜΗ ΠΑΙΔΙΚΗ ΗΛΙΚΙΑ)$/, "stiintele-educatiei"],
  [/^(.+ ΓΛΩΣΣΑΣ ΚΑΙ ΦΙΛΟΛΟΓΙΑΣ.*|ΦΙΛΟΛΟΓΙΑΣ|ΞΕΝΩΝ ΓΛΩΣΣΩΝ ΜΕΤΑΦΡΑΣΗΣ ΚΑΙ ΔΙΕΡΜΗΝΕΙΑΣ)$/, "litere-limbi-straine"],
  [/^(ΙΣΤΟΡΙΑΣ ΚΑΙ ΑΡΧΑΙΟΛΟΓΙΑΣ|ΙΣΤΟΡΙΑΣ ΑΡΧΑΙΟΛΟΓΙΑΣ)$/, "istorie"], [/^ΦΙΛΟΣΟΦΙΑΣ$/, "filosofie"], [/^ΘΕΟΛΟΓΙΑΣ$/, "teologie"],
  [/^(ΜΟΥΣΙΚΩΝ ΣΠΟΥΔΩΝ|ΜΟΥΣΙΚΗΣ ΕΠΙΣΤΗΜΗΣ ΚΑΙ ΤΕΧΝΗΣ)$/, "muzica"], [/^(ΘΕΑΤΡΟΥ|ΘΕΑΤΡΙΚΩΝ ΣΠΟΥΔΩΝ|ΚΙΝΗΜΑΤΟΓΡΑΦΟΥ)$/, "teatru-film"],
  [/^(ΓΡΑΦΙΣΤΙΚΗΣ ΚΑΙ ΟΠΤΙΚΗΣ ΕΠΙΚΟΙΝΩΝΙΑΣ|ΦΩΤΟΓΡΑΦΙΑΣ ΚΑΙ ΟΠΤΙΚΟΑΚΟΥΣΤΙΚΩΝ ΤΕΧΝΩΝ|ΕΣΩΤΕΡΙΚΗΣ ΑΡΧΙΤΕΚΤΟΝΙΚΗΣ|ΔΗΜΙΟΥΡΓΙΚΟΥ ΣΧΕΔΙΑΣΜΟΥ ΚΑΙ ΕΝΔΥΣΗΣ)$/, "arte-vizuale-design"],
];
const domainOf = (name) => { const k = key(name); for (const [re, d] of RULES) if (re.test(k)) return d; return null; };

// ---------- ministry department list (school, semesters, website) ----------
const list = readXls(`${raw}/${FILES.depts[0]}`);
const hdr = list.findIndex((r) => tidy(r.A) === "Ονομασία Τμήματος");
if (hdr < 0) throw new Error("department list: header row not found");
const listRows = list.slice(hdr + 1).filter((r) => tidy(r.A) && tidy(r.C)).map((r) => {
  const inst = tidy(r.C); const full = LIST_ALIASES[inst] || inst;
  return { inst: key(full), name: tidy(r.A), k: key(tidy(r.A).replace(/\([^()]*\)/g, " ")).replace(/^ΤΜΗΜΑ /, ""), sem: tidy(r.B), town: key(r.E), school: tidy(r.F), web: tidy(r.L), note: tidy(r.M) };
});
const listInsts = new Set(listRows.map((r) => r.inst));

// ---------- admission file ----------
const bases = readXlsx(`${raw}/${FILES.bases[0]}`);
const bh = bases.findIndex((r) => tidy(r.A) === "ΙΔΡΥΜΑ" && tidy(r.B) === "ΚΩΔΙΚΟΣ ΣΧΟΛΗΣ");
if (bh < 0) throw new Error("admission file: header row not found");
const depts = new Map(); // code -> { abbr, text }
for (const r of bases.slice(bh + 1)) {
  const abbr = tidy(r.A), code = tidy(r.B), text = tidy(r.C); if (!abbr || !code) continue;
  const prev = depts.get(code);
  if (prev && (prev.abbr !== abbr || prev.text !== text)) throw new Error(`code ${code} has two names`);
  depts.set(code, { abbr, text });
}

const stats = { codes: depts.size, dropped: {}, unknownInst: [], noTown: [], matched: 0, unmatched: [], ambiguous: [] };
const insts = new Map(); const programs = [];
// semesters as the list writes them: "8", "10 εξάμηνα", "ΟΚΤΩ (8)"; anything else (for example "-") gives no years
const sem2years = (s) => { const m = s.match(/^(\d+)( εξάμηνα)?$|^[Α-Ω]+ \((\d+)\)$/); const n = m ? +(m[1] || m[3]) : 0; return n >= 6 && n <= 12 && n % 2 === 0 ? n / 2 : undefined; };
const webUrl = (s) => { let u = s.split(/\s+/)[0]; if (/^www\./i.test(u)) u = "https://" + u; return /^https?:\/\/[^\s/]+\.[^\s]+$/.test(u) ? u : undefined; };

for (const [code, { abbr, text }] of [...depts].sort((a, b) => +a[0] - +b[0])) {
  if (DROP[abbr]) { stats.dropped[DROP[abbr]] = (stats.dropped[DROP[abbr]] || 0) + 1; continue; }
  const full = INSTITUTIONS[abbr];
  if (!full) { stats.unknownInst.push(`${code} ${abbr}`); continue; }
  if (!listInsts.has(key(full))) throw new Error(`institution "${full}" is not in the ministry list`);
  // name and town: "ΝΑΜΕ (TOWN) - DIRECTION (Μετονομασία του Τμήματος OLD)"
  let t = text.replace(/\s*\(Μετονομασία του Τμήματος [^)]*\)/g, "");
  const m = t.match(/\(([^()]+)\)/);
  if (!m) { stats.noTown.push(`${code} ${text}`); continue; }
  const city = tidy(m[1]);
  const name = tidy(t.replace(m[0], " ").replace(INST_SUFFIX, "").replace(/\s+-\s*$/, ""));
  // enrichment from the ministry list: only when exactly one department of the same institution has the same name (and the same town when there are several)
  let cands = listRows.filter((r) => r.inst === key(full) && r.k === key(name));
  if (cands.length > 1) cands = cands.filter((r) => r.town.includes(key(city)));
  const hit = cands.length === 1 ? cands[0] : null;
  if (hit) stats.matched++; else (cands.length > 1 ? stats.ambiguous : stats.unmatched).push(`${code} ${abbr} | ${name} (${city})`);
  if (hit && /Καταργείται/.test(hit.note)) throw new Error(`${code} is marked as abolished in the ministry list`);

  const id = SHEETS[full] || `gr-${slug(full)}`;
  if (!insts.has(id)) insts.set(id, { id, country: CC, source: SOURCE, name: full, officialName: full, towns: {}, kind: "public", hasSheet: Boolean(SHEETS[full]), programs: 0 });
  const inst = insts.get(id); inst.programs++; inst.towns[city] = (inst.towns[city] || 0) + 1;
  const p = {
    key: `gr-${code}-${slug(name).slice(0, 80).replace(/-$/, "")}`, country: CC, institutionId: id, institutionName: full, city,
    ...(hit && hit.school ? { faculty: hit.school } : {}),
    domain: "no field given in source", domainId: domainOf(name), name, language: "nespecificată", // no source states the teaching language
    ...(hit && sem2years(hit.sem) ? { years: sem2years(hit.sem) } : {}),
    ...(hit && webUrl(hit.web) ? { url: webUrl(hit.web) } : {}),
    source: SOURCE,
  };
  p.search = ascii([p.name, p.faculty || "", p.institutionName, abbr, p.city].join(" "));
  programs.push(p);
}

// Two admission codes for the same department (same institution, name and town) become one row; codes with a different direction in the name stay apart.
{
  const seen = new Map(), merged = [];
  for (let k = programs.length - 1; k >= 0; k--) seen.set(`${programs[k].institutionId}|${programs[k].name}|${programs[k].city}`, k);
  for (let k = programs.length - 1; k >= 0; k--) {
    const id = `${programs[k].institutionId}|${programs[k].name}|${programs[k].city}`;
    if (seen.get(id) !== k) { merged.push(`${programs[k].key} -> ${programs[seen.get(id)].key}`); insts.get(programs[k].institutionId).programs--; programs.splice(k, 1); }
  }
  console.log(`merged rows (same department, two codes): ${merged.length}`, merged);
}

// Institution seat: the town of the institution's own postal address on its official site (or the founding law), checked on 2026-10-19; see README for each source.
// Written in capitals without accents like the programme towns. Institutions missing here have no seat confirmed by an official text (see README):
// they are left out together with all their programme rows.
const SEATS = {
  "ΕΛΛΗΝΙΚΟ ΜΕΣΟΓΕΙΑΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ": "ΗΡΑΚΛΕΙΟ", // Law 4610/2019 art. 23 par. 1: "με έδρα το Ηράκλειο"
  "ΑΝΩΤΑΤΗ ΣΧΟΛΗ ΚΑΛΩΝ ΤΕΧΝΩΝ": "ΑΘΗΝΑ", "ΑΝΩΤΑΤΗ ΣΧΟΛΗ ΠΑΙΔΑΓΩΓΙΚΗΣ & ΤΕΧΝΟΛΟΓΙΚΗΣ ΕΚΠΑΙΔΕΥΣΗΣ": "ΜΑΡΟΥΣΙ", "ΑΡΙΣΤΟΤΕΛΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΟΝΙΚΗΣ": "ΘΕΣΣΑΛΟΝΙΚΗ",
  "ΓΕΩΠΟΝΙΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ": "ΑΘΗΝΑ", "ΔΗΜΟΚΡΙΤΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΡΑΚΗΣ": "ΚΟΜΟΤΗΝΗ", "ΔΙΕΘΝΕΣ ΠΑΝΕΠΙΣΤΗΜΙΟ ΤΗΣ ΕΛΛΑΔΟΣ": "ΘΕΣΣΑΛΟΝΙΚΗ",
  "ΙΟΝΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ": "ΚΕΡΚΥΡΑ", "ΟΙΚΟΝΟΜΙΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ": "ΑΘΗΝΑ", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΙΓΑΙΟΥ": "ΜΥΤΙΛΗΝΗ", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ": "ΑΘΗΝΑ",
  "ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ": "ΒΟΛΟΣ", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΙΩΑΝΝΙΝΩΝ": "ΙΩΑΝΝΙΝΑ", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΜΑΚΕΔΟΝΙΑΣ": "ΘΕΣΣΑΛΟΝΙΚΗ", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΑΤΡΩΝ": "ΡΙΟ",
  "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΕΙΡΑΙΩΣ": "ΠΕΙΡΑΙΑΣ", "ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΕΛΟΠΟΝΝΗΣΟΥ": "ΤΡΙΠΟΛΗ", "ΠΑΝΤΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΚΟΙΝΩΝΙΚΩΝ ΚΑΙ ΠΟΛΙΤΙΚΩΝ ΕΠΙΣΤΗΜΩΝ": "ΑΘΗΝΑ",
  "ΠΟΛΥΤΕΧΝΕΙΟ ΚΡΗΤΗΣ": "ΧΑΝΙΑ", "ΧΑΡΟΚΟΠΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ": "ΚΑΛΛΙΘΕΑ",
};
const noSeat = [...insts.values()].filter((i) => !SEATS[i.name]);
for (const i of noSeat) console.log(`left out, seat not confirmed: ${i.name} (${i.programs} programmes)`);
const noSeatIds = new Set(noSeat.map((i) => i.id));
for (let k = programs.length - 1; k >= 0; k--) if (noSeatIds.has(programs[k].institutionId)) programs.splice(k, 1);
const institutions = [...insts.values()].filter((i) => SEATS[i.name]).map(({ towns, ...i }) => {
  const { programs: n, ...rest } = i; return { ...rest, city: SEATS[i.name], programs: n };
}).sort((a, b) => a.name.localeCompare(b.name, "el"));
programs.sort((a, b) => a.institutionName.localeCompare(b.institutionName, "el") || a.name.localeCompare(b.name, "el"));

writeFileSync(new URL(`${CC.toLowerCase()}-institutions.json`, OUT), JSON.stringify(institutions, null, 1) + "\n");
writeFileSync(new URL(`${CC.toLowerCase()}-programs.json`, OUT), JSON.stringify(programs) + "\n");
console.log(`codes in the admission file: ${stats.codes}; dropped:`, stats.dropped);
if (stats.unknownInst.length) console.log("unknown institution abbreviations (left out):", stats.unknownInst);
if (stats.noTown.length) console.log("no town in brackets (left out):", stats.noTown);
console.log(`matched to the ministry department list: ${stats.matched}; not matched: ${stats.unmatched.length}; ambiguous: ${stats.ambiguous.length}`);
for (const s of [...stats.unmatched, ...stats.ambiguous]) console.log("  no school/years/url:", s);
console.log(`${institutions.length} institutions, ${programs.length} programmes, ${programs.filter((p) => p.domainId === null).length} without a domain`);
