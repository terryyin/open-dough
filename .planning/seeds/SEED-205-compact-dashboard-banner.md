---
id: SEED-205
status: active
planted: 2026-10-31
planted_during: Terry's request to capture dashboard banner improvements at the top of the backlog
trigger_when: The dashboard banner shows a separate product mark, sessions toggle, and project title
scope: one story for a compact single-line dashboard banner
---

# SEED-205: Keep the dashboard banner compact

## Why This Matters

The dashboard banner currently shows the Open Dough mark as a passive image,
a separate sessions sidebar toggle beside it, and the selected project's name
as a heading even though the project selector already shows it. Terry asked
to make the mark itself the sidebar toggle and drop the repeated project
title, so the banner fits on one line on every screen. Queue this story first.

## Selected Stories

<a id="logo-sidebar-toggle"></a>

### Use the Open Dough mark as the sidebar toggle and drop the repeated project title

**Identity:** SEED-205#logo-sidebar-toggle

**Beneficiary:** A developer using the dashboard on any screen width.

**Goal:** The dashboard banner fits on one line on desktop and phone widths,
with no duplicated project name and no separate sidebar toggle beside the
product mark.

**Scope:**

- The Open Dough mark at the start of the dashboard banner becomes the
  sessions sidebar toggle, replacing the separate panel icon button. It keeps
  the toggle's accessible name, keyboard shortcut (⌘B), expanded state,
  attention count, and the current background effect of the toggle.
- The banner no longer shows the selected project's title heading; the
  project selector remains the place that names the selected project.
- Views that show the mark without a sidebar (the banner shown while no
  project is configured, System settings) keep the mark consistent with the
  dashboard without offering a toggle that does nothing.

**Key examples:**

- On a phone-width screen with a long project name selected, the banner shows
  the mark, perspective selector, project selector, and settings gear on one
  line with no horizontal page scroll.
- Clicking or tapping the mark, or pressing ⌘B, opens and closes the sessions
  sidebar; the mark shows the same background effect the old toggle showed.
- Sessions that need attention still show their count on the toggle.
