---
name: gate
description: Use after every finished feature or work package, before saying something is done or works, before deploy and before the demo, when the Stop hook asks for a gate run, or when asked to test, verify or check the app ("verifică", "testează", "merge?").
---

# Gate — the quality gate

The team are beginners and will miss things. The gate is how nothing broken
gets past them. A feature is not done until the gate has passed.

## 1. Run the mechanical checks

```bash
node scripts/gate.mjs
```

It checks: no passwords or keys in the code, no `.env` / `node_modules` /
huge files about to be saved, build passes, tests pass, the app starts and
the main page answers. Each line is `TRECUT`, `PICAT` or `NEVERIFICAT`.

`NEVERIFICAT` on build, tests or start means `gate.config.json` has no
commands yet. As soon as the stack exists, fill it in:

```json
{ "apps": [ { "name": "web", "dir": "apps/web", "build": "npm run build",
              "test": "npm test", "start": "npm run dev",
              "url": "http://localhost:3000" } ] }
```

## 2. Run the checks that need judgment

The script cannot use the app like a person. You do (or send the `tester`
agent with the exact flow to walk):

| Check | How |
| --- | --- |
| The new feature does what was asked | Walk its flow step by step in the running app |
| The main demo flow still works | Walk it start to finish |
| Loading, empty and error states | Trigger each one; no blank screen, no raw error |
| No errors while using it | Browser console and server log during the flow |
| The agent's claims are true | `git diff --stat` matches what was reported |

## 3. Report

Show the team one table in Romanian — the script's lines plus your own —
each as `TRECUT`, `PICAT` or `NEVERIFICAT`, then one line: **poarta a trecut**
or **poarta a picat**, and what they have to do next.

## Rules

- A result counts only if you ran the check after the last change. Never
  write TRECUT for something you did not see. If you could not check it,
  it is NEVERIFICAT, with the reason.
- One PICAT stops the work: fix it (use `/debugging`) and run the gate
  again. Do not start the next feature, commit or deploy past a failed gate.
- Never weaken the gate to get it to pass: do not delete or skip tests, edit
  `scripts/gate.mjs`, use `git commit --no-verify`, or add `gate:allow` to a
  line that holds a real secret. If a check is wrong, tell the team and let
  them decide.
- If the team wants to move on with something PICAT, say plainly what is
  broken and what it risks at the demo, and record it in `docs/plan.md` if
  it exists.

## Where it blocks automatically

- **Commit** — the git pre-commit hook runs `node scripts/gate.mjs --commit`
  (secrets, files, build, tests) and refuses the commit on PICAT. It needs
  `git config core.hooksPath .githooks` once per computer.
- **End of a turn** — the Claude Code Stop hook asks for a gate run when code
  changed since the last passed gate.
