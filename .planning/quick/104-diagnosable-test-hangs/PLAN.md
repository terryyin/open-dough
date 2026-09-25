# Name the check that hangs, and remove the runner's own hang and leaks

## Source

**Identity:** SEED-037#diagnosable-test-hangs

[Refined story](../../seeds/SEED-037-quiet-stable-fast-tests.md#diagnosable-test-hangs)
(goal, scope, exclusions, and key examples live there). First queued story.
This preparation authorizes neither Take nor implementation.

## Goal and scope

When a test run hangs or is interrupted, an Open Dough developer sees which
checks were still running, with their output. The runner and the test
fixtures stop causing hangs or leaving processes behind. A hang in CI costs 8
minutes, not 20.

Included: the runner's interrupt report and process-group stop, the Bash 5
floor, reporting a job that leaves no status, teardown order in the CI-observer
and startup race tests, and the 8-minute CI job timeout with one manual
cancelled-run demonstration.

Excluded (seed decisions): time limits on runner jobs or tests, parent-side
slot accounting for SIGKILLed jobs, environment hardening, the Playwright
dashboard suite, CI log artifacts, and progress output during a run.

## Decisions and evidence

Survey base: `2c7521a2b3a40d414f322d16a75ca89d4aad0750`.

- **Proof entry points.** `tests/test-runner-failure-report.sh` already drives
  `scripts/test.sh` against substitute checks through `OPEN_DOUGH_TEST_DIR`;
  runner behavior extends that pattern (a sibling runner test is fine if the file
  grows unwieldy). `tests/test-runner-bash.sh` owns the version refusal with a
  fake `bash` on `PATH`.
- **Leak sweep (passing path).** Each of the 13 `*.test.mjs` files that start
  a detached worker or hold a push was run alone, and leftover fixture
  processes were counted. Only `ci-cursor-worktree-hook.test.mjs` and
  `ci-target-branch-worktree.test.mjs` leave one (a `ci-mailbox.mjs worker`).
  Command: `node --test <file>` then `ps -axo pid,command` filtered to temp
  directories; the others matched only the one-process baseline.
- **Failing path.** `workspace-publication-startup-race.test.mjs` and
  `workspace-publication-startup-agent-race.test.mjs` register
  `t.after(trunk.cleanup)` before the barrier's release. `node:test` runs
  `t.after` hooks in registration order (verified on Node 24.5.0), and
  `holdFirstPush`'s `release` does nothing once the fixture is gone, so its
  pre-push `while [ ! -e released ]` loop never ends.
- **Common teardown rule.** A test stops or releases what it started before
  removing the fixture those things run from: teardown runs in the reverse
  order of setup. Use one mechanism for both fixture families (for example,
  fixture cleanup that first runs the stop and release steps registered with
  it, or registering removal last). Do not add a per-test special case. A
  failing stop or release in teardown fails the test; the
  `.catch(() => undefined)` around observer `stop` is removed.
- **Process groups.** The runner starts each job in its own process group
  (for example `set -m` for background jobs) so that stopping a job reaches
  what it started without `setsid`, which macOS lacks. Detached workers
  deliberately leave the group and remain the test's own teardown
  responsibility.
- **Ctrl-C.** Because jobs run outside the foreground process group, a
  terminal Ctrl-C reaches `npm` and the runner, not the jobs. The runner then
  finds them still running and reports them. A job that ended from the same
  signal anyway is reported as interrupted with its log tail.
- **Overlap with quick/102**, accepted by the maintainer: 102 bounds mailbox
  `stop` refusal. Slice 1 changes only test teardown order and error
  propagation. Whichever lands second reconciles the teardown code.
- **No North Star topic or ADR** governs the test runner or fixture teardown;
  no new direction is warranted.

## Proof ownership

| Seed promise or example | Slice |
| --- | --- |
| CI-observer tests leave no worker after a passing run; a failing `stop` fails the test | 1 |
| A startup race test failing between arrival and release leaves no `git push` or pre-push loop | 2 |
| TERM on a never-ending check: stderr names only it with elapsed time and output tail, exit 143, no process from its group remains | 3 |
| Ctrl-C (INT): each job still running or just ended is listed with its tail, exit 130 | 3 |
| A run without an interrupt stays silent on success | 3 (existing passing-run assertion stays green) |
| A job that leaves no status file is reported as failed with its log; the run finishes | 4 |
| Bash 4 first on `PATH` is refused with the Bash 5 requirement; `tests/README.md` says Bash 5 | 5 |
| CI jobs time out after 8 minutes | 6 |
| A cancelled CI run shows the interrupt report in the `test` step log (manual, once) | 6 |

## Slice 1 — CI-observer tests stop their observer before removing the fixture

Type: Behavior
Status: done

Behavior: `ci-cursor-worktree-hook.test.mjs` and
`ci-target-branch-worktree.test.mjs` pass → their teardown runs → the observer
worker each started has exited before its fixture is removed, and no
`ci-mailbox.mjs worker` from their fixtures remains; a `stop` that fails makes
the test fail.

Proof: in each test's teardown, after `stop`, assert that the worker pid the
mailbox recorded (`recordWorkerIdentity`) is no longer alive, waiting on that
process's exit, not on elapsed time. Show once, by temporarily reversing the
order, that the assertion fails. Then rerun both files and the leak-sweep
command from the decisions above for these two files: no leftover worker.

Accepted proof (2026-09-25): the shared teardown mechanism is
`fixtureTeardown(root)` in `fixture-teardown-test-fixtures.mjs`. Tests
register `t.after(cleanup)` when the fixture is created and pass each stop or
release step to `defer`. `cleanup` runs those steps in reverse order, removes
the fixture, and then rethrows any step failure. `deferObserverStop` in
`watch-ci-test-fixtures.mjs` reads the recorded worker, runs the real
`ci-mailbox.mjs stop` with no `.catch`, and asserts
`checkMailboxWorkerLiveness(worker, directory) === "dead"`.
`PATH="/opt/homebrew/bin:$PATH" node --test src/skills/dough-execute-plan/scripts/ci-cursor-worktree-hook.test.mjs src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs`
passes (2 tests), and the leak sweep after each file is empty. With removal
temporarily moved first, the stop failed with `ENOENT` and failed the test.
With that failure also swallowed again, the liveness assertion failed with
`'alive' !== 'dead'`.

## Slice 2 — Startup race tests release the held push before removing the fixture

Type: Behavior
Status: done

Behavior: a startup race test whose assertion fails after the push arrived and
before release → teardown runs → the held pre-push is released before the
fixture is removed, and no `git push` or pre-push loop remains.

Proof: a focused fixture-level test in the startup test-fixture family holds a
first push, starts a push that arrives, then runs the fixture's teardown path
without an explicit release (the failing test's path), and waits for the push
process to exit. Show once, on the current order, that it does not exit.
`workspace-publication-startup-race.test.mjs` and
`workspace-publication-startup-agent-race.test.mjs` stay green.

Accepted proof (2026-09-25): `createQueuedTrunk` uses `fixtureTeardown`.
`holdFirstPush` defers a release step that writes the release file, then
waits through `awaitProcessExit` for the held `git push` to end. The hook
records that pid (`$PPID`) atomically in `push-arrived`. `processEnded`, in
`process-lifetime-test-fixtures.mjs`, also counts an unreaped zombie as
ended. `startProcess` defers a step that kills its child and awaits its
`exit`. The race tests' per-test release and kill `t.after` blocks are gone.

The fixture-level test `workspace-publication-startup-teardown.test.mjs` runs
`trunk.cleanup()` without an explicit release and awaits the push child's
`exit`. `PATH="/opt/homebrew/bin:$PATH" node --test` over it and the two race
tests passes 8/8, and afterwards no `pre-push`, `git push` or
`execution-start.mjs` process remains. On the old order, the test timed out
with the `git push` and its pre-push hook still running.

Other consumers of the changed fixtures also pass:

- startup recovery, agent-resume, agent-release and
  `workspace-publication-race`: 11/11;
- `workspace-publication`, startup-agent and preparation-assignment: 47/47;
- the `waitForPidExit` consumers: 33/33.

Learning: writing a release file is not enough when fixture removal follows
immediately, because the poller can miss the file. Teardown waits for the
held process to end.

## Slice 3 — An interrupted run names the checks still running

Type: Behavior
Status: planned

Behavior: a run with a substitute check that never ends (after printing a
line) and passing checks → the runner receives TERM, or INT → stderr lists
only the never-ending check with its elapsed time and a bounded tail of its
log (including the printed line), its process group is stopped, and the
runner exits 143 for TERM or 130 for INT. The logs are removed only after the
report. Without an interrupt, a passing run stays silent.

Proof: a runner test using `OPEN_DOUGH_TEST_DIR` substitutes. The never-ending
check signals readiness by an event (for example writing to a FIFO the test
reads), then blocks without a leaked `sleep` (for example reading a FIFO no
one writes). The test starts the runner so that INT is not ignored: a
background async command in a non-interactive Bash starts with INT ignored,
and ignored signals cannot be trapped. Use job control (`set -m`) or an
equivalent in the test, and confirm INT delivery before asserting on it. The
test then sends each signal, and asserts the report, the exit status, and
(via a unique marker in the check's command line) that no process from the
check remains. The existing passing-run silence assertion in
`tests/test-runner-failure-report.sh` stays green.

## Slice 4 — A job that leaves no status is reported as failed

Type: Behavior
Status: planned

Behavior: a substitute check that kills its own job subshell before a status
is written (for example `kill -9 $PPID`), run with `OPEN_DOUGH_TEST_JOBS=2`
beside a passing check → the run finishes → that check is reported as failed
with its log, the passing check stays silent, and `OPEN_DOUGH_TEST_TIMES`
still writes a line for every job.

Proof: a case in the runner failure-report test. Show once, on the current
runner, that the report aborts on the missing status file.

## Slice 5 — The runner requires Bash 5

Type: Behavior
Status: planned

Behavior: Bash 4 first on `PATH` → the runner starts → it refuses before any
check runs, naming the Bash 5 requirement. `tests/README.md` states Bash 5.

Proof: `tests/test-runner-bash.sh` gains a Bash 4 version string that must be
refused; its existing unsupported-Bash and supported-Bash cases stay green.

## Slice 6 — A CI hang fails in 8 minutes and shows the interrupt report

Type: Behavior
Status: planned

Behavior: each job in `.github/workflows/ci.yml` has `timeout-minutes: 8`.
A CI run cancelled while `npm test` is running shows the runner's interrupt
report in the `test` step log.

Proof: the workflow diff; after publication, one `workflow_dispatch` run
cancelled by hand (`gh run cancel`) once the `test` step has started, with the
log lines naming the checks still running recorded here. A missing report
is a slice 3 defect about signal delivery through `npm`, not a reason to
automate this check.

## Preparation review and learnings

- CI observation (Story Branch Mode): GitHub Actions `ci.yml` (`CI`) on
  `refs/heads/claude/104-diagnosable-test-hangs`, with observer
  `/tmp/dough-ci-501/watch-2y8yxI`, attached when slice 1 (`044c88f`) was
  published. No observer covers the Take claim `0dfb471` on trunk.

- Slices 1 and 2 are independent of 3–6 and can run first; slice 1 carries
  the live defect. Slice 6's manual demonstration depends on slice 3.
- Refinement (2026-09-25) split the former slice 4, which combined two
  independent proof loops, into slices 4 and 5. Cumulative design: slices 1
  and 2 apply one teardown rule (reverse order of setup) through one
  mechanism; slices 3 and 4 extend one runner model, in which each job's
  outcome is reported from what the runner observed, without per-case
  recognizers.
- Integration assumption proved in isolation (2026-09-25, GNU bash
  5.3.20, macOS): a script that traps INT and blocks in `read -u` on a FIFO,
  like the runner's slot wait, was started in the background from a harness
  script and sent `kill -INT`. Without `set -m` in the harness it ignored INT
  and kept running. With `set -m` it ran its trap promptly and exited 130.
  Slice 3's test therefore enables job control before starting the runner.
