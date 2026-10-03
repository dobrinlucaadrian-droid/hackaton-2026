#!/usr/bin/env node
// Quality gate. Runs the mechanical checks and prints TRECUT / PICAT / NEVERIFICAT.
//
//   node scripts/gate.mjs              full gate (after each feature)
//   node scripts/gate.mjs --commit     fast gate on staged files (git pre-commit hook)
//   node scripts/gate.mjs --stop-hook  Claude Code Stop hook: asks for a gate run
//                                      when code changed since the last passed gate
//
// Exit code 1 when any check is PICAT. Output is ASCII on purpose (Windows consoles).

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

const STATE_FILE = '.claude/.gate-state.json';
const CONFIG_FILE = 'gate.config.json';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const mode = process.argv.includes('--stop-hook') ? 'stop' : process.argv.includes('--commit') ? 'commit' : 'full';

const git = (args) => spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout || '';
const gitList = (args) => git([...args, '-z']).split('\0').filter(Boolean);

// Files that count as "code": a change in them means the gate must run again.
function isCode(p) {
  if (/^(docs|\.claude|\.githooks)\//.test(p)) return false;
  if (/\.md$/i.test(p) || p.endsWith('.gitkeep')) return false;
  return !['.gitignore', '.gitattributes', '.env.example', 'scripts/gate.mjs', 'scripts/map.mjs', CONFIG_FILE].includes(p);
}

function fingerprint() {
  const files = gitList(['ls-files', '-c', '-o', '--exclude-standard']).filter(isCode).sort();
  const parts = [];
  for (const f of files) {
    try {
      const s = fs.statSync(f);
      parts.push(`${f}:${s.size}:${Math.round(s.mtimeMs)}`);
    } catch { /* deleted but still in the index */ }
  }
  return parts.length ? createHash('sha1').update(parts.join('\n')).digest('hex') : null;
}

function readJson(file, fallback) {
  try { return parseJson(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

// Files written on Windows often start with a BOM, which JSON.parse rejects.
function parseJson(text) {
  return JSON.parse(text.replace(/^﻿/, ''));
}

async function readStdin() {
  let text = '';
  for await (const chunk of process.stdin) text += chunk;
  return text;
}

// ---------------------------------------------------------------- stop hook
if (mode === 'stop') {
  let input = {};
  try { input = parseJson(await readStdin()); } catch { /* no or invalid stdin */ }
  // stop_hook_active: Claude is already continuing because of this hook. Never block twice.
  // Only uncommitted code needs a gate run: committed code already passed the pre-commit gate.
  const dirty = [...gitList(['diff', 'HEAD', '--name-only']), ...gitList(['ls-files', '-o', '--exclude-standard'])].some(isCode);
  const fp = input.stop_hook_active || !dirty ? null : fingerprint();
  if (fp && readJson(STATE_FILE, {}).fingerprint !== fp) {
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason:
        'Quality gate: code changed since the last passed gate. Before finishing, follow the `gate` skill: ' +
        'run `node scripts/gate.mjs`, walk the changed feature and the main demo flow, and show the team the ' +
        'TRECUT / PICAT / NEVERIFICAT table in Romanian. Fix what is PICAT, or say clearly what is still broken. ' +
        'Then still give the team the answer they asked for — the gate table is an addition, not a replacement.',
    }));
  }
  process.exit(0);
}

// ------------------------------------------------------------------- checks
const results = [];
const add = (status, name, detail = '') => results.push({ status, name, detail });

const SECRET_PATTERNS = [
  ['AWS key', /AKIA[0-9A-Z]{16}/],
  ['API key (sk-)', /\bsk-[A-Za-z0-9_-]{20,}/],
  ['GitHub token', /\b(ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{20,}/],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['hardcoded secret', /(api[_-]?key|secret|token|passw(or)?d)["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i],
];
const SECRET_SKIP = (f) => f === '.env.example' || f === 'scripts/gate.mjs' || /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(f);

function checkSecrets() {
  const hits = new Set();
  const scan = (file, line) => {
    if (SECRET_SKIP(file) || line.includes('gate:allow')) return;
    for (const [label, re] of SECRET_PATTERNS) if (re.test(line)) hits.add(`${file} (${label})`);
  };
  const diff = mode === 'commit' ? git(['diff', '--cached', '-U0', '--no-color']) : git(['diff', 'HEAD', '-U0', '--no-color']);
  let file = '';
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) file = line.slice(4).replace(/^b\//, '');
    else if (line.startsWith('+')) scan(file, line.slice(1));
  }
  if (mode === 'full') {
    for (const f of gitList(['ls-files', '-o', '--exclude-standard'])) {
      try {
        if (fs.statSync(f).size > 300 * 1024) continue;
        for (const line of fs.readFileSync(f, 'utf8').split('\n')) scan(f, line);
      } catch { /* unreadable or binary */ }
    }
  }
  if (hits.size) add('PICAT', 'Parole / chei in cod', [...hits].slice(0, 5).join('; ') + ' -> muta valoarea in .env');
  else add('TRECUT', 'Parole / chei in cod', 'nimic gasit');
}

function checkFiles() {
  const files = mode === 'commit'
    ? gitList(['diff', '--cached', '--name-only', '--diff-filter=ACM'])
    : gitList(['ls-files', '-c', '-o', '--exclude-standard']);
  const bad = [];
  for (const f of files) {
    const base = path.posix.basename(f);
    if (/^\.env(\..+)?$/.test(base) && base !== '.env.example') bad.push(`${f} (fisier cu secrete)`);
    else if (/(^|\/)node_modules\//.test(f)) bad.push(`${f} (node_modules)`);
    else {
      try { if (fs.statSync(f).size > MAX_FILE_BYTES) bad.push(`${f} (peste 5 MB)`); } catch { /* deleted */ }
    }
  }
  if (bad.length) add('PICAT', 'Fisiere care nu se salveaza', bad.slice(0, 5).join('; '));
  else add('TRECUT', 'Fisiere care nu se salveaza', 'nimic nepotrivit');
}

// Code changes need a new ledger entry. The generated commit list does not count as one.
function checkLedger() {
  const name = 'Registru (docs/LEDGER.md)';
  const changed = mode === 'commit'
    ? gitList(['diff', '--cached', '--name-only'])
    : [...gitList(['diff', 'HEAD', '--name-only']), ...gitList(['ls-files', '-o', '--exclude-standard'])];
  if (!changed.some(isCode)) return add('TRECUT', name, 'niciun cod schimbat');
  const body = (text) => text.replace(/<!-- commits:start -->[\s\S]*?<!-- commits:end -->/, '').replace(/\r/g, '');
  let now = '';
  if (mode === 'commit') now = git(['show', ':docs/LEDGER.md']);
  else { try { now = fs.readFileSync('docs/LEDGER.md', 'utf8'); } catch { /* missing */ } }
  if (now && body(now) !== body(git(['show', 'HEAD:docs/LEDGER.md']))) add('TRECUT', name, 'intrare noua');
  else add('PICAT', name, 'cod schimbat fara intrare noua - scrie in docs/LEDGER.md ce s-a facut si ce urmeaza');
}

// Apps come from gate.config.json; when it lists none, detect package.json / pytest projects.
function findApps() {
  const config = readJson(CONFIG_FILE, {});
  if (Array.isArray(config.apps) && config.apps.length) return config.apps.map((a) => ({ dir: '.', ...a }));
  const dirs = ['.'];
  if (fs.existsSync('apps')) {
    for (const d of fs.readdirSync('apps', { withFileTypes: true })) if (d.isDirectory()) dirs.push(`apps/${d.name}`);
  }
  const apps = [];
  for (const dir of dirs) {
    const app = { name: dir === '.' ? 'proiect' : dir, dir };
    const pkg = readJson(path.join(dir, 'package.json'), null);
    if (pkg) {
      app.node = true;
      if (pkg.scripts?.build) app.build = 'npm run build';
      if (pkg.scripts?.test && !pkg.scripts.test.includes('no test specified')) app.test = 'npm test';
    } else if (fs.existsSync(path.join(dir, 'pytest.ini')) || fs.existsSync(path.join(dir, 'tests'))) {
      if (fs.existsSync(path.join(dir, 'pyproject.toml')) || fs.existsSync(path.join(dir, 'requirements.txt'))) {
        app.test = 'python -m pytest -q';
      }
    }
    if (pkg || app.test) apps.push(app);
  }
  return apps;
}

function runCommand(label, app, cmd) {
  const name = `${label} (${app.name || app.dir})`;
  if (!cmd) return add('NEVERIFICAT', name, `nicio comanda - completeaza ${CONFIG_FILE}`);
  if ((app.node || fs.existsSync(path.join(app.dir, 'package.json'))) && !fs.existsSync(path.join(app.dir, 'node_modules'))) {
    return add('NEVERIFICAT', name, `lipseste node_modules - ruleaza "npm install" in ${app.dir}`);
  }
  const r = spawnSync(cmd, { cwd: app.dir, shell: true, encoding: 'utf8', timeout: 10 * 60 * 1000, env: { ...process.env, CI: 'true' } });
  if (r.status === 0) return add('TRECUT', name, cmd);
  const tail = `${r.stdout || ''}\n${r.stderr || ''}`.trim().split('\n').slice(-15).join('\n      ');
  add('PICAT', name, `${cmd}\n      ${tail}`);
}

async function responds(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.status < 400 && (await res.text()).length > 0;
  } catch { return false; }
}

async function checkStart(app) {
  const name = `Aplicatia porneste (${app.name || app.dir})`;
  if (!app.start || !app.url) return add('NEVERIFICAT', name, `completeaza "start" si "url" in ${CONFIG_FILE}`);
  if (await responds(app.url)) return add('TRECUT', name, `${app.url} raspunde (server deja pornit)`);
  const child = spawn(app.start, { cwd: app.dir, shell: true, stdio: 'ignore', detached: process.platform !== 'win32' });
  const deadline = Date.now() + (app.timeout || 60) * 1000;
  let ok = false;
  while (Date.now() < deadline && !(ok = await responds(app.url))) await new Promise((r) => setTimeout(r, 1000));
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
  else { try { process.kill(-child.pid); } catch { /* already gone */ } }
  add(ok ? 'TRECUT' : 'PICAT', name, ok ? `${app.url} raspunde` : `${app.start} -> ${app.url} nu a raspuns`);
}

// --------------------------------------------------------------------- main
checkSecrets();
checkFiles();
checkLedger();

const apps = findApps();
if (!apps.length) {
  add('NEVERIFICAT', 'Build / teste / pornire', `nu exista inca o aplicatie (sau completeaza ${CONFIG_FILE})`);
} else {
  for (const app of apps) {
    runCommand('Build', app, app.build);
    runCommand('Teste', app, app.test);
    if (mode === 'full') await checkStart(app);
  }
}

const failed = results.some((r) => r.status === 'PICAT');
console.log(`\nPOARTA DE VERIFICARE (${mode === 'commit' ? 'la salvare' : 'completa'})\n`);
for (const r of results) console.log(`  ${r.status.padEnd(12)} ${r.name}${r.detail ? `\n      ${r.detail}` : ''}`);
console.log(failed
  ? '\nREZULTAT: PICAT - repara ce e marcat PICAT, apoi ruleaza din nou.\n'
  : '\nREZULTAT: TRECUT' + (results.some((r) => r.status === 'NEVERIFICAT') ? ' (cu lucruri NEVERIFICATE - vezi mai sus)\n' : '\n'));

if (mode === 'full' && !failed) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ fingerprint: fingerprint(), passedAt: new Date().toISOString() }, null, 2) + '\n');
}
process.exit(failed ? 1 : 0);
