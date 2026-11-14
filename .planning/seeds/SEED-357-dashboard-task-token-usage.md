---
id: SEED-357
status: active
planted: 2026-11-14
planted_during: Terry requested token usage for tasks started from the dashboard
trigger_when: selected from the product backlog
scope: story
---

# SEED-357 — View token usage for dashboard-launched Codex tasks

<a id="view-token-usage-for-dashboard-launched-tasks"></a>

### View token usage for dashboard-launched Codex tasks

**Identity:** SEED-357#view-token-usage-for-dashboard-launched-tasks

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/627-view-codex-task-token-usage/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"61d2e9bf4ee038582e16d20711d8fa657061825943162f679942698b2cc349a3","plan":"2d8d4d6d27377d4cf54bb27b8d8b035992b914c56323224df90efab058943611"}}
```

**Goal.** Terry, as the developer running Open Dough's dashboard, can
occasionally check whether the price-weighted usage of finished
dashboard-launched Codex tasks is trending up or down for one launch workflow,
and inspect any single task behind the trend. The trend is an observation that
informs workflow decisions under [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md);
it makes no improvement or billing claim.

#### Scope

**Required behavior**

- **Population.** A point is one finished task with `origin: dashboard` and host
  Codex in the [usage records](../../dashboard/USAGE-HISTORY.md), from any
  project configured at view time, hidden projects included. Retained launches
  and recovered dashboard tasks both count. A task is finished once it has a
  reported outcome or its launch is marked done. A recovered task has no open
  session, so it is finished. Each launch of the same story is its own point. Its x position
  is the reported outcome time, or else its last recorded activity.
- **System settings → Usage.** Usage is a separate System settings view
  beside the existing settings. It shows one chart: Token index per finished
  task, with a trailing moving average of the latest 10 eligible tasks in the
  selected cohort. Filters select one tool, one launch workflow (Execution,
  Refinement, Ad hoc), Model (**All models** or each observed model) and Effort
  (**Any effort** or each observed level). Filter options come from the
  observed tasks. With the broad Model and Effort options, the cohort includes
  every matching task. A specific model or effort matches the task's primary
  observed setting. That is the value on most of the task's root conversation
  responses. Workers do not decide it, and a tie leaves it unknown, so the task
  appears only under the broad option.
  Workers still contribute their usage at their own model's rates. This story
  offers only Codex in Tool; [Claude Code](SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage)
  and [Cursor](SEED-360-cursor-task-token-usage.md#view-cursor-task-token-usage)
  add their own cohorts later.
- **Task detail.** Selecting a point, by pointer or keyboard, shows its story
  title and identity when known, project, launch workflow, outcome or
  "Outcome unknown", end time, requested model and effort when known, primary
  observed model and effort, the index, and its coverage. The chart response
  carries the detail it needs.
- **Coverage.** Measure the entire task as far as the evidence allows: all
  uniquely associated responses, including resumed turns, workers, background
  work, and failed or cancelled work. A task is *partial* when its own records
  or gaps show missing usage, such as a missing worker or unattributable
  response. It is *unpriced* when any associated response lacks a tariff rate,
  for example an unknown model or a non-standard speed tier. A partial task
  appears with a distinct mark and its gap in the detail. An unpriced task has
  no point and is counted in the cohort note. Neither enters the moving
  average. A measured zero stays a zero point. Fewer than 10 eligible tasks
  show no line and say so.
- **Freshness.** Opening Usage shows the latest derived result with the time it
  was last checked. **Refresh** reads Codex rollouts changed since that check
  with the same native reader as backfill. It reconciles them into the usage
  store and launch catalog, then rederives the chart. A response already
  imported contributes once. During a refresh the cached chart stays visible
  with a checking indication. A failed refresh keeps it, its check time and a
  readable error. Refresh latency is flexible.

**Token index**

- Use a versioned reference tariff kept with the product source. Codex starts
  with the standard-speed signed-in credit rates from the
  [Codex rate card](https://learn.chatgpt.com/docs/pricing#token-rates) as read
  on 2026-11-15. Per 1M tokens, GPT-6.1 Sol is input 50, cached input 2.5 and
  output 250. GPT-6 Astra is input 250, cached input 25 and output 1,250.
  Other rate-card models may be included.
- Per response, weight uncached input at the input rate, cache reads at the
  cached-input rate, cache writes included in input at the input rate with no
  separate write charge, and output at the output rate. Reasoning output is
  already within output. Sum over the task and divide by the reference
  GPT-6.1 Sol input rate. The result is GPT-6.1 Sol input-token equivalents.
- The plotted history uses one tariff version, named in the view. Raw
  observations and pricing inputs stay unchanged, so another tariff version
  recomputes the same history.

**Required restrictions**

- A response at a speed tier the tariff does not price stays unpriced rather
  than priced at standard rates. The rate card charges fast tiers 2–8×, so a
  standard price would understate it. The native reader therefore keeps the
  thread's applied service tier. A rollout with no recorded tier is priced at
  the standard rate. On 2026-11-15, 51 of 2,786 plain rollouts with usage since
  2026-09-15 had no tier field, and every recorded tier was `default`.
- Partial and unpriced tasks stay out of the moving average. Their missing
  usage would otherwise pull the trend down.

**Scope limits (deferred, not rejected)**

- Claude Code and Cursor cohorts (SEED-359, SEED-360).
- Tasks of unknown or native origin, and unassigned usage.
- A browsable task history, task lists, a separate task-detail service,
  per-session usage on Board or Sessions sidebar entries, and live
  in-progress usage.
- Automatic or scheduled refresh, billing reconciliation, account usage APIs
  and other tariffs.

**Boundary assumptions**

- The existing usage store, offline importer and its recovery receipt supply
  the history. This story adds no database (ADR 0008).
- All retained Codex rollouts observed on 2026-11-15 are at the default speed
  tier. The dashboard-origin Codex tasks use GPT-6.1 Sol and GPT-6 Astra.

#### Key examples

- **Cohort and rates.** In System settings → Usage, choose Codex and
  Execution with All models and Any effort. Each finished Execution task is
  one point. A GPT-6 Astra worker inside a GPT-6.1 Sol task is weighted at
  Astra's rates. Switching to Refinement changes the points and the average.
  Choosing GPT-6 Astra keeps only tasks whose root mostly ran on Astra.
- **One story, several launches.** A story launched twice, once returned to
  the backlog and once completed, shows two points with their own outcomes.
  A recovered October task without a reported outcome is a point with
  "Outcome unknown". A launch that is not marked done and has no reported
  outcome is not plotted yet.
- **Coverage.** A task with an unattributed worker gap shows a partial mark,
  "Partial" with the gap in its detail, and stays out of the line. A task with
  one fast-tier response has no point and adds one unpriced task to the cohort
  note. Nine eligible tasks show the points and "Fewer than 10 eligible tasks".
- **Refresh.** After a new Execution launch finishes, Refresh adds its point
  and updates the check time. Refreshing again without new rollout activity
  changes no value. An importer run overlapping earlier responses also leaves
  each response counted once. A refresh that fails, such as an unreadable usage
  store, keeps the previous chart and check time and shows the error.
- **Tariff.** A response with 1,000 uncached input, 9,000 cache read and
  100 output tokens on GPT-6.1 Sol scores (1,000×50 + 9,000×2.5 + 100×250) / 50
  = 1,950. Recomputing with a later tariff version uses the same stored
  counters and leaves them unchanged.

#### UI

The approved mockup below is the layout reference, with three corrections from
the data. The filter is labeled **Launch workflow**, the ADR 0008 concept name,
not "Task type". Its options are Execution, Refinement and Ad hoc, because the
dashboard launches no separate slice planning. Effort lists the observed
levels, such as xhigh, ultra, high, max and medium, not the mockup's example
pair. Coverage and freshness wording follows the mockup: the cohort note with
partial and unpriced counts, and "Checked" with the time. The empty cohort
says that no finished task matches.

#### Architecture

- **Reading.** Until now only the offline importer reads the usage store, so
  this is a new responsibility for the running dashboard. A read-only scan of
  the real store on 2026-11-15 took 3.4 s and 387 MB without schema
  validation. That covers 2,316 pages, 514,444 responses and 513
  dashboard-origin Codex tasks. Derive the chart off the request path, from
  the store or a rebuildable per-task summary, without blocking the server's
  event loop. ADR 0008 allows a rebuildable derived cache but no application
  database.
- **Writing.** Refresh is the dashboard's first writer of usage evidence. It
  shares the store's document lock and reconciliation with the offline
  importer. It reuses the importer's Codex reader per changed file and does
  not run the full-corpus import, which takes 440 s and 4.3 GB. Rereading a
  changed file whole is safe because reconciliation is idempotent per response
  key. The planning premise to settle is that worker lineage for changed files
  can be resolved from the stored observations and the changed files alone.
- **Tariff.** Tariffs are versioned source data. Index computation reads the
  stored counters and never writes priced values into the usage records.

#### Temporary design reference

Terry approved the [System settings → Usage mockup](../mockups/dashboard-task-usage.html)
on 2026-11-15. Keep it through implementation and verification. During this
story's wrap-up, delete the mockup and remove any live planning links to it.
Verify both removals in the final closure change.
