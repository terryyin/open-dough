---
id: SEED-101
status: active
planted: 2026-10-05
planted_during: Bug report from the dashboard after SEED-098 restored the human developer to the story card scan line without its GitHub avatar
trigger_when: A story card names its credited human developer without the matched GitHub account's avatar
scope: S
---

# SEED-101: Show the credited human's avatar on the story card

## Why This Matters

A developer scanning engaged story cards recognizes who is credited for each
agent by the GitHub avatar beside the name, as the card showed before the
compact card redesign. SEED-098 restored the credited name to the card's scan
line but not its avatar.

## Stories

<a id="story-card-human-avatar"></a>

### The story card shows the credited human's avatar

**Identity:** SEED-101#story-card-human-avatar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A Taken or Preparing card's scan line shows the credited human
developer's GitHub avatar (or initials when no account matched) beside the
name, as the story detail and agent roster already do.

**Scope:** Only the card scan view of a credited human. Unknown-human warnings,
the story detail, and the roster stay as they are.

**Key examples:**

- Expected: a card credited to Terry Yin with a matched GitHub account shows
  that account's avatar beside "Terry Yin".
- Actual: the card shows only "Terry Yin" (`HumanCreditBrief` renders the name
  alone since 2d9347c1; `c58dc07d` removed the avatar-bearing `HumanCredit`
  from the card).
