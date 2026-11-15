# Source-only review

Launch: `/root/source_review`, fresh context (`fork_turns: none`), on 2026-11-15.
The coordinator supplied only the selected story's Goal, Scope, Key examples,
UI, Architecture and exclusions, with no plan, implementation or proof. The
reviewer was instructed to read no project files and change nothing. Its returned
individual commitments are retained verbatim below. The tool launch and full
return in this execution conversation retain the exact input and qualifications,
examples and exclusions. No human amendment has followed that review.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | A developer can focus Usage on a recent period. | slice 3 | observed: e2e/configuration/system-settings-usage-period.spec.ts accepted 30→7→1 calendar journey and system-settings-usage-average.spec.ts ordinary geometry/trend assertions; numeric baseline separation1.45px versus final >40px unchanged when adding65M/highaverage |
| C02 | The chart preserves visibility of ordinary-task differences when a few tasks use far more tokens. | slice 3 | observed: e2e/configuration/system-settings-usage-period.spec.ts accepted 30→7→1 calendar journey and system-settings-usage-average.spec.ts ordinary geometry/trend assertions; numeric baseline separation1.45px versus final >40px unchanged when adding65M/highaverage |
| C03 | The chart exposes the true recent trend through the specified moving average. | slice 3 | observed: e2e/configuration/system-settings-usage-period.spec.ts accepted 30→7→1 calendar journey and system-settings-usage-average.spec.ts ordinary geometry/trend assertions; numeric baseline separation1.45px versus final >40px unchanged when adding65M/highaverage |
| C04 | A “Last N days” control accepts a positive whole number of days. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C05 | The initial period is 30 days. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C06 | Period boundaries use the developer’s local calendar. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C07 | The period includes today. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C08 | The period includes the preceding N−1 days. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C09 | The first included day’s midnight is inclusive. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C10 | Tomorrow’s midnight is exclusive. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C11 | Changing cohort filters preserves the chosen day count. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C12 | Refreshing usage preserves the chosen day count. | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts Refresh keeps chart/check time during checking and failure; chosen20 retained after success/failure |
| C13 | Visible tasks belong to the selected period within the existing cohort. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C14 | Partial-coverage counts describe the selected period within the existing cohort. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C15 | Unpriced-task counts describe the selected period within the existing cohort. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C16 | Empty-state wording describes the selected period within the existing cohort. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts empty periods and existing system-settings-usage sparse/empty: period counts/empty words and no-average explanation |
| C17 | The moving average remains a true trailing 10-task average. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C18 | Only priced tasks contribute to the eligible average window. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-eligibility.spec.ts only complete tasks: missing gaps excluded, measured zero, independent averages3555/4200; token-index-period excludes unpriced |
| C19 | Only measured tasks contribute to the eligible average window. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-eligibility.spec.ts only complete tasks: missing gaps excluded, measured zero, independent averages3555/4200; token-index-period excludes unpriced |
| C20 | Tasks with known measurement gaps do not contribute to the eligible average window. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-eligibility.spec.ts only complete tasks: missing gaps excluded, measured zero, independent averages3555/4200; token-index-period excludes unpriced |
| C21 | Partial tasks do not fill the eligible average window. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-eligibility.spec.ts only complete tasks: missing gaps excluded, measured zero, independent averages3555/4200; token-index-period excludes unpriced |
| C22 | Earlier eligible tasks in the same cohort contribute before the visible period. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C23 | Tasks above 50 million remain eligible for the average. | slice 3 | observed: dashboard/backend-tests/usage-history/token-index-large-average.spec.ts retained-store nine1M+65M task indexes unchanged, average7400000 independently expected; Frontend latest/overflow7400000 matches |
| C24 | Changing the period leaves an average unchanged at a date retained in both views. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C25 | Only average observations dated within the selected period are displayed. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C26 | Insufficient average history is identified honestly. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts empty periods and existing system-settings-usage sparse/empty: period counts/empty words and no-average explanation |
| C27 | The moving average uses a color distinct from the task dots. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts showsDistinctAverageAboveDots computed distinct stroke, SVG following order, chart contrast in light/dark; ordinarySeparation invariant and0/500K/1M axis |
| C28 | The moving average is drawn above the task dots. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts showsDistinctAverageAboveDots computed distinct stroke, SVG following order, chart contrast in light/dark; ordinarySeparation invariant and0/500K/1M axis |
| C29 | Visible task values at or below 50 million determine the ordinary y-axis scale. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts showsDistinctAverageAboveDots computed distinct stroke, SVG following order, chart contrast in light/dark; ordinarySeparation invariant and0/500K/1M axis |
| C30 | The moving average does not determine the ordinary y-axis scale. |  | G1 |
| C31 | An above-scale average is explicitly identified at its date. |  | G2 |
| C32 | An above-scale average’s actual value remains readable. |  | G2 |
| C33 | A clipped average trace must not suggest that the scale ceiling is its actual value. |  | G2 |
| C34 | A task whose Token index exceeds 50 million appears as a red × at the chart’s top. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C35 | Each large-task mark remains aligned to its task’s date. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C36 | Each large-task mark is labeled with its actual value. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C37 | Each large-task mark retains selection into task details. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C38 | Task values above 50 million do not determine the ordinary y-axis scale. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C39 | A task at exactly 50 million remains an ordinary point. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C40 | Partial coverage remains visible in task marks, including large-task marks. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C41 | Partial coverage remains visible in task readouts, including large-task readouts. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C42 | Partial coverage remains visible in task details, including large-task details. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C43 | Tasks sharing a finish time remain individually inspectable and selectable by pointer. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C44 | Tasks sharing a finish time remain individually inspectable and selectable by touch. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C45 | Tasks sharing a finish time remain individually inspectable and selectable by keyboard. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C46 | Each coincident task’s actual value remains individually reachable. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C47 | Each coincident task’s details remain individually reachable. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C48 | Closing details returns focus to the selected task’s mark. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C49 | Narrowing the period clears a selection whose task is no longer displayed. | slice 1 | observed: e2e/configuration/system-settings-usage-period.spec.ts 30→7→1: exact local midnight retained, earlier-nine warm-up1950, period counts/identities, selectedNov8 detail removed |
| C50 | A period containing no tasks has an informative empty state. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts empty periods and existing system-settings-usage sparse/empty: period counts/empty words and no-average explanation |
| C51 | When every priced task exceeds 50 million, every large-task mark remains labeled. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C52 | When every priced task exceeds 50 million, every large-task mark remains selectable. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C53 | The all-large-task situation is distinguishable from no tasks. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C54 | The all-large-task situation is distinguishable from zero usage. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C55 | The period control appears alongside the current cohort filters. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C56 | The interface explains that × means a Token index above 50 million. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C57 | The interface avoids presenting × as a failed-task indicator. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C58 | Average overflow is identified separately from large-task overflow. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts showsAverageOverflow: distinct Avg↑ labels and dated text list without buttons versus task×; visible values with contrast and trace breaks |
| C59 | Essential values are available without hovering. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts showsAverageOverflow: distinct Avg↑ labels and dated text list without buttons versus task×; visible values with contrast and trace breaks |
| C60 | Color alone carries no meaning. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts showsAverageOverflow: distinct Avg↑ labels and dated text list without buttons versus task×; visible values with contrast and trace breaks |
| C61 | The period control remains usable on a narrow screen. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts narrow touch and established twiceZoomedWindow: day choice, visible dated values, SVG label bounds both axes, no page overflow, touch detail65M and focus return |
| C62 | Overflow labels remain usable on a narrow screen. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts narrow touch and established twiceZoomedWindow: day choice, visible dated values, SVG label bounds both axes, no page overflow, touch detail65M and focus return |
| C63 | Task actions remain usable on a narrow screen. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts narrow touch and established twiceZoomedWindow: day choice, visible dated values, SVG label bounds both axes, no page overflow, touch detail65M and focus return |
| C64 | The period control remains usable at 200% zoom. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts narrow touch and established twiceZoomedWindow: day choice, visible dated values, SVG label bounds both axes, no page overflow, touch detail65M and focus return |
| C65 | Overflow labels remain usable at 200% zoom. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts narrow touch and established twiceZoomedWindow: day choice, visible dated values, SVG label bounds both axes, no page overflow, touch detail65M and focus return |
| C66 | Task actions remain usable at 200% zoom. | slice 3 | observed: dashboard/frontend-tests/system-settings-usage-average.spec.ts narrow touch and established twiceZoomedWindow: day choice, visible dated values, SVG label bounds both axes, no page overflow, touch detail65M and focus return |
| C67 | Invalid day input explains the positive-whole-day requirement. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C68 | Invalid day input leaves the last valid view recoverable. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C69 | Existing loading feedback is preserved. | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-period.spec.ts local calendar requests: held loading, 30/7 New York DST bounds, invalid input preserves point/no request, same-value recovery; UsageDays/recentUsagePeriod |
| C70 | Existing Refresh failure feedback is preserved. | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts Refresh keeps chart/check time during checking and failure; chosen20 retained after success/failure |
| C71 | The last successful result remains preserved wherever current behavior already preserves it. | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts Refresh keeps chart/check time during checking and failure; chosen20 retained after success/failure |
| C72 | Visible-date selection is separate from historical average contribution. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C73 | The average is calculated before its displayed observations are restricted to the selected period. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C74 | Display overflow never rewrites task values. | slice 2 | observed: dashboard/frontend-tests/system-settings-usage-overflow.spec.ts + usageChartPage: actual red ×/label, retained dated x/button, ordinary separation, exact50M, coincident measured/partial selection by pointer/touch/keyboard and focus, all-large0/25M/50M versus zero; HistoryChart preserves original values |
| C75 | Display overflow never rewrites average values. | slice 3 | observed: dashboard/backend-tests/usage-history/token-index-large-average.spec.ts retained-store nine1M+65M task indexes unchanged, average7400000 independently expected; Frontend latest/overflow7400000 matches |
| C76 | Recent-period counts receive dated unpriced tasks before aggregation. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C77 | The implementation reuses the existing Usage summary/cohort boundary. | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-period.spec.ts calendar bounds: inclusive start, exclusive until, dated ids/partial/unpriced counts, average1950 unchanged, empty projection, options/all-history; tokenIndexCohort projects after average |
| C78 | The implementation reuses the shared history chart. | slice 3 | observed: Inspected TokenIndexTrend optional independentTrend/overflow policy into existing HistoryChart; historyChartLayout/trend/overflow preserve numeric evidence; existing CI/scope regressions and Project recovery pass default scale/gap/reference/segments/readouts; ADR0002/0008 coherent derived presentation |
| C79 | Usage’s 50-million display rule remains outside CI policy. | slice 3 | observed: Inspected TokenIndexTrend optional independentTrend/overflow policy into existing HistoryChart; historyChartLayout/trend/overflow preserve numeric evidence; existing CI/scope regressions and Project recovery pass default scale/gap/reference/segments/readouts; ADR0002/0008 coherent derived presentation |
| C80 | Usage’s 50-million display rule remains outside scope-timing policy. | slice 3 | observed: Inspected TokenIndexTrend optional independentTrend/overflow policy into existing HistoryChart; historyChartLayout/trend/overflow preserve numeric evidence; existing CI/scope regressions and Project recovery pass default scale/gap/reference/segments/readouts; ADR0002/0008 coherent derived presentation |
| C81 | The implementation follows ADR 0002’s one-representation/direct-domain-mapping constraint. | slice 3 | observed: Inspected TokenIndexTrend optional independentTrend/overflow policy into existing HistoryChart; historyChartLayout/trend/overflow preserve numeric evidence; existing CI/scope regressions and Project recovery pass default scale/gap/reference/segments/readouts; ADR0002/0008 coherent derived presentation |
| C82 | The implementation follows ADR 0008’s separation of derived presentation from evidence. | slice 3 | observed: Inspected TokenIndexTrend optional independentTrend/overflow policy into existing HistoryChart; historyChartLayout/trend/overflow preserve numeric evidence; existing CI/scope regressions and Project recovery pass default scale/gap/reference/segments/readouts; ADR0002/0008 coherent derived presentation |

