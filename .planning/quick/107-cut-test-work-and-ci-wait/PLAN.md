# Cut total test work and the CI verdict wait, and keep them within budget

## Source

**Identity:** SEED-037#fourfold-local-suite

[Refined story](../../seeds/SEED-037-quiet-stable-fast-tests.md#fourfold-local-suite),
refined and planned on 2026-09-26. It continues plan 096's decisive
checkpoint (recoverable from Git at
`59b21d7^:.planning/quick/096-quiet-stable-fast-tests/PLAN.md`), whose
unexecuted slices 10–12 and three independent findings moved here. First queued story;
preparation grants no Take or execution. On 2026-09-26, at the checkpoint
after slice 2, the maintainer merged
[SEED-037#fewer-installer-runs-per-promise](../../seeds/SEED-037-quiet-stable-fast-tests.md#fewer-installer-runs-per-promise)
into this story (slice 3) and kept the targets.

## Goal and scope

Every revision an agent publishes reaches its CI verdict sooner, the complete
local suite does less total work, and a budget check keeps both from creeping
back as tests are added.

### Included

- Registering a pushed revision makes the CI observer check at once; periodic
  polling continues for runs still in progress.
- Cheaper tests that prove the same promises: the installer and updater
  itself, the workspace-publication and preparation-assignment suites, and any
  other family the baseline profile shows to be a dominant removable cost.
- Fewer installer and updater runs per promise, including the 24-run
  Cursor-only protection matrix in `story-payload-update.sh`, where another
  run still observes the same promise at the same boundary and the maintainer
  approved the coverage map.
- A committed time budget, one ceiling for any single job and one for the
  total, enforced in CI and reported locally.

### Material exclusions

- Dashboard Playwright time. It runs in parallel with the CI `test` job and
  does not set the verdict time.
- Machine-specific speedups that do not reach CI, such as the macOS git
  launcher-stub workaround.
- Release-fixture reuse and repository-copy setup (plan 096 slices 10 and 11),
  measured at about 1 s and 4–5 s of wall and not worth doing.
- Retries, loosened assertions, skips, or a longer timeout used only to hide a
  cause.

### Assumptions

- CI runs on every branch push and accepts `workflow_dispatch`, so the story
  branch's own CI runs supply the CI measurement and budget calibration
  without publishing to `main`.
- GitHub's `ubuntu-24.04` runner has fewer cores than the local machine, so
  total work, not local parallelism, decides the CI time.

## Context and architecture

- **Observer wake (PFE).** `watchCiExecution` (`watch-ci-execution.mjs`)
  sleeps `pollMs = 30_000` between polls; only the abort signal interrupts the
  sleep. `register-push` (`ci-mailbox.mjs`) and managed delivery
  (`execution-increment-delivery.mjs`, `execution-increment-resume.mjs`) record
  a revision through `registerPushedRevision`, which writes
  `coverage/<sha>.json` inside the worker's mailbox directory.
  `runMailboxWorker` already watches that directory with `fs.watch` plus a
  100 ms fallback interval to notice `stop`. Reuse that pattern to interrupt
  the watcher's sleep when a registration lands. Keep the wake inside the
  existing worker and watcher: no new process, socket, or signal protocol,
  and no second way to register.
- **Timing data.** `scripts/test.sh` already times each job with
  `EPOCHREALTIME` and writes `OPEN_DOUGH_TEST_TIMES`. The budget check reads
  those same times; no second timer.
- **Output rule.** Plan 096 made a passing run silent, and any output from a
  passing check fails it. The budget check keeps a within-budget run silent.
  Locally, an over-budget report is the runner's own diagnostic on an abnormal
  run, not check output, and does not fail the run.
- **Architecture.** Existing structure is sufficient; no new North Star topic
  or ADR is needed. The observer change stays within the
  [North Star](../../NORTH-STAR.md)'s CI coverage concept, which observes a
  specific published revision and is owned by the existing observer. Runtime
  source edits stay under `src/skills/`
  ([maintainer guidance](../../../AGENTS.md)).

## Outside-in proof

**Measurement conditions (relative, per the maintainer's standing
instruction).** Keep the start revision, the revision execution starts from,
as a detached reference checkout. Every measurement judged against a target
runs the start revision and the candidate alternately under the same load,
three runs each, recording the 1-minute load at each start. Use Bash 5 first
on `PATH`, `npm ci` dependencies, and the default job count. Also record both
sides' `OPEN_DOUGH_TEST_TIMES` files.

**Baseline before slice 1.** Before dispatching any change, record in
Learnings:
- the start revision;
- one profiled `npm test` run's per-job times, used for the family analysis;
- the CI `Run test` step times of the last six successful `main` runs up to
  the start revision. At planning time (2026-09-26) that median was about
  190 s, ranging 168–208 s.

The planning profile in Learnings is not this baseline.

| Key example (seed) | Slice | Observation |
| --- | --- | --- |
| 1. Finished run → verdict at once | 1 | Mailbox journey with an injected poll interval far longer than the test's own lifetime: the registered finished revision's verdict still arrives, so only the wake can have delivered it |
| 2. Run in progress → polling continues | 1 | Same journey: a registration whose run is still in progress gets its verdict from a later poll after the run completes |
| Verdict delay removed for the installed wait | 1 | `execution-payload-update.sh`: the `.claude/skills` `await-revision` no longer takes about 30 s (paired job time in Learnings) |
| 3. CI `Run test` median ≤ 120 s | 7 | At least three CI runs of the delivered candidate on the story branch (push or `workflow_dispatch`); step times and median in Learnings |
| 4. Total local work ≥ 35% less | 7 | Paired runs: the candidate's median total job-seconds ≤ 0.65 × the start revision's |
| 5. Over budget → CI fails, naming job, time, and ceiling; locally prints and passes | 8 | Runner tests with substitute checks and a budget small enough to exceed; CI mode fails, local mode passes and reports |
| 6. Within budget → silent | 8 | Runner test within budget prints nothing; the delivered candidate's CI run passes without any budget output |
| Each promise observed with fewer installer runs | 3 | Maintainer-approved coverage map: every removed run names the surviving test that observes the same promise at the same boundary; the remaining checks pass silently |
| Quiet, stable, same proofs | 2–7 | Each kept experiment names the promise and its surviving proof in Learnings; five consecutive silent passing complete local runs in slice 7 |

## Current decisions

- **Measure what CI pays.** Total job-seconds, not local wall time, is the
  local target, and the CI `Run test` step median is the CI target. Local wall
  time is recorded but judges nothing.
- **No lost wake.** A registration that lands while a poll is in flight must
  cause one more immediate check after that poll. The wake only shortens the
  sleep: poll errors, the budget, and abort keep their existing behavior.
- **Two-number budget.** A committed budget file holds one per-job ceiling and
  one total ceiling for the CI runner. It holds no per-test table, so adding a
  test needs no budget edit unless it breaks a ceiling. Set both from the
  delivered candidate's CI times with headroom for runner variance, at least
  1.5× the largest observed value, and record the calibration runs in
  Learnings. Raising either number is an explicit, reviewed edit.
- **CI enforces; local reports.** The runner fails the CI `test` job on a
  breach (CI sets `CI=true`) and only reports it locally. Choose the smallest
  existing switch; do not add a configuration format.
- **Experiments follow `dough-test-optimization`.** Each experiment slice
  hypothesizes across its family, measures a focused paired before/after,
  keeps only a supported saving, and records the surviving proof for any
  changed case. Replace a slice's hypothesis with the dominant cost the
  baseline profile shows, and record why, before starting it.
- **Coverage map before removal.** Slice 3 removes an installer or updater
  run only after the maintainer approves a promise-to-run map in which each
  proposed removal names the surviving test that observes the same promise at
  the same boundary (the seed's rejection constraint). The map is a stop for
  review, not a proof by itself.
- **Decisive checkpoints.** After each of slices 2 through 6, compare
  paired total job-seconds with the 0.65 target and estimate the CI time on
  about four cores. If the recorded remaining experiments cannot plausibly
  close the gap, record the measurement, gap, invalidated assumption, and
  remaining candidates here, and stop for the maintainer before the next
  experiment. Slice 1 and any kept savings remain delivered either way; slice
  7 then records what was achieved, and slice 8 may still set the budget from
  it.
- **Stable means cause-fixed**, as in plan 096: a destabilized test gets its
  cause fixed, never a retry or a lower default.

## Checkpoint after slice 2 (2026-09-26): resolved by the maintainer

- **Measurement.** Paired installer and updater family, start revision versus
  candidate, three alternating runs each at loads 9–13, six in parallel:
  283.4/176.8, 303.2/174.1, 292.3/177.7 job-seconds; medians 292.3 versus
  176.8, ratio 0.605. The full candidate suite passed silently at 1,854.4
  job-seconds (load 10.9; unpaired). Estimated paired suite total: the other
  jobs' baseline 1,241 plus the family at 0.605 × 792 ≈ 479, about 1,720
  job-seconds, 0.85 of the start revision. The 0.65 target is about 1,321, a
  gap of about 400 job-seconds. At the baseline's CI rate (2,033 job-seconds
  in a 174 s `Run test` median) 1,720 is roughly 147 s against the 120 s
  target.
- **Gap versus remaining experiments.** Slice 3's family
  (`workspace-publication*`) is 271.9 baseline job-seconds and slice 4's
  (`preparation-assignment-*`) 128.1, 400 together: closing the gap would need
  essentially all of both. Substituting the larger native-evidence shell
  family (`native-*.sh`, `git-publication-native.sh`, 350.6) for slice 4 still
  needs a 64% cut across 622 job-seconds, while the installer family, with the
  best-evidenced hypotheses, yielded 40%.
- **Invalidated assumption.** The targets (35% less total work, 120 s CI
  median) were assumed reachable without fewer installer runs per promise. The
  remaining installer cost is dominated by the number of installer and updater
  runs (Node starts, release fetches, fixture commits per run), which
  [SEED-037#fewer-installer-runs-per-promise](../../seeds/SEED-037-quiet-stable-fast-tests.md#fewer-installer-runs-per-promise)
  owns.
- **Remaining candidates.** Slice 3 (workspace publication, 272), slice 4
  (preparation assignment, 128), the native-evidence shell family (351), and
  the fewer-installer-runs story. Slices 1 and 2 stay delivered.
- **Decision needed.** Whether to continue slices 3–4 toward a lower accepted
  target, change the targets, bring the fewer-installer-runs work into this
  story, or close this story at slices 1–2 plus the budget (slice 6) set from
  the achieved times.
- **Resolution (maintainer, 2026-09-26).** Keep both targets; they are not the
  cause of the gap. Continue the workspace-publication and
  preparation-assignment experiments, and bring the fewer-installer-runs work
  into this story as slice 3, whose coverage map the maintainer reviews
  before any run is removed. The remaining installer family (about 479
  job-seconds) plus the two experiment families (400) make the roughly 400
  job-second gap plausible to close; the next checkpoint follows slice 3.
  Slice numbers above, in Preparation review, and in earlier Learnings are
  as they were before this resolution: workspace publication and preparation
  assignment are now slices 4 and 5, measurement 6, and the budget 7.

## Checkpoint after slice 4 (2026-09-26): stopped for the maintainer

- **Measurement.** Slice 4 kept one change, about 5% of its family (paired
  medians against the start revision 121.4 → 115.5, ratio 0.951). The family
  is dominated by the product's own git processes: about 90 per real
  `execution-start`, 99.5 of 124 git-seconds, which the journeys must
  exercise. About half of the local git cost is the macOS `/usr/bin/git`
  stub, which CI does not pay.
- **Gap.** About 400 job-seconds remained after slice 2. Slice 4 contributes
  about 13. Slice 3's approved map is estimated at 150–210 but is blocked on
  permission. Slice 5's shared fixture saving is already counted in slice 4;
  the rest of that family is product git volume (3,122 calls). Even with
  slice 3 the local target stays about 180–230 job-seconds short.
- **Invalidated assumption.** That the workspace-publication and
  preparation-assignment families hold removable test-side cost; their cost
  is the product's git plumbing per start.
- **Remaining candidates, each needing a decision.** Batch the ongoing-
  operation checks in `maintain-default-checkout.mjs` (about 12 of ~90 calls
  per start; dangling `MERGE_HEAD`, git ≥ 2.46, and reftable semantics
  differ); batch source reads with `cat-file --batch` (about 9 per start;
  tree paths and conflicted entries differ); exactly safe `merge-base` and
  lock-path reuse (about 4 per start); fold 2–3 overlapping real starts.
  Together about 50–60 suite job-seconds. The CI target may be closer than
  the local one because of the git stub; story-branch CI runs will show it.
- **Decision needed.** Unblock slice 3; then whether to pursue the product
  git reductions, accept lower targets, or proceed to measurement and the
  budget (slices 6–7) with what is achieved.
- **Resolution (maintainer, 2026-09-26).** Make slice 3's approved removals,
  and cut git calls in the startup code: slice 5 becomes "Execution startup
  and preparation make fewer git calls", covering the product git volume
  behind both the workspace-publication and preparation-assignment families.
  Prefer exactly preserving changes; do not require git ≥ 2.46 or assume
  file-backed refs; report any remaining edge-case difference to the
  maintainer.

## Checkpoint after slice 6 measurement (2026-09-26): stopped for the maintainer

- **Measurement.** CI `Run test` median 142 s over three runs of the delivered
  candidate (target 120 s, baseline 174 s; ratio 0.82). Local paired total
  work about 0.90 of the start revision under unrelated load of 30–118
  (target 0.65); weak evidence at that load, consistent with CI's 0.82.
- **Gap.** About 22 s of CI time, roughly 15% more of the suite's work.
- **Invalidated assumption.** That per-run savings, fewer installer runs, and
  cheaper startup git would together reach both targets.
- **Remaining candidates, each needing a decision.** Fewer `git fetch` calls
  per `execution-start` (7 per start; changes remote freshness); the
  native-evidence shell family (`native-*.sh`, `git-publication-native.sh`,
  about 351 baseline job-seconds, not yet profiled); per-job CI times from a
  times artifact to find CI's own dominant jobs; or accept the achieved times
  and set the budget (slice 7) from them.
- **Resolution (maintainer, 2026-09-26).** Pursue whatever moves the CI
  verdict target most. The coordinator chose: keep CI's per-job times as a
  workflow artifact now (part of the budget slice, landing early) to see
  CI's dominant jobs, and add slice 6 for the native-evidence shell family,
  the largest unexamined block. Fewer fetches per start stays out unless the
  gap remains, because it saves little and changes remote freshness.
  Measurement becomes slice 7 and the budget slice 8.

## Ordered slices

### 1. Registering a pushed revision makes the CI observer check at once

Type: Behavior
Status: done
Proof:
- Extend the mailbox await journey (`ci-mailbox-await.test.mjs` and its case
  modules, or the closest existing worker journey) with the real mailbox
  worker and the controlled command adapter. Inject a poll interval longer than
  the test can run, register a revision whose run has already finished, and
  observe its verdict event. Before the change, show that the same case
  gets no verdict within a bound well below the injected interval.
- Same journey: register a revision whose run is still in progress, then let
  it finish; the verdict arrives from a later poll.
- Focused `watch-ci-execution*.test.mjs` cases: a registration during an
  in-flight poll causes one more immediate check; error, budget, and abort
  behavior are unchanged.
- `tests/execution-payload-update.sh` passes, and its `.claude/skills`
  installed `await-revision` no longer waits about 30 s. Record the paired job
  times.
- Update `references/ci-monitor.md` (and any other reference that states the
  wait) where it describes when a verdict becomes available.

Behavior: an agent registers a pushed revision whose CI run has already
finished → the running observer checks immediately and delivers that
revision's verdict, instead of after the next 30-second poll. A revision still
in CI is picked up by later polls as before.

### 2. Installer and updater checks cost less per run

Type: Behavior
Status: done
Proof:
- Every installer, updater, and payload check passes silently with unchanged
  assertions, including `install-all-tools.sh`, `story-payload-update.sh`,
  `execution-payload-update.sh`, `product-backlog-payload-update.sh`,
  `retrospective-reference-payload.sh`, `self-installation-baseline.sh`, and
  `update-*.sh`. Each check keeps the same number of installer and updater runs.
- A focused paired before/after of this family's summed job-seconds is
  recorded in Learnings, with the kept changes and their surviving proof.

Behavior: the developer or CI runs the suite → each installer or updater run,
and the assertions around it, cost less, and every installation and update
promise is proved exactly as before.

Hypotheses to test first, in order of the baseline profile: process forks and
git calls inside `install.sh` and the update path; per-file copying and
comparison (`assert_payload`'s one `cmp` per managed file, about 3 s per
calling check); repeated identical setup across one check's runs. Speeding up
`install.sh` itself changes the product; its own installation and update
checks are the proof, and its user-visible behavior must not change. Decisive
checkpoint afterwards.

### 3. Installer and updater checks prove each promise with fewer runs

Type: Behavior
Status: done
Proof:
- Coverage map, then stop: for each installer and updater check, list every
  `install.sh` and `apply` run, the promise it observes, and the boundary it
  observes it at; propose removals, each naming the surviving test that still
  observes that promise at that boundary. Record the map in Learnings and stop
  for the maintainer's approval before removing any run.
- After approval, remove only approved runs. Every installer, updater, and
  payload check passes silently with its remaining assertions unchanged.
- A focused paired before/after of the family's summed job-seconds against the
  slice 2 candidate is recorded in Learnings, with the approved removals.

Behavior: the developer or CI runs the suite → every installation and update
promise is still observed at its boundary, with fewer installer and updater
runs.

Start with the 24-run Cursor-only protection matrix in
`story-payload-update.sh` (about 30 runs in that check), then the other
payload-update checks. Decisive checkpoint afterwards.

### 4. Workspace-publication suites cost less

Type: Behavior
Status: done
Proof:
- `workspace-publication*.test.mjs`, including the
  `workspace-publication-startup-*` files, pass silently with unchanged
  promises.
- A focused paired before/after of the family's summed job-seconds is
  recorded in Learnings, with the kept changes and surviving proof.

Behavior: the developer or CI runs the suite → the workspace-publication
journeys prove the same promises with less work.

Start by profiling where these suites spend their time: git processes against
the local bare remote, product process starts, or waits. If the baseline
profile ranks another family above this one, replace it here and record why.
Decisive checkpoint afterwards.

### 5. Execution startup and preparation make fewer git calls

Type: Behavior
Status: done
Proof:
- Every `workspace-publication*.test.mjs`,
  `preparation-assignment-*.test.mjs`, `maintain-default-checkout*`,
  execution-source, and native publication check passes silently with
  unchanged promises; every caller of a changed shared git helper is run.
- A git-call count per accepted `execution-start` before and after (PATH
  wrapper, as in slice 4's profile), and a focused paired before/after of the
  workspace-publication plus preparation-assignment families' summed
  job-seconds, recorded in Learnings with each kept change.
- Each changed git read states whether it is exactly equivalent; any
  remaining semantic difference (for example dangling `MERGE_HEAD`,
  conflicted index entries, tree paths) is listed for the maintainer.

Behavior: an agent starts or prepares queued work → the same claims,
refreshes, refusals, and recoveries happen with fewer git processes, so both
agents and the suite pay less per start.

Candidates from slice 4's profile: merge-base and `index.lock` path reuse
(exact, about 4 calls per start); the ongoing-operation checks in
`maintain-default-checkout.mjs` (about 12 of ~90 per start); batched
published and local source reads (about 9 per start); then the
preparation-assignment family's `rev-parse` volume (951 of 3,122 calls).
Do not require git ≥ 2.46 or file-backed refs. Decisive checkpoint
afterwards.

### 6. Native-evidence checks cost less

Type: Behavior
Status: done
Proof:
- Every `tests/native-*.sh` and `tests/git-publication-native.sh` check, and
  every check sourcing a changed helper, passes silently with unchanged
  promises.
- A focused paired before/after of the family's summed job-seconds is
  recorded in Learnings, with the kept changes and surviving proof, and CI's
  per-job times for the family when the artifact is available.

Behavior: the developer or CI runs the suite → the native-evidence checks
prove the same promises with less work.

Profile first: installs, fixture repositories, and product process starts per
check. Baseline job-seconds (start revision): `native-delivery-updated-use-adapters.sh`
74.4, `native-stream-completeness.sh` 70.3, `git-publication-native.sh` 62.2,
`native-delivery-updated-use.sh` 47.9, `native-result-retention.sh` 43.8,
family about 351. Decisive checkpoint afterwards.

### 6b. CI observer journeys wait on events, not elapsed time

Type: Behavior
Status: done
Proof:
- `ci-mailbox-*.test.mjs`, `ci-command-adapter-*.test.mjs`, and every other
  CI observer journey pass silently with unchanged promises, including at 50
  parallel copies on a loaded machine where they now time out.
- A focused paired before/after of the family's summed job-seconds is
  recorded in Learnings, with CI per-job times from the artifact.

Behavior: the developer or CI runs the suite → the CI observer journeys prove
the same promises by waiting for the events they observe rather than fixed
intervals and elapsed-time bounds, so they cost less and stay stable under
load.

Added at the checkpoint after slice 6 (maintainer: pursue what moves the CI
target most). CI per-job times for `e335f77` rank `ci-mailbox-complete.test.mjs`
third (16.3 s) and `ci-mailbox-launch.test.mjs` 11.0 s, and a refactor pass
saw `waitFor` timeouts in `ci-mailbox-complete` at 50 parallel copies under
load, before and after the liveness repair. Decisive checkpoint afterwards.

### 7. The delivered suite meets the CI and total-work targets, confirmed by repeated runs

Type: Behavior
Status: done — CI target met; local total-work target accepted short by the maintainer
Proof:
- Paired measurement under **Measurement conditions**: the candidate's median
  total job-seconds ≤ 0.65 × the start revision's. Record both sides, the
  loads, and local wall times.
- At least three CI runs of the delivered candidate: `Run test` step median
  ≤ 120 s. Record each run's per-job times; slice 8 calibrates the budget
  from them.
- Five consecutive complete local runs (`npm test`) pass silently.
- Learnings list every kept experiment's saving and surviving proof.

Behavior: an agent publishes a revision → CI's test step returns its verdict in
at most 120 s by median, and a developer's complete local run does at least
35% less work than at the start revision, with the same quiet, stable proof.

### 8. A committed time budget fails CI when a job or the total exceeds it

Type: Behavior
Status: done
Proof:
- Runner tests in the existing `tests/test-runner-*.sh` style with substitute
  checks:
  - over the per-job ceiling in CI mode → non-zero exit, naming the job, its
    time, and the ceiling;
  - over the total ceiling → non-zero exit, naming the total and its ceiling;
  - the same breaches in local mode → exit 0 with the same report;
  - within budget → no output.
- The CI `test` job keeps its per-job times file as a short-lived workflow
  artifact, so calibration reads CI's own times rather than local ones.
  Ceilings come from slice 7's CI runs; record them and the calibration in
  Learnings.
- The delivered candidate's CI `test` job passes within budget and prints
  nothing about it.
- `tests/README.md` states where the budget lives, what a breach looks like,
  and that raising it is a reviewed edit.

Behavior: a change makes a job or the whole suite exceed the committed budget
→ the CI `test` job fails with a message naming what is over budget; locally
the run still passes and prints the same comparison. A run within budget
prints nothing.

Dispatch after slice 7, or after a checkpoint stop, so the ceilings reflect
the achieved times. The CI times artifact may land earlier, with slice 7, if
its CI runs need it.

## Execution complete

Product advice: The CI verdict wait for agents publishing to trunk fell from a
174 s to a 115 s `Run test` median, which directly serves the near-future
direction of parallel agents on trunk. Give the four installation coverage
gaps recorded in Learnings (refusing a requested version, `apply` with an
unsupported platform, updating a Claude-only installation, installing without
Node) a home, likely in SEED-001; route the `ensureDriverRegistered` defect
(writes `.git/info/attributes` without creating `info/`) through bug fixing;
decide whether the local budget report should stay (it prints on most local
runs because the ceilings are CI-calibrated) or become CI-only. Correction
plan `slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md`
fixes the stop regression and duplicated mechanics; it is planned and ready
but not queued. Fewer fetches per start: no change now. Wrap-up must
reconcile trunk's relocation of this plan to `slice-plans/107-…` with this
branch's `quick/107-…` copy.

## Promise ownership

- Immediate check on registration and continued polling: slice 1.
- CI test time ≤ 120 s median: slices 2–6 (savings), slice 7 (measurement).
- Total local work ≥ 35% less: slices 1–6 (savings), slice 7 (measurement).
- Each installation and update promise observed with fewer runs: slice 3.
- Budget guard, its breach report, and a silent within-budget run: slice 8,
  including the delivered candidate's CI run.
- Quiet, stable, same proofs: every slice's surviving-proof record; slice 7's
  repeated runs.

The deferred promises have no slice.

## Preparation review

- Refined on 2026-09-26: the first draft's combined publication and
  preparation-assignment slice was split (no evidenced shared cost), and the
  budget now follows the final measurement so both use the same CI runs of
  the delivered candidate. Six slices; every promise has one owner.
- Non-blocking concerns. The targets (120 s CI median, 35% less total work)
  are the maintainer-accepted proposal from refinement, not yet shown
  reachable without fewer installer runs; the decisive checkpoints after
  slices 2–4 own that risk. Slice 2 changes `install.sh` itself and is the
  least certain in size; its checkpoint bounds it.

## Execution

Story Branch Mode. Workspace `.worktrees/107-cut-test-work-and-ci-wait` on
`claude/107-cut-test-work-and-ci-wait`, pushed to `origin`; claim published on
`origin/main` as `489396e` (starting revision `025e9fa`), CI unobserved for
the claim. Reference checkout for paired measurement: detached
`.worktrees/107-reference` at `489396e`.

## Learnings

- **Baseline (start revision `489396e`).** 2026-09-26, Apple M4 Max (16
  cores), Bash 5 first on `PATH`, default job count, 1-minute load 5.2 at
  start. One profiled `npm test` passed in 131 s wall; 198 jobs summed to
  2,033.1 job-seconds. Top jobs: `workspace-publication.test.mjs` 100.1,
  `story-payload-update.sh` 100.0, `install-all-tools.sh` 94.0,
  `execution-payload-update.sh` 90.4, `product-backlog-payload-update.sh`
  88.2, `native-delivery-updated-use-adapters.sh` 74.4,
  `native-stream-completeness.sh` 70.3, `retrospective-reference-payload.sh`
  68.1, `self-installation-baseline.sh` 63.5, `git-publication-native.sh`
  62.2; `workspace-publication-startup-*` 24–49 each;
  `preparation-assignment-*` about 22 each. The native-evidence shell family
  (`native-*.sh`, `git-publication-native.sh`) is a candidate replacement for
  slice 3 or 4 if profiling ranks it higher. CI `Run test` step of the last six
  successful `main` runs (`36206088697`…`36210067165`, through `ee40a7e`; later
  commits are planning-only): 189, 155, 180, 131, 208, 168 s, median 174 s.
- **Planning profile, not the baseline.** 2026-09-26 at `a339d41`, Apple M4
  Max (16 cores), Bash 5.3.20, load average 24–31 from unrelated agents.
  `npm test` passed in 135 s wall; 197 jobs summed to 2,079 job-seconds under
  that contention. Only the relative weights are usable: `story-payload-update.sh`
  102.5, `install-all-tools.sh` 100.9, `workspace-publication.test.mjs` 98.5,
  `execution-payload-update.sh` 90.2, `product-backlog-payload-update.sh`
  87.7, `native-delivery-updated-use-adapters.sh` 72.3,
  `retrospective-reference-payload.sh` 67.9, `git-publication-native.sh`
  66.8, `self-installation-baseline.sh` 64.1, `native-stream-completeness.sh`
  63.1; the `workspace-publication-startup-*` files 24–47 each; the
  `preparation-assignment-*` files about 23 each.
- **Growth.** Shell and Node test files went from 186 at the twofold delivery
  (`6494de2`) to 196 at planning time, which is why the target is a budget
  rather than a fixed ratio against `bad3717`.
- **Plan 096 evidence carried forward.** Jobs alone summed to about 632 s
  with an effective parallelism of about 6 at 16 slots; the `.claude/skills`
  installed `await-revision` took 30.05 s against 0.40 s for `.agents/skills`
  because the observer polled before `register-push` landed and then slept a
  full interval.
- **Slice 1 delivered.** Each poll arms a registration wake before it runs;
  the mailbox worker's existing `fs.watch` plus 100 ms fallback
  (`ci-mailbox-change-watch.mjs`) aborts it when a new SHA name appears in
  `coverage/`, ending the post-poll pause. Error retries, budget, and abort
  are unchanged. Proof: `ci-mailbox-await-wake-cases.mjs` (finished run →
  verdict within 5 s against a 600 s interval; failed before the change with
  `unresolvedReason: timeout`; in-progress run → later poll) and
  `watch-ci-execution-wake.test.mjs` (one extra check after an in-flight
  registration; error, budget, abort). Poll-count assertions in the
  revision-coverage and custom-bridge journeys now count relative to the
  extra check. The installed `.claude/skills` 30 s wait was a race, not a
  constant: 1 of 3 traced reference runs versus 0 of 9 candidate runs (await
  ≤ 0.4 s). Paired `execution-payload-update.sh` job times, reference versus
  candidate at loads 5–10: 47.0/16.1, 16.2/16.4, 17.3/16.6 s. A new script
  under `src/skills/*/scripts` needs its `install.sh` `managed_files` entry.
- **Slice 2 delivered.** Profiling (timestamped `PS4`, process counts) showed
  about 26,700 per-file `cmp` calls, 1,280 Node starts, and 225 release plus
  225 baseline fetches across the family. Kept changes, each with a paired
  saving (three alternating pairs, loads matched within a pair; the whole
  family in parallel unless noted): the updater compares an unchanged payload
  in one Node `match` inside the single declaration walk (focused, 62.1 →
  48.1 s median on five checks); the installer copies and verifies in one
  Node process (`copy-then-match`, 221.5 → 210.8 s); the updater fetches each
  recorded release once and reuses a clean fetched tagged tree, never a
  supplied `--checkout` (225.7 → 202.4 s); `assert_payload` and three
  per-file `cmp` loops use one Node match with a `cmp` fallback that names the
  file (focused, 54.9 → 42.5 s); `install-all-tools.sh` reads all mtimes with
  one `stat` (33.1 → 11.5 s); path-state snapshots hash 512 files per
  `shasum` (focused, 50.2 → 46.2 s); fixture copies use one Node copy (10.7 →
  5.1 s on three checks). Every check keeps its installer and updater run
  count and assertions; `assert_payload` now reports "mismatch under <root>"
  after `cmp`'s line naming the file. Refactor: recorded-release baseline
  verification moved to `src/install/open-dough-release-baseline.sh`, and the
  uncalled `require_ordinary_recorded_baseline` was removed. Two C2 ablation
  runs straddled an external load spike (a VM and Spotlight, load 13 → 66)
  and were retaken; a pair whose sides start at very different loads is not
  comparable.
- **Slice 3 coverage map, approved by the maintainer on 2026-09-26.** Basis
  read in source: the `codex` and `cursor` hints map to the same
  `.agents/skills/dough-update` destination and the installer always walks the
  full two-root topology, so they differ only in argv; `claude` reads the
  `.claude` entry root and is kept wherever it carries that boundary. One
  `install.sh` `managed_files` declaration drives both delivery and protection;
  edit and remove take different branches, as do the two newly-managed-path
  collision branches. Approved: (A) remove Codex iterations that repeat Cursor
  (and the Cursor iteration of `install-refuses-unsafe-topology.sh`), narrow
  `story-payload-update.sh`'s 24-run protection matrix to (problem-decomposition,
  edit) and (planning, remove), and drop 10 `--force` repeats in
  `install-ci-host-hooks.sh`'s refusal helper, keeping them for the edited
  handler and the settings symlink; (B) `story-payload-update.sh` alone owns
  "an edited or removed managed file in the sibling root is refused by update
  and repeat install, and force restores it", and the product-backlog,
  retrospective-reference, and execution payload checks keep only their
  delivery assertions; (C) the unsafe-topology per-skill list shrinks to
  dough-update, dough-adr-awareness, and dough-story-wrap-up; drop the
  retrospective reference's fresh-install run, the injected
  `OPEN_DOUGH_INSTALL_FAULT=record` cases together with that now-dead product
  hook, and the tab-suffix equal-version `apply` case; (D) repeated setup
  installs and applies become copies of one prepared target. Estimated saving
  about 37% of the family (sequential 143 → about 90 s). Reported coverage
  gaps, not fixed here: no test observes refusing a requested version, `apply`
  with an unsupported platform, updating a Claude-only installation from the
  Claude entry, or the installer without Node.
- **Slice 4 delivered.** The workspace-publication fixture builds the queued
  trunk once per test process per CONTRIBUTING text and copies it, repointing
  the copy's `origin` (micro-benchmark 187.9 → 41.7 ms per trunk, three pairs;
  about 7.6 s per family run); the durable-evidence path still builds in
  place. Consumers `workspace-publication*`, `preparation-assignment-*`,
  `git-publication-native.sh`, and `native-evidence-identity.sh` pass
  silently; the full suite passed silently at 1,997.8 job-seconds (load 14.1).
  Profile: about 5,500 git calls in the family, 4,345 from 61 real starts.
  Incidental possible defect, not fixed: `ensureDriverRegistered`
  (`src/skills/dough-product-backlog/scripts/product-backlog-git-repository.mjs`)
  writes `.git/info/attributes` without creating `info/`, failing with ENOENT
  on a repository initialized without templates.
- **Slice 3 delivered.** The approved map was applied by the coordinator on
  the maintainer's direct instruction (the host's permission check had
  refused the same edits to an implementation agent acting on the
  coordinator's message). `story-payload-update.sh` alone owns sibling-root
  protection with one edited and one removed file; negative controls in a
  scratch copy showed each kept case failing when, respectively, byte
  comparison or missing-file detection in `managed_payload_unchanged` was
  disabled. The `OPEN_DOUGH_INSTALL_FAULT=record` hook was removed from
  `src/install/open-dough-platform.sh`. Three update checks install once and
  copy the prepared target per case. Refactor: the always-true guard in
  `install-all-tools.sh` and the no-op `open-dough-release-version.sh`
  declaration filters were removed. Paired installer family against
  `c2e340d`, six in parallel, pairs with loads within 30%: 244.8/169.4,
  251.0/145.4, 386.4/247.9 job-seconds; medians 251.0 versus 169.4, ratio
  0.675. Standalone: `story-payload-update.sh` 17.3 → 9.5 s,
  `product-backlog-payload-update.sh` 15.0 → 4.1 s. An isolated full suite of
  exactly this change passed silently. A full suite in the shared checkout
  failed three payload-comparing checks while slice 5's product edits were
  in progress there; the isolated run without those edits passed, so that
  failure belongs to slice 5's proof. Concurrent slices whose checks install
  and compare `src/skills` must not share a checkout during full-suite proof.
- **Slice 5 delivered.** Git calls per accepted `execution-start` 89 → 71
  (trunk) and 91 → 73 (story branch); preparation `start` 52 → 42; the two
  families' git calls 8,007 → 6,741. Kept, each exact unless noted: the
  pre-fetch state is read only when refresh stops early; one `rev-parse
  --git-path index.lock -q --verify MERGE_HEAD` answers the lock path and the
  first in-progress ref, falling back to separate reads on any other failure
  (checked for absent, present, dangling, and branch-named `MERGE_HEAD`, in a
  linked worktree and outside a repository); one `rev-parse HEAD <remote>
  --symbolic-full-name HEAD` reads the post-fetch state, falling back on any
  other shape; local story and plan reads use one `merge-base` and one
  `cat-file --batch`, falling back to `git show` per name for anything but a
  blob of at most 256 KiB (identical to `git show` on 14 cases); preparation
  start reads the recorded allocation once; the authorship report reuses the
  value `configureAgentAuthorship` read (differs only if another process
  edits the shared `core.bare`/`core.worktree` during a start). A new
  maintenance test pins in-progress refs, dangling `MERGE_HEAD`, and detached
  HEAD outcomes (passes on the old code). Paired families (17 files, eight in
  parallel) against `c2e340d`: 236.7/183.1, 286.1/192.5, 277.7/212.3, and an
  extra 314.1/239.5 job-seconds; about 23–24% less excluding a pair that ran
  through a load spike. Rejected: one `merge-base --all` for ahead/behind (not
  exact) and fewer fetches per start (a freshness decision). The three
  payload-comparing failures seen earlier in the shared checkout did not
  recur on the final candidate.
- **Slice 6 measurement (in progress).** CI `Run test` for the delivered
  candidate `1318439`: 141 (push), 142 and 148 s (`workflow_dispatch`), median
  142 s against the 174 s baseline median and the 120 s target. Earlier
  single story-branch runs: 204 (`273ae9a`), 172 (`342b939`), 165
  (`c2e340d`), 142 s (`cee3f07`). Local paired full suites, start revision
  versus a detached candidate at `1318439`, under unrelated load of 9–118 on
  16 cores; pairs whose start loads differ by more than 30% or whose candidate
  run failed are excluded: 2,071.9/1,871.2, 2,062.6/1,739.0, 2,208.2/2,512.1,
  3,171.2/2,228.9, 2,237.6/2,010.7, 2,646.0/1,998.2 job-seconds; medians
  2,222.9 versus 2,004.5, ratio 0.90. At that load wall job-seconds largely
  measure CPU contention, so the local ratio is weak evidence; CI's 0.82 is
  the stronger signal. Two defects surfaced: the runner's passing run printed
  Bash's `child setpgid … Operation not permitted` line under load (also on
  the start revision; fixed in `f03d737`), and one candidate run failed
  `execution-increment-managed-delivery.test.mjs` "timed out waiting for
  CI_FAILURE". Measurements in a checkout another agent is editing are
  invalid; use a detached worktree at the candidate.
- **Stability fixes found by slice 6.** The timeout was a fixture race, present
  since before this story: `releaseFailure` created `release.json` before
  writing it, so under load the adapter could parse an empty file, which the
  observer treats as a poll error followed by its full 30 s retry wait
  (reproduced deterministically by widening the window). Release fixtures now
  publish through `publishJson`. Stressing that test exposed a product
  defect: `checkMailboxWorkerLiveness` reported a worker that exited between
  its two `ps` reads (a `<defunct>` zombie) as `unknown` rather than `dead`
  (4 of 1,008 stressed runs); it now reports `unknown` only for a process
  still running, with a new test. After both: 0 of 960 stressed runs.
- **CI per-job times (first artifact, `bedad7a`, run success).** 199 jobs
  summed to 471.8 CI job-seconds and `Run test` took 119 s (about four
  effective slots), so total work sets the CI time. Top jobs: native-stream-completeness
  20.1, native-evidence-identity 19.3, native-delivery-updated-use-adapters
  18.0, git-publication-native 17.2, install-all-tools 15.8,
  story-payload-update 15.2, ci-mailbox-complete 14.7, native-result-retention
  14.1, execution-payload-update 13.0, workspace-publication 12.6,
  native-delivery-updated-use 11.7; the native-evidence family is about 100
  of 472.
- **Slice 6 delivered.** Profile: `native-evidence-identity` spent almost all
  its time in 923 per-file `shasum` starts; the delivery journeys ran about 660
  `cmp` forks per run; `git-publication-native` ran about 3,600 forks from
  field parsing. Kept: one `shasum` per identity input list (output
  byte-identical; `native-evidence-identity` 10.0 → 2.9 s); one Node payload
  compare with a `cmp` fallback naming the file (delivery journeys 43.4 → 30.4
  s); field parsing with a shell `read` loop (`git-publication-native` 16.9 →
  14.3 s; nine edge cases and parser mutations). An install-once-and-copy seam
  (about 1 s) was removed in refactoring because it replaced `install.sh`'s
  config merge with a copy. Paired family (13 checks, six in parallel,
  against `69620a0`): 120.2/95.2, 125.3/99.1, 131.8/108.9 job-seconds;
  medians 125.3 versus 99.1, ratio 0.79. Candidates held for the maintainer:
  dropping `native-stream-completeness.sh`'s three complete runs and its
  claude missing run (about 7 CI job-seconds, needs three assertions moved to
  `native-result-retention.sh`), and release-fixture reuse in this family
  (about 18% of it; excluded by this plan).
- **CI after slice 6 (`e335f77`).** `Run test` 128 (push), 130 and 116 s
  (`workflow_dispatch`; the 116 s run failed), median 128 s. CI job sums
  510.8 and 519.1 against 471.8 on `bedad7a`'s runner: runner-to-runner
  variance (about 9%) exceeds slice 6's saving, so the CI target needs several
  runs. The failure (`ci-mailbox-complete.test.mjs`, liveness `'unknown' !==
  'dead'`) was a product defect: on Linux a node worker whose main thread has
  exited shows state `Sl` with command `[MainThread] <defunct>` while other
  threads unwind (observed in a `node:24` container); any `<defunct>` command
  is now dead (`bb6e850`), with a deterministic test.
- **Slice 6b delivered.** Profile of 49 `ci-*`/`watch-ci*` files (113
  job-seconds): the stop command's 5 s deadline paid in full for a worker
  already gone, macOS's first-run check of each newly written `gh` stub
  (0.12–0.38 s each, serialized under load; the real cause of the load
  timeouts), and deliberate timeout promises. Kept: test waits end on the
  producing process's exit instead of a 5 s bound; the repair test releases a
  real run before registering it (slice 1's wake had made its hand-written
  coverage race the worker); `commandShowsExit` treats `<defunct>` and macOS's
  `(node)` for an exiting process as gone; `stop` ends its terminal-result
  wait once the recorded worker no longer runs (a worker publishes before
  exiting, and the abort path re-checks `result.json`), recording the loss
  with the worker-exit reason, while a live stalled worker keeps the 5 s
  deadline (focused set 35.0 → 20.0 job-seconds); one shared `gh` stub per
  test process (macOS only); two torn-read fixes. `ci-mailbox-complete` at 50
  parallel copies: 0 failures (start revision failed 11 of 16 such runs).
  Paired family: 75.5/57.9, 73.7/56.0, 74.8/56.5 job-seconds; medians 74.8
  versus 56.5, ratio 0.755. Other fixtures with fixed 5 s waits or per-test
  `gh` stubs remain.
- **CI after slice 6b (`47658ff`), five green runs.** `Run test` 106, 108
  (job sums 420.3, 428.7) and 128, 128, 129 s (job sums 510.0–513.8); median
  128 s. GitHub assigned two runner classes about 20% apart; the fast class
  meets the target. On slow runners slice 6b cut `ci-mailbox-complete` 16.3 →
  6.6 s and `ci-mailbox-worker-loss` 6.5 → 2.0 s, but the total stayed about
  512, so reaching 120 s there needs about 35 more CI job-seconds. Next, within
  authority: test-only settings for the deliberate deadlines in
  `ci-mailbox-launch` (5 s) and `ci-command-adapter-unavailable` (3 × 2 s),
  about 11 CI job-seconds. Proposed to the maintainer: native-evidence
  release-fixture reuse (about 16) and the stream-completeness run removals
  (about 7).
- **Maintainer decision (2026-09-26): yes to both proposals.** Lift the
  release-fixture-reuse exclusion for the native-evidence family, and drop
  `native-stream-completeness.sh`'s three complete runs and its claude missing
  run. Applied by the coordinator: `native-result-retention.sh`'s clear runs
  now also assert `execution-reason: native command exited 0`, non-empty
  events and response, and Codex's `item.completed`/`turn.completed` (a
  scratch copy expecting a different event name failed); the missing-stream
  classification is host-independent and cursor and claude share their
  output branch. `native-stream-completeness.sh` standalone about 20 → 10.7 s.
