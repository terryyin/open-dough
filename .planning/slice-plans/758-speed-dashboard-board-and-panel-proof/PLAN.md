# Get fast proof of board and side-panel interactions

**Identity:** SEED-413#speed-dashboard-board-and-panel-proof
**Source:** [Get fast proof of board and side-panel interactions](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-board-and-panel-proof)
**Source review:** [Independent source review](source-review.md)

## Execution context

Story Branch Mode in `/Users/terryyin/git/open-dough/.worktrees/get-fast-proof-of-board-and-side-panel-interacti`
on `codex/get-fast-proof-of-board-and-side-panel-interacti`, published to the
same branch on `origin`. Integration checkout is
`/Users/terryyin/git/open-dough`, targeting `origin/main`. Dashboard-established
publisher `dashboard-territory.local-open-dough` assigned Rina-chan. Starting
revision `7634d96a0262dfefde36ece021f30df2ed801adf`. Published claim and first
delivery base `c2dd0a1edd70b84751bb38fd44cdb0dfbde741bd`.

Codex observer for `terryyin/open-dough`, `ci.yml` (CI), on the execution
branch. Coordinator `rina-chan-3114fc7a`, stream cell `g167:14`, shell session
`24965`, mailbox `/tmp/dough-ci-501/watch-i8N2qE`, PID `40217`.

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
Status: done

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
Status: done

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
Status: done

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
Status: done

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
Status: done

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
Status: done

Move `board-paging-{side-panel,sessions-sidebar,launch-dialog}`,
`board-scroll-side-panel`, and `board-session-reading` (11). Use
`PageFrame`, `Board`, `useSessionNavigation`, and real card and panel actions
with typed session, launch, and publication evidence. Preserve
`e2e/navigation/side-panel-content-switching.spec.ts` and
`e2e/sessions/sessions-sidebar-navigation.spec.ts` for composed activation.
Carry the direct-URL tall-card observation into a focused
`e2e/navigation/board-session-destination.spec.ts` case. Reuse a mounted
journey for viewport variants with the same destination and different clipping.

**Proof.** With the Side panel open and room for two columns, paging reveals
Taken and Recently done as whole columns and keeps the keyboard controls
reachable. A wider frame recovers the chosen position. A long hidden column
adds no blank scroll tail. A dialog round trip and starting a ready card keep
the visible columns and put the new session on that card without a Recently
done entry. Sidebar and URL
destinations reveal the hidden or tall card's top. Closing the panel preserves
the relevant selection and return point. Assert actual scroll ownership in
split and covering layouts and preserve tall-card reveal at distinct heights.

### 7. Perspective changes keep the project, focus, and active panel

Type: Behavior
Status: done

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
Status: done

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

## Story obligations

### G1. Keep the exact Done disclosure wording

Reported: slice 1 — "Acceptance found that substring checks would allow extra words in the older-entries disclosure."
Story clause: "Apply the [shared campaign acceptance](#acceptance-shared-by-the-eight-stories)"
Disposition: proved by slice 1: board-height.spec.ts checks the full rendered disclosure label for all three expansion steps and when 41 Done entries arrive.

### G2. Recover the Board position while the panel stays open

Reported: slice 6 — "Acceptance found that closing and reopening the terminal did not exercise widening the same split."
Story clause: "a wider frame recovers the chosen position"
Disposition: proved by slice 6: board-paging-side-panel.spec.ts widens and narrows the split with the same Terminal and recovers Taken and Recently done.

## Accepted proof

### Slice 1

Published on the story branch as `caffd17ddc119cf38cffb03c4c7ad53e1669290d`.

The mounted checks replace 14 legacy cases with 13 narrow Chromium Vitest
cases and 2 real Chromium reload cases. The former and malformed values use
actual browser storage. The refused-storage branch uses a throwing browser
getter. The wide reload, chosen positions in both directions, and refusal
across a new document are observed in E2E. The normal two-worker frontend
runner passed twice after switching the wheel to the provider's
element-targeted native input, taking 13.67 s and 9.82 s including preparation.
The subsequent exact Done wording pass selected all 3 Board height cases.
The two-worker E2E runner took 11.26 s including preparation. Dashboard
typecheck passed. Load varied between runs, so the aggregate comparison
remains in slice 8.

The mounted frame uses the production Board, PageFrame and banner with typed
work. The machine type carries some unused operations for inactive launch and
terminal paths. The active card, Done card and frame each consume a substantial
part of that contract. Production launch and terminal contracts kept their
current owners. Full terminal evidence is in `slice-1-return.md` under the
checkout's Git proof directory.

