# Keep the split test runner and CI's split in one place each

## Source

**Identity:** SEED-046#ci-verdict-correction

[Correction story](../../seeds/SEED-046-test-and-ci-optimization-round-2.md#ci-verdict-correction),
from the execution retrospective of plan 122
(`SEED-046#ci-verdict-round-2`, recoverable at
`c9585be:.planning/seeds/SEED-046-test-and-ci-optimization-round-2.md`, and
plan 122 at `c9585be:.planning/slice-plans/122-ci-verdict-parallel-jobs/PLAN.md`). Reviewed commits, all on
`claude/122-ci-verdict-parallel-jobs` after its Take `3e611d2`: `a034dfd`
through `bbc1b8f`. Every promise of the reviewed story was met (CI verdict
median 98 s over five runs of `37679c6`; `bbc1b8f` green in 92 s); the findings
below are structural residue, verified against `bbc1b8f`.

## Goal and scope

Leave each runner, budget, and split fact with one owner, so recalibrating the
budget, changing the split count, or moving a runner file edits one place, and
the contributor documentation stays accurate. No product, CI verdict, or test
behavior changes.

Preserved promises and constraints (from the reviewed story):

- Every discovered check still runs in exactly one CI split job, with no
  hand-maintained list; a local `npm test` runs every check.
- The time budget still fails a CI split job on a breach and is silent and
  never judged in a local run.
- No retries, skips, loosened assertions, or longer timeouts; no check is
  removed or merged away.
- CI job names stay `lint`, `test (1/2)`, `test (2/2)`, `dashboard (1/2)`, and
  `dashboard (2/2)`, since required-check settings may match them; each split
  job keeps its `test-times-<i>` artifact and each shard its Playwright report.

Excluded (separate product advice from the same retrospective, not this
correction): the dashboard `freePort()` bind-then-close race; unbalanced
round-robin shares; narrowing `tests/payload-declaration-links-suite-failure.sh`
(needs the maintainer's coverage-map approval).

## Current findings

1. **"The budget is CI's" has two homes.** `scripts/test.sh` (line 214) calls
   `scripts/test-budget.sh` only when `CI=true`, while `scripts/test-budget.sh`
   (line 50 `|| [[ ${CI:-} != true ]]`, header lines 11–12) keeps its own
   non-CI exit-0 rule that no caller reaches and no test proves. Plan 122
   deliberately kept it ("the checker's own exit rule stays"); this correction
   reverses that plan decision, not a story promise.
2. **The runner's file set is copied by hand twice.**
   `tests/test-runner-bash.sh` (lines 14–15) and
   `tests/payload-declaration-links-suite-failure.sh` (lines 13–14) each copy
   `scripts/test.sh`, `scripts/test-jobs.sh`, and
   `scripts/lost-setpgid-race.bash`; adding a runner file is a shotgun edit.
3. **The split count 2 is repeated.** `.github/workflows/ci.yml` carries it in
   each test entry's `name`, `share`, and `split` (`share` repeats `split`'s
   numerator), and in the dashboard's `name` and `--shard`; the
   `tests/time-budget` header names `test (<i>/2)`; `tests/README.md` names
   `test (1/2)`, `test (2/2)`, `test-times-1`, and `test-times-2`; the
   `tests/longest-first` header hard-codes two downloads and `[12]`.
4. **The tests README's budget example repeats the live ceilings** (lines
   61–62: `71s`, `470`), so each recalibration also edits the README.
5. **The test directory default is resolved twice**: `scripts/test.sh`
   (line 213, `${OPEN_DOUGH_TEST_DIR:-tests}`) and `scripts/test-jobs.sh`
   (line 22), which also reads the variable's absence (line 50) to add the
   self-installation check.
6. **The installation guide's contributor checks are stale.**
   `docs/installation-platforms-and-update-safety.md` ("Contributor checks")
   says the runner "discovers all `.sh` files under `tests/`" (it also runs
   `node-test-files` globs and the self-installation check) and that CI "runs
   `npm run lint` and `npm test` independently" (CI now runs `lint`, split test
   jobs, and dashboard shard jobs).

## Outside-in proof