### Slice 1 acceptance

30→7→1 days, local midnight, earlier-nine history, invalid input and cohort/Refresh
continuity → dated tasks/counts with true eligible averages: inspected Backend
period/eligibility, Frontend request/loading/empty and real-store E2E assertions
match these source expectations; source-review rows retain per-id observations.
Passing commands:
- `caffeinate -s -i npm run test:dashboard:backend -- usage-history/token-index`
- `caffeinate -s -i npm run test:dashboard:frontend -- system-settings-usage`
- `caffeinate -s -i npm run test:e2e -- configuration/system-settings-usage.spec.ts configuration/system-settings-usage-period.spec.ts`
- After singular-day wording: `caffeinate -s -i npm run test:e2e -- configuration/system-settings-usage-period.spec.ts`
- `npm run typecheck:dashboard`; `git diff --check`.
Consumer trace `/tmp/seed369-slice1-consumer-trace.md` maps actual contract/effect
terms through backend harness, answer builder, SystemSettings/localBoundaries,
UsageTaskDetail and HistoryChart; all affected consumers ran above. Historical
name collisions are excluded. Source freshness unchanged at trunk
`46c637448f613e63cd841ae237f1b4f6eed26830`; no named sibling. Distinct E2E fixture
values repaired ambiguous labels without losing coverage. ~8 active minutes;
no proof deferred or running, no slice-1 gap.

