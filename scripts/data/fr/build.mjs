// Builds the French catalogue (institutions + first-cycle programmes) from the Parcoursup 2025 open dataset: node scripts/data/fr/build.mjs <raw-folder>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DOMAIN_IDS } from "../isced.mjs";

const RAW = process.argv[2];
if (!RAW) { console.error("usage: node scripts/data/fr/build.mjs <raw-folder>"); process.exit(1); }
const CSV_URL = "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-parcoursup/exports/csv?delimiter=%3B";
const SOURCE = "Parcoursup 2025 (MESR open data, modified 2026-03-09)";
const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);

mkdirSync(RAW, { recursive: true });
const csvPath = join(RAW, "parcoursup.csv");
if (!existsSync(csvPath)) {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  writeFileSync(csvPath, Buffer.from(await res.arrayBuffer()));
}

function parseCsv(t, d = ";") {
  t = t.replace(/^﻿/, "");
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === d) { r.push(f); f = ""; }
    else if (c === "\n") { r.push(f); rows.push(r); r = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows;
}
const [head, ...body] = parseCsv(readFileSync(csvPath, "utf8"));
const raw = body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((k, i) => [k, r[i]])));
if (raw.length !== body.length) throw new Error(`malformed rows: ${body.length - raw.length}`);

const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const ascii = (s) => tidy(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/gi, "oe").replace(/æ/gi, "ae").toLowerCase();
const slug = (s, max) => ascii(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, max).replace(/-$/, "");
const search = (s) => { const t = ascii(s).replace(/[^a-z0-9]+/g, " ").trim(); return t.length <= 600 ? t : t.slice(0, 600).replace(/ \S*$/, ""); };
const city = (s) => tidy(s).replace(/^(Paris|Lyon|Marseille)\s+\d+(er|e)\s+Arrondissement$/i, "$1");

