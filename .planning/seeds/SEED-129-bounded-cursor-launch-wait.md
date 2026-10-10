---
id: SEED-129
status: active
planted: 2026-10-10
planted_during: Terry's decision while closing SEED-008#bound-managed-git-transport
trigger_when: A developer starts or recovers a Cursor session from the dashboard and Cursor never shows that it took the instruction
scope: story
---

# SEED-129: A Cursor launch or recover wait ends within a bound

## Why This Matters

When the dashboard starts or recovers a Cursor session, the server waits for
Cursor's screen to show that the instruction was taken. That wait has no time
limit. It ends when a ready screen or a finished synchronized frame arrives,
or when the Cursor client exits. A client that stays alive and silent holds
the wait, and the developer's Start or Recover never answers.

No occurrence is recorded. The wait became reachable on one more path on
2026-10-10: a pasted instruction now settles on Cursor's answer to its
submitted paste chip instead of on the Enter keystroke
(`dashboard/server/launchInstruction.ts`, commit `d1aec794`), which removed a
stale "waiting for an answer" label after Recover. The not-ready path already
waited the same way.

## Story

<a id="bounded-cursor-launch-wait"></a>

### A Cursor launch or recover wait ends within a bound with a clear message

**Identity:** SEED-129#bounded-cursor-launch-wait
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer who starts or recovers a Cursor session from the
Open Dough dashboard.

**Goal:** When Cursor stays alive but never shows that it took the launch or
recovery instruction, the dashboard's Start or Recover answers within a known
bound with a message that says the instruction's delivery is unconfirmed and
what the developer can do next, instead of waiting indefinitely. A Cursor
that answers in ordinary time starts or recovers exactly as today.

**Scope (to refine):**

- Both waiting paths in the launch instruction: a screen that is not ready
  yet, and a pasted instruction whose paste chip was submitted.
- The bound's value, the message's wording, and what happens to the held
  client and its launch record when the bound expires are open for
  refinement.

**Key examples / evaluation (to refine):**

- A Cursor client that accepts Enter on the paste chip and then never
  repaints and never exits → Start or Recover answers within the bound with
  the unconfirmed-delivery message.
- A Cursor client that is never ready and never exits → the same answer
  within the bound.
- A Cursor client that repaints in ordinary time → the session starts or
  recovers as today, with no such message.
