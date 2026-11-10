# Runner settings

How `scripts/test.sh` ([the runner](README.md#runner)) is tuned and what it
can write besides its report.

The runner runs four jobs at a time locally and one per online CPU in CI; each
job keeps its own temporary directory. `OPEN_DOUGH_TEST_JOBS` selects another
count, 1 or more.
Jobs start in the order `scripts/test-shares.mjs` deals them from the CI
seconds recorded in `tests/longest-first`, longest recorded first;
`OPEN_DOUGH_TEST_SPLIT=<i>/<n>` runs only share `i` of `n` of that deal, and
`OPEN_DOUGH_TEST_TIMES=<file>` writes every job's wall seconds and name,
longest first. `OPEN_DOUGH_TEST_OUTCOMES=<file>` writes each job's outcome
(`failed` when reported as failing, else `passed`) and name, tab-separated,
for CI's proof fragments, which count each line as one test file
(`ci-proof` in `.github/workflows/ci.yml`).
`OPEN_DOUGH_TEST_SLOT_GATE=<file>` receives the number of jobs started each
time the runner finds every slot occupied with a job still queued, so a check
can observe the runner holding queued work.
`OPEN_DOUGH_TEST_ADMISSION_GATE=<file>` receives each changed admission record
id of the live owner, outside the run's ancestry, that keeps a full local run
waiting for [shared admission](local-test-resources.md). Each whole-file
replacement lets a check identify the current blocking owner, including a
successor to an earlier observed owner.
Each scheduled job also carries a fixed 180-second wall-clock safety deadline
from its start; see [the runner](README.md#runner). That limit stops hung work
and frees admission when a whole run ends; it is separate from the normalized
performance budgets in [time-budget.md](time-budget.md).
`OPEN_DOUGH_TEST_JOB_DEADLINE_READY=<file>` receives each armed job's index,
wait-FIFO path, and the 180-second allowance so a check can expire the wait
without wall-clock delay; the same line is appended to `<file>.log` for every
arming. `OPEN_DOUGH_TEST_DISABLE_JOB_DEADLINE=1` skips arming for
discriminating proof only. Every
`OPEN_DOUGH_TEST_*` setting stays with the runner that was given it, so a
check that runs the runner itself gives it only the settings it chooses, runs
all of its own checks, and keeps its own times. CI's shares, the deal and the
preview to run before a push that adds, removes or renames a test file are in
[test-shares.md](test-shares.md).
