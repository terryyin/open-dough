---
id: SEED-104
status: active
planted: 2026-10-05
planted_during: Terry's request to confirm Mark as done when a session's work may not be finished
trigger_when: A developer clicks Mark as done on a session whose intended work is not known to be complete
scope: unestimated
---

# SEED-104: Confirm Mark as done for unfinished sessions

## Why This Matters

Mark as done renames the session, closes its attachments, requests a native
stop, and removes it from the cards and Sessions sidebar. A developer can click
it while the agent is still working, waiting for an answer, or paused between
steps of work it has not finished. One click then stops or hides work the
developer meant to continue. A confirmation that names the session's actual
situation keeps the quick path for finished sessions while preventing that
loss.

## Story

<a id="confirm-mark-as-done"></a>

### Confirm Mark as done when the session's intended work is not complete

**Identity:** SEED-104#confirm-mark-as-done
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer who clicks Mark as done on a session whose intended work
is not known to be complete sees a confirmation that describes the session's
situation and marks it done only after they confirm.

**Scope:**

- Before Mark as done runs, from any place that offers it (story card, terminal
  panel, or another entry), decide whether the session's intention is complete.
- Mark it done without a prompt only when the session's intention is complete,
  such as when its latest explicit report is `completed` and it is not working
  since then.
- Otherwise show a confirmation that states the situation, for example that the
  session is still working, waiting for input, reported unfinished work, or
  stopped at a prompt without reporting completion, and asks whether to mark it
  done anyway.
- Confirming runs the existing Mark as done operation unchanged; cancelling
  leaves the session, its attachments, and its reading untouched.
- Update the [Mark as done description](../../dashboard/AGENT-LAUNCH-TERMINALS.md)
  for the confirmation.

**Key examples:**

- A session reported `--outcome completed` and now waits at its prompt: Mark as
  done completes immediately, as today.
- A session reads Working: Mark as done asks for confirmation, saying it is
  still working; Cancel leaves it running and listed.
- A session reads Needs input or waits for an answer: the confirmation says it
  is waiting for the developer's input.
- A session finished a turn (Ready for review) without a completion report, or
  reported `--outcome unfinished`: the confirmation says its work is not
  reported complete.
- Confirming in any of these cases marks the session done exactly as Mark as
  done does today.

**Refinement input:** Settle which native readings and report states count as
complete intention for each host (Claude, Codex, Cursor), including unknown or
unavailable sessions, a completed report followed by a newer instruction, and
the confirmation's wording and presentation. Coordinate with
[attention messages on the story card](SEED-103-attention-message-on-story-card.md#attention-message-on-story-card),
which removes the swap from Mark as read to Mark as done.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Mark as done operation](../../dashboard/AGENT-LAUNCH-TERMINALS.md).
- [Native readings](../../dashboard/AGENT-LAUNCH-HISTORY.md).
- [Explicit completion reports](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- Terry's 2026-10-05 request: when Mark as done is clicked and the session is
  not stopped in a state where its intention is actually complete, including a
  session waiting for input that has not completed its intention, show a
  confirmation describing the situation and asking whether to mark it done.
