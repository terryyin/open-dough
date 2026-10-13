# Reach final-report Done choices on a short phone

**Identity:** SEED-135#reach-final-report-done-choices-on-short-phone
**Source:** [selected story](../../seeds/SEED-135-mobile-dashboard-observed-discrepancies.md#reach-final-report-done-choices-on-short-phone)

## Goal and scope

A developer reading a saved unfinished report on a short phone can read the
confirmation and bring both Done choices fully into view by ordinary touch,
then choose either without activating the dashboard underneath. Wrapped
session identity, resizing, and rotation cannot remove that access. Keep open
preserves session state and report access; Mark as done keeps its existing
explicit recording and native behavior. Tablet and desktop retain reading,
choices, dismissal, and keyboard shortcuts.

The seed owns the examples and boundaries. This is presentation work, including
its regression proof and maintained description in
`dashboard/AGENT-LAUNCH-TERMINALS.md`. It adds no reporting protocol, host
capability, completion authority, or recreated workspace. Physical iOS keyboard,
Safari, remote connectivity, and the sibling launch-answer repair are not
promised by this delivery. The named dimensions are examples, not rejection
limits. No dependency on the sibling story is required.

## Current decisions and existing solutions

Change the existing final-report presentation; retain one confirmation and one
Done operation. PFE inspected `SessionResultPanel.tsx`, `AskInPlace.tsx`,
`pageSessions.ts`, `side-panel.css`, `session-result.css`, and the related
terminal and story-review surfaces. The report uses `InPlaceQuestion` and
`useAskInPlace` for the existing question, focus, Escape, and disabled-during-action
behavior, and `useDoneMark` for the same session operation as other entry points.
The report body scrolls, but the question sits outside that scrolling body in
the height-limited panel. The narrow stacked panel is 70dvh. A sufficiently tall
header and question overrun it. This is the existing presentation owner's
responsibility, not a second mobile confirmation or new session state.

The terminal's `.terminal-identity` already bounds identity height for touch,
and launch dialogs have bounded scrolling content. These are useful examples
of respecting available height, but their terminal-input and modal-dialog
responsibilities differ from passive report reading. Reuse the shared action
logic directly and change the report's containment/scrolling as needed. Select
the exact layout during the slice against the examples, not by copying a
terminal rule or requiring a new overlay. Any shared-style change also owes
its terminal and story-review consumers preserved behavior.

Both choices need not remain fixed on screen simultaneously; touch scrolling
may expose each whole choice. Keep the question readable and the visible
choice's hit area within the report. Preserve the existing touch target size,
focus restoration, explicit action boundary, selected session, and Close access.

Relevant Accepted decisions, with matching index and in-file statuses:

- [ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md): this
  feature-local layout remains in the feature and plan, without a new ADR.
- [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md): one sufficient
  behavior and one existing domain operation; no speculative shared framework.
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md): deterministic browser and synthetic-host proof
  covers this presentation change; it does not claim real native-host or Safari
  acceptance. No native integration mechanism is changed.

The index's other Accepted records govern language, releases, installation,
and skill authoring, with no further constraint on this layout. ADR 0008 stays
Proposed. The [dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md)
already requires reachable narrow-screen controls and accessible reading and
focus; no new temporary direction is needed. No ADR conflict or exception was
found.

## Decisive premises and observations

