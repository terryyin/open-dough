---
id: SEED-122
status: active
planted: 2026-10-08
planted_during: Terry's request to move Running Cursor sessions into its own resizable sidebar section
trigger_when: The Sessions sidebar needs Running Cursor sessions visible beside the session list without taking over the sidebar
scope: story
---

# SEED-122: Running Cursor sessions sidebar panel

## Why This Matters

The open Sessions sidebar offers Running Cursor sessions as a list opened from
the sidebar. Watching the Cursor runner and its held sessions while still
working from the session list means switching between them. A section of its
own, collapsed until wanted and sized by the developer, keeps both in view.

## Story

<a id="running-cursor-sessions-sidebar-panel"></a>

### Show Running Cursor sessions as a resizable sidebar section

**Identity:** SEED-122#running-cursor-sessions-sidebar-panel
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer using the dashboard's Sessions sidebar who wants
to watch the Cursor runner's held sessions alongside the session list.

**Goal:** Running Cursor sessions becomes its own section of the Sessions
sidebar. It starts collapsed; when expanded it is a panel that splits the
sidebar vertically with the session list, and the developer can drag the
boundary between the panels with the mouse to resize them.

**Scope:** Move Running Cursor sessions into a new sidebar section with a
collapsible header, collapsed by default. Expanded, the sidebar is split
vertically into the session list panel and the Running Cursor sessions panel,
each scrolling on its own. A draggable divider between them resizes the panels.
The section keeps today's content and meaning: runner state, each held session
as working, waiting for an answer, or at the follow-up prompt, choosing one
opens its terminal, and nothing starts an agent. Collapsing or resizing is page
state only and changes no story fact or session. Keyboard and narrow-screen
access to the section stay usable.

**Key examples / evaluation:**

1. The developer opens the Sessions sidebar → the Running Cursor sessions
   section header shows collapsed below the session list, which fills the
   sidebar.
2. The developer expands the section → the sidebar splits vertically into the
   session list and the Running Cursor sessions panel, showing the runner state
   and its held sessions; choosing one opens that terminal.
3. The developer drags the divider between the panels → both panels resize to
   follow the mouse, each staying reachable and scrolling its own content.
4. The developer collapses the section again → the session list fills the
   sidebar.

**Open questions for refinement:** Whether the expanded state and panel sizes
are remembered as this browser's disposable preference like the sidebar's own
open state; minimum panel sizes; and a keyboard alternative to dragging the
divider.

**Depends on:** No blocking story prerequisite.

**Safe stopping point:** The collapsible section with a fixed vertical split
works before drag resizing is added.

## Breadcrumbs

- Terry's request on 2026-10-08 to capture this at the top of the backlog.
- Current list: `dashboard/src/RunningCursorSessions.tsx`, opened from
  `dashboard/src/SessionSidebar.tsx`; read in
  `dashboard/src/cursorRunnerSessions.ts`.
- Dashboard wording: the Sessions sidebar row in
  `docs/dashboard-ux-ui-north-star.md`.
