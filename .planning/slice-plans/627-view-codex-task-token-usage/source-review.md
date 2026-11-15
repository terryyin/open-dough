# Source review: SEED-357#view-token-usage-for-dashboard-launched-tasks

Obtained on 2026-11-15 before the first implementation delegation, from a fresh
general-purpose reviewer launched without conversation inheritance (Claude Code
Agent tool). Input: only the selected story section text from Goal through
Temporary design reference, with the instruction to read no project files,
change nothing, and return numbered commitments. Returned ids and texts are
recorded below as returned; Slice and observation are the coordinator's
allocation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1.1 | Terry can now and then check whether the price-weighted usage of finished dashboard-launched Codex tasks is trending up or down for one launch workflow | slice 5 | |
| 1.2 | Terry can inspect any single task behind the trend | slice 3 | |
| 1.3 | The trend is an observation that informs workflow decisions under ADR 0010; it makes no improvement or billing claim | slice 1 | observed: dashboard/src/SystemSettingsUsage.tsx: index, average, tariff and check time only; no improvement or billing wording |
| 2.1 | A point is one finished task with `origin: dashboard` and host Codex in the usage records | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts finished Codex executions…: native and unknown origin tasks absent from answer; dashboard/server/usageTaskSummary.ts host codex + origin dashboard filter |
| 2.2 | Points come from any project configured at view time | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts: retired-project task (not configured) absent, open-dough present |
| 2.3 | Hidden projects are included | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts: hidden doughnut project's with-worker task present |
| 2.4 | Retained launches count | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts: 11 launch tasks plotted; dashboard/backend-tests/usage-history/token-index.spec.ts launch tasks plotted |
| 2.5 | Recovered dashboard tasks count | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts: recovered day-0 task (dough-execute-plan workflow) plotted |
| 2.6 | A task is finished once it has a reported outcome or its launch is marked done | slice 3 | |
| 2.7 | A recovered task has no open session, so it is finished | slice 3 | |
| 2.8 | Each launch of the same story is its own point | slice 3 | |
| 2.9 | The x position is the reported outcome time, or else the last recorded activity | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts showsPoints: launches at outcome date, recovered task at last activity date |
| 3.1 | Usage is a separate System settings view beside the existing settings | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts expectGeneralSettingsShown/openUsage: Usage view beside General, existing Projects settings under General |
| 3.2 | It shows one chart: Token index per finished task | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts showsPoints: 12 Token index marks on the chart |
| 3.3 | It shows a trailing moving average of the latest 10 eligible tasks in the selected cohort | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts showsAverage: latest moving-average figure = mean of latest 10 fixture indexes, line drawn |
| 3.4.1 | Filter: one tool | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts showsCohort: Tool = Codex |
| 3.4.2 | Filter: one launch workflow (Execution, Refinement, Ad hoc) | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts offers Launch workflow Execution, Refinement, Ad hoc |
| 3.4.3 | Filter: Model (**All models** or each observed model) | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts offers Model All models, GPT-6.1 Sol, GPT-6 Astra |
| 3.4.4 | Filter: Effort (**Any effort** or each observed level) | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts offers Effort Any effort plus observed levels |
| 3.5 | Filter options come from the observed tasks | slice 2 | observed: dashboard/backend-tests/usage-history/token-index-cohort.spec.ts options.models and options.efforts from observed tasks (ultra from Execution) |
| 3.6 | With the broad Model and Effort options, the cohort includes every matching task | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts all 11 Refinement points under All models/Any effort incl. tie; dashboard/backend-tests/usage-history/token-index-cohort.spec.ts ids({}) lists all Refinement tasks |
| 3.7 | A specific model or effort matches the task's primary observed setting | slice 2 | observed: dashboard/backend-tests/usage-history/token-index-cohort.spec.ts ids({model: astra}), ids({model: sol}), ids({effort: xhigh}) match primary setting |
| 3.8 | The primary setting is the value on most of the task's root conversation responses | slice 2 | observed: dashboard/backend-tests/usage-history/token-index-cohort.spec.ts counted-by-response task: majority of root responses decides, not tokens |
| 3.9 | Workers do not decide the primary setting | slice 2 | observed: dashboard/backend-tests/usage-history/token-index-cohort.spec.ts sol-with-astra-workers stays Sol; e2e/configuration/system-settings-usage-cohort.spec.ts Sol Refinement with Astra workers only under GPT-6.1 Sol |
| 3.10 | A tie leaves the primary setting unknown, so the task appears only under the broad option | slice 2 | observed: dashboard/backend-tests/usage-history/token-index-cohort.spec.ts model-tie only under ids({}); effort-tie absent from every effort; e2e/configuration/system-settings-usage-cohort.spec.ts Tied refinement only under All models |
| 3.11 | Workers still contribute their usage at their own model's rates | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts: Astra worker weighted at Astra rates in with-worker index; e2e/configuration/system-settings-usage.spec.ts Nov 8 readout |
| 3.12 | This story offers only Codex in Tool | slice 1 | observed: dashboard/src/SystemSettingsUsage.tsx Tool select offers only Codex; e2e/configuration/system-settings-usage.spec.ts showsCohort |
| 3.13 | Claude Code and Cursor add their own cohorts later | slice 1 | observed: no Claude Code or Cursor cohort built (dashboard/server/usageTaskSummary.ts codex-only) |
| 4.1 | A point can be selected by pointer | slice 3 | |
| 4.2 | A point can be selected by keyboard | slice 3 | |
| 4.3.1 | Detail shows the story title when known | slice 3 | |
| 4.3.2 | Detail shows the story identity when known | slice 3 | |
| 4.3.3 | Detail shows the project | slice 3 | |
| 4.3.4 | Detail shows the launch workflow | slice 3 | |
| 4.3.5 | Detail shows the outcome, or "Outcome unknown" | slice 3 | |
| 4.3.6 | Detail shows the end time | slice 3 | |
| 4.3.7 | Detail shows the requested model when known | slice 3 | |
| 4.3.8 | Detail shows the requested effort when known | slice 3 | |
| 4.3.9 | Detail shows the primary observed model | slice 3 | |
| 4.3.10 | Detail shows the primary observed effort | slice 3 | |
| 4.3.11 | Detail shows the index | slice 3 | |
| 4.3.12 | Detail shows the coverage | slice 3 | |
| 4.4 | The chart response carries the detail it needs | slice 3 | |
| 5.1 | Measure the entire task as far as the evidence allows | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts with-worker index sums root, resumed turn and worker responses |
| 5.2 | Include all uniquely associated responses | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts with-worker index sums every associated response |
| 5.2.1 | …including resumed turns | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts resumed-turn response included in with-worker index |
| 5.2.2 | …including workers | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts Astra worker response included in with-worker index |
| 5.2.3 | …including background work | slice 1 | observed: dashboard/server/usageTaskSummary.ts deriveUsageTaskSummary: every associated observation summed, no turn or status filter |
| 5.2.4 | …including failed work | slice 1 | observed: dashboard/server/usageTaskSummary.ts deriveUsageTaskSummary: every associated observation summed, no turn or status filter |
| 5.2.5 | …including cancelled work | slice 1 | observed: dashboard/server/usageTaskSummary.ts deriveUsageTaskSummary: every associated observation summed, no turn or status filter |
| 5.3 | *Partial* = the task's own records or gaps show missing usage | slice 4 | |
| 5.3e | Partial examples: a missing worker, an unattributable response | slice 4 | |
| 5.4 | *Unpriced* = any associated response lacks a tariff rate | slice 4 | |
| 5.4e | Unpriced examples: an unknown model, a non-standard speed tier | slice 4 | |
| 5.5 | A partial task appears with a distinct mark | slice 4 | |
| 5.6 | A partial task's gap appears in the detail | slice 4 | |
| 5.7 | An unpriced task has no point | slice 4 | |
| 5.8 | An unpriced task is counted in the cohort note | slice 4 | |
| 5.9 | Neither partial nor unpriced tasks enter the moving average | slice 4 | |
| 5.10 | A measured zero stays a zero point | slice 4 | |
| 5.11 | Fewer than 10 eligible tasks show no line | slice 4 | |
| 5.12 | …and the view says so | slice 4 | |
| 6.1 | Opening Usage shows the latest derived result | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts: opening Usage shows the derived summary's points |
| 6.2 | …with the time it was last checked | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts showsCheckedAt: Checked <time> equals summary checkedAt |
| 6.3 | **Refresh** reads Codex rollouts changed since that check | slice 5 | |
| 6.4 | Refresh uses the same native reader as backfill | slice 5 | |
| 6.5 | Refresh reconciles into the usage store | slice 5 | |
| 6.6 | Refresh reconciles into the launch catalog | slice 5 | |
| 6.7 | Refresh then rederives the chart | slice 5 | |
| 6.8 | A response already imported contributes once | slice 5 | |
| 6.9 | During a refresh, the cached chart stays visible | slice 5 | |
| 6.10 | During a refresh, a checking indication shows | slice 5 | |
| 6.11 | A failed refresh keeps the chart | slice 5 | |
| 6.12 | A failed refresh keeps its check time | slice 5 | |
| 6.13 | A failed refresh shows a readable error | slice 5 | |
| 6.14 | Refresh latency is flexible | slice 5 | |
| 7.1 | Use a versioned reference tariff kept with the product source | slice 1 | observed: dashboard/server/usageTariffs.ts codexTariff2026_11_15 versioned source data |
| 7.2 | Codex starts with the standard-speed signed-in credit rates from the Codex rate card as read on 2026-11-15 | slice 1 | observed: dashboard/server/usageTariffs.ts: source rate-card URL, readOn 2026-11-15, speedTier standard |
| 7.3 | GPT-6.1 Sol per 1M tokens: input 50, cached input 2.5, output 250 | slice 1 | observed: dashboard/server/usageTariffs.ts gpt-6.1-sol 50/2.5/250; dashboard/backend-tests/usage-history/token-index.spec.ts 1,950 example |
| 7.4 | GPT-6 Astra per 1M tokens: input 250, cached input 25, output 1,250 | slice 1 | observed: dashboard/server/usageTariffs.ts gpt-6-astra 250/25/1,250 |
| 7.5 | Other rate-card models may be included | slice 1 | observed: dashboard/server/usageTariffs.ts: optional; only Sol and Astra included |
| 8.1 | Weight uncached input at the input rate | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts 1,950 example; dashboard/server/tokenIndex.ts uncachedInput×input |
| 8.2 | Weight cache reads at the cached-input rate | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts 1,950 example; dashboard/server/tokenIndex.ts cacheRead×cachedInput |
| 8.3 | Weight cache writes included in input at the input rate, with no separate write charge | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts resumed response cacheWrite 200 priced at input rate |
| 8.4 | Weight output at the output rate | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts 1,950 example; dashboard/server/tokenIndex.ts output×output |
| 8.5 | Reasoning output is already within output (not added again) | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts resumed response reasoningOutput 45 not added again |
| 8.6 | Sum over the task and divide by the reference GPT-6.1 Sol input rate | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts 1,950 example: sum divided by Sol input rate |
| 8.7 | The result is GPT-6.1 Sol input-token equivalents | slice 1 | observed: dashboard/server/usageTariffs.ts reference GPT-6.1 Sol input-token equivalents; tariff label in view |
| 9.1 | The plotted history uses one tariff version | slice 1 | observed: dashboard/server/usageBoundary.ts plots codexTariff only |
| 9.2 | The tariff version is named in the view | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts showsTariff(codexTariff.label) |
| 9.3 | Raw observations and pricing inputs stay unchanged | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts storeFiles(store) identical after derivation, rebuild and reweighing |
| 9.4 | Another tariff version recomputes the same history | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts later tariff reweighs the same summary counters |
| 10.1 | A response at a speed tier the tariff does not price stays unpriced, not priced at standard rates | slice 4 | |
| 10.2 | Rationale: the rate card charges fast tiers 2–8×, so a standard price would understate the response | slice 4 | |
| 10.3 | The native reader keeps the thread's applied service tier | slice 4 | |
| 10.4 | A rollout with no recorded tier is priced at the standard rate | slice 4 | |
| 10.5 | Evidence: on 2026-11-15, 51 of 2,786 plain rollouts since 2026-09-15 had no tier field; every recorded tier was `default` | slice 4 | |
| 11.1 | Partial and unpriced tasks stay out of the moving average (their missing usage would pull the trend down) | slice 4 | |
| 12.1 | Deferred: Claude Code cohorts | slice 1 | observed: no Claude Code cohort built |
| 12.2 | Deferred: Cursor cohorts | slice 1 | observed: no Cursor cohort built |
| 12.3 | Deferred: tasks of unknown origin | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts unknown-origin task absent |
| 12.4 | Deferred: tasks of native origin | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts native-origin task absent |
| 12.5 | Deferred: unassigned usage | slice 1 | observed: dashboard/server/usageTaskSummary.ts reads only associations with a dashboard Codex task |
| 12.6 | Deferred: a browsable task history | slice 3 | |
| 12.7 | Deferred: task lists | slice 3 | |
| 12.8 | Deferred: a separate task-detail service | slice 3 | |
| 12.9 | Deferred: per-session usage on Board or Sessions sidebar entries | slice 3 | |
| 12.10 | Deferred: live in-progress usage | slice 3 | |
| 12.11 | Deferred: automatic or scheduled refresh | slice 5 | |
| 12.12 | Deferred: billing reconciliation | slice 5 | |
| 12.13 | Deferred: account usage APIs | slice 5 | |
| 12.14 | Deferred: other tariffs | slice 5 | |
| 13.1 | The existing usage store, offline importer and its recovery receipt supply the history | slice 1 | observed: summary derives from the existing usage store (dashboard/server/usageTaskSummary.ts) |
| 13.2 | This story adds no database (ADR 0008) | slice 1 | observed: summary is a rebuildable JSON file beside the store; no database (dashboard/server/usageTaskSummaryCache.ts) |
| 13.3 | All retained Codex rollouts observed on 2026-11-15 are at the default speed tier | slice 4 | |
| 13.4 | Dashboard-origin Codex tasks use GPT-6.1 Sol and GPT-6 Astra | slice 1 | observed: dashboard/server/usageTariffs.ts prices GPT-6.1 Sol and GPT-6 Astra |
| 14.1 | Codex + Execution + All models + Any effort: each finished Execution task is one point | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts: 12 finished Execution tasks, 12 points with Codex/Execution/All models/Any effort |
| 14.2 | A GPT-6 Astra worker inside a GPT-6.1 Sol task is weighted at Astra's rates | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts with-worker Astra worker at Astra rates; e2e/configuration/system-settings-usage.spec.ts Nov 8 readout |
| 14.3 | Switching to Refinement changes the points and the average | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts choose Launch workflow Refinement: showsPoints(refinements), showsAverage(averageOf(refinements)) |
| 14.4 | Choosing GPT-6 Astra keeps only tasks whose root mostly ran on Astra | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts choose Model GPT-6 Astra: showsPoints(astraRefinements) |
| 15.1 | A story launched twice (once returned to the backlog, once completed) shows two points with their own outcomes | slice 3 | |
| 15.2 | A recovered October task without a reported outcome is a point with "Outcome unknown" | slice 3 | |
| 15.3 | A launch not marked done and with no reported outcome is not plotted yet | slice 3 | |
| 16.1 | An unattributed worker gap gives a partial mark, "Partial" with the gap in detail, and the task stays out of the line | slice 4 | |
| 16.2 | One fast-tier response gives no point and adds one unpriced task to the cohort note | slice 4 | |
| 16.3 | Nine eligible tasks show the points and "Fewer than 10 eligible tasks" | slice 4 | |
| 17.1 | After a new Execution launch finishes, Refresh adds its point and updates the check time | slice 5 | |
| 17.2 | Refreshing again without new rollout activity changes no value | slice 5 | |
| 17.3 | An importer run overlapping earlier responses leaves each response counted once | slice 5 | |
| 17.4 | A failed refresh (e.g. unreadable usage store) keeps the previous chart and check time and shows the error | slice 5 | |
| 18.1 | 1,000 uncached + 9,000 cache read + 100 output on GPT-6.1 Sol = (1,000×50 + 9,000×2.5 + 100×250)/50 = 1,950 | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts single task index 1,950 |
| 18.2 | Recomputing with a later tariff version uses the same stored counters and leaves them unchanged | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts later tariff reweighs same counters; storeFiles unchanged |
| 19.1 | The approved mockup is the layout reference, with three data corrections | slice 1 | observed: dashboard/src/SystemSettingsUsage.tsx follows .planning/mockups/dashboard-task-usage.html layout with Launch workflow label |
| 19.2 | The filter is labeled **Launch workflow** (ADR 0008 concept name), not "Task type" | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts offers(Launch workflow, …): select labelled Launch workflow (dashboard/src/UsageFilters.tsx) |
| 19.3 | Workflow options are Execution, Refinement and Ad hoc (the dashboard launches no separate slice planning) | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts Launch workflow options Execution, Refinement, Ad hoc |
| 19.4 | Effort lists the observed levels (e.g. xhigh, ultra, high, max, medium), not the mockup's example pair | slice 2 | observed: e2e/configuration/system-settings-usage-cohort.spec.ts Effort options are the observed levels xhigh, high, medium; dashboard/backend-tests/usage-history/token-index-cohort.spec.ts efforts high, medium, ultra, xhigh |
| 19.5 | Coverage wording follows the mockup: a cohort note with partial and unpriced counts | slice 4 | |
| 19.6 | Freshness wording follows the mockup: "Checked" with the time | slice 1 | observed: e2e/configuration/system-settings-usage.spec.ts showsCheckedAt: Checked with time |
| 19.7 | An empty cohort says that no finished task matches | slice 4 | |
| 20.1 | Reading the usage store is a new responsibility for the running dashboard (until now only the offline importer reads it) | slice 1 | observed: dashboard/server/usageBoundary.ts GET /__usage/token-index reads the summary in the running dashboard |
| 20.2 | Measured read-only scan on 2026-11-15: 3.4 s, 387 MB, no schema validation; 2,316 pages, 514,444 responses, 513 dashboard-origin Codex tasks | slice 1 | observed: plan Decisive premises row Derivation placement (premise data) |
| 20.3 | Derive the chart off the request path | slice 1 | observed: dashboard/server/usageTaskSummaryCache.ts: request reads summary + manifest only |
| 20.4 | Derive it from the store or from a rebuildable per-task summary | slice 1 | observed: dashboard/server/usageTaskSummary.ts per-task summary file; dashboard/backend-tests/usage-history/token-index.spec.ts rebuilds after deletion |
| 20.5 | Derive it without blocking the server's event loop | slice 1 | observed: dashboard/server/usageTaskSummaryCache.ts: rebuild runs in separate node process (usageTaskSummaryMain.ts); real-store responsiveness owned by slice 5 observation |
| 20.6 | ADR 0008 allows a rebuildable derived cache but no application database | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts summary file rebuilt after rmSync; no database |
| 21.1 | Refresh is the dashboard's first writer of usage evidence | slice 5 | |
| 21.2 | Refresh shares the store's document lock with the offline importer | slice 5 | |
| 21.3 | Refresh shares reconciliation with the offline importer | slice 5 | |
| 21.4 | Refresh reuses the importer's Codex reader per changed file | slice 5 | |
| 21.5 | Refresh does not run the full-corpus import (440 s, 4.3 GB) | slice 5 | |
| 21.6 | Rereading a changed file whole is safe because reconciliation is idempotent per response key | slice 5 | |
| 21.7 | Premise for planning to settle: worker lineage for changed files can be resolved from stored observations and the changed files alone | slice 5 | |
| 22.1 | Tariffs are versioned source data | slice 1 | observed: dashboard/server/usageTariffs.ts versioned source data |
| 22.2 | Index computation reads the stored counters | slice 1 | observed: dashboard/server/tokenIndex.ts reads summary counters |
| 22.3 | Index computation never writes priced values into the usage records | slice 1 | observed: dashboard/backend-tests/usage-history/token-index.spec.ts storeFiles(store) unchanged; summary holds counters only |
| 23.1 | Terry approved the System settings → Usage mockup (../mockups/dashboard-task-usage.html) on 2026-11-15 | slice 1 | observed: mockup .planning/mockups/dashboard-task-usage.html present and used as layout reference |
| 23.2 | Keep the mockup through implementation and verification | slice 5 | |
| 23.3 | During wrap-up, delete the mockup | landing | |
| 23.4 | During wrap-up, remove any live planning links to the mockup | landing | |
| 23.5 | Verify both removals in the final closure change | landing | |
