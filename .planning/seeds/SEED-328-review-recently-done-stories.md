---
id: SEED-328
status: active
planted: 2026-11-12
planted_during: Terry requested review tracking for completed stories
trigger_when: selected from the top of the product backlog
scope: story
---

# SEED-328 — Mark Recently done stories as reviewed

<a id="mark-recently-done-stories-as-reviewed"></a>

### Mark Recently done stories as reviewed

**Identity:** SEED-328#mark-recently-done-stories-as-reviewed
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer scanning the Dashboard’s **Recently done** column can see which
completed stories still need review and record or clear that judgment from
the corresponding card.

#### Scope to refine

- Give every completed story its own saved review state, including stories
  with no retained session. Treat a missing review field as unreviewed.
- Make the two states distinguishable at a glance. An unreviewed card offers
  **Mark as reviewed**. A reviewed card shows a **Reviewed** indicator in its
  place and offers **Unreview** as a secondary action. The control and label
  convey the state even when a developer cannot distinguish the colors.
- Keep the review state through refresh and reload. **Unreview** clears the
  saved review state and restores **Mark as reviewed**. Both actions keep the
  story in Recently done.

#### Key examples to refine

- An older done story with no review field appears unreviewed and offers
  **Mark as reviewed**, even when it has no retained session.
- Marking one story as reviewed replaces the button with **Reviewed**. After
  reload, that story still shows **Reviewed** and another story that was
  unreviewed still offers **Mark as reviewed**.
- Using **Unreview** returns the story to its unreviewed appearance and action,
  and it remains unreviewed after reload.
