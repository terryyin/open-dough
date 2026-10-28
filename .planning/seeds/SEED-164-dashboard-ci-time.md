# Dashboard CI feedback time

<a id="dashboard-ci-time"></a>

### Shorten dashboard CI without weakening its proof

**Identity:** SEED-164#dashboard-ci-time
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Reduce the dashboard suite's CI elapsed time through the two selected
changes: start serial production watcher chains early with honest shared-hook
weights, and reduce browser round trips in exhaustive layout and native touch
checks. Measure the result against the unchanged suite.

**Scope:** Preserve all current scenarios, assertions, every-control reachability,
native touch moves and per-pixel observations, serial deployment transitions,
test isolation, strict verdicts, and the 12-shard/four-worker CI workload. Retain
shared setup in timing evidence without double-counting test-scoped fixtures.

**Examples:** Long serial deployment chains begin alongside ordinary tests and
stop holding an otherwise idle shard open. Every control still scrolls into view
and passes clipping checks. Every native touch movement is still observed after
its animation frame, including narrow reading windows between complete strokes.

**Evaluation:** Compare normal local execution and full hosted CI on named
baseline and candidate revisions; report case selection, workers, queue delay,
job/suite elapsed time, and uncertainty. A focused speedup alone is insufficient.
Retain only supported gains and report any inconclusive comparison honestly.

**Excluded:** Browser-clock changes, fixture-origin reuse, moving cases between
test tiers, product behavior changes, skips/retries, extra CI shards, and release
or trunk integration beyond the ordinary story-branch execution workflow.
