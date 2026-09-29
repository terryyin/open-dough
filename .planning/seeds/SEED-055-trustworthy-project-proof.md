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

## Ordering and When to Surface

The maintainer asked for the two highest-priority project findings at the top
of the product backlog. Story 1 has the highest impact and recent frequency
(paid runs across three consecutive native-heavy executions).

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