| Legacy owner and case | Replacement and distinct observations |
| --- | --- |
| board-paging / a 40rem Board shows one column; each move shows the next, and wider and narrower Boards keep the leftmost shown column | board-paging / one whole Board column follows each page move and the chosen column returns after widening. All published Backlog titles, actual available card width, whole column fit/side-scroll constraints, visible pair after widening, restored Recently done position after shrinking, and named controls with exact counts. The E2E reload cases' BoardView.shows also exercises authored text clipping and whole-page fitting in the two- and three-column branches. |
| board-paging / from the keyboard, a control gone after its move hands the keyboard to the other side's control | board-paging / the keyboard stays on the paging control and hands off when it disappears. Native Enter leaves the surviving Recently done control focused, then hands off to Taken. The page geometry and exact controls are checked after each move. |
| board-paging / far down a long Backlog the column paging control stays in sight and moves the view, and the shown column heading stays stuck below the banner | board-paging / the heading and paging control stay in reach below the banner while reading the long Backlog. The long Backlog uses 16 published dependency gaps to give the cards length. Native wheels to 1000 and 1500 keep the heading below the fixed banner and the control in sight. Paging puts the shorter pair at its bottom with the Taken heading and Backlog control remaining reachable. Paging back keeps the held read position and the heading sticks in the same place after further scrolling. Ends-with geometry is also proved by board-clamp. |
| board-paging / with reduced motion asked for, a move shows the next column at once | board-paging / reducing motion pages the Board immediately without a slide. CDP emulates the media preference. The Taken column immediately appears in the Board's control inset. No transform transition fires and the whole Taken column is shown. |
| board-paging / tabbing backwards out of Taken into the last Backlog card shows Backlog with that card in sight | board-paging / reverse Tab from Taken reveals the final Backlog card without taking its focus. Region ordering includes hidden Backlog; native reverse Tab reaches the final card and gives it full reading room below the banner. It still holds focus and remains fully readable at the Board's end. |
| board-kept-position / the chosen Board columns stay across a project switch | board-kept-position / a chosen Board position follows the reader between projects. Real project radios and distinct published stories show the switch, with Taken/Recently done held across it. Choosing Backlog and returning to Open Dough preserves the Backlog choice. |
| board-kept-position / the chosen Board columns stay across a reload | e2e/navigation/board-kept-position / reload restores the chosen Board position even when all three columns fit at the time. Real page reloads after choosing each position show the same visible pair and exact controls. |
| board-kept-position / the chosen Board columns stay in a wide Board | same E2E case. The intermediate wide reload displays all three whole columns. Narrowing recovers the pre-existing choice. This is one durable-position journey with both widths and reset observed. |
| board-kept-position / a position kept under the former Board key is recovered once and kept under the Board key | board-kept-position / the former Board preference is adopted once and later writes keep the current preference. Actual storage supplies the former key, whose value is rendered and migrated. With conflicting former value a new Board reads the current key. Choosing Backlog writes zero and a new Board reads it. True reload belongs to E2E. |
| board-kept-position / an unusable kept position starts at Backlog | board-kept-position / an unusable Board preference falls back to Backlog. Actual storage holds taken, -1 and 1.5 on fresh Board instances. Each renders Backlog without an uncaught browser error. One case keeps all three invalid value shapes. |
| board-kept-position / where the browser refuses storage, the view starts at Backlog and pages for the page's lifetime without error | board-kept-position / storage refusal starts the Board at Backlog and still keeps a choice for the life of the page. The window's getter throws before mount. Paging and the real radio project switch preserve the in-memory position. E2E / reload starts again at Backlog if the browser refuses storage additionally observes that navigating a fresh document loses that choice and collects no page errors. |
| board-clamp / a long Backlog read far down: shorter columns clamp the Board to their bottom, a position they hold stays, and widening or narrowing keeps the Board as long as the columns it shows | board-clamp / paging down a long Backlog clamps at the shorter columns' end and restores the Backlog's length. Native wheel and control click clamp 1500 to a nonzero shorter-column bottom; hidden Backlog remains longer but contributes no scroll tail. In-place return click preserves the position, last card action is visible at bottom, and the end remains the longest shown column or controls through three- and one-column widths and final short Recently done-only view. |
| board-height / a hidden long Recently done adds no blank tail below Backlog and Taken; an inspection lengthens and shortens the Board, and Recently done shown is read whole | board-height / a hidden long Recently done contributes no blank tail and its oldest story is reachable when shown observes all three exact reveal labels, no reveal at oldest, the oldest Done card in reading room, clamping and reachable return control after hiding it, and hidden card beyond scroll range. A separate inspection case opens and reads the last words of a long purpose, observes its added extent and the still-longer hidden Done, then verifies closing restores the original length. The two cases separate Done-range and inspection regressions. |
| board-height / done stories arriving in a hidden Recently done add no blank tail below Backlog and Taken | board-height / Done stories arriving in the hidden column leave the shown Board's length unchanged. The published catalog begins loading, then the test supplies the complete catalog and typed record-body answers. The latest and tenth cards appear, the exact 31 remaining label is beyond the shown Board's extent, and the two shown columns keep the same bottom and extent. The authored behavior here is consuming changed evidence, not reading the catalog over HTTP. |

After refactoring the mounted setup and naming the reload steps, all 13
mounted cases passed in 15.30 s and both real reloads passed in 7.22 s with
the counted reporter. Dashboard typecheck and whitespace checks passed.
The second E2E refactor run exposed the selected count. Load and reporting
mode varied between runs. The retained report is `slice-1-refactor-return.md`.

Guarded preparation flagged unchecked TypeScript assertions and unused mock
arguments. Explicit checks and typed fixture values cleared those findings
without changing the proof boundary. The four focused frontend paths passed
13/13 again with the repaired code. The retained runner record is
`slice-1-delivery-repair.proof.json`.

### Slice 2

Published on the story branch as `71cb524dc5e02173bc88b7bb46bea29d077a041e`.

Ten mounted Chromium cases carry the three Playwright and seven whole-app
Vitest cases. Native CDP gestures and hit-tested taps prove layout, focus,
input suppression, and the read position. Explicit compatibility clicks preserve
the negative Start and story-selection assertions even when Chromium omits them.
The changed Board setup and command registry reached thirteen earlier Board
cases and seven remaining mounted-dashboard cases. The nine-path run passed
30/30 in 24.03 s including preparation. Ten slice 2 cases took 21.79 summed
case-seconds, with the full swipe traversal slowest at 4.75 s. The two unchanged
composed E2E journeys passed in 11.93 s. Dashboard typecheck passed. Full
commands and counts are retained under the checkout's Git proof directory in
`slice-2-return.md`.

The phone-only mount and its Node browser command had no more consumers and
were deleted. The scan-emphasis test and mounted harness still use the
remaining whole-dashboard setup.

| Original title | Current observation |
| --- | --- |
| `board-swipe` / completed swipes traverse one whole column and stop at both ends | Same title, typed published and Taken titles, real native full moves in both directions and clamping at both ends, real transform transition and settled whole column geometry with exact labels. |
| `board-swipe` / short and cancelled gestures leave the view alone, and the next swipe works | Same title, short 24 px stroke, cancelled full stroke, both leave Backlog, next completed move takes exactly one column. |
| `board-swipe` / swiping from a card or action does not select, inspect or launch it; taps still work | Same title, enabled Start and headline hit-tests, native swipe and simulated compatibility click, no selected highlight, collapsed aria-expanded, no detail/dialog/launch, native detail and selection taps, inset and accent paint. |
| `board-swipe` / the board leaves vertical touch available for native reading without paging | "a native vertical drag reads down the same column without paging": actual position advances from a native finger drag, computed pan-y stays available, the Backlog destination is unchanged. |
| `board-swipe` / swipes share the controls' chosen column and preserve open detail through rotation with reduced motion | "swipes and indicators share a chosen column while rotation keeps inspection and selection": real media preference, no transform transition, typed-card detail and independent selected state, matching swipe/tap position, actual portrait/landscape column fit, restored pose and state. |
| `board-indicators` / thin phone indicators give stories more room and taps share the swipe destinations | Same title, whole-column reading room, two named controls at most 16 px, view and card each admit over 44 px more than the prior design, native taps to both named destinations and reverse swipe. |
| `board-indicators` / thin indicators retain complete destination names, keyboard activation and focus handoff | Same title, rendered roles/names including counts, enabled actual initial control, Enter through surviving and re-created control, keyboard focus handed off then Enter returns. |
| `accessible-board-touch` / project and column navigation keep a long story readable and its detail selected through rotation | "project and column navigation keep a long story readable and its detail open through rotation". Compact project control chooses empty Doughnut and returns to three Backlog articles. Native tap shows both precise Taken destinations. Name and heading, actual rendered title/identity/plan line boxes within the card and initially visible in read room, expanded detail across 844 × 390, 768 × 1024 and 390 × 844, whole shown columns and no page or Board horizontal scroll, hide tap closes and focuses the card. Touch shows the published Done card with whole heading, Taken remains reachable, and chooser still displays Open Dough. Composed whole-page text checks still run on a published phone Board and a rotated dependency/Inspect journey in the named E2Es. |
| `accessible-board-touch` / an open session's disabled Start reason is readable without hover and does not start another session | Same title, MakeMe open execution evidence on the matching queued card, hover-none emulation, exact visible reason in card and viewport, both controls disabled and accessibly described, native taps create neither a dialog nor a recorded start. |
| `accessible-board-touch` / thin Column indicators show work where the developer is reading on phone and tablet | `board-indicators` / "phone and tablet indicators remain reachable far down the Board and retain its position": scroll to 1000, hit-tested native tap still takes Taken, 1024 px wide tablet admits the Taken/Done pair, tap Backlog leaves Backlog/Taken, portrait returns Backlog; actual rendered whole columns, control labels and no page or Board sideways scrolling. |

