---
id: SEED-103
status: active
planted: 2026-10-05
planted_during: Terry's request to show attention messages on the story card instead of a separate panel
trigger_when: A developer reads or acknowledges a session's attention message on the dashboard
scope: unestimated
---

# SEED-103: Attention message on the story card

## Why This Matters

A developer watching the dashboard already sees a session's attention message
on its story card, yet must open a separate report panel to read it and mark it
read. That panel then offers Mark as done in place of Mark as read, although
reading a message says nothing about whether the session is finished: one click
removes a possibly still-running session from the dashboard. Reading and
acknowledging the message where it already appears removes both the detour and
that hazard.

## Story

<a id="attention-message-on-story-card"></a>

### Read and mark attention messages read directly on the story card

**Identity:** SEED-103#attention-message-on-story-card
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer using the dashboard reads a session's attention message
and marks it read directly on the story card, without a separate panel, and
reading a message never turns into an offer to mark the session done.

**Scope:**

- Remove the attention message (report) panel and its **Read attention
  message** entry point. Show the message within the story card's session
  entry.
- The message part of the entry is collapsed by default. It expands
  automatically only while the message is unread.
- Offer **Mark as read** directly on the expanded unread message.
- After Mark as read, the message collapses; the developer can click to expand
  it again and reread it.
- Marking a message read changes only its read state. It never replaces Mark as
  read with Mark as done, and the entry's ordinary session controls stay as they
  are for its native reading.
- Delete the panel and every code path, style, state, test, and documentation
  passage that only served it, leaving no dead code. Update
  [explicit completion and retained attention messages](../../dashboard/AGENT-LAUNCH-COMPLETION.md)
  to describe the card-only behavior.

**Key examples:**

- A session reports `--outcome unfinished` with a message: its card entry shows
  the message expanded with Mark as read; no panel is needed to read it.
- The developer clicks Mark as read: the message collapses, the session stays
  open with its native reading, and no Mark as done appears in the message's
  place.
- The developer clicks the collapsed, read message: it expands and shows the
  same text, without Mark as read.
- A newer report arrives for the same session: its message is unread again and
  expands automatically.
- A session without an attention message shows no message part.

**Rejection constraint:** No control that appears as a consequence of marking a
message read may mark the session done or remove it from the dashboard. A test
guards against reintroducing that swap.

**Refinement input:** Settle how the collapsed message is indicated and
expanded, how long messages fit the card, and how a retained message stays
readable for a session in Recent sessions after Done once the panel is gone.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Explicit completion and retained attention messages](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- Terry's 2026-10-05 request: capture this as the highest-priority queued
  story; remove the panel, show the message in the card collapsed by default
  and expanded only when unread, put Mark as read on the message, collapse it
  after reading with click-to-expand, never let Mark as read become Mark as
  done, and leave no dead code.
