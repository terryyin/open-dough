# CI layout measurements

This record evaluates fewer runner jobs with the same complete CI verdict.
It is maintained evidence for SEED-350, separate from the reusable allocator
and CI proof implementation, under ADRs [0002](../adrs/0002-software-development-lifecycle-principles-accepted.md),
[0008](../adrs/0008-project-dashboard-domain-and-architecture-accepted.md) and
[0010](../adrs/0010-definition-of-improvement-accepted.md).

## Prospective protocol — 2026-11-14

The developer approved the smaller staged route after reviewing the first block:
use retained CI timings to rank layouts, choose one strongest candidate, then
perform at most six experiment workflows. The earlier
[40-run method](ci-layout-prior-protocol.md) remains historical; the
[48-run proposal](ci-layout-protocol-proposal.md) was not adopted.

First model all Distribution counts, browser groups and useful lint/proof
placement using existing complete CI artifacts and the maintained share dealer.
Retain job counts, work/critical-path estimates, setup costs, uncertainty and
selection/proof checks. No local benchmark or unchanged full-suite run is needed.
Case/file time totals rank candidates; they cannot certify final wall time.

Pin B to current four-share trunk at
`55da0eecf6803945b66d5a23b00dd7802374550d`, frozen as
`codex/seed-350-ci-screen-baseline`, and select C only after the ranking.
Their product/test workload, lockfile, runner class and worker policy must match.
Refresh the existing timing lists from complete CI evidence when needed, retaining
normalization and their source. Record unobserved actual Distribution slots as a
visibility limit. Review packing-dependent aggregate budgets; retain per-check
protection, all tests, logical producers, units and missing-part reporting.

Before launch, record the chosen candidate and exact diff. The six-run screen is:

1. One B solo workflow_dispatch run, then one C solo run. C's first accepted push
   is its solo observation, saving a redundant dispatch; verify that the only
   event-dependent behavior is cancellation grouping, and never supersede it.
2. One B+B episode, then one C+C episode, each through a single two-repetition
   helper. At most two owned runs are active; never launch all four together.
3. Keep every workflow creation-to-last-required-completion interval, queue,
   setup, launch offset, visible background run and exact-attempt proof artifact.

Inspect visible repository activity before episodes and sequence by observed
completion, preserving account-wide visibility limits. A background mismatch
makes the affected comparison inconclusive; retain it and count its cost.
Do not cancel or reserve others' work, replace unfavorable observations or renew
the six-run cap automatically. Necessary defect repair follows the repository's
[failure policy](../../AGENTS.md#failing-and-flaky-tests), with actual recovery
cost recorded separately and dependent comparisons stopped if workload changes.

This is an exploratory screen, never adoption evidence. A promising screen needs
successful complete proof and no slower observed C solo, either matched C+C
launch position, or C+C slowest verdict, with comparable background conditions.
An omitted/changed proof unit rejects the candidate; slower or unmatched/noisy
observations keep it unkept without overstating causality. After six runs,
reassess whether bounded additional repetitions are worth their cost. Mixed B+C
runs are diagnostics, not an unconditional raw-sign acceptance gate. The story's
final convincing no-worse requirement in both contexts and remaining search
promises are unchanged.

## Acquisition and eligibility

Selected for the approved screen: H1 from the
[artifact ranking](ci-layout-packing.md), counts 3/5/4/1/3, refreshed weights
and lint cohosted on the existing frontend producer. It has 16 initial / 17 total
jobs, versus B's 21 / 22. The 272–280-second queue-free estimate is a hypothesis;
its headroom is smaller than observed variation. Freeze this choice before B's
first screen dispatch; the exact C publication will supply its immutable SHA.

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

## Prior candidate ledger

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

## Prior replacement workload — historical

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
This campaign stopped before block 2. The developer subsequently approved the
artifact-first six-run screen above; its results will not rescue this block.
The [ledger](ci-layout-run-ledger.md) retains every run, raw start offsets,
background job epochs, observation-command recovery and total resource cost.
