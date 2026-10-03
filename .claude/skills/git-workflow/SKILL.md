---
name: git-workflow
description: Fast, consistent git flow for the hackathon — commit and push directly on main. Use when asked to commit, save progress, push, branch, or open a PR.
---

# Git workflow

Goal: `main` always runs and can be demoed at any moment.

## Branches

- Work directly on `main`. The team are beginners on one computer; branches
  only confuse them. Do not create branches unless the team asks.
- `main` stays demoable: the pre-commit gate refuses commits that fail the
  checks, so commit only what runs.
- Only if several people commit from different computers: one short-lived
  `feat/<short-name>` branch per person, merged through the Pilot.

## Commit

1. `git status` and `git diff` — look at what is actually changing.
2. Stage specific paths. Never `git add -A` blindly; check that no `.env`,
   key, build output or large binary is included.
3. Message format: `<type>: <what changed>` in the imperative, under 72 chars.
   Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.
4. Commit small and often — a commit is a restore point during a hackathon.

## Push

1. `git push origin main`.
2. No pull requests in the single-computer setup. With per-person branches,
   `gh pr create --fill` and merge once the gate passes.

## Do not

- Force-push `main`, rewrite shared history, or skip hooks.
- Commit secrets. If one is committed, say so immediately — the key must be
  rotated, deleting the commit is not enough.

Confirm with the user before pushing, merging to `main`, or any destructive
command (`reset --hard`, `clean`, branch deletion).
