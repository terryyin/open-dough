# End test jobs at their deadline with a named result

**Source:** [SEED-289 — End a node test job at its deadline with a named result](../../seeds/SEED-289-named-test-results-locally-and-in-ci.md#name-a-test-job-past-its-deadline)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-289#name-a-test-job-past-its-deadline

## Goal and scope

Actively stop a never-ending runner job, identify it, retain its result, and
free local whole-suite admission. Terry accepted a 180-second wall-clock
safety limit on 2026-11-10 for this purpose. Detecting slow tests or builds is
not this story's purpose. Each scheduled Bash check or Node test file gets
that limit from its own start; queueing and admission waits consume none of it.

In CI, a run also ends at the 320-second epoch established alongside the
setup deadline, following the dashboard's current model under the unchanged
six-minute outer bound. This protects reporting when slow setup or many checks
consume the available run time without any one check timing out. Preserve the
64-second per-job and 694-job-second normalized performance budgets, their
post-run CI-only judgment, silent success, ordinary failures, and INT/TERM exit
semantics. Do not change dashboard deadlines, fonts, budgets, test-level
timeouts, or retry policy.

## Existing solutions and direction

PFE traced the existing responsibilities across the runner, admission wrapper,
native supervisor, dashboard configuration, and CI proof producer:

- `scripts/test.sh` and `scripts/test-run-job.bash` already represent each
  job once: label, process group, start, captured output, status, timing, and
  scheduler slot. Extend that lifecycle. A deadline must settle the scheduler
  slot even when the killed job cannot write its own completion files.
- `scripts/local-test-suite.mjs` already releases admission in `finally` and
  `scripts/local-test-processes.mjs` owns marked-process retirement. Reuse
  that owner; do not introduce another lock or admission cleanup mechanism.
- `tests/support/native-run-watchdog.sh` and `native-run-supervise.sh` already
  wait on a timed FIFO without a sleeper and bound TERM-to-KILL termination.
  Reuse or expose the suitable deadline/group-lifetime primitive where its
  ownership fits. Its native stream/record machinery is not the runner's
  job model. Keep necessary current structural cleanup within slice 1;
  do not add a general task framework or duplicate job state.
- `dashboard/tests/support/suiteDeadline.mjs` and the dashboard step in
  `.github/workflows/ci.yml` establish the absolute-epoch/remaining-time model.
  Reuse that meaning for the test share, leaving dashboard behavior intact.
- `ci-proof-fragments.mjs` already maps non-passed/non-failed outcomes to
  `other`. Use that existing interpretation for selected, unstarted checks;
  no new CI proof schema or fabricated duration is needed.

[ADR 0002 — Lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one representation per responsibility and a useful local stopping
point. [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
keeps the benefit bounded: deterministic examples prove a delivered escape
from a stuck job; they do not establish a general speedup or future incident
reduction. The current [North Star](../../NORTH-STAR.md) adds no runner-specific
direction. No new consequential architectural choice or ADR exception is needed.

## Decisive premises and observations

Preparation checkout for these observations:
`/Users/terryyin/git/open-dough/.worktrees/end-a-node-test-job-at-its-deadline-with-a-named`,
revision `d2e93a7e5c5cd5b443ad45e6036772b4432fb2a8`, on macOS with Bash 5
first on PATH. New timeout behavior remains work for the slices, not accepted
proof from these baselines.

| Premise and consuming operation | Observation at preparation | Result and remainder |
| --- | --- | --- |
| A blocked scheduled check holds the admission owner and prevents final report writing; the real copied runner can observe the local journey. | `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh .planning/deadline-premise-probe.test.mjs`; temporary test imported `fixture`, `repository`, and `repositoryAtAdmissionGate`, whose checkout uses `makeMe.aRepository`. It awaited owner readiness, then the linked waiter's actual admission gate. | Exit 0. The owner check was live, the waiter named the same gate and started zero checks, and timing/outcome files did not yet exist. Releasing the owner produced one passed/timing row; the waiter entered only after its predecessor ended, and both runs exited 0. Scratch file removed before recording. This reproduces the blocking mechanism without a wall-time wait; it does not claim a measured 180-second overrun. |
| Existing process-group reporting, ordinary results, and admission release provide the boundary to extend. | `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/test-runner-interrupt.sh tests/test-runner-failure-report.sh tests/support/local-test-suite-lifecycle.test.mjs` | Exit 0, silent. Inspected readiness gates, group-exit assertions, outcome/timing assertions and failure/signal admission cases. These protect their current boundaries; new deadline and TERM-resistant cases need discriminating proof in slice 1. |
| CI mode preserves the current environment and performance judgment, and the real action consumes runner-shaped reports. | `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/ci-proof-actions.test.mjs tests/support/ci-proof-action-units.test.mjs tests/test-runner-ci-environment.sh tests/test-runner-budget.sh` | Exit 0, silent. The action fixture executes the checked-in composite action's shell block and summary with the workflow's report inputs. Slice 2 must feed it real timeout output, including unfinished checks; these baseline reports do not prove that new journey. |
| An existing watchdog/event route can test expiry without waiting three minutes. | `PATH=/opt/homebrew/bin:$PATH bash .planning/deadline-primitive-probe.sh` sourced the actual native supervisor, launched an owned TERM-ignoring child, awaited readiness, and called its actual watchdog with a 180-second allowance and zero escalation grace. An explicit write to its supplied FIFO released the deadline wait. | Exit 0, silent: timeout marker written, child ended 137, watchdog finished, both reaped. Scratch removed before recording. This settles the event/owned-group route, not elapsed-time accounting or production grace; slice 1 separately proves those with controlled time. The Node timer/explicit-now precedents do not control Bash `EPOCHREALTIME`. |

## Outside-in proof ownership

| Final promise / source example | Owning slice | Observable proof |
| --- | --- | --- |
| A blocked Bash or Node check ends after its 180-second safety allowance, with its label, deadline reason, elapsed time and captured output (example 1). | 1 | Real runner over MakeMe-built controlled checks. Await readiness, advance a controlled expiry, assert a nonzero run, named timeout, failed outcome and measured timing; independently assert the selected duration/start boundary. Exercise both job kinds without waiting for elapsed wall time. |
| Cleanup handles a TERM-resistant owned group, releases the slot, and lets a waiting worktree enter after the run ends (example 1). | 1 | Deadline fixture with an owned descendant ignoring TERM; observe group death before successor entry, runner termination, absence of the admission ref after both runs, and queued work proceeding after a per-job timeout. A named exception alone is insufficient. |
| Normal success/failure/signals remain correct and no completed job leaves a live timeout worker (example 2). | 1 | Complete one check, start a blocked successor, then advance beyond the old deadline and observe the successor still alive. Explicitly verify watcher retirement; retain the existing failure-report, interrupt, scheduler/selection and admission suites. |
| CI setup reduces the remaining run allowance, the whole run stops before outer cancellation, and every unfinished job is named (example 3). | 2 | Execute the runner in CI mode with controlled setup/clock state and queued plus running checks; expire the absolute cutoff before any individual limit. Assert whole-run stop, nonzero result, started-job timings, failed unfinished running jobs, and unstarted outcomes represented as other without invented times. Verify the 320-second setup-step epoch and artifact failure conditions in the real workflow. |
| A pre-expired CI cutoff starts no checks and keeps selected unfinished work visible (example 4). | 2 | Start the CI-mode runner with a past cutoff, assert zero check starts and a named exhausted-run deadline; feed its actual outcome/time files to the checked-in fragments action and inspect other counts and absent invented timing. Empty zero-count success is not sufficient. |
| Timeout artifacts reach existing CI proof with correct failed/other file outcomes; performance budgets keep their current meaning. | 2 | Replay `runAttempt(t).fragments(...)` and summary from `ci-proof-action-fixtures.mjs` using the real cutoff run's files and workflow input paths, not hand-written timeout outcomes. Put copied CI checks under an actual declared proof entry, such as `tests/runner-deadline-fixture/`; `checks/probe-0.sh` is owned by neither workflow entry and cannot prove this. Assert exact failed/other per-file breakdown and timings, not just action exit 0. Retain budget/CI environment tests and check the budget file is unchanged. Ordinary pushed CI owns hosted execution; local replay does not prove GitHub artifact transport. |

## Slices

### 1. End an overlong check and free local suite admission

Type: Behavior
Status: done
Proof: the first three ownership rows, at the runner and linked-worktree
admission boundary, plus the focused consumer checks below.

Precondition: a scheduled Bash check or Node test file announces that it has
started, then does not finish, including an owned process that ignores TERM.
Trigger: its own 180-second safety deadline expires.
Result: its owned process group is ended with bounded cleanup, the scheduler
settles that job and slot, the run fails naming the job/reason/elapsed time
and useful log output, and timing/outcome files retain its failed result.
Other queued checks follow the existing continue-after-failure behavior. At
run completion the existing owner releases admission and a linked waiter enters.

Implement the deadline and its deterministic expiry seam together with this
journey. Keep the watchdog outside the group it must finish where necessary;
never put an unbounded `wait` before the required KILL escalation. Retire each
deadline owner when its job finishes, fails, or the run is interrupted. Preserve
130/143 interrupt exits and deliberately detached workers' check-owned teardown.
Use MakeMe for domain setup, extending shared repository/check fixtures when
needed; keep actions and independent expectations in the cases.

Use one capability-named deadline test file (for example
`tests/support/test-runner-deadline.test.mjs`) and extend existing lifecycle
proof where it owns admission, rather than creating a parallel runner harness.
If a runtime helper is added, update `tests/helpers/copy-runner.bash` and its
MakeMe-backed `suiteRunnerLayer` consumers together so copied runners actually
exercise the new lifetime. Document the safety purpose and fixed 180-second
allowance in `tests/README.md`, `runner-settings.md` and local resource guidance
where their existing contracts change.

This slice is a useful safe stopping point: local hangs end with recorded
results. Many slow CI checks can still exhaust the outer job; slice 2 owns
that remaining source promise. Do not claim the whole story complete here.

### 2. Retain named results before the CI job is cancelled

Type: Behavior
Status: done
Proof: the last three ownership rows, including the actual fragments action
consuming the actual runner's cutoff reports.

Precondition: setup has consumed some of a test share's available run time,
or its cutoff has passed before the runner starts.
Trigger: the 320-second absolute epoch established before dependency setup is
reached, even when no individual check has exhausted 180 seconds.
Result: running groups stop with bounded cleanup, queued checks do not start,
the runner fails naming the exhausted run deadline and affected labels, and
reports remain available before the unchanged six-minute outer cancellation.

Add the test-run epoch beside its existing setup epoch in `ci.yml`, mirroring
the dashboard model rather than starting a fresh allowance at suite launch.
Use one runner shutdown/reporting path for this result and individual expiry.
Read and normalize runner settings before clearing `OPEN_DOUGH_TEST_*`, so a
nested runner cannot inherit an enclosing run's absolute cutoff. A named local
check gets its own per-job safety limit without a CI run deadline by default.

Write timing only for started jobs. Retain passed completed jobs, failed
unfinished running jobs, and an explicit unfinished outcome for each selected
unstarted job; use the existing proof parser's other interpretation. Document
this addition to the current passed/failed runner output contract and trace
every consumer. Keep the existing not-cancelled artifact/proof steps eligible
on a self-failed suite, and test their declared conditions and paths.
Build the CI fixture's checks through MakeMe beneath the actual workflow's
declared `tests`/`src/skills` entries, then inspect exact resulting file evidence
and timing. The local admission fixture's `checks/` labels are not owned by
those entries and must not silently produce a zero-count substitute proof.

## Verification and delivery

Local gates follow [AGENTS.md](../../../AGENTS.md#test-automation) and
[executable proof](../../../.agents/skills/dough-story-refinement/references/executable-proof.md).
Use Bash 5 first on PATH. Focused named checks need no whole-suite admission.
For any full macOS run, start fully awake: on AC use `caffeinate -s -i`; on
battery plug in, or keep the lid open under `caffeinate -i` and read the sleep
log afterwards, under the maintained
[sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos).

After edits and post-change refactoring, run the deadline proof and the
runner/admission consumers through `bash scripts/test.sh`:

```sh
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh \
  tests/support/test-runner-deadline.test.mjs \
  tests/support/test-runner-deadline-continuation.test.mjs \
  tests/support/test-runner-deadline-cutoff.test.mjs \
  tests/support/test-runner-deadline-cutoff-proof.test.mjs \
  tests/test-runner-bash.sh tests/test-runner-failure-report.sh \
  tests/test-runner-interrupt.sh tests/test-runner-selection.sh \
  tests/test-runner-split.sh tests/test-runner-ci-environment.sh \
  tests/test-runner-github-requests.sh tests/test-runner-budget.sh \
  tests/support/local-test-suite.test.mjs \
  tests/support/local-test-suite-lifecycle.test.mjs \
  tests/support/ci-proof-actions.test.mjs \
  tests/support/ci-proof-action-units.test.mjs \
  tests/support/ci-proof-declaration.test.mjs
```

Local per-job proof is in the first two deadline files; CI absolute-cutoff
proof is in the cutoff and cutoff-proof files, including real-cutoff
fragments replay. Check all additional observers reached by the actual
consumer trace: copied-runner Bash/selection fixtures, any modularized native
watchdog callers, CI report parsing, workflow wiring and enduring documentation.
When a shared fixture is changed, include all its distributed consumers.
Neither a full dashboard run nor a full repository run is prescribed merely
by this plan; widen proof only where the actual effect requires it.

Before adding test time, use `bash scripts/ci-test-times.sh <changed-job>...`
under [time-budget.md](../../../tests/time-budget.md), and apply its wide/thin
policy. If adding/removing/renaming a test file, run
`node scripts/test-shares.mjs preview --split-count 3`. Do not spend 180 seconds
per timeout case, introduce sleeps, use `test.slow()`, or broaden test timeouts.
During execution, perform the independent refactor and normal delivery/CI
repair workflow; preparation authorizes none of that implementation now.

The project's [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written, including to local/base-attributed failures, published CI
and coordinated repair ownership. Carry this link into every delegation and
repair handoff. A passing focused check proves its own boundary only.

## Current decisions

- 180 seconds is an accepted safety stop for a job that does not end; it is
  separate from performance evaluation. No configurable timeout surface is
  promised just to make proof fast: use controlled time/events instead.
- Per-job expiry continues other work under ordinary failure behavior; the
  absolute CI cutoff stops the whole selected run to save its report.
- A CI run cutoff represents selected unstarted checks honestly as other and
  never invents their execution time. Started timeout jobs remain failed.
- No dependency on the font-parity sibling and no trunk-only implementation
  step is needed. Planning/landing does not Take this story or start execution.

## Learnings

- Interrupt handling must retire per-job deadline watchdogs before `wait`, or
  TERM/INT handling blocks on each watchdog's 180s FIFO read.
- With slot reuse, finished jobs must be reaped and their watchdogs retired
  during the launch loop, not only after all starts, so a completed job cannot
  later kill a successor.
- Nested `node --test` under a deadline proof file must clear
  `NODE_TEST_CONTEXT` or Node skips the inner file.
- Capability proof lives in `tests/support/test-runner-deadline.test.mjs` and
  `tests/support/test-runner-deadline-continuation.test.mjs` (TERM-resistant,
  watcher retirement, admission release).
- Identity and admission harness trees that source `native-run-supervise.sh`
  must materialize every path that script's supervision-input list names
  (including `scripts/owned-process-group.bash`); `native-supervision-inputs.mjs`
  keeps that list and uncovered roots in one place.
- An absolute run-cutoff USR1 is ignored while the launch loop blocks on an
  unbounded slot `read`; timed slot polls are required so cutoff can stop the
  run before the next start.
- Absolute cutoff helpers live in `scripts/test-run-deadline.bash` and
  reporting in `scripts/test-report-jobs.bash`; CI cutoff proof is split across
  `test-runner-deadline-cutoff.test.mjs` and `…-cutoff-proof.test.mjs`.

## Plan review

Slice-plan refinement was not needed: each of two Behavior slices owns one
cohesive outside-in result and proof loop, and the local stopping point has a
named CI remainder. Both use the same job/ownership model; no preparatory
framework, independent second outcome, or accumulating special-case model is
planned. No project numeric slice target is supplied, so boundedness is judged
from these outcomes and focused integration surfaces.

No remaining slice-specific concern was identified in this review. The
baseline observations establish available routes and current ownership, not
the future deadline behavior. Each slice must add discriminating proof: its
deadline scenario fails with expiry handling disabled and passes when enabled.
