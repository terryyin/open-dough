# Launch proof evidence

## Baseline and planning observations

Observations are from the owned checkout at `3eef0b526` on 21 November 2026,
on AC power with Node 24.21.0 and its locked install.

| Consuming operation | Observation |
| --- | --- |
| Normal frontend runner lists the scoped legacy proof | `caffeinate -s -i npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/launches --list --reporter=line` listed 81 Chromium cases in 29 specs. |
| Existing legacy specs exercise the starting journeys | The same runner with `--workers=2` and `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` at `/tmp/launches-frontend-proof.md` passed 81/81 in 68.68 s elapsed including preparation (123.56 summed case-seconds). Load average was 16.17 before the run. Slowest cases: voice overflow beyond 4,000 (5.08 s), voice permission unavailability (4.08 s), Start session refusal touch (3.94 s), dialog touch rotation (3.44 s), and responsive keyboard start (3.37 s). |
| `LaunchDialog` mounts alone for open/cancel | Scratch `launch-dialog-preparation-probe.spec.ts` (reverted) passed on Vitest at two workers: `mountComponent` of `LaunchDialog` with `unattachedSession`, host `claude`, and stub `onStart` focused the instruction field; Escape and Cancel closed without calling Start. A wrong host identity (`claude-code`) threw in `useLaunchSettings` before paint — host values must be `HostIdentity`. |
| `StartLaunch` mounts alone for story Starts | Scratch `start-launch-preparation-probe.spec.ts` (reverted) passed: `StartLaunch` with typed work and callback `onStart` offered Start execution, opened `LaunchDialog`, and Cancel closed without Start. |
| Host catalog and transcription still fetch inside hooks | `useLaunchHostOptions` calls `fetch(launchHostOptionsEndpoint)` with no typed source. `useInstructionRecording` fetches transcription the same way. Catalog hosts (`codex`, `cursor`) need a required typed source before controlled catalog cases leave App substitutes. Claude dialogs that do not read a model catalog already mount without it. |
| Composed native and install journeys stay in E2E | Existing `e2e/launches/` coverage named from the legacy specs (ad-hoc start, story-card start, attachments, model/options boundary, voice, responsive held start, follow-up) remains the owner for real install, native host, mic, and cross-service startup. |

## Decisive premises

| Premise | Consuming operation | Form and profile | Result |
| --- | --- | --- | --- |
| `LaunchDialog` stands alone for open/cancel over typed props | Vitest `mountComponent` of `LaunchDialog` with unattached session | Scratch probe at `3eef0b526`, Vitest browser Chromium, two workers | Passed; Escape/Cancel close without Start |
| `StartLaunch` stands alone for opening a story Start dialog | Vitest `mountComponent` of `StartLaunch` with callback `onStart` | Scratch probe at `3eef0b526`, Vitest browser Chromium, two workers | Passed; Cancel closes without Start |
| Controlled host catalog answers reach `LaunchDialog` without App substitutes | Slice 5 early probe: introduce required typed host-options source, mount dialog, hold/fail/retry catalog | Same Vitest runner as replacement cases | Early probe in Slice 5; failure stops catalog-dependent work |
| Controlled transcription answers reach instruction voice without App substitutes | Slice 7 early probe: introduce required typed transcription source, mount dialog, abandon/overflow paths | Same Vitest runner as replacement cases | Early probe in Slice 7; failure stops voice-dependent work |
| Instructed or empty ad-hoc handoff observes terminal presentation without full App | Slice 1 / Slice 8 early probe: `StartSession` with minimal `MachineSessions` and `SessionsOnPage` stub or production handoff observation | Same Vitest runner | Early probe when that assertion moves; real held start stays E2E |

## Slice 1. Ad-hoc Start session

Paths without an extension below are individual specs under
`dashboard/frontend-tests/launches`. Existing E2E tests retain ownership of
composed behavior. Shared fixtures provide typed conditions, with assertions
on production rendering or on a passed operation's invocation.

