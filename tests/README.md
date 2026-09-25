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
list is refreshed (see its header).

A passing job must write nothing, so a passing suite prints nothing. For each
failing job the runner prints `FAIL: <job>` and that job's captured output. A
job that exits 0 but wrote anything to stdout or stderr also fails the run,
reported as `FAIL: <job> (passed but printed output)` with that output.
Silence such output at its source (for example `grep -q`, or a quiet flag or
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
`GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 npm test`.

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
