# Dashboard columns page horizontally instead of wrapping in narrower windows

**Identity:** SEED-106#paged-dashboard-columns
**Source:** [refined story](../../seeds/SEED-106-dashboard-paged-columns.md#paged-dashboard-columns).
**Prepared:** 2026-10-06. Planning only, in the established preparation workspace.

## Goal and boundaries

Backlog, Taken, and Recent sessions are three columns on one row. A page at
least 72rem wide shows all three; a narrower page shows the two or one whole
columns that fit, and the developer reaches a hidden column through a slim
edge control that names it and counts its entries, or by moving focus or a
selection into it. The position is the developer's and is kept.

Scope and key examples are those of the source story. Material exclusions:

- A trackpad or touch swipe between columns, and a dedicated keyboard
  shortcut. Plain Left and Right arrows keep switching projects.
- Any change to what Recent sessions lists or is called (SEED-107 owns that).
- Any change to the Sessions sidebar, the side panel, or how they share the
  window with the page.

## Direction and PFE

Established structure supports this work; no North Star topic or ADR decision
is needed. [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
applies: one meaning and one owner for the new facts below. The
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) already asks
for this shape on narrow screens: panning contained within the stage, a
viewport that pans to focused work, no page-wide sideways scroll, and
comfortably sized touch controls.

What exists and how it is used:

- **Page width.** `.page-column` is the `page` container
  (`dashboard/src/side-panel.css`), already the one measure of the page's own
  width beside the sidebar and side panel. The number of columns that fit is
  derived from that element's width and nothing else. It replaces the
  `@container page (max-width: 48rem)` stacking rule in `stage-frame.css`.
- **Row owner.** Today `.stages` lays out Backlog and Taken, and
  `RecentSessions` is a separate block under them in `ConfiguredDashboard.tsx`.
  One new owner, the dashboard columns, arranges all three and holds the
  position. The “Work stages” region keeps naming Backlog and Taken only:
  Recent sessions is local evidence, not a stage of published work.
- **Position.** One fact: the leftmost shown column. With the number that fit
  it decides which columns show and which edge controls exist. It is clamped
  so the row never rests past Recent sessions.
- **Kept preference.** `keptPreference.ts` (`readKept`, `keep`), as
  `sidePanelWidth.ts` uses it, keeps the position in this browser. A limit the
  width sets does not overwrite the kept position, the rule the side panel
  width already follows.
- **Bringing work into view.** `keepInView` in `workFocus.ts` is the one way
  the page brings a card or session entry into view
  (`sessionNavigation.ts`). It learns to show the element's column first, so
  every caller gains it; there is no second reveal path.
- **Counts.** A stage's count is rendered by `count(entries)` in
  `WorkStages.tsx`. The edge control uses the same number for a stage and the
  number of entries Recent sessions lists.
- **Layout proof.** `tests/pageLayout.ts` and `tests/partArrangement.ts`
  measure arrangement by asking the browser; `tests/dashboardPage.ts` `parts`
  names Backlog, Taken, and Recent sessions.

## Current decisions

- Hidden columns stay rendered and in the tab and reading order, cut off at
  the row's sides without becoming a scrolling area (`overflow-x: clip`), so
  stage headings keep sticking to the window and the page never scrolls
  sideways. The row moves by a transform; reduced motion moves at once.
- Because a cut-off row does not scroll, nothing reveals a hidden column by
  itself. The dashboard columns own every reveal: the edge controls, focus
  entering a hidden column, and `keepInView`.
- Journeys in tests reach a hidden column the way a developer does, through
  an edge control or focus, by one shared helper in
  `tests/dashboardColumnsPage.ts`.
  Add no test-only hook to the product.
- `tests/pageLayout.ts` counts elements past the window as a defect. Hidden
  columns are cut by design and are named there once, not per spec.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Recent sessions is a full-width block below a two-column row today | Slice 1 | Live dashboard at 1728px: `.stage` boxes at x 24 and 872, y 137; `.recent-sessions` at y 2204, width 1680 | True. The story's first promise is a layout change in wide windows too |
| The two columns stack below a 48rem page | Slice 2 | `stage-frame.css` `@container page (max-width: 48rem)`; `accessible-overview.spec.ts` asserts `expectStackedInOrder([direction, backlog, taken])` twice | True. Those assertions are replaced in slice 2 |
| Sticky stage headings survive a row cut off sideways and moved by a transform | Slices 2–3 | Chromium probe: `overflow-x: clip` container, track translated by one column, page scrolled 1000px | Headings of both shown columns sat at y 0; document width equalled the window's |
| Focusing content in a cut-off column does not move the row | Slice 3 | Same probe: focused a button in the hidden column | It stayed at x −400. The reveal must be explicit |
| The side panel narrows the page enough to hide columns in most journeys | Slices 2–3 sizing | Playwright's default window is 1280px (80rem); an open side panel takes half. Of 309 specs, 109 files use `recentSessions`, 49 specs combine a panel or terminal with Taken or Recent sessions, and 13 narrow-window specs touch them | True. Slices 2 and 3 each run the whole dashboard suite and repair journeys through the shared helper |
| Position survives a data refresh without extra work | Slice 2 | Not observed; depends on where the position state lives | Proved by slice 2's refresh example |

## Proof

Dashboard behavior is proved by Playwright journeys run with
`npm run test:dashboard -- <spec>` from the repository root. Slices 1 to 3
also run the whole `npm run test:dashboard`, because each changes the layout
nearly every journey renders. A session started from the dashboard inherits
`NODE_ENV=production`; unset it before `npm ci` or the checks.

| Story promise | Slice |
| --- | --- |
| Three columns side by side in a wide page, no edge control | 1 |
| Page width decides; whole columns that fit fill the page; never wrap, stack, or scroll sideways | 2 |
| Edge control only toward a hidden column, names it with a live count, moves one column, stays in view while scrolling, is a named button | 2 |
| Position follows width changes without resting past Recent sessions | 2 |
| Slide when moving; no motion when reduced motion is asked | 2 |
| Cards no narrower than without controls; columns distinct by heading | 2 |
| View follows focus and selection into a hidden column; all columns stay in tab order | 3 |
| Backlog first on a first visit; position kept across refresh, project switch, and reload | 2 (refresh), 4 |

## Slices

### 1. Recent sessions is the third column in a wide page

Type: Behavior
Status: done
Proof: `accessible-overview.spec.ts` and `published-work.spec.ts` expect
Backlog, Taken, and Recent sessions side by side in order in a wide window,
with only the frame's gap between neighbors and all text read whole; the
whole dashboard suite stays green with cards a third of the page wide.

Behavior: a page at least 72rem wide → the dashboard opens → Backlog, Taken,
and Recent sessions show side by side, Recent sessions with today's heading,
notes, and entries, inside the dashboard columns' one row. “Work stages”
still names only Backlog and Taken.

Interim: a page under 72rem keeps today's arrangement (two columns with
Recent sessions below, stacked under 48rem). Slice 2 replaces it.

