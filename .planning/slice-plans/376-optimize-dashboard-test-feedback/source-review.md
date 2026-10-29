# Source review: SEED-174#optimize-dashboard-test-feedback

Launch: fresh general-purpose reviewer (no conversation inheritance); inputs
were only the selected story's Goal, Scope, Scope limits, and Key examples
from `.planning/seeds/SEED-174-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback`.
No plan, product, proof, or other project files were supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Shorten the wait for trustworthy local dashboard test results. | slice 3 | observed: PLAN.md Slice 3 — full suite wall 630 s → 589 s (−41 s) |
| 2 | Preserve behavioral coverage and confidence while doing so. | slice 3 | observed: proof `/tmp/od-dashboard-slice3.vQYmal/proof.json` selectedCount 1742 strictStatus passed; journey+boundary retained |
| 3 | Run measured test optimization against the ordinary local command `npm run test:dashboard`. | slice 3 | observed: slice 1–3 used that ordinary local command with proof records |
| 4.1 | Cover browser journeys. | slice 3 | observed: full suite includes journeys; retained representative retry journey |
| 4.2 | Cover boundary tests. | slice 3 | observed: full suite includes boundary/; new boundary matrix for damage variants |
| 4.3 | Cover their shared setup. | slice 3 | observed: ordinary local command exercises shared fixtures/setup with both tiers |
| 5 | Profile before choosing experiments. | slice 1 | observed: PLAN.md Current decisions Slice 1 baseline + Dominant-cost hypothesis; proof `/tmp/od-dashboard-baseline.B3xSoT/proof.json` phase completed strictStatus passed before any experiment |
| 6 | Investigate related test families. | slice 2 | observed: PLAN.md Slice 2 experiment — agent-launch* investigation; retained-preparation-codex-retry matrix named as waste |
| 7 | Retain only changes supported by comparable wall-time measurements under like runner conditions. | slice 2 | observed: focused ~19→~14s; full suite 630→589 s under workers=8 confirms retain |
| 8 | Follow the project's dashboard test guidance when simplifying tests or moving proof between tiers. | slice 2 | observed: variants moved to boundary/; one representative journey retained |
| 9 | Establish replacement proof before removing or narrowing cases. | slice 2 | observed: boundary/agent-launch-preparation-codex-retry.spec.ts (10 cases) established before journey narrowed |
| 10 | After experiments, re-run the same local command under comparable conditions. | slice 3 | observed: `/tmp/od-dashboard-slice3.vQYmal/proof.json` workers=8 env -u NO_COLOR no filter |
| 11.1 | Report before/after wall time. | slice 3 | observed: PLAN.md Slice 3 — 630 s → 589 s |
| 11.2 | Report executed case count. | slice 3 | observed: PLAN.md — 1741 → 1742 |
| 11.3 | Report retained behavioral proof. | slice 3 | observed: PLAN.md — journey+boundary matrix retained; strict passed |
| 11.4 | Report rejected experiments. | slice 3 | observed: PLAN.md — none rejected this pass |
| 11.5 | Report remaining candidates. | slice 3 | observed: PLAN.md — multi-step agent-launch poles; story-review*; SEED-171/173 closed |
| 12 | A demonstrated absence of worthwhile improvement, with that evidence recorded, satisfies the story. | slice 3 | observed: unused alternative — measured improvement path taken |
| 13 | Do not change product behavior to make tests faster. | slice 3 | observed: diffs are dashboard tests + planning records only |
| 14 | Do not expand into non-dashboard suites. | slice 3 | observed: only npm run test:dashboard / dashboard/tests |
| 15 | Do not claim speedup from fewer cases or lines alone. | slice 3 | observed: claim rests on wall 630→589 s not case/line counts |
| 16 | Do not claim speedup from focused timings without a comparable full local re-run. | slice 3 | observed: full re-run completed before suite-speedup claim |
| 17 | Do not claim speedup from CI-only allocation changes that leave the selected local wait unchanged. | slice 3 | observed: no CI allocation experiment; local wait measured |
| 18 | Do not reopen a recent CI shard-allocation experiment that was already rejected, unless new evidence shows it shortens the ordinary local command. | slice 3 | observed: SEED-173 left closed; not reopened |
| 19 | Baseline at a recorded revision runs `npm run test:dashboard` under named runner conditions. | slice 1 | observed: PLAN.md Slice 1 baseline — revision `7d8d83ff…`, literal `env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=… npm run test:dashboard`, workers=8, proof terminal passed |
| 20.1 | That baseline records wall time. | slice 1 | observed: PLAN.md wall time 630 s; proof `terminal.durationMs` ≈ 629349 |
| 20.2 | That baseline records executed case count. | slice 1 | observed: PLAN.md selectedCount 1741; proof `selectedCount` 1741 |
| 21 | After retained experiments, the same command under comparable conditions finishes sooner. | slice 3 | observed: 630 s → 589 s under comparable workers=8 |
| 22 | Behavioral coverage is preserved. | slice 3 | observed: 1742/1742 passed; damage variants + page path retained |
| 23 | Replacement proof is in place for any removed cases. | slice 2 | observed: boundary matrix + coordinator accept `/tmp/od-s2-accept.e8UdcP/proof.json` selectedCount 15 strict passed |
| 24 | An experiment that fails to improve comparable wall time is undone or left out. | slice 2 | observed: focused wall improved (~19→~14s); retain path taken (no undo owed) |
| 25 | An experiment that weakens coverage or confidence is undone or left out. | slice 2 | observed: 10 boundary damage variants + 1 journey page path retain refusal behavior |
| 26 | The report names such an experiment among rejected experiments. | slice 3 | observed: PLAN.md — rejected experiments: none |
| 27 | When profiling and credible experiments find no worthwhile saving within scope, the suite is left unchanged. | slice 3 | observed: unused alternative — worthwhile saving demonstrated |
| 28.1 | The no-saving report records its measurements. | slice 3 | observed: unused alternative — improvement path taken |
| 28.2 | The no-saving report records remaining candidates. | slice 3 | observed: unused alternative — improvement path taken; candidates still listed for follow-up |
| 29 | A journey that only repeats a variant the boundary tier can answer has that proof moved or dropped per dashboard test guidance. | slice 2 | observed: agent-launch-preparation-codex-retry journey 10→1; damage variants at boundary |
| 30 | The cheaper surviving check retains the behavior. | slice 2 | observed: boundary tests assert reconcile refusal per damage; journey asserts dialog/page path |
| 31.1 | The local suite wall time improves, or | slice 3 | observed: local suite wall improved 630→589 s |
| 31.2 | the change is rejected when it does not. | slice 3 | observed: unused alternative — wall improved; change retained |

