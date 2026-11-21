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
| Controlled host catalog answers reach `LaunchDialog` without App substitutes | Slice 5 early probe: introduce required typed host-options source, mount dialog, hold/fail/retry catalog | Same Vitest runner as replacement cases | Passed the held, failed and retried reads through the required typed source in mounted Chromium |
| Controlled transcription answers reach instruction voice without App substitutes | Slice 7 introduced the required typed source and mounted the real dialog while its transcription was held | Same Vitest runner as replacement cases | Cancel aborted the request and released the native track. The late reply left the next dialog empty. See [remaining proof](remaining-proof.md). |
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

The picker repair passed the hosted launch selection. Two hosted frontend
shards then exposed separate Board and Projects fixture defects. The
branch adopted the landed Board preference fix at `396f81d69` and pinned
the existing Projects refusal test to its desktop viewport. The combined
Linux arm64 selection passed all 17 cases. [Diagnosis and proof](diagnosis-mounted-viewport-ci.md).

## Slice 4. Startup answers and recovery

| Original case | Replacement and retained observation |
| --- | --- |
| `agent-launch-story-card-answers.spec.ts`, “an execution card of a project whose installed skill cannot continue from a start reads Starting execution in Claude Code…” | `story-card-startup.spec.ts`, “accepted execution without an establishing skill says Starting execution in Claude Code” submits execution through the real dialog, accepts via the typed service, and observes the exact running phrase and disabled Start. |
| Same file, “an execution card of a project that establishes a start reads Preparing execution… and stays in the Backlog, shown neither Taken nor assigned” | “accepted execution with an establishing skill says Preparing until the attempt settles” presents an establishing capability, checks the exact phrase and disabled Start, then observes its disappearance on a refused settlement. In `e2e/launches/responsive-session-start.spec.ts`, “Start execution in Claude Code closes at acceptance while its start is held, protecting only that story,” the protected story is still the Backlog card, no profiles exist on origin and no native session has started before held publication. The later read places the session on the Taken card. |
| Same file, “a refinement card keeps Starting refinement in Claude Code…” | “accepted refinement without an establishing skill says Starting refinement in Claude Code” submits through the refinement dialog, observes the exact host/workflow phrase and captures the one refinement request. |
| Same file, “the card explains the folder was not found and keeps Start execution” | “a missing folder explanation stays below Start execution and focus returns to that offer” supplies the typed folder failure after submitting the actual modal, checks closing, exact failure words, enabled focus return with accessible description, geometry between Start execution and Start refinement, and no listed session. |
| Same file, “the failure shows beside Start refinement, which it describes, and leaves Start execution without an answer” | “a refinement refusal describes Start refinement alone and sits below both desktop offers” submits refinement and observes the one answer below the unchanged desktop row, contained in the launch group, and its description and focus on refinement only. The retained `dashboard/frontend-tests/review/story-review-action.spec.ts` case “the inspection group sits below the launch group, wraps in reading order, and the keyboard reaches Review changes from Inspect story” observes that the production inspection group follows the launch group and that the actual buttons read in order. |
| `agent-launch-story-card-uncertain.spec.ts`, “Start is disabled while in flight, and the uncertain answer needs reconciliation under Startup recovery while the card stays protected” | `startup-recovery.spec.ts`, “an accepted start hands focus to its protected story and a later uncertain outcome belongs in recovery” holds the initial response, observes the disabled Start, then hands focus to the card and shows the accepted progress. The later typed timeout shows the static status ahead of launch actions with both disabled and described, keeps focus, shows neither a local problem nor a session, and retains exact Claude words, both code spans, Recheck and accessible native advice on Continue. The one accepted request is recorded. The existing constrained-height case in `e2e/launches/agent-launch-story-card-problems.spec.ts` proves the real timeout, disabled action, native advice, zero sessions, and only explicit Continue resumes the same instruction. |
| Same file, “a lost acknowledgment says the launch is uncertain, never accepted, and the story is protected once its attempt is read” | “a lost acknowledgment says uncertain beside Start when a subsequent read shows the attempt” supplies an unacknowledged result at the typed client boundary. It observes the static lost-response status and Recheck without Continue, then supplies the later running observation. The real attempt hook now renders the exact uncertain wording next to Start and the real running status, with both Starts unavailable and the independent card's Starts still enabled. There is one request. The retained `responsive-session-recovery-reads.spec.ts` case “a lost acceptance answer keeps the story protected statically with Recheck while the service is unavailable, until a later read shows the accepted start” drops the actual response after acceptance, holds failed rereads, exercises Recheck and scope of full-card protection, then lets the later read show actual progress. That case stays with Slice 8. The existing `dashboard/backend-tests/launches/agent-launch-client.spec.ts` case “claude keeps its uncertainty hint after fetch rejection” proves the real client distinguishes no acknowledgment from acceptance and gives the exact explanation. |
| `startup-host-words.spec.ts`, “without a reported phase, story startup keeps its host and the installed start's Preparing versus Starting choice” | `story-card-startup.spec.ts`, “a running observation with no worker phase uses its host, workflow, and installed start capability” varies both hosts, both workflows and capability presence on the real attempt model. It observes eight exact Starting/Preparing phrases and, for the running card, the local-progress description, both Starts disabled and no reconciliation or waiting message. |
| Same file, “a recovery host without native-check advice keeps its controls without borrowed advice or a description reference” | `startup-recovery.spec.ts`, “Cursor recovery offers Recheck and Continue without another host's native-check advice” supplies an interrupted Cursor ad hoc observation. The actual recovery owner shows Cursor, never-settled words and both controls, with no native advice, advice element, description ID or accessible description. |

