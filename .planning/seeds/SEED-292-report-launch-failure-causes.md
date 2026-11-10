---
id: SEED-292
status: active
planted: 2026-11-10
planted_during: Terry invoked dough-bug-fixing after Doughnut's Taken card showed two launch failures for SEED-112
trigger_when: A developer asks why an Intent launch failed, or those failure texts are still misleading
scope: epic
---

# SEED-292 — Report why an Intent launch failed

## Why This Matters

On 2026-11-10, Intent's Taken card for Doughnut's "See Doughnut test cases and
test files in Intent" showed two red launch failures. Neither sentence was the
failure that happened. A developer cannot tell a crashed preparation command
from an ownership mismatch, or tell a missing Cursor runner from a listener
that does not speak the runner protocol. The Take itself had already published.

## Alternatives and Decision

Leave the card text as the safety wording already written for a continuation
that did not verify, and treat the runner failure as "could not be reached"
whenever no current runner answers. That wording is what the code does today.
It hid both causes on this card. Split the report into the continuation text,
which has a confirmed gap, and the runner question, which is not yet a
confirmed violation.

## Story Decomposition

<a id="ask-whether-a-silent-cursor-runner-blocks-launch"></a>

### Ask whether a silent Cursor runner blocks launch

**Identity:** SEED-292#ask-whether-a-silent-cursor-runner-blocks-launch
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal.** Record that the Cursor launch refusal after Doughnut's Take matched
intended behavior, and undertake no runner repair.

**Scope.** The developer answered that leaving a TCP-accepting silent listener
in place and failing new Cursor work as unreachable is intended. The 10:29
card's "could not be reached" text was correct for no answering runner. This
story changes no runner replacement rule and no card wording.

Out of scope: the preparation-continuation text; inventing a port capture for
the 10:29 attempt; distinguishing "runner never started" from "silent
listener" on the card (deferred, not a confirmed violation of this incident).

**Key examples.**

- Given the 10:29 execution attempt, the Take is published and no Cursor
  session exists. The card says the runner could not be reached. That matches
  the intended refusal for no answering runner.
- Given a listener on the runner port that accepts TCP and does not answer
  `/sessions`, new Cursor work fails unreachable and the listener stays. That
  outcome remains intended; this story does not replace the listener or rename
  the failure on the card.

**Evidence.** Attempt `7ed0ea53-f330-469d-aca7-6d1efb6f81f6`, accepted
2026-11-10T02:29:15Z, settled 02:30:05Z, outcome `unavailable`, publication
`e7cf6383fe016ca7dd4d661b6049b1c6593cdec4`. The execution start remains kept
for Kaoru-chan. No session was recorded. The runner process that is up now
started at 10:42 local, about twelve minutes later. `cursor-runner.log` is
empty. The address file was replaced at that later start, so the port state
at 10:30 was not captured. The 2026-11-09 relay line "Invalid Cursor runner
checkout" is an older event, not this attempt. Developer answer 2026-11-10:
refusal is intended (A); no repair.

**Acceptance.** The story records that the refusal is intended. No runner
repair ships from this story.

## Ordering and Scope Reduction

The unreadable-continuation wording is shipped. The runner story stops after
the decision: the current refusal is accepted, the answer is recorded, and no
repair follows. Drop it from the backlog once its Preparing release is on trunk.

## Open Decisions

None. SEED-292#ask-whether-a-silent-cursor-runner-blocks-launch settled as
refusal intended; no repair.

## When to Surface

The runner decision is settled. The Doughnut card may still show the earlier
failures; readable continuation refusal text is shipped.

## Breadcrumbs

Launch attempts in `~/.open-dough/dashboard/launch-attempts.json`. Dashboard
`preparationStart.ts`, `preparationCommand.ts`, `startLaunch.ts`
`runStartCommand`, and `preparationResult.ts` `continuationRefusal`. Installed
`preparation-assignment.mjs` catch path. Cursor `runnerCurrent.ts` and
`runnerCurrentProof.ts`.
