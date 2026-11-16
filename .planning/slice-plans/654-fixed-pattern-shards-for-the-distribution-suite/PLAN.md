# Fixed pattern shards for the Distribution suite

**Identity:** SEED-381#fixed-pattern-shards-for-the-distribution-suite
**Source:** [Fixed pattern shards for the Distribution suite](../../seeds/SEED-381-fixed-ci-test-shards.md#fixed-pattern-shards-for-the-distribution-suite)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Maintainers run and change the Distribution suite's CI shares by reading the
`distribution-tests` matrix in `.github/workflows/ci.yml`. The runner selects a
share by the matrix's glob patterns, the last share runs the rest, and the
duration-driven deal, its preview, the normalized time budget and the
Distribution duration lists are removed with their tests and documents.

Exclusions: everything the dashboard groups still use (`scripts/share-deal.mjs`,
`scripts/duration-list.mjs`, the `refresh` command, the `--spec-dir` preview,
their tests, `dashboard/tests/shards.md`, `dashboard/*.longest-first*`,
`e2e/longest-first*`); a command that reports per-check CI seconds; released
`CHANGELOG.md` entries and `.planning/done/`.

## Settled premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A share's wall time tracks its job-seconds over four CPUs | slice 5's starting shares | `gh run view 43773156778 --json jobs` and that run's `test-times-<i>` artifacts, 2026-11-16 | 927.3, 946.8 and 618.8 job-seconds ran in 233, 238 and 155 s test steps. The same run's checks grouped as the starting shares total 743 (`dough-execute-plan`), 845 (evaluation folders) and 905 (rest) job-seconds: about 186, 211 and 226 s. Remainder: the grouped shares have not run together on CI; slice 6 observes them |
| Glob matching needs no npm package inside a copied runner fixture | slices 1 and 5 | `node -e` with `require("node:path").matchesGlob` on Node 24.21.0 (`.node-version`) in this workspace at `4d01ca027` | `Distribution/tests/skills/dough-execute-plan/**` and `Distribution/evaluation/**` match nested files, a sibling folder and `scripts/check-self-installation.sh` do not, `ci-*.sh` matches a file pattern |
| Only three runner checks depend on the list for start order | slices 2 and 5 | scratch removal of `--list` from the allocator call in `scripts/test-jobs.sh`, then `bash scripts/test.sh Distribution/tests/test-runner/test-runner-*.sh Distribution/tests/support/test-runner-deadline-*.test.mjs Distribution/tests/support/test-shares.test.mjs`, reverted, load 21 | fail: `test-runner-deadline-cutoff.test.mjs`, `test-runner-failure-report.sh`, `test-runner-split.sh`; the others pass |
| The CI proof fixtures read the share count from the `share: [1, 2, 3]` line | slice 5's matrix form | `Distribution/tests/support/ci-proof-action-fixtures.mjs:103` | the regex needs that line; the matrix keeps it and adds `include` entries carrying each share's patterns |

## Outside-in proof and local gates

- Focused proof runs through the runner: `bash scripts/test.sh <paths>` with
  Homebrew bash 5 first on `PATH`.
- Slice 7 runs the whole suite once, `caffeinate -s -i npm test` on AC power
  from a fully awake machine
  ([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)),
  because the selection change reaches every check and the removals touch
  files many checks copy (`Distribution/tests/helpers/copy-runner.bash`).
- The delivered revision's `distribution-tests` jobs are the proof that every
  check runs once: the three shares' `test-outcomes` line counts sum to the
  unsplit discovery count, with no label repeated.
- Failures and flakes follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

| Key example | Owner |
| --- | --- |
| A new folder's check runs once, in the last share | 1, 5 |
| A new `dough-execute-plan` check runs in the share naming that folder | 1, 5 |
| Overlapping patterns fail naming the file and both shares | 1, 5 |
| A pattern that matches no check fails naming it | 1, 5 |
| A 70-second check passes; only the deadlines fail a share for time | 4 |
| Moving a pattern in `ci.yml` is the only edit | 5, 6 |
| Wall time comparable to the current split | 6 |
| No remaining reference to lists, deals or the budget | 3, 4, 7 |

## Ordered slices

### 1. Select a share from declared patterns
Type: Structure
Status: done
Proof: a new `Distribution/tests/support` node test over small label sets and
workflow text.

Add one dependency-free module in `scripts/` that reads the
`distribution-tests` matrix from workflow text (`share: [..]` plus `include`
entries with `share` and `tests`, one or more space-separated globs) and, given
discovered labels and a share number, returns that share's labels in bytewise
order: a pattern share's matches, or for the last share every label no earlier
share claims. It refuses, with one message naming the file and the shares, a
label that two shares match, and naming the pattern, a pattern that matches no
label; an `include` share outside the list or patterns on the last share are
refused the same way. No share selected returns every label, validated the
same. Enables slice 5.

### 2. Start an unsplit run's checks in path order
Type: Behavior
Status: done
Proof: `test-runner-failure-report.sh` and
`test-runner-deadline-cutoff.test.mjs`, with every `test-runner-*` and
`test-runner-deadline-*` check green.

Behavior: checks named so that path order differs from their durations → an
unsplit run → they start in bytewise path order. `scripts/test-jobs.sh` passes
the list to the allocator only for a split. The two checks arrange their order
by check names instead of a `longest-first` file. CI's split is unchanged.

### 3. Remove the Distribution deal preview
Type: Structure
Status: done
Proof: the remaining `share-preview` and `browser-group-shards` checks green;
`git grep` finds no `--test-dir`, `--trunk-labels`, `--budget` or stale-list
text outside history records.

Remove from `scripts/share-preview.mjs` and the `preview` command everything
but the `--spec-dir` preview: the default-suite listing, trunk inventory,
stale report and budget headroom. Delete
`share-preview-stale.test.mjs`, `share-preview-trunk.test.mjs`, the
`stale-share-preview` fixtures, `share-deal-recorded-runs.test.mjs` with
`fixtures/node-suite-ci-runs`, and the Distribution cases of
`share-preview.test.mjs`. Enables slices 4 and 7 to delete what the preview
read.

### 4. Remove the normalized time budget
Type: Behavior
Status: done
Proof: `test-runner-selection.sh` and `test-runner-ci-environment.sh` green; a
`CI=true` fixture run with a slow check prints no `OVER BUDGET` line and exits
by its checks alone.

Behavior: a check slower than the former per-job ceiling → a CI share → the
share passes. Delete `scripts/test-budget.sh`, `scripts/time-budget.bash`,
`Distribution/tests/time-budget`, the runner's budget step, the
`runner-factor` command with `formatRunnerFactorLine` and its callers,
`scripts/ci-test-times.sh`, `Distribution/tests/ci/ci-test-times.sh`,
`test-runner-budget.sh`, `Distribution/tests/time-budget.md`, and the budget
passages in `README.md`, `runner-settings.md`, `ci.yml` comments,
`scripts/ci-job-times.sh`, `scripts/trunk-runs.bash` and
`scripts/gh-message.bash`. `local-test-suite-checkout.mjs` stops copying the
budget script.

### 5. Run CI's shares from the matrix
Type: Behavior
Status: planned
Proof: `test-runner-split.sh` rewritten over a fixture with its own workflow
file: each key example's selection, the two refusals before any check starts,
and a malformed or out-of-range `OPEN_DOUGH_TEST_SPLIT`;
`test-runner-selection.sh` and the CI proof checks green; the pushed
revision's three jobs by the outcome-count proof above.

Behavior: the matrix gives share 1
`Distribution/tests/skills/dough-execute-plan/**` and share 2
`Distribution/evaluation/**` → `OPEN_DOUGH_TEST_SPLIT=<i>/3` → the runner
starts exactly that share's checks; `<n>` other than the declared count is
refused. `scripts/test-jobs.sh` calls slice 1's module with the workflow file
under the runner's own root in place of the `share` command, which is removed
from `scripts/test-shares.mjs` with its test cases. `copy-runner.bash` copies
the new module. The `test-times-<i>` artifact keeps 90 days. The `ci.yml`
comments above the job say what the matrix now owns.

### 6. Settle the shares from the story's CI runs
Type: Behavior
Status: planned
Proof: two CI runs of the delivered revision or its successors; each share's
test step seconds recorded here.

Early probe for the wall-time premise. Read each share's test step from the
runs slice 5 produced. Keep the shares when the slowest test step is at most
250 s in both runs. Otherwise move one folder pattern toward the fastest
share, push, and read again; after two moves that leave a share over 250 s,
stop and record the figures for a decision on a fourth share. Record the final
patterns and seconds in Learnings.

### 7. Remove the duration lists and the last references
Type: Structure
Status: planned
Proof: whole suite once under the local gate above; `git grep -n -i -E
"longest-first|time-budget|test-shares\.md|runner factor|OVER BUDGET"` returns
only dashboard-group files, `CHANGELOG.md` and `.planning/done/`.

Delete `Distribution/tests/longest-first*` and
`Distribution/tests/test-shares.md`. Replace its place in
`Distribution/tests/README.md`, `runner-settings.md` and
`Distribution/evaluation/README.md` with a short description of the matrix
shares and the one refusal. Remove the remaining list fixtures from runner
checks (`test-runner-interrupt.sh`, `test-runner-deadline-continuation.test.mjs`,
`job-duration-list.mjs` when nothing uses it). Delete the entries in
`ProjectFindings.md`, `docs/maintainer/project-test-findings.md` and
`docs/maintainer/findings/` that describe the deal or the budget as the
current response, and reword `dashboard/tests/shards.md` only where it links
to a deleted Distribution passage.

## Current decisions

- The setting stays `OPEN_DOUGH_TEST_SPLIT=<i>/<n>`; job names, proof parts
  and artifact names do not change.
- The runner itself refuses an overlap or an unmatched pattern before any
  check starts, in every share and in an unsplit run. No separate check file
  owns it.
- Slice 6's failure stops slice 7 only when no three-share arrangement
  fits; removal does not depend on which patterns win.

## Learnings

- Slice 1: `scripts/test-share-matrix.mjs` reads the matrix form below and
  exports `readShareMatrix(text, file)` and `selectShare(matrix, labels, share?)`;
  its CLI is `node scripts/test-share-matrix.mjs WORKFLOW [SHARE]` with labels
  NUL-separated on stdin and NUL-terminated output. Parsing `<i>/<n>` and
  refusing an `<n>` other than `shares.length` is left to slice 5. A scratch
  run over 908 git-listed Distribution checks gave 244, 318 and 346.

  ```yaml
          share: [1, 2, 3]
          include:
            - share: 1
              tests: Distribution/tests/skills/dough-execute-plan/**
            - share: 2
              tests: Distribution/evaluation/**
  ```

- CI repair, 2026-11-16: run 43784934792 of slice 1's `f8cb342e6` failed
  shares 2 and 3 with `OVER BUDGET` total ceilings (951.2 and 952.3 against
  926 at recorded speed), as trunk's run 43779532830 at `93ef6ac50` already
  did (960.8 and 949.6). The normalized budget is what this story removes, so
  the preview and budget removals (formerly slices 5 and 6) now run as slices
  3 and 4, before the matrix wiring; slice 4 is the repair.

## Readiness and sizing

Refinement not needed: seven slices, each one outcome with one proof loop;
slices 3, 4 and 7 are deletions bounded by the consumer observation above. Remaining
slice-specific concerns: none identified. The wall-time premise is bounded by
the early probe in slice 6.
