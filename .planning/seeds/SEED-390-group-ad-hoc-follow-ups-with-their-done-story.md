---
id: SEED-390
status: active
planted: 2026-11-16
planted_during: Request to group ad hoc follow-up sessions under their source story and link to it from Taken
trigger_when: selected from the product backlog
scope: story
---

# SEED-390 — Group ad hoc follow-ups with their Done story

<a id="group-ad-hoc-follow-ups-with-their-done-story"></a>

### Group ad hoc follow-ups with their Done story

**Identity:** SEED-390#group-ad-hoc-follow-ups-with-their-done-story
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer who starts an ad hoc follow-up from a completed story can find it
with the other follow-ups on that story's **Recently done** card and jump back
to the source story from the follow-up's entry in **Taken**.

[Follow up from Recently done](../../dashboard/LAUNCH-FOLLOW-UP.md) already
records the source story identity when the developer launches from the story
card or from a file or line in that story's review. Today the open follow-up
appears as an ad hoc entry in Taken without showing that relationship.

#### Acceptance examples

- Start two follow-ups from one Done story, including one from a file or line.
  The story's card groups both sessions together, with each session's own
  label and status. The association survives a dashboard reload.
- While a follow-up is open in **Taken**, its entry names the source story.
  Clicking that title reveals the exact Done story card in **Recently done**,
  including when it is outside the initially displayed range.
- Mark the follow-up Done. It leaves **Taken** and remains under its source
  story. An ordinary ad hoc session launched from the project remains a
  standalone session.
