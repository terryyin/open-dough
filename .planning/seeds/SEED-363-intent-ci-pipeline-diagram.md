---
id: SEED-363
status: active
planted: 2026-11-15
planted_during: Developer report about the CI diagram on the page
trigger_when: selected from the product backlog
scope: story
---

# SEED-363 — Show the CI pipeline, runners, and weights in Intent

<a id="show-ci-pipeline-runners-and-weights"></a>

### Show the CI pipeline, runners, and weights in Intent

**Identity:** SEED-363#show-ci-pipeline-runners-and-weights

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer inspecting a CI build can use the diagram to see which jobs run
in parallel or depend on each other, which runners execute them, and the
weights used to distribute work across shards.

#### Observed behavior

The [Intent CI comparison](../../docs/dashboard-development-intent-ci-comparison.md)
shows historical wall time and aggregate CI time without runner waits. The
[job timing calculation](../../dashboard/server/ciTimeWithoutRunnerWaits.ts)
reduces job dependencies and durations to a single value. The page has no
job-level diagram with runners and allocation weights for the selected build.
Open Dough records the weights used for shard allocation alongside its
[sharding guidance](../../dashboard/tests/shards.md).

#### Key examples

- For a build with parallel shards that feed a proof job, the diagram shows
  the job dependencies, runner labels, and available shard weights from
  that build's revision.
  The developer can distinguish the weights used to assign work from the
  elapsed durations measured during the run.
- For an older build or an adapter that supplies partial evidence, the
  diagram shows the available parts and identifies which runner, dependency,
  or weight details are unavailable.

#### Confirm during refinement

The working interpretation is that “page” means Intent CI and “weights”
means the timing weights used to allocate work across shards. Confirm the
exact view, the runner detail to show, and the level of weight detail with
the reporter before choosing the data and layout.
