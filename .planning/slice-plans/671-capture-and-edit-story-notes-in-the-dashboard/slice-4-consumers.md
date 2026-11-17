# Slice 4 consumer dispositions

Discovery: /tmp/slice4-consumer-trace.txt, produced with:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/capture-and-edit-story-notes-in-the-dashboard --base 6eb0561760df59742f35d6fedb539db02d8e910d --term storyNoteChangeSchema --term StoryNotesDialog --term storyNoteNotDeleted --term StoryNoteContext --term frontendStoryNotes`

Changed effects: add/edit/delete POST contract; editing note text while preserving stored context/id/savedAt; list/count update after removal; edit composer and inline delete question; preserved drafts/notes and failure words; immutable context display. No external card control markup, order, className, count formula, endpoint URL or stored-note shape changed.

| Consumer purpose | Boundary / disposition | Observation |
| --- | --- | --- |
| projectConfigurationBoundary.ts calls answerStoryNotes and shares storyNotesEndpoint | run: real HTTP/store | backend story-notes-changes new case: 200 edit retains full saved object except text and editedAt; unknown id/wrong story 404, invalid changes 400 and exact unchanged bytes; delete response, subsequent GET and disk JSON keep other entry. story-notes-admission four existing cases preserve request admission, restart and unreadable behavior. |
| App.tsx owns page/project StoryNotesOnPage | run: built frontend + external substitute | story-notes.spec.ts next-read/older-read case observes open list and card count updates and a held older read cannot replace a change. |
| StoryCard.tsx / DoneStoryCard.tsx share StoryNotes control and counts | run: built frontend | story-notes.spec.ts desktop/phone cases open Backlog and Recently done, observe all three card kinds, first-save and count; story-notes-edit desktop/phone cases observe count 1 before edit, after cancel, and zero after confirm. |
| New StoryNotesDialog, StoryNoteEntry, StoryNoteContext display and interaction seams | run: built frontend | story-notes-edit desktop/phone cases assert Edit note heading, populated/focused field, view/renamed path/comparison endpoints/line number/side/text before and after editing, one status message, return to Edit / Delete after cancel / Add note after removal. Failure case independently asserts original saved note, typed draft, both failure messages, retained count and successful deletion retry. |
| frontendServiceSubstitutes.ts installs notes substitute; frontendStoryNotes handles expanded changes | run: built frontend | all eight note tests traverse the same installed substitute; explicit edit POST capture is compared in new tests; original add capture and stale reads retain existing assertions. |
| storyNotesPage shared browser mechanics | run: built frontend and real journey | all eight frontend note cases and both real notes journeys use shared page owner; expectations remain caller supplied. |
| e2e/stories/story-notes-persistence.spec.ts | run: real frontend/server/HOME | phone first save; real server restart; desktop count/context/text reread. |
| e2e/stories/story-notes-failed-save.spec.ts | run: real frontend/server/HOME | unwritable HOME and aborted POST both keep draft and disk; explicit recovery saves and clears. |
| Distribution/tests/support/makeMe.mjs and storyNoteTestData.mjs | run: typecheck and consuming scenarios | stored StoryNote type unchanged; new real backend and frontend scenarios use canonical aStoryNote with explicit line context. |
| dashboard/README.md, dashboard/STORY-CARDS.md, README.md link STORY-NOTES.md | inspected: maintained prose link destination | documentation target still exists and now explains edit/delete/failure/context; no execution behavior. |

Unambiguous exclusions:
- dashboard/tests/navigation/accessible-board-keyboard.spec.ts, accessible-board-scroll.spec.ts, dashboard/frontend-tests/review/story-review-action.spec.ts, dashboard/tests/storyCardControls.ts and storyReadinessScan.ts observe external card control placement/order/keyboard/counts. Their markup, className=start-launch-button, canonical Notes locator and external control order are untouched; changed interactions start inside Story notes. Current note suite still checks external opener and closing focus.
- dashboard/src/story-notes.css, launch-dialog.css, frame-controls.css and styles.css match retained class names. No CSS changed or existing class contract removed; actual note dialog visibility and interaction are exercised on desktop/phone by the new tests.
- Generic onClose/onChange/onEdit/onDelete, frame-input, record-identity, launch-dialog-body, savedAt and Saved notes collisions in all other production, test and journey rows do not import or call the note owners/schema. Those existing functions/styles/fields were not changed, so the note contract/wording does not reach their boundary.
- Planning, mockup, findings, execution records and skill-guidance matches are historical prose, local identity/branch text, or generic execution-context references. They do not execute or consume this runtime contract; preserve them, and omit them from a future concise plan record. The source review remains unchanged.

Commands reached terminal success:
- frontend config stories/story-notes: 8 passed (21.8s).
- backend config review/story-notes: 5 passed (3.2s).
- e2e config stories/story-notes: 2 passed (5.4s).
- npm run typecheck:dashboard: pass after the explicit-undefined context prop correction.
- git diff --check: pass after removing a trailing blank line.

No slice-4 required consumer observation is deferred to CI. Coordinator still owns formatting, hook lint, independent refactor, delivery and CI.
