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
  ODF-087's harness facet) moved to
  [Prove assessors on the verdicts they newly admit](#assessor-counterexample-discipline).
  No gate is added to the paid native runner, and replay is not native
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

<a id="assessor-counterexample-discipline"></a>

### 3. Prove assessors on the verdicts they newly admit

**Identity:** SEED-055#assessor-counterexample-discipline
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/165-assessor-counterexample-discipline/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"642da0c3bb4e8d750e4f3d5e97e054c1d8ea48c6dc3f6801126a448fced3ab2a","plan":"2e1f2f49e905fb8565b882c9f8139e23660866db40ea15e1b29b8835e088eb47"}}
```

- **For / why:** The maintainer paying for native acceptance runs needs an
  assessor's verdict to be right on the cases its counterexamples claim to
  cover, not only on the old cases.
- **Goal:** Every native assessor's rejected cases each isolate one declared
  signal, and together they cover the gates its journey publishes. A widened
  assessor is proved on failure reports from the side it newly admits.
  Assessor-design faults then show up in the free suite, not in a paid run or
  a transcript reading. This supports trustworthy native acceptance verdicts
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) §2).
- **Problem as observed:** Against
  [the first-priority project findings](../../ProjectFindings.md#native-acceptance-harness-observations-that-do-not-match-what-the-native-agent-did-first-priority).
  DD-160 (plan 139) is a counterexample that dropped the `--one-shot` start
  and the carried edits together, which hid an assessor ordering defect until
  a paid run. DD-175 (plan 154) is a narrowed rejection that was accepted only
  on its old counterexamples, while four failure reports passed. Plan 158
  recorded those reports. ODF-087's harness facet is an assessor that judges
  only the outcome, which passes a run that skipped the published gate. Its
  plan 147 closure occurrence has been rejected since `9c672fc9`: closure
  retires the worktree only through the installed `finish` command, and
  `finish-count: 0` is a rejected case. Its plan 069 occurrence, preparation
  skipped with the greeting written, has no rejected case.
  Rejected cases in the assessor suites under `tests/support/` are written by
  hand today, some as full observation lists and some as a baseline with
  overrides.
- **Scope:**
  - One shared counterexample helper. It builds each rejected case from a
    named passing case of the same assessor plus a change to exactly one
    declared signal, and expects rejection. Each assessor declares its
    signals. A signal may cover coupled observation fields (for example
    `remote-accepted` with `remote-sha`). The helper refuses a case that
    changes more than one signal, or that starts from a case the assessor
    does not pass, and names that case.
  - Every existing native assessor suite writes its rejected cases through the
    helper. A guard fails the free suite when a rejected case (an
    expected-fail or expected-rejected assessment) is written outside the
    helper, and names the file.
  - Response-text rejected cases, such as plan 158's closure failure reports,
    count as one signal: the response, against a passing observation.
    Recorded bad outputs from paid runs and reviews stay as permanent rejected
    cases.
  - Each assessor whose journey has a published gate has a rejected case where
    that gate was skipped but the outcome is correct. Where that case
    passes, the assessor is repaired.
  - A rule in `tests/native-publication.md`: a change that widens what an
    assessor accepts adds, in the same change, paraphrased failure reports on
    the newly admitted side as rejected cases.
  - Deferred: detecting mechanically that a change loosens an assessor; new
    paid runs to validate the helper; replay of real host output (story 1).
  - Constraint: the helper and guard run in the free suite only. No gate is
    added to the paid native runner.
- **Key examples:**
  - DD-160 shape: the escalation passing case, with both `--one-shot` start
    and edits carried removed in one rejected case → the helper refuses it,
    naming the two signals. Split into "admitted before editing" (one signal)
    and the no-one-shot case, each is accepted by the helper and rejected by
    the assessor.
  - Coupled fields: `missing-remote` sets `remote-accepted=false` and
    `remote-sha=trunk000`, both declared under one remote-acceptance signal →
    the helper accepts it as one signal.
  - Guard: a new journey's suite calls `git_publication_suite_expect_rejected`
    on a hand-written observation file → the free suite fails, naming that
    file.
  - DD-175 shape: narrowing the closure response rejection to admit a
    reconstructed Cursor line → the same change adds paraphrased failure
    reports such as "Trunk CI passed. The watcher failed to start." as
    rejected cases. An assessor that accepts one of them fails the free suite.
  - ODF-087 shape: an execution-worktree preparation observation with the
    greeting written but no setup or project command run, all other fields
    passing → the assessor rejects it. Closure's `finish-count: 0` case
    already covers the plan 147 occurrence.
- **Value / learning:** Removes the assessor-design faults that replay of real
  output cannot catch. Learns whether declared signals keep counterexamples
  small enough to review.
- **Effort hypothesis:** Medium: one helper with its test and guard, migration
  of the rejected cases in about a dozen assessor suites, gate-skipped cases
  where missing, repairs where one passes, and one guidance rule.
- **Depends on:** The assessor suites under `tests/support/`. No dependency on
  the replay story, though both touch native journey support files.
- **Safe stopping point:** The helper and guard are in place with every
  existing suite migrated.

## Ordering and When to Surface

The maintainer asked for the two highest-priority project findings at the top
of the product backlog. Story 1 has the highest impact and recent frequency
(paid runs across three consecutive native-heavy executions); story 2 recurs
in two executions, is open, and has no existing fix. The stories are
independent. Story 2 goes first because it is small and protects story 1:
native work regrows `tests/git-publication-native.sh`, the job nearest its
ceiling (41.5 s after its 2026-09-28 split, 40.0–51.4 s over the next trunk
runs), and story 1 is the likeliest next slice bound by that budget. Story 3
split from story 1 during its refinement on 2026-09-29 and is queued right
after it; the maintainer chose to keep story 1 about real-output replay and
shim resolution.

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