Observed in the preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/keep-final-report-done-confirmation-choices-reac`
at `399d6fcc3caf7236ff5ddb27225c651ea6317bc9`, on 2026-10-13.
A disposable spec used the existing `support/codexLaunch.ts` browser/server
fixture, `support/retainedReport.ts` to retain a report with a missing workspace,
a stored unfinished completion, and `openStoryStagesJourney` to open it through
the card. It changed only fixture input, never production code. The title was
“Read the disposable attention report. Keep the unfinished work open.”

```sh
npm ci --ignore-scripts --no-audit --no-fund
npx playwright test --config dashboard/playwright.config.ts dashboard/tests/zz-scratch-short-report.spec.ts --reporter=list
```

The first attempt lacked this worktree's Vite executable; installing locked
local dependencies resolved it. The final observation run passed its two
measurement/recovery journeys in 8.2 seconds. A prior short-title run established
why the wrapped header matters: it did not overrun at 390×320. The final run
measured the wrapped-title confirmation as follows (CSS pixels):

| Viewport | Keep open bottom / panel bottom | After a -100px touch gesture | Center hit before and after touch |
| --- | --- | --- | --- |
| 390×320 | 237.34 / 224 | 152.34 / 139 | Keep open, but its lower portion remains outside the panel |
| 390×240 | 232.34 / 163 | 147.34 / 78 | Underlying Open Dough source content |

The touch gesture used `scrollByTouch`, dispatching actual finger movement,
not assigning DOM scroll positions. The panel and choice moved together without
exposing the overflow. This reproduces M2 at the consuming browser boundary,
including the underlying hit target. A regression requiring full containment
and the intended hit target will discriminate against this baseline. A passing
measurement journey is not a passing repair.

After restoring 390×844, `tapWhereShown` reached Keep open and dismissed the
question with doneAt still absent. Reopening and touching the confirming Mark
as done closed the panel, saved doneAt, and left the missing workspace absent.
Thus the unpaid local fixture reaches the existing final-report action path.
No future-layout premise is assumed. The scratch spec was removed before
recording this preparation; no product edits are retained.

## Outside-in proof ownership

All promises belong to slice 1. Extend the existing browser journey fixtures
with a final-report touch regression rather than DOM-only rendering mocks.

| Promise | Discriminating observation in slice 1 |
| --- | --- |
| Readable question and whole, comfortably sized, reachable choices with wrapped identity at 390×320 and 390×240 | Open the real saved unfinished report with missing workspace; use ordinary touch scrolling if needed, then assert each choice's full bounds within viewport and report, unclipped ancestors, and intended hit target before a coordinate tap. Use `scrollByTouch` and `tapWhereShown`; no forced click or locator auto-scroll may supply the promised touch access. Read the question as well as buttons. The baseline above must fail the regression. |
| No accidental dashboard operation | Assert the underlying source disclosure/selection stays unchanged through the choice taps; hit-test the intended target. |
| Keep open preserves read/done/native state and reading | Compare stored reportRead, doneAt, and native calls immediately before and after Keep open; question closes, same report remains, focus returns to Mark as done, and report content and Close remain reachable. |
| Confirming Done preserves explicit action and no workspace recreation | Before confirmation no Done/native action; after coordinate tap the selected record gets the existing Done outcome, native rename/stop evidence matches the existing operation, and the saved workspace remains absent. Keep existing refusal/recovery proof green. |
| Enlarge/rotate with pending confirmation | Resize through 390×240, 390×844, and 844×390 and back; same report and unanswered question remain, repeat touch reachability, then choose. No resize writes read/done state. |
| Tablet/desktop reading, both choices, Escape and panel shortcut | At 768×1024 and 1440×900 verify reading and both choices; Escape dismisses the question with focus restored, existing Command+Shift+Escape closes the panel with normal return focus. |
| Existing report and shared-panel consumers | Run the focused consumer suites below; broaden to terminal/story-review consumers only if the actual change reaches shared presentation or confirmation rules. |
| Maintained behavior description | Update the short-height report interaction in `dashboard/AGENT-LAUNCH-TERMINALS.md` to match the implemented behavior. |

## Ordered slices

### 1. Read and answer the unfinished-report question by touch at short height
Type: Behavior
Status: planned
Proof: a new `session-result-touch.spec.ts` implements the mapped browser
observations, first failing on the current wrapped-title report, then passing
with the presentation change; focused existing consumer suites stay green.

Behavior: a saved unfinished report with wrapped session identity and missing
workspace is open on a short phone → the developer opens Done confirmation,
reads and scrolls by touch as needed, and chooses Keep open or Mark as done →
the intended choice is fully reachable within the report and only that choice
runs its existing behavior. Resize/rotation preserves the pending choice;
tablet and desktop preserve reading and keyboard operation.

Keep the layout repair, regression, affected-consumer checks, documentation,
and local cleanup together. One common available-height rule should serve
these examples; add no viewport-specific special cases. No separate Structure
slice is justified. The slice is bounded by one report interaction and proof
loop, including both answers and preserved behavior. No project numeric slice
limit is supplied; introduce none.

## Review and execution gates

Slice-plan refinement was not needed: one cohesive outcome, one proof loop,
no preparatory structure, and no unmapped final-state promise. No remaining
slice-specific concern was identified. The local proof route and reported
symptom are observed; choosing and proving the repair remains execution work.

Run the new touch spec plus `session-workspace-retirement.spec.ts`,
`session-workspace-retirement-done.spec.ts`, `agent-launch-done-question.spec.ts`,
and `agent-launch-done-refusal.spec.ts`. These observe the report selection,
focus, passive reading, shared confirmation, Done operation and failure recovery
that must survive. If shared side-panel or question styles/markup change,
include `agent-terminal-done-question.spec.ts`, `agent-terminal-touch.spec.ts`,
`story-review-touch.spec.ts`, and the `side-panel-width*.spec.ts` suite. These
are consumers of the changed surface, not a routine whole-product test gate.
Run `npm run typecheck:dashboard` for changed TS/TSX and `npm run lint` for
changed authored files. Hosted CI runs its own suites after publication.
Execution applies the normal independent post-change refactor and delivery
gates when authorized. This plan authorizes no execution and records no
execution-complete status.