The independent refactor consolidated the Done catalog and body fixture, native
input coordinates, and slide observer. All 23 mounted Board checks passed in
26.90 s and dashboard typecheck passed. The prior harness and E2E evidence
still covers their inputs. The retained report is `slice-2-refactor-return.md`.

CI [run 44912294218, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44912294218)
found the 768 px tablet expectation wrong with a classic scrollbar. A
controlled 15 px gutter measured 753 px for the Board and reproduced the
same missing second-column assertion. The repair uses rendered Board width
against 48rem while retaining the exact geometry, labels, rotation, long
text, inspected state and focus return. Both controlled checks and all ten
ordinary phone Board cases passed after the repair. Local proof is retained
in `slice-2-ci-tablet-repair-return.md`. Refactor disposition is covered by
the accepted slice 2 pass, which covered the existing rotation case and
its consumers. The repair was published as
`e9687f54fa49a2f25cc80195dba6bda97d9bd082`.

### Slice 3

Published on the story branch as `e5c0d6a059cfe0af1897e16fa9177846dad20031`.

Thirteen Chromium Vitest cases now cover the published Board, announcements,
native reading, frame styling, and zoomed layout. Test cases use the production
observation with typed work and revision answers when ordering matters.
The fourteen selected frontend paths passed 36/36 in 29.91 s including
preparation. The slowest current cases were zoomed reflow at 4.08 s, Board
scroll and reverse Tab at 2.99 s, and keyboard reading at 2.97 s. The four
real publication and reload cases passed in 8.71 s. Dashboard typecheck
passed. The real popup and scrollbar-boundary reload stay with their E2E
journeys. Exact commands and terminal proof are retained in
`slice-3-return.md` under the checkout's Git proof directory.

| Original title | Maintained replacement and each distinct observation |
| --- | --- |
| accessible-board / accessible Board reflows long published work for a narrow window and page zoom | Same title. Three equal whole columns fit a wide frame, align at the top with no extra gap over 24 px, then Backlog and Taken each appear alone in the narrow cases under Direction. Actual line rectangles keep the title, long identity, plan target, external source and unusable source target inside their card. Operate paging and Inspect/Hide at both narrow shapes, and check expected link href versus unavailable text. Direction expands, the short read revision remains available, the document fits horizontally, and the raw production document keeps native browser zoom available. Legacy screenshot capture was descriptive; maintained proof uses the rendered geometry directly. |
| accessible-board / accessible Board keeps empty groups readable in a narrow window | Same title. Actual empty Backlog and Taken announcements render in their paged columns below the expanded actual no-direction text, fit within their boxes and the document, and preserve announced snapshot revision. The separate existing published-work E2E empty case proves successful empty origin data. |
| accessible-board-announcements / accessible Board announces reading, the read result, and a failure while focus stays where it is | Same title. First success has exact revision and retrieval datetime, an assistive result taking a one-pixel box, and an empty offered focus notice. Native Tab chooses Settings. B's held typed response triggers a visible exact pending sentence while A still renders; release updates membership and datetime inside the same status node with focus unchanged. A failed check becomes a role alert with the 403 sentence and does not ask for work, leaves one standing empty live status node and does not move focus. |
| accessible-board-announcements / accessible Board keeps a read problem and the retained work reachable in a narrow window | Same title. Typed work read rejection at a different revision keeps the earlier card. The exact alert is above the Board, contains both timestamps and describes retention. Its published path text fits the alert with no page overflow. Reach both the alert sentence and retained Inspect control by scrolling inside the actual Board while focus stays in Settings. |
| accessible-board-keyboard / accessible Board is read by keyboard in reading order, with visible focus, and Enter follows a link | Same title. One-by-one native Tab/Shift+Tab verifies Sessions, perspective, Recent stories, project, Settings, Direction, Start session and badge legend before each card's controls in Backlog/Taken order. Both queued executions are disabled with the dependency explanation; refinement is enabled and a Tab stop. No links before inspection or positive Board tab indices; exactly eight programmatic-focus positions; Tab leaves the final stop and the reverse sequence returns. Inspect on Enter then Notes and canonical link are reachable. Each focused control has native focus-visible and the painted outline. Keyboard-generated link activation targets the pinned URL; the actual popup navigation and heading now run in the published-work E2E case. Closing with Enter restores and visibly indicates the original card and removes its links. |
| accessible-board-scroll / accessible Board reads a backlog longer than one screen by scrolling the Board | Same title. Typed list produces all queued titles; native End takes the actual Board to the previously offscreen last Inspect with priority 16. The sticky heading and count stay in frame, the document stays still, and every native reverse-Tab focus remains readable below that heading until the first card's Inspect. |
| board-reading-keys / body reading keys use native Board scrolling while focused controls and modal help keep their keys | Same title. Real hook installed by production ConfiguredDashboard. End focuses/reaches the Board bottom; Home returns to zero; PageDown and PageUp move naturally. The focused Inspect retains keyboard ownership. Native modal close focus and scroll position remain after End; Escape returns focus to the badge legend without moving the view or document. |
| board-reading-keys / native modified reading keys move an unfocused Board and preserve modal and app shortcuts | Same title. Platform-specific modified input first moves a plain native document to End and Home and then the actual otherwise unfocused Board to its extremes. Body focus is explicit when handing the key to production. Modal retains key/focus and scroll, Escape closes it, and Meta+B opens and closes Sessions with the same Board position. |
| board-scroll / the agent roster scrolls below its stationary banner without scrolling the document | Same title. Actual AgentRoster reads a typed list tied to the shown revision. Native wheel at a visible roster heading scrolls its own region while the banner's entire rectangle and the document stay still. The last member enters that region's viewport. |
| board-scroll / a classic Board scrollbar's width owns the Column boundary and keeps a saved position | Same title in the mounted suite, plus the extended `e2e/navigation/board-kept-position.spec.ts` normal reload. At 1152 px with a classic 15 px track the production Board inner width is smaller and shows the saved Taken/Done pair, with real preference still one through a remount. The E2E runs with the native scrollbar enabled, attaches its track at document load, measures the reserved width, observes the same whole pair, and reloads the real page at that boundary. It also retains the former all-three-columns and normal-width reload observations. |
| frame-board-look / the row below the banner and the Board read clearly in the frame's look | Same title. Real ProjectActions renders the exact Start label; Start and Direction have one hidden decorative Lucide mark. Computed composited text contrast for the controls and Board heading/counts meets 4.5:1; Start fill/edge contrast meets 3:1. Named controls fit at 420 px and effective zoom width, document stays inside the viewport, and opening Direction still exposes whole text. |
| frame-board-look / an empty column and a failed read are said in the frame's look, whole in a narrow window | Same title. Exact empty Backlog wording is visible with measured text contrast. A typed check failure yields the actual named heading, hidden decorative icon, specific 403 and additional paragraphs. All paragraphs and heading fit and meet 4.5:1 at both narrow and zoom shapes. |
| frame-board-look / no projects configured reads clearly and whole in a narrow window | Same title. The real App reads an empty typed project configuration. The actual heading and guidance meet 4.5:1 and fit, Settings is inside each viewport, and the passive Open Dough mark is named, square, uncropped, high-resolution by named source, on top, and never a control or tab stop. Settings opens with its heading focused and the passive mark in main. Back again shows the expected dashboard and banner mark. Existing built-preview `dashboard/frontend-tests/configuration/system-settings-look.spec.ts`, "settings and its project dialogs fit a 420 pixel window without sideways scrolling", uses `expectProductMark` to check the delivered PNG signature, dimensions and loaded pixels in the Settings placement. The mount covers the unconfigured banner and settings placement; it does not serve production PNG bytes. |

