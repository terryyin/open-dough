---
id: SEED-099
status: active
planted: 2026-10-04
planted_during: A dashboard Cursor launch whose instruction was recorded as accepted remained an unsent paste
trigger_when: A Cursor launch instruction is long enough that Cursor shows it as pasted text and does not start the conversation
scope: unknown
---

# SEED-099: Submit a pasted Cursor launch instruction

## Why This Matters

A developer who starts a story in Cursor from the dashboard needs that
instruction to become the agent's first turn. Recording the write as accepted
while Cursor is still holding an unsent paste leaves the agent idle.

## Stories

<a id="submit-pasted-cursor-instruction"></a>

### A pasted Cursor launch instruction is submitted

**Identity:** SEED-099#submit-pasted-cursor-instruction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** The developer who starts work in Cursor from the dashboard gets a
running conversation. When Cursor collapses the launch instruction into a
paste chip, that chip is submitted, and the launch record says the first
input was accepted only for a submitted turn.

**Scope:** A launch instruction that Cursor shows as `[Pasted text #N +M lines]`
is submitted with a following Enter that is not part of the paste. A short
instruction that Cursor accepts as ordinary typing is still submitted once,
not twice. A trust prompt still receives nothing. This does not change idle
hangup, the story-card labels, or `--trust`.

**Key examples:**

- The runner writes a multiline instruction longer than Cursor's paste limit
  into an empty composer → the screen shows a paste chip → a later Enter
  submits that chip → the chat's first user message is the instruction and
  the launch record says the first input was accepted.
- The runner writes a short one-line instruction → it is submitted once.
- The screen is a trust prompt → no instruction is entered and the record
  stays uncertain.
