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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/223-session-instruction-voice-input/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84f9896687087a71b2fff6c9dc2bb8f2cd7566436e45c395a569fd907254437a","plan":"ee4e5f1486ed72e5fe71e02d4316f47a07ad3ddc1fbae4f08be0c44d761d0641"}}
```

#### Goal

A developer preparing a dashboard session can speak additional instructions,
review and edit the resulting text in the startup instruction field, and start
the session with that text. This removes typing from drafting those instructions
while preserving the developer's control over what the agent receives.
The dashboard also gives the developer one cohesive System settings view for
machine-local configuration: project management and a general OpenAI API key,
first used by instruction dictation.

#### Scope

Required behavior (recommended direction accepted by Terry on 2026-10-03):

- Voice input produces text in the existing startup instruction field.
- The developer can review and edit that text before explicitly starting the
  session. Dictation itself does not start an agent session.
- The session receives the reviewed field text through the existing instruction
  path, with the same meaning as typed instructions.

Additional required behavior (Terry's 2026-10-03 refinement follow-up):

- Provide a System settings UI consistent with the dashboard's existing visual
  and interaction language and mapped directly to domain concepts.
- Move the current Add project and Remove project behavior into System settings.
  The project selector remains for choosing the project being observed; project
  management belongs to the machine-local settings view.
- Preserve the existing project configuration contract: GitHub URL and local
  checkout path, ordered saved projects, separate development/production lists,
  validation and failure recovery. Removing a configured project retains its
  checkout, session records, and running sessions.
- Let the developer configure, replace, and remove one general OpenAI API key
  through System settings. Save it on this machine through the local server and
  retain it across dashboard restarts. The credential belongs to OpenAI access,
  not to a project, agent host, or dictation-only setting; dictation is its first
  consumer. A saved key is configured, not necessarily verified with OpenAI.
- Ordinary dictation uses the key configured through System settings. Terry's
  existing environment key may be used only for brief experiments or tests
  within this story; do not import it into settings or retain an environment
  fallback in the delivered feature. This supersedes the earlier environment-key
  runtime direction.
- Use the latest supported OpenAI model appropriate for completed-recording
  dictation. Current official guidance selects `gpt-transcribe`; recheck the
  model guidance at implementation and record the actual model used. No model
  chooser or live-transcription behavior is added by this requirement.

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
6. **Project management:** The dashboard has configured projects → the developer
   opens System settings and adds a project using its GitHub URL and local path
   → the saved project list and selector reflect the addition. Removing a named
   project requires the existing confirmation and updates that same list.
7. **Empty configuration:** No projects are configured, initially or after the
   last removal → the developer opens System settings → Projects still offers
   Add project, and adding one makes the dashboard usable again.
8. **Configure OpenAI access:** No key is configured → the developer opens
   System settings → OpenAI, enters a key and saves → settings reports it
   configured, restart retains that configuration, and explicit dictation uses
   the saved key. Settings never displays the saved secret back to the browser.
9. **Replace or remove access:** A key is configured → the developer explicitly
   saves a replacement or removes it → subsequent dictation uses the replacement
   or explains that an API key must be configured. Typed instructions remain
   usable. A failed save/removal preserves the previous saved configuration.
10. **Temporary test credential:** An environment key is available but no key
    is saved in System settings → ordinary dictation is requested → it explains
    the missing configuration rather than consuming the environment key.

#### UI design

Recommended design for the newly requested settings outcome:

- A named **System settings** control in the dashboard's global banner opens a
  dedicated settings view. It is also reachable with no configured projects.
  **Back to dashboard** returns to the preceding view and restores useful focus.
- Use a **System settings** heading and a **Projects** section. Each configured
  project shows its name, GitHub repository, and local checkout path, with a
  clearly associated **Remove project** action. **Add project** belongs beside
  that section's heading; it opens the existing URL/path form. On narrow screens,
  project facts and actions wrap in the same semantic reading order.
- Keep the existing project selector in the dashboard banner, moving its
  adjacent add/remove actions into settings. In the dashboard's empty state,
  direct the developer to System settings → Projects to add the first project.
- Reuse the existing button, form, confirmation, spacing, typography, feedback,
  and focus conventions. Settings uses ordinary headings and labeled controls;
  errors remain near the operation that failed. Removing the selected or last
  project leaves a valid remaining selection or the usable empty state.
- Settings describes machine-local dashboard configuration. It does not present
  published story state as an editable setting or add unrelated preferences.
  This follows the domain/cohesion guidance in
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and the [dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
- A sibling **OpenAI** section contains an **API key** password input and an
  explicit **Save API key** action, plus **Configured** / **Not configured**
  status. When configured, an empty input can accept a replacement; the saved
  value is never fetched back or prefilled. **Remove API key** explicitly clears
  access. An empty Save explains the missing input and preserves any existing
  key. Feedback distinguishes a local save from successful transcription.
- Keep the key input transient: clear it after successful save or leaving
  settings, retain the entered draft for an explicit retry after a failed save,
  and return focus predictably. No automatic paid key check runs on Save or
  opening settings. Dictation's missing-key explanation links to OpenAI settings
  while preserving the instruction draft for the return journey.

Illustrative hierarchy (project and status text are placeholders):

```text
System settings                          Back to dashboard

