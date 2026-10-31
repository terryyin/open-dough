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

Queue one frontend story immediately after
[the mobile-session story](SEED-199-mobile-session-screen.md#mobile-session-screen),
as Terry requested. Existing launch-instruction dictation already records and
transcribes speech through configured OpenAI access. Build on that capability
where appropriate, with the open terminal as the text destination. Provider
replacement and a separate voice service are outside this frontend outcome.

## Selected Stories

<a id="session-terminal-voice-input"></a>

### Dictate text into the session terminal from its header

**Identity:** SEED-200#session-terminal-voice-input

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/426-session-terminal-voice-input/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"dc2b6ff818be322d46b60e303d63c7ed9a0bacb3523f46c4d2eefeaa995c4fd8","plan":"7e42b41ea96a231f6a299c400d893fc7a67e192b2e51a5a8861dad22bc8403ed"}}
```

**Beneficiary:** A developer entering instructions into a dashboard session
terminal on mobile or desktop.

**Goal:** Use a compact session-bar microphone to turn speech into text and
insert it into the open session's current terminal input, so a developer can
continue an existing session without a new launch or copying from a dialog.

**Scope:**

- Add a small microphone icon button to the session bar, immediately before
  Mark as done when that action is available. Keep it with the other session
  actions when Mark as done is unavailable. Give the icon an accessible name
  and keep it usable with touch and keyboard at narrow and desktop widths.
- Let the developer start and stop recording from that control, with clear
  microphone-permission, recording, and transcription feedback. The microphone
  starts capture and becomes Stop while recording; a pending permission or
  transcription request cannot start another capture. Status must be available
  without relying on color or hover. Keep the header compact and Close
  reachable; ordinary terminal typing remains available during dictation.
- Offer each successful transcript once to the same terminal's normal input
  path at its input position when the result arrives, then return focus there.
  Do not clear, reconstruct, or replace existing native input. The developer
  edits and submits through the terminal's normal controls. Dictation sends
  text without Enter or terminal control actions: render transcript line
  breaks as spaces and remove other terminal control characters so provider
  text cannot submit input, move the cursor, or issue an escape command.
  Preserve the spoken words and punctuation. Do not copy the launch field's
  blank-line separator into terminal input.
- Reuse applicable recording, transcription, configuration, and recovery
  behavior already provided for launch instructions. Missing setup, microphone
  permission refusal, unsupported recording, empty speech, and transcription
  failure leave ordinary terminal typing available and offer understandable
  guidance or an explicit retry.
- Associate capture and its result with the session where recording began.
  Closing or switching the session view releases recording and cancels pending
  work, including a permission request granted after dismissal; a late result
  must not enter another session or a reopened instance of the old view.
  Mark as done that closes the view has the same cleanup. If transcription
  succeeds but the attachment cannot accept text, retain the complete
  transcript in this session view, explain that it was not inserted, and offer
  explicit Insert after reconnect plus Discard. Do not replace the retained
  result with a new recording: settle it through Insert or Discard first.
  Closing or switching discards it. No automatic replay of input already
  offered to the connection: the current terminal transport has no delivery
  receipt, so replay could duplicate text.
- Add focused frontend proof for placement, voice-to-terminal input, and
  lifecycle/failure behavior, and update maintained session documentation.

**Required restrictions and their reasons:**

- Dictation cannot send Enter or terminal control characters because the
  developer must retain the promised opportunity to edit before submission.
- A result cannot outlive its session view or move to another session because
  it could otherwise enter instructions into the wrong native conversation.
- Do not replay an uncertain send automatically; without a delivery receipt,
  that could duplicate an instruction. "Once" is one frontend insertion
  attempt per successful result, not a new end-to-end delivery guarantee.

**Deferred promises:**

- Provider replacement, another audio service, continuous listening, and
  automatic submission are outside this increment. Reuse the current provider
  and configured access.
- Durable transcript history, recovery after closing/reloading the view,
  offline delivery, and a terminal delivery-acknowledgment protocol are not
  promised. These are delivery boundaries, not rules for rejecting otherwise
  supported ordinary terminal input.
- This story does not redesign session layout. Reconcile its control and
  feedback with SEED-199's compact header and mobile screen when that work
  lands; queue order is not a blocking dependency.

**Key examples:**

1. An open phone refinement terminal already contains `Review ` → activate
   the microphone before Mark as done, speak `the session header`, and Stop →
   the native input contains `Review the session header` once, has focus, and
   has not submitted. Edit it, then press Enter → the session receives the
   edited instruction. Typing during capture remains ordinary terminal input.
2. An attached desktop terminal with keyboard focus → Tab to the microphone,
   start, and stop → the same input behavior, with understandable state and
   reachable Close. Where Mark as done is unavailable, the microphone remains
   with the other session actions.
3. Provider text includes `Review the header\nthen the controls` → transcription
   completes → those words enter as one line without an Enter or control
   action. Launch dictation still uses its existing blank-line append and
   4,000-character review behavior; terminal insertion does not inherit that
   launch-only limit or review dialog.
4. Missing configured access, refused permission, unsupported capture, empty
   speech, or failed transcription → activate dictation → the applicable safe
   recovery guidance is visible and announced; ordinary typing remains usable
   and another recording requires an explicit action. Reuse existing settings
   guidance rather than another credential store.
5. Session A has active recording, pending permission, or transcription →
   Close it, mark it done so the view closes, or open B → capture is released
   and the request is cancelled. Deliver an already-completed response late,
   or grant permission late → no text appears in B or a reopened A.
6. Session A's terminal disconnects before insertion → transcription completes
   → the complete transcript stays visible in A with an explanation and
   Discard; another recording waits for that result to be settled. Reconnect
   → no automatic insertion. Choose Insert → text enters A once and focus
   returns there; choose Discard instead → no text is sent. Close or switch
   to B before choosing → the retained text is discarded and never enters B.
   A transcript already handed to an open connection is never automatically
   replayed after reconnect, because delivery may already have happened.

**Architecture and reuse:**

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
this is an input operation on a session in the Side panel, not a new launch,
assignment, or workflow record. Pending capture and transcript recovery are
local presentation state. No server database or durable project-state store
is needed. [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md)
keeps this feature-local design here and in maintained session documentation.
The index and relevant records agree on Accepted status; no conflict or
supersession was found.

PFE found one capture/transcription owner:
[`useInstructionRecording`](../../dashboard/src/useInstructionRecording.ts)
already owns configuration checking, audio capture, explicit Stop, resource
release, abort, and stale-operation guards. Its successful-text callback is
independent of the launch dialog. Reuse it and the existing
[`/__instruction-transcription` boundary](../../dashboard/server/instructionTranscriptionBoundary.ts).
Keep [`useLaunchInstruction`](../../dashboard/src/LaunchInstruction.tsx) as
the launch-field adapter, with its separator, length limit, overflow review,
and settings-return draft. Do not introduce another recorder, transcription
endpoint, configuration path, or provider error policy for terminal input.
Neutral naming is warranted only where it improves these current consumers.

[`useAttachedTerminal`](../../dashboard/src/useAttachedTerminal.ts) owns the
live xterm and socket; expose a small session-bound text-insertion operation
there, rather than a second socket or DOM keyboard simulation. Its current
send silently skips a closed socket, so the operation must report inability to
offer text before the destination adapter discards its result. Keep that
adapter's state with the keyed session view in
[`PageFrame`](../../dashboard/src/PageFrame.tsx), independently of an
attachment retry. Do not claim a successful local send proves native delivery.

Borrow candidate: a document import converts a source once, then hands the
result to the destination editor's own insertion operation; failed insertion
can retain a staged result for a deliberate retry. Here the shared recorder is
the source, transcription the conversion, and terminal input the destination.
This separates common conversion from destination-specific editing and
recovery. Limit: a terminal can act on input immediately and lacks delivery
receipts; the analogy does not justify multiline paste, automatic resending,
or a general import framework. Terry selected the retained-result recovery
below; this is a destination-specific adapter, not a second dictation system.

**Investigation evidence (2026-10-31):**

- In this owned checkout at `2fa92b73`, the existing launch dictation and
  terminal journeys passed: `env -u NO_COLOR -u FORCE_COLOR
