---
name: ideate
description: Start of the hackathon workflow — take the challenge requirements, brainstorm, check originality against existing projects, debate and score ideas, and present the top 3 for the team to choose. Use when the hackathon requirements arrive, when asked to find, choose or brainstorm the idea, or when the current idea needs to be replaced.
---

# Ideate — find the winning idea

This is step one of the hackathon. Nothing gets built before the team has
chosen an idea through this process.

## 1. Capture the challenge

The requirements arrive pasted in chat. Save them **verbatim** to
`docs/challenge.md`, then add a structured summary below them:

```
## Summary
- Theme / problem statement:
- Judging criteria (with weights if given):
- Prize tracks and sponsor APIs/tech:
- Hard rules (required tech, banned things, submission format):
- Duration and deadline:
- Team: size, strengths, tech each person is fast in:
```

Ask the user for anything missing that changes the outcome — above all the
judging criteria, prize tracks, duration and the team's strengths. Ask it all
in one numbered message, and give a recommended answer with each question so
a beginner can simply reply "da". Do not ask what the pasted text or
`docs/plan.md` already answers. Wait for the answers before step 2.

## 2. Dispatch the `ideator` agent

Send the `ideator` agent (`.claude/agents/ideator.md`) a brief containing:

- the path `docs/challenge.md` (it reads the full text itself);
- any extra preferences from the team (domains they like or want to avoid,
  ideas already on their mind to be evaluated alongside the new ones).

The agent brainstorms, checks originality on GitHub and the web, debates and
scores, and returns a report with a top 3. It runs on a capped budget (see
the agent file) so most of the usage stays available for building — do not
raise those limits unless the team asks. Let it run in the background and
tell the user it is running.

## 3. Present the top 3

1. Save the agent's full report to `docs/ideas.md`.
2. Show the user the top 3 concisely: pitch line, why it can win, originality
   verdict, biggest risk, score. Mention the obvious ideas that were rejected
   as "what other teams will build".
3. Ask the team to choose. They may also combine ideas or ask for another
   round with new constraints — then continue the same agent with that
   feedback (SendMessage) instead of starting a fresh run.

## 4. Lock the choice

If the answer sounds reluctant ("cred că", "fie", "cum vreți"), ask once
what is holding them back before locking it.

Once the team chooses:

1. Append `## Chosen idea` to `docs/challenge.md`: the idea, the one-line pitch,
   the demo flow, the MVP scope and what is explicitly out of scope.
2. Fill in the stack in `CLAUDE.md` if the choice settles it (ask if not).
3. Commit with `/git-workflow`.
4. Next step: plan the build with `/foreman`.
