---
id: SEED-157
status: active
planted: 2026-10-28
planted_during: Combined project and shared feedback maintenance
trigger_when: The recorded shared execution boundary is encountered again
scope: small
---

# SEED-157: Keep delegated verification from waiting indefinitely

## Why This Matters

The retained [ODF-369](../../docs/maintainer/findings/ODF-369.md) evidence identifies
a concrete coordinator cost and an unfinished shared response. This story is
queued maintenance follow-up; implementation and proof have not started.

## Selected Stories

<a id="check-stalled-delegated-verification"></a>

### 1. Check stalled delegated verification before observation coverage lapses

**Identity:** SEED-157#check-stalled-delegated-verification
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/363-check-stalled-delegated-verification/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"950e056cf854c927da6c8031b9a37a8a7b64b1819efcef804f4bd9f668e24bd8","plan":"68adc28a9b057129a9c8410e32660bff14cdcf2fc9e30be1f08be2e0fde09a42"}}
```

**Goal:** A coordinator waiting on delegated verification notices a possible
stall and returns a bounded diagnosis, safe recovery, or explicit unfinished
handoff before an unexplained wait consumes applicable CI observation coverage
or requires the developer to ask for status.

**Scope:** Extend the shared execution guidance at the coordinator/command-owner
handoff. Use the command's expected proof window, existing project runner bound,
last meaningful progress, and remaining applicable observer coverage to decide
when to inspect. An expectation is a reason to check, not a new command timeout.
When duration, process state, or observer coverage is unknown, retain that
uncertainty and choose a bounded next observation rather than waiting indefinitely.

Distinguish active expensive verification, work still queued, a yielded command
with a supported continuation handle, and a suspected non-yielding or stuck
process. Keep command, actor, host/checkout, process or handle, last progress,
and applicable CI identity/coverage with the existing execution evidence. Follow
the supported continuation for healthy work and keep its real terminal result.
For stalled or inaccessible work, diagnose within a bounded check and recover
only within established command/process ownership, or hand back the exact
unfinished proof and its recovery owner. Account truthfully for an observer that
has ended; command recovery does not manufacture restored CI coverage.

**Constraints:** No fabricated terminal result or completion; no killing or
restarting unowned work; no restart solely because a healthy run is slow. Use
existing process controls, runner bounds and CI lifecycle rather than imposing
a universal test duration or building a second process supervisor. These limits
come from the retained [ODF-369](../../docs/maintainer/findings/ODF-369.md)
responsibility split and evaluation, not from the number of examples below.

**Deferred promises:** Pygardon's fake-sleep repair and separate test-runner
containment story remain project-local. No new host adapter, persistent liveness
registry, observer replacement policy, or broad test-performance optimization is
promised. This preparation does not authorize implementation or a release.

**Key examples:**

1. A delegated verification stops making progress and outlasts its expected
   proof window while CI observation still has time remaining → the coordinator
   checks without a human status request → it retains the command, owner,
   process/handle and last progress, distinguishes suspected busy-spin from
   supported waiting as far as evidence permits, and makes a bounded recovery
   or unfinished handoff before that coverage expires.
2. An expensive command runs longer than expected but produces fresh progress
   through a valid yielded handle → the coordinator checks → the original owner
   continues that command to its real terminal result, without a duplicate run
   or a success claim based on progress alone.
3. A delegated command has not started because it is queued → its expected
   window is reached → the coordinator records queue evidence and the next
   bounded check/owner; it does not classify an absent process as a stuck worker.
4. A suspected stuck command cannot be inspected or safely stopped with the
   available host controls → the bounded check ends → an unfinished handoff
   names the missing observation, known state and recovery owner; no guessed
   PID, unsupported host API or unowned termination substitutes for evidence.
5. The CI observer reports that its budget ended while proof is pending → the
   coordinator diagnoses the wait → it reports lost coverage and outstanding
   local proof separately, preserving any accepted evidence and using the
   existing CI lifecycle for further recovery.

**Evaluation:** Reconstruct DD-371 with a controlled stuck verification and a
healthy long-running comparison. Record time to the first useful diagnosis,
added liveness-check effort, human status requests, and delay avoided against
the stated baseline. Keep reconstructed, guided and ordinary-use evidence
separate; the historical 32-hour wait is context, not a measured new speedup.
Walk the queued, unavailable-control and ended-observer boundaries. The useful
result is timely evidence and an owned next action without sacrificing valid
proof or unrelated processes.

**Completion:** At ODF-369's authoritative finding record, retain the actual
response revisions, first containing release when it exists, proof/limits and
a checkable ordinary-use observation request. Mark an unreleased response
truthfully until a release contains it; queueing or delivering guidance is
**not resolution** or evidence of sustained improvement.
