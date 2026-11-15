# Swipe between story board columns on mobile

**Identity:** SEED-373#swipe-between-story-board-columns
**Source:** [Swipe between story board columns on mobile](../../seeds/SEED-373-swipe-between-story-board-columns.md#swipe-between-story-board-columns)

## Goal and scope

A developer on a phone swipes across the Development Board to read Backlog,
Taken, and Recently done. Much thinner functioning edge indicators give more
room to stories. Swipe left advances one column, right returns one, and the
view stops at the ends. Preserve vertical reading, taps/actions, selection,
open detail, focus reveal, chosen position through resizing, and reduced motion.

No Board redesign, story reordering, membership changes, drag-and-drop,
terminal/Side panel gesture changes, or continuous finger-following promise.
Smooth animation is desirable, without an animation-smoothness automated gate.
This plan supplies no execution authority.

## Existing solution and architectural fit

PFE at `3925a4ef8ca8cf4f0bf6f03b201a78c24d2ec0e8`:

| Responsibility | Existing owner and disposition |
| --- | --- |
| Which columns show, boundaries, retained choice, focus reveal and reduced motion | Reuse `dashboard/src/columnPaging.ts` and its `move` operation. Swipe and buttons must not acquire separate position or persistence models. |
| Board input and presentation | Extend the existing `Board.tsx`/`board.css` boundary. Keep gesture recognition local to the Board reading area, with cancellation/direction handling separate from paging state when needed for cohesion. |
| Hidden-column alternatives | Change `ColumnPagingControl.tsx` and the mobile CSS width rule. Preserve button semantics, accessible neighboring-column names/counts, focus indication and the existing keyboard handoff. |
| Existing touch implementation elsewhere | `terminalTouchScroll.ts` translates finger motion into terminal scrollback/application wheel steps. Its domain differs; leave that owner and its event handling alone. No product-wide gesture framework is warranted. |
| Native input proof | Reuse `dashboard/tests/touchGestures.ts` for real Chromium touch input and `boardColumnNavigation.ts`/`boardPage.ts` for paging and observed geometry. Use the built-app frontend fixture with substitutes at backend service boundaries. |

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts):
the Board contains Columns; paging changes the view, never recorded membership
or the selected story. Follow [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
using the comparison below. The existing [visual and accessibility direction](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
and maintained [navigation guidance](../../../docs/dashboard-navigation.md)
already own narrow-screen reading. No consequential architecture choice,
new North Star topic, persistence, stack, or ADR exception is needed.

The developer's 2026-11-15 instruction explicitly changes Column paging's
44px touch-width expectation. This is a scoped product tradeoff: swiping is
primary, thinner buttons remain alternatives. Keep 44px checks for unrelated
controls. Preserve visible direction and complete accessible names; compact
visible labeling as necessary without clipping text into the story area.

Expected product owners are below the 250-line check: `Board.tsx` 139,
`columnPaging.ts` 214, `board.css` 206, `ColumnPagingControl.tsx` 37.
Focused support owners: `boardColumnNavigation.ts` 110,
`touchGestures.ts` 123, `controlReachability.ts` 182. Keep new cases in focused
specs and recheck actual edited files during execution.

`docs/dashboard-navigation.md` is already 261 lines and needs an edit. Slice 2
owns a cohesive extraction: move the current touch browsing, selected-story,
and Board column semantics paragraphs into `docs/dashboard-board-interaction.md`,
leaving a navigation link and preserving meanings and incoming links. The main
navigation file continues to own route/reveal and frame navigation; both files
must remain below 250 lines. The 314-line UX/UI North Star needs no edit:
its instruction not to require precise taps is satisfied by the swipe route.

## Decisive premises and preparation observations

Observed in this owned checkout at `3925a4ef8ca8cf4f0bf6f03b201a78c24d2ec0e8`
on 2026-11-15. `npm ci --ignore-scripts` supplied missing dependencies. Runs
used one worker on this Mac, fully awake on AC under `caffeinate -s -i`;
load was 11.23/11.91/12.11 with 56% free memory and other agent work present.
Focused runs were appropriate; no full suite or load-isolation claim.

| Premise and consuming operation | Observation in the form/profile used | Result and remainder |
| --- | --- | --- |
| The current mobile app needs swipe navigation and can use existing paging (slice 1). | Command A opened the real built frontend at 390×844 with native touch enabled. A native leftward 180px finger stroke across `.board-view` was followed by browser frames and a view-state observation. It then tapped Taken and Backlog controls. | Swipe left the position unchanged; both control moves reached their intended columns. Paging is usable; the gesture route is missing. New gesture behavior remains slice 1's proof obligation. |
| Controls reserve substantial room on the consuming touch profile (slice 2). | Command A measured the rendered Taken control in that same phone profile. | Exactly 44px width. This is the before comparison, not a prescribed new width. |
| Keyboard handoff, reduced motion and phone/tablet paging have working baseline routes (both slices). | Command B exercised three maintained integrated app cases: keyboard through a disappearing control, reduced-motion paging, and native taps down a long Board across phone/tablet widths. | Three passed with strict verdict passed. New swipe and narrower-width assertions still need their own discrimination. |
| Existing tests observe the affected controls through enclosing assertions (slice 2). | Read `boardPage.ts`'s `expectView` geometry/text checks, `boardColumnNavigation.ts`'s accessible-name locators, and `controlReachability.ts`'s native tap/clipping/44px checks, then ran Command B through them. | Width is enforced by shared support, not just CSS. Keep whole-text and destination semantics; give only column indicators a named smaller-target tap route. Do not weaken all touch checks. |

```sh
# A: disposable frontend baseline probe, strict passed, 1 case, 10.2 seconds
OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/seed373-baseline-clean-proof.json caffeinate -s -i npm run test:dashboard:frontend -- board-swipe.spec.ts --workers=1
# B: maintained paging baselines, strict passed, 3 cases
OPEN_DOUGH_DASHBOARD_INTEGRATED_PROOF_RECORD=/tmp/seed373-navigation-proof.json caffeinate -s -i npm run test:dashboard:integrated -- navigation/board-paging.spec.ts navigation/accessible-board-touch.spec.ts --grep 'from the keyboard|with reduced motion|comfortable Column' --workers=1
```

Command A is retained preparation evidence: its disposable spec and helper
were removed before seed/plan writes. Execution creates maintained cases for
the new behavior, rather than treating the baseline probe as final acceptance.
Command B remains replayable. No scratch product edit remains. No paid,
credentialed, physical-device or developer-operated probe is required for this
bounded browser behavior; emulation does not establish physical-device feel.

## Outside-in proof ownership

| Final promise | Owner and observable proof |
| --- | --- |
| Left/right traverse Backlog → Taken → Recently done and return, stopping at both ends | Slice 1: real native finger strokes in the built app; assert the intended whole column and its heading are in view after each move, with no blank space or page-wide sideways scroll. |
| Vertical scrolling and ordinary taps still work; a swipe activates no underlying card/action | Slice 1: native vertical strokes on a long Board change its reading position without paging; tap Inspect normally; swipe starting over a card and an action, checking destination, unchanged selection/detail and zero launch requests at the independent service boundary. |
| Incomplete/cancelled movement does not page | Slice 1: short movement and native cancellation followed by a fresh valid swipe; assert no earlier move or stray activation and successful recovery. Leave browser multi-touch/zoom unclaimed by a single-finger recognizer. |
| One shared position across controls, swipes and rotation; open detail survives | Slice 1: swipe, use the reverse control, rotate portrait → landscape → portrait, and check the retained column choice/detail using existing width rules. Retain keyboard/focus-reveal and kept-position regression journeys. |
| Reduced motion remains available | Slice 1: the swipe reaches its destination without a transform transition when reduced motion is requested; reuse existing control baseline. No animation-smoothness test. |
| Thin indicators free horizontal reading room and still function | Slice 2: compare phone widths against the 44px baseline; demonstrate a marked reduction and increased story/view width at Taken with both sides present. Native taps on both thin targets still page; an end has no outward control. |
| Direction, destination names, keyboard access and readable content remain available | Slice 2: inspect phone rendering for understandable directional cues; assert complete accessible destination names/counts, keyboard activation/handoff and visible focus. Reuse whole-text/overflow checks without requiring compacted text to remain visually verbose. |
| Desktop navigation and unrelated touch targets retain their behavior | Both slices: wide three-column and narrow mouse/keyboard paging regressions, plus the existing control-reachability observations and phone reading/rotation cases reached by the change. Side panel/terminal input remains outside the Board handler. |

## Ordered slices

### 1. Swipe through the Board without disrupting reading
Type: Behavior
Status: planned
Proof: Swipe promises above in new `dashboard/frontend-tests/board-swipe.spec.ts`,
through the built frontend and native Chromium input; maintained paging,
kept-position and focus/reveal consumers remain green.

Behavior: Given a phone Board with hidden columns, a deliberate horizontal
swipe shows the neighboring column in that direction, one step per completed
gesture and clamped at either end. Vertical reading, ordinary taps and open
detail remain usable; swiping does not select a story or activate its actions.
Cancellation recovers cleanly. Switching to controls or rotating preserves
the same chosen view; reduced-motion users need no slide.

Add only Board-local gesture recognition and call the existing paging owner.
Keep thresholds/direction arbitration with the gesture owner and position,
boundaries and motion policy with paging. Guard the completed swipe's ensuing
activation without suppressing ordinary taps. Bind native gesture handling so
vertical scrolling and browser gestures remain available; do not attach it to
the page frame or Side panel. Reuse the existing native-input test support.
Record swipe behavior in the focused Board interaction documentation that
slice 2 links into navigation. One gesture-to-view proof loop; target
15 active minutes, commands excluded. Interim: the existing wide controls
remain functional until slice 2 reduces their footprint.

### 2. Give stories room with thin working column indicators
Type: Behavior
Status: planned
Proof: Indicator promises above in new
`dashboard/frontend-tests/board-indicators.spec.ts`, plus affected maintained
phone reading, paging, keyboard, overflow and control-reachability consumers.

Behavior: Given Taken shown on a phone, both hidden-direction indicators take
markedly less room, exposing more story width, and each still responds to a
native tap and keyboard activation. Their destinations update after a swipe;
the first/last column offers no outward destination. Names remain available
without hover and focus remains visible.

Reduce the mobile reservation in `board.css`, keeping non-mobile behavior and
the same navigation state. Tune the thin cue and compact its visible label
only as needed, retaining complete accessible names/counts. Use rendered
geometry to choose a width substantially below 44px rather than merely
removing the coarse-pointer expansion to 28px. Keep the narrower target's
native tap observation with the Board's focused test owner; extend the shared
touch helper only if that preserves all other controls' existing 44px gate.
Update reached existing touch cases to use that explicit Board operation.
Complete the navigation-document extraction above and record the scoped width
exception, shared swipe/button behavior, and comparison limits. No global
minimum-target relaxation. One compact-navigation proof loop; target
15 active minutes, commands excluded.

## Verification and consumer trace

Before test changes apply [AGENTS.md test automation](../../../AGENTS.md#test-automation),
MakeMe and page-object selection. The selector resolved both rules enabled for
the two new frontend paths and the existing `accessible-board-touch.spec.ts`.
Reuse domain builders, built-app service substitutes, focused Board page
operations and real lower-level UI/paging. Keep expected destinations, gesture
directions and independent launch/request evidence visible in scenarios.
Do not substitute the paging state or assign DOM positions to establish success.
Use default test timeouts; no `test.slow()` or group/file/hook override.

Local gates: new focused frontend specs; the complete affected Board navigation
family (`navigation/board-paging`, `board-kept.spec.ts`, `board-height.spec.ts`,
and `accessible-board` under the integrated configuration while maintained
there), plus reached frontend control-reachability consumers;
`npm run typecheck:dashboard`, `npm run build:dashboard`, and changed-file lint.
For each new proof, disable its claimed gesture/width behavior in a scratch
change and observe failure, then restore and pass. Check native vertical input,
not only synthetic DOM events. Observe rendered directional cues and keyboard
focus on phone widths as part of slice 2's UI acceptance; do not infer physical
device usability or animation quality from Chromium emulation.

Use current configuration/path locations if the active integrated-test retirement
work has moved these cases by execution time; preserve their promises rather
than creating duplicate integrated coverage. Before expensive proof, inspect
load, memory and competing work; start focused at one worker. The local gate
uses the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, lid open under
`caffeinate -i`, then inspect the sleep log. No full repository suite is needed
for this preparation's Markdown changes.

Follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for every local/CI failure, carrying that link into delegation and
repair handoffs. Execution retains its applicable final CI ownership.

Each slice runs the installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD` and effect terms including
`columnPagingControl`, `tapWhereShown`, `expectView`, `showColumn`, and the new
swipe operation. Expand located helpers to their enclosing journeys. Give each
consumer a run, matching-evidence reuse, or an exclusion showing why the
changed effect does not reach its boundary. Inspect aggregate text, role,
focus and geometry assertions before accepting changed output.

Prospective ADR 0010 comparison: same 390×844 touch viewport, same Board data,
Taken shown with both controls present. Before: 44px per side and horizontal
swipe leaves the view unchanged. Worth keeping: bidirectional swipes reach each
column, the indicator reservation is markedly smaller, and the view/cards gain
that width while native reading, taps and keyboard remain usable. Record actual
before/after widths; make no measured speed, physical-device or smoothness claim.

## Current decisions and concern review

- One view-position model; no parallel swipe pager or generic gesture service.
- Thin targets are the developer's explicit mobile tradeoff, with swipe as the
  primary route and accessible working controls retained.
- No human checkpoint, trunk-only product operation or blocking dependency.
- Slice-plan refinement was not needed: two independently useful increments
  share one paging rule; each owns a bounded observable proof loop and targets
  15 active minutes. Two slices are within the eight-slice limit.
- No remaining slice-specific concern was identified in the inspected boundary.
  Existing behavior/proof routes were observed; new behavior remains owned by
  the slices and is not represented as already implemented or proved.
