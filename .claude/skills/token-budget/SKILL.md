---
name: token-budget
description: Balanced token usage — strong model for planning and decisions, cheap fast models for routine delegated work, lean context throughout. Use when delegating to subagents, choosing a model, starting a large task, or when usage limits are a concern.
---

# Token budget (balanced)

Spend tokens where judgment matters, save them where it does not.

## Model per kind of work

| Work | Model |
| --- | --- |
| Planning, architecture, ambiguous decisions, tricky debugging | `opus` (main session) |
| Implementing a well-specified feature, writing tests, review | `sonnet` |
| Search, file lookups, renames, boilerplate, formatting, summaries | `haiku` |

Pass the model explicitly when spawning an agent. Escalate one tier only when
the cheaper model has actually failed at the task.

## Keep context lean

- Search (Grep/Glob) before reading; read the relevant range, not whole files.
- Do not re-read a file that was just edited or is already in context.
- Delegate broad exploration to a subagent and keep only its conclusion.
- Limit command output (`--oneline`, `-n`, `Select-Object -First`), never dump
  full logs, lockfiles or build output into context.
- One task per session; start a fresh session when switching to unrelated work.

## Delegation discipline

- A subagent only pays off for independent or parallel work, or for reading
  across many files. A handful of tool calls is cheaper done directly.
- Write a tight brief: goal, files, constraints, expected output format.
  Ask for a short result, not a narrative.
- Do not run several agents on the same question, and do not redo delegated work.

## When limits get tight

Stop parallel fan-out, drop routine work to `haiku`, and ask the user which
remaining tasks matter most for the demo.
