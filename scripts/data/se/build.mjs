// Builds the Sweden catalogue (institutions + first-cycle and integrated degree programmes currently open for admission) from the Susa-navet open API (Skolverket, higher-education data from UHR). Usage: node scripts/data/se/build.mjs <raw folder>
// The raw folder gets every page of educationProviders, educationInfos and educationEvents (schoolType=HS, 2000 per page) and the SCB municipality list; files already there are reused.
import fs from "node:fs";
import path from "node:path";
import { DOMAIN_IDS } from "../isced.mjs";

const dir = process.argv[2];
if (!dir) { console.error("usage: node scripts/data/se/build.mjs <raw folder>"); process.exit(1); }
fs.mkdirSync(dir, { recursive: true });
const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);
const CC = "SE";
const SOURCE = "Susa-navet (Skolverket/UHR) 2026-10";
const API = "https://api.skolverket.se/susa-navet/emil3";
const SCB = "https://api.scb.se/OV0104/v1/doris/sv/ssd/BE/BE0101/BE0101A/BefolkningNy";
const CURRENT_FROM = "2026-08-01"; // events starting with the autumn 2026 intake or later count as "currently offered"

// ---------- download ----------
async function getJson(url, file) {
  const f = path.join(dir, file);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  const t = await r.text(); fs.writeFileSync(f, t); return JSON.parse(t);
}
async function all(ep) {
  const out = [];
  for (let page = 0; ; page++) {
    const j = await getJson(`${API}/${ep}?schoolType=HS&size=2000&page=${page}`, `${ep}-${page}.json`);
    out.push(...j[ep]);
    if (page + 1 >= j.page.totalPages) return out;
  }
}
const providers = await all("educationProviders"), infos = await all("educationInfos"), events = await all("educationEvents");
const scb = await getJson(SCB, "scb-regions.json");
const region = scb.variables.find((v) => v.code === "Region");
const KOMMUN = Object.fromEntries(region.values.map((v, i) => [v, region.valueTexts[i]]).filter(([v]) => /^\d{4}$/.test(v)));

// ---------- helpers ----------
const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const ascii = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");
const str = (ls, lang) => tidy((ls?.strings || []).find((x) => x.lang === lang)?.value);
const titleCase = (s) => (s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()) : s);
const LANG = { swe: "suedeză", eng: "engleză", ger: "germană", fre: "franceză", spa: "spaniolă", ita: "italiană", fin: "finlandeză", nor: "norvegiană", dan: "daneză" };

// ---------- existing sheets (apps/web/data/universities-abroad.json, country "Suedia"), matched by provider id ----------
const SHEETS = {
  "p.uoh.lu": "lund", "p.uoh.kth": "kth", "p.uoh.uu": "uppsala", "p.uoh.su": "stockholm-university", "p.uoh.cth": "chalmers",
  "p.uoh.gu": "gothenburg", "p.uoh.liu": "linkoping-university", "p.uoh.umu": "umea-university", "p.uoh.mau": "malmo-university", "p.uoh.kau": "karlstad-university",
};