Accepted: `DashboardColumns.tsx` owns the row; `.stages` spans two of its
tracks as a subgrid. `accessible-overview.spec.ts` “a wide window reads the
long work whole, three columns side by side” and `published-work.spec.ts`
“Backlog, Taken, and Recent sessions sit side by side” pass; the whole suite
passed 1085/1085.

Learnings: `.stages` takes its columns from the row, so slice 2's cut-off,
moving track keeps it spanning two tracks. The interim `width < 72rem` rule
and the `max-width: 48rem` rule in `stage-frame.css` are what slice 2
removes; use `<` breakpoints so exactly 48rem shows two columns. A journey
needing Recent sessions out of view at 1280px now opens the Sessions sidebar
first (`agent-launch-ad-hoc-sessions.spec.ts`).

CI repair (run 37383633842): third-width columns wrap a card's Starts on
Linux fonts, leaving a Start at the window's bottom edge, so
`agent-launch-card-noted-start.spec.ts` centres it before checking its
tooltip whole. `agent-terminal-cursor-page.spec.ts` waited too little for its
start to launch (a race older than this story); it now waits for
`parts(page).adHocStarted`.

### 2. A narrower page shows the columns that fit and pages by edge controls

Type: Behavior
Status: done
Proof: new `dashboard-columns-paging.spec.ts` and
`dashboard-columns-paging-side-panel.spec.ts` drive the story's examples at
54rem and 40rem pages and across a side panel opening and closing: which
columns show and fill the page, which controls exist and what they read,
one-column moves, a count that follows a new session while the view stays, a
control still in view after scrolling down a long Backlog, heading stickiness,
no sideways scroll, and an immediate move under reduced motion.
`accessible-overview.spec.ts` replaces its stacked expectations with the
one-column view. The whole suite is green, journeys reaching hidden columns
through the shared helper.

