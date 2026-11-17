---
id: SEED-392
status: active
planted: 2026-11-17
planted_during: Request for a standalone dashboard terminal dictation button and more quick replies
trigger_when: selected from the product backlog
scope: story
---

# SEED-392 — Separate dashboard terminal dictation from quick replies

<a id="separate-dashboard-terminal-dictation-from-quick-replies"></a>

### Separate dashboard terminal dictation from quick replies

**Identity:** SEED-392#separate-dashboard-terminal-dictation-from-quick-replies

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/673-separate-dashboard-terminal-dictation-from-quick-replies/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8f26cad8d4214664c2b1d360ecfd2f3901eee1dc391feb6b6cdbe836807d6044","plan":"25b4aca2ea2503c16baa43f82693c4f179fcf7fd0904927b9ac4feb732e0aaaa"}}
```

#### Goal

A developer using the dashboard terminal during an interactive agent session can
start and stop dictation with one dedicated header control, and pick from a
larger set of fixed quick replies in **Prompts**, without opening a menu to
dictate or losing replies while recording.

#### Scope

- **Standalone dictation control.** On desktop and mobile, the terminal session
  actions include a microphone icon button with an accessible name that starts
  dictation directly. While recording, that same control becomes the stop
  control (**Stop recording**). Dictation keeps today's transcript insertion,
  pending-result recovery, permission/setup feedback, and cancel-on-close or
  session-switch behavior from
  [terminal input](../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md).
- **Prompts is replies only.** **Prompts** remains a separate session-actions
  control and stays available while recording. Its menu offers only fixed quick
  replies: `OK`, `as recommended`, `Try again`, `Resume`, and `Please explain`.
  **Dictate into terminal** is no longer a Prompts item.
- **Reply insertion.** Choosing a reply closes the menu, inserts that literal
  phrase through the normal attachment insert path, preserves existing input,
  sends no Enter, and returns focus to the terminal for edit or deliberate
  Enter. When the attachment cannot accept input, feedback names **Reconnect**,
  **Open again**, or that the terminal is still connecting; the developer
  recovers, then opens **Prompts** again.
- **Keyboard reach.** From terminal input, **Alt+F10** still focuses session
  actions; Tab reaches both the dictation control and **Prompts**.
- **Scope limits.** Custom or editable reply lists; attaching story notes as
  replies ([SEED-348](SEED-348-collect-notes-for-story-follow-ups.md)); changing
  launch-instruction dictation; changing phone composer or key-toolbar
  behavior; auto-submitting inserted replies or transcripts.

#### Key examples

- Terminal attached and ready on desktop or mobile. → Session actions show a
  microphone control and **Prompts** separately. Opening **Prompts** lists only
  the five replies above; there is no **Dictate into terminal**.
- Developer activates the microphone control. → Capture starts without opening
  a menu. The control becomes **Stop recording**; **Prompts** stays available.
  Stopping offers the transcript once through the normal path and restores the
  microphone control.
- Developer chooses `Try again` (or any listed reply) from **Prompts**. → The
  phrase is inserted, existing input remains, focus returns to the terminal, and
  nothing is submitted until Enter.
- Terminal cannot accept input (still connecting, or needs reconnect / open
  again). → Choosing a reply shows the same recovery guidance as today; after
  recovery, **Prompts** works again. Dictation that cannot be offered keeps
  today's pending transcript insert/discard path.
- Unsent transcript is pending, or capture is busy. → The microphone control
  does not start a new recording until that state clears, matching today's
  dictate availability.

#### UI

Who: a developer mid-session in the dashboard terminal, often alternating
between short typed replies and longer dictated prompts.

Task steps and feedback:

1. See two distinct header actions: microphone (dictate) and **Prompts**
   (fixed replies).
2. One activation of the microphone starts capture; status in the panel still
   announces permission, recording, and transcription. The same control stops
   capture.
3. Open **Prompts** for a short fixed phrase when typing that phrase would be
   slower; the menu closes on choice and leaves the text editable in the
   terminal.
4. While recording, replies remain reachable in **Prompts**; inserting a reply
   does not stop capture. The later transcript still inserts through the normal
   path and preserves existing input.

Confusion or exclusion risks this story removes: burying dictation inside the
replies menu, and replacing **Prompts** with Stop so replies disappear for the
whole recording. Exact iconography and accessible start name are
implementation details so long as the control is a named microphone button that
starts dictation directly and becomes **Stop recording** while capturing.
No layout sketch is required beyond that interaction.
