# Get launch unit proof in about eight seconds

**Identity:** SEED-413#finish-launch-proof-orthogonal
**Source:** [Get launch unit proof in about eight seconds](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-launch-proof-orthogonal)

Split on 2026-11-22 from SEED-413#make-launch-proof-orthogonal (plan 768)
at its delivered Slice 6 boundary. Plan 768's mappings and paired timings
are at `265d6750b:.planning/slice-plans/768-make-launch-proof-orthogonal/PLAN.md`.

## Goal and scope

Dashboard maintainers get the local launch unit selection in about 7–8
seconds at two workers, including preparation. Distinct launch behavior
and the existing composed journeys stay covered.

Own the seven specs named in the story, the two helpers that hand-build
launches from `launchOffers`, and the whole selection's timing. Each case
mounts the smallest production owner through typed inputs. Tests never
copy a production composition. The creation entry already mounts
`CreationEntry` with a typed record, so no slice reshapes it; the
measurement includes that file. Delivered files this story does not own
stay as they are, including the `launchOffers` spread inside
`launch-refinement-options.spec.ts`. That spec still imports the two
helpers, so it must stay green when the helpers change.

Preserve browser conditions, capture and recovery races, and the existing
native, install, and backend journeys. Add no E2E case. Change
`dashboard/frontend.vitest.config.mts` (`isolate`, or the
`chromium-desktop` instance for `story-card-launch-offers.spec.ts` and
`story-card-startup.spec.ts`) only with a whole frontend group run; these
slices do not change it. If the selection cannot reach about 7–8 seconds
without losing a distinct observation, stop with the measured remainder
and its cause.

## Key examples and proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Waiting, no-waiting, and unreadable notes come from a required answer; one composed Follow-up request still sends or cancels | 1 | `follow-up-note-handoff.spec.ts`; `e2e/stories/recently-done-follow-up.spec.ts` when Attach story notes production changes |
| Progress, refusal, and the blank-versus-instructed terminal handoff come from the typed attempt | 2 | `ad-hoc-start-session.spec.ts`, `ad-hoc-start-session-answer.spec.ts`, `responsive-unattached-startup.spec.ts`; the two ad-hoc E2E journeys below when `StartSession` changes |
| Paste, refusal, cancel, and Escape stay on the dialog and attachment control | 3 | `launch-attachments.spec.ts`; `e2e/launches/agent-launch-ad-hoc-attachments.spec.ts` when attachment or dialog production changes |
| Model, effort, and option words are the launch subject's, on the entry and its details | 4 | `launch-record-details.spec.ts` |
| Story card and startup helpers no longer hand-build the machine-sessions composition | 5 | Every spec that imports `story-card-launch-page.ts` or `story-startup-page.ts` |
| The whole `dashboard/frontend-tests/launches` selection is about 7–8 s at two workers, or the measured remainder is recorded | 6 | Paired whole-selection command under similar load |

The composed journeys that stay at their current owners are
`e2e/stories/recently-done-follow-up.spec.ts`,
`e2e/terminals/agent-launch-ad-hoc-terminal.spec.ts`,
`e2e/launches/agent-launch-ad-hoc-instructed.spec.ts`, and
`e2e/launches/agent-launch-ad-hoc-attachments.spec.ts`.

## Current decisions

- Reuse the production owner that already has the meaning. Notes: export
  the choice from `AttachStoryNotes.tsx` (93 lines) with a required
  answer; the existing reading wrapper keeps `useStoryNotes` and renders
  it. Startup: `AdHocLaunches` on `StartSession` and `ProjectActions`.
  Attachments: `LaunchAttachmentControls` and `LaunchDialog`. Records:
  `launchSubject` as `SessionDetails`, `SessionEntry`, and
  `SessionsSidebarSessionEntry` already render it. Composition: one
  production function that returns the launches object `useAgentLaunches`
  already builds, used by that hook and by the two helpers.
- Do not add a second notes model, a startup-answer component, or a
  test-side copy of `launchOffers(...)` plus inert attempt stubs.
- `StartSession.tsx` and `SessionEntry.tsx` are 250 lines. Add no lines
  to either. `agentLaunches.ts` is 245 and `StoryCardLaunches.tsx` is
  244. The new mapping lives in its own module so those files stay at or
  under 250; `agentLaunches.ts` replaces its inline launches fields with
  a call. `StoryCard.tsx` is 222 and may gain that call only while it
  stays at or under 250. `LaunchDialog.tsx` is 227; an attachment edit
  that would pass 250 extracts the instruction field in slice 3.
