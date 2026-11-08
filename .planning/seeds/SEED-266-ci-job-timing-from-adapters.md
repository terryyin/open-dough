---
id: SEED-266
status: active
planted: 2026-11-08
scope: story
---

# CI job timing from custom adapters

<a id="show-ci-time-without-runner-waits-for-adapters"></a>

### Show CI time without runner waits for custom adapters

**Identity:** SEED-266#show-ci-time-without-runner-waits-for-adapters
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Developers comparing CI builds in Intent can see how long the
selected builds took without runner waits when their CI provider supplies job
timings and dependencies.

**Scope.** Document one optional job graph in the shared CI adapter contract.
The graph describes the jobs, measured execution durations, and dependencies
for the selected build attempt. Intent uses the longest dependency chain to
calculate the metric across providers. CI wall time is displayed separately.

**Evaluation.**

- An adapter reports a completed attempt with one 90-second job and a
  separate runner queue delay. Intent shows 90 seconds without runner waits
  for that attempt.
- A 30-second job followed by parallel 40-second and 60-second jobs yields
  90 seconds. The dashboard uses the graph for the selected attempt, including
  when several attempts share a revision.
- An adapter omits the optional graph, or its graph cannot support the
  calculation. Intent explains why the metric is unavailable and still shows
  the attempt's wall time and proof when those are available.

**Context.** Pygardon is one consumer of this contract. Intent currently
reports the job-graph metric as unavailable for every custom adapter.
