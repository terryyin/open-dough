---
id: SEED-348
status: active
planted: 2026-11-14
---

# SEED-348 — Collect notes for story follow-ups

## Why this matters

Developers reviewing a story need to capture observations as they find them,
accumulate them across reviews, and bring them into a later follow-up. A scratchpad
and manual paste can hold the text, but leave the developer to reconstruct each
diff context and remember which notes made it into a session.

## Order

First make the story's notes useful during review. Then let a follow-up receive
the accumulated notes and show which observations are still waiting. Deferring
attachment leaves a usable notes collection with its source context intact.
Capture has a broader UI scope across the card, the two review views and
dictation. Attachment has fewer UI entry points and more uncertainty around
session startup and edits made while a launch is in progress.

<a id="collect-notes-for-story-follow-ups"></a>

### Capture and edit story notes in the dashboard

**Identity:** SEED-348#collect-notes-for-story-follow-ups
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4ecd706eea92b02961b89f0169f8c2c4b6e67f4b42c6a0365ff7ea4393fbbf75","plan":"00b802d07ec329786b97830d3b6d5e863b675ba8b034ff4b2e2b8d07b9c937f0"}}
```

**Beneficiary**

A developer who reviews a story's changes in the dashboard, at a desk or on a
phone, while it is being worked on and after it is done, and wants to save
observations as they find them and revise them later.

**Goal**

Keep an editable collection of notes for each story in the dashboard. A
developer saves a general note, or a note taken on a file or line of a diff
that still says what it was about when read later away from that diff. The
collection accumulates across reviews of the story, from Taken through Done,
so that a later follow-up can start from it.

**Direction**

Notes are separate entries, each with its own context, as the mockup shows.
Considered and set aside: starting a follow-up per observation, which exists
for Done stories and accumulates nothing; one persistent follow-up draft per
story, which is smaller but leaves context as editable text and gives the
attachment story no entry to mark waiting or sent; and notes published in the
project's repository or kept in browser storage (see Architecture). An
inspector's snag list is the borrowed mechanism: each item is written on the
walk-through with its own location and description, so it stands alone when
handed over later. That is why a line note keeps the line's text. The analogy
stops at resolution: a snag is closed when fixed, and a note here records no
fix.

**Scope**

Required behavior:

- A story's notes belong to the story, by project and story identity. They
  stay through new launches, a dashboard restart, the story moving from Taken
  to Done, and its workspace being removed.
- Every story card offers **Notes**, with the count when the story has notes.
  It opens **Story notes** for that story. A story's **Review changes** and
  **Intent → Changed tests** offer the same **Notes**, and closing it leaves
  the diff as it was shown.
- **Story notes** lists the story's notes, newest first, each with its text
  and context, and offers **Add note** for a general note with no file or
  line.
- Every file diff of a story in **Review changes** and **Intent → Changed
  tests** offers **Add note** beside the file path and in each line-number
  menu, for a Taken story's workspace comparisons and a Done story's Published
  completion or landed run alike. Where **Follow up** is offered today it
  stays beside **Add note**. A workspace review's line numbers gain the menu,
  holding **Add note**.
- The composer shows the note's context before saving, and each saved note
  shows it afterwards: the story's identity and title; for a diff note, the
  view it was taken in, the file path with a rename's old path, and the
  comparison as that diff names it with its endpoints; for a line note also
  the line number, its side, and the text of that line as it read.
- The developer types or dictates into the note text. Dictation works as it
  does for a session instruction, with the same permission, recording,
  transcription and setup states, and the transcript lands in the text to
  correct before saving. A note with no text is not saved.
- Each saved note offers **Edit** and **Delete**. Editing changes the text and
  keeps the context. Delete asks first, and cancelling leaves the note.
- A save, edit or delete that could not be kept leaves the composer or note
  as it was, text included, and says so.
- Notes are kept on the machine serving the dashboard. Every page of that
  dashboard, a phone's included, shows them, and a change made on one page
  shows on the others at their next read.

Scope limits:

- Sending notes to a session and showing which are waiting belong to
  [Attach story notes to follow-ups](#attach-story-notes-to-follow-ups).
- Opening a note's file and line in the diff from **Story notes**.
- Keeping a noted comparison readable in Git after its trees are gone. The
  note's own context stands in for it.
- Notes for a session that has no story.
- Sharing notes with another machine or developer.

**Key examples**

- A Taken story's **Review changes** shows its workspace. Choose **Add note**
  from a new line's number, dictate, correct the transcript, and save.
  Restart the dashboard and open **Notes** on the story's card. The note
  reads with its file, comparison, line number, side and the line's text.
- The story is later Done and its workspace removed. **Notes** on its
  Recently done card still lists that note with the same context.
- A Done story's Published completion in **Intent → Changed tests**: a
  line-number menu offers **Follow up** and **Add note**, and so does the file
  header. A note added from the file header keeps the file and comparison and
  no line.
- Open **Notes** on a card whose story has never been reviewed and save a
  general note. It is listed with the story alone as its context, and the
  card shows a count of one.
- Edit a line note's text and save. The text changes and its context does
  not. Choose **Delete** and cancel, and the note stays. Confirm, and it
  leaves the list and the card's count.
- Save a note while the dashboard cannot write its records. The composer
  stays open with the text and says the note could not be saved.
- Save a note from a phone. The same dashboard's page on a desktop lists it
  at its next read.
- A session that has no story is reviewed. Its diff offers no **Add note**.

**UI**

**Story notes** opens over what the developer was doing and replaces none of
it: a terminal stays attached, and a review keeps its comparison, selected
file and reading position. Closing it returns the keyboard to the control
that opened it. The composer is headed **Add note** or **Edit note**, with
the context above the text, **Dictate**, **Cancel** and **Save note**; from a
diff it opens alone and closes on saving. Saving is announced once. The
mockup instead swaps the review's diff for the notes; the behavior above
decides.

**Architecture**

The dashboard server gains developer-authored content with no other home.
Under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
notes are machine-local evidence kept beside the story review states, never a
published story fact, with no server database, and browser storage is
disposable. Publishing notes to the repository would make the dashboard an
author of the project's records, against that decision's "observe workflow
outcomes without owning them". The existing machine stores move an unreadable
file aside and start empty. Notes cannot be rebuilt from another source, so
the notes store has to keep an unreadable file recoverable and say that notes
could not be read instead of showing none. A note's context is what the page
showed the developer, saved as the developer's own words are. It is not a
record the server verified, and the attachment story has to present it to a
session as notes.

**Temporary design reference.** See the [file follow-up and story notes mockup](../mockups/story-review-and-notes.html)
for **Add note**, the note composer, and **Story notes**. It shows a Done
story and predates **Delete**, the line's text, and notes in workspace
reviews; this section decides those. Keep the shared
mockup through the wrap-up of SEED-347 and both SEED-348 stories. The last
story to wrap up removes it after the behavior is delivered and verified.

<a id="attach-story-notes-to-follow-ups"></a>

### Attach story notes to follow-ups and show which are waiting

**Identity:** SEED-348#attach-story-notes-to-follow-ups
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-348#attach-story-notes-to-follow-ups","dependencies":[{"supplier":{"identity":"SEED-348#collect-notes-for-story-follow-ups","href":"seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups"},"implementation":"The capture story delivers saved, editable story notes that retain their source context. The attachment story delivers the follow-up handoff and waiting state.","rationale":"The follow-up behavior needs the actual notes a developer saved and edited. A parallel or temporary capture workflow would repeat the capture story and would not prove that the follow-up receives those same entries.","condition":"The dashboard can save and reopen a story's notes with their source context, and edits to those entries are retained.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary**

A developer who wants a follow-up agent to receive accumulated observations
and wants to see from the story card which notes are still waiting to be sent.

**Goal**

Start a follow-up with the story's saved notes and their context. Make it clear
which notes have reached a session and which are still waiting.

**Scope**

- Show a clear waiting indicator on the story card while at least one note is
  unconsumed. Show each entry's status in **Story notes**. New notes are waiting.
- Offer **Attach story notes** in the story's follow-up dialog, including
  follow-ups opened from a file header or line-number menu. Check it by default
  if notes exist. Show it grayed out and disabled when there are none.
- Pass the saved notes and their context to the session when attachment is
  selected. Mark the attached versions consumed once the session successfully
  starts with them. Keep sent notes visible and editable. The mockup shows a
  changed note returning to the waiting state so its new text can reach a
  follow-up.

**Key examples**

- A story has two waiting notes. Start a follow-up with **Attach story notes**
  checked. The session receives both notes with their context, the card's
  waiting indicator clears, and both notes remain available to review and edit.
- Deselect **Attach story notes**, cancel, or have the launch fail. The notes
  remain waiting. Editing a previously sent note puts the revised note back
  in the waiting state.
- Open the follow-up dialog for a story with no notes. **Attach story notes**
  appears grayed out and unavailable.

**Temporary design reference.** See the [file follow-up and story notes mockup](../mockups/story-review-and-notes.html)
for the waiting indicator and attachment states. During wrap-up, delete the
mockup and any remaining planning links to it once SEED-347 and both SEED-348
stories have delivered and verified their behavior. If either other story is
still active, keep it for that story's wrap-up.
