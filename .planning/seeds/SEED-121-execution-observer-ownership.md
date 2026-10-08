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
**Slice plan:** [Execution delivery keeps its observer owner](../slice-plans/280-execution-observer-ownership/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/280-execution-observer-ownership/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2c4af92a37382c3c5e51bab5781b9e8ac33a685df1998f108b912e975f4032f7","plan":"cd34f7e328e05d9652ee3bb2edc86c6a4fdfa32b6304b4629bd0a4505baeaf42"}}
```

**Beneficiary:** A developer running concurrent execution sessions in separate
worktrees of one repository, and each agent responsible for its own published
increments and CI repairs.

**Goal:** A publishing execution automatically registers each accepted Trunk
Mode increment or authorized CI repair with its own observer, receives the
corresponding CI events, and completes its CI gate for that accepted revision
without manual registration. Concurrent execution can then share trunk without
mixing observation ownership.

**Scope:**

- Preserve the publishing coordinator's ownership when establishing, reusing,
  or recovering managed observation. Verify the repository, authorized target,
  and retained execution/host owner before attaching a revision. Repository,
  branch, common Git directory, mailbox order, and liveness alone do not prove
  ownership; even a single live sibling observer is not the publisher's owner.
- Use the existing host ownership contracts: Cursor's conversation and Claude
  Code's session, including their coordinator/child distinction and mailbox
  binding; Codex's yielded stream armed by the publishing coordinator and the
  exact observer receipt retained in its observer note. Explicit host session
  input remains authoritative, with fallback only to that host's own ambient
  identity. Delivery and resume must receive or recover sufficient owner
  evidence; selecting its command representation belongs to slice planning.
- Register only the accepted post-reconciliation SHA and retain the same owner
  across normal increments and repairs. Preserve notification routing,
  acknowledgment, repair authority, and completion against that owner's exact
  registered revision. The publisher must not register, consume events, or
  complete/stop observation on behalf of a sibling execution.
- Preserve legitimate mailbox access across worktrees of the same repository.
  A coordinator may use its verified observer from another checkout; access
  permission and observer ownership remain separate facts. Tightening owner
  selection must not require all mailbox operations to run in its creation
  worktree.
- When no usable observer is verified, follow the existing host lifecycle:
  Cursor and Claude Code may establish their own bound observer after bridge
  readiness; Codex delivery requires its coordinator's already-armed stream.
  Resume does not silently start a replacement. Missing, mismatched, ambiguous,
  ended, or lost ownership reports an actionable coverage gap whenever that
  lifecycle cannot supply verified observation. Legacy mailboxes may be reused
  only with sufficient retained ownership evidence; repository/branch matching
  is never the compatibility fallback.
- Preserve accepted publication receipts even when observation is unavailable.
  Report publication and its remaining CI obligation separately; an ownership
  gap cannot justify claiming CI completion or borrowing a sibling's coverage.
  Explicit recovery follows the existing host recovery path.

**Deferred promises:** Dashboard-owned CI monitoring remains a separate story.
This delivery does not redesign CI discovery, notification transport, or repair
coordination, and does not take over or interrupt other Taken work. Shared
helpers may change wherever needed for this outcome while preserving existing
Story Branch Mode ownership and target binding.

**Key examples:**

1. **Concurrent trunk delivery:** Two coordinators in sibling worktrees each
   have a live observer of the same repository's `main`, with the sibling's
   directory sorting first. Deliver an increment through
   `execution-increment-delivery.mjs deliver` with the publisher's retained
   owner evidence. Only its observer receives the accepted SHA and routes the
   corresponding events to that coordinator; completion through that observer
   succeeds when CI passes. The sibling's coverage and lifecycle are untouched.
2. **Repair after reconciliation:** That publisher delivers an authorized
   repair while another writer has advanced trunk. Register the accepted
   post-reconciliation SHA on the same observer, and evaluate completion for
   that revision rather than the earlier candidate or the sibling's green SHA.
3. **Cross-worktree access:** The same coordinator invokes an observation
   operation from another worktree of the repository with its retained owner
   evidence. Its observer remains accessible and usable; a different
   coordinator in that checkout cannot acquire ownership merely by having the
   same repository and branch.
4. **No observer of the publisher:** Only a sibling's observer is live. Codex
   delivery reports the missing owned stream and its existing rearm/recovery
   step. Cursor or Claude Code establishes a separate observer only when its
   own identity and bridge readiness allow it; otherwise it reports a gap.
   Any accepted publication is still reported, and the sibling receives no
   registration or shutdown request from the publisher.
5. **Interrupted registration:** An increment is already accepted remotely,
   but its publisher's observer lacks the registration. Resume with sibling
   observers present and the retained owner evidence. Verify remote acceptance,
   recover that publisher's live observer, and register the accepted revision
   without another push or duplicate coverage entry.
6. **Insufficient or conflicting evidence:** Delivery or resume has no retained
   owner evidence, a handle belonging to another coordinator/target, or more
   than one candidate that the evidence cannot distinguish. Report the exact
   ownership gap and required recovery input; do not choose the first, newest,
   or sole repository/branch match. This also covers legacy observers whose
   ownership cannot be verified. Retained evidence that does verify a legacy
   observer allows normal reuse.
7. **Ended or lost owner:** The publisher's retained observer has ended or lost
   its worker while a sibling's remains live. Resume reports the publisher's
   actual terminal/lost state and the explicit host recovery path, preserving
   publication and coverage evidence. It neither attaches to the sibling nor
   starts a replacement during resume.

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

**Refinement basis (2026-10-08):** The existing
[one-observer contract](../../src/skills/dough-execute-plan/references/ci-monitor.md#own-one-observer)
already requires one observer per repository/branch/coordinator and retained
execution binding. The
[host hook](../../src/skills/dough-execute-plan/scripts/ci-host-hook.mjs)
binds Cursor and Claude Code mailboxes using repository identity, host,
session/conversation, and child identity. The
[host bridge](../../src/skills/dough-execute-plan/scripts/ci-host-bridge.mjs)
resolves explicit session input before host-specific ambient identity. The
[Codex adapter](../../src/skills/dough-execute-plan/references/ci-notify-codex.md)
retains the yielded stream's exact handles with coordinator and checkout in
its observer note; unidentified older observers cannot be guessed. These
contracts settle the ownership, cross-worktree access, and legacy boundaries
above without a new architectural decision.

**Evidence still needed for planning/execution:** Reproduce concurrent managed
delivery through accepted publication, registration, event routing, and
completion in an isolated fixture before repair. The saved incident does not
prove observer liveness at delivery time, and the existing single-observer
journeys do not prove concurrency. Map shared behavior and the different host
ownership paths to focused proof; assess native evidence or justified reuse for
each affected host under
[ADR 0005 — Cross-tool validation through native acceptance stories](../../docs/adrs/0005-cross-tool-validation-accepted.md).
The exact representation of retained owner input is an implementation choice,
not an unresolved product decision. No human goal or scope decision remains.

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
