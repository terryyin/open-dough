# Get fast proof of Intent timing history

**Identity:** SEED-413#speed-intent-timing-history-proof
**Source:** [Get fast proof of Intent timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof)
**Split from:** SEED-413#speed-intent-proof-and-timing (recoverable at `3acae5160:.planning/slice-plans/752-speed-intent-proof-and-timing/PLAN.md`, former Slices 4–6) on 2026-11-21 at its delivered Slice 3 boundary

## Goal and scope

Dashboard maintainers get fast Vitest feedback on what collected Project and
Done timing history say across Intent's homepage, location, folder, and file,
and on how those history reads recover independently and stay isolated to
their project, endpoint, and scope key. Move the 31 legacy cases across 19
timing-history files in `dashboard/frontend-tests/intent/`
(`intent-ci-compact-readout`, `intent-ci-done-glance`,
`intent-ci-done-reference-lifecycle`, `intent-ci-history-chart-marks`,
`intent-project-ci-history-chart-marks`, `intent-project-scope-glance`,
`intent-project-scope-history-{key-isolation,project-isolation,recovery,refresh,remount,source-identity}`,
`intent-scope-glance`, and
`intent-scope-timing-history-{absent,gaps,provenance,reading,segments,units}`),
and refresh the 3 existing Project CI wall-time Vitest specs
(`intent-ci-wall-time-history{,-gaps,-evidence}`) to retire `createRoot`,
React `act`, and `IS_REACT_ACT_ENVIRONMENT` while covering any changed owner.

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use `mountComponent`, `pageMakeMe.mjs` (`aProjectHistory`,
  `aScopeHistoryGlance`, `aComparedStory`, `aCiProof`, and Node-free
  `aDoneWallTimeHistory` added on `publishedReadingMakeMe.mjs`), and colocated
  page objects under `dashboard/frontend-tests/intent/` without modifying
  sibling-owned page objects (`intent-ci-evidence-page.tsx`,
  `intent-ci-scope-page.tsx`, `intent-done-story-page.tsx`,
  `intent-browser-page.ts`, `intent-candidates-page.ts`,
  `intent-file-reading-page.ts`).
- Reuse `IntentCiReadSourceOnPage` (`dashboard/src/intentCiReadSource.ts`,
  landed by `SEED-413#speed-intent-proof-and-timing`) by adding optional
  defaulted `readDoneWallTimeHistory?: typeof readIntentCiDoneWallTimeHistory`
  (consumed in `useIntentCiDoneWallTimeHistory.ts` with fallback
  `readIntentCiDoneWallTimeHistory`) and
  `readScopeHistory?: typeof readIntentCiScopeHistory` (consumed in
  `useIntentCiScopeHistory.ts` with fallback `readIntentCiScopeHistory`).
  Keeping both optional preserves existing callers such as
  `intent-ci-evidence-page.tsx` and `ciComparisonClient.ts`.
- Mount `IntentCiHistoryPanel`, `IntentCiHistory`, `IntentCiComparisonView`,
  and `IntentScopeTimingHistory` with the real reading place
  (`IntentReadingProvider` + `IntentReadingPlaceOfItsOwn`) whenever endpoint
  keys, `useIntentCiEndpointHistory`, `useKeptReading`, refresh, Retry, or
  `AbortSignal` isolation is the proof. Narrow `JudgedBranch`'s presentation
  input to `Omit<JudgedReading, "round">` while `IntentCiHistoryPanel` keeps
  its refresh `round`, and verify owner refresh on
  `intent-ci-wall-time-history.spec.ts`. Use pure helpers in
  `dashboard/src/ciPriorBuildReference.ts` or `ciScopeTiming*.ts` directly
  only for pure calculation rules that need no DOM.
