# Make recent token usage easier to read

**Identity:** SEED-369#make-recent-token-usage-easier-to-read
**Source:** [Make recent token usage easier to read](../../seeds/SEED-369-recent-token-usage.md#make-recent-token-usage-easier-to-read)
**Source review:** [Independent source commitments](source-review.md)

## Goal and scope

Help a developer focus System settings → Usage on recent calendar days and
distinguish ordinary tasks without losing unusually large tasks or the true
10-task average. The source owns the final behavior and examples. Terry
accepted both average recommendations on 2026-11-15: earlier eligible tasks
contribute, and large tasks remain in the true average with explicit overflow.

Include the day control, coherent period counts/empty states, dated large-task
marks with details, and a distinct average drawn above the dots without
determining their scale. Preserve cohort filters, pricing, coverage semantics,
Refresh feedback, pointer/touch/keyboard selection and focus return. Exclude
saved date preferences, arbitrary start/end controls, new hosts, tariff changes,
usage-store migration, and new statistics. Preparation authorizes no execution.

## Existing solution and architecture

PFE found one suitable pipeline: `SystemSettingsUsage` → `usageTokenIndex.ts`
request/answer → `usageBoundary` → `tokenIndexCohort`, using the existing summary.
The cohort already orders finished tasks by end time and calculates measured,
priced trailing-ten averages. `TokenIndexTrend` adapts that answer into the
shared `HistoryChart`, whose layout, marks and buttons also serve CI wall time
and scope execution time. Reuse this pipeline and its `countAxis`, `countWords`,
`UsageTaskDetail` and history-chart interaction owners. No existing recent-day
control or numeric overflow policy was found across dashboard source/server.
CI's failed-build × denotes unavailable timing, so it is not Usage's
above-scale task model; reuse suitable drawing mechanics without changing
the task into a timing gap.

Keep the period separate from cohort identity. The browser computes local
calendar bounds and sends an optional explicit `[from, until)` period with
the existing cohort request; absent bounds retain the current API's all-history
answer. Reject malformed or incomplete bounds at that boundary. Compute true
averages over the full cohort first, then select dated tasks and average
observations for display. Count unpriced tasks by their end dates before the
cohort discards their dated records into an aggregate. Model/effort options
retain their existing population, so a short period cannot erase choices.

Usage classifies task values above 50 million and supplies a narrow opt-in
display policy to the shared chart. Keep original numeric values and dates
in entries/readouts. The shared layout/rendering owns placement, collision
handling and buttons; its default CI/scope behavior is unchanged. Separate
the ordinary scale from the true average and large-task marks. With no
ordinary tasks, use a bounded fallback axis (0–50 million) and explain the
absence of ordinary points. With ordinary zeroes, retain a nondegenerate
zero-based scale. Neither case converts overflow into zero or missing data.

Follow [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one coherent representation, direct domain mapping),
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(derived presentation distinct from evidence), and
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(evaluate readable ordinary differences against the current compressed chart,
without claiming that lower token use itself proves improvement). The ADR
index and in-file Accepted statuses agree; no conflict or supersession was found.
The [architectural North Star](../../NORTH-STAR.md) and
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
support transient view state and accessible reading. No new shared direction
or ADR is needed for this bounded design.

## Proof ownership and consumer trace

| Source promise | Owning slice and observable proof |
| --- | --- |
| Calendar window, boundaries, period counts, valid input and cohort/Refresh continuity; examples 1 and 5 | 1: real-store E2E chooses 30 → 7 → 1 with browser time pinned, checks retained/excluded task identities and counts; Backend checks exact bounds/unpriced dates; Frontend checks invalid-input recovery and empty-period words. |
| Earlier history and measured/priced eligibility; example 2 | 1: Backend supplies nine earlier eligible tasks plus one inside, asserts the same independently calculated average for two windows and excludes partial/unpriced contributions; E2E observes that figure after changing days. |
| >50 million rule, exactly 50 million boundary, actual labels, all-large period; examples 3 and 5 | 2: Frontend asserts × shape/red paint, date alignment, true label/readout, ordinary-point positions and axis independent of large values; exactly 50 million remains ordinary; all-large and zero cases remain honest. |
| Individual access to coincident large tasks, coverage and selection/focus; example 4 | 2: Frontend uses two different large tasks at the same timestamp, pointer/touch/keyboard selection into their distinct details and focus return, including a partial task; narrowing days removes an excluded selection. |
| True average including large tasks, ordinary-only scale and overflow meaning; example 3 | 3: Backend retains the independently expected 7.4 million; Frontend compares ordinary geometry with/without the large task and high average, observes the dated overflow value, and distinguishes it from a task action. |
| Distinct average above dots, accessible labels/control and preserved neighboring charts | 3: computed paint/contrast and SVG paint order prove the average differs from task dots and paints above them; narrow/touch and 200% zoom cases retain values/actions without page overflow; focused CI/scope chart cases preserve their own marks, gaps, reference and readouts. |

Trace inspected at `fe0416359e3baaa549649803dbaccaddd37a0d8d`:
`tokenIndexCohort` feeds the HTTP answer and `TokenIndexTrend`'s total/partial/
unpriced note, latest-average figure, `series`, empty state and detail lookup.
`SystemSettingsUsage` retains the answer during Refresh but clears it for a
cohort change. `UsageFilters` reads options from the answer. The backend
`tokenIndexHarness` and answer builder also consume the existing all-history
contract. Preserve that default and explicitly arrange the new period in tests.

`historyChartLayout` feeds both SVG marks and the overlaid buttons/readout;
an overflow placement must move both together. `HistoryChartPlot` currently
paints its line before task marks. CI consumers are `IntentCiHistory` and
`IntentCiDoneWallTimeReference` through `landedCiHistorySeries`; scope timing
uses `IntentScopeTimingHistoryUnits`. Their gap rows, reference values, segment
breaks, duration axes, selection, narrow layout and touch reading remain owed.
Use `systemSettingsUsagePage` and `historyChartPage` for UI mechanics.

During implementation generate the installed
[consumer-trace record](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
from the actual diff, extending terms through helpers to journeys; run/reuse
each affected consumer or justify exclusion at its observed boundary.

## Ordered slices

Each slice targets 15 active minutes, including its proof and cleanup; command
runtime is separate. Keep one coherent rule through all three slices rather
than adding a separate chart or recomputing Token index in the browser.

### 1. Choose recent calendar days without restarting the average
Type: Behavior
Status: done
Proof: Source examples 1, 2 and empty-period part of 5; focused Backend,
Frontend and real-store E2E Usage cases, with exact calendar-boundary inputs
and independently expected averages/counts.

Behavior: a chosen cohort with dated tasks → enter Last N days or change
cohort/Refresh → show today's N-calendar-day period and coherent counts,
while earlier eligible tasks still warm the visible average. Start at 30;
hold the last valid choice while invalid input is explained. Keep day choice
when cohort changes or Refresh succeeds/fails. The latest-average figure
comes only from observations in the visible period. Pin the browser clock
for existing fixed-November Usage fixtures so the new default stays stable.
Own the complete request, projection and UI seam in this slice, not a separate
backend-only delivery. Retain the existing detail and Refresh regression checks.

### 2. Keep large tasks visible without flattening ordinary tasks
Type: Behavior
Status: done
Proof: Source examples 3–5, excluding the high-average rendering owned by 3;
Frontend geometry, actual labels, threshold boundary, coincident-task
selection/focus, partial coverage, and all-large/zero-period cases.

Behavior: visible task values cross 50 million → read/select the chart →
ordinary points determine their scale, each large task remains a dated,
labeled red × with its actual value and task details. Keep same-time marks
individually reachable without changing their date coordinates. Explain ×
as a large task, preserve partial coverage, and use the existing chart's
accessible mark/button model. An accepted interim trade-off is that the old
average may still enlarge the axis; slice 3 removes its scale contribution.
Do not claim final ordinary-task readability until that slice passes.

### 3. Read the true average without letting it control the scale
Type: Behavior
Status: done
Proof: Source example 3 and the UI promises; true 7.4-million figure,
ordinary-only geometry, explicit dated average overflow, contrasting paint
above dots, narrow/touch/zoom access, and shared CI/scope regression cases.

Behavior: the true average overlaps task dots or exceeds the ordinary scale →
read the trend → its distinct trace paints above dots and above-scale
observations expose their true values at their dates without compressing
ordinary points or implying a false plateau at the ceiling. Include an
in-scale → above-scale → in-scale example so overflow cannot create a
misleading joining segment. Keep it distinct from selectable task × marks.
Update lasting behavior in `dashboard/USAGE-TOKEN-INDEX.md`, linked from the
dashboard README, and align the existing source comments/legend.

## Local gates and execution discipline

Apply the linked [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Execution uses [Dough Execute Plan](../../../.agents/skills/dough-execute-plan/SKILL.md),
including independent post-change refactoring, affected proof, delivery and
target CI repair/observation; this preparation starts none of them.

Focused commands (extend with the new capability-named files):

- `npm run test:dashboard:backend -- usage-history/token-index` for changed
  request/cohort behavior and retained pricing/eligibility/detail/Refresh.
- `npm run test:dashboard:frontend -- system-settings-usage` for the full
  affected Usage surface, not only the new assertions.
- `npm run test:e2e -- configuration/system-settings-usage.spec.ts` for actual
  browser → HTTP → retained-store wiring and Refresh failure continuity.
- After shared chart edits, `npm run test:dashboard:frontend -- intent-ci-history-chart-marks.spec.ts intent-project-ci-history-chart-marks.spec.ts intent-scope-timing-history-units.spec.ts intent-scope-timing-history-reading.spec.ts intent-scope-timing-history-segments.spec.ts intent-project-scope-glance.spec.ts`;
  include the actual-diff consumers of CI wall-time/reference rendering too.
- `npm run typecheck:dashboard` for changed TypeScript contracts; the existing
  selective formatting/precommit hooks remain required. A broader local run
  needs an affected consumer/shared fixture reason, not CI membership alone.

Per [AGENTS.md](../../../AGENTS.md), keep default test timeouts, never use
`test.slow()`, and apply the selected MakeMe/page-object conventions before
test edits. The selector resolved MakeMe + page objects for the Usage Frontend
and E2E sources, MakeMe only for Backend; reselect new paths. Reuse the shared
answer/history builders; arrange dates/indexes in cases and keep expected
figures independent of builder calculations.

The local-gate sleep guard is [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long/full runs in `caffeinate -s -i`.
On battery plug in or keep the lid open under `caffeinate -i` and inspect the
sleep log afterwards. Full groups share admission across worktrees; named
focused runs remain independent. Inspect load/memory before expensive proof.

Keep implicated modules below 250 lines, splitting cohesive responsibilities when needed.
The Usage page object is 221 lines after slice1; new drawing observations need a focused owner.
`USAGE-HISTORY.md` and README are already 250: create `USAGE-TOKEN-INDEX.md`,
link within existing README prose; preserve persistence documentation.

## Premises, observations and concerns

All observations below used this owned checkout on 2026-11-15 at
`fe0416359e3baaa549649803dbaccaddd37a0d8d`; no product edits remain from probes.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| Existing Usage UI and focus/coverage route is available in the Frontend profile | `npm run test:dashboard:frontend -- system-settings-usage.spec.ts` passed all three cases before and after the scratch check. The cases consume the actual built app with explicit service answers and observe the average, sparse/empty states and pointer/keyboard details/focus. | New period/overflow/contrast assertions belong to their slices; existing tests do not prove them. |
| Existing average-line proof detects a missing line | Scratch replaced the trend with `[]`; `npm run test:dashboard:frontend -- system-settings-usage.spec.ts --grep 'ten eligible tasks'` failed at `showsAverage`, expected one line and observed zero. Restored source and the full Usage file passed. | This proves line presence only, not color or paint order; slice 3 adds those observations. |
| The retained-store cohort/eligibility route computes a trailing-ten average | `npm run test:dashboard:backend -- usage-history/token-index-eligibility.spec.ts usage-history/token-index-cohort.spec.ts` passed all three cases: measured zero, partial/unpriced exclusions, two exact moving averages, and model/effort population choices. | Slice 1 adds dated period projection and historical warm-up examples. |
| Both large tasks and the average currently influence ordinary geometry | Actual `chartLayout` loaded through this checkout's Vite config, width 600, task indexes 1M/2M/65M and average 8M: top tick 80M, ordinary separation 1.45px. Omitting only the large entry leaves top tick 8M and separation 14.5px. The layout used by the renderer still admits the average to scaling. | Slice 3 removes that influence; no assumption that moving the large task alone suffices. |
| Neighboring shared-chart UI routes are usable | `npm run test:dashboard:frontend -- intent-ci-history-chart-marks.spec.ts intent-project-ci-history-chart-marks.spec.ts intent-scope-timing-history-units.spec.ts` passed: Done/Project marks, keyboard/touch, light/dark, narrow labels and scope units. | Recheck the changed default branches/consumers after implementation. |

## Execution context

Established Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent Yui-chan.
Owned/originating checkout `/Users/terryyin/git/open-dough/.worktrees/make-recent-token-usage-easier-to-read`,
branch `codex/make-recent-token-usage-easier-to-read`; optional default/integration `/Users/terryyin/git/open-dough`.
Starting revision `244fc7bc67e454a3d43dfc7849f9b65edb805ec9`; initial published base/candidate
`07e3ec6c411f79f65f908fc9aa0ac18ce3f5d275`, verified on origin/main and execution branch.
Latest accepted increment `2e92e64c9756f844710dec50b4143c38ff0f518d` on origin/execution branch.
No second start; claim trunk CI unobserved. No replanning override; existing planning authority retained.
Checkout `npm ci` with unchanged lockfile and `npm run typecheck:dashboard` passed.
Selective formatter `npm run format`; check-only `.githooks/pre-commit` owns staged lint and typecheck.
No generation or separate project-summary mutation applies to these dashboard changes.
CI GitHub Actions `terryyin/open-dough`, verified `ci.yml` (CI), execution branch target.
Observer coordinator `yui-seed369`, cell `g369:14`, session73304, `/tmp/dough-ci-501/watch-KhIAqs`, PID85851,
from owned checkout above; reuse for every increment.
Expensive-proof basis: local awake AC macOS, load11.76/8.72/7.49, 49% memory free; no competing owned proof.
Run focused Backend/Frontend/E2E sequentially under `caffeinate -s -i`, 10-minute command deadline,
default test timeouts; implementer owns terminal result. Reconsider on changed conditions/failure;
leave unrelated processes to owners and reuse settled preparation observations.

### Slice 1 acceptance

[Inspected proof and consumer dispositions](source-review.md#slice-1-acceptance) match every allocated
source expectation; no gap or deferred/running proof. Implementation ~8 active minutes.


## Story obligations

### G1. Average still contributes to ordinary scale
Reported: slice 2 — "Moving averages still influence the ordinary axis."
Story clause: "independently of the average"
Disposition: proved by slice 3: system-settings-usage-average.spec.ts ordinarySeparation unchanged with high average and 65M task; chartLayout independentTrend omits trend from ticks
Commitment: C30
### G2. Dated average overflow remains for slice 3
Reported: slice 2 — "An all-large fallback’s above-scale average lacks explicit dated overflow rendering."
Story clause: "Explicitly identify an average above that scale at its date and make its actual value readable; a clipped trace must not imply that the scale ceiling is the actual average."
Disposition: proved by slice 3: system-settings-usage-average.spec.ts showsAverageOverflow true7.4M and all-large65M dated values; showsSeparatedAverageLevels breaks in→above→in; unchanged task/average values in service
Commitment: C31, C32, C33

## Execution complete

Product advice: Keep the delivered recent-period and chart behavior; focused
observations support readability and true averages. No additional product response.