The independent refactor clarified both E2E journeys. All four Chromium cases
passed again, with Playwright reporting 18.6 s. The mounted proof and
typecheck still cover their established paths. The retained report is
`slice-3-refactor-return.md`.

### Slice 4

Published on the story branch as `302ccb05acad0330e0bab8c871795af96c3d6327`.

Two card interaction cases migrated to mounted Chromium. Four scan-emphasis
cases mount StoryCard with typed work, slice progress, and current and Done
records. All six passed in 6.22 s including preparation. The four scan cases
took 0.46 summed case-seconds. Nineteen changed-fixture and config consumers
passed in 22.14 s. The composed supplier-link E2E case passed in 15.92 s.
Dashboard typecheck and ordinary frontend registration passed. Exact commands
and counts are retained in `slice-4-return.md`.

The retired mount's three remaining tests exercised its scheduler, substituted
responses and per-case reset. After the scan migration, no product check
consumes that mount. Its three self-tests, browser commands, exclusive
support modules, and setup instructions were removed. The runner list
still shows the migrated cases and the independent legacy selection.

| Case before slice 4 | Named observation after slice 4 |
| --- | --- |
| `story-card-selection.spec.ts` — empty-area clicks toggle the selected story on active and Recently done cards without opening or closing detail, and nested controls do not select | Same title in Chromium Vitest. Production Board and Recently done render StoryCard and DoneStoryCard over typed work, Done catalog and retained session answers in ConfiguredDashboard. Active heading toggles selected highlight with inset and accent fill, independently of default closed detail. Inspect changes aria-expanded and the actual detail while leaving selection alone. Clicking detail leaves selection clear. Heading selects and clears while detail stays open, then Hide closes it without selecting. An actual touch at the disabled Start's hit target leaves the selected card and opens no dialog or start. The Done heading takes the sole selection without adding detail; its retained session heading captures a history request, preserves selection and opens no Side panel. Intent receives the selected Done identity and no Selected story only toggle. Returning to Development restores the highlight, and clearing it leaves Intent without a selected identity or toggle. |
| `story-card-dependency-selection.spec.ts` — a dependency disclosure and its explanation text do not change the selected story or open detail | Same title in Chromium Vitest. Production Board and card render the declared waiting and decision-needed suppliers with an unrelated Not ready assessment. Opening Dependencies exposes the actual reason without choosing the card or opening detail. Clicking the explanation leaves it open and preserves selection in both unselected and selected states. Clicking the heading explicitly selects and clears. The existing E2E case in `e2e/stories/story-card-inspection.spec.ts` still follows the actual supplier reference, opens the supplier detail while the other two stay open, and preserves the independently selected story. |
| `story-card-scan-emphasis.spec.ts` — a Taken card leads with title and compact progress, then the current session, Done and Inspect | Same name. Only the real StoryCard in the real frame context, with one done and two planned typed slices plus a currently observed execution and a retained Done refinement. Browser geometry proves title → progress → current session → Done disclosure → inspection. Exact count, each segment status, and the currently shown session ID remain observed. |
| `story-card-scan-emphasis.spec.ts` — the current session carries the accent wash while Done and Inspect stay quiet | Same name. The current session's computed fill matches the accent and its ink matches the card. Actual Done and Inspect colors match the quiet token and the card ink differs. |
| `story-card-scan-emphasis.spec.ts` — Open terminal, Done and Inspect take keyboard focus in turn | Same name. Native Tab traverses Open terminal, Session details, Done summary and Inspect in that order. The previous check focused each DOM control by direct call; this check observes the actual traversal. |
| `story-card-scan-emphasis.spec.ts` — at 360 pixels wide the card keeps its scan facts visible and its meta line fits | Same name. A 360 px Chromium viewport retains rendered title, progress, current session, Open terminal, Done and Inspect, with the meta line fitting the width. |

