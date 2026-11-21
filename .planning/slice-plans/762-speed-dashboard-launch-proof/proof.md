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

## Slice 2. Launch attachments

| Retired case | Replacement case and observable proof |
| --- | --- |
| `agent-launch-ad-hoc-attachments-paste.spec.ts`, “pasting text into the instruction field still inserts the text” | “pasting text into the instruction inserts it without attaching an image” copies into Chromium's clipboard with the native keyboard, sets the insertion point after the existing draft, sends the native paste shortcut, and observes the appended suffix and absence of Attached images. |
| `agent-launch-ad-hoc-attachments-refusal.spec.ts`, “PDF, oversized PNG and a sixth image are refused with reasons while the draft stays” | “refused images explain why, keep the draft, and leave only accepted images for Start” feeds file selections to the production picker. It observes the PDF reason and unchanged instruction after the PDF alone, then both PDF and oversized PNG reasons together, one incumbent preview, unchanged instruction, Claude, Default main, and Wait for review. At the count limit it observes the named sixth-file rejection, five previews including the original and last admissible file in order, and the retained instruction and workspace selection. Start sends just the five names in order and the original instruction to the typed launch operation. |
| `agent-launch-ad-hoc-attachments-cancel.spec.ts`, “Cancel after attaching uploads nothing; reopening shows no attachment” | “Cancel after attaching uploads nothing and opens an empty draft next time” supplies a typed draft and genuine image File, observes the preview, clicks Cancel, waits for closure, reopens via Start session, and observes empty instruction and no attachment list. A launch-operation recorder and an observing fetch spy prove no launch call or attachment endpoint request from the mounted path. |
| Same file, “Escape after attaching uploads nothing; reopening shows no attachment” | “Escape after attaching uploads nothing and opens an empty draft next time” uses the same precondition and independent assertions, with a native Escape keypress as the dismissal trigger. |

Four mounted Chromium cases passed at two workers in 4.35 s including
preparation, with 2.62 summed case-seconds versus 4.17 in the legacy
cohort. Cancel was the slowest mounted case at 1.02 s. The retained E2E
attachment suite owns native chooser, copied bytes, and image-only and
pasted-image launch. The checkout Git evidence directory holds
`slice2-implementation.md` with commands, observations and run records.

Independent review removed the unused substitute upload counter and
updated the existing E2E pointer to mounted paste proof. The live
substitute route and executable E2E and mounted observations were
preserved. See `slice2-refactor-consumers.md` in the Git evidence directory.

## Slice 3. Story-card launch offers and dialogs

