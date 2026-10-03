---
name: git-workflow
description: Fast, consistent git flow for the hackathon — branch, commit, push, open a PR. Use when asked to commit, save progress, push, branch, or open a PR.
---

# Git workflow

Goal: `main` always runs and can be demoed at any moment.

## Branches

- `main` — demoable at all times. Never commit broken code to it.
- `feat/<short-name>`, `fix/<short-name>` — short-lived, one concern each.

## Commit

1. `git status` and `git diff` — look at what is actually changing.
2. Stage specific paths. Never `git add -A` blindly; check that no `.env`,
   key, build output or large binary is included.
3. Message format: `<type>: <what changed>` in the imperative, under 72 chars.
   Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.
4. Commit small and often — a commit is a restore point during a hackathon.

## Push / PR

1. `git push -u origin <branch>`.
2. `gh pr create --fill` for anything a teammate should see; for a trivial
   change with the team's agreement, merge straight to `main`.
3. Before merging to `main`: the app starts and the main demo flow works.

## Do not

- Force-push `main`, rewrite shared history, or skip hooks.
- Commit secrets. If one is committed, say so immediately — the key must be
  rotated, deleting the commit is not enough.

Confirm with the user before pushing, merging to `main`, or any destructive
command (`reset --hard`, `clean`, branch deletion).
