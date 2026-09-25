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

<a id="fourfold-local-suite"></a>

### 2. Bring the complete local suite to a quarter of its original time

**Identity:** SEED-037#fourfold-local-suite

**Status:** Not refined. Split on 2026-09-25 from the delivered story that made the suite quiet,
stable, and twice as fast, at its plan's decisive checkpoint, with the evidence
below.

**Goal:** An Open Dough developer gets complete local test feedback
(`npm test` then `npm run test:dashboard`) in at most a quarter of the
pre-optimization time, while keeping the suite's quiet output, stable results,
and behavioral coverage.

**Measure:** paired and relative, as settled on the maintainer's
instruction: alternate the pre-optimization start revision (`bad3717`) and the
candidate under the same load, three runs each, and compare medians. When the twofold result
was delivered the pair was 242.6 s against 121.6 s (ratio 0.50); the target is 0.25.

**Evidence for scope (decisive checkpoint, 2026-09-25):**

- Every job alone sums to about 632 s; at 16 slots effective parallelism is
  about 6. Reaching 0.25 needs roughly a 58% cut in total work with no single
  job over about 15 s alone.
- Installer and updater runs dominate the long shell checks (about 30
  `apply`/`install.sh` runs in `story-payload-update.sh`, 24 of them a
  Cursor-only protection matrix). Fewer runs per promise, or a faster
  installer, is the only lever of the needed size. Coverage rules from
  this seed apply: a promise keeps an observable proof at its boundary.
- **In scope (maintainer decision, 2026-09-25): the CI observer checks
  immediately when a push is registered.** Today `watch-ci-execution.mjs`
  polls every 30 s (`pollMs = 30_000`) and `register-push` does not wake the
  worker, so a revision whose CI already finished waits up to 30 s for a
  verdict that already exists. Users re-publishing a covered revision hit
  it, and `execution-payload-update.sh` pays it on some runs (30.05 s
  against 0.40 s when the first poll comes after registration).
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
- **Depends on:** none; the quiet, stable, twofold suite is delivered.

<a id="diagnosable-test-hangs"></a>

### 3. Name the check that hangs, and remove the runner's own hang and leaks

**Identity:** SEED-037#diagnosable-test-hangs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/104-diagnosable-test-hangs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0020a87e421c653e9124007c034137470c516621976dee501ea110222a1533be","plan":"4421dba5646c5ec722af0967ef76d65eaeeb2932aba88e34a02b4a710d544416"}}
```

**Status:** Refined on 2026-09-25. Raised the same day from a hang-risk
analysis after the quiet, stable suite was delivered; the maintainer chose
fixes without time limits inside the runner, at low cost.

**Goal:** When a test run hangs or is interrupted, an Open Dough developer
(locally or reading CI) sees which checks were still running and their
output, instead of an empty log; the runner and test fixtures stop causing
hangs or leaving processes behind; and a hang in CI costs minutes, not the
full 20-minute timeout.

**Why now:** the leaking teardown is a live defect, not insurance: every
passing run of the two CI-observer tests orphans an observer worker (see
evidence). Several agents running the suite at once on one machine, the
near-future direction's second step, multiply the leak. The fourfold-suite
story that follows will restructure the runner and the long installer
checks; a named hang protects that work.

**Evidence (checked 2026-09-25):**

- 65 of 133 CI runs on 2026-09-22/23 hit the 20-minute timeout (a leaked
  watchdog `sleep` holding a `$(...)` pipe, fixed in `8277965`). The logs
  could not say which check hung: `scripts/test.sh` prints nothing and its
  only trap deletes every log on exit. About 60 CI runs since then passed, so
  hang diagnosis is insurance.
- `node:test` runs `t.after` hooks in registration order. The startup race
  tests register fixture cleanup before releasing the held push, so a failing
  test leaves a `git push` looping. `ci-cursor-worktree-hook` and
  `ci-target-branch-worktree` register fixture removal before `stop`; `stop`
  then runs a script from the deleted fixture, fails, and
  `.catch(() => undefined)` hides it. Reproduced: after a passing run of
  `ci-target-branch-worktree.test.mjs` its `ci-mailbox.mjs worker` was still
  alive in the deleted temp directory, able to call the real `gh` for up to
  60 s.
- `scripts/test.sh` and `tests/README.md` accept Bash 4, but the runner uses
  `EPOCHREALTIME` (Bash 5). Under `set -u` the job subshell dies before
  returning its slot, and the final report aborts on the missing status file.
- CI jobs finish in about 3 minutes each; `timeout-minutes` is 20.

**Scope:**

- **Interrupt report.** On INT or TERM, the runner writes to stderr, for each
  job still running, its label, elapsed time, and a bounded tail of its log,
  then stops those jobs and exits with the signal's status (130 or 143). A
  job that the same Ctrl-C ended is reported as interrupted with its log
  tail, not as a failing check. A run without an interrupt stays silent on
  success.
- **Stopping a job** ends the processes in that job's process group. Workers a
  test deliberately detaches are the test's own teardown responsibility,
  below.
- **Bash floor.** The runner and `tests/README.md` require Bash 5. A job
  whose status file is missing is reported as failed with its log, not as a
  runner crash.
- **Teardown order.** Tests stop what they started before removing the
  fixture it runs from: the startup race tests release the held push first,
  and the two CI-observer tests stop the observer first. The same pattern is
  fixed wherever else a test starts a detached worker or held process. A
  failing `stop` in teardown fails the test instead of being swallowed.
- **CI timeout.** Each job in `.github/workflows/ci.yml` times out after 8
  minutes instead of 20 (maintainer decision, 2026-09-25).

**Deferred and excluded:**

- Time limits on runner jobs or individual tests (maintainer decision). The
  CI job timeout is the only limit.
- Parent-side slot accounting (for example `wait -n -p`) so that a job
  killed by SIGKILL still returns its slot; no reachable cause today.
- Environment hardening (closed stdin, `GIT_TERMINAL_PROMPT`, a guard
  `gh`), which the analysis found unreached today.
- The Playwright dashboard suite, which has its own timeouts and reporter;
  uploading logs as CI artifacts; progress or heartbeat output during a run.
- **Overlap accepted:** quick/102 also changes how mailbox `stop` is
  bounded. The maintainer keeps the observer teardown fix in this story; the
  later of the two reconciles.

**Key examples:**

- A substitute check that never ends, run beside passing checks and
  interrupted with TERM: stderr names only that check, with its elapsed time
  and output tail; the exit status is 143, and no process from its group
  remains.
- A developer presses Ctrl-C mid-run: every job still running or just ended
  by that signal is listed with its log tail, and the exit status is 130.
- A substitute check whose job leaves no status file: the run finishes and
  reports that check as failed with its log.
- The runner started with Bash 4 first on `PATH` refuses with the Bash 5
  requirement.
- A passing run of the CI-observer tests leaves no `ci-mailbox.mjs worker`
  from their fixtures; a startup race test that fails between arrival and
  release leaves no `git push` or pre-push loop running.
- Demonstrated once by hand, not automated: a CI run cancelled while a check
  is running shows the interrupt report in the `test` step log.

- **Value / learning:** a future hang costs one look at an 8-minute log
  instead of a 20-minute timeout with no clue, and local runs stop leaving
  observers behind.
- **Effort hypothesis:** S, provisional.
- **Depends on:** none; the quiet, stable, twofold suite is delivered.

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