// ---------- domains: from the degree, then careful keywords of the title (the source's UH_Subject codes come without labels) ----------
const has = (s, re) => re.test(s);
const B = "(?:^|[^a-zåäöé])"; // word start
const w = (x) => new RegExp(B + x, "i");
const DEGREE_RULES = [
  [/^läkarexamen/i, "medicina"], [/^tandläkarexamen/i, "medicina-dentara"], [/^(apotekar|receptarie)examen/i, "farmacie"],
  [/^veterinärexamen/i, "medicina-veterinara"], [/^djursjukskötarexamen/i, "medicina-veterinara"],
  [/^(röntgen)?sjuksköterskeexamen|^barnmorskeexamen|^biomedicinsk analytikerexamen|^audionomexamen|^optikerexamen/i, "asistenta-medicala"],
  [/^fysioterapeutexamen/i, "sport-kinetoterapie"], [/^psykologexamen/i, "psihologie"], [/^juristexamen/i, "drept"], [/^socionomexamen/i, "sociologie-asistenta-sociala"],
  [/^(landskaps)?arkitektexamen/i, "arhitectura"], [/^(förskollärar|grundlärar|ämneslärar|yrkeslärar|folkhögskollärar|lärar)examen/i, "stiintele-educatiei"],
  [/^civilekonomexamen/i, "business-management"], [/^(agronom|hortonom|jägmästar|skogsmästar|lantmästar|trädgårdsingenjörs|landskapsingenjörs|hippolog)examen/i, "agronomie-silvicultura"],
  [/^(sjökaptens|sjöingenjörs)examen/i, "marina-transporturi"], [/^officersexamen/i, "militar-politie"],
];
// degrees whose field is clear but has no good app domain (or is doubtful): no keyword guess for them
const DEGREE_NULL = /^(dietist|arbetsterapeut|logoped|tandhygienist|tandtekniker|ortopedingenjörs|brandingenjörs|sjukhusfysiker|studie- och yrkesvägledar)examen/i;
const TITLE_RULES = [
  [/industriell ekonomi/i, null],
  [/datateknik|dataingenjör|computer engineering|it-säkerhet|cybersäkerhet|nätverksteknik|nätverksadministration|nätverks- och systemadministration|it-forensik|informationsteknik|information technology/i, "calculatoare-it"],
  [/datavetenskap|computer science|programvaruteknik|mjukvaruteknik|mjukvaruutveckling|systemutveckl|systemvetar|software|systemvetenskap|informatik|webbutveckling|spelutveckling|game development|data science/i, "informatica"],
  [/elektroteknik|elektronik|electrical|elkraft|elektroingenjör/i, "inginerie-electrica-electronica"],
  [/maskinteknik|maskiningenjör|mechanical engineering|fordonsteknik|flygteknik|farkostteknik/i, "inginerie-mecanica"],
  [/byggteknik|byggingenjör|väg- och vatten|samhällsbyggnad|civil engineering|byggnadsteknik/i, "inginerie-civila"],
  [/kemiteknik|kemiingenjör|chemical engineering|materialteknik/i, "inginerie-chimica-materiale"],
  [/energiteknik|energiingenjör|energisystem|miljöteknik/i, "energie-petrol-mediu"],
  [/journalistik|journalistprogram|journalism|kommunikation och pr|medievetar|medie- och kommunikationsvetenskap|medievetenskap|kommunikationsvetenskap|strategisk kommunikation|public relations/i, "comunicare-jurnalism"],
  [/statsvetenskap|statsvetar|politices kandidat|political science|internationella relationer|international relations|freds- och konflikt|peace and conflict/i, "stiinte-politice-relatii-internationale"],
  [/offentlig förvaltning|public administration|förvaltningsprogram/i, "administratie-publica"],
  [/marknadsföring|marketing/i, "marketing"],
  [/nationalekonomi|economics|finansiell ekonomi|finance|redovisning|revision|bank/i, "economie-finante"],
  [/företagsekonomi|business|ekonomprogram|management|logistik|personal- och arbetsliv|personalvetar|internationella affärer/i, "business-management"],
  [/juridik|rättsvetenskap|juristprogram/i, "drept"],
  [/psykologi|psychology/i, "psihologie"],
  [/sociologi|socialantropologi|antropolog|socialt arbete|social work|socionom|socialpedagog|kriminologi/i, "sociologie-asistenta-sociala"],
  [/sjuksköterske|nursing|biomedicinsk analytiker|röntgensjuksköterske|barnmorske/i, "asistenta-medicala"],
  [/fysioterapi|idrott|sport|tränarprogram|coach/i, "sport-kinetoterapie"],
  [/turism|tourism|hotell|måltid|gastronomi|restaurang/i, "turism-servicii"],
  [/sjöfart|sjökapten|sjöingenjör|maritim|trafikflyg|flygtrafik|pilot/i, "marina-transporturi"],
  [/lantbruk|skogs|trädgård|agronom|hippolog|husdjur|djurvetenskap|jordbruk/i, "agronomie-silvicultura"],
  [/matematik|mathematics|statistik|statistics/i, "matematica"],
  [w("fysik|physics|astronomi"), "fizica"],
  [w("kemi(?!sk)|chemistry"), "chimie"],
  [/biologi|biology|biomedicin|molekylär|bioteknik/i, "biologie"],
  [/geografi|geovetenskap|miljövetenskap|environmental science|geologi|meteorologi|oceanografi/i, "geografie-mediu"],
  [/arkitektur/i, "arhitectura"],
  [/lingvistik|linguistics|översättning|tolkning|litteratur|literature|språk|engelska|franska|spanska|tyska|italienska|japanska|kinesiska|arabiska|ryska|nordiska|english|french|german|spanish/i, "litere-limbi-straine"],
  [/historia|history|arkeologi|archaeology|antikens kultur/i, "istorie"],
  [/filosofi|philosophy/i, "filosofie"],
  [/teologi|religionsvetenskap|theology|religion/i, "teologie"],
  [/musik|music/i, "muzica"],
  [w("teater|film|skådespel|dans|scenkonst|opera|koreografi"), "teatru-film"],
  [/pedagogik|förskol|lärar|education/i, "stiintele-educatiei"],
];
const DESIGN = /design|fri konst|bildkonst|konsthantverk|fotografi|illustration|formgivning|keramik|textil/i;
const NOT_ART = /teknik|ingenjör|interaktion|digital|spel|system|webb|data|it-|user experience|ux/i;
function domainOf(title, degrees) {
  for (const d of degrees) for (const [re, id] of DEGREE_RULES) if (re.test(d)) return id;
  if (degrees.some((d) => DEGREE_NULL.test(d))) return null;
  for (const [re, id] of TITLE_RULES) if (re.test(title)) return id;
  if (DESIGN.test(title) && !NOT_ART.test(title)) return "arte-vizuale-design";
  return null;
}

