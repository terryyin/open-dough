# Get fast proof of live sessions and terminal work

**Identity:** SEED-413#speed-dashboard-live-session-and-terminal-proof
**Source:** [Get fast proof of live sessions and terminal work](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-live-session-and-terminal-proof)

## Execution context

- Story Branch Mode with publisher `dashboard-territory.local-open-dough`
  and agent Shunka-chan. The owned worktree is
  `/Users/terryyin/git/open-dough/.worktrees/get-fast-proof-of-live-sessions-and-terminal-wor`,
  on `codex/get-fast-proof-of-live-sessions-and-terminal-wor`. The separate
  default checkout is `/Users/terryyin/git/open-dough`.
- The established claim `f41e39c2388a36ea678d7e5fa13b4694698e1879`
  extends `4c0b4a9cb940d533b65f40ab450001d473224e05` and was verified on
  `origin/main` and the remote story branch. Development dependencies were
  installed with `npm ci` in the owned worktree, and
  `npm run typecheck:dashboard` passed.
- Story-branch GitHub Actions observer for `terryyin/open-dough` and
  workflow `ci.yml`. Coordinator `shunka-413-1cc9a5a7`,
  directory `/tmp/dough-ci-501/watch-ISPmje`, PID `47816`,
  Codex stream session `13832`, cell `g496:14`. The earlier trunk
  claim is outside this observer's coverage.
- Compare the scoped frontend selections on this AC-powered 16-core
  macOS host at two workers. Preparation is included in wall time.
  The baseline started with 49% free memory and no competing test
  command observed. Reconsider if another heavy run or memory
  pressure affects the comparison.

## Goal and scope

Give dashboard maintainers faster feedback that live sessions appear with the
right order, status and actions, that Mark Done, delete, unread-report and
retirement flows stay truthful under held or refused answers, and that
terminal layout, input, touch selection, prompts and dictation recover
correctly when an update or capture is interrupted. Move the remaining legacy
`sessions/` specs outside Done review, all `terminals/`, and Stories'
`story-note-voice*` (31 sources, 77 cases at the campaign inventory) onto
Vitest mounted production owners, and remount the already-mounted open
Sessions sidebar family through the production page frame and required
page-reads entry. Done review, launch dialogs, and frontend runner retirement
each stay with their campaign stories. Real process, native host transport,
clipboard and microphone journeys stay in existing `e2e/sessions/`,
`e2e/terminals/` and backend owners.

