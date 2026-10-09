// Builds the Spain catalogue: public universities from the Ministry's SIIU pre-enrolment file, private ones and UNED from the national register RUCT; cities from RUCT centres.
// Usage: node scripts/data/es/build.mjs <raw-folder>
//   <raw-folder>/preinsc.xlsx   SIIU "Preinscripción" file (see README.md)
//   <raw-folder>/ruct/…         files downloaded by fetch.mjs
//   <raw-folder>/gva.csv        optional: Generalitat Valenciana file, used only to add programme web links
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const raw = process.argv[2];
if (!raw) { console.error("usage: node scripts/data/es/build.mjs <raw-folder>"); process.exit(1); }
const out = path.resolve(here, "../../../apps/web/data/catalog");
const YEAR = "2025-2026";
const SRC_SIIU = "SIIU Preinscripción Grado 2025-26 (Ministerio de Ciencia, Innovación y Universidades) + RUCT centros 2026-10";
const SRC_RUCT = "RUCT 2026-10 (Registro de Universidades, Centros y Títulos): títulos por centro";
const SRC_INST = "RUCT 2026-10 (Registro de Universidades, Centros y Títulos)";
const SHEETS = { "004": "ub-barcelona", "057": "ie-university", "010": "ucm-madrid", "023": "uam-madrid", "036": "uc3m-madrid", "025": "upm-madrid", "022": "uab-barcelona", "024": "upc-barcelona", "018": "uv-valencia",
  "027": "upv-valencia", "017": "us-sevilla", "008": "ugr-granada", "014": "usal-salamanca", "021": "unizar-zaragoza", "011": "uma-malaga", "031": "unav-navarra", "001": "ua-alicante", "012": "um-murcia", "013": "uniovi-oviedo",
  "007": "usc-santiago" }; // RUCT university code -> existing app sheet id

