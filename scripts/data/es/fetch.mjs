// Downloads the raw files for the Spain catalogue from the national register RUCT (one request at a time, 1.2 s apart, cached on disk).
// Usage: node scripts/data/es/fetch.mjs <raw-folder>   (files land in <raw-folder>/ruct; a file that already exists is not fetched again)
// The SIIU file (preinsc.xlsx) and the Valencian file (gva.csv) are downloaded by hand, see README.md.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const raw = process.argv[2];
if (!raw) { console.error("usage: node scripts/data/es/fetch.mjs <raw-folder>"); process.exit(1); }
const dir = path.join(raw, "ruct");
fs.mkdirSync(dir, { recursive: true });
const BASE = "https://www.educacion.gob.es/ruct";
const UA = "UniPath-catalogue/1.0 (student project; one-off polite fetch of the public register)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(file, url) {
  const to = path.join(dir, file);
  if (fs.existsSync(to) && fs.statSync(to).size > 0) return false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // curl, not Node's fetch: the server does not send its intermediate certificate, which Node cannot complete and curl (system store) can
      execFileSync("curl", ["-sS", "--fail", "-m", "120", "-A", UA, "-o", to + ".part", url], { stdio: ["ignore", "ignore", "pipe"] });
      fs.renameSync(to + ".part", to);
      await sleep(1200);
      return true;
    } catch (e) {
      console.error(`  ${file}: ${e.message} (attempt ${attempt})`);
      await sleep(5000 * attempt);
    }
  }
  throw new Error(`could not fetch ${url}`);
}
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

// 1. The register's own "export" of the full lists of universities and centres (CSV, ISO-8859-1, no header row).
await get("universidades-all.csv", `${BASE}/listauniversidades.action?actual=universidades&tipo_univ=&cccaa=&d-8320336-e=1&6578706f7274=1&codigoUniversidad=&consulta=1`);
await get("centros-all.csv", `${BASE}/listacentros.action?actual=centros&d-443487-e=1&6578706f7274=1&codigoUniversidad=&codigoCentro=&provincia=&consulta=1&codigoNaturaleza=`);
const unis = parseCsv(fs.readFileSync(path.join(dir, "universidades-all.csv"), "latin1"));     // col 4 type, 22 code, 29 name
const centres = parseCsv(fs.readFileSync(path.join(dir, "centros-all.csv"), "latin1"));        // col 8 centre type, 40 university code, 56 centre code

// 2. Universities that the SIIU file does not cover: the private ones and UNED (public, distance).
//    Codes 000, 086, 09x, 10x-foreign are not universities (other centres, defence centres, foreign centres, arts schools).
const wanted = unis.filter((u) => (/^Privada/.test(u[4]) || u[22] === "028") && !/^(000|086|09[1-9]|10[15])$/.test(u[22])).map((u) => u[22]);
const NOT_TEACHING = /Investigaci|Doctorado|Departamento|Hospital|Intergubern/;
let n = 0;
for (const code of wanted) {
  // the Grado titles of the university, exported by the register as Excel (the only export with "Rama" and "Campo de estudio")
  if (await get(`titulos-${code}.xls`, `${BASE}/listaestudios.action?codigoRama=&actual=estudios&d-1335801-e=2&codigoEstado=&buscarHistorico=N&codigoTipo=G&descripcionEstudio=&codigoSubTipo=&codigoEstudio=&situacion=&ambito=&6578706f7274=1&codigoUniversidad=${code}&consulta=1`)) n++;
  // the titles taught in each of its teaching centres (HTML page of the centre)
  for (const c of centres.filter((x) => x[40] === code && !NOT_TEACHING.test(x[8]))) {
    if (await get(`centro-${code}-${c[56]}.html`, `${BASE}/listaestudioscentro.action?codigoUniversidad=${code}&codigoCentro=${c[56]}&actual=centros`)) n++;
    // the page shows 25 titles at most; for longer lists take the register's Excel export of the same list, which has them all
    if (/mostrando del \d+ al \d+/.test(fs.readFileSync(path.join(dir, `centro-${code}-${c[56]}.html`), "latin1"))
      && await get(`centro-${code}-${c[56]}.xls`, `${BASE}/listaestudioscentro.action?actual=centros&d-1335801-e=2&6578706f7274=1&codigoUniversidad=${code}&codigoCentro=${c[56]}`)) n++;
  }
  console.log(`university ${code} done`);
}
console.log(`fetched ${n} new files into ${dir}`);
