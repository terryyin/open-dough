# Local full-suite resource use

Only one full repository or dashboard suite runs at a time across this
repository's linked Git worktrees. `npm test` / `bash scripts/test.sh` with no
paths against this checkout's own suite directory and unfiltered dashboard runs
share admission, including direct Playwright commands using
`dashboard/playwright.config.ts`. The next full run waits before starting its
jobs or dashboard build. Named checks, dashboard path/grep/project/shard/
test-list selections, list-only runs, explicit suite shares, and pathless
runner fixtures whose `OPEN_DOUGH_TEST_DIR` is an outside-checkout substitute
checks directory remain independent. Independent repositories and copied
non-Git runner fixtures do not share admission.
A full run's shell wall time therefore includes any wait for admission; time
it from the runner's own reported duration when comparing runs.

Local defaults are four repository jobs and two dashboard workers, conservative
starting values for a shared development machine. Override them explicitly with
`OPEN_DOUGH_TEST_JOBS=6 npm test` or
`npm run test:dashboard -- --workers=4`. Worker overrides alone still select a
full suite. CI keeps its existing CPU-derived concurrency and takes no admission.
These bounds control peak concurrency; no elapsed-time improvement is claimed.

Admission lives in the common Git directory as the private
`refs/dough/local-test-suite` ref, outside branches and ordinary pushes. Nested
suite fixtures that still use an in-checkout test directory reuse a live
ancestor's admission; nested pathless runs over an outside-checkout substitute
directory neither take nor release that admission. Success, failure, signals,
and a per-job safety-deadline timeout that ends the whole run all release it
through the existing admission owner, so a hung check cannot hold every
worktree's suite queue indefinitely. After an abrupt owner death the next run
atomically takes over and retires surviving marked processes before it starts.
No manual lock cleanup is needed. Copied runner fixtures outside Git have no
cross-worktree admission.

## Machine sleep on macOS

Start every long run from a fully awake machine. On AC power, wrap a full run
in `caffeinate -s -i`, for example `caffeinate -s -i npm test` or
`caffeinate -s -i npm run test:dashboard`. `-s` prevents system sleep and is
honored only on AC. `-i` alone prevents idle sleep from a fully awake machine
but has no effect once the machine is in its sleep/dark-wake cycle; two whole
dashboard runs under `-i` failed that way on 2026-11-03
([DD-412](../docs/maintainer/project-test-findings.md#dd-412)). On battery
`-s` is inert: plug in, or start fully awake with the lid open under
`caffeinate -i` and read the sleep log afterwards. Whether `-s` keeps a run
going once the machine is already in its sleep cycle is not yet observed.

When a full run fails with worker or command timeouts, or with scattered
failures a rerun does not repeat, read the sleep log before reading the
failures as defects:

```sh
pmset -g log | grep -E 'Entering Sleep|Wake from'
```

Look for `Sleep` and `Wake` entries inside the run's window: its start time
plus the runner-reported duration. For the dashboard suite the start time is
the `dashboard/test-results/<stamp>` directory name: an ISO UTC time with
colons written as `-`, then the runner's pid; the log prints local time. The
log reaches back about a week, so read it soon.

A sleep in the window explains a failure but changes no verdict: record the
run as invalid for sleep and rerun under the guard. The
[failing and flaky test policy](../AGENTS.md#failing-and-flaky-tests) applies
to the rerun as written, and no test is excused. No sleep in the window
excludes sleep; continue under the ordinary policy, for example by classifying
external load.
