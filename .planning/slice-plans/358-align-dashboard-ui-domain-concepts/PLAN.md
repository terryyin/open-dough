# Align the dashboard globally with its UI domain concepts

**Identity:** SEED-153#align-dashboard-ui-domain-concepts
**Source:** [Selected story](../../seeds/SEED-153-dashboard-ui-domain-concepts.md#align-dashboard-ui-domain-concepts)

## Goal and scope

A developer finds each dashboard region under one name: the Board, its
Columns, Story cards, and Session entries; the Sessions sidebar; the Side panel
and its terminal, final report, and story review content; the Panel divider;
and Scrollbars qualified by the region they scroll. The same names run through
UI wording and accessible names, components, modules, files, types, state,
CSS, test selectors and support, and maintained documentation. The Board also
becomes its own scroll region, so the Board scrollbar scrolls only the Board in
every layout (Terry's decision, 2026-10-27).

Included: `dashboard/src`, `dashboard/tests` (specs, page objects, support,
`writing-journeys.md`), `dashboard/*.md`, `docs/dashboard-*.md`, and
dashboard references in `docs/project-visibility-requirements.md`, wherever
they represent an ADR 0008 concept. `dashboard/server` only where a name
represents one of these UI concepts.

Excluded: the story's deferred promises (new ADR 0008 concepts; layout
redesign beyond the Board scroll region); renaming dashboard concepts outside
ADR 0008's table (banner, agent roster, project selection, settings, dialogs,
the "frame" control style) unless one reuses an adopted concept's name;
published record formats and session identities, which keep their names.

Assumptions: casing adapts to syntax (`Board`, `board`, `.board`,
`SidePanel`, `side-panel`); a Session entry's placement may keep a
placement-specific presentation component when it shares the concept's name
(for example a Sessions sidebar Session entry), not a separate "entry" concept.

## Architecture and current decisions

ADR 0001 (dashboard UI vocabulary) and ADR 0008 (Dashboard UI concepts, Spatial
presentation remains derived) apply; the navigation guidance owns layout and
scrolling mechanics. PFE: the concepts already have one implementation each,
under competing names (seed findings table), except the Session entry, which
has two components (`SessionEntry`, `SidebarEntry`); renaming the existing
solutions is the reuse decision. No new module boundary is introduced; files
move to the concept they implement.

- **Names chosen (Terry delegates wording):**
  - Board: `DashboardColumns`/`WorkStages`/`stages` → `Board`; accessible region name "Board".
  - Column: `stage`/`StageView`/`stage-header` → `Column`/`column-header`.
  - Story card: `WorkCard` → `StoryCard`; `DoneStoryCard` stays a Story card in Recently done.
  - Session entry: `SidebarEntry`/`sidebar-entry` → a Session entry presented in the Sessions sidebar.
  - Sessions sidebar: `SessionSidebar`/`session-sidebar` → `SessionsSidebar`/`sessions-sidebar`.
  - Side panel content: `TerminalPanel` → terminal, `SessionResultPanel`/"session result" → final report, `StoryReviewPanel` → story review, and the opening operations named for their content.
  - Panel divider: `SidePanelEdge` → `PanelDivider`, accessible name "Panel divider".
  - Other resize and paging controls: the generic `ResizeEdge` becomes a divider component, and the Running Cursor sessions control is named "Running Cursor sessions divider". `ColumnEdge` is renamed for its hidden-column paging responsibility, without "edge".
- **Saved preferences:** each renamed browser key (`open-dough.dashboardColumns.position`, `open-dough.sessionSidebar.open`, `open-dough.sessionSidebar.runningCursorHeight`) is read from its new key, falls back to the former key once, and is then kept under the new key. `open-dough.sidePanel.width` already matches its concept.
- **Board scroll region:** the region below the banner scrolls instead of the document. The banner sits above it unpinned by `position: sticky`. Focus and reveal padding, the readable/in-view checks (`pageMovement.ts`, `workFocus.ts`), the Preparation legend's reading-position restore, and the sticky Column headers and paging controls refer to that region instead of `html`/`window`. When the agent roster replaces the Board, it scrolls in its own region. Stacked, the Side panel takes 50dvh above the Board instead of 70dvh, so the banner and Board keep room to read a Story card. This is a reversible layout value.

