# Hackathon 2026

Project map, loaded every session — current stage, where the state lives,
skills, agents, scripts and code files: @docs/MAP.md

Monorepo for the hackathon project. The stack is not decided yet — update the
"Stack" and "Commands" sections as soon as it is.

## Team

Five beginners with little or no coding experience, not used to working
together. One of them (the Pilot) types to Claude and passes instructions to
the others. Roles, schedule and tasks live in `docs/plan.md` (managed by
`/coordonator`). The step-by-step guide for the Pilot is `ghid.html`.

## Rules

0. **Talk to the team in Romanian, simply.** No jargon; when a technical word
   is unavoidable, explain it in a few words. Say briefly what you are doing
   and end with exactly what the human must do next. Code, file names and
   commit messages stay in English.
0b. **Keep the team pointed at the next step, cheaply.** `/coordonator` is
   optional — nothing depends on it. When a task finishes, end with at most
   one line: the next step and, if known, time left to the next milestone. If
   `docs/plan.md` exists, tick off finished tasks in it. Do not run full
   check-ins unprompted.
1. **Ask before building.** Before implementing or executing anything, ask every
   clarifying question needed. Never start work in a direction the team has not
   confirmed.
2. **Ship over polish.** Prefer the simplest thing that demos well. No
   speculative abstractions, no unrequested refactors.
3. **Keep `main` demoable.** Work directly on `main` (no branches unless the
   team asks); commit only what runs.
4. **No claim without evidence.** Never tell the team something works unless
   it was seen running after the last change. Otherwise say "nu am verificat".
   A feature is done only when the gate has passed (`/gate`): run
   `node scripts/gate.mjs` and walk the flow. One PICAT stops the work. Never
   weaken or bypass the gate (`--no-verify`, deleting tests, editing the script).
5. **Map before search.** Read `docs/MAP.md` before looking for anything in
   the code, and open only the files it points to — no exploratory Glob/Grep
   or reading whole folders. The map is regenerated at every commit
   (`node scripts/map.mjs` to refresh it now); never edit it by hand. Every
   new code file starts with a one-line comment saying what it does — that
   line is what the map shows.
6. **Keep the ledger.** `docs/LEDGER.md` records what the team is after, where
   and what was done. At the start of a session read its "Acum lucrăm la"
   section instead of rediscovering the state. After every task add a short
   entry at the top of "Jurnal" (Cerut / Făcut / Fișiere / Poartă / Urmează,
   in Romanian) and update "Acum lucrăm la". The gate fails when code changed
   without a new entry. The commit list at the bottom is generated.
7. **Never commit secrets.** Keys live in `.env` (gitignored); document each one
   in `.env.example`.

## Layout

```
apps/       runnable applications (frontend, backend, ...)
packages/   code shared between apps
docs/       MAP.md (generated code map), LEDGER.md (what was done and what is
            next), plan.md, challenge.md, ideas.md, pitch
ghid.html   step-by-step guide for the team (Romanian) - open in a browser
scripts/    gate.mjs (quality gate), map.mjs (map + ledger commit list)
.claude/    skills and agents (see below)
```

## Stack

_TBD — fill in once the theme is announced._

**Constraint: the app must run on Vercel**, because Claude deploys it with the
Vercel CLI (`/deploy-demo`) and the team cannot deploy any other way. Choose:

- Next.js (pages + API routes), or a static site plus serverless functions in
  `api/`. One app, in `apps/<name>`.
- No long-running server process (`node server.js`, Express listening on a
  port, websockets servers, background workers).
- No writing to local files or SQLite at runtime — the filesystem is
  read-only and not shared. Use seeded JSON read at build/request time, or a
  hosted database (Supabase, Neon) if data must change.
- Secrets only through environment variables set with `vercel env add`.

## Commands

_TBD — install / dev / test / build / deploy commands go here._ When the
stack is chosen, also fill in `gate.config.json` (see `/gate`).

- `node scripts/gate.mjs` — full quality gate (secrets, files, build, tests,
  app starts). Runs automatically at the end of a turn when code changed.
- `git config core.hooksPath .githooks` — once per computer; makes every
  commit run the gate and refuse on failure.
- `vercel deploy --prod --yes --cwd apps/<app>` — publish (see
  `/deploy-demo` for the approval rule). `vercel whoami` checks the login.

## Workflow

0. Team arrives → `/coordonator` (roles, schedule, `docs/plan.md`); check-ins
   with `/coordonator` every 1–2 hours until the end.
1. Requirements arrive → `/ideate` (saves `docs/challenge.md`, top 3 ideas in
   `docs/ideas.md`, the team chooses).
2. Plan and build → `/foreman`, `/scaffold-feature`, `/researcher` as needed.
3. Ship → `/deploy-demo`, then `/pitch`.

## Skills and agents

Listed in the project map (`docs/MAP.md`, loaded above), generated from the
files in `.claude/skills` and `.claude/agents`.