## Current decisions

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-frontend-stories),
  [Architectural North Star](../../NORTH-STAR.md)
  (directly testable production; act as soon as the page allows; plain Vitest
  for unit),
  [frontend test entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Reuse `mountComponent`, page-loadable MakeMe, `pageReadsSupplying`, and
  `machineSessionsAnswering`. Remount open Sessions through production
  `PageFrame` / `ConfiguredDashboard` (as
  [board-frame-mount](../../../dashboard/frontend-tests/navigation/board-frame-mount.ts)
  does) so `SessionsSidebar` owns the open list; stop composing
  `SessionsSidebarOpenList` in
  `sessions-sidebar-open-mount.ts`. Mount `SessionEntry`, `Terminal`,
  `FinalReport`, `RunningCursorSessions`, and story-note voice owners through
  their typed production props and required page reads. Prefer required typed
  `SessionServices` (`readFinalReport`, `readHostStatus`, `openTerminal`) and
  `InstructionTranscriptionSource` over App providers or optional defaults.
- Use native Chromium keyboard, pointer and touch where those inputs are the
  proof. Supply typed held, refused and late answers for presentation and
  recovery. Keep real mic, clipboard, native Done/stop and host transports in
  E2E.
- Map each legacy title and its distinct assertions to a named replacement or
  inspected existing observation before deletion. Keep distinct viewport,
  focus, wording, refusal and race observations where they show different
  risks. Consolidate equivalent prompt phrases and select viewports when setup
  and risk are the same. Use the project's MakeMe and page-object selection
  rules; colocate page objects beside the specs.
- Act directly with retrying observations. Retire whole-app session and
  terminal FE consumption of route substitutes as the last scoped consumer
  moves. Keep shared E2E page objects and backend refusal owners.
- Compare equivalent focused selections at two workers, including preparation,
  counts by engine and destination, any E2E cost, and the slowest remaining
  cases. Accept consolidation when the proof still distinguishes the preserved
  risks.
- The pinned `f41e39c23` baseline passed 77 Playwright cases in 31
  legacy sources at two workers, in 94.855 s with the quiet reporter
  and 110.911 s with the repository's case proof and timing recorders.
  Wall time includes preparation. The local evidence is
  `legacy-baseline.log.run.json`, `legacy-campaign-baseline.log.run.json`,
  `legacy-campaign-baseline.json` and `legacy-campaign-times.json`.
  A neighboring worktree also ran a two-worker Playwright selection
  during the first run. The recorded run overlapped the sidebar's short
  focused proof. Treat individual timings as approximate.
  The slowest cases in the recorded run were paused-text scroll and
  copy (12.648 s), the two report-divider cases (10.951 s and 7.985 s),
  and report choices through resize and rotation (7.480 s).
- The five mounted Vitest files in slice 1 also passed all 12 cases at
  baseline in 3.468 s wall. `board-done-session-placement` stays with
  Done placement and review.

## Local gate

On macOS run from an awake machine on AC with `caffeinate -s -i`, the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Keep default test timeouts and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run each affected frontend engine's explicit paths separately through
`npm run test:dashboard:frontend -- <paths> --workers=2` while both exist.
Run the named E2E paths with `npm run test:e2e -- <paths> --workers=2` when
changing their observations or their composed boundary. Typecheck changed
dashboard production inputs and callers with `npm run typecheck:dashboard`.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Existing open-sidebar Vitest cases pass on the current mount helper | `npm run test:dashboard:frontend -- dashboard/frontend-tests/sessions/sessions-sidebar-order.spec.ts dashboard/frontend-tests/sessions/sessions-sidebar-row.spec.ts --workers=2` | 2026-11-23 preparation workspace; 3 passed in 6.15 s | Settled: green before remount |
| Production `PageFrame` renders `SessionsSidebar` under `ConfiguredDashboard` with typed `pageReads` / machine answers | Structure slice 1 early probe: remount one order case through `ConfiguredDashboard` + `machineSessionsAnswering` + answering `readHostStatus`, then rerun the open-sidebar selection | Bounded by slice 1 early probe | Early probe |
| `SessionServices.openTerminal` accepts a typed `TerminalSocket` stand-in that prints, ends or disconnects on demand | Behavior slice 6 early probe: mount `Terminal` with typed `openTerminal`, drive one keyboard or prompts case without Playwright WS routes | Bounded by slice 6 early probe | Early probe |
| `InstructionTranscriptionSource` already drives launch instruction voice on Vitest | Reuse for terminal and story-note dictation (slice 8) | Delivered with SEED-413#speed-dashboard-launch-proof; `instructionTranscriptionSource.ts` and mounted instruction-voice specs present | Settled: reuse |

## Slices

Frontend spec names below are relative to `dashboard/frontend-tests/` and omit
`.spec.ts` unless otherwise specified.

### 1. Open Sessions sidebar remounts through the production page frame

Type: Structure
Status: done

Remount `sessions/sessions-sidebar-order`, `sessions/sessions-sidebar-row`,
`sessions/sessions-sidebar-state-edge`, `sessions/sessions-sidebar-host-status`,
and keep `sessions/story-card-done-disclosure` on the production entry (12).
Replace the hand-composed `SessionsSidebarOpenList` tree in
`sessions/sessions-sidebar-open-mount.ts` with the production page frame
(`ConfiguredDashboard` / `PageFrame` → `SessionsSidebar`) bound once through
`pageReadsSupplying` and answering machine / host-status reads. Early probe:
one attention-order case must keep its titles and badge through that frame
before the family moves. Preserve external order, row age, state edge and
host-status observations.

**Proof.** Focused Vitest selection for the five files stays green; the mount
helper no longer imports or creates `SessionsSidebarOpenList`; host status
reads through `SessionServices.readHostStatus` rather than a bare
`SessionsSidebarStatus` tree when the sidebar owns the figures.

**Accepted proof.** The attention-order probe passed through production
`PageFrame` and `DashboardBanner`. The five-file selection passed all
12 cases at two workers (5.154 s wall), covering order and badge changes,
row size, age, tooltip and state cues, host reads and their recovery,
and Done disclosure. Host-status samples now enter through required
`SessionServices.readHostStatus`; the failed HTTP adapter case stays
at its direct adapter boundary. The independent refactor consolidated
row selectors and repeated its four affected cases and dashboard typecheck.
The structure-only remount makes no speed claim against the 3.468 s
baseline. The detailed run and consumer evidence is in
`slice-1-return.md` and `slice-1-refactor-return.md` in the worktree's Git
evidence directory.

### 2. Card and compact session actions keep Mark Done and Delete truthful

Type: Behavior
Status: done

Move `sessions/compact-session-entry`, `sessions/compact-session-entry-cursor`,
`sessions/agent-launch-story-card-delete`,
`sessions/agent-launch-story-card-delete-problems`, and
`sessions/agent-launch-story-card-done` (10). Mount `SessionEntry` (and
`DeleteRecord` / `MarkDone` where they stand alone) over typed
`PageSessions` answers. Keep real Claude-gone mark and recent-delete host
paths in `e2e/sessions/` and backend refusal owners.

**Proof.** Compact disclosure keeps attention and terminal access. Delete
asks first; Keep and Escape delete nothing; confirming removes State unknown
or Session unavailable everywhere; Working or Needs input offers no Delete.
A refused Mark as done keeps the card entry and says so.

**Accepted implementation proof.** All ten legacy titles have mounted
Vitest replacements. The page's required machine source now supplies
typed Delete and Done requests through the existing authenticated adapters.
The stale-read case lets a second Working card prove the late reply was
applied before checking the deleted entry stayed gone. The ten-case
comparison took 7.328 s wall at two workers. An 18-file mounted consumer
selection passed all 35 cases, and three unchanged native Delete and
Done E2E cases passed in 12.827 s. No E2E cases were added. See
`slice-2-mapping.md` and `slice-2-return.md` in the worktree's Git evidence.

### 3. Terminal Mark Done refuses, holds, and follows the current session

Type: Behavior
Status: done

Move `sessions/agent-terminal-done`, `sessions/agent-terminal-done-pending`,
and `sessions/agent-terminal-done-question` (6). Mount `Terminal` over typed
`PageSessions.markDone` and the current `LaunchWithState`. Keep native Done
and ask-follows journeys in `e2e/sessions/`.

**Proof.** A refused mark keeps the panel open with a problem, as an ended
terminal does. A held or failed mark still allows Maximize and Close. A late
mark after another session replaced the panel leaves the keyboard in the new
terminal. Ask-first follows the current session reading.

**Accepted implementation proof.** Six named replacements passed in 8.016 s
wall at two workers. Cases open production Terminal through the actual
page frame with typed mark answers and socket events. Release after a
panel switch removed the first active entry while the second terminal
retained keyboard focus. Refused, ended, held, unresolved and
current-reading cases kept their own observations. The ten existing
card cases and dashboard typecheck passed. Native Done and ask-follows
E2E remain at their existing boundary. See `slice-3-mapping.md` and
`slice-3-return.md` in the worktree's Git evidence.

### 4. Final and unread reports stay readable under held or cancelled answers

Type: Behavior
Status: done

Move `sessions/final-report-touch`, `sessions/final-report-touch-divider`,
`sessions/session-unread-report-message`, and
`sessions/session-workspace-retirement-held-report` (8 runtime). Mount
`FinalReport` and `SessionAttentionMessage` over typed
`SessionServices.readFinalReport` and `PageSessions.markRead` /
`markDone`. Keep native passivity and Done rename in
`e2e/sessions/final-report-done-native.spec.ts` and related E2E.

**Proof.** An unfinished retained report stays readable by touch with choices
in reach through resize and rotation; Escape restores focus; the divider stays
after touch. Changing selection cancels a held report so its text never
appears as the next session. An unread message marks read beside its own Mark
as done without scrolling either control away.

**Accepted implementation proof.** Eight named cases passed in 7.225 s
wall at two workers, including the responsive touch and divider
observations. The held response was aborted and resolved late without
replacing the current report. Typed refusal and success drove actual
record replacement for unread messages. The 50 mounted consumer cases,
26 existing native report and session E2E cases (74.504 s), and dashboard
typecheck passed. No E2E cases were added. The now-unused legacy
final-report session wrapper was removed. See `slice-4-mapping.md` and
`slice-4-return.md` in the worktree's Git evidence.

### 5. Live listing reads keep sessions through retry, pace, history, and Cursor demand

Type: Behavior
Status: done

Move `sessions/agent-launch-sessions-unanswered`,
`sessions/session-state-pace-followed-attempt`,
`sessions/agent-launch-retained-history`,
`sessions/agent-launch-ad-hoc-sessions`, and
`sessions/cursor-runner-sessions-ui` (8). Mount listing owners over typed
machine and Cursor-runner reads that can hold, fail, retry and settle.
Keep real ad-hoc and retained-history host paths in `e2e/sessions/`.

**Proof.** A sessions read told to ask again keeps the listed sessions; a
hidden page stops waiting. Pace starts after a followed-attempt change read.
Failed retained history offers retry on reopen. Ad-hoc Taken listing, delete
and sidebar scroll-into-view stay correct. Slow Cursor answers publish under
at most one owned read; collapse or a hidden page ends or pauses that demand;
while expanded the list says it is reading and follows unreachable, restored
and running answers.

**Accepted implementation proof.** Eight named replacements passed in
6.852 s wall at two workers. Production readers followed typed answers
for retry, hidden cancellation, attempt pacing, history and Cursor
demand. Ad hoc listing preserved exact attention, deletion focus and
sidebar reveal. The 72 existing frontend cases, 13 existing native E2E
cases (21.271 s) and dashboard typecheck passed. No E2E cases were
added. The unused legacy Cursor route helpers were removed while its
native demand tracker remained. See `slice-5-mapping.md` and
`slice-5-return.md` in the worktree's Git evidence.

### 6. Terminal keyboard, prompts, and ended-input recovery stay usable

Type: Behavior
Status: planned

Move `terminals/session-terminal-keyboard`, `terminals/session-terminal-prompts`,
`terminals/terminal-prompts-recovery`, and
`terminals/agent-terminal-ended-input-recovery` (~19 runtime including
parameterized prompts). Early probe: mount `Terminal` with a typed
`SessionServices.openTerminal` `TerminalSocket` that opens, prints, ends or
refuses attachment on demand, and prove one keyboard or prompts case without
Playwright WebSocket routes before retiring those substitutes for this family.
Consolidate equivalent prompt phrases when setup and risk match. Keep real
terminal transport journeys in `e2e/terminals/`.

**Proof.** Tab remains input; dictation shortcut is described; keyboard action
access reaches dictation and quick replies; Escape restores the menu trigger.
Literal quick replies send and recover when ended. Connecting or refused
attachment refuses presets, names recovery and requires a new choice. An ended
terminal keeps the transcript with Open again feedback; Paste names Open again
and reopening sends nothing until Insert transcript.

### 7. Terminal touch select, paste, and application scroll preserve paused and live text

Type: Behavior
Status: planned

Move `terminals/agent-terminal-touch-select`,
`terminals/agent-terminal-touch-select-held`,
`terminals/agent-terminal-touch-select-screens`,
`terminals/agent-terminal-touch-select-fit`,
`terminals/agent-terminal-touch-paste-image`, and
`terminals/agent-terminal-touch-application-scroll` (~18 runtime). Reuse the
slice 6 typed `openTerminal` stand-in. Consolidate equivalent viewport and
row-count variants when setup and risk match. Keep the representative real
select journey in `e2e/terminals/agent-terminal-touch-select.spec.ts`.

**Proof.** Phone Select pauses terminal text for copy and return while later
output waits; ended or disconnected attachments keep the remaining screen;
fine-pointer desktop has no Select. Scrollback select and copy stay accurate.
Soft keyboard, rotation and app-scrolled pause keep fit. Oversized image paste
refuses; connecting paste recovers. Application wheel swipe versus no-wheel
preserves the intended scroll owner.

### 8. Terminal and story-note dictation abandon cleanly and respect limits

Type: Behavior
Status: planned

Move `terminals/session-terminal-voice`, `terminals/session-terminal-voice-touch`,
`stories/story-note-voice`, and `stories/story-note-voice-recovery` (10). Mount
terminal dictation and `StoryNotesDialog` / instruction recording over the
existing required `InstructionTranscriptionSource`. Keep real mic and provider
restart journeys in E2E.

**Proof.** Dictation sanitizes, edits and overflows with retained drafts for
edit. Touch dictation and phone action sizing stay reachable. Taken-line
story-note dictation waits for permission and transcription, permits
correction before save, and respects the character limit. Setup returns to the
same draft; permission and transcription problems keep typed text; Close stops
recording and Cancel abandons transcription; a new composer receives no late
text.

## Plan review

- **Refinement.** Not needed: eight slices follow distinct Behavior proof loops
  (sidebar remount Structure, card actions, terminal Done, reports, listing
  reads, keyboard/prompts, touch select, dictation) within the slice limit;
  typed-source premises are settled or bounded by authorized early probes in
  slices 1 and 6; no duplicated domain rule or unmapped key example remains.
- **Remaining concerns.** None identified beyond the early-probe-bounded
  remount and `openTerminal` premises above.
