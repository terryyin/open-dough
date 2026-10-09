---
id: SEED-127
status: active
planted: 2026-10-09
planted_during: Terry's request that the opened near-future direction use the row's full width
trigger_when: A developer opens the dashboard's near-future direction and its text is squeezed beside Start session
scope: story
---

# SEED-127: The opened near-future direction reads across the full width

## Why This Matters

On the dashboard's project actions row, the near-future direction disclosure
shares the row with Start session and its help. When a developer opens the
direction, its text opens inside the direction's own column, beside Start
session, so a several-sentence direction wraps into a narrow, tall block that
is harder to read than the room on the page allows.

## Story

<a id="full-width-near-future-direction"></a>

### Read the opened near-future direction across the full width beneath the project actions

**Identity:** SEED-127#full-width-near-future-direction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Beneficiary:** A developer reading the selected project's near-future
direction on the Open Dough dashboard, typically to decide what to start next
from the project actions row.

**Goal:** When the developer toggles the near-future direction open, its text
appears beneath both the Near-future direction heading and Start session,
spanning the full width of the project actions row, while the heading and
Start session stay on their row in place. A several-sentence direction then
reads in a few wide lines instead of a narrow, tall block, and closing it
returns the row to its closed layout.

**Scope:**

- The opened panel (the recorded direction, or "No near-future direction is
  recorded.") starts below everything on the project actions row, including
  Start session, the preparation help, and a launch problem shown beside
  Start session, and spans the row from its left edge to its right edge. The
  panel's current 60rem cap on the direction's column does not limit it.
- Opening and closing changes nothing on the row itself: the heading, its
  chevron, Start session, the help, and any launch answer keep their places
  and sizes.
- The direction keeps its disclosure behavior: it opens and closes by pointer
  and by Enter or Space with focus staying on the heading's toggle, starts
  closed for each project, keeps the developer's choice through same-project
  refresh, and exposes its text as the expanded content of that toggle under
  the Near-future direction name, with line breaks preserved and the text
  read as text.
- Deferred: any limit on line length inside the panel, and any change to the
  row's arrangement at narrow widths.

**Key examples / evaluation:**

- With the direction closed, the project actions row looks as it does today.
- Opening a several-sentence direction shows its text below the row, starting
  at the row's left edge and extending under Start session to the row's right
  edge; Start session and the help do not move, and closing it restores the
  closed row.
- While a launch problem is shown beside Start session, opening the direction
  places its text below that answer as well, still spanning the row.
- A project with no recorded direction shows "No near-future direction is
  recorded." in the same full-width place.
- Opening by keyboard leaves focus on the toggle, and a screen reader finds
  the text as the expanded content of the Near-future direction toggle.
