---
id: SEED-269
status: active
planted: 2026-11-08
scope: story
---

# Recover text input in the embedded terminal

<a id="recover-terminal-insert"></a>

### Recover dictation and Paste in the embedded terminal

**Identity:** SEED-269#recover-terminal-insert
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/519-recover-terminal-insert/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"497f326e5f00eabbdaa07cf0b7ae68963375b66e7e24de70c0f853f92766de1d","plan":"6536dccaf0d63c68564ecb2a24f57eee401d59162d6c46f112c62183df34d51e"}}
```

**Goal.** A developer using the dashboard's embedded terminal on a phone can
insert dictated or pasted text into the current session whenever the terminal
already accepts their typing, or recover from an attachment that cannot accept
it without losing a completed transcript. Text input on the phone becomes as
dependable as typing, which keeps phone-driven sessions moving.

**Reported behavior.** On 2026-11-08, dictation in a Codex refinement session
produced “Please figure out by yourself.” The terminal showed a Codex prompt,
but the transcript stayed under **Unsent transcript**. The warning asked the
developer to reconnect, and the panel offered **Insert transcript** and
**Discard transcript** with no **Reconnect** control. The developer also
reported that toolbar **Paste** fails when this happens.

**Reproduced behavior.** A scratch Playwright test against dashboard revision
`d328aea8f` used the Codex fixture's partial redraw (a synchronized update left
open). With the WebSocket open and the prompt visible, the server had requested
readiness observation but had yet to confirm attachment. Dictation and
**Insert transcript** left the transcript pending. **Paste** read the clipboard
and asked the developer to reconnect. Neither control sent text, and the panel
offered no **Reconnect** control. An Escape keypress reached the native fixture
and completed its held redraw. After the server confirmed readiness, manual
insertion and Paste each sent their text once, and Enter submitted the
combined text. The original attachment's readiness exchange was unavailable,
so the real Codex trigger remains unconfirmed.

**Findings (code at `dc25b93aa`).**

- Typing is not gated by readiness: xterm input goes straight to the open
  socket, and the server writes page input to the native process before and
  after admission (`dashboard/server/joinedSockets.ts`, `listen`).
- Dictation, **Insert transcript**, toolbar **Paste**, composer **Insert**, and
  every toolbar key (Esc, Tab, arrows, Enter, Ctrl+C) share the attachment's
  `insert`/`paste` acceptance (`dashboard/src/attachedTerminal.ts`,
  `acceptsInput`), which additionally requires the server's readiness
  confirmation. Toolbar keys are dropped silently while it is pending.
- For Codex and Cursor the server confirms readiness only from a screen the
  page reports after a completed synchronized frame with a visible composer
  cursor. A frame left open, or no later completed frame, leaves it pending
  while the socket stays open and no ending or refusal is shown. The reported
  panel (prompt visible, no **Reconnect**) matches this state: a closed socket
  or refusal would have shown the panel's recovery control.
- Readiness confirmation has its own purpose: it decides that a reopened
  session counts as reopened (clearing a done mark) and how a startup failure
  closes. The existing held-frame test keeps the done mark until the frame
  completes.

#### Scope

**Required behavior.**

- Deliberate and dictated text input — completed dictation, **Insert
  transcript**, toolbar **Paste** (text or stored image path), composer
  **Insert**, and toolbar keys — is accepted whenever the panel's current
  attachment is open and not refused, the same condition under which typing
  reaches the session. Each offer is sent once; submission remains an explicit
  Enter.
- Readiness confirmation keeps deciding reopening and startup-failure
  handling; accepting input does not confirm readiness or clear a done mark by
  itself.
- When input cannot be accepted, feedback matches the panel's state and names
  the recovery the panel actually offers: the shown **Reconnect** or **Open
  again** action after an ending or refusal, or waiting while the terminal is
  still connecting. A completed transcript stays available for an explicit
  **Insert transcript** or **Discard transcript**; reconnecting sends no text
  by itself.
- Keep the distinction between a terminal that cannot accept input and a
  browser that cannot read the clipboard.

**Scope limits.**

- The real Codex trigger that leaves readiness pending is not diagnosed or
  changed here; when readiness is confirmed for reopening is unchanged.
- No new feedback for toolbar keys pressed while the attachment is closed; the
  panel's ending status already explains that state.
- Retaining a transcript after it was offered (for example because the native
  host ignored input during its own startup) is not promised. A local offer
  remains no native delivery receipt, exactly as for typing.

**Considered and not chosen.**

- Detecting readiness more often, or judging the current screen when the
  developer presses Insert or Paste: it depends on the unconfirmed trigger and
  on mid-frame cursor state, and would clear a done mark on a screen the
  existing held-frame rule deliberately does not judge.
- Offering only a **Reconnect** while readiness is pending: for Codex it
  restarts the native resume, loses the composer draft, and still refuses
  input on a prompt the developer can already type into.
- Holding automatic transcript offers until readiness while letting deliberate
  actions through (a “proceed on sight” rule borrowed from permissive railway
  signals): it guards a loss no observation shows and splits one acceptance
  rule into two.

#### Key examples

1. **Dictation on a visible prompt.** Codex attachment open, prompt visible,
   readiness still pending → the developer dictates “Please figure out by
   yourself.” → the text appears once in the composer, no **Unsent
   transcript** panel, nothing is submitted until the developer presses Enter.
2. **Paste on the same screen.** Same state, clipboard holds text → the
   developer taps **Paste** → the text is pasted once with no trailing Enter
   and no reconnect message.
3. **Toolbar key while pending.** Same state → the developer taps toolbar
   **Esc** → the native terminal receives Escape (the held redraw completes in
   the fixture).
4. **Done mark unchanged by input.** A done Codex session reopened into the
   held frame → the developer pastes text → the text is sent, and the done
   mark stays until the server confirms a ready completed frame.
5. **Attachment ended.** The terminal ended and the panel shows **Open again**
   → a transcript completes → it stays under **Unsent transcript** with
   feedback naming **Open again**; after reopening, **Insert transcript**
   sends it once, and reopening alone sends nothing.
6. **Clipboard unreadable.** Attachment open, browser refuses clipboard access
   → **Paste** → feedback to use Compose and the keyboard's own Paste, not a
   reconnect message.

#### Architecture

The page's attachment currently treats “the server confirmed readiness” as
“this terminal accepts input” for its own insert path, while the keyboard path
does not. This story gives the attachment one input-acceptance rule (current,
open, not refused) shared by typing, toolbar, composer, dictation, and Paste,
and leaves readiness confirmation solely with reopening and startup-failure
classification on the server side. No protocol, server, or host change is
expected. ADR 0008 (local session capabilities supplement the published view)
applies without conflict.