| Legacy case | Observations and replacement |
| --- | --- |
| agent-launch-ad-hoc: Start session sits at the end opposite Near-future direction beside the help, is named for the selected project, and is hidden with the roster | `ad-hoc-start-session-answer`, “Start session is opposite the direction…” observes enabled and visible button wording, horizontal separation from direction and placement beside the help, the old offer's removal after changing the source and the new offer's removal from the visible DOM after the production hidden input. ConfiguredDashboardContent passes source and hides actions off Board. The production source change itself is exercised by `e2e/launches/agent-launch-ad-hoc.spec.ts` “starting on Pygardon uses Pygardon's folder…”. |
| agent-launch-ad-hoc: Start session is offered while the published read is still reading | `ad-hoc-start-session-answer`, “Start session stays enabled with no published work…” exercises the production row's no-work input and enabled control. ConfiguredDashboardContent shows PublishedReadStatus independently and passes the same absent work to ProjectActions during the initial pending read. Reading notice itself belongs to its status owner. |
| agent-launch-ad-hoc: Start session is offered after the published read failed | Same no-work test and independent production status/composition. Pending and failed first reads both give this component the same absent work input and no separate busy/failed input, so one mount covers the common offer behavior. |
| agent-launch-ad-hoc: the dialog names the project and Claude Code, says the session has no story or skill, starts empty with focus in its field, and Escape or Cancel send nothing | `ad-hoc-start-session`, “Start session names the project and host…” selects the actual named modal, asserts explanatory promise, empty focused instruction, enabled Start, clears an unsent draft across Escape and reopen, and observes both close paths, focus returns and zero calls. |
| agent-launch-ad-hoc-instructed: an instructed Start session with the Side panel closed leaves it closed and returns the keyboard to Start session | `ad-hoc-start-session`, “an instructed Start session sends the draft…” exercises the accepted start and starting-to-settled props through production StartSession and checks captured request, disabled launcher, progress focus then launcher focus and removal of progress. The launch operation's real dispatch decision lives in `launchStarts.ts` (`presents` only when normalized instruction is absent, sends no terminal request/callback otherwise). `e2e/launches/agent-launch-ad-hoc-instructed.spec.ts` asserts instructed native launch, exactly one Taken entry, no terminal requests and unchanged Side panel. Its opening panel already shows a report, whereas the retired case had it closed. The shared dispatch suppresses terminal presentation regardless of incoming panel state. |
| agent-launch-creation-gates: the common page displays a stand-in host's supplied inspection arguments | `ad-hoc-creation-entry` mounts production CreationEntry from a typed view; asserts exact stand-in heading, rendered shell-quoted spaces, apostrophes, literal substitution syntax and empty argument, and no fallback Codex wording. |
| agent-launch-start-session-layout: the text comes first, then Attach images, Host, Model and Reasoning effort, the Session group, Command details, Cancel and Start | `ad-hoc-start-session-layout`, “Start session tabs from instruction…” checks native Tab focus from instruction through Record, Attach, Host, Model, Effort, each choice group, Command details, Cancel and Start; verifies where text shown only upon opening details and no rendered command. |
| agent-launch-start-session-layout at 320 CSS pixels: with Automatically land chosen in either workspace and Command details open, nothing scrolls sideways, every control is reachable, and the line beside Start stays in view | `ad-hoc-start-session-layout`, “Start session wraps both choices at 320 pixels…” checks distinct wrapped workspace and after-checks rows in order, details of the established session, accessible full Start effects for both workspaces, no overflow, control reachability, and footer visibility. |
| agent-launch-start-session-layout at 320 CSS pixels: with the other choices not offered, nothing scrolls sideways, why is readable in view, and Cancel and Start are reachable | `ad-hoc-start-session-layout`, “Start session explains unavailable choices without clipping them at 320 pixels” checks in-view reason within dialog edges, both unavailable radios disabled, no overflow, every control reachable, Cancel and Start enabled and visible. |
| agent-launch-start-session-layout at 200% zoom: with Automatically land chosen in either workspace and Command details open, nothing scrolls sideways, every control is reachable, and the line beside Start stays in view | `ad-hoc-start-session-layout`, “Start session fits both workspace choices and automatic landing at 200% zoom” checks the distinct same-row layout with the same ordered rows, established details, both actual selections and effects, control and footer bounds. |
| agent-launch-start-session-layout at 200% zoom: with the other choices not offered, nothing scrolls sideways, why is readable in view, and Cancel and Start are reachable | `ad-hoc-start-session-layout`, “Start session explains unavailable choices and keeps both actions reachable at 200% zoom” checks the disabled paths, readable why and reachability at the separate zoom conditions. |
| agent-launch-start-session-answer-touch: the progress answer and the direction label read in whole words while the startup goes on | `ad-hoc-start-session-answer`, “the Start session progress and direction stay readable in whole words…” supplies typed starting/settled props, observes exact progress under disabled launch, word geometry, direction and help hit sizes, end placement, no overflow, height delta, re-enabled launcher and removed progress. Underlying empty launch opens terminal and close returns keyboard to launcher in `e2e/terminals/agent-launch-ad-hoc-terminal.spec.ts` “starting with nothing typed opens the session in the terminal…” alongside the Taken entry. The existing `e2e/launches/agent-launch-start-session-touch.spec.ts` also submits via touch and observes acceptance then actual session. |
| agent-launch-start-session-answer-touch: a refusal and the direction label read in whole words, opened, closed, and rotated | `ad-hoc-start-session-answer`, “the refusal and direction retain their room…” retains exact rendered refusal and whole words, 44px help/heading, in-view containment and reachability, answer-induced height growth bounded by answer height, portrait/landscape/portrait and real opening/closing geometry with direction spanning below and row positions preserved. The old Backlog y measurement isolated change in the preceding ProjectActions row height; the mount measures that production row directly. Actual refusal and enabled retry stay observed in `e2e/launches/agent-launch-ad-hoc-problems.spec.ts`. |
| agent-launch-dialog-layout: the instruction comes first, the summaries name the selection, and the command details hold the flags | `ad-hoc-launch-dialog`, “the instruction comes first…” observes long title and identity, real host/refinement words, Host then Model on the same row, effects visible and describes Start, closed disclosures and initial command, all native keyboard positions, selected Explore and UX/UI surviving collapse, summary when reopened, exact command flags and Cancel focus. |
| agent-launch-dialog-layout at 320 CSS pixels: with every option selected, nothing scrolls sideways, every control is reachable, and Cancel and Start stay in view | `ad-hoc-launch-dialog`, “refinement stacks Host above Model at 320 pixels…” selects each of the shipped options, checks all count and ordered flags, stacked controls, no sideways scroll, reachability and always-visible actions and effects. |
| agent-launch-dialog-layout at 200% zoom: with every option selected, nothing scrolls sideways, every control is reachable, and Cancel and Start stay in view | `ad-hoc-launch-dialog`, “refinement keeps every option and action reachable at 200% zoom” checks the distinct same-row geometry plus all selected flags, footer actions and effects. |
| agent-launch-dialog-touch: rotation and short visible height preserve the draft and choices, and Cancel sends no launch | `ad-hoc-refinement-touch` checks native taps, Codex heading upon host change and return to Claude, Sonnet, standard tracking and Explore controls, Unicode/multiline draft and choices across landscape, short, and portrait, native editing at the measured touch selection, footer and control reachability and no horizontal scroll, no launch before or after Cancel and focus returned. No catalog reply is needed by this case. |

