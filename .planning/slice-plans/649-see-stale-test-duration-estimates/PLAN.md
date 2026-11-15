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
Status: planned
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

Established start reused; no second claim. Story Branch Mode in
`/Users/terryyin/git/open-dough/.worktrees/see-stale-test-duration-estimates-before-relying`,
branch `codex/see-stale-test-duration-estimates-before-relying`, reused owned
worktree. Starting revision `2c71a1ea5e01fc57dd6d1a21fd615534a94e9689`;
claim and candidate `b2a86929c6f7c893aff8add58cf23e4b17c07ca2` accepted on
`origin/main` and the execution branch. Publisher
`dashboard-territory.local-open-dough`; agent Akiho-chan. Integration checkout
was not supplied. Increments target the execution branch; closure targets
`origin/main`. Replanning permission retains existing planning authority.

Checkout setup: `npm ci` at the unchanged lockfile succeeded;
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh Distribution/tests/support/test-shares.test.mjs`
succeeded. Selective formatting is `npm run format`; the tracked pre-commit
hook is check-only and owns staged lint plus dashboard typecheck for scripts.
No generation or project summary applies to these runner-only changes.

CI observer: GitHub Actions, verified `ci.yml` (CI, workflow 351271804),
repository `terryyin/open-dough`, target
`codex/see-stale-test-duration-estimates-before-relying`, checkout as above.
Coordinator `akiho-seed374`; directory `/tmp/dough-ci-501/watch-XyK0xC`,
PID 40279, stream session 13119, yielded cell `g448:12`. The claim on trunk
is `pendingCi: unobserved`; this observer owns only branch increments.

Proof selection: focused Node and shell checks on this macOS host; no full
local suite or browser workload is needed. No competing owned heavy proof
is known. Reconsider if a slice requires heavy verification.

## Accepted execution evidence

All focused commands use `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh`
with the complete literal paths on their slice Proof lines.

- Slice1: eight listed checks passed; exact CLI share labels, tie/median and
  retained-run allocation/headroom, browser inventory, copied-runner and split
  execution inspected. `python3 /tmp/dough-slice1-compare-preview.py` matched
  status/stdout/stderr byte for byte on preserved mixed/current/fixed inventory
  and error inputs. Consumer trace `/tmp/dough-slice1-consumer-trace.md` covers
  relocated formatter/budget reader/label parser; all actual callers updated.
  Independent refactor: already clean; approximately5 active minutes. Published
  `02705787579d078863b1f7db65cc2616774cab54`, base claim, execution branch.
- Slice2: four listed checks plus `Distribution/tests/support/share-deal.test.mjs`
  passed. Actual CLI assertions in `share-preview-stale.test.mjs` observe all
  four source examples and one-job threshold/only-affected-share behavior.
  Original indexed timings and feature-group labels preserve all historical
  rows. Source-review rows retain individual expected/actual locations. Trace
  `/tmp/dough-slice2-consumer-trace.md` covers every formatter consumer; shared
  allocation/factor/budget unchanged. Independent refactor: already clean.
  Formatter caught helper parameter reassignment; local-path repair stayed
  within that return/trace, and the stale-preview focused check passed again.
  Approximately12 active minutes. Published
  `40895f9b444868e537703b2146b76aa456688a5e`, base slice1, execution branch.
- Slice3: five listed checks passed; inspected real Git/scratch-repo command
  assertions for2stale shell/Node jobs, added and locally promoted estimates,
  helper exclusion, assumed headroom, missing-ref exact failure, override and
  substitute success. Existing classification/spec/error assertions pass.
  Trace `/tmp/dough-slice3-consumer-trace.md` covers default/Git/glob effects;
  copied-runner closure exercised, unchanged share/factor/deal proof reused.
  Documentation matches last-fetched origin/main and no-fetch behavior.
  Approximately13 active minutes. Independent refactor removed duplicated discovery
  policy: temporary empty tracked candidates and trunk patterns are listed by
  the real Bash runner, with cleanup in finally and inherited membership split
  cleared. Seven focused checks passed (slice3 Proof paths plus
  `Distribution/tests/test-runner/test-runner-bash.sh` and
  `Distribution/tests/test-runner/test-runner-split.sh`); the trunk test passed
  again after the split adjustment. Hidden/promoted/aggregate cases inspected.
  Trace `/tmp/dough-refactor3-consumer-trace.md`: actual/copy callers covered,
  unchanged allocation/refresh proof retained. About12 refactor minutes; no
  open gap. Final freshness unchanged at `7bb999227`.

The same branch observer covers every publication. CI run43727102378/1 was
cancelled when slice2 run43728001510 was created on the same branch under
workflow supersession. Bounded inspection: all non-cancelled jobs succeeded;
only e2e2/6, e2e5/6 and ci-proof cancelled. No failed job to repair.

## Story obligations

### G1. Final refresh covers newly added tests (coordinator discovery)
Reported: slice 2 — "Coordinator inspection: this story adds tests absent from current main timing artifacts; refreshing main alone can leave them stale once integrated."
Story clause: "Delivery leaves `Distribution/tests/longest-first` current through the existing refresh, so this repository's own preview reports no stale job."
Disposition: receiving slice 4
Commitment: C22
