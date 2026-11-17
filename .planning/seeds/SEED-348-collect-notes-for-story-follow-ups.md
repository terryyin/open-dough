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
