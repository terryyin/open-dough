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

## Baseline and remaining work

The dashboard keeps editable story notes with their captured context; see the
[maintained Story notes behavior](../../dashboard/STORY-NOTES.md). The remaining
story attaches accumulated notes to follow-ups and shows which are waiting.

**Shared temporary design reference.** The
[file follow-up and story notes mockup](../mockups/story-review-and-notes.html)
predates the current capture behavior. Keep it through the wrap-up of SEED-347
and the remaining SEED-348 attachment story. The last story to wrap up removes
it after the behavior is delivered and verified.

<a id="attach-story-notes-to-follow-ups"></a>

### Attach story notes to follow-ups and show which are waiting

**Identity:** SEED-348#attach-story-notes-to-follow-ups
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-348#attach-story-notes-to-follow-ups","dependencies":[{"supplier":{"identity":"SEED-348#collect-notes-for-story-follow-ups","href":"seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups"},"implementation":"The capture story delivers saved, editable story notes that retain their source context. The attachment story delivers the follow-up handoff and waiting state.","rationale":"The follow-up behavior needs the actual notes a developer saved and edited. A parallel or temporary capture workflow would repeat the capture story and would not prove that the follow-up receives those same entries.","condition":"The dashboard can save and reopen a story's notes with their source context, and edits to those entries are retained.","state":"satisfied","resolution":{"revision":"0ffc99063d4fd28cd17e1befbb66ac4e72421a3d","path":".planning/seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups","summary":"Plan 671 completed all eight slices. Notes are kept per project and story in the machine store dashboard/server/storyNotes.ts (story-notes.json, unreadable file preserved), with the note shape { id, text, savedAt, editedAt?, context? }. Story notes saves, lists, edits and deletes them, and file and line notes keep their view, paths, comparison and line facts. Proof: frontend-tests/stories/story-notes*.spec.ts, backend-tests/review/story-notes-admission.spec.ts and e2e/review/story-review-diff-add-note.spec.ts; dashboard/STORY-NOTES.md maintains the behavior. Verified on 2026-11-17 against the integrated code at 15d8849c3.\nCondition satisfied: The dashboard can save and reopen a story's notes with their source context, and edits to those entries are retained.\nAccepted integration: 0ffc99063d4fd28cd17e1befbb66ac4e72421a3d on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/672-attach-story-notes-to-follow-ups/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9c1efb41bbd91a16a2db0ae9ebc275ac4a738c80dc8491b952bd9302353f8324","plan":"337e09dda72e15b0c6b66d747d909eada61f338874202f494780dc18fcbe6e93"}}
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
has never been delivered, or when an edit has been saved since it was. Only
waiting notes are attached, so **waiting** means exactly what the next
follow-up will get.

**Sent** says a session received the note, not that it dealt with it. A
session can stop early or handle only some of its notes. Saving an edit of a
sent note, with or without a change to its text, is how the developer sends it
again. Terry chose this on 2026-11-17 over a separate **Send again** action,
which would add a control to this story.

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
  once an edit of it is saved, whether or not the text changed. **Story notes**
  shows each note's state. A story
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
  Done follow-up attaches them. This could later join terminal quick replies.
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
- A follow-up received a note and ended without dealing with it. Open **Edit**
  on that sent note and save it unchanged. It shows **Waiting for follow-up**,
  and the next follow-up attaches it.
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
