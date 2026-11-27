# Share one project refresh across Board and Review

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#share-one-refresh-across-board-and-review)

**Identity:** SEED-430#share-one-refresh-across-board-and-review

**Split from:** SEED-430#follow-published-progress-from-local-git
([plan 823](../823-follow-published-progress-from-local-git/PLAN.md)) on
2026-11-27: its former slices 2 and 7. The slices below are provisional
input for this story's refinement.

## Current decisions (carried from plan 823)

- Extend [Review repository](../../../dashboard/server/reviewRepository.ts)
  and its [bounded Git fetch](../../../dashboard/server/gitTargetFetch.ts).
  Match a project and authorized origin, the required refs, and freshness
  before joining a check; an uncovered demand shares the next eligible check.
  The subscriber that disconnects releases only its own wait.

## Premises and available baselines (carried from plan 823)

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Published comparison open and exact file admission | At `1c0272d6f`, `caffeinate -s -i npm run test:dashboard:backend -- story-review-completed-shared-fetch.spec.ts story-review-completed.spec.ts story-review-published-taken.spec.ts --workers=1 --reporter=line` passed 14 cases. Two Done opens shared a fetch. A renamed execution checkout still allowed the comparison and files, and Taken named file reads stayed local while origin moved. An unpublished local commit and an unlisted file remained refused. | Slice 3 exercises coalescing across Board and Review, including their different deadlines and branch demand. |
| Board check request count | Plan 853 slice 4 (2026-11-27, Apple Git against a local-file bare origin, load ~19): a cold Board check reached origin twice (`ls-remote` probe, fetch into `refs/open-dough/board/<branch>`), about 150 ms (69 ms probe + 80 ms fetch); a warm check whose confirmation record matched the advertised head reached it once (probe only, 39–67 ms). | Counting baseline for "one advertised check per covered demand"; local-file transport, not GitHub HTTPS, so timings are indicative only. |

## Ordered slices (provisional)

### 1. End stalled Review fetches through the owned transport

Type: Behavior
Status: planned
Correction from the [plan 853 retrospective](https://github.com/terryyin/open-dough/blob/07e7c56a89041f123d48d79a5dba7ddd23e72f7b/.planning/slice-plans/853-refresh-published-board-in-place/PLAN.md#execution-complete)
(pre-existing weakness that plan 853 slice 1 diagnosed for the Board check).
Behavior: Review's quiet sync (`dashboard/server/reviewRepositoryStorage.ts`)
and `fetchGitTarget` run remote transfers through `fetchGitTransport`, so an
aborted or stalled fetch ends with its transport helpers and releases the
repository's serialization slot. `runGitUntilClosed` stays for local
mutations only.
Proof: backend held-transfer cases for `syncedReviewRepository` and
`fetchGitTarget`, mirroring `dashboard/backend-tests/review/verified-origin-trunk-deadline.spec.ts`:
the gate process ends after the abort and the next sync starts; each fails
before the change.

### 2. Settle one record of what is current

Type: Structure
Status: planned
Change: the Board keeps `refs/open-dough/board/<branch>` plus its
confirmation record (`dashboard/server/boardConfirmation.ts`) while Review
keeps its tracking ref plus sync record; settle one record both read.
Enables slice 3.

### 3. Share a project refresh across Board and Review

Type: Behavior
Status: planned
Behavior: Given a Board check in progress and a Review open needing the same
evidence, both use the verified result; a Review with an additional required
ref joins the first eligible check covering it. File switching uses the
admitted comparison locally; a failed refresh preserves the readable
comparison or explains cold unavailability.
Proof: concurrently drive two Board tabs and Taken and Done Review opens;
count one advertised check per covered demand, fetch only changed or missing
objects, and assert zero remote operations for file switches. Retire
`holdLaterTrunkTransfers`' `reviewOnly` process-ancestry gate
(`dashboard/test-support/laterTrunkTransfers.ts`). `story-review-offline-sync.spec.ts`
timed out three cases at the 5 s default under a full backend run at load
11–13 while passing alone in 2.3–3.2 s; make its Review syncs independent
of machine load at this boundary without weakening its assertions.
