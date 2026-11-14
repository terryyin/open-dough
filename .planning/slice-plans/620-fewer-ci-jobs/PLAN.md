# Keep a practical first CI job reduction

**Source:** [developer-amended story](../../seeds/SEED-350-fewer-ci-jobs.md#run-ci-on-fewer-jobs)
**Source review:** [independent commitments](source-review.md)
**Identity:** SEED-350#run-ci-on-fewer-jobs

## Developer-directed early closure

On 2026-11-14 the developer explicitly selected a reasonable first reduction and
the meaningful report fix, ended this campaign, and transferred the remaining
job-reduction goal and reconsideration of its approach to SEED-355. Configuration/
data-only test cleanup is SEED-354, first in the queue; SEED-355 is second.
The prior four-loop plan is recoverable at e4a24ce97, not silently completed.
No minimum or proven no-slower-overlap claim is part of this bounded closure.

## Ordered slices

### 1. Keep the practical reduction and reporting fix, and queue the rest
Type: Behavior
Status: done

Keep Distribution 3, browser groups 5/4/1/3, and lint/typecheck on frontend:
16 initial runner jobs plus one proof job, down from 21 initial /22 total.
Reuse main c652's run-stamped HTML directories. Preserve all meaningful case/
check coverage and proof. Remove the three new configuration-string assertions.
Retain real report-isolation proof; queue, but do not execute, the two follow-ups.

Accepted proof: exact repair e4a24ce97, CI 43590100212/1, passed and retained
652 checks/2829 case identities/outcomes, producers, units and complete parts.
Lint/typecheck/frontend suite each executed successfully once. Stamped parent
selection retained 13 parent reports and four child dispositions. Local CI-mode
proof passed 14/14 cases; independent refactor returned COMPLETE without edits.
Intent Coverage caught a shared-report-folder fault and verified restoration.
See durable measurements and report-ownership-repair evidence under docs/maintainer.
Deleting the three added static assertions changes no product behavior; the
original traced H1 test owner covers this small deletion. New backlog/closure
records are records-only. No additional performance experiment is authorized.

Local gate: supported focused checks already passed on AC under `caffeinate -s -i`
(`-s` applies on AC), as maintained in
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
The [failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies as written.
Final combined trunk CI remains the landing lifecycle gate.

## Execution context

Story-branch, origin/main; publisher dashboard-territory.local-open-dough,
agent aki-chan. Accepted Take d21aaf78c60ee03fb08f382397f2b6a4ea3270b1;
starting revision c4117d407650eb1e037d1b0082f103699825cd5b. Current published
code e4a24ce97ac855b5c81b0dfbe174aefcd0022c68; no new Take. Source freshness
was unchanged at 283f1052bd0ac292b735ccba559cde73b0005d89 before adoption.
Owned checkout/branch are the established run-ci-on-as-few-jobs worktree.
Observer GrK9yt, coordinator aki-chan-seed350, PID38969, yielded cell g207:9,
stream29972; retain exact handles for the required branch-to-trunk transition.
Original repair stash was verified restored and only its own entry dropped.
Default checkout /Users/terryyin/git/open-dough is preserved by shared publication.

## Story obligations

### G1. Complete candidate proof and matched comparisons
Reported: slice 1 — "B1 baseline acquisition passed; candidate exact hosted proof and repeated solo, mixed and equivalent two-run comparisons remain unobserved."
Story clause: "Use matched concurrent comparisons and repeated samples to distinguish layout effects from runner noise."
Disposition: owner changed "Adopt the 17-job layout as a reasonable first reduction; do not require proof of the smallest count or matched no-worse overlap for this early close."

### G2. Concurrent proof commands corrupt caller HTML evidence
Reported: slice 1 — "CI diagnostic for 43585259072/1 names runner-ownership.spec.ts:164 failing when a concurrent child reads a missing frontend HTML report; a later passing peer does not repair it."
Story clause: "This restriction protects the confidence the developer receives with the verdict."
Disposition: proved by slice 1: docs/maintainer/ci-layout-evidence/report-ownership-repair-20261114.jsonl, exact e4 CI 43590100212/1 and unchanged full union; meaningful fault caught/restored by Intent Coverage.

## Execution complete

Product advice: retrospective skipped for the developer-requested early closure.
The developer selected SEED-354 first and SEED-355 second; retain the actual
measurements and uncertainty, adopt the practical reduction, and do not execute
the follow-ups or extend the campaign during this closure.
