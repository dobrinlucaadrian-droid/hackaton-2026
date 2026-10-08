// Builds the United States catalogue (institutions + bachelor fields of study) from the College Scorecard open data: node scripts/data/us/build.mjs <raw-folder>
// <raw-folder> holds the two unzipped downloads (see README.md). Writes apps/web/data/catalog/us-institutions.json and us-programs.jsonl.gz.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { DOMAIN_IDS } from "../isced.mjs";

const raw = process.argv[2];
if (!raw) { console.error("usage: node scripts/data/us/build.mjs <raw-folder>"); process.exit(1); }
const SOURCE = "College Scorecard Field of Study 2026-06-10";
const out = new URL("../../../apps/web/data/catalog/", import.meta.url);

// Find the CSV files inside the raw folder (possibly in sub-folders).
const find = (name) => {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.name === "__MACOSX" ? [] : e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
  const hit = walk(raw).find((f) => f.endsWith(name));
  if (!hit) { console.error(`missing ${name} under ${raw}`); process.exit(1); }
  return hit;
};

// Small CSV reader (quotes, embedded commas and newlines).
function* csvRows(s) {
  let f = [], v = "", q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { v += '"'; i++; } else q = false; } else v += c; }
    else if (c === '"') q = true;
    else if (c === ",") { f.push(v); v = ""; }
    else if (c === "\n") { f.push(v.replace(/\r$/, "")); v = ""; yield f; f = []; }
    else v += c;
  }
  if (v || f.length) { f.push(v); yield f; }
}
function readCsv(path) {
  const it = csvRows(readFileSync(path, "utf8"));
  const head = it.next().value;
  const ix = Object.fromEntries(head.map((n, i) => [n, i]));
  const rows = [];
  for (const r of it) if (r.length === head.length) rows.push((k) => r[ix[k]]);
  return rows;
}

// CIP 2020 two-digit family titles (the "domain" label of a programme).
const FAMILY = {
  "01": "Agricultural/Animal/Plant/Veterinary Science and Related Fields", "03": "Natural Resources and Conservation", "04": "Architecture and Related Services",
  "05": "Area, Ethnic, Cultural, Gender, and Group Studies", "09": "Communication, Journalism, and Related Programs", "10": "Communications Technologies/Technicians and Support Services",
  "11": "Computer and Information Sciences and Support Services", "12": "Culinary, Entertainment, and Personal Services", "13": "Education", "14": "Engineering",
  "15": "Engineering/Engineering-Related Technologies/Technicians", "16": "Foreign Languages, Literatures, and Linguistics", "19": "Family and Consumer Sciences/Human Sciences",
  "22": "Legal Professions and Studies", "23": "English Language and Literature/Letters", "24": "Liberal Arts and Sciences, General Studies and Humanities", "25": "Library Science",
  "26": "Biological and Biomedical Sciences", "27": "Mathematics and Statistics", "28": "Reserve Officer Training Corps (JROTC, ROTC)", "29": "Military Technologies and Applied Sciences",
  "30": "Multi/Interdisciplinary Studies", "31": "Parks, Recreation, Leisure, Fitness, and Kinesiology", "32": "Basic Skills and Developmental/Remedial Education",
  "34": "Health-Related Knowledge and Skills", "35": "Interpersonal and Social Skills", "36": "Leisure and Recreational Activities", "38": "Philosophy and Religious Studies",
  "39": "Theology and Religious Vocations", "40": "Physical Sciences", "41": "Science Technologies/Technicians", "42": "Psychology",
  "43": "Homeland Security, Law Enforcement, Firefighting and Related Protective Services", "44": "Public Administration and Social Service Professions", "45": "Social Sciences",
  "46": "Construction Trades", "47": "Mechanic and Repair Technologies/Technicians", "48": "Precision Production", "49": "Transportation and Materials Moving",
  "50": "Visual and Performing Arts", "51": "Health Professions and Related Programs", "52": "Business, Management, Marketing, and Related Support Services", "54": "History",
};

