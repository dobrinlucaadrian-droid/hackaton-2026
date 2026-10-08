// Turns the parsed rows of HG 606/2026 into the app's data files: Romanian institutions and their bachelor programmes, with checks. Usage: node build.mjs [folder with rows.json and raw.json; default: this folder]
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const WEB = "C:/CODING/HACKATON_2026/apps/web/";
const DATA = process.argv[2] ? pathToFileURL(resolve(process.argv[2]) + "/") : new URL("./", import.meta.url);
const raw = JSON.parse(readFileSync(new URL("rows.json", DATA), "utf8"));
const pages = JSON.parse(readFileSync(new URL("raw.json", DATA), "utf8"));
const ours = JSON.parse(readFileSync(WEB + "data/universities-ro.json", "utf8"));
const domainIds = new Set(JSON.parse(readFileSync(WEB + "data/domains.json", "utf8")).map((d) => d.id));

// Old cedilla letters -> the correct Romanian comma-below letters; tidy spaces and footnote marks.
const ro = (s) => String(s).replace(/ş/g, "ș").replace(/ţ/g, "ț").replace(/Ş/g, "Ș").replace(/Ţ/g, "Ț").replace(/\*+\s*\d*\s*\)?/g, " ").replace(/[εΩ]\)?/g, " ").replace(/[“”"]/g, '"').replace(/\s+/g, " ").replace(/\s+([,;)])/g, "$1").replace(/\(\s+/g, "(").trim();
const key = (s) => ro(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// ---------------------------------------------------------------- institutions
// Official list number -> id of the university sheet already in the app (annex 2 = state, annex 3 = private).
const SHEET = {
  "2|1": "upb", "2|2": "utcb", "2|3": "uauim", "2|4": "usamv-bucuresti", "2|5": "unibuc", "2|6": "umf-carol-davila", "2|7": "ase-bucuresti", "2|8": "unmb", "2|9": "unarte", "2|10": "unatc",
  "2|11": "unefs", "2|12": "snspa", "2|13": "uab", "2|14": "uav-arad", "2|15": "ub-bacau", "2|16": "unitbv", "2|17": "utcn", "2|18": "usamv-cluj", "2|19": "ubb-cluj", "2|20": "umf-cluj",
  "2|21": "amgd-cluj", "2|22": "uad-cluj", "2|23": "ovidius", "2|24": "umc", "2|25": "ucv", "2|26": "umf-craiova", "2|27": "ugal", "2|28": "tuiasi", "2|29": "iuls", "2|30": "uaic",
  "2|31": "umf-iasi", "2|32": "arte-iasi", "2|33": "uoradea", "2|34": "upet", "2|35": "upg", "2|36": "ulbs", "2|37": "usv-suceava", "2|38": "valahia", "2|39": "utgjiu", "2|40": "umfst",
  "2|41": "uat-tgmures", "2|42": "upt", "2|43": "usvt", "2|44": "uvt", "2|45": "umft", "2|46": "atm", "2|47": "unap", "2|49": "academia-politie", "2|50": "afa-brasov", "2|51": "anmb", "2|52": "aft-sibiu",
  "3|1": "ucdc", "3|2": "utm", "3|3": "univnt", "3|4": "rau", "3|5": "hyperion", "3|6": "spiru-haret", "3|7": "bioterra", "3|8": "ueb", "3|9": "athenaeum", "3|10": "artifex",
  "3|14": "uvvg", "3|15": "george-bacovia", "3|19": "sapientia", "3|20": "andrei-saguna", "3|21": "danubius", "3|23": "upa-iasi", "3|24": "apollonia", "3|26": "agora-oradea", "3|27": "emanuel-oradea",
  "3|28": "partium", "3|29": "ucb-pitesti", "3|32": "tibiscus", "3|33": "adventus",
};
// Institutions in the official list that have no sheet in the app yet: id, display name and city written by hand from the official title.
const NEW = {
  "2|48": { id: "ani-bucuresti", name: "Academia Națională de Informații „Mihai Viteazul”", city: "București" },
  "3|11": { id: "itb-bucuresti", name: "Institutul Teologic Baptist din București", city: "București" },
  "3|12": { id: "itp-bucuresti", name: "Institutul Teologic Penticostal din București", city: "București" },
  "3|17": { id: "bogdan-voda", name: "Universitatea „Bogdan Vodă” din Cluj-Napoca", city: "Cluj-Napoca" },
  "3|18": { id: "itp-cluj", name: "Institutul Teologic Protestant din Cluj-Napoca", city: "Cluj-Napoca" },
  "3|25": { id: "dragan-lugoj", name: "Universitatea Europeană „Drăgan” din Lugoj", city: "Lugoj" },
  "3|31": { id: "cantemir-tgmures", name: "Universitatea „Dimitrie Cantemir” din Târgu Mureș", city: "Târgu Mureș" },
  "3|34": { id: "timotheus", name: "Institutul Teologic Creștin după Evanghelie „Timotheus” din București", city: "București" },
  "3|35": { id: "ioan-slavici", name: "Universitatea „Ioan Slavici” din Timișoara", city: "Timișoara" },
  "3|36": { id: "tomis", name: "Universitatea „Tomis” din Constanța", city: "Constanța" },
};
const officialTitle = (s) => ro(s).replace(/\s+(credite de|maxim de|Număr de|Număr).*$/i, "").replace(/\s+\d+$/, "").replace(/\s+-\s+înființată prin Legea.*$/i, "").replace(/\s+-\s+Învățământ universitar.*$/i, "").trim();

// ---------------------------------------------------------------- domains
const DOMAIN = {
  "administrarea afacerilor": "business-management", agronomie: "agronomie-silvicultura", arhitectura: "arhitectura", "arhitectura navala": "marina-transporturi", "arte vizuale": "arte-vizuale-design",
  "asistenta sociala": "sociologie-asistenta-sociala", "automatica informatica aplicata si sisteme inteligente": "calculatoare-it", bioinginerie: "inginerie-electrica-electronica", biologie: "biologie", biotehnologii: "biologie",
  "calculatoare si tehnologia informatiei": "calculatoare-it", chimie: "chimie", "cibernetica statistica si informatica economica": "informatica", "cinematografie si media": "teatru-film", contabilitate: "economie-finante",
  drept: "drept", economie: "economie-finante", "economie si afaceri internationale": "economie-finante", "educatie fizica si sport": "sport-kinetoterapie", filosofie: "filosofie", finante: "economie-finante", fizica: "fizica",
  geografie: "geografie-mediu", geologie: "geografie-mediu", horticultura: "agronomie-silvicultura", informatica: "informatica", "ingineria autovehiculelor": "inginerie-mecanica", "ingineria civila": "inginerie-civila",
  "inginerie civila": "inginerie-civila", "ingineria instalatiilor": "inginerie-civila", "ingineria materialelor": "inginerie-chimica-materiale", "ingineria mediului": "energie-petrol-mediu",
  "ingineria produselor alimentare": "inginerie-chimica-materiale", "ingineria transporturilor": "marina-transporturi", "inginerie aerospatiala": "inginerie-mecanica", "inginerie chimica": "inginerie-chimica-materiale",
  "inginerie de armament rachete si munitii": "militar-politie", "inginerie electrica": "inginerie-electrica-electronica", "inginerie electronica telecomunicatii si tehnologii informationale": "inginerie-electrica-electronica",
  "inginerie energetica": "energie-petrol-mediu", "inginerie forestiera": "agronomie-silvicultura", "inginerie genistica": "militar-politie", "inginerie geodezica": "inginerie-civila", "inginerie geologica": "energie-petrol-mediu",
  "inginerie industriala": "inginerie-mecanica", "inginerie marina si navigatie": "marina-transporturi", "inginerie mecanica": "inginerie-mecanica", "inginerie si management": "inginerie-mecanica",
  "inginerie si management in agricultura si dezvoltare rurala": "agronomie-silvicultura", istorie: "istorie", kinetoterapie: "sport-kinetoterapie", "limba si literatura": "litere-limbi-straine", "limbi moderne aplicate": "litere-limbi-straine",
  management: "business-management", "management in sport": "sport-kinetoterapie", marketing: "marketing", matematica: "matematica", "mecatronica si robotica": "inginerie-mecanica", "medicina veterinara": "medicina-veterinara",
  "mine petrol si gaze": "energie-petrol-mediu", muzica: "muzica", psihologie: "psihologie", "relatii internationale si studii europene": "stiinte-politice-relatii-internationale", sanatate: "asistenta-medicala",
  silvicultura: "agronomie-silvicultura", sociologie: "sociologie-asistenta-sociala", "studii culturale": "litere-limbi-straine", "studii de securitate": "stiinte-politice-relatii-internationale", "studiul patrimoniului": "istorie",
  "stiinta mediului": "geografie-mediu", "stiinte administrative": "administratie-publica", "stiinte ale comunicarii": "comunicare-jurnalism", "stiinte ale educatiei": "stiintele-educatiei", "stiinte aplicate": "fizica",
  "stiinte ingineresti aplicate": "fizica", "stiinte militare informatii si ordine publica": "militar-politie", "stiinte politice": "stiinte-politice-relatii-internationale", "teatru si artele spectacolului": "teatru-film",
  teologie: "teologie", urbanism: "arhitectura", zootehnie: "agronomie-silvicultura",
};
const INTERDISCIPLINARY = { istorie: "istorie", chimie: "chimie", filosofie: "filosofie", fizica: "fizica", geografie: "geografie-mediu", "limba si literatura": "litere-limbi-straine", matematica: "matematica", "mecatronica si robotica": "inginerie-mecanica" };
function domainIdFor(domain, program) {
  const d = key(domain), p = key(program);
  if (d === "sanatate") return /dentar/.test(p) ? "medicina-dentara" : /^medicina( |$)/.test(p) ? "medicina" : /farmac/.test(p) ? "farmacie" : /kinetoterap|fiziokineto/.test(p) ? "sport-kinetoterapie" : "asistenta-medicala";
  if (d === "administrarea afacerilor" && /turism|ospitalit|servicii/.test(p)) return "turism-servicii";
  if (d === "inginerie si management") return /constructi/.test(p) ? "inginerie-civila" : /electric|electronic|energetic/.test(p) ? "inginerie-electrica-electronica" : /chimic|material|aliment/.test(p) ? "inginerie-chimica-materiale" : "inginerie-mecanica";
  if (d.startsWith("interdisciplinar") || d.startsWith("interdiciplinar")) { const first = d.replace(/^interdi(s)?ciplinar\s*/, ""); const hit = Object.keys(INTERDISCIPLINARY).find((k) => first.startsWith(k)); return hit ? INTERDISCIPLINARY[hit] : null; }
  return DOMAIN[d] ?? null;
}

// ---------------------------------------------------------------- rows
const problems = [];
// 1. merged domain/faculty cells cut by a page break with text on both pages: join the two halves
for (const field of ["domain", "faculty"]) {
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1], b = raw[i];
    // the second half starts with a small letter, or (for faculties) does not start like a faculty name
    const continues = /^[a-zăâîșțşţ]/.test(b[field]) || (field === "faculty" && !/^(Facultatea|Departamentul|[SȘŞ]coala|Institutul|Colegiul|Centrul)/.test(b[field]));
    if (a.annex === b.annex && a.instNo === b.instNo && b.page === a.page + 1 && a[field] && b[field] && a[field] !== b[field] && continues && (field === "domain" || a.facultyNo === b.facultyNo || !b.facultyNo)) {
      const joined = a[field] + " " + b[field], oldA = a[field], oldB = b[field];
      for (const r of raw) if (r.annex === a.annex && r.instNo === a.instNo && ((r.page === a.page && r[field] === oldA) || (r.page === b.page && r[field] === oldB))) { r[field] = joined; if (field === "faculty" && !r.facultyNo) r.facultyNo = a.facultyNo; }
    }
  }
}

// the faculty number is printed once per merged cell: give it to every row of the same faculty
for (const r of raw) {
  if (/^\d+$/.test(String(r.facultyNo).trim())) continue;
  const sib = raw.find((x) => x.annex === r.annex && x.instNo === r.instNo && x.faculty === r.faculty && /^\d+$/.test(String(x.facultyNo).trim()));
  if (sib) r.facultyNo = sib.facultyNo;
}

const institutions = new Map();
const programs = [];
const seen = new Map();
for (const r of raw) {
  const k = `${r.annex}|${r.instNo}`;
  // "ciclul II" entries and 120-credit MBA programmes are master level, not bachelor
  if (Number(r.credits) === 120 || /ciclul II/i.test(r.institution)) continue;
  const sheetId = SHEET[k];
  const extra = NEW[k];
  if (!sheetId && !extra) { problems.push(`institution not mapped: ${k} ${r.institution}`); continue; }
  const sheet = sheetId ? ours.find((u) => u.id === sheetId) : null;
  if (sheetId && !sheet) { problems.push(`sheet id not found: ${sheetId}`); continue; }
  const id = sheetId ?? extra.id;
  if (!institutions.has(id)) institutions.set(id, { id, country: "RO", source: "HG 606/2026", name: sheet ? sheet.name : extra.name, officialName: officialTitle(r.institution), city: sheet ? sheet.city : extra.city, kind: r.annex === 2 ? "stat" : "particular", hasSheet: !!sheet, listNo: r.instNo });

  const rawName = ro(r.program);
  let name = rawName, language = "română", location;
  const langs = [...name.matchAll(/\((?:în|in)\s+limb(?:a|ile)\s+([^)]+)\)/gi)];
  if (langs.length) {
    // "(în limba maghiară, la Gheorgheni)" carries both the language and the place
    const parts = langs.flatMap((m) => m[1].split(/,\s*/)).map((x) => x.trim()).filter(Boolean);
    const place = parts.find((x) => /^la\s+/i.test(x));
    if (place) location = place.replace(/^la\s+/i, "");
    language = [...new Set(parts.filter((x) => !/^la\s+/i.test(x)).map((x) => x.split(/\s+-\s+/)[0]))].join(", ");
    name = name.replace(/\((?:în|in)\s+limb(?:a|ile)\s+[^)]+\)/gi, " ");
  }
  const loc = name.match(/\((?:la|în localitatea|în municipiul|în orașul|în)\s+([A-ZĂÂÎȘȚ][^)]*)\)/);
  if (loc) { location = loc[1].trim(); name = name.replace(loc[0], " "); }
  // Footnote ε) of the list: teaching at these two institutions is in Hungarian.
  if ((id === "sapientia" || id === "partium") && language === "română") language = /bilingv/i.test(name) ? "română, maghiară" : "maghiară";
  if (location) location = location.replace(/\s*-\s*/g, "-").replace(/Chișinău-Republica Moldova/, "Chișinău, Republica Moldova");
  // long lists of languages are wrapped mid-word in the PDF ("neerla ndeză"): tidy the slashes and re-join the known breaks
  name = name.replace(/\s*\/\s*/g, "/").replace(/neerla ndeză/g, "neerlandeză").replace(/por tugheză/g, "portugheză").replace(/neerlan- ?deză/g, "neerlandeză");
  name = name.replace(/\s+/g, " ").replace(/\s+([,;)])/g, "$1").trim();
  const domain = ro(r.domain).replace(/Mecatronică și Robotică/, "Mecatronică și robotică").replace(/^Interdiciplinar/, "Interdisciplinar").replace(/\s*[-–]\s*/g, " – ").replace(/\(\s*/g, "(").replace(/\s*\)/g, ")").replace(/Istorie– Filosofie/, "Istorie – Filosofie");
  const faculty = ro(r.faculty);
  const domainId = domainIdFor(domain, name);
  const credits = Number(r.credits);
  const max = typeof r.max === "number" ? r.max : Number(String(r.max).replace(/\D+/g, ""));
  if (!name) problems.push(`empty programme name p${r.page} ${id}`);
  if (!faculty) problems.push(`empty faculty p${r.page} ${id} ${name}`);
  if (!domainId || !domainIds.has(domainId)) problems.push(`domain not mapped: "${domain}" (${name})`);
  if (![180, 240, 300, 360].includes(credits)) problems.push(`odd credits ${r.credits} p${r.page} ${id} ${name}`);
  if (!Number.isFinite(max)) problems.push(`capacity not a number "${r.max}" p${r.page} ${id} ${name}`);
  // Footnote "*)" in the capacity cell: "Specializări/programe de studii universitare de licență pentru care nu se organizează admitere în anul
  // universitar 2026 – 2027". The list prints capacity 0 for exactly these rows; they stay in the catalogue with maxStudents 0, which the app
  // shows as "fără locuri anul acesta". (The same mark next to a programme NAME means other things, see the README, and is only removed.)
  const noAdmission = String(r.max).includes("*)");
  if (noAdmission !== (max === 0)) problems.push(`no-admission mark and capacity 0 do not agree p${r.page} ${id} ${name} (max "${r.max}")`);
  const slug = key(name).replace(/ /g, "-").slice(0, 60);
  const baseId = `${id}--${slug}--${key(language).replace(/ /g, "-").slice(0, 12)}-${r.form.toLowerCase()}${location ? "-" + key(location).replace(/ /g, "-").slice(0, 16) : ""}`;
  const n = (seen.get(baseId) || 0) + 1; seen.set(baseId, n);
  programs.push({
    id: n === 1 ? baseId : `${baseId}-${n}`,
    institutionId: id,
    faculty,
    facultyNo: /^\d+$/.test(String(r.facultyNo).trim()) ? Number(r.facultyNo) : null,
    domain,
    domainId,
    name,
    language,
    ...(location ? { location } : {}),
    status: r.status, // A = acreditat, AP = autorizat provizoriu
    form: r.form, // IF = cu frecvență, IFR = frecvență redusă, ID = la distanță
    credits,
    years: credits / 60,
    maxStudents: max,
    noAdmission,
    page: r.page,
  });
}

