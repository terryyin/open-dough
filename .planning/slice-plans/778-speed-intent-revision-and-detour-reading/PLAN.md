# Get fast proof of Intent revision reading and reading-place detours

**Identity:** SEED-413#speed-intent-revision-and-detour-reading
**Source:** [Get fast proof of Intent revision reading and reading-place detours](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-revision-and-detour-reading)
**Split from:** SEED-413#speed-intent-source-browsing-and-detours (plan `762`, former Slice 9 remainder and Slice 10) on 2026-11-23 at its delivered Slice 9 boundary

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

## Provisional input from plan 762

These slices are mapped from plan 762 and stay provisional until story
refinement and plan realignment. Plan 762's decisions, local gate and
learnings carry over; read its Slices 3–9 Learnings before refining.

- Mount the production Intent body with `mountIntentCiPage`
  (`dashboard/frontend-tests/intent/intent-ci-page-mount.ts`) and typed
  replies from `pageReadsSupplying`; it cannot drive the published
  observation's recovery timers, `visibility` or `limitStands`, story-card
  links or project visits from a board card. Those cases belong to
  SEED-413#drive-published-observation-through-page-entry.
- Page-loadable MakeMe builders that import dashboard production code live
  on `pageMakeMe.mjs` only, outside `makeMe.mjs`'s import closure, which the
  native evidence identity checks hash.
- The file cache and answer memos are module-global and keyed by revision:
  cases in one file that read the same file need distinct revisions.
- Retained legacy Playwright cases run silently beside Vitest in
  `test:dashboard:frontend`; read their outcomes from the proof record.

Legacy baseline for the original 15-file cohort, captured at `6c51cc4eb` on
2026-11-22 before any of its files changed: 22 Playwright `chromium` cases,
26.8 s runner time at load 10.0 (plan 762 evidence
`s5-legacy-baseline.json`, recoverable by rerunning
`npm run --silent test:dashboard:frontend -- <the 15 files> --workers=2` at
that revision).

## Provisional slices

### 1. Pinned-file failures, Retry and pending revisions prove the production Intent body

Status: provisional

Move `intent-revision-fixtures.ts`'s `mountIntentReading` (renders
`IntentReadingProvider` and `ProjectIntentReading` directly) and
`mountProjectIntent` onto `mountIntentCiPage`, whose `showWork` shows a newer
revision, with their consumers: `intent-source-target-recovery.spec.ts`
(lines 121, 149), `intent-revision-update-failures.spec.ts` (lines 41, 76),
`intent-revision-apply.spec.ts` (line 22) and the other `intent-revision-*`
specs. Plan 762 Slice 9 found these the only proof of "a pinned file read
names its cause", "Retry loads the right revision and source" and "Purpose
keeps the applicable source while a later revision is pending".

### 2. Project Intent activation opens Project Intent or the selected story

Status: provisional

Move `intent-home-activation` cases 1–2 onto `mountIntentCiPage` with typed
CI-status, review and comparison replies (reuse the setups in
`intent-ci-status-homepage.spec.ts:56` and `intent-ci-status-kept.spec.ts:44`).
Case 2's page-URL check needs an E2E owner or stays. Case 3's newer revision
comes from the observation's revision check and stays with the observation
story.

### 3. The Candidates record is read once across leaving Intent

Status: provisional

`intent-read-reuse`'s "the Test Optimization Candidates record is read once
across leaving Intent and returning" reuses through `memoizedAnswer` in
`readIntentCandidatesAt` (`authenticatedIntentCandidatesRead.ts`), below the
page entry, with no typed collaborator. Prove it at the reader through a
typed collaborator (a production seam this slice adds), then retire the
legacy case.

### 4. Reading place and recent stories restore the nested file and reading position after a detour

Status: provisional

Move `intent-reading-place` (2) and `intent-recent-stories` (1). A visit to
Development and back crosses the composed page; check before planning
whether it needs the published observation, and route such cases to the
observation story.

### 5. The 15-file cohort runs faster than its legacy baseline

Status: provisional

Audit remaining `dashboard/test-support/` consumers across the 15 files and
record the two-worker before/after comparison, including preparation and E2E
runtime (plan 762 Slice 5's popup journey, 7.6 s), against the baseline above.
