# Cohort comparison — plan 777 slice 8

Same 8 paths, `--workers=2`, `caffeinate -s -i`, interleaved fresh pairs: before = detached 419aeed53
(legacy files identical to 2a0c35342), after = 8d288cd06. All runs 14/14 passed, no retries.

| Pair | Before elapsed (load) | After elapsed (load) | Σcase before → after |
|---|---|---|---|
| 1 | 43.3 s (30→34) | 19.7 s (30→31) | 30.4 → 19.2 s |
| 2 | 45.3 s (35→36) | 35.3 s (34→35) | 44.6 → 31.4 s |
| 3 | 29.5 s (34→32) | 34.8 s (33→34) | 26.5 → 27.1 s |
| mean | 39.4 s | 30.0 s (−24 %) | 33.8 → 25.9 s (−23 %) |

Plan baseline (2a0c35342): 42.97 s, Σcase 26.3 s, load ~26. Engines: before Playwright 14; after Vitest
browser 14, Playwright 0, E2E 0 (none promoted). Slowest remaining: Done chart marks pointer+keyboard
(2.7–4.3 s), Done touch tap (2.5–3.3 s), Project light+dark (1.5–2.7 s), gaps later-trunk gap (1.6–2.7 s),
reading failed-read retry (1.3–2.8 s). Limit: Vitest import (~30–36 % of runner time) plus ~3–5 s
outside the runner set a ~17 s floor; at load ~33 a single pair can invert (pair 3).

## Legacy case → owner (all replaced in place, same path; 14 → 14)
- absent: empty / all gaps (2) → same titles, openDoneScopeHistory
- reading: failed local entry read keeps story and retries → same, typed ci.readScopeHistory counter
- gaps: later-trunk gap / unverified order / pending (3) → same titles
- provenance: later trunk build stays named → same
- segments: owning-entry segments not joined → same (third build added to show the join)
- units: case and file one at a time / legacy-only unknown unit (2) → same
- ci-history-chart-marks: pointer+keyboard → same; "on a touch phone > tapping…" → "tapping a Done
  scope history mark on a touch phone shows its readout"
- project-ci-history-chart-marks: light+dark / narrowest width (2) → same, mountIntentCiPage

Retired helpers: openSummaryScopeHistory → openDoneScopeHistory; expectScopeReadout → readout();
expectComparisonScopeRows → expectDoneEntryComparisonKept; expectNoSidewaysScrollIn → scrollingSideways();
scopeHistoryReading/Chart → charts/status/marks/markNames/builds/line/titles; route counter → typed read;
inspectMark/expectMarksByTab → hover/tapMark/Tab walk; expectMarkOver + G1 drawing → drawnUnder,
selectedShape, averageDashes, axisLabels, dateLabels, markXs, floorY; expectMarksPainted → painting/focusPainted.
Dropped (could not fail): combobox count, gaps short-SHA exclusions (backend slim-response spec owns).
dashboard/src unchanged since 419aeed53; no act/IS_REACT_ACT_ENVIRONMENT; no server projections.
Full detail: execution evidence slice-8-report.md.