// ---------------------------------------------------------------- checks
// (a) every A/AP status cell on the annex pages produced exactly one row
let statusCells = 0;
for (const p of pages) if (p.n >= 29 && p.n <= 141) statusCells += p.items.filter((it) => it.x >= 375 && it.x < 432 && /^(A|AP)$/.test(it.s.trim())).length;
// (b) faculty numbers run 1..n without gaps inside each institution
const gaps = [];
for (const inst of institutions.values()) {
  const nums = [...new Set(programs.filter((p) => p.institutionId === inst.id && p.facultyNo !== null).map((p) => p.facultyNo))].sort((a, b) => a - b);
  const facs = new Set(programs.filter((p) => p.institutionId === inst.id).map((p) => p.faculty));
  inst.faculties = facs.size; inst.programs = programs.filter((p) => p.institutionId === inst.id).length;
  if (nums.length && (nums[0] !== 1 || nums[nums.length - 1] !== nums.length)) gaps.push(`${inst.id}: faculty numbers ${nums.join(",")}`);
  const byNo = new Map();
  for (const p of programs.filter((x) => x.institutionId === inst.id && x.facultyNo !== null)) byNo.set(p.facultyNo, new Set([...(byNo.get(p.facultyNo) || []), p.faculty]));
  for (const [no, names] of byNo) if (names.size > 1) gaps.push(`${inst.id}: faculty no ${no} has ${names.size} names: ${[...names].map((x) => x.slice(0, 40)).join(" | ")}`);
}

