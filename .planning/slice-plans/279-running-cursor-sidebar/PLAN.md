# Watch Running Cursor sessions beside the session list

**Identity:** SEED-122#running-cursor-sessions-sidebar-panel
**Source:** [refined story](../../seeds/SEED-122-running-cursor-sessions-sidebar-panel.md#running-cursor-sessions-sidebar-panel).
**Prepared:** 2026-10-08, planning only. Reuse the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/show-running-cursor-sessions-as-a-resizable-side`,
branch `codex/show-running-cursor-sessions-as-a-resizable-side`, starting
revision `9b11a4abc5dff425f9ba90442781fed1390f0add`, and published Preparing
assignment for `joseph-chan`. Publication target: `origin/main`; integration
checkout: `/Users/terryyin/git/open-dough`. No second assignment or workspace.

## Goal and boundaries

A developer can watch the Cursor runner's held sessions while continuing to
use the dashboard's session list. Running Cursor sessions becomes a collapsed
section below that list; expanding gives the two lists independently scrolling
panels with a boundary the developer can resize using mouse or keyboard.

Include the source's existing runner feedback, held-session labels and terminal
navigation, usable focus and small-screen access, collapse restoring the session
list's space, and a preferred size that survives reload without remembering
expansion across reload. Retain both choices across project/view changes and
sidebar toggles within the page. Browser storage is disposable; sizing controls
change presentation only.

Exclude runner stop/restart controls, restart recovery owned by SEED-120, new
filters/grouping, changed session membership or attention rules, changed polling
policy, and a persisted story or server layout record. The refinement's size-only
reload preference remains its stated boundary assumption; this plan adds no
separate developer decision.

## Existing solutions and direction

PFE responsibility: arrange and size two sidebar areas without changing who
owns held-session reads, terminal navigation, or browser preferences.

- **Change the existing sidebar/list composition.** `SessionSidebar.tsx` is the
  only production caller of `RunningCursorSessions.tsx`. `PageFrame.tsx` keeps
  the sidebar mounted across project selection and panel content changes.
  Keep one expansion state with the split's owner; the Cursor listing retains
  its polling, label interpretation and `onOpen` path. Avoid a second list,
  runner reader, global page-state store, or navigation path.
- **Reuse browser preferences directly.** `keptPreference.ts` already tolerates
  missing/refused storage and is used by the sidebar, side panel and column
  paging. Give the sidebar height its own preference; do not reuse the side
  panel width key or persist expansion.
- **Modularize the existing resize mechanism for the two present uses.**
  `SidePanelEdge.tsx` already owns pointer capture, cancellation, focus,
  keyboard increments and accessible bounds. Reuse that technical mechanism
  for a horizontal boundary in slice 2, keeping sidebar height policy distinct
  from the side panel's width/stacking policy in `sidePanelWidth.ts`.
  Preserve the existing terminal, review and final-report callers. No general
  docking system or extra abstraction for future panels is needed.
- **Height policy is the gap.** The sidebar currently scrolls as one area;
  neither `sidePanelWidth.ts` nor `measuredHeight.ts` owns allocation between
  its two lists. Add that allocation beside the sidebar. Measure available
  content height after actual heading/banner/header space, rather than assuming
  a constant banner height; the narrow sidebar includes wrapped banner space.

Relevant current Accepted decisions, checked against the
[ADR index](../../../docs/adrs/README.md) and in-file statuses:
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this feature-local
design and lasting behavior in feature documentation;
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) preserves
session, story and slice meanings;
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports useful increments and one coherent representation of each responsibility.
The index and record statuses agree: 0000–0006 are Accepted; 0007–0009 remain
Proposed. No relevant supersession, conflict or exception was found.

Follow the existing Sessions-sidebar direction in
[Dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md),
[navigation](../../../docs/dashboard-navigation.md), and
[terminal/local record actions](../../../dashboard/AGENT-LAUNCH-TERMINALS.md).
Layout preferences remain disposable browser state, runner evidence remains
live local evidence, and neither becomes published story progress. Existing
direction suffices; add no North Star topic or ADR.

## Decisive premises and observations

Observations were made on the starting revision plus the retained seed edit,
with Node 24.5.0 and the lockfile's Playwright Chromium fixture. Dependencies
were installed with `env -u NODE_ENV npm ci --ignore-scripts --no-audit --no-fund`,
which avoids the repository's shared Git-hook configuration write.

| Premise | Operation consuming it | Observation and result |
| --- | --- | --- |
| Held rows name current screens and open the runner's existing client without spawning another | Slice 1's relocated listing and row action | Read `cursor-runner-sessions.spec.ts`, its `holdSession`/`showPage`/`openRunningList` setup, `cursorStart.ts` and `fakeCursor.ts`; baseline A below ran all six cases. Working, waiting, trust, follow-up, stopped and unreachable cases passed, including unchanged attach PID and invocation count. |
| Reading feedback, unreachable recovery and running-with-no-held-sessions are already supported by the real UI reader | Slice 1 preserves feedback | Temporary observation D below passed: a held real fake-client record supplied the valid answer; held HTTP replies exposed Reading; subsequent unreachable, restored and running-empty replies changed the rendered list/status without another attach or create-chat. HTTP replies supplied external preconditions; this observation does not prove runner recovery or label detection. |
| Held-row navigation uses the existing narrow-screen overlay/focus path | Slice 1 preserves selection at narrow width | Temporary observation C below passed at 700×900: selecting the real held working row hid the sidebar, focused the terminal, showed the held client's screen and preserved its PID. `PageFrame.tsx`'s `goToSession` calls `closeOverPage` and `openSession` for either list. |
| Existing sidebar state and accessible frame behavior remain usable across page changes, terminal actions and small viewports | Slices 1–3's mounted state and geometry | A passed every `session-sidebar*.spec.ts`; E passed the paging-sidebar, header and frame-look consumers, including 320×256 zoom-equivalent geometry. `PageFrame.tsx` renders the same unkeyed sidebar above selected-project content. New two-panel geometry still belongs to slice 1's proof. |
| Existing gesture and browser storage behavior can be reused | Slices 2–3 | A passed `side-panel-width*.spec.ts`: mouse/key bounds, cancellation, storage refusal, invalid values, reload and preferred-width recovery. E passed terminal/review/final-report replacement consumers. Search found `SidePanelEdge` in `TerminalPanel`, `StoryReviewPanel`, and `SessionResultPanel`; height allocation is a new policy, not an already-proven width reuse. |
| The fixture can supply many distinct held processes simply by launching repeatedly | Overflow proof setup | Reading `fakeCursor.ts` disproved this: it emits one fixed `cursorSessionId`. Use distinct saved records and validated runner-answer preconditions for crowded-list geometry; retain real runner/client proof for actions. Do not add multi-agent fixture machinery for this story. |
| The progressive Cursor navigation journey can preserve its read/reveal/focus assertions with explicit starting preconditions | Slice 1's preservation proof | A failed the initial read-count assertion; B passed alone. Fresh controlled observation F reproduced the extra story-12/13 reads when catalog data arrives before machine-session data, and completed the same chosen-row journey. Holding the catalog until the real saved sessions are consumed passed the original initial read-count, prefix-through-27, delayed reveal and return-focus assertions, alone and in F's affected selection. This controls setup, not production reading behavior. |
| An 8rem content floor can accommodate current status and a held row | Slice 2's ordinary-height lower bound | G measured the existing runner content at 1440×900 for real working, waiting and trust fixtures: each status-plus-row body fit within 8rem, and choosing still opened the same client. The new split, crowded scrolling and smaller viewports remain slice-owned proof. |
| Alerts, unread marks, ordinary membership and maximized-panel adjacency have distinct consumers | Slice 1's retained list meanings; slice 2's shared edge | Product-wide search found the alert, unread-report, membership, terminal-maximize and done-report consumers in H. All their sidebar observations passed, as did progressive reset and the repeated sidebar persistence/refused-storage suite. H's separate column-delete case failed before its action, without opening the sidebar; it supplies no sidebar proof. |

Commands from the workspace root (G reproduces the measured cases):

```sh
# A: 30 passed, 1 failed; 31 checks, 1.1 minutes.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=2 --reporter=line dashboard/tests/cursor-runner-sessions.spec.ts dashboard/tests/session-sidebar*.spec.ts dashboard/tests/side-panel-width*.spec.ts dashboard/tests/recently-done-progressive-navigation-cursor.spec.ts dashboard/tests/recently-done-progressive-state.spec.ts

# B: the failed navigation consumer, alone: 1 passed, 3.2 seconds.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=1 --reporter=line dashboard/tests/recently-done-progressive-navigation-cursor.spec.ts

# C: narrow held-row observation: 1 passed, 2.7 seconds.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=1 --reporter=line dashboard/tests/cursor-sidebar-planning-observation.spec.ts --grep 'a working screen'

# D: rendered feedback/recovery observation: 1 passed, 3.1 seconds.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=1 --reporter=line dashboard/tests/cursor-sidebar-planning-observation.spec.ts --grep 'read feedback'

# E: 17 passed; the feedback observation initially failed before its journey
# because its API setup omitted Origin. D corrected that setup and passed.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=2 --reporter=line dashboard/tests/cursor-sidebar-planning-observation.spec.ts dashboard/tests/frame-sessions-look.spec.ts dashboard/tests/dashboard-columns-paging-sessions-sidebar.spec.ts dashboard/tests/dashboard-header.spec.ts dashboard/tests/story-panel-switching.spec.ts dashboard/tests/story-panel-replacement.spec.ts --grep 'read feedback|shared frame|one side panel|sidebar|banner|terminal|review'

# F: both controlled navigation journeys passed; 31 passed overall, with
# one sidebar suite's afterAll Git-fixture cleanup exceeding 30 seconds.
# H re-ran that suite with one worker: both cases and cleanup passed.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=2 --reporter=line dashboard/tests/cursor-runner-sessions.spec.ts dashboard/tests/session-sidebar*.spec.ts dashboard/tests/side-panel-width*.spec.ts dashboard/tests/cursor-navigation-readiness-sessions-first.spec.ts dashboard/tests/cursor-navigation-readiness-catalog-first.spec.ts dashboard/tests/recently-done-progressive-state.spec.ts

# G: three real held-row bodies fit within 8rem; 3 passed, 4.8 seconds.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=1 --reporter=line dashboard/tests/cursor-sidebar-minimum-readiness.spec.ts --grep 'a (working|waiting|trust) screen'

# H: 13 passed, 1 unrelated column-delete setup failure; 1.2 minutes.
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS npm run test:dashboard -- --workers=1 --reporter=line dashboard/tests/session-sidebar-stays-as-left.spec.ts dashboard/tests/session-alerts-unavailable.spec.ts dashboard/tests/session-unread-report.spec.ts dashboard/tests/session-column-membership.spec.ts dashboard/tests/recently-done-progressive-reset.spec.ts dashboard/tests/agent-terminal-maximize.spec.ts dashboard/tests/agent-terminal-done-report.spec.ts

```

The observation specs were disposable and are removed after planning. To reproduce
C, copy `cursor-runner-sessions.spec.ts` beside itself, set the working-screen
case's viewport to 700×900 before `holdSession`, and after `row.click()` assert
sidebar hidden and focus inside the terminal in addition to the original PID,
screen and invocation assertions. For D, use the same working-screen fixture;
read `/__agent-launch/cursor-sessions` with `Origin: dashboard.baseURL`, hold
page replies until Reading is visible, then release the valid answer. Change
the supplied replies to unreachable/empty, the original answer, and
running/empty; assert each rendered status/list and unchanged client calls.
These observations consume the real client/schema/rendering and navigation;
they are not proof of the proposed split or resizer.

To reproduce F, copy `recently-done-progressive-navigation-cursor.spec.ts`.
For the sessions-first case, hold real `authenticatedReadEndpoint` requests
with `done=catalog`; wait for `#session-sidebar` (even while hidden) to contain
“No sessions launched from this dashboard are open.”, then release the catalog.
After the merged first ten entries render, retain the original destination-
absence and initial record-count assertions and the entire row-selection,
held-record, reveal and return-focus journey. Release both held catalog and
story requests in `finally`, including on an assertion failure. The corrected
setup also passed alone (one worker, 3.2 seconds).

For the diagnostic catalog-first case, use `holdSessionReads(page)` before
opening. Wait for the first ten catalog-only stories and their real body reads;
that prefix includes stories 12 and 13. Release the saved-session reads and
observe the merged first ten, then run the original row-selection journey.
Only this diagnostic's initial count reflects the catalog-only precondition;
its through-27, no-older-read, reveal and return-focus assertions are unchanged.
This ordering completed four times in a two-worker diagnostic run, then in F.
For G, copy the three real working/waiting/trust cases in the runner spec and
measure the expanded section's direct content body against the root font size.

The production startup ordering is unchanged and is outside this sidebar
story. H's column-delete failure was at `session-column-membership.spec.ts:243`:
after reload it found no local Taken entry for “State unknown”, before Delete
or any sidebar action. It is retained as a baseline limit, not accepted proof
or a proposed repair here. These failures do not leave an unobserved premise
for this story after F and H; do not claim an entirely green baseline.

No paid, credentialed or shared-machine probe is required. Run dashboard suites
sequentially in this workspace: their build and trace directories are shared.

## Outside-in proof ownership

| Final promise / source example | Owner | Observable proof |
| --- | --- | --- |
| Collapsed header below ordinary sessions; expand into two areas; collapse returns room and useful focus (1, 5) | 1 | New `cursor-sidebar-panels.spec.ts`: section order, keyboard disclosure, content geometry, collapse and focus. |
| Each crowded list scrolls independently (3) | 1 | Crowded saved-session and held-answer preconditions; scroll each actual content area, assert its last row reachable and the other area's `scrollTop` and position unchanged. |
| Existing labels, Reading, stopped/unreachable, empty-running and later successful read; choosing an existing terminal (2, 6) | 1 | Existing real runner spec plus a retained feedback-transition case and wide/narrow held-row cases in the new panel spec. Verify the same PID and no new launch/attach on presentation actions. |
| Mouse/key changes are bounded, announced and end on release/cancellation (4) | 2 | New `cursor-sidebar-resize.spec.ts`: actual heights during drag, off-edge release, cancellation, both bounds, horizontal separator name/value and visible keyboard focus; Up grows Cursor, Down shrinks it. |
| Narrow, short and zoomed controls/lists remain reachable (7) | 1, 2 | Panel spec owns fixed-split access; resize spec owns both extremes at ordinary height and reduced-height fallback, including 320×256. Reach last rows and collapse control by scrolling/keyboard, without sideways overflow. |
| Expansion/size survive same-page project/view/sidebar changes and re-expansion; size survives reload, expansion does not (5, 8) | 1, 3 | Panel spec owns expansion across navigation/toggles; new `cursor-sidebar-size-kept.spec.ts` owns resize followed by collapse, toggles, project/view changes, reload and re-expansion. |
| Missing/invalid/refused storage still allows resize; smaller room does not overwrite preference (7, 8) | 3 | Size-kept spec: fresh context, malformed/nonpositive/nonfinite size, refused storage, viewport constraining/recovery, unchanged other preference keys and no page error. |
| Presentation controls change no story/session/agent facts | 1–3 | Real held-client cases retain call/PID records and saved launch facts across their owning actions; disclosure/resize causes no launch, mark-done, delete, or runner-control request. |
| Existing side-panel edge remains correct after sharing its mechanism | 2 | All `side-panel-width*.spec.ts`, switching/replacement consumers; add a final-report resize assertion to the existing replacement journey. |

## Ordered slices

### 1. Watch both lists in independently scrolling collapsible sections
Type: Behavior
Status: done
Accepted proof: `cursor-sidebar-panels.spec.ts` (layout, equal share,
independent scrolling, keyboard collapse/focus, 320×256 reach),
`cursor-sidebar-panels-navigation.spec.ts` (wide/narrow held-row terminal with
unchanged PID/calls; expansion across project, System settings, sidebar toggle;
reload collapsed), the feedback-transition case in `cursor-runner-sessions.spec.ts`,
and the sessions-first gate in `recently-done-progressive-navigation-cursor.spec.ts`
with its original assertions. After refactoring, 51 sidebar-consuming specs
passed (126 tests); typecheck clean.
Learnings for slice 2: the fixed split lives in `.session-sidebar` /
`.running-cursor-open` grid row templates (fourth row is the resize hook
point); the Cursor section spans rows 3–4 with `subgrid`, so header/content
spacing sits on the header's margin, not a row gap. The 8rem floor and equal
share held at 1440×900. Use `expectNoSidewaysScrollAndWholeText` (not
`expectNoSidewaysScrollIn`) on the sidebar. Shared fixtures live in
`runningCursorSessionsPage.ts`; crowded held rows need UUID `sessionId`s.
CI repair (run 38010086816, `dashboard (3/9)`): `published-work.spec.ts`'s
no-live-claim check reads the whole body's text, hidden sidebar included;
moving the section header below the list exposed “Running” at a word boundary.
The check now sets the Sessions sidebar's text aside as it does Recently done.
Consumer searches for sidebar changes must include whole-body text checks.
CI repair (run 38024406264, `dashboard (4/9)`): unrelated timing flake in
`agent-launch-done-prompt.spec.ts`. Its succeeding rename had to fit an 800 ms
composer delay, 600 ms of key pauses and process start-up inside one 2 s
deadline (`server/hosts/claude/rename.ts`); it now uses its own server with a
30 s wait, which success never waits out. Other done specs with short waits
and a successful rename keep wider, still wall-clock, margins.
Proof: Add `cursor-sidebar-panels.spec.ts` and a focused feedback-transition
case to the existing runner proof. Run the runner and complete sidebar suites,
the two progressive Cursor consumers, and the frame/paging/header consumers
named in A and E. Correct the navigation consumer's startup setup using F's
sessions-first gate before accepting its proof; keep its original initial
read-count and full chosen-row assertions. This small fixture correction is
part of this slice's preservation loop, with no Recently done production edit.
Run the alerts and unread-report suites from H as distinct list meanings;
retain H's terminal done-report/maximize and progressive-reset observations
for changed frame/helper consumers. Ordinary membership/order is owned by the
complete sidebar suite; H's column-delete case does not observe the sidebar.
Assertions must separate ordinary `.sidebar-entry` rows from held Cursor rows
when both are shown; preserve each consumer's actual purpose. Launch-host and
record-deletion tests that use the same ordinary-row helper need their existing
row-selection/count purpose preserved, not new agent-launch proof. Recheck all
helper consumers if its contract changes during implementation.

Behavior: The developer opens Sessions → the ordinary list fills the available
space above the collapsed Cursor header. Expanding → both content areas have
useful room and independent scrolling; existing runner feedback and held rows
appear. Selecting a held row → the existing terminal/navigation/focus path
runs, including closing the narrow overlay. Collapsing → content space returns
to the ordinary list and focus remains useful on the header. The expanded
choice survives project/view switches and hiding/reopening the sidebar.

Change the existing composition and CSS, retaining one listing/read owner and
one expansion choice. Keep alerts/loading/empty feedback with their existing
list meanings. In ordinary height, start at an equal share of the available
content budget with space for both controls and a usable row. In a short or
zoomed viewport, allow sidebar scrolling to reach the two areas and disclosure
without forcing an unreachable layout. Update the corresponding North Star
Sessions row, navigation text and terminal/local-record wording in this slice.

Interim behavior: the expanded split is fixed; no resize control is offered
yet. Slice 2 replaces the fixed allocation with bounded user sizing, and slice
3 adds reload recovery of that chosen size.

Safe stopping point: both lists can be inspected without replacing one another;
disclosure and all existing session actions remain usable.

### 2. Resize the two panels with the mouse or keyboard
Type: Behavior
Status: done
Accepted proof: `cursor-sidebar-resize.spec.ts` (mid-drag heights, off-edge
release, cancellation, both bounds with each list in reach, separator name and
values, focus, Up/Down), `cursor-sidebar-resize-lasting.spec.ts` (too-short
fallback with a disabled edge, recovery of the chosen split, 320×256 reach;
split kept across collapse, project, System settings and sidebar toggle), and
the final-report resize step in `story-panel-replacement.spec.ts`. 46 consumer
specs passed (112 tests) before refactoring; the 13 specs the refactor
reached passed after it (27 tests); typecheck clean.
Learnings for slice 3: the preference is `preferred` in
`useRunningCursorHeight` (`runningCursorHeight.ts`); `choose`, called only by
pointer and key handlers, is its one writer and stores the value clamped to
the bounds at that moment, as `sidePanelWidth.ts` does. Room measurements
never write it. Initialise it from `readKept` and `keep` inside `choose`.
`sharedRoom.ts` holds the arithmetic both policies share; the 8rem floor is
read from `--sidebar-list-floor`. The room is fractional, so tests derive
`aria-valuemax` with `Math.floor`. Helpers: `cursorSidebarResizePage.ts`.
`SessionSidebar.tsx` is near the 250-line limit.
Proof: Add `cursor-sidebar-resize.spec.ts`, keeping slice 1's proof green.
Observe geometry during movement, independent scrolling at bounds, off-edge
release and cancellation, focus and named accessible values, and small-height
recovery. Run the existing side-panel-width and switching/replacement suites
because the current edge mechanism gains a second consumer. Keep the
terminal-maximize and progressive-reset consumers from H green: maximized and
stacked panels omit the width edge, and resizing does not reset Recently done.

Behavior: Both areas are expanded → dragging their boundary upward grows the
Cursor area and reduces the session area immediately. Up on the focused
boundary has the same effect; Down reverses it. At either bound both areas stay
reachable. Pointer release/cancellation ends resizing. Collapse/re-expansion
and same-page sidebar/navigation changes retain the chosen split, and leave
the client/session facts unchanged.

Use a horizontal, focusable boundary named Resize Running Cursor sessions,
reporting its height and bounds. Reuse the existing pointer/focus/keyboard
mechanism for the sidebar and the side panel while keeping their allocation
policies separately owned. Begin with an 8rem usable floor for each content
area and a 2rem keyboard step; verify a normal entry, runner status and control
remain reachable with current typography, adjusting the floor if the rendered
proof disproves it. Derive the maximum from measured available room and the
other area's floor. If the room cannot accommodate both floors, use the
scrollable fallback, disable a meaningless resize range, and restore resizing
when room returns. Constraining geometry does not replace the developer's
preferred size. Match existing focus/contrast conventions and document the
boundary, keys, bounds and fallback in navigation guidance.

Interim behavior: the preferred size lasts for this page; slice 3 adds its
disposable browser persistence. The current side panel retains its width
semantics, keys, name and stacking behavior.

Safe stopping point: both panels resize accessibly for the page's lifetime.

### 3. Recover the preferred size without reopening the section on reload
Type: Behavior
Status: done
Accepted proof: `cursor-sidebar-size-kept.spec.ts` (kept across collapse,
sidebar, project and view; reload starts collapsed and expansion recovers the
height; fresh context default; constrained room leaves the stored value; other
keys intact) and `cursor-sidebar-size-unkept.spec.ts` (malformed, nonpositive
and nonfinite values default; refused storage still resizes without page
errors). 29 consumer specs passed (61 tests) before refactoring; the 13 specs
the refactor reached passed after it (25 tests); typecheck clean.
Learnings: the key is `open-dough.sessionSidebar.runningCursorHeight`;
`usePreferredSize` in `sharedRoom.ts` now owns the kept-number read rule and
write for both the sidebar height and the side panel width, each keeping its
own key. `watchPageErrors` lives in `tests/pageErrors.ts`.
Proof: Add `cursor-sidebar-size-kept.spec.ts`, using the real browser storage
and reload boundary. Check fresh/invalid/refused storage, constrained room,
returning room and another browser context. Keep the panel/resize and existing
sidebar preference proofs green; reuse side-panel storage proof if the shared
preference helper is changed.

Behavior: The developer resizes, collapses, toggles the sidebar or changes
project/view → re-expansion restores the chosen split. Reload → the section
starts collapsed, then expansion recovers this browser's preferred height.
Less room fits the visible size without overwriting that preference; more room
restores it. With no usable storage, resizing still works for the page without
errors or loss of any session or story fact.

Use `readKept`/`keep` for one sidebar-height key. A finite positive height is a
preference that may need fitting to the current room; malformed, nonpositive
or nonfinite values use the default. Store user choices, not resize-observer
constraints or expansion. Leave sidebar-open, side-panel-width and column
paging preferences intact. Complete the preference/fallback documentation in
navigation and the North Star Sessions wording.

Safe stopping point: the full story's presentation behavior is delivered.

## Execution complete

Product advice: no change to this story's promises or to queue priorities. One
recommendation for wrap-up: consider a small story that makes the remaining
Claude done-rename specs independent of wall-clock margins. This execution's
CI repair (`722a7b36`) fixed `agent-launch-done-prompt.spec.ts`, where a
succeeding rename had to fit inside one 2 s deadline; `agent-launch-done.spec.ts`,
`agent-launch-done-rename-wait.spec.ts`, `agent-launch-done-question.spec.ts`
and `agent-completion-quiet-claude.spec.ts` still expect a successful rename
inside a 2–3 s wait, with wider margins and no failure observed. The outcome
review found no correction for the delivered sidebar behavior.

## Verification, delivery and sizing

The stable proof boundary is the production dashboard served by the existing
isolated Playwright fixtures. Crowded HTTP-answer fixtures supply external
list preconditions only; real held-client fixtures own process/action proof.
No real Cursor invocation, external GitHub request or manual paid run is needed.

Use the literal environment cleanup and `npm run test:dashboard` command shape
above with the owning specs and affected suites for each slice. Run
`env -u NODE_ENV npm run typecheck:dashboard` after component props, shared-edge
contracts or measurement types change; that is focused integration proof for
the changed TypeScript contract. The hosted CI dashboard checks in
`.github/workflows/ci.yml` are not an extra local all-suite gate. Source skills
and installation payload are unchanged.

Authorized execution follows the existing
[execute-plan workflow](../../../.agents/skills/dough-execute-plan/SKILL.md)
for proof acceptance, post-change refactoring, selective formatting, commit,
delivery and asynchronous CI ownership. Required proof and local cleanup stay
within each Behavior slice. Planning supplies no Take, execution, commit,
publication, landing or retirement authority.

No numeric slice target/hard limit was supplied. Slice 1 has one loop for
usable two-list observation; slice 2 has one loop for bounded sizing, including
the immediately needed mechanism sharing and regression proof; slice 3 has one
loop for recovering a preference across browser lifetime boundaries. There is
no separate fixture, CSS, refactor, documentation or test slice. If implementation
disproves the geometry/sizing assumptions, update the remaining plan from that
evidence under ordinary sizing guidance; do not silently weaken source promises.

## Preparation review

Cumulative design: one held-session reader, one existing terminal-navigation
path, one expansion choice, one preferred sidebar height, one reusable boundary
mechanism and two independently justified allocation policies. The examples
exercise this model rather than adding state-specific layout handlers.

Slice-plan refinement ran in place. All three Behavior boundaries are
**Retain**: each has one cohesive outcome and proof loop, useful interim value,
and a safe stopping point. No slice was replaced, added or removed; there are
three slices, no sizing exception, and no resplit recommendation.

The initial slice-1 concern is resolved by fresh F observations: the failure
preceded Cursor selection and depended on startup data ordering. The plan now
makes that regression's starting precondition explicit without weakening its
original assertions or expanding into production startup repair. The repeated
sidebar persistence observation in H passed with cleanup; H's unrelated column-
delete setup failure remains a stated baseline limit. New split/resizer behavior
is planned proof, not claimed as already implemented.

The current story's goal, scope and eight examples align with the three slices;
every final promise has an owner, existing behaviors the approach relies on
have been observed, and no blocking preparation concern remains. The plan is
**ready for direct execution**, recorded through the shared recorder against
the current story and plan digests. Separate execution authorization is still
required. The plan and seed remain unpublished drafts in the retained preparation
workspace; the existing Preparing assignment remains published.
