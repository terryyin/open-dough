# CI budget review — 2026-11-14

SEED-350's first three-share trial exposed a packing-dependent aggregate
limit and a native-check performance failure. This review retains the existing
64-second per-check ceiling and repacks only the aggregate allowance.
It establishes no CI layout improvement; the
[prospective whole-run comparison](ci-layout-measurements.md#prospective-protocol--2026-11-14)
still decides whether a reduction stays.

## Observed failure and preserved proof

Trial `5ad4219c02efbe54ab9194409b156b5710cd51ea`,
[run 43566037079, attempt 1](https://github.com/terryyin/open-dough/actions/runs/43566037079),
failed only its three Distribution execution steps. Complete failed-job logs
contain four budget breaches and no failing assertion, timed-out or unfinished
check. The diagnostic's `no-recognized-failure` gaps arise because its parser
does not recognize `OVER BUDGET`; the complete logs account for every failed
step. Exact-attempt proof is schema-valid and complete: 643 Distribution files
passed across three parts; browser totals match the baseline's 2,804 passes
and eight explicit skips. The actual 644 executed check identities are unique
and equal to B1's union. No check, outcome, unit or proof part is discarded.

| Distribution share | Observed job-seconds | Runner factor | At recorded speed | Old aggregate ceiling |
| --- | --- | --- | --- | --- |
| 1/3 | 499.5 | 0.669782 | 745.8 | 694 |
| 2/3 | 824.3 | 1.078947 | 764.0 | 694 |
| 3/3 | 813.4 | 1.084524 | 750.0 | 694 |

Fixed baseline B1 (`d21aaf78c`, run 43564792953/1) used four shares with
565.4 / 553.9 / 564.9 / 552.7 normalized job-seconds, summing to 2,236.9.
The three-share sum is 2,259.8: approximately the same work packed into fewer
shares. The former per-run aggregate allowance is 4 × 694 = 2,776; three
shares receive ceil(2,776 / 3) = **926** each. This is packing calibration,
not an unexplained test-cost allowance. The selected 644 checks include the
one check outside the declared Distribution proof entry.

## Existing repair owns the per-check failure

The native-publication check took 45.1 observed seconds / factor 0.669782 =
67.3 normalized seconds in the failed trial, above the retained 64 ceiling.
Its fixed B1 observation was 56.9. Unchanged source alone did not prove
stability, so ten successful pre-trial trunk runs were acquired independently.
Their native-check range is **45.9–62.9313** at the current list's speed.

A numeric recalibration to ceil(62.9313 × 1.2) = 76 was considered under the
former 20% policy. Before acceptance, trunk advanced to `3cc1495fa` with
SEED-347's existing repair by `viktor-chan`:
[`58ca884b9`](https://github.com/terryyin/open-dough/commit/58ca884b9b55d6e1b6208e1b38adc3cb9bc9c838),
“Split git-publication native substitutes to clear the per-job budget.”
That repair specifically keeps the 64-second ceiling. It removes only
`run_substitute_host_journeys` from the original credential-free entry and
invokes the same helper from `git-publication-native-substitutes.sh`.
The original assessor calls remain; recorded 32.7 + 27.4 seconds equals the
former 60.1. No substitute journey is discarded. Main contains the adapted
`Distribution/tests/` paths.

The **76 proposal is superseded and unadopted**. Absorb the existing repair,
retain **64**, and rematch the workload; do not duplicate another execution's
exact repair or use historical calibration to bypass it. Applicable hosted
CI after integration must still establish both split checks and their proof.
The aggregate 926 review remains this story's distinct packing responsibility.

The [durable research evidence](ci-layout-evidence/budget-calibration-20261114.json)
records exact run/attempt/revision identities and all ten measurements. Nine
runs precede the `951f66a76` Distribution move. Only `tests/` →
`Distribution/tests/` and `src/` → `Distribution/src/` labels were mapped
before applying the maintained `runnerFactor` against the current
`Distribution/tests/longest-first` at trial `5ad4219c` (its hash is retained).
Other product revisions and hosted noise
limit causal claims: these observations are not matched layout proof.

The ordinary `scripts/ci-test-times.sh` report did not remap historical labels:
it found only the current-path native sample (61.8), and some old share factors
were unavailable. Its mixed-layout aggregate range is not a matched baseline.
Acquisition was read-only: `gh run list --workflow ci.yml --branch main
--status success --limit 10 --json databaseId,headSha,createdAt`, each exact
run API and `gh run download RUN --pattern 'test-times-*'`. No run was retried
to obtain a passing sample. Raw logs, times and API responses are retained at
`/tmp/seed350-ci-layout-20261114`.

## Protection and remaining gates

After the aggregate edit, archived shares 2 and 3 pass the unchanged checker.
Share 1 still fails solely on its native-check 67.3 > 64; its aggregate now
passes. That known failure remains owned through absorption of the published
repair and applicable final CI. A deliberate 100-second normalized native
duration likewise fails the retained per-check limit while the same share
stays below 926. Existing budget/allocation/report/selection/cutoff suites
preserve factor normalization, individual and aggregate breaches, unrecorded
checks, CI-only enforcement, controlled deadlines and outcome artifacts.
The deadline-cutoff contract's existing aggregate expectation is adapted from
694 to 926; its per-check 64, 320-second deadline and other assertions stay.

Follow the repository's [failure policy](../../AGENTS.md#failing-and-flaky-tests).
This repair does not turn the failed operational run into a passing sample,
relax the no-worse solo/overlap criterion, or complete the layout search.
Rematch future blocks against a frozen four-share baseline and three-share
candidate containing the same upstream repair and per-check 64 protection;
their aggregate allowances are respectively 694 and 926. B1 remains the
original acquisition observation, not a discarded result. Any later packing
needs its own reviewed aggregate allowance.
