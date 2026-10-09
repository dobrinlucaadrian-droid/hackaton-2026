// Builds the German catalogue (institutions + first-cycle programmes) from the DEQAR open CSV files: node scripts/data/de/build.mjs <raw-folder>
// <raw-folder> must contain deqar-reports.csv and deqar-institutions.csv (see README.md). Node built-ins only.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const raw = process.argv[2];
if (!raw) { console.error("usage: node scripts/data/de/build.mjs <raw-folder>"); process.exit(1); }
const SOURCE = "DEQAR open data CSV 2026-10-08";
const CUTOFF = "2025-10-08"; // keep only programmes whose latest accreditation report is still valid on this date
const out = new URL("../../../apps/web/data/catalog/", import.meta.url);

function parseCsv(t) {
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n") { r.push(f); rows.push(r); r = []; f = ""; } else if (c !== "\r") f += c;
  }
  const h = rows[0].map((x) => x.replace("﻿", ""));
  return rows.slice(1).filter((x) => x.length === h.length).map((x) => Object.fromEntries(h.map((k, i) => [k, x[i]])));
}
const tidy = (s) => (s || "").replace(/\s+/g, " ").trim();
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").toLowerCase();
const slug = (s) => fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ascii = (s) => fold(s).replace(/[^a-z0-9]+/g, " ").trim();

// German / English keywords in the programme name -> app domain; first match wins; no match = null.
const RULES = [
  [/rechtswissenschaft|\brecht\b|\blaw\b|jura/, "drept"], [/zahnmedizin/, "medicina-dentara"], [/pharmazie/, "farmacie"], [/tiermedizin|veterin/, "medicina-veterinara"],
  [/^(human)?medizin$|^medicine/, "medicina"], [/pflege|hebammen|physiotherap|ergotherap|logop/, "asistenta-medicala"],
  [/wirtschaftsinformatik|medieninformatik|informatik|computer science|data science|software|computational|it-sicherheit|cyber/, "informatica"],
  [/architektur|innenarchitektur|stadtplanung/, "arhitectura"], [/bauingenieur|civil engineering|bauwesen/, "inginerie-civila"],
  [/elektrotechnik|elektronik|mechatronik|electrical/, "inginerie-electrica-electronica"], [/maschinenbau|fahrzeugtechnik|mechanical|luftfahrt|produktionstechnik/, "inginerie-mecanica"],
  [/chemieingenieur|verfahrenstechnik|werkstoff|materials/, "inginerie-chimica-materiale"], [/umwelt|energie|environmental/, "energie-petrol-mediu"],
  [/mathematik|mathematics|statistik/, "matematica"], [/physik|physics/, "fizica"], [/chemie|chemistry/, "chimie"], [/biologie|biology|biochemie|biotechnolog/, "biologie"],
  [/geographie|geografie|geoscien|geologie/, "geografie-mediu"], [/landwirtschaft|agrar|forst|gartenbau/, "agronomie-silvicultura"],
  [/betriebswirtschaft|\bbwl\b|business administration|business management|international business|unternehmensfuehrung/, "business-management"], [/volkswirtschaft|economics|finanz|finance|banking|accounting|steuer/, "economie-finante"],
  [/marketing|vertrieb|werbung/, "marketing"], [/politikwissenschaft|politik|international relations/, "stiinte-politice-relatii-internationale"], [/verwaltung|public administration/, "administratie-publica"],
  [/psycholog/, "psihologie"], [/soziale arbeit|sozialpaedagog|sozialarbeit|soziologie|sociology/, "sociologie-asistenta-sociala"],
  [/paedagog|lehramt|erziehung|bildung|education|grundschul/, "stiintele-educatiei"], [/anglistik|germanistik|romanistik|sprach|literatur|linguist|slavistik|language|philologie|uebersetz/, "litere-limbi-straine"],
  [/journalis|kommunikationswissenschaft|medienwissenschaft|communication science/, "comunicare-jurnalism"], [/geschichte|history|archaeologie/, "istorie"], [/philosophie|philosophy/, "filosofie"], [/theologie|religion|theology/, "teologie"],
  [/design|kunst|fine art|grafik|fotografie|\bmode\b|bildende/, "arte-vizuale-design"], [/musik|music|komposition|gesang|instrument/, "muzica"], [/theater|schauspiel|\bfilm|regie|tanz/, "teatru-film"],
  [/sport/, "sport-kinetoterapie"], [/polizei|militaer|bundeswehr/, "militar-politie"], [/logistik|verkehr|schiff|transport|nautik/, "marina-transporturi"], [/tourismus|hotel|gastronomie|tourism/, "turism-servicii"],
];
const domainOf = (n) => { const s = fold(n); for (const [re, id] of RULES) if (re.test(s)) return id; return null; };

const reports = parseCsv(readFileSync(join(raw, "deqar-reports.csv"), "utf8")).filter((r) => r.country === "Germany");
const insRows = parseCsv(readFileSync(join(raw, "deqar-institutions.csv"), "utf8")).filter((r) => r.country === "Germany");
const insById = new Map(insRows.map((r) => [r.deqar_id, r]));

