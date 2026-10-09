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

**Beneficiary:** A developer reading the selected project's near-future
direction on the Open Dough dashboard.

**Goal:** When the developer toggles the near-future direction open, its text
appears beneath both the Near-future direction heading and Start session,
spanning the full width of the project actions row, while the heading and
Start session stay on their row in place. Closing it returns the row to its
closed layout.

**Key examples / evaluation:**

- With the direction closed, the project actions row looks as it does today.
- Opening the direction shows its text below the row, starting at the row's
  left edge and extending under Start session to the row's right edge; Start
  session does not move.
- A project with no recorded direction shows "No near-future direction is
  recorded." in the same full-width place.