## Preparation observations and decisive premises

Observed in this workspace on 2026-10-27 (Darwin arm64, `94b93cd6` plus the
seed draft, Node 24.21.0 per `.node-version`, `setup-native` npm, browser, and
check stages passing):

1. **The Board scrolls with the document today** (consumed by slice 4's
   example). Headless Chromium against the running dashboard
   (`127.0.0.1:4173`, story review open) showed the following. At 1400×420, a
   wheel scroll moved `.page-column` by 362px while the sticky `.side-panel`
   stayed at top 0. At 700×800 (stacked), the same scroll moved the Side panel
   to top −542. Seed findings record the details.
2. **Moving scrolling into the Board region breaks known consumers** (slice
   4's sizing and proof). Scratch edit: `.page-column { height: 100dvh;
   overflow-y: auto; scroll-padding-* as html }` appended to
   `dashboard/src/side-panel.css`. With it, `npx playwright test --config
   dashboard/playwright.config.ts <67 specs that scroll, wheel, or check the
   viewport> --reporter=list --workers=8` gave 20 failed and 154 passed.
   Reverted, the 15 failing files gave 36 passed and 0 failed (load average
   about 11). The failing families are accessible overview, Board columns
   clamp/height/paging, published-facts reading, story reference
   navigation/identity/scroll completion, Recently done progressive
   refresh/navigation, branch progress reading, ad-hoc terminal and card
   delete. They observe document scrolling through product code
   (`pageMovement.ts`, `workFocus.ts`, html scroll padding) and through test
   support (`pageLayout.ts`, `readingPlace.ts`, `dashboardColumnsPage.ts`,
   `recentlyDoneProgressivePage.ts`, `sessionNavigationJourney.ts`, touch page
   objects). The scratch edit is reverted; the workspace holds only the seed
   and this plan.
3. **Stacked Side panel height is asserted at 0.7** in
   `dashboard/tests/touchTerminalPage.ts`. Slice 4 changes it with the layout
   decision.
4. **Saved preference keys** are the four constants named above
   (`columnPaging.ts:72`, `SessionSidebar.tsx:67`, `runningCursorHeight.ts:24`,
   `sidePanelWidth.ts:50`). Each key's existing journey (side panel width,
   sidebar open state, Running Cursor height, column position) reads it after
   a reload. Slices 1 and 2 extend those journeys with a former-key value.

No paid or owner-held premise remains.

## Outside-in proof ownership

| Promise (key example) | Owner | Observable result |
| --- | --- | --- |
| Board and Columns traceable under one name; screen reader announces "Board" (ex. 1) | 1 | Journeys find the Board by `getByRole("region", { name: "Board" })`; Column headings unchanged; no `DashboardColumns`, `WorkStages`, `stage` name remains for these concepts in src, tests, or docs |
| Column position kept across the rename (ex. 4) | 1 | Column paging journey: a position saved under the former key shows the same Columns after reload and is kept under the new key |
| Story cards and Session entries traceable (ex. 1) | 2 | Card and sidebar journeys pass with Story card and Session entry names; one Session entry concept in all three placements |
| Sessions sidebar open state and Running Cursor height kept (ex. 2, 4) | 2 | Sidebar and Running Cursor journeys: former-key values recovered after reload |
| Side panel content named by content (ex. 2) | 3 | Terminal, final report and story review journeys pass; content components carry no Side panel name; "session result" gone |
| Panel divider resizes the Side panel; Running Cursor sessions divider keeps resizing (ex. 3) | 3 | Side panel width journeys find the separator named "Panel divider" and resize by drag and keys; Running Cursor journey finds "Running Cursor sessions divider" |
| Board scrollbar scrolls only the Board, side by side and stacked; reveal lands below banner and Column heading (ex. 3, Board scroll example) | 4 | New journey at 1400×420 and 700×800 with the Side panel open: scrolling the Board leaves the Side panel's top unchanged, and the document does not scroll. The 20 tests in observation 2 pass against the Board region |
| No competing or overloaded name; existing journeys pass (ex. 5) | 5 | Recorded whole-dashboard name review over src, tests, server, docs; full `npm run test:dashboard`, typecheck, and lint green |

Each slice runs `npm run typecheck:dashboard` and `npm run lint` (with
`/opt/homebrew/bin` first on `PATH`), plus the dashboard specs that the
consumer-trace script lists for its renamed files, identifiers, selectors,
and retired literals. A rename reaches many journeys, so when the trace lists
most of the suite, the slice runs the whole `npm run test:dashboard` instead
of hand-picking. Slice 5 runs the whole dashboard suite and `npm test` on the
final state before publication, because the change spans shared dashboard
paths. CI runs after publication.

## Ordered slices

### 1. The Board and its Columns carry their concept names
Type: Behavior
Status: planned
Proof: Board-region and Column-paging journeys (renamed from `dashboard-columns-*`) with the "Board" accessible name and a former-key position; consumer-trace-listed specs green

Behavior: a developer opens the dashboard → the work overview is announced as
the Board region, its regions are Columns, and a Column position saved before
the rename shows the same Columns. Code, CSS, test files, page objects, and
docs for these concepts use Board and Column, including the hidden-column
paging control's new name.

### 2. Story cards, Session entries, and the Sessions sidebar carry their concept names
Type: Behavior
Status: planned
Proof: card, Sessions sidebar, and Running Cursor journeys with former-key open state and height; consumer-trace-listed specs green

Behavior: a developer opens the Sessions sidebar or a Story card's sessions →
each session shows as a Session entry in every placement, the sidebar is the
Sessions sidebar everywhere, and its saved open state and Running Cursor
sessions height survive the rename.

### 3. Side panel content and its dividers carry their concept names
Type: Behavior
Status: planned
Proof: terminal, final report, story review, side panel width, and Running Cursor resize journeys; consumer-trace-listed specs green

Behavior: a developer opens a terminal, final report, or story review → the
same Side panel shows it, under content names. The separator beside it is the
Panel divider, which resizes it by drag and keys as before. The Running Cursor
sessions divider keeps its resizing under its own name. No "edge" names a
resize control.

### 4. The Board scrolls in its own region
Type: Behavior
Status: planned
Proof: new Board scroll journey (side by side and stacked, Side panel open); the 20 tests from observation 2 and the remaining scroll-observing specs green against the Board region; reveal and focus journeys land below the banner and Column heading

Behavior: with the Side panel open beside or above a long Board → scrolling
the Board moves only the Board, through the Board scrollbar at its own edge,
and the Side panel stays in place. Story reveal, keyboard focus, column paging,
reading position, and Maximize/Restore behave as before. The agent roster
scrolls in its own region. Navigation docs name the Board scrollbar and the
other region scrollbars.

### 5. A whole-dashboard review finds one name per concept
Type: Behavior
Status: planned
Proof: recorded name review (search terms in Current decisions plus "page"/"dashboard"/"panel"/"edge" meaning an adopted concept) with every remaining match dispositioned; full dashboard suite, `npm test`, typecheck, and lint green

Behavior: a developer reviews the dashboard after slices 1–4 → no remaining
code, test, or maintained-document wording uses a competing name for an adopted
concept or one name for incompatible concepts. Any residue is renamed in this
slice, and the existing journeys pass.

## Plan review

Slice-plan refinement not needed: each slice owns one concept group with its
own proof loop, the Board scroll change is separated from naming and sized by
observation 2, and the final slice owns only the residual review.
No slice-specific concern remains from this review.
