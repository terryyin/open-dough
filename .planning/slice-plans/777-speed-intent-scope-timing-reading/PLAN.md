# Get fast proof of Intent collected scope timing and chart marks

**Identity:** SEED-413#speed-intent-scope-timing-reading
**Source:** [Get fast proof of Intent collected scope timing and chart marks](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-reading)
**Split from:** SEED-413#speed-intent-scope-timing-history (plan 774) before readiness on 2026-11-22, when the 16-file remainder plus entry correction exceeded eight slices at one or two legacy files per slice.
**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

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
