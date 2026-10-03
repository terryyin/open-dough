# Dictate startup instructions and review the text before launching

**Identity:** SEED-084#session-instruction-voice-input
**Source:** [refined story](../../seeds/SEED-084-session-instruction-voice-input.md#session-instruction-voice-input).
**Prepared:** 2026-10-03. Terry accepted the file-transcription API direction,
then added System settings and general OpenAI API-key configuration, restricted
the environment key to brief story experiments/tests, and requested the latest
suitable dictation model. He authorized refinement and updating this existing
plan. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A developer records an instruction in the dashboard's startup dialog, explicitly
stops, reviews or edits its transcription in the existing field, then explicitly
starts the session with that text. Recording never starts an agent session.

Required behavior includes preserving and appending to existing text once,
blocking field edits and Start while dictation is pending, keeping Cancel
available, recovering by typing or explicitly retrying after failure, ending
capture on dismissal, ignoring results belonging to a closed dialog, and
preserving an over-length transcript for shortening before insertion.

The developer manages projects and general OpenAI access in one cohesive
**System settings** view. Move project add/remove there; preserve the selector,
URL/path validation, ordered configuration, removal confirmation and retention
of checkouts/session records/running sessions. Keep development/production
project lists separate. Settings stays reachable with no projects configured.

The OpenAI section saves, replaces and removes one machine-level API key, shared
by development and production and first consumed by dictation. Store it privately
on the local server; saved-key reads return configured status, never the secret.
A saved key survives restart; failure preserves its predecessor. Explicit Save
makes no paid validation request. No key means useful setup feedback while typed
startup stays available. A key configured here is general OpenAI access, not a
project, native-host, or dictation-only credential.

Terry's environment `OPENAI_API_KEY` is authorized only for brief experiments or
tests within this story. Do not copy it into settings or ship an environment
fallback. Ordinary dictation reads the settings credential. Automated checks use
synthetic keys and isolated machine storage, with real environment keys unset.

Use the latest supported completed-recording transcription model. The official
[file guide](https://developers.openai.com/api/docs/guides/speech-to-text) and
[model page](https://developers.openai.com/api/docs/models/gpt-transcribe), checked
on 2026-10-03, recommend `gpt-transcribe`; the official
[deprecations page](https://developers.openai.com/api/docs/deprecations) marks the
Whisper/GPT-4o transcription family for replacement. Recheck official guidance
when execution starts, select the latest suitable supported model and record its
actual ID in probe/proof. No automatic model discovery, user model chooser or
silent provider/model fallback is required.

The first representative voice proof uses existing Chromium coverage and an
English instruction containing project terms; neither becomes a product ban on
other browsers or languages. Follow the story's System settings UI design with
Projects and OpenAI sections, accessible controls, narrow-screen reflow and
predictable return/focus behavior.

Deferred: live voice conversation, partial transcripts, speech-end detection,
translation, offline processing, audio history/playback, file import, and provider
selection. Do not add their infrastructure. The existing 4,000-character field
limit remains authoritative; examples do not introduce another instruction limit.

## Direction and PFE

- Reuse `AddProject.tsx` / `AddProjectDialog.tsx`, `RemoveProject.tsx`,
  `projectList.tsx`, and `server/projectConfiguration.ts`: they already own the
  configuration interaction, one list and its environment-specific storage.
  `App.tsx` exposes Add in the empty state; `DashboardBanner.tsx` exposes Add and
  Remove beside the selector. Move those entry points into Projects settings.
  Reconcile `RemoveProject`'s selection/focus behavior with settings: removing
  an unselected row preserves selection; removing the selected row chooses the
  existing next-neighbor/default rule, or leaves the empty state. Keep one
  project configuration authority and the existing add/remove service contracts.
- Existing roster routing and return/focus handling supply a secondary-view
  precedent, but `dashboardRoute.ts` assumes `firstProject()` exists. Settings
  is machine-level and must be reachable independently of project selection:
  own its entry at the app level and preserve story/roster/session context when
  returning. Do not encode settings as a synthetic project or mount an empty
  project-consuming dashboard. Adapt navigation just enough for this view.
- Product-wide search of `dashboard`, `src`, and `scripts` found no saved OpenAI
  credential owner. Existing project-file storage supplies atomic-write and
  predecessor-preservation mechanics, not secret ownership or public key reads.
  Add one narrow OpenAI credential owner, preferably
  `~/.open-dough/dashboard/credentials/openai.json`, with owner-only directory
  and file permissions. It is shared by development and production; project
  configuration retains its existing separation. No native-login reuse, generic
  secrets framework, browser storage or repository configuration is appropriate.
  Read the saved key for each new transcription; concurrent mode instances see
  subsequent saved replacements/removal rather than keeping a stale cached key.

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
  owns the configured credential and fixed upstream request; existing launch owns starting.
- Start with `/v1/audio/transcriptions` and `gpt-transcribe`, as documented in
  [OpenAI file transcription](https://developers.openai.com/api/docs/guides/speech-to-text).
  Use Node's existing fetch/FormData facilities unless the early probe shows a
  concrete missing capability. Validate the returned text at the server boundary.
  Keep the saved key server-side under
  [OpenAI authentication guidance](https://developers.openai.com/api/reference/overview#authentication).
  Read the configured OpenAI key through its one server-side owner. Do not read
  or repurpose native-host login credentials or add an environment fallback.
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

Original voice-planning inspection baseline: `ad61b86daef4c4991f526c72be36b0e7fe793427` in the established
workspace. Preparation `start` returned `continued` for joey-chan, fetching
`bb44ff495db2edc9fcdd88f2ad6d6413b08fff87`; no second assignment was published.
A `git diff --name-only HEAD..origin/main --` check of the shared dialog, its two
callers, launch request, local origin/mounting, and dashboard test harness found
no intervening changes in those inspected files. Recheck actual execution state
when resuming; this is not a promise that unrelated trunk work has stopped.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| The field's current text reaches the agent only on Start; Cancel/Escape close without sending it | Slice 4 | Inspected setup/assertions in `agent-launch-card.spec.ts:88,125` and `agent-launch-ad-hoc.spec.ts:99,128`; the five selected real-page/real-local-service tests passed, observing the synthetic Claude's argv and empty calls on dismissal. Literal commands below. |
| Story and unattached starts use one field; reviewed text can retain existing native handoffs | Slices 4–6 | `rg -n '<LaunchDialog' dashboard/src` identifies `StartLaunch.tsx` and `StartSession.tsx`. Read `LaunchDialog.tsx` submission and `launchRequest.ts` limit/trimming; native text consumers are `hosts/codex/input.ts`, `hosts/claude/launch.ts`, and `hosts/cursor/prompt.ts`. The baseline above exercises the text's final consumer for both dialog purposes, with Claude synthetic only at the native boundary. |
| Dev and preview can mount the same local service without using launch admission | Slice 4 | Read `localBoundaryPlugin.ts`, `vite.config.mts`, and all `verifyLocalOrigin` callers (`rg -n 'verifyLocalOrigin\(' dashboard`). Existing read/project services already reuse these mechanics independently of launch. New audio admission will be proved over HTTP in both modes, not inferred from file presence. |
| The existing launch JSON reader cannot carry normal audio clips | Slice 4 | Read `jsonRequestBody.ts`: JSON-only and 32 KiB. `rg -n 'jsonBody\(' dashboard` found launch, session-action and project-settings consumers; preserve their contract rather than widening it for audio. |
| A browser format intersects the API's accepted formats | Slice 1 | Prior local Chrome 155 observation consumed an AudioContext synthetic stream with MediaRecorder: a nonempty 2,228-byte WebM/Opus blob on a secure loopback page. Fetched official API documentation accepts WebM. Actual microphone capture and provider decoding remain probe-owned; synthetic data is not speech evidence. |
| The environment offered a temporary probe credential | Slice 1 | Ran `python3 -c 'import os; print(bool(os.environ.get("OPENAI_API_KEY", "").strip()))'` as a presence-only check: nonempty. No value printed/copied. Authentication, model access and billing remain probe-owned. The environment's presence is historical and is not a delivered configuration contract. |
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

### Settings refinement observations

Reviewed in the established bas-chan preparation workspace at
`a6964e7fb323578b77accff55cc1eab54c236b92`, with only this story and plan edited.
The branch remains `codex/dictate-additional-instructions-when-starting-a`;
the existing assignment is reused, not announced again.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| Project add/remove can preserve saved order, validation, selected checkout and retained session evidence through relocation | 2 | Read `project-add.spec.ts`, `project-remove.spec.ts` and `project-restored-session.spec.ts` setup/assertions; the nine real-page/service/store journeys passed. They observe actual saved files, native cwd, dev/production separation, cancel/focus, removal/re-add, last/first removal and passive retained Codex preparation. No settings relocation is claimed by this baseline. |
| Add/Remove has both banner and empty-state entry points; a shared test helper also participates in retained native-session preparation | 2 | `rg -n 'AddProject|RemoveProject|projectAddEndpoint|projectRemoveEndpoint|projectListEndpoint|projectConfigurationFile|initializeProjectConfiguration' dashboard src scripts tests` and `rg -n 'addProjectOnPage' dashboard tests scripts src`. Production callers are `App.tsx` and `DashboardBanner.tsx`; helper callers are add, remove and restored-session suites. `projectAdditionFixture.ts` consumes the configuration owner for validation. Preserve those purposes, not just the dominant add path. |
| Existing route handling assumes a configured project and public source reads omit local checkout paths | 2 | Read `dashboardRoute.ts` / `App.tsx`: `firstProject()` is used only by the configured dashboard, while App owns the empty state. Read `publishedProjects()` in `server/projectConfiguration.ts`: it returns only published-source fields. Thus machine settings needs app-level entry and a narrow local configuration read for path display; neither capability is assumed already present. |
| The existing local boundary mounts in both modes and enforces loopback/same-origin request admission | 3–4 | Read `localBoundaryPlugin.ts`, `localOrigin.ts` and `projectConfigurationPlugin.ts`; the above dev/preview project journeys consume those mounts over real HTTP. New key/audio admission is separately owned by slices 3–4. |
| No general OpenAI credential owner currently supplies a settings consumer | 3 | Searched `dashboard`, `src` and `scripts` for OpenAI keys, credential/settings owners and their callers. Existing host profile readers do not own general OpenAI access. The private credential owner is new behavior proved in slice 3, not an inherited capability. |
| Current recommended completed-file model remains the selected supported generation | 1, 4 | Searched and opened official file-transcription, GPT-Transcribe model and deprecations pages on 2026-10-03. They select `gpt-transcribe`; live-transcription models serve a different flow. Recheck before the brief credentialed probe; no API call was made in refinement. |

For this baseline the shell's Node was 24.5.0, so a disposable official Node
24.21.0 darwin-arm64 archive was downloaded and verified against that release's
`SHASUMS256.txt`. The first setup check diagnosed unavailable locked Playwright.
With real API keys unset and `NODE_ENV` unset, `node scripts/setup-native.mjs npm`
restored the locked dev prerequisites; the check then passed with Chromium
153.0.8010.12. Literal successful check/test/selection commands:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-seed084-refinement-node.daalvxo5/node-v24.21.0-darwin-arm64/bin:$PATH node scripts/setup-native.mjs check
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-seed084-refinement-node.daalvxo5/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/project-add.spec.ts dashboard/tests/project-remove.spec.ts dashboard/tests/project-restored-session.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-seed084-refinement-node.daalvxo5/node-v24.21.0-darwin-arm64/bin:$PATH node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/tests/project-add.spec.ts dashboard/tests/project-remove.spec.ts dashboard/tests/project-restored-session.spec.ts --list --reporter=list
```

All three commands exited 0; test selection listed nine cases. The temporary
runtime path is provenance, not required setup for later execution. Existing
voice baseline evidence remains above; its inspected text contract is unchanged.

## Ordered slices

### 1. A representative spoken instruction becomes a usable transcript
Type: Behavior
Status: planned
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
microphone observation when execution reaches it. The currently authorized work
is planning, so the probe is not executed now. Terry allows the environment `OPENAI_API_KEY` only for this brief story
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
Type: Behavior
Status: planned
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
Type: Behavior
Status: planned
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
Type: Behavior
Status: planned
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
| Latest suitable model and representative microphone/format/service compatibility | 1: official-model check, actual capture and one real transcript consumed as an editable draft; test key stays transient. |
| One cohesive System settings view with useful navigation and empty-state access | 2: real entry/return, browser navigation, selection and keyboard/focus observations; narrow/zoom UI review. |
| Project add/remove preserves one list, validation, environment separation, checkouts and session records | 2: real forms/services/files, selected/unselected/last removal, restart/re-add and existing boundary cases. |
| General OpenAI key save/replace/remove survives restart and is independent of projects | 3: real page/service/private-store journeys and dev/preview reads of the same isolated credential store. |
| Saved key is status-only in reads, private on disk, absent from logs/browser storage/project records | 3: response, filesystem-permission, failure/predecessor and admission observations; inspected narrow secret lifetime. |
| Saving/configuration reads make no paid request; environment key is not a runtime fallback | 3: zero provider egress on settings operations; 4–5: saved synthetic key consumed, missing saved key refused despite synthetic environment key. |
| Settings → save key → restart → dictate → review/edit → explicit Start delivers final text | 4: page → real settings/transcription service → fake provider → real launch → synthetic native argv. |
| Preserve typed text, append once, repeat clips, no automatic agent launch | 4: original-plus-transcript assertions and no native/start calls until explicit Start. |
| Recording/waiting feedback, disabled edits/Start, usable Cancel | 4: named/status/focus/control assertions in each pending phase. |
| Dismissal/late permission/late result/shutdown release resources and never change a new dialog | 4: held permission/result, track-stop and request-abort signals; reopened field and no host calls. |
| Typing and explicit retry survive unavailable or failed dictation; missing-key settings round trip preserves the draft | 4–5: preserved draft/configuration return/retry and fake-provider request counts; no automatic paid retry. |
| Preserve full over-length text and existing draft; exactly 4,000 characters accepted | 6: both boundaries, shortening/discard, final native argv. |
| Same-origin/loopback audio admission, fixed/bounded upstream request and transient audio | 4: HTTP refusal/provider-contact assertions and lifetime; 5: safe failures. |
| Both existing dialog purposes and normal text startup remain intact | 4–6: story/unattached journeys plus the five existing baseline cases. Native-host audio behavior is unchanged. |

Before browser checks, use the selected `.node-version` runtime and run
`node scripts/setup-native.mjs check`, as required by
[dashboard commands](../../../dashboard/COMMANDS.md). Install dev dependencies
when `NODE_ENV=production` would omit them. Run the affected project/settings specs for slices 2–3, then focused voice specs
and the five startup baseline cases at affected slice boundaries, with live API credentials unset;
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

- System settings contains Projects and OpenAI, representing machine-local
  configuration directly. Existing project operations/storage remain one owner;
  only their entry/navigation move. Preserve valid selection, empty-state access,
  running-session context and keyboard/focus behavior.
- The general OpenAI key is configured through System settings and stored once
  privately on this machine, shared across dev and production. Project lists
  remain environment-specific. Dictation is the first consumer; no extra API
  consumer or general secrets/provider framework is built.
- Terry's environment key is authorized only for brief experiments/tests within
  this story. No environment fallback or automatic import ships. Settings save
  confirms persistence, not entitlement; provider access is exercised explicitly
  through dictation, with no automatic paid test/retry.
- File transcription uses the latest suitable documented model, currently
  `gpt-transcribe`. Recheck official model/deprecation guidance before the live
  probe and record the selected ID. A failed probe changes the dependent API
  approach before dictation implementation, not the story's goal.
- Recorded audio is transient; reviewed submitted text follows the existing
  launch record. Pending dictation blocks submission, closing invalidates it,
  and failure restores typing. One append/length rule serves all startup paths.
- Provider request/response sizes and waiting are bounded. Choose operational
  bounds using the probe and existing failure mechanics; provider limits do not
  silently introduce a new product duration restriction.
- Automated proof replaces external provider/native behavior, not configuration,
  persistence, recording, upload, field integration or launch handoff. The real
  probe owns only the external compatibility premise those seams cannot settle.

## Review and sizing

Six Behavior slices: one bounded compatibility probe, project-management
relocation, general OpenAI configuration, the complete dictation journey, recovery,
and length handling. The two settings outcomes have separate observable proof
loops and safe stopping points; adding them to the old successful-dictation slice
would hide independent work. Retain the old voice probe and voice behavior loops,
renumbered as 1 and 4–6, with the changed credential/model contract. No completed
slice or execution proof is removed; all slices remain planned.

One project-list owner, one general OpenAI credential owner, and one dialog
record/transcribe/append lifecycle support the cumulative design. Settings is
not duplicated per project/host or dictated clip. No independent outcome is hidden
inside a layer-only preparatory slice. Missing live microphone/API access remains
bounded by the initial probe and stops dependent voice work if false. No numeric
slice target or hard limit was supplied; each outcome includes implementation,
focused proof and cleanup, without an invented timing policy. Six slices require
no resplit recommendation. This review found no remaining slice-boundary,
cumulative-design or proof-ownership concern. Cheap premises are observed above;
credentialed microphone/API compatibility is bounded by slice 1. Record the
assessment against the updated story/plan digests; no implementation or completion
is claimed.

## Learnings

None from execution yet.
