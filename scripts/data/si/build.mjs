// Builds the Slovenian catalogue (institutions + bachelor programmes) from the eVŠ "Razvid" register (public SOAP service, CC BY 4.0), keeping only the programmes of the official 2026/2027 call for enrolment. Usage: node scripts/data/si/build.mjs <raw folder>
// The raw folder gets the register answers (evs-*.xml), the call's tables (razpis/*.xlsx) and the call's programme list (list/p*.html); missing files are downloaded.
const CC = "SI";
const SOURCE = "eVŠ Razvid 2026-10 + Razpis za vpis 2026/2027";
const STUDY_YEAR = "2026/2027";
const SOAP_URL = "https://portal-sola.evs.gov.si/ws/razvid/1.0";
const CALL_BASE = "https://www.gov.si/assets/ministrstva/MVZI/Visoko-solstvo/RAZPISI-2026_2027/Skupni-razpis/Vpisna-mesta/";
const CALL_TABLES = ["Univerza-v-Ljubljani", "Univerza-v-Mariboru", "Univerza-na-Primorskem", "Univerza-v-Novi-Gorici", "Univerza-v-Novem-mestu", "Nova-univerza", "Univerza-Alma-Mater-Europaea", "Koncesije-mesta-tudi-izredni-studij"];
const CALL_LIST = "https://www.gov.si/zbirke/javne-objave/razpis-za-vpis-v-dodiplomske-in-enovite-magistrske-studijske-programe-v-studijskem-letu-2026-2027/razpisi-za-vpis-v-visokosolske-studijske-programe-v-studijskem-letu-2026-2027/";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { iscedToDomain } from "../isced.mjs";

const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);
const raw = process.argv[2];
if (!raw) { console.error("usage: node scripts/data/si/build.mjs <raw folder>"); process.exit(1); }
for (const d of ["", "/razpis", "/list"]) mkdirSync(raw + d, { recursive: true });

// ---- download (only what is missing) ---------------------------------------------------------
async function soap(op, year) {
  const body = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:r="https://evs.gov.si/ws/razvid/1.0"><soapenv:Header/><soapenv:Body><r:${op}><posiljatelj_naziv>FindMyUni</posiljatelj_naziv><casovni_zig_zahteve>${new Date().toISOString().slice(0, 19)}</casovni_zig_zahteve><namen_dostopa>Katalog studijskih programov (odprti podatki)</namen_dostopa>${year ? `<studijsko_leto>${year}</studijsko_leto>` : ""}</r:${op}></soapenv:Body></soapenv:Envelope>`;
  const r = await fetch(SOAP_URL, { method: "POST", headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: "" }, body });
  if (!r.ok) throw new Error(`${op}: HTTP ${r.status}`);
  return r.text();
}
const get = async (url) => { const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 FindMyUni-data" } }); if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`); return Buffer.from(await r.arrayBuffer()); };
async function ensureRaw() {
  const zf = `${raw}/evs-Zavode.xml`, pf = `${raw}/evs-Programe-${STUDY_YEAR.replace("/", "-")}.xml`;
  if (!existsSync(zf)) { console.log("downloading institutions"); writeFileSync(zf, await soap("PridobiZavode")); }
  if (!existsSync(pf)) { console.log("downloading programmes", STUDY_YEAR); writeFileSync(pf, await soap("PridobiPrograme", STUDY_YEAR)); }
  for (const t of CALL_TABLES) { const f = `${raw}/razpis/${t}.xlsx`; if (!existsSync(f)) { console.log("downloading", t); writeFileSync(f, await get(CALL_BASE + t + ".xlsx")); } }
  for (let s = 0; s <= 300; s += 10) { const f = `${raw}/list/p${s}.html`; if (!existsSync(f)) { writeFileSync(f, await get(`${CALL_LIST}?start=${s}`)); await new Promise((r) => setTimeout(r, 800)); } }
}
await ensureRaw();