Independent refactor `/root/refactor1`: shared taskEndedAt and day validation/period wording;
Backend/Frontend commands above and typecheck renewed successfully; E2E setup,
payload, interaction and observations unchanged and reused. Trace
`/tmp/seed369-refactor1-consumer-trace.md` dispositions inspected; no gap.

Fresh preparation initially refused lint findings before any commit. Mechanical
narrowing/tuple and index-iterator repairs preserve all fixture facts and runtime
bounds. Independent refactor confirmed already-traced scope and proof reuse;
coordinator typecheck passed. Formatter will be renewed by guarded delivery.

### Slice 2 acceptance

>50M and coincident measured/partial tasks → red dated labeled ×, unchanged
ordinary separation, each actual detail/focus action; exact50M stays ordinary,
all-large bounded0/25M/50M differs from zero0/0.5/1. Inspected actual assertions
in system-settings-usage-overflow.spec.ts and usageChartPage match these outcomes.
Passing commands:
- `caffeinate -s -i npm run test:dashboard:frontend -- system-settings-usage`
- `caffeinate -s -i npm run test:dashboard:frontend -- intent-ci-history-chart-marks.spec.ts intent-project-ci-history-chart-marks.spec.ts intent-ci-compact-readout.spec.ts intent-scope-timing-history-units.spec.ts intent-scope-timing-history-reading.spec.ts intent-scope-timing-history-segments.spec.ts intent-project-scope-glance.spec.ts`
- `npm run typecheck:dashboard`; `git diff --check`.
Trace `/tmp/seed369-slice2-consumer-trace.md` follows actual shared drawing through
CI history/Done reference, scope history, page objects and Usage; named regression
cases cover those defaults; unchanged E2E request/store/filter/Refresh proof reused.
Source freshness unchanged at trunk46c637448f613e63cd841ae237f1b4f6eed26830;
no named sibling. G1/G2 explicitly retain average interims until slice3; no other gap.
~5 active minutes; local AC load8.01/8.04/8.29, memory52%; no deferred/running command.

