# Expire published session records after 30 days

**Identity:** SEED-418#expire-published-session-records
**Source:** [Expire published session records after 30 days](../../seeds/SEED-418-review-published-session-changes.md#expire-published-session-records)
**Split from:** SEED-418#attribute-every-workflow-session-record (plan 747) at delivered slice 7 on 2026-11-22

## Goal and scope

Published session records stay current while no more than 30 days have passed
since their sealed `closedAt`, by the done records' window rule. Expired
records leave Recently done and the UUID review route, even while their file
remains. Every session-record commit also removes expired record files from
the current snapshot; live records, including a concurrent writer's, survive,
and earlier Git snapshots keep the pruned files.

Exclusions: recovery and explanation of expired sessions from history
([Recover expired session reviews](../../seeds/SEED-418-review-published-session-changes.md#recover-expired-session-reviews));
pruning by publications that commit no session record; recomputing a prune
after a rebase (a record that expires meanwhile waits for a later close, and
reads already hide it).

## Current decisions

- One rule owns currency: `session-record.mjs` exposes the session record's
  window check by reusing `isWithinDoneWindow` from
  [`product-backlog-done-record.mjs`](../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs)
  (inclusive at exactly 30 days), so done stories, kept launches and published
  sessions share one window. The listing, the UUID route and pruning all call it.
- The server review takes the current time as a typed input of
  `storyReview` (and file admission), not an ambient clock, under the
  [North Star on directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  An expired record answers exactly as an absent one (the existing 404
  "This project published no such session.").
- Recently done filters the listed published sessions beside
  `recentDoneRecords(done, now)` in `recentlyDoneView.ts`, so `newestFirst`
  receives only current records.
- Pruning happens only inside `commitRecord` in
  [`sealed-session-record.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/sealed-session-record.mjs),
  in the same commit as the record, and only when that commit is made: a rerun
  that finds the record already committed prunes nothing and leaves the
  working tree clean. The commit's pathspec includes the pruned paths. A file
  that is not a readable record at its own UUID's path stays, as unreadable
  done records do. `publishSealedRecord` gains the `now` that
  `publishSessionClose` and `resumeSessionClose` already accept, so the
  Trunk Mode wrap-up and Land closes share it.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  holds: published history on origin still carries every record; no conflict
  with an Accepted decision was found.

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1: UUID review and file reads go through one record read | Read at `ff7c92ff2`: `publishedSessionReview` and `admitPublishedSessionFile` both call `publishedSessionRecord` (`dashboard/server/publishedSessionReview.ts`). Baseline `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- review/published-session-review review/published-session-listing` at `ff7c92ff2`, 2026-11-22. | 3 files, 29 tests passed; the route reads a recorded pair after trunk advances. No expiry boundary exists yet. |
| Slice 2: Recently done shows published sessions only through `newestFirst` | Read at `ff7c92ff2`: `useRecentlyDone` is the only place that passes listed sessions on for display (`dashboard/src/recentlyDoneView.ts:150-159`); `recently-done-published-session-launch.spec.ts` already unit-tests `newestFirst` with built records. | The filter point and a pure-function proof route exist. |
| Slice 3: a pruning record commit rebased onto an advanced trunk keeps a concurrent live record and tolerates the same file already pruned | Plain `git rebase` in a scratch repository (job tmp), 2026-11-22: case A trunk added a live record; case B trunk added one and deleted the same expired file. Proxy for the product's `product-backlog-git-rebase.mjs rebase --onto`: that adapter runs the same `git rebase` and gates only the backlog file (`acceptCleanRebase(repoRoot, file, …)`), which session files never are, so the difference cannot change this outcome. | A: live, mine and other's records kept. B: both live records kept, expired file absent, no conflict; the replayed commit only added its own record. |
| Slice 3 proof route: real temporary origin, advanced trunk, `needs-validation` rerun | `node --test --test-reporter=tap Distribution/tests/skills/dough-land/session-close-resume.test.mjs` at `ff7c92ff2`, 2026-11-22 (includes "a refused record push resumes after trunk advances…"); `bash scripts/test.sh` on it and `session-record-publication.test.mjs` exited 0. | 6/6 pass; the fixture reaches the rebase-and-validate path the slice extends. |

## Outside-in proof

| Key example | Owner and signal |
| --- | --- |
| Listed and reviewable just before 30 days; gone from listing and UUID route just after, with the file still present | Slices 1–2: backend review spec with `now` either side of `closedAt + 30 days`; frontend listing unit spec likewise. |
| Commit time differs from `closedAt` | Slice 1: record committed later than its `closedAt` still expires by `closedAt`. |
| A close removes only the expired file; the earlier commit still holds it | Slice 3: Distribution test on a real temporary origin compares the accepted tree with the previous snapshot. |
| Concurrent writer publishes a live record and prunes the same file | Slice 3: same test advances trunk before the record push, then reruns with `validatedCandidate`. |

## Slices

### 1. Expired published sessions are not reviewable by UUID

Type: Behavior
Status: planned
Proof: `dashboard/backend-tests/review/published-session-review.spec.ts` gains cases at `closedAt + 30 days` (reviewable) and just past it (refused 404 for review and file read), with the record's commit dated later than `closedAt`; fails without the window check.

Behavior: a published record whose file exists at the fetched revision →
review or file read by its UUID at a given `now` → reviewable while within the
window, answered as an unpublished session once past it.

### 2. Recently done omits expired published sessions

Type: Behavior
Status: planned
Proof: a frontend unit spec beside `recently-done-published-session-launch.spec.ts` lists a current and an expired published record through the Recently done selection at a fixed `now`; only the current one is listed. Fails without the filter.

Behavior: a listing that holds an expired and a current record → Recently
done builds its entries → only the current record is placed; a kept launch
standing for a UUID keeps its own lifecycle.

### 3. Session-record commits prune expired records

Type: Behavior
Status: planned
Proof: a Distribution test beside `session-close-resume.test.mjs` on a real temporary origin with a controlled `now`: trunk holds one expired, one live and one malformed record file; after the close, the accepted tree has the new and live records and the malformed file, not the expired one, and the previous commit still has it. A second case advances trunk with another writer's live record and its own prune of the same file before the record push, then reruns with `validatedCandidate`; trunk keeps both live records. A rerun after the record commit leaves the working tree clean.

Behavior: a close with expired records on trunk → its session record is
committed and published → the same commit removes the expired files, and
nothing live is lost.

## Concern evidence

Slice-plan refinement was not needed: three independent Behaviors with
separate proof loops, one shared rule, each within the 15-minute size. This
review identified no remaining slice-specific concern.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for test data
  (`makeMe.aSessionRecord` gains a close time where needed). Keep default
  timeouts and omit `test.slow()`.
- Run focused proof through `bash scripts/test.sh <paths>` and
  `npm run --silent test:dashboard:backend -- <specs>` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
- Use `caffeinate -s -i` on AC power for long local runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
