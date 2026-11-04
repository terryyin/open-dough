# Protect long local proof from Maintenance Sleep

**Identity:** SEED-227#protect-long-local-proof-from-maintenance-sleep
**Source:** [story](../../seeds/SEED-227-protect-long-local-proof-from-maintenance-sleep.md#protect-long-local-proof-from-maintenance-sleep)
**Source review:** [source review](source-review.md)

## Goal and scope

A contributor running a full local repository or dashboard suite on a macOS
laptop finds, in the maintained local proof instructions, the sleep guard that
fits the machine's power state and a way to tell a machine that slept from a
defect. The story's seed holds the goal, scope, constraints, key examples,
investigation facts, and the deferred promises; this plan does not enlarge
them.

Included: one new machine-sleep section in `tests/local-test-resources.md`,
a one-line pointer to it from `AGENTS.md` beside the failing-and-flaky-tests
policy, and the DD-412 follow-up note naming the delivered instructions.

Material exclusions: no change to `scripts/local-test-suite.mjs`,
`scripts/test.sh`, `dashboard/playwright.config.ts`, CI, or any Open Dough
skill under `src/skills`. The automatic guard and the automatic sleep report
are deferred promises in the seed, the first pending Terry's decision before
Take (Current decisions).

Assumptions: the instructions claim only what the seed's Investigation
observed or found documented. Whether `caffeinate -s` rescues a run that
starts inside the sleep cycle stays an open observation that DD-412's
criterion collects; the section says to start from a fully awake machine and
to hold `-s` on AC, and says that this remains to be observed.

## Outside-in proof

The slice's proof is a recorded walk of the delivered instructions against
the seed's key examples plus the literal diagnosis command run on the
executing machine. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written to any check that runs.

| Promise (seed key example) | Owning slice | Observable proof |
| --- | --- | --- |
| 1 AC run under `caffeinate -s -i` | 1 | The section names the command and the AC condition; walk recorded in Accepted proof |
| 2 Battery: `-s` inert, fully awake start with `-i` | 1 | The section states both; walk recorded |
| 3 Run started inside the sleep cycle: `-i` has no effect | 1 | The section names the case with its DD-412 date; walk recorded |
| 4 Diagnosis reads the sleep log for the run's window | 1 | `pmset -g log \| grep -E 'Entering Sleep\|Wake from'` run literally on the executing Mac prints dated `Sleep`/`Wake` entries; the section names the run's start stamp (`dashboard/test-results/<stamp>`) and the runner-reported duration as the window |
| 5 No sleep in the window excludes sleep | 1 | The section says so; walk recorded |
| 6 Planner finds the section from AGENTS.md | 1 | `AGENTS.md` links the section in one line under "Failing and flaky tests"; the link target exists |

Executable checks: `node scripts/lint.mjs --staged` for the staged files
(prettier does not cover Markdown; the run proves nothing else broke), and the
consumer-trace record for the three changed files, expected to list no
production or test consumer of their content. Tests that read `AGENTS.md`
(`tests/install-omits-internal.sh`,
`tests/execution-worktree-preparation-native.sh`, the ADR-awareness checks)
read its presence or distribution, not this section; run
`bash scripts/test.sh tests/install-omits-internal.sh` as the cheapest
confirmation that the file still satisfies them.

## Decisive premises (settled 2026-11-04 in this workspace)

- `tests/local-test-resources.md` is the maintained local full-suite
  instruction, linked from `dashboard/tests/README.md:10` ("See local
  resource use ... for full-suite admission"). Observed by reading both.
- The diagnosis command works here: `pmset -g log | grep -E 'Entering Sleep|Wake from'`
  printed 185 dated entries from 2026-11-03 on, including the DD-412 window's
  `Idle Sleep`, `Maintenance Sleep`, and `DarkWake to FullWake` lines.
- The dashboard run's start stamp: `dashboard/playwright.config.ts:44`
  sets `OPEN_DOUGH_DASHBOARD_RUN_STAMP` to the ISO start time (colons
  replaced by `-`) plus the runner pid, and `test-results/<stamp>` is the
  run's output directory; `quietReporter.ts` keeps a failed run's directory.
- `man caffeinate`: `-s` prevents system sleep, "valid only when system is
  running on AC power"; `-i` prevents idle sleep.
- IOKit `IOPMLib.h` (MacOSX27.0 SDK, line 289): `PreventUserIdleSystemSleep`
  "has no effect if the system is in Dark Wake".
- `AGENTS.md` has the `## Failing and flaky tests` section (line 101) the
  pointer sits beside.

## Slices

### 1. Local proof instructions name the sleep guard and the sleep-log check
Type: Behavior
Status: done
Proof: Outside-in proof rows 1–6; `node scripts/lint.mjs --staged`;
`bash scripts/test.sh tests/install-omits-internal.sh`; consumer-trace record
with `--base HEAD` naming no consumer.

Behavior: a contributor opens `tests/local-test-resources.md` (from
`dashboard/tests/README.md` or the `AGENTS.md` pointer) before a long local
run on a macOS laptop → reads the new "Machine sleep on macOS" section → knows
to start from a fully awake machine, to wrap a full run in `caffeinate -s -i`
on AC (`-s` is AC-only; `-i` alone has no effect once the machine is in its
sleep/dark-wake cycle, which lost DD-412's two runs), what to do on battery,
and, after a run fails with clustered timeouts or scattered non-repeating
failures, to read `pmset -g log` for `Sleep`/`Wake` entries inside the run's
window (start stamp plus runner-reported duration) before reading them as
defects, with the failing-test policy unchanged and the rerun under the guard.

Writes: the section in `tests/local-test-resources.md`; one sentence in
`AGENTS.md` under "Failing and flaky tests" linking it; extend
`dashboard/tests/README.md:10` to mention machine sleep; the DD-412
**Follow-up** paragraph in `docs/maintainer/project-test-findings.md` names
the delivered instructions (file and section) and keeps "subsequent
ordinary-use evidence pending". Keep the section to what the seed's
Investigation supports; say explicitly that `-s` holding a machine already in
its sleep cycle is not yet observed.

## Execution complete

Product advice: no change to the delivered scope. The seed's deferred
automatic guard (`caffeinate -s -i -w <admission owner pid>` from
`acquireLocalSuite`) remains the recommended next step and Terry's decision;
the instructions still depend on a reader finding them.

## Current decisions

- Story Branch Mode by default; no trunk step, so no human checkpoint.
- Pre-Take decision for Terry, recorded in the seed: keep the
  instructions-only scope or promote the automatic guard
  (`caffeinate -s -i -w <admission owner pid>` from `acquireLocalSuite`) into
  this story. The seed recommends promoting it. If promoted, slice-plan
  refinement adds one Structure/Behavior slice with a substitute-guard test
  before Take; execution of this plan as it stands adds no script change.
- The instructions do not instruct a machine-wide power setting.

## Accepted proof

Slice 1 (2026-11-04): commitments G.1–E.6 observed in
[source review](source-review.md). `pmset -g log | grep -E 'Entering Sleep|Wake from' | tail -5`
printed dated `Maintenance Sleep`/`Wake` entries on the executing Mac;
`node scripts/lint.mjs --staged` passed;
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/install-omits-internal.sh`
passed; the consumer trace (`--base HEAD --term machine-sleep-on-macos --term local-test-resources`)
named no consumer of the changed content. The refactor pass extended
`tests/README.md:20` to mention machine sleep.

## Learnings

- The dashboard run stamp is UTC (`toISOString()`), while `pmset -g log`
  prints local time; the section says so to keep the window reading correct.

## Plan review

Refinement was not needed: one Behavior slice, one proof loop, no cumulative
design or sizing concern. No remaining slice-specific concern. The
`caffeinate -s` dark-wake question is not a plan concern: the slice's wording
does not depend on it, and DD-412's observation criterion owns it.