## Slice 3 acceptance comparison

| Id | Trigger/setup | Source-expected | Actual observation | Owner |
| --- | --- | --- | --- | --- |
| 1 / 21 / 31.1 | Comparable full local re-run after retained experiment | Suite finishes sooner / wait shortens | 630→589 s; selectedCount 1741→1742; strict passed | slice 3 observed |
| 10–11.5 | Same re-run + report | Before/after wall, counts, proof, rejected, candidates | PLAN.md Slice 3 confirmation | slice 3 observed |
| 12 / 27 / 28 / 31.2 | No-gain / reject alternatives | Valid if no saving | Unused — improvement path taken | slice 3 observed |
| 13–18 | Scope limits | Held through pass | Tests-only; dashboard-only; no CI reopen; full re-run before claim | slice 3 observed |

## Slice 1 acceptance comparison

| Id | Trigger/setup | Source-expected | Actual observation | Owner |
| --- | --- | --- | --- | --- |
| 5 | Ordinary local suite with proof record before experiments | Profile before choosing experiments | Baseline recorded; dominant-cost hypothesis names `agent-launch*` before slice 2 | slice 1 observed |
| 19 | Recorded revision + named runner conditions | Baseline runs `npm run test:dashboard` | Revision `7d8d83ff…`; workers 8; command as recorded; strict passed | slice 1 observed |
| 20.1 | Same baseline | Records wall time | 630 s / ~629.3 s terminal | slice 1 observed |
| 20.2 | Same baseline | Records executed case count | selectedCount 1741 | slice 1 observed |

No source/plan mismatches for slice 1. Remaining commitments stay with later slices.
