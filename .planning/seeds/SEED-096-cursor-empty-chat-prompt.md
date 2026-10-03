---
id: SEED-096
status: active
planted: 2026-10-03
planted_during: A Cursor execution opened and never received its story
trigger_when: A Cursor launch sits on the empty composer and the story is never typed
scope: one story
---

# SEED-096: Cursor's empty chat receives its story

## Why This Matters

A developer who starts a story in Cursor from the dashboard expects that
agent to receive the story. Cursor's empty chat now shows
"Plan, search, build anything". The dashboard types the instruction only when
it sees "Add a follow-up", so the agent stays open and the story is never sent.

## Stories

<a id="cursor-empty-chat-receives-instruction"></a>

### Type the story into Cursor's empty chat

**Identity:** SEED-096#cursor-empty-chat-receives-instruction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**For / why:** The developer starting Cursor execution needs the story typed
into the agent when Cursor shows its empty composer, so the agent actually
begins the story.

**Goal:** A Cursor launch whose screen shows a visible cursor and
"Plan, search, build anything" receives its instruction, and that screen is
the idle follow-up prompt. A screen that shows "Add a follow-up" still does.

**Scope:** The ready check and the idle follow-up label share that
recognition. Create-chat, the runner's process lifetime, and other hosts
stay as they are.

**Evaluation:** An instructed launch against a client that paints
"→ Plan, search, build anything" records the first input as confirmed and
has typed that instruction. The same screen, with no working marker, is
labeled "at the follow-up prompt". "Add a follow-up" still confirms and
still labels that way. A working or question screen does not.
