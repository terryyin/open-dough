# Tidy the share allocator's surfaces and tests

**Identity:** SEED-151#tidy-share-allocator
**Source:** [Correction story](../../seeds/SEED-151-test-share-reliability.md#tidy-share-allocator)

## Goal and scope

Bounded retrospective correction of SEED-151#balance-test-shares
(plan 353, recoverable at `8dd20d66:.planning/slice-plans/353-balance-test-shares/PLAN.md`; commits 61d16b66 Node
shares by duration, 34f3192f dashboard per-spec times, 065d6655 dashboard
shards by duration, 2a537b21 both lists refreshed). The retrospective's
read-only review at 2a537b21 found no correctness regression and eight
residue findings; this plan resolves them while preserving the deal, every
allocation, both lists, the budget and every command's output for readable
inputs. The story's **Scope** fixes the required behavior and structure; this
plan adds no promise.

Findings (evidence as of 2a537b21):

1. `scripts/test-shares.mjs` dies with a Node stack trace on a missing
   `--list`, `--labels`, `--budget`, refresh times file or default
   `<dir>/longest-first`; only `TestSharesError` becomes a `FAIL:` line.
2. The full deal rule is restated in the `scripts/share-deal.mjs` header,
   `tests/test-shares.md`, `dashboard/tests/shards.md` "The split" and both
   list headers, with short forms in both READMEs, `tests/time-budget.md` and
   `ci.yml`.
3. `dashboard/tests/support/specTimes.ts` re-implements `bytewise`, seconds
   to a tenth and the longest-first-ties-bytewise order that
   `scripts/share-deal.mjs` owns (`formatSeconds`, `bytewise`, `mergeTimes`).
4. `listNodeSuiteJobs` in `scripts/test-shares.mjs` repeats the Bash 5 floor
   check and message of `scripts/test-environment.bash`.
5. `ci.yml`'s dashboard times comment sends the refresh reader to
   `dashboard/tests/README.md`; the procedure is in `dashboard/tests/shards.md`.
6. Tests pin the real ceiling 710 (`test-shares.test.mjs` line 83;
   `share-deal-recorded-runs.test.mjs` lines 108, 118, 159, 176, 188, 190).
7. `dashboard-test-files.test.mjs` proves a greedy invariant and copies the
   tie rule with its own 1e-9; the malformed line is proved four times.
8. `tests/support/fixtures/plan-350/` leaks a plan number.

## Existing solutions and architectural direction

PFE: every piece of knowledge this correction consolidates already has a
natural home. `scripts/share-deal.mjs` owns the deal, the list form and
`TestSharesError`, and `scripts/test-shares.mjs` already converts that error
to a `FAIL:` line and exit 1; missing files only need to raise it.
`mergeTimes` already produces the times form `specTimes.ts` writes, so one
exported formatter serves both. `dashboard/tests/support/testFiles.mjs`
already imports `share-deal.mjs` with JSDoc types that
`dashboard/playwright.config.ts` consumes under `tseslint.configs.strictTypeChecked`
(`eslint.config.mjs` lines 44–45), the pattern a typed export for
`specTimes.ts` follows. `scripts/test-jobs.sh` is the only bash the preview
spawns and needs Bash 5 itself (`declare -A`, line 37); `tests/helpers/copy-runner.bash`
copies `scripts/*.bash` by glob, so a sourced floor file reaches the runner
fixtures without an edit. `tests/test-shares.md` is already the fullest
statement of the deal and the document both list headers and `shards.md`
link. No new module, dependency or ADR is needed; ADR 0002 (one cohesive
solution, low-cost change) is the direction, ADR 0005 keeps the proof
functional, and the North Star has no topic here.

## Preparation observations and decisive premises

Observed read-only on 2026-10-25 in
`/Users/terryyin/git/open-dough/.worktrees/keep-test-file-changes-from-unexpectedly-exhaust`
at `2a537b21` with Node 24.21.0 (the pinned version); no file was changed
and no paid or native host run was needed.

| Premise / consuming operation | Literal observation | Result and limit |
| --- | --- | --- |
| A missing input file reaches the user as a stack trace. | `node scripts/test-shares.mjs share --list /nonexistent/longest-first --split 1/2 < /dev/null`; `preview --split-count 2 --labels /nonexistent/labels --list tests/longest-first` | Both print `node:fs:483 ... Error: ENOENT` with a stack; the tail of `test-shares.mjs` rethrows anything but `TestSharesError`. `scripts/test-jobs.sh` line 114 passes `--list` only when the list exists, so the runner path never meets this. |
| The deal is restated in prose. | `grep -rn 'ties to the lower' scripts tests dashboard .github`; both list headers; `shards.md` "The split"; `tests/README.md` 111–119; `dashboard/tests/README.md` 167–175, 185–191; `tests/time-budget.md` 38–42 | Full statements in `share-deal.mjs` header, `tests/test-shares.md`, `shards.md`; headers and READMEs are summaries that link `test-shares.md` or `shards.md`. |
| The CI comment and its readers. | `.github/workflows/ci.yml` 203–205; `grep -n 'dashboard/tests/README\|shards.md' tests/*.sh` | The comment names `dashboard/tests/README.md`; no shell test asserts it, so the pointer is free to change; the four `ci.yml`-reading tests (`tests/ci-lint-setup.sh tests/native-setup.sh tests/ci-container.sh tests/test-runner-github-requests.sh`) constrain other steps and are rerun. |
| A TS support file can take a typed export from the JS allocator under the strict lint. | `grep dashboardTestMatch dashboard/playwright.config.ts` (line 4, 44); `testFiles.mjs` `/** @returns {RegExp[]} */`; `dashboard/tsconfig.node.json` (`allowJs`, `checkJs: false`, includes `tests`); `eslint.config.mjs` 44–45; `quietReporter.ts` 28, 88 constructs `SpecTimes` | `npm run lint` and `npm run typecheck:dashboard` pass at 2a537b21 with that import (plan 353 acceptance), so a JSDoc-typed JS export is the working pattern; a return type the JSDoc leaves out would trip `no-unsafe-*`, which slice 1's lint proof catches. |
| Where the Bash floor lives and who runs bash. | `scripts/test-environment.bash` 6–17; `scripts/test-shares.mjs` `listNodeSuiteJobs`; `scripts/test-jobs.sh` 37; `tests/helpers/copy-runner.bash`; `tests/test-runner-bash.sh` 33, 51 | Two copies of the floor and the message, differing only in the remedy clause ("rerun the tests" / "rerun the preview"); `test-runner-bash.sh` asserts `require Bash 5 or newer` for the runner and `test-shares.test.mjs` asserts the preview's exact text with a Bash 3.2 stub. |
| Tests pin the real ceiling. | `grep -n 710 tests/support/*.test.mjs` | Seven lines in `share-deal-recorded-runs.test.mjs` and one in `test-shares.test.mjs`; the substitute-directory test in `test-shares.test.mjs` already writes its own `time-budget` (20). |
| Redundant real-suite and malformed-line proofs. | `tests/support/dashboard-test-files.test.mjs` tests 4–6; `share-deal.test.mjs` malformed test; `test-shares.test.mjs` "share fails on a list line"; `tests/test-runner-split.sh` 128–135; `dashboard/tests/boundary/spec-times.spec.ts` | The spread test asserts max − min ≤ largest recorded, a property of any greedy longest-first deal; the new-spec test re-derives the lightest shard with its own 1e-9 and re-proves recorded-runs example 2; the malformed line has unit, share-command, runner and configuration proofs; spec-times tests 1 and 2 each start one nested run. |
| The fixture's consumers. | `grep -rn plan-350` outside `.planning` | `share-deal-recorded-runs.test.mjs` lines 2, 19 and `tests/test-shares.md` line 65 only; `tests/support/fixtures/plan-350/{before,after}/test-times-{1,2,3}.txt` and `longest-first-at-3fba18f9`. |
| Plan number and identity. | `ls .planning/slice-plans`; `grep -rn 'slice-plans/354' .planning`; `product-backlog.mjs identity-evidence --identity SEED-151#tidy-share-allocator` | 353 is the highest plan, 354 unallocated; the candidate is `unlisted` with no history record and no gaps. |

No premise needs a paid, credentialed or owner-held observation and no slice
waits on an external event.

## Outside-in proof ownership

| Story example | Proof and owner |
| --- | --- |
| 1: missing input fails with a `FAIL:` line | Slice 1: `tests/support/test-shares.test.mjs` runs `share`, `preview` (`--labels`, `--budget`, `--test-dir` without a list) and `refresh` against missing paths and asserts one `FAIL:` line naming the path, exit 1, no `Error:` or `at ` on stderr. |
| 2: a ceiling edit leaves tests green | Slice 3: the preview test uses a scratch budget; the recorded-runs tests derive expected headroom from `readTimeBudget`; execution edits `tests/time-budget` to 720, runs both files, sees green, reverts. |
| 3: the rule is stated once | Slice 2: `grep -rln 'ties to the lower' scripts tests dashboard .github` names only `tests/test-shares.md`; `npm run lint` (prettier) over the edited documents. |
| 4: one home for the floor | Slice 1: `grep -rn 'Bash 5 or newer' scripts` names one file; `bash scripts/test.sh tests/test-runner-bash.sh tests/support/test-shares.test.mjs` keeps both refusals. |
| 5: allocations unchanged | Slices 1 and 3: `tests/support/dashboard-test-files.test.mjs` exact-once test and `tests/support/share-deal-recorded-runs.test.mjs` examples 1–4 unchanged in their figures; from `dashboard/`, `OPEN_DOUGH_DASHBOARD_SPLIT=1/12 npx playwright test --list --reporter=list` selects 43 files; `node scripts/test-shares.mjs preview --split-count 3` prints the predictions it prints at 2a537b21 (recorded at slice start). |
| Times form shared | Slice 1: from `dashboard/`, `npx playwright test tests/boundary/spec-times.spec.ts` unchanged; `share-deal.test.mjs` refresh test unchanged; `npm run typecheck:dashboard`; `npm run lint`. |
| CI pointer | Slice 2: `bash scripts/test.sh tests/ci-lint-setup.sh tests/native-setup.sh tests/ci-container.sh tests/test-runner-github-requests.sh`. |
| Test consolidation and fixture name | Slice 3: the focused files below pass; `grep -rn plan-350 tests scripts dashboard` is empty. |

## Ordered slices

### 1. Share commands fail readably and the allocator owns the times form and the floor
Type: Behavior and Structure
Status: done
Proof: `bash scripts/test.sh tests/support/test-shares.test.mjs tests/support/share-deal.test.mjs tests/support/share-deal-recorded-runs.test.mjs tests/support/dashboard-test-files.test.mjs tests/test-runner-bash.sh tests/test-runner-split.sh tests/test-runner-interrupt.sh tests/test-runner-failure-report.sh`
(the new missing-path tests; the floor test's exact text; the runner tests
because `copy-runner.bash`'s copied set changes); from `dashboard/`,
`npx playwright test tests/boundary/spec-times.spec.ts tests/quiet-reporter.spec.ts`;
`npm run typecheck:dashboard`; `npm run lint`; `grep -rn 'Bash 5 or newer' scripts`
names one file; `node scripts/test-shares.mjs preview --split-count 3` and
`node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard/tests`
print what they print at 2a537b21.

Behavior: given a `share`, `preview` or `refresh` command naming a file that
does not exist (or a `--test-dir`/`--spec-dir` without `longest-first`), when
it runs → stderr is one `FAIL: <path> ...` line, exit 1, as for every other
refused input; readable inputs produce exactly today's output.

Work: in `scripts/share-deal.mjs`, read list, budget and times files through
one reader that turns a read failure into `TestSharesError` naming the path
(`readDurationList`, `readTimeBudget`, and the label and times reads in
`scripts/test-shares.mjs` use it). Export from `share-deal.mjs` one
JSDoc-typed formatter of the times form (entries of label and seconds →
`<seconds><TAB><label>` lines, longest first, ties bytewise, seconds to a
tenth) used by `mergeTimes` and imported by
`dashboard/tests/support/specTimes.ts`, which drops its own `bytewise`,
rounding and sort and keeps attribution and writing. Give the Bash 5 floor
one home: a sourced `scripts/*.bash` file holding the floor and the message
with the remedy's object as its argument, sourced by
`scripts/test-environment.bash` and by `scripts/test-jobs.sh` before its
`declare -A`; `listNodeSuiteJobs` drops its own version check and relays a
`FAIL:` stderr from `test-jobs.sh` as it is. Update the module header's
command list only where a message changed.

### 2. One full statement of the deal, and the CI pointer
Type: Structure
Status: done
Proof: `grep -rln 'ties to the lower' scripts tests dashboard .github` names
only `tests/test-shares.md`;
`bash scripts/test.sh tests/ci-lint-setup.sh tests/native-setup.sh tests/ci-container.sh tests/test-runner-github-requests.sh`;
`npm run lint`.

Behavior: none changes; a reader of `dashboard/tests/shards.md` or the
`scripts/share-deal.mjs` header is sent to `tests/test-shares.md` for the
rule and finds there what the dashboard and the module do differently; the
`ci.yml` comment at "Keep per-spec dashboard times" names
`dashboard/tests/shards.md`.

Work: `tests/test-shares.md` "The deal" stays the one full statement and
gains nothing but the sentence that the dashboard's spec files follow the
same rule (it already links `shards.md`). `dashboard/tests/shards.md` "The
split" keeps the dashboard's own facts (labels relative to the directory,
twelve shards, the type-check in the last shard, no ceiling, the harness
removing the inherited split, the configuration failing on a malformed line)
and replaces its restated rule with a link. The `share-deal.mjs` header
names the module's responsibilities, the list form and where the rule is
documented; the `#` comments in `scripts/test-jobs.sh` 106–112 keep their
pointer. Both list headers and both READMEs stay, as story 1 requires.
`ci.yml` line 205: `dashboard/tests/README.md` → `dashboard/tests/shards.md`.

### 3. Tests pin behavior, not the ceiling, and the fixture is named by what it holds
Type: Structure
Status: done
Proof: `bash scripts/test.sh tests/support/test-shares.test.mjs tests/support/share-deal-recorded-runs.test.mjs tests/support/dashboard-test-files.test.mjs tests/support/share-deal.test.mjs tests/test-runner-split.sh`;
with `total-job-seconds=720` temporarily in `tests/time-budget`, the first two
files again, then revert; `grep -rn plan-350 tests scripts dashboard` empty;
from `dashboard/`, `npx playwright test tests/boundary/spec-times.spec.ts`
when its runs are merged; `npm run lint`.

Behavior: none changes; the covered behaviors keep a named test each:
missing-seconds line (unit in `share-deal.test.mjs`, runner in
`test-runner-split.sh`, configuration in `dashboard-test-files.test.mjs`),
exact-once membership of the twelve shards, a new spec previewed as
unrecorded in the lightest shard, examples 1–4 on the retained runs.

Work: `test-shares.test.mjs` "preview reads labels from a file" writes a
scratch budget as the substitute-directory test does and asserts headroom
from it; drop its share-command malformed-line test.
`share-deal-recorded-runs.test.mjs` reads `readTimeBudget` once and derives
the asserted headroom strings and the "over 100 job-seconds" bound from it.
`dashboard-test-files.test.mjs`: fold the new-spec check into the exact-once
test as a preview-text assertion (`^ {2}share <i>/12 {2}zz-new.spec.ts$`
for the shard the allocation reports, no `headroom`), using `dealShares`'s
own result rather than a re-derived lightest shard, and drop the spread
test. Rename `tests/support/fixtures/plan-350/` to
`tests/support/fixtures/node-suite-ci-runs/` (`before/`, `after/`,
`stale-longest-first`), keep run ids 39875064344, 39883782226 and revision
3fba18f9 in the test's header, and update `tests/test-shares.md` "Proof".
Optional, only if every assertion survives: run `spec-times.spec.ts` tests
1 and 2 as one nested run. The former planning copy `plan-350-inputs/` was
removed with plan 353 (recoverable at
`8dd20d66:.planning/slice-plans/353-balance-test-shares/plan-350-inputs/`).

## Current decisions

- Behavior preserved: every allocation and every command's stdout for readable
  inputs; the only new output is a `FAIL:` line where a stack trace was.
- The one full statement of the deal is `tests/test-shares.md`; list headers
  stay because story 1 requires them to describe the deal.
- The Bash floor's home is a sourced bash file, chosen because
  `scripts/test-jobs.sh` needs Bash 5 itself and `copy-runner.bash` already
  copies `scripts/*.bash`; the JS relays the shell's message instead of
  owning a copy. A floor change then edits one line.
- The times formatter is exported from `share-deal.mjs` with JSDoc types, the
  pattern `testFiles.mjs` already uses under the strict TS lint.
- Fixture named by capability, not plan number; the planning copy is removed
  by story 1's approved wrap-up, not here.
- Three slices by proof loop: slice 1 changes code and is proved by tests and
  the type-check; slice 2 changes documents and is proved by the `ci.yml`
  readers and lint; slice 3 changes tests and is proved by the tests
  themselves. Each is a safe stopping point.
- Preparation authorizes no execution and no Take.

## Learnings

- Slice 1: the two Bash floor messages differed in more than the remedy
  (runner "resolved <path>", preview "resolved bash on PATH"); the shared
  `scripts/bash-floor.bash` uses the runner's form, so the preview's refusal
  now names the resolved bash path. The old preview stub never ran
  `test-jobs.sh`; the test's stub now reports 3.2 for `-c` and runs scripts
  under the real bash, so the listing's own floor check refuses it.
- Slice 1: `formatTimes` sorts by printed seconds (the dashboard's former
  rule); `mergeTimes` sorted by raw seconds. The runner prints times to a
  tenth (`scripts/test.sh` `%.1f`), so refresh output is unchanged.
- Slice 1 accepted proof (base f1a3e06d): the plan's focused `scripts/test.sh`
  command plus `tests/test-runner-selection.sh`, spec-times and quiet-reporter
  specs (10 passed), typecheck, lint, the floor grep (only
  `scripts/bash-floor.bash`), and both preview outputs diff-empty against
  pre-change baselines (at f1a3e06d `--split-count 3` needs Bash 5 first on
  PATH on this machine; `OPEN_DOUGH_DASHBOARD_SPLIT=1/12 --list` selects 44
  files at f1a3e06d, the baseline for example 5).
- Slice 2: a test comment (`tests/test-runner-split.sh`) also restated the
  tie rule; it now points at `tests/test-shares.md`. The old module header
  carried details the document lacked (equal-seconds recorded jobs bytewise,
  order independence, the one-job bound); they joined "The deal", and the
  even-count median and 1 s fallback sit beside `dealShares`'s code.
  Proof: the rule grep names only `tests/test-shares.md`; the four `ci.yml`
  readers and `tests/test-runner-split.sh` pass; lint passes.
- Slice 3: the optional spec-times merge was not taken. Two dashboard
  documents (`shards.md` proof paragraph, `README.md`) described the dropped
  balance and lightest-shard tests and now describe what the remaining test
  proves; the lightest shard at the median stays proved by recorded-runs
  example 2. Proof: the plan's focused command passes; with
  `total-job-seconds=720` the test-shares and recorded-runs tests pass, then
  the budget is restored; `grep -rn plan-350 tests scripts dashboard` and
  `grep -rn 710 tests/support/*.test.mjs` are empty; lint passes. After all
  slices both previews still match the f1a3e06d baselines and
  `OPEN_DOUGH_DASHBOARD_SPLIT=1/12 --list` still selects 44 files.

## Plan concern review

Slice-plan refinement was not needed: one bounded outcome, three slices with
one proof loop each, every premise observed read-only in this checkout, and
no external wait. This review identified no remaining slice-specific
concern. The typed JS export in slice 1 rests on the precedent
`testFiles.mjs`/`playwright.config.ts` and is caught by that slice's lint
proof if the JSDoc is incomplete; the optional spec-times merge in slice 3 is
dropped, not forced, if an assertion would be lost.
