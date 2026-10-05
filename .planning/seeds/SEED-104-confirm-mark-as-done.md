---
id: SEED-104
status: active
planted: 2026-10-05
planted_during: Terry's request to confirm Mark as done when a session's work may not be finished
trigger_when: A developer clicks Mark as done on a session whose intended work is not known to be complete
scope: unestimated
---

# SEED-104: Confirm Mark as done for unfinished sessions

## Why This Matters

Mark as done renames the session, closes its attachments, requests a native
stop, and removes it from the cards and Sessions sidebar. A developer can click
it while the agent is still working, waiting for an answer, or paused between
steps of work it has not finished. One click then stops or hides work the
developer meant to continue. A confirmation that names the session's actual
situation keeps the quick path for finished sessions while preventing that
loss.

## Story

<a id="prove-mark-as-done-rule"></a>

### Prove the Mark as done rule for every reading it reads

**Identity:** SEED-104#prove-mark-as-done-rule
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/249-prove-mark-as-done-rule/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d2c193f521230e8ae2e36fdd123f0f2e7b8390b258b348e95ae53a7d2a1b2fe0","plan":"1e11772b2148e937d204c1e86c0ecb40109d200f9e0ca7c943aae9541c173539"}}
```

**Goal:** A maintainer changing Cursor readings or the Mark as done rule
learns at once, from a rule-level check, if a busy Cursor session or a waiting
session with a report would lose its confirmation. This corrects the
confirm Mark as done execution's coverage gap (story recoverable at
`662cd7a4:.planning/seeds/SEED-104-confirm-mark-as-done.md`); it adds
no feature promise.

**Scope:**

- Rule-level checks of `unfinishedIntention` for each reading and report
  combination the rule distinguishes, including Cursor's held-screen
  “working” and “waiting for an answer” labels and the precedence between a
  report and a working or waiting reading.
- One shared test step for the native stop calls the new Mark as done journeys
  count, replacing their copies.

**Plan:** [Prove the Mark as done rule](../slice-plans/249-prove-mark-as-done-rule/PLAN.md).

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Mark as done operation](../../dashboard/AGENT-LAUNCH-TERMINALS.md).
- [Native readings](../../dashboard/AGENT-LAUNCH-HISTORY.md).
- [Explicit completion reports](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- Terry's 2026-10-05 request: when Mark as done is clicked and the session is
  not stopped in a state where its intention is actually complete, including a
  session waiting for input that has not completed its intention, show a
  confirmation describing the situation and asking whether to mark it done.
