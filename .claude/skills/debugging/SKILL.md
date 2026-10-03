---
name: debugging
description: Use when something is broken — an error message, a crash, a blank page, a feature that worked and stopped, a failing test or build, or the team says "nu merge".
---

# Debugging

Under time pressure the instinct is to guess and stack changes. That makes
things worse. Find the cause first, then make one fix.

## 1. Get the facts

- Read the **whole** error message, including the file and line it names. If
  the team only says "nu merge", ask exactly what they did, what they
  expected and what happened — or reproduce it yourself.
- Reproduce the problem. A bug you cannot trigger cannot be confirmed fixed.

## 2. What changed?

`git status` and `git diff` against the last commit that worked. Most
hackathon bugs live in the last change. If the last commit worked, the cause
is in the diff.

## 3. Find where it breaks

Follow the data across the boundaries: browser → request → server → data →
response → screen. Check each boundary (browser console, network response,
server log, a temporary log line) and find the first place where the value is
wrong. The bug is between the last good point and the first bad one.

## 4. One hypothesis, one change

State the cause in one sentence ("X is undefined because Y runs before Z").
Make the smallest change that tests it. Never change several things at once —
if it starts working, nobody knows why.

## 5. Verify

Reproduce the original steps and see it work. Check that the main demo flow
still works. Remove temporary log lines. Then commit with `/git-workflow`.

## Stop rule

After **3 failed fixes**, stop. Tell the team in plain words what was tried
and what is known, and offer the options:

- go back to the last working commit and redo the change in smaller steps;
- a simpler way to get the same result for the demo;
- drop the feature if the demo does not need it.

Reverting discards work — ask before doing it.