Six mounted Chromium specs passed 16 cases at two workers in 15.75 s
including preparation. The 17 equivalent legacy cases took 27.60 summed
case-seconds within the full-cohort run, compared with 21.61 summed
case-seconds after migration. The baseline supplies no comparable per-slice
wall time. The slowest mounted cases were touch rotation (4.52 s),
refinement at 200% zoom (3.38 s), and refinement at 320 CSS px (3.18 s).
The 13 existing E2E cases covering the affected composition passed in
93.27 s, including preparation. Dashboard typecheck passed. The checkout
Git evidence directory holds `slice1-implementation.md` with commands,
consumer observations and run records.

Independent refactoring retired an unused touch observation and reused the
published-source MakeMe builder. All six affected mounted cases, three
retained Intent word-wrap cases, and dashboard typecheck passed. The Git
evidence directory holds `slice1-refactor-consumers.md` with the proof and
consumer trace. Existing E2E observations remain valid after comment edits.

The formatter required typed assertions and locator setup in four new test
files. The affected dialog, instruction handoff and ProjectActions cases
passed after repair. The Git evidence directory holds
`slice1-format-repair.log.run.json` for the dialog and handoff and
`slice1-locator-repair.log.run.json` for the final ProjectActions selection.

Story-branch CI found a native tap could leave the options disclosure closed.
A controlled scroll reproduced the symptom on Linux arm64. The repaired
test helper checks stable geometry and the trusted pointer target. The
controlled contrast and both maintained touch specs passed on Linux arm64
and macOS. [Diagnosis and hosted confirmation](diagnosis-refinement-touch-disclosure.md).
