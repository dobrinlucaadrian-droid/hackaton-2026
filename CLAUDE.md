# Hackathon 2026

Monorepo for the hackathon project. The stack is not decided yet — update the
"Stack" and "Commands" sections as soon as it is.

## Rules

1. **Ask before building.** Before implementing or executing anything, ask every
   clarifying question needed. Never start work in a direction the team has not
   confirmed.
2. **Ship over polish.** Prefer the simplest thing that demos well. No
   speculative abstractions, no unrequested refactors.
3. **Keep `main` demoable.** Work on short-lived branches; merge only what runs.
4. **Never commit secrets.** Keys live in `.env` (gitignored); document each one
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

1. Requirements arrive → `/ideate` (saves `docs/challenge.md`, top 3 ideas in
   `docs/ideas.md`, the team chooses).
2. Plan and build → `/foreman`, `/scaffold-feature`, `/researcher` as needed.
3. Ship → `/deploy-demo`, then `/pitch`.

## Skills (`.claude/skills`)

| Skill | Use it for |
| --- | --- |
| `/ideate` | turn the challenge into a top 3 of original, winnable ideas |
| `/git-workflow` | branch, commit, push, PR |
| `/scaffold-feature` | add a feature end to end following project conventions |
| `/deploy-demo` | deploy and run the pre-demo checklist |
| `/pitch` | README, project description, pitch outline |
| `/token-budget` | choosing models and keeping context lean |
| `/foreman` | split a large task and delegate it to the agents below |
| `/researcher` | find GitHub repos and code examples the project needs |

## Agents (`.claude/agents`)

`frontend`, `backend`, `tester`, `reviewer`, `researcher` — normally dispatched
by `/foreman`; `researcher` also by `/researcher`. `ideator` (opus) is
dispatched by `/ideate` at the start.