The independent refactor consolidated the selected-card paint observation
across touch and selection cases and removed obsolete paths from both
dashboard TypeScript configurations. All seven affected Chromium cases
passed in 19.07 s, with dashboard typecheck passing in 16.01 s. The retained
report is `slice-4-refactor-return.md`.

### Slice 5

Published on the story branch as `595e3a3fe760e13dbde84fb23a5d6edea797cba8`.

Seven mounted Chromium width cases passed in 6.77 s including preparation.
The widest shared-mount selection passed 49/49 across 21 paths. The three
real reload and terminal cases passed in 16.75 s, and dashboard typecheck
passed. The real terminal proves fitted column growth, continued input
and screen output on the same attachment through both covering layouts,
and a second attachment after Close and reopen. Mounted Review reads use
typed sources and preserve the same diff and observed read counts. The
fixtures account for scaled native pointer coordinates and wait for the
measured divider after layout changes. Terminal paths and exact commands
are retained in `slice-5-return.md`.

| Original case | Current proof |
| --- | --- |
| `side-panel-width.spec.ts` — mouse and keyboard choose one bounded width for an attached terminal that fits it | `mouse and keyboard choose one bounded panel width` checks named vertical separator, default half, width announcement and minimum/maximum, side-by-side positions, native drag +200 within bounds, Board minimum, pointer movement after release, both extrema, Close and heading at the minimum, cancellation, native reverse-Tab/focus, 32 px Left/Right steps/clamps, no history change, Maximize taking the shared room, Restore, and Close/reopen with the same width. E2E `terminal fits the chosen width and keeps its attachment through both covering layouts` checks original and fitted native column counts, earlier output, terminal-focused Left, Maximize/Restore, same live attachment under resizing, and second attachment on reopening. |
| `side-panel-width-covering.spec.ts` — at a narrow window the panel covers the page with no Maximize, and a wide window recovers the chosen width and Maximize choice | `a narrow window covers the page and widening restores width and Maximize choice`: maximum chosen by native drag, exact covering viewport bounds, no divider or maximize control, Board and banner hidden from the reading surface, Sessions toggle stays usable, no sideways document scroll, heading text and shown buttons fit, reverse Tab and Tab return to an indicated Close, widening recovers the split, Close/reopen keeps the preference, and Maximize survives narrowing/widening until Restore. |
| `side-panel-width-covering.spec.ts` — beside the open sidebar with too little room, the panel covers the page column without Maximize | `the open sidebar leaves too little room and the panel fills the remaining column`: 880 px with sidebar visible, panel begins at the sidebar's right edge, fills the remaining width and viewport height, omits controls for the split and hides the page. Close reveals its banner. |
| `side-panel-width-covering.spec.ts` — at a narrow window the terminal covers the page with no Maximize, still attached, and a wide window recovers the chosen width | E2E terminal journey also checks 420 px full-window covering, controls usable and heading visible, earlier output and live attachment retained, and width restored on widening. At 900 px with sidebar open it fills the remaining area alongside the sidebar. Terminal input and output still work on the same attachment; wider room gives a split and closing sidebar restores the chosen width. |
| `side-panel-width-kept.spec.ts` — a chosen width is recovered after a reload, and neither less room nor Maximize replaces it | `less room and Maximize temporarily fit a chosen width without replacing it` observes mounted live constraints and the real preference key. E2E `reload restores the preferred review width within the room available` opens a real published story and Git review, observes half-width default, chooses half +200, reloads into the chosen width and announces it, shows half in an independent browser context, clamps to leave 320 px after reloading at 1000 px, restores that clamp after Maximize without overwriting storage, and reloads at 760 px in covering mode. Widening restores the preference, and reloading while maximized opens the preferred split. |
| `side-panel-width-kept.spec.ts` — an unusable kept width starts at half the room, leaving the other preferences, and the next choice is kept | `an unusable kept width starts at half the room and leaves the sidebar preference`: real storage values `wide`, `0`, `Infinity`; reload-equivalent fresh PageFrame owners each start at half while sidebar stays open. Left chooses and stores a width, with the sidebar key still `true`. Another PageFrame recovers it. No uncaught script exception. |
| `side-panel-width-kept.spec.ts` — where the browser refuses storage, the panel starts at half the room and resizes for the page's lifetime without error | Mounted `when browser storage is refused, the panel starts at half and resizes for the lifetime of the page` installs the browser's SecurityError getter and verifies initial width, native drag, announced width and the fresh PageFrame default. E2E `reload starts at half the room when the browser refuses the preference` exercises the same behavior across actual document reload and checks the actual pageerror collection. |
| `side-panel-width-review.spec.ts` — a review resized and maximized keeps its reads, and the open sidebar narrows the room without losing the chosen width | `review keeps its story, chosen file and reads through width and sidebar changes`: actual StoryCard opens Review changes against typed work, actual file list chooses Modified unstaged.txt and reads its diff, then observes mouse, keys, maximize/sessions close/reset, clamped sidebar geometry and bound announcement, sidebar closure restoring the previous width, cover/recovery keeping the same Review and reads, and a newer drag/key width beside the sidebar surviving its closure. |

The refactor placed the preference reloads in
`e2e/navigation/side-panel-kept-width.spec.ts` and the native attachment
case in `e2e/navigation/side-panel-terminal-width.spec.ts`. All three
passed after the split, with Playwright reporting 19.9 s. The proof is
retained in `slice-5-refactor-return.md`.

### Slice 6

Published on the story branch as `6e08f49483ad43d42c3b0653c6b1ae0df76c2ff2`.

Ten mounted Chromium cases carry the eleven legacy cases. The 18-path
consumer run passed 43/43 in 44.92 s including preparation, with 12.33 summed
case-seconds for the ten new cases. The two new E2E cases use the direct
published story URL and a genuine Chromium scrollbar track. Their combined
run with the two retained composed journeys passed 4/4 in 28.04 s.
Dashboard typecheck passed. The additional native viewport change while
the same Terminal remains open passed both focused cases in 4.97 s.
Literal proof and the prior case map are retained in `slice-6-return.md`.

