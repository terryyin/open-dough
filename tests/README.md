# Tests

Run every check through the runner. `npm test` (or `bash scripts/test.sh`)
runs the whole suite; naming paths runs exactly those shell checks (`.sh`) or
`node --test` files (`.mjs`, `.js`):

```sh
npm test -- tests/payload-declaration-links.sh \
  tests/support/dashboard-dev-port.test.mjs
bash scripts/test.sh tests/payload-declaration-links.sh
```

A relative path is resolved from the directory `scripts/test.sh` starts in;
`npm test` starts it at the repository root. A path that is not a file, or not
one of those kinds, fails the run naming it before any check starts.

## Check environment

The runner gives every check, in the whole suite or a chosen run alike, the
environment in `scripts/test-environment.bash`, before any check starts:

- **Bash 5 or newer, first on `PATH`.** macOS's Bash 3.2 can silently ignore
  failing `[[ ... ]]` assertions under `set -e`, and the runner times checks
  with Bash 5's `EPOCHREALTIME`. Checks launch `bash` through `PATH`, so the
  runner refuses an older `bash` there even when a newer one started it; put a
  current Bash's bin directory first, for example
  `PATH="/path/to/current-bash/bin:$PATH" npm test`. This is a contributor
  requirement; the product installer still supports Bash 3.2.