- `ad-hoc-creation-entry.spec.ts` stays on `CreationEntry`.
- Slice 6 may delete a helper whose last consumer left in slices 1–5.
  It does not start another reshape, and it does not drop an observation
  to chase the time.

## Decisive premises observed

Commands use
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i`
on AC power. Checkout `ab58cede` (preparation announcement; these specs
and owners are the trunk versions). Machine load at the start of the
session was 57.38, so these runs settle behavior and do not settle the
eight-second baseline.

| Premise | Observation | Result |
| --- | --- | --- |
| The attach choice's waiting, no-waiting, and unreadable states are the notes answer `AttachStoryNotes` computes, and Start still sends with or without notes | 22 Nov 2026 17:26 +08. `npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts --workers=2` | 4 passed, 9.20 s wall. Waiting checks "1 waiting of 2 notes" and Start sends `notes: true`; no-waiting and unreadable disable Attach and Start sends without notes; the Taken card shows "1 note waiting". The choice is still private and reads `useStoryNotes` (`dashboard/src/AttachStoryNotes.tsx`). |
| The six other owned specs pass on their current mounts: Start session and the project-actions row take `AdHocLaunches`; the responsive spec still spreads `launchOffers`; creation mounts `CreationEntry`; attachments mount `StartSession`; record details mount the board | 22 Nov 2026 17:27 +08. Same command for `ad-hoc-start-session.spec.ts`, `ad-hoc-start-session-answer.spec.ts`, `responsive-unattached-startup.spec.ts`, `ad-hoc-creation-entry.spec.ts`, `launch-attachments.spec.ts`, and `launch-record-details.spec.ts` | 15 passed, 6 files, 7.46 s wall. Progress and refusal stay beside the direction; a blank start presents the terminal and an instructed start leaves it closed; paste, refusal, Cancel, and Escape behave as the spec names; both record-detail cases pass through the board mount. |
| The whole selection's wall time under comparable load | Not run here. Retained from plan 768 at `840788d00`, load 13 → 16: the 17 reshaped files took 21.40 s and 21.68 s, already above the target for a subset. Reopened because `ed26bbd04` changed page reads the launch specs use. Slice 6 takes the fresh paired baseline. | Open, bounded by slice 6. |

## Slices

### 1. Note attachment takes a required notes answer

Type: Behavior
Status: planned

Export the attach choice from `AttachStoryNotes.tsx` with a required notes
answer. The reading wrapper keeps `useStoryNotes` and renders that choice.
`StartSession.tsx` gains no lines. The waiting, no-waiting, and unreadable
cases mount the choice with a typed answer. One composed Start session
Follow-up case still sends the selected choice and Cancel sends nothing.
The Taken-card case stays on `mountStoryStartup` until slice 5.

Behavior: a follow-up whose notes answer has waiting notes offers Attach
checked, with the waiting count; an answer with none waiting, or an
unreadable answer, disables Attach and Start still sends without notes.

Proof: `follow-up-note-handoff.spec.ts` passes with a mapping of the four
cases. When the production choice changes, `e2e/stories/recently-done-follow-up.spec.ts`
passes. Run `npm run typecheck:dashboard` after the production edit.

### 2. Unattached startup shows its typed attempt

Type: Behavior
Status: planned

`ad-hoc-start-session` and `ad-hoc-start-session-answer` stay on
`StartSession` and `ProjectActions` with `AdHocLaunches`. The progress
paragraph and `LaunchProblemAnswer` stay inside `StartSession`; add no
lines there and add no answer component.
`responsive-unattached-startup` stops spreading `launchOffers`. It passes
the four `AdHocLaunches` methods the attempt hook and the policy offer
already provide, and keeps the blank-start terminal and the instructed
start that leaves the terminal closed.

Behavior: a typed starting attempt shows the progress sentence and disables
Start; a refusal keeps its room beside the direction; a blank keyboard
start presents the terminal without taking the other task's focus; an
instructed start leaves the terminal closed.

Proof: the three specs pass. When `StartSession` changes,
`e2e/terminals/agent-launch-ad-hoc-terminal.spec.ts` and
`e2e/launches/agent-launch-ad-hoc-instructed.spec.ts` pass.

### 3. Image paste and refusal run on the dialog and attachment control

Type: Behavior
Status: planned

Move the four `launch-attachments` cases off `StartSession` onto
`LaunchAttachmentControls` and `LaunchDialog`, which already own the
image list and the instruction. Paste inserts text and attaches nothing.
Refused images explain why and leave the accepted images. Cancel and
Escape upload nothing and open an empty draft next time. Add no lines
that would push `LaunchDialog.tsx` past 250; extract the instruction
field in this slice if an edit would.

Behavior: the same four results, observed on those owners.

Proof: `launch-attachments.spec.ts` passes, and the retired `StartSession`
mount is named against these cases. When attachment or dialog production
changes, `e2e/launches/agent-launch-ad-hoc-attachments.spec.ts` passes.

### 4. Recorded model, effort, and options render from the launch subject

Type: Behavior
Status: planned

Stop mounting the board. `launchSubject` already spells the model, effort,
and option words. `SessionDetails` renders all of them; `SessionEntry` and
`SessionsSidebarSessionEntry` render the model label. Mount those owners
with typed records. Add no lines to `SessionEntry.tsx` (250). The four
recorded combinations and the effort-only-when-recorded result stay
distinct. Before dropping the board mount, these component cases are the
retained observations of the same words.

Behavior: a recorded refinement shows its requested model and options on
the details, and the model label on the card entry and the sidebar entry;
effort appears only when the record has it.

Proof: `launch-record-details.spec.ts` passes with that mapping.

### 5. Story card and startup helpers use one production mapping

Type: Behavior
Status: planned

Replace the hand-built `launchOffers` spread and inert
`attemptOf` / `storyStartupOf` / `keptStartOf` stubs in
`story-card-launch-page.ts` and `story-startup-page.ts` with a call to
the production function that builds that launches object. The same call
replaces any `launchOffers` spread still in `follow-up-note-handoff.spec.ts`
or `responsive-unattached-startup.spec.ts`. The function lives in a new
module. `useAgentLaunches` calls it, and `agentLaunches.ts` stays at or
under 250 lines. Helper signatures stay, so callers keep their cases.
`launch-refinement-options.spec.ts` is not reshaped; it must still pass.

Behavior: story card launches and startup recovery present the same
offers, attempts, and startup status, and the specs mount them through
that production function rather than a copied composition.

Proof: `story-card-launch-offers.spec.ts`, `story-card-launch-dialogs.spec.ts`,
`story-card-startup.spec.ts`, `responsive-story-startup.spec.ts`,
`startup-recovery.spec.ts`, `startup-recovery-reads.spec.ts`,
`launch-model-effort.spec.ts`, `launch-refinement-options.spec.ts`,
`follow-up-note-handoff.spec.ts`, and `responsive-unattached-startup.spec.ts`
pass. Run `npm run typecheck:dashboard`.

### 6. The whole launch selection is measured against about eight seconds

Type: Behavior
Status: planned

This slice settles the open timing premise. On AC power, under a load
comparable to plan 768's load 13–16, run the whole
`dashboard/frontend-tests/launches` selection twice at two workers and
record wall time including preparation, counts by file, and the slow
cases that remain. Compare with a paired run of the selection at the
story's starting revision, or with plan 768's retained subset pair when
that revision's files are the starting selection. Delete a page helper
only when slices 1–5 left it with no consumer. Do not change the shared
runner. Do not drop a distinct observation. If the paired wall time is
not about 7–8 seconds, stop with the measured remainder, the slow cases,
and the cause.

Behavior: the maintainer can read the paired whole-selection time, and
either it is about 7–8 seconds or the stop names what is left and why a
further cut would lose an observation.

Proof: the paired command output and the case map.

## Concern evidence

Slice-plan refinement was not needed. The six slices each have one proof
loop, they apply one rule (mount the production owner with the typed
facts it already uses), and none repeats the seven-file lump that missed
the active-time limit. This review found no remaining slice-specific
concern. The open timing premise is slice 6's measurement, and the
story's stop is that slice's result when the target is missed.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md). Keep
  default timeouts and omit `test.slow()`.
- Run launch proof with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- <paths> --workers=2`
  on AC power under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run `npm run typecheck:dashboard` after a production edit. Run the whole
  frontend group only if a slice changes shared runner configuration.

## Story obligations

### G5. Launch helpers copy the MachineSessions composition (first reported in plan 768 slice 5)

Reported: slice 1 — "story-card-launch-page.ts hand-builds the whole launches composite with launchOffers and inert attemptOf/storyStartupOf/keptStartOf stubs; no production owner takes those cases without copying the composition."
Story clause: "tests never copy a production composition"
Disposition: receiving slice 5