const SOURCE = "HG 606/2026";
// The six faculties of the former University of Pitești, now part of POLITEHNICA București. The official list does not print their city;
// this comes from general knowledge about the merger and should be confirmed on upb.ro.
// Same for the three faculties of the North University Centre in Baia Mare, part of the Technical University of Cluj-Napoca (to confirm on utcluj.ro).
const UTCN_BAIA_MARE = new Set(["Facultatea de Inginerie", "Facultatea de Litere", "Facultatea de Științe"].map((f) => `utcn|${f}`));
const UPB_PITESTI = new Set(["Facultatea de Științe, Educație Fizică și Informatică", "Facultatea de Mecanică și Tehnologie", "Facultatea de Electronică, Comunicații și Calculatoare", "Facultatea de Științe Economice și Drept", "Facultatea de Științe ale Educației, Științe Sociale și Psihologie", "Facultatea de Teologie, Litere, Istorie și Arte"].map((f) => `upb|${f}`));
const out = programs.map(({ page, facultyNo, noAdmission, id, institutionId, ...p }) => {
  const inst = institutions.get(institutionId);
  // Where the courses are held: the place written next to the programme, else the city in the faculty's name, else the institution's city.
  const inName = p.faculty.match(/(?:din|,|-|–|\()\s*(Brăila|Alexandria|Hunedoara|Cluj-Napoca|Târgu Jiu|Brașov|Câmpulung|Craiova|Constanța|Buzău|Miercurea Ciuc|Târgu Mureș|Sfântu Gheorghe|Râmnicu Vâlcea)\)?$/);
  const known = UPB_PITESTI.has(`${institutionId}|${p.faculty}`) ? "Pitești" : UTCN_BAIA_MARE.has(`${institutionId}|${p.faculty}`) ? "Baia Mare" : null;
  const city = (p.location ?? (inName && inName[1] !== inst.city ? inName[1] : known ?? inst.city)).replace("Sighetu-Marmației", "Sighetu Marmației").replace("Chișinău, Republica Moldova", "Chișinău");
  const { location, status, form, ...rest } = p;
  return {
    key: `ro-${id}`,
    country: "RO",
    institutionId,
    institutionName: inst.name,
    city,
    ...rest,
    // the shared vocabulary of the catalogue (see scripts/data/CONTRACT.md)
    form: { IF: "full-time", IFR: "part-time", ID: "distance" }[form],
    status: status === "A" ? "acreditat" : "autorizat provizoriu",
    source: SOURCE,
    // lower-case, without diacritics: what the search index looks through
    search: key(`${p.name} ${p.domain} ${p.faculty} ${inst.name} ${city} ${p.language}`),
  };
});
const instOut = [...institutions.values()]
  .sort((a, b) => (a.kind === b.kind ? a.listNo - b.listNo : a.kind === "stat" ? -1 : 1))
  .map(({ listNo, faculties, kind, ...i }) => ({ ...i, kind: kind === "stat" ? "public" : "private" }));