// ---------- filters ----------
// admission-round markers that some institutions add to the title of the same programme (national / international round, first / second round)
const ROUND = /\s*[-–,]?\s*\(?\s*(?:(?:inter)?nationell antagningsomgång|första antagningsomgången|andra antagningsomgången|internationella studenter|EU\/EES-studenter)\s*\)?\s*$/i;
function stripRound(t) { return tidy(String(t ?? "").replace(ROUND, "").replace(/[\s,]+$/, "")).replace(/^(.+?) - \1$/i, "$1"); } // also "X - X" -> "X"
const skipped = {};
const skip = (why) => { skipped[why] = (skipped[why] || 0) + 1; };
const EXCLUDE_TITLE = /senare del|kompletterande (pedagogisk )?utbildning|kompletteringsutbildning|\bKPU\b|vidareutbildning|utbytesstudier|exchange studies|behörighetsgivande|förutbildning|tekniskt basår|basår|bastermin/i;
const EXCLUDE_FUNDING = new Set(["VAL", "ULV", "UKU", "KPL"]); // further training for people who already hold a teaching or foreign degree
const evByInfo = new Map();
for (const e of events) { const k = e.content.education; if (!evByInfo.has(k)) evByInfo.set(k, []); evByInfo.get(k).push(e); }
const provById = new Map(providers.map((p) => [p.id, p]));