Projects                                       Add project
<project name>
GitHub repository: <owner/repository>
Local path: <checkout path>                  Remove project

OpenAI
API key: Not configured
API key [password input]                      Save API key
                    [Remove API key when configured]
```

Existing-solution evidence: `AddProject.tsx` / `AddProjectDialog.tsx`,
`RemoveProject.tsx`, and `projectList.tsx` already own the add/remove interaction
and shared list; `dashboard/server/projectConfiguration.ts` owns machine-local
storage separately for development and production. Relocate those responsibilities
cohesively rather than introducing a second project list or persistence path.
The existing roster navigation demonstrates a secondary view with return/focus
behavior; it is a navigation precedent, not a project-specific settings owner.

The API-key settings decision is resolved by Terry's follow-up: user-configured
general OpenAI access, with the existing environment key restricted to brief
story experiments/tests. Proposed implementation detail: one private server-owned
machine credential store shared by development and production; project lists
retain their established environment separation. No additional API consumer,
credential framework, model/provider chooser, or automatic migration is promised.

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
approach on 2026-10-03. His later refinement replaces environment-key runtime
configuration with a general OpenAI API key entered in System settings. The
local server owns the saved credential and transcription request; the existing
environment key is limited to brief story experiments/tests. Explicit dictation
in this field is the chosen outcome rather
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
- The 2026-10-03 follow-up model check read the official
  [GPT-Transcribe model](https://developers.openai.com/api/docs/models/gpt-transcribe)
  and [deprecations](https://developers.openai.com/api/docs/deprecations) pages.
  Current file-transcription guidance recommends `gpt-transcribe`; deprecated
  Whisper/GPT-4o transcription models are not the selected direction. This
  establishes the current suitable model direction, not account entitlement.
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
  field and correct it. Later outside-in proof owns the complete settings →
  dictation → reviewed first instruction journey, keeping the real local
  configuration, recording, transcription boundary and launch path while
  simulating the provider/native host. Synthetic recording and documentation
  alone do not settle speech quality or service access.
- The intended browser can capture the actual microphone: observe permission,
  Record, and Stop on that browser and device. The synthetic check settles only
  recording format support for the observed Chrome version.

#### Architecture

Design for the selected API direction:

- The browser owns recording and the editable draft; the local server owns the
  transcription request and saved OpenAI credential. The settings form sends a
  newly entered key only to the local server; saved-key reads expose status only.
  Keep saved credentials on the server under
  [OpenAI authentication guidance](https://developers.openai.com/api/reference/overview#authentication).
  Do not assume ChatGPT/Codex login grants API transcription access.
- Reuse the dashboard's loopback and same-origin service boundary. Transcription
  precedes session launch and does not allocate a story assignment, workspace,
  or agent thread. The chosen agent host receives ordinary reviewed text, so
  transcription service selection need not follow the host/model selection.
- OpenAI access is a machine-level setting with one saved credential owner and
  dictation as its first consumer. Persist the key in a private local credential
  file with owner-only directory/file permissions, outside project configuration,
  repositories, browser storage, launch records, and logs. Failed writes preserve
  the predecessor. Read the configured key for each new transcription; replacing
  or removing it affects subsequent requests. No environment fallback ships.
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

- The API direction remains accepted; the environment credential is now limited
  to brief story experiments/tests. The delivered feature uses the general key
  configured in System settings. Recording,
  append, review, cancellation, recovery, and over-length examples define the
  voice outcome. Terry additionally requires System settings with relocated
  project management and general OpenAI API-key configuration. The UI design
  above is the recommended interaction. No unresolved goal or scope question
  blocks updating the existing slice plan.
- Credential access, actual microphone capture, and transcription quality remain
  factual premises. The executable plan owns an early probe; failure stops the
  dependent implementation and returns the evidence for a revised approach.
- The first proof uses Chromium and an English instruction containing project
  names. No accuracy guarantee or universal browser/language claim is inferred.
- [Slice plan](../slice-plans/223-session-instruction-voice-input/PLAN.md).
  The current follow-up authorizes refinement/design and updating this plan;
  it does not authorize implementation or publication.

## Breadcrumbs

- Terry's 2026-10-03 request: capture this as the first queued story, investigate
  Codex or ChatGPT support, and use the OpenAI API as a fallback possibility.
- Terry's 2026-10-03 follow-up: accept the recommended API approach, use the
  existing environment credential, complete refinement, and write a slice plan.
- Terry's further 2026-10-03 refinement addition: design a consistent, cohesive
  System settings UI mapped directly to domain concepts and move the current
  project add/remove behavior there. Configure a general OpenAI API key in
  settings, use it first for dictation, restrict the environment key to brief
  story experiments/tests, select the latest suitable dictation model, and update
  the existing slice plan after refinement.
- [Product backlog](../PRODUCT-BACKLOG.md).