Independent refactor2 shared entryValueWords/Usage threshold and made overflow
height immutable; both Frontend commands and typecheck above renewed successfully.
Trace `/tmp/seed369-refactor2-consumer-trace.md` dispositions inspected; no gap.

### Slice 3 acceptance

Nine1M+65M → true7.4M; high average/large task → unchanged ordinary separation;
in→above→in → separate trace segments; all-large → explicit65M dated average.
Inspected Backend large-average setup/assertions, Frontend average cases and
usageChartPage computed paint/order/contrast, geometry, text/nonbutton distinction,
SVG bounds and touch detail/focus assertions match source expectations. G1/G2 closed.
Passing commands:
- `caffeinate -s -i npm run test:dashboard:backend -- usage-history/token-index`
- `caffeinate -s -i npm run test:dashboard:frontend -- system-settings-usage`
- `caffeinate -s -i npm run test:dashboard:frontend -- intent-ci-history-chart-marks.spec.ts intent-project-ci-history-chart-marks.spec.ts intent-ci-compact-readout.spec.ts intent-scope-timing-history-units.spec.ts intent-scope-timing-history-reading.spec.ts intent-scope-timing-history-segments.spec.ts intent-project-scope-glance.spec.ts`
- `caffeinate -s -i npm run test:dashboard:frontend -- intent-project-scope-history-recovery.spec.ts`
- `caffeinate -s -i npm run test:dashboard:frontend -- system-settings-usage-average.spec.ts` (final both-axis label bounds).
- `npm run typecheck:dashboard`; `git diff --check`.
Actual-diff trace `/tmp/seed369-slice3-consumer-trace.md` dispositions inspected,
including extra Project recovery consumer whose focused case passed. Unchanged
E2E date/request/store/filter/Refresh observations reused. USAGE-TOKEN-INDEX.md
retains behavior, README links it at250 lines. Corrected a nonexistent250K test
tick to unchanged countAxis0/500K/1M; full Usage then passed. Source freshness
unchanged at trunk46c637448f613e63cd841ae237f1b4f6eed26830, no named sibling.
~8 active minutes; AC load6.87/6.52/7.00 memory54%; no gap or pending/deferred command.