| Original case | Current proof |
| --- | --- |
| `board-paging-side-panel.spec.ts` — beside the side panel a 54rem Board shows two columns and pages between them; a wider Board shows all three and gives the view back | First mounted test, “the Side panel leaves two whole columns, hands off paging focus, and restores the wider Board's choice.” Real 108rem frame has three columns first; opening genuine Terminal measures half the Board, shows the visible pair with exact control and retained card share. Native Enter gives the next pair and one slide, surviving focus and zero hidden-long-column tail. With the same Terminal still open, widening the viewport shows three whole columns and restoring the viewport recovers the chosen pair. Close and reopen also recover the original wide and chosen split arrangements. |
| `board-paging-side-panel.spec.ts` — paged back to Backlog beside the side panel, a session started from the ready Backlog card stays on its card, adds nothing to Recently done, and the view stays | Second mounted test, “starting a ready Backlog story beside the terminal keeps the view and its session on the card.” Actual paging to Taken/Recently done and Backlog/Taken, same Terminal heading, real execution dialog and its Start calls the typed acceptance with the ready identity and workflow, observed running record renders on that card, and Recently done still has zero with the original view. |
| `board-paging-sessions-sidebar.spec.ts` — a session whose story card is hidden shows its column and brings the card into view | “a Session sidebar choice pages to a hidden column and brings its card into the Board's reading room.” The real open sidebar can page away from Backlog. Its button opens the actual terminal for the matching session, takes terminal keyboard focus, scrolls the correct whole card with smooth request, and marks it as selected and shown. Banner, sidebar and Side panel top bars share both edges. Reading to the Board's bottom reaches the last whole card and the column's full extent. The allowed one-line sidebar/panel titles still belong to their composed navigation proof. |
| `board-paging-launch-dialog.spec.ts` — opening and leaving Start execution on a shown Taken card keeps the view on Taken and Recently done | Same exact case title in mounted Chromium with typed kept-start evidence and real sidebar. Opening the real Claude execution dialog takes focus and preserves the current two-column view; Escape closes without changing the view. Remounting the real Board/PageFrame reads the same stored paging and sidebar choices, visibly recovers the pair and labels. The true browser reload of the same kept Board position is in `e2e/navigation/board-kept-position.spec.ts`; no standalone launch acceptance is asserted in this case. |
| `board-scroll-side-panel.spec.ts` — the Board alone scrolls with an open Side panel at 1400×420 | Same mounted title. The actual Review is open beside the long published Board. Native wheel moves the story by 600 px while the measured panel, banner and region positions and stationary document remain. Region starts under the banner and ends directly at the panel edge, uses overflow auto and an actual 15 px gutter, and its edge hit test cannot target the divider. Maximize hides the banner, Restore returns the exact prior geometry and scroll position, and native divider drag changes width by the intended amount and keeps the document still. `e2e/navigation/board-scrollbar-side-panel.spec.ts` adds the native visible track click with Chromium's scrollbar launch option, same split and long Board, real selected session terminal, stationary panel/Board bounds and one actual fake-host attachment. |
| `board-scroll-side-panel.spec.ts` — the Board alone scrolls with an open Side panel at 700×800 | “the Board alone scrolls after Close from a covering Side panel at 700×800.” Real Review covers the whole viewport with the Board and banner hidden. Close exposes banner, paging returns Backlog, native wheel reads the long Backlog while the document stays still. |
| `board-session-reading.spec.ts` — URL and Session entry reveal a tall card's top within the Board at 1400×360 | Mounted “a sidebar session reveals the tall card's sticky reading edge beside a terminal through height changes” uses actual sidebar, focused Terminal, real inspected card taller than its viewport, same top at initial and two height resizes and stationary document. True URL, real focused card, sticky clearance, taller-than-room condition and height resizes are in the new URL E2E. |
| `board-session-reading.spec.ts` — URL and Session entry reveal a tall card's top within the Board at 700×800 | True URL and height-only changes on that actual viewport are in the same URL E2E. Mounted 700×800 covering case opens the Terminal from the actual sidebar, closes it and observes the selected tall card's sticky reading edge. |
| `board-session-reading.spec.ts` — the Session entry reveals the same story on the Board after Close at 700×800 | Mounted 700×800 tall case. Sidebar dismisses into a real covering terminal and its keyboard, Close restores the same highlighted story and sticky edge, returns focus to Sessions and leaves the document still. |
| `board-session-reading.spec.ts` — the Session entry reveals the same story on the Board after Close at 700×900 | Separate mounted 700×900 case observes the same tall-card conditions and focus return at that viewport. |
| `board-session-reading.spec.ts` — the Session entry reveals the same story on the Board after Close at 700×1600 | Separate mounted 700×1600 case leaves the goal closed so the story card fits whole, verifies both fit precondition and whole room, plus retained actual selection, Sessions focus return and stationary document. |

The full five-path frontend replacement is 10 mounted cases. Two independent new E2E
cases carry the real URL and native track actions. The two former 700×800 journeys
share the one mounted cover check while the URL case retains the actual document
navigation and both viewport variants. The retained
`e2e/navigation/side-panel-content-switching.spec.ts` observes actual Review/Terminal
replacement and their independent story selection/title access. The retained
`e2e/sessions/sessions-sidebar-navigation.spec.ts` observes actual cross-project
session activation, attachment identity, reveal, history, selected story and focus
return. Both retained cases ran under the combined proof.

BoardView now shares the classic scrollbar setup and width measurement
between the real reload and track cases. Both new E2E journeys use named
setup, actions and observations. The three affected E2E files passed all
four cases in 19.84 s, and dashboard typecheck passed. The retained report
is `slice-6-refactor-return.md`.

CI [run 44921975200, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44921975200)
showed the three columns whole and caught a threshold assertion using the
wrong element. A controlled 15 px track reproduced the same 1137 px Board
inside a 1185 px query container. The Board's two 24 px margins explain
the difference. The repair compares the rendered Board to its original
split width and still checks all three whole columns, exact control labels
and the same open Terminal before and after narrowing. Both focused cases
passed with the controlled gutter and again with ordinary browser settings.
The evidence is `slice-6-ci-board-gutter-repair-return.md`. The repair was
published as `3880060c0dbc8004765060b32cc0a7e740976842`.

### Slice 7

Published on the story branch as `6471977a879732cbf293a17088dcf3195bf368c5`.

Five mounted Chromium cases and three real E2E journeys preserve seven
legacy cases. The eleven-path mounted fixture run passed 19/19 in 33.34 s,
with the five current cases taking 6.76 summed case-seconds. The three
new E2E cases passed in 33.88 s, covering actual project and perspective
history, Settings focus and reload, and a native terminal attachment through
perspective changes and Back/Forward beneath the covering panel. The
corrected typed Pygardon fixture passed its focused session case and final
dashboard typecheck. Exact commands and terminal observations are retained
in `slice-7-return.md`.

