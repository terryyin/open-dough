# Bound a session's kept commits to its Done

**Identity:** SEED-379#bound-capture-to-done
**Source:** [Bound a session's kept commits to its Done](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#bound-capture-to-done)
**Source review:** [source-review.md](./source-review.md)

## Correction input

The completed execution of plan 700 was reviewed at
`a7a008a9f8473ded6a1bb0aa4f3c0cdf7d2dc8aa`. Its source promises the
session's commits through the Done named in the review. The server still
chooses the latest observed HEAD and filters only by launch time in
`dashboard/server/sessionCommitsCapture.ts`. The same lower-only window
predates this correction at `730571d29023631e33ef8bb8da3260fa6eb1fcd7`.
Plan 700 made the later Done obtain a fresh read. The time a read settles
identifies the current capture for admission, but cannot bound which work
the checkout wrote by the durable Done.

Observed on 2026-11-18 on the AC macOS execution host. In a scratch copy
of the first test in `dashboard/backend-tests/review/ad-hoc-session-commits-pending-done.spec.ts`,
keep the original first and second commits, acknowledge the second quiet
report, and wait for `checkoutLog.isHeld`. Commit `after-done.txt` then
release the real Git log command. The review returned the third commit as
its tree while naming the earlier Done. The assertion on the second tree
failed with exit 1. The test used the existing future-dated fixture for
the first two commits and a later fixture date for the third. The receipt
and held-read cue establish the order of the operations. The scratch file
was removed after the run.

## Preserved behavior and current decisions

- Use the current durable Done and existing checkout evidence. A trustworthy
  boundary can keep the commits already present when Done was written. When
  a boundary is unresolved, the existing not-captured answer claims no commits.
  Git's reflog has whole-second times. Account for ambiguous ordering before
  using timestamps as exact evidence.
- The report acknowledgement keeps its existing ownership of the durable
  mark and native continuation. Later successful captures, exact receipt
  retry, pending capture visibility, current run/file admission, shared
  checkout context and session-ref cleanup retain their promises.
- An ordinary empty result still says the session made no commits. Existing
  exclusions for merges, earlier replayed work and uncommitted changes stand.
  The comparison still uses the saved repository. No separate landing or
  uncommitted review work is selected.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  governs local evidence. No North Star topic applies.
- Capture settles checkout `HEAD` with `git rev-parse HEAD` before the held
  `git log -g` read and keeps only ancestors of that tip. Dated fixtures set
  reflog times via committer date, so a Done-wall-clock upper bound on log
  `at` would exclude them; tip-before-log fixes the held-log race without that
  comparison. Launch lower bound still uses whole-second log times only.

## Ordered slices

### 1. Keep the review through the durable Done

Type: Behavior
Status: done
Budget: 15 active minutes, excluding commands.

Use the actual Done evidence for the checkout capture. Keep the second
commit as the review tree when a distinct third commit arrives after the
second quiet receipt but before the held read starts collecting the log.
In the unresolved-boundary case, retain the not-captured explanation. Use
the same ownership in manual Done and quiet or retried continuation. A
later durable Done can capture the third commit normally.

Proof: use the existing held real Git read and HTTP review setup in
`dashboard/backend-tests/review/ad-hoc-session-commits-pending-done.spec.ts`.
Check the stated Done, the exact tree and the absence of the later file.
Cover a later Done that does include the third commit. Preserve independent
timestamps and actual ordering in the case. If the chosen boundary uses
log timestamps, give the dated Git fixture a time range that belongs to
the durable marks and distinguish the unresolved same-second case. Do not
test elapsed time with sleeps. Scratch fault: use the current log head in
place of the Done boundary, which admits `after-done.txt` to the earlier
comparison. Restore and pass.

Run the changed specs, `backend-tests/review/ad-hoc-session-commit*.spec.ts`,
`backend-tests/review/ad-hoc-review*.spec.ts`,
`backend-tests/review/kept-commits-release*.spec.ts`, and
`backend-tests/sessions/agent-launch-done*.spec.ts` under the strict
dashboard backend config. Use the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for other affected paths, apply the shared test-entry selection and MakeMe
convention, and run `npm run lint` and
`npm run --silent typecheck:dashboard`. Keep default test timeouts and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Local gate uses `caffeinate -s -i` on awake macOS on AC power. On battery,
use the maintained open-lid `caffeinate -i` procedure and sleep-log read
under [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

## Plan review

Split refinement was unnecessary because the Done boundary and its
negative observation are one behavior at the same HTTP entry. The existing
held Git seam establishes the decisive ordering and the actual review
answer. If the whole-second log cannot settle an observed boundary, the
same slice owns the unavailable answer instead of assuming an order.