const isMaster = (r) => /master|\bm\.\s?(a|sc|eng|ed)\b|\bllm\b|\bmba\b/i.test(r.programme_qualification) || /master/i.test(r.programme_name);
const kept = reports.filter((r) => r.programme_name && r.programme_qf_ehea_level === "first cycle" && ["programme", "joint programme", "institutional/programme"].includes(r.report_type) && r.report_valid_to >= CUTOFF && !isMaster(r));

// one row per institution x programme name x qualification: the report valid longest
const best = new Map();
for (const r of kept) {
  const k = [r.hei_deqar_id, tidy(r.programme_name).toLowerCase(), tidy(r.programme_qualification).toLowerCase()].join("|");
  const o = best.get(k);
  if (!o || r.report_valid_to > o.report_valid_to) best.set(k, r);
}

const SHEETS = [[/^technische universität münchen$/i, "tum"], [/^ludwig-maximilians-universität münchen$/i, "lmu"], [/^(ruprecht-karls-)?universität heidelberg$/i, "heidelberg"], [/^rheinisch-westfälische technische hochschule aachen$/i, "rwth"], [/^humboldt-universität zu berlin$/i, "hu-berlin"],
  [/^freie universität berlin$/i, "fu-berlin"], [/^universität hamburg$/i, "uni-hamburg"], [/^universität zu köln$/i, "uni-koeln"], [/^albert-ludwigs-universität freiburg$/i, "uni-freiburg"], [/^georg-august-universität göttingen$/i, "uni-goettingen"],
  [/^eberhard karls universität tübingen$/i, "uni-tuebingen"], [/^universität mannheim$/i, "uni-mannheim"], [/^rheinische friedrich-wilhelms-universität bonn$/i, "uni-bonn"],
  [/^westfälische wilhelms-universität münster$/i, "uni-muenster"], [/^gottfried wilhelm leibniz universität hannover$/i, "uni-hannover"], [/^ruhr-universität bochum$/i, "ruhr-uni-bochum"], [/^constructor university bremen ggmbh$/i, "constructor-university"],
  [/^technische universität carolo-wilhelmina zu braunschweig$/i, "tu-braunschweig"], [/^heinrich-heine-universität düsseldorf$/i, "hhu-duesseldorf"], [/^universität bremen$/i, "uni-bremen"]];
const urlOk = (s) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(s);
const instMap = new Map(); const programs = []; const usedKeys = new Set(); const usedIds = new Set();
for (const r of best.values()) {
  const ins = insById.get(r.hei_deqar_id);
  if (!ins || !tidy(ins.city)) continue; // no seat city in the source -> skip
  const official = tidy(ins.name_official || ins.name_primary);
  const name = tidy(official.replace(/\s*\((priv|staatl)[^)]*\)\s*/i, " "));
  const sheet = SHEETS.find(([re]) => re.test(name));
  if (!instMap.has(ins.deqar_id)) {
    let id = sheet ? sheet[1] : `de-${slug(name)}`.slice(0, 80).replace(/-$/, "");
    if (usedIds.has(id)) id = `${id.slice(0, 60)}-${ins.deqar_id.replace(/\D/g, "")}`;
    usedIds.add(id);
    const priv = /\(priv|staatlich anerkannt|katholisch|evangelisch|kirchlich/i.test(`${ins.name_official} ${ins.name_primary}`);
    const site = tidy(ins.website_link);
    instMap.set(ins.deqar_id, { id, country: "DE", source: SOURCE, name, officialName: official, city: tidy(ins.city), kind: priv ? "private" : "unknown", hasSheet: !!sheet, ...(urlOk(site) ? { website: site } : {}), programs: 0 });
  }
  const inst = instMap.get(ins.deqar_id);
  const pname = tidy(r.programme_name);
  const qual = tidy(r.programme_qualification);
  let key = `${inst.id.startsWith("de-") ? "" : "de-"}${inst.id}--${slug(pname)}${qual ? `--${slug(qual)}` : ""}`.slice(0, 190).replace(/-$/, "");
  for (let n = 2; usedKeys.has(key); n++) key = `${key.replace(/--\d+$/, "")}--${n}`;
  usedKeys.add(key); inst.programs++;
  const domain = qual || "Bachelor (first cycle)"; // DEQAR has no subject field: the degree label is the only classification it gives
  programs.push({
    key, country: "DE", institutionId: inst.id, institutionName: inst.name, city: inst.city, domain, domainId: domainOf(pname), name: pname, language: "nespecificată", // the source gives only the language of the accreditation report, not the teaching language
    status: `accreditation valid until ${r.report_valid_to}`, ...(urlOk(r.report_url) ? { url: r.report_url } : {}), source: SOURCE,
    search: ascii(`${pname} ${domain} ${inst.name} ${inst.city}`),
  });
}
const institutions = [...instMap.values()].sort((a, b) => a.id.localeCompare(b.id));
programs.sort((a, b) => a.key.localeCompare(b.key));
mkdirSync(out, { recursive: true });
writeFileSync(new URL("de-institutions.json", out), JSON.stringify(institutions, null, 1));
writeFileSync(new URL("de-programs.json", out), JSON.stringify(programs));
console.log(`institutions ${institutions.length}, programmes ${programs.length}`);