const groups = new Map(); // inst|title|credits|city -> row data
for (const i of infos) {
  const c = i.content;
  if (i.status !== "ACTIVE") { skip("not ACTIVE"); continue; }
  if (c.configuration?.code !== "program") { skip("not a programme (course or course package)"); continue; }
  const levels = (c.educationLevels || []).map((x) => x.code);
  if (!levels.includes("grund") && !levels.includes("grundavancerad")) { skip("programme: second cycle or preparatory level"); continue; }
  const degrees = (c.degrees || []).map((d) => str(d, "swe") || tidy(d.strings?.[0]?.value)).filter(Boolean);
  if (!c.resultIsDegree || !degrees.length || degrees.every((d) => /^ingen examen$/i.test(d))) { skip("programme: no degree"); continue; }
  const title = stripRound(str(c.title, "swe") || str(c.title, "eng"));
  const engTitle = stripRound(str(c.title, "eng"));
  const credits = c.credits?.system?.code === "hp" ? c.credits.credits : undefined;
  if (!Number.isInteger(credits) || credits < 120) { skip("programme: under 120 hp or no credits (complementary or later-part entries)"); continue; }
  if (EXCLUDE_TITLE.test(title)) { skip("programme: later part, complementary, further training or exchange (title)"); continue; }
  if (c.expires && c.expires.slice(0, 10) < "2026-10-19") { skip("programme: expired"); continue; }
  const evs = (evByInfo.get(i.id) || []).filter((e) => e.status === "ACTIVE");
  const cur = evs.filter((e) => {
    const x = e.content, ext = x.extensions?.[0] || {};
    if (x.isCancelled === true) return false; // a missing flag is not a cancellation
    if (!(x.execution?.start >= CURRENT_FROM)) return false;
    if (EXCLUDE_FUNDING.has(ext.formOfFunding)) return false;
    const ad = ext.applicationDetails || {};
    return ad.visibleToSwedishApplicants === true || ad.visibleToInternationalApplicants === true;
  });
  if (!cur.length) { skip("programme: no current, not cancelled event open to applicants (start from autumn 2026)"); continue; }
  for (const e of cur) {
    const x = e.content;
    const provId = x.providers?.[0];
    if (!provId?.startsWith("p.uoh.") || x.providers.length !== 1) { skip("event: provider is not one higher-education institution (police training)"); continue; }
    const loc = x.locations?.length === 1 ? x.locations[0] : null;
    const city = loc && KOMMUN[loc.areaCode];
    if (!city) { skip("event: no single municipality code"); continue; }
    const langs = (x.languageOfInstructions || []).filter(Boolean);
    if (!langs.length || langs.some((l) => !LANG[l])) { skip("event: no or unknown language of instruction"); continue; }
    const where = str(loc.studyLocation, "swe");
    const form = /^(distans|ortsoberoende)$/i.test(where) ? "distance" : x.paceOfStudy?.percentage === 100 ? "full-time" : x.paceOfStudy?.percentage > 0 ? "part-time" : undefined;
    const key = `${provId}|${ascii(title)}|${credits}|${city}`;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { provId, title, credits, city, degrees: new Set(), langs: new Set(), forms: new Set(), urls: [], codes: new Set(), eng: new Set(), titles: new Set() }));
    g.codes.add(String(c.code).toUpperCase());
    if (engTitle) g.eng.add(ascii(engTitle));
    g.titles.add(title);
    degrees.forEach((d) => g.degrees.add(d));
    langs.forEach((l) => g.langs.add(LANG[l]));
    g.forms.add(form);
    const url = (x.url?.urls || []).find((u) => u.lang === "swe")?.value || x.url?.urls?.[0]?.value;
    if (url && /^https?:\/\/\S+\.\S+$/.test(url.trim())) g.urls.push(url.trim());
  }
}

