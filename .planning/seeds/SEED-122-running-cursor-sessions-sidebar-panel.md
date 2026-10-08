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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/279-running-cursor-sidebar/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fb3121278c4c860e074d2b896bbc9678793346d3fe155d7f78d71ec923803f9f","plan":"96941759b6d3212ab4cc5c0617085156eaa587ff8c524037f44f669c5acbf38a"}}
```

**Beneficiary:** A developer using the dashboard's Sessions sidebar who wants
to watch the Cursor runner's held sessions alongside the session list.

**Goal:** A developer can watch the Cursor runner's held sessions while
continuing to use the dashboard's session list, giving the developer visibility
into current Cursor activity without switching away from that list. Running
Cursor sessions becomes its own collapsible section of the Sessions sidebar;
when expanded, the developer can resize its share of the sidebar.

**Scope:**

- Keep the session list above the Running Cursor sessions section. Its named
  header remains reachable when collapsed, and the session list uses the
  remaining sidebar height. The section starts collapsed on each page load.
- Expanding splits the sidebar vertically into the session list and Running
  Cursor sessions panels. Each scrolls its own content, so checking a held
  Cursor session does not require scrolling the dashboard session list out of
  view. Collapsing gives the available space back to the session list.
- Dragging the boundary with the mouse changes both panels' heights as the
  mouse moves. Bound the split so neither panel can be dragged out of reach:
  in ordinary available height, each retains room to read and choose an entry,
  and the Cursor runner's status and collapse control remain reachable. Exact
  dimensions are left to execution planning against the existing sidebar.
- The same boundary is keyboard reachable, has an understandable name and
  current size, and supports Up to give the lower Cursor panel more space and
  Down to give it less, within the same bounds as dragging. Expansion and
  collapse work with the keyboard, and collapsing leaves useful focus on the
  section header. A narrow window, short viewport, or browser zoom keeps both
  lists and the collapse control reachable through scrolling rather than
  enforcing a size that hides them.
- Expansion and the chosen split survive project/view changes and closing and
  reopening the Sessions sidebar within the page. Re-expanding restores the
  preferred split. Keep that preferred size as this browser's disposable
  preference across reloads, while reload starts the section collapsed. With
  no usable stored size, start with a split that gives both lists useful room;
  unavailable storage still allows resizing for the page's lifetime. A smaller
  viewport may constrain the visible split but does not overwrite the
  preference; returning to more room restores it. This follows the existing
  [page-state preference contract](../../docs/dashboard-navigation.md).
- Preserve today's runner feedback and session meaning under the
  [terminal/local record contract](../../dashboard/AGENT-LAUNCH-TERMINALS.md):
  while reading, say so; while running, show each held session's project, what
  was started, and whether it is working, waiting for an answer, or at the
  follow-up prompt. When stopped or unreachable, say which and show no held
  sessions. Subsequent successful reads recover the list while it is expanded.
  A running runner with no held sessions remains distinguishable from a
  stopped or unreachable runner.
- Choosing a held session opens its existing terminal through the dashboard's
  existing session navigation, including narrow-screen behavior. Merely
  expanding, collapsing, resizing, or reading the section changes no story
  fact, session state, or agent lifecycle, and starts no agent. Both sections
  retain their existing session membership and state meanings.

**Deferred promises:** Runner stop/restart controls, recovery after a computer
restart (separately owned by
[SEED-120](SEED-120-cursor-session-restart-recovery.md#cursor-session-restart-recovery)),
and new session filtering or grouping are outside this delivery. Deferral adds
no rejection of behavior already supported by the existing session lists.

**Key examples / evaluation:**

1. After loading the page, the developer opens the Sessions sidebar → the
   Running Cursor sessions header is collapsed below the session list; its
   hidden content consumes no panel height.
2. With the Cursor runner holding a working session and one waiting for an
   answer, the developer expands the section → reading feedback gives way to
   the runner state and both held rows beneath the session list. Choosing the
   waiting session opens that terminal using the current navigation and focus
   behavior.
3. Both lists contain more entries than fit → the developer scrolls the Cursor
   panel → more held sessions become reachable while the session list retains
   its own scroll position; scrolling the session list likewise leaves the
   Cursor panel in place.
4. Both panels are visible → the developer drags their boundary upward, or
   focuses it and presses Up → the Cursor panel grows and the session list
   shrinks. Down reverses that change. At a bound, continued resizing leaves
   both usable; completing or cancelling a drag leaves no active resize.
5. The section is expanded → the developer collapses it → focus stays useful
   on the header and the session list reclaims the content space. No agent is
   started, stopped, detached, or marked done by the collapse. Re-expanding
   restores the preferred split. Project/view changes and closing/reopening
   the sidebar likewise retain expansion and the preferred size.
6. The section is expanded → the runner becomes unreachable → the section
   shows that problem and no held rows, without hiding the dashboard session
   list or starting an agent. When a later read succeeds, current runner
   feedback and held rows return. A successful running read with no held
   sessions shows a running runner with an empty list.
7. The developer opens the sidebar in a narrow or short window, or increases
   browser zoom → both sections' controls and entries stay reachable by
   keyboard and scrolling; resizing cannot put either panel out of reach.
   Returning to more room restores the preferred split.
8. The developer resizes and reloads → the section starts collapsed, then
   expanding recovers the browser's preferred size. If storage is unavailable
   or its size unusable, expanding uses a usable default and still permits
   resizing without disrupting either session list.

**Boundary assumption:** In this refinement, remember size but not expansion
across reload; preserve both within the page. This is the recommended default
used after offering the preference choice without a response, not a recorded
developer decision. Remembering expansion across reload, or remembering no
size across reload, was considered and is not promised by this draft.

**Depends on:** No blocking story prerequisite.

**Plan:** [Running Cursor sessions sidebar](../slice-plans/279-running-cursor-sidebar/PLAN.md).

**Safe stopping point:** The collapsible section with a fixed vertical split
works before drag resizing is added.

## Breadcrumbs

- Terry's request on 2026-10-08 to capture this at the top of the backlog.
- Current list: `dashboard/src/RunningCursorSessions.tsx`, opened from
  `dashboard/src/SessionSidebar.tsx`; read in
  `dashboard/src/cursorRunnerSessions.ts`.
- Dashboard wording: the Sessions sidebar row in
  `docs/dashboard-ux-ui-north-star.md`.
