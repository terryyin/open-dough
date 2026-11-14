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

Baseline B is the four-Distribution-share layout at
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

## Run ledger

Raw acquisition root: `/tmp/seed350-ci-layout-20261114`. The pre-dispatch
protocol copy, matching before/after run lists and load snapshot are retained
there. All initial visible runs were completed; account-wide load is unknown.

| Arm / block / context | Revision | Run / attempt | State | Initial / total | Created UTC | Last completion / seconds | Proof / load |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B / 1 / solo acquisition | d21aaf78c | [43564792953](https://github.com/terryyin/open-dough/actions/runs/43564792953) / 1 | success | 21 / 22 observed | 2026-11-14 06:07:38 | 06:13:17 / 339 s | all 20 parts present; only this run active in repository view |

Keep exact per-job creation/start/completion timestamps, setup, launch offsets,
selected identities and artifacts for every attempt, including unsuccessful
ones. Count only acquired jobs when reporting an observed total; declared
counts above remain predictions until the completed inventory confirms them.

Allocation proof before candidate dispatch: the real discovered 644 check
identities deal as 159/161/161/163 at four shares and 216/214/214 at three.
Sorted unions are equal, with every identity appearing exactly once in either
allocation (`selection-4-vs-3.json` at the raw root). The supported four-check
workflow/proof command in the plan passed on the unchanged baseline under
Bash 5 and `caffeinate -s -i` on AC, exit 0.

## Candidate ledger

| Layout | Initial / total jobs | State | Evidence and limits |
| --- | --- | --- | --- |
| B: Distribution 4, browser 6/5/1/4 | 21 / 22 | acquisition passed | B1 is one eligible solo observation; no comparison claim |
| C: Distribution 3, browser 6/5/1/4 | 20 / 21 | unkept hypothesis | Same 644 discovered checks; no hosted comparison yet |

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

## First exact-attempt acquisition

B1 succeeded with 3,596 runner-seconds, maximum job queue 78 s. Its proof
job was created 06:12:52Z, started 06:12:55Z and completed 06:13:17Z:
all 3 s of proof queue plus its 22 s execution remain inside the 339 s verdict.
The 58 listed, unexpired artifacts were all downloaded (20 fragments, 20 time
reports, 16 Playwright reports, summary and frontend proof). Summary metadata
matched repository, SHA, run and attempt, schema validation passed, and every
declared part was present with none missing or ambiguous.

| Entry | Unit / parts | Passed / failed / other | Reported files |
| --- | --- | --- | --- |
| e2e | case / 6 | 561 / 0 / 1 | 307 |
| dashboard/tests | case / 5 | 627 / 0 / 0 | 275 |
| dashboard/frontend-tests | case / 1 | 161 / 0 / 0 | 62 |
| dashboard/backend-tests | case / 4 | 1455 / 0 / 7 | 434 |
| Distribution | file / 4 | 643 / 0 / 0 | 643 |

All 2,812 browser case identities were extracted from the HTML reports’ embedded
report.json, with no duplicated group/file/project/title/path identity: 562 E2E,
627 integrated, 161 frontend and 1,462 backend. Their outcomes were 2,804
expected and eight explicitly skipped (one E2E, seven backend), matching all
eight summary “other” outcomes; none was unfinished or unexpectedly failing.
These existing skips are retained as observed outcomes, not invented passes.
The Distribution entry covers 643 check files; the 644th discovered check is
`scripts/check-self-installation.sh`, outside that declared Intent entry.
The real allocation union still preserves all 644.

Reproduction/acquisition commands: `gh api repos/terryyin/open-dough/actions/runs/43564792953`,
`gh api repos/terryyin/open-dough/actions/runs/43564792953/attempts/1/jobs --paginate`,
`gh api repos/terryyin/open-dough/actions/runs/43564792953/artifacts --paginate`,
and `gh run download 43564792953 --repo terryyin/open-dough --dir DEST`.
Read the attempt-named summary with the maintained `summaryProblems` validator;
check each evidence part’s status independently of the green summary job.
The per-job epochs and setup-step timings are retained in B1-measurements.json
at the raw root; case identities and complete artifact inventory are alongside it.

Local trial preparation changes only the Distribution matrix/declaration and
the proof replay test’s expected missing-part count. With only the YAML edit,
ci-proof-actions.test.mjs failed on its obsolete fourth missing part; the
expectation was adapted to three. The four named contract checks and the reached
test-runner-deadline-cutoff.test.mjs then passed under supported Bash 5, AC
and `caffeinate -s -i`. No test, timeout or budget was removed or relaxed.
Hosted candidate proof and all matched comparisons remain pending.

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
aggregate 926. The actual accepted candidate SHA will be recorded on publication.
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
