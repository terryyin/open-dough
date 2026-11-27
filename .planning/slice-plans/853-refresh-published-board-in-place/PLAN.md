# Refresh the published Board in place

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#refresh-published-board-in-place)

**Identity:** SEED-430#refresh-published-board-in-place

**Split from:** Plan 828 on 2026-11-26
(`6b267497e02efe0c5c24f0fdcccd17b900641fee:.planning/slice-plans/828-open-and-refresh-board-at-verified-trunk/PLAN.md`),
former slices 2, 6 and 7. Realigned on 2026-11-27 with the verified Board
open that
[plan 856](https://github.com/terryyin/open-dough/blob/d71b0c6d6dc3c767a80efc93ac03247f467d7881/.planning/slice-plans/856-open-the-board-from-the-verified-git-trunk/PLAN.md)
delivered (integrated at `72cbe76da`).

## Goal and scope

Refresh the shown Board through the verified Git check, show when it was
last confirmed, keep the confirmed view through a pending or failed Refresh,
and bind revision and confirmation time in one durable update. Slices 1–2
first correct the delivered Board open (retrospective 2026-11-27, revision
`55b4be2bf`), because Refresh extends that same check.

Exclusions: automatic observation stays on its current revision-check path
until [plan 823](../823-follow-published-progress-from-local-git/PLAN.md);
Review keeps its own fetch and sync record.

## Current decisions

- UI (decided 2026-11-26): the Board perspective's project actions row
  ([ProjectActions](../../../dashboard/src/ProjectActions.tsx)) ends with a
  quiet "Checked <time>" note, worded and timed as
  [System settings Usage](../../../dashboard/src/SystemSettingsUsage.tsx)'s
  `CheckedAt`, and an `IconButton` with `RefreshCw` labeled "Refresh", as the
  [Review panel](../../../dashboard/src/StoryReview.tsx) has it. The button
  stays focusable and `aria-disabled` while checking. Failures use the
  existing [read failure alert](../../../dashboard/src/PublishedReadFailure.tsx).
- One check, one freshness rule: Refresh and launch reconciliation both
  demand the shared verified check with `SharedObservation`'s `fresh` flag,
  so each is answered only by a check begun after it asked; opens and
  staggered tabs keep sharing within the reuse window.
- The Board check fetches into its own ref,
  `refs/open-dough/board/<branch>`, instead of reading `FETCH_HEAD`. That
  ref keeps the confirmed objects reachable (premise row 2) and keeps the
  check apart from Review's fetches.
- Commit point, borrowed from
  [SQLite's atomic commit](https://www.sqlite.org/atomiccommit.html#deleting_the_rollback_journal):
  Git may hold candidate objects and the Board ref ahead of the commit point;
  the confirmation record `{revision, confirmedAt}` beside the Review
  repository's sync record, written through
  [durable JSON replacement](../../../dashboard/server/durableJsonReplacement.ts)
  after the pinned backlog read, is the commit point. Readers answer only the
  recorded confirmation. Keep observation start (`askedAt`) for launch
  reconciliation distinct from `confirmedAt`.
- Warm path: when the record's revision equals origin's advertised head and
  its objects are local, the check reads the backlog there and writes a new
  `confirmedAt` with no fetch.
- Client: reuse the Board's [fresh read and attempt state](../../../dashboard/src/publishedObservation.ts)
  for Refresh. An automatic advance shows its own read time until plan 823;
  an earlier automatic read cannot overwrite a later manual confirmation.

## Premises and available baselines

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Warm check: `ls-remote` probe then `cat-file blob <rev>:<backlog>` with no fetch | 2026-11-27, Apple Git on this machine, isolated bare repository with `remote.origin.url` to a local origin: after one `fetch --quiet --refmap= origin refs/heads/main`, `ls-remote` returned the same SHA and `cat-file blob` read the backlog without any fetch. | Local-file transport stands in for GitHub HTTPS; `ls-remote` transfers no objects and `cat-file` is local on every transport, so the difference cannot change the outcome. |
| Confirmed objects surviving until a restart's open | Same repository: with only `FETCH_HEAD` naming the commit, `git gc --prune=now` pruned it (`cat-file -e` failed); fetched to `refs/open-dough/board/main`, the same gc kept it. | Settled; it decides the Board-owned ref above. |
| Stall and freshness defects slice 1 corrects | At `25f4999f2`: `SharedVerifiedOriginTrunk.check` creates an `AbortController` it never aborts and no deadline wraps its Git calls; `SharedVerifiedOriginTrunk.demand` never passes `fresh`, and production reuse is `revisionCheckReuseMs` (14 s). | Read only. Slice 1's first cases reproduce each defect (fail before the change) before its fix; a case that passes beforehand stops the slice for replanning. |
| Shared `FETCH_HEAD` and `createIfMissing` slice 2 corrects | At `25f4999f2`: `verifiedOriginTrunk.ts:96` reads `FETCH_HEAD`, which Review's `fetchPublishedRef` also writes; both reach `createIfMissing` in `reviewRepositoryStorage.ts`. | Read only. Slice 2's concurrent case reproduces the overwrite first, as above. |
| Proof route for the check | At `25f4999f2`, `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:dashboard:backend -- shared-verified-origin-trunk.spec.ts verified-origin-trunk.spec.ts shared-observation.spec.ts authenticated-read-shared-trunk.spec.ts` passed 16 cases in 23 s, including the held-transfer and refusal cases. | Baseline only; the slices own discrimination for new behavior. |

## Ordered slices

### 1. Bound the verified trunk check and keep reconciliation's read fresh

Type: Behavior
Status: done

Behavior: A Git transfer that stalls past the Board's read deadline is ended,
so the next open or reload of that project starts a new check instead of
joining the stalled one. Launch reconciliation's fresh read is answered only
by a check begun after it was asked, so a launch that settles with no
publication is reconciled on that read even within the reuse window. Remove
the second `observeProjectRevision` call in `performedRefRead.ts` `admit`
(the check already observes it).

Proof: Backend cases in `shared-verified-origin-trunk.spec.ts`: a held
transfer past the deadline is aborted and a later demand starts afresh; with
production reuse, a fresh demand after a settled check starts a new one while
a staggered tab still shares. One E2E reconciliation case at production
reuse. Budget 14 active minutes.

Delivered (10 active minutes): the check runs under an injectable deadline
(default `readWaitLimitMs`) through the process-owned `fetchGitTransport`;
the former `runGitUntilClosed` waited on stdio the transport child held, so
an abort never returned. Only launch reconciliation's `readAfresh` sends
`&fresh=1`. Both backend cases failed before the change; the E2E case failed
with the client flag removed. Learnings: inject the deadline signal in
backend cases (a wall-clock deadline raced the transfer hold under load);
`scripts/test.sh` refuses Playwright specs, so E2E runs through
`npm run test:e2e -- <files>`. The full backend run at load 20–70 failed only
launch-timing specs that base `d56cd6957` failed equally at the same load
(`agent-launch-{,codex-}duplicate`: base 10/13 and 2/13 failed, branch 10/13
then 13/13 passed); CI decides the whole suite.

### 2. Keep the Board check's fetch apart from Review's

Type: Behavior
Status: done

Behavior: The Board's verified check and a Review sync on the same project
never read each other's fetch or race creating the review repository; the
check fetches into `refs/open-dough/board/<branch>`.

Proof: Backend case: a Review fetch of another commit concurrent with the
check leaves the check's verified revision intact; concurrent first use
creates one repository. Drop the 10-minute reuse window
`story-review-initial-sync.spec.ts` needed to keep the Board out of Review's
upload-pack gate, and keep it green. Budget 13 active minutes.

Delivered (5 active minutes): the check fetches
`+refs/heads/<b>:refs/open-dough/board/<b>` with `--no-write-fetch-head`
and verifies that ref; concurrent first uses share one local creation that
no single caller's signal can abort. Both backend cases failed on base
(`rejected` revision; `git init` config lock). Premise correction: the
Board's own ref did not take it past Review's upload-pack gate, because the
gate is the repository's `remote.origin.uploadpack`; the test gate gained a
`reviewOnly` option that lets the Board's probe and fetch through by the
calling Git client's command line, the only distinguishing signal (same
remote, ref and wire request).
CI run 45981492323 on `d1e4063` failed `dashboard-frontend` only: Vitest's
browser connection closed mid-run (`VITEST_BROWSER_CONNECTION_CLOSED`) and
later files reported no cases. That repair is owned by the Taken
SEED-413#keep-full-frontend-runs-connected; this plan does not duplicate it.

### 3. Open from a durable confirmation without fetching

Type: Behavior
Status: done

Behavior: A verified check publishes its revision and confirmation time
together in one durable record after the pinned backlog read. An open whose
record matches origin's advertised revision answers it with a new
confirmation time and no fetch, including after a restart. A failed candidate
or record write leaves the former confirmation readable.

Proof: Backend cases with a real origin: observe A, move origin to B, fail
the record write after B is local, restart the server; the open answers A
and its time with the failure reported, then B after retry; with origin at
B, a later open answers a later time with zero fetches (counted Git calls).
Budget 14 active minutes.

Delivered (6 active minutes): `boardConfirmation.ts` records
`{ref, revision, confirmedAt}` as `open-dough-board-confirmation.json` in the
Review repository; `verifiedOriginTrunk.ts` pins and observes a revision only
after that write. A record whose revision origin still advertises answers
with a new `confirmedAt` and only the `ls-remote` probe (upload-pack count
+1). A failed write answers the former confirmation marked `unrecorded`; the
open's wire answer does not yet carry `confirmedAt` or that failure (slice 4
puts the time on the wire; G1 gives slice 5 the failure). Proof:
`board-confirmation.spec.ts`; `authenticated-read-shared-trunk.spec.ts`'s
later open now reaches upload-pack once.