npm run test:dashboard -- session-instruction-voice.spec.ts
agent-terminal.spec.ts --workers=1` (three tests, 34.9 seconds). They used
  real browser recording, the local transcription boundary with a synthetic
  provider, and a synthetic native terminal; no paid service was contacted.
  The first run failed the strict reporter only because inherited color
  variables caused Node warnings; clearing both variables produced the pass.
- Discrimination: temporarily suppressing `append(answer.text)` and terminal
  `send({ input })`, then running the same specs with `--grep 'two real
clips|a card or standalone' --max-failures=2`, failed respectively on the
  missing appended transcript and missing `echo yes, go on`. Both source
  files were restored byte-for-byte before this seed write. These observations
  establish existing reuse/proof routes, not the undelivered terminal feature.
- A local browser probe against installed xterm 6.0.0 observed
  `input('spoken text')` emit that text once through `onData`. In the same
  probe, `paste('first\nsecond')` emitted `first\rsecond` without bracketed
  paste mode and escape-wrapped carriage returns with it. Therefore multiline
  paste cannot itself establish this story's no-Enter promise.
- Code inspection found no existing session-terminal dictation control.
  `PageFrame` keys the terminal by session, and the recording hook invalidates
  cancelled operations; these are the reuse points for session isolation.
  The new terminal-specific integration and lifecycle still require proof
  during execution. Current provider/microphone support on a physical phone
  was not observed; this story reuses existing capture support and guidance.

**Decision — disconnected transcript recovery (Terry, 2026-10-31):**

"ok. retain" selects retaining an unsent transcript in its current session
view for explicit Insert after reconnect, with Discard available. Closing or
switching still discards it. This avoids repeating speech without adding
persistence or replaying an uncertain send. No human decision remains open.

**Effort hypothesis:** M, medium confidence. Recording and transcription
already exist; terminal insertion, compact controls, and session-bound
asynchronous results need implementation and focused verification.

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
