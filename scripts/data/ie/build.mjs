// Builds the Irish catalogue (institutions + bachelor programmes) from the Europass "Learning Opportunities and Qualifications" open data,
// Irish country dataset (programmes and awards published by Quality and Qualifications Ireland, QQI). Usage: node scripts/data/ie/build.mjs <raw folder>
// The folder gets the downloaded ZIP and the unpacked .ttl files (downloaded automatically when missing).
const CC = "IE";
const ZIP_NAME = "irl-ttl_1.zip";
const ZIP_URL = "https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/irl/ttl/irl-ttl_1.zip";
const SOURCE = "Europass QDR Ireland (QQI) 2026-10";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { iscedToDomain } from "../isced.mjs";

// ---- generic helpers -------------------------------------------------------
const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);
const raw = process.argv[2];
if (!raw) { console.error(`usage: node scripts/data/${CC.toLowerCase()}/build.mjs <raw folder>`); process.exit(1); }
mkdirSync(raw, { recursive: true });

/** Minimal ZIP reader (central directory + deflate/stored), enough for the Europass multi-part archives. */
function unzip(file, dest) {
  const b = readFileSync(file); let e = b.length - 22;
  while (e >= 0 && b.readUInt32LE(e) !== 0x06054b50) e--;
  const n = b.readUInt16LE(e + 10); let p = b.readUInt32LE(e + 16);
  for (let i = 0; i < n; i++) {
    const method = b.readUInt16LE(p + 10), csize = b.readUInt32LE(p + 20), nl = b.readUInt16LE(p + 28), xl = b.readUInt16LE(p + 30), cl = b.readUInt16LE(p + 32), off = b.readUInt32LE(p + 42);
    const name = b.toString("utf8", p + 46, p + 46 + nl); p += 46 + nl + xl + cl;
    if (name.endsWith("/")) continue;
    const lnl = b.readUInt16LE(off + 26), lxl = b.readUInt16LE(off + 28), start = off + 30 + lnl + lxl;
    const data = b.subarray(start, start + csize);
    writeFileSync(`${dest}/${name.split("/").pop()}`, method === 0 ? data : inflateRawSync(data));
  }
}
async function ensureRaw() {
  if (readdirSync(raw).some((f) => f.endsWith(".ttl"))) return;
  const zip = `${raw}/${ZIP_NAME}`;
  if (!existsSync(zip)) {
    console.log("downloading", ZIP_URL);
    const r = await fetch(ZIP_URL); if (!r.ok) throw new Error(`download failed: ${r.status}`);
    writeFileSync(zip, Buffer.from(await r.arrayBuffer()));
  }
  unzip(zip, raw);
}