- **Deliberate deadlines and release-fixture reuse.** `f83b163`: a test-only
  `DOUGH_CI_TERMINAL_RESULT_DEADLINE_MS` (default 5 s, pinned by a test) lets
  the missing-publication journey observe its deadline in 300 ms, and the
  unavailable-adapter journey uses a 1 s timeout through `adapterTimeoutMs`
  (worst measured adapter start 300 ms under load; headroom, not an event
  bound); the two files 17.66 → 8.79 s paired. Release-fixture reuse
  (`tests/helpers/fixture-cache.bash`, opt-in per check): each fixture is
  built once per check at `<cache>/<NAME>/fixture` and copied per run with
  embedded paths rewritten; fresh and cached fixtures are identical including
  `.git`, refs, tags, and modes for delivery and context on all three hosts.
  Saving is Linux-only: family 31.65 → 29.5 container job-seconds (0.93),
  about 6–7 CI job-seconds; neutral on macOS, where a copy creates as many
  files as a build.
- **CI target met at `49c4ce3`.** Five green runs: `Run test` 82, 106, 115,
  125, 127 s (job sums 325.2, 422.7, 455.7, 493.8, 503.5); median 115 s
  against the 120 s target and the 174 s baseline median (0.66). GitHub
  assigns runner classes up to about 1.5× apart, so single runs range 82–127
  s; the slowest class still takes about 125 s. Earlier `f83b163`: 86, 125,
  126, 126 s.
