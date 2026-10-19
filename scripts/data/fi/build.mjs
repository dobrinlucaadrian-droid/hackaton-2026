// Builds the Finnish catalogue (institutions + bachelor programmes) from the Europass "Learning Opportunities and Qualifications" open data,
// Finnish country dataset (records from Opintopolku / Studyinfo, published by the Finnish National Agency for Education). Usage: node scripts/data/fi/build.mjs <raw folder>
// The folder gets the downloaded ZIP and the unpacked .ttl files (downloaded automatically when missing).
const CC = "FI";
const ZIP_NAME = "fin-ttl_1.zip";
const ZIP_URL = "https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/fin/ttl/fin-ttl_1.zip";
const SOURCE = "Europass QDR Finland (Opintopolku) 2026-10";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { iscedToDomain } from "../isced.mjs";

// ---- generic helpers (same as scripts/data/ie/build.mjs) ---------------------
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
        v = { lit: s.slice(i + 1, j).replace(/\\(["\\nt])/g, (_, c) => (c === "n" ? "\n" : c === "t" ? " " : c)) }; i = j + 1;
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
// The Finnish file links a learning opportunity to an elm:LearningAchievementSpecification (the degree), not to an elm:Qualification.
const KEEP_TYPES = new Set(["elm:LearningOpportunity", "elm:LearningAchievementSpecification", "elm:Organisation", "dct:Location", "elm:Address", "elm:Note", "elm:WebResource", "elm:Identifier", "adms:Identifier", "dct:PeriodOfTime"]);
const DROP_PROPS = new Set(["dct:description", "elm:learningOutcome", "elm:additionalNote", "elm:scheduleInformation"]);
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
const clean = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/[\u00ad\u200b]/g, "").replace(/\s+/g, " ").trim();
const ascii = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/ø/g, "o").replace(/æ/g, "ae").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");
const titles = (r) => (r?.props["dct:title"] || []).map((t) => ({ text: clean(t.lit), lang: t.lang }));
const titleIn = (r, lang2) => { const ts = titles(r); return (ts.find((t) => t.lang === lang2) || ts.find((t) => t.lang === "fi") || ts[0])?.text || ""; };
function writeOut(institutions, programs) {
  const prog = programs.sort((a, b) => a.key.localeCompare(b.key));
  const counts = new Map(); for (const p of prog) counts.set(p.institutionId, (counts.get(p.institutionId) || 0) + 1);
  const insts = [...institutions.values()].filter((i) => counts.has(i.id)).map((i) => ({ ...i, programs: counts.get(i.id) })).sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(new URL(`${CC.toLowerCase()}-institutions.json`, OUT), JSON.stringify(insts, null, 1) + "\n");
  writeFileSync(new URL(`${CC.toLowerCase()}-programs.json`, OUT), JSON.stringify(prog) + "\n");
  console.log(`${CC}: ${insts.length} institutions, ${prog.length} programmes written`);
}

// ---- Finland ---------------------------------------------------------------
// The Finnish universities and universities of applied sciences (ammattikorkeakoulu, AMK) as their names start in the source's provider names
// ("Helsingin yliopisto, Matemaattis-luonnontieteellinen tiedekunta", "Metropolia Ammattikorkeakoulu Oy", "Oy Vaasan ammattikorkeakoulu - Vasa yrkeshögskola Ab").
// Every other provider (summer universities, folk high schools, vocational colleges, "Ab Yrkeshögskolan vid Åbo Akademi" whose link to a UAS the source does not show) is left out.
// sheet = id of the existing app sheet (apps/web/data/universities-abroad.json, country "Finlanda") for the same institution.
const HEIS = [
  { name: "Helsingin yliopisto", sheet: "helsinki" }, { name: "Aalto-yliopisto", sheet: "aalto" }, { name: "Tampereen yliopisto", sheet: "tampere" },
  { name: "Turun yliopisto", sheet: "turku" }, { name: "Oulun yliopisto", sheet: "oulu" }, { name: "Jyväskylän yliopisto", sheet: "jyvaskyla" },
  { name: "Lappeenrannan-Lahden teknillinen yliopisto LUT", sheet: "lut" }, { name: "Itä-Suomen yliopisto", sheet: "uef" },
  { name: "Vaasan yliopisto" }, { name: "Lapin yliopisto" }, { name: "Åbo Akademi" }, { name: "Svenska handelshögskolan" }, { name: "Taideyliopisto" },
  { name: "Metropolia Ammattikorkeakoulu", sheet: "metropolia" }, { name: "Haaga-Helia ammattikorkeakoulu", sheet: "haaga-helia" },
  { name: "Turun ammattikorkeakoulu" }, { name: "Tampereen ammattikorkeakoulu" }, { name: "Oulun ammattikorkeakoulu" }, { name: "Jyväskylän ammattikorkeakoulu" },
  { name: "Savonia-ammattikorkeakoulu" }, { name: "LAB-ammattikorkeakoulu" }, { name: "Kaakkois-Suomen ammattikorkeakoulu" }, { name: "Centria-ammattikorkeakoulu" },
  { name: "Laurea-ammattikorkeakoulu" }, { name: "Karelia-ammattikorkeakoulu" }, { name: "Satakunnan ammattikorkeakoulu" }, { name: "Seinäjoen ammattikorkeakoulu" },
  { name: "Lapin ammattikorkeakoulu" }, { name: "Hämeen ammattikorkeakoulu" }, { name: "Kajaanin ammattikorkeakoulu" }, { name: "Vaasan ammattikorkeakoulu" },
  { name: "Yrkeshögskolan Novia" }, { name: "Yrkeshögskolan Arcada" }, { name: "Diakonia-ammattikorkeakoulu" }, { name: "Humanistinen ammattikorkeakoulu" },
  { name: "Högskolan på Åland" }, { name: "Poliisiammattikorkeakoulu" },
];
// Legal-entity names of the same institutions ("… Oy", "Oy … - … Ab", "Suomen Humanistinen Ammattikorkeakoulu Oy").
const ALIASES = { "suomen humanistinen ammattikorkeakoulu": "Humanistinen ammattikorkeakoulu" };
const normOrg = (s) => clean(s).toLowerCase().replace(/^(oy|ab)\s+/, "").replace(/\s+(oy|ab)$/, "");
function heiOf(orgName) {
  const n = normOrg(orgName);
  for (const [alias, to] of Object.entries(ALIASES)) if (n === alias || n.startsWith(alias + ",") || n.startsWith(alias + " ")) return HEIS.find((h) => h.name === to);
  // the name must be the institution itself or the institution followed by a comma (a unit) or by its legal-form / Swedish-name tail
  return HEIS.find((h) => { const k = h.name.toLowerCase(); return n === k || n.startsWith(k + ",") || n.startsWith(k + " - "); });
}
const isUas = (h) => /ammattikorkeakoulu|yrkeshögskolan|högskolan på åland/i.test(h.name);

// Bachelor-level degrees, recognised from the degree (specification) title, which the source gives in Finnish, Swedish and/or English:
// - universities of applied sciences: "Insinööri (AMK)", "Ingenjör (YH)", "Bachelor of Engineering", never "ylempi AMK" / "högre YH" / "Master";
// - universities: titles with "kandidaatti" / "kandidat" / "Bachelor" (bachelor alone or bachelor + master admitted together, "kandidaatti ja maisteri (3 v + 2 v)";
//   also medicine, dentistry and veterinary medicine "kandidaatti ja lisensiaatti"), "oikeusnotaari" (bachelor of law) and "farmaseutti" (bachelor of pharmacy).
const UAS_BACHELOR = /\((AMK|YH)\)|^Bachelor of\b/i;
const UNI_BACHELOR = /kandidaatti|\bkandidat\b|\bBachelor\b|oikeusnotaari|rättsnotarie|^Farmaseutti\b|^Farmaceut\b/i;
const NOT_BACHELOR_DEGREE = /ylempi AMK|högre YH|\bMaster\b|tohtori|doktor|doctoral|\bPhD\b/i;
// Offers that are not an entry into a degree programme: open-university / path studies, separate or supplementary studies, conversion and qualification
// routes for people who already hold a degree, preparatory courses, transfer admission of students already studying elsewhere (siirtohaku / överflyttning).
const NOT_A_DEGREE_OFFER = /avoin|open uni|öppna|path studies|polkuopinnot|väyläopinnot|erilliset|fristående|täydentävä|täydennys|pätevöit|laillistumis|SAILA|valmentava|valmistava|preparatory|siirtohaku|överflyttning|transfer|jatkuva oppiminen|erikoistumiskoulutus|muuntokoulutus|starttiopinnot|top-up|yhteistyöopinnot suorittaneille/i;
// A degree title that is really the title of one application offer: it names the application round, the intake, the study mode or the campus
// ("Joustava haku, Lapin AMK, Sairaanhoitaja, (AMK), Kemi ja Rovaniemi, opinnot alkaa keväällä 2027", "…, International Separate Application", "…, monimuotototeutus").
const OFFER_TITLE = /haku\b|\bhaun\b|application|ansökan|opinnot alka|syksyn|kevään|keväällä|\b20\d\d\b|toteutus|verkko-opinnot|blended|monimuoto|på campus/i;
const BOTH_DEGREES = /maisteri|magister|\bMaster\b|lisensiaatti|licentiat|diplomi-insinööri|diplomingenjör|arkkitehti\b|proviisori|provisor|\(\s*3\s*(v|år|yrs?|years?)?\s*\+/i;

const LANG = { FIN: "finlandeză", SWE: "suedeză", ENG: "engleză", SME: "sami de nord" };
const LANG2 = { FIN: "fi", SWE: "sv", ENG: "en", SME: "se" };
// Postal town in the provider unit's address ("Kärpäsenkuja 217, 67100  KOKKOLA"). A university's own post-office name ("90014 Oulun yliopisto"), an English
// "University of …" or "Ei tiedossa" (unknown) is not a town and is not used. When the Europass file itself writes the same postcode with two names
// (a Finnish and a Swedish one, "65100 Vaasa" and "65100 Vasa"), the name it uses most often for that postcode is written, so that one town is not listed twice.
const POSTCODE_NAME = new Map();
function rawTown(addr) {
  const m = /\b(\d{5})\s+([^,\d]+?)\s*(,?\s*Finland)?$/i.exec(addr || ""); if (!m) return null;
  let t = clean(m[2]); if (!t || /yliopisto|universit|korkeakoulu|tiedossa|aalto/i.test(t)) return null;
  if (t === t.toUpperCase()) t = t.charAt(0) + t.slice(1).toLowerCase().replace(/([ -])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
  return { code: m[1], town: t };
}
const townOf = (addr) => { const r = rawTown(addr); return r ? POSTCODE_NAME.get(r.code) || r.town : null; };
// Seat of an institution whose own provider record in the Europass file has no usable town, from the institution's official contact page (filled in below).
// Checked on 2026-10-19. Jyväskylän yliopisto (its pages give only the post-office name "40014 Jyväskylän yliopisto") and Itä-Suomen yliopisto (campuses in
// Joensuu and Kuopio, so no single seat) are not filled: their units without a town are left out.
const OFFICIAL_SEAT = {
  "Helsingin yliopisto": { town: "Helsinki", page: "https://www.helsinki.fi/en" }, // "The University operates on four campuses in Helsinki and in ten other locations."
  "Turun yliopisto": { town: "Turku", page: "https://www.utu.fi/en" }, // organisation address on the page: addressLocality "Turku", postalCode "20014"
  "Aalto-yliopisto": { town: "Espoo", page: "https://www.aalto.fi/en/campus" }, // "Aalto University's campus in Otaniemi, Espoo"
};
const addressOf = (org, g) => { const loc = g.get(first(org, "elm:location")?.iri); const a = g.get(first(loc, "elm:address")?.iri); return lit(g.get(first(a, "elm:fullAddress")?.iri), "elm:noteLiteral"); };
const durationYears = (d) => { const m = /^P(\d+)Y(\d+)M$/.exec(d || ""); if (!m) return undefined; const y = +m[1] + +m[2] / 12; return y >= 1 && y <= 8 ? Math.round(y * 10) / 10 : undefined; };
// The unit part of a university provider name is a faculty or school when it says so ("…, Matemaattis-luonnontieteellinen tiedekunta", "…, Kauppakorkeakoulu", "…, Teatterikorkeakoulu").
const FACULTY = /tiedekunta|korkeakoulu|fakultet|laitos|akatemia|kuvataideakatemia|school/i;

await ensureRaw();
const g = loadGraph();
{ const byCode = new Map();
  for (const a of g.values()) { if (!a.types.includes("elm:Address")) continue; const r = rawTown(lit(g.get(first(a, "elm:fullAddress")?.iri), "elm:noteLiteral")); if (!r) continue;
    const m = byCode.get(r.code) || new Map(); m.set(r.town, (m.get(r.town) || 0) + 1); byCode.set(r.code, m); }
  for (const [code, m] of byCode) POSTCODE_NAME.set(code, [...m].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0][0]); }
const groups = new Map();
const ONLINE = /verkkokampus|online kampus|online campus/i;
// The institution's own seat: the town in the address of the provider record that is the institution itself (no unit after a comma); else OFFICIAL_SEAT.
const seatTown = new Map();
for (const o of g.values()) { if (!o.types.includes("elm:Organisation")) continue; const n = clean(lit(o, "rov:legalName")); const h = heiOf(n); if (!h || normOrg(n).includes(",")) continue; const t = townOf(addressOf(o, g)); if (t && !seatTown.has(h.name)) seatTown.set(h.name, t); }
const seatFromSource = new Set(seatTown.keys());
for (const [name, s] of Object.entries(OFFICIAL_SEAT)) if (!seatTown.has(name)) seatTown.set(name, s.town);
if (process.env.DEBUG) console.log("seats:", Object.fromEntries(seatTown));
const startYears = {}; const droppedUnits = new Set(), droppedTitles = new Set(); let seatRows = 0;
const skipped = { status: 0, notHei: 0, notBachelor: 0, notADegreeOffer: 0, oldIntake: 0, offerTitle: 0, noLanguage: 0, noTown: 0 };
// Sorted by record id so that the url and faculty kept for a group are always the same.
for (const lo of [...g.values()].sort((a, b) => a.id.localeCompare(b.id))) {
  if (!lo.types.includes("elm:LearningOpportunity")) continue;
  if (lit(lo, "elm:status") !== "released") { skipped.status++; continue; }
  const orgs = (lo.props["elm:providedBy"] || []).map((v) => g.get(v.iri)).filter(Boolean).map((o) => ({ o, name: clean(lit(o, "rov:legalName")) }));
  const heis = [...new Set(orgs.map((x) => heiOf(x.name)).filter(Boolean))];
  if (heis.length !== 1) { skipped.notHei++; continue; }
  const hei = heis[0];
  const spec = g.get(first(lo, "elm:learningAchievementSpecification")?.iri);
  const specTitles = titles(spec).map((t) => t.text), loTitles = titles(lo).map((t) => t.text);
  const BACH = isUas(hei) ? UAS_BACHELOR : UNI_BACHELOR;
  // a title that names a bachelor degree is enough; a title that names only a higher degree (no bachelor word in it) rules the record out
  const bachelor = specTitles.some((t) => BACH.test(t)) && !specTitles.some((t) => (NOT_BACHELOR_DEGREE.test(t) && (isUas(hei) || !UNI_BACHELOR.test(t))) || (isUas(hei) && /maisteri|magister/i.test(t)));
  if (!bachelor) { skipped.notBachelor++; if (process.env.DEBUG) console.log("NOTBACH", hei.name, "||", specTitles.join(" | ")); continue; }
  if ([...specTitles, ...loTitles, ...orgs.map((x) => x.name)].some((t) => NOT_A_DEGREE_OFFER.test(t))) { skipped.notADegreeOffer++; if (process.env.DEBUG) console.log("NOTDEG", hei.name, "||", loTitles.join(" | "), "||", specTitles.join(" | ")); continue; }
  const start = lit(g.get(first(lo, "dct:temporal")?.iri), "elm:startDate"); startYears[start ? start.slice(0, 4) : "not given"] = (startYears[start ? start.slice(0, 4) : "not given"] || 0) + 1;
  // An offer whose own start date is before 2026 is an old intake that is still published; it is not taken as proof that the programme is current.
  if (start && start < "2026-01-01") { skipped.oldIntake++; continue; }
  const langCode = last(first(lo, "elm:defaultLanguage")?.iri);
  const language = LANG[langCode]; if (!language) { skipped.noLanguage++; continue; }
  // The unit (faculty / campus) is the provider whose name continues after the institution name; its address gives the town. An offer taught on several
  // campuses gives one row per town. An online campus ("Verkkokampus", "Online kampus") is not a place of teaching and is used only when it is the only unit.
  // A unit without a usable town in its address (none, or a university post-office name such as "40014 Jyväskylän yliopisto") gets the institution's seat, but
  // only when the unit is the institution itself or an "institution, faculty" unit; a unit that names a campus or another town ("…, Pori", "…, Kuopion kampus") is left out.
  let units = orgs.filter((x) => heiOf(x.name) === hei && normOrg(x.name).includes(","));
  if (units.some((u) => !ONLINE.test(u.name))) units = units.filter((u) => !ONLINE.test(u.name));
  const places = new Map();
  for (const u of units.length ? units : orgs.filter((x) => heiOf(x.name) === hei)) {
    let town = townOf(addressOf(u.o, g)), viaSeat = false;
    if (!town) { const parts = u.name.split(","); if (parts.length === 1 || (parts.length === 2 && FACULTY.test(parts[1]))) { town = seatTown.get(hei.name); viaSeat = !!town; } }
    if (!town) { droppedUnits.add(u.name); continue; }
    let faculty;
    if (!isUas(hei) && u.name.includes(",")) { const part = clean(u.name.slice(u.name.indexOf(",") + 1)).split(",")[0].trim(); if (FACULTY.test(part) && !/kampus|campus/i.test(part)) faculty = part; }
    if (!places.has(town)) places.set(town, { faculties: new Set(), viaSeat });
    const pl = places.get(town); pl.faculties.add(faculty || ""); pl.viaSeat &&= viaSeat;
  }
  if (!places.size) { skipped.noTown++; if (process.env.DEBUG) console.log("NOTOWN", orgs.map((x) => x.name + " @ " + addressOf(x.o, g)).join(" ;; ")); continue; }
  // Such a title is replaced by a clean title of the same degree record in another language when it has one; otherwise the offer is left out.
  let name = titleIn(spec, LANG2[langCode]);
  if (OFFER_TITLE.test(name)) {
    const alt = titles(spec).map((t) => t.text).find((t) => !OFFER_TITLE.test(t) && BACH.test(t));
    if (!alt) { skipped.offerTitle++; droppedTitles.add(`${hei.name}: ${name}`); continue; }
    name = alt;
  }
  for (const [town, pl] of places) {
    const gk = `${hei.name}|${ascii(name)}|${town}|${langCode}`;
    const urls = (lo.props["foaf:homepage"] || []).map((h) => g.get(h.iri)).map((w) => ({ url: lit(w, "elm:contentUrl"), lang: last(first(w, "dct:language")?.iri) })).filter((u) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(u.url || ""));
    const url = (urls.find((u) => u.lang === langCode) || urls.find((u) => u.lang === "FIN") || urls[0])?.url;
    const codes = (spec.props["elm:ISCEDFCode"] || []).map((v) => last(v.iri)).filter((c) => c.length === 4);
    if (!groups.has(gk)) groups.set(gk, { hei, name, town, langCode, language, faculties: new Set(), urls: [], codes: new Set(), durations: new Set(), both: false, offers: 0, specTitles: new Set() });
    const gr = groups.get(gk);
    gr.offers++; pl.faculties.forEach((f) => gr.faculties.add(f)); if (pl.viaSeat) gr.viaSeat = true; if (url) gr.urls.push(url);
    codes.forEach((c) => gr.codes.add(c)); gr.durations.add(lit(lo, "elm:duration") || ""); specTitles.forEach((t) => gr.specTitles.add(t));
    if (specTitles.some((t) => BOTH_DEGREES.test(t))) gr.both = true;
  }
}

const institutions = new Map(), programs = []; const counts = { offers: 0, noDomain: 0, combined: 0, withYears: 0, conflictingCodes: 0 };
const seatOf = new Map();
for (const gr of groups.values()) { const m = seatOf.get(gr.hei.name) || new Map(); m.set(gr.town, (m.get(gr.town) || 0) + gr.offers); seatOf.set(gr.hei.name, m); }
for (const gr of groups.values()) {
  const h = gr.hei, instId = h.sheet || `fi-${slug(h.name)}`;
  // Seat: the town in the address of the institution's own provider record; when it has none, the town with most of its bachelor offers.
  if (!institutions.has(instId)) {
    const seat = seatTown.get(h.name) || [...seatOf.get(h.name)].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    institutions.set(instId, { id: instId, country: CC, source: SOURCE, name: h.name, officialName: h.name, city: seat, kind: "unknown", hasSheet: !!h.sheet });
  }
  // App domain only when every 4-digit ISCED-F code of the degree points to the same app domain; codes ending in 88 (interdisciplinary) are ignored.
  const codes = [...gr.codes].sort(), named = codes.filter((c) => !c.endsWith("88"));
  const doms = [...new Set(named.map((c) => iscedToDomain(c)))];
  const domainId = doms.length === 1 ? doms[0] : null; if (doms.length > 1) counts.conflictingCodes++;
  if (!domainId) counts.noDomain++;
  const p = { key: "", country: CC, institutionId: instId, institutionName: h.name, city: gr.town };
  const facs = [...gr.faculties]; if (facs.length === 1 && facs[0]) p.faculty = facs[0];
  Object.assign(p, { domain: codes.length ? `ISCED-F ${codes.join(", ")}` : "ISCED-F (not given)", domainId, name: gr.name, language: gr.language });
  // Years only for a degree that is a bachelor alone, when every offer gives the same planned duration.
  const durs = [...gr.durations]; const years = durs.length === 1 ? durationYears(durs[0]) : undefined;
  if (gr.both) counts.combined++; else if (years) { p.years = years; counts.withYears++; }
  const url = [...gr.urls].sort()[0]; if (url) p.url = url;
  p.source = SOURCE;
  p.search = ascii([gr.name, ...[...gr.specTitles].filter((t) => t !== gr.name), p.faculty || "", h.name, gr.town, gr.language].join(" ")).slice(0, 600).trim();
  p.key = `fi-${slug(h.name)}--${slug(gr.name)}--${slug(gr.town)}-${LANG2[gr.langCode]}`.slice(0, 200).replace(/-+$/, "");
  counts.offers += gr.offers;
  programs.push(p);
}
const keys = new Set(); for (const p of programs) { let k = p.key, n = 2; while (keys.has(k)) k = `${p.key.slice(0, 195)}-${n++}`; p.key = k; keys.add(k); }
console.log("start year of the kept offers:", startYears);
console.log("rows placed at the institution seat:", [...groups.values()].filter((x) => x.viaSeat).length, "| seats not from the Europass file:", [...seatTown.keys()].filter((k) => !seatFromSource.has(k)), "| units left out (no town):", [...droppedUnits], "| offer titles left out:", [...droppedTitles]);
console.log("skipped", skipped, "kept offers:", counts.offers, "rows:", programs.length, "bachelor+master/licentiate rows:", counts.combined, "rows with years:", counts.withYears, "rows without domain:", counts.noDomain, "(codes pointing to two domains:", counts.conflictingCodes + ")");
writeOut(institutions, programs);
