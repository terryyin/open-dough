# Make the full test suite quiet, stable, and at least four times faster

## Source

**Identity:** SEED-037#quiet-stable-four-times-faster-tests

Story 1 in
[SEED-037](../../seeds/SEED-037-quiet-stable-fast-tests.md#quiet-stable-four-times-faster-tests),
refined on 2026-09-25. The seed owns goal, scope, key examples, and deferred
promises. This plan restates only what the slices need.

## Goal and scope

The complete local suite is `npm test` followed by `npm run test:dashboard`.
When it passes, it prints nothing. A failure names the failing test and shows
only its captured output. The same revision gives the same result on repeated
runs and in CI. Tests wait for events or a controlled clock, not for elapsed
time. The suite finishes in at most one quarter of its measured baseline wall
time, with behavioral coverage preserved.

Excluded (seed deferred promises):
- a CI wall-time target;
- lint and type-check speed and output;
- the opt-in `--native` agent checks;
- the product installer's Bash 3.2 support.

Facts this plan relies on (planning survey at `04a034b`):

- **Runner.** `scripts/test.sh` discovers `tests/*.sh` outside
  `tests/support/`, plus `scripts/check-self-installation.sh`. It runs them in
  a FIFO pool of at most four slots (`OPEN_DOUGH_TEST_JOBS`, 1–4). It then
  prints `Running <label>` and replays every check's log, passing or failing.
- **Output sources.**
  - 46 of the 55 `tests/*.sh` echo `PASS: …` lines.
  - Node suites run under the default `node --test` reporter from
    `tests/execution-ci-runtime.sh`, `tests/closure-publication.sh`,
    `tests/workspace-publication-callers.sh`, `tests/product-backlog.sh` and
    `tests/product-backlog-git.sh`. The first three pass
    `--test-concurrency=1`.
  - Playwright uses the `list` reporter, plus `html` on CI
    (`dashboard/playwright.config.ts`).
  - The dashboard build in `globalSetup` is already captured with
    `stdio: "pipe"` (`dashboard/tests/support/dashboardServer.ts`).
  - No suite-wide check for unexpected output exists.
  - Recent quieting commits `33a2d95` and `1283b31` show the kind of warnings
    and colour leaks involved.
- **Why parallelism is capped.** Plan 073 (`9f24224`, 2026-09-22) set the four
  slots and kept `--test-concurrency=1`, because eight slots starved the
  15-second waits in `ci-codex-lifecycle.test.mjs:37` and
  `ci-codex-observation-loss-lifecycle.test.mjs:71`. It measured `npm test` at
  about 106 s at that revision. Raising parallelism was left unmeasured.
- **The long pole.** `tests/execution-ci-runtime.sh` runs all 76
  `src/skills/dough-execute-plan/scripts/*.test.mjs` files serially.
  - In the planning profile it took 480 s alone: 284 cases, 22 of them over
    5 s and together 201 s, mostly git-fixture work.
  - The next largest checks were `update-skip-verified.sh` (80 s), then the
    payload/update checks at 30–50 s each.
  - `tests/helpers/release-fixture.bash` is sourced by 24 tests, and 13 of
    them rebuild git release fixtures.
- **Local-only failure.** At `04a034b`, `a rival holding a different agent name
  leaves the replayed claim its original name`
  (`workspace-publication-startup-agent-race.test.mjs:30`) failed in both
  full-suite runs, each time after about 7 s. It timed out in `awaitFile`
  (200 × 25 ms, `workspace-publication-startup-test-fixtures.mjs:66`) waiting
  for `push-arrived`. Run alone it passed 3 of 3. CI on the recent main
  revisions was green.
- **Fixed waits found.**
  - Real elapsed-time waits:
    - `sleep 1` ×3 in `tests/update-skip-verified.sh:173,188,210`, for mtime
      resolution;
    - `sleep 1` on `complete-revision` in the fake `node` wrappers of
      `tests/support/ci-completion-native-fixture.sh:151`,
      `story-branch-closure-native-fixture.sh:22` and
      `trunk-closure-native-fixture.sh:49`;
    - `sleep 2` in `ci-completion-native-fixture.sh:107`;
    - `delay(400)` in `tests/support/product-backlog-write-safety.test.mjs:81`
      and `product-backlog-adopt-refusals.test.mjs:129`;
    - `pause(100)` in `ci-fixture-lifecycle.test.mjs:43`.
  - Negative "nothing happens within" waits:
    - `setTimeout` 150 ms in `ci-codex-completion.test.mjs:66`;
    - `waitForTimeout(1500)` in `dashboard/tests/storyReadinessRefresh.ts:117`.
  - One unbounded poll: `tests/native-run-watchdog-cleanup.sh:31`.
  - Hang stand-ins that are not waits: `native-agent-hang.sh:61,75`,
    `native-run-timeout.sh:46`, `native-run-watchdog-cleanup.sh:24`.
- **Existing solutions to reuse (PFE).**
  - Bounded waits: the Node `waitForFile`/`waitForPidExit`
    (`watch-ci-test-fixtures.mjs:41,50`).
  - Injected `now`/`sleep` and `controllableSleep`
    (`ci-revision-coverage-late-github-failure-test-fixtures.mjs:141`,
    `watch-ci-execution.test.mjs`).
  - Playwright `page.clock` with the paused-clock helpers in
    `dashboard/tests/autoRefreshJourney.ts`.
  - The native-run `--deadline`/`--grace` limits.
  - Three copy-pasted bash pollers (`ci_completion_wait_for`,
    `story_closure_wait_for`, `trunk_closure_wait_for`) share one meaning and
    should become one helper.
  - `dough-test-optimization` owns profiling, measured experiments, preserved
    proof, and re-profiling.
- **Decisions.** [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  applies: test runner logic with substitute processes, bound execution and
  retries, and investigate failures before retrying. It conflicts with
  nothing here. No North Star topic is needed; this is test infrastructure
  inside existing boundaries.

## Outside-in proof

**Baseline before slice 1.** On the developer's machine, before any change is
dispatched, measure under the conditions below.

- **Revision:** the revision execution starts from.
- **Machine:** the developer's machine as it is; record the load averages
  when each run starts. (Changed during execution on the developer's
  instruction: unrelated work kept the load at 50–170, so the comparison is
  relative. See **Comparable measurement**.)
- **Settings:** Bash 5 first on `PATH`, dependencies installed with `npm ci`,
  Playwright Chromium present, `OPEN_DOUGH_TEST_JOBS` unset.
- **Runs:** run `npm test` then `npm run test:dashboard` three times, and
  take the median of each part.
- **Record in Learnings:**
  - each part's median wall time and their sum;
  - the executed case counts (shell checks, `node --test` tests, Playwright
    tests);
  - per-check durations;
  - machine, OS, Node, Bash and Playwright versions;
  - failures, if any.

The target is at most 25% of the start revision's sum, measured in the same
paired session (see **Comparable measurement**). The planning profile below
is **not** this baseline.

| Key example (seed) | Slice | Observation |
| --- | --- | --- |
| Baseline recorded; the final sequence on the same machine and conditions takes ≤ ¼ of it | before 1, 12 | Measured medians in Learnings |
| Every test passes → both commands print nothing | 3, 4, 5 | Full `npm test` and `npm run test:dashboard` with stdout and stderr captured: both empty, exit 0 |
| One shell check fails → exit non-zero, that check named, only its output shown | 2 | Runner test with substitute checks |
| A child process warns on an otherwise passing run → the run fails, showing the warning, locally and in CI | 4, 5 | Runner test with a substitute check that passes but writes to stderr; the Playwright reporter test with a passing spec that writes output |
| `update-skip-verified.sh` stops waiting for mtimes | 6 | The check sets timestamps explicitly; no `sleep` remains; its assertions unchanged |
| Hung-agent deadline proof uses short injected limits and observes the stop; the stand-in may still sleep | 6 | `tests/native-run-timeout.sh` still passes, and nothing waits for the stand-in to finish |
| A dashboard refresh or backoff journey advances a controlled clock | 8 | `storyReadinessRefresh.ts` uses `page.clock`; no `waitForTimeout` remains in `dashboard/tests` |
| A race fixed at its cause; repeated runs pass without retry | 1, 9, 9a, 12 | Slice 1 regression under load; slices 9 and 9a under raised parallelism (9a's load-stress before/after, then slice 9's three default runs); five consecutive complete runs in slice 12, no retries configured |
| Redundant case removed only when the promise keeps its proof | 10, 11, 12 | Each removal names the promise and its surviving proof in Learnings |

## Current decisions

- **One output rule everywhere.** A passing check or test must write nothing;
  any output from a passing one fails the run, locally and in CI alike. This
  is stricter than the seed's local one-dot ceiling. It gives the same result
  in both places, and no dots are printed. Each runner enforces the rule
  itself (`scripts/test.sh`, and a Playwright reporter), so CI needs no extra
  step.
- **Failures-only reporters.**
  - One Node test reporter module under `tests/support/` is used by every
    shell entry that runs `node --test`. It prints only failing tests with
    their error, location, and captured output.
  - Playwright gets its own reporter under `dashboard/tests/support/`.
    `trace: "retain-on-failure"` and CI's `html` report are kept, since they
    write files, not output.

  The two test frameworks have different reporter APIs, so they get two
  reporters.
- **Parallelism waits for event synchronization.** Slots or Node concurrency
  are raised only in slice 9, after slices 6 to 8 remove the elapsed-time
  waits that starved under load in plan 073. If raised parallelism destabilizes
  a test, fix its cause (slice 9, or slice 9a for the detached-process start
  waits); do not lower the default or the target to hide it.
- **One scheduling owner (slice 9).** `scripts/test.sh` schedules every job:
  each `tests/*.sh` check and each `node --test` file (listed through
  `tests/node-test-files`) is its own job, so no worker pool is nested under
  another. Default slots = online CPUs; `OPEN_DOUGH_TEST_JOBS` accepts any
  count of 1 or more; the checked-in `tests/longest-first` starts known long
  jobs first. The five aggregator entries (`tests/execution-ci-runtime.sh`,
  `closure-publication.sh`, `workspace-publication-callers.sh`,
  `product-backlog.sh`, `product-backlog-git.sh`) are removed. The CPU-count
  default is the least settled choice (see Learnings); the decisive
  checkpoint may revisit it with paired measurements, but never to hide an
  unfixed timing cause.
- **Shared bounded waits stay inside their module boundaries.** Bash tests
  get one bounded wait helper under `tests/helpers/`, replacing the three
  copies. The `dough-execute-plan` scripts keep reusing their own
  `waitForFile`/`waitForPidExit`. Do not add imports from `src/skills/*/scripts`
  into `tests/` for this.
- **Stable means cause-fixed.** No retries, skips, quarantines, or longer
  timeouts alone. A timeout may grow only when the operation's own lifecycle
  justifies it, and the plan records why.
- **Comparable measurement (relative).** On the developer's instruction
  (2026-09-25), measurements do not wait for an idle machine. Every
  measurement that is judged against the target runs the start revision
  (`bad3717`, kept as a detached reference checkout) and the candidate back to
  back, or alternating, under the same load, three runs each. It records the
  loads and judges the ratio of the medians: candidate sum ≤ 25% of the
  start-revision sum. The initial baseline run supplies the per-check profile
  and case counts. If slice 9 changes the default job count, the candidate
  uses the new default, as the seed allows.
- **Execution identity.** Story Branch Mode; workspace
  `.claude/worktrees/096-quiet-stable-fast-tests` on branch
  `claude/096-quiet-stable-fast-tests`, started from `0168768`. Claim
  `bad3717` published to `origin/main` (agent Yua-chan, publisher
  `claude-53d97dfe-096`); increments publish to
  `origin/claude/096-quiet-stable-fast-tests`. CI source: GitHub Actions
  `ci.yml` / `CI`.

- **Decisive checkpoint (for `dough-test-optimization`).** After slice 9
  completes (which follows slice 9a) and again after slice 11, compare the
  measured complete-suite median with the target (≤ 25% of the baseline
  sum). If the remaining candidates cannot plausibly close the gap, stop before the next experiment slice. Record the
  measurement, the gap, and the candidates, and return to the developer for
  plan refinement or a story split. Quiet and stable results (slices 1–9a)
  remain delivered either way.

- **Decisive checkpoint after slice 9 (2026-09-25): stop for the developer.**
  - *Measurement (paired, alternating, load 9–46, three runs each):* start
    revision `bad3717` median `npm test` 224.2 s + dashboard 18.4 s =
    **242.6 s**; candidate `3fc3a8b` 104.8 s + 16.8 s = **121.6 s**; ratio
    **0.50** against the ≤ 0.25 target (≤ 60.6 s, so `npm test` ≤ ~44 s).
    All candidate runs passed silently.
  - *Remaining-gap comparison:* every job alone sums to 631.8 s; at 16 slots
    the effective parallelism is about 6. Slice 10 saves about 0.55 s per
    release-fixture check (about 1 s of wall); slice 11's repository setup is
    about 5% of those suites (4–5 s of wall), because the product's own git
    processes dominate them. After both, about 116 s (48%). The longest job,
    `execution-payload-update.sh`, takes 47.6 s alone, more than the whole
    budget, and neither slice touches it.
  - *Invalidated assumption:* that fixture building and repository setup
    were the dominant removable costs. Most remaining work is installer and
    updater runs (about 30 in `story-payload-update.sh` alone) and the
    shell forks inside them.
  - *Consequence:* slices 10 and 11 are not dispatched. Reaching 0.25 needs
    about a 58% cut in total work with no job over about 15 s alone, which
    only fewer installer/update runs or a faster installer could give; that
    changes coverage or design, outside this plan's authority.
  - *Independently valuable, not dispatched pending the developer:* (1) a
    30 s wait in `execution-payload-update.sh` via
    `tests/helpers/installed-wait-entrypoint-fixture.bash`: `ci-mailbox.mjs
    await-revision` takes 30.05 s for `.claude/skills` against 0.40 s for
    `.agents/skills`, matching `watch-ci-execution.mjs`'s default
    `pollMs = 30_000` (observer polls before `register-push` lands, then
    sleeps a full interval) — either a missed elapsed-time wait or a product
    delay users also hit; (2) `/usr/bin/git` on macOS is Apple's launcher
    stub (about 7.5 ms per call); putting the Command Line Tools bin first
    measured −7.4% on the complete local suite (no effect on Linux CI);
    (3) `assert_payload`'s per-file `cmp` loop (about 3 s per calling
    check).
  - *Decision (developer, 2026-09-25):* accept the measured twofold result
    as this story's outcome and split the fourfold target into
    [SEED-037 story 2](../../seeds/SEED-037-quiet-stable-fast-tests.md#fourfold-local-suite),
    placed first in the backlog list with the evidence above. Slices 10–12
    are not executed here; story 2 owns the speed target and slice 12's
    final fourfold measurement. The stable-results promise that slice 12
    also owned is met by the six consecutive silent complete runs of the
    delivered code (slice 9's three runs and the checkpoint's three
    candidate runs, one with CI-like git config) and green CI on every
    delivered code revision.

## Ordered slices

### 1. The complete local suite passes locally as it does in CI

Type: Behavior
Status: done
Accepted proof: `node --test` of `workspace-publication-startup-agent-race.test.mjs`
and `workspace-publication-startup-race.test.mjs` passes 7/7 alone and in six
to eight concurrent copies at load 48–80 (the old fixture failed 5 of 8);
`bash tests/execution-ci-runtime.sh` passed 314/314 beside a concurrent
`npm test` at load 68–78. Observations: each race test's
`barrier.awaitArrival(<process>)` followed by its receipt assertions.
Proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-race.test.mjs`
passes alone, and passes inside `bash tests/execution-ci-runtime.sh` while the
machine is under load. Load it with a concurrent `npm test`, the condition in
which the test failed during planning. The cause is recorded in Learnings.

Behavior: a developer runs the complete local suite at the start revision →
every check that passes in CI passes locally too.

Diagnose why `push-arrived` is not observed within `awaitFile`'s bound when
the suite runs in full. Candidates are load, leftover processes or state from
earlier suites, and the pre-push hook barrier. Fix the cause. If the full
baseline shows other local-only failures, they belong here too.

### 2. The suite runner reports only failing checks

Type: Behavior
Status: done
Accepted proof: `bash tests/test-runner-failure-report.sh` (substitute checks
through the new `OPEN_DOUGH_TEST_DIR` input: all pass → empty stdout and
stderr, exit 0; one fails → exit 1, only `FAIL: <label>` and its log, no
`Running` headers, passing output and `support/` hidden);
`bash tests/test-runner-bash.sh` (marker files prove default discovery still
runs a valid check and `check-self-installation.sh`); a full `npm test` exited
0 with empty stderr and only npm's banner on stdout.
Proof: a runner test (a new `tests/*.sh` entry) runs `scripts/test.sh`
against substitute checks through a runner-supported test-directory input:
- all substitutes pass → the runner prints nothing and exits 0;
- one fails with output → exit 1, its label and only its log shown, and the
  passing substitutes' output hidden.

Then `npm test` passes.

Behavior: all checks pass → no `Running …` headers or replayed logs; a check
fails → only that check is reported.

### 3. Node test entries report only failing tests

Type: Structure
Status: done
Accepted proof: `tests/support/node-test-failures-reporter.test.mjs`, run from
`tests/test-runner-failure-report.sh`, drives substitute files through the
reporter: a failing test shows `not ok: <suite > test>`, its location, error,
and the file's captured stdout and stderr; a silent passing file prints
nothing; a passing file that prints is shown under `output from passing
<file>:` (so slice 4's rule can fail it); a file exiting non-zero is named with
its exit code. All six `node --test` entries use the reporter with their
concurrency unchanged, and each passed; no real node test wrote output while
passing. A full `npm test` exited 0 with empty stderr.
Proof:
- A deliberately failing substitute `node --test` file, run through the
  shared reporter, shows the test name, error, location, and captured output.
- A passing substitute prints nothing.
- The reporter's own proof is a new `node --test` suite under
  `tests/support/`, run from an existing entry.
- Every `tests/*.sh` entry that runs `node --test` uses the reporter and still
  passes.
- `npm test` passes.

Internal change: add the failures-only Node reporter module. Pass it from each
shell entry that runs `node --test`, keeping their existing concurrency.
External behavior is unchanged: the runner from slice 2 still hides passing
checks.

Enables slice 4. Node suites stop producing success output there, so the
strict rule becomes enforceable.

### 4. Shell checks succeed silently, and a passing check that prints fails the suite

Type: Behavior
Status: done
Accepted proof: `tests/test-runner-failure-report.sh` adds passing
substitutes that write to stdout and to stderr; the run exits 1 with
`FAIL: <label> (passed but printed output)` and each printed line, and a
runner with the rule disabled fails that test. A full `npm test` exited 0 with
empty stderr and only npm's two banner lines on stdout, both with local git
config and with `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`. 63
default-path `PASS:`/`PENDING:` echoes were removed (opt-in `--native`
verdicts kept); 15 checks that the rule exposed were silenced at their source
(installer/updater success output, a leaking negative install, `grep` without
`-q`, git merge chatter through the backlog merge adapter). Header comments
keep a check's promise where the removed sentence was its only statement.
Proof:
- The slice 2 runner test gains a substitute that passes but writes to
  stderr: the run fails, naming it and showing the output.
- A full `npm test` exits 0 with empty stdout and stderr.

Behavior: all checks pass silently → nothing is printed; any output from a
passing check → the suite fails and shows it.

Remove the `PASS:` echoes from the 46 shell checks. Fix any warnings exposed,
such as Node experimental or deprecation warnings, colour leaks, or git hints,
at their source instead of filtering them. Then turn on the rule in
`scripts/test.sh`.

### 5. The dashboard suite succeeds silently and fails on stray output

Type: Behavior
Status: done
Accepted proof: `dashboard/tests/quiet-reporter.spec.ts` (runs inside
`npm run test:dashboard`) drives Playwright on temporary configs with
substitute specs under `dashboard/tests/fixtures/quiet-reporter/`: passing →
exit 0 with empty stdout and stderr; failing → non-zero, title, error, and
one retained `trace.zip`; a passing spec that prints → non-zero, showing it;
a global setup that prints → non-zero, "outside any test". `npm run
test:dashboard` exited 0 printing only npm's banner in three runs, one with
`CI=1` (HTML report still written). Also fixed at its cause: an intermittent
`preparation-legend.spec.ts` failure (4 of 40 under load) where End was
pressed during Home's animated scroll; End now waits for the top and two
drawn frames (0 of 120).
Proof: the reporter's own proof runs Playwright on a temporary config with
substitute specs:
- a passing spec → no output, exit 0;
- a failing spec → its title and error, with a trace file retained;
- a passing spec that writes to stdout → the run fails, showing it.

Then `npm run test:dashboard` exits 0 with empty stdout and stderr. CI's
dashboard job still uploads its report on failure.

Behavior: the browser suite passes → nothing is printed; a spec fails or a
passing spec prints → the run fails and names it.

### 6. Shell checks and fixtures synchronize on events, not elapsed time

Type: Behavior
Status: done
Accepted proof: `tests/update-skip-verified.sh` backdates its baselines
(`touch -t 202001010000`) instead of sleeping past mtime resolution; the fake
`node` wrappers' `sleep 1` is gone (the controllers already ordered on the
logged `complete-revision` and their release files); the review-boundary
`sleep 2` window is a controller-released gate; the watchdog poll is bounded
below its case deadline; one `tests/helpers/wait-for.bash` (`wait_for`,
`poll_until`; 0.05 s interval; failure names what it awaited) replaces the
three copied pollers, with each controller's lifecycle bound kept as a named
constant. Every affected check exits 0 with no output under local and
CI-like git config; `grep -rnE '\bsleep [0-9.]+' tests/` finds only the
hang stand-ins and the helper's poll interval. The changed native
controllers were exercised by scripted smoke runs in ready, pending, and
failure orders.
Proof: the affected checks pass silently with unchanged assertions:
- `tests/update-skip-verified.sh`
- `tests/native-run-timeout.sh`
- `tests/native-run-watchdog-cleanup.sh`
- the CI-completion and closure native-fixture checks that source the
  changed support files

In addition, `grep -rnE '\bsleep [0-9.]+'` over `tests/` finds only the
recorded hang stand-ins and the bounded poll interval inside the one shared
helper.

Behavior: the shell tests run → no test waits for elapsed wall time, and a
missed event fails with the name of what it waited for.

- `update-skip-verified.sh` sets the file timestamps it needs.
- The fake `node` wrappers' `sleep 1` and the `sleep 2` window are replaced by
  an observable signal, or by the fixture's own release step.
- The unbounded poll gets a bound.
- The three bash pollers become one helper in `tests/helpers/`, bounded, with
  a short interval and a message naming what timed out.

### 7. Node tests synchronize on events or injected time

Type: Behavior
Status: done
Accepted proof: the backlog write-safety and adopt-refusal runs await a
`lock-busy` signal from a probe preloaded into the real CLI
(`tests/support/product-backlog-lock-fixture.mjs`) instead of `delay(400)`;
the stream fixture starts its release wait before announcing, so
`ci-fixture-lifecycle` needs no pause; the pending checks in
`ci-codex-completion` and `ci-mailbox-complete-unresolved-cases` wait for
observed recheck pauses (one shared `recheckPauseProbe`) instead of 150 ms
sleeps, and the second now asserts exactly `pending`. Temporary product
breaks failed each test. The affected suites pass silently with local and
CI-like git config. A scan of all Node test code finds no fixed wait of
100 ms or more outside bounded polls; what remains are 10–25 ms poll
intervals, 75 ms pending checks, keep-alive intervals, and a stub worker's
300 ms post-result linger, which is the scenario under test.
Proof: the affected suites pass silently with unchanged promises:
- `tests/support/product-backlog-write-safety.test.mjs`
- `tests/support/product-backlog-adopt-refusals.test.mjs`
- `ci-fixture-lifecycle.test.mjs`
- `ci-codex-completion.test.mjs`

In addition, no fixed `delay`/`pause`/`setTimeout` of 100 ms or more remains
in Node test code outside bounded polls.

Behavior: these tests run → they wait for the lock holder or fixture event.
A negative "still pending" check awaits an explicit signal, or uses the
injected `sleep`/`now` pattern, instead of sleeping.

The 15-second `waitForFile` in the two `ci-codex-*lifecycle` tests stays
bounded, and slice 9 re-checks it under load.

### 8. Browser journeys advance a controlled clock instead of waiting

Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- --grep 'story readiness keeps
evidence gaps and refreshes truthful'` selects the one test that runs all
three `storyReadinessRefresh.ts` journeys; it passed 5/5 with
`--repeat-each 5`, and the whole spec 2/2. `grep -rn waitForTimeout
dashboard/tests` finds nothing. The spec pauses the page clock before
`page.goto`; `expectNoRereadAfterSettlement(page, origins)` passes page time
to the next revision check and asserts unchanged origin read counts
(`storyReadinessRefresh.ts:129`), then `expectSteadyPace`. Sensitivity: a
temporary product break that re-read on an unchanged check failed there
(`[8, 3]` against `[6, 3]`).
Proof: the `storyReadinessRefresh.ts` journeys pass with
`npm run test:dashboard -- --grep '<those journeys>'`, and no
`waitForTimeout` remains in `dashboard/tests`.

Behavior: a "no re-read after settlement" check → it advances a paused
`page.clock` past the interval, reusing the helpers in
`autoRefreshJourney.ts`, and observes that no read happened.

### 9. Independent checks and Node suites run with enough parallelism to shorten the critical path

Type: Behavior
Status: done
Accepted proof (after slice 9a): three complete default `npm test` runs
passed silently (exit 0, empty stderr, only npm's banner): 98.5 s at load 13,
102.3 s at load 36 with `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`,
105.6 s at load 40. The former `execution-ci-runtime.sh` files run as
separate jobs; the two 15 s lifecycle waits passed in every run. The runner
test proves node-file jobs, their failure and stray-output reports,
`tests/longest-first` ordering, and `OPEN_DOUGH_TEST_TIMES`. The residual
10 s `stop` timeout in `ci-mailbox-worker-loss.test.mjs:23` (seen only at
load above 180) did not appear. Profile of run 1, top jobs (s):
`install-all-tools.sh` 80.6, `story-payload-update.sh` 79.1,
`execution-payload-update.sh` 78.5, `product-backlog-payload-update.sh` 68.5,
`workspace-publication.test.mjs` 62.8, `native-delivery-updated-use-adapters.sh`
56.0, `git-publication-native.sh` 54.2, `retrospective-reference-payload.sh`
53.7, `native-stream-completeness.sh` 44.6, `self-installation-baseline.sh`
42.0, `workspace-publication-startup-race.test.mjs` 41.0,
`update-skip-verified.sh` 40.1. The critical path is now the longest single
shell check.
Done so far (uncommitted at refinement, 2026-09-25):
- One scheduling owner in `scripts/test.sh`: every `node --test` file is its
  own runner job (186 jobs in all), default slots = online CPUs, checked-in
  `tests/longest-first` ordering, `OPEN_DOUGH_TEST_JOBS` any count ≥ 1; the
  five aggregator entries are removed (see Current decisions).
- `npm test` wall ~101–135 s against the baseline median 626 s, under similar
  or heavier load (not yet a paired measurement).
- Two timing causes exposed and fixed at their cause, each with a stress
  before/after: `ci-observer-stream.test.mjs:72` (9/120 → 0/120) and
  `ci-command-adapter-unavailable.test.mjs` (→ 0/80 at load 73–84). A third
  cause (six detached-process start waits) exceeded the slice's two-test
  limit and moved to slice 9a. With it unfixed, 2 of 3 full runs passed.
- See Learnings for causes, the timeout-growth reason, and slot measurements.

Proof (completes after slice 9a):
- Three complete `npm test` runs under the baseline conditions, with the new
  default, pass silently; one of them uses CI-like git config
  (`GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`).
- Per-check durations show the former `execution-ci-runtime.sh` files run as
  concurrent jobs, not as one serialized 76-file job.
- The two 15-second lifecycle waits pass under the new default.
- Record the wall time, new defaults, and fresh per-check profile in
  Learnings.

Behavior: the developer runs `npm test` with default settings → independent
work runs concurrently up to a machine-derived default, longest known checks
first, and the run is stable.

If completing the proof exposes a further timing-dependent test outside slice
9a's recorded set, stop and record it for plan refinement instead of widening
this slice or slice 9a.

### 9a. Detached observer and worker start waits end with the process, not after five seconds

Type: Behavior
Status: done
Accepted proof: the start waits in the eight files (plus the same call in
`ci-cursor-worker-loss-lifecycle` and `ci-mailbox-launch`) now wait while the
worker PID the product records in the mailbox's `worker.json` is alive, or
while the spawned `watch-ci.mjs` child is open, through one shared
`awaitSignalWhileRunning` (`process-lifetime-test-fixtures.mjs`, also used by
slice 1's `awaitArrival`). A worker that ends first fails at once naming its
exit, result, and last event (temporary product breaks). The two stdout reads
wait for `close`. The observers run under their own 60 s budget, after which
the worker records a terminal result and exits, so a silent live worker is
still bounded. Stress, 8 files × 12–24 concurrent copies: before, up to
24/24 failures per file at load 67–256; after, 0 at load 76–166. All eight
files pass alone silently, and full `npm test` runs with slice 9's runner
passed silently with local and CI-like git config.
Proof:
- Load-stress reproduction before and after, as in slices 1 and 9: run the six
  affected files in several concurrent copies at a load comparable to the
  failure (load ~90, or concurrent `npm test`); record failures before (the
  current fixture) and after, with the counts, loads, and copies in Learnings.
  After: no failures.
- The affected files pass silently, alone and under the new default runner:
  `ci-claude-lifecycle`, `ci-claude-worker-loss-lifecycle`,
  `ci-codex-lifecycle`, `ci-codex-stop-lifecycle`, `ci-cursor-lifecycle`,
  `ci-mailbox-worker-loss`, `ci-custom-host-bridge`, `ci-command-adapter`
  (all `src/skills/dough-execute-plan/scripts/*.test.mjs`), with unchanged
  assertions.
- A temporary break (the started process exits before its first sign of life)
  fails the wait promptly, naming the process's exit rather than a missing
  file after 5 s.

Behavior: a lifecycle test starts a detached observer or worker under load →
the test waits for that process's first sign of life (`github-request-started`,
`started`) for as long as the process is alive, and fails, naming its exit,
only if it exits first.

- Bound the six start waits (`ci-claude-lifecycle:45`,
  `ci-claude-worker-loss-lifecycle:28`, `ci-codex-lifecycle:60`,
  `ci-codex-stop-lifecycle:29`, `ci-cursor-lifecycle:46`,
  `ci-mailbox-worker-loss:140`) by the started process's lifecycle, like slice
  1's `holdFirstPush(...).awaitArrival(started)`, inside the
  `dough-execute-plan` fixtures (`watch-ci-test-fixtures.mjs` or its
  neighbours), not in `tests/`. Apply the same rule to the other start waits
  of the same shape in these files. Where the test holds no handle on the
  started process, observe it through what the fixture already records; if
  none exists, stop and record it rather than raising the 5 s number.
- A process that stays alive without signalling keeps a bound its own
  lifecycle justifies (for example the observer's own deadline), recorded
  here; "Stable means cause-fixed" applies.
- Read child stdout after `close`, not `exit`, in
  `ci-custom-host-bridge.test.mjs:50` and `ci-command-adapter.test.mjs:103`
  (latent: exit can precede the stdout drain).

This is the third cause slice 9 exposed; slice 9's two fixed causes are
recorded in Learnings. If the stress run exposes another cause outside this
set, stop and record it for plan refinement.

### 10. Git release fixtures are built once per run and reused

Type: Behavior
Status: moved to SEED-037 story 2 (developer decision at the checkpoint; see Current decisions)
Proof:
- The 13 checks that call `build_latest_fixture` or
  `build_current_tagged_release_fixture` pass silently with unchanged
  assertions.
- Each check still gets a private copy it may mutate.
- A measured before/after complete `npm test` median, under the baseline
  conditions, records the saving in Learnings.

Behavior: the developer runs `npm test` → the release fixtures are built once
and copied per check, and every release/update check proves the same promises
in less time.

Experiment under `dough-test-optimization`: if the measurement shows no
saving on the complete run, undo it and record that.

### 11. Execution-CI suites copy a prepared repository instead of rebuilding it

Type: Behavior
Status: moved to SEED-037 story 2 (developer decision at the checkpoint; see Current decisions)
Proof:
- The `dough-execute-plan` suites that build fresh git fixtures pass silently
  with unchanged assertions.
- A measured before/after median records the saving in Learnings.

Behavior: the developer runs `npm test` → repeated `git init` and seed-commit
setup in those suites is replaced by copying a repository prepared once per
process, and the suites prove the same promises in less time.

Base this on the fresh profile from slice 9. If that profile shows setup is
not the dominant cost of those suites, replace this slice's hypothesis with
the dominant one before starting, and record why. Undo it if it gives no
saving.

### 12. The complete local suite meets the fourfold target, confirmed by repeated runs

Type: Behavior
Status: moved to SEED-037 story 2 (developer decision at the checkpoint; see Current decisions)
Proof: final measurement under the baseline conditions:
- the medians of three runs sum to ≤ 25% of the baseline sum;
- five consecutive complete runs are silent and pass;
- the CI `test` and `dashboard` checks pass on the delivered revision.

Record every kept experiment's saving and surviving proof in Learnings.

Behavior: the developer runs the complete local suite → it finishes in at
most a quarter of the baseline time, silently, with the same coverage.

Apply further `dough-test-optimization` experiments from the profile after
slice 11 only as far as the decisive checkpoint in Current decisions allows. Remove a redundant case
only when the promise it proves keeps an observable proof at the same
boundary, and record both.

## Promise ownership

Each seed scope bullet maps to the proof table:
- the complete local suite, baseline and target: before slice 1 and slice 12;
- quiet success: slices 2 to 5;
- useful failure: slices 2, 3 and 5;
- stable results: slice 1 (known failure), slices 9 and 9a (under
  parallelism), and slice 12 (repeated runs);
- event synchronization: slices 6 to 8;
- coverage preserved: slices 10 to 12, with each change or removal recorded.

The deferred promises have no slice.

## Learnings

- **Planning profile, not the baseline.** Taken at `04a034b` on an Apple M4
  Max (16 cores, Node 24.5.0, Bash 5.3.20), at a load average of 38–53 from
  unrelated work (a VM and a Cypress run).
  - `npm test` took 685.6 s and failed (1 of 304 cases in
    `execution-ci-runtime.sh`); `npm run test:dashboard` took 28.1 s, with
    112 passed.
  - Serial per-check sum: 1144 s, of which `execution-ci-runtime.sh` was 480 s.
  - A passing `npm test` printed 936 lines (92 KB).

  Only the relative weights are usable. The real baseline must be taken under
  the recorded conditions.
- **Slice 1 cause: a fixed wait budget, not leftovers or the hook barrier.**
  The race fixtures' `awaitFile` gave startup 5 s (200 × 25 ms) to reach its
  held push. Before that push, `execution-start.mjs` runs Node start plus about
  75 sequential git processes (GIT_TRACE2: ~138 git starts per run, first push
  ~2.4 s after the first). Alone at load ~70 the push arrived after 3–4 s; at
  eight-fold concurrency 3.1–7.8 s, with every child still healthy. The
  baseline runs at the start revision failed the same way: 4 then 2 of the
  startup race tests, all `timed out waiting for …/push-arrived`. The wait is
  now `holdFirstPush(...).awaitArrival(started)`, bounded by the started
  process's lifecycle: it fails, with exit code and stderr, only if that
  process exits before pushing. A startup that hangs without exiting stays as
  unbounded as the tests' existing `await started.result`.
- **Baseline (start revision `bad3717`, relative conditions).** Apple M4 Max
  (16 cores), macOS 26.6.2, Node 24.5.0, Bash 5.3.20 first on `PATH`,
  Playwright 1.63.0, `npm ci`, `OPEN_DOUGH_TEST_JOBS` unset, measured in a
  detached reference checkout of `bad3717` with a timing `bash` shim that
  records each top-level check's wall time. 1-minute load at run starts:
  61, 66, 54 (`npm test`) and 62, 69, 28 (dashboard).
  - `npm test`: 747.9 s (fail), 625.8 s (fail), 353.7 s (pass); median
    **625.8 s**. Dashboard: 50.3, 23.8, 39.1 s; median **39.1 s**. Sum
    **664.9 s**. Treat these absolute numbers as a profile only; the target is
    judged by paired runs (see **Comparable measurement**).
  - Cases per run: 56 shell checks plus `check-self-installation.sh`, 507
    `node --test` tests, 114 Playwright tests. A passing `npm test` printed
    932 lines.
  - Failures: runs 1 and 2 failed 4 and 2 startup race tests, all
    `timed out waiting for …/push-arrived` (slice 1's cause); nothing else.
  - Median per-check wall time (s): `execution-ci-runtime.sh` 569,
    `install-all-tools.sh` 199, `product-backlog-payload-update.sh` 139,
    `git-publication-native.sh` 102, `execution-payload-update.sh` 101,
    `retrospective-reference-payload.sh` 97, `update-skip-verified.sh` 90,
    `native-stream-completeness.sh` 83, `closure-publication.sh` 82,
    `update-refuses-unverifiable.sh` 63, `native-result-retention.sh` 59,
    `workspace-publication-callers.sh` 56; every other check under 55. Serial
    sum of per-check medians about 2250 s against a 626 s wall median, so the
    four slots are busy and `execution-ci-runtime.sh` is the critical path.
- **CI repair after slice 5 (run 36097850869, `eb56cc4`).** CI's dashboard job
  failed: three story-readiness specs passed but printed git's
  `hint: Using 'master' as the name for the initial branch…`, because
  `commitAll()` in `dashboard/tests/storyReadinessCli.ts` ran a bare
  `git init` and CI's git has no `init.defaultBranch`. It now runs
  `git init --quiet --initial-branch=main`. On this Mac both the global
  config and Apple's system gitconfig set `main`, so reproducing CI's git
  environment needs `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`; the
  full dashboard suite passes silently under that and under plain config.
  Use the same environment to check the shell and Node suites before relying
  on local silence.
- **Product finding (not in scope).** The installed backlog merge adapter
  (`product-backlog-git-merge.mjs` through `gitOutcome` in
  `product-backlog-git-repository.mjs`) passes git's "Automatic merge went
  well; stopped before committing as requested" through to its caller's
  stderr. Capturing it broke `product-backlog-git-merge-conflict.test.mjs:46`,
  whose merge-driver diagnostic must reach stderr, so slice 4 silenced it in
  the test helper only.
- **Slice 6 residual risk (native journeys, out of scope).** The ci-completion
  controllers now hold the review until CI coverage is terminal in the ready
  scenario; an agent whose own command timeout is shorter than that would cut
  the review off, which the old 2 s window never risked. `native-run-supervise.sh`
  and the closure controllers now source `wait-for.bash`, which, like
  `native-run-stream.sh`, is not in their retained-evidence hash lists.
- **Slice 9 causes (raised parallelism, 186 jobs, default = online CPUs).**
  1. `ci-observer-stream.test.mjs:72` asserted stdout records after waiting on
     a separate file channel; it now also waits for the first stdout record.
     40× stress: 9/120 failures before, 0/120 after.
  2. `ci-command-adapter-unavailable.test.mjs` applied `adapterTimeoutMs: 250`
     to every mode, so under load it killed a real adapter before the adapter
     recorded its request. Now only the two hang modes set an adapter timeout;
     answering modes keep the product default 20 s. 0/80 failures at load
     73–84. **Timeout growth, 250 ms → 2,000 ms (hang modes):** the timeout
     must outlast the adapter's own Node start and request record before the
     hang it proves begins, so its lower bound is that process lifecycle, not
     the old elapsed budget.
  3. At load 90, six tests failed together at `waitForFile`'s default 5 s
     (`watch-ci-test-fixtures.mjs:41`) waiting for a detached observer's or
     worker's first sign of life. Same class as slice 1 (a fixed elapsed
     budget for process start); moved to slice 9a under slice 9's two-test
     limit. Latent, not seen failing: `ci-custom-host-bridge.test.mjs:50` and
     `ci-command-adapter.test.mjs:103` read stdout after `exit`, not `close`.
- **Slot measurements (single runs, loaded machine; not paired).** 6 → 175 s;
  8 → 108 and 123 s; 12 → 133 s (failed on cause 1); 16 (default here)
  → 101–135 s; 24 → 116.5 s. Above 8 slots, single loaded runs do not separate
  the options, so the default is the least settled slice 9 decision.
- **Slice 9a residual cause (recorded, not absorbed).** At load 181–240,
  2 of 24 concurrent copies failed `ci-mailbox-worker-loss.test.mjs:23`
  ("a reused worker pid is not signaled…"): its `ci-mailbox.mjs stop` call
  has `timeout: 10000` and was killed at 10 s. It never appeared at load up
  to about 166. Slice 9's default runs decide whether it needs its own slice.


## Execution complete

Product advice:
- Keep SEED-037 story 2 ("Bring the complete local suite to a quarter of its
  original time") first, as the developer placed it. When refining it,
  include the confirmed product side of the 30 s CI-observer poll:
  `register-push` does not wake the worker, so a revision whose CI already
  finished waits up to 30 s; an immediate re-check after registration helps
  users as well as `execution-payload-update.sh`.
- Execute correction plan
  [099](../099-finish-story-event-synchronization/PLAN.md) to finish story 1's
  event-synchronization promise (four 75 ms pending waits, the dashboard's
  500 ms negative pause, the worker-loss `stop` timeout) and give native
  evidence identities one list of supervision inputs.
- Feed this execution's learning into SEED-004#continue-test-optimization-plans:
  measure relatively (paired start-revision and candidate runs) on a shared
  machine, and trust a measured cost share over usage counts when planning
  experiments; the decisive checkpoint saved three low-value experiments.
- Consider a small backlog correction: the backlog merge adapter
  (`product-backlog-git-repository.mjs`) passes git's own messages to its
  caller's stderr.
- Developer decisions still open: a bound or diagnostic for a hung runner job
  (the suite waits for every job with no deadline), and whether npm's two
  banner lines count as output on a passing run.