The existing acceptance client and attempt-change wait remain authoritative.
The required typed launch source lets the mounted cases hold a real attempt
transition without recreating its decision or using page-wide substitutes.

Nine mounted Chromium cases passed in 4.02 s including preparation, with
3.15 summed case-seconds versus 10.76 for the legacy subset. Establishing
execution was the slowest mount at 0.70 s. Dashboard typecheck passed.
Four existing composed E2E cases passed in 17.02 s. Three retained
frontend cases passed in 7.69 s, and four HTTP client cases in 1.47 s. Work
stays with each existing owner. The checkout Git evidence directory
holds `slice4-implementation.md` with commands, observations and receipts.

Independent review corrected four stale test comments. The focused
startup, retained frontend, E2E and wire observations remain valid.

## Slice 5. Host catalog, model and effort

| Original spec and case | Replacement and observable proof |
| --- | --- |
| `agent-launch-codex-catalog.spec.ts`, “slow/unavailable discovery retains focus, retry works, host changes and fresh openings reset; cancel creates nothing” | `launch-host-catalog.spec.ts`, “a held Codex read keeps Start available and a failed read offers retry without moving instruction focus.” The typed read is held for open-dough in project context and shows loading without disabling Start. A rejected read shows Retry, retains focus and the Codex host, and leaves the effort on its default. Retry presents all three model choices. Select Native Sol and ultra, switch to Claude then Codex and see each model reset. Cancel after selecting again and reopen to the default model and effort, then Escape. Both closures ask for no start. |
| Same, “a late catalog reply cannot replace another host's current options” | “switching host aborts the old catalog and a late Codex answer leaves Claude choices intact.” Select Codex, observe the one host and source read, switch to Claude and observe abort, then deliver the old result anyway and still see Default, Fable, Opus, and Sonnet. Escape closes. |
| Same, “a late reply from the previous project cannot replace the current project's choices” | “switching project aborts the old catalog and its late answer leaves the current project's models intact.” The same mounted dialog context changes from open-dough to a second MakeMe project, reads each source in order, and shows exactly Use Codex setting and Project Luna. Confirm the prior read's AbortSignal and deliver its different catalog anyway; the same two choices remain. Escape closes. |
| `agent-launch-model.spec.ts`, “Claude Code's effort opens on medium as Open Dough's default and names the cost of high, xhigh and max; Start asks for the shown level” | `launch-model-effort.spec.ts`, “Claude names its default and relative effort costs, and Start submits the effort shown.” All five option labels including exact multipliers, medium and max and low accessible selection descriptions, and two closures are observed on the shared real dialog. Start emits medium and then max. The existing composed Claude execution case still proves which Opus and high arguments reach native launch. |
| Same, “low chosen for Claude Code, switching the host to Codex returns the effort to Use Codex setting, and back to Claude Code shows medium” | “changing hosts resets effort to each host's default, and Start sends the chosen Codex model and effort.” Select low on Claude and move to Codex with the empty value and exact selected label Use Codex setting, then back to Claude with medium. The further explicit Codex choice submits its host, Native Sol model and ultra effort together. |
| Same, “Fable and max chosen then Cancel starts nothing, and every dialog opens again on Default and medium” | “Cancel clears chosen model and effort from each launch dialog without starting.” Actual execution, refinement and ad hoc launchers open on medium, accept Fable and max, close on Cancel and restore keyboard focus. Open each again on model Default and medium, then close again. Both outbound launch operations remain untouched. |
| Same, “Fable and max chosen then Escape starts nothing, and every dialog opens again on Default and medium” | “Escape clears chosen model and effort from each launch dialog without starting.” Same observable initial selections, closure, keyboard return, reopening defaults and no Start requests for the distinct Escape route. |
| Same, “the dialog opens in the instruction field, and Tab reaches Record, Attach images, Host, Model, Reasoning effort, the session's tracking, Command details, Cancel, then Start” | “refinement without options tabs from instruction through launch choices to Start.” Real refinement opens with instruction focused, then moves through Record, Attach images, Host, Model, Reasoning effort, Standard tracking, Command details, Cancel and Start in order using Chromium Tab. The start operation is untouched. |
| `agent-launch-native-effort.spec.ts`, “model changes preserve compatible effort and retain incompatible selection with linked keyboard feedback” | `launch-native-effort.spec.ts`, “Codex model changes preserve compatible effort and keep incompatible effort invalid with linked feedback.” Choose Native Sol and see the same three exact effort labels and descriptions. Switch from ultra to a model which does not support it and observe retained ultra, aria-invalid, linked cannot-be-verified description and disabled Start. Select the compatible low and change back, observing retained low and enabled Start, then Tab through the same five native controls. Restoring the default clears invalidity. Switching to Claude and back resets effort, and Cancel and a fresh opening restore default model and effort with no Start. |
| Same, “unknown configured custom model leaves defaults usable and efforts delegated; narrow and 200% reading retains Start” | “an unknown configured Codex model leaves defaults usable and Start visible at narrow and zoomed widths” passes the native custom-model catalog reply to the actual dialog. The effort list has three options, the default explains workspace resolution, Start is enabled and fully in the viewport at 390px, and choosing ultra explains verification before initial input. Start remains in the viewport at the existing 200% setup. Restoring the default leaves Start enabled. |
| Same, “switching Cursor model retains unsupported effort as invalid and blocks Start” | “Cursor model changes keep an unsupported effort invalid until a listed effort is selected.” The typed catalog lists high on Orb and medium on Luna. Selecting high then Luna retains high, links cannot-be-verified feedback, marks it invalid and disables Start. Selecting medium clears invalidity and enables Start. The existing composed Cursor case still checks the multi-effort provider menu and native composed ID. |

