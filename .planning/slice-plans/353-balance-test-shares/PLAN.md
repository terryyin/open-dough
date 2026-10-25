# Deal CI test shares by recorded duration

**Identity:** SEED-151#balance-test-shares
**Source:** [Selected story](../../seeds/SEED-151-test-share-reliability.md#balance-test-shares)

## Goal and scope

A contributor who adds, removes or renames a test file gets Node shares and
dashboard shards whose predicted load stays balanced and visible before
pushing. One allocator deals each suite's recorded jobs, longest first, to the
share with the smallest predicted total, deals unrecorded jobs after them at
the recorded median, previews the result locally, and both suites refresh
their duration lists from CI artifacts of one form. The story's **Scope**
section fixes the required behavior, what is preserved, the one rejection
constraint, and the deferred promises; this plan adds no promise. In
particular it changes no ceiling, deadline or share count, automates no
refresh, and claims no runner-to-runner timing.

Assumptions: the Node runner already needs `node` for its `node --test` jobs,
so the shell listing may call the allocator through `node`; hosted CI runs on
every push of the story branch, so slice 3 can refresh the dashboard list from
the branch's own run of slice 2; the retained plan 350 inputs beside this plan
(`plan-350-inputs/`) stand in for the CI artifacts after their seven-day
retention ends and become a committed test fixture in slice 1.

## Existing solutions and architectural direction

PFE: the partition exists twice with the same positional rule, in
`scripts/test-jobs.sh` (bash, lines after `longest-first names known long
jobs`) and `dashboard/tests/support/testFiles.mjs` (`partitionTestFiles`),
with `tests/support/dashboard-test-files.test.mjs` proving the dashboard copy
and `tests/test-runner-split.sh` the runner's. Durations already flow out of
the Node runner as `OPEN_DOUGH_TEST_TIMES` (`<seconds><TAB><label>`, longest
first), uploaded by `ci.yml` as `test-times-<share>` and read back by
`scripts/ci-test-times.sh` for budget verdicts; `scripts/test-budget.sh`
judges a share against `tests/time-budget`. The dashboard's quiet reporter
(`dashboard/tests/support/quietReporter.ts`) already receives each test's
duration and spec file and hands them to `proofRecord.ts`, but keeps no
per-file times; its CI artifact is the HTML report, from which plan 292
extracted durations by hand. Decision: replace both positional copies with
one allocator module under `scripts/`, reuse the runner's times form as the
list form and as the dashboard's new artifact, and leave `ci-test-times.sh`
and `test-budget.sh` unchanged.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
asks for low-cost change and one cohesive solution, which is why the deal gets
one owner rather than a smarter copy in each suite.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps
proof functional: the allocator's tests use real recorded inputs, and CI's
own budget verdict stays the hosted check.
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
is untouched: nothing here is published guidance. The
[North Star](../../NORTH-STAR.md) has no topic on test infrastructure and
gains none.

## Preparation observations and decisive premises

Observed on 2026-10-25 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/keep-test-file-changes-from-unexpectedly-exhaust`
at `0d3a7ca7`, after `node scripts/setup-native.mjs npm` (Node 24.21.0, the
pinned version). Scratch files lived under the job's temporary directory; the
one scratch edit below was reverted and `git status` was clean before the
record write. No paid or native host run was needed.

| Premise / consuming operation | Literal observation | Result and limit |
| --- | --- | --- |
| Plan 350's before and after inputs are still retrievable and the positional deal reproduces its failure from them. | `gh run download 39875064344 -p 'test-times-*'`, same for `39883782226`; `git show 3fba18f9:tests/longest-first` (84 labels); a scratch `reconstruct.mjs` applying the positional rule and the duration rule to those inputs | Before: 607.1 / 497.6 / 683.3; after one added 1.0 s file: 588.6 / 495.6 / 711.1 with 47 jobs changing share, matching DD-279. Duration deal from the before run's 416 recorded seconds: predicted 596.0 ×3; after, measured 599.2 / 599.5 / 596.6, no other job changing share. With a 3 s cutoff (166 recorded, unrecorded at 1 s): 600.3 / 590.3 / 604.7 but 36 small jobs changing share, which is why the list keeps every job. Rename of `tests/git-publication-native.sh` (54.4 s): positional 518.0 / 646.2 / 631.1, duration 621.7 / 591.8 / 581.8. Stale 84-label list under the duration deal: 677.5 / 589.1 / 528.7 with 883 unrecorded seconds, so the preview's unrecorded count matters. Inputs retained in `plan-350-inputs/`. |
| The current Node suite and list, and how balanced a fresh positional deal is. | `OPEN_DOUGH_TEST_DIR=tests /opt/homebrew/bin/bash scripts/test-jobs.sh` with and without `OPEN_DOUGH_TEST_SPLIT=i/3`; `gh run download 40177702256 -p 'test-times-*'` | 424 jobs; 165 listed and all present; 259 unlisted; shares of 142 / 141 / 141 jobs. The latest main run (`f274a3d0`, list refreshed two days earlier) measured 433.6 / 481.9 / 623.7 job-seconds, and `scripts/ci-test-times.sh` reports share 3's recent highest at 683.3 with headroom 26.7, thin. A fresh positional list does not balance. Limit: the system bash 3.2 cannot run `test-jobs.sh` (`declare -A`); the runner's own bash 5.3 can. |
| The current dashboard suite and list. | `node -e` over `partitionTestFiles` with the real `dashboard/tests` listing; `gh run view 40177702256 --json jobs` | 548 spec files; 155 list entries present, 45 gone, 393 unlisted; shards of 45 or 46 files; shard jobs took 135 s to 283 s against the 320 s deadline. The list is stale and the shards uneven. |
| The quiet reporter observes per-test durations and the spec file, in this checkout. | `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<tmp> npx playwright test tests/agent-launch-preparation-phases.spec.ts` from `dashboard/` | Passed in 10.3 s; the record holds `location.file` and attempt `durationMs` 6290 and 5413 for the file's two tests. Slice 2 sums these per file; no new reporter data is needed. |
| A module under `scripts/` is importable from `dashboard/tests/support/testFiles.mjs` under the dashboard type-check. | Scratch `scripts/scratch-shares.mjs` imported from `testFiles.mjs`; `npm run typecheck:dashboard`; `node -e 'import(...)'`; then revert | Exit 0 (`tsconfig.node.json` includes `tests` with `allowJs`, `checkJs: false`); runtime import printed the exported value; reverted, `git status` clean. |
| `node` is present wherever `scripts/test-jobs.sh` runs. | The downloaded `test-times-<i>.txt` files list `.test.mjs` jobs in every share; `ci.yml` sets up Node before `npm run test` | The runner already executes `node --test` in every CI share and locally; the allocator adds no dependency. |
| Consumers of the list form and the partition. | `grep -rn longest-first tests/*.sh tests/support/*.mjs`; `grep -rln 'test-times\|dashboard-playwright-report' tests scripts` | Writers of substitute lists: `tests/test-runner-split.sh`, `tests/test-runner-interrupt.sh`, `tests/test-runner-failure-report.sh`. Readers: `scripts/test-jobs.sh`, `testFiles.mjs`, `tests/support/dashboard-test-files.test.mjs`. Documentation: `tests/README.md`, `dashboard/tests/README.md`, `tests/time-budget.md`, both list headers. `scripts/ci-test-times.sh` downloads by the pattern `test-times-*`, which a `dashboard-times-<shard>` artifact does not match. `tests/ci-lint-setup.sh`, `tests/native-setup.sh`, `tests/ci-container.sh` and `tests/test-runner-github-requests.sh` read `ci.yml` for other steps; slice 2 reruns them. |
| How the dashboard reporter is proven. | `grep -rl OPEN_DOUGH_DASHBOARD_PROOF_RECORD tests dashboard/tests/support` | Only `dashboard/tests/support/proofRecordRun.ts`, the harness dashboard specs use to run an independent nested Playwright run; slice 2's proof uses that route for the times file. |

No premise needs a paid, credentialed or owner-held observation. The one
external wait is slice 3's dependence on a hosted CI run of slice 2 for the
dashboard's first recorded durations; it is named in that slice.

## Outside-in proof ownership

| Story example | Proof and owner |
| --- | --- |
| 1: plan 350 reconstructed | Slice 1: a `node --test` file for the allocator, with `plan-350-inputs/` as its committed fixture, asserts the duration deal predicts 596.0 ×3 from the before run, that the added file alone changes share, and that the after run's measured totals are 599.2 / 599.5 / 596.6. |
| 2: addition seen in the preview | Slice 1: the same test runs the preview over the fixture with one extra unrecorded label and asserts it is listed as unrecorded at the median on the lightest share with the other shares unchanged; `tests/test-runner-split.sh` proves the runner's shares follow the deal. |
| 3: rename | Slice 1: the allocator test renames `tests/git-publication-native.sh` in the fixture and asserts the heaviest predicted share rises by at most that job's recorded seconds and the preview names the renamed file as unrecorded. |
| 4: stale list visible | Slice 1: the preview over the 84-label list reports 333 unrecorded of 417, and the headroom line uses `tests/time-budget`'s total ceiling. |
| 5: dashboard shards | Slice 2: a nested run with `OPEN_DOUGH_DASHBOARD_TIMES` writes `<seconds><TAB><file>` per spec file, longest first; the branch's CI run retains `dashboard-times-<shard>`. Slice 3: `tests/support/dashboard-test-files.test.mjs` asserts the twelve shards' predictions lie within one recorded file of each other, every spec file matches exactly one shard, and a new spec is unrecorded in the lightest shard. |
| 6: malformed list line | Slice 1 for the runner (`tests/test-runner-split.sh`: the run fails naming the line before any check runs); slice 3 for the configuration (`dashboard-test-files.test.mjs`: `dashboardTestMatch` throws naming it). |
| 7: measured allocation recorded | Slice 3: the DD-279 entry and its project index name the response, revision, the final branch CI run's per-share totals from its artifacts, and the hosted-use observation criterion. |

## Ordered slices

### 1. Node shares are dealt by recorded duration and previewed locally
Type: Behavior
Status: done
Proof: new allocator test under `tests/support/*.test.mjs` with the
`plan-350-inputs/` fixture (examples 1 to 4, determinism across input order,
ties by share index, median for unrecorded jobs, malformed line);
`bash scripts/test.sh tests/test-runner-split.sh tests/test-runner-interrupt.sh tests/test-runner-failure-report.sh`
with their substitute lists in the new form; `npm run lint`; one whole
`npm test`, because every job passes through the changed listing.
Accepted: `bash scripts/test.sh tests/support/share-deal-recorded-runs.test.mjs tests/support/share-deal.test.mjs tests/support/test-shares.test.mjs tests/test-runner-split.sh tests/test-runner-interrupt.sh tests/test-runner-failure-report.sh tests/test-runner-bash.sh tests/test-runner-selection.sh tests/test-runner-budget.sh`
(examples 1 to 4 and determinism in `share-deal-recorded-runs.test.mjs` on
the committed fixture `tests/support/fixtures/plan-350/`; ties, median,
malformed line and refresh in `share-deal.test.mjs`; the `share` and
`preview` commands, the Bash 5 floor and a substitute directory through
`scripts/test-jobs.sh` in `test-shares.test.mjs`; example 6 in
`tests/test-runner-split.sh`), `npm run lint`, `npm run typecheck:dashboard`
and one whole `npm test`, all exit 0 and silent. The preview over the real
suite predicted 498.5 ×3 from the refreshed list.

Behavior: given the Node job set and `tests/longest-first` in
`<seconds><TAB><label>` form, when CI runs share `i/n` or a contributor runs
the preview → the share's jobs are those the duration deal assigns, started
longest first, and the preview prints each share's predicted total, the
unrecorded jobs with the assumed median, and the headroom to the total
ceiling in `tests/time-budget`.

Work: one ES module under `scripts/` exporting the deal and the preview, with a
small command surface used by `scripts/test-jobs.sh` for the share and by a
contributor for the preview and the refresh (merging one or more times files
into a list, longest first, keeping seconds). `test-jobs.sh` keeps discovery,
kinds and the `OPEN_DOUGH_TEST_SPLIT` validation, and hands labels, list and
split to the allocator. Rewrite `tests/longest-first` from the latest main
run's `test-times-*` artifacts with every job. Update `tests/README.md`,
`tests/time-budget.md` (the thin-share step runs the preview) and the list
header. Interim, named: the dashboard keeps its positional copy until slice 3.

### 2. Dashboard shards retain per-spec durations
Type: Behavior
Status: done
Proof: a dashboard spec through `proofRecordRun.ts` runs a nested small run
with `OPEN_DOUGH_DASHBOARD_TIMES` set and asserts one `<seconds><TAB><file>`
line per spec file, longest first, seconds as the sum of the file's test
durations; `bash scripts/test.sh tests/ci-lint-setup.sh tests/native-setup.sh tests/ci-container.sh tests/test-runner-github-requests.sh`
for the `ci.yml` edit; after publication, the branch's CI run shows
`dashboard-times-<shard>` artifacts for all twelve shards.

Behavior: given a dashboard run with `OPEN_DOUGH_DASHBOARD_TIMES=<file>`, when
the run ends → that file lists each spec file's seconds, longest first; CI
sets it per shard and keeps it as `dashboard-times-<shard>` with the same
`!cancelled()` and seven-day retention as `test-times-<share>`, and
`dashboard/tests/README.md` names it as the refresh source.

Accepted: from `dashboard/`, `npx playwright test tests/boundary/spec-times.spec.ts tests/boundary/proof-record.spec.ts tests/boundary/proof-record-storage.spec.ts tests/boundary/proof-record-verdict.spec.ts tests/boundary/proof-record-interruption.spec.ts tests/boundary/proof-record-entry.spec.ts tests/boundary/run-processes.spec.ts tests/quiet-reporter.spec.ts`
(`spec-times.spec.ts` runs nested quiet-reporter fixture runs through
`support/proofRecordRun.ts` with `timesPath` and asserts one
`<seconds><TAB><file>` line per spec file, longest first, equal to the
proof record's per-file attempt sums, written on a failed run and not on
`--list`); from the root
`bash scripts/test.sh tests/ci-lint-setup.sh tests/native-setup.sh tests/ci-container.sh tests/test-runner-github-requests.sh tests/support/dashboard-test-files.test.mjs tests/support/lint-file-set.test.mjs tests/support/pre-commit-lint-hook.test.mjs tests/support/format-changed-files.test.mjs`,
`npm run typecheck:dashboard`, `npm run lint`, all exit 0 and silent. The
reporter's times live in `dashboard/tests/support/specTimes.ts`; the shard
documentation moved to `dashboard/tests/shards.md`. The twelve
`dashboard-times-<shard>` artifacts are checked on this slice's branch CI run
before slice 3 starts.

### 3. Dashboard shards are dealt by recorded duration
Type: Behavior
Status: done
Proof: `tests/support/dashboard-test-files.test.mjs` (example 5 and the
malformed line; the twelve-shard exact-once assertion kept);
`OPEN_DOUGH_DASHBOARD_SPLIT=1/12 npx playwright test --list` from
`dashboard/` selects the predicted share; `npm run typecheck:dashboard`;
`npm run lint`; the final branch CI run's dashboard shards and Node shares
measured from their artifacts and recorded at DD-279.

Behavior: given the spec files and `dashboard/tests/longest-first` in the new
form, when CI runs shard `i/12` → the shard runs the duration deal's files, the
preview reports predicted test-seconds per shard and the unrecorded specs, and
DD-279 with its project index record the adopted response, revision, measured
allocation and the hosted-use observation criterion.

Work: `testFiles.mjs` imports the allocator and loses `partitionTestFiles`'s
positional body; refresh `dashboard/tests/longest-first` with the allocator's
refresh command from the branch CI run of slice 2 (all twelve
`dashboard-times-<shard>` artifacts); update `dashboard/tests/README.md` and
the list header. External wait, stated: this slice starts after slice 2's
branch CI run has retained its artifacts, about one CI round; nothing else
waits.

Accepted: `bash scripts/test.sh tests/support/dashboard-test-files.test.mjs tests/support/test-shares.test.mjs tests/support/share-deal.test.mjs tests/support/share-deal-recorded-runs.test.mjs tests/test-runner-split.sh tests/test-runner-selection.sh tests/test-runner-interrupt.sh tests/test-runner-failure-report.sh tests/ci-lint-setup.sh tests/native-setup.sh tests/ci-container.sh tests/test-runner-github-requests.sh tests/support/format-changed-files.test.mjs tests/support/lint-file-set.test.mjs tests/support/pre-commit-lint-hook.test.mjs tests/support/pre-commit-typecheck-hook.test.mjs`
(example 5 in `dashboard-test-files.test.mjs`: the twelve shards' predictions
within one recorded spec file of each other, every spec file in exactly one
shard, a new spec unrecorded in the lightest shard at the median; example 6:
`dashboardTestMatch` throws naming the malformed line); from `dashboard/`,
`npx playwright test tests/boundary/spec-times.spec.ts tests/quiet-reporter.spec.ts tests/boundary/proof-record.spec.ts tests/boundary/proof-record-entry.spec.ts`
and `OPEN_DOUGH_DASHBOARD_SPLIT=1/12 npx playwright test --list --reporter=list`
(43 files, identical to the allocator's share 1); `npm run typecheck:dashboard`;
`npm run lint`; all exit 0. The preview over the refreshed dashboard list
predicted 582.4 / 582.3 ×10 / 582.2 test-seconds where run 40187124945's
positional shards measured 462.5 to 686.4. The slice 3 commit's run
40189712361 (`065d6655`) passed; its measured allocation is recorded at
DD-279 (Node 655.8 / 612.1 / 401.3 against 498.5 predicted each, median
job ratios 1.26 / 1.13 / 0.81; dashboard 458.0 to 694.2 against 582.3
predicted each, ratios 0.74 to 1.18; shard jobs 159 to 240 s). The
completing commit refreshes both lists from that run's artifacts: 427 Node
jobs and 549 spec files recorded, predicting 556.4 ×3 and 572.5 ×12, proved
by `bash scripts/test.sh tests/support/dashboard-test-files.test.mjs tests/support/share-deal-recorded-runs.test.mjs tests/support/test-shares.test.mjs tests/test-runner-split.sh`
and `npm run lint`.

## Current decisions

- Every recorded job is listed; the former 3 s cutoff goes. Observed: with the
  cutoff, one added file still moved 36 small jobs between shares.
- Unrecorded jobs take the recorded median as their assumed duration, so the
  preview needs no constant and each suite calibrates itself.
- The deal is greedy longest-first to the least-loaded share, ties to the lower
  share index; unrecorded jobs follow in bytewise order. Max minus min predicted
  total is then bounded by one job's duration, which is the property the budget
  needs; membership of small unrecorded jobs may still move, and the story
  promises time, not membership.
- Refresh stays a documented command of the allocator over downloaded
  artifacts; no automatic refresh. The preview's unrecorded count is the
  staleness signal.
- `plan-350-inputs/` is retained beside this plan only because the hosted
  artifacts expire around 2026-10-30; slice 1 commits the fixture the test
  needs and wrap-up removes the planning copy with the plan.
- Slice order is fixed by data: the dashboard cannot carry seconds before CI has
  recorded them once. No supplied numeric slice target or hard limit was found,
  so none is invented; slice 1 is the largest and splits, if it overruns, at the
  allocator with its test first and the runner integration second.
- Preparation authorizes no execution.

## Learnings

- Slice 1: the plan's measured after-run totals (599.2 / 599.5 / 596.6) and
  the rename figures (621.7 / 591.8 / 581.8) came from the preparation's
  scratch reconstruction, whose order among recorded jobs of equal seconds
  was not recorded; 1,728 ordering variants failed to reproduce them, so they
  are not recoverable. The implemented order (ties bytewise) measures
  602.0 / 597.1 / 596.2 and 577.9 / 577.9 / 632.2; the predicted 596.0 ×3,
  zero other jobs changing share, the added file alone on the lightest share,
  333 unrecorded of 417 and the ≤ 54.4 rise all reproduce. A plan quoting a
  measured allocation must state the full sort key.
- Slice 1's branch CI run 40185201080 (`61d16b66`) measured 643.6 / 399.1 /
  536.0 job-seconds against 498.5 predicted for each share; the per-share
  median job ratio to the list was 1.24 / 0.76 / 1.13 over the jobs of 3 s or
  more, so the spread is runner speed (the story's deferred promise), not
  allocation. Slice 3 records the final run the same way at DD-279.
- Slice 2: `dashboard/tests/shards.md` is the dashboard counterpart of
  `tests/test-shares.md`; slice 3's dashboard deal, preview and refresh text
  belongs there, and the sentence at the end of `tests/test-shares.md` about
  the dashboard's positional deal then goes.
- Slice 1: `tests/helpers/copy-runner.bash` lists the runner's files; a new
  file the runner executes, and every module it imports, must be added there
  (found by the consumer trace, not by the focused runner tests).

## Story obligations

### G1. Example figures depend on an unrecorded tie order
Reported: slice 1 — "The after-run measured totals do not: mine are 602.0 / 597.1 / 596.2 against the plan's 599.2 / 599.5 / 596.6 (same sum 1795.3, so the same job set and runs). The per-share split depends on the order among recorded jobs with equal seconds, which the plan's decisions do not fix."
Story clause: "every share keeps more than 110 job-seconds of headroom instead of share 3 ending 1.1 over"
Disposition: no user cost "gets CI shares whose predicted load stays balanced and visible before pushing": the story fixes ties only "by share index and stable orders", and bytewise order among equal-second recorded jobs is one stable order; the contributor-visible promises of examples 1, 3 and 4 hold in `tests/support/share-deal-recorded-runs.test.mjs` (predicted 596.0 ×3, zero other jobs changing share, the added file alone on the lightest share, each share over 100 job-seconds of headroom where the positional deal measured 711.1, the heaviest share rising 36.2 ≤ 54.4 on the rename, 333 unrecorded of 417), and the measured allocation the story records is the landed run's (example 7, slice 3), not the reconstruction's. The quoted 599.2 / 599.5 / 596.6, 621.7 / 591.8 / 581.8 and "more than 110" are illustrative reconstruction figures; the developer may update them to the implemented order at wrap-up.


### G2. Times attribute imported case-module tests to the module, not the spec file
Reported: slice 3 — "124.3 s of recorded time sits under six case-module labels rather than their three importing specs (slice 2's `location.file` attribution). The deal still balances by what is recorded, and the preview counts those specs as recorded"
Story clause: "The dashboard CI shards retain per-spec durations in the same `<seconds><TAB><file>` form as an artifact"
Disposition: proved by slice 3: `dashboard/tests/support/specTimes.ts` attributes each test to the file suite Playwright ran; `dashboard/tests/boundary/spec-times.spec.ts` "tests registered from an imported case module count under the spec file that ran them" runs `nested/importing.proof.ts` (which registers tests from `nested/cases.ts`) and asserts the times list the importing spec alone with the summed seconds and no case-module line. The list refreshed from run 40187124945 still carries that run's attribution; the refresh from the landed revision's run, recorded with DD-279's final measured allocation, replaces it.
## Plan concern review

Slice-plan refinement was not needed: three slices with one outcome and one
proof loop each, every premise reached in this checkout read-only or by a
reverted scratch edit, and the single external wait is named in slice 3 with
its bound. This review identified no remaining slice-specific concern. The
interim positional dashboard deal between slices 1 and 3 is an accepted
trade-off, named with its replacing slice.
