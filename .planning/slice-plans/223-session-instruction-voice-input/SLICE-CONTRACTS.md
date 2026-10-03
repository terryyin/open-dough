# Detailed slice contracts

[PLAN.md](PLAN.md) owns slice order, type and status. Preserve these contracts
when executing or refining the corresponding numbered slice.

## Slice contracts

### 1. A representative spoken instruction becomes a usable transcript
Proof: bounded operator-assisted capture and one real API transcription using a briefly held test credential, followed by review/edit in the existing startup field; no native agent launch.

Behavior: The selected Node/browser prerequisites pass and the developer allows
microphone capture → record one short English instruction containing “Open Dough”
and a skill name, explicitly Stop, submit the complete clip to the documented
file-transcription operation using the latest suitable documented model and a briefly held test credential → obtain readable text that
the developer can correct and use as an instruction draft. Consume the returned
text in the existing launch field, rather than stopping at an HTTP success code.
Record actual MIME/container, bytes, model, elapsed request time, microphone
release, and whether the draft is useful. Do not print keys or retain audio.

Use a disposable local probe in this workspace, not changes to the production
dashboard or a saved session. Invoke the manual-testing workflow for this bounded
microphone observation when execution reaches it under the authority recorded
in [PLAN.md](PLAN.md). Terry allows the environment `OPENAI_API_KEY` only for this brief story
experiment/test. Read it only for this disposable operation, never print/copy it
into a saved credential store, and leave no runtime environment fallback. If it
is no longer present, use an explicitly supplied test credential or report the
probe unavailable; do not retrieve it from shell history or native-host tokens.
Cap it at one short clip/request; no automatic provider switching or retry.

If credential inheritance, authentication, model access, microphone capture,
format decoding, or useful transcription fails, preserve text-only startup,
record the failing operation and result, and stop dependent dictation slices 4–6; independently supported settings work
can still proceed. Revise the disproved API approach before dependent work. Correct ordinary
configuration through the existing setup; revise a disproved integration
assumption before dependent implementation. Success establishes this bounded
compatibility premise, not a universal accuracy or latency guarantee.

Safe stopping point: concrete compatibility evidence, with no partial feature or
persisted audio. No Structure is built in advance of this probe.

### 2. Manage configured projects in System settings
Proof: real-page journeys in `project-add.spec.ts`, `project-remove.spec.ts` and a focused `system-settings.spec.ts`, through real configuration services and isolated stores; the existing fake GitHub/native host remain only at those external seams.

Behavior: The dashboard has projects, or none → open the named System settings
entry → Projects shows configured names, repositories and local paths, with Add
project and a Remove project action for each row. Add uses the existing URL/path
form and validation; Remove uses its existing confirmation. Saves update the
one ordered list and project selector and persist through restart. The banner
keeps selection/observation controls and replaces its project-management buttons
with the global settings entry. The empty dashboard directs into the same view.

Make this a complete useful project-management path, not a settings shell.
Reuse the existing settings owner/endpoints and accessible forms; adapt action
entry and focus/selection to row-specific removal. Keep settings accessible after
the last removal. Cancel/Escape preserve saved data; failed saves retain recovery
feedback. Back to dashboard and browser navigation restore the preceding valid
project/view and useful focus; a removed project cannot be restored as selected.
Opening settings must not destroy a running session or terminal context. Keep
ordinary project keyboard navigation from changing selection while editing a
settings field or confirmation.

Inspect every production and test-support caller before relocating Add/Remove.
`support/projectAddPage.ts` is a shared page journey helper; update its navigation
once and review its callers rather than bypassing settings in each suite. Preserve
validation/default-branch/local-folder semantics and raw HTTP boundary proof.
Observe actual persisted files, selector/observation and retained checkout/session
records in representative add/remove/re-add cases, including unselected and last
project removal. Observe dev/production project-list isolation; settings does not
merge those stores. Project path display comes from a narrow configuration read,
not from inventing a public source field or exposing arbitrary server files.

Use the story's headings, labels and hierarchy and the dashboard's existing CSS
and focus patterns. During this slice review the real view at narrow width and
200% zoom with long repositories/paths, keyboard access and return focus; save
review evidence in this plan. No component library or broad settings framework.
Document the new entry in `dashboard/README.md` and reconcile the relevant
project-management/empty-state guidance in `docs/dashboard-ux-ui-north-star.md`
and `docs/dashboard-navigation.md` with the authorized relocation.

Safe stopping point: project management is usable from one cohesive global view,
including the empty state; ordinary dashboard reading and launching still work.

### 3. Configure general OpenAI access in System settings
Proof: `system-settings.spec.ts` real-page save/replace/remove/restart journeys and narrow HTTP/file-boundary observations, using synthetic keys and isolated HOME; no OpenAI call is made merely to save a key.

