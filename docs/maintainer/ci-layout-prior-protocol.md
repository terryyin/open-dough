# Prior CI comparison protocol — historical

This was the prospective method for the first campaign. It was stopped after
one confounded replacement block and is superseded by the developer-approved
artifact-first six-run screen in [the measurement record](ci-layout-measurements.md).
No prior observation is reclassified as a passing layout comparison.

## Prospective protocol — 2026-11-14

Recorded before dispatching or reading results of an experiment run. The
beneficiary is a developer waiting for the complete verdict. Keep a reduction
only with convincing no-worse evidence both alone and under equivalent two-run
load. There is no positive regression allowance. Faster individual jobs,
runner-seconds or a queue-free dependency chain cannot satisfy this decision.

The original pair below is retained history; the replacement fixed workload
at the end of this protocol governs new samples. Original baseline B is the
four-Distribution-share layout at
`d21aaf78c60ee03fb08f382397f2b6a4ea3270b1`, initially reachable at
`codex/run-ci-on-as-few-jobs-as-its-wall-time-allows`. It has 21 initial jobs
and 22 total jobs: lint, four Distribution shares, browser groups of 6/5/1/4,
then ci-proof. Before the ref changes, retain an immutable reachable baseline
ref or use the exact SHA if GitHub accepts that dispatch input. Never dispatch
a moving ref without checking its remote SHA first.

First candidate C changes only Distribution's 4→3 share count and the declared
proof part count, plus contract assertions reflecting that count. Keep its
exact SHA, diff and selected-identity comparison before dispatch. Use the same
test workload, lockfile, ubuntu-24.04 runners, CPU-derived workers, test
settings and dependencies as B. Changes to test behavior beyond count-dependent contract expectations, or a
needed defect repair, invalidate the comparison: obtain a newly matched successful baseline with
that repair rather than attributing changed work to runner placement.

The hosted proof owner is the executing slice agent; publication is owned by
the coordinator. At most two owned experiment runs may be active. Other
executions' runs are neither cancelled nor reserved against. Inspect visible
repository runs before each block and retain every overlap with unrelated
work. Repository visibility cannot establish account-wide idleness or verify
the supplied 20-job account limit. Local CPU/memory figures cannot establish
GitHub runner headroom.

Before reading the first candidate result, classify its automatic push run as
operational acquisition only, excluded from paired timing samples. The only
event-dependent behavior found is the concurrency group: dispatches are
independent while pushes share a branch cancellation group. Use workflow_dispatch
for both arms' timing samples. Count the extra push run and its measured cost
separately from the 40-dispatch comparison ceiling; it cannot replace a sample.

### Blocks and ceiling

Start with an acquisition probe: one B run, verified through completion and
full exact-attempt artifacts. It may be the first solo observation only if its
conditions match. Stop dependent dispatches if attribution, timestamps, proof
or successful fixed-workload CI cannot be obtained. Do not spend a repeated
sample budget before this route works.

Each complete matched block contains eight runs, sequenced by observed run
completion rather than a fixed delay:

1. Solo B and solo C, alternating B/C order between blocks; only one owned
   experiment is active. Record visible unrelated activity.
2. Mixed concurrent B+C, alternating which arm is dispatched first; retain
   both creation timestamps and the launch offset.
3. Concurrent B+B and concurrent C+C as separate two-run episodes, alternating
   episode order between blocks. Never launch all four arms together. Retain
   both verdicts and their start offset in each episode.

Collect at least three complete matched blocks per candidate before any
passing comparison. An eligible probe counts toward that budget, not in
addition to it. Inspect paired differences, individual slow samples and queue
timings, not only fastest samples or medians. Extend promising or uncertain
comparisons by complete blocks to five blocks maximum. This first comparison's
ceiling is 40 dispatched runs, including acquisition probes and unsuccessful
runs; thus failures can leave fewer complete blocks and an inconclusive result.
Before later candidates, retain the original baseline and any intermediate
winner and declare their own bounded comparison budget. The first comparison
does not cancel the whole-workflow search.

For a conservative pass, require five complete matched blocks with all five
solo paired candidate-minus-baseline differences strictly negative; all five
equivalent-load slowest-verdict differences strictly negative; no slower
candidate verdict at either matched launch position in the B+B/C+C episodes;
and all five mixed-pair differences nonpositive after inspecting launch-order
and background-load imbalance. Five strict paired decreases have a one-sided
sign-test probability of 1/32 under an exchangeable no-effect hypothesis.
This is supporting evidence, not a guarantee for unobserved future workloads.
Also require the candidate's worst observed solo and equivalent-load verdict
not to exceed the corresponding baseline worst, and every preservation check.
The rule deliberately claims less when queue noise or launch imbalance prevents
an interpretable comparison; it grants no regression tolerance.

Consistent slower complete verdicts after three complete blocks can reject a
candidate without consuming the five-block pass budget. Mixed signs, ties,
unmatched background load or missing evidence at the ceiling are inconclusive:
retain the incumbent, make no speed claim, and leave the dependent search
unfinished. An unsuccessful or incomplete run is never a timing win; diagnose
and repair under the repository's [failure policy](../../AGENTS.md#failing-and-flaky-tests).
Never rerun until green as a fix. Preserve all failed samples and repair
ownership. Reconsider load and acquisition assumptions before another costly
attempt following a failure.
