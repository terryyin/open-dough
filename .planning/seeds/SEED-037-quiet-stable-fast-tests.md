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

### 1. Make the full test suite quiet, stable, and twice as fast

**Identity:** SEED-037#quiet-stable-four-times-faster-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/096-quiet-stable-fast-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a275f5eb73484b01415c55116f72b86c8edc8a0540e150bca2c1e4781e643803","plan":"bc9c15aa63f75583b91989b7a2aedfe74edef64ca2c02694924c2d7fc98679af"}}
```

**Status:** Refined 2026-09-25; kept as one story at the top of the queue.
Planned in [plan 096](../quick/096-quiet-stable-fast-tests/PLAN.md).
Split during execution on 2026-09-25 by the maintainer's decision at the
plan's decisive checkpoint: this story delivers quiet and stable results and
the measured twofold speedup; the fourfold target moved to
[story 2](#fourfold-local-suite). Where the goal, scope, and examples below
say "a quarter" or "fourfold", story 2 now owns that promise.

**Goal:** An Open Dough developer running the complete local suite, or reading
CI, can treat silence as success. A passing run prints nothing, a failure
points straight at the failing test with enough captured context to act on,
the same revision gives the same result on every run and in CI, and the
complete local suite takes no more than a quarter of its measured
pre-optimization wall time. Today the shell runner replays every job's log
after a successful run, child processes add warnings, several checks wait for
real elapsed time, and the suite is capped at four jobs because one 15-second
file wait starved under more parallelism.

**Scope:**

- **The complete local suite** is `npm test` followed by
  `npm run test:dashboard`. The Playwright suite's global setup builds the
  dashboard, and that build counts as part of its run. Lint, the dashboard
  type check, CI's separate build step, and opt-in `--native` agent runs are
  outside this scope. Execution may add one command that runs both parts, but
  this is not required.
- **Baseline and target.** Before any change, execution measures the complete
  local suite on the developer's machine with default settings
  (`OPEN_DOUGH_TEST_JOBS` unset, dependencies installed, Playwright Chromium
  present) and records in the plan:
  - the wall time of each part and their sum;
  - the executed case counts;
  - the runner settings;
  - the machine, OS, Node, Bash, and Playwright versions.

  The final measurement repeats the same sequence under the same conditions,
  and its sum is at most one quarter of the baseline sum. Changing the job
  count, including raising the four-job cap, is allowed when the suite stays
  stable. It is not counted as a like-for-like comparison unless the default
  settings themselves change.
- **Quiet success.** On a successful run, both commands emit no stdout or
  stderr: no per-job "Running …" headers, no replayed logs, and no warnings
  from child processes, the Vite build, or Node. Where a runner cannot be
  wholly silent, at most one dot per passing test is allowed locally. In CI,
  any test-produced output on an otherwise successful run fails the `test`
  check or the dashboard browser-suite step. CI's install, type-check, and
  build steps are not test output. How CI enforces this is an execution
  decision.
- **Useful failure.** A failing test still fails the run, names itself, and
  shows its own captured output, and the traces the Playwright suite already
  keeps on failure. Output from passing tests stays hidden even when another
  test fails.
- **Stable results.** Repeated complete local runs, and the affected focused
  tests, give the same result as each other and as CI for the same revision.
  Flakiness is fixed at its cause. Retries, skips, quarantines, and
  suppressed diagnostics are rejected because they hide the instability this
  story removes.
- **Event synchronization.** Tests wait for observable events, not for
  elapsed wall-clock time. Where no event is available, a bounded poll with a
  short interval and a timeout that reports what it was waiting for is the
  fallback. An unbounded poll gets a bound. A stand-in process that simulates
  a hang, such as a fake agent that sleeps, is not a wait as long as no test
  waits for it to finish. Product behavior driven by time uses a controlled
  clock, or an injected short interval observed by event, instead of real
  delay:
  - native-run deadlines and termination grace;
  - CI observer and mailbox await timeouts;
  - dashboard auto-refresh intervals and rate-limit backoff;
  - slice elapsed-time displays.

  File timestamps that must differ are set explicitly instead of waited for.
- **Coverage is preserved.** Removing, merging, or moving redundant cases
  through `dough-test-optimization` is allowed only while each behavioral
  promise keeps an observable proof at its boundary. A quiet log, fewer
  cases, or a faster isolated test does not count toward the fourfold result
  on its own.
- **Deferred:**
  - a CI wall-time target (CI is expected to benefit, but is not measured);
  - lint and type-check speed and output;
  - the opt-in native agent checks;
  - any change to the product installer's Bash 3.2 support.

**Key examples:**

- Before changes, the developer runs `npm test` then `npm run test:dashboard`
  with default settings. The plan records each part's time, their sum, the
  case counts, and the environment. After optimization, the same sequence on
  the same machine finishes in at most a quarter of that sum.
- Every test passes. Both commands print nothing, or at most one dot per
  passing test locally. The shell runner no longer replays each job's log.
- One shell check's assertion fails. The run exits non-zero, names that
  check, and shows only its captured output. The passing checks stay silent.
- All tests pass, but a child process prints a deprecation warning to stderr.
  Locally the warning is visible because it exceeds the output ceiling. In CI
  the `test` check fails and shows the warning.
- `tests/update-skip-verified.sh` waits one second, three times, so that file
  timestamps differ. It instead sets the timestamps it needs, and no longer
  waits.
- The native-run timeout test proves that a hung agent is stopped after its
  deadline and grace. It uses short injected limits and observes the stop,
  and the fake agent may still sleep because nothing waits for it to finish.
- A dashboard journey proves that the page refreshes after its interval, or
  backs off after a rate limit. It advances a controlled page clock instead
  of waiting that long in real time.
- A test fails about one run in ten because of a race. The race is fixed, and
  repeated complete runs pass without a retry.
- Two cases prove the same promise through the same boundary. One is removed
  and the promise keeps its proof. Removing the only proof of a promise to
  save time is not allowed.

- **Value / learning:** Reduces local feedback time by at least 75% while
  making silence a reliable success signal and failures easier to act on.
- **Effort hypothesis:** L, provisional. The complete suite spans shell, Node,
  and browser tests. Profiling must establish the true bottlenecks and the
  scope of changes needed for the fourfold target. If execution runs long,
  split at a safe boundary: quiet and stable results can be delivered before
  the speed target.
- **Depends on:** none. Use the existing test entry points and CI checks; no
  unrelated product work needs to precede this story.
- **Safe stopping point:** Any delivered intermediate improvement preserves
  coverage and truthful failures. The story is complete only after comparable
  full-suite measurement proves the fourfold target and the output and
  stability requirements pass.

<a id="fourfold-local-suite"></a>

### 2. Bring the complete local suite to a quarter of its original time

**Identity:** SEED-037#fourfold-local-suite

**Status:** Not refined. Split from story 1 on 2026-09-25 at plan 096's
decisive checkpoint, with the evidence below.

**Goal:** An Open Dough developer gets complete local test feedback
(`npm test` then `npm run test:dashboard`) in at most a quarter of the
pre-optimization time, while keeping story 1's quiet output, stable results,
and behavioral coverage.

**Measure:** paired and relative, as story 1 settled on the maintainer's
instruction: alternate the start revision of story 1 (`bad3717`) and the
candidate under the same load, three runs each, and compare medians. At story
1's end the pair was 242.6 s against 121.6 s (ratio 0.50); the target is 0.25.

**Evidence for scope (plan 096 checkpoint):**

- Every job alone sums to about 632 s; at 16 slots effective parallelism is
  about 6. Reaching 0.25 needs roughly a 58% cut in total work with no single
  job over about 15 s alone.
- Installer and updater runs dominate the long shell checks (about 30
  `apply`/`install.sh` runs in `story-payload-update.sh`, 24 of them a
  Cursor-only protection matrix). Fewer runs per promise, or a faster
  installer, is the only lever of the needed size. Coverage rules from
  story 1 apply: a promise keeps an observable proof at its boundary.
- `execution-payload-update.sh` waits one full 30 s CI-observer poll on the
  `.claude/skills` path (`ci-mailbox.mjs await-revision` 30.05 s against
  0.40 s for `.agents/skills`); decide whether it is a test wait or a product
  delay users also hit.
- On macOS `/usr/bin/git` is a launcher stub costing about 7.5 ms per call;
  the Command Line Tools git first on `PATH` measured −7.4% locally.
- `assert_payload` compares files with one `cmp` per file (about 3 s per
  calling check).
- Release-fixture reuse and repository-copy setup were measured and are not
  worth doing (about 1 s and 4–5 s of wall).

- **Value / learning:** halves local feedback time again, and learns whether
  the payload and update checks can prove the same promises with fewer
  installer runs.
- **Effort hypothesis:** M–L, provisional.
- **Depends on:** story 1 (delivered).

## Ordering and Scope Reduction

Place this story first as requested by the maintainer. Investigate shared
setup, redundant cases, fixture cost, synchronization, and runner overhead as
related test families. Prefer changes that reduce the complete local feedback
path, and keep measured experiments that preserve confidence. Do not count a
quiet log, fewer cases, or a faster isolated test as the fourfold result.

## Open Decisions

None. Refinement on 2026-09-25 settled the complete local suite (`npm test`
followed by `npm run test:dashboard`) and which time-driven behavior needs a
controlled clock or event-based proof.

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
