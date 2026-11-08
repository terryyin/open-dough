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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/515-show-ci-time-without-runner-waits-for-adapters/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fac19157a6b3cde166224958f18def13d129e9870e2f6281b2ede9e2d03f991e","plan":"13b012afafe1fcfade07aff4c3bef4d9956590e28f1235e302aae74cd83fe9da"}}
```

**Goal.** Developers comparing CI builds in Intent can see how long the
selected builds took without runner waits when their CI provider is read
through a custom CI adapter that supplies job timings and dependencies, so a
story's effect on CI time is comparable across providers, not only on GitHub
Actions.

**Scope.**

- The shared custom CI adapter contract documents one optional dashboard-only
  `jobs` operation. Its request has the same shape as `proof` (`check` with
  the listing branch, `attempt` with `runId`, `attemptId` as strings and the
  full `sha`) and names the selected completed endpoint attempt. The adapter
  answers either `{ "jobs": [...] }` or `{ "unavailable": "<reason>" }`.
  Each job has a nonempty `id`, a nonnegative `durationMs` of measured
  execution excluding runner or queue waits, and `needs`: the ids of jobs it
  waited for. Jobs a failed attempt skipped report `durationMs` 0. Each
  matrix or shard instance is its own job.
- Intent's story comparison asks `jobs` for each completed endpoint build it
  read from an adapter and shows the longest dependency chain of
  `durationMs` as CI time without runner waits. The before → after words,
  differences and timing cues then work exactly as they do for GitHub
  Actions. CI wall time keeps coming from the attempt's `startedAt` and
  `completedAt`.
- The metric is unavailable with a stated reason when the adapter answers
  `unavailable` (shown as given), does not implement `jobs` or fails to
  answer (nonzero exit with its last stderr line, invalid JSON, timeout, or
  oversized output, as `proof` failures are reported), or answers a graph
  that cannot support the calculation: no jobs, a duplicate or empty id, a
  missing, negative or non-finite duration, a `needs` id that names no job,
  or a dependency cycle. These checks guard the calculation's correctness. An
  ambiguous `attemptId` at the revision asks no adapter, as `proof` does.
  The endpoint's wall time and proof stay shown.
- GitHub Actions comparisons keep their workflow-file and job-API
  calculation unchanged.

**Scope limits.** No metric in the **CI status** tab, no running-endpoint
timing, and no change to which comparison answers are remembered: a timing
reason stays part of a final answer, as it does for GitHub Actions. Adapters
are not required to implement `jobs`.

**Key examples.**

- An adapter answers `jobs` for a completed attempt with one 90-second job,
  while the attempt's wall time also includes a runner queue delay. Intent
  shows 90 s without runner waits beside the longer wall time.
- A 30-second `build` job followed by `test-a` (40 s) and `test-b` (60 s),
  each needing `build`, yields 90 s. When a revision has two completed
  attempts, the request names the endpoint's selected attempt, and Intent
  shows that attempt's graph.
- Baseline answers 90 s and Landed answers 75 s: the overall summary shows
  the same before → after words with a 15-second, 17% decrease and the
  green duration cue that a GitHub Actions comparison with those times
  shows.
- An adapter without `jobs` exits nonzero with `unsupported CI adapter
  operation`; another answers a graph whose `test` needs an unknown `lint`.
  Each endpoint explains why its time without runner waits is unavailable and
  still shows its wall time and proof.

**Context.** Pygardon is one consumer of this contract; its adapter
implements `discover`, `diagnose` and `proof` today. Before this story Intent
reports the metric as unavailable for every custom adapter (“The CI adapter
does not report a job graph.”).
