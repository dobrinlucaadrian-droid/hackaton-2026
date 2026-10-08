// Builds the Italian catalogue (institutions + first-cycle and single-cycle programmes) from the MUR USTAT open data. Usage: node scripts/data/it/build.mjs <folder with offerta.csv and atenei.csv>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) { console.error("usage: node scripts/data/it/build.mjs <raw folder with offerta.csv and atenei.csv>"); process.exit(1); }
const SOURCE = "MUR USTAT offerta formativa 2025";
const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);

// Existing app sheets: MUR "NomeOperativo" -> app id
const SHEETS = { "Bologna": "unibo", "Milano Politecnico": "polimi", "Torino Politecnico": "polito", "Roma La Sapienza": "sapienza", "Padova": "unipd", "Milano Bocconi": "bocconi" };
const SHEET_IDS = new Set(Object.values(SHEETS));

// ---- helpers
function decode(file) {
  const buf = readFileSync(join(dir, file));
  try { return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, ""); }
  catch { return new TextDecoder("windows-1252").decode(buf).replace(/^﻿/, ""); }
}
function parseCsv(text) { // ';' separated, double quotes with "" escape
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ";") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = rows.shift();
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}
const tidy = (s) => s.replace(/&#\d+;/g, "").replace(/[​-‍﻿]/g, "").replace(/\s+/g, " ").trim();
const ascii = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");
const alnum = (s) => ascii(s).replace(/ /g, "");
const SMALL = new Set(["di", "del", "della", "delle", "dei", "degli", "dello", "in", "nel", "sul", "sulla", "al", "alla", "e", "su", "da", "con"]);
function titleCase(s) { // "REGGIO NELL'EMILIA" -> "Reggio nell'Emilia"
  return tidy(s).toLowerCase().replace(/\p{L}+/gu, (w, off, str) => {
    if (off > 0 && SMALL.has(w) && str[off - 1] === " ") return w;
    return w[0].toUpperCase() + w.slice(1);
  }).replace(/\b(nell|dell|all|sull|d)'(\p{L})/giu, (m, a, b) => `${a.toLowerCase()}'${b.toUpperCase()}`);
}
function tidyName(s) {
  s = tidy(s).replace(/^"+|"+$/g, "").trim();
  const letters = s.replace(/[^\p{L}]/gu, "");
  if (letters.length > 3 && letters === letters.toUpperCase()) s = s[0] + s.slice(1).toLowerCase(); // ALL CAPS -> sentence case
  return s;
}

// ---- degree class -> app domain (our own mapping; null = unsure)
const CLASS_DOMAIN = {
  "L-1": null, "L-2": "biologie", "L-3": "arte-vizuale-design", "L-4": "arte-vizuale-design", "L-5": "filosofie", "L-6": "geografie-mediu",
  "L-7": "inginerie-civila", "L-8": "inginerie-electrica-electronica", "L-9": "inginerie-mecanica", "L-10": "litere-limbi-straine", "L-11": "litere-limbi-straine",
  "L-12": "litere-limbi-straine", "L-13": "biologie", "L-14": "drept", "L-15": "turism-servicii", "L-16": "administratie-publica", "L-17": "arhitectura",
  "L-18": "business-management", "L-19": "stiintele-educatiei", "L-20": "comunicare-jurnalism", "L-21": "arhitectura", "L-22": "sport-kinetoterapie",
  "L-23": "inginerie-civila", "L-24": "psihologie", "L-25": "agronomie-silvicultura", "L-26": "agronomie-silvicultura", "L-27": "chimie", "L-28": "marina-transporturi",
  "L-29": "farmacie", "L-30": "fizica", "L-31": "informatica", "L-32": "geografie-mediu", "L-33": "economie-finante", "L-34": "geografie-mediu", "L-35": "matematica",
  "L-36": "stiinte-politice-relatii-internationale", "L-37": "stiinte-politice-relatii-internationale", "L-38": "agronomie-silvicultura", "L-39": "sociologie-asistenta-sociala",
  "L-40": "sociologie-asistenta-sociala", "L-41": "matematica", "L-42": "istorie", "L-43": null, "L-P01": "inginerie-civila", "L-P02": "agronomie-silvicultura", "L-P03": null,
  "L-Sc.Mat.": "inginerie-chimica-materiale", "L/DS": "militar-politie", "L/GASTR": null,
  "L/SNT1": "asistenta-medicala", "L/SNT2": "asistenta-medicala", "L/SNT3": "asistenta-medicala", "L/SNT4": "asistenta-medicala",
  "LM-13": "farmacie", "LM-41": "medicina", "LM-42": "medicina-veterinara", "LM-46": "medicina-dentara", "LM-4cu": "arhitectura", "LM-85 bis": "stiintele-educatiei",
  "LMG/01": "drept", "LMR/02": null,
};
// Refinements by programme name inside broad classes (only where the name is clear)
function domainFor(cls, name) {
  const n = ascii(name);
  if (!(cls in CLASS_DOMAIN)) throw new Error(`unmapped class ${cls}`);
  let d = CLASS_DOMAIN[cls];
  if (cls === "L-3") { if (/music|canto|strument|jazz/.test(n)) d = "muzica"; else if (/spettacolo|cinema|teatr|dams|audiovisiv|danza/.test(n)) d = "teatru-film"; }
  else if (cls === "L-8") {
    if (/biomedic|bioingegner|gestional|clinic/.test(n)) d = null;
    else if (/informatic|computer|cyber|dati|data|software|intelligenza|artificial/.test(n)) d = "calculatoare-it";
  } else if (cls === "L-9") {
    if (/biomedic|gestional|management|sicurezza/.test(n)) d = null;
    else if (/chimic|material|process/.test(n)) d = "inginerie-chimica-materiale";
    else if (/energ|ambient/.test(n)) d = "energie-petrol-mediu";
    else if (/elettric|elettron|automaz|automation|electric/.test(n)) d = "inginerie-electrica-electronica";
  } else if (cls === "L/SNT2") { if (/fisioterap|riabilit|motor|physiotherap/.test(n)) d = "sport-kinetoterapie"; }
  return d;
}

// ---- language / form / access
const LANG = { italiano: "italiană", inglese: "engleză", tedesco: "germană", francese: "franceză", ladino: "ladină", altro: "altă limbă" };
const language = (s) => {
  const parts = s.split(/\s*-\s*/).map((p) => LANG[p.trim().toLowerCase()]);
  if (parts.some((p) => !p)) throw new Error(`unknown language "${s}"`);
  return parts.join(", ");
};
const formOf = (didattica) => (/teledidattica|distanza/i.test(didattica) ? "distance" : undefined);
const ACCESS = { "accesso libero": "accesso libero", nazionale: "accesso nazionale", locale: "accesso locale" };

// ---- read
const atenei = parseCsv(decode("atenei.csv"));
const offer = parseCsv(decode("offerta.csv"));
const byOp = new Map(atenei.map((a) => [alnum(a.NomeOperativo), a]));
const year = Math.max(...offer.map((r) => +r.ANNO));
const TYPES = new Set(["Laurea", "Laurea Magistrale Ciclo Unico"]);
const rows = offer.filter((r) => +r.ANNO === year && TYPES.has(r.TipoCorso));
console.log(`source rows total ${offer.length}; year ${year}: ${offer.filter((r) => +r.ANNO === year).length}; kept (Laurea + ciclo unico): ${rows.length}`);

const insts = new Map(); const progs = []; const usedKeys = new Set();
for (const r of rows) {
  const a = byOp.get(alnum(r.Ateneo));
  if (!a) throw new Error(`university not found in atenei.csv: ${r.Ateneo}`);
  const name = tidy(a.NomeEsteso);
  const id = SHEETS[a.NomeOperativo] || ("it-" + slug(name).slice(0, 70).replace(/-$/, ""));
  const city = a.CITTA ? titleCase(a.CITTA) : titleCase(r.SedeCorso_Comune);
  if (!insts.has(id)) insts.set(id, { id, country: "IT", source: SOURCE, name, officialName: name, city, kind: a.StataleLibera === "S" ? "public" : "private", hasSheet: SHEET_IDS.has(id), programs: 0 });
  const inst = insts.get(id); inst.programs++;
  const pname = tidyName(r.Corso);
  let pcity = titleCase(r.SedeCorso_Comune);
  if (!pcity || /^comune estero$/i.test(pcity)) pcity = inst.city; // source placeholder for seats abroad: fall back to the institution seat
  const lang = language(r.LINGUA);
  const form = formOf(r.DIDATTICA);
  const domainLabel = `${tidy(r.NomeClasse)} (${r.Classe})`;
  let key = `${id.replace(/^it-/, "")}--${slug(r.Classe)}--${slug(pname).slice(0, 60)}--${slug(pcity)}--${slug(lang)}`.replace(/-+$/, "");
  if (form) key += "--distance"; else if (/blended/i.test(r.DIDATTICA)) key += "--blended";
  key = "it-" + key;
  let k = key, n = 2; while (usedKeys.has(k)) k = `${key}-${n++}`; usedKeys.add(k);
  if (!ACCESS[r.ACCESSO]) throw new Error(`unknown access "${r.ACCESSO}"`);
  const p = { key: k, country: "IT", institutionId: id, institutionName: name, city: pcity, domain: domainLabel, domainId: domainFor(r.Classe, pname), name: pname, language: lang };
  if (form) p.form = form;
  p.status = ACCESS[r.ACCESSO];
  p.source = SOURCE;
  p.search = ascii([pname, domainLabel, name, pcity, lang].join(" "));
  progs.push(p);
}
const instList = [...insts.values()].sort((x, y) => x.id.localeCompare(y.id));
progs.sort((x, y) => x.key.localeCompare(y.key));
writeFileSync(new URL("it-institutions.json", OUT), JSON.stringify(instList, null, 1) + "\n");
writeFileSync(new URL("it-programs.json", OUT), JSON.stringify(progs) + "\n");
const nulls = progs.filter((p) => p.domainId === null).length;
console.log(`institutions ${instList.length}; programmes ${progs.length}; without domain ${nulls} (${((100 * nulls) / progs.length).toFixed(1)}%)`);
