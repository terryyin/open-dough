# Planning context and premises

Supporting context for [the active plan](PLAN.md); no separate slice status.

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