| Retired Playwright case | Retained observation |
| --- | --- |
| `agent-launch-story-card.spec.ts`, “every Backlog card offers Start execution, described as not assessed as ready unless its assessment is Ready, then Start refinement, and a Taken card offers neither” | `story-card-launch-offers.spec.ts`, “Backlog offers execution then refinement with an assessment note when needed, and Taken offers neither,” uses Ready and unassessed work. Both Starts stay enabled in visible DOM order, refinement has no description, Ready execution carries neither a description nor a hover tooltip, and unassessed execution has the exact accessible note hidden at rest. Changing to the Taken input with no kept start removes the group. The composed Ready badge remains in `compact-session-entry.spec.ts`, “a compact session discloses technical details and secondary actions without hiding attention or terminal access,” where the original Ready story without an open session visibly shows Ready for execution. |
| `agent-launch-story-card.spec.ts`, “the Start execution dialog names the story, Claude Code, and its command, takes focus to its instruction, and Escape or Cancel sends nothing” | `story-card-launch-dialogs.spec.ts`, “Start execution names the story, host and command, then Escape and Cancel restore the offer without starting,” checks the accessible dialog name, selected story, exact skill invocation with work identity, focused instruction, empty reopening, no launch, enabled Starts, and focus restored by both closers. Both closers discard an actual draft. |
| Same file, the Start refinement variant of that case | The equivalent “Start refinement names the story, host and command, then Escape and Cancel restore the offer without starting” covers the other production workflow with its distinct command. |
| `agent-launch-story-card-dialogs.spec.ts`, “Start execution and Start refinement dialogs offer the same Attach images control” | Both named workflow dialog cases now check the exact visible Attach images button in their actual modal. Reusing these two openings retires the separate duplicate case. |
| Same file, “the execution dialog of a project that establishes a start says Start also publishes the Take to the trunk on origin and creates a workspace under .worktrees/, and the refinement dialog does not” | “only execution on a project whose installed skill establishes a start names the Take and workspace” supplies a Claude execution capability in the machine answer. The production execution modal has the exact authorization sentence and refinement with a named story has no publication/workspace promise. |
| Same file, “the execution dialog of a project whose installed skill cannot continue from a start adds no sentence about a Take or a workspace” | “execution without an establishing skill gives no Take or workspace promise” supplies an empty capability answer. The named story is present and the publication/workspace wording is absent. |
| `agent-launch-story-card-noted-start.spec.ts`, “share the launch group's line at 1440px and wrap in reading order, by keyboard, at 420px and 200% zoom” | “story Starts keep their reading order and visible keyboard focus at narrow and zoomed widths” observes the 1440px line, readable labels, decorative leading glyphs and 3:1 glyph contrast, width and whole words at 420px and the 640px 2× device-scale profile, order and a visible focus indicator on native Tab, Enter opening, Escape restoring, a still-working next keyboard move, and no start. The offer case adds separate Ready glyph/line and unnoted hover observations. The actual story card's cross-group placings at 1440px, 420px and 200% remain in `review/story-review-action.spec.ts`, “the inspection group sits below the launch group, wraps in reading order, and the keyboard reaches Review changes from Inspect story,” which reads the real Starts, Inspect and remaining actions in order. `navigation/accessible-board-keyboard.spec.ts`, “accessible Board is read by keyboard in reading order, with visible focus, and Enter follows a link,” observes the actual succession of native Tab from enabled Starts to Inspect story. In `navigation/story-card-selection.spec.ts` the existing Inspect and Hide detail interaction now also observes the actual leading hidden chevron, enabled glyph contrast, 90° turn, and return to unrotated position. |
| Same file, “a clickable noted Start does not look disabled in light and dark schemes” | “noted execution and preparing refinement stay readable and distinct from unavailable Starts in both schemes” uses a queued preparing work entry that also lacks readiness. It checks each exact control name, one accessible description, the hidden-at-rest styled aria-hidden tooltip, whole in-viewport hover tooltip, native keyboard focus and blur behavior, leading glyph, and the exact sentence in each workflow's real dialog. It compares the same button owner using read versus unread launch evidence for the enabled/disabled styles, checking foreground and border distinction in both schemes and 3:1 glyph contrast. The open-session gating it used as a precondition stays explicitly observed in `e2e/sessions/agent-launch-story-card-session-states.spec.ts`, “an open session stays on its card with its state through an unreadable listing, a restart, a reload and a project switch,” where the real session blocks each Start with a reason. The rerendered unavailable state puts the same disabled production selector under geometric and color observation without mounting unrelated session-entry UI. |

Seven mounted Chromium cases passed at two workers in 4.99 s including
preparation, with 5.02 summed case-seconds versus 12.30 for the eight legacy
cases. Appearance in both schemes was the slowest mount at 2.17 s. The
three retained Board and inspection cases passed in 6.30 s. The chevron
observation runs within an existing case, whose total time was 2.82 s.
Dashboard typecheck passed. The checkout Git evidence directory holds
`slice3-implementation.md` with commands, observations and run records.

Independent review removed the unused shared chevron journey, aligned
the inspection steps and corrected stale E2E comment references. The
focused inspection case passed after the edit. The Git evidence directory
holds `slice3-refactor-consumers.md` with the proof and consumer trace.

The hosted Slice 3 run exposed Chromium desktop-hover setup and another
manual touch-coordinate failure. A fresh desktop context isolates the
three appearance cases, and Playwright supplies native actionability inside
the mounted iframe. Eight focused cases passed on Linux arm64 and macOS.
The normal runner collected each affected title once. [Diagnosis and proof](diagnosis-launch-browser-input.md).

The landed Board sibling at `fbb074217` changed the frame, selection and
runner owners. Local merge `e4c8b1724` retains its mounted frame tests
and the chevron observation in its mounted selection case. The shared
WorkEntry builder preserves supplied canonical links and fills the
incidental default only when omitted. The old long-title helper lost
its last executable caller and was removed.

Seven explicit Vitest files passed all 14 overlapping launch and Board
cases at two workers, and dashboard typecheck passed. Run records in the
checkout Git evidence directory are `board-reconcile-vitest.log.run.json`
and `board-reconcile-typecheck.log.run.json`.

A hosted screenshot and a failing locked Linux probe established that
programmatic Model selection had left its native picker open. The
refinement touch case still probes the real Host and Model hit targets
and supplies named values. It now keeps the browser-owned picker closed
during this setup and retains the subsequent native gestures. The
focused case passed on macOS and Linux arm64.
[Diagnosis and proof](diagnosis-refinement-touch-picker.md).