| Original case | Current proof |
| --- | --- |
| `development-intent-frame.spec.ts` — Intent keeps the selected project and says no intent locations are configured; project changes, history and reload keep it, and Development resumes the stories | Mounted “Development and Intent keep their names, marks and selected project's published work” confirms initial Development membership and direction, precisely two named radio choices and distinct decorative, hidden marks without labels in the visible spans, no Structure, exact no-locations explanation naming the setting/file, one Intent main without Board/Direction/Start, one added history entry on perspective change, project and route preservation, pinned Doughnut publication revision and its Development stories, direction and Start session. Built “browser history and reload keep the selected project's perspective and Board” proves actual Back/Forward entries, both project states and real reloads on both perspectives, including exclusion of Open Dough's story after the final Doughnut reload. |
| `development-intent-frame.spec.ts` — System settings from Intent returns to the project and Intent with the keyboard on System settings, and Development returns to the roster | Built “Settings and its reload return to Intent and leave Development's roster available.” The addressed Doughnut roster yields to Intent with the retained roster address, the real Settings heading receives focus, and returning by Back focuses System settings and preserves the project/perspective/roster route. Repeat across reload in Settings. The Development choice visibly reopens the roster. |
| `development-intent-frame.spec.ts` — at a phone width the perspective stays reachable under the compact title, and choosing a project there keeps Intent | Same mounted title. At 390×844 the compact button begins with Open Dough, real perspective control stays in the pinned banner, choosing Doughnut's listbox option returns focus to the compact title and keeps Intent and the expected address. The Intent explanation is below the short banner, fits its text, and the document does not overflow sideways. |
| `development-intent-frame.spec.ts` — with the published read failed, Intent still says only that no intent locations are configured, and Development keeps the read problem | Same mounted title. Typed 404 rejects the first publication read; the real alert gives the missing path, absent snapshot and reload guidance and shows no false empty result. Intent describes its own unconfigured locations exactly while the distinct publication alert remains; return to Development still shows the publication problem and no snapshot. |
| `development-intent-frame-keyboard.spec.ts` — perspective keys choose a perspective without choosing another project, and the keyboard never stays in content the change hid | Same mounted title. Native Tab from Sessions reaches Development with painted focus. Right and Left navigate the radios and keep Open Dough checked, Intent text and route are observed. Back from a focused Inspect moves the keyboard to the shown Intent choice. An unmodified page-wide Right from Intent content changes project to Doughnut, focuses its project control and keeps Intent. |
| `development-intent-frame-sessions.spec.ts` — a Sessions sidebar entry from Intent goes to its project's Development stories and session, and the terminal stays attached across perspectives | Same mounted title. Open Dough Intent has both real sidebar entries. Clicking Pygardon moves to that project's Development with one history entry, exposes the matching card and active mark, and focuses Terminal. Switching to Intent keeps that selection, no-locations explanation and same Terminal node. Selecting the current Pygardon entry again from Intent adds one Development history entry, re-reveals its card, keeps it in the reading room, and marks the same entry without replacing the Terminal. The new actual-host E2E records native input/output before and during Intent and retains one host attachment. |
| `development-intent-frame-sessions.spec.ts` — a covering terminal at a phone width stays shown and attached while Back and Forward change the perspective beneath it, and Close shows the perspective the address names on the story it keeps selected | Built “perspective and covering history keep the same terminal attachment and selected story.” After deliberate perspective switches, the real narrow viewport covers the page; browser Back/Forward/Back returns the addressed perspective beneath the still-open terminal. Actual output, the same attachment and selected story survive; Close exposes the addressed Intent, selection and Open Dough project. |

The refactor named the real history actions and moved the same-terminal case
into `e2e/navigation/development-intent-terminal-history.spec.ts`. The two
project and Settings journeys remain in `development-intent-history.spec.ts`.
All three passed across both paths in 37.10 s including preparation. The
retained report is `slice-7-refactor-return.md`.

### Slice 8

The five launch, roster and session frame cases passed in mounted Chromium.
The final two-path selection passed in 6.46 s and dashboard typecheck passed.
The existing dashboard-header case owns delivered PNG bytes and intrinsic
dimensions at the same Sessions control. The three retired harness cases
tested only the removed whole-dashboard mount. The test-support diff from
the baseline removes 860 lines across seven files and adds 33 lines to
BoardView. Separate program inputs and observable browser effects retain
the full map below. Exact commands and aggregate runner records are in
`slice-8-return.md`.

| Retired legacy case | Observed owner and equivalent |
| --- | --- |
| `frame-launch-look.spec.ts` — Start refinement's fields, disclosures, and footer read clearly, with Start the filled action | Same literal title. Mounts the real `StartLaunch` and `LaunchDialog` with a long typed work entry and the offered shape parsed from the shipped refinement options. Native clicks open Refinement options (None selected) and Command details. Exact Instruction label, long subject, command text, named Start and Cancel, every visible text and field/control contrast, decorative Lucide glyphs, and the differing Start fill are observed at 1440×900. |
| `frame-launch-look.spec.ts` — at a narrow window, Start session keeps every control reachable and readable without sideways scrolling | Separate literal title at 420×900. Real project action and modal in the same production frame. The accessible Claude/Open Dough heading and autofocus on the prompt are observed. All visible buttons, inputs, selects, text areas and summaries are natively scrolled and measured against clipping ancestors and the viewport, and center hit testing confirms the target is reachable. Readability and chrome contrast are checked on the actual text and controls. Cancel returns focus to the launcher. Keyboard Enter reopens it and native Tab can reach the prompt and both footer actions. |
| `frame-launch-look.spec.ts` — at 200% zoom, Start session keeps every control reachable and readable without sideways scrolling | Separate literal title with the same controls at 640×450 CSS pixels and native DPR 2, confirmed in the browser and restored after the case. The short viewport independently stresses vertical reach. The shorter layout, no sideways scroll and Tab observations stay separate from the 420×900 result. |
| `frame-launch-look.spec.ts` — the agent roster's heading and Back read clearly and fit a narrow and a zoomed window | Same literal title in `frame-roster-look.spec.ts`. The real addressed `AgentRoster` in its production frame starts with focus on the heading. The real pinned Doughnut publication renders both the source wording and the first agent's typed preparation assignment, including the assigned story. The exact Back to stories action retains one decorative glyph and distinguishable contrast. The heading, source and Back text pass contrast, and the roster has no sideways overflow or cropped words at both 420×900 and 320×256. The existing frame Board look and compact-header observations own surrounding banner and project controls. |
| `frame-sessions-look.spec.ts` — the Sessions sidebar and terminal read clearly, keep their names, and fit a narrow and a zoomed window | Same literal title. Real PageFrame, DashboardBanner, SessionsSidebar and xterm over working and waiting typed execution records. The closed badges show literal accessible names and ordered counts, fit inside their box, and opening exposes both entries. Sessions retains the 32 px decorative product mark, 40 px frame control, hover and native reverse-Tab/Tab tooltip, viewport fit and visible focus outline. The sidebar heading, first row title and elapsed time retain contrast; the open sidebar and visible non-truncated time/heading fit at 420×900 and 320×256. The named working session opens the real terminal, takes focus, and renders the injected boundary output. The long title and exact Execution session metadata keep text contrast. Close and Mark as done retain exact names, decorative 20 px icons, 3:1 icon and outline contrast, and named hover/keyboard tooltips. Both covering sizes keep Close visible, omit Maximize and Restore, refit actual xterm rows within the terminal, and leave the document horizontally still. The row and terminal headings intentionally truncate visually while retaining full accessible names; the existing frame/panel proof owns the rest of the page's geometry. The exact existing legacy dashboard-header case owns PNG bytes, dimensions and real asset delivery. The existing side-panel-terminal-width and development-intent-terminal-history E2Es own real session attachment, continuity and input. |

