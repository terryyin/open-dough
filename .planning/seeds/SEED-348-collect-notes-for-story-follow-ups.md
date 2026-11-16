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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4ecd706eea92b02961b89f0169f8c2c4b6e67f4b42c6a0365ff7ea4393fbbf75","plan":"0a550ee4d9cc93bbba06b23f2e28ab5b7a05b67b4f55950bfdd8cadec21447ae"}}
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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/672-attach-story-notes-to-follow-ups/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"22cb24d27c396346700de2890e0a81da3c7dcc1eef231e64d18c049524404d46","plan":"0ec9dfafe222a2d4b0b29acd770d7f774205c5c4bcfc424d1e5424020c54813d"}}
```

**Beneficiary**

A developer who has noted observations on a story while reviewing it and starts
a follow-up session for that Done story. They want the session to get the notes
it has not had yet, and want to see from the card and **Story notes** which
notes are still waiting.

**Goal**

Let a Done story's follow-up start with the story's waiting notes and their
context, and show for each story which notes have reached a session and which
are still waiting. The developer no longer copies notes into the request or has
to remember which ones they already sent.

**Direction**

A note is waiting until a session confirms it received that note's current
text. The dashboard records which version of each note was delivered, at the
moment the host confirms the follow-up's first input. A note is waiting when it
has never been delivered, or when it has been edited since it was. Only waiting
notes are attached, so **waiting** means exactly what the next follow-up will
get.

Considered and set aside:

- Marking notes sent when **Start** is accepted. A launch that fails or never
  takes its first input would mark notes it never delivered.
- Working out sent notes from the launch records that carried them. Deleting or
  pruning those records would put delivered notes back into waiting.
- Sending every note on each follow-up, as the mockup does. A new session would
  get observations an earlier follow-up already received, and **waiting** would
  only describe the list instead of the next send.
- Deleting notes once they are sent. The story keeps sent notes visible and
  editable.

The borrowed mechanism is an email client's outbox. A message stays in the
outbox until the receiving server accepts it, and a failed send leaves it
there. Here the host confirming the first input plays the part of the server's
acceptance. The analogy stops at the sent copy: a sent email cannot be changed,
but a sent note stays editable, and editing it puts it back in the outbox.

**Scope**

Required behavior:

- Each note is **Waiting for follow-up** until a session receives its current
  text, then **Sent to follow-up**. New notes are waiting, and so is a sent note
  after its text is edited. **Story notes** shows each note's state. A story
  card shows how many of its notes are waiting, for example “2 notes waiting”,
  while at least one is; the count goes away when none are.
- Every follow-up dialog for a Done story offers **Attach story notes**: the
  one from its card, and the ones from a file header or line-number menu in
  **Review changes** or **Intent → Changed tests**. It says how many notes are
  waiting out of how many the story has. It is checked when at least one note
  is waiting. When none are, it shows grayed out and unavailable, and says
  there are no waiting notes.
- Starting a follow-up with **Attach story notes** checked sends the waiting
  notes to the new session, as the dashboard holds them when the start is
  admitted. Each note goes with its text and context. They are labelled as the
  developer's notes, and their context as what the dashboard showed when the
  note was taken. The notes come after the story's own follow-up context and,
  like it, do not count toward the 4,000-character request.
- Once the host confirms the follow-up's first input, those versions of the
  notes become sent. This includes a confirmation that arrives after **Start**
  returns. A start that is cancelled, refused or fails, or whose first input
  is never confirmed, leaves its notes waiting.
- Sent notes stay listed and editable, and can be deleted.
- If the notes could not be read, the follow-up dialog says so and offers
  **Attach story notes** unavailable. The follow-up can still start without
  notes.

Scope limits:

- Sending notes to a Taken story's open session, or to any session that
  offers **Open terminal** instead of **Follow up**. These notes wait until a
  Done follow-up attaches them. This could later join
  [terminal quick replies](SEED-392-separate-dashboard-terminal-dictation-from-quick-replies.md).
- Choosing which notes to attach, or attaching notes that were already sent.
- Showing which session a note was sent to, or when.
- Telling the agent which notes it has dealt with. **Sent** means only that
  the note was delivered.

**Key examples**

- A Done story has two waiting notes, one general and one on a line. Open
  **Follow up** from its card. **Attach story notes** is checked and says 2
  waiting out of 2. Start with nothing typed. The session's first input holds
  both notes, the line note with its file, comparison, line, side and line
  text. Once the first input is confirmed, the card no longer shows notes
  waiting, and **Story notes** shows both as **Sent to follow-up**, still with
  **Edit** and **Delete**.
- Edit one of those sent notes. It shows **Waiting for follow-up** again and
  the card says “1 note waiting”. A follow-up from a file header attaches only
  that note, with its new text.
- Uncheck **Attach story notes**, or cancel the dialog. The session gets no
  notes, and both notes stay waiting.
- Start a follow-up with notes attached, and the start is refused or its first
  input stays unconfirmed. The notes stay waiting. When a later confirmation
  arrives for that same session, they become sent.
- Edit a note while its follow-up is starting. The session gets the text that
  was admitted. After confirmation the note is still waiting, because its
  current text has not been delivered.
- A story whose notes have all been sent, and a story with no notes: in both,
  **Attach story notes** is grayed out and unavailable.
- A Taken story with waiting notes: its card says how many are waiting, and
  it offers no way to send them until the story is Done.

**UI**

**Attach story notes** sits in the follow-up dialog below the session
instruction and above **Start**. Its line of detail gives the waiting and total
counts, or the reason it is unavailable. The card's waiting count reads with
its **Notes** control and is not a second control. A note's state is shown with
the note in **Story notes**. Its words are **Waiting for follow-up** and **Sent
to follow-up**, as in the mockup.

**Architecture**

Under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
delivery is machine-local evidence about a machine-local note, and it is kept
in the story notes store next to the notes. Neither is a published story fact.
This story adds three responsibilities:

- Follow-up admission resolves the waiting notes from that store; it does not
  take note text from the page. This matches the existing rule that refuses
  context text from a page.
- The admitted notes are saved with the attempt's follow-up context, so a
  recovered start or a rebuilt first input sends the same notes.
- When a launch's first input is confirmed, delivery is recorded for each
  attached note's version.

The **Attach story notes** choice is part of an ad hoc launch's identity,
like **Workspace**. Repeating a start with the same choice resumes the kept
start and its saved notes. If delivery cannot be recorded because the notes
store cannot be written, the notes stay waiting even though the session got
them. Showing a note as waiting too long is the safe mistake; showing one as
sent when it was not is not. Attaching many notes lengthens the first input
without bound. That length is not new: the follow-up context already carries
every retained session's completion report.

**Temporary design reference.** See the [file follow-up and story notes mockup](../mockups/story-review-and-notes.html)
for the waiting indicator and attachment states. The mockup attaches every
note; this section decides that only waiting notes are attached. During
wrap-up, delete the mockup and any remaining planning links to it once
SEED-347 and both SEED-348 stories have delivered and verified their behavior.
If either other story is still active, keep it for that story's wrap-up.
