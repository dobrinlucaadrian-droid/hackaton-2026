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

1. Working tree clean, on the branch to be deployed, pushed.
2. Production build passes locally.
3. Every variable in `.env.example` is set on the host. The user enters
   secret values themselves.
4. Deploy, then open the public URL and walk the demo flow.

## Pre-demo checklist

- [ ] Public URL loads in a fresh/incognito window
- [ ] Main demo flow works start to finish on the deployed version
- [ ] Demo data is seeded; no empty states on screen
- [ ] No errors in the browser console or server logs during the flow
- [ ] Works on the screen size the presentation will use
- [ ] Fallback ready: local build running, plus a recorded video of the flow
- [ ] README has the URL and run instructions

Report each item as passed, failed or not checked — never mark an item passed
without having verified it.
