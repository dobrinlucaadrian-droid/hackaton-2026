# UniPath — plan for the production version

Decided with the team on 2026-10-05, after the hackathon presentation. Work happens on the
`production` branch; `main` and the public address stay as presented until the team says otherwise.

## Decisions

| Topic | Decision |
| --- | --- |
| Database and backend | Convex (hosted) |
| Sign-in | Convex Auth: email magic link (sent with Resend) and Google; no passwords |
| Who has an account | high-school students (save their questionnaire result) and the team (administrators) |
| Student reviews | public form without an account; shown only after the team approves them |
| Where we build | `production` branch with its own preview address |

## Steps

| Step | What is built | Done when |
| --- | --- | --- |
| 1. Foundation | Convex project, tables (users, saved results, reviews), shared access rules | the app starts connected to Convex on the preview |
| 2. Accounts | magic link + Google sign-in; saving the result; account deletion | a student signs in, sees only their own result, can delete the account |
| 3. Reviews | public form, moderation queue, admin page; the 24 current opinions moved to the database | a new review appears publicly only after approval |
| 4. Security | input validation, rate limits, bot protection, security headers, access tests, secret and dependency scans on every save | access tests pass and scans run by themselves |
| 5. Privacy | privacy page, consent checkbox, as little data as possible | the text is checked by an adult who knows the legal side |

## Security checklist (from the research below, in priority order)

1. Every public Convex query and mutation checks who is calling (`getAuthUserId`) and refuses when it must; the check lives in one shared wrapper (`convex-helpers` custom functions).
2. Argument validators (`v.*`) on every public function; text lengths capped in the handler.
3. The user id always comes from the signed-in identity, never from the browser.
4. Anything not meant for the browser (approve, delete, send email, bot check) is an `internal*` function.
5. Roles are written only by the server (`users.role`); admin functions use an admin-only wrapper.
6. The public reviews query returns only approved reviews, without the author's email or id.
7. Public review form: bot check (Cloudflare Turnstile) verified on the server, then saved as "pending".
8. Rate limits on review submission and sign-in (`@convex-dev/rate-limiter`).
9. Secrets live in Convex and Vercel environment variables; only the Convex address and the Turnstile site key may be `NEXT_PUBLIC_*`.
10. Uploaded photos: size and type checked; shown only when the review is approved.
11. Review text is rendered as plain text; never `dangerouslySetInnerHTML` for user text.
12. Pages are protected on the server too, not only in `proxy.ts`.
13. Security headers and a content security policy.
14. `gitleaks`, `npm audit`, Dependabot and CodeQL.
15. Moderation fields: status, who moderated, when; a report button.
16. Automatic tests (`convex-test`) for points 1, 3, 5 and 6.
17. Account deletion removes the user, sessions and saved results.
18. One pass through OWASP ASVS levels 1–2 before launch.

## Open points (not verified)

- Whether Convex can keep the data in the European Union.
- The licence of `@convex-dev/auth` (no licence file was found in its repository); both Convex auth options are below version 1.0, so exact versions are pinned.
- Minors and GDPR need a human/legal check: age of digital consent in Romania, parental consent, privacy policy, agreements with Convex, Resend and Cloudflare as data processors.
- Free-tier limits of Convex, Resend and Cloudflare Turnstile.
- No reference example was run; everything was read from source and documentation.

## Reference repositories (GitHub, read on 2026-10-05)

| Repository | What we take from it |
| --- | --- |
| get-convex/templates (`template-nextjs-convexauth`) | official Next.js 16 + Convex Auth starter, `proxy.ts` pattern |
| get-convex/convex-auth | magic link (Resend) and Google configuration |
| get-convex/convex-backend (docs: best practices, Vercel hosting) | access-control rules; deploy with `npx convex deploy --cmd 'npm run build'` and a `CONVEX_DEPLOY_KEY` |
| get-convex/convex-helpers | `customQuery` / `customMutation` wrappers, row-level rules |
| get-convex/rate-limiter | rate limiting inside Convex |
| get-convex/convex-test | tests for the access rules |
| marsidev/react-turnstile | Cloudflare Turnstile widget |
| gitleaks/gitleaks, github/codeql-action | secret scanning and code scanning |
| OWASP/ASVS, OWASP/CheatSheetSeries | checklists (linked, not copied) |
| better-auth/better-auth with get-convex/better-auth | main alternative for sign-in |
