---
name: researcher
description: Search GitHub for repositories and code the project can reuse or learn from, and return a ranked report with relevant code examples. Use when choosing a library, framework or API, when integrating an unfamiliar service, when an approach has failed and a working reference is needed, or when asked to research or find a repo. Not for trivial questions the codebase or docs already answer.
---

# Researcher

Find proven open-source solutions on GitHub so the team does not build from
scratch what already exists. GitHub only — no web search.

## When to run it

Run it when there is a real need:

- choosing between libraries, frameworks or APIs;
- integrating a service or protocol nobody on the team has used;
- an approach has failed and a working reference implementation would help.

Do not run it for things already answered by the codebase, installed
dependencies or a quick look at a package's own README.

## Delegate by default

Dispatch the `researcher` agent (`.claude/agents/researcher.md`) with a brief
instead of searching in the main session — it keeps search noise out of the
main context. Several independent questions can go to several agents in
parallel. The brief contains:

- the question, in one sentence;
- the project's stack and constraints (language, framework, runtime, license
  needs) — read them from `CLAUDE.md`;
- what "a good fit" means here (e.g. "works with Next.js app router",
  "no paid API key").

Search directly only for a single quick lookup.

## How to search (`gh` CLI)

```bash
# Repositories
gh search repos "<keywords>" --language <lang> --sort stars --limit 15 --json fullName,description,stargazersCount,pushedAt,license,url

# Code usage across GitHub (find real examples of an API in use)
gh search code "<symbol or import>" --language <lang> --limit 20 --json repository,path,url

# Inspect a candidate without cloning
gh api repos/OWNER/REPO/readme -H "Accept: application/vnd.github.raw"
gh api "repos/OWNER/REPO/git/trees/HEAD?recursive=1" --jq ".tree[].path"
gh api repos/OWNER/REPO/contents/PATH -H "Accept: application/vnd.github.raw"
```

Try 2–3 phrasings of the query; narrow with `--language`, `topic:<name>` or
`stars:>100` when results are noisy. Never clone — read files through `gh api`.

## How to judge a candidate

| Criterion | Good sign |
| --- | --- |
| Fit | Solves the actual question with the project's stack |
| Activity | Pushed within the last ~12 months, issues answered |
| Adoption | Stars and real usage found via `gh search code` |
| License | MIT, Apache-2.0, BSD, ISC. Flag GPL/AGPL/no license |
| Setup cost | Can be running in under an hour |

Read the README and at least one core source file before recommending a repo.

## Code examples

- Extract only the snippets the project needs, short and focused.
- Every snippet carries its source: `owner/repo/path` link and license.
- Prefer installing the library as a dependency over copying its code.
- Do not copy code from repos with GPL/AGPL or no license into the project;
  describe the approach instead.

## Report format

```
## Question
<one sentence>

## Recommendation
<repo> — why it fits, in 2–3 lines.

## Candidates
| Repo | Stars | Last push | License | Fit |
| ... |

## How to use it here
<install command, minimal integration snippet with source link>

## Risks
<license, maintenance, gaps>
```

Report only what was actually read. If nothing good was found, say so and
list the queries tried.
