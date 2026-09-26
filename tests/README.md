# Tests

Shell tests require **Bash 5 or newer**, with that `bash` first on `PATH`.
macOS's bundled Bash 3.2 can silently ignore failing `[[ ... ]]` assertions
under `set -e`, and the runner times each check with `EPOCHREALTIME`, which
Bash 5 introduced. `npm test` (or `bash scripts/test.sh`) therefore checks the
resolved child Bash before running any checks and refuses unsupported versions.
Launching the runner with an explicit newer Bash path alone is insufficient:
the tests also launch `bash` through `PATH`.

Install a current Bash using your preferred package manager, then use its bin
directory for both the full suite and direct focused tests, for example:

```sh
PATH="/path/to/current-bash/bin:$PATH" npm test
PATH="/path/to/current-bash/bin:$PATH" bash tests/story-payload-assertions.sh
```

Direct test scripts rely on this prerequisite; the version guard lives in the
suite runner. This is a contributor test requirement; the product installer
continues to support Bash 3.2.

The runner is the suite's one scheduler. Its jobs are each `tests/*.sh` outside
`tests/support/`, plus each `node --test` file matched by a glob in
`tests/node-test-files` (relative to the repository root), such as the suites
beside a skill's scripts under `src/skills/`. A new `*.test.mjs` under a listed
glob runs without further wiring. Each node file runs alone through
`tests/support/node-test-failures-reporter.mjs`, which prints nothing when
every test passes silently. It shows each failing test's name, location,
error, and its file's captured output, and any output a passing file wrote,
under `output from passing <file>:`. No job starts a worker pool of its own.

The runner runs one job per online CPU at a time; each job keeps its own
temporary directory. `OPEN_DOUGH_TEST_JOBS` selects another count, 1 or more.
Jobs named in `tests/longest-first` start first, in that order, so the longest
job does not start last; the rest follow. `OPEN_DOUGH_TEST_TIMES=<file>`
writes every job's wall seconds and name, longest first, which is how that
list is refreshed (see its header). CI's `test` check keeps that file for
seven days as its `test-times` workflow artifact.

The suite's time budget lives in `tests/time-budget`: two numbers, a per-job
ceiling (`per-job-seconds`) and a total ceiling over all jobs
(`total-job-seconds`), set from CI's `test-times` with headroom. After every
run the runner compares the same job times with it (`scripts/test-budget.sh`).
Within budget it prints nothing. A breach prints, after any failure reports,
one line per job over the per-job ceiling and one for a total over the total
ceiling, for example:

```text
OVER BUDGET: tests/install.sh took 31.2s; the per-job ceiling is 25s (tests/time-budget).
OVER BUDGET: all jobs took 802.4 job-seconds; the total ceiling is 760 (tests/time-budget).
```

In CI (`CI=true`) a breach fails the `test` check; elsewhere it is only
reported and the run's exit status is unchanged. The ceilings are calibrated
to CI's runner, so a local run on a slower or loaded machine will usually
print the report while still passing; only CI enforces the budget. Fix the slow job rather than the number: raising a
ceiling is an explicit edit of `tests/time-budget`, reviewed like any other
change. A substitute test directory (`OPEN_DOUGH_TEST_DIR`) is held to its own
`time-budget` if it has one; `tests/test-runner-budget.sh` proves the
behavior that way.

A passing job must write nothing, so a passing suite prints nothing. For each
failing job the runner prints `FAIL: <job>` and that job's captured output. A
job that exits 0 but wrote anything to stdout or stderr also fails the run,
reported as `FAIL: <job> (passed but printed output)` with that output. A job
whose shell ends without recording an exit status (for example because it was
killed) is reported as `FAIL: <job> (ended without recording an exit status)`
with its output, and the run still finishes. Silence such output at its source (for example `grep -q`, or a quiet flag or
setting on the noisy command) rather than filtering it. `OPEN_DOUGH_TEST_DIR`
names another directory of checks, with its own optional `node-test-files` and
`longest-first`, to run instead of the suite's own, which is how
`tests/test-runner-failure-report.sh` runs substitute checks. To run one node
suite directly, pass its files to `node --test`, optionally with that
reporter.

