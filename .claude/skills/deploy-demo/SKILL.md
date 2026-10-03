---
name: deploy-demo
description: Deploy the project to Vercel with the Vercel CLI and run the pre-demo checklist. Use when asked to deploy, publish, put the app online, get a public URL, or prepare for the demo or presentation.
---

# Deploy and demo readiness

The team cannot deploy on their own — you do all of it with the Vercel CLI,
which is installed and logged in on this computer. The app is built to run on
Vercel (see "Stack" in `CLAUDE.md`).

## Approval

Publishing puts the app on the public internet.

- **First deploy:** ask once, in Romanian — "Public acum aplicația pe
  internet, la o adresă pe care o poate deschide oricine?" — and wait for
  "da". Then write the approval in `CLAUDE.md` under Commands:
  `Deploy approved by the team on <date>`.
- **Later deploys:** if that line exists, redeploy without asking whenever the
  team asks for a deploy and the gate passes.
- Never deploy when the gate has a PICAT.

## Before deploying

1. `vercel whoami` — if it is not logged in, stop and ask the Pilot to run
   `vercel login` in a terminal. You never log in or type credentials.
2. Working tree clean, on `main`, pushed.
3. The gate passes (`node scripts/gate.mjs`), including the production build.
4. Environment variables: compare the names in `.env.example` with
   `vercel env ls`. For each missing one, give the Pilot the exact command to
   run in a terminal — `vercel env add NAME production` — so they paste the
   value themselves. You never see or type secret values.

## Deploy

Run from the app's folder (the one in `gate.config.json`), one command per call:

```bash
vercel deploy --prod --yes --cwd apps/<app>
```

- The first run creates and links the Vercel project (`--yes` accepts the
  defaults). `.vercel/` is gitignored.
- `--prod` matters: only the production address is public. Preview addresses
  ask visitors to log in to Vercel, so the jury could not open them.
- The command prints the address. Record it and the deploy command in
  `CLAUDE.md` (Commands) and in `README.md`.
- If the build fails on Vercel: `vercel inspect <url> --logs`, then
  `/debugging`. After 3 failed attempts stop and offer the fallback below.

## Fallback

If Vercel does not work in time: run the app locally on the presentation
laptop and have the team record a video of the demo flow. Say plainly that
there is no public address.

## Pre-demo checklist

1. Public URL loads in a fresh/incognito window
2. Main demo flow works start to finish on the deployed version
3. Demo data is seeded; no empty states on screen
4. No errors in the browser console or server logs during the flow
5. Works on the screen size the presentation will use
6. Fallback ready: local build running, plus a recorded video of the flow
7. README has the URL and run instructions

Check what you can yourself: request the public URL and the API routes from
`docs/MAP.md` and confirm status 200 and real content, not an error page.

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
