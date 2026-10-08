---
id: SEED-121
status: active
planted: 2026-10-08
planted_during: Terry's report of a trunk repair registering with another worktree's CI observer
trigger_when: Concurrent execution sessions observe the same repository and trunk branch
scope: story
---

# SEED-121: Execution delivery retains its CI observer owner

## Why This Matters

An agent publishing a Trunk Mode increment needs CI coverage and completion
through its own execution observer. Concurrent sessions share the repository
and target branch; attaching a revision to another session can leave the
publisher's completion gate without coverage and send CI events to the wrong
owner.

## Story

<a id="retain-execution-observer-owner"></a>

### Register trunk delivery with its own execution observer

**Identity:** SEED-121#retain-execution-observer-owner
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer running concurrent execution sessions in separate
worktrees of one repository, and each agent responsible for its own published
increments and CI repairs.

**Goal:** Managed delivery registers the accepted revision with the observer
owned by the publishing execution, so that execution can complete its CI gate
without manually registering the revision again.

**Scope:** Preserve execution ownership when establishing, reusing, or
recovering observation for delivery. Repository and target branch alone do not
establish an observer's owner. Keep legitimate access to mailboxes across
worktrees, existing host notification routes, and accepted publication
receipts. Missing or ambiguous ownership must be an explicit coverage gap,
without silently adopting another execution's observer. This story does not
change dashboard-owned CI monitoring or interrupt other Taken work.

**Key examples / evaluation:**

1. Two sessions in sibling worktrees each have a live observer of the same
   repository's `main`. The publisher's observer sorts after the sibling's
   directory. Deliver an increment through `execution-increment-delivery.mjs
   deliver`: only the publisher's observer receives its accepted SHA, and
   completion through that observer succeeds when CI passes.
2. Deliver a subsequent repair from that execution: it reuses the same owner
   and registers the accepted post-reconciliation SHA there.
3. Only another execution's observer is live, or the publisher's owner cannot
   be distinguished among multiple observers: delivery reports the ownership
   coverage gap and does not register with an arbitrary observer. Any accepted
   publication remains accurately reported.
4. Resume an interrupted delivery with sibling observers present: recovery
   retains the publishing execution's owner. A missing or ended owner follows
   the existing explicit recovery path rather than borrowing a sibling's.

**Evidence from brief research (2026-10-08):**

- The saved requests under `/private/tmp/dough-ci-501/` identify both
  `watch-MaJywH` and `watch-lxyTPU` as execution observers of
  `terryyin/open-dough main`. Their roots name, respectively, the SEED-118
  recovery worktree `recover-automatically-from-temporary-github-fail` and the
  reporting session's `paged-dashboard-columns-reveal-by-structure-and`
  worktree.
- Both coverage records contain revision
  `ddc2072c867adc933d98c210d62c22a26dde3eb7`. Registration timestamps are
  `1791419016608` for `watch-MaJywH` and `1791419025721` for `watch-lxyTPU`.
  The former retains pending coverage; the latter records success for GitHub
  run `37707518921`, attempt 1. Terry reports manually registering with the
  latter observer before completion passed. Both observers have since stopped;
  these records do not alone establish their liveness at delivery time.
- In `src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs`,
  `checkoutIdentity` uses the common Git directory, deliberately treating
  sibling worktrees as one identity. `ci-mailbox-match.mjs` then matches only
  execution mode, repository, and branch, and `findLiveMatchingMailbox` returns
  the first live match. `execution-increment-observation.mjs` reuses it before
  resolving host/session ownership; delivery registers the accepted SHA with
  that returned directory. The installed `.agents` copies of the matching and
  location modules are identical to source. This confirms a path that can
  adopt a sibling execution's observer, consistent with the saved incident.
- Existing resume coverage detects multiple live repository/branch matches,
  but does not resolve the publisher's owner among them. Existing session-input
  and single-observer delivery tests do not prove this concurrent journey.

**Open questions for refinement:** Which retained execution/session identity
should select an observer for each host, including a Codex yielded stream;
how to preserve cross-worktree mailbox access while tightening owner selection;
and how legacy observers lacking sufficient ownership should report recovery.
Reproduce the concurrent delivery journey before repair; the brief research
did not rerun a push or mutate the incident's observers.

**Depends on:** No blocking story prerequisite. The queued dashboard-owned CI
monitoring story has a separate outcome.

**Safe stopping point:** Concurrent trunk deliveries have correct observer
ownership and explicit ownership gaps, even if dashboard monitoring is deferred.

## Breadcrumbs

- Terry's reported misregistration and explicit request to queue confirmed
  work first, commit on main, and sync with origin, 2026-10-08.
- [Managed observation](../../src/skills/dough-execute-plan/scripts/execution-increment-observation.mjs).
- [Mailbox matching](../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs).
- [Mailbox location and access](../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs).
- [Managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs).
- [Resume ownership coverage](../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs).
