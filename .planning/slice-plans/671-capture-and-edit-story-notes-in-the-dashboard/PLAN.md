# Capture and edit story notes in the dashboard

**Identity:** SEED-348#collect-notes-for-story-follow-ups
**Source:** [Capture and edit story notes in the dashboard](../../seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups)

**Source review:** [Independent source promises](source-review.md)

## Goal and scope

A developer reviewing a story saves notes against it — general ones, and ones
taken on a file or line of a diff that keep their own context — and edits or
deletes them later from the story's card or its review. The story section
owns the scope, scope limits and key examples; this plan adds none.

Terry's 2026-11-17 answers settle three boundaries: **Add note** is offered in
every story review, Taken or Done; a saved note offers **Delete**; a line note
keeps the text of its line.

Assumptions: notes are kept by the dashboard server on this machine; nothing
is written to a project's repository; sending notes to a session, and any
waiting or sent state, belongs to
[the attachment story](../../seeds/SEED-348-collect-notes-for-story-follow-ups.md#attach-story-notes-to-follow-ups).
Preparation authorizes no implementation.

## Existing solution and direction

See [Existing solution and direction](existing-solution.md); its decisions and evidence apply to every slice.

## Current decisions

See [current decisions](existing-solution.md#current-decisions); all remain in force.

## Proof ownership and decisive premises

See [Proof ownership and decisive premises](proof-map.md); its decisions and evidence apply to every slice.

## Concerns

Slice-plan refinement was not needed: eight Behavior slices exercise one
model (a story's notes, each with optional context) through one store, one
endpoint, one page owner and one dialog; later slices add entry points and
input, not parallel representations. This review found no remaining
slice-specific concern.

Slice 6 replaces the accepted slice-5 interim: Taken and Done story diffs
both offer Add note, with existing Follow up eligibility preserved.

## Ordered slices

Each slice targets 15 active minutes.

### 1. The dashboard server keeps a story's notes
Type: Behavior
Status: done
Proof: `dashboard/backend-tests/review/story-notes-admission.spec.ts` (rows
for slice 1); the CI follow-up store's specs in `dashboard/backend-tests/`
that name its unreadable evidence; `npm run typecheck:dashboard`;
`npm run lint`.

Behavior: a configured project → a same-origin POST adding a note for a story
identity is answered with the project's notes, that note among them with its
id and time, and a later GET, also from a restarted server, answers the same;
a malformed or misdirected request keeps no note; an unreadable notes file
is answered as unreadable, refuses a save, and is left as it was.

- `storyNote` contract and schema shared by server and page;
  `server/storyNotes.ts` store with `unreadable: "preserve"`; the endpoint in
  `projectConfigurationBoundary.ts`.
- Generalize the preserve refusal's message in `machineJsonStore.ts`.
- MakeMe data for a note (AGENTS.md).

Accepted proof: [slice 1](slice-1-proof.md).

### 2. A story's card keeps general notes
Type: Behavior
Status: done
Proof: `dashboard/frontend-tests/stories/story-notes.spec.ts` and
`e2e/stories/story-notes-persistence.spec.ts` (rows for slice 2); typecheck
and lint.

Behavior: any story card → **Notes** opens Story notes for that story; **Add
note**, typed text, **Save note** → the note is listed first with the story's
identity and title as its context, the card's **Notes** shows the count, the
save is announced, and the note is there after a dashboard restart and on
another page at its next read. Blank text is not saved.

- Page owner modeled on `storyReviewStates.ts`; `StoryNotes` control and
  dialog (list and composer) in `StoryCard.tsx`'s inspection group and
  `DoneStoryCard.tsx`'s Story actions.
- Test support: a notes substitute beside `frontendStoryReviewState.ts` and a
  Story notes page object.
- Write `dashboard/STORY-NOTES.md` and link it.

Accepted proof: [slice 2](slice-2-proof.md).

### 3. Notes that cannot be saved or read are said, and none is lost
Type: Behavior
Status: done
Proof: `e2e/stories/story-notes-failed-save.spec.ts` and the unreadable case
in `story-notes.spec.ts`; typecheck and lint.

Behavior: a save while the machine cannot write its records, or while the
dashboard is not reached → the composer stays open with its text and says
“The note could not be saved.”, and saving again once it can saves it. An
unreadable notes file → cards say the notes could not be read in place of a
count.

Accepted proof: [slice 3](slice-3-proof.md).

### 4. A saved note can be edited and deleted
Type: Behavior
Status: done
Proof: edit and delete cases in `story-notes.spec.ts` and
`story-notes-admission.spec.ts`; typecheck and lint.

Behavior: a saved note → **Edit** opens the composer headed **Edit note**
with its text and context, and saving changes the text alone; **Delete** asks
in place, cancel keeps the note, confirm removes it from the list and the
card's count. Each is announced once, returns the keyboard to a control that
still exists, and a change that could not be kept leaves the note as it was
and says so.

Accepted proof: [slice 4](slice-4-proof.md).

### 5. A Done story's diff adds file and line notes with their context
Type: Behavior
Status: done
Proof: `e2e/review/story-review-diff-add-note.spec.ts`,
`e2e/intent/intent-story-add-note.spec.ts` (Add note/view case), and a
Landed run context variant at the frontend boundary; consumers
`e2e/review/story-review-diff-line-follow-up.spec.ts`,
`e2e/intent/intent-story-follow-up.spec.ts` and
`dashboard/frontend-tests/review/`; typecheck and lint.

Behavior: a Done story's Published completion or landed run in Review changes
or Intent → Changed tests → the file header offers **Add note** beside **Follow up**, and each line
number's menu offers both; the composer shows the story, the view, the path
(and a rename's old path), the comparison name and endpoints, and for a line
its number, side and text; the saved note shows the same context in Story
notes.

- `DiffLineNumber` gains the second menu item; the menu's open line carries
  its text from the hunk or revealed context line.
- `StoryReviewFileDiff` mounts the composer for a line; `StoryReviewFileHeader`
  for the file. Context from `fileFollowUpParts`.
- Shared diff actions appear in both views immediately: provide the correct
  view from a smaller Intent owner (such as `IntentSelectionReading`), keeping
  `IntentFileReading` untouched. Capture/view proof belongs here, not slice 7.
- A successful diff save closes its composer and announces once from a
  surviving owner; preserve existing Follow up wire context without note text.

Accepted proof: [slice 5](slice-5-proof.md).

### 6. Workspace reviews add notes, and sessions without a story do not
Type: Behavior
Status: done
Proof: `e2e/review/story-review-workspace-add-note.spec.ts` and the Done-card
case in `story-notes.spec.ts`; consumers: the full
`dashboard/frontend-tests/review/` and `e2e/review/` runs named in the local
gate; typecheck and lint.

Behavior: a Taken story's workspace review → line numbers open a menu holding
**Add note** alone, and the file header offers **Add note**; the saved note
names the workspace comparison as the review's Comparison switch does, with
its endpoints. An ad hoc session's review offers neither. A note kept under a
story's identity is listed from its Recently done card when no workspace or
launch record remains.

- `canLineFollow` becomes two facts: the diff has a line menu when it reviews
  a story; the menu holds Follow up only where it does today.
- `e2e/review/story-review-diff-context.spec.ts:103` counts every button in
  a fully revealed gap; restate it on the expansion controls, the promise it
  holds, since line numbers there are now controls (premise row 1).

Accepted proof: [slice 6](slice-6-proof.md).

### 7. Review changes and Intent open Story notes and keep the diff as shown
Type: Behavior
Status: done
Proof: `e2e/intent/intent-story-add-note.spec.ts` and the Notes-from-review
case in `story-review-diff-add-note.spec.ts`; consumers `e2e/intent/` specs
whose names begin `intent-story`; typecheck and lint.

Behavior: a story's Review changes and Intent → Changed tests → **Notes** with
the story's count opens Story notes; closing it leaves the comparison,
selected file, revealed lines and reading position as they were and returns
the keyboard to **Notes**. Reuse slice 5’s already-correct diff-note view
capture and its Intent Add note observation.

- **Notes** in `StoryReviewHeading.tsx` for a story subject, and beside the
  selected story in Intent; retain the view context delivered in slice 5.

Accepted proof: [slice 7](slice-7-proof.md).

### 8. A note can be dictated
Type: Behavior
Status: done
Proof: `dashboard/frontend-tests/stories/story-note-voice*.spec.ts`; consumers
`dashboard/frontend-tests/launches/session-instruction-voice-*.spec.ts` and
`e2e/launches/session-instruction-voice*.spec.ts`; typecheck and lint.

Behavior: the note composer → **Dictate** records, transcribes and puts the
transcript in the note text for correction before **Save note**, with the
permission, recording, transcribing, problem and OpenAI-setup states a session
instruction has; a transcript that would pass the limit is reviewed instead
of appended; closing the composer cancels a recording in progress.

- Parameterize `useLaunchInstruction`'s “before Start” words; the launch
  dialog's words stay as they are.

Accepted proof: [slice 8](slice-8-proof.md).

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`, naming the config: `dashboard/frontend.playwright.config.ts`,
`dashboard/backend.playwright.config.ts` or `e2e/playwright.config.ts`. Per
[AGENTS.md](../../../AGENTS.md), keep default timeouts, never use
`test.slow()`, and apply MakeMe and page-object selection before test edits.
Each slice's named specs and consumers are its local gate. Slices 5 and 6
change diff-line markup every review spec reads, so they also run
`dashboard/frontend-tests/review/` and `e2e/review/` whole. The full suites
run in hosted CI. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`.

## Execution context

See [Execution context](execution-context.md); its decisions and evidence apply to every slice.

## Learnings

See [execution context](execution-context.md#learnings) for the retained boundary refinement.

## Story obligations

### G1. Taken workspace entry points follow Done capture
Reported: slice 5 — "Accepted interim remains: Taken workspace Add note belongs to slice 6."
Story clause: "Every file diff of a story in Review changes and Intent → Changed tests offers Add note beside the file path and in each line-number menu"
Disposition: proved by slice 6: e2e/review/story-review-workspace-add-note.spec.ts saves file and line notes from Taken with exact context; prior Published/Landed and Intent capture proof remains green; see slice-6-proof.md.
