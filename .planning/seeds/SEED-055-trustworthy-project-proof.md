---
id: SEED-055
status: active
planted: 2026-09-29
planted_during: Maintainer request to group project retrospective findings and queue the two highest priorities
trigger_when: A paid native run or a local time projection gives a verdict that differs from what the host or CI then shows
scope: unknown
---

# SEED-055: Trust this repository's own proof

## Why This Matters

Maintainers and executing agents decide whether Open Dough work is done from
evidence this repository produces: native acceptance verdicts
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)) and the
CI time budget in `tests/time-budget`. The
[project findings](../../ProjectFindings.md#priority-assessment) show both
repeatedly disagreeing with what the host or CI then showed. The cost is paid
native reruns, verdicts settled by reading transcripts, and agent time spent on
projections that came out wrong.

## Story Decomposition

<a id="native-harness-observes-agent-behavior"></a>

### 1. Catch native harness faults before paying for a native run

**Identity:** SEED-055#native-harness-observes-agent-behavior
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** The maintainer paying for native acceptance runs needs a paid
  run to fail only when the native agent misbehaved, not because this
  repository's observation, shims, or assessors misread real host output.
- **Goal:** Real host output captured from paid runs becomes free, replayable
  proof of the shared native observation and assessors. A new or changed
  native journey then meets its harness faults in the free suite first.
- **Evaluation:** Against
  [the first-priority project findings](../../ProjectFindings.md#native-acceptance-harness-observations-that-do-not-match-what-the-native-agent-did-first-priority).
  Each concrete fault there was repaired in its own execution; today's recorded
  streams are synthetic and "prove adapter contracts, not that native runtimes
  emit them" (`tests/support/native-agent-recorded.sh`).
  - Streams captured from past Claude Code, Codex, and Cursor runs replay
    through the shared observation and give the verdicts those runs should
    have had. This includes Codex `item.started` events, Cursor multi-line and
    quoted commands, and in-process registration (DD-179).
  - A change that loosens an assessor fails when any recorded failure report on
    its newly admitted side passes (DD-175).
  - A counterexample that varies more than one planned signal is refused
    (DD-160).
  - A native journey is not started for a paid run until it has passed on
    replayed real output from each host it targets.
- **Value / learning:** Fewer paid reruns and judgment acceptances; learns how
  much real host output can stand in for paid runs when proving the harness.
- **Effort hypothesis:** Unestimated; refine which captured streams to retain
  and where replay plugs into the shared observation helper before sizing.
- **Depends on:** Retained results of past paid runs and the shared harness
  helpers under `tests/support/native-harness-*`.
- **Safe stopping point:** One host's captured streams replay through the
  shared observation and assessors in the free suite.

<a id="ci-time-budget-from-ci-timings"></a>

### 2. Judge a change against the CI time budget from CI's own timings

**Identity:** SEED-055#ci-time-budget-from-ci-timings
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/162-ci-time-budget-from-ci-timings/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"01a8fd0e3409afe8e9d364fd35b10aa29aca4976df25fdce41d733d4561a3440","plan":"895430a9a5b90c99fbf6b0d33d7ec14d8991f03db72d5a4c40e9cfb417992326"}}
```

- **Goal:** The agent planning or executing a slice that must stay inside
  `tests/time-budget` reads the job's current baseline from recent trunk CI
  timings with one command, and measures locally only when that baseline leaves
  thin headroom. A slice with wide headroom pushes and lets its revision's CI
  job settle the budget. A thin margin shows before the push, so the slice
  splits a job in the same change rather than in a follow-up commit. This cuts
  agent time and extra commits on budget-bound slices, so the repository's own
  proof stays cheap to trust.
- **Problem as observed:** Against
  [the second-priority project findings](../../ProjectFindings.md#local-time-budget-measurement-under-load-second-priority)
  (DD-158), checked against plans 135 and 139 as committed. Both plans copied
  one CI number into plan text as the baseline ("the job is 47.3 s now";
  "seed records 52.2 s"). Plan 139 scaled 52.2 s by a local paired ratio of
  1.11 to 58 s. Trunk was then running 48.5–61.2 s, and the same ratio applied
  to 61.2 s gives 67.9 s against the 69.0 s CI measured. The stale baseline,
  not the paired ratio, produced that miss. Plan 135 kept timing (3 pairs, then
  5+5 runs and 3 concurrent pairs) although every estimate stayed well inside
  71 s, and nothing told it when to stop. The recent trunk range was later
  assembled by hand from CI artifacts.
- **Scope:**
  - One read-only command reports, for recent successful trunk CI runs, each
    job's lowest and highest `test-times-*` seconds and each split share's
    lowest and highest total. It shows them beside the `tests/time-budget`
    ceilings and the headroom left under the highest value. When no run or
    artifact can be read, it says so and names why. It never starts a test run.
  - Guidance in `tests/README.md`, with a one-line pointer from the
    `tests/time-budget` header, which is what a plan cites when it names the
    budget:
    - A plan names the command, not a copied CI number, and the baseline
      comes from it when the slice measures.
    - Headroom under the recent highest value that is at least the recent
      spread (highest minus lowest) counts as wide. The slice pushes without
      local timing, and its revision's CI job settles the budget, as today.
    - Thinner headroom gets one local paired comparison of the job before
      and after the change under the current load. Its ratio is applied to the
      recent highest value. A projection at or over the ceiling splits the
      job in the same slice.
    - The pushed revision's CI result stays the verdict, and a breach still
      fails that split job.
  - Deferred: automated local timing or a per-slice timing gate; changing or
    recalibrating either ceiling (the command naturally supplies the numbers
    a recalibration needs, but this story promises no recalibration); timing
    history beyond CI's seven-day artifact retention; any dashboard or trend
    view.
  - Constraint: a local comparison is paired A/B under the current load, never
    waiting for an idle machine. The command runs no paid native host.
- **Key examples:**
  - Wide headroom (plan 135 shape): recent trunk runs show
    `tests/git-publication-native.sh` at 40.0–51.4 s against
    `per-job-seconds=71`. Headroom 19.6 s is at least the spread of 11.4 s, so
    the slice adding a substitute journey pushes without local timing, and
    that revision's CI `test-times-*` settle it.
  - Thin headroom (plan 139 shape): recent trunk runs show the job at
    48.5–61.2 s. Headroom 9.8 s is less than the spread of 12.7 s, so the slice
    runs one paired comparison (72.5 s → 80.5 s, ratio 1.11). The projection
    of 67.9 s is visible before the push, and it is where the split decision
    is made.
  - Share total: recent share-1 totals of 295–387 job-seconds against
    `total-job-seconds=470` are reported the same way and judged by the same
    rule.
  - No readable runs (none in the retention window, or `gh` unavailable):
    the command reports that no recent trunk timings were found and why. The
    slice pushes and CI settles the budget.
- **Value / learning:** Saves agent time on each budget-bound slice and avoids
  follow-up split commits; learns whether CI's spread is narrow enough to
  project from.
- **Effort hypothesis:** Small: one retrieval command with its test, plus
  `tests/README.md` and `tests/time-budget` guidance.
- **Depends on:** CI's `test-times-*` artifacts and `tests/time-budget`.
- **Safe stopping point:** The retrieval command and its guidance are in place.

## Ordering and When to Surface

The maintainer asked for the two highest-priority project findings at the top
of the product backlog. Story 1 has the highest impact and recent frequency
(paid runs across three consecutive native-heavy executions); story 2 recurs
in two executions, is open, and has no existing fix. The stories are
independent. Story 2 goes first because it is small and protects story 1:
native work regrows `tests/git-publication-native.sh`, the job nearest its
ceiling (41.5 s after its 2026-09-28 split, 40.0–51.4 s over the next trunk
runs), and story 1 is the likeliest next slice bound by that budget.

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
