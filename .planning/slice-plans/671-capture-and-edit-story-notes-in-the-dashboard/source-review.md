# Source-only review

Reviewer: `/root/source_review`, fresh general-purpose agent, launched with
`fork_turns: none` on 2026-11-17. Actual launch/input and returned numbered
commitments are retained in this execution's conversation. The reviewer was
instructed to use only the original selected story and human amendments, read no
project files, change nothing, and derive promises independently of the plan,
implementation and proof. It confirmed no project files were read or changed.

Input: the Beneficiary, Goal, Direction, Scope, Key examples, UI, Architecture
and temporary-reference text of
[the selected story](../../seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups),
plus Terry's settled 2026-11-17 amendments: Add note in every Taken or Done
story review, Delete for a saved note, and preserved text for a line note.
The table retains all returned ids and their qualified results; source clauses
remain recoverable from that unchanged story and the verbatim conversation return.

Unnumbered reviewer context: desk and phone review during work and after
completion accumulates observations for a later follow-up. The snag-list
analogy explains separate entries and line text; rejected alternatives explain
direction. Session-instruction dictation is the baseline. Context represents
what the developer saw, not server verification. Sending/waiting, reopening a
note's diff location, retaining removed Git trees, no-story notes and sharing
with another machine/developer are deferred or excluded. The attachment story
presents attached material as notes. Written requirements override the mockup;
retain that shared mockup through SEED-347 and both SEED-348 wrap-ups, with the
last removing it after delivery and verification.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Notes are separate entries, each with its own context. | slice 2 | observed: dashboard/frontend-tests/stories/story-notes.spec.ts desktop/phone saved entries and distinct text; StoryNotesControl.tsx renders separate li keyed by server note id with story context. |
| 2 | Notes belong to the correct project and story identity. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 3 | The collection accumulates across reviews from Taken through Done. | slice 8 |  |
| 4 | Notes survive new launches. | slice 6 |  |
| 5 | Notes survive a dashboard restart; the example restarts the dashboard and reads the saved line note. | slice 8 |  |
| 6 | Notes survive the story moving from Taken to Done. | slice 6 |  |
| 7 | Notes survive workspace removal; the example reads the same note from the Recently done card. | slice 6 |  |
| 8 | Every story card offers Notes. | slice 2 | observed: story-notes.spec.ts desktop/phone Backlog, Taken and Recently done Notes assertions; StoryCard and DoneStoryCard mount the same control. |
| 9 | A card shows the current note count when notes exist; examples require one after adding the first note and an updated count after deletion. | slice 4 | observed: Real story-notes-persistence E2E first-save count1 remains green; story-notes-edit desktop/phone asserts count1 after cancel and Notes without count after confirmed delete. |
| 10 | A card’s Notes opens Story notes for that story. | slice 2 | observed: story-notes.spec.ts opens selected card and expectContext verifies its title/identity; other-story empty list assertion. |
| 11 | Review changes offers the same story Notes. | slice 7 |  |
| 12 | Intent → Changed tests offers the same story Notes. | slice 7 |  |
| 13 | Story notes lists that story’s notes. | slice 2 | observed: story-notes.spec.ts two saved texts and other-story empty list assertions. |
| 14 | Notes appear newest first. | slice 2 | observed: story-notes.spec.ts expectNotes Later observation before First observation; StoryNotesControl.tsx savedAt descending sort. |
| 15 | Each listed note shows its text. | slice 2 | observed: story-notes.spec.ts caller-supplied expected saved text lists. |
| 16 | Each saved note shows its context. | slice 7 |  |
| 17 | Story notes offers Add note for a general note. | slice 2 | observed: story-notes.spec.ts Add note opens Add note composer then saves typed general notes. |
| 18 | A general note’s context contains the story alone, with no file or line. | slice 2 | observed: story-notes.spec.ts captured POST objects contain only action, identity and text; entry context contains story title/identity. |
| 19 | A story that has never been reviewed can receive a general note through its card. | slice 2 | observed: story-notes.spec.ts Backlog readyStory with no prior review saves general notes through card. |
| 20 | Every story file diff offers Add note beside the file path: Review changes and Intent → Changed tests, Taken workspace comparisons and Done Published completion or landed run alike. Amendment: Add note is offered in every story review, Taken or Done. | slice 7 |  |
| 21 | Every story file diff offers Add note in each line-number menu, under those same views and comparison conditions, including Taken workspace comparisons and Done Published completion or landed runs. | slice 7 |  |
| 22 | Workspace-review line numbers gain a menu containing Add note. | slice 6 |  |
| 23 | Existing Follow up remains beside Add note wherever it was offered; the Done Published completion example names both the line menu and file header. | slice 7 |  |
| 24 | A reviewed session with no story offers no Add note in its diff. | slice 6 |  |
| 25 | The composer shows the note’s context before saving. | slice 5 |  |
| 26 | Note context includes the story’s identity, shown before saving and afterwards. | slice 7 |  |
| 27 | Note context includes the story’s title, shown before saving and afterwards. | slice 7 |  |
| 28 | Diff-note context includes the view in which the note was taken. | slice 7 |  |
| 29 | Diff-note context includes the file path. | slice 5 |  |
| 30 | A renamed file’s diff-note context includes its old path. | slice 5 |  |
| 31 | Diff-note context uses the comparison’s displayed name. | slice 7 |  |
| 32 | Diff-note context includes the comparison endpoints. | slice 7 |  |
| 33 | Line-note context includes the line number. | slice 5 |  |
| 34 | Line-note context includes the line’s side. | slice 5 |  |
| 35 | Line-note context preserves the line’s text as it read when noted. Amendment: a line note keeps text of its line. | slice 5 |  |
| 36 | Saved context records what the page showed when the note was made; the later Done/workspace-removed example requires the same context. | slice 7 |  |
| 37 | A note added from a file header has file and comparison context but no line. | slice 5 |  |
| 38 | The developer can type note text. | slice 2 | observed: story-notes.spec.ts fills real Note text textarea and observes saved typed text. |
| 39 | Dictation follows session-instruction permission states. | slice 8 |  |
| 40 | Dictation follows session-instruction recording states. | slice 8 |  |
| 41 | Dictation follows session-instruction transcription states. | slice 8 |  |
| 42 | Dictation follows session-instruction setup states. | slice 8 |  |
| 43 | The transcript lands in the note text and can be corrected before saving; the Taken line-note example dictates, corrects, then saves. | slice 8 |  |
| 44 | A note with no text cannot be saved. | slice 2 | observed: story-notes.spec.ts whitespace composer stays open and independently captured POST list stays empty. |
| 45 | Each saved note offers Edit. | slice 4 | observed: StoryNoteEntry renders Edit for every mapped note; story-notes-edit desktop/phone opens it by keyboard and observes populated Edit note composer. |
| 46 | Editing and saving changes the note text; the example edits a line note and saves. | slice 4 | observed: story-notes-edit captures text/id-only edit POST and observes Updated observation; real story-notes-changes HTTP case observes trimmed revised text. |
| 47 | Editing preserves the note’s context; the text changes and its context does not. | slice 4 | observed: Frontend composer/list retain view, renamed path, comparison endpoints, line number/side/text; backend compares entire original saved object except text and server editedAt. |
| 48 | Each saved note offers Delete. Amendment: a saved note offers Delete. | slice 4 | observed: StoryNoteEntry maps a Delete control per note; desktop/phone and refused-delete tests exercise it. |
| 49 | Delete asks for confirmation first. | slice 4 | observed: story-notes-edit opens inline question and captured changes remain length1 until confirm; AskInPlace prompt requires explicit Delete. |
| 50 | Cancelling deletion leaves the note. | slice 4 | observed: story-notes-edit Cancel keeps saved text/count1 and returns Delete focus. |
| 51 | Confirming deletion removes the note from the list. The card-count effect is retained in promise 9. | slice 4 | observed: story-notes-edit confirmed Delete empties list, returns Add note focus, card no count; real HTTP/GET/disk deletion retains other note. |
| 52 | A failed save leaves the composer open with its text; the unwritable-records example says the composer stays open with the text. | slice 3 | observed: e2e/stories/story-notes-failed-save.spec.ts: actual read-only HOME directory and aborted POST each leave exact draft and stored bytes unchanged; writable/reachable retry saves and next composer is empty. |
| 53 | A failed save reports that the note could not be saved. | slice 3 | observed: e2e/stories/story-notes-failed-save.spec.ts: storyNotesPage.expectProblem observes The note could not be saved. for both unwritable and unreachable triggers; successful retry clears the problem. |
| 54 | A failed edit preserves the composer or note as it was, including text. | slice 4 | observed: Refused edit case keeps Typed edit survives refusal in composer and Original text stays saved in list. |
| 55 | A failed edit reports the failure. | slice 4 | observed: Refused edit case observes The note could not be saved. in dialog alert. |
| 56 | A failed delete preserves the note as it was, including text. | slice 4 | observed: Refused delete case preserves original saved text/count1 and restores Delete focus. |
| 57 | A failed delete reports the failure. | slice 4 | observed: Refused delete case observes The note could not be deleted. then successful retry removes note. |
| 58 | Notes are kept on the machine serving the dashboard. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 59 | Every page of that dashboard, including a phone’s page, can show the notes. | slice 2 | observed: story-notes.spec.ts desktop/phone real frontend; e2e/stories/story-notes-persistence.spec.ts real phone save and desktop reread after server restart. |
| 60 | A change made on one page appears on other pages at their next read; the phone-save example requires the desktop page to list it at its next read. | slice 2 | observed: story-notes.spec.ts controlled external change at next shared check interval updates open list/count; stale read after save cannot overwrite; E2E independently proves page/server store use. |
| 61 | Story notes opens over the current activity without replacing it. | slice 7 |  |
| 62 | An attached terminal stays attached while Story notes is used. | slice 2 | observed: story-notes.spec.ts Story notes leaves an attached terminal mounted and connected: original socket prints while open, original screen remains connected, attachment count1, output and Notes focus after close. |
| 63 | A review keeps its comparison through opening and closing Story notes; closing it leaves the diff as it was shown. | slice 7 |  |
| 64 | A review keeps its selected file through opening and closing Story notes; closing it leaves the diff as it was shown. | slice 7 |  |
| 65 | A review keeps its reading position through opening and closing Story notes; closing it leaves the diff as it was shown. | slice 7 |  |
| 66 | Closing Story notes returns keyboard focus to the control that opened it. | slice 7 |  |
| 67 | The add composer is headed Add note. | slice 2 | observed: storyNotesPage.add observes Add note heading in real composer. |
| 68 | The edit composer is headed Edit note. | slice 4 | observed: storyNotesPage.edit independently observes Edit note heading and current textarea text. |
| 69 | Composer context appears above the text. | slice 7 |  |
| 70 | The composer offers Dictate. | slice 8 |  |
| 71 | The composer offers Cancel. | slice 2 | observed: story-notes.spec.ts blank composer Cancel then Add note opens clean draft; StoryNotesControl.tsx Cancel action. |
| 72 | The composer offers Save note. | slice 2 | observed: story-notes.spec.ts Save note submit produces observed POST/list/status. |
| 73 | A composer opened from a diff opens alone. | slice 5 |  |
| 74 | A composer opened from a diff closes on saving. | slice 5 |  |
| 75 | Saving is announced exactly once. | slice 2 | observed: storyNotesPage.expectSaved checks one matching status and one rendered save announcement after save. |
| 76 | Notes are stored beside the story review states. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 77 | Notes are never a published story fact. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 78 | Notes are not published into the project repository. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 79 | Notes storage uses no server database. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 80 | Durable notes do not depend on browser storage. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 81 | An unreadable notes-store file remains recoverable. | slice 1 | observed: dashboard/backend-tests/review/story-notes-admission.spec.ts: POST/GET and HOME-file assertions in notes are assigned ids and times; restarted real boundary server returns same collection; storyNotes.ts notesStore uses only machineDashboardPath and preserve; unreadable cases assert exact original bytes and no moved copy. |
| 82 | An unreadable notes store reports that notes could not be read. | slice 3 | observed: dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts: prior count1 switches at controlled next read to unreadable; Done/Taken/Backlog status and dialog alert report The notes could not be read. |
| 83 | An unreadable notes store does not present the situation as having no notes. | slice 3 | observed: same unreadable frontend case independently observes no counted Notes control after prior count1, alongside explicit read error; no zero/no-notes wording in StoryNotesControl; physical preservation reuses slice1 backend byte assertions. |
| 84 | A note records no fix or resolution. | slice 2 | observed: StoryNote strict schema and StoryNotesControl.tsx render observation text and context, no fix/resolution field or action. |
