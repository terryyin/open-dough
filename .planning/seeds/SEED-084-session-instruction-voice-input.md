---
id: SEED-084
status: active
planted: 2026-10-03
planted_during: Maintainer request to capture session voice input
trigger_when: A developer wants to dictate additional instructions when starting a dashboard session
scope: unestimated
---

# SEED-084: Voice input for session instructions

## Why This Matters

A developer starting a dashboard session wants to speak the additional
instructions instead of typing them into the text area.

## Stories

<a id="session-instruction-voice-input"></a>

### Dictate additional instructions when starting a session

**Identity:** SEED-084#session-instruction-voice-input
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/223-session-instruction-voice-input/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7483e265ad991d98e05bddca23b8e48d9d83487e1b2ac14d4590ae773edfbd25","plan":"6001b2356b26e432e4a7459b171c52ed457bdc2ab431076fa49e0a3c342e9cfe"}}
```

#### Goal

A developer preparing a dashboard session can speak additional instructions,
review and edit the resulting text in the startup instruction field, and start
the session with that text. This removes typing from drafting those instructions
while preserving the developer's control over what the agent receives.

#### Scope

Required behavior (recommended direction accepted by Terry on 2026-10-03):

- Voice input produces text in the existing startup instruction field.
- The developer can review and edit that text before explicitly starting the
  session. Dictation itself does not start an agent session.
- The session receives the reviewed field text through the existing instruction
  path, with the same meaning as typed instructions.

The accepted recording and review flow:

- Explicit Record and Stop actions, with feedback distinguishing permission
  pending, recording, and transcription pending. Stop ends microphone capture
  before transcription; a completed transcript becomes editable field text.
- Preserve existing text and append the completed transcript once. While a clip
  is pending, prevent edits to its destination and prevent Start; Cancel remains
  available. Afterwards the developer can edit, type, or dictate another clip.
- Permission refusal, missing microphone/service configuration, empty results,
  and failed transcription explain what happened and leave existing text usable.
  Recovery is retrying explicitly or continuing by typing; no automatic paid
  retry. Closing the dialog ends capture and prevents a late result from changing
  a subsequently opened dialog.
- Respect the existing 4,000-character instruction limit. If adding the transcript
  would exceed it, preserve existing text and offer the complete transcript for
  shortening before insertion; never silently truncate the developer's words.

Deferred promises: live partial transcription, automatic speech-end detection,
audio playback/history, importing audio files, offline transcription, translation,
and a provider chooser are not delivery commitments. Naturally supported input
does not need to be rejected because an example omits it. Planning uses the
dashboard's existing Chromium coverage and an English instruction as the first
representative example; that is a verification baseline, not a rejection of
other browsers or languages.

The captured request excludes adding a live voice conversation to agent sessions.
No other voice-specific rejection constraint has been supplied.

#### Key examples

1. **Captured outcome:** The startup instruction field is empty → the developer
   dictates “Investigate the existing launcher before proposing changes,” reviews
   its transcription, changes “launcher” to “launch dialog,” and presses Start →
   the session receives the edited instruction.
2. **Text preservation:** The field already says “Keep this work local”
   → the developer records and stops “Do not implement yet” → existing words
   remain, the new text is appended once, and both can be edited before Start.
3. **Recovery:** The field contains typed instructions → microphone
   permission is denied, or transcription fails → the field is intact, the reason
   is visible, and the developer can retry or start with the typed instructions.
4. **Cancellation:** A clip is recording or awaiting transcription → the
   developer cancels the launch dialog → capture ends, no session starts, and a
   later transcript cannot populate a new dialog.
5. **Length boundary:** Existing text plus a transcript exceeds 4,000
   characters → transcription completes → existing text remains intact and the
   developer can shorten the full transcript before adding it and starting.

#### Alternatives and interaction trade-offs

All candidates serve the same dictate → review/edit → explicit Start outcome.
The comparison informed the API direction selected below; it selects no layout.

| Candidate | Effect on the developer and consequence for the system |
| --- | --- |
| Existing OS dictation into the focused field, or dictation in ChatGPT/Codex followed by paste | Smallest product change and no dashboard credential setup, but relies on an external interaction. Native app dictation is documented; insertion into this dashboard has not been observed. It may satisfy the goal if that interaction is acceptable. |
| Browser speech recognition in the field | Can provide in-place dictation without an OpenAI API key. Browser/language availability and service behavior become dependencies; it is not necessarily offline. Limited browser availability is documented, but successful recognition here is unobserved. |
| Codex/ChatGPT transcription service reused by the dashboard | Could avoid separate API setup if an accessible service fits. App dictation exists, but a standalone external transcription contract was not established. Installed Codex exposes experimental thread-scoped realtime audio, which adds conversation/thread lifecycle responsibilities beyond the requested field. Suitability remains unproven. |
| Record a clip, then use the OpenAI transcription API | Offers a documented file-to-text operation with explicit recording and review. Adds local-server credential configuration, network transfer, metered usage, and a wait after Stop; it does not need an agent conversation. |

**Selected direction:** Record → Stop → completed transcription → review/edit →
Start, using the OpenAI file-transcription API. Terry accepted the recommended
approach and the use of the existing environment credential on 2026-10-03.
The local server reads `OPENAI_API_KEY`; no key entry or provider chooser is added
to the dashboard. Explicit dictation in this field is the chosen outcome rather
than relying on an external dictation-and-paste workaround. No further host
transcription investigation is a prerequisite.

#### Investigation evidence

Observed on 2026-10-03; availability and prices should be rechecked when planning:

- [LaunchDialog.tsx](../../dashboard/src/LaunchDialog.tsx) owns the shared startup
  text field and reads it only on Start. Story launches and unattached sessions
  use it via [StartLaunch.tsx](../../dashboard/src/StartLaunch.tsx) and
  [StartSession.tsx](../../dashboard/src/StartSession.tsx). The
  [request contract](../../dashboard/src/launchRequest.ts) limits instructions to
  4,000 characters. Codex, Claude Code, and Cursor already consume text through
  their existing launch adapters. This supports reusing the text path; it does
  not prove a new voice path works.
- Official documentation confirms [Codex app dictation](https://learn.chatgpt.com/docs/whats-new#the-codex-app-launches-on-macos)
  and an [app dictation shortcut](https://learn.chatgpt.com/docs/reference/commands#keyboard-shortcuts).
  These establish native UI capability, not an external service entitlement.
- Ran `codex --version` (0.160.0) and
  `codex app-server generate-json-schema --experimental --out <temporary-dir>`.
  Inspected generated `ClientRequest.json`, `ThreadRealtimeStartParams.json`,
  and `ThreadRealtimeTranscriptDoneNotification.json`: realtime methods and
  audio inputs exist, but no standalone transcription request was found in that
  version's method list. Realtime start requires a thread ID; it has transcript
  events and delegation/handoff settings. The
  [App Server documentation](https://developers.openai.com/codex/app-server/)
  explains schema generation and experimental opt-in. No realtime session was
  started; account access, billing, and field-only suitability are unresolved.
- [OpenAI speech-to-text documentation](https://developers.openai.com/api/docs/guides/speech-to-text)
  documents completed-file transcription through `/v1/audio/transcriptions`,
  recommends `gpt-transcribe`, and accepts WebM among other formats, up to 25 MB.
  [Pricing](https://developers.openai.com/api/docs/pricing) lists an estimated
  $0.0045 per minute for that model. This is documentation evidence, not an API
  account/access or latency observation; no paid request was made.
- A disposable headless Chrome 155 check on a loopback HTTP page used an
  AudioContext oscillator as a synthetic source and consumed that stream with
  MediaRecorder. WebM/Opus recording produced a nonempty 2,228-byte blob; the
  context was secure and `getUserMedia` was present. This observes recording
  support without microphone access. It does not establish permission success,
  speech accuracy, API decoding, or support in another browser. Existing
  [dashboard browser checks](../../dashboard/playwright.config.ts) use Chromium.
- [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
  documents limited browser availability and possible server processing.
  [Microphone capture](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
  requires permission and a secure context; loopback is eligible.

A presence-only environment check on 2026-10-03 found `OPENAI_API_KEY` nonempty.
Its value was neither printed nor copied. This establishes availability to this
execution environment, not authentication, credit balance, model entitlement,
or inheritance by a separately launched dashboard process. No paid API request
was made during preparation.

Remaining hypotheses and cheapest decisive observations:

- The API will recognize the developer's instructions with acceptable accuracy
  and delay: execution begins with a bounded real-service probe using a spoken
  clip containing project/skill names, consume the returned transcript in the
  field, correct it, and observe the launched session's first instruction.
  Synthetic recording and documentation do not settle that journey.
- The intended browser can capture the actual microphone: observe permission,
  Record, and Stop on that browser and device. The synthetic check settles only
  recording format support for the observed Chrome version.

#### Architecture

Design for the selected API direction:

- The browser owns recording and the editable draft; the local server owns the
  transcription request and credential. Keep credentials on the server under
  [OpenAI authentication guidance](https://developers.openai.com/api/reference/overview#authentication).
  Do not assume ChatGPT/Codex login grants API transcription access.
- Reuse the dashboard's loopback and same-origin service boundary. Transcription
  precedes session launch and does not allocate a story assignment, workspace,
  or agent thread. The chosen agent host receives ordinary reviewed text, so
  transcription service selection need not follow the host/model selection.
- Keep audio transient for this interaction; the existing launch record may
  retain the submitted text as it already does. Do not introduce an audio store
  or general voice-service framework for deferred capabilities. Concrete audio
  size/duration bounds, request timeout, and cleanup belong in a selected design;
  the API's 25 MB ceiling is a provider limit, not an agreed product duration.
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  requires cohesive reuse and the least complexity delivering the outcome. The
  shared field/text path fits that guidance; future voice conversations justify
  no machinery here. Under
  [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md), this feature's
  design stays in its seed rather than creating an architectural decision.
  The ADR index and in-file statuses agree: ADRs 0000–0006 are Accepted;
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  is Proposed and supplies context only. No Accepted-ADR conflict was found.

#### Preparation decisions

- The API direction and environment credential are accepted. Recording, append,
  review, cancellation, recovery, and over-length examples above define the
  refined outcome. No unresolved goal or scope decision blocks planning.
- Credential access, actual microphone capture, and transcription quality remain
  factual premises. The executable plan owns an early probe; failure stops the
  dependent implementation and returns the evidence for a revised approach.
- The first proof uses Chromium and an English instruction containing project
  names. No accuracy guarantee or universal browser/language claim is inferred.
- [Slice plan](../slice-plans/223-session-instruction-voice-input/PLAN.md).
  This session is authorized to refine and plan, not implement or publish.

## Breadcrumbs

- Terry's 2026-10-03 request: capture this as the first queued story, investigate
  Codex or ChatGPT support, and use the OpenAI API as a fallback possibility.
- Terry's 2026-10-03 follow-up: accept the recommended API approach, use the
  existing environment credential, complete refinement, and write a slice plan.
- [Product backlog](../PRODUCT-BACKLOG.md).