The decisive typed catalog probe passed at two workers. The mounted
selection passed all 11 cases in 7.59 s including preparation, with
7.50 summed case-seconds versus 10.23 for the eleven legacy cases.
The three-launcher Cancel case was slowest at 1.94 s versus 1.73 s
for the slowest legacy case. Dashboard typecheck passed. The seven
existing native-launch and Feedback Settings E2E cases passed in
16.14 s including preparation. The existing held-options frontend
consumer passed separately. See `slice5-implementation.md` in the
Git evidence directory for exact commands, assertions and results.

Independent review retired the catalog-specific route override. The
remaining held-options case passed through the general empty catalog
fallback. The E2E updates align comment references with mounted proof.

## Slice 6. Refinement options and recorded details

| Legacy source and title | Replacement observation |
| --- | --- |
| agent-launch-options — the execution and session dialogs offer no options | launch-refinement-options — the project's refinement offer shows options only on Start refinement: execution opens on the expected story, ad hoc opens on the same project, each has no options summary or fieldset, and the refinement dialog exposes the A radio and C checkbox from the same MakeMe machine read. |
| agent-launch-options — choosing No Approach clears the group's choice and leaves the others | launch-refinement-options — No Approach clears A, keeps C and sends only C on Start: select C then A, activate No Approach by focused keyboard, observe No Approach and C checked and A unchecked, show the exact `/dough-story-refinement SEED-731#story --c` in Command details, and observe the one typed Start invocation with `options: ["--c"]` (P19). |
| agent-launch-options — until the sessions read answers, refinement is not offered; while the options are read again, the dialog says so and Start asks for refinement with no options | launch-refinement-options — a held initial read disables refinement and a held host reread submits no options: the real card starts disabled and enables after supplied read, available C is unselected, Codex then Claude fires production reread callback, the dialog says Reading options with no options disclosure or group, then closes on one Claude refinement request and its choices have no options property. |
| agent-launch-options — after a refusal, Cancel drops the kept selection | launch-refinement-options — a refused selection stays checked until Cancel and is clear when next opened: actual `useLaunchAttempts` sends A and C in one refinement acceptance request, controlled refusal visibly says Launch failed, reopening still shows A and C checked (P22), Cancel dismisses and reopening leaves A and C clear with No Approach checked and no second acceptance (P23). |
| agent-launch-options-entries — a refinement launched with Explore and Borrow reads as requested on its card without a Recently done duplicate, through a reload | launch-record-details — refinement cards independently show requested options and model across all four recorded combinations, Explore and Borrow example: precisely one Refinement session on its own Backlog card, exact recorded Options string visible in its Session details, corresponding session ID, no model text, no article in Recently done. The real Explore/Borrow E2E now asserts that exact Options string and one entry before and after actual page reload; backend machine read verifies persisted definition order. |
| agent-launch-options-entries — a refinement launched with Explore, Borrow and Opus reads as requested on its card without a Recently done duplicate, through a reload | Same mounted case, Explore, Borrow and Opus example: precisely one Refinement session on the right card, exact Options and Opus strings both present with matching ID, no Recently done article. The real options and recorded Codex model reload edges independently exercise page reread and label projection, while this record example exercises co-presence. |
| agent-launch-options-entries — a refinement launched with no options reads as requested on its card without a Recently done duplicate, through a reload | Same mounted case, No options example: one Refinement on its own card with matching ID, no Options or Model in the DOM after disclosure, no Recently done article. The existing real no-selection E2E checks the unchanged host instruction without flags, and the boundary's no-options case checks the record. |
| agent-launch-options-entries — a refinement launched with no options on Opus reads as requested on its card without a Recently done duplicate, through a reload | Same mounted case, No options on Opus example: one Refinement with exact Opus string and matching ID, no Options in the open details, no Recently done article. Retained real model reread and backend no-options record independently exercise the persistence edges. |
| agent-launch-model-entries — a story session launched on Opus says so on its card and in the sidebar, through a reload | launch-record-details — execution and ad hoc model labels appear in their own Board entries and sidebar, with effort only when recorded: one Execution on the Opus story, visible exact Opus string, matching sidebar row title with distinct Execution and Opus lines, no Recently done article. Real machine boundary reads the Opus request after launch and real Codex model reload checks a requested model record using the same page reading/label owners. |
| agent-launch-model-entries — a story session launched on Default shows no model on its card and in the sidebar, through a reload | Same mounted case, Build on Default: one Execution, no model in the card or title of the matching sidebar row, which still has the Execution line, no Recently done article. Real default E2E verifies the persisted request omits model and the same real page reload reads back the independent explicit model. |
| agent-launch-model-entries — an ad hoc session launched on Sonnet says so in Taken and in the sidebar, through a reload | Same mounted case: the named Ad hoc article occurs once under Taken, exact Sonnet model visible, matching sidebar row has the Ad hoc and Sonnet lines, no Recently done article. Existing real Claude boundary re-reads a Sonnet ad hoc request from the machine; Codex dynamic ad hoc model case independently runs actual page reload and observes the record in Taken when the catalog is empty. |
| agent-launch-model-entries — a story session started at max names it in its Session details, through a reload | Same mounted case, Build at max effort with no model: keyboard enters actual Session details, expansion and matching session identifier visible alongside exact `Effort: max (requested)`. Backend chosen-effort case now asserts a subsequent real machine read returns the same request that carried the chosen effort to Claude and was returned by Start; the shared page reread is exercised by the real options and model paths. |
| agent-launch-model-entries — a story session recorded without an effort shows no effort line in its Session details, through a reload | Same mounted case, Build on Default: keyboard enters actual Session details, expansion and matching session ID visible, no Effort in the open details. Existing real Codex backend effort case checks the stored default request lacks effort. Real reload is exercised by options and requested model, while the mounted Board specifically verifies the legacy omission. |

Six mounted Chromium cases passed in 7.44 s including preparation, with
5.98 summed case-seconds versus 9.77 for the 13 legacy cases. Refusal
and Cancel was the slowest mount at 1.99 s versus 1.78 s historically.
The three existing real Options E2E cases passed in 7.50 s, including
the recorded-options check before and after reload. Twenty mounted
consumer cases, 13 connected E2E cases, the real backend boundary
selections and dashboard typecheck passed. See `slice6-implementation.md`
in the checkout Git evidence directory for selected proof and receipts.

Grouped launch options use one MakeMe example across mounted and E2E
proof. Four mounted and seven E2E cases and dashboard typecheck passed
after the refactor. See `slice6-refactor-consumer-trace.md`.