// Which formation types are kept (see README). The returned label is the type used in the counts.
function classify(x) {
  const f = x.form_lib_voe_acc, i = x.fili;
  if (i === "PASS") return "PASS";
  if (/écoles d'ingénieurs/.test(f)) return "Ecole d'ingénieurs";
  if (i === "Licence") return f.startsWith("Licence") ? "Licence" : null;
  if (i === "Licence_Las") return f.startsWith("Licence") ? "Licence accès santé (LAS)" : null;
  if (i === "BUT") return "BUT";
  if (i === "Ecole d'Ingénieur") return "Ecole d'ingénieurs";
  if (i === "Ecole de Commerce") return "Ecole de commerce";
  if (f === "Sciences politiques") return "Sciences Po / IEP";
  if (f === "Formation valant grade de licence") return "Formation valant grade de licence";
  if (f === "Formations Bac + 3") return "Formations Bac + 3";
  return null;
}

// Domain mapping: first matching rule wins; a null rule means deliberately unmapped.
// Applied to the official mention / BUT speciality, then to the programme label. Text is lower-case without accents.
const RULES = [
  [/staps|activites physiques/, "sport-kinetoterapie"],
  [/theologie/, "teologie"],
  [/sciences sanitaires et sociales|carrieres sociales/, "sociologie-asistenta-sociala"],
  [/pass\b|parcours d'acces specifique sante|sciences pour la sante|^sante\b/, "medicina"],
  [/administration publique/, "administratie-publica"],
  [/carrieres juridiques|\bdroit\b/, "drept"],
  [/techniques de commercialisation|marketing/, "marketing"],
  [/economie/, "economie-finante"],
  [/gestion|management de la logistique/, "business-management"],
  [/science politique|etudes europeennes/, "stiinte-politice-relatii-internationale"],
  [/sciences de l'education/, "stiintele-educatiei"],
  [/information et communication|information communication|journalisme/, "comunicare-jurnalism"],
  [/arts du spectacle|etudes theatrales|cinema/, "teatru-film"],
  [/musicologie/, "muzica"],
  [/arts plastiques|^arts$/, "arte-vizuale-design"],
  [/langues etrangeres appliquees|langues, litterat|^lettres|sciences du langage|langues, enseignement/, "litere-limbi-straine"],
  [/histoire/, "istorie"],
  [/geographie|sciences de la terre|transition ecologique/, "geografie-mediu"],
  [/philosophie/, "filosofie"],
  [/psychologie/, "psihologie"],
  [/sociologie|sciences sociales|sciences de l'homme/, "sociologie-asistenta-sociala"],
  [/mathematiques et informatique appliquees/, "matematica"],
  [/^informatique|science des donnees/, "informatica"],
  [/reseaux et telecommunications/, "calculatoare-it"],
  [/^mathematiques/, "matematica"],
  [/physique, chimie|^physique|mesures physiques|acoustique/, "fizica"],
  [/genie chimique|science et genie des materiaux/, "inginerie-chimica-materiale"],
  [/^chimie/, "chimie"],
  [/genie biologique parcours agronomie|vigne et du vin/, "agronomie-silvicultura"],
  [/dietetique/, null],
  [/genie biologique|sciences de la vie|sciences biomedicales/, "biologie"],
  [/genie civil|genie urbain/, "inginerie-civila"],
  [/genie mecanique|^mecanique|genie industriel/, "inginerie-mecanica"],
  [/electrique|electronique/, "inginerie-electrica-electronica"],
  [/efficacite energetiques/, "energie-petrol-mediu"],
  [/tourisme/, "turism-servicii"],
];
const ENG_RULES = [ // engineering schools: used only when the label names exactly one field
  [/informatique/, "informatica"], [/\bbtp\b|genie civil|construction/, "inginerie-civila"], [/mecani/, "inginerie-mecanica"],
  [/electri|electronique/, "inginerie-electrica-electronica"], [/chimi|materiaux/, "inginerie-chimica-materiale"], [/agro|agricol/, "agronomie-silvicultura"],
];
const first = (text, rules) => { for (const [re, id] of rules) if (re.test(text)) return id; return undefined; };
function mapDomain(type, x) {
  const mention = ascii(x.fil_lib_voe_acc), label = ascii(x.lib_for_voe_ins);
  if (type === "PASS") return "medicina";
  if (type === "Sciences Po / IEP") return "stiinte-politice-relatii-internationale";
  if (type === "Ecole de commerce") {
    if (/marketing/.test(label)) return "marketing";
    if (/finance/.test(label)) return "economie-finante";
    if (/tourisme|hospitality|hotel/.test(label)) return "turism-servicii";
    return "business-management";
  }
  if (type === "Ecole d'ingénieurs") {
    const ids = new Set(ENG_RULES.filter(([re]) => re.test(label)).map(([, id]) => id));
    return ids.size === 1 ? [...ids][0] : null;
  }
  if (type === "Formation valant grade de licence" || type === "Formations Bac + 3") return first(label.replace(/^formation valant grade de licence - /, ""), RULES) ?? null;
  return first(mention, RULES) ?? first(label.replace(/^(licence|but|double licence|licence - double diplome)\s*-\s*/, ""), RULES) ?? null;
}

// Count every formation type in the source, keep the wanted ones.
const kept = [], dropped = new Map(), keptCount = new Map(); let foreign = 0;
for (const x of raw) {
  const type = classify(x);
  if (!type) { const k = `${x.form_lib_voe_acc} [${x.fili}]`; dropped.set(k, (dropped.get(k) || 0) + 1); continue; }
  if (x.dep === "99") { foreign++; continue; } // establishments abroad that Parcoursup lists
  kept.push({ x, type }); keptCount.set(type, (keptCount.get(type) || 0) + 1);
}

// Existing app sheets, matched by the establishment's official UAI code.
const SHEETS = { "0755890V": "sorbonne", "0753431X": "sciences-po", "0690192J": "insa-lyon" };

const byUai = new Map();
for (const { x } of kept) { const a = byUai.get(x.cod_uai) || []; a.push(x); byUai.set(x.cod_uai, a); }
const slugCount = new Map();
for (const rows of byUai.values()) { const s = slug(rows[0].g_ea_lib_vx, 60); slugCount.set(s, (slugCount.get(s) || 0) + 1); }
const mode = (arr) => { const m = new Map(); arr.forEach((v) => m.set(v, (m.get(v) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]; };
const instOf = new Map();
for (const [uai, rows] of byUai) {
  const name = tidy(rows[0].g_ea_lib_vx), s = slug(name, 60);
  const id = SHEETS[uai] ?? (slugCount.get(s) > 1 ? `fr-${s}-${uai.toLowerCase()}` : `fr-${s}`);
  instOf.set(uai, { id, country: "FR", source: SOURCE, name, officialName: name, city: city(mode(rows.map((r) => r.ville_etab))),
    kind: rows[0].contrat_etab === "Public" ? "public" : "private", hasSheet: uai in SHEETS, programs: 0 });
}

const programs = [], usedKeys = new Set(), noDomainByType = new Map();
for (const { x, type } of kept) {
  const inst = instOf.get(x.cod_uai);
  const name = tidy(x.lib_for_voe_ins);
  const domainId = mapDomain(type, x);
  if (domainId && !DOMAIN_IDS.includes(domainId)) throw new Error(`bad domain ${domainId}`);
  if (domainId === null) noDomainByType.set(type, (noDomainByType.get(type) || 0) + 1);
  // cod_aff_form is Parcoursup's unique code of the offer, so keys never collide
  const key = `fr-${slug(inst.id.replace(/^fr-/, ""), 40)}--${slug(name, 70)}--${x.cod_aff_form}`;
  if (usedKeys.has(key)) throw new Error(`duplicate key ${key}`);
  usedKeys.add(key);
  const p = { key, country: "FR", institutionId: inst.id, institutionName: inst.name, city: city(x.ville_etab) || inst.city,
    domain: tidy(x.fil_lib_voe_acc) || tidy(x.form_lib_voe_acc), domainId, name, language: "franceză" };
  const bac = name.match(/Bac\s*\+\s*([3-5])\b/i); if (bac) p.years = Number(bac[1]);
  const cap = parseInt(x.capa_fin, 10); if (Number.isInteger(cap) && cap >= 0) p.maxStudents = cap;
  if (/^https?:\/\//.test(x.lien_form_psup)) p.url = x.lien_form_psup.trim();
  p.source = SOURCE;
  p.search = search([name, p.domain, inst.name, p.city, "franceza"].join(" "));
  programs.push(p); inst.programs++;
}
const institutions = [...instOf.values()].sort((a, b) => a.id.localeCompare(b.id));
programs.sort((a, b) => a.key.localeCompare(b.key));
mkdirSync(OUT, { recursive: true });
writeFileSync(new URL("fr-institutions.json", OUT), JSON.stringify(institutions, null, 1) + "\n");
writeFileSync(new URL("fr-programs.json", OUT), JSON.stringify(programs, null, 1) + "\n");

console.log(`source rows: ${raw.length}; kept: ${kept.length}; dropped (type): ${[...dropped.values()].reduce((a, b) => a + b, 0)}; dropped (abroad): ${foreign}`);
console.log("KEPT:", [...keptCount].map(([k, v]) => `${k} ${v}`).join("; "));
console.log("DROPPED:", [...dropped].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join("; "));
const nul = programs.filter((p) => p.domainId === null).length;
console.log(`institutions ${institutions.length}, programmes ${programs.length}, cities ${new Set(programs.map((p) => p.city)).size}, no domain ${nul} (${((100 * nul) / programs.length).toFixed(1)}%)`);
console.log("no domain by type:", [...noDomainByType].map(([k, v]) => `${k} ${v}`).join("; "));
