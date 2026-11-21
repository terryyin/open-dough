# Get fast proof of Intent attempt and Summary proof

**Identity:** SEED-413#speed-intent-attempt-and-summary-proof
**Source:** [Get fast proof of Intent attempt and Summary proof](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-attempt-and-summary-proof)
**Split from:** SEED-413#speed-intent-proof-and-timing (recoverable at `3acae5160:.planning/slice-plans/752-speed-intent-proof-and-timing/PLAN.md`, former Slices 7–10) on 2026-11-21 at its delivered Slice 3 boundary

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.
It resumes through `dough-story-refinement` and plan realignment; the original
slices' readiness does not carry over.

## Goal and provisional scope

Dashboard maintainers get fast Vitest feedback on what the chosen CI attempt's
proof and compared Summary rows say at the homepage, location, folder, and
file, including surviving shard figures, fallback and owning-merge endpoints,
renamed and outside files, and retained sorting and Show % presentation across
drill-down and return. Move the 49 legacy cases across 18 files in
`dashboard/frontend-tests/intent/`:
- `intent-ci-proof`, `intent-ci-proof-accessibility`,
  `intent-ci-proof-grouped-location` (3 files, 5 legacy cases)
- `intent-summary-ci-proof-{gaps,kept,sort,table}` (4 files, 7 legacy cases)
- `intent-summary-story-comparison-{fallback,gaps,outside,rows,file,file-proof-counts,presentation-bindings,column-sort,relative,signed-sort,sort}`
  (11 files, 37 legacy cases)
Remove spent `dashboard/test-support/` modules whose last consumer across
`e2e/` and `dashboard/frontend-tests/` has migrated, and record the two-worker
before/after comparison for this 18-file / 49-case cohort (plus the combined
95-case pre-split baseline `36,187 ms` from `58b829487` alongside `plan 752`'s
`8,315 ms` status result and `plan 764`'s history result when available).

## Preserved decisions and premises from `plan 752`

- Depend on SEED-413#speed-intent-timing-history-proof, whose plan 759
  delivers the required typed page-reads entry, and on
  SEED-413#speed-intent-ci-status-frame-and-timing-history, whose plan 764
  Slices 1–3 [finish correcting the CI status test entry](../764-speed-intent-ci-status-frame-and-timing-history/PLAN.md#correction-of-the-ci-status-test-entry).
  Read CI through the required typed page-reads entry, never a default-valued
  context or an optional or defaulted reader. Reuse Node-free `aCiProofEntry`,
  `aCiProofEvidence` and `aComparedStory` on
  `Distribution/tests/support/pageMakeMe.mjs`.
- Render the production composition that owns attempt proof and Summary
  (the Intent body with its reading place) for a selected scope, fed by
  typed CI reads. Do not mount `IntentCiProof`, `IntentScopeProofView` or
  `IntentFileProofView` with props built by calling `ciTargetOf`,
  `scopeEvidenceOf`, `comparisonProofOf`, `intentStoryOverlay`,
  `overlayFilesByPath`, `owningLocation` or `filesOfSelection`. Do not wrap
  them in hand-written ancestor classes. The dark-contrast case before its
  correction is the counterexample. Mount a view directly only when it
  stands alone in production with typed props and the case's subject is
  that view's own presentation. Keep each spec's and helper's production
  imports to the entry, its typed inputs and stylesheets. Keep colocated
  helpers in dedicated files without modifying sibling-owned page objects
  (`intent-ci-scope-page.tsx`, `intent-ci-evidence-page.tsx`,
  `intent-done-story-page.tsx`, `intent-browser-page.ts`,
  `intent-candidates-page.ts`, `intent-file-reading-page.ts`).
- The scratch check below mounted `IntentScopeProofView` over hand-built
  evidence. It shows the view renders, not that this is the case entry.
  Refinement re-settles the entry under the decision above.
- At `42a660a17` on 21 November 2026 (`--workers=2`, `caffeinate -s -i`), a
  scratch Vitest Browser Mode check mounted `IntentScopeProofView` over typed
  comparison evidence, inventory, and explicit sort/preference, verified the
  rendered file row, and observed clicking the row invoke the selected-scope
  callback with its exact path. At `58b829487` on 21 November 2026, the whole
  44-file / 95-case pre-split legacy cohort ran in `36,187 ms` at `--workers=2`.

## Provisional slices (mapped from `plan 752` Slices 7–10)

### 1. Homepage attempt proof preserves grouped locations, surviving shards, and accessibility

Type: Behavior
Status: planned

Capture the 18-file / 49-case legacy baseline at `--workers=2` before
replacing the first legacy file, and move `intent-ci-proof`,
`intent-ci-proof-accessibility`, and `intent-ci-proof-grouped-location`
(3 files, 5 legacy cases) over `IntentCiProof` and `IntentCiEvidenceProvider`
through the typed page-reads entry.

**Proof.** Surviving per-part figures, grouped locations, accessible group and
row names, and narrow/zoom fit remain readable without redundant live reads.

### 2. Single-attempt Summary proof preserves kept carryover, gaps, table membership, and sorting

Type: Behavior
Status: planned

Move `intent-summary-ci-proof-gaps`, `intent-summary-ci-proof-kept`,
`intent-summary-ci-proof-sort`, and `intent-summary-ci-proof-table` (4 files,
7 legacy cases) through the production Intent composition for the selected scope.

**Proof.** Summary reuses kept attempt proof across scope navigation without
rereading CI, counts outside files once, explains gaps, and sorts cleanly.

### 3. Compared Summary rows disclose fallback endpoints, gaps, and outside evidence

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-fallback`,
`intent-summary-story-comparison-gaps`,
`intent-summary-story-comparison-outside`, and
`intent-summary-story-comparison-rows` (4 files, 14 legacy cases) through
the production Intent composition with typed comparison reads.

**Proof.** Selected, ancestor, and owning-merge builds stay distinguishable,
outside rows and fallback counts come from their intended endpoint, and each
count, timing, and cue keeps its visible and accessible meaning.

### 4. File drill-down gives renamed, partial, and selected files their exact evidence and bindings

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-file`,
`intent-summary-story-comparison-file-proof-counts`, and
`intent-summary-story-comparison-presentation-bindings` (3 files, 13 legacy
cases) through the production Intent composition's file drill-down.

**Proof.** Selected and renamed paths receive their own case/file counts and
timing once, partial/empty evidence states its reason, and drilling into Proof
reuses the chosen attempt without another live proof read.

### 5. Compared Summary sorting and Show % stay with the reader, spent support is removed, and proof runs faster

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-column-sort`,
`intent-summary-story-comparison-relative`,
`intent-summary-story-comparison-signed-sort`, and
`intent-summary-story-comparison-sort` (4 files, 10 legacy cases) through the
production Intent composition. Remove spent `dashboard/test-support/`
modules whose last consumer migrated, and record the two-worker before/after
timing and case-disposition comparison.

**Proof.** Native column sorting and `Show %` preserve signed order, accessible
sort direction, per-scope relative scaling, and retained preference across
drill-down and return; zero legacy Playwright cases remain across the 18 owned
files; spent support is removed; and two-worker Vitest feedback is faster than
the legacy baseline.
