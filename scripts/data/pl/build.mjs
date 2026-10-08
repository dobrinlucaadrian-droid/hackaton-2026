// Builds the Polish catalogue (institutions + first-cycle and long-cycle programmes) from the RAD-on / POL-on open API: node scripts/data/pl/build.mjs <scratch-folder>
// Downloads the pages into <scratch-folder> (skips pages already saved), then writes apps/web/data/catalog/pl-institutions.json and pl-programs.jsonl.gz.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { iscedToDomain } from "../isced.mjs";

const dir = process.argv[2];
if (!dir) { console.error("usage: node scripts/data/pl/build.mjs <scratch-folder>"); process.exit(1); }
mkdirSync(dir, { recursive: true });
const API = "https://radon.nauka.gov.pl/opendata/polon";
const SOURCE = "RAD-on POL-on 2026-10";
const PAGE = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The register pages by a time cursor and a page can skip records that share a timestamp, so the same endpoint is read again with
// other page sizes and the results are merged by id until the register own count is reached (or the sizes run out).
const SIZES = [100, 99, 97, 91, 89, 83, 79, 73, 71, 67, 61, 59, 53, 47, 43, 41, 37, 31, 29, 23];
async function fetchAll(name, idField) {
  const found = new Map(); let max = null;
  for (const size of SIZES) {
    let token = "", n = 0;
    for (;;) {
      n++;
      const file = join(dir, `${name}-s${size}-${String(n).padStart(4, "0")}.json`);
      let page;
      if (existsSync(file)) page = JSON.parse(readFileSync(file, "utf8"));
      else {
        const url = `${API}/${name}?resultNumbers=${size}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
        for (let attempt = 1; ; attempt++) {
          try {
            const res = await fetch(url, { headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            page = await res.json(); break;
          } catch (e) { if (attempt >= 5) throw new Error(`${url}: ${e.message}`); await sleep(2000 * attempt); }
        }
        writeFileSync(file, JSON.stringify(page));
        await sleep(250);
      }
      max = page.pagination?.maxCount ?? max;
      for (const r of page.results || []) found.set(r[idField], r);
      token = page.pagination?.token;
      if (!page.results?.length || !token) break;
    }
    console.log(`${name}: page size ${size} -> ${found.size} distinct records so far (register says ${max})`);
    if (max !== null && found.size >= max) break;
  }
  return { rows: [...found.values()], max };
}

const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const fold = (s) => tidy(s).toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "");
const slug = (s) => fold(s).replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const ascii = (s) => fold(s).replace(/[^a-z0-9]+/g, " ").trim();

const LANG = { polski: "poloneză", angielski: "engleză", niemiecki: "germană", francuski: "franceză", hiszpański: "spaniolă", włoski: "italiană", rosyjski: "rusă", ukraiński: "ucraineană",
  czeski: "cehă", portugalski: "portugheză", chiński: "chineză", japoński: "japoneză", koreański: "coreeană", arabski: "arabă", turecki: "turcă", szwedzki: "suedeză", norweski: "norvegiană",
  niderlandzki: "olandeză", holenderski: "olandeză", węgierski: "maghiară", rumuński: "română", bułgarski: "bulgară", słowacki: "slovacă", litewski: "lituaniană", łotewski: "letonă",
  hebrajski: "ebraică", grecki: "greacă", łaciński: "latină", łacina: "latină", uzbecki: "uzbecă", fiński: "finlandeză", duński: "daneză", serbski: "sârbă", chorwacki: "croată", perski: "persană" };
const FORM = { stacjonarne: "full-time", niestacjonarne: "part-time" };
const LEVELS = new Set(["pierwszego stopnia", "jednolite magisterskie"]);

const { rows: courses, max: courseMax } = await fetchAll("courses", "courseUuid");
const { rows: insts, max: instMax } = await fetchAll("institutions", "institutionUuid");
const instByUuid = new Map(insts.map((i) => [i.institutionUuid, i]));

const unknownLang = new Map(); const skipped = { level: 0, status: 0, noInstance: 0, instStatus: 0 };
const rows = [];
for (const c of new Map(courses.map((x) => [x.courseUuid, x])).values()) {
  if (!LEVELS.has(c.levelName)) { skipped.level++; continue; }
  if (c.currentStatusName !== "prowadzone") { skipped.status++; continue; }
  if (!c.courseInstances?.length) { skipped.noInstance++; continue; }
  for (const ci of c.courseInstances) {
    if (ci.statusName !== "prowadzone") { skipped.instStatus++; continue; }
    rows.push({ c, ci });
  }
}
rows.sort((a, b) => String(a.ci.courseInstanceCode).localeCompare(String(b.ci.courseInstanceCode), "en", { numeric: true }) || a.ci.courseInstanceUuid.localeCompare(b.ci.courseInstanceUuid));

const instIdByUuid = new Map(), usedInstIds = new Set(), instOut = new Map();
function institution(c) {
  const uuid = c.mainInstitutionUuid;
  if (instIdByUuid.has(uuid)) return instOut.get(uuid);
  const raw = instByUuid.get(uuid);
  const name = tidy(c.mainInstitutionName);
  let id = `pl-${slug(name)}`.slice(0, 80).replace(/-+$/, "");
  if (usedInstIds.has(id)) id = `${id.slice(0, 70)}-${slug(raw?.city || c.leadingInstitutionCity)}`.slice(0, 80);
  for (let k = 2; usedInstIds.has(id); k++) id = `${id.slice(0, 74)}-${k}`;
  usedInstIds.add(id); instIdByUuid.set(uuid, id);
  let website = tidy(raw?.www);
  if (website && !/^https?:\/\//i.test(website)) website = `http://${website}`;
  if (!/^https?:\/\/[^\s]+\.[^\s]+$/.test(website)) website = "";
  const o = { id, country: "PL", source: SOURCE, name, officialName: name, city: tidy(raw?.city || c.leadingInstitutionCity),
    kind: c.mainInstitutionKind === "Uczelnia publiczna" ? "public" : c.mainInstitutionKind === "Uczelnia niepubliczna" ? "private" : "unknown", hasSheet: false, ...(website ? { website } : {}), programs: 0 };
  instOut.set(uuid, o);
  return o;
}

const progs = [], keys = new Set(), seen = new Set(); let duplicates = 0;
for (const { c, ci } of rows) {
  const inst = institution(c);
  const name = tidy(ci.courseName || c.courseName);
  const langPl = tidy(ci.languageName).toLowerCase();
  const language = LANG[langPl] || (unknownLang.set(langPl, (unknownLang.get(langPl) || 0) + 1), langPl);
  const form = ci.dual === "Tak" ? "dual" : FORM[tidy(ci.formName)];
  const units = [...new Set((c.organizationalUnits || []).map((u) => tidy(u.organizationalUnitFullName)).map((f) => (f.includes(";") ? tidy(f.slice(f.indexOf(";") + 1)) : "")).filter((f) => f.length >= 2))];
  const faculty = units.join(" / ");
  const city = tidy(c.leadingInstitutionCity) || inst.city;
  const ects = parseInt(ci.ects, 10), sem = parseInt(ci.numberOfSemesters, 10);
  const domain = tidy(c.iscedName) || "Obszar nieznany";
  // The register can hold two course records (e.g. academic and practical profile) that give identical rows here; keep one.
  const sig = [inst.id, name, form, language, faculty, city, ects, sem, c.iscedCode].join("|");
  if (seen.has(sig)) { duplicates++; continue; }
  seen.add(sig);
  const base = `${inst.id}--${slug(name)}--${form ? form + "-" : ""}${slug(language)}`.slice(0, 190).replace(/-+$/, "");
  let key = base;
  if (keys.has(key)) key = `${base.slice(0, 170)}-${slug(city)}`.replace(/-+$/, "");
  if (keys.has(key)) key = `${base.slice(0, 170)}-${slug(ci.courseInstanceCode)}`;
  for (let k = 2; keys.has(key); k++) key = `${base.slice(0, 180)}-${k}`;
  keys.add(key);
  const p = { key, country: "PL", institutionId: inst.id, institutionName: inst.name, city, ...(faculty && faculty.length <= 300 ? { faculty } : {}), domain, domainId: iscedToDomain(c.iscedCode), name, language,
    ...(form ? { form } : {}), ...(ects >= 60 && ects <= 480 ? { credits: ects } : {}), ...(sem >= 2 && sem <= 16 ? { years: sem / 2 } : {}), status: "prowadzone", source: SOURCE,
    search: ascii([name, domain, faculty, inst.name, city, language].join(" ")).slice(0, 600) };
  progs.push(p); inst.programs++;
}
progs.sort((a, b) => a.key.localeCompare(b.key));
const instList = [...instOut.values()].sort((a, b) => a.id.localeCompare(b.id));

const out = new URL("../../../apps/web/data/catalog/", import.meta.url);
mkdirSync(out, { recursive: true });
writeFileSync(new URL("pl-institutions.json", out), JSON.stringify(instList, null, 1) + "\n");
// gzipped JSON Lines: the plain JSON is above the 5 MB per-file limit of the project gate (see scripts/data/CONTRACT.md)
writeFileSync(new URL("pl-programs.jsonl.gzl.gz", out), gzipSync(progs.map((p) => JSON.stringify(p)).join("\n") + "\n"));
const unmapped = progs.filter((p) => p.domainId === null).length;
console.log(`skipped: other level ${skipped.level}, course not running ${skipped.status}, no instances ${skipped.noInstance}, instance not running ${skipped.instStatus}`);
console.log(`identical duplicate rows dropped: ${duplicates}`);
console.log("unknown languages kept as source word:", [...unknownLang]);
console.log(`PL: ${instList.length} institutions, ${progs.length} programmes, ${new Set(progs.map((p) => p.city)).size} cities, no domain ${unmapped} (${((100 * unmapped) / progs.length).toFixed(1)}%)`);
console.log(`register counts: courses ${courseMax}, institutions ${instMax}`);