Each job runs in a process group of its own, so a terminal's Ctrl-C reaches
the runner rather than the jobs. On INT or TERM the runner stops the process
group of each job still running and prints, for it and for any job the same
signal ended, `INTERRUPTED: <job> (after <seconds>s)` and the last lines of its
output; it then exits 130 for INT or 143 for TERM. Workers a check detaches
from its process group are that check's own teardown.
`tests/test-runner-interrupt.sh` proves this with substitute checks.
`npm test` execs the runner (`package.json`), and CI's check step execs `npm`,
so a signal sent only to the step's top process, as a cancelled Actions run
does, still reaches the runner (see that step's comment in
`.github/workflows/ci.yml`).

Tests wait for an observable event, never for elapsed wall time. Shell checks
use `wait_for` or `poll_until` from `tests/helpers/wait-for.bash`; a missed
event fails naming what it awaited. A wait for a signal from a started process
lasts while that process lives and fails, naming its exit, if it ends first
(`src/skills/dough-execute-plan/scripts/process-lifetime-test-fixtures.mjs`).
File timestamps that must differ are set explicitly, and the dashboard's timed
journeys step a paused page clock. CI's Git has no global or system
configuration, so a local run can hide output CI would fail on (such as Git's
default-branch hint); check with
`GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 npm test`. CI's Bash can
be older than a local Homebrew Bash and behave differently inside traps (for
example, before Bash 5.3 a bare `return` in a function called from a trap takes
the interrupted command's status); check runner and trap changes in a Linux
container such as `ubuntu:24.04`.

A test stops or releases what it started before removing the fixture those
things run from. `node:test` runs `t.after` hooks in registration order, so a
fixture builds its cleanup with `fixtureTeardown(...roots)`
(`src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs`):
register its `cleanup` with `t.after` when the fixture is created, and pass
each stop or release step to its `defer` as soon as the process starts, before
any further setup or assertion. The steps run in reverse order, every root is
removed, and then a failing step fails the test; no stop swallows its failure.
A shared fixture that starts something owns this teardown and hands it to
its callers. The steps are:

- `deferWorkerStop` requests an in-process mailbox worker's stop and awaits
  it;
- `deferChildExit` signals one of the test's own child processes and awaits
  its exit;
- `deferObserverStop` (`watch-ci-test-fixtures.mjs`) runs a CI observer's real
  `stop`, skipped when its worker is already dead, and asserts that the
  recorded worker exited;
- `endProcess` (`process-lifetime-test-fixtures.mjs`) ends a recorded process
  that is not the test's child, only while its command still matches.

An inline stop a test asserts on stays inline; the deferred step then finds
it already ended. A leak usually appears only when the worker is blocked (for
example in `gh`) or its stop fails, so failing-path checks create that
condition. Observer stream processes retitle themselves `dough-ci:<hash>`, so
a process sweep for leftovers matches that title as well as `ci-mailbox.mjs`.

A shell Git fixture repository is configured with `configure_fixture_git`
(`tests/helpers/release-fixture.bash`), which also turns off Git's automatic
maintenance so no detached repack is still writing when the fixture is removed.

The native ADR-awareness check wrappers and their focused proof scripts are
described in `tests/native-adr-awareness-wrappers.md`.

## Installed story dependency checks

`bash tests/story-payload-update.sh` checks links in installed story guidance
as part of its installation/update scenarios. A missing target fails explicitly
and reports the referring installed file and unresolved target, including on
macOS's bundled Bash 3.2 without an interpreter upgrade.

`bash tests/story-payload-assertions.sh` exercises a deliberately missing
installed dependency and a valid payload in disposable fixtures. It checks the
real dependency checker and propagation through `scripts/test.sh`. This is
focused coverage of that check, not certification of every shell assertion.

## Installation and update coverage gaps

The installer and updater checks prove each promise once at its boundary:
the codex and cursor hints share the `.agents` entry root, so one of them
represents both, and `tests/story-payload-update.sh` alone proves that an
edited or removed managed file in the sibling root is refused and restored by
`--force`. No check yet observes these installation and update promises:

- refusing a requested version (`--version`, `--tag`, or `v1.2.3`) instead of
  installing the latest numeric release;
- `apply` with an unsupported platform (only `install.sh` is checked);
- updating a Claude-only installation from the Claude entry, which must create
  the shared `.agents` root;
- installing without Node (the `cp`/`cmp` fallback and the hook-registration
  refusal).
