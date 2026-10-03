---
name: deploy-demo
description: Deploy the project and run the pre-demo checklist. Use when asked to deploy, publish, get a public URL, or prepare for the demo or presentation.
---

# Deploy and demo readiness

Deploying is outward-facing: confirm the target and the branch with the user
before running any deploy command.

## Pick the target

Use what `CLAUDE.md` records. If nothing is recorded yet, propose one and ask:

| Project shape | Usual quick target |
| --- | --- |
| Next.js / static frontend | Vercel or Netlify |
| Node or Python API | Render, Railway or Fly.io |
| Needs a database | the host's managed Postgres, or Supabase / Neon |
| Deploy is not working in time | local run + a tunnel (e.g. `cloudflared`) |

Record the chosen target and the exact deploy command in `CLAUDE.md`.

## Deploy

1. Working tree clean, on `main`, pushed.
2. The gate passes (`node scripts/gate.mjs`), including the production build.
3. Every variable in `.env.example` is set on the host. The user enters
   secret values themselves.
4. Deploy, then open the public URL and walk the demo flow.

## Pre-demo checklist

1. Public URL loads in a fresh/incognito window
2. Main demo flow works start to finish on the deployed version
3. Demo data is seeded; no empty states on screen
4. No errors in the browser console or server logs during the flow
5. Works on the screen size the presentation will use
6. Fallback ready: local build running, plus a recorded video of the flow
7. README has the URL and run instructions

Report it as one table in Romanian, in the same words as the gate (`/gate`),
with the gate script's own lines on top:

| Verificare | Rezultat | Detalii |
| --- | --- | --- |
| Adresa publică se deschide | TRECUT / PICAT / NEVERIFICAT | ce ai văzut sau de ce nu ai putut verifica |

- `TRECUT` only for what you saw working after the last change.
- `PICAT` for what you saw failing; it stops the demo preparation until fixed.
- `NEVERIFICAT` for what you could not check — say why and who on the team
  should check it (usually the Tester, in a browser).

No other wording ("parțial", "nu am verificat", checkboxes): the team knows
these three words from the gate.