// CIP -> the app's 40 domains. Our own choice. Four-digit codes (CIP "11.07" is "1107" in the Scorecard file) win over two-digit families; null = no clear fit.
// USA: medicine, dentistry, pharmacy, veterinary medicine and law are graduate degrees, so no bachelor field is mapped to medicina, medicina-dentara,
// farmacie or medicina-veterinara (those CIP codes, and "pre-" programmes, stay null).
const CIP4 = {
  // 01 agriculture
  "0100": "agronomie-silvicultura", "0101": "agronomie-silvicultura", "0102": "agronomie-silvicultura", "0103": "agronomie-silvicultura", "0104": "agronomie-silvicultura", "0105": "agronomie-silvicultura",
  "0106": "agronomie-silvicultura", "0107": "agronomie-silvicultura", "0108": "agronomie-silvicultura", "0109": "agronomie-silvicultura", "0110": "agronomie-silvicultura", "0111": "agronomie-silvicultura",
  "0112": "agronomie-silvicultura", "0113": null, "0180": null, "0181": null, "0182": null, "0183": null, "0199": "agronomie-silvicultura",
  // 03 natural resources
  "0301": "geografie-mediu", "0302": "geografie-mediu", "0303": "agronomie-silvicultura", "0305": "agronomie-silvicultura", "0306": "geografie-mediu", "0399": "geografie-mediu",
  // 04 architecture
  "0402": "arhitectura", "0403": "arhitectura", "0404": "arhitectura", "0405": "arhitectura", "0406": "arhitectura", "0408": "arhitectura", "0409": "arhitectura", "0410": null, "0499": "arhitectura",
  // 05 area / ethnic studies
  "0501": null, "0502": null, "0599": null,
  // 10 communications technologies
  "1001": null, "1002": "teatru-film", "1003": "arte-vizuale-design", "1099": null,
  // 11 computing
  "1101": "informatica", "1102": "informatica", "1103": "calculatoare-it", "1104": "informatica", "1105": "calculatoare-it", "1107": "informatica", "1108": "informatica",
  "1109": "calculatoare-it", "1110": "calculatoare-it", "1199": "informatica",
  // 12 services
  "1203": null, "1205": "turism-servicii",
  // 14 engineering
  "1401": null, "1402": "inginerie-mecanica", "1403": "agronomie-silvicultura", "1404": "inginerie-civila", "1405": null, "1406": "inginerie-chimica-materiale", "1407": "inginerie-chimica-materiale",
  "1408": "inginerie-civila", "1409": "calculatoare-it", "1410": "inginerie-electrica-electronica", "1411": "inginerie-mecanica", "1412": null, "1413": null, "1414": "energie-petrol-mediu",
  "1418": "inginerie-chimica-materiale", "1419": "inginerie-mecanica", "1420": "inginerie-chimica-materiale", "1421": "energie-petrol-mediu", "1422": "marina-transporturi", "1423": "energie-petrol-mediu",
  "1424": "marina-transporturi", "1425": "energie-petrol-mediu", "1427": null, "1428": "inginerie-chimica-materiale", "1432": "inginerie-chimica-materiale", "1433": "inginerie-civila",
  "1434": "agronomie-silvicultura", "1435": "inginerie-mecanica", "1436": "inginerie-mecanica", "1437": "matematica", "1438": "inginerie-civila", "1439": "energie-petrol-mediu",
  "1440": "inginerie-chimica-materiale", "1441": "inginerie-electrica-electronica", "1442": "inginerie-electrica-electronica", "1443": "inginerie-chimica-materiale", "1444": "inginerie-chimica-materiale",
  "1445": null, "1447": "inginerie-electrica-electronica", "1448": "energie-petrol-mediu", "1499": null,
  // 15 engineering technologies
  "1500": null, "1501": "inginerie-civila", "1502": "inginerie-civila", "1503": "inginerie-electrica-electronica", "1504": "inginerie-electrica-electronica", "1505": "energie-petrol-mediu",
  "1506": "inginerie-mecanica", "1507": null, "1508": "inginerie-mecanica", "1509": "energie-petrol-mediu", "1510": "inginerie-civila", "1511": null, "1512": "inginerie-electrica-electronica",
  "1513": null, "1514": "energie-petrol-mediu", "1515": null, "1516": null, "1517": "energie-petrol-mediu", "1599": null,
  // 19 family and consumer sciences
  "1909": "arte-vizuale-design",
  // 24 liberal arts, 25 library
  "2401": null, "2501": null, "2599": null,
  // 30 interdisciplinary
  "3005": "stiinte-politice-relatii-internationale", "3008": "informatica", "3013": "istorie", "3020": "stiinte-politice-relatii-internationale", "3021": "istorie", "3022": "istorie",
  "3027": "biologie", "3029": "marina-transporturi", "3030": "informatica", "3031": "informatica", "3032": "geografie-mediu", "3033": "geografie-mediu", "3035": "geografie-mediu",
  "3036": "litere-limbi-straine", "3038": "geografie-mediu", "3041": "geografie-mediu", "3044": "geografie-mediu", "3049": "economie-finante", "3070": "informatica", "3071": "informatica",
  // 31 recreation and kinesiology
  "3101": "turism-servicii", "3103": "turism-servicii", "3105": "sport-kinetoterapie", "3106": null, "3199": "sport-kinetoterapie",
  // 38 philosophy and religion
  "3800": null, "3801": "filosofie", "3802": "teologie", "3899": null,
  // 40 physical sciences
  "4001": null, "4002": "fizica", "4004": "geografie-mediu", "4005": "chimie", "4006": "geografie-mediu", "4008": "fizica", "4010": "inginerie-chimica-materiale", "4011": "fizica", "4099": null,
  // 43 protective services
  "4301": "militar-politie", "4302": "militar-politie", "4303": "militar-politie", "4304": "militar-politie", "4399": "militar-politie",
  // 44 public administration and social service
  "4400": "sociologie-asistenta-sociala", "4402": "sociologie-asistenta-sociala", "4404": "administratie-publica", "4405": "administratie-publica", "4407": "sociologie-asistenta-sociala", "4499": null,
  // 45 social sciences
  "4501": null, "4502": "sociologie-asistenta-sociala", "4503": "istorie", "4504": "sociologie-asistenta-sociala", "4505": "sociologie-asistenta-sociala", "4506": "economie-finante",
  "4507": "geografie-mediu", "4509": "stiinte-politice-relatii-internationale", "4510": "stiinte-politice-relatii-internationale", "4511": "sociologie-asistenta-sociala", "4512": null,
  "4513": "sociologie-asistenta-sociala", "4599": null,
  // 49 transportation
  "4901": "marina-transporturi", "4903": "marina-transporturi", "4999": null,
  // 50 visual and performing arts
  "5001": null, "5002": "arte-vizuale-design", "5003": "teatru-film", "5004": "arte-vizuale-design", "5005": "teatru-film", "5006": "teatru-film", "5007": "arte-vizuale-design", "5009": "muzica",
  "5010": null, "5011": "arte-vizuale-design", "5099": null,
  // 51 health (no medicina / medicina-dentara / farmacie / medicina-veterinara: graduate professions in the USA)
  "5100": null, "5102": null, "5105": null, "5106": null, "5107": null, "5108": null, "5109": "asistenta-medicala", "5110": "asistenta-medicala", "5111": null, "5112": null, "5114": null,
  "5115": null, "5116": "asistenta-medicala", "5118": null, "5120": null, "5122": null, "5123": "sport-kinetoterapie", "5127": null, "5131": null, "5132": null, "5133": null, "5134": null,
  "5135": null, "5136": null, "5137": null, "5138": "asistenta-medicala", "5139": "asistenta-medicala", "5199": null,
  // 52 business
  "5201": "business-management", "5202": "business-management", "5203": "economie-finante", "5204": "business-management", "5205": "business-management", "5206": "economie-finante",
  "5207": "business-management", "5208": "economie-finante", "5209": "turism-servicii", "5210": "business-management", "5211": "business-management", "5212": "business-management",
  "5213": "business-management", "5214": "marketing", "5215": "business-management", "5216": "economie-finante", "5217": "economie-finante", "5218": "marketing", "5219": "marketing",
  "5220": "business-management", "5221": "business-management", "5299": "business-management",
};
const CIP2 = { "09": "comunicare-jurnalism", "13": "stiintele-educatiei", "16": "litere-limbi-straine", "22": "drept", "23": "litere-limbi-straine", "26": "biologie", "27": "matematica",
  "28": "militar-politie", "29": "militar-politie", "39": "teologie", "42": "psihologie", "54": "istorie" };
