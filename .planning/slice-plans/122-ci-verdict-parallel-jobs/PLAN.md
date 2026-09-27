# Bring the integrated CI verdict back under 120 s by splitting CI's checks across parallel jobs

## Source

**Identity:** SEED-046#ci-verdict-round-2

[Refined story](../../seeds/SEED-046-test-and-ci-optimization-round-2.md#ci-verdict-round-2),
refined with the maintainer on 2026-09-27. The instruction authorizes
refinement, planning, and plan refinement, not implementation.

## Goal and scope

Every revision published to trunk gets its CI verdict, the whole workflow
finishing, at a median of at most 120 s over at least five runs, with every
check still running on CI as strictly as before. Included: the runner runs
one share of the discovered checks when CI names a split; CI runs the shell
and node checks as two split jobs; the dashboard job finishes within the
target; the time budget applies per split job and only on CI, recalibrated
from split runs.

Excluded: reducing test work, fewer fetches per `execution-start`, tightening
the per-job ceiling, local test speed, larger or paid runners, and the native
result-path diagnosis (SEED-049). No retries, loosened assertions, skips,
longer timeouts, or removed checks.

## Outside-in proof

| Promise | Owning slice and observable proof |
| --- | --- |
| Every discovered check runs in exactly one split job, whatever order discovery returns, with no list to maintain | 1: `tests/test-runner-split.sh`; 3: the union of CI's split `test-times` equals a full run's check list |
| A check failing in a split job fails that job, naming it | 1: runner split check with a failing substitute |
| A local run over budget prints nothing and passes; a CI run over budget fails with the report | 2: `tests/test-runner-budget.sh` |
| CI runs the checks as two split jobs, each keeping its `test-times` | 3: CI run of the slice's revision |
| The dashboard job finishes within the target and still runs every browser test | 4: three CI runs' dashboard job times and executed test count |
| Workflow median at most 120 s over at least five runs; budget recalibrated from them | 5: at least five CI runs of one revision |

Baseline for the target, reused from `main` after SEED-037 (runner class not
recorded): whole-workflow wall 163, 154, 156 s and `Run test` 143, 140, 140,
110 s at `199ae44`, `2b18837`, `15362af`, `bfdf893`; dashboard job 131–137 s;
569.5 job-seconds in `199ae44`'s `test-times`.

## Current decisions and existing solution

- **Existing solutions (PFE).** `scripts/test.sh` is the one scheduler and
  already discovers every shell check, the `node-test-files` globs, and the
  self-installation check; GitHub Actions' matrix already runs `lint` and
  `test` as separate jobs; Playwright has built-in `--shard=i/n` and a
  `workers` setting. Extend the runner's discovery with a split selection and
  add matrix entries; do not add a lister script, a committed check list, or
  a third-party test splitter.
- **Split selection.** `OPEN_DOUGH_TEST_SPLIT=<i>/<n>` (an environment
  variable, like `OPEN_DOUGH_TEST_JOBS`) makes the runner run only share `i`
  of `n`. Unset, it runs every check. A malformed value, or `i` outside
  `1..n`, fails the run naming the value before any check starts.
- **Partition order.** Checks are partitioned from a runner-independent
  order: the `longest-first` names, in file order, then every other label
  sorted bytewise (`LC_ALL=C`), dealt round-robin across the `n` shares.
  `find`'s order follows each file system's directory hashing and can differ
  between runners, so two split jobs partitioning their own discovery order
  could run a check twice or skip it. Round-robin over longest-first-then-
  sorted keeps the known long jobs apart and the shares near equal without
  per-check weights.
- **Budget on CI only.** The runner calls `scripts/test-budget.sh` only when
  `CI=true`; the checker's own exit rule stays. A split job is judged against
  `tests/time-budget` with its own jobs. If SEED-048's plan 120 has landed,
  its "no budget for a focused run" rule stays as it is.
- **Dashboard.** First set Playwright's `workers` to the runner's CPU count
  on CI (default is half). Keep it if three CI runs put the dashboard job at
  or below 105 s with the same executed test count and no failure; otherwise
  use two `--shard` matrix jobs, each keeping its own failure diagnostics
  artifact. A failure at higher parallelism is a stop for diagnosis, not a
  reason to retry or lengthen a timeout.
- **Measurement.** Judge by CI: at least five runs of one revision (reruns
  through `gh run rerun` or `workflow_dispatch` count), median of the run's
  wall time (`run_started_at` to `updated_at`). Record each run's `Run test`
  times per split job and the dashboard job time.
- **SEED-048 ordering.** Plan 120 is queued first and also edits
  `scripts/test.sh` (Git environment, chosen checks) and the tests README.
  Build on whichever has landed. Split selection partitions the checks that
  run would otherwise run, so it composes with named paths without a special
  case.

## Ordered slices

### 1. The runner runs one share of the discovered checks
Type: Behavior
Status: done
Proof: New `tests/test-runner-split.sh` runs the runner over substitute checks
(`OPEN_DOUGH_TEST_DIR`) whose files record their own names, created in an
order that differs from sorted order and including a `longest-first` entry.
Split `1/2` and `2/2` each run a non-empty set; together they run every check
exactly once; the same split always runs the same checks; each split's times
file lists only its own checks; a failing substitute fails its own split,
naming it; `3/2`, `0/2`, and `x` fail naming the value before any check runs.
Unset, every check runs. The full local suite passes.

Accepted proof: `bash tests/test-runner-split.sh` (Bash 5 on `PATH`) passes
silently; its `expect_share` cases pin shares `1/2` = mu, beta, zeta and
`2/2` = alpha, delta over checks created out of sorted order, with each
share's times file, the union, the recreated-order rerun, the failing
`epsilon.sh` split, and the `3/2`, `0/2`, `x` loop. The other runner tests
pass. Full local `npm test`: exit 0, 219 jobs (local budget report still
printed; slice 2 removes it). Over the real suite `scripts/test-jobs.sh`
lists 110 jobs for `1/2` and 109 for `2/2`.

Behavior: A suite with discovered checks → the runner starts with
`OPEN_DOUGH_TEST_SPLIT=i/n` → it runs exactly share `i` of a partition that
does not depend on discovery order, reports failures and times for those
checks only, and every check lands in exactly one share. The tests README
describes the variable next to `OPEN_DOUGH_TEST_JOBS`.

### 2. The time budget is judged only on CI
Type: Behavior
Status: done
Proof: `tests/test-runner-budget.sh` updated: over budget with `CI=true`, the
run exits 1 with exactly the two breach lines, as today; over budget without
`CI=true`, the run exits 0 and prints nothing; within budget on CI it is
silent. The full local suite passes and prints no budget report.

Accepted proof: `tests/test-runner-budget.sh` runs the runner with
`env CI=true` or `env -u CI`: `ci-over` exits 1 with exactly the two breach
lines, `local-over` exits 0 with an empty log (it failed against the previous
runner), `within` on CI is silent; it passes with and without `CI=true`. Full
local `env -u CI npm test`: exit 0, no `OVER BUDGET` output.

Behavior: A run whose job times exceed `tests/time-budget` → the runner
finishes → on CI it fails with the budget report; elsewhere it prints nothing
and its status comes only from the checks. The tests README's budget section
and `scripts/test-budget.sh`'s header say the budget is CI's.

### 3. CI runs the checks as two split jobs
Type: Behavior
Status: done
Proof: CI run of this slice's revision: jobs `lint`, `test (1/2)`, and
`test (2/2)` succeed; artifacts `test-times-1` and `test-times-2` exist; the
union of their check names equals a local full run's times-file names, with
no name in both. Record both `Run test` times and the workflow wall time.
`tests/time-budget` holds provisional values from the existing rule applied
to the expected share (per-job 70 unchanged; total 1.5 × the larger share
of `199ae44`'s 569.5 job-seconds under the partition), with the calibration
source stated in its header.

Accepted proof: CI run 36288480473 of `ceae01c` (slice 3 plus its repair):
`lint`, `test (1/2)`, `test (2/2)`, and `dashboard` succeeded;
`test-times-1` holds 110 jobs (234.0 job-seconds) and `test-times-2` 109
(277.2); their union equals `scripts/test-jobs.sh`'s full 219-job listing with
no name in both. `Run test` 60 s and 70 s; split jobs 80 s and 79 s; dashboard
job 124 s; workflow wall 127 s. Provisional `total-job-seconds=460` (1.5 ×
303.7, the larger share of `199ae44`'s 569.5). The first run (36287963592 of
`a2a3765`) failed: runner checks that start the runner inherited
`OPEN_DOUGH_TEST_SPLIT`; `ceae01c` stops the runner passing it to its jobs.

Behavior: A revision is pushed → CI's workflow runs → the shell and node
checks run as two parallel split jobs, each failing on its own failing check
or its own budget breach, each keeping its `test-times-<i>` artifact; lint is
unchanged. The workflow's job matrix, the tests README's CI paragraph, and
the `longest-first` refresh instructions (download both artifacts, then
merge) describe the split.

### 4. The dashboard job finishes within the target
Type: Behavior
Status: planned
Proof: Three CI runs of the slice's revision: the dashboard job (or each
dashboard shard) finishes at or below 105 s; the executed browser-test count
from the HTML report (summed across shards when sharded) equals
`playwright test --list`'s count for the same revision; no failure. Record
the job times and the option chosen.

Behavior: A revision is pushed → CI's dashboard job(s) run → every browser
test runs and the dashboard no longer sets the verdict, using more workers in
one job or, when that is not enough, two `--shard` jobs, per the current
decision.

### 5. The CI verdict median is at most 120 s and the budget is recalibrated
Type: Behavior
Status: planned
Proof: At least five CI runs of the candidate revision: median workflow wall
time at most 120 s; every run green. Then `tests/time-budget` is set from
those runs' split `test-times` by its rule (1.5 × the largest job and the
largest split total), with the runs named in its header, and the
`longest-first` list refreshed from the merged artifacts; the revision
carrying that edit runs green on CI. Record all run times in this plan.
External-wait exception: the CI runs themselves are the wait.