/** Parses one Turtle block (one subject) of the Europass export into { id, types, props }. */
function parseBlock(blk) {
  const s = blk.trim(); const m = s.match(/^<([^>]+)>/); if (!m) return null;
  let i = m[0].length; const props = {};
  const ws = () => { while (i < s.length && /\s/.test(s[i])) i++; };
  while (i < s.length) {
    ws(); if (s[i] === ".") break;
    const pm = /^[^\s]+/.exec(s.slice(i)); if (!pm) break; const pred = pm[0]; i += pred.length;
    const vals = [];
    for (;;) {
      ws(); let v;
      if (s[i] === "<") { const e = s.indexOf(">", i); v = { iri: s.slice(i + 1, e) }; i = e + 1; }
      else if (s[i] === '"') {
        let j = i + 1; while (s[j] !== '"' || (s[j - 1] === "\\" && s[j - 2] !== "\\")) j++;
        v = { lit: s.slice(i + 1, j).replace(/\n/g, "\n").replace(/\t/g, " ").replace(/\\"/g, '"').replace(/\\/g, "\\") }; i = j + 1;
        if (s[i] === "@") { const lm = /^@[A-Za-z-]+/.exec(s.slice(i)); v.lang = lm[0].slice(1); i += lm[0].length; }
        else if (s.startsWith("^^", i)) { i += 2; const tm = /^(<[^>]*>|[^\s;,.]+)/.exec(s.slice(i)); i += tm[0].length; }
      } else { const tm = /^[^\s;,]+/.exec(s.slice(i)); v = { raw: tm[0] }; i += tm[0].length; }
      vals.push(v); ws();
      if (s[i] === ",") { i++; continue; } break;
    }
    (props[pred] ||= []).push(...vals); ws();
    if (s[i] === ";") { i++; continue; } if (s[i] === ".") break;
  }
  return { id: m[1], types: (props["rdf:type"] || []).map((v) => v.raw), props };
}
const KEEP_TYPES = new Set(["elm:LearningOpportunity", "elm:Qualification", "elm:Organisation", "dct:Location", "elm:Address", "elm:Note", "elm:WebResource", "elm:CreditPoint", "dct:PeriodOfTime", "elm:Identifier"]);
const DROP_PROPS = new Set(["dct:description", "elm:learningOutcome", "elm:learningOutcomeSummary", "elm:additionalNote", "elm:supplementaryDocument", "elm:contactPoint", "elm:awardingOpportunity", "elm:grant"]);
function loadGraph() {
  const g = new Map();
  for (const f of readdirSync(raw).filter((f) => f.endsWith(".ttl")).sort()) {
    const txt = readFileSync(`${raw}/${f}`, "utf8");
    for (const blk of txt.split(/\n\n+(?=<)/)) {
      const r = parseBlock(blk); if (!r || !r.types.some((t) => KEEP_TYPES.has(t))) continue;
      if (r.types.includes("elm:Note") && !r.props["elm:noteLiteral"]) continue;
      if (r.types.includes("elm:Note") && r.props["elm:noteLiteral"][0].lit.length > 400) continue;
      for (const p of DROP_PROPS) delete r.props[p];
      g.set(r.id, r);
    }
  }
  return g;
}
const first = (r, p) => r?.props[p]?.[0];
const lit = (r, p) => first(r, p)?.lit;
const last = (iri) => (iri || "").split("/").pop();
const clean = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const ascii = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/ø/g, "o").replace(/æ/g, "ae").replace(/ł/g, "l").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");
const LANG = { DEU: "germană", ENG: "engleză", NLD: "olandeză", FRA: "franceză", SWE: "suedeză", DAN: "daneză", ITA: "italiană", HUN: "maghiară", GLE: "irlandeză", SPA: "spaniolă", POL: "poloneză" };
const LANG2 = { DEU: "de", ENG: "en", NLD: "nl", FRA: "fr", SWE: "sv", DAN: "da", ITA: "it", HUN: "hu", GLE: "ga" };
const titleOf = (r, lang2) => { const ts = r?.props["dct:title"] || []; return clean((ts.find((t) => t.lang === lang2) || ts[0])?.lit); };
const durationYears = (d) => { const m = /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+)M)?$/.exec(d || ""); if (!m || (!m[1] && !m[2])) return undefined; const y = (m[1] ? +m[1] : 0) + (m[2] ? +m[2] / 12 : 0); return y >= 1 && y <= 8 ? Math.round(y * 10) / 10 : undefined; };
const creditsOf = (q, g) => { for (const c of q?.props["elm:creditPoint"] || []) { const t = lit(g.get(c.iri), "elm:point"); const m = t && (/(\d+)\s*ECTS/i.exec(t) || /^\s*(\d+)\s*$/.exec(t)); if (m && +m[1] >= 60 && +m[1] <= 480) return +m[1]; } return undefined; };
const iscedOf = (q) => (q?.props["elm:ISCEDFCode"] || []).map((v) => last(v.iri));
const domainOf = (codes) => { for (const c of codes) { if (c.length === 4) { const d = iscedToDomain(c); if (d) return d; } } return null; };
const fullAddress = (locId, g) => { const out = []; for (const a of g.get(locId)?.props["elm:address"] || []) { const n = g.get(first(g.get(a.iri), "elm:fullAddress")?.iri); const t = lit(n, "elm:noteLiteral"); if (t) out.push(clean(t)); } return out; };
const webOf = (r, g, pick) => { const urls = (r?.props["foaf:homepage"] || []).map((h) => lit(g.get(h.iri), "elm:contentUrl")).filter((u) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(u || "")); return urls.find(pick || (() => true)) || urls[0]; };
function writeOut(institutions, programs) {
  const prog = programs.sort((a, b) => a.key.localeCompare(b.key));
  const counts = new Map(); for (const p of prog) counts.set(p.institutionId, (counts.get(p.institutionId) || 0) + 1);
  const insts = [...institutions.values()].filter((i) => counts.has(i.id)).map((i) => ({ ...i, programs: counts.get(i.id) })).sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(new URL(`${CC.toLowerCase()}-institutions.json`, OUT), JSON.stringify(insts, null, 1) + "\n");
  writeFileSync(new URL(`${CC.toLowerCase()}-programs.json`, OUT), JSON.stringify(prog) + "\n");
  console.log(`${CC}: ${insts.length} institutions, ${prog.length} programmes written`);
}

// Existing app sheets: provider's legal name in the source -> app sheet id
const SHEETS = { "Trinity College Dublin, University of Dublin": "trinity-college-dublin", "University College Dublin": "university-college-dublin", "University of Galway": "university-of-galway", "University College Cork": "university-college-cork",
  "Dublin City University": "dublin-city-university", "University of Limerick": "university-of-limerick", "Maynooth University": "maynooth-university", "Technological University Dublin": "tu-dublin" };
