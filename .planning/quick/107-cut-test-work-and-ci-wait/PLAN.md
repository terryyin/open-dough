# Cut total test work and the CI verdict wait, and keep them within budget

## Source

**Identity:** SEED-037#fourfold-local-suite

[Refined story](../../seeds/SEED-037-quiet-stable-fast-tests.md#fourfold-local-suite),
refined and planned on 2026-09-26. It continues plan 096's decisive
checkpoint (recoverable from Git at
`59b21d7^:.planning/quick/096-quiet-stable-fast-tests/PLAN.md`), whose
unexecuted slices 10–12 and three independent findings moved here. First queued story;
preparation grants no Take or execution.

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
- A committed time budget, one ceiling for any single job and one for the
  total, enforced in CI and reported locally.

### Material exclusions

- Fewer installer runs per promise, including the 24-run Cursor-only
  protection matrix in `story-payload-update.sh`. This belongs to
  [SEED-037#fewer-installer-runs-per-promise](../../seeds/SEED-037-quiet-stable-fast-tests.md#fewer-installer-runs-per-promise),
  queued next.
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
| 3. CI `Run test` median ≤ 120 s | 5 | At least three CI runs of the delivered candidate on the story branch (push or `workflow_dispatch`); step times and median in Learnings |
| 4. Total local work ≥ 35% less | 5 | Paired runs: the candidate's median total job-seconds ≤ 0.65 × the start revision's |
| 5. Over budget → CI fails, naming job, time, and ceiling; locally prints and passes | 6 | Runner tests with substitute checks and a budget small enough to exceed; CI mode fails, local mode passes and reports |
| 6. Within budget → silent | 6 | Runner test within budget prints nothing; the delivered candidate's CI run passes without any budget output |
| Quiet, stable, same proofs | 2–5 | Each kept experiment names the promise and its surviving proof in Learnings; five consecutive silent passing complete local runs in slice 5 |

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
- **Decisive checkpoints.** After each of slices 2, 3, and 4, compare
  paired total job-seconds with the 0.65 target and estimate the CI time on
  about four cores. If the recorded remaining experiments cannot plausibly
  close the gap, record the measurement, gap, invalidated assumption, and
  remaining candidates here, and stop for the maintainer before the next
  experiment. Slice 1 and any kept savings remain delivered either way; slice
  5 then records what was achieved, and slice 6 may still set the budget from
  it.
- **Stable means cause-fixed**, as in plan 096: a destabilized test gets its
  cause fixed, never a retry or a lower default.

## Ordered slices

### 1. Registering a pushed revision makes the CI observer check at once

Type: Behavior
Status: planned
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
Status: planned
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

### 3. Workspace-publication suites cost less

Type: Behavior
Status: planned
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

### 4. Preparation-assignment suites cost less

Type: Behavior
Status: planned
Proof:
- `preparation-assignment-*.test.mjs` pass silently with unchanged promises.
- A focused paired before/after of the family's summed job-seconds is
  recorded in Learnings, with the kept changes and surviving proof.

Behavior: the developer or CI runs the suite → the preparation-assignment
journeys (announce, land, abandon, release) prove the same promises with less
work.

Profile first. If slice 3 found a cost these suites share (for example the
same publication fixture), reuse that change here instead of a second one,
and count its saving once. If the baseline profile ranks another family above
this one, replace it here and record why. Decisive checkpoint afterwards.

### 5. The delivered suite meets the CI and total-work targets, confirmed by repeated runs

Type: Behavior
Status: planned
Proof:
- Paired measurement under **Measurement conditions**: the candidate's median
  total job-seconds ≤ 0.65 × the start revision's. Record both sides, the
  loads, and local wall times.
- At least three CI runs of the delivered candidate: `Run test` step median
  ≤ 120 s. Record each run's per-job times; slice 6 calibrates the budget
  from them.
- Five consecutive complete local runs (`npm test`) pass silently.
- Learnings list every kept experiment's saving and surviving proof.

Behavior: an agent publishes a revision → CI's test step returns its verdict in
at most 120 s by median, and a developer's complete local run does at least
35% less work than at the start revision, with the same quiet, stable proof.

### 6. A committed time budget fails CI when a job or the total exceeds it

Type: Behavior
Status: planned
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
  Ceilings come from slice 5's CI runs; record them and the calibration in
  Learnings.
- The delivered candidate's CI `test` job passes within budget and prints
  nothing about it.
- `tests/README.md` states where the budget lives, what a breach looks like,
  and that raising it is a reviewed edit.

Behavior: a change makes a job or the whole suite exceed the committed budget
→ the CI `test` job fails with a message naming what is over budget; locally
the run still passes and prints the same comparison. A run within budget
prints nothing.

Dispatch after slice 5, or after a checkpoint stop, so the ceilings reflect
the achieved times. The CI times artifact may land earlier, with slice 5, if
its CI runs need it.

## Promise ownership

- Immediate check on registration and continued polling: slice 1.
- CI test time ≤ 120 s median: slices 2–4 (savings), slice 5 (measurement).
- Total local work ≥ 35% less: slices 1–4 (savings), slice 5 (measurement).
- Budget guard, its breach report, and a silent within-budget run: slice 6,
  including the delivered candidate's CI run.
- Quiet, stable, same proofs: every slice's surviving-proof record; slice 5's
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

## Learnings

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