#### Whole-story measurements

Before scope comes from the plan's measured `37567ec2f` roster. The 28 named legacy paths took 91.46 s for 63 cases (162.07 summed case-seconds), and the three named whole-App Vitest paths took 9.15 s for 11 cases. Total frontend wall time was 100.61 s across the two commands. The six retained composed paths took 30.6 s for seven E2E cases. Before totals were 74 frontend plus 7 E2E across the selected 37 files and 131.21 s across three commands. The historical table recorded 1-minute load 11.41 before legacy and 17.39 before Vitest. It did not split the historical elapsed time into preparation and execution or retain the E2E pre-run load separately.

| Candidate selection | Cases and paths | Wall clock including preparation | Evidence |
| --- | --- | ---: | --- |
| Full mounted Chromium Vitest selection | 69 in 31, 0 in Playwright-only legacy, 0 in Node-only Vitest | 54.066 s at load 15.47, before a local assertion strengthening | `slice-8-roster-frontend.log.run.json`, `slice-8-roster-frontend.json`, `slice-8-roster-frontend-host.txt`. 1.181 s until group reporting starts and 52.616 s under that reporter, including Vitest collection and boot. Aggregate case durations sum to 73.644 s. |
| Full mounted Chromium verification with stronger reachability and actual Start paint | 69 in the same 31 paths | 50.502 s at load 9.35 | `slice-8-roster-frontend-final.log.run.json`, `slice-8-roster-frontend-final.json`, `slice-8-roster-frontend-final-host.txt`. 0.165 s until group reporting and 50.250 s in the reporter. Aggregate case durations sum to 89.647 s. |
| Full built Chromium E2E selection | 19 in 14, of which 7 in the six unchanged retained specs, 2 in the previously existing expanded publication spec, and 10 in seven newly promoted specs | 59.017 s at load 11.50 | `slice-8-roster-e2e.log.run.json`, `slice-8-roster-e2e.json`, `slice-8-roster-e2e-host.txt`. 0.742 s until Playwright reporting starts and another 2.312 s before the first case. |
| Retained Playwright frontend contract, separate exact filter | 1 unchanged Chromium case in `dashboard-header.spec.ts` | 5.840 s | `slice-8-retained-native.log.run.json`, `slice-8-retained-native.json`. This verifies the shared banner case that checks shipped PNG bytes and natural dimensions, plus 32 px decorative rendering and same accessible Sessions control on both project selections. This case is outside both core migration denominators and a separate operational cost. |

Final Vitest destination counts by slice/source family are 13 Board position and height, 10 phone gesture and paging controls, 13 published Board and reading, 6 card selection/dependency/scan, 7 Side panel width, 10 Board/Side panel/Sessions geometry, 5 Development and Intent, and 5 launch/roster/Sessions looks. The 10 newly promoted E2Es are two preference cases in `board-kept-position`, two preference cases in `side-panel-kept-width`, one each in `side-panel-terminal-width`, `board-scrollbar-side-panel`, and `board-session-destination`, two in `development-intent-history`, and one in `development-intent-terminal-history`. Of the 95.970 total E2E case-seconds, 51.162 were the new promoted cases, 39.352 the unchanged cases and 5.456 the two pre-existing publication cases. Summed case durations overlap across two workers. The actual whole E2E invocation increased 28.417 s from the earlier 30.6 s six-path measurement, including preparation, the 10 promotions, and two pre-existing expanded publication cases absent from that old invocation. The difference is not an isolated per-case measurement.

The main hypothesis was that keeping native proof only at the actual page/host boundary and using the production components over typed inputs elsewhere would reduce feedback time even with the promoted costs included. The first full candidate measurement, under higher one-minute load than the 63-case legacy run and close to the 11-case old mounted run, was 113.083 s including all 19 E2Es, against 131.21 s in the historical selection. Frontend-only wall time fell 46.3%, and observed total fell 13.8% with two more pre-existing publication cases on the candidate side. Adding the separate named native check gives 118.923 s. Two workers, AC power, 16 logical cores, and Node 24.21.0 throughout. The second mounted attempt was bounded by the strengthened dialog assertions and corroborated the direction; its host was less loaded, so the more conservative first observation is the comparison above. The observed wall reduction was larger than the mounted difference between the two candidate runs. No extra baseline rerun or broad full-suite timing was used. These are focused local observations, with elapsed time and comparison limitations stated, rather than a CI throughput forecast.

The original slowest named legacy cases took 7.93, 7.57 and 6.83 s for width reload, terminal divider input and hidden long Recently done layout. The final aggregate mounted run's slowest were full native swipes (5.62 s), zoomed published Board reflow (4.12 s), empty-area selection (3.71 s), native keyboard reading and link activation (3.50 s), and native rotation with retained inspection (3.44 s). The slowest built cases were existing Review/Terminal replacement (9.72 s), promoted live terminal width/covering continuity (9.61 s), promoted wide Board preference reload (8.85 s), and promoted Review width reload (7.17 s). They keep independent real layout or true reload purposes.


The roster case moved into `frame-roster-look.spec.ts` during refactoring.
The final roster has the same 69 mounted cases in 32 paths. The complete
timing runs above covered those cases in 31 paths before the split. A
focused post-split run passed the five frame cases in 6.82 s, with dashboard
typecheck passing in 15.53 s. The retained report is
`slice-8-refactor-return.md`.
