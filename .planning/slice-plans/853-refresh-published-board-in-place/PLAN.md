# Refresh the published Board in place

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#refresh-published-board-in-place)

**Identity:** SEED-430#refresh-published-board-in-place

**State:** Awaiting plan realignment — not ready for execution. These mapped slices are provisional until
[plan 856](../856-open-the-board-from-the-verified-git-trunk/PLAN.md) lands
the verified Board open they extend.

**Split from:** Plan 828 on 2026-11-26
(`6b267497e02efe0c5c24f0fdcccd17b900641fee:.planning/slice-plans/828-open-and-refresh-board-at-verified-trunk/PLAN.md`),
former slices 2, 6 and 7.

## Goal and scope

Refresh the shown Board through the verified Git check, show when it was
last confirmed, keep the confirmed view through a pending or failed Refresh,
and bind revision and confirmation time in one durable update. Automatic
observation stays on its current path until
[plan 823](../823-follow-published-progress-from-local-git/PLAN.md).

## Current decisions

- UI (decided 2026-11-26): the Board perspective's project actions row
  ([ProjectActions](../../../dashboard/src/ProjectActions.tsx)) ends with a
  quiet "Checked <time>" note and a `RefreshCw` icon button labeled
  "Refresh", matching [System settings Usage](../../../dashboard/src/SystemSettingsUsage.tsx)
  and the [Review panel](../../../dashboard/src/StoryReview.tsx). The button
  stays focusable and `aria-disabled` while checking. Failures use the
  existing [read failure alert](../../../dashboard/src/PublishedReadFailure.tsx).
- Borrow the commit point from
  [SQLite's atomic commit](https://www.sqlite.org/atomiccommit.html#deleting_the_rollback_journal):
  Git may hold candidate objects ahead of the commit point; readers switch
  only when the observation is published. Reuse the Dashboard's
  [durable JSON replacement](../../../dashboard/server/durableJsonReplacement.ts)
  where it satisfies that contract. Keep observation start (`askedAt`) for
  launch reconciliation distinct from confirmation time.
- Reuse the Board's [fresh read and attempt state](../../../dashboard/src/publishedObservation.ts)
  for Refresh. An earlier automatic read cannot overwrite a later manual
  confirmation; an automatic advance shows its own read time until plan 823.

## Provisional ordered slices

Slices 1–2 correct the delivered Board open
([plan 856](../856-open-the-board-from-the-verified-git-trunk/PLAN.md),
retrospective 2026-11-27, revision `55b4be2bf`) before Refresh extends the
same check.

### 1. Bound the verified trunk check and keep reconciliation's read fresh

Type: Behavior
Status: planned

Behavior: A Git transfer that stalls past the Board's read deadline is ended,
so the next open or reload of that project starts a new check instead of
joining the stalled one. Launch reconciliation's fresh read is answered only
by a check begun after it was asked, so a launch that settles with no
publication is reconciled on that read even within the reuse window.

Evidence: `SharedVerifiedOriginTrunk.check` creates an `AbortController` it
never aborts, and nothing times out the Git calls; the REST read it replaced
ended at `readTimeoutMs`. `demand` never passes `SharedObservation`'s `fresh`
flag, and production reuses a settled check for `checkReuseMs` (14 s), so
`askedAt` can precede the settlement that `readAfresh` waits past. Tests run
at reuse 0 and the stalled-read case releases its hold first. Also remove the
second `observeProjectRevision` call (`performedRefRead.ts` `admit`; the
check already observes it).

Proof: Backend cases: a held transfer past the deadline is aborted and a later
demand starts afresh; with production reuse, a fresh demand after a settled
check starts a new one while a staggered tab still shares. One E2E
reconciliation case at production reuse. Budget 14 active minutes.

### 2. Keep the Board check's fetch apart from Review's

Type: Behavior
Status: planned

Behavior: The Board's verified check and a Review sync on the same project
never read each other's fetch or race creating the review repository.

Evidence: the check reads `FETCH_HEAD` (`verifiedOriginTrunk.ts:96`) that
Review's `fetchPublishedRef` also writes, and both run `createIfMissing`.
`story-review-initial-sync.spec.ts` needs a 10-minute reuse window to keep
the Board out of Review's upload-pack gate.

Proof: Backend case: a Review fetch of another commit concurrent with the
check leaves the check's verified revision intact; concurrent first use
creates one repository. Budget 13 active minutes.

### 3. Publish one durable confirmation

Type: Structure
Status: planned

Change: Publish the verified revision and confirmation time together after
the pinned backlog read; with a confirmation at the advertised revision,
probe and skip the fetch. A failed candidate or write leaves the former
confirmation readable, including after restart.

Proof: Observe A, move origin to B, interrupt publication after B is local,
restart; show A and its time, then B after retry; with origin at B, a later
time and no fetch. Budget 14 active minutes.

### 4. Show the confirmation and refresh an unchanged Board

Type: Behavior
Status: planned

Behavior: The Board shows "Checked <time>". Pressing Refresh keeps the
backlog and time while checking; when origin still confirms it, the time
advances and nothing is fetched.

Proof: Drive the rendered action; check pending, exact revision, changed time
and zero fetch; record cold and warm counts and timing; two eligible
requests join one check. Budget 13 active minutes.

### 5. Recover a Refresh after origin changes

Type: Behavior
Status: planned

Behavior: Refresh after origin advances; a failed fetch or confirmation keeps
A and its time and shows the failure; a later Refresh publishes B and its
time together; an earlier automatic read cannot replace it.

Proof: With A rendered, hold B and fail before publication; verify A and the
failure, then recover to B; check the in-flight automatic result and the
restart case. Budget 14 active minutes.

## Resumption

Resume through slice-plan refinement after plan 856 lands: settle the durable store design against the landed confirmation seam,
and measure the warm Refresh path before recording readiness.
