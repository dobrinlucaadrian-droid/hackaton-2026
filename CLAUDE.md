# Hackathon 2026

Monorepo for the hackathon project. The stack is not decided yet — update the
"Stack" and "Commands" sections as soon as it is.

## Team

Five beginners with little or no coding experience, not used to working
together. One of them (the Pilot) types to Claude and passes instructions to
the others. Roles, schedule and tasks live in `docs/plan.md` (managed by
`/coordonator`). The step-by-step guide for the Pilot is `docs/ghid.html`.

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
3. **Keep `main` demoable.** Work on short-lived branches; merge only what runs.
4. **No claim without evidence.** Never tell the team something works unless
   it was seen running after the last change. Otherwise say "nu am verificat".
5. **Never commit secrets.** Keys live in `.env` (gitignored); document each one
   in `.env.example`.

## Layout

```
apps/       runnable applications (frontend, backend, ...)
packages/   code shared between apps
docs/       pitch, architecture notes, demo script
.claude/    skills and agents (see below)
```

## Stack

_TBD — fill in once the theme is announced._

## Commands

_TBD — install / dev / test / build / deploy commands go here._

## Workflow

0. Team arrives → `/coordonator` (roles, schedule, `docs/plan.md`); check-ins
   with `/coordonator` every 1–2 hours until the end.
1. Requirements arrive → `/ideate` (saves `docs/challenge.md`, top 3 ideas in
   `docs/ideas.md`, the team chooses).
2. Plan and build → `/foreman`, `/scaffold-feature`, `/researcher` as needed.
3. Ship → `/deploy-demo`, then `/pitch`.

## Skills (`.claude/skills`)

| Skill | Use it for |
| --- | --- |
| `/coordonator` | organize the team: roles, schedule, tasks, check-ins |
| `/ideate` | turn the challenge into a top 3 of original, winnable ideas |
| `/git-workflow` | branch, commit, push, PR |
| `/scaffold-feature` | add a feature end to end following project conventions |
| `/deploy-demo` | deploy and run the pre-demo checklist |
| `/pitch` | README, project description, pitch outline |
| `/token-budget` | choosing models and keeping context lean |
| `/foreman` | split a large task and delegate it to the agents below |
| `/researcher` | find GitHub repos and code examples the project needs |
| `/debugging` | find the cause of a bug step by step instead of guessing |

## Agents (`.claude/agents`)

`frontend`, `backend`, `tester`, `reviewer`, `researcher` — normally dispatched
by `/foreman`; `researcher` also by `/researcher`. `ideator` (sonnet,
capped search budget) is dispatched by `/ideate` at the start.
