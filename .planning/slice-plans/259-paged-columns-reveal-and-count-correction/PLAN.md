# Paged dashboard columns reveal by structure and count only what is read

**Identity:** SEED-106#paged-columns-reveal-and-count-correction
**Source:** [correction story](../../seeds/SEED-106-dashboard-paged-columns.md#paged-columns-reveal-and-count-correction),
from the execution retrospective of
SEED-106#paged-dashboard-columns
(`be7125e4:.planning/seeds/SEED-106-dashboard-paged-columns.md`, plan
`be7125e4:.planning/slice-plans/225-paged-dashboard-columns/PLAN.md`), delivered by commits
a5e9e772, d5a159d8, 199c1418, 9be57f28 and af2e7d54 on
`claude/dashboard-columns-page-horizontally-instead-of-w`, all CI green.
**Prepared:** 2026-10-06. Planning only, in the execution's worktree.

## Goal and boundaries

A developer paging the dashboard columns keeps the view they chose when a
launch dialog opens from a shown card, and the Recently done edge control
never states a count before the sessions are read. The column summary an
edge control shows has one home with the dashboard columns, and a stylesheet
rule that can no longer apply goes.

Material exclusions (left to the original story's wrap-up): trimming the
UX/UI North Star's narrow-screen paragraph, the edge strip's tap width, blank
space below a short shown column, and the SEED-107 rename of Recent sessions.

## Current findings

1. **A modal dialog's on-screen place moves the view.** `columnHolding` in
   `dashboard/src/columnPaging.ts` works out a column from the element's
   left edge across the moving row. The row's `focusin` listener also hears
   focus inside a `<dialog>` that `LaunchDialog.tsx` renders inside the card
   (`StartLaunch.tsx` from `CardLaunches.tsx`); `showModal` places it in the
   top layer, centred on the window, so its x says nothing about its column.
2. **The Recently done control states a count it does not know.**
   `recentlyDoneColumn` (`dashboard/src/RecentlyDone.tsx`) counts the
   creations under way and the listed entries, done-story cards plus the
   sessions of no shown done story taken from `records ?? []`, while the
   machine's sessions are unread (`records` undefined, `agentLaunches.ts`)
   and the column itself says “Reading sessions…”.
3. **Residue.** `ColumnSummary` lives in `ColumnEdge.tsx`, so the content
   module `RecentlyDone.tsx` imports the control's module, and
   `DashboardColumns.tsx` builds the stage summaries while
   `RecentlyDone.tsx` builds its own. The
   `@media (prefers-reduced-motion: reduce)` rule in
   `dashboard/src/dashboard-columns.css` cannot apply: `moveTo` never sets
   `data-sliding` under reduced motion.

## Preserved promises and constraints

Every promise and key example of the paged dashboard columns story and the
accepted proof of plan 225: which columns show for each width, edge controls
only toward a hidden column with a live name and count, one-column moves,
reveals by focus, tabbing and Sessions sidebar choices, the kept position
across refreshes, project switches and reloads, starting a session leaving
the view where it is, the keyboard hand-off between edge controls, no slide
under reduced motion, and no sideways page scroll.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) applies:
the column summary has one meaning and one owner.

## Current decisions

- **A column is found by containment.** The column holding an element is
  the dashboard column region (Backlog's or Taken's `section.stage`, or
  `section.recently-done`) that contains it in the document, counted in
  the row's order. Geometry is no longer consulted. An element in no column
  moves nothing. Mark the column regions once (for example a
  `data-dashboard-column` attribute set where each region renders) rather
  than matching their class names in `columnPaging.ts`.
- **An unknown count is absent, not zero.** A column summary's `entries` is
  a number or unknown; the edge control shows the count only when known.
  Recently done's count is unknown while the machine's sessions are unread,
  creations under way included. The test helper names a control by the
  column alone or the column with its count.
- **The column summary lives with the dashboard columns.** The type and the
  building of all three summaries move to the dashboard columns
  (`DashboardColumns.tsx`, or a small module beside it); `RecentlyDone.tsx`
  exports only what it lists (its entry count or unknown), and `ColumnEdge.tsx`
  imports the type rather than owning it.
- Journeys still reach hidden columns through `showColumn` and observe the
  view through `expectView` (`dashboard/tests/dashboardColumnsPage.ts`); no
  test-only hook enters the product.

- Open before slice 2: the column now also reads done records. Whether the
  count is unknown until those are read too, not only the machine's
  sessions, is undecided; the current count adds done stories once read and
  treats unread sessions as none.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Opening Start execution on a shown Taken card moves the view and keeps the moved position | Slice 1 | Temporary probe (deleted) built on the setup of `agent-launch-start-taken.spec.ts`: 1100×900 window, Sessions sidebar open, `showColumn(page, "Recently done")`, then Start execution on the Taken card, Escape, reload; read the edge controls, `--leftmost`, and `open-dough.dashboardColumns.position` | Before: controls `["Backlog 0 entries"]`, leftmost 1, kept 1. Dialog open: `["Recent sessions 0 entries"]`, leftmost 0, kept 0. Same after Escape and after reload. Symptom reproduced |
| The launch dialog is a document descendant of its card, so containment names the card's column | Slice 1 | `grep createPortal dashboard/src` (none); `LaunchDialog` renders inside `StartLaunch`, rendered by `CardLaunches` inside the card | True |
| The row's columns are three regions in order: two `section.stage` inside `section.stages`, then `section.recently-done` | Slice 1 | `WorkStages.tsx` (`<section className="stages">`, `<section className="stage">`), `RecentlyDone.tsx` (`<section className="recently-done">`), `DashboardColumns.tsx` row children | True |
| `keepInView` and focus are the only reveal triggers, both through the row's one listener | Slice 1 | `grep showColumnHolding dashboard/src`: only `workFocus.ts` `keepInView`; `keepInView` callers only `sessionNavigation.ts` | True |
| While the sessions read is held, the Recently done control reads “Recently done 0 entries” | Slice 2 | Temporary probe (deleted): 54rem page, `holdSessionReads` before `goto`, large Backlog fixture; read `.column-edge` while “Reading sessions…” shows and after `answer()` | Held: `["Recent sessions 0 entries"]`; read: the same. Symptom reproduced |
| `ColumnSummary`, `recentlyDoneColumn`, `stagesOf` and `entryCount` have no callers outside the dashboard columns, the stages, and Recently done | Slice 2 | `grep -rln` over `dashboard/src`, `dashboard/tests`, `scripts` | Only `DashboardColumns.tsx`, `ColumnEdge.tsx`, `WorkStages.tsx`, `RecentlyDone.tsx` |
| Journeys name edge controls only through `dashboardColumnsPage.ts`'s `edgeControl`/`edgeControls`, whose pattern requires a count | Slice 2 | `controlName` is `^(name) \d+ entr(y\|ies)$`; 18 test files (specs and helpers) use them | True. The helper's pattern gains an optional count in slice 2 |
| Removing the reduced-motion rule changes nothing observable | Slice 3 | `columnPaging.ts` `moveTo` sets `setSliding(!prefersReducedMotion())`; `dashboard-columns-paging.spec.ts` “with reduced motion asked for, a move shows the next column at once” counts transform `transitionrun` events as 0 | True; that journey is the slice's proof |

## Proof

Run from the repository root with `unset NODE_ENV` first (a session started
from the dashboard inherits `NODE_ENV=production`):
`npm run test:dashboard -- <spec>…`, plus `npm run typecheck:dashboard` and
`npm run lint`. The whole dashboard suite is not a local gate here: each
slice names the journeys that reach what it changes, and hosted CI runs the
rest after publication.

| Correction outcome | Slice |
| --- | --- |
| Opening and leaving a launch dialog on a shown card leaves the view and kept position where they were; focus and selection reveals still move | 1 |
| The Recently done control shows no count until the sessions are read, then its count; summaries have one home | 2 |
| The dead reduced-motion rule is gone; slides and reduced motion behave as before | 3 |

## Slices

### 1. A reveal moves to the column that holds the element in the page

Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard --
dashboard/tests/dashboard-columns-paging-launch-dialog.spec.ts
dashboard/tests/agent-launch-start-taken.spec.ts` (3 passed); the new journey
fails on the unchanged product in its “while the dialog is open” step, once
that step waits for focus inside the dialog. The shared setup is
`reachKeptStart` in `dashboard/tests/keptStartJourney.ts`. The nine listed
reruns plus `agent-terminal-delete.spec.ts` (reaches `keepInView`) passed (24
tests), and `npm run typecheck:dashboard` passed. Columns are marked by
`dashboardColumnMark` (`columnPaging.ts`) on `section.stage` and
`section.recently-done`.
Learning: an `expectView` right after the dialog shows can match before focus
reaches it; wait for focus inside the dialog first.
Proof: a new journey, `dashboard/tests/dashboard-columns-paging-launch-dialog.spec.ts`,
on the kept-start fixture of `agent-launch-start-taken.spec.ts` (extract its
shared setup, the refused first launch through the Taken card offering Start
execution, into a helper both specs use rather than copying it): a
1100×900 window with the Sessions sidebar open and the view on Taken and
Recently done → opening Start execution on the Taken card → `expectView`
still shows Taken and Recently done with the “Backlog” control, while the
dialog is open, after Escape, and after a reload. It fails before the change
(the probe above). Rerun `dashboard-columns-paging.spec.ts`,
`dashboard-columns-paging-side-panel.spec.ts`,
`dashboard-columns-paging-sessions-sidebar.spec.ts`,
`dashboard-columns-kept.spec.ts`, `session-sidebar-navigation.spec.ts`,
`session-sidebar-navigation-cases.spec.ts`,
`agent-launch-ad-hoc-sessions.spec.ts`,
`project-keyboard-navigation-focus.spec.ts` and
`agent-launch-start-taken.spec.ts`.

Behavior: the view shows some columns → focus lands in, or `keepInView` is
asked for, an element inside a column → the view moves the fewest columns
that show the column holding that element in the page, or stays when it
shows; focus inside a launch dialog opened from a shown card therefore moves
nothing, and the kept position is unchanged.

### 2. The Recently done control counts only sessions that are read

Type: Behavior
Status: planned
Proof: in `dashboard/tests/dashboard-columns-paging.spec.ts`, a 54rem page
whose first sessions read is held (`holdSessionReads`, `sessionStatePace.ts`)
→ the right control's accessible name and text are exactly “Recently done”
while the column says “Reading sessions…” → after the read is answered it
reads “Recently done 0 entries”. `dashboardColumnsPage.ts`'s control
pattern accepts the name with or without a count. Rerun every spec that
uses `edgeControl`, `edgeControls`, `expectView` or `showColumn`, directly
or through a helper (`grep -rln` in `dashboard/tests` finds 18 files, the
specs among them and helpers such as `storyReadinessScan.ts`), and
`agent-launch-recent-sessions.spec.ts`, plus `npm run typecheck:dashboard`.

Behavior: the machine's sessions are unread → the Recently done column is
hidden → its edge control names it without a count → once the sessions are
read, the control shows its count, which follows new entries as before. The
column summary type and the building of all three summaries move to the
dashboard columns; `RecentlyDone.tsx` no longer imports `ColumnEdge.tsx`.

### 3. The dashboard columns' slide rule says only what can apply

Type: Structure
Status: planned
Proof: `dashboard-columns-paging.spec.ts` (its slide counts and “with
reduced motion asked for, a move shows the next column at once”) and
`npm run lint` pass with the rule removed.

Correction: removes the `@media (prefers-reduced-motion: reduce)` rule from
`dashboard/src/dashboard-columns.css`, which no longer applies because
`moveTo` in `columnPaging.ts` never marks the row sliding under reduced
motion; the slide comment there says that reduced motion is decided where
the move is made. External behavior is unchanged.