Behavior: Open System settings → OpenAI → enter an API key in its password field
and explicitly Save API key → configured status appears, the transient input
clears, and the server retains one general OpenAI credential across restart.
Reopening settings shows status only, never the saved key. Save a replacement or
explicitly Remove API key → subsequent server reads observe that result. Empty
Save is explained without erasing a predecessor. Save/removal failure leaves the
old saved configuration intact and supports explicit retry.

Build the full UI → loopback/same-origin local operation → private file owner
path. Key input is transient browser state, never localStorage, a URL, a project
field or a launch record. Read responses expose only configuration status; request
and error handling never logs or echoes secrets. Save uses atomic replacement
with private permissions on the secret directory, temporary file and final file;
reading an unreadable/malformed saved credential reports a useful configuration
problem, never silently reseeds or imports an environment key. A removal changes
only OpenAI access, not projects, sessions or typed instructions. Key state is
independent of project selection, so users can configure it with no projects.

Observe filesystem permissions/predecessor bytes, status after service restart,
and a second dev/preview server reading the same isolated machine credential
store. Preserve separate project files. Test admission refusal for cross-origin,
unsupported methods and malformed/oversized key-setting requests using existing
bounded JSON-body/local-origin mechanics. Never forward the entered key to a
provider for validation on Save or status reads. Persisting a key proves local
configuration only; the later explicit dictation proves provider use. Use one
OpenAI credential owner/service boundary, not a consumer/provider registry.

Update local setup documentation to describe System settings → OpenAI, machine
storage, configured-versus-verified meaning, replacement/removal and the absence
of environment fallback. Brief environment-key use remains confined to the
execution probe; it is never automatically imported by this path.

Safe stopping point: general OpenAI access can be managed privately and reliably;
its first API consumer is delivered in the next slice, without storing secrets in
project facts or changing typed startup.

### 4. Dictate, review, and start with the edited instructions
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
admission, saved OpenAI credential/upstream operation, validated text response, and the
shared dialog integration. Mount the service through the existing local boundary
helper; retain its loopback/same-origin requirements. The client supplies audio,
not an upstream URL, credential, or native command. Node handles multipart upload
to the fixed API endpoint; do not broaden `jsonRequestBody`'s contract.

The dialog owns pending capture and transcription. A deliberate missing-key
settings round trip preserves the same launch draft and returns to it; it is
distinct from Cancel or dismissing that launch. Dismissal, Escape, unmount,
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
nonempty bytes, and a synthetic credential entered and saved through System settings at that fake. Block any
other provider egress. No selectable provider URL or production test mode is
needed. At least one full page journey enters/saves the synthetic key through
System settings, restarts the local server, then dictates; a seeded store alone
does not prove that setup-to-consumer journey. Hold the launch draft while
following missing-key guidance into settings and returning: the same draft
remains editable and dictation can retry with the newly saved key. Browser routing must not supply the local endpoint's transcript result.

Prove local admission refusal before upstream contact for cross-origin requests,
unsupported method/media type, empty and oversized bodies. Bound upload bytes
below the documented 25 MB ceiling; exceeding it ends capture/upload with a
recoverable explanation, not a silently transcribed prefix. Bound upstream waiting
and validate nonempty returned text. Raw provider errors and keys never enter
page responses or logs. Do not persist audio. Document System settings key configuration, the absence of an environment
fallback, and the transient recording flow in `dashboard/COMMANDS.md` and `AGENT-LAUNCH.md`.

Safe stopping point: the ordinary dictation journey works with basic failure
reporting and complete dismissal cleanup; typed startup remains usable. No
CI-breaking partially wired feature is delivered.

### 5. Unavailable dictation leaves the typed instruction usable
Proof: focused error cases in `session-instruction-voice.spec.ts` and local-boundary/provider integration cases; each observes original field text, recovery, no automatic retry, and no agent start before explicit Start.

Behavior: The field contains “Keep this work local” → recording cannot begin or
transcription cannot complete → explain the actual actionable category, preserve
the exact existing text, release recording/pending resources, and let the developer
type or explicitly retry. Start with typed text remains available after failure.

Use representative boundary cases: denied microphone/unsupported recording;
missing or unreadable configured key (including a removed key with an environment key present); provider authentication refusal or rate limit; network failure
or bounded timeout; empty/malformed provider result. Assert no upstream request
for missing-key/admission failures and no repeated paid call for provider failure.
One successful explicit retry appends once without stale text from the failed
operation. Use controlled fake-provider replies and shortened injected test waits,
never live credentials in automated checks. Keep readable UI messages separate
from provider diagnostics; do not expose response bodies or credentials.

The common rule is failure of the current draft operation, not a new lifecycle
per provider status. Reuse the ownership/cleanup from slice 4; no new retry manager
or persistent error record. Document only the recovery the developer needs.

Safe stopping point: a failed dictation operation does not prevent typed startup
or require reopening the dialog.

### 6. Shorten an over-length transcript without losing either draft
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
