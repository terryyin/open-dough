# Get fast proof of Intent attempt and Summary proof

**Identity:** SEED-413#speed-intent-attempt-and-summary-proof
**Source:** [Get fast proof of Intent attempt and Summary proof](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-attempt-and-summary-proof)
**Split from:** SEED-413#speed-intent-proof-and-timing (recoverable at `3acae5160:.planning/slice-plans/752-speed-intent-proof-and-timing/PLAN.md`, former Slices 7–10) on 2026-11-21 at its delivered Slice 3 boundary

## Goal and scope

Give maintainers fast Vitest proof of the chosen CI attempt's Proof and compared
Summary rows at the homepage, location, folder, and file. Move the 18 legacy
specs (49 cases) onto the corrected production Intent page entry with typed CI
reads. Remove spent `dashboard/test-support/` modules whose last consumer moves
with this cohort, and compare the cohort's two-worker time with the recorded
baseline. CI status, wall-time history, scope history, collected timing and
chart marks, and source browsing stay with their completed sibling stories.
Reads that still leave `ConfiguredDashboard` outside the page entry stay with
[Drive the published observation through the typed page entry](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#drive-published-observation-through-page-entry).

## Current decisions

- Mount homepage attempt-proof cases through `mountJudgedRunProof` /
  `mountIntentCiPage` with typed `readStatus` and `readProof` answers built by
  Node-free `aCiProofEntry` / `aCiProofEvidence` on `pageMakeMe.mjs`. Mount
  single-attempt Summary cases the same way, then open the selected location,
  folder or file as the production Intent tree does.
- Mount compared Summary and file-Proof cases through `openDoneStoryComparison`
  (or the same `mountIntentCiPage` + Done selection path) with typed
  `readComparison` / `readProof` answers from `aComparedStory` / `scopeReadsOf`.
  Do not keep `renderComparison`, the comparison-mount markup path, or
  `ComparisonMountScope` / hand-built `StoryCiEvidence` compositions as the
  Vitest destination. Do not call `ciTargetOf`, `scopeEvidenceOf`,
  `comparisonProofOf`, `intentStoryOverlay`, `overlayFilesByPath`,
  `owningLocation` or `filesOfSelection` to build view props, and do not wrap
  views in hand-written ancestor classes.
- Keep each spec's and helper's production imports to the page entry, its typed
  inputs and stylesheets. Keep colocated helpers in dedicated files without
  modifying sibling-owned page objects (`intent-ci-scope-page.tsx`,
  `intent-ci-evidence-page.tsx`, `intent-done-story-page.tsx`,
  `intent-browser-page.ts`, `intent-candidates-page.ts`,
  `intent-file-reading-page.ts`) except to stop importing a spent shared helper
  this story removes.
- For each legacy helper a move replaces, the slice lists what it checked and
  which mounted assertion now owns each check. Map each retired case's distinct
  assertions before deletion.
- North Star,
  [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  cases mount the production Intent page entry with typed reads, use only
  MakeMe data and colocated page objects, and add no wrapper. Slice 6 only
  removes spent support after its last consumer moves.
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows):
  cases act directly and wait through retrying assertions on what the action
  changes.
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e):
  every owned case leaves the Playwright runner.
- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories)
  and the [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires the moved proof to keep its promises while it gets cheaper. The
  corrected CI status test entry (recoverable at
  `7b9e64961:.planning/slice-plans/764-speed-intent-ci-status-frame-and-timing-history/PLAN.md#correction-of-the-ci-status-test-entry`)
  is the required mount shape.

## Local gate

On macOS, run on AC with `caffeinate -s -i` under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, default timeouts, and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Each slice runs its focused named proof through
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- <paths> --workers=2`
and runs `npm run typecheck:dashboard` when it changes TypeScript. Retained
Playwright outcomes are in `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`, which
each run sets to a fresh path.

## Decisive premises

Observed 23 November 2026 in the established worktree at `7cc05f008`, using its
`npm ci` dependencies (Node 24.21.0) and headless Chromium on AC through the
local-gate command above. Scratch edits were reverted.

- **Legacy baseline.** The selection `intent/intent-ci-proof`,
  `intent/intent-summary-ci-proof` and `intent/intent-summary-story-comparison`
  passed 49 Playwright `chromium` cases. Runner duration was `37,900 ms`
  elapsed including preparation (`terminal.durationMs`); summed case time was
  `44,253 ms`. Record:
  [baseline-legacy-attempt-summary.proof.json](baseline-legacy-attempt-summary.proof.json).
  This is slice 6's baseline. Pair it with a fresh baseline under comparable
  load if load differs by more than about a third. The earlier pre-split
  44-file / 95-case cohort at `58b829487` (`36,187 ms`) remains the campaign
  cross-check beside plan 752's status result.
- **Homepage attempt Proof through the page mount.** A scratch
  `intent/intent-attempt-summary-entry-probe.spec.ts` mounted
  `mountJudgedRunProof` with two typed `aCiProofEntry` answers. The Proof
  region showed both declared entry rows (`dashboard/tests`, `tests`) with
  their counts and `No timings` through `intentCiProof().showsRows`. The case
  passed in `89 ms`. The scratch file was deleted afterwards. Existing
  `intent-ci-status-execution-time.spec.ts` already exercises the same mount
  for timing gaps.
- **Done Summary comparison through the page mount.** The same scratch probe
  opened `openDoneStoryComparison` with the Summary-scope Done story's typed
  comparison, clicked `dashboard/tests`, and observed the Summary region's own
  figures (`doneEntryOwnFigures`) and child rows (`doneEntryComparisonRows`).
  The case passed in `829 ms`. Existing
  `intent-ci-cues-dark-contrast.spec.ts` and Done scope-history mounts use the
  same entry.

## Execution context

- Kaoru-chan, Story Branch Mode, `codex/get-fast-proof-of-intent-attempt-and-summary-pro`.
  Publisher `dashboard-territory.local-open-dough`. Starting revision
  `5d7701f0604457b29d758e07822039ef4a020b95`; Take
  `2c9c98322143935902f8642bc8a6fd6fd385c925` accepted on `origin/main`
  and published as the initial story-branch base.
- Slice 1 accepted on the story branch at `cc4d0b9fa966c9fd7de360122593773f731297b4`.
- Slice 2 accepted on the story branch at `32b31b9da1bf15abac0aec93209cb8d504c451ff`.
- GitHub Actions `ci.yml` observes the published story branch. The active
  observer identity and increment receipts are retained in the execution conversation.

## Slices

### 1. Homepage attempt proof preserves grouped locations, surviving shards, and accessibility

Type: Behavior
Status: done

Move `intent-ci-proof`, `intent-ci-proof-accessibility`, and
`intent-ci-proof-grouped-location` (3 files, 5 legacy cases) onto
`mountJudgedRunProof` / `mountIntentCiPage` with typed proof reads.

Behavior: a failed or partial attempt's Proof is held or answered → the
homepage names the run once with linked attempt and revision and one row per
declared entry, including surviving per-part figures and grouped locations →
narrow and zoomed viewports and keyboard reading still expose the same
controls and words without sideways scroll.

**Proof.** The three moved files pass on Vitest with legacy assertions mapped.
A held proof still shows Failed beside Checking; releasing it fills the rows.
Delete the three legacy files.

The five legacy cases keep their files and case titles as Vitest browser cases.
`mountFailedAttemptProof` supplies the run judgment, declared locations and
proof through the production page's typed reads. The new observation owners are:

| Legacy case and check | Mounted assertion |
| --- | --- |
| Held failed attempt, link and entry navigation | `ci.answers`, the visible Checking cue and their order establish the held state. `showsAttemptAndRevision`, the single linked attempt and `showsRows` establish the released result. The typed read records one exact run and attempt. The configured entry opens Summary, presses the location control and focuses the pane. The retired entry has no action. |
| Missing part | `showsRows` observes the surviving 110 cases and Part 4 missing. The timing cell keeps the full accessible description. |
| Unavailable proof | The Proof region exposes the exact unavailable text beside the Failed judgment. |
| Grouped location | `showsRows` checks four rows in declared order, three headers, cell roles, per-unit labels and mixed figures. The gap also keeps its title and accessible description. |
| Narrow and zoomed reading | At 640×450 and 320×256 CSS pixels, Chromium measures whole words, table containment and no sideways overflow. The case checks the same rows, verdict and gap description and uses Tab and Space to reach the same controls and focused Summary. |

Accepted proof: the local gate selected the three migrated specs plus `intent-ci-status-execution-time.spec.ts` and `intent-ci-status-sort.spec.ts`, with 11 Vitest Chromium cases passing in 3.835 s. `npm run typecheck:dashboard` passed. The Git evidence directory retains the literal commands and observations in `slice1-refactor-report.md` and the two `slice1-refactor-*.log.run.json` records.

### 2. Single-attempt Summary proof preserves kept carryover, gaps, table membership, and sorting

Type: Behavior
Status: done

Move `intent-summary-ci-proof-gaps`, `intent-summary-ci-proof-kept`,
`intent-summary-ci-proof-sort`, and `intent-summary-ci-proof-table` (4 files,
7 legacy cases) through the page mount: open the selected location, folder or
file after the judged attempt's proof is answered.

Behavior: a selected entry has missing shards or no file breakdown → Summary
keeps entry totals, leaves children partial with accessible gap labels, and
reuses the kept attempt across scope navigation without another CI proof read.
Table membership and sort stay readable.

**Proof.** The four moved files pass on Vitest. A kept-carryover case fails
when navigating rereads proof. Delete the four legacy files.

The seven legacy titles keep their names as Vitest cases. `mountAttemptSummary` replaces the frontend route stand-ins with typed read answers. The production location, folder, file and perspective controls own navigation.

| Legacy case and check | Mounted assertion |
| --- | --- |
| Missing shard plus no breakdown | `expectScopeRows` preserves entry totals and every immediate child's figures. Entry and folder gaps have exact text, title and accessible description. The unmeasured file has an empty description and the outside list gives the full no-breakdown reason. |
| Entry-only proof | Own figures and all child gaps are exact. The About these figures list retains its browse-mode snapshot. The child opens its file source. |
| Unavailable summary | Home and Scope give the same no-summary wording. Own figures and the child table stay readable, and a child opens its folder. |
| Kept attempt after failed refresh | Homepage and Summary preserve the same full alert, prior timestamp, visible judgment and attempt evidence. The child source opens and the returned Summary keeps the typed proof call count at one. A temporary real file-selection reread failed this exact assertion, and the product edit was restored. |
| Counts sort and drill-down | Native header metadata, click and Enter, row order and the stationary own figures are checked on entry and folder. Development and Intent controls retain the folder sort. The URL matches its initial value and storage has no sort value. |
| File missing from tree | Exact rows show the unlisted file counted once under its listed folder. The folder's outside row and one heard label disclose it with full wording. |
| Narrow and zoomed Summary | Chromium measures local and page overflow, table fit and whole words in the table, figures and evidence list at the legacy CSS viewport sizes. |

Accepted proof: the local gate selected the four migrated specs with 7 Vitest Chromium cases passing in 5.440 s. The refactor reran all 6 affected cases in 5.298 s and reused the kept proof. The Git evidence directory holds the case, helper and consumer map, literal run commands and caught reread in `slice2-implementation-report.md` and `slice2-refactor-report.md`. `npm run typecheck:dashboard` passed.

### 3. Compared Summary rows disclose fallback endpoints, outside evidence, and precise endpoint rows

Type: Behavior
Status: done

Move `intent-summary-story-comparison-fallback`,
`intent-summary-story-comparison-outside`, and
`intent-summary-story-comparison-rows` (3 files) through
`openDoneStoryComparison` with typed comparison reads.

Behavior: Baseline, Branch, Landed and Provisional stay distinguishable;
outside rows and fallback counts come from their intended endpoint; nested
Summary and file Proof keep precise endpoint rows and audible labels.

**Proof.** The three moved files pass on Vitest. A Taken Trunk case names
Provisional and keeps the unused Landed explanation through entry, folder and
file Proof. Delete the three legacy files.

All ten legacy titles remain as Vitest cases. `openSummaryComparison` replaces the comparison markup mount with actual card selection, the Changes tab and typed endpoint reads. The real Taken list uses its published title. The Done list uses its selected story identity.

| Legacy case and check | Mounted assertion |
| --- | --- |
| Taken Trunk | `expectFallback` and the ordered heard labels distinguish Provisional from unused Landed in entry and folder Summary and file Proof. |
| Landed running | Entry, folder, nested folder and file Proof show Branch and the exact running explanation. The file keeps its +70 ms Branch figure. |
| Landed with no proof | An explicitly unavailable typed Landed answer preserves the same Branch figure and exposes its own distinct explanation at all four depths. |
| Ghost file, unbroken-down part and outside evidence | The last child row shows the ghost and part in separate heard labels with full reasons. Selecting the entry-only location shows the exact Landed no-breakdown browse snapshot. |
| Unchanged nested Summary | `expectComparisonRows` reads exact named figures, headers, roles, and endpoint values for `c.spec.ts`. |
| Unchanged file Proof | Real file selection and Proof show one row with the full file path, unchanged count, 340 ms Baseline and both +70 ms deltas. |
| Audible labels and separate cues | The endpoint list keeps exact heard words, browse snapshot and observed-build framing. Every entry row preserves count and duration cues with distinct reasons. |
| Folder cue reasons | Exact folder own and child figures show independent unchanged and below-threshold reasons. |
| Owning merge change | The reviewed nested file has the Modified marker while its endpoint figures remain precise. |
| Skipped Baseline | The mounted label names the ancestor and keeps the full skipped explanation in hover and browse reading. |

Accepted proof: the local gate selected the three migrated specs and four existing Summary helper consumers, with 17 Vitest Chromium cases passing in 9.064 s. The refactor reran the 9 affected cases and reused 8. The Git evidence directory holds exact setup, assertions, consumer traces and terminal commands in `slice3-implementation-report.md` and `slice3-refactor-report.md`. `npm run typecheck:dashboard` passed.

### 4. Compared Summary gaps explain partial and absent evidence

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-gaps` (1 file, 5 legacy cases) through
`openDoneStoryComparison`.

Behavior: partial, absent and outside gap labels keep their visible and
accessible meanings across entry, folder and file scopes without losing the
comparison framing.

**Proof.** The moved file passes on Vitest. Removing a gap label's accessible
description fails its case. Delete the legacy file.

### 5. File drill-down gives renamed, partial, and selected files their exact evidence and bindings

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-file`,
`intent-summary-story-comparison-file-proof-counts`, and
`intent-summary-story-comparison-presentation-bindings` (3 files) through the
page mount's file drill-down (Changes → file → Proof / Purpose).

Behavior: selected, renamed-across-units and merge-edited files receive their
own case and file counts and timing once; Purpose shows the changed file's
diff without comparison framing above it; drilling into Proof reuses the
chosen attempt without another live proof read.

**Proof.** The three moved files pass on Vitest. A renamed-across-units case
fails when counts are merged with another file. Delete the three legacy files.

### 6. Compared Summary sorting and Show % stay with the reader, spent support is removed, and proof runs faster

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-column-sort`,
`intent-summary-story-comparison-relative`,
`intent-summary-story-comparison-signed-sort`, and
`intent-summary-story-comparison-sort` (4 files) through the page mount.
Remove spent `dashboard/test-support/` modules whose last consumer across
`e2e/` and `dashboard/frontend-tests/` migrated with this cohort. Record the
two-worker before/after timing and case-disposition comparison against the
legacy baseline.

Behavior: native column sorting and Show % preserve signed order, accessible
sort direction, per-scope relative scaling, and retained preference across
drill-down and return.

**Proof.** The four moved files pass on Vitest; zero legacy Playwright cases
remain across the 18 owned files; spent support is gone; two-worker Vitest
feedback is faster than the `37.9 s` baseline under comparable load. Delete
the four legacy files.

## Concern evidence and readiness

- Slice-plan refinement was not needed: six Behavior slices stay within the
  eight-slice limit, each reuses the settled page-mount entry, and no
  independent second outcome or repeated special-case design remains across
  successive slices.
- No remaining slice-specific concern.