### 4. Show the confirmation and refresh an unchanged Board

Type: Behavior
Status: done

Behavior: The Board shows "Checked <time>". Pressing Refresh keeps the
backlog and time while checking origin, with the button focusable and
unavailable; when origin still confirms the shown revision, the time
advances and nothing is fetched.

Proof: E2E through the dashboard page objects: drive the rendered action;
check the pending cue, exact revision, changed time and zero fetch; two
eligible requests join one check. Record cold and warm Git request counts
and timing in this plan. Budget 13 active minutes.

Delivered (5 active minutes): the open's answer carries `confirmedAt` to
`PublishedWork.confirmedAt` (`askedAt` stays `refAskedAt`); the actions row
ends with the shared `CheckedAt` note (moved to `CheckedAt.tsx`) and a
Refresh `IconButton` that calls `readAfresh`. Proof:
`e2e/observation/board-refresh-unchanged.spec.ts` through
`boardRefreshPage.ts` (held check keeps focus, `aria-disabled`, backlog and
time; a second press asks nothing more; release advances the time at the
same revision with one upload-pack, the probe). Requests reaching origin:
cold 2 (probe, fetch into the Board ref), warm 1 (probe only). Timing, Apple
Git against a local-file origin at load ~19: cold ≈150 ms (69 ms probe +
80 ms fetch); warm 39–67 ms probe (41, 39, 67). Learning: Playwright will
not click an `aria-disabled` button, so the page object focuses and presses
Enter.

### 5. Recover a Refresh after origin changes

Type: Behavior
Status: planned

Behavior: With A shown and origin at B, Refresh keeps A and its time while
B is checked; a failed fetch or confirmation keeps A and its time and shows
the failure; a later Refresh publishes B and its time together; an earlier
automatic read cannot replace that confirmation.

Proof: E2E: with A rendered, hold B and fail before publication; verify A
and the failure, then recover to B; settle an automatic read begun before
the Refresh after it and check the shown time stays the Refresh's. Budget
14 active minutes.

## Story obligations

### G1. A failed confirmation write is not yet reported to the client
Reported: slice 3 — "On a failed record write it answers A with no failure reported to the client."
Story clause: "If B's fetch or confirmation write fails, A and its time stay and the failure is shown."
Disposition: receiving slice 5

## Concern review

Refinement not needed: the realignment kept five slices, each one outcome
and proof loop, building one model (one shared check, one fresh rule, one
commit point). This review found no remaining slice-specific concern.

## Local gate

Use slice-focused checks and Dashboard typecheck for the changed boundary.
Run long local checks fully awake on AC power under `caffeinate -s -i`.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the test conventions in [AGENTS.md](../../../AGENTS.md) before
authoring or changing proof.
