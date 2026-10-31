---
id: SEED-202
status: active
planted: 2026-10-31
planted_during: Terry's dashboard memory investigation and request to prioritize shared request management
trigger_when: Several browsers keep the dashboard open and refresh the same projects or sessions
scope: one story for bounded shared dashboard refresh work
---

# SEED-202: Keep dashboard refresh work bounded across viewers

## Why This Matters

A developer should be able to leave the dashboard open on several browsers or
devices without multiplying expensive observations, exhausting GitHub request
allowances, or causing memory to grow with repeated refreshes. Terry asked to
start with sharing session observations across browsers and reusing parsed
launch records, and to treat this as a general improvement to request
management, especially GitHub requests. Queue this story first.

## Selected Stories

<a id="consistent-shared-refresh"></a>

### Keep shared refresh answers consistent with what each viewer shows

**Identity:** SEED-202#consistent-shared-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/428-consistent-shared-refresh/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3e3368c486bfa2a1d7e24d6f86ab2c03d71d6007ffbbfacbb4b9075276f47211","plan":"d503de67b046a70956c551e6cba689f1068686b1072a7e5b2bf8d4fb9eb22766"}}
```

**Goal:** A correction to Keep dashboard refresh work bounded across viewers
(`SEED-202#bounded-dashboard-refresh`, recoverable at
`dc397adab49fbb7b2002be45161c80a6bd1b0a21:.planning/seeds/SEED-202-bounded-dashboard-refresh.md`). Developers viewing the dashboard get
unchanged answers and shared Cursor reads only when what their view already
shows matches the answer they would receive. The settings view's machine-session
refresh stays small when nothing changed.

**Scope:**

- A page that changes its sessions or facts outside the poll stops holding the
  poll's revision. Such changes come from an action's answer, a session
  re-read, or a mark. Its next poll then receives the full answer.
- The settings view's feedback-maintenance refresh sends the revision it holds
  and keeps its state on an unchanged answer.
- A shared Cursor held-session read is joined only under the same machine
  documents it started from. A reader whose launch record was written after
  the read began gets its own read.
- One machine-document revision, owned by the machine document store, keys
  both shared observations.