const INCLUDE = /\bbachelor\b|\bB\.?\s?(?:A|Sc|Eng|Comm|Ed|Des|Mus|Sc\.)\b|\bBBS\b|\bBBA\b|\bBCL\b|\bLLB\b|\bBE\b|\bBN\b|\bBAI\b|honours degree|ordinary degree|\(hons\)/i;
const EXCLUDE = /higher diploma|graduate diploma|postgraduate|certificate|diploma|micro-?credential|master|\bMSc\b|\bMA\b|\bMBA\b|\bPhD\b|doctor/i;
// Integrated programmes entered from school that end with a master degree (EQF 7, Irish NFQ level 9) are first degrees for the student, so they are kept.
// The source has no entry-route field; an EQF 7 record is kept only when the source itself marks it as undergraduate:
// 1. its programme code is a Trinity-style code starting with "U" (Trinity College Dublin's own codes: U = undergraduate, P = postgraduate; "UI.." = undergraduate integrated), or
// 2. its award title is a bachelor degree (for example "Bachelor of Veterinary in Medicine and Surgery") and its code is not a postgraduate ("P") one.
// Every other EQF 7 record (taught and research masters, postgraduate diplomas and certificates) stays out.
const codeOf = (lo, g) => (lo.props["adms:identifier"] || []).map((v) => lit(g.get(v.iri), "skos:notation")).find(Boolean) || "";
const UNDERGRADUATE_CODE = /^U[A-Z]{3}-[A-Z]{4}-\d[A-Z]\b/, POSTGRADUATE_CODE = /^P[A-Z]{3}-[A-Z]{4}-\d[A-Z]\b/;
const NOT_A_DEGREE = /certificate|diploma|micro-?credential/i;
const isIntegrated = (code, both, qTitle) => !NOT_A_DEGREE.test(both) && (UNDERGRADUATE_CODE.test(code) || (/^bachelor\b/i.test(qTitle) && !POSTGRADUATE_CODE.test(code) && !EXCLUDE.test(both)));
// The address of an Irish provider starts with its local-authority area ("Dublin City", "Cork City", "Limerick County", "Donegal"); that area is used as the city.
const cityOf = (addrs) => {
  const a = addrs[0]; if (!a) return null; let c = clean(a.split(",")[0]);
  if (/^Dublin/i.test(c)) return "Dublin"; c = c.replace(/\s+(City|County|North Riding|South Riding)$/i, "").replace(/\s*\/.*$/, "").trim();
  return c.length >= 2 ? c : null;
};
await ensureRaw();
const g = loadGraph();
const institutions = new Map(), programs = []; const seen = new Set(); const skipped = { status: 0, level: 0, masterLevelNotUndergraduate: 0, notBachelor: 0, noCity: 0, noOrg: 0, duplicate: 0 }; let integrated = 0;
// Sorted by record id so that the row kept from a group of duplicates is always the same one.
for (const lo of [...g.values()].sort((a, b) => a.id.localeCompare(b.id))) {
  if (!lo.types.includes("elm:LearningOpportunity")) continue;
  if (lit(lo, "elm:status") !== "released") { skipped.status++; continue; }
  const q = g.get(first(lo, "elm:learningAchievementSpecification")?.iri);
  const eqf = last(first(q, "elm:EQFLevel")?.iri);
  if (eqf !== "6" && eqf !== "7") { skipped.level++; continue; }
  const title = titleOf(lo, "en"), qTitle = titleOf(q, "en"), both = `${title} | ${qTitle}`;
  if (eqf === "7") { if (!isIntegrated(codeOf(lo, g), both, qTitle)) { skipped.masterLevelNotUndergraduate++; continue; } }
  else if (!INCLUDE.test(both) || EXCLUDE.test(both)) { skipped.notBachelor++; continue; }
  const org = g.get(first(lo, "elm:providedBy")?.iri); const orgName = clean(lit(org, "rov:legalName")); if (!orgName) { skipped.noOrg++; continue; }
  const city = cityOf(fullAddress(first(org, "elm:location")?.iri, g)); if (!city) { skipped.noCity++; continue; }
  const instId = SHEETS[orgName] || `ie-${slug(orgName)}`.slice(0, 80);
  // One row per programme name of an institution: the same name with two awards (for example "Bachelor in Arts" and "Bachelor in Science"), two study modes
  // or two intakes is the same programme for a student, and the source gives nothing to show that tells the records apart.
  const dupKey = `${instId}|${ascii(title)}`; if (seen.has(dupKey)) { skipped.duplicate++; continue; } seen.add(dupKey);
  if (eqf === "7") integrated++;
  if (!institutions.has(instId)) institutions.set(instId, { id: instId, country: CC, source: SOURCE, name: orgName, officialName: orgName, city, kind: "unknown", hasSheet: orgName in SHEETS });
  const codes = iscedOf(q), four = codes.find((c) => c.length === 4);
  const language = LANG[last(first(lo, "elm:defaultLanguage")?.iri)] || "engleză";
  const p = { key: `ie-${slug(orgName)}--${slug(title)}--${last(lo.id).slice(0, 8)}`.slice(0, 190), country: CC, institutionId: instId, institutionName: orgName, city, domain: four ? `ISCED-F ${four}` : codes.length ? `ISCED-F ${codes[0]}` : "ISCED-F (not given)", domainId: domainOf(codes), name: title, language };
  p.source = SOURCE; p.search = ascii([title, qTitle, orgName, city, language].join(" "));
  programs.push(p);
}
console.log("skipped", skipped, "integrated (EQF 7) rows kept:", integrated);
writeOut(institutions, programs);
