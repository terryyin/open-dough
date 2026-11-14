# CI layout measurements

This record evaluates fewer runner jobs with the same complete CI verdict.
It is maintained evidence for SEED-350, separate from the reusable allocator
and CI proof implementation, under ADRs [0002](../adrs/0002-software-development-lifecycle-principles-accepted.md),
[0008](../adrs/0008-project-dashboard-domain-and-architecture-accepted.md) and
[0010](../adrs/0010-definition-of-improvement-accepted.md).

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

## Acquisition and eligibility

Use dispatch attribution already established by `scripts/ci-repeat.sh`: list
existing matching workflow_dispatch runs, dispatch one checked ref, then claim
only a newly appearing matching ref/SHA run. Keep run ID and opaque attempt
identity. Its polling/stability report is not an A/B timing result. Check a
new run through its terminal event before starting a dependent episode.

For each run and exact attempt, retain GitHub's full run response, the exact
attempt's jobs response, artifact inventory, CI summary and all test-time,
fragment and Playwright record artifacts. The jobs endpoint currently exposes
`created_at`, `started_at` and `completed_at`; verify all three for every job
instead of substituting a step's timestamp. The run's `created_at` is the
origin, and the maximum required job `completed_at` is the final verdict.
Job queue seconds are `started_at - created_at`; setup and test-step timings
are diagnostic components already inside whole elapsed time.

An eligible run succeeded, has valid attempt bounds, and has complete declared
proof with no missing or ambiguous parts for all five Intent entries. Check
artifact run/attempt/revision identities and units. Compare selected file/case
identities and outcomes against the fixed baseline, not only passing totals.
Store raw evidence outside the checkout while acquiring it; retain a compact
durable table and proof inventory here so wrap-up keeps the decision evidence.

Read-only route probe, before experiment dispatch: exact-attempt jobs for
historical successful run `43561709759/1` exposed all three job timestamps;
the artifact inventory was readable. That unrelated older workflow is only an
acquisition probe, never the fixed-workload baseline or candidate evidence.
At the first load check, the newest twelve visible runs were completed; the
repository view gives no account-wide idle assertion.

## Run evidence

The [detailed run ledger](ci-layout-run-ledger.md) retains old-workload history,
exact-attempt acquisition, failed runs and replacement-workload samples. Per-run
[compact evidence](ci-layout-evidence/) retains job epochs and artifact identity.

## Candidate ledger

| Layout | Initial / total jobs | State | Evidence and limits |
| --- | --- | --- | --- |
| B: 3cc1495fa, Distribution 4, browser 6/5/1/4 | 21 / 22 | replacement acquisition pending | Frozen baseline alias, 645 checks, aggregate 694 |
| C: 567f05894, Distribution 3, browser 6/5/1/4 | 20 / 21 | unkept hypothesis | Same 645 checks, aggregate 926; block 1 recorded, no passing comparison |

Distribution 2/1, every browser group, combined reductions and physical packing
remain open for subsequent measured search. Old packing budgets and producer
boundaries establish no job-count floor. Predictions rank experiments only;
unmeasured combined layouts are unknown, never measured failures.

Rank candidates by fresh recorded work and bottleneck slack, retaining each
workflow diff and chosen count/budget values. Compare combined reductions with
the original baseline as well as intermediate winners, then recheck final
packing. Record measured, predicted-infeasible (with reasons) and unknown smaller
layouts. A greedy one-count-at-a-time failure proves no general lower bound;
the result is the smallest measured passing layout, never a global optimum.

## Replacement fixed workload — declared before its first result

The first candidate push, [43566037079/1](https://github.com/terryyin/open-dough/actions/runs/43566037079),
failed three aggregate budgets and one native per-check budget; all selected
checks and proof were complete. It is ineligible timing evidence. The
[budget review](ci-budget-calibration.md) records every failure and the repair.

While diagnosing it, trunk published `3cc1495fa128524d86f0189d6d6c59e7779fb386`,
including SEED-347's existing native-check split. Merge `fb788fb2a` absorbs
that published history. The replacement baseline is that exact trunk SHA:
four shares, aggregate 694, per-check 64. Its frozen remote alias is
`codex/seed-350-ci-baseline`, confirmed by `git ls-remote`; creating the alias
launched no CI run. Its matched candidate contains the
same workload and per-check protection, with three shares and reviewed
aggregate 926. The accepted candidate is `567f05894b0af0246252202a72195acc6ade0ec5`.
There are now 645 discovered checks, including both native entries; previews
give 160/161/161/163 checks at four shares and 217/214/214 at three.

Before any result on this replacement pair, retain the same comparison,
sampling and strict acceptance rules above with a ceiling of 40 manual runs
for this fixed workload. The earlier B1 manual run remains acquisition history,
so the overall manual ceiling is 41; the failed original push and replacement
operational push are additional explicitly recorded cost. Old-workload runs
cannot fill new matched blocks. A further workload-changing repair requires
reassessment rather than automatically renewing this budget. No failed run is
erased or converted to a timing win. Freeze/check both refs before dispatch.

## Fresh work ranking for later packing

Repaired operational C2, [43568511716/1](https://github.com/terryyin/open-dough/actions/runs/43568511716),
provides diagnostic slack only; matched B/C blocks still decide acceptance.

| Job | Exact job id | Runner seconds | Queue seconds |
| --- | --- | --- | --- |
| dashboard-integrated / shard 5/5 | 132367533844 | 287 | 2 |
| Distribution Tests (3/3) | 132367533677 | 236 | 1 |
| e2e / shard 3/6 | 132367533946 | 212 | 2 |
| dashboard-backend / shard 4/4 | 132367533842 | 210 | 1 |
| e2e / shard 1/6 | 132367533894 | 205 | 2 |
| e2e / shard 4/6 | 132367533930 | 197 | 2 |

The [exact C2 records](ci-layout-evidence/43568511716-attempt-1.jsonl) retain
job and setup epochs. Integrated 5/5 is the observed bottleneck; the shorter
Distribution/E2E/backend jobs offer hypotheses for later packing, not evidence
that a changed layout will preserve whole-run wall time.

The [shared fixed-workload roster](ci-layout-evidence/workload-3cc1495fa/index.jsonl)
retains source B run 43569186551/1 at 3cc1495fa: exact 2,828 case identities/outcomes
and 645 checks in 20 existing producer/part partitions. These baseline partitions
are provenance, not an allocation rule. Every matched run verifies the whole
case/check union and references its hashes; candidate counts may differ.

## First replacement block — observed, unkept

| Context | B verdict seconds | C verdict seconds | Comparison limit |
| --- | --- | --- | --- |
| Solo | 278 | 388 | C proof queued 116 s amid unmatched background work |
| Mixed B+C | 606 | 309 | C led by 1 s; a third workflow executed during both runs |
| Same-layout pair, first launch | 369 | 250 | BB had unrelated work at its start; CC was quieter |
| Same-layout pair, second launch | 489 | 483 | BB/CC creation offsets were 8/9 s; background differs |

All eight workflows succeeded with complete declared proof, the exact shared
roster/outcomes and four observed browser workers per shard. Their full queues
remain included. This is one collection block with comparison limits, not
repeated passing evidence or a causal layout win. The candidate stays unkept.
Stop before block 2 while the [separate protocol proposal](ci-layout-protocol-proposal.md)
awaits developer decision; the active strict rule and ceiling are unchanged.
The [ledger](ci-layout-run-ledger.md) retains every run, raw start offsets,
background job epochs, observation-command recovery and total resource cost.