- **Slice 7 local measurement at `49c4ce3`.** Five consecutive complete
  candidate runs passed silently. Paired full suites against the start
  revision (loads within 30%): 2,195.9/1,958.8 (loads 43.4/35.8) and
  2,273.0/2,077.2 (36.1/38.6) job-seconds, ratio about 0.90; the first pair
  (10.8/37.6) was discarded. At that contention the ratio understates the
  saving; the cleaner unpaired comparison (2,033 at load 5.2 versus about
  1,440 at load 14.6 before fixture reuse) is about 0.71. The local 0.65
  target is not met; the CI target is.

## Checkpoint after slice 7 (2026-09-26): stopped for the maintainer

- **Measurement.** CI `Run test` median 115 s over five runs (target 120 s,
  baseline 174 s). Local total work about 0.71–0.90 of the start revision
  depending on load (target 0.65). Passing runs are silent and stable.
- **Decision needed.** Accept the local shortfall and proceed to the budget
  (slice 8) and wrap-up, or continue cutting local work.
- **Resolution (maintainer, 2026-09-26).** Accept the local shortfall and
  finish: slice 8 sets the budget from `49c4ce3`'s CI times (largest job 15.8
  s, largest total 503.5 job-seconds over five runs), so the per-job ceiling
  is 25 s and the total ceiling 760 job-seconds.
- **Slice 8 delivered.** `tests/time-budget` holds `per-job-seconds=25` and
  `total-job-seconds=760` (1.5× the largest job, 15.8 s, and total, 503.5,
  across five CI runs of `49c4ce3`). The runner always writes its per-job
  times and, when its test directory has a `time-budget`, runs
  `scripts/test-budget.sh` after the failure reports: one `OVER BUDGET:` line
  per breach, a non-zero exit only when `CI=true`, and nothing within budget;
  a breach never hides a failure. `tests/test-runner-budget.sh` proves CI and
  local breaches and a silent within-budget run with substitute checks, and
  mutations of the CI rule and the total comparison fail it. A local full run
  on this machine (times about twice CI's) printed eleven per-job breaches and
  the total while passing; that is the designed local report, and
  `tests/README.md` says only CI enforces it.