- Size each slice to one mount boundary and 3–6 test files (avoiding the
  20-file / 3-surface bundle that overran former Slice 4 in `plan 752`).
  Capture the 19-file / 31-case legacy Playwright baseline with
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` at `--workers=2` in Slice 1
  before replacing the first legacy spec, and compare the completed history
  suite in Slice 5. Remove any history `dashboard/test-support/` module whose
  last consumer moves in Slice 5.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under
the [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, focused path selections, and
the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production/types and check
representative E2E history consumers when shared contracts change.

## Decisive premises and proof

- At `58b829487ba83a8a0752eabfeb37391e4169a596` on 21 November 2026 (macOS on AC under `caffeinate -s -i`, `--workers=2`), `intent-project-scope-history-recovery.spec.ts`, `intent-ci-comparison-check-again.spec.ts`, and `intent-ci-comparison-selection.spec.ts` passed 7 cases observing failed and empty history preserving live Scope Proof, measured zero, and partial-unit gaps; the existing 3-file / 5-case Vitest Project CI wall-time history suite (`intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts`) passed in `3,437 ms` (`3.44 s`) elapsed including preparation (`baseline-vitest-wall-time-history.proof.json`); and the pre-split 44-file / 95-case legacy cohort ran in `36,187 ms`.
- During the Slice 4 probe on `cursor/get-fast-proof-of-intent-evidence-and-timing-his` (21 November 2026), adding optional `readDoneWallTimeHistory` and `readScopeHistory` on `IntentCiReadSource`, `aDoneWallTimeHistory` on `publishedReadingMakeMe.mjs`, and narrowing `JudgedBranch` to `Omit<JudgedReading, "round">` passed `npm run typecheck:dashboard` with `0` errors and mounted `IntentCiComparisonView`, `IntentCiHistory`, and `IntentScopeTimingHistory` cleanly in Vitest Browser Mode.

| Promise | Owning proof |
| --- | --- |
| Done wall-time history keeps its separate read boundary from live Proof, states missing/pending/outside-retention/zero-base facts accurately, and follows reference lifecycle changes | Slice 1 (`intent-ci-compact-readout`, `intent-ci-done-glance`, `intent-ci-done-reference-lifecycle`). |
| Existing Project CI wall-time mounts refresh cleanly without `act` wrapping when `JudgedBranch` narrows, and Done/Project scope chart marks preserve keyboard order, labels, and narrow layout | Slice 2 (`intent-ci-wall-time-history{,-gaps,-evidence}`, `intent-ci-history-chart-marks`, `intent-project-ci-history-chart-marks`). |
| Project and Done scope glances and source/project history keys stay isolated to their own source and project | Slice 3 (`intent-project-scope-glance`, `intent-scope-glance`, `intent-project-scope-history-{source-identity,project-isolation}`). |
| Project scope history distinguishes scope keys, preserves kept history and live Proof on failure, and recovers via Retry or refresh across remounts | Slice 4 (`intent-project-scope-history-{key-isolation,recovery,refresh,remount}`). |
| Collected scope timing keeps case/file units, provenance, segments, and gap explanations distinct, removes spent history support, and runs faster on Vitest | Slice 5 (`intent-scope-timing-history-{absent,gaps,provenance,reading,segments,units}` + two-worker before/after comparison). |

## Slices

### 1. Done wall-time history keeps its separate boundary, compact readout, and reference lifecycle

Type: Behavior
Status: planned

Capture the 19-file / 31-case legacy timing-history baseline at `--workers=2`
with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`. Add optional
`readDoneWallTimeHistory` to `IntentCiReadSource` (`useIntentCiDoneWallTimeHistory.ts`)
and `aDoneWallTimeHistory` to `publishedReadingMakeMe.mjs` (`pageMakeMe.mjs`).
Move `intent-ci-compact-readout`, `intent-ci-done-glance`, and
`intent-ci-done-reference-lifecycle` (3 files, 6 legacy cases) over
`IntentCiComparisonView` + `IntentCiReadSourceOnPage` (and direct pure
reference checks only where no DOM behavior is part of the proof). First
observe one held Done wall-time history read resolving beside live comparison
proof without rereading comparison proof.

**Proof.** Missing, pending, outside-retention, insufficient, unusable-selected,
zero-average, and stand-in landing baselines render their exact compact words
and cues; Done glance marks and hover/focus details match the landing;
changing or retrying the Done reference updates or preserves history without
perturbing live Proof (`0` legacy Playwright cases remain on the 3 files).

### 2. Project CI wall-time mounts drop `act` wrapping and chart marks keep keyboard and narrow layout

Type: Behavior
Status: planned

Add optional `readScopeHistory` to `IntentCiReadSource`
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
Status: planned

Move `intent-project-scope-glance`, `intent-scope-glance`,
`intent-project-scope-history-source-identity`, and
`intent-project-scope-history-project-isolation` (4 files, 5 legacy cases)
over `IntentScopeTimingHistory` / `useIntentCiScopeHistory` with the real
reading place (`IntentReadingProvider` + `IntentReadingPlaceOfItsOwn`) and
typed `readScopeHistory` replies recording requested source, endpoint, scope,
and `AbortSignal`.

**Proof.** Project and Done scope glances display accurate summary cues, and
switching source identity or project issues the right request and aborts/ignores
other projects' or sources' answers without leaking history across projects.

### 4. Project scope history isolates scope keys, retains live proof on failure, and recovers on Retry

Type: Behavior
Status: planned

Move `intent-project-scope-history-key-isolation`,
`intent-project-scope-history-recovery`,
`intent-project-scope-history-refresh`, and
`intent-project-scope-history-remount` (4 files, 6 legacy cases) over the real
reading place and `IntentScopeTimingHistory` beside live Scope Proof.

**Proof.** Entry, folder, file, and revision keys keep distinct kept histories
across remounts; a failed or empty history read preserves both the last kept
history and live Scope Proof, offers `Retry`, and recovers or refreshes
without borrowing history from another endpoint or scope.

### 5. Collected scope timing preserves units, provenance, segments, and gaps and runs faster on Vitest

Type: Behavior
Status: planned

Move `intent-scope-timing-history-absent`, `intent-scope-timing-history-gaps`,
`intent-scope-timing-history-provenance`, `intent-scope-timing-history-reading`,
`intent-scope-timing-history-segments`, and `intent-scope-timing-history-units`
(6 files, 10 legacy cases) over `IntentScopeTimingHistory` (plus direct pure
timing checks only where DOM rendering is not the proof). Remove any
`dashboard/test-support/` history module whose last consumer across `e2e/` and
`dashboard/frontend-tests/` has moved, and record the two-worker before/after
timing and case-disposition comparison against Slice 1's 19-file legacy
baseline and the `3,437 ms` Vitest wall-time baseline.

**Proof.** Absent, partial, and unavailable timing reasons, separate case vs
file units, interrupted segments, build dates, and provenance stay readable
and accessible; zero legacy Playwright cases remain across all 19 owned files;
no `act`/`IS_REACT_ACT_ENVIRONMENT` remains in the owned history specs; spent
history support is removed; and two-worker Vitest elapsed time including
preparation improves over the legacy baseline.

## Plan review

Split from `752-speed-intent-proof-and-timing/PLAN.md` (former Slices 4–6) and
realigned into 5 single-seam slices (3–6 test files each) so every slice fits
comfortably within the 15-minute active budget.