Behavior: Trunk has the split workflow → a revision is published → its CI
verdict arrives at a median of at most 120 s, and the budget describes the
split jobs it judges.

## Learnings

- Slice 1: job selection (discovery, `longest-first` order, the sorted rest,
  and the split share) now lives in `scripts/test-jobs.sh`, which
  `scripts/test.sh` reads as NUL-separated `<kind>\t<label>` records; the
  runner exceeded the 250-line limit otherwise. Plan 120's chosen-paths work
  belongs there when it rebases. Unsplit runs now also start the non-longest
  checks in sorted order.
- Slice 1: the full local suite failed whenever a developer's
  `npm run dev:dashboard` held port 43127, because
  `tests/support/dashboard-dev-port.test.mjs` bound it. The test now asserts
  the configured port and `strictPort` and serves on an ephemeral port.
- Slice 3: nested runners inherited the split job's `OPEN_DOUGH_TEST_SPLIT`
  and ran only a share of their substitutes; like `OPEN_DOUGH_TEST_TIMES`, the
  runner no longer passes it to its jobs. With the checks split, the dashboard
  job (124 s) sets the verdict.
- `tests/test-runner-interrupt.sh` could print Bash's macOS
  `child setpgid ... Operation not permitted` line from its own `set -m`
  launch and fail inside the runner; the lost-race rule now lives once in
  `scripts/lost-setpgid-race.bash`, used by the runner and that test.
- Slice 4 risk: `freePort()` in `dashboard/tests/support/dashboardServer.ts`
  binds port 0, closes it, and returns the number, so more workers widen an
  existing window for another worker to take that port first.
