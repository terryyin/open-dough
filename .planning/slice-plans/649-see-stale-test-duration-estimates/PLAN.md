# See stale test duration estimates before relying on CI headroom

**Identity:** SEED-374#see-stale-test-duration-estimates
**Source:** [See stale test duration estimates before relying on CI headroom](../../seeds/SEED-374-stale-test-duration-estimates.md#see-stale-test-duration-estimates)

**Source review:** [Source-only review](source-review.md)

## Goal and scope

`node scripts/test-shares.mjs preview` tells a contributor whether its
headroom rests on recorded CI seconds or on a stale duration list. Unrecorded
jobs the remote trunk already runs make the list stale, with the refresh step;
jobs the change adds stay estimates. Exit status, the deal, the budget and the
CI matrix keep their behavior.

Excluded: the dashboard `--spec-dir` preview as a delivery commitment, drift
in recorded seconds of listed jobs, and any push hook or CI check running the
preview.

## Outside-in proof

| Promise (seed) | Slice | Observable proof |
| --- | --- | --- |
| Stale list: 26 trunk jobs unrecorded → stale statement with count, affected shares' headroom marked as resting on assumed seconds, refresh step | 2 | `share-preview.test.mjs` runs the command on the retained pre-refresh fixture |
| One added job on a current list → no stale statement, headroom as today, job listed as an estimate | 2 | same file, current-list fixture with one label outside the trunk names |
| Both → stale count covers only trunk jobs; added job still an estimate | 2 | same file |
| Every job recorded → preview text as today | 1, 2 | existing preview assertions unchanged |
| The default preview separates by what the remote trunk runs | 3 | `share-preview.test.mjs` runs the command in a scratch repository with a remote-tracking trunk ref |
| Test shares documentation describes the stale and estimate readings | 2, 3 | `Distribution/tests/test-shares.md` read against the command output |
| This repository's own preview reports no stale job | 4 | `node scripts/test-shares.mjs preview --split-count 3` after the refresh |

Local gate: each slice's focused proof through `bash scripts/test.sh <paths>`
with Homebrew Bash 5 first on `PATH`. No slice needs a full local suite; a
long run is wrapped in `caffeinate -s -i` on AC power, starting fully awake
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
Failures and flakes follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Slices

### 1. Give the preview its own module
Type: Structure
Status: done
Proof: `bash scripts/test.sh Distribution/tests/support/share-preview.test.mjs Distribution/tests/support/test-shares.test.mjs Distribution/tests/support/share-deal.test.mjs Distribution/tests/support/share-deal-recorded-runs.test.mjs Distribution/tests/support/browser-group-shards.test.mjs Distribution/tests/support/duration-list.test.mjs Distribution/tests/test-runner/test-runner-bash.sh Distribution/tests/test-runner/test-runner-split.sh`
green, with preview output byte-identical to before.

Structure: `scripts/share-deal.mjs`, `scripts/test-shares.mjs` and
`Distribution/tests/support/test-shares.test.mjs` are each at the 250-line
limit. Move the preview concept (its inputs: job listing, list, budget; and
its text, `formatPreview`) into `scripts/share-preview.mjs`, leaving
`share-deal.mjs` the deal and `test-shares.mjs` argument parsing and dispatch.
Move the preview command tests into
`Distribution/tests/support/share-preview.test.mjs`. Callers:
`test-shares.mjs`, `browser-group-shards.test.mjs` and
`share-deal-recorded-runs.test.mjs` import `formatPreview`;
`Distribution/tests/helpers/copy-runner.bash` copies the runner's modules by
name, so a module `test-shares.mjs` imports statically joins that copy.
Enables slice 2.

### 2. Name a stale list and estimates from supplied trunk job names
Type: Behavior
Status: done
Proof: `bash scripts/test.sh Distribution/tests/support/share-preview.test.mjs Distribution/tests/support/share-preview-stale.test.mjs Distribution/tests/support/share-deal-recorded-runs.test.mjs Distribution/tests/support/browser-group-shards.test.mjs`

Behavior: a list, job labels and `--trunk-labels FILE` naming the jobs trunk
runs → `preview` opens with the stale statement and count when any unrecorded
job is among the trunk names, marks each share holding one as headroom resting
on assumed seconds, prints the refresh step, and lists every other unrecorded
job in its share as an estimate at the assumed seconds. With every job
recorded the text is unchanged. Retain the DD-537 inputs as a fixture under
`Distribution/tests/support/fixtures/`: the duration list at `3445cf469^`
(index and parts read as one logical list) and the 639 job labels of
`Distribution/tests` at `fd397339a`. `Distribution/tests/test-shares.md`
replaces its "high unrecorded count" sentence with the two readings.

### 3. Read the remote trunk's jobs in the default preview
Type: Behavior
Status: done
Proof: `bash scripts/test.sh Distribution/tests/support/share-preview.test.mjs Distribution/tests/support/share-preview-stale.test.mjs Distribution/tests/support/share-preview-trunk.test.mjs Distribution/tests/support/share-deal-recorded-runs.test.mjs Distribution/tests/support/browser-group-shards.test.mjs`

Behavior: a checkout whose remote-tracking trunk holds some unrecorded job
files and whose working tree adds another → `node scripts/test-shares.mjs
preview --split-count N` with no `--trunk-labels` counts the trunk's files as
stale and the added one as an estimate; an unreadable trunk ref fails naming
the ref and `--trunk-labels`. `test-shares.md` names the ref the preview reads
and that it reads it as last fetched.

### 4. Refresh this repository's duration list
Type: Behavior
Status: done
Proof: `node scripts/test-shares.mjs preview --split-count 3` shows no stale
statement; the return quotes each share's headroom and any estimate lines.

Behavior: `Distribution/tests/longest-first` lacking trunk jobs → the refresh
in `test-shares.md` from the latest successful `main` run that includes every
trunk job records them, with its `# Source:` line naming that run. Include
completed story-branch CI timings for tests this story adds, so integration
keeps its own preview current too; identify both sources when combined.

## Current decisions

- The default suite preview reads job files from the remote-tracking trunk ref
  (`origin/main`) with `git ls-tree`; `--trunk-labels` supplies the names for
  fixtures and substitutes. A preview given `--labels`, `--test-dir` or
  `--spec-dir` without `--trunk-labels` keeps today's unclassified listing,
  since no trunk is known for those inputs.
- A job label is its checkout-relative path, so trunk membership is path
  membership.
- One classification rule serves all four examples: an unrecorded job is stale
  when trunk names it, otherwise an estimate. No count threshold.

CI-repair checkpoint: the full-payload fixture trial reduced baseline-misses
62.58→53.22 local seconds (9.36s/15%), below its proposed15s lead target.
The agent models remaining23.1s/7.3s overages, not CI proof; this alone
is insufficient to predict both aggregate breaches fixed; repeated full-payload setup was not the whole bottleneck.
Retain this independently useful, coverage-preserving improvement; finish all
11 consumers, publish once, then use actual CI family evidence before choosing
a distinct repeated-session/cached-setup experiment. Budget goal is unchanged;
no dependent experiment is authorized by a passing local lead alone.

## Decisive premises

| Premise | Consuming operation | Observation (fd397339a, 2026-11-15) | Result |
| --- | --- | --- | --- |
| The pre-refresh list reproduces the optimism | Slice 2 fixture | list parts from `3445cf469^` in a scratch directory; `node scripts/test-shares.mjs preview --split-count 3 --list <scratch>/longest-first` | 639 jobs, 26 unrecorded at 1.5 s; headroom 176.7 / 176.7 / 178.2 |
| Unrecorded labels are paths trunk holds | Slices 2, 3 classification | the 26 labels compared with `git ls-tree -r --name-only origin/main Distribution/tests` | all 26 present |
| A statically imported module absent from the runner copy breaks copied-runner checks | Slice 1 | scratch `import "./zz-scratch.mjs"` in `scripts/test-shares.mjs`; `bash scripts/test.sh Distribution/tests/test-runner/test-runner-bash.sh`; reverted | exit 1, `ERR_MODULE_NOT_FOUND` in the copied runner; `test-runner-split.sh` runs the source scripts and stayed green |
| The three files to edit are at the size limit | Slice 1 | `wc -l` | 250 each |
| A recent `main` run's timing artifacts download | Slice 4 | `gh run download 43724792020 -p 'test-times-*' -D <scratch>` | three `test-times-<i>` files, 639 rows |
| The current list has one trunk job unrecorded | Slice 4 | `node scripts/test-shares.mjs preview --split-count 3` | 1 unrecorded (`Distribution/tests/ci/ci-job-times.sh`); headroom 28.1 / 28.1 / 26.6 |

## Refinement and concerns

Slice-plan refinement was not needed: four slices, each one outcome with its
own proof loop. This review identified no remaining slice-specific concern.
Shares hold 26.6 to 28.1 s of headroom while slice 1 adds a test file; the
budget is an input to this story, and a breach in CI is repaired under the
failure policy.

## Execution context

Story Branch Mode; owned worktree reused at
`/Users/terryyin/git/open-dough/.worktrees/see-stale-test-duration-estimates-before-relying`,
branch `codex/see-stale-test-duration-estimates-before-relying`; origin/main trunk.
Starting revision `2c71a1ea5e01fc57dd6d1a21fd615534a94e9689`; claim
`b2a86929c6f7c893aff8add58cf23e4b17c07ca2`, accepted on trunk and branch.
Publisher `dashboard-territory.local-open-dough`, agent Akiho-chan. Integration
checkout not supplied. Increments target branch; closure targets origin/main.
Replanning retains existing authority. Exact-checkout `npm ci` succeeded;
Bash5 focused command passed. Selective formatter `npm run format`; check-only
hook owns staged lint and dashboard typecheck. No generation/project summary.
CI: GitHub ci.yml (CI,351271804), terryyin/open-dough execution branch.
Observer coordinator akiho-seed374, directory `/tmp/dough-ci-501/watch-XyK0xC`,
PID40279, stream session13119, yielded cell g448:12. Claim trunk CI unobserved.
Focused Node/shell proof on localmac; no full local suite/browser workload.
Heavy proof is reconsidered with host/load evidence before launch.

## Accepted execution evidence

Commands use `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh` plus the
complete literal paths in slice Proof lines; source-review rows retain each
source-expected result and its actual observing assertion.

- Slice1: eight listed checks passed; exact CLI share labels, tie/median,
  retained-run headroom, browser inventory, copied-runner and split inspected.
  `python3 /tmp/dough-slice1-compare-preview.py` matched status/stdout/stderr
  bytewise on preserved mixed/current/fixed inventory and errors. Trace
  `/tmp/dough-slice1-consumer-trace.md` covers relocated formatter, budget and
  label parser; all actual callers updated. Independent refactor clean;5active
  minutes. Published02705787579d078863b1f7db65cc2616774cab54, base claim.
- Slice2: four listed checks plus share-deal.test.mjs passed. Five real CLI
  cases cover all four source examples and one-job/affected-share behavior.
  Original indexed timings and grouped labels retain all historical rows.
  Trace `/tmp/dough-slice2-consumer-trace.md` covers actual formatter callers;
  unchanged allocation/factor/budget proof retained. Refactor clean; formatter
  parameter-reassignment repair stayed in accepted paths/trace and its focused
  test passed again.12active minutes. Published40895f9b444868e537703b2146b76aa456688a5e, base slice1.
- Slice3: five listed checks plus runner-bash/runner-split passed. Inspected
  real Git cases:2stale shell/Node, added/promoted/hidden/aggregate estimates,
  helper exclusion, assumed headroom, exact ref failure, override/substitutes.
  Independent refactor replaced duplicated discovery with the real runner over
  empty tracked candidates and trunk patterns; finally cleanup and inherited
  membership split clearing inspected. Trunk check passed again after split
  adjustment. Traces `/tmp/dough-slice3-consumer-trace.md` and
  `/tmp/dough-refactor3-consumer-trace.md`: actual/copy callers covered,
  unchanged allocation/refresh proof retained.13implementation/12refactor active
  minutes. Publishedfedc827300415a5e452d38e373c130ef8dbbcd62, base slice2.
- Slice4: existing refresh over exact HEAD baseline in
  `/tmp/dough374-times-sNXoAW/primary-main` used mainrun43725762081 at
  86b3f67877e5f6024d42cb8696c39fe1a4a08bec (639 jobs matching trunk) plus only
  three added rows from run43729355694/slice3 (all3Distribution jobs succeeded).
  Source headers identify both and factor0.842. Actual default preview passed:
  642recorded,0unrecorded, headroom17.5/17.5/17.6, no stale/estimates. Inspected
  retained verification input `verify-current-list.mjs` and final-coverage.json
  beside temp baseline: actual runner all642 exactly once, shares212/213/217.
  Factor command passed; `/tmp/dough-slice4-consumer-trace.md` accounts for
  preview/partition/factor; algorithms reuse accepted proof. Refactor clean,
  six files below250;8active minutes. Publisheddd641ae5f213befa009dfdc21d27bc924adb0daf, base slice3.

All increments target execution branch with the same observer. Slice1 and
slice3 attempts were superseded: bounded job inspection found no failed job.
Execution-complete records050ed2038783b07ac96249ba94d3d90f999d8e0a published
on branch, base slice4. Final source freshness was unchanged at70594e768.

## Story obligations

### G1. Final refresh covers newly added tests (coordinator discovery)
Reported: slice 2 — "Coordinator inspection: this story adds tests absent from current main timing artifacts; refreshing main alone can leave them stale once integrated."
Story clause: "Delivery leaves `Distribution/tests/longest-first` current through the existing refresh, so this repository's own preview reports no stale job."
Disposition: proved by slice 4: /tmp/dough374-times-sNXoAW/after-preview.txt and final-coverage.json;642 recorded,0 unrecorded including all3 new tests; actual runner shares exactly once; source headers name main and story runs
Commitment: C22

## Execution review

Attributable increments: slice1 `027057875`, slice2 `40895f9b4`, slice3
`fedc82730`, slice4 `dd641ae5f`; claim `b2a86929c` is provenance only.
Product/proof review complete: all original examples and qualifications match
inspected CLI assertions and actual-list proof. ADR0001/0002 hold; runner
discovery has one owner. Command-unit tests drove this work; existing runner
checks retain their integration observations. No correction or product change
is supported. North Star dashboard topics are unaffected. Process review is
selected and deferred through the configured closure intent-coverage check.
CI run43729355694 had all17 test jobs successful; final ci-proof cancelled
on slice4 publication. Proven supersession, no failed job to repair.

## Execution complete

Product advice: no change.

## CI repair in progress

Completion for050ed203 returned failure on basisdd641ae5, observer retained.
Run43730867890/1: share2 total953.8>926; share3 total947.8>926 and
baseline-misses67.8>64 at recorded speed. Final diagnostic has exactly2failed
jobs; full budget logs account for unrecognized-format inventory gaps.
Fresh repair agent investigates repeated baseline setup; no other owner known.
Stash save was clean (no entry); record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-zaqh2Y/record.json`.
Proof decision: localmac AC, load5.22/6.21/8.36,58% memory free; no known
competing owned proof. Reconsider before each expensive attempt.
Retained candidate: pair fixture uses existing release materializer; independent
`PATH="/opt/homebrew/bin:$PATH" bash /tmp/dough374-verify-comparison-payload.sh`
passed370 managed paths/bytes,391fixture vs6849source files. All11 real fixture
consumers passed under Bash5,2jobs,caffeinate-s-i on AC; literal command and
observations retained in repair return and `/tmp/dough374-ci-repair-family-proof.log`.
Inspected session-count, frozen archive, verdict, provenance and payload-tree
assertions; source feature proof and product advice remain valid.10active minutes.
Independent refactor clean; unchanged proof retained; final freshness aabd7c58.
