---
id: SEED-156
status: active
planted: 2026-10-28
planted_during: Maintainer request to capture a top-priority dashboard story
trigger_when: A developer wants to return to a recently completed session across projects
scope: story
---

# SEED-156: Recently done sessions in the sidebar

## Why This Matters

A developer returning to completed work needs to find recent sessions across
projects in one place, without switching through each project's Recently done
column. The sidebar already offers a collapsible Running Cursor sessions panel
whose interaction provides the reference for this new panel.

## Selected Story

<a id="recently-done-sessions-in-sidebar"></a>

### Browse recently done sessions across projects in the sidebar

**Identity:** SEED-156#recently-done-sessions-in-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer using the dashboard to revisit recently completed
sessions from any project.

**Goal:** Find and open a recently done session from a single sidebar panel,
with the newest completions first and older sessions available on demand by
scrolling.

**Requested behavior:**

- Add a **Recently done sessions** panel to the Sessions sidebar, collapsed by
  default on page load.
- Follow the existing **Running Cursor sessions** panel's expand/collapse,
  resizing, independent scrolling, and session-opening behavior. Keep access
  usable when the panels share the sidebar.
- List all dashboard sessions marked Done across all projects, independent of
  the currently selected project, newest completion first.
- Show how long ago each session was marked done beside its entry. Use the
  completion time for both ordering and elapsed time.
- Initially load only the newest 20 entries, or all entries when fewer than
  20 exist. Scrolling to the end loads more older entries while keeping the
  entries already shown usable.

**Key examples / evaluation:**

1. On a fresh page load, the new panel is collapsed. Expanding it exposes the
   recent done sessions with the same panel interactions as Running Cursor
   sessions.
2. Project A has a session marked done two minutes ago, and project B has one
   marked done ten minutes ago. Both appear while project C is selected; A's
   session comes first and their entries show the respective elapsed times.
3. A session launched yesterday but marked done one minute ago appears above
   one launched today but marked done five minutes ago. Its displayed age is
   one minute.
4. With 45 done sessions, the first load contains the newest 20. Scrolling to
   the end loads older sessions in completion order, allowing the developer
   to reach all 45 without duplicate or skipped entries.
5. With fewer than 20 done sessions, show all of them. With none, show an
   empty state; scrolling past the final entry adds nothing.
6. Choosing an entry reaches that session through the existing session
   navigation, including when it belongs to another project.

**Scope boundary:** This story adds session history access in the sidebar.
Use the existing saved Done state; published story completion and native
session activity retain their existing meanings. The project's Recently done
column keeps its own behavior.

## Priority and Source

Terry requested this new story at the top of the product backlog on
2026-10-28 and authorized recording it directly on main and syncing with
origin. This request captures queued work; implementation is a later step.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Session history and sidebar navigation](../../dashboard/AGENT-LAUNCH-HISTORY.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
