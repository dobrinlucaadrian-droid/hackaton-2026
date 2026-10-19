// Makes an encrypted backup of the Convex database (all tables and uploaded files) in a folder OUTSIDE the project, so personal data never goes to GitHub.
//
// Usage (from the repo root):
//   node scripts/backup.mjs              backup of the development database
//   node scripts/backup.mjs --prod       backup of the production database
//   node scripts/backup.mjs --decrypt <file.enc>   turns a backup back into the .zip that `npx convex import` reads
// The password comes from the BACKUP_PASSWORD environment variable or is typed when asked; it is never stored. Without it the backup cannot be opened.
// Backups go to ~/FindMyUni-backups (change with BACKUP_DIR).
import { spawnSync } from "node:child_process";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const MAGIC = Buffer.from("FMUBAK1"); // file format: MAGIC | salt(16) | iv(12) | tag(16) | encrypted zip
const args = process.argv.slice(2);
const dir = resolve(process.env.BACKUP_DIR ?? join(homedir(), "FindMyUni-backups"));
const repo = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
if (dir.startsWith(repo)) {
  console.error("The backup folder must be outside the project, so it can never be committed.");
  process.exit(1);
}

async function password() {
  if (process.env.BACKUP_PASSWORD) return process.env.BACKUP_PASSWORD;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const p = await rl.question("Parola pentru copia de rezervă (cel puțin 12 caractere; păstrează-o, fără ea copia nu se poate deschide): ");
  rl.close();
  return p;
}

const key = (pass, salt) => scryptSync(pass, salt, 32, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

if (args[0] === "--decrypt") {
  const file = resolve(args[1] ?? "");
  const data = readFileSync(file);
  if (!data.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error("Not a FindMyUni backup file.");
  let at = MAGIC.length;
  const salt = data.subarray(at, (at += 16)), iv = data.subarray(at, (at += 12)), tag = data.subarray(at, (at += 16));
  const d = createDecipheriv("aes-256-gcm", key(await password(), salt), iv);
  d.setAuthTag(tag);
  const zip = Buffer.concat([d.update(data.subarray(at)), d.final()]);
  const out = file.replace(/\.enc$/, "");
  writeFileSync(out, zip);
  console.log(`decrypted: ${out} (restore with: npx convex import --replace ${basename(out)} — only after reading the Convex docs)`);
  process.exit(0);
}

const prod = args.includes("--prod");
const pass = await password();
if (pass.length < 12) {
  console.error("The password must have at least 12 characters.");
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const zip = join(dir, `findmyuni-${prod ? "prod" : "dev"}-${stamp}.zip`);
const run = spawnSync("npx", ["convex", "export", "--include-file-storage", "--path", zip, ...(prod ? ["--prod"] : [])], {
  cwd: join(repo, "apps", "web"),
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (run.status !== 0) process.exit(run.status ?? 1);

const salt = randomBytes(16), iv = randomBytes(12);
const c = createCipheriv("aes-256-gcm", key(pass, salt), iv);
const body = Buffer.concat([c.update(readFileSync(zip)), c.final()]);
writeFileSync(`${zip}.enc`, Buffer.concat([MAGIC, salt, iv, c.getAuthTag(), body]));
rmSync(zip); // only the encrypted copy stays on disk
console.log(`backup: ${zip}.enc`);
