# Get fast proof of Intent collected scope timing and chart marks

**Identity:** SEED-413#speed-intent-scope-timing-reading
**Source:** [Get fast proof of Intent collected scope timing and chart marks](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-reading)
**Split from:** SEED-413#speed-intent-scope-timing-history (plan 774) before readiness on 2026-11-22, when the 16-file remainder plus entry correction exceeded eight slices at one or two legacy files per slice.
**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

## Correction of the delivered scope timing history entry

Execution retrospective of SEED-413#speed-intent-scope-timing-history (plan
774; commits `e19c1a4c0`..`a1bf9f379` on its story branch), 22 November 2026,
a read-only outcome review of `git diff 0ca3d0028 a1bf9f379`. No product bug
was found. These moved checks and support are the entry this story builds on,
so correct them before the first move:

- **Key-isolation late answer cannot fail.**
  `intent/intent-project-scope-history-key-isolation.spec.ts` resolves the old
  endpoint's held read and polls the shown time at once; `expect.poll` can pass
  before React commits the late answer (the legacy spec waited for the page's
  reads first). Force a commit after the late answer (as
  `-project-isolation.spec.ts` does with `page.showIntent()`), assert
  synchronously, and break-check `useIntentCiEndpointHistory`'s key filter
  once. Intent Coverage at `112ade772` confirmed the gap: with the success
  branch's abort guard removed, the late old-key answer erased the newer
  revision's shown history while this assertion still passed (assertion gap,
  recorded in SEED-413#speed-intent-scope-timing-history's Done record).
- **Scope history sideways-scroll check is weaker than legacy.**
  `intent/intent-scope-history-page.ts` `fitsWidth()` compares only the region's
  own widths; legacy `expectNoSidewaysScrollIn`
  (`dashboard/test-support/pageLayout.ts`) also scanned the page and every
  descendant, as `scrollingSideways()` in
  `intent/intent-ci-wall-time-history-page.ts` still does. Give both page
  objects one shared full check (used by the recovery spec and the Done glance
  at 390 px).
- **Failed-build × lost its vertical check.** `failedUnder` in
  `intent-scope-history-page.ts` compares x only; legacy `expectMarkOver`
  (`historyChartPage.ts`) compared x and y. Add y.
- **Builder defaults diverge.** `ScopeHistoryGlanceBuilder` defaults to too
  few to average and its `tooFewToAverage` has no caller; the Done builder
  defaults to stated figures that `priors()` keeps even when priors change;
  `through()` takes failed builds from the first unit only (another unit's
  `"failed"` becomes NaN). Settle one default rule beside this story's planned
  gap and empty-history steps, and reject mismatched failed positions.
- **Page-object residue.** `scopeHistoryIn(...).shown` has no caller;
  `openScopeSummary` repeats `locationNameControl`
  (`intent/intent-ci-homepage-page.ts`); `openFileProof` repeats
  `intentStoryCompare().chooseProof`; `navigation/board-mount.ts` re-exports
  `positionKey`/`formerPositionKey` (one importer, `board-scroll.spec.ts`).
- **Synchronous history reads elsewhere.** Plan 772's
  `intent/intent-ci-done-glance.spec.ts` reads `history.averageLabel()` right
  after the readout settles — the race plan 774 repaired in the scope glances
  by waiting for the drawn chart.
- **Board specs repeat the mount default.** 33 `withBoardStorage("0")` calls
  in about 22 `navigation/` specs repeat what `withPagePreferences` now does
  (keep `board-kept-position.spec.ts`'s precondition).
- **Moves lose helper checks.** For each legacy helper a move replaces, list
  what it checked and each check's new owner, and break-check every race or
  late-answer case.

## Provisional input

Resize at refinement: plan 764's three-file history port overran, so one or
two legacy files fit a slice. Mount through the page entry that plan 774
Slices 1–2 correct (preference reset, options-object `ci` bag with
`readScopeHistory`, builder reference figures, typed HeldKind); apply the
carried decisions of plans 772 and 774 and the
[campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories).
`readScopeHistory` is already a required member of `IntentCiReadSource`;
`makeMe.aScopeHistoryGlance` exists on `publishedReadingMakeMe.mjs`. Capture
this story's own 8-file legacy baseline at two workers before the first move
(the parent 8-file isolation cohort was 11 cases in 44.9 s at `a1f0e6e51`,
load 33–23, 22 November 2026).

### A. Collected scope timing preserves units, provenance, segments and gaps

Move `intent-scope-timing-history-absent` (2), `-gaps` (3), `-provenance`
(1), `-reading` (1), `-segments` (1) and `-units` (2), with direct pure timing
checks only where DOM rendering is not the proof.

Proof: absent, partial and unavailable reasons, separate case and file
units, interrupted segments, build dates and provenance stay readable and
accessible.

### B. The shared history chart marks keep labels, links, input and narrow fit

Move `intent-ci-history-chart-marks` (2, Done) and
`intent-project-ci-history-chart-marks` (2, Project), received from plan 772
on 2026-11-22: they drive the shared history chart on the Summary's scope
timing history (`readScopeHistory`, `makeMe.aScopeHistoryGlance`,
`historyChartPage.ts`), not CI wall-time history. A faithful Vitest port
needs a typed `readScopeHistory` answer in `openDoneStoryComparison` and
`mountJudgedRunProof` (from plan 774 Slice 1), a Summary scope-history page
object, and touch input.

Proof: zero-ms and incompatible-segment marks, the Tab walk across marks,
touch taps at 390×844, marks painted with focus in light and dark, and whole
"0 ms" axis labels at the narrowest width.

### C. Spent support removed and cohort timing recorded

Remove spent history support whose last consumer moved
(`summaryScopeHistory.ts`, `scopeHistoryMarksScenario.ts`, and any
`scopeTimingHistory.ts` export left without consumers). Record the
two-worker before/after timing and case disposition for the 8 files
(14 cases).
