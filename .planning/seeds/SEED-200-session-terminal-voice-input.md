---
id: SEED-200
status: active
planted: 2026-10-31
planted_during: Terry's request for a microphone button on the session bar
trigger_when: A developer wants to dictate text into an open dashboard session terminal
scope: one frontend session-input story
---

# SEED-200: Dictate text directly into the session terminal

## Why This Matters

A developer interacting with a session, especially on a phone, should be able
to speak an instruction and have the resulting text inserted into that
session's terminal. The session bar should offer a small microphone beside
the existing actions, without requiring a new launch or a copy-and-paste step.

## Alternatives and Decision

Queue one frontend story immediately after the delivered mobile-session screen
work (Side panel covering and compact header in
[dashboard navigation](../../docs/dashboard-navigation.md)),
as Terry requested. Existing launch-instruction dictation already records and
transcribes speech through configured OpenAI access. Build on that capability
where appropriate, with the open terminal as the text destination. Provider
replacement and a separate voice service are outside this frontend outcome.

## Selected Stories

<a id="session-terminal-voice-input"></a>

### Dictate text into the session terminal from its header

**Identity:** SEED-200#session-terminal-voice-input
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer entering instructions into a dashboard session
terminal on mobile or desktop.

**Goal:** Use a compact session-bar microphone to turn speech into text and
insert it directly into the session being viewed.

**Scope:**

- Add a small microphone icon button to the session bar, immediately before
  Mark as done when that action is available. Keep it with the other session
  actions when Mark as done is unavailable. Give the icon an accessible name
  and keep it usable with touch and keyboard at narrow and desktop widths.
- Let the developer start and stop recording from that control, with clear
  recording and transcription feedback. Keep the session header compact and
  Close reachable alongside voice input.
- Insert each completed transcript once through the terminal's normal text
  input path, preserving existing input and returning focus to the terminal.
  The developer can edit or submit it through the terminal's normal controls;
  dictation itself does not add an Enter/submit action or require copying text
  from a separate launch dialog.
- Reuse applicable recording, transcription, configuration, and recovery
  behavior already provided for launch instructions. Missing setup, microphone
  permission refusal, unsupported recording, empty speech, and transcription
  failure leave ordinary terminal typing available and offer understandable
  guidance or an explicit retry.
- Associate capture and its result with the session where recording began.
  Closing or switching the session view releases recording and cancels pending
  work; a late result must not enter another session. A disconnected terminal
  must not silently lose or misroute a completed transcript; settle its
  recoverable handling during refinement.
- Add focused frontend proof for placement, voice-to-terminal input, and
  lifecycle/failure behavior, and update maintained session documentation.

**Evaluation:**

1. In an open mobile refinement session, activate the microphone before Mark
   as done, speak, and stop. The transcribed text appears once in that session's
   terminal input without a copy step. Existing text is preserved; the user
   can edit it and press Enter normally.
2. Use the same control on desktop by keyboard. Recording/transcription state
   is understandable, and the compact header's other actions stay reachable.
3. Refuse microphone access or fail transcription. The session remains usable
   for typing, the problem is explained, and retry is deliberate.
4. Start dictation in session A, then close it or open session B before the
   result returns. Capture ends and no late transcript is inserted into B.
   A lost terminal connection has an explicit recoverable outcome.

**Effort hypothesis:** M, medium confidence. Recording and transcription
already exist; terminal insertion, compact controls, and session-bound
asynchronous results need refinement and focused verification.

**Product prerequisites:** None established. Requested queue order does not
make the mobile-session story a blocking dependency; reconcile the shared
header with its eventual layout.

**Safe stopping point:** Speech can populate an open terminal from its compact
header control, independently of further dashboard navigation improvements.

## Breadcrumbs

- Terry's 2026-10-31 request: a new frontend story after the mobile-session
  story, small microphone before Mark as done, speech converted into terminal
  input, recorded on main and synchronized with origin.
- [Session header](../../dashboard/src/Terminal.tsx) and
  [terminal attachment and input](../../dashboard/src/useAttachedTerminal.ts).
- [Existing dictation UI](../../dashboard/src/LaunchInstruction.tsx),
  [recording lifecycle](../../dashboard/src/useInstructionRecording.ts), and
  [transcription contract](../../dashboard/src/instructionTranscription.ts).
- [Maintained launch and dictation behavior](../../dashboard/AGENT-LAUNCH.md) and
  [voice-input journeys](../../dashboard/tests/session-instruction-voice.spec.ts).
