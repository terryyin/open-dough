---
id: SEED-206
status: active
planted: 2026-10-31
planted_during: Terry's acceptance of the bounded-refresh memory tradeoff and request to queue explicit re-read freshness
trigger_when: A dashboard action explicitly re-reads launch offers after a host change
scope: one small story for explicit machine-session re-read freshness
---

# SEED-206: Make explicit dashboard re-reads fresh

## Why This Matters

An explicit re-read after a host change can receive a machine-session
observation that settled up to one second earlier. The page then treats the
re-read as answered and can wait another 15 seconds before showing the new
offers. Developers should see the effect of their change when that explicit
re-read completes.

Terry requested this story immediately after
`SEED-202#consistent-shared-refresh`. That correction is already closed at
`58bc1bc1`, with its [done record](../done/SEED-202_consistent-shared-refresh.json)
retained. Queue this story first among remaining work; retain existing Taken
work and unrelated queue order. This is a new freshness promise, separate
from that correction's unchanged-answer consistency fixes.

The original `SEED-202#bounded-dashboard-refresh` remains closed. On
2026-10-31 Terry accepted its retained memory tradeoff: the recorded probe
settled at 51 MiB for one, three and eight viewers, compared with 22 MiB
before the change. No observation-expiry story is requested. The maintained
[observation contract](../../dashboard/AGENT-LAUNCH-HISTORY.md) records that
decision; the original measurement is recoverable at
`dc397ada:.planning/slice-plans/426-bounded-dashboard-refresh/PLAN.md`.

## Selected Stories

<a id="explicit-reread-freshness"></a>

### Make explicit dashboard re-reads observe fresh evidence

**Identity:** SEED-206#explicit-reread-freshness
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/431-explicit-reread-freshness/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5a7a96d3869ef1e9f5f898ad272fe6e9ffa68ef630393eacd3b264322667c4b5","plan":"8d2e5534cdb272a5b7e6c8a91d653941cc917d45c66483ec202a1843b5553c4f"}}
```

**Beneficiary:** A developer switching the Host selection in a story launch
or Start session dialog and waiting for its updated offers.

**Goal:** The explicit machine-session re-read after the change returns
offers based on evidence obtained after that change, without waiting for the
next regular poll or multiplying observations across viewers.

**Scope:**

- Apply the freshness promise to the explicit launch-offer re-read used by
  both launch dialogs after a Host selection change. Offers (options
  definitions, establishing hosts, session policies) come from each
  project's installed skill files, which the observation's reuse key
  (project catalog and machine documents) does not cover; a re-read
  therefore names its own freshness rather than relying on a key change.
- A settled observation predating that change cannot answer the re-read,
  even while it is inside the one-second reuse window.
- An observation already running before the change cannot supply stale
  evidence as the re-read's completed answer. Keep at most one observation
  running; wait for it to finish before obtaining suitable fresh evidence.
- Concurrent re-reads for the same changed state may share one observation
  that includes that change. Regular background polls and the notification
  observer retain their existing sharing and one-second settled reuse.
- Preserve parsed-document reuse, unchanged-answer consistency, bounded
  waits, retryable failures, and each departing viewer's independent wait.

**Key examples:**

1. An observation reports Codex offers A. The project's installed Codex
   options then change to B, and the developer switches the dialog's Host to
   Codex 400 ms after that observation settled. The completed re-read shows
   B without waiting for the next 15-second poll.
2. An observation that captured A is held in flight. The installed options
   change to B and the developer's Host switch sends an explicit re-read. Releasing the old observation does not
   complete that re-read with A; fresh evidence yields B, with no overlapping
   observations.
3. Several viewers explicitly re-read at about the same time after the same
   installed change. They receive
   B from one suitable shared observation. Ordinary polls still share their
   work and receive small unchanged answers when appropriate.

**Deferred promises:** Observation expiry, lower settled heap, changes to
GitHub request sharing, story-specific session reads, a general refresh
framework, and fresh reads for actions other than the dialogs' Host switch.

**Plan:** [431-explicit-reread-freshness](../slice-plans/431-explicit-reread-freshness/PLAN.md)

**Starting points:** `dashboard/src/agentLaunches.ts` (`rereadOffers`),
`StartLaunch.tsx`, `StartSession.tsx`, `machineSessionsReads.ts`, and
`dashboard/server/machineSessionObservation.ts` / `sharedObservation.ts`.
