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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/163-native-harness-replay/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1d0937262a4db2627cf47c23104dbc816d5fbeea06ed1c78ce5e33be8ac8b512","plan":"d0b27b7dec6dd42579d1da83b2292f64bc0495f36c29f299d58e6ffaf1b105ae"}}
```

- **For / why:** The maintainer paying for native acceptance runs needs a paid
  run to fail only when the native agent misbehaved, not because this
  repository's stream observation or host shell shims misread what a real host
  did.
- **Goal:** Real host output from paid runs becomes free, replayable proof of
  how the native harness reads each host's stream, and the free suite proves
  the harness shims survive each host's login shell. A new or changed native
  journey then meets these harness faults in the free suite, not in a paid
  run. Contributes to trustworthy native acceptance verdicts
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).
- **Scope:**
  - A gzipped corpus of real Claude Code, Codex, and Cursor streams under the
    test fixtures, started from the paid-run streams this repository's Git
    history still holds (for example plan 082's startup cases on all three
    hosts and plan 140's four Cursor one-shot cases). The streams from the
    faulting runs of plans 142, 146, and 154 were never retained and are not
    recoverable.
  - One shared host-stream reader, with a Claude, Codex, and Cursor adapter,
    proved on that corpus for every host. Every journey reads host stream
    shapes only through it; the free suite fails on host-shape parsing
    anywhere else, naming the file.
  - A journey with retained attempts replays its stream-derived observations
    against reviewed expected values. It reproduces the verdict where the
    retained observations carry every field today's assessor reads. Observers
    also read live fixture state, which a stream cannot replay.
  - Accepting a paid run adds its stream, record, and reviewed expectations to
    the corpus through one command.
  - The free suite checks that every harness shim, not only `node`, resolves
    first in each host's zsh login shell when a startup file rebuilds PATH.
- **Deferred:** Counterexample discipline for assessors (DD-160, DD-175, and
  ODF-087's harness facet) is the counterexample helper's
  ([Rejected cases](../../tests/native-publication.md#rejected-cases)). No gate is added to the paid native runner, and replay is not native
  behavioral evidence (ADR 0005 §2). Journeys without retained attempts gain
  per-journey replay when a paid run first retains one, not through new paid
  captures made for this story.
- **Key examples:**
  - Retained plan 082 Cursor `startup-selected-source` stream, recorded
    `startup-cli-count: 0` and failed, whose start command is one multi-line,
    quoted shell call → replay finds that start command once → the reviewed
    expectation records the corrected count and cites the harness fault.
  - Retained plan 082 Codex `startup-trunk` stream, whose commands arrive as
    `item.started` `command_execution` events → the reader returns every
    started command. A reader that reads only `item.completed`, or drops
    Cursor `tool_call` commands, fails the free suite.
  - A new journey whose observation greps `"type":"item.started"` itself →
    the free suite fails, naming that file, before anyone starts a paid run.
  - Retained plan 140 Cursor `one-shot-result` attempt → replayed stream
    fields plus its retained fixture fields reassess as pass, its recorded
    verdict.
  - A zsh startup file that rebuilds PATH from scratch → the shim check finds
    `gh` or `node` resolving outside the harness → the free suite fails. This
    is plan 146's fault, which a node-only repair missed.
  - A paid run is accepted → one command adds it to the corpus → the next
    free-suite run replays it.
- **Value / learning:** Fewer paid reruns and judgment acceptances; learns how
  much real host output can stand in for paid runs when proving the harness.
- **Effort hypothesis:** Medium to large: corpus recovery, one shared reader
  adopted by every journey's observation, a guard, a retention command, and
  one shim check.
- **Depends on:** Paid-run streams in Git history; each journey's observation
  under `tests/support/`; `tests/support/native-harness-login-shell.sh`.
- **Safe stopping point:** The shared reader is proved on the corpus for all
  three hosts and the publication journeys read through it.

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

## Ordering and When to Surface

The maintainer asked for the two highest-priority project findings at the top
of the product backlog. Story 1 has the highest impact and recent frequency
(paid runs across three consecutive native-heavy executions); story 2 recurs
in two executions, is open, and has no existing fix. The stories are
independent. Story 2 goes first because it is small and protects story 1:
native work regrows `tests/git-publication-native.sh`, the job nearest its
ceiling (41.5 s after its 2026-09-28 split, 40.0–51.4 s over the next trunk
runs), and story 1 is the likeliest next slice bound by that budget. The
correction closes gaps the counterexample discipline's execution retrospective
found.

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
