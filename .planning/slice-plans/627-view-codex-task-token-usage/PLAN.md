# View token usage for dashboard-launched Codex tasks

**Identity:** SEED-357#view-token-usage-for-dashboard-launched-tasks
**Source:** [selected story](../../seeds/SEED-357-dashboard-task-token-usage.md#view-token-usage-for-dashboard-launched-tasks)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Terry opens System settings → Usage and sees one Token index point per
finished dashboard-launched Codex task, with a 10-task moving average for the
selected launch workflow, model and effort. He can open any point's detail and
refresh the data on demand. The story's Scope, Key examples, UI and
Architecture sections are the contract; this plan does not restate them.

Included: the derived chart and its detail, the versioned Codex tariff, the
observed service tier in the Codex reader, coverage and pricing eligibility,
incremental Refresh, and the Usage view.

Exclusions: other tools' cohorts, unknown- or native-origin tasks, unassigned
usage, task lists or history browsing, per-session usage elsewhere in the
dashboard, live in-progress usage, scheduled refresh, billing or account-usage
APIs, other tariffs, and changes to the offline importer's command line.

Assumptions: the usage store, its offline importer and the 2026-11-15 recovery
receipt supply history. Launch records keep `doneAt` and `completion`
permanently (SEED-358).

## Existing solutions and direction

- **Usage evidence.** Reuse `dashboard/server/usageHistory.ts` (store,
  lock, reconciliation), `codexUsage.ts` and `codexUsageLineage.ts` (reader,
  lineage, association, coverage gaps), and `retainedUsageTasks.ts` (launch
  records → tasks, including outcomes). Refresh composes these per changed
  file and runs neither the full importer nor recovered-task reconstruction.
- **Chart.** `dashboard/src/ciHistoryChartLayout.ts` and
  `IntentCiHistoryPlot.tsx` already draw a dated point series with a reference
  line, selected and hollow marks, and gap marks, but they are typed to CI
  builds and milliseconds. Prefer generalizing that layout with a value axis
  and value formatter, so Usage and CI history share one chart model. Add a
  second chart layout only when the generalization would distort CI history,
  and record the reason in Learnings. Slice 1 generalized it in place; see
  Learnings for the current names.
- **System settings.** `dashboard/src/SystemSettings.tsx` is one page of
  sections today. Usage becomes a separate view within System settings, as in
  the approved mockup. The existing sections stay together as General.
- **ADR 0008.** The derived per-task summary is a rebuildable cache beside the
  usage store; no database. The UI says **Launch workflow**, the Accepted
  concept name. Wire data maps the domain directly: tasks, coverage, tariff.
- **Tariff.** Versioned source data next to the derivation, holding model
  rates per token category, the reference model, the speed tier it prices and
  the date read. No priced value is written into usage records.

## Decisive premises and observations

All observations were made on 2026-11-15 in this workspace at `95c0ee22f`,
reading the real machine store `~/.open-dough/dashboard/launch-history/usage.json`
(manifest from 05:48, 2,316 pages) and native roots read-only, with Node
24.21.0. Scratch scripts lived in the job's temporary directory. No store,
native file or product source was changed. A temporary `node_modules` link to
the integration checkout, whose `package-lock.json` matches, was removed
before commit.

| Consuming operation / premise | Observation and limits |
| --- | --- |
| Refresh (slice 5): reading only Codex rollouts changed since the last check, with stored tasks plus current launch records, assigns responses exactly as the full import does | Ran `codexUsage` over the 231 rollout files modified since 2026-11-13T16:00Z, with a fresh `codexLineage`. Then ran `codexAssociation` against the stored task catalog merged with `retainedUsageTasks(home)` (2 new launches). Result: 0 differences across 17,491 responses also in the store, with 6,142 assigned to dashboard tasks. 198 new responses were assigned and 699 new ones remained unassigned, as in the store generally. Took 2.4 s and 452 MB peak RSS. It ran as a standalone process, not inside the dashboard. The host process does not change reader or association output. Writing through `writeUsageHistory` is the importer's proven path and is not re-observed. |
| Derivation placement (slices 1, 5): a full store scan is too heavy for the server's event loop | Raw page parse of tasks, associations and observations: 3.43 s, 387 MB peak RSS. The same scan through the validating `snapshotRows`: 13.0 s, 1.81 GB. Both covered 514,444 responses. So the full derivation runs outside the server process, and a chart request reads only the derived summary. |
| Population and filters (slices 1–2) | 513 eligible dashboard-origin Codex tasks: 387 retained launches and 126 recovered. Workflows: 265 refinement, 229 execution, 16 ad hoc, 3 unknown. Observed models: `gpt-6.1-sol` and `gpt-6-astra`; 3 tasks used both and 316 had worker responses. Observed efforts: xhigh, ultra, high, max, medium. Outcomes: 382 reported complete, 1 reported incomplete, 130 none (126 recovered and 4 recent launches). No dashboard launch uses a slice-planning workflow; `dashboard/src/launchWorkflow.ts` defines Execution and Refinement, plus ad hoc. |
| Finished rule (slice 3) | Launch records in `2026-11.jsonl` carry `doneAt`, and `completion` maps to the task outcome (`retainedUsageTasks.ts`). Usage tasks do not carry `doneAt`, so the derivation reads it from the launch records. |
| Tariff (slice 1) and tier (slice 4) | The [Codex rate card](https://learn.chatgpt.com/docs/pricing#token-rates), fetched on 2026-11-15, gives standard credits per 1M tokens. GPT-6.1 Sol: input 50, cached input 2.5, output 250. GPT-6 Astra: 250, 25 and 1,250. There is no cache-write charge; fast tiers cost 2–8×. Rollouts record `service_tier` in `thread_settings_applied` events. Every recorded tier was `default`; 51 of 2,786 plain rollouts with usage since 2026-09-15 had no tier field. The reader does not keep the tier today (`codexUsage.ts` settings). |
| Coverage (slice 4) | Every stored Codex response for configured work is `measured` (recovery receipt). The gaps collection has no task-keyed gap for dashboard Codex tasks, and 36 `no-attributable-response-usage` gaps on their sessions belong to other tasks. In real data, partial Codex tasks are therefore rare. Fixtures build them through the existing gap vocabulary (`codexCoverage`). |
| Test harness | Integrated UI and backend servers run with an isolated `server.home` (`dashboard/tests/support/*`), and `backend-tests/usage-history/*` already builds stores and rollouts. Slices write fixture stores into that home with `writeUsageHistory` and the existing builders. |

## Outside-in proof ownership

- **Integrated UI** (`dashboard/tests`, page objects and MakeMe): one Usage
  page object owns filters, points, the average, detail, the cohort note,
  check time and Refresh. Each Behavior slice extends that journey with its
  own key example, on a fixture store in the server's home.
- **Backend** (`dashboard/backend-tests/usage-history`): index arithmetic
  (seed example: 1,950), tier recording from a built rollout, incremental
  refresh equivalence and idempotence, and leaving the store unchanged when
  derivation runs. Assert observed results, not tariff constants, per the
  [test automation instructions](../../../AGENTS.md#test-automation).
- **Real-store observation** (slice 5, read-only, unpaid): open Usage on this
  machine's store. Record the summary rebuild time and peak RSS, and confirm
  that board requests keep answering during Refresh.

## Ordered slices

### 1. Usage shows the Token index trend for finished Codex executions
Type: Behavior
Status: done
Proof: integrated journey on a fixture store with 12 finished dashboard Codex
Execution tasks on GPT-6.1 Sol, one carrying a GPT-6 Astra worker. Opening
System settings → Usage with Codex, Execution, All models and Any effort shows
12 points. Its moving average equals the mean of the latest 10, and the named
tariff version is shown. A backend spec scores the seed's single-response
example at 1,950 and the Astra worker at Astra rates. Deriving leaves the
store's manifest and pages byte-identical.

Behavior: a usage store with finished dashboard Codex tasks → Terry opens
Usage → he sees the System settings Usage view, with existing settings under
General. It shows the Codex Execution cohort's Token index points over end
time, the trailing 10-task moving average, the tariff label and the check
time. The derived per-task summary is built off the server's event loop when
missing and kept as a rebuildable file beside the store. This slice adds the
tariff data and index computation, and the chart model per the reuse
direction above.

### 2. Launch workflow, model and effort select the cohort
Type: Behavior
Status: done
Proof: integrated journey on a fixture store with Execution and Refinement
tasks. Switching to Refinement changes the points and the average. Model
offers All models plus the observed models, and Effort offers Any effort plus
the observed levels. Choosing GPT-6 Astra keeps only tasks whose root
responses were mostly Astra. A root tie appears only under All models.

Behavior: Terry changes a filter → the chart shows that cohort, with filter
options taken from observed tasks and specific options matching the primary
root setting. Ad hoc is included as a workflow option.

### 3. A point opens its task detail
Type: Behavior
Status: done
Proof: integrated journey: two launches of one story, one returned to the
backlog and one completed, give two points with their own details. Points are
selectable by keyboard and by pointer. A recovered task without an outcome
shows "Outcome unknown". A launch neither marked done nor reported is not
plotted until it is marked done.

Behavior: Terry selects a point → the detail shows story title and identity
when known, project, launch workflow, outcome, end time, requested and primary
observed model and effort, the index and its coverage. Close returns focus to
the point. Finished means a reported outcome, a launch marked done, or a
recovered task.

### 4. Partial and unpriced tasks stay visible and out of the average
Type: Behavior
Status: done
Proof: backend spec: a built rollout with
`thread_settings_applied.service_tier: "fast"` yields responses whose observed
tier is `fast`; one without the field yields no tier. Integrated journey: a
task with a worker coverage gap shows a partial mark and its gap in the
detail, and is excluded from the average. A task with one fast-tier response,
or one with an unrated model, has no point and is counted unpriced in the
cohort note. With 9 eligible tasks, the note reads "Fewer than 10 eligible
tasks" and no line is drawn. An empty cohort says no finished task matches.

Behavior: coverage and pricing eligibility as the seed's Coverage and Required
restrictions define them. The Codex reader keeps the thread's applied service
tier on observed settings.

### 5. Refresh brings in new Codex usage
Type: Behavior
Status: done
Proof: backend spec: with a stored history and one rollout appended after the
last check, Refresh reconciles only changed files and adds a newly finished
launch from the current launch records. Associations match a full import of
the same fixture roots. A second Refresh with no new activity changes no
summary value or stored observation. An unreadable store fails the refresh
and leaves the prior summary. Integrated journey: Refresh shows a checking
state, then the new point and a new check time. On failure, the prior chart
and check time stay with a readable error. Real-store observation as above,
with the rebuild time and peak RSS recorded in Learnings.

Behavior: Terry presses Refresh → Codex rollouts changed since the last check
are read with the shared reader in a process off the server's event loop and
reconciled into the store under its lock. The summary is rebuilt and the view
updates. Overlap with an offline import counts each response once.

## Current decisions

- Execute in Story Branch Mode; no slice acts from trunk.
- Usage reads only the derived summary. The full store is read only by
  summary rebuilds and refreshes, in a separate process. Since slice 3, the
  chart request also reads the current launch records
  (`retainedLaunchEnds`) for the finished rule. The summary stays a pure
  derivation of the store.
- Fixture tariffs in tests come from the tariff data the product uses or from a
  test-built version. Assertions compare observed index values with arithmetic
  on the fixture's counters, never with copied rate constants.
- The mockup stays until wrap-up, per the seed's temporary design reference.
- Test placement follows the current [test roots](../../../dashboard/tests/README.md#roots-journeys-integrated-ui-checks-frontend-only-and-boundary-tests): each slice's "integrated journey" is one representative journey in `e2e/configuration/` (real server, fixture store in its HOME); presentation and interaction details with controlled answers go in `dashboard/frontend-tests/`; derivation and server variants go in `dashboard/backend-tests/usage-history/`. No new spec is added to the interim `dashboard/tests/` group.

## Learnings

- **Slice 1 (accepted).** Usage reads `GET /__usage/token-index`
  (`dashboard/server/usageBoundary.ts`). A request reads only
  `usage-task-summary.json` beside the store and the digest of the store
  manifest. When the summary is missing, of another format, or derived from
  another manifest, `usageTaskSummaryCache.ts` rebuilds it in a separate
  `node usageTaskSummaryMain.ts` process. Concurrent requests share one
  rebuild, and an importer run shows up without Refresh. The summary keeps
  each dashboard Codex task's facts and its counters grouped per (model,
  effort, root or worker). Pricing happens at read time (`tokenIndex.ts`,
  tariff in `usageTariffs.ts`, cohort in `tokenIndexCohort.ts`). `checkedAt`
  is currently the summary derivation time; slice 5 decides what a Refresh
  check time means. Slice 4 adds coverage counts to the summary groups and
  bumps `summaryFormat`.
- Recovered tasks record the invoked skill (`dough-execute-plan`) as their
  workflow. `tokenIndexCohort.launchWorkflowOf` maps it through
  `launchWorkflows[*].skill`.
- The chart was generalized without distorting CI history, then renamed:
  `dashboard/src/historyChartSeries.ts` (`HistoryChartEntry`, `entries`),
  `historyChartLayout.ts`, `HistoryChart.tsx`, `HistoryChartPlot.tsx`, the
  `ValueAxis` in `chartValueAxis.ts`, CI duration axes in `ciDurationAxis.ts`,
  classes `history-chart-*`, and the page object
  `dashboard/tests/historyChartPage.ts`. The Usage page object is
  `dashboard/tests/support/systemSettingsUsagePage.ts`.
- e2e specs cannot import `dashboard/src/ciHistoryWords.ts` (it reaches a
  `.tsx` file), so the e2e Usage journey formats expected words itself.
- **Slice 2 (accepted).** The cohort is chosen on the server:
  `GET /__usage/token-index?workflow&model&effort`, built and parsed by
  `tokenIndexUrl` and `requestedCohort` in `dashboard/src/usageTokenIndex.ts`
  (an unknown workflow is refused with 400). The primary setting is the strict
  majority of root responses by count (`tokenIndexCohort.primarySetting`); a
  tie gives none. Model and Effort options span every finished task of the
  configured projects across workflows, so switching workflow never drops the
  chosen option. The summary groups carry `responses` again
  (`usage-task-summary-v2`).
- Journey layout: each slice adds a sibling
  `e2e/configuration/system-settings-usage-<topic>.spec.ts` (detail,
  coverage, refresh) on the shared `e2e/configuration/usageFixtureStore.ts`.
  Backend variants go in sibling specs under
  `dashboard/backend-tests/usage-history/`, since `token-index.spec.ts` is
  near 250 lines. Store contents are built with `makeMe.aUsageHistory`.
- **Slice 3 (accepted).** Finished is decided on each request from the
  launch records (`dashboard/server/tokenIndexTask.ts`). A launch marked done,
  or one that reports after import, appears on the next Usage open without a
  rebuild, and the record's current outcome overrides an earlier imported
  one. Hashing `agent-launches.json` into the summary key was rejected: the
  file is 8.4 MB and changes constantly, so almost every open would trigger a
  3.4 s rebuild. On this machine, `retainedLaunchEnds` read 1,352 real
  launches in 71–184 ms per call, about what Board requests already pay. The
  detail rides on `TokenIndexTask`. Coverage is `measured` ("No known gaps")
  until slice 4 adds a partial kind through `UsageTaskCoverage` and
  `coverageWords`. `HistoryChart` takes an optional `onChoose`, and only
  charts that pass it expose `aria-pressed`. The summary is
  `usage-task-summary-v3` (requested model and effort).
- Outcome words share `reportedOutcomeLabel` and `returnedToBacklogLabel`
  in `dashboard/src/completionReport.ts`. The selected point lives in
  `TokenIndexTrend`, which unmounts on a filter change. Slice 5's Refresh
  keeps the chart mounted, so it must keep or clear the selection
  deliberately.
- **Slice 4 (accepted).** Partial means the evidence shows missing usage,
  and only these gap codes count (`usageCoverageGaps` in
  `dashboard/src/usageTokenIndex.ts`): `missing-worker-evidence`,
  `incomplete-worker-evidence`, `no-response-usage-evidence`,
  `unsupported-response-counters`, `unresolved-task-association`,
  `missing-token-components` and `no-attributable-response-usage`. A
  non-measured response, or a task with no response, is also partial.
  `ambiguous-worker-evidence` and `unresolved-worker-evidence` are left out.
  They say a spawn record matched no single worker, while workers still join
  their task through `parent_thread_id`. Counting them made 257 of 513 real
  tasks partial (read-only check of the real store); without them, 0 are.
  Gap attribution lives in `dashboard/server/usageTaskGaps.ts`. The tariff
  prices `speedTier: { name: "standard", recorded: ["default"] }`, and an
  unrecorded tier prices as standard. Observations keep the raw
  `settings.serviceTier`, and reconciliation merges it. The summary is
  `usage-task-summary-v4`: groups per (model, effort, tier, root or worker),
  plus task gaps. A real-store rebuild now takes 8.3 s and 325 MB under load
  of about 8; slice 5 re-measures. A trend with one value draws a short level
  line, so only fewer than 10 eligible tasks show no line. A cohort with only
  unpriced tasks says "No priced finished task matches." For slice 5:
  rereading a rollout imported before tiers were kept adds one measurement
  per response that differs only in `serviceTier`. Counters dedupe, so the
  index is unchanged.
- **Slice 5 (accepted).** Refresh (`POST /__usage/refresh`) runs
  `usageRefreshMain.ts` in a separate process; concurrent presses share one
  run (`usageRefreshRun.ts`). It reads every rollout under the importer's
  `codexUsageRoots` modified since the cutoff, plus any parent or worker
  rollout they name. It assigns them with `codexAssociation` against
  `launchCatalog` and writes through `writeUsageHistory` under the store lock.
  The check time is persisted in `usage-check.json` beside the store, written
  only after the store write succeeds. Before any Refresh, "Checked" shows the
  store manifest's modification time. The cutoff is the last check minus 2 s,
  or else the manifest time minus 1 day. The summary no longer carries
  `checkedAt`. The selection survives a Refresh while its point remains.
- Real-store observation (2026-11-15, scratch APFS clone of the store and
  launch records, real `~/.codex` read in place; the real store's sha256 was
  unchanged and the scratch copy was removed):
  - Summary rebuild: 4.6 s, 392 MB at load about 4.5.
  - First Refresh: 37.9 s and 670 MB standalone, 57.9 s through the server
    including the rebuild. A no-op Refresh: 33.0 s.
  - Another local endpoint stayed responsive during Refresh: 553 requests,
    median 1 ms, p95 8 ms, max 28 ms.
  - Refresh added one finished Execution point and one finished Refinement
    point. 0 of 515 tasks were partial, and a no-op Refresh changed no value.
  - Latency is dominated by the shared snapshot writer, which republishes
    every partition: 12–16 s even for an empty batch. Rollout reading took
    0.1–2.4 s. A writer that skips untouched partitions would be separate,
    writer-level work.
- Local proof under external load (about 28): 3 integrated chart-consumer
  specs timed out at 2 workers before any chart was drawn, and passed 5 of 5
  at 1 worker. Hosted CI is the verdict; a recurrence there is owed a repair.

## Verification, sizing and concern review

- Local gate: each slice's touched specs and their consumers, using
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config <config> <paths> --reporter=list`
  for `dashboard/backend.playwright.config.ts` and
  `dashboard/integrated.playwright.config.ts`, plus the existing
  `backend-tests/usage-history` family whenever the reader, lineage or
  reconciliation changes (slices 4–5). Run `npm run lint` and
  `npm run typecheck:dashboard`. A fresh worktree needs
  `node scripts/setup-native.mjs npm` and `browser` first. No whole local
  suite is required; hosted CI runs the full suites after publication.
- Long local runs follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC use `caffeinate -s -i`; on battery plug in, or run awake with the lid
  open under `caffeinate -i` and read the sleep log afterwards.
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written, including local/CI differences and owned CI repair.
- Cumulative design: one domain rule set (eligible task → per-response
  weighting → task index → cohort average) grows by example. Filters, detail,
  coverage and refresh each extend the same summary and chart model. No
  recognizer is added per example, and nothing is built for Claude Code or
  Cursor beyond the Tool field.
- Refinement: not needed. There are five Behavior slices, each with one
  outcome and journey, and no preparatory Structure. Chart generalization
  happens inside slice 1, where it is first consumed.
- Remaining slice-specific concerns: none identified. Slice 1 is the largest,
  because it carries the walking skeleton: summary, tariff, chart model and
  view. If it overruns, split the chart-model generalization out as a
  Structure slice immediately before it.
