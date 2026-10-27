---
id: SEED-155
status: active
planted: 2026-10-27
planted_during: Terry's report that a Cursor execution with a running background agent read Ready for review
trigger_when: A Cursor parent session sits at the follow-up prompt while a background agent for that session is still working
scope: small
---

# SEED-155: A Cursor session with background work reads Working

## Why This Matters

A developer watching the dashboard needs **Ready for review** only when the
Cursor session actually needs their attention. That label means the parent
screen is at the follow-up prompt after a confirmed first instruction. On
2026-10-27, Yuma-chan's Doughnut execution of
SEED-002#story-1 (`c6df5a96-3f57-48ff-8b44-d6fbe2faba34`) delegated slice work
to a background Task, ended the parent turn, and stayed at the follow-up
prompt while the subagent kept implementing. The dashboard showed Ready for
review and asked for attention; nothing was ready for the developer to review.

SEED-147#running-cursor-session-reads-working already made a live parent
`ctrl+c to stop` screen read Working. It does not cover parent-idle screens
whose delegated background work is still running. The developer does not need
to know about that delegation; the reading must not claim review while work
continues.

## Selected Stories

<a id="cursor-background-work-reads-working"></a>

### A Cursor session with background work reads Working

**Identity:** SEED-155#cursor-background-work-reads-working
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer using the dashboard to decide when a Cursor
session needs review or input.

**Goal:** While any background agent belonging to a held Cursor session is
still working, that session reads Working (no Ready-for-review attention).
Ready for review appears only when the parent is at the follow-up prompt and
no background work for that session remains.

**Scope:** Cursor session observation and the shared readings cards, sidebar,
attention count, and alerts use. Preserve Working for a live parent stop hint
(SEED-147), Needs input for proved clarifying questions, and Ready for review
for a true idle follow-up with no remaining background work. Do not invent a
story-complete or Mark as done signal from this reading. Other hosts stay as
they are unless refinement finds a shared observation change is required.

**Key examples / evaluation:** A held Cursor session whose parent screen is
the follow-up prompt, with a background Task still writing or running tools
for that session, reads Working and does not raise Ready-for-review attention.
When that background work ends and the parent remains at the follow-up prompt
with no further background work, it reads Ready for review. A parent screen
that itself shows the live stop hint stays Working regardless of background
agents. An idle follow-up with no background agents stays Ready for review
after a confirmed first instruction.

**Open questions for refinement:** The durable signal that background work
belongs to the held session and is still running; whether “Working” or another
shared activity is the right label when only background agents are active.

**Depends on:** none.

**Safe stopping point:** False Ready-for-review attention during delegated
Cursor work stops; further host generalization can wait.

## Breadcrumbs

- Terry's report on 2026-10-27 for Doughnut SEED-002#story-1 / Yuma-chan:
  session appeared to run normally while the dashboard said Ready for review.
- Parent transcript ended after spawning background Task
  `262cb71f-a956-40a7-9e01-a56942d3e8ea`; subagent continued afterward.
- Prior related repair: SEED-147#running-cursor-session-reads-working
  (live parent stop hint outside the classifier window).
- Cursor observation:
  [dashboard/server/hosts/cursor/sessions.ts](../../dashboard/server/hosts/cursor/sessions.ts),
  [idleScreen.ts](../../dashboard/server/hosts/cursor/idleScreen.ts),
  [nativeSessionShown.ts](../../dashboard/src/nativeSessionShown.ts).
