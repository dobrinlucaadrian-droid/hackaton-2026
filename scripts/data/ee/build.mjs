// Builds the Estonia catalogue (institutions + one row per open first-cycle or integrated curriculum per place of study) from the EHIS open data. Usage: node scripts/data/ee/build.mjs <raw folder>
// The folder must hold oppekavad.xml and oppeasutused.xml (EHIS open-data queries, see README.md); missing files are downloaded (plain http: the https address answers 404).
import fs from "node:fs";
import path from "node:path";
import { iscedToDomain } from "../isced.mjs";

const dir = process.argv[2];
if (!dir) { console.error("usage: node scripts/data/ee/build.mjs <raw folder>"); process.exit(1); }
const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);
const CC = "EE";
const SOURCE = "EHIS avaandmed 2026-10";
const FILES = {
  "oppekavad.xml": "http://enda.ehis.ee/avaandmed/rest/oppekavad/-/-/-/1/XML",
  "oppeasutused.xml": "http://enda.ehis.ee/avaandmed/rest/oppeasutused/-/-/-/-/-/-/-/-/-/-/0/0/XML",
};
for (const [name, url] of Object.entries(FILES)) {
  const f = path.join(dir, name);
  if (fs.existsSync(f)) continue;
  console.log("downloading", url);
  const res = await fetch(url);
  if (!res.ok) { console.error(`download failed: ${res.status} ${url}`); process.exit(1); }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
}

