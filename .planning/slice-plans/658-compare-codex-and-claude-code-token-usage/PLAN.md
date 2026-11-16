# Compare Codex and Claude Code token usage

**Identity:** SEED-383#compare-codex-and-claude-code-token-usage
**Source:** [Compare Codex and Claude Code token usage](../../seeds/SEED-383-compare-codex-and-claude-code-token-usage.md#compare-codex-and-claude-code-token-usage)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer compares finished dashboard-launched Codex and Claude Code tasks
in System settings → Usage, overlays either or both tools, and chooses shared
completion time or equal spacing across all visible tasks.

Terry selected the recommended metric interpretation on 2026-11-16: retain
both existing tool-relative indices on one numeric scale, explicitly labeling
Codex's GPT-6.1 Sol and Claude Code's Opus 5.5 input-token equivalents. Values
do not become common cost units or evidence of tool efficiency.

Include shared workflow/model/effort/day filters, model options from selected
tools, distinct labeled series, independent ten-task medians, task inspection,
coverage and unpriced notes, accessible controls and narrow-screen use.
Preserve the existing tariff arithmetic, eligible population, pre-period
median history, refresh and task-detail semantics.

Exclude tariff changes, new collection or persistence, Cursor, workload
matching, raw-token and cost conversion, billing and efficiency conclusions.
These are delivery boundaries rather than new rejection rules.

## Existing solutions and architecture

PFE searched Usage, the shared HistoryChart consumers (Project CI, Done CI
wall time and scope timing), backend cohort/pricing, the Usage contract and
the shared test builders. Extend `HistoryChart` and its series/layout/plot,
overflow and trend collaborators: they already own scales, dated coordinates,
accessible marks, selection and overflow. They currently accept one trend;
multiple named traces are the gap. Keep one placement rule and overflow
allocator for the whole plot rather than overlaying independently scaled SVGs.

Reuse `tokenIndexUrl` and the existing per-tool endpoint, deriving one combined
view in `SystemSettingsUsage`/`TokenIndexTrend`. Each response owns its cohort,
tariff, models, efforts and median. Union filter offerings in the view; do not
pool median membership or introduce a combined persisted cohort. Keep tool
identity with each task throughout selection and readouts, including task IDs
that happen to be equal across tools.

`tokenIndexCohort` supplies the task identity of each median observation for
equal-spacing placement; timestamps alone cannot distinguish tied tasks.
This is derived response information, not a usage-store migration. Keep the
existing `average` wire name and its `at` and `value` meaning.

Follow [ADR 0002 — lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008 — dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010 — definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The existing [Architectural North Star](../../NORTH-STAR.md) needs no new topic:
this extends current derived presentation and changes no durable authority.
The [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
informs readable labels, keyboard order, contrast and narrow layouts.

## Decisive premises and observations

Observations below used the established owned checkout at
`b4cf6dde4335b965c6dc8421266015ca99444bb5` on 2026-11-16. No scratch source
edits remain. New comparison and spacing promises need new discriminating
proof; the existing tests below prove only their stated current boundaries.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| Existing index values must retain separate units (slice 2) | Real `tokenIndex` with each stored tariff's reference model and identical 1,000 uncached input / 10,000 reads / 2,000 one-hour writes / 100 output returned Codex 4,000 and Claude 6,000. Terry selected explicit tool-relative units. | No vendor-price or exchange-rate claim. |
| Shared layout can place all dated entries on one time axis (slices 1–2) | Executed `chartLayout` at width 800 with four entries ending at 12:00, 12:00, 14:00 and 18:00 UTC: x = 56, 56, 298.6667, 784. Bundled the real TS/TSX module with installed Rolldown, CSS external and module side effects disabled. | This pure numeric operation uses no DOM or CSS; ignoring unused rendering imports cannot affect its coordinates. Browser painting remains slice proof. |
| Current frontend proof detects missing median drawing (slice 1) | `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts dashboard/frontend-tests/system-settings-usage.spec.ts --grep 'ten eligible tasks draw' --workers=1 --reporter=dot`: 1 passed, 6.9 s. Scratch `answer.average.slice(0, 0)` in the chart adapter, same command: expected line count 1, received 0. Restored source. | Does not prove multiple tool traces or equal spacing. |
| Real HTTP cohort/pricing and pre-period median routes are available (slices 2–3) | Same guarded Playwright form with `--config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/token-index-period.spec.ts dashboard/backend-tests/usage-history/token-index-claude.spec.ts --workers=1 --reporter=dot`: 5 passed, 2.7 s, including preserved Codex answer and period median. | Add tied median task-ID observations in slice 3. |
| The preview journey reaches imported Claude tasks and Refresh through real services (slices 2–3) | `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts e2e/configuration/system-settings-usage-tools.spec.ts --workers=1 --reporter=dot`: 1 passed, 4.5 s after local executable setup below. | Extend this journey to operate both-tool comparison and spacing. |

The first backend attempt failed before HTTP observation because this worktree
lacked its local `node_modules` directory; creating that ignored directory
settled the cause and the same five tests passed. The E2E preview also requires
local `node_modules/.bin/vite`; package and lock files matched the integration
checkout, so its installed `.bin` was linked locally for the observation.
Execution must establish local dependencies before these commands.

## Outside-in proof and affected consumers

| Promise | Owner and observable proof |
| --- | --- |
| Either tool or both; distinct named points and medians on common numeric bounds, correct units and per-tool notes | Slice 2 frontend comparison cases through System settings, with tool-owned values, two eligible medians, partial/unpriced cases and one empty tool; real service composition in representative E2E. |
| Model offerings are the selected-tool union; retain a valid choice, reset only when unavailable | Slice 2 frontend transitions Codex → both → Claude, including a shared model ID and a tool-specific ID; inspect request queries and resulting visible tasks. |
| Time positioning preserves coincident times and proportional gaps | Slice 2 browser coordinates for interleaved tasks with duplicate timestamps and unequal time gaps. Both tools use the same bounds. |
| Each visible task gets one chronological slot, including tied times and partial tasks | Slice 3 browser coordinates across both tools; equal adjacent distances, deterministic tie order, no slot for unpriced tasks that have no point. |
| Each median stays on its own eligible task, including ties and earlier history | Slice 3 HTTP answer asserts task anchors and unchanged values; browser sees each tool's median at that anchor's slot. |
| Toggle back restores time coordinates; actual times, indices and task identity survive inspection | Slice 3 round trip with selected detail and repeated task IDs across tools. Assert actual `time[datetime]`, tool, value and return focus. |
| Keyboard/touch controls, non-color tool identity and narrow screens | Slices 2–3 at 390 px and narrowest supported reading window, light/dark, visible focus, labels and contrast; no page-wide horizontal overflow. |
| Existing filters, refresh/check time, overflow, partial styling, empty states and task detail | Slice 2 runs all Usage frontend cases, updates their Tool/readout assumptions without weakening behavior; slice 3 repeats affected cases. |
| CI and scope charts retain their dates, scales, gaps, references, selection and readouts | Slices 1 and 3 run shared-chart frontend consumers, including Project/Done marks and scope gaps/segments/units. |

Frontend cases start at the rendered app and substitute only backend service
answers. Backend cases enter the real Usage HTTP boundary with isolated usage
storage. Extend the existing preview E2E in
`e2e/configuration/system-settings-usage-tools.spec.ts` to combine both tools,
change a filter and spacing, inspect a task and Refresh using real services
and synthetic native-session inputs. Keep display permutations in frontend
cases rather than duplicating them in E2E.

The changed shared-chart consumers are `IntentCiHistory`,
`IntentCiDoneWallTimeReference`, `IntentScopeTimingHistoryUnits` and Usage.
Trace their enclosing observations through `historyChartPage`,
`intentCiHistoryPage`, `intentScopeHistoryPage`, `systemSettingsUsagePage`
and `usageChartPage`. A changed Tool control, readout or legend reaches all
Usage cases and helpers; do not update only the new comparison spec.

Adding a median task anchor reaches `usageAnswerTestData.mjs.withTrend`,
Usage average/checking fixtures and backend exact `average` assertions in
token-index-period, eligibility, large-average, claude-coverage,
claude-population and refresh-claude-gaps. Update fixtures and assertions to
retain their independent values and eligibility/period purpose. Run the
installed consumer-trace script at each changed boundary with these retired
labels, call forms and response fields; disposition every located consumer.

## Ordered slices

### 1. Shared chart supports named traces on one set of coordinates

Type: Structure
Status: done

Extend the existing series/layout/plot contract for the named point and trend
groups slice 2 needs, sharing value/time bounds, readout identity and overflow
placement. Preserve current one-series defaults and CI/scope semantics. Keep
domain labels in the supplying view and chart geometry in its existing owner.
This immediately enables slice 2; add no unused chart framework.

Proof: all existing Usage frontend cases and the shared-chart consumers above
remain green, with numeric/time placement and overflow preserved. No new user
controls appear in this slice. The next Behavior owns observing both traces.

Sizing: 15 active minutes, medium confidence; existing collaborators are
small and already separate layout, trend, overflow and painting.

Accepted proof (2026-11-16): the guarded frontend command with all
`system-settings-usage*` cases and the named shared-chart consumers, 36 passed
(one worker). Refactor pass: no change. Contract for slice 2: series `traces`
names point groups in drawing order; points and `trends[]` carry `trace`; the
first trace keeps today's classes and later ones add `history-chart-trace-N`
(no CSS yet); readouts and trend overflow labels gain the trace name. Entry
keys must be tool-qualified because the chart keys marks and overflow by them.

### 2. Compare selected tools on the shared completion-time chart

Type: Behavior
Status: planned

Given finished tasks for both tools, selecting Codex, Claude Code or both
shows only those series with labeled colors, each reference unit and median,
one numeric scale and one completion-time axis. Replace Tool's single select
with accessible independent selections, union model/effort offerings, preserve
valid choices, and reset unavailable ones only after selected-tool offerings
settle. Keep workflow/day choices and each tool's pricing/coverage semantics.

Read the selected per-tool cohorts with identical period bounds. Abort obsolete
reads; never render answers from different filter selections as one completed
comparison. An error identifies the failed read rather than treating it as an
empty tool. Refresh retains the last same-selection result and check time on
failure. A successful empty tool is explicitly empty. With neither selected,
show a prompt to select a tool; do not invent zero measurements.

Preserve tool/task identity in marks, accessible readouts and detail, and
clear selection when its point is hidden. Keep initial Codex, Execution,
All models, Any effort and 30 days; time spacing remains the initial mode.
Update `dashboard/USAGE-TOKEN-INDEX.md` to replace its old separate-chart rule
and retain the approved interpretation and all continuing behavior.

Proof: comparison frontend cases plus all existing Usage cases, affected
shared-chart consumers and the representative E2E. Inspect true coordinate
ratios, not just point counts. Include narrow-screen and keyboard operation.

Sizing: 15 active minutes, medium confidence; existing endpoints and slice 1's
chart contract avoid new pricing, collection or storage work.

### 3. Give interleaved tasks equal room without losing their times

Type: Behavior
Status: planned

Given the selected visible tasks, switching equal spacing on places one task
per equal-width slot in completion order across tools. Resolve equal times
stably by tool then task ID. Label the horizontal axis as task order; changing
filters rebuilds that visible sequence. Switching off restores time positions.
Spacing is view state, retained through Refresh and cohort/day changes.

Carry the eligible task ID on each backend median observation and use its
tool-qualified anchor for ordinal placement. Preserve each tool's existing
median calculation, pre-period history and timestamps. Points, trends and
overflow labels use the same placement policy; never synthesize fake dates.
Retain real completion time, index, selected task and close-to-mark focus when
the point remains visible. Update the Usage contract with both axis meanings.

Proof: tied-time HTTP median anchors, frontend interleaved/tied/partial/large
task round trips, median overflow and detail time/focus; extend the same E2E
journey to operate the real spacing control. Run affected backend exact-answer
consumers and the shared-chart defaults again after this geometry change.

Sizing: 15 active minutes, medium confidence; one placement policy and explicit
anchors avoid timestamp heuristics and per-tool ordinal axes.

## Local gates and execution policy

- Focused checks use the guarded forms above, adding each slice's named specs.
  Run all `dashboard/frontend-tests/system-settings-usage*` cases and named
  shared-chart consumers while those boundaries change: under `frontend-tests/`,
  `intent-ci-history-chart-marks.spec.ts`,
  `intent-project-ci-history-chart-marks.spec.ts`,
  `intent-scope-timing-history-*.spec.ts` and
  `intent/intent-ci-wall-time-history*.spec.ts`.
  Slice 3 runs the
  affected `dashboard/backend-tests/usage-history/token-index*` cases. Run the
  representative E2E after its changes. Typecheck with
  `npm run typecheck:dashboard`; run eslint/prettier on changed sources.
- On macOS, start fully awake. On AC power use `caffeinate -s -i`; on battery,
  plug in or keep the lid open under `caffeinate -i` and inspect sleep logs,
  per [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Respect shared full-group admission; recheck host headroom before broad proof.
- Preparation's local host showed load 4.76/5.75/5.34 and 53% free memory on AC;
  one-worker focused runs were chosen alongside other work. These observations
  justify only those runs, not a future whole-group launch.
- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written. Keep default test timeouts; never use `test.slow()`.
- Selector results: MakeMe applies to frontend/backend/E2E tests above;
  page objects additionally apply to frontend and E2E. Recheck new paths before
  authoring; extend focused existing owners and shared builders.
- Perform post-change refactoring before each commit. Expected edited source
  files currently fit 250 lines (largest shared page object: 229; wire type:
  196; layout: 182). Split growing files at their responsibility seams.
  Execution retains its commit, publication, independent review and CI duties;
  this preparation grants no execution authority or execution mode.

## Readiness and cumulative design

Slice-plan refinement not needed: the necessary shared chart Structure is
immediately followed by its comparison Behavior; equal spacing is a separately
usable view change with its own proof loop. Three slices stay below eight.
Both behaviors extend one cohort/series/placement model; neither pools medians,
duplicates geometry nor changes stored measurements. No slice-specific concern
remains after the metric decision and the observations above.
