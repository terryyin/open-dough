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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can occasionally check how the price-weighted usage
of dashboard-launched Codex tasks is trending and inspect an individual point.

Use the [usage records and historical reconstruction](SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history)
for dashboard-launched Codex story workflows and ad hoc tasks. Reuse the same
native rollout reader for new usage and backfill. The Usage tab may read cached
results and refresh relevant session history on demand. Show when the data was
checked. Refresh latency is flexible.

Measure the entire task as far as the evidence allows. Include all attributable
turns, resumed work, workers, and background work done for that task. Keep
failed or cancelled work and usage when observed. Show which parts of the task
the measurement covers, and surface observed gaps in the total. The same story
can have several launches, each with its own usage and outcome.

#### System settings → Usage

Put Usage in its own System settings tab for occasional observation. Show a
single chart of Token index per finished task across configured projects, with
a moving average for the selected cohort. Select one tool and one task type
at a time. Model offers **All models** and each available model. Effort offers
**Any effort** and each available level. With both broad filters selected, include all
matching task settings for that tool and task type. When a model or effort is
selected, filter by the task's observed primary settings where known and use
each contributing model's rates for the index, including worker usage.
[Claude Code](SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage)
and [Cursor](SEED-360-cursor-task-token-usage.md#view-cursor-task-token-usage)
can extend the Usage tab with their own tool cohorts.

Selecting a dot opens its task detail with story title and identity when known,
project, workflow, outcome, requested and observed model and effort where known,
and the index and its coverage. The chart response can include the detail it
needs. A browsable task history and a separate history or task-detail service
are outside this story. Show partial values distinctly. Keep missing or unpriced
usage separate from a measured zero, and exclude partial and unpriced tasks
from the moving average. Start with the trailing 10 eligible tasks.

#### Token index

Version a published reference tariff for each tool's ordinary pricing model.
For Codex, start with standard signed-in credit rates. Weight uncached input,
cache reads, cache writes, and output with rates for the observed model and the
applicable token bucket. Account for cache-write lifetimes where the tariff
requires them. For Codex's signed-in tariff, use the ordinary input rate for
cache writes included in input and apply no separate write charge. Sum the
weighted observations and divide by one named reference model's uncached-input
rate to express the index in reference input-token equivalents. Use one tariff
version for the plotted history and identify it in the view. Preserve the raw
observations and pricing inputs so a later tariff can recompute the trend. Show
the index as the usage number in the view. [Codex rates](https://learn.chatgpt.com/docs/pricing#token-rates),
[usage and cost research](../../docs/maintainer/dashboard-task-usage-research.md#comparable-usage-and-cost).

#### Key examples

- In System settings → Usage, choose Codex and Execution, with All models and Any
  effort. The chart shows one index per eligible task, with each request
  weighted at its own model's rates. Switching to Refinement changes the
  cohort and its average.
- Click one of two points for the same story. Each shows its own task details.
  A partial result with an unobserved worker shows its coverage and stays out
  of the line.
- An imported response also encountered during a later refresh contributes once.
  Recomputing with a different tariff uses the original observations and leaves
  them intact. Missing model or rate evidence remains visible as unpriced.

#### Temporary design reference

Terry approved the [System settings → Usage mockup](../mockups/dashboard-task-usage.html)
on 2026-11-15. Keep it through implementation and verification. During this
story's wrap-up, delete the mockup and remove any live planning links to it.
Verify both removals in the final closure change.