// ---------- small readers (no packages) ----------
const tidy = (s) => String(s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
const ascii = (s) => tidy(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => ascii(s).replace(/ /g, "-");
const xmlText = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, "&");
const HTML_ENT = { aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", agrave: "à", egrave: "è", ograve: "ò", Agrave: "À", Egrave: "È", Ograve: "Ò", iuml: "ï", ccedil: "ç", Ccedil: "Ç", middot: "·", ordf: "ª", ordm: "º", nbsp: " ", amp: "&", quot: '"', lt: "<", gt: ">", laquo: "«", raquo: "»", iexcl: "¡", iquest: "¿", acute: "´" };
const htmlText = (s) => s.replace(/<[^>]*>/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&(\w+);/g, (m, n) => HTML_ENT[n] ?? m);

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
  return rows.filter((x) => x.length > 1);
}

/** Reads the named entries of a .zip/.xlsx file. */
function unzip(buf, wanted) {
  let e = buf.length - 22; while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error("not a zip file");
  const n = buf.readUInt16LE(e + 10); let p = buf.readUInt32LE(e + 16); const res = {};
  for (let i = 0; i < n; i++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lo = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nl);
    if (wanted.includes(name)) {
      const ds = lo + 30 + buf.readUInt16LE(lo + 26) + buf.readUInt16LE(lo + 28);
      const data = buf.subarray(ds, ds + csize);
      res[name] = method === 0 ? Buffer.from(data) : zlib.inflateRawSync(data);
    }
    p += 46 + nl + el + cl;
  }
  return res;
}
/** Rows of the sheet with the given tab name in an .xlsx workbook, as arrays of strings. */
function xlsxSheet(file, tabName) {
  const buf = fs.readFileSync(file);
  const meta = unzip(buf, ["xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/sharedStrings.xml"]);
  const tab = [...meta["xl/workbook.xml"].toString("utf8").matchAll(/<sheet [^>]*>/g)].map((m) => m[0]).find((s) => xmlText(s.match(/name="([^"]*)"/)[1]) === tabName);
  if (!tab) throw new Error(`sheet "${tabName}" not found in ${file}`);
  const rid = tab.match(/r:id="([^"]*)"/)[1];
  const rel = [...meta["xl/_rels/workbook.xml.rels"].toString("utf8").matchAll(/<Relationship [^>]*>/g)].map((m) => m[0]).find((s) => s.includes(`Id="${rid}"`));
  const target = "xl/" + rel.match(/Target="([^"]*)"/)[1].replace(/^\/xl\//, "");
  const ss = [...meta["xl/sharedStrings.xml"].toString("utf8").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => xmlText([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join("")));
  const xml = unzip(buf, [target])[target].toString("utf8"); const rows = [];
  for (const m of xml.matchAll(/<row [^>]*>([\s\S]*?)<\/row>/g)) {
    const r = [];
    for (const c of m[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = c[1].split("").reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const v = (c[3] || "").match(/<v>([\s\S]*?)<\/v>/);
      r[col] = v ? (/t="s"/.test(c[2]) ? ss[+v[1]] : xmlText(v[1])) : "";
    }
    rows.push(r);
  }
  return rows;
}
/** Rows of the first sheet of an old-format .xls file (as written by the register's export), as arrays of strings. */
function xlsRows(file) {
  const b = fs.readFileSync(file);
  const ssz = 1 << b.readUInt16LE(30), msz = 1 << b.readUInt16LE(32), cutoff = b.readUInt32LE(56);
  const sec = (n) => b.subarray((n + 1) * ssz, (n + 2) * ssz); // sector 0 starts after the header
  const difat = []; for (let i = 0; i < 109; i++) { const v = b.readUInt32LE(76 + 4 * i); if (v < 0xfffffffc) difat.push(v); }
  const fat = []; for (const s of difat) { const d = sec(s); for (let i = 0; i < ssz; i += 4) fat.push(d.readUInt32LE(i)); }
  const chain = (start, table, get) => { const parts = []; for (let s = start, guard = 0; s < 0xfffffffc && guard < 1e6; s = table[s], guard++) parts.push(get(s)); return Buffer.concat(parts); };
  const dir = chain(b.readUInt32LE(48), fat, sec); let root = null, wb = null;
  for (let o = 0; o + 128 <= dir.length; o += 128) {
    const name = dir.toString("utf16le", o, o + Math.max(0, dir.readUInt16LE(o + 64) - 2));
    const ent = { start: dir.readUInt32LE(o + 116), size: dir.readUInt32LE(o + 120) };
    if (dir[o + 66] === 5) root = ent; else if (name === "Workbook" || name === "Book") wb = ent;
  }
  if (!wb) throw new Error(`no workbook in ${file}`);
  let data;
  if (wb.size >= cutoff) data = chain(wb.start, fat, sec);
  else {
    const mini = chain(root.start, fat, sec); const mfatBuf = chain(b.readUInt32LE(60), fat, sec); const mfat = [];
    for (let i = 0; i + 4 <= mfatBuf.length; i += 4) mfat.push(mfatBuf.readUInt32LE(i));
    data = chain(wb.start, mfat, (n) => mini.subarray(n * msz, n * msz + msz));
  }
  data = data.subarray(0, wb.size);
  const recs = []; for (let p = 0; p + 4 <= data.length;) { const id = data.readUInt16LE(p), len = data.readUInt16LE(p + 2); recs.push({ id, d: data.subarray(p + 4, p + 4 + len) }); p += 4 + len; }
  const sst = []; const rows = [];
  const cell = (r, c, v) => { (rows[r] ??= [])[c] = v; };
  for (let i = 0; i < recs.length; i++) {
    const { id, d } = recs[i];
    if (id === 0x00fc) { // shared strings; a string may continue in the following CONTINUE (0x3c) records
      const segs = [d]; while (recs[i + 1]?.id === 0x003c) segs.push(recs[++i].d);
      let si = 0, p = 8; const total = d.readUInt32LE(4);
      const need = () => { while (si < segs.length && p >= segs[si].length) { p -= segs[si].length; si++; } };
      const u8 = () => { need(); return segs[si][p++]; };
      const u16 = () => { const lo = u8(); return lo | (u8() << 8); };
      for (let k = 0; k < total && si < segs.length; k++) {
        need(); if (si >= segs.length) break;
        let cch = u16(), flags = u8(); const runs = flags & 8 ? u16() : 0; const ext = flags & 4 ? u16() | (u16() << 16) : 0; let s = "";
        while (cch > 0) {
          if (p >= segs[si].length) { si++; p = 0; flags = (flags & ~1) | (segs[si][p++] & 1); } // continued: new width flag
          if (flags & 1) { s += String.fromCharCode(segs[si][p] | (segs[si][p + 1] << 8)); p += 2; } else s += String.fromCharCode(segs[si][p++]);
          cch--;
        }
        for (let x = 0; x < runs * 4 + ext; x++) u8();
        sst.push(s);
      }
    } else if (id === 0x00fd) cell(d.readUInt16LE(0), d.readUInt16LE(2), sst[d.readUInt32LE(6)] ?? "");
    else if (id === 0x0204) { const cch = d.readUInt16LE(6); cell(d.readUInt16LE(0), d.readUInt16LE(2), d[8] & 1 ? d.toString("utf16le", 9, 9 + 2 * cch) : d.toString("latin1", 9, 9 + cch)); }
    else if (id === 0x0203) cell(d.readUInt16LE(0), d.readUInt16LE(2), String(d.readDoubleLE(6)));
  }
  return rows.filter(Boolean).map((r) => Array.from(r, (v) => htmlText(v ?? ""))); // the export leaves some HTML entities (&oacute;) in the cells
}

// ---------- our own mapping to the app's 40 domains ("" = deliberately none; undefined = no rule matched) ----------
const NAME_RULES = [
  [/militar/, "militar-politie"],
  [/veterinaria/, "medicina-veterinara"], [/odontolog/, "medicina-dentara"], [/^farmacia\b/, "farmacie"], [/^medicina\b/, "medicina"], [/enfermeria/, "asistenta-medicala"],
  [/fisioterapia|actividad fisica|deporte/, "sport-kinetoterapie"], [/^psicologia\b/, "psihologie"],
  [/gestion aeronautica|piloto|^filosofia, |politica, sociologia|historia y geografia|geografia (e|y) historia|historia del arte/, ""],
  [/\bnautica|marina civil|marina\b|transporte maritimo|radioelectronica naval|tecnologias marinas/, "marina-transporturi"], [/naval|aeroespacial|aeronaut|aeronaveg/, "inginerie-mecanica"],
  [/ingenieria informatica|ingenieria de computadores|ingenieria (del|de|en) software|ingenieria (de|en) tecnologias de la informacion|ingenieria (de|en) sistemas de informacion/, "calculatoare-it"],
  [/informatica|inteligencia artificial|ciencias? (e ingenieria )?de (los )?datos|videojuegos|ciberseguridad|computacion|desarrollo de (software|aplicaciones)/, "informatica"],
  [/telecomunicaci|telematica|electronic|electric|automatica|mecatronica|robotica/, "inginerie-electrica-electronica"],
  [/mecanic|diseno industrial|tecnologias industriales|ingenieria industrial/, "inginerie-mecanica"],
  [/ingenieria civil|obras publicas|caminos|arquitectura tecnica|edificacion|ingenieria de la construccion/, "inginerie-civila"], [/arquitectura/, "arhitectura"],
  [/ingenieria quimica|ingenieria (de|en) (los )?materiales/, "inginerie-chimica-materiale"],
  [/agronom|agroaliment|agricola|agraria|agroambiental|forestal|enologia|hortofrut|medio rural|medio natural/, "agronomie-silvicultura"],
  [/energia|energetic|minas|minera|petrole|ingenieria ambiental/, "energie-petrol-mediu"],
  [/ingenieria|criminolog|seguridad|nutricion|alimentos|optica|logopedia|podologia|terapia ocupacional/, ""],
  [/^quimica\b/, "chimie"], [/^fisica\b/, "fizica"], [/matematica|estadistica/, "matematica"],
  [/biologia|biotecnologia|bioquimica|biomedic|genetica|microbiologia/, "biologie"],
  [/ciencias ambientales|ciencias del mar|geologia|geografia|oceanograf/, "geografie-mediu"],
  [/turismo|turistic|gastronom|hotel/, "turism-servicii"],
  [/marketing|publicidad|mercadotecnia|investigacion (y tecnicas )?de mercado/, "marketing"],
  [/administracion y direccion de empresas|direccion de empresas|direccion y (creacion|administracion) de empresas/, "business-management"],
  [/finanzas|contabilidad|^economia\b|banca/, "economie-finante"],
  [/empresa|negocios|business|emprend|comercio|relaciones laborales|recursos humanos/, "business-management"],
  [/^derecho\b/, "drept"], [/ciencias? politicas?|relaciones internacionales|estudios internacionales/, "stiinte-politice-relatii-internationale"],
  [/administracion publica|gestion publica/, "administratie-publica"],
  [/traduccion|filologia|lenguas|estudios (ingleses|hispanicos|franceses|alemanes|arabes|catalanes|vascos|gallegos|clasicos|italianos|portugueses|hebreos|semiticos)|^lengua\b|linguistica|literatura/, "litere-limbi-straine"],
  [/periodismo|comunicacion/, "comunicare-jurnalism"],
  [/trabajo social|sociologia|educacion social/, "sociologie-asistenta-sociala"],
  [/maestro|magisterio|educacion infantil|educacion primaria|pedagogia|^educacion\b/, "stiintele-educatiei"],
  [/music/, "muzica"], [/^historia\b|arqueologia/, "istorie"], [/^filosofia\b/, "filosofie"], [/teologia|ciencias religiosas/, "teologie"],
  [/bellas artes|diseno|conservacion y restauracion|fotografia|ilustracion|artes visuales/, "arte-vizuale-design"], [/cine\b|artes escenicas|arte dramatico/, "teatru-film"],
];
// Fallback by the source's own field label, only where the label points to a single app domain.
const FIELD_RULES = [ // SIIU "Ámbito de estudio" and RUCT "Campo de estudio", lower-case ASCII
  [/^formacion de docentes|^otra formacion de personal docente|^ciencias de la educacion/, "stiintele-educatiei"], [/^economia$/, "economie-finante"], [/^administracion y gestion de empresas$/, "business-management"],
  [/^derecho/, "drept"], [/^trabajo social/, "sociologie-asistenta-sociala"], [/^deportes$|^actividad fisica y ciencias del deporte/, "sport-kinetoterapie"], [/^turismo y hosteleria$/, "turism-servicii"],
  [/^informatica$|^ingenieria informatica y de sistemas/, "informatica"], [/^agricultura, ganaderia y pesca$|^ciencias agrarias/, "agronomie-silvicultura"], [/^lenguas$|^filologia/, "litere-limbi-straine"],
  [/^psicologia$/, "psihologie"], [/^medicina$/, "medicina"], [/^enfermeria/, "asistenta-medicala"], [/^biologia y genetica|^bioquimica y biotecnologia/, "biologie"],
  [/^matematicas y estadistica/, "matematica"], [/^veterinaria/, "medicina-veterinara"], [/^periodismo e informacion$|^periodismo, comunicacion/, "comunicare-jurnalism"], [/^quimica$/, "chimie"], [/^fisica y astronomia/, "fizica"],
  [/^farmacia/, "farmacie"], [/^arquitectura, construccion/, null], [/^ingenieria electrica, ingenieria electronica/, "inginerie-electrica-electronica"],
];
const bare = (name) => ascii(name.replace(/^Graduad[oa] o Graduad[oa] en /i, "").replace(/^(Doble )?(Grado|Grau|Titulaci[oó]) (en )?/i, ""));
function one(name, field) {
  const b = bare(name);
  for (const [re, id] of NAME_RULES) if (re.test(b)) return id || null;
  const f = ascii(field);
  for (const [re, id] of FIELD_RULES) if (re.test(f)) return id;
  return null;
}
function domainFor(name, field) {
  if (!/^(PCEO|Doble)/i.test(name)) {
    const [first, second] = name.split(" / ");
    if (second && /^(Enginyeria|Grau|Grado)/i.test(second)) return null; // two degrees taken together
    return one(first, field); // "X / Bachelor in X" is one degree with a bilingual name
  }
  const parts = name.replace(/^PCEO /, "").split(/ \/ | - (?=Grado en )/);
  if (parts.length === 1) return null; // a double degree written as one name
  const ids = new Set(parts.map((p) => one(p, ""))); // each half by its own name; the field label describes only one of them
  return ids.size === 1 ? [...ids][0] : null;
}
const cleanName = (s) => tidy(s).replace(/\s+por\s+(la|el)\s+(Universi|Mondrag|IE\b|UNED\b|CUNEF|ESIC)[\s\S]*$/i, "").replace(/\b(en|de)\s+\1\b/gi, "$1");
const cityName = (s) => { const t = tidy(s); const m = t.match(/^(.*), (El|La|Los|Las|L'|Les|Els|O|A|Os|As|Es|Sa|Ses)$/); return m ? (m[2].endsWith("'") ? `${m[2]}${m[1]}` : `${m[2]} ${m[1]}`) : t; }; // "Rozas de Madrid, Las" -> "Las Rozas de Madrid"

// ---------- RUCT: universities and centres (CSV exports without a header row; columns identified against the Excel export and the centre pages) ----------
const unis = new Map(parseCsv(fs.readFileSync(path.join(raw, "ruct/universidades-all.csv"), "latin1")).map((u) => [u[22], {
  code: u[22], name: tidy(u[29]), kind: /^P.blica/.test(u[4]) ? "public" : /^Privada/.test(u[4]) ? "private" : "unknown", city: cityName(u[30]), modality: tidy(u[27]), web: tidy(u[33]),
}]));
const centres = new Map(parseCsv(fs.readFileSync(path.join(raw, "ruct/centros-all.csv"), "latin1")).map((c) => [c[56], { code: c[56], uni: c[40], name: tidy(c[34]), city: cityName(c[18]) }]));

const insts = new Map(); const progs = []; const keys = new Set(); const stats = { siiu: 0, ruct: 0, dropped: {}, urls: 0 };
const drop = (why) => { stats.dropped[why] = (stats.dropped[why] || 0) + 1; };
function inst(u) {
  const id = SHEETS[u.code] ?? `es-${slug(u.name)}`;
  if (!insts.has(id)) {
    const web = /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(u.web) ? `https://${u.web}` : /^https?:\/\/\S+\.\S+$/.test(u.web) ? u.web : "";
    insts.set(id, { id, country: "ES", source: SRC_INST, name: u.name, officialName: u.name, city: u.city, kind: u.kind, hasSheet: Object.values(SHEETS).includes(id), ...(web ? { website: web } : {}), programs: 0 });
  }
  return insts.get(id);
}
function add(u, c, titleCode, rawName, field, extra, source) {
  const i = inst(u); const name = cleanName(rawName); const domain = tidy(field);
  let key = `${i.id.startsWith("es-") ? i.id : `es-${i.id}`}--${slug(name).slice(0, 110)}--${titleCode}-${c.code}`;
  const base = key; // the source lists a few titles twice in one centre (separate groups, each with its own places): both are kept
  for (let n = 2; keys.has(key); n++) key = `${base}-x${n}`;
  keys.add(key);
  progs.push({
    key, country: "ES", institutionId: i.id, institutionName: i.name, city: c.city, ...(c.name && c.name !== i.name ? { faculty: c.name } : {}),
    domain, domainId: domainFor(name, domain), name, language: "spaniolă", ...extra, source,
    search: [name, domain, c.name, i.name, c.city, "spaniola"].map(ascii).join(" ").replace(/\s+/g, " ").trim().slice(0, 600).trim(),
    _t: titleCode, _c: c.code,
  });
  i.programs++;
}

// ---------- 1. public in-person universities: SIIU, sheet "Preinscripción Ámbito", latest year ----------
const sheet = xlsxSheet(path.join(raw, "preinsc.xlsx"), "Preinscripción Ámbito");
const hi = sheet.findIndex((r) => r.filter(Boolean).length > 8); const head = sheet[hi].map(tidy);
const col = (re) => { const i = head.findIndex((h) => re.test(h)); if (i < 0) throw new Error(`SIIU column ${re} not found`); return i; };
const C = { year: col(/^Curso/), field: col(/mbito de estudio/), centre: col(/^C.digo de la unidad/), unit: col(/^Unidad$/), code: col(/^C.digo de la titulaci/), name: col(/^Titulaci.n$/), places: col(/Plazas ofertadas/) };
const siiuUnis = new Set();
for (const r of sheet.slice(hi + 1)) {
  if (r[C.year] !== YEAR) continue;
  const name = tidy(r[C.name]); const c = centres.get(tidy(r[C.centre]));
  if (!c) { drop("SIIU centre not in RUCT"); continue; }
  // common-entry groupings of several degrees ("agrupació") and open first years ("Grado Abierto", "Grau obert") are admission routes, not degrees
  if (/\(agr|Grado Abierto|Grau obert|\bPARS\b/i.test(name) || name.split(" / ").length >= 3) { drop("admission grouping, not a degree"); continue; }
  const u = unis.get(c.uni); siiuUnis.add(u.code);
  const places = /^\d+$/.test(tidy(r[C.places])) ? { maxStudents: +r[C.places] } : {};
  const before = progs.length;
  add(u, c, tidy(r[C.code]), name, r[C.field], { form: "full-time", ...places }, SRC_SIIU);
  if (progs.length > before) stats.siiu++;
}

// ---------- 2. universities SIIU does not cover (private ones and UNED): RUCT titles per centre ----------
for (const u of unis.values()) {
  const xls = path.join(raw, `ruct/titulos-${u.code}.xls`);
  if (siiuUnis.has(u.code) || !fs.existsSync(xls)) continue;
  const rows = xlsRows(xls); const h = rows[0].map(tidy);
  const ix = (re) => h.findIndex((x) => re.test(x));
  const T = { code: ix(/^C.digo$/), name: ix(/^T.tulo$/), level: ix(/^Nivel/), rama: ix(/^Rama$/), campo: ix(/^Campo/), det: ix(/^Detalle$/) };
  if (T.code < 0 || T.name < 0 || T.campo < 0) throw new Error(`unexpected columns in ${xls}: ${h.join(" | ")}`);
  const titles = new Map(rows.slice(1).map((r) => [tidy(r[T.code]), { name: tidy(r[T.name]), field: tidy(r[T.campo]) || tidy(r[T.rama]), level: tidy(r[T.level]) }]));
  for (const c of centres.values()) {
    const page = path.join(raw, `ruct/centro-${u.code}-${c.code}.html`);
    if (c.uni !== u.code || !fs.existsSync(page)) continue;
    // rows as [code, title, level, state]: from the Excel export when the list is longer than one page, otherwise from the page itself
    const full = page.replace(/\.html$/, ".xls");
    const list = fs.existsSync(full)
      ? xlsRows(full).slice(1).map((r) => [tidy(r[0]), tidy(r[1]), tidy(r[2]), tidy(`${r[3]} ${r[4] ?? ""}`)])
      : [...fs.readFileSync(page, "latin1").matchAll(/<tr class="[^"]*">([\s\S]*?)<\/tr>/g)].map((m) => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => tidy(htmlText(x[1]))));
    for (const td of list) {
      if (td.length < 4 || !/^\d{7}$/.test(td[0])) continue;
      if (!/^Grado\b/.test(td[2])) continue;                       // Grado only (no Máster, Doctor, old "Ciclo" titles)
      if (/EXTINGUI/i.test(td[3])) { drop("RUCT title extinguished or being phased out"); continue; }
      const t = titles.get(td[0]);
      if (!t || !t.field) { drop("RUCT centre title missing from the university's title list"); continue; }
      const detail = (td[3].match(/\(([^)]*)\)/) || [])[1];
      const status = detail ? detail.charAt(0) + detail.slice(1).toLowerCase() : td[3];
      const before = progs.length;
      add(u, c, td[0], td[1], t.field, { ...(u.modality === "No Presencial" ? { form: "distance" } : {}), ...(status.length <= 60 ? { status } : {}) }, SRC_RUCT);
      if (progs.length > before) stats.ruct++;
    }
  }
}

// ---------- 3. optional: programme web links from the Valencian regional open file, matched by official title code + centre code ----------
const gva = path.join(raw, "gva.csv");
if (fs.existsSync(gva)) {
  const rows = parseCsv(fs.readFileSync(gva, "utf8")); const h = rows.shift(); const g = (r, k) => tidy(r[h.indexOf(k)]);
  const urls = new Map();
  for (const r of rows) { const url = g(r, "url_grado"); if (/^https?:\/\/[^\s]+\.[^\s]+$/.test(url) && !urls.has(`${g(r, "grado")}|${g(r, "centro")}`)) urls.set(`${g(r, "grado")}|${g(r, "centro")}`, url); }
  for (const p of progs) { const url = urls.get(`${p._t}|${p._c}`); if (url) { p.url = url; stats.urls++; } }
}

// ---------- write ----------
const ORDER = ["key", "country", "institutionId", "institutionName", "city", "faculty", "domain", "domainId", "name", "language", "form", "credits", "years", "maxStudents", "status", "url", "source", "search"];
const finalProgs = progs.map((p) => Object.fromEntries(ORDER.filter((k) => p[k] !== undefined).map((k) => [k, p[k]])));
const finalInsts = [...insts.values()].filter((i) => i.programs > 0).sort((a, b) => a.name.localeCompare(b.name, "es"));
for (const f of ["es-programs.json", "es-programs.jsonl.gz"]) fs.rmSync(path.join(out, f), { force: true });
fs.writeFileSync(path.join(out, "es-institutions.json"), JSON.stringify(finalInsts, null, 1));
const json = JSON.stringify(finalProgs, null, 1);
if (Buffer.byteLength(json) > 4.5 * 1024 * 1024) fs.writeFileSync(path.join(out, "es-programs.jsonl.gz"), zlib.gzipSync(finalProgs.map((p) => JSON.stringify(p)).join("\n") + "\n", { level: 9 }));
else fs.writeFileSync(path.join(out, "es-programs.json"), json);

const kinds = finalInsts.reduce((m, i) => ((m[i.kind] = (m[i.kind] || 0) + 1), m), {});
console.log(`institutions ${finalInsts.length} (${JSON.stringify(kinds)}), programmes ${finalProgs.length}: SIIU ${stats.siiu}, RUCT ${stats.ruct}; web links added ${stats.urls}`);
console.log(`cities ${new Set(finalProgs.map((p) => p.city)).size}; without app domain ${finalProgs.filter((p) => p.domainId === null).length}; size ${(Buffer.byteLength(json) / 1048576).toFixed(2)} MB`);
console.log("dropped:", JSON.stringify(stats.dropped));