writeFileSync(WEB + "data/catalog/ro-institutions.json", JSON.stringify(instOut, null, 2) + "\n");
writeFileSync(WEB + "data/catalog/ro-programs.json", JSON.stringify(out, null, 1) + "\n");
writeFileSync(new URL("build-problems.txt", DATA), [...problems, ...gaps].join("\n") + "\n");

const c = (f) => out.reduce((m, r) => ((m[r[f]] = (m[r[f]] || 0) + 1), m), {});
console.log(`institutions: ${institutions.size} (stat ${[...institutions.values()].filter((i) => i.kind === "stat").length}, particular ${[...institutions.values()].filter((i) => i.kind === "particular").length}; with sheet ${[...institutions.values()].filter((i) => i.hasSheet).length})`);
console.log(`programmes: ${out.length} | status cells in the PDF: ${statusCells} | parsed rows: ${raw.length} | left out as master level: ${raw.length - out.length}`);
console.log("no admission in 2026-2027 (mark *) in the capacity cell, capacity 0):", programs.filter((p) => p.noAdmission).map((p) => `${p.institutionId}: ${p.name}`).join("; "));
console.log("status", c("status"), "form", c("form"), "credits", c("credits"));
console.log("languages", c("language"));
console.log("with location:", out.filter((p) => p.location).length, "| distinct faculties:", new Set(out.map((p) => p.institutionId + "|" + p.faculty)).size, "| distinct official domains:", new Set(out.map((p) => p.domain)).size);
console.log("per app domain:", Object.entries(c("domainId")).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", "));
console.log("app domains without any programme:", [...domainIds].filter((d) => !out.some((p) => p.domainId === d)).join(", ") || "none");
console.log("problems:", problems.length, "| faculty numbering issues:", gaps.length);
console.log([...problems, ...gaps].slice(0, 30).join("\n"));
