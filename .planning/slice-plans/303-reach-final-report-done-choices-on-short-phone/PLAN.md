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

Execution uses the established Story Branch start in
`/Users/terryyin/git/open-dough/.worktrees/keep-final-report-done-confirmation-choices-reac`,
branch `codex/keep-final-report-done-confirmation-choices-reac`, publisher
`dashboard-territory.local-open-dough`, assigned agent `jacked-chan`.
The published claim/base is `9321e0bcc56da35f58e71936919c38dfbe4263ce`;
starting revision is `1de2986ca45ad47198f0d43154be4d28e9d0e62d`.
Owned increments publish to `origin` on that execution branch; eventual trunk
is `main`. No replanning override or numeric slice limit was supplied.
Checkout setup: `node scripts/setup-native.mjs npm`,
`node scripts/setup-native.mjs check`, and `npm run typecheck:dashboard` passed
with Node 24.21.0 and Chromium 153.0.8010.12.

CI source: GitHub Actions, verified active `ci.yml` (`CI`), repository
`terryyin/open-dough`, target `codex/keep-final-report-done-confirmation-choices-reac`.
Codex coordinator `seed135-jacked-chan` owns yielded stream cell `14`,
session `55293`, directory `/tmp/dough-ci-501/watch-osI3GU`, PID `53100`,
launched from the execution checkout's installed runtime. The earlier claim
on trunk is outside this branch observer's coverage.

### 1. Read and answer the unfinished-report question by touch at short height
Type: Behavior
Status: done
Proof: `session-result-touch.spec.ts` failed on the wrapped-title baseline,
then passed with the presentation change and focused existing consumer suites.
The accepted commands and inspected observations are retained below.

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

## Execution complete

Product advice: No additional product work is recommended. The local scrolling
repair and retained touch/edge regressions cover the selected report outcome;
shared confirmation, Done, reporting and host responsibilities stay coherent.

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
gates under the established execution instruction above.

## Accepted slice proof

The original layout failed both short-phone cases before answer taps with
`node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/tests/session-result-touch.spec.ts --grep 'short phone' --reporter=list`.
After finger movement, the confirming answer was outside the report: at
390×320 its y268.09–312.09 bounds exceeded report y−42–182; at 390×240 its
y178.09–222.09 bounds exceeded report y−132–36. The regression observes
full report/viewport/ancestor containment, not merely presence.

Accepted final command (exit 0; strict quiet reporter, no output):

```sh
env -u NO_COLOR node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/tests/session-result-touch.spec.ts dashboard/tests/session-result-touch-edge.spec.ts dashboard/tests/session-workspace-retirement.spec.ts dashboard/tests/session-workspace-retirement-done.spec.ts dashboard/tests/agent-launch-done-question.spec.ts dashboard/tests/agent-launch-done-refusal.spec.ts dashboard/tests/session-workspace-retirement-attach.spec.ts dashboard/tests/session-workspace-retirement-claude.spec.ts dashboard/tests/story-panel-replacement.spec.ts dashboard/tests/agent-completion-attention.spec.ts dashboard/tests/recently-done-progressive-navigation-report.spec.ts
```

Inspected setup: `support/reportTouchJourney.ts::openUnfinishedReport` reuses
retained native history, a saved unfinished completion and missing workspace;
it supplies no layout or action result. `reportTouchPage.ts::reportGeometry`
and `readReportByTouch` observe full bounds, clipping and hits after real finger
strokes. `session-result-touch.spec.ts` observes both short-height choices,
resize/rotation identity and pending state, Keep open/read/done/native/focus
preservation, reading and Close access, and explicit Done/native rename without
workspace recreation. Its tablet/desktop cases observe reading and keyboard
dismissal. `session-result-touch-edge.spec.ts` observes long-report touch reading
with a stationary usable edge and mouse/keyboard resizing. Existing consumers
above preserve report association, selection cancellation, retry/refusal,
working-session stop, and report/review/Recently done navigation.

`npm run typecheck:dashboard` passed. No shared panel/question styles or action
logic changed, so unrelated terminal/review touch suites were not triggered.
The strict reporter's earlier color-environment warnings were diagnosed and
removed through `env -u NO_COLOR`; the final command is the accepted proof.

The final report uses one inner available-height scrolling surface; its resize
edge remains outside it. An earlier root-scroll experiment was rejected after
it scrolled the edge out of view; the retained edge regression covers that loss.
Independent post-change refactor returned `none — already clean` and
`REFACTOR COMPLETE`, with no edits or proof invalidation.
After mechanical hook lint repairs in the test helpers, current touch/edge proof
passed again (exit 0):
`env -u NO_COLOR node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/tests/session-result-touch.spec.ts dashboard/tests/session-result-touch-edge.spec.ts`.
Existing consumer proof and production behavior were unchanged by those repairs.
Retrospective reviewed the original claim-basis plan and implementation
`08a5e1b1c377cc6bff62201f119cb1f674cd9f36`: no correction plan was needed.
Process occurrences were retained under existing `ODF-158` and `ODF-141`.

## Story obligations

### G1. Browser and synthetic-host proof boundary
Reported: slice 1 — "Proof is deterministic Chromium with synthetic native-host fixtures; physical iOS, Safari, remote connectivity, and real native-host acceptance remain outside this delivery."
Story clause: "Physical iOS keyboards, Safari-specific acceptance, and remote connectivity keep the shared seed's boundary."
Disposition: excluded "Physical iOS keyboards, Safari-specific acceptance, and remote connectivity keep the shared seed's boundary."

### G2. Existing exterior resize-edge overlap
Reported: slice 1 — "The landscape exterior-quarter point, x419.81 outside the frame boundary x422, hits the existing dashboard column-edge-right paging button."
Story clause: "A developer reading a saved final report on a phone with constrained visible height can choose Mark as done or Keep open by touch without activating the dashboard beneath the report."
Disposition: no user cost "A developer reading a saved final report on a phone with constrained visible height can choose Mark as done or Keep open by touch without activating the dashboard beneath the report.": existing overlap lies outside the answers; both choices hit their own controls, and the resize edge's available inner target and actual mouse/keyboard resize remain usable before and after report scrolling (`session-result-touch.spec.ts`, `session-result-touch-edge.spec.ts`).
