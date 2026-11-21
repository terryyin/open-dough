# Get fast proof of board and side-panel interactions

**Identity:** SEED-413#speed-dashboard-board-and-panel-proof
**Source:** [Get fast proof of board and side-panel interactions](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-board-and-panel-proof)

## Goal and scope

Give dashboard maintainers faster feedback on reading and navigating the Board
beside the Side panel and Sessions sidebar. Move the scoped 63 legacy cases in
28 navigation specs and narrow the 11 whole-dashboard Vitest cases in the two
phone Board specs and the Stories scan-emphasis spec. The slices own observable
Board and frame behavior where those workflows meet. Launch composition, Done
review, live terminal internals, and retirement of the group runner each have
their own campaign story.

## Current decisions

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [Architectural North Star](../../NORTH-STAR.md),
  [frontend test entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Published work decides Board membership. Machine records supply session
  evidence. The frame owns story selection and inspection separately from
  panel content. Keep these inputs and their production owners through the
  migration.
- Reuse `mountComponent`, page-loadable MakeMe, and existing production CSS.
  The Board depends on the width inside `.board-scroll > .scroll-content`,
  including the scrollbar gutter. Keep that scroll container in layout proofs.
  Mount the existing production owners over typed snapshots and service
  answers. Give a component the smallest production input it needs when a
  broad `MachineSessions` prop would require unrelated operations. Keep selection,
  focus, layout, and read state in their current production owners.
- Use native Chromium input and geometry for key handling, pointer and touch
  behavior, zoom, and overflow. Exercise the actual reader or frame state for
  read transitions, no reread, and attachment continuity. Supply a recorded
  answer directly for presentation-only proof. Use E2E for an actual page
  load, reload, URL destination, or cross-destination history.
- Map each legacy title and its distinct assertions to a named replacement or
  inspected existing observation before deletion. The roster below assigns each
  spec to one slice. Keep separate viewport, focus, wording, negative action,
  and storage failure observations where they show different risks. Cases may
  share setup and inputs. Use the project's MakeMe and page-object selection
  rules before authoring at each destination.
- Act directly with retrying observations. Retire settle waits and whole-app
  mount support as the last scoped consumer moves. Check external consumers
  first, including the mounted harness specs and E2E. Use colocated component
  objects where needed and reuse existing E2E objects. Add no shared wrapper.
  Keep the assertion map and accepted measurements here during execution.
- Compare equivalent focused selections at two workers, including runner
  preparation, counts by engine and destination, any E2E cost, and the slowest
  remaining cases. Use paired runs under comparable load if the result is noisy.
  Accept consolidation when the proof still distinguishes the preserved risks.

## Local gate

On macOS run from an awake machine on AC with `caffeinate -s -i`, the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Keep default test timeouts and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run each affected frontend engine's explicit paths separately through
`npm run test:dashboard:frontend -- <paths> --workers=2` while both exist.
Run the named E2E paths with `npm run test:e2e -- <paths> --workers=2` when
changing their observations or their composed boundary. Typecheck changed
dashboard production inputs and callers with `npm run typecheck:dashboard`.

## Baseline and planning observations

Observations are from the owned checkout at `37567ec2f` on 21 November 2026,
on AC power with Node 24.21.0 and its locked install.

| Consuming operation | Observation |
| --- | --- |
| Normal frontend runner selects the scoped legacy and mounted proof | `caffeinate -s -i npm run --silent test:dashboard:frontend -- --list --reporter=line` listed 63 legacy Chromium cases in 28 specs and 11 mounted cases in 3 specs. The two engines were then timed in separate runs. |
| Existing legacy specs exercise the starting journeys | The normal runner with the 28 explicit legacy paths below, `--workers=2`, and `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` passed 63/63 in 91.46 s elapsed including preparation (162.07 summed case-seconds). Load average was 11.41 before the run. Width reload, terminal divider input, and the hidden long Recently done layout were the slowest cases (7.93, 7.57, and 6.83 s). |
| Existing mounted specs exercise the starting phone and card journeys | The same runner with the 3 explicit mounted paths below and `--workers=2` passed 11/11 in 9.15 s including preparation. Load average was 17.39 before the run. The mounted tests still used the full dashboard. |
| Native paging and focus reach the actual Board through a smaller mount | The scratch `board-preparation-probe.spec.ts` passed with the normal Vitest runner at two workers, using `mountComponent`, production `PageFrame` and `Board`, typed project and machine inputs, and the real Board container classes. At 390 × 844, Enter twice left one column shown and handed focus from the disappearing Recently done control to Taken. Without the scroll container all three columns appeared. Temporarily removing the production focus handoff left focus on the document body and failed the second focus assertion. Restoring it passed. This covers the Board sizing and focus path in slices 1–2. |
| A mounted frame restores a Review width through live layout changes | The restored scratch run also opened the actual Review action in `PageFrame` over a typed `ReviewSource` answer. ArrowLeft widened the divider at 1400 px. At 700 px the divider disappeared, and at 1400 px it recovered the chosen width with the same read count. This covers the Review layout path in slice 5. Native terminal attachment and true reload stay with E2E. |
| Composed journeys reach publication, panel, and session navigation | `caffeinate -s -i npm run --silent test:e2e -- <six specs> --workers=2 --reporter=line` passed 7/7 in 30.6 s across `navigation/phone-board`, `navigation/side-panel-content-{replacement,switching}`, `sessions/sessions-sidebar-navigation`, `stories/story-card-inspection`, and `stories/story-dependencies-touch`. All paths are under `e2e/` and end in `.spec.ts`. This establishes the current journeys. New reload, direct URL, and covering terminal history assertions still belong to their slices. |

## Slices

Frontend spec names below are relative to `dashboard/frontend-tests/navigation/`
and omit `.spec.ts` unless otherwise specified.

### 1. The Board keeps the developer's place as room and focus change

Type: Behavior
Status: planned

Move `board-paging`, `board-kept-position`, `board-clamp`, and `board-height`
(14 legacy cases). Use `Board`, `useColumnPaging`, and production container CSS
with typed published work, chosen position, and changing Done evidence.
Use the real preference reader and writer for current, former, malformed, and
refused browser storage. Move true reload proof to
`e2e/navigation/board-kept-position.spec.ts`.

**Proof.** One, two, or three whole columns fit. The chosen leftmost position
survives project and width changes, the former key migrates once, a bad or
refused value defaults safely, and a reload recovers a real choice. Keyboard
focus stays on a surviving paging control or hands off when it disappears.
Reverse Tab reveals its card. Reduced motion, sticky controls and headings,
bottom clamping, and variable inspection or Done height preserve reading room.

### 2. Phone gestures page the Board while preserving reading and card controls

Type: Behavior
Status: planned

Move `accessible-board-touch` (3 legacy cases) and narrow `board-swipe` and
`board-indicators` (7 mounted cases). Use `Board`, `useBoardSwipe`,
`ColumnPagingControl`, and the real card controls over typed published work
and launch observations. Reuse the touch input primitive. Retain
`e2e/navigation/phone-board.spec.ts` for published loading and composed
gesture and hit-target proof. Reuse
`e2e/stories/story-dependencies-touch.spec.ts` where it observes the same
touch disclosure, retaining the open-session disabled Start reason and zero
launches wherever that distinct assertion lands.

**Proof.** Swipe commits only a full horizontal gesture, respects the ends
and cancellation, suppresses the click under the swipe, and leaves taps and
vertical reading available. Thin indicators still have full names and hand off
keyboard focus. Rotation and project/column navigation keep the long story
readable and preserve inspection and selection across layout changes.

### 3. Published work stays readable through refresh, narrow layout, and native scrolling

Type: Behavior
Status: planned

Move `accessible-board`, `accessible-board-announcements`,
`accessible-board-keyboard`, `accessible-board-scroll`,
`board-reading-keys`, `board-scroll`, and `frame-board-look` (13).
Use `Board`, `PublishedReadStatus`, production page/header layout, and
`useBoardScrolling`. Keep project observations with `usePublishedObservation`
where the retained snapshot and read ordering are the proof. Use its existing
published-work and revision inputs, keeping real authenticated delivery with
`e2e/stories/published-work.spec.ts`. Provide typed outcomes to the
read-status component for presentation alone. Use the production `App`
empty-project branch for its own message and layout.

**Proof.** Pending, successful, and failed work reads announce their distinct
wording without taking focus. Retained work, the alert, empty groups, and
the no-project state fit at narrow or zoomed widths. Keyboard order, focus
visibility, Enter navigation, and native reading keys keep their destinations.
The Board and roster scroll below a stationary banner, the gutter determines
column fit, and modal or app keys still reach their owners. Keep the frame's
appearance and contrast observations alongside layout.

### 4. Card selection, inspection, and scan emphasis stay distinct

Type: Behavior
Status: planned

Move `story-card-selection` and `story-card-dependency-selection` (2) and
narrow `stories/story-card-scan-emphasis.spec.ts` (4 mounted cases). Mount
`StoryCard` and `DoneStoryCard` with typed work entries, progress, dependency
facts, and current and Done session records. Where the page's selection changes,
drive its actual selection and inspection owners. Reuse
`e2e/stories/story-card-inspection.spec.ts` for composed reference and inspection.

**Proof.** Empty space toggles active and Done cards. Nested controls,
dependency disclosure and explanation, and Inspect retain their own behavior.
A Taken card leads with title and slice progress, accents its current session,
and keeps Done and Inspect usable at 360 px and through keyboard traversal.

### 5. Side panel width follows available room and restores the saved choice

Type: Behavior
Status: planned

Move `side-panel-width` and `side-panel-width-{covering,kept,review}` (8).
Use `PageFrame`, `useSidePanelWidth`, `PanelDivider`, and the actual panel
content for resize and Maximize. Use typed `ReviewSource` replies, and
session records and terminal attachment observations at their real boundary.
Use the production preference reader for malformed and refused storage.
Move real width reload proof to `e2e/navigation/side-panel-kept-width.spec.ts`.
Exercise terminal attachment with the existing fake host in E2E where the
native attachment count or identity is the proof.

**Proof.** Drag and keys respect Board and panel minimums, and the terminal
fits. Narrow viewport and sidebar room can cover the page and dismiss the
divider and Maximize. Returning room recovers the saved width and chosen
Maximize state without a fresh Review read or terminal attachment. Initial and
refused width choices leave unrelated preferences intact.

### 6. Panel, sidebar, and launch actions reveal or preserve the right Board position

Type: Behavior
Status: planned

Move `board-paging-{side-panel,sessions-sidebar,launch-dialog}`,
`board-scroll-side-panel`, and `board-session-reading` (11). Use
`PageFrame`, `Board`, `useSessionNavigation`, and real card and panel actions
with typed session, launch, and publication evidence. Preserve
`e2e/navigation/side-panel-content-switching.spec.ts` and
`e2e/sessions/sessions-sidebar-navigation.spec.ts` for composed activation.
Carry the direct-URL tall-card observation into a focused
`e2e/navigation/board-session-destination.spec.ts` case. Reuse a mounted
journey for viewport variants with the same destination and different clipping.

**Proof.** Board paging beside a shown panel retains its chosen position.
A dialog round trip and starting a ready card keep the visible columns and put
the new session on that card without a Recently done entry. Sidebar and URL
destinations reveal the hidden or tall card's top. Closing the panel preserves
the relevant selection and return point. Assert actual scroll ownership in
split and covering layouts and preserve tall-card reveal at distinct heights.

### 7. Perspective changes keep the project, focus, and active panel

Type: Behavior
Status: planned

Move `development-intent-frame` and `development-intent-frame-{keyboard,sessions}`
(7). Use the banner/perspective controls, `useDashboardNavigation`,
`ConfiguredDashboardContent`, and `PageFrame` for keyboard commands, compact
project selection, and distinct Intent/Development read messages. Use typed
published and session evidence. Extend the composed
`e2e/navigation/side-panel-content-replacement.spec.ts` journey for the
covering terminal history if its existing review/final-report case cannot
carry the native terminal observation. Preserve project/perspective history,
reload and settings return in
`e2e/navigation/development-intent-history.spec.ts`.

**Proof.** A perspective key keeps the project and moves focus out of hidden
content. Compact project choice keeps Intent. Missing Intent locations and a
failed Development read stay distinct. Settings returns focus to its control,
and Development returns to the roster when appropriate. A sidebar session
opens Development for its project. Back and Forward under a covering
terminal keep the attachment and Close reveals the addressed perspective and
selected story.

### 8. The launch, roster, and session surfaces stay readable in the frame

Type: Behavior
Status: planned

Move `frame-launch-look` and `frame-sessions-look` (5). Mount the actual
launch dialogs, `AgentRoster`, and session surfaces over typed choices,
assignment evidence, and session records. Keep application composition for
frame-wide zoom or an attached terminal where the smallest production
mount cannot reach that boundary. Reconcile the whole roster and measure all
replacement destinations against the baseline.

**Proof.** Start refinement fields and disclosures, the filled Start action,
Start session controls, roster heading and Back, and the sidebar and terminal
names remain readable with real styles. Preserve the narrow and 200% zoom
variants, usable overflow and keyboard reachability. Every retired assertion
has an observed owner, and the focused replacement is timed with E2E cost
included.

## Plan review

Eight slices follow distinct reading and interaction outcomes. The same
production column-fit rule serves all input modes. The frame keeps panel
content and project/story state through layout changes, while the panel
preference remains browser-local. The mounted and native-page proofs divide
at the consuming behavior. Counts are starting workload, including two
loop-generated zoom variants and five tall-card viewport cases. Use the
assertion map during execution to consolidate setup without losing a distinct
geometry or focus result.
