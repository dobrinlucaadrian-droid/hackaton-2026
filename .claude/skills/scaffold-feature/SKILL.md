---
name: scaffold-feature
description: Add a new feature end to end (UI, API, data, types) following the project's existing conventions. Use when asked to add, scaffold or build a new feature, page, endpoint or screen.
---

# Scaffold a feature

## 1. Clarify first

Before writing code, ask the user until these are unambiguous:

- What the user sees and does (the demo flow, step by step).
- What data it needs and where that data comes from (real, mocked, seeded).
- What "done" means for the demo — and what is explicitly out of scope.

Ask everything in one numbered list, each question with a recommended
answer, then wait. If the answer is "cum crezi tu", state your choice and get
an explicit "da" before building.

## 2. Read the conventions

Read `CLAUDE.md`, find the relevant files in `docs/MAP.md`, and read one
existing feature of the same kind. Copy its file
layout, naming, error handling and styling. If no feature exists yet, propose a
layout and get it confirmed before creating files.

## 3. Build a vertical slice

Build the thinnest path that works end to end, in this order:

1. Data shape / types shared by both sides.
2. Backend: endpoint or handler returning real or seeded data.
3. Frontend: screen wired to that endpoint, including loading and error states.
4. One happy-path check that it actually runs (start the app and use it).

Only then widen: validation, edge cases, polish.

## 4. Hackathon rules

- Hardcode or seed data rather than building admin tooling.
- No new dependency without a reason; prefer what is already installed.
- Leave a `TODO(demo):` comment where a shortcut was taken so it can be found.
- Start every new file with a one-line comment saying what it does (it
  becomes the file's line in `docs/MAP.md`).
- Update `.env.example` for any new variable and the Commands section of
  `CLAUDE.md` for any new command.

## 5. Report

Write the `docs/LEDGER.md` entry, run the gate (`/gate`), then state what was
built, how to see it running, and which shortcuts were taken.
