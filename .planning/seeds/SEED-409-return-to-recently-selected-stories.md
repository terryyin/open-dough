---
id: SEED-409
status: active
planted: 2026-11-19
planted_during: Terry requested a selected-story indicator and history in the Dashboard banner
trigger_when: selected from the product backlog
scope: one story
---

# SEED-409 — Return to recently selected stories

<a id="return-to-recently-selected-stories"></a>

### Return to recently selected stories

**Identity:** SEED-409#return-to-recently-selected-stories

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can tell at a glance whether the Dashboard has a selected story,
return to it after scrolling away, and revisit stories they selected earlier.

#### Acceptance examples

- The banner has one icon button in its own group immediately beside
  Development and Intent. Its appearance and accessible name distinguish a
  selected story from no selection.
- Clearing the selection keeps previously selected stories in history. With no
  story selected, clicking the button opens the list. If the history is empty,
  the list says so.
- If the selected story is out of view, clicking the button brings it into view
  and leaves the list closed. Clicking again once the story is visible opens
  the list. If the selected story is already visible, the first click opens
  the list.
- Choosing a history entry selects that story and brings it into view. When the
  list reopens, that story appears once, at the top as the checked current
  selection. The previously selected story remains in history.

#### UI decisions

Use a filled bookmark when a story is selected and an outline when selection
is empty. Anchor the **Recent stories** popover to the button. Show the current
story first when present, followed by earlier selections in reverse selection
order. Show each project and story identity pair once and label each row with
its project.

Choosing a row closes the popover and keeps the current perspective. In
Development, reveal the story card. In Intent, reveal the selected story's
Intent view. Use the start of that card or view to determine whether the
selected story is in view, so a tall card can still count as visible.

Decide how long to retain history during refinement.
