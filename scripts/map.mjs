#!/usr/bin/env node
// Generates docs/MAP.md (stage, skills, agents, code files) and refreshes the commit list in docs/LEDGER.md.
// Runs at every commit; costs no tokens.
//
//   node scripts/map.mjs

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

const MAP_FILE = 'docs/MAP.md';
const LEDGER_FILE = 'docs/LEDGER.md';
const MAX_FILES_PER_DIR = 40;
const MAX_SYMBOLS = 8;

const git = (args) => spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout || '';

// Project infrastructure is described in CLAUDE.md, not in the map.
function isMapped(p) {
  if (/^(docs|\.claude|\.githooks|scripts)\//.test(p)) return false;
  if (p.endsWith('.gitkeep') || /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(p)) return false;
  if (!p.includes('/') && (/\.md$/i.test(p) || p.startsWith('.git') || p === 'gate.config.json')) return false;
  return true;
}

const TEXT_EXT = /\.(m?[jt]sx?|cjs|py|rb|go|rs|java|kt|php|cs|html?|css|scss|vue|svelte|json|ya?ml|toml|sql|sh|md|txt|env\.example)$/i;

function describe(file, text) {
  const ext = path.extname(file).toLowerCase();
  const head = text.split('\n').slice(0, 30).map((l) => l.trim());
  if (ext === '.json') {
    try {
      const data = JSON.parse(text.replace(/^﻿/, ''));
      if (path.basename(file) === 'package.json') {
        return `package "${data.name || '?'}"; scripts: ${Object.keys(data.scripts || {}).join(', ') || 'none'}`;
      }
      return Array.isArray(data) ? `JSON array, ${data.length} items` : `JSON; keys: ${Object.keys(data).slice(0, 8).join(', ')}`;
    } catch { return 'JSON (invalid)'; }
  }
  if (/\.html?$/.test(ext)) {
    const title = text.match(/<title>([^<]*)<\/title>/i);
    if (title) return `page "${title[1].trim()}"`;
  }
  if (path.basename(file) === '.env.example') {
    const vars = head.map((l) => l.match(/^([A-Z0-9_]+)=/)?.[1]).filter(Boolean);
    return `env vars: ${vars.join(', ') || 'none yet'}`;
  }
  for (const line of head) {
    if (!line || line.startsWith('#!') || /^['"]use (client|server|strict)['"]/.test(line)) continue;
    const m = line.match(/^(?:\/\/+|#+|\/\*+|\*|<!--|--|"""|''')\s*(.*?)\s*(?:\*\/|-->|"""|''')?$/);
    if (!m) break;
    if (m[1] && !/^(eslint|@ts-|prettier|coding[:=]|-\*-)/.test(m[1])) return m[1];
  }
  return '';
}

function symbols(file, text) {
  const out = { exports: new Set(), routes: new Set() };
  const each = (re, fn) => { for (const m of text.matchAll(re)) fn(m); };
  each(/^export\s+(?:default\s+)?(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z0-9_$]+)/gm, (m) => out.exports.add(m[1]));
  each(/^(?:module\.)?exports\.([A-Za-z0-9_$]+)\s*=/gm, (m) => out.exports.add(m[1]));
  if (file.endsWith('.py')) each(/^(?:async\s+)?(?:def|class)\s+([A-Za-z0-9_]+)/gm, (m) => out.exports.add(m[1]));
  each(/\.(get|post|put|patch|delete)\(\s*['"`](\/[^'"`]*)/g, (m) => out.routes.add(`${m[1].toUpperCase()} ${m[2]}`));
  each(/pathname\s*={2,3}\s*['"`](\/[^'"`]*)/g, (m) => out.routes.add(m[1]));
  const page = file.match(/(?:^|\/)app\/(.*?)\/?(page|route)\.[jt]sx?$/);
  if (page) out.routes.add(`${page[2] === 'route' ? 'API ' : ''}/${page[1]}`);
  return out;
}

// name / description / model from a skill or agent file's frontmatter.
function frontmatter(file) {
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!block) return null;
  const get = (key) => block.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1].trim() || '';
  const short = get('description').split(/\. |\s—\s/)[0].replace(/\.$/, '');
  return { name: get('name'), model: get('model'), description: short.length > 130 ? `${short.slice(0, 127)}…` : short };
}

function listDir(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}

// What a new session needs before touching anything: where the state is, which
// stage the project is in, and which skills, agents and scripts exist.
function orientation(hasCode) {
  const has = (f) => fs.existsSync(f);
  const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };
  const chosen = /^## Chosen idea/m.test(read('docs/challenge.md'));
  const stage = !has('docs/challenge.md') ? 'waiting for the hackathon theme → `/ideate` when it arrives'
    : !chosen ? 'choosing the idea → finish `/ideate` (top 3 in `docs/ideas.md`)'
    : !hasCode ? 'idea chosen, nothing built → plan with `/foreman`'
    : 'building → `/scaffold-feature`, `/gate` after each feature, then `/deploy-demo` and `/pitch`';

  const docs = [
    ['docs/LEDGER.md', 'what is being worked on now, what was done, what is next — read "Acum lucrăm la" first'],
    ['docs/challenge.md', 'the hackathon requirements and the chosen idea'],
    ['docs/ideas.md', 'the ideation report (top 3 and eliminated ideas)'],
    ['docs/plan.md', 'team roles, schedule and task board'],
    ['docs/ghid.html', 'step-by-step guide for the team (Romanian)'],
    ['gate.config.json', 'build / test / start commands the gate runs'],
  ];

  const out = [
    '## Start here (every session)',
    '',
    `**Stage:** ${stage}`,
    '',
    '1. Rules are in `CLAUDE.md`. Reply to the team in simple Romanian; ask before building.',
    '2. Read "Acum lucrăm la" and the newest "Jurnal" entry in `docs/LEDGER.md` instead of rediscovering the state.',
    '3. Find code through the "Code" section below — no exploratory searching.',
    '4. After any code change: add a `docs/LEDGER.md` entry, then `node scripts/gate.mjs`.',
    '',
    '| File | What it holds | Exists |',
    '| --- | --- | --- |',
    ...docs.map(([f, what]) => `| \`${f}\` | ${what} | ${has(f) ? 'yes' : 'not yet'} |`),
    '',
    '## Skills (`.claude/skills`)',
    '',
  ];
  for (const d of listDir('.claude/skills').filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    const fm = frontmatter(`.claude/skills/${d}/SKILL.md`);
    if (fm) out.push(`- \`/${fm.name || d}\` — ${fm.description}`);
  }
  out.push('', '## Agents (`.claude/agents`)', '');
  for (const f of listDir('.claude/agents').map((e) => e.name).filter((n) => n.endsWith('.md')).sort()) {
    const fm = frontmatter(`.claude/agents/${f}`);
    if (fm) out.push(`- \`${fm.name || f.replace(/\.md$/, '')}\`${fm.model ? ` (${fm.model})` : ''} — ${fm.description}`);
  }
  out.push('', '## Scripts', '');
  for (const f of listDir('scripts').map((e) => e.name).filter((n) => /\.(mjs|js|sh|py)$/.test(n)).sort()) {
    out.push(`- \`node scripts/${f}\` — ${describe(`scripts/${f}`, read(`scripts/${f}`))}`);
  }
  out.push('');
  return out;
}

function buildMap() {
  const files = git(['ls-files', '-c', '-o', '--exclude-standard', '-z']).split('\0').filter(Boolean).filter(isMapped).sort();
  const dirs = new Map();
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const dir = path.posix.dirname(f);
    if (!dirs.has(dir)) dirs.set(dir, []);
    dirs.get(dir).push(f);
  }

  let config = {};
  try { config = JSON.parse(fs.readFileSync('gate.config.json', 'utf8').replace(/^﻿/, '')); } catch { /* none */ }

  const lines = [
    '# Project map',
    '',
    '_Generated by `node scripts/map.mjs` at every commit. Do not edit by hand._',
    '',
    ...orientation(dirs.size > 0),
    '## Code',
    '',
    '_Open only the files listed here; a file\'s description is its first comment line._',
    '',
  ];

  if (config.apps?.length) {
    lines.push('### Apps', '');
    for (const a of config.apps) lines.push(`- **${a.name}** in \`${a.dir}\` — start: \`${a.start || '?'}\` → ${a.url || '?'}; test: \`${a.test || '?'}\`; build: \`${a.build || '?'}\``);
    lines.push('');
  }

  if (!dirs.size) lines.push('No application code yet.', '');
  for (const [dir, list] of dirs) {
    lines.push(`### ${dir === '.' ? '(root)' : dir}  (${list.length} files)`, '');
    for (const f of list.slice(0, MAX_FILES_PER_DIR)) {
      const name = path.posix.basename(f);
      if (!TEXT_EXT.test(name) || fs.statSync(f).size > 300 * 1024) { lines.push(`- \`${name}\``); continue; }
      const text = fs.readFileSync(f, 'utf8');
      const sym = symbols(f, text);
      let line = `- \`${name}\` (${text.split('\n').length}) — ${describe(f, text) || '_no description: add a first-line comment_'}`;
      if (sym.routes.size) line += `. Routes: ${[...sym.routes].slice(0, MAX_SYMBOLS).join(', ')}`;
      if (sym.exports.size) line += `. Exports: ${[...sym.exports].slice(0, MAX_SYMBOLS).join(', ')}${sym.exports.size > MAX_SYMBOLS ? ', …' : ''}`;
      lines.push(line);
    }
    if (list.length > MAX_FILES_PER_DIR) lines.push(`- … +${list.length - MAX_FILES_PER_DIR} more`);
    lines.push('');
  }
  fs.writeFileSync(MAP_FILE, lines.join('\n'));
  return files.length;
}

// The commit list lives between two markers so Claude's own entries are never touched.
function refreshLedgerCommits() {
  if (!fs.existsSync(LEDGER_FILE)) return false;
  const text = fs.readFileSync(LEDGER_FILE, 'utf8');
  const start = '<!-- commits:start -->';
  const end = '<!-- commits:end -->';
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a === -1 || b === -1 || b < a) return false;
  const log = git(['log', '-30', '--date=format:%Y-%m-%d %H:%M', '--pretty=format:- %ad `%h` %s']).trim();
  const next = `${text.slice(0, a + start.length)}\n${log || '- (niciun commit inca)'}\n${text.slice(b)}`;
  if (next !== text) fs.writeFileSync(LEDGER_FILE, next);
  return true;
}

const count = buildMap();
const ledger = refreshLedgerCommits();
console.log(`map: ${MAP_FILE} (${count} files)${ledger ? `, ${LEDGER_FILE} commit list refreshed` : ''}`);
