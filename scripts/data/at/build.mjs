// Builds the Austrian catalogue (institutions + bachelor programmes) from the Europass "Learning Opportunities and Qualifications" open data,
// Austrian dataset (programmes come from studienwahl.at, published by OeAD). Usage: node scripts/data/at/build.mjs <raw folder>
// The folder gets the downloaded ZIP and the unpacked .ttl files (downloaded automatically when missing).
const CC = "AT";
const ZIP_NAME = "aut-ttl_1.zip";
const ZIP_URL = "https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/aut/ttl/aut-ttl_1.zip";
const SOURCE = "Europass QDR Austria (studienwahl.at/OeAD) 2026-10";
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
const KEEP_TYPES = new Set(["elm:LearningOpportunity", "elm:Qualification", "elm:Organisation", "dct:Location", "elm:Address", "elm:Note", "elm:WebResource", "elm:CreditPoint", "dct:PeriodOfTime"]);
const DROP_PROPS = new Set(["dct:description", "elm:learningOutcome", "elm:learningOutcomeSummary", "elm:additionalNote", "elm:supplementaryDocument", "elm:contactPoint", "adms:identifier", "elm:awardingOpportunity", "elm:grant"]);
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

const SHEETS = { "Universität Wien": "univie", "Technische Universität Wien": "tu-wien", "Wirtschaftsuniversität Wien": "wu-wien" };
const lower = new Set(["an", "der", "am", "bei", "in", "im", "und", "ob", "dem"]);
function cityFromUrl(u) {
  const m = /-(\d+(?:-\d+)*)-([a-z0-9-]+?)\.(?:de|en)\.html/.exec(u || ""); if (!m) return null;
  const part = m[2].split("-und-")[0];
  return part.split("-").map((w, i) => (i > 0 && lower.has(w) ? w : w[0].toUpperCase() + w.slice(1))).join(" ").replace(/^St /, "St. ").replace(/^Wr /, "Wr. ");
}
await ensureRaw();
const g = loadGraph();
const institutions = new Map(), programs = []; const cityVotes = new Map(); const skipped = { status: 0, level: 0, notBachelor: 0, noCity: 0, noOrg: 0 };
for (const lo of g.values()) {
  if (!lo.types.includes("elm:LearningOpportunity")) continue;
  if (lit(lo, "elm:status") !== "released") { skipped.status++; continue; }
  const q = g.get(first(lo, "elm:learningAchievementSpecification")?.iri);
  if (last(first(q, "elm:EQFLevel")?.iri) !== "6") { skipped.level++; continue; }
  if (!/bachelor|bakk/i.test(titleOf(q, "de") + " " + titleOf(q, "en"))) { skipped.notBachelor++; continue; }
  const org = g.get(first(lo, "elm:providedBy")?.iri); const orgName = clean(lit(org, "rov:legalName")); if (!orgName) { skipped.noOrg++; continue; }
  const url = webOf(lo, g, (u) => /\.de\.html$/.test(u));
  const city = cityFromUrl(url); if (!city) { skipped.noCity++; continue; }
  const lang2 = LANG2[last(first(lo, "elm:defaultLanguage")?.iri)] || "de";
  const name = titleOf(lo, lang2); if (name.length < 2) continue;
  const codes = iscedOf(q); const four = codes.find((c) => c.length === 4);
  const domain = four ? `ISCED-F ${four}` : codes.length ? `ISCED-F ${codes[0]}` : "ISCED-F (nicht angegeben)";
  const language = LANG[last(first(lo, "elm:defaultLanguage")?.iri)] || "germană";
  const instId = SHEETS[orgName] || `at-${slug(orgName)}`.slice(0, 80);
  if (!institutions.has(instId)) institutions.set(instId, { id: instId, country: CC, source: SOURCE, name: orgName, officialName: orgName, city: "", kind: "unknown", hasSheet: instId in Object.fromEntries(Object.entries(SHEETS).map(([k, v]) => [v, k])) });
  const votes = cityVotes.get(instId) || {}; votes[city] = (votes[city] || 0) + 1; cityVotes.set(instId, votes);
  const years = durationYears(lit(lo, "elm:duration")), credits = creditsOf(q, g);
  const p = { key: `at-${slug(orgName)}--${slug(name)}--${slug(city)}--${last(lo.id).slice(0, 8)}`.slice(0, 190), country: CC, institutionId: instId, institutionName: orgName, city, domain, domainId: domainOf(codes), name, language };
  if (credits) p.credits = credits; if (years) p.years = years; if (url) p.url = url;
  p.source = SOURCE; p.search = ascii([name, domain, orgName, city, language].join(" "));
  programs.push(p);
}
for (const [id, votes] of cityVotes) institutions.get(id).city = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
console.log("skipped", skipped);
writeOut(institutions, programs);
