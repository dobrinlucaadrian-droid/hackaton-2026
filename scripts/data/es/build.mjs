// Builds the Spain catalogue (Comunitat Valenciana only) from the Generalitat Valenciana open dataset "Grados y Másteres oficiales".
// Usage: node scripts/data/es/build.mjs <raw-folder>   (raw folder must contain gva.csv, see README.md)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { iscedToDomain } from "../isced.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const raw = process.argv[2];
if (!raw) { console.error("usage: node build.mjs <raw-folder>"); process.exit(1); }
const out = path.resolve(here, "../../../apps/web/data/catalog");
const SOURCE = "Generalitat Valenciana - Grados y Másteres oficiales (CC BY), actualizado 2026-09-23, solo Comunitat Valenciana";

function parseCsv(t) {
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; r.push(f); f = ""; rows.push(r); r = []; }
    else f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  const h = rows.shift();
  return rows.filter((x) => x.length > 1).map((x) => Object.fromEntries(h.map((k, i) => [k, x[i]])));
}
const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const ascii = (s) => tidy(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");

// Keyword fallback for rows without an ISCED code. Applied to the programme name without prefix; null when unsure.
const RULES = [
  [/^(doble|pceo)|\//, null],
  [/veterinaria/, "medicina-veterinara"], [/odontolog/, "medicina-dentara"], [/farmacia/, "farmacie"],
  [/^medicina\b/, "medicina"], [/enfermeria/, "asistenta-medicala"], [/fisioterapia|actividad fisica y del deporte|ciencias del deporte/, "sport-kinetoterapie"],
  [/informatica|inteligencia artificial|ciencia de datos|desarrollo de software|videojuegos|ciberseguridad/, "informatica"],
  [/telecomunicaci|electronic|electric/, "inginerie-electrica-electronica"], [/mecanic/, "inginerie-mecanica"],
  [/ingenieria civil|obras publicas|caminos/, "inginerie-civila"], [/arquitectura/, "arhitectura"],
  [/ingenieria quimica|ingenieria de materiales/, "inginerie-chimica-materiale"], [/ingenieria/, null],
  [/^quimica\b/, "chimie"], [/^fisica\b/, "fizica"], [/matematica|estadistica/, "matematica"],
  [/biologia|biotecnologia|biomedicina|bioquimica/, "biologie"], [/ciencias ambientales|ciencias del mar|geologia|geografia/, "geografie-mediu"],
  [/agronom|agroaliment|forestal|agricola/, "agronomie-silvicultura"],
  [/administracion y direccion de empresas|direccion de empresas|^empresa|negocios|business|gestion empresarial/, "business-management"],
  [/economia|finanzas|contabilidad/, "economie-finante"], [/marketing|publicidad/, "marketing"],
  [/^derecho\b/, "drept"], [/ciencias politicas|relaciones internacionales/, "stiinte-politice-relatii-internationale"], [/administracion publica/, "administratie-publica"],
  [/periodismo|comunicacion audiovisual|comunicacion/, "comunicare-jurnalism"], [/psicologia/, "psihologie"],
  [/trabajo social|sociologia/, "sociologie-asistenta-sociala"],
  [/maestro|educacion|pedagogia/, "stiintele-educatiei"],
  [/traduccion|filologia|lenguas|estudios ingleses|lengua/, "litere-limbi-straine"], [/^historia\b/, "istorie"], [/filosofia/, "filosofie"], [/teologia/, "teologie"],
  [/bellas artes|diseno|conservacion y restauracion/, "arte-vizuale-design"], [/musica/, "muzica"], [/cine|artes escenicas|arte dramatico/, "teatru-film"],
  [/turismo|gastronomia/, "turism-servicii"], [/nautica|transporte maritimo/, "marina-transporturi"],
];
function domainFor(row, name) {
  const byCode = iscedToDomain(row.codambito);
  if (byCode) return byCode;
  if (row.codambito) return null; // an ISCED code exists but has no mapped domain: leave null
  const base = ascii(name.replace(/^Graduad[oa] o Graduad[oa] en /i, "").replace(/^Grado en /i, ""));
  for (const [re, id] of RULES) if (re.test(base)) return id;
  return null;
}

const rows = parseCsv(fs.readFileSync(path.join(raw, "gva.csv"), "utf8"))
  .filter((r) => r.nomtipo_c === "Universitario" && (r.tipo === "GU" || r.tipo === "GI"));

const insts = new Map(); const progs = []; const keys = new Set();
const cityCount = new Map(); const kindCount = new Map();
for (const r of rows) {
  const uniName = tidy(r.nomuniversidad_c);
  const city = tidy(r.municipio_c || r.municipio);
  if (!uniName || !city) continue;
  const id = `es-${slug(uniName)}`;
  const kind = /^P\S{1,3}blica$/.test(tidy(r.naturaleza_c)) ? "public" : tidy(r.naturaleza_c) === "Privada" ? "private" : "unknown";
  if (!insts.has(id)) insts.set(id, { id, country: "ES", source: SOURCE, name: uniName, officialName: uniName, city: "", kind, hasSheet: false, programs: 0 });
  const kc = kindCount.get(id) ?? {}; kc[kind] = (kc[kind] || 0) + 1; kindCount.set(id, kc);
  const cc = cityCount.get(id) ?? new Map(); cc.set(city, (cc.get(city) || 0) + 1); cityCount.set(id, cc);
  const name = tidy(r.nomgrado_c).replace(/\s+por\s+(la|el)\s+Universi\w+.*$/i, "").replace(/\s+por\s+(la|el)\s+[A-Z][A-Z0-9-]{1,8}$/, "").replace(/\b(en|de)\s+\1\b/gi, "$1");
  const presenc = tidy(r.presencialidad_c);
  const faculty = tidy(r.nomcentro_c);
  let key = `${id}--${slug(name)}--${r.centro}-${r.campus}`.slice(0, 190);
  if (keys.has(key)) key = `${key}-${r.id}`;
  keys.add(key);
  const domain = tidy(r.nomambito_c) || tidy(r.descarea_c);
  const p = {
    key, country: "ES", institutionId: id, institutionName: uniName, city,
    ...(faculty ? { faculty } : {}),
    domain, domainId: domainFor(r, name), name, language: "spaniolă",
    ...(presenc === "Estudio presencial" ? { form: "full-time" } : presenc === "Estudio no presencial" ? { form: "distance" } : {}),
    ...(/^https?:\/\/\S+\.\S+$/.test(tidy(r.url_grado)) ? { url: tidy(r.url_grado) } : {}),
    source: SOURCE,
    search: [name, domain, faculty, uniName, city, "spaniola"].map(ascii).join(" ").replace(/\s+/g, " ").trim(),
  };
  progs.push(p); insts.get(id).programs++;
}
// naturaleza is per centre; a university whose rows are mostly public (private rows are affiliated centres) is public
for (const [id, kc] of kindCount) insts.get(id).kind = Object.entries(kc).sort((a, b) => b[1] - a[1])[0][0];
for (const [id, cc] of cityCount) insts.get(id).city = [...cc.entries()].sort((a, b) => b[1] - a[1])[0][0]; // municipality with most programmes

fs.writeFileSync(path.join(out, "es-institutions.json"), JSON.stringify([...insts.values()], null, 1));
fs.writeFileSync(path.join(out, "es-programs.json"), JSON.stringify(progs, null, 1));
console.log(`institutions ${insts.size}, programmes ${progs.length}, source rows (Grado, university) ${rows.length}`);
