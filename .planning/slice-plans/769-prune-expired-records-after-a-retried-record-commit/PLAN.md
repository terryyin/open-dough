# Keep the expired-record prune when a record commit is retried

**Identity:** SEED-418#prune-expired-records-after-a-retried-record-commit
**Source:** [Keep the expired-record prune when a record commit is retried](../../seeds/SEED-418-review-published-session-changes.md#prune-expired-records-after-a-retried-record-commit)
**Provenance:** execution retrospective of
SEED-418#expire-published-session-records (plan 767, recoverable at
`16cebb43ec9588615183f7286427a62a3ee85a55:.planning/slice-plans/767-expire-published-session-records/PLAN.md`), reviewed commits `c86dd3425`, `e2747f65e`, `4f3b8db8a`,
`6c900c8d6` on `claude/expire-published-session-records-after-30-days`.

## Finding

`commitRecord` in
[`sealed-session-record.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/sealed-session-record.mjs)
runs `git rm` on the expired records and then commits with a pathspec of the
record and those paths. When that commit fails (for example a refusing
pre-commit hook), the close stops with its sealed record kept and the
deletions stay staged. On resume, `expiredSessionRecordPaths`
([`session-record-pruning.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record-pruning.mjs))
lists tracked files from the index and reads them from the working tree, so
the already-removed files are no longer candidates: the resumed commit holds
only the record, and `D <expired>` stays staged in the workspace.

Evidence: scratch Git probe in the retrospective (job tmp `rmprobe`):
`git rm old.json`, a failed then a retried `git commit -- rec.json` leaves
`D  old.json` in `git status --short`.

## Outcome and preserved promises

A resumed record commit after a failed one equals a first attempt's: the
record plus the removal of every expired record, and a clean workspace.
Preserve plan 767's promises: only readable records at their own UUID's path
with a readable close time are removed; unreadable files stay; pruning happens
only in a record commit that is made; a rerun after the commit prunes nothing;
earlier snapshots keep pruned files; session-record-only suffixes replay
without rename detection.

## Current decisions

- Select expired records from the committed snapshot the record commit builds
  on (`HEAD`'s tree and blobs), not from the index and working tree, so a
  removal already staged by a failed attempt is still selected.
- Remove selected paths so a path already removed is not an error, and keep
  them in the commit's pathspec.

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1: a failed record commit is reachable in a test | Read at `6c900c8d6`: `refusingCommits(t, fixture)` in `Distribution/tests/skills/dough-land/session-close-resume.test.mjs` installs a refusing `pre-commit` hook so the record stage throws after work acceptance, and the same test resumes the close. | The failure and resume are drivable on a real temporary origin. |
| Slice 1: the defect reproduces | Scratch Git probe, 2026-11-22 (see Finding). | A retried pathspec commit leaves the earlier staged deletion behind. |

## Outside-in proof

| Key example | Owner and signal |
| --- | --- |
| A close whose record commit is refused once, then resumed, publishes its record and removes the expired file in that commit; the workspace is clean | Slice 1: Distribution test beside `session-record-pruning.test.mjs` (reusing the refusing-commit fixture without growing the 259-line `session-close-resume.test.mjs`), red before the fix. |

## Slices

### 1. A retried record commit still prunes expired records

Type: Behavior
Status: done
Proof: a Distribution test on a real temporary origin: trunk holds an expired and a live record; the close's record commit is refused once and the close resumed; the accepted record commit removes the expired file, keeps the live one, and `git status --porcelain` in the workspace is empty. Fails on the current selection. The plan-767 pruning test and the session-record caller suites still pass.

Behavior: a close whose record commit failed after staging the prune → resume
→ the published record commit removes the expired records and leaves no staged
change.

Accepted proof (2026-11-22): the new test in
`Distribution/tests/skills/dough-land/session-record-pruning.test.mjs` failed
before the fix (the expired file stayed on origin) and passes after it; the
pruning, `session-close-resume`, `session-close-shared-checkout-resume`,
`session-record-publication` and `preparation-native-session-record-land`
suites pass through `scripts/test.sh`. Selection reads `HEAD:./<path>` so a
project below the Git toplevel resolves paths as `ls-tree` lists them
(scratch probe).

## Execution complete

Product advice: no change. The retried record commit now matches a first
attempt, which completes plan 767's pruning promise; the queued
SEED-418#recover-expired-session-reviews keeps its current priority.

## Concern evidence

Slice-plan refinement was not needed: one Behavior with one proof loop within
the 15-minute size. This review identified no remaining slice-specific concern.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for test data.
  Keep default timeouts and omit `test.slow()`.
- Run focused proof through `bash scripts/test.sh <paths>` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