Behavior: a page under 72rem → the dashboard shows two whole columns from
48rem and one below, filling the page, starting at Backlog → an edge control
shows only toward a hidden column, reads that column's name and entry count,
stays in view while the page scrolls, and moves the view one column with a
brief slide. Widening or narrowing keeps the leftmost shown column where the
width allows. The stacking rule is removed. The controls take room from the
page margins and column framing, not the cards.

Also update the narrow-screen paragraph of the UX/UI North Star and the
layout description in `dashboard/README.md` to say this.

Accepted: `columnPaging.ts` reads `--columns-shown`, which
`dashboard-columns.css` sets from the `page` container alone, and keeps the
chosen `position` apart from the clamped `leftmost`; `ColumnEdge.tsx` names a
column from `stagesOf` or `recentSessionsColumn` in the heading's
`entryCount` words. The two paging specs observe each promise through
`expectView` (`tests/dashboardColumnsPage.ts`); the whole suite passed (1089).

Learnings: journeys reach a hidden column through `showColumn` in
`tests/dashboardColumnsPage.ts`. Two journeys use it only as a stand-in for
slice 3's reveal and must drop it there:
`agent-launch-ad-hoc-sessions.spec.ts` “with Open Dough already shown, its
sidebar entry brings its Recent sessions entry into view” and
`session-sidebar-navigation-cases.spec.ts` “a story on no card reveals…”.
Pressing an edge control is a `pointerdown`, a developer's own move to
`workFocus.ts`, which stops `keepInView` from following. A session
`keepInView` presents could pull the view to Recent sessions, while the story
says starting a session from a Backlog card leaves the view where it is.
Watch `session-unread-report.spec.ts:64`: it timed out once under a load
average near 30 and passed every rerun.

### 3. The view follows focus and selection into a hidden column

Type: Behavior
Status: done
Proof: in `dashboard-columns-paging.spec.ts`, tabbing backwards from Taken
into the last Backlog card shows Backlog with that card in sight; choosing in
the Sessions sidebar a session whose story card, or whose Recent sessions
entry, is hidden shows that column. Existing focus journeys
(`session-sidebar-navigation*.spec.ts`,
`project-keyboard-navigation-focus.spec.ts`, focus return after a snapshot)
stay green in the whole suite.

Behavior: a column is hidden → keyboard focus lands inside it, or
`keepInView` is asked for an element inside it → the view moves the fewest
columns that show it, then the element is brought into sight as today.

Accepted: one listener on the row answers `focusin` and the bubbling event
`showColumnHolding` sends, which `keepInView` sends before it scrolls; both
move through `moveTo` in `columnPaging.ts`. No automatic presentation calls
`keepInView`, so starting a session leaves the view where it is. A pressed
edge control that vanishes hands focus to the other side's control.
`dashboard-columns-paging.spec.ts` (tabbing back into Backlog; keyboard
hand-off), `dashboard-columns-paging-sessions-sidebar.spec.ts`, and the two
journeys without stand-ins observe it; the whole suite passed (1091) before the
hand-off, and focused runs after it.

Learnings: a reveal sets `position` like an edge control does, so slice 4
keeps `position` however it was set; only the clamp stays derived.

### 4. The position is kept across project switches and reloads

Type: Behavior
Status: done
Proof: a spec in the pattern of `side-panel-width-kept.spec.ts`: a first
visit in a narrow page starts at Backlog; after moving to Taken and Recent
sessions, switching project and reloading both still show them; a wide page
in between does not lose the kept position; a browser that keeps nothing
starts at Backlog without error.

Behavior: the developer chose a position → they switch project or reload in
the same browser → the same columns show, limited only by what the current
width allows.

Accepted: one position per browser under
`open-dough.dashboardColumns.position`, read and kept in `columnPaging.ts`
through `keptPreference.ts`; every choice is kept by `moveTo`, and the
width's clamp is never kept. A project switch remounts `DashboardColumns`, so
a page-lifetime `chosenOnPage` keeps the position where the browser keeps
nothing. `dashboard-columns-kept.spec.ts` observes switch, reload, a wide page
in between, unusable kept values, and refused storage; the whole suite passed.
