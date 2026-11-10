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

<a id="show-an-unreadable-preparation-continuation"></a>

### Show an unreadable preparation continuation

**Identity:** SEED-292#show-an-unreadable-preparation-continuation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/570-show-an-unreadable-preparation-continuation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"19f70cceb3d504c0171ecd48b45f091921449833e19572e11f7e89fce36da4d3","plan":"8d8b4a4cf0e7e2d095807a2737aef07b5de752231e6339c7937093a34e63c4f0"}}
```

**Goal.** A developer whose retained preparation cannot continue because the
installed continue command failed without a readable JSON result sees that
command's own failure text on the Intent Taken card, so they can tell a crashed
command from an ownership refusal.

**Scope.** When Intent continues a kept preparation and
`preparation-assignment.mjs continue` exits without a JSON result Intent can
read, the card's refusal detail is that failure text, including an exception
message the command printed. Required restriction: the existing safety wording
stays on every failed continuation — the start was kept, and assignment
ownership remains unverified — so an unreadable failure is never treated as
permission to announce again. A continuation that already returns a structured
stop keeps that stop's `error` as the detail inside the same refusal shape.

Out of scope: changing when a continuation may announce; releasing a lost
workspace; the Cursor runner story; inventing failure text when the command
produced none.

**Key examples.**

- Given a kept preparation start, when continue throws before printing JSON and
  Intent resumes it, the Taken card names that thrown message and still says the
  start was kept and ownership remains unverified. It does not replace the
  thrown message with "The installed command could not verify continuation."
- Given continue returns the structured stop whose error is that the local
  allocation and published ownership could not be verified, the card shows that
  error as its detail inside the same kept-start / ownership-unverified refusal.

**Evidence.** Attempts `acd018c7-b4d5-45d6-8c75-0a3144be6009` (accepted
2026-11-10T01:02:00Z, settled 01:03:40Z) and
`d586c604-6e1e-488c-92ad-aa4abcbc72c0` (accepted 01:04:52Z, settled 01:04:59Z)
record the generic detail. `runStartCommand` discards stderr.
`preparation-assignment.mjs` writes a thrown error only to stderr and exits 2.
`continuationRefusal` then attaches the ownership sentence to every failed
continuation, including an unreadable result. A later continue in the same
workspace announced Julia-chan at 01:55Z and landed the plan, so this was not
a stuck assignment. Dashboard workers were stalling, with load average about
8 then about 16.

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

Show the unreadable continuation first. It has a confirmed gap and a safe
wording change. The runner story stops after the decision: the current refusal
is accepted, so this story is dropped with the answer recorded and no repair.

## Open Decisions

None. SEED-292#ask-whether-a-silent-cursor-runner-blocks-launch settled as
refusal intended; no repair.

## When to Surface

The runner decision is settled. The Doughnut card may still show the earlier
failures; the sibling continuation story owns readable continuation text.

## Breadcrumbs

Launch attempts in `~/.open-dough/dashboard/launch-attempts.json`. Dashboard
`preparationStart.ts`, `preparationCommand.ts`, `startLaunch.ts`
`runStartCommand`, and `preparationResult.ts` `continuationRefusal`. Installed
`preparation-assignment.mjs` catch path. Cursor `runnerCurrent.ts` and
`runnerCurrentProof.ts`.
