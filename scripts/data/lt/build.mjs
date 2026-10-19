// Builds the Lithuanian catalogue (institutions + bachelor programmes offered in the latest national admission) from two CC BY 4.0 datasets on data.gov.lt: the NŠA study-programme register (SMPKR) and the LAMA BPO admission programmes. Usage: node scripts/data/lt/build.mjs <raw folder>
// The folder gets programos.csv and bpo_programa.csv (downloaded automatically when missing). See README.md for the filters.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { iscedToDomain } from "../isced.mjs";

const CC = "LT";
const SOURCE = "data.gov.lt SMPKR + LAMA BPO 2026-10";
const FILES = {
  "programos.csv": "https://get.data.gov.lt/datasets/gov/nsa/smpkr/studiju_mokymu_programu_duomenys/StudijuPrograma/:format/csv",
  "bpo_programa.csv": "https://get.data.gov.lt/datasets/gov/lamabpo/aukstosios_mokyklos/Programa/:format/csv",
};
// Existing university sheets (apps/web/data/universities-abroad.json, country "Lituania"), matched by the institution's legal (JAR) code;
// the register's English name was checked against the sheet's name for each one.
const SHEETS = {
  "211950810": "vilnius-university", "111950581": "ktu", "111950243": "vilnius-tech", "111950396": "vytautas-magnus", "302536989": "lsmu",
  "111951726": "mykolas-romeris", "211951150": "klaipeda-university", "111951530": "lithuanian-sports-university", "111963319": "ism-vilnius", "111966048": "lcc-international",
};
// A city municipality ("Kauno miesto savivaldybė") names its city; the genitive -> nominative of the ones that occur.
const CITY_MUNICIPALITY = /^(.+) miesto savivaldybė$/;
const CITY_OF = { Vilniaus: "Vilnius", Kauno: "Kaunas", "Klaipėdos": "Klaipėda", "Šiaulių": "Šiauliai", "Panevėžio": "Panevėžys", Alytaus: "Alytus" };

const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);
const raw = process.argv[2];
if (!raw) { console.error("usage: node scripts/data/lt/build.mjs <raw folder>"); process.exit(1); }
mkdirSync(raw, { recursive: true });

