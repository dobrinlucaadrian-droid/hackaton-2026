// Checks a country's catalogue files against the shared contract (see CONTRACT.md): node scripts/data/validate.mjs <cc>
// Reads apps/web/data/catalog/<cc>-institutions.json and <cc>-programs.json (or .jsonl.gz for very large sets). Exits 1 on any error.
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { DOMAIN_IDS } from "./isced.mjs";

const cc = (process.argv[2] || "").toLowerCase();
if (!/^[a-z]{2}$/.test(cc)) { console.error("usage: node scripts/data/validate.mjs <two-letter country code>"); process.exit(1); }
const dir = new URL(`../../apps/web/data/catalog/`, import.meta.url);
const read = (name) => {
  const json = new URL(`${cc}-${name}.json`, dir), gz = new URL(`${cc}-${name}.jsonl.gz`, dir);
  if (existsSync(json)) return JSON.parse(readFileSync(json, "utf8"));
  if (existsSync(gz)) return gunzipSync(readFileSync(gz)).toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  console.error(`missing ${cc}-${name}.json (or .jsonl.gz) in apps/web/data/catalog/`); process.exit(1);
};
const insts = read("institutions"), progs = read("programs");
const CC = cc.toUpperCase();
const errors = [];
const err = (m) => { if (errors.length < 40) errors.push(m); else if (errors.length === 40) errors.push("… more errors not shown"); };
const isStr = (v, min = 1, max = 400) => typeof v === "string" && v.trim().length >= min && v.length <= max && v === v.trim() && !/\s{2}/.test(v);
const optional = (v, test) => v === undefined || test(v);
const domainIds = new Set(DOMAIN_IDS);
const INST_KEYS = new Set(["id", "country", "source", "name", "officialName", "city", "kind", "hasSheet", "website", "programs"]);
const PROG_KEYS = new Set(["key", "country", "institutionId", "institutionName", "city", "faculty", "domain", "domainId", "name", "language", "form", "credits", "years", "maxStudents", "status", "url", "source", "search"]);

const instIds = new Set();
for (const i of insts) {
  const at = `institution ${i?.id}`;
  for (const k of Object.keys(i)) if (!INST_KEYS.has(k)) err(`${at}: unexpected field "${k}"`);
  if (!isStr(i.id, 2, 80) || !/^[a-z0-9-]+$/.test(i.id)) err(`${at}: id must be lower-case letters, digits and dashes`);
  if (instIds.has(i.id)) err(`${at}: duplicate id`);
  instIds.add(i.id);
  if (i.country !== CC) err(`${at}: country must be "${CC}"`);
  if (!isStr(i.source, 3, 200)) err(`${at}: source missing`);
  if (!isStr(i.name, 2, 200)) err(`${at}: name missing or untidy`);
  if (!isStr(i.officialName, 2, 300)) err(`${at}: officialName missing or untidy`);
  if (!isStr(i.city, 1, 80)) err(`${at}: city missing`);
  if (!["public", "private", "unknown"].includes(i.kind)) err(`${at}: kind must be public | private | unknown`);
  if (typeof i.hasSheet !== "boolean") err(`${at}: hasSheet must be true or false`);
  if (!optional(i.website, (v) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(v))) err(`${at}: website must be a web link`);
  if (!Number.isInteger(i.programs) || i.programs < 1) err(`${at}: programs must be a positive count`);
}

const keys = new Set(); const perInst = new Map(); let unmapped = 0;
for (const p of progs) {
  const at = `programme ${p?.key}`;
  for (const k of Object.keys(p)) if (!PROG_KEYS.has(k)) err(`${at}: unexpected field "${k}"`);
  if (!isStr(p.key, 3, 200) || !/^[a-z0-9-]+$/.test(p.key) || !p.key.startsWith(`${cc}-`)) err(`${at}: key must start with "${cc}-" and use lower-case letters, digits and dashes`);
  if (keys.has(p.key)) err(`${at}: duplicate key`);
  keys.add(p.key);
  if (p.country !== CC) err(`${at}: country must be "${CC}"`);
  if (!instIds.has(p.institutionId)) err(`${at}: institutionId "${p.institutionId}" is not in the institutions file`);
  if (!isStr(p.institutionName, 2, 200)) err(`${at}: institutionName missing`);
  if (!isStr(p.city, 1, 80)) err(`${at}: city missing`);
  if (!optional(p.faculty, (v) => isStr(v, 2, 300))) err(`${at}: faculty untidy`);
  if (!isStr(p.domain, 2, 300)) err(`${at}: domain (official field of study label) missing`);
  if (p.domainId !== null && !domainIds.has(p.domainId)) err(`${at}: domainId "${p.domainId}" is not one of the 40 app domains (use null when unsure)`);
  if (p.domainId === null) unmapped++;
  if (!isStr(p.name, 2, 400)) err(`${at}: name missing or untidy`);
  if (!isStr(p.language, 3, 60) || p.language !== p.language.toLowerCase()) err(`${at}: language must be a Romanian lower-case name such as "engleză"`);
  if (!optional(p.form, (v) => ["full-time", "part-time", "distance", "dual"].includes(v))) err(`${at}: form must be full-time | part-time | distance | dual`);
  if (!optional(p.credits, (v) => Number.isInteger(v) && v >= 60 && v <= 480)) err(`${at}: credits out of range`);
  if (!optional(p.years, (v) => typeof v === "number" && v >= 1 && v <= 8)) err(`${at}: years out of range`);
  if (!optional(p.maxStudents, (v) => Number.isInteger(v) && v >= 0)) err(`${at}: maxStudents must be a whole number`);
  if (!optional(p.status, (v) => isStr(v, 1, 60))) err(`${at}: status untidy`);
  if (!optional(p.url, (v) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(v))) err(`${at}: url must be a web link`);
  if (!isStr(p.source, 3, 200)) err(`${at}: source missing`);
  if (typeof p.search !== "string" || !/^[a-z0-9 ]+$/.test(p.search) || p.search.length > 600) err(`${at}: search must be lower-case ASCII letters, digits and spaces (max 600)`);
  perInst.set(p.institutionId, (perInst.get(p.institutionId) || 0) + 1);
}
for (const i of insts) if ((perInst.get(i.id) || 0) !== i.programs) err(`institution ${i.id}: programs says ${i.programs} but the programmes file has ${perInst.get(i.id) || 0}`);

const count = (f) => Object.entries(progs.reduce((m, r) => ((m[r[f] ?? "(none)"] = (m[r[f] ?? "(none)"] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
console.log(`${CC}: ${insts.length} institutions, ${progs.length} programmes, ${new Set(progs.map((p) => p.city)).size} cities`);
console.log(`with a sheet in the app: ${insts.filter((i) => i.hasSheet).length} | programmes without an app domain: ${unmapped} (${progs.length ? Math.round((100 * unmapped) / progs.length) : 0}%)`);
console.log("languages:", count("language").slice(0, 8).map(([k, v]) => `${k} ${v}`).join(", "));
console.log("app domains:", count("domainId").slice(0, 12).map(([k, v]) => `${k} ${v}`).join(", "));
console.log("sources:", count("source").map(([k, v]) => `${k} ${v}`).join(", "));
if (errors.length) { console.error(`\nINVALID — ${errors.length} problem(s):\n` + errors.join("\n")); process.exit(1); }
console.log("VALID");
