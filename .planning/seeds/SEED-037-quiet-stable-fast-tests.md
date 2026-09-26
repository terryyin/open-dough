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
repeatable results, and less total test work, so that local runs and the CI
verdict every published revision waits for both come back sooner, and stay
fast as the suite grows.

## Alternatives and Decision

Silencing the runner alone would shorten logs but leave warnings, flaky tests,
and long waits in place. Retrying failed tests would hide instability. A set
of isolated micro-optimizations could make individual tests faster without
meaningfully shortening the full run. Treat output, stability, and total local
feedback time as one end-to-end outcome, using `dough-test-optimization` to
profile related test families, experiment, preserve behavioral proof, and
re-profile the complete local scope.

## Story Decomposition

<a id="fourfold-local-suite"></a>

### 2. Cut total test work and the CI verdict wait, and keep them within budget

**Identity:** SEED-037#fourfold-local-suite
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/107-cut-test-work-and-ci-wait/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5ab6c09a10b87aa766c34f7e998561f833f36770ba7ff7adab953bd2d8c83fec","plan":"54aa45ca73a5fb68cf6fff350e56415cdb9abbd5d78dc7ee1212ac364fda8fe6"}}
```

**Status:** Refined on 2026-09-26. Split on 2026-09-25 from the delivered
story that made the suite quiet, stable, and twice as fast. On 2026-09-26 the
maintainer replaced the local "a quarter of the original time" target with
total test work and CI test time plus a budget guard, kept the immediate CI
check in this story, and deferred fewer installer runs per promise to
[a later story](#fewer-installer-runs-per-promise). The anchor keeps its
original name because it is the recorded identity.

**Goal:** Agents publishing to trunk and developers running the tests get
test feedback sooner. Every published revision reaches its CI verdict sooner,
the complete local suite does less total work, and a budget check keeps both
from creeping back as tests are added. This serves the near-future direction:
parallel agents on trunk wait for each revision's CI verdict, and that wait,
not a developer's local run, is the feedback loop they repeat most.

**Measure:**

- **CI test time:** the median of the CI `test` job's `Run test` step over the
  last successful runs on trunk. Baseline on 2026-09-26: about 190 s (168–208 s
  across six runs; checkout, Node setup, and `npm ci` add under 10 s). Target:
  at most 120 s.
- **Total local work:** the sum of per-job wall seconds that
  `OPEN_DOUGH_TEST_TIMES` records for `npm test`, compared relatively: three
  paired runs alternating the story's start revision and the candidate under the
  same load, comparing medians. Target: at least 35% less total work than the
  start revision. Wall time of the whole local run is reported but is not the
  target, because 16-slot local parallelism does not carry over to CI runners.
- **Verdict delay:** registering a push whose CI run has already finished
  yields the verdict in about a second instead of up to 30 s.

**Scope:**

- **CI observer checks when a push is registered.** Today
  `watch-ci-execution.mjs` polls every 30 s (`pollMs = 30_000`) and
  `register-push` does not wake it, so an already-finished run waits for the
  next poll. Registration must trigger an immediate check; periodic polling
  continues for runs still in progress. Tests that pay this wait today (for
  example `execution-payload-update.sh`, 30.05 s against 0.40 s) lose it.
- **Less work per test, not fewer promises.** Reduce what each test pays to
  prove the promise it already proves. Candidates in the profile of
  2026-09-26: the installer and updater itself (per-run cost, not run
  count), `workspace-publication*.test.mjs` (98 s under load),
  the `preparation-assignment-*` tests (about 23 s each), real-time waits,
  shared fixture setup, and `assert_payload`'s per-file `cmp`. Use
  `dough-test-optimization` to profile, run measured experiments, and
  re-profile.
- **Budget guard.** CI checks the recorded per-job times against a committed
  budget: a ceiling for any single job and one for the total. Set the budget
  from the times this story achieves plus headroom for runner variance, so that
  an ordinary busy runner does not fail it. Exceeding it fails the CI `test`
  job with a message naming the jobs over budget and their times. The local
  run reports the same comparison but does not fail, because local load varies.
  Raising the budget is an explicit, reviewed edit to the committed file.
- **Keep what the suite already has:** quiet successful output, stable results
  without retries, and each promise's observable proof at its boundary.

**Deferred promises:**

- Proving an installation or update promise with fewer installer runs,
  including the 24-run Cursor-only protection matrix in
  `story-payload-update.sh`. This is a coverage decision and belongs to
  [fewer installer runs per promise](#fewer-installer-runs-per-promise).
- Dashboard Playwright time (`npm run test:dashboard`). It runs in parallel
  with the CI `test` job and does not set the verdict time.
- Machine-specific speedups that do not reach CI, such as putting the Command
  Line Tools git ahead of macOS's `/usr/bin/git` launcher stub.
- Release-fixture reuse and repository-copy setup, already measured as not
  worth doing (about 1 s and 4–5 s of wall).

**Rejection constraints:** no retries or loosened assertions to gain speed,
following this seed's stability goal. Removing a test is acceptable only when
another test still observes the same promise at the same boundary.

**Key examples:**

1. **Finished run.** An agent publishes a revision whose CI run has already
   completed (for example, a republish of a covered revision) and registers
   the push → the observer reports that verdict within about a second, not
   after the next 30-second poll.
2. **Run in progress.** A registered push whose CI run is still going →
   the observer keeps checking periodically and reports the verdict when the
   run completes, as it does today.
3. **CI verdict time.** After the story, successive trunk CI runs show the
   `Run test` step at a median of at most 120 s, against about 190 s on
   2026-09-26.
4. **Local total work.** Paired runs of the start revision and the result
   under the same load show at least 35% fewer total job-seconds, with the
   same quiet successful output.
5. **Budget exceeded.** A change makes one job take much longer than its
   ceiling → the CI `test` job fails, naming that job, its time, and the
   ceiling; the same run locally prints the comparison and still passes.
6. **Budget respected.** A normal run, including one on a moderately busy
   runner, stays within budget and prints nothing about it.

**Evidence (2026-09-25 decisive checkpoint and 2026-09-26 profile):**

- When the twofold result was delivered, jobs run alone summed to about
  632 s, with an effective parallelism of about 6 at 16 slots. The complete
  paired local run was 242.6 s at `bad3717` against 121.6 s (ratio 0.50).
- On 2026-09-26 the suite had grown from 186 to 196 shell and Node test
  files since the twofold delivery; the heaviest jobs were still the
  installer and update checks, followed by `workspace-publication.test.mjs`.

- **Value / learning:** shortens the CI verdict wait for every revision
  agents publish, and learns how much can be saved without changing how many
  times each promise is exercised.
- **Effort hypothesis:** M, provisional; the CI observer change is small, and
  the rest depends on what profiling shows.
- **Depends on:** none.

<a id="fewer-installer-runs-per-promise"></a>

### 4. Prove each installation promise with fewer installer runs

**Identity:** SEED-037#fewer-installer-runs-per-promise
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Not refined. Deferred from story 2 by the maintainer on
2026-09-26 and queued directly after it.

**Goal:** Installer and updater checks prove each installation or update
promise with the fewest installer runs that keep an observable proof at the
promise's boundary, which cuts the largest remaining block of test work.

**Evidence:** about 30 `apply`/`install.sh` runs in
`story-payload-update.sh`, 24 of them a Cursor-only protection matrix; the
installer and update checks lead every profile so far.

- **Value / learning:** the only lever measured at the size a further large
  cut would need; learns which runs prove distinct promises.
- **Effort hypothesis:** M, provisional; needs a promise-by-promise
  coverage decision owned by the maintainer.
- **Depends on:** story 2, so its savings are measured on top of the per-run
  improvements.

## Ordering and Scope Reduction

Story 2 stays first as requested by the maintainer. Within it, the CI
observer's immediate check is independent of the test-work reductions and can
land first. Investigate shared setup, fixture cost, synchronization, and runner
overhead as related test families, and keep measured experiments that preserve
confidence. Do not count a quiet log, fewer promises proved, or a faster
isolated test as the result. Story 4 is queued directly after story 2 and
is the first to drop.

## Open Decisions

None for story 2. Refinement on 2026-09-26 replaced the local fourfold target
with CI test time, total local work, and a budget guard, and deferred fewer
installer runs to story 4. Story 4's promise-by-promise coverage decision
stays with the maintainer.

## When to Surface

Immediately, as the first item in the product backlog.

## Breadcrumbs

- Maintainer request on 2026-09-25 for no-news-is-good-news output, strict CI
  output enforcement, stable event-synchronized tests, and a measured fourfold
  local full-suite speedup; replaced on 2026-09-26 by the CI test time, total
  work, and budget targets in story 2.
- `scripts/test.sh`, `tests/README.md`, `dashboard/tests/`, and
  `.github/workflows/ci.yml` identify the current test and CI surfaces.
- The installed `dough-test-optimization` skill owns profiling, measured
  experiments, preservation of proof, and final re-profiling during execution.
