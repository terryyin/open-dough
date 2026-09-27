# Keep the test runner's own settings from reaching the checks it starts

## Source

**Identity:** SEED-051#isolate-runner-settings

[Story](../../seeds/SEED-051-isolate-test-runner-settings.md#isolate-runner-settings),
refined 2026-09-27. Finding DD-114, split occurrence (plan 122, repair
`ceae01c`).

## Goal and scope

No `OPEN_DOUGH_TEST_*` variable given to `scripts/test.sh` reaches a job it
starts. One rule removes the whole prefix, replacing the per-setting unsets of
`OPEN_DOUGH_TEST_TIMES` and `OPEN_DOUGH_TEST_SPLIT`; `OPEN_DOUGH_TEST_JOBS` and
`OPEN_DOUGH_TEST_DIR` stop passing through too. A check that starts the runner
passes the settings it wants explicitly, as the runner's own checks already do.

Excluded: the environment every check deliberately shares (`GIT_CONFIG_*`,
`CI`, `BASH_ENV`); product code inheriting that shared environment (the plan
120 occurrence, repaired by `23a3a759`); any registry or lint of settings; CI
jobs; shipped product or installer behavior.

## Decisive premises

| Premise | Observation (2026-09-27, `1917bfda`) | Result |
| --- | --- | --- |
| The runner reads every setting it uses before starting a job | `scripts/test.sh` reads `JOBS` and `TIMES` at startup and hands `DIR` to `scripts/test-jobs.sh` as a command prefix; `test-jobs.sh` reads `SPLIT` inherited, and the runner already unsets it right after that listing, before the launch loop | Holds: one prefix-wide unset at that same point loses nothing |
| No check relies on inheriting a runner setting from the caller | Every `OPEN_DOUGH_TEST_*` user outside the runner either sets it for a runner it starts (`tests/test-runner-*.sh`) or exports it itself for its own children (`OPEN_DOUGH_TEST_FIXTURE_CACHE` in `tests/native-*.sh` via `tests/helpers/fixture-cache.bash`) | Holds |
| A proof point for "what a job inherits" already exists | `tests/test-runner-split.sh`'s substitute checks fail if they inherited `OPEN_DOUGH_TEST_SPLIT`; its `run_split` already gives the runner `SPLIT`, `TIMES`, and `DIR` | Reuse and generalize; no new check file |
| A prefix-wide unset is safe under the runner's strict mode | `env OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_ANYTHING=x bash -c 'set -euo pipefail; unset "${!OPEN_DOUGH_TEST_@}"; env \| grep -c ^OPEN_DOUGH_TEST_'` prints `0`; with no such variable set, the same unset succeeds | Holds |

PFE: the existing solution is the per-name `unset` (`075fadeb`, `ceae01c`).
Change it in place to a prefix-wide unset with Bash's `${!OPEN_DOUGH_TEST_@}`
(the runner's Bash 5 floor supports it); nothing elsewhere in the product
scrubs environment by prefix. No North Star topic or ADR is affected.

## Outside-in proof

| Promise (story example) | Owner | Observation |
| --- | --- | --- |
| 1. A nested runner under CI's split runs all its own checks | Slice 1 | `tests/test-runner-split.sh` shares keep their expected check sets, and every substitute passes its inheritance assertion |
| 2. A new `OPEN_DOUGH_TEST_ANYTHING` reaches no job | Slice 1 | Same check: `run_split` also sets `OPEN_DOUGH_TEST_ANYTHING=x`; a substitute that sees any `OPEN_DOUGH_TEST_*` fails naming it |
| 3. `OPEN_DOUGH_TEST_JOBS` is used by the runner, not inherited | Slice 1 | Same check with `OPEN_DOUGH_TEST_JOBS=1` in `run_split`; the run still passes (runner used it) and no substitute sees it |
| 4. A check's own `OPEN_DOUGH_TEST_*` export reaches its children | Slice 1, by construction | The unset acts only in the runner's own shell before launch; no added proof (naturally general shell behavior) |
| Evaluation: reintroducing a pass-through fails a local check naming it | Slice 1 | Mutation: with the prefix-wide unset removed, `scripts/test.sh tests/test-runner-split.sh` fails with `inherited OPEN_DOUGH_TEST_…` naming the variables; restore |
| Evaluation: suite passes locally and as each CI share | Slice 1 | `npm test`, `OPEN_DOUGH_TEST_SPLIT=1/2 npm test`, `OPEN_DOUGH_TEST_SPLIT=2/2 npm test`, and `npm run lint` all pass |

## Ordered slices

### 1. The runner keeps every one of its own settings from its jobs
Type: Behavior
Status: planned
Proof: see the outside-in proof table; focused loop
`scripts/test.sh tests/test-runner-*.sh`, then the whole suite as itself and
as each CI share, and lint.

Behavior: a caller runs `scripts/test.sh` with any `OPEN_DOUGH_TEST_*`
variables set (including CI's split, a job count, a test directory, and a
name the runner has never heard of) → the runner uses the ones it knows, and
no job it starts sees any of them.

In `scripts/test.sh`, replace `unset OPEN_DOUGH_TEST_TIMES` and
`unset OPEN_DOUGH_TEST_SPLIT` with one prefix-wide unset immediately after
`scripts/test-jobs.sh` lists the jobs, and restate the two neighbouring
comments as that one rule. In `tests/test-runner-split.sh`, generalize the
substitute's assertion to any inherited `OPEN_DOUGH_TEST_*` variable, naming
each, and give `run_split` `OPEN_DOUGH_TEST_JOBS=1` and
`OPEN_DOUGH_TEST_ANYTHING=x`; update its header comment. In
`tests/README.md`, replace "Jobs inherit neither setting" with the one rule,
stated positively for every `OPEN_DOUGH_TEST_*` setting. Record the delivered
response and commit on DD-114 in `ProjectFindings.md`.

## Current decisions

- Prefix `OPEN_DOUGH_TEST_` is the runner's own namespace: anything under it
  given to the runner stays with the runner. A check exporting such a name
  for its own children is unaffected.
- `CI`, `BASH_ENV`, and `GIT_CONFIG_*` keep reaching every check.
