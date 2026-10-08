// Builds the Belgian (Flemish) catalogue (institutions + bachelor programmes) from the Europass "Learning Opportunities and Qualifications" open data,
// Belgian country dataset (Flemish register of higher education qualifications, published by AHOVOKS). Usage: node scripts/data/be/build.mjs <raw folder>
// The folder gets the downloaded ZIP and the unpacked .ttl files (downloaded automatically when missing).
const CC = "BE";
const ZIP_NAME = "bel-ttl_1.zip";
const ZIP_URL = "https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/bel/ttl/bel-ttl_1.zip";
const SOURCE = "Europass QDR Belgium (AHOVOKS, Flanders) 2026-10";
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

const SHEETS = { "Katholieke Universiteit Leuven": "ku-leuven" };
// The source has no field of study (ISCED-F is always "000"), so the domain comes from Dutch keywords in the programme name; null when unsure.
const RULES = [
  [/diergeneeskunde/, "medicina-veterinara"], [/tandheelkunde|mondzorg/, "medicina-dentara"], [/farmaceutische|farmacie/, "farmacie"],
  [/verpleegkunde|vroedkunde|gezondheidszorg/, "asistenta-medicala"], [/geneeskunde|biomedische wetenschappen/, "medicina"],
  [/revalidatiewetenschappen|lichamelijke opvoeding|kinesitherapie|sport/, "sport-kinetoterapie"],
  [/toegepaste informatica|informatica|computerwetenschappen|elektronica-ict|netwerk/, "informatica"],
  [/elektromechanica|werktuigkunde|energietechnologie/, "inginerie-mecanica"], [/elektronica|elektriciteit|elektrotechniek/, "inginerie-electrica-electronica"],
  [/bouw|burgerlijke techniek|landmeetkunde/, "inginerie-civila"], [/architectuur|interieurarchitectuur/, "arhitectura"],
  [/rechten|rechtspraktijk|recht\b/, "drept"], [/psychologie/, "psihologie"], [/pedagogische wetenschappen|onderwijs|leraar|lager onderwijs|kleuteronderwijs|secundair onderwijs/, "stiintele-educatiei"],
  [/marketing|reclame/, "marketing"], [/accountancy|boekhoud|bank- en verzekeringswezen|toegepaste economische|economische wetenschappen|fiscaliteit/, "economie-finante"],
  [/bedrijfsmanagement|handelswetenschappen|bedrijfseconomie|office management|bedrijfsbeheer|international business/, "business-management"],
  [/communicatie|journalistiek|media/, "comunicare-jurnalism"], [/politieke wetenschappen|internationale betrekkingen/, "stiinte-politice-relatii-internationale"],
  [/sociaal werk|sociale readaptatie|maatschappelijk werk|sociologie|orthopedagogie/, "sociologie-asistenta-sociala"],
  [/biologie|biochemie/, "biologie"], [/chemie/, "chimie"], [/fysica|sterrenkunde/, "fizica"], [/wiskunde|statistiek/, "matematica"],
  [/geografie|geologie|milieu|land- en tuinbouw|agro|bio-ingenieurs/, "geografie-mediu"], [/landbouw|tuinbouw|bosbouw|plantkunde/, "agronomie-silvicultura"],
  [/geschiedenis|archeologie|kunstwetenschappen/, "istorie"], [/wijsbegeerte|filosofie/, "filosofie"], [/godgeleerdheid|theologie|godsdienst/, "teologie"],
  [/taal- en letterkunde|taalkunde|vertalen|tolken|toegepaste taalkunde/, "litere-limbi-straine"], [/muziek|jazz|klassiek/, "muzica"],
  [/audiovisuele|drama|woordkunst|theater|film/, "teatru-film"], [/beeldende kunst|grafische|vormgeving|mode|design|fotografie/, "arte-vizuale-design"],
  [/toerisme|hotel|horeca|recreatie/, "turism-servicii"], [/luchtvaart|maritieme|nautische|scheepvaart/, "marina-transporturi"],
];
const domainFromName = (n) => { const a = ascii(n); for (const [re, d] of RULES) if (re.test(a)) return d; return null; };
const cityOf = (addrs) => { for (const a of addrs) { const m = /.*\b(\d{4})\s+([^\d]+?)\s+(?:België|Belgique|Belgium)\s*\.?$/.exec(a); if (m) return m[2].trim(); } return null; };
await ensureRaw();
const g = loadGraph();
const institutions = new Map(), programs = []; const skipped = { status: 0, level: 0, notBachelor: 0, noCity: 0, noOrg: 0 };
for (const lo of g.values()) {
  if (!lo.types.includes("elm:LearningOpportunity")) continue;
  if (lit(lo, "elm:status") !== "released") { skipped.status++; continue; }
  const q = g.get(first(lo, "elm:learningAchievementSpecification")?.iri);
  if (last(first(q, "elm:EQFLevel")?.iri) !== "6") { skipped.level++; continue; }
  const title = titleOf(lo, "nl");
  if (!/bachelor/i.test(title) || /na-bachelor|bachelor-na|na bachelor/i.test(title)) { skipped.notBachelor++; continue; }
  const org = g.get(first(lo, "elm:providedBy")?.iri); const orgName = clean(lit(org, "rov:legalName")); if (!orgName) { skipped.noOrg++; continue; }
  const city = cityOf(fullAddress(first(org, "elm:location")?.iri, g)); if (!city) { skipped.noCity++; continue; }
  const instId = SHEETS[orgName] || `be-${slug(orgName)}`.slice(0, 80);
  if (!institutions.has(instId)) institutions.set(instId, { id: instId, country: CC, source: SOURCE, name: orgName, officialName: orgName, city, kind: "unknown", hasSheet: orgName in SHEETS, ...(webOf(org, g) ? { website: webOf(org, g) } : {}) });
  const code = iscedOf(q)[0];
  const language = LANG[last(first(lo, "elm:defaultLanguage")?.iri)] || "olandeză";
  const p = { key: `be-${slug(orgName)}--${slug(title)}--${last(lo.id).slice(0, 8)}`.slice(0, 190), country: CC, institutionId: instId, institutionName: orgName, city, domain: `ISCED-F ${code ?? "000"} (no field given)`, domainId: domainFromName(title), name: title, language };
  p.source = SOURCE; p.search = ascii([title, orgName, city, language].join(" "));
  programs.push(p);
}
console.log("skipped", skipped);
writeOut(institutions, programs);
