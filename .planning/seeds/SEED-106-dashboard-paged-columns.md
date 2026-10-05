---
id: SEED-106
status: active
planted: 2026-10-06
planted_during: Terry's request to stop the dashboard's main columns wrapping on narrower screens
trigger_when: A developer views the dashboard in a window too narrow to show the Backlog, Taken, and Recent sessions columns side by side
scope: story
---

# SEED-106: Dashboard paged columns

## Why This Matters

The dashboard's three main columns, Backlog, Taken, and Recent sessions, wrap
onto later rows when the window is too narrow to show all of them. A developer
in a narrower window then has to scroll down to find a column, and its
side-by-side relationship to the others is lost.

## Story

<a id="paged-dashboard-columns"></a>

### Dashboard columns page horizontally instead of wrapping in narrower windows

**Identity:** SEED-106#paged-dashboard-columns

**Beneficiary:** A developer watching a project's dashboard in a window that
cannot fit all three main columns.

**Goal:** The Backlog, Taken, and Recent sessions columns always stay on one
horizontal row. When the window is wide enough, all three show side by side as
they do today. When it is not, the columns that fit share the full window
width, and the developer moves left or right with thin edge controls to bring
a hidden column into view, instead of finding it on a wrapped row below.

**Scope (initial, for refinement):**

- Wide enough window: three columns, side by side, no edge controls.
- Narrower window: show as many whole columns as fit (two or one), filling the
  full window width. The columns never wrap to a new row.
- A very thin left or right control appears at the window edge only when a
  column is hidden in that direction. Using it moves the view by one column.
- Moving between columns uses those controls rather than free horizontal
  scrolling.
- In narrower windows, reduce the space the column frames use (for example,
  the Backlog and Taken box borders and padding) so the edge controls do not
  crowd the content. Wide windows may keep the current framing.

**Open for refinement:**

- The exact width thresholds for three, two, and one visible columns.
- Which column shows first in a narrower window, and whether the visible
  position is remembered across refreshes.
- Whether keyboard or touch gestures also move between columns.
- How much framing to remove in narrower windows while keeping the columns
  visually distinct.
