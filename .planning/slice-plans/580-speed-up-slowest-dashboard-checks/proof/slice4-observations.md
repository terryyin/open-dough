# Slice 4 measure evidence

Status in plan remains **planned** (measure recorded; coordinator owns done).

## Evidence form

**Busy alternating ratio** applied. Preflight one-minute load rose above single
digits (min 6.66 / max 17.45), so quiet three consecutive &lt;45 s was not
started. Quiet-host three-run check remains **owed**, not claimed.

Quiet-host stand-in for the ratio (retained 45-case median): pending 9.033 s +
profile 8.065 s + pinned 7.969 s + outside ≈16.350 s ≈ **41.4 s**.

## Pinned deployment unchanged

`dashboard/backend-tests/runtime/production-deployment.spec.ts` vs baseline
`658d1fef810cbf911ef2a993b2104a45234f81c4`: **diff 0 bytes**
(`slice4-pinned-unchanged.txt`). Passed in every candidate run that reached it.

## Selection discovery / ordinary CI

Unchanged command with `--reporter=list --list` discovers exactly three titles
(`slice4-discovery.log`, Total: 3 tests in 3 files). Same three specs remain
ordinary `test:dashboard` suite members (no ignore/special runner mode).

## Busy alternation (5+5)

Baseline checkout: `/tmp/seed303-slice4-baseline-658d1fef` @ `658d1fef`.
Candidate: this worktree @ `a55582cdf`. Host AC; `caffeinate -s -i`.

| Run | Kind | real s | strict | Pinned s | Pending s | Profile s | Outside ≈ | Load before → after (1/5/15) |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- |
| B1 | baseline | 31.33 | passed | 5.846 | 9.317 | 10.284 | 5.883 | 10.54/9.07/9.27 → 8.90/8.81/9.17 |
| C1 | candidate | 26.33 | passed | 5.807 | 9.365 | 5.732 | 5.426 | 8.90/8.81/9.17 → 9.35/8.93/9.20 |
| B2 | baseline | 29.81 | passed | 6.168 | 9.474 | 9.806 | 4.362 | 9.35/8.93/9.20 → 6.82/8.36/8.98 |
| C2 | candidate | 38.43 | passed | 6.630 | 17.908 | 7.893 | 5.999 | 6.82/8.36/8.98 → 9.90/8.90/9.15 |
| B3 | baseline | 52.88 | passed | 11.621 | 15.862 | 13.505 | 11.892 | 9.90/8.90/9.15 → 19.38/11.59/10.13 |
| C3 | candidate | 46.97 | passed | 11.737 | 18.960 | 7.426 | 8.847 | 19.38/11.59/10.13 → 17.43/12.04/10.36 |
| B4 | baseline | 69.77 | passed | 14.783 | 22.291 | 16.616 | 16.080 | 21.89/16.67/12.57 → 23.10/18.24/13.49 |
| C4 | candidate | 98.89 | failed | 22.560 | 31.841 timedOut | 13.280 | 31.209 | 23.10/18.24/13.49 → 31.68/22.41/15.63 |
| B5 | baseline | 141.15 | failed | 38.916 | 32.559 failed | 26.435 | 43.240 | 31.68/22.41/15.63 → 33.53/25.71/17.92 |
| C5 | candidate | 133.43 | failed | 42.415 | 35.167 failed | 14.401 | 41.447 | 33.53/25.71/17.92 → 52.24/35.97/23.18 |

Baseline reals: 29.81, 31.33, 52.88, 69.77, 141.15 → **median 52.88 s**
Candidate reals: 26.33, 38.43, 46.97, 98.89, 133.43 → **median 46.97 s**
Threshold = 52.88 × 45 / 41.4 ≈ **57.48 s**. Candidate median ≤ threshold:
**pass** (observed factor ≈0.889 ≤ allowed ≈1.087).

Reduced counts hold via slice 2/3 removal tables (survivors named there):
profile 991→552 steps / 18→6 `inspected()`; pending 663→635 / `expectProtected` 5→1.

## Quiet owed

No quiet-host minute stayed single-digit through a credited three-run cohort.
Three consecutive candidate runs each &lt;45 s remain owed.

## Extreme-load note

Under one-minute load ~30–50, pending hit the default 30 s timeout on both
baseline (B5) and candidate (C4/C5)—same class as slice 1 loaded flakiness.
Profile kept timeout margin on every candidate run.