| Correction outcome | Owning slice and observable proof |
| --- | --- |
| The runner alone owns the CI gate; the checker fails on any breach | 1: `tests/test-runner-budget.sh` also runs `scripts/test-budget.sh` directly with `CI` unset over a breaching times file: exit 1 with both breach lines; its runner cases (CI breach fails, local breach silent and passing, within budget silent) unchanged |
| One helper copies the runner; one resolution of the test directory | 1: `tests/test-runner-*.sh` and `tests/payload-declaration-links-suite-failure.sh` green under Bash 5; full local `npm test` green and silent |
| Split count stated once per matrix; job names and artifacts unchanged | 2: one CI run of the slice's revision shows exactly `lint`, `test (1/2)`, `test (2/2)`, `dashboard (1/2)`, `dashboard (2/2)` green, with `test-times-1`, `test-times-2`, and both Playwright reports; the two `test-times` files together list every job of a local `bash scripts/test-jobs.sh` once |
| Documentation describes the split generically and accurately | 2: no hard-coded split count or live ceiling remains in `tests/README.md`, `tests/time-budget`, or `tests/longest-first` headers; the refresh commands in `tests/longest-first` work against that CI run; `npm run lint` green |

## Current decisions

- **Budget gate.** `scripts/test.sh` keeps the only `CI=true` rule;
  `scripts/test-budget.sh` exits 1 on any breach wherever it runs, and its
  header says so. `tests/test-runner-budget.sh` gains the direct-checker case.
- **Runner copy.** A `tests/helpers/` Bash helper (sourced like
  `expect-in-log.bash`) copies the runner's files into a fixture's `scripts/`;
  both fixtures use it. `tests/test-runner-interrupt.sh` keeps sourcing
  `lost-setpgid-race.bash` directly (it uses, not copies, it).
- **Test directory.** `scripts/test.sh` resolves the directory once and hands
  it to `scripts/test-jobs.sh` (its only caller); `test-jobs.sh` adds the
  self-installation check when that directory is the suite's own `tests`.
  Execution may choose the hand-over mechanism; no second default remains.
- **Split count.** Each split matrix lists only its shares, and names, the
  split value, the shard, and the artifact derive the count from the matrix
  (preferred: `strategy.job-total`, available in `jobs.<id>.name` and steps).
  Because `lint` in the same matrix would count toward `job-total`, `lint`
  becomes its own job with its own setup steps, as `dashboard` already has.
  Job names stay as listed above. If Actions rejects the derivation, stop and
  report rather than restating the count.
- **Docs.** Say "split jobs" and `test-times-<i>` generically; the
  `longest-first` refresh downloads every split artifact with one pattern
  (for example `gh run download RUN_ID -p 'test-times-*' -D /tmp/times` then
  `sort -rn /tmp/times/*/test-times.txt`). The README's budget example uses
  placeholders or points at `tests/time-budget` rather than live numbers. The
  installation guide's contributor checks describe discovery and CI's jobs
  accurately without restating counts.

## Ordered slices

### 1. The runner alone owns its budget gate, its files, and its test directory
Type: Structure
Status: planned
Proof: `PATH=/opt/homebrew/bin:$PATH bash tests/test-runner-budget.sh` shows
the direct checker, with `CI` unset, exits 1 printing both `OVER BUDGET` lines,
while the runner's CI-breach, local-breach, and within-budget cases keep their
outcomes. `tests/test-runner-bash.sh`, `tests/test-runner-split.sh`,
`tests/test-runner-failure-report.sh`, `tests/test-runner-interrupt.sh`, and
`tests/payload-declaration-links-suite-failure.sh` green under Bash 5 first on
`PATH`; `npm run lint` green; full local `npm test` green and silent (the
self-installation check still runs in the suite's own run and not in a
substitute directory's).

Correction: removes findings 1, 2, and 5 — the checker's unreachable non-CI
exit rule, the hand-copied runner file set, and the duplicated test directory
default — with no change to what `npm test` or a CI split job runs or reports.

### 2. CI states its split once and the docs describe it generically
Type: Structure
Status: planned
Proof: one CI run of the slice's revision: jobs exactly `lint`, `test (1/2)`,
`test (2/2)`, `dashboard (1/2)`, `dashboard (2/2)`, all green; artifacts
`test-times-1`, `test-times-2`, and both shards' Playwright reports present;
downloading with the `tests/longest-first` header's commands yields both
`test-times` files, whose job names together equal a local
`bash scripts/test-jobs.sh` listing, each once. `npm run lint` green. A search
of `tests/README.md`, `tests/time-budget`, `tests/longest-first`, and the
installation guide's contributor checks finds no hard-coded split count or
live budget ceiling, and the guide names node checks, the self-installation
check, and CI's split and dashboard jobs.

Correction: removes findings 3, 4, and 6 — the repeated split count, the
README's copy of the live ceilings, and the stale contributor-checks text —
with CI's job names, artifacts, and verdict unchanged.

## Learnings

None yet.
