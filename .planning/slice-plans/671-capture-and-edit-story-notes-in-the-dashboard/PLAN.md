# Capture and edit story notes in the dashboard

**Identity:** SEED-348#collect-notes-for-story-follow-ups
**Source:** [Capture and edit story notes in the dashboard](../../seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups)

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

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
machine-local evidence is separate from published story facts, there is no
server database, and browser storage is disposable. Its
[one representation per responsibility](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
rule gives one note shape across the store, the wire and the page. No North
Star topic or new ADR is warranted: the story review state already set this
shape for local story evidence.

PFE findings and choices:

- **Keeping notes.** Reuse `dashboard/server/machineJsonStore.ts` with a new
  `story-notes.json` beside `story-review-states.json`, by project id and
  story identity, as `server/storyReviewStates.ts` does. Notes have no other
  source, so the store uses the existing `unreadable: "preserve"` choice
  (today only `server/ciFollowUpStore.ts`): a read answers unreadable and a
  write refuses, leaving the file. Its refusal message names CI follow-up;
  change it to name the file's own store.
- **Requests.** Change `server/projectConfigurationBoundary.ts` to route one
  more same-origin endpoint, `/__project-configuration/story-notes?id=<project>`,
  shaped like the review-state one: GET answers the project's notes by story
  identity, POST carries one change (add, edit or delete) and answers the
  same. The request names a project and an identity, never a path.
- **Page state.** Add a page/project owner modeled on
  `src/storyReviewStates.ts`: one read per project, read again at the shared
  check interval, a change shown at once from its own answer, an older answer
  never replacing a newer one. Its failed-save rule is the model for "says so
  and keeps what was shown".
- **Diff entry points.** Change the existing owners: `StoryReviewFileHeader.tsx`
  holds the file-level action beside `StoryFileFollowUp`;
  `DiffLineNumber.tsx` is the one line menu; `StoryReviewFileDiff.tsx` decides
  whether a diff has line menus (`canLineFollow`) and mounts the line's
  dialog. `IntentFileReading.tsx` renders the same header and `FileDiff`, so
  Intent → Changed tests follows without its own implementation.
- **Context.** Reuse `fileFollowUpParts` in `StoryAnchoredFollowUp.tsx` for
  the path, old path, endpoints and the Published completion or landed run
  name; a workspace comparison adds its own name. A note's context is this
  one shape whichever diff it came from. The follow-up admission that
  verifies an anchor against published history is not reused: a note is the
  developer's words about what the page showed, also for workspace trees no
  server can verify later.
- **Dictation.** Reuse `useLaunchInstruction` (`src/LaunchInstruction.tsx`),
  which already drives recording, transcription, setup and the over-limit
  transcript review for one text field in one dialog. Its two status
  sentences end “before Start”; parameterize those words. A note's text
  therefore takes the same 4,000-character bound as a session instruction.
- **Dialogs.** Reuse the native `<dialog>` pattern of `LaunchDialog.tsx` and
  the in-place confirmation of `StoryReviewStateAction.tsx` for Delete. No
  Side panel kind is added: `pageSidePanel.ts` shows one item at a time, and
  notes must not detach a terminal or remount a review.

Gap: no product concept holds developer-authored text per story. Add it as
`storyNote` (contract and schema shared by server and page), the server
store, the page owner, and one `StoryNotes` control with its dialog.

Expected edits to files near the 250-line check, with their owners:

| File | Lines | Decision |
| --- | --- | --- |
| `dashboard/src/IntentFileReading.tsx` | 244 | Not edited. The view a note was taken in reaches the composer through a context Intent provides from a smaller owner, defaulting to Review changes. |
| `dashboard/src/StoryReview.tsx` | 247 | Not edited. The review's **Notes** control goes in `StoryReviewHeading.tsx` (36). |
| `dashboard/server/machineJsonStore.ts` | 235 | One message change, no growth. |
| `dashboard/src/StoryReviewDiffLines.tsx` | 219 | Slice 5 passes the line's text through the existing menu; if it would pass 250, move the menu state (`openMenu`, `lineMenu`) to its own module in that slice, callers `StoryReviewContextGap.tsx` and `diffLineItems` unchanged in behavior. |
| `dashboard/tests/support/voicePage.ts` | 228 | Slice 8 adds note-dialog helpers in a new support module, not here. |

## Current decisions

- One dialog, `Story notes`, with a list and a composer; from a diff it opens
  on the composer and closes on saving. The mockup's in-panel notes view is
  not followed (seed UI).
- A note is `{ id, text, savedAt, editedAt?, context? }`; `context` is
  `{ view, path, oldPath?, comparison: { name, baseline, tree }, line?: {
  number, side, text } }`. `view` is “Review changes” or “Intent → Changed
  tests”. The server assigns `id` and the times.
- Note text is trimmed, non-empty, and at most 4,000 characters, checked by
  the page and the server. The reason is the reused dictation review and a
  bounded machine document, not a product limit on thinking.
- Comparison names: “Published completion”, “Landed run”, and for a workspace
  review the words its Comparison switch shows.
- An unreadable notes file is never moved aside. Cards say “The notes could
  not be read.” in place of a count, and saving says it could not be saved.
- The plan holds eight slices, the limit. If execution has to split, the
  delivered boundary is after slice 6: Notes from the review and Intent, and
  dictation, move together.
- Words: **Notes**, **Story notes**, **Add note**, **Edit note**, **Save
  note**, **Edit**, **Delete**, “The note could not be saved.”, “Note saved
  to this story.”, “Note updated.”, “Note deleted.”

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| The server keeps a story's notes by project and identity, on this machine, through a restart | 1: new `dashboard/backend-tests/review/story-notes-admission.spec.ts` (boundary server) — POST an add, GET answers it under its identity with a server-assigned id and time; `story-notes.json` under the run's home holds it; a second boundary server on the same home answers it |
| Requests name a configured project and a well-formed change; an unreadable file is preserved | 1: same spec — unconfigured project 404, no project 400, a path or unknown field, empty or over-long text, non-JSON, another method: each keeps no note; an unreadable `story-notes.json` reads as unreadable, a POST is refused, and the file's bytes are unchanged |
| Every story card offers Notes with a count; Story notes lists newest first; a general note is saved with the story alone as context; a card never reviewed | 2: new `dashboard/frontend-tests/stories/story-notes.spec.ts` (built app, new notes substitute) — a Backlog, a Taken and a Recently done card each offer **Notes**; save a general note; listed first; card count becomes 1 |
| Notes saved from the page are there after a dashboard restart | 2: new `e2e/stories/story-notes-persistence.spec.ts` — save from a card, restart the dashboard server, the card and Story notes show it |
| A change on one page shows on another at its next read | 2: `story-notes.spec.ts` — the substitute's notes change between reads; count and open list follow at the check interval |
| No text is not saved | 2: `story-notes.spec.ts` — **Save note** with blank text keeps the composer; no request recorded |
| A save that could not be kept leaves the composer with its text and says so | 3: new `e2e/stories/story-notes-failed-save.spec.ts` (read-only records directory, as `recently-done-review-state-failed-save.spec.ts`) — composer open, text intact, “The note could not be saved.”; saving again once writable saves and clears it |
| Unreadable notes are said on the page | 3: `story-notes.spec.ts` — substitute answers unreadable; the card says “The notes could not be read.” and offers no count |
| Edit changes text and keeps context; Delete asks, cancel keeps, confirm removes from list and count; failed edit or delete leaves the note as it was | 4: `story-notes.spec.ts` — edit, cancel delete, confirm delete, and a refused change each observed in the list, count and announcement; `story-notes-admission.spec.ts` gains edit and delete of a kept note and refusal of an unknown note id |
| Done story diff: file header and line menu offer Follow up and Add note; file note keeps file and comparison, no line; line note keeps number, side and line text; context shown in composer and on the saved note | 5: new `e2e/review/story-review-diff-add-note.spec.ts` on a Published completion (setup as `story-review-diff-line-follow-up.spec.ts`) — both menu items present; file note and new-side line note saved; each read back in Story notes with path, “Published completion <from> → <tree>”, line, side and text; a revealed context line and an old-side line keep their own text |
| Follow up from a line still opens its dialog | 5: `e2e/review/story-review-diff-line-follow-up.spec.ts` and `e2e/intent/intent-story-follow-up.spec.ts` stay green |
| Taken story's workspace review: line numbers gain the menu with Add note only; file header offers Add note; note keeps the workspace comparison's name and endpoints | 6: new `e2e/review/story-review-workspace-add-note.spec.ts` — a Taken story's All changes: menu holds **Add note** and no **Follow up**; saved line note read back with its context |
| A session with no story offers no Add note | 6: same spec — an ad hoc session's review has no line menu and no file **Add note** |
| A note taken while Taken is on the Done card after the workspace is removed | 6: `story-notes.spec.ts` — notes kept under an identity are listed from that identity's Recently done card with no launch record or workspace |
| Intent → Changed tests offers the same; the note says it was taken there | 7: new `e2e/intent/intent-story-add-note.spec.ts` — Add note from a line in Changed tests; saved context's view is “Intent → Changed tests” |
| Review changes and Intent offer Notes with the count; closing leaves the diff as shown and returns the keyboard | 7: `e2e/review/story-review-diff-add-note.spec.ts` — open **Notes** from the review with a file selected and context revealed; close; same file, same revealed lines, focus on **Notes**; `intent-story-add-note.spec.ts` for Intent's control |
| Dictate into the note; correct the transcript; same permission, recording, transcription and setup states | 8: new `dashboard/frontend-tests/stories/story-note-voice.spec.ts` with the transcription substitute — record, stop, transcript lands in the note text, edit, save; setup-required offers **Open OpenAI settings** and returns to the composer with its text; an over-limit transcript is reviewed, not appended |
| Session-instruction dictation unchanged | 8: `dashboard/frontend-tests/launches/session-instruction-voice-*.spec.ts` and `e2e/launches/session-instruction-voice*.spec.ts` stay green |
| Maintained words | 2: new `dashboard/STORY-NOTES.md`, linked from `dashboard/README.md` and `STORY-CARDS.md`; 3–8 extend it; 5 adds a pointer in `STORY-REVIEW-FILES.md` and `LAUNCH-FOLLOW-UP.md` where they describe the header and line menu |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Giving every story review's line numbers the menu changes which existing review and Intent proofs | Slice 6's change to `canLineFollow` | 2026-11-17, this workspace at `55da0e9c7` with the integration checkout's `node_modules` linked: scratch edit made `canLineFollow` true for every story subject in `StoryReviewFileDiff.tsx`, then `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/` → 13 passed; `… --config e2e/playwright.config.ts --reporter=list review/ intent/intent-story` → 108 passed, 1 failed: `e2e/review/story-review-diff-context.spec.ts:103` expects no button in a fully revealed gap of a workspace review and now finds the line-number controls. That assertion's promise is that no expansion control remains; slice 6 restates it on the expansion controls (`contextExpansion`). Scratch edit reverted. |
| Intent → Changed tests renders its diff through `ReviewedFileHeader` and `FileDiff` | Slices 5 and 7 | The same scratch run: the `intent/intent-story` specs ran against the widened menu, and `e2e/intent/intent-story-follow-up.spec.ts` opened a line's menu in Changed tests and passed. `IntentFileReading.tsx:176-189` mounts both components. |
| A machine store can refuse writes and keep an unreadable file | Slice 1's store | 2026-11-17, read at `55da0e9c7`: `machineJsonStore.ts` `replaceMachineJson` throws before renaming when `store.unreadable === "preserve"`, and `readMachineJson` answers `{ kind: "unreadable" }`; `ciFollowUpStore.ts:120` is its one user. The slice's backend spec observes the file's bytes unchanged, which is the settling proof; nothing later depends on it. |
| `useLaunchInstruction` needs only a text field ref and a dialog ref | Slice 8's reuse | 2026-11-17, read at `55da0e9c7`: `useLaunchInstruction(field, dialog)` takes those two refs; its other inputs are `launchInstructionLimit`, the `SettingsNavigation` context and two fixed status sentences. The claim is about the hook's parameters, which the read settles; its behavior mounted in the note dialog is slice 8's own proof. |
| A read-only records directory makes a local save fail observably | Slice 3's e2e | 2026-11-17, this workspace at `55da0e9c7`: `… --config e2e/playwright.config.ts --reporter=list stories/recently-done-review-state-failed-save` → 1 passed. It makes the records directory read-only and observes the sibling store's save fail and recover through the same `replaceMachineJson`. |

## Concerns

Slice-plan refinement was not needed: eight Behavior slices exercise one
model (a story's notes, each with optional context) through one store, one
endpoint, one page owner and one dialog; later slices add entry points and
input, not parallel representations. This review found no remaining
slice-specific concern.

Accepted interim behavior: after slice 5 a Done story's diffs offer Add note
while a Taken story's do not; slice 6 replaces that.

## Ordered slices

Each slice targets 15 active minutes.

### 1. The dashboard server keeps a story's notes
Type: Behavior
Status: planned
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

### 2. A story's card keeps general notes
Type: Behavior
Status: planned
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

### 3. Notes that cannot be saved or read are said, and none is lost
Type: Behavior
Status: planned
Proof: `e2e/stories/story-notes-failed-save.spec.ts` and the unreadable case
in `story-notes.spec.ts`; typecheck and lint.

Behavior: a save while the machine cannot write its records, or while the
dashboard is not reached → the composer stays open with its text and says
“The note could not be saved.”, and saving again once it can saves it. An
unreadable notes file → cards say the notes could not be read in place of a
count.

### 4. A saved note can be edited and deleted
Type: Behavior
Status: planned
Proof: edit and delete cases in `story-notes.spec.ts` and
`story-notes-admission.spec.ts`; typecheck and lint.

Behavior: a saved note → **Edit** opens the composer headed **Edit note**
with its text and context, and saving changes the text alone; **Delete** asks
in place, cancel keeps the note, confirm removes it from the list and the
card's count. Each is announced once, returns the keyboard to a control that
still exists, and a change that could not be kept leaves the note as it was
and says so.

### 5. A Done story's diff adds file and line notes with their context
Type: Behavior
Status: planned
Proof: `e2e/review/story-review-diff-add-note.spec.ts` (slice 5 row); consumers
`e2e/review/story-review-diff-line-follow-up.spec.ts`,
`e2e/intent/intent-story-follow-up.spec.ts` and
`dashboard/frontend-tests/review/`; typecheck and lint.

Behavior: a Done story's Published completion or landed run in Review changes
→ the file header offers **Add note** beside **Follow up**, and each line
number's menu offers both; the composer shows the story, the view, the path
(and a rename's old path), the comparison name and endpoints, and for a line
its number, side and text; the saved note shows the same context in Story
notes.

- `DiffLineNumber` gains the second menu item; the menu's open line carries
  its text from the hunk or revealed context line.
- `StoryReviewFileDiff` mounts the composer for a line; `StoryReviewFileHeader`
  for the file. Context from `fileFollowUpParts`.

### 6. Workspace reviews add notes, and sessions without a story do not
Type: Behavior
Status: planned
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

### 7. Review changes and Intent open Story notes and keep the diff as shown
Type: Behavior
Status: planned
Proof: `e2e/intent/intent-story-add-note.spec.ts` and the Notes-from-review
case in `story-review-diff-add-note.spec.ts`; consumers `e2e/intent/` specs
whose names begin `intent-story`; typecheck and lint.

Behavior: a story's Review changes and Intent → Changed tests → **Notes** with
the story's count opens Story notes; closing it leaves the comparison,
selected file, revealed lines and reading position as they were and returns
the keyboard to **Notes**. A note added from a diff in Changed tests says it
was taken in Intent → Changed tests.

- **Notes** in `StoryReviewHeading.tsx` for a story subject, and beside the
  selected story in Intent; the view context provided by Intent.

### 8. A note can be dictated
Type: Behavior
Status: planned
Proof: `dashboard/frontend-tests/stories/story-note-voice.spec.ts`; consumers
`dashboard/frontend-tests/launches/session-instruction-voice-*.spec.ts` and
`e2e/launches/session-instruction-voice*.spec.ts`; typecheck and lint.

Behavior: the note composer → **Dictate** records, transcribes and puts the
transcript in the note text for correction before **Save note**, with the
permission, recording, transcribing, problem and OpenAI-setup states a session
instruction has; a transcript that would pass the limit is reviewed instead
of appended; closing the composer cancels a recording in progress.

- Parameterize `useLaunchInstruction`'s “before Start” words; the launch
  dialog's words stay as they are.

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

## Learnings

None yet.
