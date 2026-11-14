# Source-only review

Launch: fresh general-purpose agent `/root/source_review`, `fork_turns: none`,
2026-11-14. The launch supplied only the original story title, Goal, Scope,
Deferred promises and six Key examples, with instructions to read no project
files, change nothing and derive individually numbered commitments. The agent
confirmed no files were read or changed. Its returned clauses are retained below.
Allocation is the coordinator's subsequent judgment; observations remain open.

Qualifications: main and Story Branch are alternative push contexts. All counts,
placements and budgets are open, without a 19/18-job floor; every category need
not shrink. Sampling method and threshold are unspecified. The queue-free chain
is diagnostic only. Neither better overlap nor shorter jobs compensates for a
slower solo verdict. Inconclusive evidence cannot pass. The minimum is measured,
not mathematical. Reviewed budgets may accommodate repacking; an increased
timeout alone proves no improvement. Examples do not restrict candidate counts.

Journeys: four-to-three shares keeps checks/proof and continues searching;
earlier browser completion with later queued proof is rejected; better throughput
with slower solo is rejected; two-share budget repacking is reviewed and measured;
missing proof/changed units/lost cases is rejected and repaired; indistinguishable
noise retains the incumbent without a speed claim.

Exclusions: speeding up/removing tests, changing runner allowance/buying runners,
dashboard presentation, automatic layout optimization. Naturally supported counts
remain permitted; no new count rejection rule.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Deliver CI’s complete verdict after a push to main or a Story Branch. These are alternative triggering contexts. | slice 3 |  |
| 2 | Avoid increasing the developer’s wait for that verdict. | slice 3 |  |
| 3 | Occupy as few runner jobs as measured evidence supports. | slice 3 |  |
| 4 | Leave capacity for overlapping pushes. | slice 3 |  |
| 5 | Prevent job counts growing merely because an individual job became shorter. | slice 4 |  |
| 6 | Pursue runner-job reduction across the whole workflow. | slice 3 |  |
| 7 | Use a fixed current-layout baseline. |  | G1 |
| 8 | Compare each candidate on the same test workload as that baseline. |  | G1 |
| 9 | Compare candidates running alone. |  | G1 |
| 10 | Compare candidates overlapping another run. |  | G1 |
| 11 | Use matched concurrent comparisons. |  | G1 |
| 12 | Use repeated samples to distinguish layout effects from runner noise. |  | G1 |
| 13 | State the comparison rule before measuring. | slice 1 | observed: docs/maintainer/ci-layout-measurements.md prospective protocol; pre-dispatch protocol copy and dispatch receipt in /tmp/seed350-ci-layout-20261114 |
| 14 | State the sampling rule before measuring. | slice 1 | observed: docs/maintainer/ci-layout-measurements.md prospective protocol; pre-dispatch protocol copy and dispatch receipt in /tmp/seed350-ci-layout-20261114 |
| 15 | Measure wall time from workflow creation through completion of the last required job. |  | G1 |
| 16 | Include setup in that measurement. |  | G1 |
| 17 | Include runner queues in that measurement. |  | G1 |
| 18 | Include lint in that measurement. |  | G1 |
| 19 | Include ci-proof in that measurement. |  | G1 |
| 20 | Report initial parallel jobs. |  | G1 |
| 21 | Report total runner jobs separately from initial parallel jobs. |  | G1 |
| 22 | Require evidence of no worse solo wall time before keeping a reduction. | slice 2 |  |
| 23 | Require evidence of no worse overlapping wall time before keeping a reduction. | slice 2 |  |
| 24 | Retain reductions that pass the comparison. | slice 3 |  |
| 25 | Record rejected candidates’ measurements. | slice 3 |  |
| 26 | Record rejected candidates’ comparison limits. | slice 3 |  |
| 27 | Record inconclusive candidates’ measurements. | slice 3 |  |
| 28 | Record inconclusive candidates’ comparison limits. | slice 3 |  |
| 29 | Finish on the smallest job count that passed the measured comparison. | slice 3 |  |
| 30 | Make the search visible. | slice 3 |  |
| 31 | Make the search’s exclusions visible. | slice 3 |  |
| 32 | Consider combined reductions. | slice 3 |  |
| 33 | Consider packing work together. | slice 3 |  |
| 34 | Continue the search beyond the first one-share reduction. | slice 3 |  |
| 35 | Preserve every test. | slice 3 |  |
| 36 | Preserve CI proof for those tests. | slice 3 |  |
| 37 | Preserve selected-file coverage. | slice 3 |  |
| 38 | Preserve selected-case coverage. | slice 3 |  |
| 39 | Preserve outcomes. | slice 3 |  |
| 40 | Preserve producer identities. | slice 3 |  |
| 41 | Preserve units. | slice 3 |  |
| 42 | Preserve missing-part reporting. | slice 3 |  |
| 43 | Preserve timing evidence. | slice 3 |  |
| 44 | Preserve artifacts. | slice 3 |  |
| 45 | Document the job-addition rule in AGENTS.md. | slice 4 |  |
| 46 | Document that rule in browser shard sizing guidance. | slice 4 |  |
| 47 | Document that rule in Distribution share sizing guidance. | slice 4 |  |
| 48 | Permit an additional runner job only when measured whole-run wall time shows a benefit. | slice 4 |  |
| 49 | Include queueing under the account limit in that job-addition evidence. | slice 4 |  |
| 50 | Update sizing guidance for the chosen layout. | slice 4 |  |
| 51 | Update budget guidance for the chosen layout. | slice 4 |  |
