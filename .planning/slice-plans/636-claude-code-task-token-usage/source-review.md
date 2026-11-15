# Source review — SEED-359#view-claude-code-task-token-usage

Obtained 2026-11-15 before the first implementation delegation from a fresh
general-purpose reviewer (no inherited context) whose only input was the
story's Goal, Scope, Key examples and UI sections (seed lines 22–123 at
`200392236`), with instructions to read no other file, change nothing, and
return numbered commitments, examples and exclusions without slicing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Terry can check whether the price-weighted usage of finished dashboard-launched Claude Code tasks trends up or down for one launch workflow | slice 5 | |
| 2 | Terry can inspect any single task behind the trend, as Codex tasks allow in System settings → Usage | slice 2 | |
| 3 | The trend is an observation under ADR 0010; no improvement or billing claim | slice 2 | |
| 4 | Claude Code dashboard launches, absent from Usage today, appear there | slice 5 | |
| 5a | Tool offers Claude Code beside Codex | slice 2 | |
| 5b.1 | Population: finished `origin: dashboard` tasks of configured projects, retained launches and recovered dashboard tasks, each launch its own point | slice 2 | |
| 5b.2 | Launch workflow, Model and Effort filters from observed values | slice 2 | |
| 5b.3 | Primary observed model and effort taken from the root session | slice 2 | |
| 5b.4 | The moving average | slice 2 | |
| 5b.5 | Partial and unpriced handling | slice 3 | |
| 5b.6 | Task detail | slice 2 | |
| 5c | Workers count at their own model's rates | slice 2 | |
| 6a | A versioned Claude reference tariff kept with the product source | slice 2 | |
| 6b | Tariff read from Anthropic's API list prices on the day it is written | slice 2 | |
| 6c | The tariff is named in the view | slice 2 | |
| 6d | Uncached input weighted at the input rate | slice 2 | |
| 6e | Cache reads at the cache-read rate | slice 2 | |
| 6f | Five-minute cache writes at their own write rate | slice 2 | |
| 6g | One-hour cache writes at their own write rate | slice 2 | |
| 6h | Output at the output rate | slice 2 | |
| 6i | Index in Claude Opus 5.5 input-token equivalents | slice 2 | |
| 6j | Indices of different tools are not compared on one chart | slice 2 | |
| 7a | Refresh brings in Claude usage of known tasks' sessions and workers written since the last check | slice 4 | |
| 7b | Refresh uses the same transcript reader and counting rule as the offline import | slice 4 | |
| 7c | Each API message ID counted once | slice 4 | |
| 7d | A session read again replaces its contribution | slice 4 | |
| 7e | The checking indication no longer names Codex alone | slice 4 | |
| 8a | Claude's own gaps showing missing usage (missing root transcript or worker) make a task partial, as Codex's do | slice 3 | |
| 8b | The background-work limit (agent-view summaries, recaps, idle compaction) does not make each task partial | slice 3 | |
| 8c | The Claude Code cohort shows one note that this work is not included | slice 3 | |
| 9 | Tool becomes a real choice between Codex and Claude Code | slice 2 | |
| 10 | Switching Tool keeps the other filters where their values still exist | slice 2 | |
| 11 | The Claude Code cohort shows its tariff label and the background-work note in words, not color | slice 3 | |
| 12 | The Refresh checking text covers both tools | slice 4 | |
| 13 | A response at a speed the tariff does not price (e.g. fast) stays unpriced rather than priced at standard rates | slice 2 | |
| 14 | Cache writes are not priced at a single rate | slice 2 | |
| 15 | Example 1: Claude Code + Execution, All models, Any effort → each finished Claude Execution launch is one point with its Token index | slice 2 | |
| 16 | Example 1: Fable 5.2 keeps tasks whose root mostly ran on Fable 5.2; a Haiku worker is weighted at Haiku's rates | slice 2 | |
| 17 | Example 2: equal-token Opus 5.5 tasks, one-hour vs five-minute writes → the one-hour task has the higher index | slice 2 | |
| 18 | Example 3: a Claude launch with a worker finishes after the last check → Refresh → its point appears, including the worker's usage | slice 4 | |
| 19 | Example 3: refreshing again over unchanged transcripts leaves the index and stored history unchanged | slice 4 | |
| 20 | Example 3: a response written twice in a transcript counts once | slice 4 | |
| 21 | Example 4: a launch whose root transcript is gone appears partial with that gap and stays out of the moving average | slice 3 | |
| 22 | Example 4: a launch with only the auxiliary limit has no known gaps; the cohort's note names the excluded background work | slice 3 | |
| 23 | Example 5: a response on an unpriced model or speed → its task has no point and is counted as unpriced in the cohort note | slice 2 | |
| 24 | Example 6: choosing Codex again shows the same points, average and tariff as before this story | slice 2 | |
| 25 | Exclusion: per-category token breakdown in task detail, for both tools | slice 5 | |
| 26 | Exclusion: live in-progress usage | slice 5 | |
| 27 | Exclusion: automatic or scheduled refresh | slice 5 | |
| 28 | Exclusion: billing reconciliation | slice 5 | |
| 29 | Exclusion: OpenTelemetry collection | slice 5 | |
| 30 | Exclusion: Cursor (SEED-360) | slice 5 | |
| 31 | Exclusion: auxiliary Claude work outside transcripts, beyond the cohort's note | slice 3 | |
| 32 | Assumption: the offline import already holds Claude history; no second recovery path | slice 5 | |
| 33 | Assumption: transcripts are current within seconds, so a Refresh during or after a task sees current usage | slice 4 | |
| 34 | The usage store keeps one document; no database added (ADR 0008) | slice 1 | observed: dashboard/backend-tests/usage-history/claude-usage-split.spec.ts first case: split and tier stored in the one usage.json document (usageHistoryFile), byte-identical on repeat |