// ---------- small XML helpers (the files are flat, regular records) ----------
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const clean = (s) => unesc(String(s ?? "")).replace(/\s+/g, " ").trim();
const one = (block, tag) => { const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)); return m ? clean(m[1]) : ""; };
const all = (block, tag) => [...block.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"))].map((m) => clean(m[1])).filter(Boolean);
const ascii = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");

// ---------- institutions (seat, ownership, website) from the EHIS institutions query ----------
const instXml = fs.readFileSync(path.join(dir, "oppeasutused.xml"), "utf8");
const EHIS_INST = new Map();
for (const m of instXml.matchAll(/<oppeasutus>\s*<koolId>(\d+)<\/koolId>([\s\S]*?)<\/oppeasutus>/g)) EHIS_INST.set(m[1], m[2]);

// Existing app sheets (apps/web/data/universities-abroad.json, country "Estonia"), matched by EHIS school id; names checked by hand (Estonian and English names, seat).
const SHEETS = { "61": "tartu", "93": "taltech", "94": "tlu-tallinn", "112": "emu-tartu", "60": "eamt-tallinn", "75": "ebs-tallinn" };
// Ownership in EHIS: public-law and state institutions are public, privately owned ones private.
const KIND = { "avalik-õiguslik": "public", "riigiomandus": "public", "eraomand": "private" };
// A municipality name as EHIS writes it: "Tartu linn" (town) -> "Tartu"; "Tallinn" stays; a rural municipality keeps its name ("Kambja vald").
const placeName = (s) => s.replace(/ linn$/, "");

const institutions = new Map(); const dropped = [];
function institution(koolId, nameInCurricula) {
  if (institutions.has(koolId)) return institutions.get(koolId);
  const b = EHIS_INST.get(koolId);
  if (!b) { institutions.set(koolId, null); dropped.push(`institution ${koolId} ${nameInCurricula}: not in the institutions query`); return null; }
  const name = one(b, "nimetus"), kov = one(b.match(/<juriidilineAadress>([\s\S]*?)<\/juriidilineAadress>/)?.[1] || "", "kov");
  const kind = KIND[one(b, "omandivorm")];
  if (!name || !kov || one(b, "staatus") !== "Registreeritud") { institutions.set(koolId, null); dropped.push(`institution ${koolId} ${nameInCurricula}: no name, seat or registered status`); return null; }
  const web = one(b, "veebiLeht");
  const i = { id: SHEETS[koolId] || `ee-${slug(name)}`, country: CC, source: SOURCE, name, officialName: name, city: placeName(kov), kind: kind || "unknown", hasSheet: koolId in SHEETS };
  if (/^https?:\/\/[^\s]+\.[^\s]+$/.test(web)) i.website = web;
  institutions.set(koolId, i);
  return i;
}

// ---------- curricula ----------
const LEVELS = { "511": "bakalaureuseõpe", "514": "rakenduskõrgharidusõpe", "503": "integreeritud bakalaureuse- ja magistriõpe" };
const LANG = { "eesti keel": "estonă", "inglise keel": "engleză", "vene keel": "rusă" };
// The curriculum link as the institution registered it in EHIS. Kept only when it is a web link with a path: a bare home page ("http://www.tlu.ee", "https://www.euas.eu/"),
// a local file ("file:///C:/...") or plain text ("www.tlu.ee", "Hetkel puudub") is not a page of the programme and is left out.
function isProgrammeLink(u) {
  if (!/^https?:\/\/[^\s]+\.[^\s]+$/.test(u)) return false;
  try { const x = new URL(u); return x.pathname.length > 1 || x.search !== "" || x.hash !== ""; } catch { return false; }
}
const xml = fs.readFileSync(path.join(dir, "oppekavad.xml"), "utf8");
const programs = []; const skipped = { notHigherEducation: 0, otherLevel: 0, notOpen: 0, notRegistered: 0, unclearField: 0, institution: 0 };
const levelCount = {}; let seatUsed = 0; const placesDropped = {};
for (const m of xml.matchAll(/<oppekava>([\s\S]*?)<\/oppekava>/g)) {
  const r = m[1];
  if (one(r, "oppekavaLiik") !== "Kõrghariduse õppekava") { skipped.notHigherEducation++; continue; }
  const level = one(r, "ope").slice(0, 3);
  if (!(level in LEVELS)) { skipped.otherLevel++; continue; }
  if (one(r, "vastuvott") !== "Avatud") { skipped.notOpen++; continue; }
  if (one(r, "kehtivStaatus") !== "Registreeritud") { skipped.notRegistered++; continue; }
  const code = one(r, "oppekavaKood"), name = one(r, "oppekavaNimetus"), group = one(r, "ryhmaNimetus"), isced = one(r, "ryhmaKood");
  const langs = all(r, "oppeKeel");
  if (!code || !name || !group || langs.length === 0 || langs.some((l) => !(l in LANG))) { skipped.unclearField++; dropped.push(`curriculum ${code} ${name}: name, field of study or language missing or unclear`); continue; }
  const inst = institution(one(r, "koolId"), one(r, "oppeasutus"));
  if (!inst) { skipped.institution++; continue; }
  const language = [...new Set(langs.map((l) => LANG[l]))].join(", ");
  // Places of study: towns ("... linn", "Tallinn") and rural municipalities ("... vald"). A county ("... maakond") or "Välismaa" (abroad) is not a clear town and is left out;
  // when no clear place is left, the row takes the institution's seat from the EHIS institutions query.
  let places = all(r, "toimumisKoht");
  for (const p of places) if (/maakond$|^Välismaa$/.test(p)) placesDropped[p] = (placesDropped[p] || 0) + 1;
  places = [...new Set(places.filter((p) => !/maakond$|^Välismaa$/.test(p)).map(placeName))];
  if (places.length === 0) { places = [inst.city]; seatUsed++; }
  levelCount[level] = (levelCount[level] || 0) + 1;
  const months = Number(one(r, "nominaalKestusKuud") || 0), yearsN = Number(one(r, "nominaalKestusAastad"));
  const credits = Number(one(r, "maht"));
  const url = one(r, "avalikOppekavaFailUrl");
  const en = one(r, "oppekavaNimetusInglise");
  for (const city of places) {
    const p = { key: `ee-${slug(inst.name)}--${slug(name)}--${code}--${slug(city)}`.slice(0, 200).replace(/-+$/, ""), country: CC, institutionId: inst.id, institutionName: inst.name, city,
      domain: group, domainId: iscedToDomain(isced), name, language };
    if (Number.isInteger(credits) && credits >= 60 && credits <= 480) p.credits = credits;
    if (Number.isInteger(yearsN) && yearsN >= 1 && Number.isInteger(months) && months >= 0 && months < 12) p.years = Math.round((yearsN + months / 12) * 100) / 100;
    if (isProgrammeLink(url)) p.url = url;
    p.source = SOURCE;
    p.search = ascii([name, en, group, LEVELS[level], inst.name, city, language].join(" ")).slice(0, 600).trim();
    programs.push(p);
  }
}

const prog = programs.sort((a, b) => a.key.localeCompare(b.key));
const counts = new Map(); for (const p of prog) counts.set(p.institutionId, (counts.get(p.institutionId) || 0) + 1);
const insts = [...institutions.values()].filter((i) => i && counts.has(i.id)).map((i) => ({ ...i, programs: counts.get(i.id) })).sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(new URL("ee-institutions.json", OUT), JSON.stringify(insts, null, 1) + "\n");
fs.writeFileSync(new URL("ee-programs.json", OUT), JSON.stringify(prog) + "\n");
console.log("skipped", skipped, "| curricula kept by level", levelCount, "| curricula placed at the institution seat:", seatUsed, "| places left out:", placesDropped);
if (dropped.length) console.log("dropped:\n" + dropped.join("\n"));
console.log(`${CC}: ${insts.length} institutions, ${prog.length} programme rows written`);
