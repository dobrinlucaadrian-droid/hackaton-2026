// Calls every public Convex query of the app WITHOUT signing in, on the DEV deployment only, and reports which ones answer with data (field names and counts, never values); mutations and actions are listed but never called.
//
// Usage: node scripts/convex-probe.mjs            (uses NEXT_PUBLIC_CONVEX_URL from apps/web/.env.local)
//        node scripts/convex-probe.mjs --url https://<dev-name>.convex.cloud
// Exit code 1 when a query meant for signed-in users or administrators returns data anonymously.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONVEX_DIR = join(ROOT, "apps/web/convex");
const PRODUCTION_NAMES = ["impartial-heron-254"]; // never probe production

// Harmless read-only arguments for queries that reject empty args, so the call reaches the access check.
const SAMPLE_ARGS = {
  "reviews:listByState": { state: "pending" },
  "analytics:overview": { days: 7 },
  "catalog:programsOf": { institutionId: "probe-none" },
  "catalog:programsFor": { domainId: "probe-none", country: "ro" },
  "catalog:searchPrograms": { q: "zz-probe-none" },
  "catalog:institutions": { country: "ro" },
};

// Exports that come from libraries (Convex Auth) instead of `export const x = query(...)`.
const LIBRARY_EXPORTS = { "auth:isAuthenticated": "query", "auth:signIn": "action", "auth:signOut": "action", "auth:store": "internalMutation" };

function devUrl() {
  const i = process.argv.indexOf("--url");
  if (i > 0 && process.argv[i + 1]) return process.argv[i + 1];
  const envFile = join(ROOT, "apps/web/.env.local");
  if (!existsSync(envFile)) throw new Error("apps/web/.env.local is missing; pass --url https://<dev-name>.convex.cloud");
  const line = readFileSync(envFile, "utf8").split(/\r?\n/).find((l) => l.startsWith("NEXT_PUBLIC_CONVEX_URL="));
  if (!line) throw new Error("NEXT_PUBLIC_CONVEX_URL not found in apps/web/.env.local");
  return line.split("=")[1].split("#")[0].trim();
}

/** Every exported Convex function: "module:name" -> kind (query, userQuery, adminMutation, internalQuery, ...). */
function discover() {
  const found = { ...LIBRARY_EXPORTS };
  for (const file of readdirSync(CONVEX_DIR)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts") || file.endsWith(".d.ts") || file.endsWith(".config.ts")) continue;
    const src = readFileSync(join(CONVEX_DIR, file), "utf8");
    const re = /export\s+const\s+([A-Za-z0-9_$]+)\s*=\s*([A-Za-z]+)\s*\(/g;
    let m;
    while ((m = re.exec(src))) {
      if (/^(internal)?(query|mutation|action)$|^(user|admin)(Query|Mutation)$|^httpAction$/i.test(m[2])) {
        found[`${file.replace(/\.ts$/, "")}:${m[1]}`] = m[2];
      }
    }
  }
  return found;
}

async function callQuery(base, path, args) {
  const r = await fetch(`${base}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args, format: "json" }),
  });
  const body = await r.json().catch(() => ({ status: "error", errorMessage: `http ${r.status}` }));
  return body;
}

/** Shape of a value without its contents: counts and field names only. */
function shape(value) {
  if (value === null || value === undefined) return { hasData: false, text: String(value) };
  if (Array.isArray(value)) {
    const keys = value[0] && typeof value[0] === "object" ? Object.keys(value[0]).join(", ") : typeof value[0];
    return { hasData: value.length > 0, text: value.length ? `${value.length} rows; fields: ${keys}` : "empty list" };
  }
  if (typeof value === "object") return { hasData: Object.keys(value).length > 0, text: `object; fields: ${Object.keys(value).join(", ") || "(none)"}` };
  return { hasData: value !== false && value !== "" && value !== 0, text: `${typeof value}: ${typeof value === "boolean" ? value : "(value hidden)"}` };
}

const base = devUrl().replace(/\/+$/, "");
const host = new URL(base).host;
if (PRODUCTION_NAMES.some((n) => host.includes(n))) {
  console.error(`Refusing: ${host} is the PRODUCTION deployment. This probe runs only on the dev deployment.`);
  process.exit(2);
}
if (!host.endsWith(".convex.cloud")) {
  console.error(`Refusing: ${host} is not a Convex deployment address (*.convex.cloud).`);
  process.exit(2);
}

console.log(`Convex probe (anonymous, read-only) on ${host}\n`);
const functions = discover();
let problems = 0;
for (const [path, kind] of Object.entries(functions).sort()) {
  if (/^internal|^httpAction$/i.test(kind)) continue; // not reachable from outside
  if (!/query$/i.test(kind)) {
    console.log(`  skip   ${path.padEnd(28)} ${kind} (writes or has side effects: never called)`);
    continue;
  }
  let res = await callQuery(base, path, {});
  let usedArgs = "{}";
  if (res.status === "error" && /validator|ArgumentValidationError|missing the required field/i.test(res.errorMessage ?? "") && SAMPLE_ARGS[path]) {
    usedArgs = JSON.stringify(SAMPLE_ARGS[path]);
    res = await callQuery(base, path, SAMPLE_ARGS[path]);
  }
  const protectedKind = /^(user|admin)Query$/.test(kind);
  if (res.status === "success") {
    const s = shape(res.value);
    const flag = s.hasData ? (protectedKind ? "LEAK " : "DATA ") : "empty";
    if (s.hasData && protectedKind) problems++;
    console.log(`  ${flag}  ${path.padEnd(28)} ${kind} args=${usedArgs} -> ${s.text}`);
  } else {
    const msg = (res.errorData ? JSON.stringify(res.errorData) : res.errorMessage ?? "").replace(/\s+/g, " ").slice(0, 90);
    console.log(`  denied ${path.padEnd(28)} ${kind} args=${usedArgs} -> ${msg}`);
  }
}
console.log(problems ? `\n${problems} protected function(s) answered without sign-in: check them.` : "\nNo function meant for signed-in users or administrators answered with data.");
console.log('"DATA" rows are public by design only if the data is meant to be public (approved reviews, catalogue); read the list.');
process.exit(problems ? 1 : 0);