function parse(t) {
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n") { r.push(f.replace(/\r$/, "")); rows.push(r); r = []; f = ""; } else f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  const h = rows.shift();
  return rows.filter((x) => x.length > 1).map((x) => Object.fromEntries(h.map((k, i) => [k, x[i] ?? ""])));
}
const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const ascii = (s) => tidy(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");

for (const [name, url] of Object.entries(FILES)) {
  if (existsSync(`${raw}/${name}`)) continue;
  console.log("downloading", url);
  const r = await fetch(url); if (!r.ok) throw new Error(`download failed: ${r.status}`);
  writeFileSync(`${raw}/${name}`, Buffer.from(await r.arrayBuffer()));
}
const register = parse(readFileSync(`${raw}/programos.csv`, "utf8"));
const bpo = parse(readFileSync(`${raw}/bpo_programa.csv`, "utf8"));

// Institutions as the register names them (from any programme row), by legal code.
const regInst = new Map();
for (const r of register) if (r.prg_reg_inst_kodas && !regInst.has(r.prg_reg_inst_kodas)) regInst.set(r.prg_reg_inst_kodas, { name: tidy(r.prg_reg_inst_lt), adr: tidy(r.prg_reg_inst_adr) });
const seatOf = (adr) => adr.split(",").map((p) => p.trim()).find((p) => /^[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž]+$/.test(p)) || null;

// 1) registered (no deregistration date) first-cycle or integrated study programmes
const skipped = { otherLevel: 0, deregistered: 0, notInLatestAdmission: 0, institutionUnknown: 0, cityUnclear: 0, duplicateAdmissionRow: 0 };
const progs = new Map();
for (const r of register) {
  if (!/^(Pirmosios pakopos studijos|Vientisosios studijos)$/.test(r.stud_pakopa_lt)) { skipped.otherLevel++; continue; }
  if (r.prg_isreg_data) { skipped.deregistered++; continue; }
  progs.set(r.prg_valst_kodas, r);
}
// 2) ... that the LAMA BPO admission table lists for its latest year (one row per offering institution and municipality)
const year = bpo.map((b) => b.programos_metai.slice(0, 4)).sort().pop();
const offered = bpo.filter((b) => b.programos_metai.startsWith(year) && b.jar_validacija === "Tinkamas");
const offeredCodes = new Set(offered.map((b) => b.programos_valst_kodas));
for (const code of progs.keys()) if (!offeredCodes.has(code)) skipped.notInLatestAdmission++;
const STATUS = `în admiterea generală ${year}`;

const institutions = new Map(), rows = [], seen = new Set(), droppedCity = [];
for (const b of offered) {
  const r = progs.get(b.programos_valst_kodas); if (!r) continue;
  const reg = regInst.get(b.istaigos_jar);
  const seat = reg ? seatOf(reg.adr) : null;
  if (!seat) { skipped.institutionUnknown++; continue; }
  const officialName = reg.name;
  // city: a city municipality names its city; a district municipality only when it carries the seat's own name (Utenos rajono -> Utena)
  const muni = tidy(b.savivaldybe); const m = CITY_MUNICIPALITY.exec(muni);
  let city = m ? CITY_OF[m[1]] || null : null;
  if (!city && / rajono savivaldybė$/.test(muni) && muni.startsWith(seat.slice(0, 4))) city = seat;
  if (!city) { skipped.cityUnclear++; droppedCity.push(`${tidy(r.prg_pavad_lt)} (${officialName}, ${muni})`); continue; }
  const k = `${b.programos_valst_kodas}|${b.istaigos_jar}|${city}`;
  if (seen.has(k)) { skipped.duplicateAdmissionRow++; continue; }
  seen.add(k);
  let inst = institutions.get(b.istaigos_jar);
  if (!inst) {
    const name = officialName.replace(/^Viešoji įstaiga /, "").replace(/^UAB /, "").replace(/ UAB$/, "").replace(/^[„"](.*)[“"]$/, "$1");
    const kind = /(^UAB | UAB$)/.test(officialName) ? "private" : /valstybinė/.test(officialName) ? "public" : "unknown";
    const sheet = SHEETS[b.istaigos_jar];
    inst = { id: sheet || `lt-${slug(name)}`, country: CC, source: SOURCE, name, officialName, city: seat, kind, hasSheet: !!sheet, programs: 0 };
    institutions.set(b.istaigos_jar, inst);
  }
  inst.programs++;
  const isced = r.prg_isced_kodas.replace(/\D/g, "");
  const domain = tidy(r.stud_posritis_lt || r.stud_sritis_lt);
  const name = tidy(r.prg_pavad_lt);
  const credits = Math.round(Number(r.prg_apimtis_kred));
  const language = "nespecificată"; // the register and the admission table have no language of teaching
  rows.push({
    key: `lt-${slug(inst.name)}--${r.prg_valst_kodas.toLowerCase()}--${slug(city)}`, country: CC, institutionId: inst.id, institutionName: inst.name, city,
    domain, domainId: isced.length === 7 ? iscedToDomain(isced.slice(3)) : null, name, language,
    ...(credits >= 60 && credits <= 480 ? { credits } : {}), status: STATUS, source: SOURCE,
    search: ascii([name, domain, inst.name, city, language].join(" ")).slice(0, 600),
  });
}
rows.sort((a, b) => a.institutionName.localeCompare(b.institutionName, "lt") || a.name.localeCompare(b.name, "lt") || a.key.localeCompare(b.key));
const insts = [...institutions.values()].sort((a, b) => a.name.localeCompare(b.name, "lt"));
writeFileSync(new URL("lt-institutions.json", OUT), JSON.stringify(insts, null, 1) + "\n");
writeFileSync(new URL("lt-programs.json", OUT), JSON.stringify(rows) + "\n");
const nul = rows.filter((p) => p.domainId === null).length;
console.log(`registered first-cycle/integrated: ${progs.size}; admission year ${year}; kept ${new Set(rows.map((p) => p.key.split("--")[1])).size} programmes as ${rows.length} rows at ${insts.length} institutions (${insts.filter((i) => i.hasSheet).length} with a sheet); without domain ${nul} (${Math.round((100 * nul) / rows.length)}%)`);
console.log("skipped:", skipped);
if (droppedCity.length) console.log("city unclear:\n " + droppedCity.join("\n "));