// ---------- institutions and rows ----------
const instOf = new Map();
function institution(provId) {
  if (instOf.has(provId)) return instOf.get(provId);
  const p = provById.get(provId).content;
  const name = str(p.name, "swe");
  const town = tidy(p.visitAddresses?.[0]?.town);
  const inst = { id: SHEETS[provId] || `se-${slug(name)}`.slice(0, 80), country: CC, source: SOURCE, name, officialName: name, city: /\d/.test(town) || !town ? null : titleCase(town), kind: "unknown", hasSheet: !!SHEETS[provId] };
  const site = tidy(p.url?.urls?.[0]?.value);
  if (/^https?:\/\/\S+\.\S+$/.test(site)) inst.website = site;
  inst.programs = 0;
  instOf.set(provId, inst);
  return inst;
}
// Same programme listed under a Swedish and an English title (one admission round each): same institution, programme code, credits and city,
// the same English title, and one of the two Swedish titles is just that English title. Merged into the row with the Swedish title.
const merged = [];
for (const a of groups.values()) for (const b of groups.values()) {
  if (a === b || a.dead || b.dead || a.provId !== b.provId || a.credits !== b.credits || a.city !== b.city) continue;
  if (![...a.codes].some((x) => b.codes.has(x)) || ![...a.eng].some((x) => b.eng.has(x))) continue;
  if (!b.eng.has(ascii(b.title)) || /[åäö]/i.test(b.title) || a.eng.has(ascii(a.title))) continue; // b's "Swedish" title is the English one, a's is a real Swedish title
  for (const f of ["degrees", "langs", "forms", "codes", "eng", "titles"]) b[f].forEach((v) => a[f].add(v));
  a.urls.push(...b.urls); b.dead = true; merged.push(`${provById.get(a.provId).content.name.strings[0].value}: "${b.title}" into "${a.title}"`);
}
for (const [k, g] of groups) if (g.dead) groups.delete(k);
console.log("merged English/Swedish title pairs:", merged);
if (process.env.DUPCHECK) {
  const byCode = new Map();
  for (const g of groups.values()) for (const code of g.codes) { const k = `${g.provId}|${code}|${g.city}`; byCode.set(k, [...(byCode.get(k) || []), g]); }
  for (const [k, gs] of byCode) if (gs.length > 1) console.log("SAME CODE", k, gs.map((g) => `${g.title} ${g.credits}`).join(" || "));
  for (const g of groups.values()) if (g.codes.size > 1) console.log("SEVERAL CODES", g.provId, g.title, g.city, [...g.codes].join(","));
}
const programs = [];
const keys = new Set();
for (const g of [...groups.values()].sort((a, b) => (a.provId + a.title + a.city).localeCompare(b.provId + b.title + b.city, "sv"))) {
  const inst = institution(g.provId);
  const degrees = [...g.degrees];
  const language = [...g.langs].sort((a, b) => (a === "suedeză" ? -1 : b === "suedeză" ? 1 : a.localeCompare(b))).join(", ");
  const domain = degrees.join("; ");
  let key = `se-${slug(inst.name)}--${slug(g.title)}`.slice(0, 160) + `--${g.credits}--${slug(g.city)}`;
  for (let n = 2; keys.has(key); n++) key = key.replace(/(-\d+)?$/, `-${n}`);
  keys.add(key);
  const p = { key, country: CC, institutionId: inst.id, institutionName: inst.name, city: g.city, domain, domainId: domainOf(g.title, degrees), name: g.title, language };
  if (g.forms.size === 1 && [...g.forms][0]) p.form = [...g.forms][0];
  p.credits = g.credits;
  if (g.urls.length) p.url = g.urls[0];
  p.source = SOURCE;
  p.search = ascii([g.title, domain, inst.name, g.city, language].join(" ")).slice(0, 600).trim();
  programs.push(p);
  inst.programs++;
}
const insts = [...instOf.values()];
for (const i of insts) if (!i.city) { // seat missing or not a town in the provider record: the municipality where most of its rows are taught
  const n = {}; for (const p of programs) if (p.institutionId === i.id) n[p.city] = (n[p.city] || 0) + 1;
  i.city = Object.entries(n).sort((a, b) => b[1] - a[1])[0][0];
  console.log(`seat of ${i.name} taken from its programmes: ${i.city}`);
}
for (const id of new Set(programs.map((p) => p.domainId))) if (id !== null && !DOMAIN_IDS.includes(id)) throw new Error(`bad domain ${id}`);

fs.writeFileSync(new URL("se-institutions.json", OUT), JSON.stringify(insts.sort((a, b) => b.programs - a.programs), null, 1) + "\n");
const body = JSON.stringify(programs);
if (body.length > 4.5e6) throw new Error("programmes file over 4.5 MB: write .jsonl.gz");
fs.writeFileSync(new URL("se-programs.json", OUT), body + "\n");
console.log(`infos ${infos.length}, events ${events.length}; kept ${programs.length} rows, ${insts.length} institutions, ${insts.filter((i) => i.hasSheet).length} with a sheet, ${programs.filter((p) => p.domainId === null).length} without a domain`);
console.log("skipped:", skipped);
