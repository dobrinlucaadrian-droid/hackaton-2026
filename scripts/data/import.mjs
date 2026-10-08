// Loads every country's catalogue into Convex: node scripts/data/import.mjs [--prod]
// Replaces the whole "institutions" and "programs" tables with what is in apps/web/data/catalog/ (after validating each country).
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { countriesOnDisk, readCatalog } from "./index.mjs";

const prod = process.argv.includes("--prod");
const web = fileURLToPath(new URL("../../apps/web/", import.meta.url));
const here = fileURLToPath(new URL("./", import.meta.url));
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", shell: true });

const institutions = [], programs = [];
for (const cc of countriesOnDisk()) {
  const check = run("node", [`"${join(here, "validate.mjs")}"`, cc], here);
  if (check.status !== 0) { console.error(`${cc}: not valid, nothing was imported\n${check.stdout}${check.stderr}`); process.exit(1); }
  const i = readCatalog(cc, "institutions"), p = readCatalog(cc, "programs");
  institutions.push(...i); programs.push(...p);
  console.log(`${cc.toUpperCase()}: ${i.length} institutions, ${p.length} programmes`);
}
// domainId null is stored as "no domain": leave the field out so the index only holds real domains
const clean = (p) => { const { domainId, ...rest } = p; return domainId ? { ...rest, domainId } : rest; };
const tmp = mkdtempSync(join(tmpdir(), "unipath-catalog-"));
try {
  const fi = join(tmp, "institutions.jsonl"), fp = join(tmp, "programs.jsonl");
  writeFileSync(fi, institutions.map((x) => JSON.stringify(x)).join("\n") + "\n");
  writeFileSync(fp, programs.map((x) => JSON.stringify(clean(x))).join("\n") + "\n");
  for (const [table, file] of [["institutions", fi], ["programs", fp]]) {
    const r = run("npx", ["convex", "import", "--table", table, `"${file}"`, "--replace", "-y", ...(prod ? ["--prod"] : [])], web);
    const out = (r.stdout + r.stderr).split("\n").filter((l) => /Added|✖|rror/.test(l)).join("\n");
    console.log(out || `(no summary line from convex import for ${table})`);
    if (r.status !== 0) process.exit(1);
  }
  console.log(`imported ${institutions.length} institutions and ${programs.length} programmes into the ${prod ? "PRODUCTION" : "development"} database`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
