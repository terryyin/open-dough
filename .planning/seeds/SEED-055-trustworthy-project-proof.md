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

<a id="assessor-counterexample-gaps"></a>

### Correction: Close the assessor counterexample discipline's remaining gaps

**Identity:** SEED-055#assessor-counterexample-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/168-assessor-counterexample-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"47b378b0ff58b9a1229f56ec0d34ed8f5519beba75a895cf19106d91e851f2d3","plan":"7d4985ebedb6170e8bdfe399cc45e25d9320afbcfab8fbba203c86baa58611a7"}}
```

**Goal:** The maintainer paying for native acceptance runs can trust that
the native assessor counterexample discipline holds where it claims to. The guard
catches the remaining ways to state a rejection outside the helper.
Self-reported preparation and every CI completion scenario have rejected
cases. The publication assessor reads fields regardless of order.

**Scope:** The correction found by the execution retrospective of
SEED-055#assessor-counterexample-discipline (commits `a53aa489`..`c6440780` on
`claude/assessor-counterexample-discipline`). It covers these items:

- rejection shapes the guard misses, and verdict wrappers that accept any
  verdict;
- the dropped preparation self-report case;
- CI completion's `ready`, `failure`, and `skip-retro` scenarios, which have
  no free cases;
- the order-sensitive publication field reader;
- a contradictory forced-stop case;
- duplicated re-observed wrappers and undocumented signal placement.

It adds no feature promise. See the
[plan](../slice-plans/168-assessor-counterexample-gaps/PLAN.md).

<a id="native-harness-replay-corrections"></a>

### Correction: Correct continued-command reading and corpus admission in the native harness

**Identity:** SEED-055#native-harness-replay-corrections
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/169-native-harness-replay-corrections/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0f77b0c2a48886c71904b5a97a9dc18973d316a165f3591f90ae79f11f9adeb1","plan":"37834968c4fb6d262511aa8698bb4861063dee43557cdaa2f5facaf85498980e"}}
```

**Goal:** The maintainer paying for native runs gets a reader that
recognizes a continued command whatever its spacing, and can add every
accepted paid run to the replay corpus. The native harness also drops
residue left by the replay of real host streams (story at
`2b20ed61:.planning/seeds/SEED-055-trustworthy-project-proof.md`).

**Scope:** The correction found by that story's execution retrospective
(commits `daaf3c1e`..`b4d82278` on
`claude/native-harness-observes-agent-behavior`). It covers these items:

- joining line continuations so literal matchers see single-spaced
  commands, with the affected corpus `command:` lines re-reviewed;
- admitting any case depth outside the publication family to the corpus;
- dead and duplicate closure observation fields, and substitute-agent code
  loaded on the paid assessor path;
- stale documentation and redundant per-host runs in
  `tests/native-stream-completeness.sh`.

It adds no feature promise. See the
[plan](../slice-plans/169-native-harness-replay-corrections/PLAN.md).

## Ordering and When to Surface

The continued-command and corpus-admission correction goes first: a continued
command can fail a correct paid run today. The assessor counterexample gaps
correction closes what the counterexample discipline's execution
retrospective found.

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