const domainOf = (cip) => (cip in CIP4 ? CIP4[cip] : CIP2[cip.slice(0, 2)] ?? null);
for (const v of [...Object.values(CIP4), ...Object.values(CIP2)]) if (v !== null && !DOMAIN_IDS.includes(v)) throw new Error(`unknown domain id ${v}`);

// The ten existing university sheets (exact Scorecard names).
const SHEETS = { "Harvard University": "harvard", "Yale University": "yale", "Princeton University": "princeton", "Columbia University in the City of New York": "columbia",
  "University of Pennsylvania": "upenn", "Brown University": "brown", "Dartmouth College": "dartmouth", "Cornell University": "cornell", "Massachusetts Institute of Technology": "mit", "Stanford University": "stanford" };

const STATES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
const tidy = (s) => s.replace(/\s+/g, " ").trim();
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const ascii = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const website = (u) => { u = tidy(u || ""); if (!u) return undefined; if (!/^https?:\/\//i.test(u)) u = "https://" + u; u = u.replace(/\/+$/, ""); return /^https?:\/\/[^\s]+\.[^\s]+$/.test(u) ? u : undefined; };

// ---- Institutions ----
const instRows = readCsv(find("Most-Recent-Cohorts-Institution.csv"));
const stats = { institutionsInFile: instRows.length, notOperating: 0, branch: 0, notFourYear: 0, forProfit: 0, otherControl: 0, outsideStates: 0 };
const keep = new Map();
for (const g of instRows) {
  if (g("CURROPER") !== "1") { stats.notOperating++; continue; }
  if (g("MAIN") !== "1") { stats.branch++; continue; }
  if (g("ICLEVEL") !== "1") { stats.notFourYear++; continue; }
  const control = g("CONTROL");
  if (control === "3") { stats.forProfit++; continue; }
  if (control !== "1" && control !== "2") { stats.otherControl++; continue; }
  if (!STATES.has(g("STABBR"))) { stats.outsideStates++; continue; }
  keep.set(g("UNITID"), { unitid: g("UNITID"), name: tidy(g("INSTNM")), city: `${tidy(g("CITY"))}, ${g("STABBR")}`, kind: control === "1" ? "public" : "private", website: website(g("INSTURL")) });
}
stats.institutionsKept = keep.size;

// Ids: existing sheet ids, else "us-" + slug (+ unit id when the slug collides).
const slugCount = new Map();
for (const i of keep.values()) slugCount.set(slug(i.name), (slugCount.get(slug(i.name)) || 0) + 1);
const usedIds = new Set();
for (const i of keep.values()) {
  if (SHEETS[i.name]) { i.id = SHEETS[i.name]; i.hasSheet = true; }
  else { i.id = "us-" + slug(i.name).slice(0, 70); if (slugCount.get(slug(i.name)) > 1 || usedIds.has(i.id)) i.id += "-" + i.unitid; i.hasSheet = false; }
  usedIds.add(i.id);
}
const missingSheets = Object.entries(SHEETS).filter(([n]) => ![...keep.values()].some((i) => i.name === n)).map(([n]) => n);

// ---- Programmes (bachelor's degree, credential level 3) ----
const fos = readCsv(find("Most-Recent-Cohorts-Field-of-Study.csv"));
stats.fieldRowsInFile = fos.length;
const programs = []; const seen = new Set(); const perInst = new Map();
stats.bachelorRowsAtKeptInstitutions = 0; stats.droppedReservedOrHighSchool = 0;
for (const g of fos) {
  if (g("CREDLEV") !== "3") continue;
  const inst = keep.get(g("UNITID"));
  if (!inst) continue;
  stats.bachelorRowsAtKeptInstitutions++;
  const cip = g("CIPCODE");
  const name = tidy(g("CIPDESC")).replace(/\.$/, "");
  if (/^reserved$/i.test(name) || cip.startsWith("53")) { stats.droppedReservedOrHighSchool++; continue; } // not real bachelor fields
  const family = FAMILY[cip.slice(0, 2)];
  if (!family) throw new Error(`no family title for CIP ${cip}`);
  const key = `us-${inst.id.replace(/^us-/, "")}--${cip}-${slug(name).slice(0, 60)}`.replace(/-+$/, "");
  if (seen.has(key)) continue;
  seen.add(key);
  perInst.set(inst.id, (perInst.get(inst.id) || 0) + 1);
  programs.push({
    key, country: "US", institutionId: inst.id, institutionName: inst.name, city: inst.city, domain: family, domainId: domainOf(cip), name, language: "engleză", years: 4, source: SOURCE,
    search: ascii(`${name} ${family} ${inst.name} ${inst.city} engleza`),
  });
}
programs.sort((a, b) => (a.key < b.key ? -1 : 1));

const institutions = [...keep.values()].filter((i) => perInst.has(i.id)).map((i) => {
  const o = { id: i.id, country: "US", source: SOURCE, name: i.name, officialName: i.name, city: i.city, kind: i.kind, hasSheet: i.hasSheet };
  if (i.website) o.website = i.website;
  o.programs = perInst.get(i.id);
  return o;
}).sort((a, b) => (a.id < b.id ? -1 : 1));
stats.institutionsWithoutBachelorRows = keep.size - institutions.length;

writeFileSync(new URL("us-institutions.json", out), JSON.stringify(institutions, null, 1) + "\n");
const jsonOld = new URL("us-programs.json", out);
if (existsSync(jsonOld)) rmSync(jsonOld);
const gz = new URL("us-programs.jsonl.gz", out);
writeFileSync(gz, gzipSync(programs.map((p) => JSON.stringify(p)).join("\n") + "\n", { level: 9 }));

const noDomain = programs.filter((p) => p.domainId === null).length;
console.log(JSON.stringify(stats, null, 1));
console.log(`institutions ${institutions.length}, programmes ${programs.length}, without domain ${noDomain} (${((100 * noDomain) / programs.length).toFixed(1)}%), cities ${new Set(institutions.map((i) => i.city)).size}`);
console.log(`us-programs.jsonl.gz ${(statSync(gz).size / 1e6).toFixed(2)} MB; sheets missing: ${missingSheets.join(", ") || "none"}`);