Independent refactor3 shared moving-average wording and CSS paint, removed an
unreachable fallback; full Usage Frontend/typecheck/diff check renewed and passed.
Backend, E2E and shared-default chart boundaries unchanged and reused. Trace
`/tmp/seed369-refactor3-consumer-trace.md` inspected; no gap. Final freshness
unchanged at trunk d67cf5ba1cf6ef0a77d94c83898d8db4621da681.

### Outcome review

Completed planned execution: published increments30697cc105d3ee6c0a35043b5deda789f1671711,
4b1c7984c4ad5c2f9ef634db89400dcd5d9697a1 and2e92e64c9756f844710dec50b4143c38ff0f518d.
Preparation244fc7bc6 and claim07e3ec6c4 are provenance; no unrelated commits enter
the three-commit net diff. Original ready plan/source recovered from claim;
no scope amendment. All commitments and G1/G2 match aggregate implementation,
docs and inspected proof. ADR0002/0008 and transient-view direction preserved.
Ordinary separation >40px with large task/high average compares favorably with
1.45px compressed baseline; this is controlled chart evidence, not human-use
or token-efficiency evidence. No refactor residue or bounded product correction
found; correction planning unchanged. E2E did not drive initial implementation;
three representative calendar/store/cohort/Refresh journeys retain real service
interaction proof, while detailed rendering/pricing stays in Frontend/Backend
unit layers. No redundant E2E cleanup with supported saving was identified.
Related Claude/Cursor usage queue entries remain outside this Codex display scope;
priorities unchanged. Product advice: keep delivered behavior, no added response.
Process selected by project setting and deferred into wrap-up because automatic
intent coverage is enabled and existing Usage assertions were rewritten. Product
review complete; CI at2e92e64c9756f844710dec50b4143c38ff0f518d remains pending.
