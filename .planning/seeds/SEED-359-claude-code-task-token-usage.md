---
id: SEED-359
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate splitting the dashboard token usage story by host
trigger_when: selected from the product backlog
scope: story
---

# SEED-359 — View token usage for dashboard-launched Claude Code tasks

<a id="view-claude-code-task-token-usage"></a>

### View token usage for dashboard-launched Claude Code tasks

**Identity:** SEED-359#view-claude-code-task-token-usage

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/636-claude-code-task-token-usage/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c715f1283e613dd5f39f2696eae4c703c14c72fe4399d9e3e6a2301f9988119f","plan":"03ced6605768d31828400f04d1582d83230c210767cede3530a39205bd7e5745"}}
```

#### Goal

Terry, as the developer running Open Dough's dashboard, can check whether the
price-weighted usage of finished dashboard-launched **Claude Code** tasks is
trending up or down for one launch workflow, and inspect any single task
behind the trend, as Codex tasks already allow in
[System settings → Usage](../../dashboard/src/SystemSettingsUsage.tsx). Most
dashboard launches run on Claude Code (646 Claude against 393 Codex launch
tasks in the usage store on 2026-11-15), yet none of them appear there today.
The trend is an observation under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md); it
makes no improvement or billing claim.

#### Scope

**Required behavior**

- **Claude Code cohort.** Tool offers Claude Code beside Codex. The Claude
  Code cohort follows every rule the delivered Codex cohort follows: the
  population (finished `origin: dashboard` tasks of configured projects,
  retained launches and recovered dashboard tasks, each launch its own
  point), Launch workflow, Model and Effort filters from observed values,
  primary observed model and effort from the root session, the moving
  average, partial and unpriced handling, and task detail. Workers count at
  their own model's rates.
- **Claude Token index.** A versioned Claude reference tariff kept with the
  product source, read from Anthropic's API list prices on the day it is
  written and named in the view. Per response, uncached input is weighted at
  the input rate, cache reads at the cache-read rate, five-minute and
  one-hour cache writes each at their own write rate, and output at the
  output rate. The index is Claude Opus 5.5 input-token equivalents; Opus
  5.5 ran most observed Claude responses. Indices of different tools are not
  compared on one chart.
- **Freshness.** Refresh also brings in the Claude usage of known tasks'
  sessions and their workers written since the last check, with the same
  transcript reader and counting rule as the offline import: each API
  message ID once, a session read again replacing its contribution. The
  checking indication no longer names Codex alone.
- **Coverage.** Claude's own gaps that show missing usage, such as a missing
  root transcript or worker, make a task partial as Codex's do. Background
  agent-view row summaries, recaps and idle compaction never reach
  transcripts. That limit does not make each task partial: the Claude Code
  cohort shows one note that this work is not included.

**Required restrictions**

- A Claude response at a speed the tariff does not price, such as fast mode,
  stays unpriced rather than priced at standard rates; fast mode costs twice
  the standard rate. Every response transcribed so far records
  `speed: "standard"`.
- Cache writes are not priced at a single rate. 58% of observed write tokens
  are five-minute and 42% one-hour, at 1.25× and 2× the input rate, so a
  single rate would misstate the index of a task by its mix.

**Scope limits (deferred, not rejected)**

- A per-category token breakdown in task detail, for both tools
  (Terry, 2026-11-15).
- Live in-progress usage, automatic or scheduled refresh, billing
  reconciliation, OpenTelemetry collection, and Cursor (SEED-360).
- Auxiliary Claude work outside transcripts, beyond the cohort's note.

**Boundary assumptions**

- The offline import already holds Claude history: 633 of 646 Claude
  dashboard launch tasks have usage, the latest from 2026-11-14. It needs no
  second recovery path.
- Claude Code appends each response to its transcript within seconds, so a
  Refresh during or after a task sees current usage.
- The usage store keeps one document under
  [usage history](../../dashboard/USAGE-HISTORY.md); this story adds no
  database (ADR 0008).

#### Key examples

1. **Cohort.** Choose Claude Code and Execution with All models and Any
   effort → each finished Claude Execution launch is one point with its
   Token index. Choosing Fable 5.2 keeps tasks whose root mostly ran on
   Fable 5.2; a Haiku worker inside them is weighted at Haiku's rates.
2. **Cache-write mix.** Two Opus 5.5 tasks with equal tokens, one writing
   to the one-hour cache and one to the five-minute cache → the one-hour
   task has the higher index.
3. **Refresh after a new launch.** A Claude launch with a worker finishes
   after the last check → Refresh → its point appears, including the
   worker's usage. Refreshing again over unchanged transcripts leaves the
   index and the stored history unchanged; a response written twice in a
   transcript counts once.
4. **Coverage.** A launch whose root transcript is gone appears partial with
   that gap and stays out of the moving average. A launch with only the
   auxiliary limit has no known gaps; the cohort's note names the excluded
   background work.
5. **Unpriced.** A response on a model or speed the tariff does not price →
   its task has no point and is counted as unpriced in the cohort note.
6. **Codex unchanged.** Choosing Codex again shows the same points, average
   and tariff as before this story.

#### UI

Tool becomes a real choice between Codex and Claude Code, and switching it
keeps the other filters where their values still exist. The Claude Code
cohort shows its tariff label and the background-work note in words, not
color. The Refresh checking text covers both tools.

#### Architecture

Claude responses already carry five-minute and one-hour cache-write counts,
but stored session contributions keep only the total. Pricing therefore needs
the split in the contribution; a contribution recorded without it, whose
native files are gone, leaves its task unpriced rather than guessing. The
Refresh reads Claude sessions through the importer's Claude reader and
lineage, beside its Codex reading, under the same document lock and
contribution replacement. This follows
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation per concept),
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(derived presentation over recorded evidence) and
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
(native checks on real transcripts). No Accepted ADR conflict was found.
