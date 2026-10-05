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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/248-attention-message-on-story-card/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1fbafc102cff46d761f3d98a77272284d0acc80373254ccd7b72e71f813db622","plan":"653316cbe3bf1d97c5abf2c490c2aa02a9509219c093899eadb0955ad41575e2"}}
```

**Goal:** A developer using the dashboard reads a session's attention message
and marks it read directly on the session's entry, on its story card or in
Recent sessions, without a separate panel, and reading a message never turns
into an offer to mark the session done.

**Scope:**

- Every shared session entry that holds an attention message, on a story card
  and in Recent sessions, shows it as a message part of the entry. The part is
  headed by the report's completion label, and that heading is the control
  that expands and collapses it, by pointer or keyboard, saying which state it
  is in.
- The message part is expanded while the message is unread and stays expanded
  until it is read. Read, or on a session marked done, it is collapsed until
  the developer expands it. An expansion the developer chose is not kept across
  a reload.
- The expanded part shows the whole message as text in an area of limited
  height that scrolls on its own, so a long message leaves the rest of the
  entry and Mark as read in view.
- An unread message offers **Mark as read** in its message part, on card and
  Recent sessions entries alike, so a session without a story card can be
  marked read. Marking read collapses the part and leaves the keyboard on its
  heading. A mark that fails leaves the part expanded and says so in the
  entry's status line.
- Marking a message read changes only its read state. The entry's **Mark as
  done** is its own control, offered whenever the session can be marked done,
  an unread message included, and neither control takes the other's place.
- The unread wording, the card's unread-report line, the Sessions sidebar's
  mark, alerts, and the rule that a newer report is unread again stay as they
  are.
- The side panel no longer shows attention messages: remove **Read attention
  message** and the panel's Mark as read. The panel stays for Codex's passive
  native final report, with **Read final report** and its ordinary Mark as
  done. A session opens in the side panel by its terminal or native final
  report alone; an attention message opens no panel.
- Delete every code path, style, state, test, and documentation passage that
  only served the message in the panel or the swap between Mark as read and
  Mark as done, leaving no dead code. Update
  [explicit completion and retained attention messages](../../dashboard/AGENT-LAUNCH-COMPLETION.md),
  [terminal and record actions](../../dashboard/AGENT-LAUNCH-TERMINALS.md), and
  the side panel's description in the
  [dashboard north star](../../docs/dashboard-ux-ui-north-star.md).

**Key examples:**

- A session reports `--outcome unfinished` with a message: its card entry shows
  the message expanded under “Unfinished work”, with Mark as read beside the
  entry's own Mark as done; no panel is needed to read it.
- The developer clicks Mark as read: the message collapses to its heading, the
  session stays open with its native reading, and Mark as done is where it was.
- The developer activates the heading of a collapsed, read message: it expands
  and shows the same text, without Mark as read; activating it again collapses
  it.
- A newer report arrives for the same session: its message is unread again and
  expanded.
- A message of several thousand characters is unread: its text scrolls within
  the message part, and Mark as read and the entry's other lines stay in view.
- An ad-hoc session, which has no story card, reports with a message: its
  Recent sessions entry shows the message expanded with Mark as read.
- A session with a message is marked done: its Recent sessions entry keeps the
  message collapsed and expandable, without Mark as read.
- A Codex session whose workspace is gone holds an attention message: its entry
  shows the message in its message part, and Read final report opens the native
  final report in the side panel.
- A session without an attention message shows no message part.

**Rejection constraint:** No control that appears as a consequence of marking a
message read may mark the session done or remove it from the dashboard. A test
guards against reintroducing that swap.

**Coordination:** With Mark as done offered beside an unread message,
[Mark as done's confirmation](../../dashboard/AGENT-LAUNCH-TERMINALS.md)
owns any confirmation for a session that reported unfinished work.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Explicit completion and retained attention messages](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- Terry's 2026-10-05 request: capture this as the highest-priority queued
  story; remove the panel, show the message in the card collapsed by default
  and expanded only when unread, put Mark as read on the message, collapse it
  after reading with click-to-expand, never let Mark as read become Mark as
  done, and leave no dead code.