- **CI's Git state.** No global, system, or inherited configuration or
  identity variables; automatic maintenance off, so no detached repack
  rewrites `.git/objects` while a check snapshots or removes a fixture (a push
  over Git's local transport drops these settings, so a fixture that copies a
  pushed-to bare remote turns maintenance off in that remote's own config); no
  identity or default branch, so a commit fails unless the check sets one (a
  shell fixture gets it from `tests/helpers/release-fixture.bash`'s
  `configure_fixture_git`).
- **Chosen checks follow the same rules**, silence included, but are not held
  to the time budget (`tests/test-runner-selection.sh` proves a chosen run).

Running a check directly (`bash tests/<name>.sh`, `node --test <file>`) is
unsupported, except for a check's own options, which the runner never passes:
invoke the native ADR-awareness wrappers (manually triggered paid runs and
inventories, described with their proof scripts in
`tests/native-adr-awareness-wrappers.md`) or the
[native publication checks](native-publication.md) directly, with Bash 5 first on
`PATH`, outside the runner's Git state. CI's Bash can be older than a local
one and behave differently inside traps (before Bash 5.3 a bare `return` in a
function called from a trap takes the interrupted command's status).

### Reproducing CI's platform

When a check fails only on CI, or a runner or trap change needs CI's Bash and
Git, check it on CI's platform:

```sh
scripts/ci-container.sh tests/test-runner-bash.sh   # chosen checks
scripts/ci-container.sh                             # the whole suite
scripts/ci-container.sh --dashboard                 # the dashboard job
```

It is for diagnosis only: neither `npm test` nor CI uses it, and ordinary runs
stay native. It needs `docker` on `PATH` (for example Colima on macOS) with a
reachable daemon, and otherwise stops naming the unavailable runtime before
any image work. On first use it builds a cached image from CI's Ubuntu with
Git from the `git-core` PPA, `jq`, CI's Node, and the locked Playwright
Chromium with its system dependencies. The script states the Ubuntu and Node
versions and the dashboard job's commands once, and `tests/ci-container.sh`
checks them against `.github/workflows/ci.yml`. The image tag follows the
build recipe, so a new Ubuntu, Node, or Playwright version builds a new image;
Git and Node releases are fixed at build. A rebuild reuses Docker's build
cache, which cannot be pruned per image, so to refresh them remove the image
and prune all of Docker's build cache, every project's; the next run rebuilds:

```sh
docker image rm $(docker image ls -q open-dough-ci) && docker builder prune
```

Each run mounts the checkout, and a linked worktree's common Git directory, at
their host paths, keeps `node_modules` in a container volume so host modules
are neither used nor overwritten, runs `npm ci`, prints the Git and Node
versions, and then runs `scripts/test.sh` with the given paths, or the
dashboard job's commands unsharded with `CI=true` (so Playwright's
`forbidOnly` and HTML report apply). `scripts/test.sh` runs with `CI` unset,
as on any local run. A path or caller directory outside the checkout is
refused by name. It runs as the host user with a container-local `HOME`, so
files it writes in the checkout stay yours. The image uses the host's native
architecture, which may differ from CI's x86_64.

Font-dependent layout is not reproduced: with `15362af`'s layout fix reverted,
CI failed two 320 CSS pixel checks by a fraction of a pixel (`toBeInViewport`
ratios of 0.99) that `--dashboard` passed on an aarch64 host, and the image
run as `linux/amd64` under QEMU crashed Chromium. For such a failure, CI's
retained trace (`dashboard-playwright-diagnostics`) is the evidence.

## Runner

The runner is the suite's one scheduler. Its jobs are each `tests/*.sh`
outside `tests/support/`, plus each `node --test` file matched by a glob in
`tests/node-test-files` (relative to the repository root), such as the suites
beside a skill's scripts under `src/skills/`. A new `*.test.mjs` under a
listed glob runs without further wiring. Each node file runs alone through
`tests/support/node-test-failures-reporter.mjs`: silent when every test passes
silently, it shows each failing test's name, location, error, and its file's
output, and a passing file's output under `output from passing <file>:`. No
job starts a worker pool of its own.
`OPEN_DOUGH_TEST_DIR` names another directory of checks, with its own optional
`node-test-files`, `longest-first`, and `time-budget`, to run instead of the
suite's own, which is how `tests/test-runner-failure-report.sh` runs
substitute checks. Chosen paths replace that discovery.

The runner runs one job per online CPU at a time; each job keeps its own
temporary directory. `OPEN_DOUGH_TEST_JOBS` selects another count, 1 or more.
Jobs named in `tests/longest-first` start first, in that order, so the longest
job does not start last; the rest follow, sorted bytewise.
`OPEN_DOUGH_TEST_SPLIT=<i>/<n>` runs only share `i` of `n`: the runner deals
that order round-robin across `n` shares, so every job lands in exactly one
share whatever order the file system lists the tests in, and a failure or time
is reported only for the share's own jobs. A malformed value, or `i` outside
`1..n`, fails the run naming the value before any job starts. Unset, every job
runs. `OPEN_DOUGH_TEST_TIMES=<file>` writes every job's wall seconds and name,
longest first, which is how that list is refreshed (see its header). Every
`OPEN_DOUGH_TEST_*` setting stays with the runner that was given it, so a check
that runs the runner itself gives it only the settings it chooses, runs all of
its own checks, and keeps its own times. CI runs the suite as split jobs, each with
`OPEN_DOUGH_TEST_SPLIT` set to its share; each fails on its own share's
failures or budget breach and keeps its times for seven days as workflow
artifact `test-times-<i>`.

The suite's time budget lives in `tests/time-budget`: a per-job ceiling
(`per-job-seconds`) and a total ceiling over one run's jobs
(`total-job-seconds`), set from CI's `test-times-<i>` with headroom. The
ceilings are calibrated to CI's runner, so only after a CI run (`CI=true`) of
the whole suite or a split share does the runner compare that run's job times
with them (`scripts/test-budget.sh`); elsewhere it prints no budget report and
the exit status comes only from the checks. Within budget it prints nothing. A
breach fails the run and prints, after any failure reports, one line per job
over the per-job ceiling and one for a total over the total ceiling:

```text
OVER BUDGET: tests/install.sh took 78.4s; the per-job ceiling is <per-job-seconds>s (tests/time-budget).
OVER BUDGET: all jobs took 482.4 job-seconds; the total ceiling is <total-job-seconds> (tests/time-budget).
```

Fix the slow job rather than the number: raising a ceiling is an explicit,
reviewed edit of `tests/time-budget`. `tests/test-runner-budget.sh` proves
the budget with a substitute directory.

A passing job must write nothing, so a passing suite prints nothing. For each
failing job the runner prints `FAIL: <job>` and that job's captured output. A
shell check that stopped on a failing command under `set -e` has, in that
output, `stopped at <file>:<line>: <command>`, naming the check or the support
file it sourced; a failure inside `$(...)` is named by the substitution's line
(`stopped at tests/x.sh:12: attempt=$(awk ...)`), and one inside a `( ... )`
subshell both at that command and at the subshell's line. The runner loads
`tests/support/check-stop-report.bash` into each shell check through
`BASH_ENV`, so no check carries a trap of its own. A failure the check handles
(under `set +e`, in an `if`, after `||`), a check's own `exit 1`, and scripts a
check launches get no such line. A job that exits 0 but wrote to stdout or
stderr fails as `FAIL: <job> (passed but printed output)`, and one whose shell
ends without recording an exit status (for example, killed) as
`FAIL: <job> (ended without recording an exit status)`, each with its output;
the run still finishes. Silence output at its source (`grep -q`, a quiet flag)
rather than filtering it.

Each job runs in a process group of its own, so a terminal's Ctrl-C reaches
the runner rather than the jobs. On INT or TERM the runner stops each running
job's process group and prints, for it and for any job the same signal ended,
`INTERRUPTED: <job> (after <seconds>s)` and the last lines of its output; it
then exits 130 for INT or 143 for TERM (`tests/test-runner-interrupt.sh`).
Workers a check detaches from its process group are that check's own
teardown. `npm test` execs the runner (`package.json`) and CI's test step
execs `npm`, so a signal sent only to the step's top process, as a cancelled
Actions run does, still reaches the runner (see that step's comment in
`.github/workflows/ci.yml`).

## Waits, fixtures, and teardown

Tests wait for an observable event, never for elapsed wall time. Shell checks
use `wait_for` or `poll_until` from `tests/helpers/wait-for.bash`; a missed
event fails naming what it awaited. A wait for a signal from a started process
lasts while that process lives and fails, naming its exit, if it ends first
(`src/skills/dough-execute-plan/scripts/process-lifetime-test-fixtures.mjs`).
File timestamps that must differ are set explicitly, and the dashboard's timed
journeys step a paused page clock.

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

- `deferWorkerStop` requests an in-process mailbox worker's stop, awaiting it;
- `deferChildExit` signals a test's own child process and awaits its exit;
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

A dashboard journey hands its scratch repositories to the `afterGitHubStops`
fixture (`dashboard/tests/dashboardTest.ts`), which removes them only after
the page, its dashboard server, and the fake GitHub have stopped, so a read
still in flight when the journey ends never finds its repository gone.

Fixture snapshots prune `.git` rather than walking it. A payload-update check
builds its older and newer tagged releases with `build_upgrade_releases` from
`tests/helpers/release-fixture.bash`, withholding the older release's
declarations and sources instead of editing a copied installer by hand.

## Shared installation and update protections

Every declared payload file is protected by the same installer and updater
walk, so each shared protection has one owning check, and a payload-update
check proves only what its own payload adds:

| Protection | Owning check |
| --- | --- |
| Ordinary update refuses an edited or missing managed file without writes | `tests/update-refuses-unverifiable.sh` |
| Repeat install refuses an edited or removed managed file without writes | `tests/install.sh` |
| `--force` restores an edited or incomplete installation | `tests/update-force-restores-latest.sh` |
| Ordinary update refuses an unrelated file at a newly managed path | `tests/story-payload-update.sh` |
| Linked supporting files are declared | `tests/payload-declaration-links.sh` |

`tests/payload-declaration-links.sh` reads `install.sh`'s `managed_files`
without running the installer and fails naming each relative link, in a
declared Markdown file, to an undeclared file. A new payload file needs a
declaration, not another copy of these proofs.

## Installation and update coverage gaps

The installer and updater checks prove each promise once at its boundary: the
codex and cursor hints share the `.agents` entry root, so one represents both,
and each shared protection above is proved once by its owning check, also in
the sibling `.claude` root. No check yet observes these promises:

- refusing a requested version (`--version`, `--tag`, or `v1.2.3`) instead of
  installing the latest numeric release;
- `apply` with an unsupported platform (only `install.sh` is checked);
- updating a Claude-only installation from the Claude entry, which must create
  the shared `.agents` root;
- installing without Node (the `cp`/`cmp` fallback and the hook-registration
  refusal).
