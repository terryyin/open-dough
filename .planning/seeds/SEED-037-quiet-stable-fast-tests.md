---
id: SEED-037
status: active
planted: 2026-09-25
planted_during: Product backlog capture requested by the maintainer
trigger_when: The full local test suite is run or tests run in CI
scope: unknown
---

# SEED-037: Get quiet, stable, fast test feedback

## Why This Matters

For an Open Dough developer running the tests locally or reading CI results,
routine test output and warnings obscure failures, time-based waits make tests
slow and flaky, and the full suite takes too long to provide feedback. The
desired result is a quiet successful run, useful diagnostics on failure,
repeatable results, and a measured full-suite local run at least four times
faster than the comparable pre-optimization baseline.

## Alternatives and Decision

Silencing the runner alone would shorten logs but leave warnings, flaky tests,
and long waits in place. Retrying failed tests would hide instability. A set
of isolated micro-optimizations could make individual tests faster without
meaningfully shortening the full run. Treat output, stability, and total local
feedback time as one end-to-end outcome, using `dough-test-optimization` to
profile related test families, experiment, preserve behavioral proof, and
re-profile the complete local scope.

## Story Decomposition

<a id="quiet-stable-four-times-faster-tests"></a>

### 1. Make the full test suite quiet, stable, and at least four times faster

**Identity:** SEED-037#quiet-stable-four-times-faster-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured and queued first on 2026-09-25; not refined or planned.

- **For / why:** A developer gets prompt, trustworthy test feedback locally and
  in CI, with attention drawn only to failures.
- **Evaluation:**
  - Define and record the complete local test scope, including the shell/Node
    suite and dashboard browser suite, then measure its ordinary wall time,
    executed cases, runner settings, and relevant environment before changes.
    Under comparable conditions after optimization, the complete local suite
    runs in no more than one quarter of that baseline wall time while retaining
    meaningful behavioral coverage and failure detection.
  - A successful normal test run emits no stdout or stderr, including warnings
    from child processes. If a local runner cannot be wholly silent, one dot
    per successful test is the absolute output ceiling. CI applies the stricter
    rule: any test-produced output or warning on an otherwise successful run
    fails the test check. A genuine test failure remains a failure and exposes
    enough captured context to diagnose it.
  - Repeated complete and affected focused runs produce consistent results
    without intermittent failures, hidden retries, skips, or suppressed
    diagnostics. Fix the causes of flakiness rather than masking them.
  - Tests synchronize on observable events. Remove fixed sleeps and waits for
    elapsed wall-clock time; where no event subscription is available, use a
    bounded background retry with a short interval and a useful timeout
    failure. Time-sensitive product behavior may use a controlled clock rather
    than make the test wait in real time.
- **Value / learning:** Reduces local feedback time by at least 75% while
  making silence a reliable success signal and failures easier to act on.
- **Effort hypothesis:** L, provisional. The complete suite spans shell, Node,
  and browser tests; profiling must establish the true bottlenecks and the
  scope of changes needed to meet the fourfold target.
- **Depends on:** none. Use the existing test entry points and CI checks; no
  unrelated product work needs to precede this story.
- **Safe stopping point:** Any delivered intermediate improvement preserves
  coverage and truthful failures. The story is complete only after comparable
  full-suite measurement proves the fourfold target and the output and
  stability requirements pass.

## Ordering and Scope Reduction

Place this story first as requested by the maintainer. Investigate shared
setup, redundant cases, fixture cost, synchronization, and runner overhead as
related test families. Prefer changes that reduce the complete local feedback
path, and keep measured experiments that preserve confidence. Do not count a
quiet log, fewer cases, or a faster isolated test as the fourfold result.

## Open Decisions for Refinement

- Which single local command or measured sequence represents the complete
  locally runnable suite, including browser tests, for the baseline and final
  fourfold comparison?
- Which existing tests exercise time itself and therefore need a controlled
  clock or event-based proof while fixed real-time waits are removed?

## When to Surface

Immediately, as the first item in the product backlog.

## Breadcrumbs

- Maintainer request on 2026-09-25 for no-news-is-good-news output, strict CI
  output enforcement, stable event-synchronized tests, and a measured fourfold
  local full-suite speedup.
- `scripts/test.sh`, `tests/README.md`, `dashboard/tests/`, and
  `.github/workflows/ci.yml` identify the current test and CI surfaces.
- The installed `dough-test-optimization` skill owns profiling, measured
  experiments, preservation of proof, and final re-profiling during execution.
