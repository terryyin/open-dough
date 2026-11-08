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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer using the dashboard's embedded terminal on a phone can
insert dictated or pasted text into the current session, or recover from an
attachment that cannot yet accept it without losing a completed transcript.

**Reported behavior.** On 2026-11-08, dictation in a Codex refinement session
produced “Please figure out by yourself.” The terminal showed a Codex prompt,
but the transcript stayed under **Unsent transcript**. The warning asked the
developer to reconnect, and the panel offered **Insert transcript** and
**Discard transcript** with no **Reconnect** control. The developer also
reported that toolbar **Paste** fails when this happens.

**Reproduced behavior.** A scratch Playwright test against dashboard revision
`d328aea8f` used the Codex fixture's partial redraw. With the WebSocket open and
the prompt visible, the server had requested readiness observation but had yet
to confirm attachment. Dictation and **Insert transcript** left the transcript
pending. **Paste** read the clipboard successfully and asked the developer to
reconnect. Neither control sent text, and the panel offered no **Reconnect**
control. An Escape keypress reached the native fixture and completed its held
redraw. After the server confirmed readiness, manual insertion and Paste each
sent their text once, and Enter submitted the combined text. This reproduces
the symptom. The original attachment's readiness exchange was unavailable, so
its trigger remains unconfirmed.

**Current behavior in code.** Dictation and toolbar Paste share the
[attachment input check](../../dashboard/src/attachedTerminal.ts#L173), which
requires an open socket and confirmed attachment. For Codex the confirmation
uses a completed screen update and a visible composer cursor. The
[panel recovery control](../../dashboard/src/Terminal.tsx#L131) appears for a
reported ending or refusal, leaving pending readiness without the action the
input feedback calls for.

**Expected behavior.**

- When the embedded terminal can accept input, dictation and toolbar Paste
  insert their text once into the current session. Submission remains an
  explicit Enter.
- When readiness is pending or the attachment becomes unavailable, the panel
  gives feedback that matches its state and a usable way to recover if input
  remains unavailable. A completed transcript stays available for an explicit
  retry or discard. Reconnecting sends no text by itself.
- Cover the visible-prompt, open-socket case through both controls. Keep the
  existing distinction between a terminal that cannot accept input and a
  browser that cannot read the clipboard.
