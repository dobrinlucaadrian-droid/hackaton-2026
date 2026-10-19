// Builds the Bulgarian catalogue (institutions + bachelor programmes) from the Europass "Learning Opportunities and Qualifications" open data, Bulgarian
// country dataset (records published by the Human Resource Development Centre); the institution's city comes from the DEQAR institutions register.
// Usage: node scripts/data/bg/build.mjs <raw folder>   (the folder gets the Europass ZIP, its .ttl files and deqar-institutions.csv; downloaded when missing)
const CC = "BG";
const ZIP_NAME = "bgr-ttl_1.zip";
const ZIP_URL = "https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/bgr/ttl/bgr-ttl_1.zip";
const DEQAR_URL = "https://backend.deqar.eu/static/daily-csv/deqar-institutions.csv";
const SOURCE = "Europass QDR Bulgaria (HRDC) 2026-10";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { iscedToDomain } from "../isced.mjs";

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
async function download(url, file) {
  console.log("downloading", url);
  const r = await fetch(url); if (!r.ok) throw new Error(`download failed: ${r.status} ${url}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}
async function ensureRaw() {
  if (!existsSync(`${raw}/deqar-institutions.csv`)) await download(DEQAR_URL, `${raw}/deqar-institutions.csv`);
  if (readdirSync(raw).some((f) => f.endsWith(".ttl"))) return;
  const zip = `${raw}/${ZIP_NAME}`;
  if (!existsSync(zip)) await download(ZIP_URL, zip);
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
const KEEP_TYPES = new Set(["elm:LearningOpportunity", "elm:LearningAchievementSpecification", "elm:Organisation", "dct:PeriodOfTime"]);
const DROP_PROPS = new Set(["dct:description", "elm:learningOutcome", "elm:learningOutcomeSummary", "elm:additionalNote"]);
function loadGraph() {
  const g = new Map();
  for (const f of readdirSync(raw).filter((f) => f.endsWith(".ttl")).sort()) {
    const txt = readFileSync(`${raw}/${f}`, "utf8");
    for (const blk of txt.split(/\n\n+(?=<)/)) {
      const r = parseBlock(blk); if (!r || !r.types.some((t) => KEEP_TYPES.has(t))) continue;
      for (const p of DROP_PROPS) delete r.props[p];
      g.set(r.id, r);
    }
  }
  return g;
}
/** Small CSV reader (quoted fields, doubled quotes). */
function csv(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f.replace(/\r$/, "")); rows.push(row); row = []; f = ""; } else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const first = (r, p) => r?.props[p]?.[0];
const lit = (r, p) => first(r, p)?.lit;
const last = (iri) => (iri || "").split("/").pop();
const clean = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
// Bulgarian Cyrillic -> Latin (Bulgarian official transliteration, 2009) for the ASCII search text and the keys.
const CYR = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya", ё: "yo", э: "e", ы: "y" };
const translit = (s) => String(s).toLowerCase().replace(/[а-яёэы]/g, (c) => CYR[c] ?? c);
const ascii = (s) => translit(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");
const norm = (s) => clean(s).toLowerCase().replace(/[„“”"'’«»]/g, "").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
const titleOf = (r, lang2) => { const ts = r?.props["dct:title"] || []; return clean((ts.find((t) => t.lang === lang2) || ts[0])?.lit); };
const LANG = { BUL: "bulgară", ENG: "engleză", RUS: "rusă", FRA: "franceză", DEU: "germană", SPA: "spaniolă", ITA: "italiană", ARA: "arabă", POR: "portugheză", SQI: "albaneză", RON: "română", TUR: "turcă", GRE: "greacă", ELL: "greacă" };

// The degree is written only in the title of the linked specification ("Придобиване на образователна квалификационна степен - Бакалавър").
// Kept: bachelor, professional bachelor, and the integrated master entered after secondary school ("Магистър след средно": medicine, pharmacy, law, architecture...).
// Minimum durations from the Bulgarian Higher Education Act (art. 42): bachelor 4 years, professional bachelor 3 years, master after secondary school 5 years.
// A record whose own duration is below that minimum is not a first degree entered from school (for example a shortened programme for graduates) and is dropped.
const DEGREES = { "Бакалавър": 4, "Професионален бакалавър": 3, "Магистър след средно": 5 };
const degreeOf = (spec) => { const m = /^Придобиване на образователна квалификационна степен - (.+)$/.exec(titleOf(spec, "bg")); return m && m[1] in DEGREES ? m[1] : null; };
/** Duration "P1461D" (days) -> years rounded to a half year. */
const yearsOf = (d) => { const m = /^P(\d+)D$/.exec(d || ""); if (!m) return undefined; const y = Math.round((+m[1] / 365.25) * 2) / 2; return y >= 1 && y <= 8 ? y : undefined; };
// Programmes for graduates of another degree say so in their title: "(след ОКС "проф.бакалавър")", "(след проф.бакалавър)", "(след ПБ)", "(след ОКС "специалист")".
const AFTER_DEGREE = /\(\s*след\s/i;
// A teaching language named in the title ("(на английски език)", "in English") must agree with the record's language; otherwise the row is dropped.
const TITLE_LANG = [[/английски/i, "ENG"], [/френски/i, "FRA"], [/немски/i, "DEU"], [/руски/i, "RUS"], [/испански/i, "SPA"], [/италиански/i, "ITA"], [/български/i, "BUL"]];
const titleLang = (bg, en) => {
  const m = /на\s+([а-я]+)\s+език/i.exec(bg) || /\bin\s+(english|french|german|russian|spanish|italian|bulgarian)(\s+language)?\b/i.exec(en);
  if (!m) return null; const w = m[1].toLowerCase();
  const en2 = { english: "ENG", french: "FRA", german: "DEU", russian: "RUS", spanish: "SPA", italian: "ITA", bulgarian: "BUL" };
  if (en2[w]) return en2[w]; for (const [re, c] of TITLE_LANG) if (re.test(w)) return c; return "?";
};

// Institution (provider legal name in Bulgarian, as in the source) -> DEQAR institution id, for its city. Matched by hand on name, ETER/Erasmus code and website.
// "Академия по национална и информационна сигурност" and "Висше училище по мениджмънт - Варна" have no DEQAR record: their rows are dropped (no clear seat).
const DEQAR = {
  "Аграрен университет - Пловдив": "DEQARINST0153",
  "Академия за музикално, танцово и изобразително изкуство Проф. Асен Диамандиев - Пловдив": "DEQARINST0155",
  "Академия на Министерство на вътрешните работи": "DEQARINST0175",
  "Бургаски държавен университет Проф. д-р Асен Златаров": "DEQARINST0138",
  "Бургаски свободен университет": "DEQARINST0139",
  "Варненски свободен университет Черноризец Храбър": "DEQARINST0143",
  "Великотърновски университет Св. св. Кирил и Методий": "DEQARINST0145",
  "Висше военновъздушно училище Георги Бенковски": "DEQARINST7564",
  "Висше военноморско училище Н.Й.Вапцаров": "DEQARINST0144",
  "Висше строително училищe Любен Каравелов": "DEQARINST0173",
  "Висше транспортно училище Тодор Каблешков": "DEQARINST0174",
  "Висше училище по агробизнес и развитие на регионите - Пловдив": "DEQARINST0156",
  "Висше училище по телекомуникации и пощи": "DEQARINST0178",
  "Военна академия Г. С. Раковски - София": "DEQARINST0176",
  "Европейски политехнически университет": "DEQARINST0186",
  "Икономически университет - Варна": "DEQARINST0140",
  "Лесотехнически университет": "DEQARINST0166",
  "Медицински университет - Плевен": "DEQARINST0150",
  "Медицински университет - Пловдив": "DEQARINST0154",
  "Международно висше бизнес училище - Ботевград": "DEQARINST0182",
  "Минно-геоложки университет Св. Иван Рилски": "DEQARINST0165",
  "Национален военен университет Васил Левски": "DEQARINST0146",
  "Национална академия за театрално и филмово изкуство Кръстьо Сарафов": "DEQARINST0169",
  "Национална музикална академия Проф. Панчо Владигеров": "DEQARINST0171",
  "Национална спортна академия Васил Левски": "DEQARINST0168",
  "Национална художествена академия": "DEQARINST0170",
  "Нов български университет": "DEQARINST0172",
  "Пловдивски университет Паисий Хилендарски": "DEQARINST0151",
  "Софийски университет Св. Климент Охридски": "DEQARINST0160",
  "Стопанска академия Димитър А. Ценов - Свищов": "DEQARINST0147",
  "Технически университет - Варна": "DEQARINST0141",
  "Технически университет - Габрово": "DEQARINST0148",
  "Тракийски университет - Стара Загора": "DEQARINST0183",
  "Университет за национално и световно стопанство": "DEQARINST0161",
  "Университет по архитектура, строителство и геодезия": "DEQARINST0162",
  "Университет по библиотекознание и информационни технологии": "DEQARINST0177",
  // DEQAR still lists it under its former name "Висше училище по застраховане и финанси" (VUZF; website vuzf.bg now redirects to uzf.bg). The rename is confirmed
  // by the institution itself: https://uzf.bg/novini/vissheto-uchilishte-stana-parviyat-spetsializiran-universitet-po-zastrahovane-i-finansi-v-balgariya (June 2025).
  "Университет по застраховане и финанси": "DEQARINST0181",
  "Университет по хранителни технологии": "DEQARINST0152",
  "Химикотехнологичен и металургичен университет - София": "DEQARINST0164",
  "Шуменски университет Епископ Константин Преславски": "DEQARINST0184",
  "Югозападен университет Неофит Рилски": "DEQARINST0135",
  "Колеж по туризъм - Благоевград": "DEQARINST0137",
  "Колеж по мениджмънт, търговия и маркетинг - София": "DEQARINST0179",
  "Театрален колеж Любен Гройс": "DEQARINST0180",
};
const DEQAR_BY_NAME = new Map(Object.entries(DEQAR).map(([k, v]) => [norm(k), v]));
// Existing app sheets (universities-abroad.json, country "Bulgaria"). Technical University of Sofia and AUBG have sheets but no records in the source.
const SHEETS = {
  "Софийски университет Св. Климент Охридски": "uni-sofia", "Медицински университет - Пловдив": "mu-plovdiv", "Университет за национално и световно стопанство": "unwe-sofia",
  "Пловдивски университет Паисий Хилендарски": "uni-plovdiv", "Икономически университет - Варна": "ue-varna", "Югозападен университет Неофит Рилски": "swu-blagoevgrad",
  "Университет по архитектура, строителство и геодезия": "uacg-sofia",
};
const SHEET_BY_NAME = new Map(Object.entries(SHEETS).map(([k, v]) => [norm(k), v]));
const ONLINE = "920fbb3cbe"; // learning-assessment concept "Online" (the other value in the file, 9191af2ed9, is "Presential")

await ensureRaw();
const [hdr, ...deqarRows] = csv(readFileSync(`${raw}/deqar-institutions.csv`, "utf8").replace(/^\uFEFF/, ""));
const col = Object.fromEntries(hdr.map((k, i) => [k, i]));
const deqarCity = new Map(deqarRows.filter((r) => r[col.country] === "Bulgaria" && !r[col.closure_date]).map((r) => [r[col.deqar_id], clean(r[col.city])]));
const g = loadGraph();

const skipped = { status: 0, notDegree: 0, afterDegree: 0, tooShort: 0, noDuration: 0, noOrg: 0, noCity: 0, languageConflict: 0 };
const droppedOrgs = {}, droppedShort = {};
const groups = new Map();
// Sorted by record id so that the result does not depend on file order.
for (const lo of [...g.values()].sort((a, b) => a.id.localeCompare(b.id))) {
  if (!lo.types.includes("elm:LearningOpportunity")) continue;
  if (lit(lo, "elm:status") !== "released") { skipped.status++; continue; }
  const spec = g.get(first(lo, "elm:learningAchievementSpecification")?.iri);
  const degree = degreeOf(spec); if (!degree) { skipped.notDegree++; continue; }
  const name = titleOf(lo, "bg"), nameEn = titleOf(lo, "en");
  if (AFTER_DEGREE.test(name)) { skipped.afterDegree++; continue; }
  const days = /^P(\d+)D$/.exec(lit(lo, "elm:duration") || ""); if (!days) { skipped.noDuration++; continue; }
  if (+days[1] < DEGREES[degree] * 365) { skipped.tooShort++; const k = `${degree} ${lit(lo, "elm:duration")}`; droppedShort[k] = (droppedShort[k] || 0) + 1; continue; }
  const org = g.get(first(lo, "elm:providedBy")?.iri);
  const names = org?.props["rov:legalName"] || []; const orgName = clean((names.find((n) => n.lang === "bg") || names[0])?.lit);
  if (!orgName) { skipped.noOrg++; continue; }
  const city = deqarCity.get(DEQAR_BY_NAME.get(norm(orgName)));
  if (!city) { skipped.noCity++; droppedOrgs[orgName] = (droppedOrgs[orgName] || 0) + 1; continue; }
  const langCode = last(first(lo, "elm:defaultLanguage")?.iri);
  const tl = titleLang(name, nameEn);
  if (!LANG[langCode] || (tl && tl !== langCode)) { skipped.languageConflict++; continue; }
  const online = last(first(lo, "elm:mode")?.iri) === ONLINE;
  // One row per institution + programme name + degree + language + online/presential: the source repeats a programme once per study form (full-time, part-time)
  // without saying which is which, so those copies are merged.
  const key = `${norm(orgName)}|${norm(name)}|${degree}|${langCode}|${online}`;
  const grp = groups.get(key) || { orgName, city, name, nameEn, degree, online, langCode, langs: new Set(), years: new Set(), isced: new Set(), n: 0 };
  grp.langs.add(langCode); grp.years.add(yearsOf(lit(lo, "elm:duration")));
  grp.isced.add((spec.props["elm:ISCEDFCode"] || []).map((v) => last(v.iri)).sort().join(",")); grp.n++;
  groups.set(key, grp);
}

const institutions = new Map(), programs = []; const keys = new Set(); let merged = 0;
for (const grp of [...groups.values()]) {
  merged += grp.n - 1;
  const { orgName, city, name, nameEn, degree, online } = grp;
  const sheet = SHEET_BY_NAME.get(norm(orgName));
  const instId = sheet || `bg-${slug(orgName)}`.slice(0, 80);
  if (!institutions.has(instId)) institutions.set(instId, { id: instId, country: CC, source: SOURCE, name: orgName, officialName: orgName, city, kind: "unknown", hasSheet: Boolean(sheet) });
  const language = LANG[[...grp.langs][0]];
  // ISCED-F: used only when every merged copy gives the same codes; domainId from the first 4-digit code.
  const codes = grp.isced.size === 1 ? [...grp.isced][0].split(",").filter(Boolean) : [];
  const four = codes.find((c) => c.length === 4);
  const domain = grp.isced.size !== 1 ? "ISCED-F (copies disagree)" : four ? `ISCED-F ${four}` : codes.length ? `ISCED-F ${codes[0]}` : "ISCED-F (not given)";
  const domainId = four ? iscedToDomain(four) : null;
  const years = grp.years.size === 1 ? [...grp.years][0] : undefined;
  let key = `bg-${slug(orgName)}`.slice(0, 80) + `--${slug(name)}`.slice(0, 90) + `--${slug(degree)}-${grp.langCode.toLowerCase()}${online ? "-distance" : ""}`;
  for (let i = 2; keys.has(key); i++) key = key.replace(/(-\d+)?$/, `-${i}`);
  keys.add(key);
  const p = { key, country: CC, institutionId: instId, institutionName: orgName, city, domain, domainId, name, language };
  if (online) p.form = "distance";
  if (years !== undefined) p.years = years;
  p.status = degree; p.source = SOURCE;
  p.search = ascii([name, nameEn, orgName, city, language].join(" ")).slice(0, 600).trim();
  programs.push(p);
}
console.log("skipped records", skipped, "merged copies", merged);
console.log("dropped: no DEQAR seat", droppedOrgs, "below minimum duration", droppedShort);

const prog = programs.sort((a, b) => a.key.localeCompare(b.key));
const counts = new Map(); for (const p of prog) counts.set(p.institutionId, (counts.get(p.institutionId) || 0) + 1);
const insts = [...institutions.values()].filter((i) => counts.has(i.id)).map((i) => ({ ...i, programs: counts.get(i.id) })).sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(new URL(`${CC.toLowerCase()}-institutions.json`, OUT), JSON.stringify(insts, null, 1) + "\n");
writeFileSync(new URL(`${CC.toLowerCase()}-programs.json`, OUT), JSON.stringify(prog) + "\n");
console.log(`${CC}: ${insts.length} institutions, ${prog.length} programmes written`);
