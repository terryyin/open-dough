---
id: SEED-348
status: active
planted: 2026-11-14
---

# SEED-348 — Collect notes for story follow-ups

<a id="collect-notes-for-story-follow-ups"></a>

### Collect notes for story follow-ups

**Identity:** SEED-348#collect-notes-for-story-follow-ups
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary**

A developer who wants to collect observations while reviewing a story and use
them in a later follow-up session.

**Goal**

Keep an editable collection of notes for each story in the dashboard. A developer
can save a note on its own and see from the story card whether any notes are
still waiting to be sent to a follow-up session.

**Scope**

- Show the story's saved notes in the dashboard from its card and while reviewing
  the story. Let the developer add a general note or choose **Add note** from a
  file diff or line-number menu in **Review changes** and **Intent → Changed
  tests**, alongside [Follow up](SEED-347-follow-up-from-a-file-diff.md#start-follow-up-from-a-file-diff).
- Show the context when composing and reviewing a note. Keep the story and, for a
  diff note, the file, comparison, and selected line and diff side when
  applicable. Let the developer type or dictate into the note text box, edit the
  text before saving, and review and edit saved entries later.
- Give the story card a clear indicator whenever it has at least one unconsumed
  note. New notes are unconsumed.
- When starting a follow-up for the story, offer **Attach story notes**. Select
  it by default when the story has notes and show it grayed out and disabled
  when there are none. If selected, pass the saved notes and their context to the
  session. Mark the attached notes consumed once the session successfully starts
  with them. Keep consumed notes available for review and editing.

**Key examples**

- In **Intent → Changed tests**, choose **Add note** from a line-number menu,
  dictate a note, correct the transcript, and save. The note appears in the
  story's notes with its diff context, and the story card shows that notes are
  waiting. Add a second note from **Review changes** and review and edit either
  entry from the dashboard.
- Start a follow-up with **Attach story notes** selected. The session receives
  both notes with their context. After launch, the notes remain visible and the
  waiting indicator clears if every unconsumed note was attached. Deselecting
  the option or leaving the launch unfinished keeps those notes unconsumed.
- Open the follow-up dialog for a story with no notes. **Attach story notes**
  appears grayed out and unavailable.
