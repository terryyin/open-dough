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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Executing agents whose slice must stay inside
  `tests/time-budget` need to know whether it will, without spending long
  local timing runs that misjudge CI.
- **Goal:** A budget-bound slice gets its baseline from CI's recent
  `test-times-*` range for trunk, compares change against baseline with local
  paired runs, and lets the pushed revision's CI job settle the budget.
- **Evaluation:** Against
  [the second-priority project findings](../../ProjectFindings.md#local-time-budget-measurement-under-load-second-priority):
  - Plan 135 case: with a wide projected margin, the slice stops local timing
    and accepts the pushed revision's CI test-times (52.2 s against a 71 s
    ceiling) without further runs.
  - Plan 139 case: the projection starts from recent trunk CI times (48.5–61.2
    s), not one stale 52.2 s. The thin margin behind the 69.0 s CI result is
    visible before the push.
  - Recent CI test-times for a job are fetched by one command, not assembled by
    hand.
- **Value / learning:** Saves agent time on each budget-bound slice and avoids
  follow-up split commits; learns whether CI's spread is narrow enough to
  project from.
- **Effort hypothesis:** Small: one retrieval command and `tests/README.md`
  guidance.
- **Depends on:** CI's `test-times-*` artifacts and `scripts/test-budget.sh`.
- **Constraint:** Keep paired A/B comparisons under the current load for speed
  comparisons; do not wait for an idle machine.
- **Safe stopping point:** The retrieval command and the README guidance are in
  place.

## Ordering and When to Surface

The maintainer asked for the two highest-priority project findings at the top
of the product backlog, story 1 first. Story 1 has the highest impact and
recent frequency (paid runs across three consecutive native-heavy executions);
story 2 recurs in two executions, is open, and has no existing fix. The stories
are independent.

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
