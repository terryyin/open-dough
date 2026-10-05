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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/246-confirm-mark-as-done/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cf442f2ddf6c0a5be66912db06d42ed3235b71a85f6544b1553516afbcf47de0","plan":"ec0e3748b944414d69025dc83200b63226c6e43515a38fed27bc5a7f60b2c9f6"}}
```

**Goal:** A developer using the dashboard who clicks Mark as done on a session
whose intended work is not known to be complete is told the session's
situation and decides, before anything stops or leaves the page, whether to
mark it done. A session known to be complete is still marked done with one
click. This keeps unattended agent work from being stopped or hidden by a
single misplaced click.

**Scope:**

- One rule decides whether a session's intention is complete, for every host
  and every place that offers Mark as done (story card and terminal panel
  today). It is complete only when the session's latest explicit report is
  `completed`, with or without an attention message, and the reading the
  developer sees is neither working nor waiting for input. Cursor's held-screen
  labels “working” and “waiting for an answer” count as those two readings.
- Every other situation asks first: Working; Needs input; a latest report of
  `unfinished`; and no report at all, whatever the reading (Ready for review,
  Session failed, Session stopped, Awaiting first instruction, State unknown or
  not recognized, Activity unknown, Session unavailable). A `completed` report
  does not skip the question while the session reads working or waiting, which
  covers a new instruction given after the report.
- The rule uses the reading and report the page shows when the developer
  clicks, so what happens matches what they see.
- The confirmation names one situation, the most pressing that applies, in
  this order: still working; waiting for the developer's input; reported
  unfinished work; has not reported its work complete (said with the session's
  reading). It says what marking done will do when the session is working (it
  will be asked to stop) and asks whether to mark it done anyway.
- Confirming runs the existing Mark as done operation unchanged, including its
  progress and failure words. Declining leaves the session, its attachments,
  its report's read state, and its reading untouched.
- Update the [Mark as done description](../../dashboard/AGENT-LAUNCH-TERMINALS.md)
  and any other dashboard documentation passage that describes Mark as done as
  immediate.

**Deferred promises:**

- Detecting an instruction given after a `completed` report once its turn has
  ended without a newer report. That session reads complete and is marked done
  without a question, as today; a `completed` report stays the latest evidence
  until a newer report replaces it.
- Rereading native state at the click. The decision can lag the native session
  by the page's reading interval.
- A preference that turns the confirmation off, and any change to automatic
  Done on a quiet completion, alerts, Mark as read, or Delete record.

**Boundary assumption:** The rule holds whether or not
[attention messages on the story card](SEED-103-attention-message-on-story-card.md#attention-message-on-story-card)
is delivered first. An unread report does not by itself ask: a session with an
unread `completed` report that is not working or waiting is marked done at
once, which also marks the report read as today.

**UI:**

- The question appears in place, where Mark as done was clicked, in the same
  manner as Delete record's question: no separate window, and the rest of the
  page stays usable. The terminal panel asks within the panel, so the terminal
  stays visible while the developer decides.
- It offers **Mark as done** and **Keep open**. The keyboard starts on Keep
  open; Escape answers Keep open. Keep open puts the Mark as done control back
  with the keyboard on it.
- The question is announced to assistive technology when it appears.
- Wording, one statement followed by “Mark it done anyway?”:
  - “This session is still working. Marking it done asks it to stop.”
  - “This session is waiting for your input.”
  - “This session reported unfinished work.”
  - “This session has not reported its work complete. It reads <reading>.”
- While the question is open, its statement follows the session's current
  reading. If the session becomes complete meanwhile, the question goes away
  and Mark as done returns, as Delete record's question does when its state
  becomes known.

**Architecture:** Whether a session's intention is complete, and the statement
for a session whose intention is not, are one fact derived from the same
shared reading and report every entry already shows; the card and the terminal
panel consume it and hold no rule of their own, and hosts add nothing beyond
the readings they already normalize. The in-place question is one interaction
shared with Delete record, not a second copy of it.

**Key examples:**

- A Claude session reported `--outcome completed` with a reminder and reads
  Ready for review → Mark as done on its card → marked done at once, as today.
- A session reads Working, with no report → Mark as done → “This session is
  still working. Marking it done asks it to stop. Mark it done anyway?” with
  the keyboard on Keep open → Keep open → it keeps running, stays listed, and
  the keyboard returns to Mark as done.
- A session reported `completed`, then received a new instruction and reads
  Working → Mark as done → asks, saying it is still working.
- A Codex session reads Needs input → Mark as done in its terminal panel → the
  panel asks, saying it is waiting for the developer's input → Mark as done →
  marked done exactly as the operation does today.
- A session reads Ready for review and never reported → Mark as done → asks,
  saying it has not reported its work complete and reads Ready for review.
- A session reported `--outcome unfinished` and reads Ready for review → asks,
  saying it reported unfinished work.
- A Cursor session reported `completed` and its runner cannot be reached
  (Activity unknown) → Mark as done → local Done at once.
- A session reads Session unavailable and never reported → asks, saying it has
  not reported its work complete and reads Session unavailable.
- The question is open on a Working session → Escape → the question closes, the
  session is untouched, and the keyboard is on Mark as done.

<a id="prove-mark-as-done-rule"></a>

### Prove the Mark as done rule for every reading it reads

**Identity:** SEED-104#prove-mark-as-done-rule
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/249-prove-mark-as-done-rule/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"08c6edca93fd7fbda5a7e8bd05cb293428c71acb198e08d10ed2079072c0594f","plan":"a82d2ae063479d3617d40fbfb2b367f92c55068f9d29b68b76f533d716644325"}}
```

**Goal:** A maintainer changing Cursor readings or the Mark as done rule
learns at once, from a rule-level check, if a busy Cursor session or a waiting
session with a report would lose its confirmation. This corrects the
[confirm Mark as done](#confirm-mark-as-done) execution's coverage gap; it adds
no feature promise.

**Scope:**

- Rule-level checks of `unfinishedIntention` for each reading and report
  combination the rule distinguishes, including Cursor's held-screen
  “working” and “waiting for an answer” labels and the precedence between a
  report and a working or waiting reading.
- One shared test step for the native stop calls the new Mark as done journeys
  count, replacing their copies.

**Plan:** [Prove the Mark as done rule](../slice-plans/249-prove-mark-as-done-rule/PLAN.md).

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Mark as done operation](../../dashboard/AGENT-LAUNCH-TERMINALS.md).
- [Native readings](../../dashboard/AGENT-LAUNCH-HISTORY.md).
- [Explicit completion reports](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- Terry's 2026-10-05 request: when Mark as done is clicked and the session is
  not stopped in a state where its intention is actually complete, including a
  session waiting for input that has not completed its intention, show a
  confirmation describing the situation and asking whether to mark it done.
