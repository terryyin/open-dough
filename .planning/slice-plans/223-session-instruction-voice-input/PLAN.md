# Dictate startup instructions and review the text before launching

**Identity:** SEED-084#session-instruction-voice-input
**Source:** [refined story](../../seeds/SEED-084-session-instruction-voice-input.md#session-instruction-voice-input).
**Prepared:** 2026-10-03. Terry accepted the recommended API direction and use of
the environment credential, and authorized refinement followed by slice planning.
This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A developer records an instruction in the dashboard's startup dialog, explicitly
stops, reviews or edits its transcription in the existing field, then explicitly
starts the session with that text. Recording never starts an agent session.

Required behavior includes preserving and appending to existing text once,
blocking field edits and Start while dictation is pending, keeping Cancel
available, recovering by typing or explicitly retrying after failure, ending
capture on dismissal, ignoring results belonging to a closed dialog, and
preserving an over-length transcript for shortening before insertion.

Use the server's `OPENAI_API_KEY` and the OpenAI completed-file transcription
API. The key is present in this preparation environment; that does not establish
service access or inheritance by a separately started dashboard. There is no key
entry in the page. Missing configuration is a recoverable dictation problem.
The first representative proof uses the existing Chromium coverage and an
English instruction containing project terms; neither becomes a product ban on
other browsers or languages.

Deferred: live voice conversation, partial transcripts, speech-end detection,
translation, offline processing, audio history/playback, file import, and provider
selection. Do not add their infrastructure. The existing 4,000-character field
limit remains authoritative; examples do not introduce another instruction limit.

## Direction and PFE

- Reuse `dashboard/src/LaunchDialog.tsx`, shared by `StartLaunch.tsx` and
  `StartSession.tsx`, as the owner of the startup field. One dictation lifecycle
  belongs to one mounted dialog. Add recording and transcription to that field,
  not to each workflow or host separately. `launchRequest.ts` already owns the
  instruction limit and `requestedChoices` trimming. The native adapters already
  consume text; no audio-specific native prompt path is needed.
- Reuse `dashboard/server/localBoundaryPlugin.ts` for dev/preview mounting and
  shutdown, and `localOrigin.ts` for loopback/same-origin admission. Existing
  `jsonRequestBody.ts` owns JSON launch requests with a 32 KiB body limit; it is
  not an audio upload reader. Keep that bound unchanged and add one bounded
  audio-specific request reader where it is consumed.
- Search across `dashboard`, `src`, and `scripts` found no existing
  MediaRecorder, SpeechRecognition, multipart audio upload, transcription API,
  or `OPENAI_API_KEY` implementation. This is the warranted gap. Use one narrow
  transcription operation, not a provider framework. Browser records; server
  owns credentials and the fixed upstream request; existing launch owns starting.
- Start with `/v1/audio/transcriptions` and `gpt-transcribe`, as documented in
  [OpenAI file transcription](https://developers.openai.com/api/docs/guides/speech-to-text).
  Use Node's existing fetch/FormData facilities unless the early probe shows a
  concrete missing capability. Validate the returned text at the server boundary.
  Keep the key in the server environment under
  [OpenAI authentication guidance](https://developers.openai.com/api/reference/overview#authentication).
  Do not read or repurpose native-host login credentials.
- Follow [North Star: Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment):
  the launch workflow owns assignments, workspaces, and publication. Dictation
  creates none of these. Follow the
  [dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) for
  accessible words, focus, feedback, and usable controls. No new North Star topic
  or ADR is warranted for this feature-local design.
- Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports one cohesive representation and the smallest sufficient solution;
  [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps feature design
  here. ADR 0008 remains Proposed. No Accepted-ADR conflict was found.

## Decisive premises

Inspection baseline: `ad61b86daef4c4991f526c72be36b0e7fe793427` in the established
workspace. Preparation `start` returned `continued` for joey-chan, fetching
`bb44ff495db2edc9fcdd88f2ad6d6413b08fff87`; no second assignment was published.
A `git diff --name-only HEAD..origin/main --` check of the shared dialog, its two
callers, launch request, local origin/mounting, and dashboard test harness found
no intervening changes in those inspected files. Recheck actual execution state
when resuming; this is not a promise that unrelated trunk work has stopped.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| The field's current text reaches the agent only on Start; Cancel/Escape close without sending it | Slice 2 | Inspected setup/assertions in `agent-launch-card.spec.ts:88,125` and `agent-launch-ad-hoc.spec.ts:99,128`; the five selected real-page/real-local-service tests passed, observing the synthetic Claude's argv and empty calls on dismissal. Literal commands below. |
| Story and unattached starts use one field; reviewed text can retain existing native handoffs | Slices 2–4 | `rg -n '<LaunchDialog' dashboard/src` identifies `StartLaunch.tsx` and `StartSession.tsx`. Read `LaunchDialog.tsx` submission and `launchRequest.ts` limit/trimming; native text consumers are `hosts/codex/input.ts`, `hosts/claude/launch.ts`, and `hosts/cursor/prompt.ts`. The baseline above exercises the text's final consumer for both dialog purposes, with Claude synthetic only at the native boundary. |
| Dev and preview can mount the same local service without using launch admission | Slice 2 | Read `localBoundaryPlugin.ts`, `vite.config.mts`, and all `verifyLocalOrigin` callers (`rg -n 'verifyLocalOrigin\(' dashboard`). Existing read/project services already reuse these mechanics independently of launch. New audio admission will be proved over HTTP in both modes, not inferred from file presence. |
| The existing launch JSON reader cannot carry normal audio clips | Slice 2 | Read `jsonRequestBody.ts`: JSON-only and 32 KiB. `rg -n 'jsonBody\(' dashboard` found launch, session-action and project-settings consumers; preserve their contract rather than widening it for audio. |
| A browser format intersects the API's accepted formats | Slice 1 | Prior local Chrome 155 observation consumed an AudioContext synthetic stream with MediaRecorder: a nonempty 2,228-byte WebM/Opus blob on a secure loopback page. Fetched official API documentation accepts WebM. Actual microphone capture and provider decoding remain probe-owned; synthetic data is not speech evidence. |
| The environment offers a credential | Slice 1 | Ran `python3 -c 'import os; print(bool(os.environ.get("OPENAI_API_KEY", "").strip()))'` as a presence-only check: nonempty. No value printed/copied. Authentication, model access, billing, and the dashboard process's environment remain probe-owned. |
| Real recorded instructions can become useful draft text at tolerable delay | Slice 1 | Only a credentialed service request and an actual microphone observation settle this. Bound them in the early probe below; a failed probe stops dependent slices. No paid request or real microphone capture occurred during preparation. |

Baseline commands (exit 0, three card tests and two unattached-session tests;
quiet reporter, selection additionally checked with `--list --reporter=list`):

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN npm run test:dashboard -- dashboard/tests/agent-launch-card.spec.ts --grep 'Escape or Cancel sends nothing|starting sends the instruction after the execution command' --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN npm run test:dashboard -- dashboard/tests/agent-launch-ad-hoc.spec.ts --grep 'starting with text sends it|Escape or Cancel send nothing' --workers=1
```

Initial dependency setup omitted dev dependencies because this shell inherits
`NODE_ENV=production`, so the first run could not spawn Vite. Restored this
workspace's dev dependencies with `npm ci --include=dev --ignore-scripts` and
reran successfully; no product file changed. The required native-setup check
initially found Node 24.5.0 rather than `.node-version`'s 24.21.0. Downloaded the
unmodified official Node 24.21.0 darwin-arm64 archive into a temporary directory
and verified its SHA-256 against that release's `SHASUMS256.txt`. With that runtime,
`node scripts/setup-native.mjs check` passed and identified Chromium
153.0.8010.12. The selected five baseline tests were rerun under the matching
runtime. Literal commands:

```sh
PATH=/tmp/dough-seed084-node.Dwy1bE/node-v24.21.0-darwin-arm64/bin:$PATH node scripts/setup-native.mjs check
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/dough-seed084-node.Dwy1bE/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-card.spec.ts dashboard/tests/agent-launch-ad-hoc.spec.ts --grep 'Escape or Cancel sends? nothing|starting sends the instruction after the execution command|starting with text sends it' --workers=1
```

The system Node installation was not changed. For execution, select the repository
runtime and recheck setup; this temporary path is observation provenance, not a
permanent project runtime location.

## Ordered slices

### 1. A representative spoken instruction becomes a usable transcript
Type: Behavior
Status: planned
Proof: bounded operator-assisted capture and one real API transcription using the server environment credential, followed by review/edit in the existing startup field; no native agent launch.

Behavior: The selected Node/browser prerequisites pass and the developer allows
microphone capture → record one short English instruction containing “Open Dough”
and a skill name, explicitly Stop, submit the complete clip to the documented
file-transcription operation using `OPENAI_API_KEY` → obtain readable text that
the developer can correct and use as an instruction draft. Consume the returned
text in the existing launch field, rather than stopping at an HTTP success code.
Record actual MIME/container, bytes, model, elapsed request time, microphone
release, and whether the draft is useful. Do not print keys or retain audio.

Use a disposable local probe in this workspace, not changes to the production
dashboard or a saved session. Invoke the manual-testing workflow for this bounded
microphone observation when execution reaches it. The currently authorized work
is planning, so the probe is not executed now. It uses the ordinary API credential
and metered service under Terry's accepted direction, never native-host tokens.
Cap it at one short clip/request; no automatic provider switching or retry.

If credential inheritance, authentication, model access, microphone capture,
format decoding, or useful transcription fails, preserve text-only startup,
record the failing operation and result, and stop slices 2–4. Correct ordinary
configuration through the existing setup; revise a disproved integration
assumption before dependent implementation. Success establishes this bounded
compatibility premise, not a universal accuracy or latency guarantee.

Safe stopping point: concrete compatibility evidence, with no partial feature or
persisted audio. No Structure is built in advance of this probe.

### 2. Dictate, review, and start with the edited instructions
Type: Behavior
Status: planned
Proof: new `dashboard/tests/session-instruction-voice.spec.ts` page journeys through actual capture/recording, the real local transcription boundary and fixed-provider request serialization, with only the provider reply and native host simulated. HTTP admission is additionally observed in dev and preview.

Behavior: A startup dialog is open, with or without typed text → choose Record,
allow microphone access, speak, and Stop → visible permission/recording/waiting
feedback leads to a completed transcript appended once to the original field.
Start and destination editing are blocked during the pending operation; Cancel
and keyboard dismissal stay usable. Edit the result and press Start → the
existing launch receives exactly the final reviewed field text. A second clip
appends through the same rule. Dictation before Start makes no host, workflow
start, assignment, or workspace call. Cover both a story launch and Start session
as equivalent consumers of the shared field, without per-host dictation code.

Build one complete path here: browser recorder and request, bounded local audio
admission, server credential/upstream operation, validated text response, and the
shared dialog integration. Mount the service through the existing local boundary
helper; retain its loopback/same-origin requirements. The client supplies audio,
not an upstream URL, credential, or native command. Node handles multipart upload
to the fixed API endpoint; do not broaden `jsonRequestBody`'s contract.

The dialog owns pending capture and transcription. Dismissal, Escape, unmount,
and a late permission grant stop any resulting media tracks and invalidate that
operation. Abort pending upload/provider work on caller disconnect or server
shutdown, and ignore late results even if an upstream abort arrives too late.
Do not claim cancellation reverses a charge already incurred. Reopening starts
empty under the existing dialog rule, and an older response cannot change it.
Include a held-result cancellation/reopen assertion and stopped-track observation
in this slice so its intermediate stopping point is already safe.

For deterministic browser proof, feed an isolated Chromium fake microphone and
use the real MediaRecorder; do not stub the recorder into returning final text.
Keep the UI, local HTTP boundary, multipart construction, and response validation
real. Extend the test harness with a test-only outbound-fetch preload forwarding
the exact fixed API transcription request to a loopback fake provider (through
existing `extraEnv`/`NODE_OPTIONS` process wiring). Assert model, multipart file,
nonempty bytes, and a synthetic server-only credential at that fake. Block any
other provider egress. No selectable provider URL or production test mode is
needed. Browser routing must not supply the local endpoint's transcript result.

Prove local admission refusal before upstream contact for cross-origin requests,
unsupported method/media type, empty and oversized bodies. Bound upload bytes
below the documented 25 MB ceiling; exceeding it ends capture/upload with a
recoverable explanation, not a silently transcribed prefix. Bound upstream waiting
and validate nonempty returned text. Raw provider errors and keys never enter
page responses or logs. Do not persist audio. Document the environment-key setup
and transient recording flow in `dashboard/COMMANDS.md` and `AGENT-LAUNCH.md`.

Safe stopping point: the ordinary dictation journey works with basic failure
reporting and complete dismissal cleanup; typed startup remains usable. No
CI-breaking partially wired feature is delivered.

### 3. Unavailable dictation leaves the typed instruction usable
Type: Behavior
Status: planned
Proof: focused error cases in `session-instruction-voice.spec.ts` and local-boundary/provider integration cases; each observes original field text, recovery, no automatic retry, and no agent start before explicit Start.

Behavior: The field contains “Keep this work local” → recording cannot begin or
transcription cannot complete → explain the actual actionable category, preserve
the exact existing text, release recording/pending resources, and let the developer
type or explicitly retry. Start with typed text remains available after failure.

Use representative boundary cases: denied microphone/unsupported recording;
missing server key; provider authentication refusal or rate limit; network failure
or bounded timeout; empty/malformed provider result. Assert no upstream request
for missing-key/admission failures and no repeated paid call for provider failure.
One successful explicit retry appends once without stale text from the failed
operation. Use controlled fake-provider replies and shortened injected test waits,
never live credentials in automated checks. Keep readable UI messages separate
from provider diagnostics; do not expose response bodies or credentials.

The common rule is failure of the current draft operation, not a new lifecycle
per provider status. Reuse the ownership/cleanup from slice 2; no new retry manager
or persistent error record. Document only the recovery the developer needs.

Safe stopping point: a failed dictation operation does not prevent typed startup
or require reopening the dialog.

### 4. Shorten an over-length transcript without losing either draft
Type: Behavior
Status: planned
Proof: a page boundary example at exactly 4,000 combined characters and one over the limit, through the real transcription boundary with controlled provider text; after shortening, observe the native launch's final text.

Behavior: Existing field text plus the completed transcript exceeds the existing
4,000-character limit → retain the original field and show the complete transcript
for review/shortening → the developer shortens it, adds it once within the limit,
and can edit/start with the combined text. Neither draft is silently truncated.
Exactly-fitting text follows the ordinary append path. Account for the separator
in the combined length; discard/cancel the pending addition preserves the field.

Use the same append/length rule for normal and shortened results. The overflow
review is transient state in this dialog, not audio history, another launch field
contract, or a second persisted instruction. Recoverable upstream-response size
bounds must not masquerade as successful truncated transcription. Do not create
a native-host exception to the shared limit. Preserve keyboard access and named
controls for review, add, and discard.

Safe stopping point: every refined key example has outside-in proof and the
developer can retain, shorten, or discard dictated text before launching.

## Proof ownership and local gates

| Final promise | Owning slice and observation |
| --- | --- |
| Real microphone/format/credential compatibility for the representative instruction | 1: actual capture and real API transcript consumed as an editable draft. |
| Dictate → review/edit → explicit Start delivers the reviewed text | 2: page → real local service → fake provider → real launch → synthetic native argv. |
| Preserve typed text, append once, repeat clips, no automatic agent launch | 2: original-plus-transcript assertions and no native/start calls until explicit Start. |
| Recording/waiting feedback, disabled edits/Start, usable Cancel | 2: named/status/focus/control assertions in each pending phase. |
| Dismissal/late permission/late result/shutdown release resources and never change a new dialog | 2: held permission/result, track-stop and request-abort signals; observe reopened field and no host calls. |
| Typing and explicit retry survive unavailable or failed dictation, without duplicate paid requests | 3: preserved draft and successful recovery; fake-provider request counts. |
| Preserve full over-length text and existing draft; exactly 4,000 characters accepted | 4: both boundaries, shortening/discard, final native argv. |
| Server-only credentials, same-origin/loopback audio admission, fixed/bounded upstream request, transient audio | 2: raw HTTP refusal/provider-contact assertions and inspected lifetime; 3: safe failure responses. No audio store is added. |
| Both existing dialog purposes and normal text startup remain intact | 2–4: new representative story/unattached journeys plus the five existing baseline cases. Native-host audio behavior is never changed. |

Before browser checks, use the selected `.node-version` runtime and run
`node scripts/setup-native.mjs check`, as required by
[dashboard commands](../../../dashboard/COMMANDS.md). Install dev dependencies
when `NODE_ENV=production` would omit them. Run focused new voice specs and the
five baseline cases at affected slice boundaries, with live API credentials unset;
test fixtures supply only synthetic keys. The browser harness builds production
assets itself and isolates origins/native hosts. Check the new HTTP service in
dev and built preview so one mounting mode does not stand in for the other.

Run `npm run typecheck:dashboard` for changed TypeScript/browser-test contracts;
Vite/Playwright do not typecheck, as documented in
[dashboard technology guidance](../../../docs/dashboard-tech-stack.md).
No whole-repository or native-agent acceptance suite is a routine local gate for
this unchanged native text contract. Expand focused proof if implementation changes
other consumers. Execution still applies its independent post-change refactoring,
review, commit-hook lint, delivery and CI ownership; do not run hook-owned lint
as an extra planner gate. No numeric slice target/hard limit was supplied here:
size includes implementation, focused proof and cleanup under the shared bounded
slice rules, without inventing a timing policy.

## Current decisions

- API file transcription and `OPENAI_API_KEY` are accepted; model starts with the
  current documented `gpt-transcribe` recommendation. Probe failure changes the
  dependent approach before product implementation, not the story's goal.
- Recorded audio is transient. The existing launch record may retain reviewed
  submitted text as it already does. Credentials, audio and provider responses
  are not additional machine/project records.
- Pending recording/transcription prevents submission; failures restore typed
  startup. Closing invalidates the operation. One append rule preserves draft
  text and the existing length contract across all startup workflows/hosts.
- Provider request size, response size, and waiting are bounded; choose concrete
  operational bounds using the probe and existing failure mechanics. The provider
  ceiling is not an arbitrary new product duration restriction.
- Automated proof replaces external provider/native behavior, not the dashboard's
  recording, upload, field integration, or launch handoff. The real-service probe
  owns the premise that those external seams cannot establish.

## Review and sizing

Four slices own one learning loop followed by three cohesive behavior loops.
Slice 2 carries the complete successful path and its necessary safe lifecycle;
no layer-only preparation slice is hidden before it. Slices 3 and 4 add separately
evaluable recovery and length behavior through that same model, not separate
recognizers or provider frameworks. Review found no remaining boundary, cumulative
design, or proof-ownership concern requiring a plan-refinement pass. Live service
and microphone premises are bounded by slice 1, which stops dependent work if
false. No execution or completion is claimed.

## Learnings

None from execution yet.
