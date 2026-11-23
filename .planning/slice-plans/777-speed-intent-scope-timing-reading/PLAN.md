# Get fast proof of Intent collected scope timing and chart marks

**Identity:** SEED-413#speed-intent-scope-timing-reading
**Source:** [Get fast proof of Intent collected scope timing and chart marks](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-reading)
**Split from:** SEED-413#speed-intent-scope-timing-history (plan 774) before readiness on 2026-11-22, recoverable at `1b8a80724:.planning/slice-plans/774-speed-intent-scope-timing-history/PLAN.md`

## Goal and scope

Give maintainers fast proof of collected scope timing history and the shared
history chart marks. Move the 8 legacy specs (14 cases) onto mounted Vitest
cases fed by typed `readScopeHistory` answers. First restore the checks plan
774's moves lost and remove that delivery's residue. Then remove history
support whose last consumer moves, and compare the cohort's two-worker time
with the recorded baseline. Scope glances, isolation and recovery stay with
the completed plan 774 cases. Attempt proof and Summary rows stay with
plan 760.

## Current decisions

- Mount Done cases through `openDoneStoryComparison({ review, ci })` and
  Project cases through `mountIntentCiPage`. Pass `ci.readScopeHistory`
  and read through `scopeHistoryIn` (`intent/intent-scope-history-page.ts`)
  and its chart. Build every history answer as data with
  `makeMe.aScopeHistoryGlance` from `pageMakeMe.mjs`, using `.with(...)` for
  the exact shapes that legacy cases state. The legacy pending case's
  server projection (`scopeHistoryGlanceOf(scopeHistoryOf(...))`) becomes its
  literal answer: one selected gap entry with `gap: { status:
  "unavailable", reason: "Pending · CI queued or running" }`.
  Backend specs (`landed-ci-history-pending*.spec.ts`,
  `landed-ci-history-gaps.spec.ts`) keep the projection proof.
- Keep one builder default rule. With no `averaging` call, a unit states
  too few prior builds to average, which is the current
  `ScopeHistoryGlanceBuilder` rule. The Done builder's `priors()` drops stated
  reference figures when the priors change. `through()` rejects units whose
  failed positions differ. The builder must not turn a failed entry into NaN.
- For each legacy helper a move replaces (`expectNoSidewaysScrollIn`,
  `expectMarkOver`, `expectMarksByTab`, `inspectMark`,
  `expectMarksPainted`, `expectComparisonScopeRows`,
  `expectStackedInOrder`, `expectScopeReadout`), the slice lists what it
  checked and which mounted assertion now owns each check. Each slice
  break-checks the race or late-answer case it owns.
- North Star, [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  cases mount the production Intent page entry with typed reads, use only
  MakeMe data and colocated page objects, and add no wrapper. Slices 2 and 7
  only remove test support.
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows):
  cases act directly and wait through retrying assertions on what the action
  changes. Slice 1 restores the two waits whose absence let a race pass.
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e):
  every owned case leaves the Playwright runner.
- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories)
  and the [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires the moved proof to keep its promises while it gets cheaper.

## Local gate

On macOS, run on AC with `caffeinate -s -i` under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, default timeouts, and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Each slice runs its focused named proof through
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- <paths> --workers=2`
and runs `npm run typecheck:dashboard` when it changes TypeScript.
Slices 1–3 change shared page objects or builders. They also run every
consumer the slice names. Retained Playwright outcomes are in
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`, which each run sets to a fresh
path.

## Decisive premises

Observed 23 November 2026 in the established worktree at `2a0c35342`, using
its `npm ci` dependencies (Node 24.21.0) and headless Chromium on AC through
the local-gate command above. Scratch edits were reverted.

- **Legacy baseline.** The selection `intent/intent-scope-timing-history-`,
  `intent/intent-ci-history-chart-marks` and
  `intent/intent-project-ci-history-chart-marks` passed 14 Playwright
  `chromium` cases. It took 42.97 s elapsed including preparation and
  40.2 s runner time, with load 26.7 → 25.8. Summed case time was 26.3 s.
  The chart-mark cases took 5.2, 3.1, 4.4 and 2.5 s, and the scope timing
  cases took 0.9–1.4 s each. This is slice 8's baseline. Pair it with a
  fresh baseline under comparable load if load differs by more than about a
  third.
- **Mounted Done entry answers collected histories.** A scratch
  `intent/intent-scope-timing-probe.spec.ts` mounted
  `openDoneStoryComparison` with a `readScopeHistory` answer from
  `makeMe.aScopeHistoryGlance.with(...)`. Three cases passed in 7.19 s,
  taking 0.78–0.98 s each:
  - At 390 px, a later trunk build stood in for an expired selected gap.
    The readout named the expired proof, the stand-in and Insufficient
    history, and drew no chart.
  - The literal pending answer above read `Pending · CI queued or running`
    and `No complete test execution times are available for this scope.`
    with no chart.
  - Under `useTouchScreen()` at 390×844, `chart.tapMark("Nov 4 · Failed
    build")` changed the readout from the selected mark to the failed
    build. The assertion depends on that change, so it cannot pass without
    the tap.
  An esbuild run of the server projection for the legacy pending landing
  produced exactly that answer, so slice 5 changes no evidence.
- **Mounted Project and Done scope history specs.** The selection
  `intent/intent-project-scope`, `intent/intent-scope-glance` and
  `intent/intent-ci-done-glance` passed 12 Vitest cases in 9 files in
  11.70 s at load about 20. These cases run through `mountIntentCiPage`
  with `readScopeHistory`, which slices 6 and 7 extend.
- **Key-isolation assertion gap.** Intent Coverage at `112ade772` removed
  the success branch's abort guard from `useIntentCiEndpointHistory`.
  The late old-key answer then erased the newer revision's shown history,
  and `intent-project-scope-history-key-isolation.spec.ts` still passed.
  No commit has touched `dashboard/src/useIntentCiEndpointHistory.ts`, that
  spec, `intent/intent-scope-history-page.ts` or
  `Distribution/tests/support/scopeHistoryGlanceTestData.mjs` since then.
  The finding therefore still holds at `2a0c35342`.
- **Board mounts default to position 0.** `withPagePreferences` defaults
  `open-dough.board.position` to `"0"`
  (`test-support/component-mount/framePreferences.ts`). After a scratch
  deletion of every standalone `withBoardStorage("0");` line in the 21
  `navigation/` files other than `board-kept-position.spec.ts`, those 20
  spec files passed 43 Vitest cases in 44 s. The 21st file,
  `navigation/development-intent-frame-page.ts`, is a page object. Slice 2
  runs its consumers.
- **Remaining correction targets are present.** At `2a0c35342`:
  - `fitsWidth()` compares only the region's own widths.
  - `failedUnder` compares only x.
  - `scopeHistoryIn(...).shown` has no caller.
  - `openScopeSummary` and `openFileProof` repeat
    `locationNameControl` and `intentStoryCompare().chooseProof`.
  - `navigation/board-mount.ts` re-exports `positionKey` and
    `formerPositionKey`.
  - `intent-ci-done-glance.spec.ts:66` reads `averageLabel()`
    synchronously.
  - `ScopeHistoryGlanceBuilder.through()` takes failed builds from the
    first stated unit only.

## Slices and outside-in proof

### 1. Delivered scope history proof regains the discrimination it lost

Type: Structure
Status: planned

Retrospective correction of plan 774. In
`intent-project-scope-history-key-isolation.spec.ts`, force a commit after
the late old-key answer, as `-project-isolation.spec.ts` does with
`page.showIntent()`, and then assert synchronously. In
`intent-ci-done-glance.spec.ts`, wait for the drawn chart before reading
`averageLabel()`. Give `intent-scope-history-page.ts` and
`intent-ci-wall-time-history-page.ts` one shared full no-sideways check. It
checks the page, the region and every descendant, as `scrollingSideways()`
does. Use it in the recovery spec and the Done glance at 390 px. Add the
vertical comparison to `failedUnder`.

**Proof.** With `useIntentCiEndpointHistory`'s key filter or success-branch
abort guard removed in a scratch edit, the key-isolation case fails. It
passes with them restored. The 9 mounted scope history and glance specs and
the CI wall-time history specs pass. A scratch 20 px overflow inside a
descendant of the history fails the shared check.

### 2. The delivered page entry support carries no residue

Type: Structure
Status: planned

Retrospective correction of plan 774. Remove the uncalled
`scopeHistoryIn(...).shown`. Make `openScopeSummary` use
`locationNameControl` and `openFileProof` use
`intentStoryCompare().chooseProof`. Remove `board-mount.ts`'s re-export of
`positionKey`/`formerPositionKey`, so `board-scroll.spec.ts` imports
`framePreferences.ts`. Delete the 32 redundant `withBoardStorage("0")` calls
and keep `board-kept-position.spec.ts`'s precondition.

**Proof.** `npm run typecheck:dashboard` passes. The scope glance specs, the
20 Board spec files from the premise, `board-scroll.spec.ts`,
`board-kept-position.spec.ts` and every consumer of
`development-intent-frame-page.ts` pass. Count support lines before and
after. The count only falls.

### 3. Absent histories and a failed history read explain themselves

Type: Behavior
Status: planned

Settle the builder default rule from Current decisions. In
`ScopeHistoryGlanceBuilder`, `through()` rejects mismatched failed
positions. The Done builder's `priors()` drops stated figures. Move
`intent-scope-timing-history-absent` (2 cases: the empty and all-gaps
variants) and `intent-scope-timing-history-reading` (1 case).

Behavior: a scope with no collected or retained measurements → its history
opens → it states why, draws no empty chart and keeps the Summary's
comparison rows. A failed local entry history read → the Done story,
comparison and part order stay, and the history offers its own Retry.
While the retried read is held, the history reads `Reading collected test
execution times…`. The answer then charts above the comparison at 390 px.

**Proof.** The two moved files pass on Vitest with the legacy assertions
mapped to their owners. The retry case fails when Retry does not reread.
A scratch builder call with a `"failed"` prior in only one unit throws.
`intent-ci-compact-readout.spec.ts` and every consumer of
`aScopeHistoryGlance` and `aDoneWallTimeHistory` pass. Delete the legacy
files.

### 4. Selected gaps and their stand-ins read their status

Type: Behavior
Status: planned

Move `intent-scope-timing-history-gaps` (3 cases) and
`intent-scope-timing-history-provenance` (1 case), using the literal pending
answer.

Behavior: a selected landing without its own measured build → the history
opens → it reads an expired gap with its later-build stand-in at 390 px, a
partial cohort marked `Landing order unverified` with the known measurement
charted, or a pending build with no measured time. A later trunk build that
supplies the selected timing stays named, and each mark names its build's
role.

**Proof.** The two moved files pass on Vitest at the legacy viewports, and
each has the full no-sideways check where legacy had one. Delete the legacy
files.

### 5. Case and file units and segments chart separately

Type: Behavior
Status: planned

Move `intent-scope-timing-history-units` (2 cases) and
`intent-scope-timing-history-segments` (1 case).

Behavior: one collected attempt with case and file timing → choosing each
unit → that unit's chart shows its own values and selected gap.
Legacy-only evidence states its unit is unknown. Earlier segments stay
beside a selected gap, and the line never joins incompatible segments.

**Proof.** The two moved files pass on Vitest. A scratch change that joins
segments across a `segment` change makes the segments case fail. Delete
the legacy files.

### 6. Done history chart marks read by pointer, keyboard and touch

Type: Behavior
Status: planned

Move `intent-ci-history-chart-marks` (2 cases) onto
`openDoneStoryComparison`. Put the marked-history answer beside the spec as
`aScopeHistoryGlance` data.

Behavior: a Done scope history with failed, unavailable, zero, incompatible
segment and selected marks → hover each mark, walk them by Tab, and tap
them at 390×844 → the readout names each build. The failed × lies under
its mark. Nothing scrolls sideways.

**Proof.** Both cases pass on Vitest. The Tab walk reads every mark in
order, and the tap case fails without the tap.

### 7. Project history chart marks hold in both schemes and the narrowest width

Type: Behavior
Status: planned

Move `intent-project-ci-history-chart-marks` (2 cases) onto
`mountIntentCiPage`. Set the colour scheme with `emulateMedia`. Remove
spent support whose last consumer moved: `summaryScopeHistory.ts`,
`scopeHistoryMarksScenario.ts`, any `scopeTimingHistory.ts` export or
`historyChartPage.ts`/`intentScopeHistoryPage.ts` member left without a
consumer, and `summaryComparisonExpectedRows.ts` and `pageLayout.ts`
members, after checking their consumers across frontend tests and E2E.

Behavior: a Project Intent scope history through the observed trunk
endpoint → the marks are read by pointer and keyboard in light and dark →
the marks stay painted with focus. At the narrowest supported width, the
"0 ms" axis labels stay whole inside the chart.

**Proof.** Both cases pass on Vitest. `npm run typecheck:dashboard` passes.
A search for each removed module or member finds no consumer, and the
support line count falls.

### 8. The cohort comparison measures faster feedback with proof intact

Type: Behavior
Status: planned

Account for all 14 legacy cases. Map each to its mounted owner by path and
title, and give each retired helper check its new owner.

**Proof.** Run the same 8 file paths before and after at two workers with
`caffeinate -s -i`. Use the baseline at `2a0c35342` above, adding paired
runs under comparable load. Report:

- elapsed time including preparation;
- counts by engine;
- the slowest remaining cases; and
- observed savings or limits.

## Slice review

Slice-plan refinement was not needed. The premise probes reached the mounted
entry, touch, pending answer and Board default in the forms the slices use.
Each moving slice therefore holds one or two legacy files and about three
cases on a ready entry. That fits the 15-minute limit that plan 764's
three-file port overran. Slices 1 and 2 split the correction by proof loop.
Slice 1 restores discrimination and has break checks. Slice 2 removes
residue and is proved by typecheck and consumers. Every case uses the same
`readScopeHistory` answer and page object model, with no recognizer for an
individual case. This review found no remaining slice-specific concerns.
