# Get fast proof of Intent timing history

**Identity:** SEED-413#speed-intent-timing-history-on-vitest
**Source:** [Get fast proof of Intent timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-on-vitest)
**Split from:** SEED-413#speed-intent-ci-status-frame-and-timing-history ([plan 764](../764-speed-intent-ci-status-frame-and-timing-history/PLAN.md), former Slice 4's history port and Slices 5–8) on 2026-11-22 at its delivered Slice 4 boundary
**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

## Why this plan is provisional

Plan 764's Slice 4 attempt (22 November 2026) stopped at 8.1 active minutes:
porting the first 3 legacy files (`intent-ci-compact-readout`,
`intent-ci-done-glance`, `intent-ci-done-reference-lifecycle`: 6 cases, 484
lines of chart marks, pointer inspection, dark-mode cue and refresh/retry
races) through the real page did not fit one slice. The slices below keep
their former 3–6-file sizing and must be resized at refinement, likely one or
two legacy files per slice, adding a Node-free `aDoneWallTimeHistory`
builder on `publishedReadingMakeMe.mjs` with domain-named steps
(availability, priors, selected, stand-in) rather than raw facts. The former
Slice 4's structure delivered in plan 764.

## Carried decisions, premises and learnings

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Render the production owner of each history view at its typed entry; no
  test copies of compositions, restated provider stacks, ancestor class
  wrappers, private pipeline calls, hand-written domain records or production
  transforms to make inputs. Do not modify sibling-owned page objects
  (`intent-ci-evidence-page.tsx`, `intent-ci-scope-page.tsx`,
  `intent-done-story-page.tsx`, `intent-browser-page.ts`,
  `intent-candidates-page.ts`, `intent-file-reading-page.ts`).
- Delivered by plan 764 and available: required `readDoneWallTimeHistory`
  and `readScopeHistory` on the CI reads (`authenticatedIntentCiReads`,
  rejected by `unreadCiReads`); `intent/intent-ci-page-mount.ts`
  (`mountIntentCiPage`: production `PageFrame`, `StoryReferenceNavigation`,
  `BoardOrIntent`); `recordOutsideCalls`; `intent-ci-sessions-sidebar.ts`;
  `makeMe.aCiHistoryAnswer.pleaseMeasured()`. A Done story's Summary opens
  from its CI comparison entry button; its rows come from the review's changed
  files. The page-wide Sessions shortcut is Command+B only.
- Legacy baseline captured before any move (plan 764 Slice 4, 22 November
  2026): the 19-file / 31-case selection on the Playwright engine, `--workers
  2`, 31 passed, 184.99 s including preparation (runner 176,008 ms), load
  33.3–41.4. Its proof record and the 6 first-file cases' distinct-assertion
  list were kept in plan 764's execution evidence
  (`s4-baseline.proof.json`, `slice-4-report.md`); rerun the baseline at
  refinement if that checkout has been retired.
- The 3-file / 5-case Vitest Project CI wall-time history suite
  (`intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts`) passed in 3,437 ms
  at `58b829487` (21 November 2026). Narrow `JudgedBranch`'s presentation
  input to `Omit<JudgedReading, "round">` while `IntentCiHistoryPanel` keeps
  its refresh `round`.
- Former Slice 4's history port (provisional, Behavior): move
  `intent-ci-compact-readout`, `intent-ci-done-glance` and
  `intent-ci-done-reference-lifecycle` over `IntentCiComparisonView` through
  the typed page entry. First observe one held Done wall-time history read
  resolving beside live comparison proof without rereading comparison proof.
  Proof: missing, pending, outside-retention, insufficient, unusable-selected,
  zero-average and stand-in landing baselines render their exact compact words
  and cues; Done glance marks and hover/focus details match the landing;
  changing or retrying the Done reference updates or preserves history without
  perturbing live Proof; 0 legacy cases remain on the 3 files.

## Slices

### 1. Done wall-time history keeps its compact readout, glance and reference lifecycle

Type: Behavior
Status: provisional

The former Slice 4 history port above.

### 2. Project CI wall-time mounts drop `act` wrapping and chart marks keep keyboard and narrow layout

Type: Behavior
Status: provisional

Add required `readScopeHistory` to the CI reads
(`useIntentCiScopeHistory.ts`) and narrow `JudgedBranch` to
`Omit<JudgedReading, "round">` while `IntentCiHistoryPanel` retains its
refresh `round`. Refresh `intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts`
onto `mountComponent` (retiring `createRoot`, React `act`, and
`IS_REACT_ACT_ENVIRONMENT` and verifying refresh round behavior), and move
`intent-ci-history-chart-marks` and `intent-project-ci-history-chart-marks`
(2 legacy files / 4 legacy cases + 3 refreshed Vitest files).

**Proof.** Project CI wall-time history refreshes through `Check again` ->
`Builds and evidence` keyboard order without `act` helpers, and Project/Done
history chart marks preserve build/date labels, accessible descriptions,
run links, and narrow-viewport fit.

### 3. Scope glances and project/source history keys stay isolated to their source

Type: Behavior
Status: provisional

Move `intent-project-scope-glance`, `intent-scope-glance`,
`intent-project-scope-history-source-identity`, and
`intent-project-scope-history-project-isolation` (4 files, 5 legacy cases)
over `IntentScopeTimingHistory` / `useIntentCiScopeHistory` within its
production owner (no restated reading-place stack) and typed `readScopeHistory` replies recording requested source, endpoint, scope,
and `AbortSignal`.

**Proof.** Project and Done scope glances display accurate summary cues, and
switching source identity or project issues the right request and aborts/ignores
other projects' or sources' answers without leaking history across projects.

### 4. Project scope history isolates scope keys, retains live proof on failure, and recovers on Retry

Type: Behavior
Status: provisional

Move `intent-project-scope-history-key-isolation`,
`intent-project-scope-history-recovery`,
`intent-project-scope-history-refresh`, and
`intent-project-scope-history-remount` (4 files, 6 legacy cases) within the
production owner of `IntentScopeTimingHistory` beside live Scope Proof.

**Proof.** Entry, folder, file, and revision keys keep distinct kept histories
across remounts; a failed or empty history read preserves both the last kept
history and live Scope Proof, offers `Retry`, and recovers or refreshes
without borrowing history from another endpoint or scope.

### 5. Collected scope timing preserves units, provenance, segments, and gaps and runs faster on Vitest

Type: Behavior
Status: provisional

Move `intent-scope-timing-history-absent`, `intent-scope-timing-history-gaps`,
`intent-scope-timing-history-provenance`, `intent-scope-timing-history-reading`,
`intent-scope-timing-history-segments`, and `intent-scope-timing-history-units`
(6 files, 10 legacy cases) over `IntentScopeTimingHistory` (plus direct pure
timing checks only where DOM rendering is not the proof). Remove any
`dashboard/test-support/` history module whose last consumer across `e2e/` and
`dashboard/frontend-tests/` has moved, and record the two-worker before/after
timing and case-disposition comparison against the 19-file legacy
baseline and the `3,437 ms` Vitest wall-time baseline.

**Proof.** Absent, partial, and unavailable timing reasons, separate case vs
file units, interrupted segments, build dates, and provenance stay readable
and accessible; zero legacy Playwright cases remain across all 19 owned files;
no `act`/`IS_REACT_ACT_ENVIRONMENT` remains in the owned history specs; spent
history support is removed; and two-worker Vitest elapsed time including
preparation improves over the legacy baseline.