// ---- helpers ---------------------------------------------------------------------------------
const ent = (s) => String(s ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&#8203;|​/g, "");
const tidy = (s) => ent(s).normalize("NFC").replace(/ﬁ/g, "fi").replace(/\s+/g, " ").trim();
/** Comparison key: lower case, dashes and punctuation as spaces. Only used to compare names, never shown. */
const N = (s) => tidy(s).toLowerCase().replace(/[–—‑-]/g, " ").replace(/[,.;:()"'’]/g, " ").replace(/\s+/g, " ").trim();
const ascii = (s) => tidy(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");
const g = (s, t) => { const m = s.match(new RegExp(`<${t}>([^<]*)</${t}>`)); return m ? tidy(m[1]) : undefined; };
const ga = (s, t) => [...s.matchAll(new RegExp(`<${t}>([^<]*)</${t}>`, "g"))].map((m) => tidy(m[1]));
const blocks = (s, t) => [...s.matchAll(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`, "g"))].map((m) => m[1]);

/** Minimal xlsx reader: first sheet as rows of {A: "...", B: "..."}. */
function xlsx(file) {
  const b = readFileSync(file); const files = {}; let e = b.length - 22;
  while (e >= 0 && b.readUInt32LE(e) !== 0x06054b50) e--;
  const n = b.readUInt16LE(e + 10); let p = b.readUInt32LE(e + 16);
  for (let i = 0; i < n; i++) {
    const method = b.readUInt16LE(p + 10), csize = b.readUInt32LE(p + 20), nl = b.readUInt16LE(p + 28), xl = b.readUInt16LE(p + 30), cl = b.readUInt16LE(p + 32), off = b.readUInt32LE(p + 42);
    const name = b.toString("utf8", p + 46, p + 46 + nl); p += 46 + nl + xl + cl;
    const start = off + 30 + b.readUInt16LE(off + 26) + b.readUInt16LE(off + 28), data = b.subarray(start, start + csize);
    files[name] = (method === 0 ? data : inflateRawSync(data)).toString("utf8");
  }
  const ss = files["xl/sharedStrings.xml"] ? blocks(files["xl/sharedStrings.xml"], "si").map((x) => ent([...x.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""))) : [];
  const sheet = files["xl/worksheets/sheet1.xml"];
  return [...sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((r) => {
    const row = {};
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const t = (c[2].match(/t="(\w+)"/) || [])[1], v = (c[3] || "").match(/<v>([\s\S]*?)<\/v>/), is = (c[3] || "").match(/<t[^>]*>([\s\S]*?)<\/t>/);
      let val = v ? v[1] : is ? is[1] : ""; if (t === "s") val = ss[+val]; row[c[1]] = tidy(val);
    }
    return row;
  });
}

// ---- 1. the register (eVŠ Razvid) ------------------------------------------------------------
const zav = {}; // latest record per institution id
for (const z of readFileSync(`${raw}/evs-Zavode.xml`, "utf8").split("<zavod_podatki>").slice(1)) {
  const r = { id: g(z, "zav_id"), ime: g(z, "zav_ime"), kratica: g(z, "zav_kratica"), uni: g(z, "univerza_naziv"), web: g(z, "zav_spletni_naslov"), od: g(z, "stud_leto_od") || "",
    seat: blocks(z, "zav_kraji_izvajanja").filter((k) => g(k, "sedez") === "D").map((k) => g(k, "naziv_enote"))[0] };
  if (!zav[r.id] || r.od > zav[r.id].od) zav[r.id] = r;
}
const TYPES = { "01": "univerzitetni", "02": "visokošolski strokovni", "03": "enoviti magistrski" };
const progs = readFileSync(`${raw}/evs-Programe-${STUDY_YEAR.replace("/", "-")}.xml`, "utf8").split("<program_podatki>").slice(1).map((s) => s.split("</program_podatki>")[0]).map((p) => ({
  id: g(p, "prog_lok_id1"), ime: g(p, "prog_ime"), ang: g(p, "prog_ime_ang"), vrsta: g(p, "prog_vrsta"), dvopred: g(p, "prog_ind_dvopred"), jezik: g(p, "prog_ucni_jezik"),
  traj: g(p, "prog_traj"), trajEnota: g(p, "prog_traj_enota"), ects: g(p, "prog_kred_tocke"), od: g(p, "stud_leto_od"), do: g(p, "stud_leto_do"), akt: g(p, "prog_ind_akt"),
  isced: blocks(p, "prog_isced_f_podatki").map((b) => ({ code: g(b, "prog_isced_f_field"), main: g(b, "prog_isced_f_glavni") === "D" })),
  zavodi: blocks(p, "zavodi_programa_podatki").map((b) => ({ id: g(b, "zav_id"), nosilec: g(b, "nosilec") === "D", kraji: ga(b, "naziv_enote") })),
}));
// First cycle (01 univerzitetni, 02 visokošolski strokovni) and integrated long programmes (03 enoviti magistrski), version valid in the study year, active.
const bach = progs.filter((p) => TYPES[p.vrsta] && !p.do && p.akt === "D");
console.log("register: versions valid in", STUDY_YEAR, progs.length, "| bachelor-level", bach.length);

// ---- 2. the official call for enrolment 2026/2027 ---------------------------------------------
// Abbreviations in the call's tables that differ from the register's own abbreviation (the call's list page spells them out).
const ABBR = { "ECM": "Fakulteta ECM", "AREMA": "AREMA ROGAŠKA SLATINA", "FZSV": "FZSV SG", "FZV CELJE": "VZŠCE", "NU EVRO PF": "NU, Evro-PF", "VS GRM": "#0026105" };
const normAbbr = (s) => tidy(s).toUpperCase().replace(/[,\-–]/g, " ").replace(/\s+/g, " ").trim();
const byAbbr = {}; for (const z of Object.values(zav)) if (z.kratica) byAbbr[normAbbr(z.kratica)] = z.id;
function abbrToIds(cell) {
  const out = []; let prefix = "";
  for (let part of tidy(cell).split(/,| in /)) {
    part = normAbbr(part); if (!part) continue;
    if (/^(UL|UM|UP|UNG|UNM|NU)\b/.test(part)) prefix = part.split(" ")[0]; else if (prefix && !byAbbr[part] && !ABBR[part]) part = `${prefix} ${part}`;
    const a = ABBR[part]; const id = a ? (a.startsWith("#") ? a.slice(1) : byAbbr[normAbbr(a)]) : byAbbr[part];
    out.push(id || null);
  }
  return out;
}
const LANG = { SLO: "slovenă", ANG: "engleză", NEM: "germană", ITA: "italiană", HRV: "croată", SRB: "sârbă", ALB: "albaneză" };
const langs = (s) => [...new Set(String(s || "").toUpperCase().split(/[;/,\s]+/).filter(Boolean).map((c) => LANG[c] || null))];
// "Obvestilo o neizvajanju študijskih programov" (call notice of 22 Sep 2026): programme variants that will NOT run in 2026/27 (part-time variants are not separated here).
const NOT_RUN = [{ abbr: "UM FOV", name: "krizni management", lang: "ANG" }, { abbr: "FIŠ", name: "poslovanje v informacijski družbi", lang: "SLO" }];
const TYPE_CODE = { UN: "01", UM: "01", VS: "02", EMAG: "03", EM: "03" }; // "UM" is a typo for UN in one list entry; "EM" = EMAG in the tables

const tableRows = [];
for (const t of CALL_TABLES) {
  const rows = xlsx(`${raw}/razpis/${t}.xlsx`); const h = rows.findIndex((r) => r.A === "ZAVOD");
  for (const r of rows.slice(h + 1)) {
    if (!r.B || !r.E || /^SKUPAJ/i.test(r.A || "")) continue;
    const name = r.B.replace(/\d+$/, "").replace(/\s*\(Modul [^)]*\)$/, "").trim(); // footnote digits; "(Modul za …)" = modules of the same programme
    for (const ty of r.E.split(/\s+in\s+/)) {
      if (!TYPE_CODE[ty.trim()]) { console.warn("unknown type", t, r.B, r.E); continue; }
      tableRows.push({ table: t, abbr: r.A, insts: abbrToIds(r.A), name, smer: r.C, kraj: r.D, type: TYPE_CODE[ty.trim()], jezik: r.F, dvopr: r.G });
    }
  }
}
const listRows = [];
for (const f of readdirSync(`${raw}/list`).filter((f) => f.endsWith(".html"))) {
  for (const tr of readFileSync(`${raw}/list/${f}`, "utf8").normalize("NFC").split("<tr>").slice(1)) {
    const cells = [...tr.matchAll(/data-key="([^"]*)">\s*<div class="cell">([\s\S]*?)<\/div>\s*<\/td>/g)].map((c) => tidy(c[2].replace(/<small>[\s\S]*?<\/small>/g, "").replace(/<[^>]+>/g, " ")));
    if (cells.length < 4 || !cells[1].startsWith("1.")) continue; // first cycle and integrated programmes only
    const [inst, , list, fin] = cells;
    for (const it of list.replace(/\(pdf[^)]*\)/g, "").matchAll(/\s*([^()]+?)\s*\(((?:UN|VS|EMAG|UM)(?: in (?:UN|VS|EMAG))?)\)(?:\s*-\s*[^,(]+(?:, [^,(]+)*)?\s*(?:,|$)/g))
      for (const ty of it[2].split(" in ")) listRows.push({ inst, fin, name: it[1].trim(), type: TYPE_CODE[ty] });
  }
}
console.log("call: table rows", tableRows.length, "| list rows", listRows.length);

// The call lists Fakulteta za informacijske študije v Novem mestu among the independent institutions (javno), while the register still names Univerza v Novem mestu as its university.
const OWN_INSTITUTION = new Set(["0000102"]);
// Institutions named in a list row: the register name must appear in it (or it in the register name), and the university too when the register has one.
const zlist = Object.values(zav).filter((z) => z.ime);
const baseName = (s) => N(s.replace(/, samostojni visokošolski zavod.*$/i, "").replace(/, zavod$/i, "").replace(/ \(od .*$/, ""));
function listInsts(label) {
  const n = ` ${N(label)} `;
  const hit = zlist.filter((z) => { const b = baseName(z.ime); return b.length > 8 && (n.includes(` ${b} `) || ` ${b} `.includes(n)); });
  const exact = hit.filter((z) => baseName(z.ime) === N(label));
  if (exact.length) return exact.map((z) => z.id);
  const withUni = hit.filter((z) => z.uni && n.includes(` ${N(z.uni)} `));
  if (/univerz/i.test(label)) return withUni.map((z) => z.id);
  // an independent institution: only register institutions without a university, and only the longest name found
  // (so "Fakulteta za zdravstvene vede v Celju" does not also pick every "Fakulteta za zdravstvene vede")
  const own = hit.filter((z) => !z.uni || OWN_INSTITUTION.has(z.id));
  const longest = Math.max(0, ...own.map((z) => baseName(z.ime).length));
  return own.filter((z) => baseName(z.ime).length === longest).map((z) => z.id);
}
// The register itself names one merger: MLC Ljubljana "od 2. 6. 2025 pripojen k B2 Visoka šola za poslovne vede".
const MERGED = {}; for (const z of zlist) { const m = z.ime.match(/pripojen k (.+?)\)/); if (m) { const to = zlist.find((y) => baseName(y.ime) === N(m[1])); if (to) MERGED[to.id] = [...(MERGED[to.id] || []), z.id]; } }
const expand = (ids) => [...new Set(ids.flatMap((id) => [id, ...(MERGED[id] || [])]))];

/** Register programmes for one call row: same name and type, at one of the named institutions (or, when none, registered at their university itself);
 * then the one- or two-subject flag; then the carrier institution. */
const uniIdOf = (zid) => { const z = zav[zid]; const u = z?.uni && zlist.find((y) => y.ime === z.uni && !y.uni); return u ? u.id : null; };
function findProgs(name, type, insts, dvopr) {
  insts = expand(insts.filter(Boolean));
  const c = findIn(name, type, insts, dvopr);
  if (c.length) return c;
  const unis = [...new Set(insts.map(uniIdOf).filter(Boolean))];
  return unis.length ? findIn(name, type, unis, dvopr) : c;
}
function findIn(name, type, insts, dvopr) {
  let c = bach.filter((p) => p.vrsta === type && N(p.ime) === N(name) && p.zavodi.some((z) => insts.includes(z.id)));
  if (c.length > 1 && (dvopr === "D" || dvopr === "N")) { const d = c.filter((p) => p.dvopred === dvopr); if (d.length) c = d; }
  if (c.length > 1) { const k = c.filter((p) => p.zavodi.some((z) => z.nosilec && insts.includes(z.id))); if (k.length) c = k; }
  return c;
}

// ---- 3. match the call to the register --------------------------------------------------------
const groups = new Map(); // key -> { progs, insts, tableRows[], listRows[] }
const dropped = [];
const addTo = (cands, insts, kind, row) => {
  const key = cands.map((p) => p.id).sort().join("+");
  if (!groups.has(key)) groups.set(key, { progs: cands, insts: new Set(), table: [], list: [] });
  const gr = groups.get(key); insts.forEach((i) => gr.insts.add(i)); gr[kind].push(row);
};
for (const r of tableRows) {
  if (r.insts.some((i) => !i)) { dropped.push(`table ${r.abbr} | ${r.name}: institution abbreviation not in the register`); continue; }
  const c = findProgs(r.name, r.type, r.insts, r.dvopr);
  if (!c.length) { dropped.push(`table ${r.abbr} | ${r.name} (${r.type}): no register programme with this name`); continue; }
  addTo(c, [...expand(r.insts), ...r.insts.map(uniIdOf).filter(Boolean)], "table", r);
}
for (const r of listRows) {
  const insts = listInsts(r.inst);
  if (!insts.length) { dropped.push(`list ${r.inst} | ${r.name}: institution not found in the register under this name`); continue; }
  const c = findProgs(r.name, r.type, insts, null);
  if (!c.length) { dropped.push(`list ${r.inst} | ${r.name} (${r.type}): no register programme with this name`); continue; }
  addTo(c, [...expand(insts), ...insts.map(uniIdOf).filter(Boolean)], "list", r);
}
// A call row matched to several register versions of the same programme (re-registered with a new number) can also be matched
// to a subset by another call row; merge groups that share a register programme.
for (const [k, gr] of [...groups]) for (const [k2, g2] of [...groups]) {
  if (k === k2 || !groups.has(k) || !groups.has(k2)) continue;
  if (g2.progs.some((p) => gr.progs.includes(p)) && g2.progs.length <= gr.progs.length) { // keep the narrower match
    const narrow = g2.progs.length < gr.progs.length ? g2 : gr, wide = narrow === g2 ? gr : g2, wk = narrow === g2 ? k : k2;
    if (narrow.progs.every((p) => wide.progs.includes(p))) { narrow.table.push(...wide.table); narrow.list.push(...wide.list); wide.insts.forEach((i) => narrow.insts.add(i)); groups.delete(wk); }
  }
}

// ---- 4. institutions -------------------------------------------------------------------------
const SHEETS = { "Univerza v Ljubljani": "uni-ljubljana", "Univerza v Mariboru": "uni-maribor", "Univerza na Primorskem": "uni-primorska", "Univerza v Novi Gorici": "uni-nova-gorica" };
const uniRec = (name) => zlist.find((z) => z.ime === name && !z.uni);
const cleanName = (s) => s.replace(/, samostojni visokošolski zavod.*$/i, "").replace(/, zavod$/i, "").replace(/ \(od .*$/, "").trim();
const website = (w) => { if (!w) return undefined; const u = /^https?:\/\//i.test(w) ? w : `https://${w}`; try { return new URL(u).origin; } catch { return undefined; } };
const institutions = new Map();
function institutionOf(zid) {
  for (const [to, from] of Object.entries(MERGED)) if (from.includes(zid)) zid = to; // merged institution -> the one it joined
  const z = zav[zid]; const uniName = z.uni && !OWN_INSTITUTION.has(zid) ? z.uni : null; const top = uniName ? uniRec(uniName) : z;
  const name = uniName || cleanName(z.ime);
  if (!top || !top.seat) return null;
  const id = SHEETS[name] || `si-${slug(name)}`.slice(0, 80);
  if (!institutions.has(id)) institutions.set(id, { id, country: CC, source: SOURCE, name, officialName: top.ime, city: top.seat, kind: "unknown", hasSheet: !!SHEETS[name], website: website(top.web), programs: 0, fin: new Set() });
  return { inst: institutions.get(id), faculty: uniName ? cleanName(z.ime) : undefined };
}

// ---- 5. programme rows ------------------------------------------------------------------------
/** ISCED-F code -> app domain; a "not further defined" code (xx0, for example 0230) takes the domain shared by all detailed codes of its narrow field. */
function domainOf(code) {
  const d = iscedToDomain(code); if (d || !/^\d{3}0$/.test(code)) return d;
  const sub = [...new Set([1, 2, 3, 4, 5, 6, 7].map((i) => iscedToDomain(code.slice(0, 3) + i)).filter((x) => x !== null))];
  return sub.length === 1 ? sub[0] : null;
}
const langOrder = (a, b) => (a === "slovenă" ? -1 : b === "slovenă" ? 1 : a.localeCompare(b, "ro"));
const same = (vals) => { const s = [...new Set(vals.filter((v) => v !== undefined && v !== null && v !== ""))]; return s.length === 1 && vals.every((v) => v !== undefined && v !== "") ? s[0] : undefined; };
const programs = []; const keys = new Set(); let multiVersion = 0;
const stats = { noInstitution: 0 }; const kept = new Set();
for (const gr of groups.values()) {
  const ps = gr.progs; if (ps.length > 1) multiVersion++;
  // institution: the carrier (nosilec) among the institutions the call names; else the only named institution in the register record
  const named = ps[0].zavodi.filter((z) => gr.insts.has(z.id));
  const carriers = named.filter((z) => z.nosilec);
  // joint programmes of several faculties of one university belong to that university
  const tops = [...new Set(named.map((z) => institutionOf(z.id)?.inst.id))];
  const owner = carriers.length === 1 ? carriers[0] : named.length === 1 || (named.length > 1 && tops.length === 1 && tops[0]) ? named[0] : null;
  const io = owner && institutionOf(owner.id);
  if (!io) { stats.noInstitution++; dropped.push(`${ps[0].ime} (${ps.map((p) => p.id).join("+")}): no single owning institution`); continue; }
  const facultyNames = [...new Set(named.filter((z) => zav[z.id].uni).map((z) => cleanName(zav[z.id].ime)))].filter(() => io.faculty);
  const faculty = io.faculty ? (facultyNames.length ? facultyNames.join(", ") : io.faculty) : undefined;
  gr.list.forEach((r) => io.inst.fin.add(r.fin));
  const name = same(ps.map((p) => p.ime)) || ps[0].ime; // only versions with the same name (compared loosely) are grouped
  const iscedMain = same(ps.map((p) => p.isced.filter((i) => i.main).map((i) => i.code).sort().join(",")));
  const codes = iscedMain ? iscedMain.split(",") : [];
  const doms = [...new Set(codes.map(domainOf))];
  const domainId = doms.length === 1 ? doms[0] : null;
  const credits = same(ps.map((p) => p.ects)), years = same(ps.map((p) => (p.trajEnota === "5" ? p.traj : undefined)));
  const status = TYPES[ps[0].vrsta];
  // places and languages: from the call's tables when the programme is there; else the register (one place of delivery, or the institution's seat)
  const places = new Map(); // city -> {langs:Set, distance:boolean}
  let notRun = 0;
  for (const r of gr.table) {
    if (NOT_RUN.some((x) => normAbbr(x.abbr) === normAbbr(r.abbr) && N(r.name) === x.name && String(r.jezik).toUpperCase().trim() === x.lang)) { notRun++; continue; }
    const distance = /daljavo/i.test(r.kraj || "");
    // "Koper; Izola (delno)" = Koper, partly Izola -> Koper; "Krško in/ali Velenje" -> both towns
    const cities = distance ? [io.inst.city] : tidy(r.kraj).split(/;|,/).filter((c) => !/\(delno\)/.test(c)).flatMap((c) => c.split(/ in\/ali /)).map((c) => c.trim()).filter(Boolean);
    for (const city of cities) {
      const k = city + (distance ? "|d" : ""); if (!places.has(k)) places.set(k, { city, distance, langs: new Set() });
      langs(r.jezik).forEach((l) => places.get(k).langs.add(l));
    }
  }
  if (notRun && !places.size) { dropped.push(`${name} (${io.inst.name}): the call's notice says it will not run in ${STUDY_YEAR}`); continue; }
  if (!places.size) {
    const kraji = same(ps.map((p) => (p.zavodi.find((z) => z.id === owner.id)?.kraji || []).filter((k) => !/daljavo/i.test(k)).join("|")));
    const one = kraji && !kraji.includes("|") ? kraji : null;
    const l = same(ps.map((p) => p.jezik));
    places.set("reg", { city: one || io.inst.city, distance: false, langs: new Set(l ? langs(l) : []) });
  }
  for (const pl of places.values()) {
    const ls = [...pl.langs].sort(langOrder); const language = ls.length && !ls.includes(null) ? ls.join(", ") : "nespecificată";
    let key = `si-${slug(io.inst.id.replace(/^si-/, ""))}--${slug(name)}-${ps[0].vrsta === "02" ? "vs" : ps[0].vrsta === "03" ? "emag" : "un"}--${slug(pl.city)}${pl.distance ? "-distance" : ""}`.slice(0, 190);
    if (keys.has(key)) key = `${key.slice(0, 180)}-${ps[0].id}`;
    keys.add(key);
    const p = { key, country: CC, institutionId: io.inst.id, institutionName: io.inst.name, city: pl.city };
    if (faculty) p.faculty = faculty;
    p.domain = codes.length ? `ISCED-F ${codes.join(", ")}` : "ISCED-F (not given)";
    p.domainId = domainId; p.name = name; p.language = language;
    if (pl.distance) p.form = "distance";
    if (credits && /^\d+$/.test(credits)) p.credits = +credits;
    if (years && /^\d+$/.test(years)) p.years = +years;
    p.status = status; p.source = SOURCE;
    p.search = ascii([name, same(ps.map((p) => p.ang)) || "", p.domain, faculty || "", io.inst.name, pl.city, language, status, pl.distance ? "na daljavo distance" : ""].join(" "));
    programs.push(p); io.inst.programs++; kept.add(gr);
  }
}
for (const i of institutions.values()) {
  i.kind = i.fin.has("javno") ? "public" : i.fin.size ? "private" : "unknown";
  delete i.fin; if (!i.website) delete i.website;
}
const insts = [...institutions.values()].filter((i) => i.programs > 0).sort((a, b) => a.name.localeCompare(b.name, "sl"));
programs.sort((a, b) => a.institutionName.localeCompare(b.institutionName, "sl") || a.name.localeCompare(b.name, "sl") || a.key.localeCompare(b.key));
writeFileSync(new URL("si-institutions.json", OUT), JSON.stringify(insts, null, 2) + "\n");
writeFileSync(new URL("si-programs.json", OUT), JSON.stringify(programs) + "\n");

const used = new Set([...groups.values()].flatMap((g) => g.progs.map((p) => p.id)));
const notInCall = bach.filter((p) => !used.has(p.id));
console.log(`programmes: ${kept.size} (from ${[...kept].reduce((n, g) => n + g.progs.length, 0)} register records; ${[...kept].filter((g) => g.progs.length > 1).length} with several register versions) | rows ${programs.length} | institutions ${insts.length} (${insts.filter((i) => i.hasSheet).length} with a sheet)`);
console.log(`without domain: ${programs.filter((p) => p.domainId === null).length} | language nespecificată: ${programs.filter((p) => p.language === "nespecificată").length} | register records not in the call: ${notInCall.length}`);
if (process.env.REPORT) { console.log("--- dropped call rows"); dropped.forEach((d) => console.log(d)); console.log("--- register records not in the call"); notInCall.forEach((p) => console.log(p.id, p.ime, TYPES[p.vrsta], p.zavodi.map((z) => zav[z.id]?.kratica).join("/"))); }
if (process.env.REPORT) { console.log("--- programmes with several register versions"); for (const gr of groups.values()) if (gr.progs.length > 1) console.log(gr.progs.map((p) => `${p.id} ${p.ime} [${p.vrsta}, two-subject ${p.dvopred}, from ${p.od}] ${p.zavodi.map((z) => zav[z.id]?.kratica + (z.nosilec ? "*" : "")).join("/")}`).join("  |  ")); }
