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

### 5. Evaluate installation breadth as a CI repair
Type: Behavior
Status: done
Proof: unchanged reuse/misses pair before/after under Bash5,1job,AC sleep
guard; both real-installer/declaration/source witnesses; recomputed model.

The bounded trial cannot repair the current gaps, so it is rejected with no
runtime change. Product files restored bytewise to c425; exact trial retained
in `installation-breadth-trial.patch.gz`. All370 source paths/bytes stayed
shipped/Git-frozen; subject/complete declarations2/370 matched real installs.
One declaration first failed: installer write_certified_records() needs
dough-update/SKILL.md’s directory for certified SOURCE/VERSION records
(open-dough-platform.sh:36; /tmp/dough374-slice5-capture.log).

Literal measured command: `PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/dough374-slice5-pair-times.txt caffeinate -s -i /usr/bin/time -p bash scripts/test.sh Distribution/tests/native-comparison/native-comparison-baseline-reuse.sh Distribution/tests/native-comparison/native-comparison-baseline-misses.sh`.
Both corrected checks passed: wall89.73→72.07s; reuse47.2→38.7,misses42.4→33.3.
AC; load6.16→4.34; caches uncontrolled. Model945.53/922.15 normalized leaves
share2 still19.53s over, share3 only3.85s headroom; insufficient saving.
Other9 consumers not run after checkpoint; no full-family coverage claim.
Witness: `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash /tmp/dough374-slice5-payload-witness.sh` passed.
Evidence /tmp/dough374-slice5-{before,after}.log, model.{mjs,json}, payload
witness.{sh,log}, consumer-dispositions.md.12active minutes; no live command.

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

Four original slices are delivered; one bounded CI-repair experiment remains.
Five slices fit the cap; the bounded installation-breadth trial is rejected. Existing builder support and retained proof justify its seam.

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

All focused commands use the Bash5 PATH wrapper and literal Proof paths.
Source-review rows retain individual source-expected/actual assertions.
- Slice1: all8 checks passed; CLI bytes matched preserved mixed/current/fixed
  inventory and error cases via `/tmp/dough-slice1-compare-preview.py`.
  Allocation/headroom, browser inventory and runner splits inspected. Trace `/tmp/dough-slice1-consumer-trace.md`; refactor
  clean.5active minutes; published02705787579d078863b1f7db65cc2616774cab54.
- Slice2: all4 checks plus share-deal.test passed. Five real CLI cases cover
  four examples and one-job/affected-share rule; historical rows exact. Trace `/tmp/dough-slice2-consumer-trace.md`;
  refactor clean; parameter-reassignment mechanical repair re-proved.12active
  minutes; published40895f9b444868e537703b2146b76aa456688a5e.
- Slice3: all5 checks plus runner-bash/split passed. Real Git observes stale
  shell/Node, added/promoted/hidden/aggregate estimates, exact ref failures and
  overrides/substitutes. Refactor reuses authoritative runner over empty
  tracked candidates; finally cleanup/inherited membership split inspected.
  Traces `/tmp/dough-slice3-consumer-trace.md`,
  `/tmp/dough-refactor3-consumer-trace.md`;13implementation/12refactor minutes.
  Publishedfedc827300415a5e452d38e373c130ef8dbbcd62.
- Slice4: existing refresh used exact HEAD baseline under
  `/tmp/dough374-times-sNXoAW/primary-main`, mainrun43725762081 at86b3f67877
  (639 jobs matching trunk), plus3 new rows from successful Distribution jobs
  run43729355694/slice3; factor0.842. Actual preview642recorded/0unrecorded,
  headroom17.5/17.5/17.6, no stale/estimates. Verification input and
  final-coverage.json there prove real runner642 exactly once,212/213/217.
  Trace `/tmp/dough-slice4-consumer-trace.md`; factor proof/refactor passed;8active minutes; publisheddd641ae5f213befa009dfdc21d27bc924adb0daf.
Published bases in order: claim→slice1→slice2→slice3→slice4. Records050ed203
follow slice4. Source feature proof remains valid through test-only repairs.

## Story obligations

### G1. Final refresh covers newly added tests (coordinator discovery)
Reported: slice 2 — "Coordinator inspection: this story adds tests absent from current main timing artifacts; refreshing main alone can leave them stale once integrated."
Story clause: "Delivery leaves `Distribution/tests/longest-first` current through the existing refresh, so this repository's own preview reports no stale job."
Disposition: proved by slice 4: /tmp/dough374-times-sNXoAW/after-preview.txt and final-coverage.json;642 recorded,0 unrecorded including all3 new tests; actual runner shares exactly once; source headers name main and story runs
Commitment: C22

## Execution review

Original source outcome/proof reviewed against attributable four increments;
claim is provenance. ADR0001/0002 hold; command-unit tests drove development,
existing runner integration observations remain. No product-advice change.
Native fixture repair preserves assertions; slice5’s affected conclusions and
CI remain pending. Process review selected/deferred through closure coverage.

## CI repair input and checkpoint

Run43730867890/dd641ae5: share2 total953.8>926; share3 total947.8>926 and
baseline-misses67.8>64 normalized. Full logs accounted all3 budget lines.
Completion050ed203 failed on that basis; observer retained. First repair
c4259d055cfe87bdac9361c2e35df8eaf0387900 reduced payload fixture6849→391
files using existing materializer, retaining370 paths/bytes and real installer.
All11 consumers and payload witness passed; baseline-misses62.58→53.22local
seconds (15%, uncontrolled caches), below proposed15s saving. Retained as
useful partial improvement; independent refactor clean;10active minutes.
Current run43733461911/c425 still fails shares2/3 at953.2/938.4 normalized;
full logs contain only aggregate budget breaches, no assertion/timeout/per-job
failure. Final diagnostic has no unfinished gap. Observer completion failed
exact c425 and retained coverage. CI timings: native family109.4/79.0/116.4
observed across shares; previous successful ancestor379.8 total is not current.
Remaining normalized gaps27.2/12.4 require another cost removal. Slice5 is
the one next bounded experiment; setup breadth, not sessions/proof, changes.
Second stash save clean (no entry):
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-EPdyqQ/record.json`.
Current evidence: `/tmp/dough374-ci2-final-diagnostic.json`, ci2-job{2,3}.log and ci2-times; analysis8active minutes. Localmac AC, prior load5.22/6.21/8.36,
58% free memory; no competing owned heavy proof. Reconsider before launch.

## Awaiting story review
Scope keeps CI matrix unchanged. Current normalized sum2791.64 exceeds
3×926=2778; retained trials do not establish a sufficient three-share repair.
Reviewable alternative: /tmp/dough374-four-shares-review.patch (matrix+example),
all642 jobs exactly once at4shares; predicted headroom244.6/244.6/244.7/244.7.
Human decision: permit4shares, or retain3and continue deeper optimization.
