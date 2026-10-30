# Source review — SEED-185#stable-ci-time-budget

Launch: fresh general-purpose reviewer, source-only inputs (Goal, Scope, key
examples, exclusions from `.planning/seeds/SEED-185-stable-ci-time-budget.md#stable-ci-time-budget`).
No plan, product, proof, or conversation inheritance.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | On CI, each split job measures its runner's speed from its own run as the median, over its jobs recorded in `tests/longest-first` that have a measurable recorded time, of (observed seconds ÷ recorded seconds). | slice 1 | observed: `scripts/share-deal.mjs` `runnerFactor`; `scripts/test-budget.sh` calls `test-shares.mjs runner-factor`; `tests/support/share-deal.test.mjs` median case; `tests/test-runner-budget.sh` slow-runner / concentrated |
| 2 | Both ceilings judge times divided by that runner-speed factor, so judged times are in the recorded list's runner-speed unit. | slice 1 | observed: `scripts/test-budget.sh` awk `at_recorded = $1 / factor` and `total_at = total / factor` vs ceilings |
| 3 | A change that adds no test time passes on a slow runner. | slice 1 | observed: `tests/test-runner-budget.sh` slow-runner case (uniform 2× recorded; exits 0, silent) |
| 4.1 | A breach line names the observed time | slice 1 | observed: `scripts/test-budget.sh` breach printf; `tests/test-runner-budget.sh` concentrated / unavailable expect lines |
| 4.2 | A breach line names the runner factor | slice 1 | observed: same; factor label from `formatFactor` or `unavailable` |
| 4.3 | A breach line names the time at recorded speed | slice 1 | observed: same; `%.1fs at recorded speed` / `%.1f at recorded speed` |
| 5 | Both ceilings in `tests/time-budget` are recalibrated in that (recorded-list) unit from recent trunk CI with headroom. | slice 1 | observed: `tests/time-budget` `per-job-seconds=64` `total-job-seconds=694` with derivation comment |
| 6 | Raising either ceiling stays a reviewed edit. | slice 1 | observed: `tests/time-budget` comment "Raising either number is a reviewed edit" |
| 7 | Refreshing `tests/longest-first` keeps its speed unit: seconds from a run on a faster or slower runner are scaled to the existing list's speed. | slice 3 | |
| 8 | On refresh, the factor is recorded in the source line. | slice 3 | |
| 9 | A refresh neither tightens nor loosens the budget. | slice 3 | |
| 10.1 | `bash scripts/ci-test-times.sh` reports share totals at recorded speed | slice 2 | G1 |
| 10.2 | `bash scripts/ci-test-times.sh` reports job times at recorded speed | slice 2 | G1 |
| 10.3 | `bash scripts/ci-test-times.sh` reports the runner factors it saw | slice 2 | G1 |
| 11 | The share preview's recorded-seconds predictions are directly comparable with the ceiling. | slice 2 | G1 |
| 12 | A share with no measurable recorded job to estimate a factor is judged at factor 1 (as today). | slice 1 | observed: `scripts/share-deal.mjs` `runnerFactor` returns `{ factor: 1, available: false }`; `tests/test-runner-budget.sh` no-list unavailable cases |
| 13 | When the factor is unavailable, the breach line says the factor was unavailable. | slice 1 | observed: `tests/test-runner-budget.sh` expect `factor unavailable` |
