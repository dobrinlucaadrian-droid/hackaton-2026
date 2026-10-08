// Builds apps/web/data/catalog/index.json: one small summary per country (counts, cities, sheet ids, programmes per app domain, source)
// from the catalogue files and scripts/data/sources.json. The pages read this summary instead of counting rows in the database.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const dir = new URL("../../apps/web/data/catalog/", import.meta.url);
const sources = JSON.parse(readFileSync(new URL("./sources.json", import.meta.url), "utf8"));
export function readCatalog(cc, name) {
  const json = new URL(`${cc}-${name}.json`, dir), gz = new URL(`${cc}-${name}.jsonl.gz`, dir);
  if (existsSync(json)) return JSON.parse(readFileSync(json, "utf8"));
  if (existsSync(gz)) return gunzipSync(readFileSync(gz)).toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  return null;
}
/** Countries that have catalogue files AND an entry in sources.json. A country is used only after its source and licence were written down there. */
export function countriesOnDisk() {
  const found = [...new Set(readdirSync(dir).map((f) => f.match(/^([a-z]{2})-programs\.(json|jsonl\.gz)$/)?.[1]).filter(Boolean))].sort();
  for (const cc of found) if (!sources[cc]) console.warn(`skipped "${cc}": files exist but scripts/data/sources.json has no entry for it yet`);
  return found.filter((cc) => sources[cc]);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const out = [];
  for (const cc of countriesOnDisk()) {
    const insts = readCatalog(cc, "institutions"), progs = readCatalog(cc, "programs");
    const meta = sources[cc];
    if (!insts || !progs) continue;
    if (!meta) { console.error(`no entry for "${cc}" in scripts/data/sources.json — add the source, licence and attribution first`); process.exit(1); }
    const cityCount = new Map(), domains = {};
    for (const p of progs) { cityCount.set(p.city, (cityCount.get(p.city) || 0) + 1); if (p.domainId) domains[p.domainId] = (domains[p.domainId] || 0) + 1; }
    out.push({
      cc: cc.toUpperCase(),
      name: meta.country,
      institutions: insts.length,
      programs: progs.length,
      withDomain: progs.filter((p) => p.domainId).length,
      cities: [...cityCount].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 120).map(([c]) => c),
      sheetIds: insts.filter((i) => i.hasSheet).map((i) => i.id),
      domains,
      source: { name: meta.sourceName, url: meta.url, licence: meta.licence, attribution: meta.attribution, year: meta.year, note: meta.note ?? "" },
    });
  }
  // Romania first, then by number of programmes
  out.sort((a, b) => (a.cc === "RO" ? -1 : b.cc === "RO" ? 1 : b.programs - a.programs));
  writeFileSync(new URL("index.json", dir), JSON.stringify(out, null, 1) + "\n");
  console.log(out.map((c) => `${c.cc} ${c.name}: ${c.institutions} institutions, ${c.programs} programmes (${c.withDomain} with a domain), ${c.sheetIds.length} sheets`).join("\n"));
  console.log(`total: ${out.reduce((s, c) => s + c.institutions, 0)} institutions, ${out.reduce((s, c) => s + c.programs, 0)} programmes in ${out.length} countries`);
}
