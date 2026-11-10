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
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal.** A developer whose retained preparation cannot continue sees the
installed command's own failure on the Intent card.

**Scope.** When `preparation-assignment.mjs continue` exits without a JSON
result Intent can read, the card's detail is that failure, including an
exception the command printed. The existing safety sentence stays: the start
was kept, and assignment ownership stays unverified so the failure is not
permission to announce again. A continuation that already returns a structured
stop keeps that stop's error as the detail.

Out of scope: changing when a continuation may announce, releasing a lost
workspace, and the Cursor runner.

**Key examples.**

- Given a kept preparation start, when continue throws before printing JSON,
  the card names that thrown message and still says the start was kept and
  ownership remains unverified. It does not replace the thrown message with
  "The installed command could not verify continuation."
- Given continue returns the structured stop whose error is that the local
  allocation and published ownership could not be verified, the card shows
  that error as its detail.

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

**Acceptance.** A test through the preparation command or the launch card
shows the thrown message in the failure text. The safety sentence remains.
A structured ownership refusal still shows its own error.

<a id="ask-whether-a-silent-cursor-runner-blocks-launch"></a>

### Ask whether a silent Cursor runner blocks launch

**Identity:** SEED-292#ask-whether-a-silent-cursor-runner-blocks-launch
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal.** Decide whether the Cursor launch that followed Doughnut's Take
violated intended behavior, and repair only a confirmed violation.

**Scope.** The question comes first. Intended behavior today, written beside
`probeRunnerProof`, is that a process accepting the runner port but not
answering the runner protocol is left in place, and new work fails as
unreachable. This story asks whether that, or a runner that never starts,
should instead be replaced or reported as "the runner did not start" after a
Take has already published. Repair only the behavior a developer confirms is
wrong.

Out of scope: the preparation-continuation text, and inventing a port capture
for the 10:29 attempt.

**Key examples.**

- Given the 10:29 execution attempt, the Take is published and no Cursor
  session exists. The card says the runner could not be reached. Whether that
  matches the intended refusal is the open question.
- Given a listener on the runner port that accepts TCP and does not answer
  `/sessions`, new Cursor work fails unreachable and the listener stays. A
  confirmed violation would change that outcome and name it on the card.

**Evidence.** Attempt `7ed0ea53-f330-469d-aca7-6d1efb6f81f6`, accepted
2026-11-10T02:29:15Z, settled 02:30:05Z, outcome `unavailable`, publication
`e7cf6383fe016ca7dd4d661b6049b1c6593cdec4`. The execution start remains kept
for Kaoru-chan. No session was recorded. The runner process that is up now
started at 10:42 local, about twelve minutes later. `cursor-runner.log` is
empty. The address file was replaced at that later start, so the port state
at 10:30 was not captured. The 2026-11-09 relay line "Invalid Cursor runner
checkout" is an older event, not this attempt.

**Acceptance.** The story records the developer's answer: the refusal is
intended, or a named violation. Only a confirmed violation is repaired, with
a test of the card or runner outcome that failed for that violation first.

## Ordering and Scope Reduction

Show the unreadable continuation first. It has a confirmed gap and a safe
wording change. The runner story can stop after the decision if the current
refusal is accepted. Dropping the runner story leaves the continuation text
useful on its own.

## Open Decisions

Should a listener that accepts the Cursor runner port and does not speak its
protocol be replaced, and should a published Take whose session never starts
say that the runner did not start? The runner story waits on that answer.

## When to Surface

The Doughnut card still shows both failures, and the execution start is still
kept with no session.

## Breadcrumbs

Launch attempts in `~/.open-dough/dashboard/launch-attempts.json`. Dashboard
`preparationStart.ts`, `preparationCommand.ts`, `startLaunch.ts`
`runStartCommand`, and `preparationResult.ts` `continuationRefusal`. Installed
`preparation-assignment.mjs` catch path. Cursor `runnerCurrent.ts` and
`runnerCurrentProof.ts`.
