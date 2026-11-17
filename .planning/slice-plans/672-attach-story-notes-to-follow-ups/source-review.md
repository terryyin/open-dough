# Source-only review

**Launch:** Fresh general-purpose reviewer (Cursor Task, agent
`7d0af8e3-d23c-4ef3-bbec-d3c8e5fc7f05`), model inherit, no conversation
inheritance. Input: only the selected story section Goal, Scope, key examples,
scope limits, UI words, and independently checkable Architecture results from
`.planning/seeds/SEED-348-collect-notes-for-story-follow-ups.md#attach-story-notes-to-follow-ups`.
No plan, product, proof, or project files.

**Unnumbered source context:** beneficiary/goal framing; outbox analogy and
set-aside alternatives; Terry’s 2026-11-17 choice against a separate **Send
again**; ADR 0008 machine-local / not published story fact framing; “Sent ≠
dealt with” as product intent beyond delivery; exclusions for choosing notes,
attaching already-sent notes, showing which session/when, agent “dealt with”
signaling, and later terminal quick replies; unbounded first-input length note;
mockup-vs-story (mockup attaches every note) temporary design reference.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Note waiting / sent state (current text). Waiting until a session confirms it received that note's current text; waiting when never delivered or when an edit has been saved since; **Sent** means received, not dealt with; saving an edit of a sent note (text changed or not) is how it is sent again. Each note is **Waiting for follow-up** then **Sent to follow-up**; new notes wait; **Story notes** shows each note's state with those exact words. Examples: both sent after confirm; edit sent → waiting; save sent unchanged → waiting; edit while starting → still waiting after confirmation of the admitted version. | slice 1 | observed: dashboard/src/storyNote.ts storyNoteIsWaiting + delivery words; StoryNoteEntry labels; story-notes.spec.ts waiting/sent; story-notes-edit.spec.ts unchanged save → waiting; story-notes-changes.spec.ts edit keeps delivered + new editedAt |
| 2 | Story card waiting count. Card shows how many notes are waiting (e.g. “2 notes waiting”) while at least one is; count goes away when none are; reads with **Notes**, not a second control. Also for Taken stories with waiting notes. | slice 1 | observed: StoryNotesControl aria-describedby waiting status; story-notes.spec.ts expectWaiting on Done and Taken cards |
| 3 | Done follow-up dialogs offer **Attach story notes** from the card, and from a file header or line-number menu in **Review changes** or **Intent → Changed tests**. Placement: below the session instruction and above **Start**; detail line gives waiting/total counts or the unavailability reason. | slice 3 |  |
| 4 | **Attach story notes** says how many are waiting out of how many the story has; checked when at least one waits; when none wait (all sent or no notes) grayed out, unavailable, and says there are no waiting notes. | slice 3 |  |
| 5 | Start with **Attach story notes** checked sends only the waiting notes as the dashboard holds them at admission (store, not page); each with text and context (line note: file, comparison, line, side, line text). In-flight edit after admission does not change what that session already got. | slice 2 | observed: followUpAdmission waitingStoryNotes; agent-launch-follow-up-notes.spec.ts waiting-only + in-flight edit resume keeps admitted text |
| 6 | Attached notes are labelled as the developer's notes, with context as what the dashboard showed when the note was taken; they come after the story's own follow-up context. | slice 2 | observed: followUpStoryNotes developerStoryNotesLabel + noteContextPreamble; notes.spec expectFollowUpInput after story context |
| 7 | Attached notes do not count toward the 4,000-character request (same as the story's follow-up context). | slice 2 | observed: notes in followUp context section; notes.spec instruction stays typed text outside 4k field |
| 8 | Once the host confirms the follow-up's first input, those attached versions become sent (including confirmation after **Start** returns). Cancelled, refused, failed, or never-confirmed first input leaves notes waiting; later confirmation for that same session marks them sent. Edit during start → after confirm of admitted version, current text still waiting. If delivery cannot be recorded because the notes store cannot be written, notes stay waiting. | slice 4 |  |
| 9 | Uncheck **Attach story notes**, or cancel the dialog: the session gets no notes, and waiting notes stay waiting. | slice 3 |  |
| 10 | Sent notes stay listed and editable, and can be deleted (still **Edit** and **Delete** after sent). | slice 1 | observed: StoryNoteEntry keeps Edit/Delete; story-notes.spec.ts expectEntryActions on sent notes |
| 11 | If the notes could not be read, the follow-up dialog says so and offers **Attach story notes** unavailable; the follow-up can still start without notes. | slice 3 |  |
| 12 | Taken story with waiting notes: card shows the waiting count; no way to send them until the story is Done (no attach to Taken open session / **Open terminal**). | slice 3 |  |
| 13 | Admitted notes are saved with the attempt's follow-up context, so a recovered start or a rebuilt first input sends the same notes. | slice 2 | observed: followUpAdmission saves notes with context; notes.spec retry keeps followUp.notes versions and context |
| 14 | **Attach story notes** choice is part of an ad hoc launch's identity like **Workspace**; repeating a start with the same choice resumes the kept start and its saved notes. | slice 2 | observed: followUpSourceKey includes notes; notes.spec notes:true vs without = two launches; repeat resumes |
