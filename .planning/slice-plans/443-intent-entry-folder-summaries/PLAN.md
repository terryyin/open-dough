# Show summaries when selecting Intent entries and folders

**Identity:** SEED-217#intent-entry-folder-summaries
**Source:** [selected story](../../seeds/SEED-217-intent-entry-folder-summaries.md#intent-entry-folder-summaries).

## Goal and scope

In Intent's file browser, locations and folders use the same separate caret
and name controls: the caret toggles expansion without changing selection or
the reader; an unselected name selects its summary without changing expansion;
the selected name toggles expansion and keeps the summary. Locations still
allow only one open at a time. Selecting a closed location's name does not
open it or close another location. A summary gives the selection's file and
scenario statistics and its Proof summarized over every contained scenario
and outline row, never observed rows counted as _Not observed_, with a
breakdown by immediate child.

Exclusions, from the story: durations or run times in a summary, test counts
or Proof for non-Gherkin kinds, opening a child from a summary row, the
selection on the URL, a project-wide summary, and earlier-file-version counts.
Review changes keeps its folders as disclosures only.

Required restriction (North Star
[Runtime proof and hierarchy](../../../docs/dashboard-ux-ui-north-star.md#runtime-proof-and-hierarchy)):
a summary with unobserved, unread, or non-passing rows never reads as
validated; an unread file is named, never counted as passed or unobserved.
Scenario totals and Proof count lines are explicitly _Partial_ while any
contained file is pending or unread, with contributing-file counts for the
selection and each affected child. Fully read children remain complete. With
no readable files in a nonempty selection, the scenario total is unavailable,
not zero.

Terry's follow-up adopts the same caret/name behavior for locations and
folders. A location caret preserves today's keep-Purpose behavior when
collapsing a location or opening another; only selecting its name replaces
the reader with that location's summary. The earlier interpretation that a
single location control both toggles and selects is superseded.

Failure and flaky-test policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every slice and any repair handoff.

## Existing solutions and decisions

PFE:

- **Folder tree (change, opt-in).** `dashboard/src/StoryReviewFileTree.tsx`
  `FileTree` renders each folder as one disclosure button, shared with Review
  changes. Add an optional folder-selection render path that Intent supplies
  (caret disclosure + selectable name); Review changes passes nothing and keeps
  its rows. No second tree.
- **Location header (change).** `dashboard/src/IntentLocationGroup.tsx`
  currently renders one disclosure button. Separate its caret and selectable
  name with the same behavior and keyboard semantics as Intent's folder rows;
  keep exclusive location expansion owned by `IntentBrowser.tsx`, independent
  of selection. No new selection owner or tree.
- **Selection owner (extend).** `dashboard/src/intentWorkspaceSelection.ts`
  holds a file path; widen it to a location, folder, or file selection in the
  same owner, still disposable page state
  ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
- **Scenario rows and count line (reuse, extract).** `scenarioRowsOf`
  (`dashboard/src/gherkinScenarios.ts`) and the count line, categories and
  order in `dashboard/src/IntentProof.tsx`. Move the count-line rule into one
  shared function used by the file Proof and summaries.
- **File reads (reuse).** `readRepositoryFileAt` through the authenticated
  read boundary (already refuses paths outside locations; pinned and
  retained), with `mapPool` (`dashboard/src/boundedPool.ts`) bounding
  concurrency. No new server route.
- **Absent-Proof wording (reuse).** `NotRecorded` / `ProofProblem`
  (`dashboard/src/IntentProofProblem.tsx`) and location explanations in
  `dashboard/src/IntentLocationGroup.tsx`.

No North Star topic is added; the story follows the existing
[Runtime proof and hierarchy](../../../docs/dashboard-ux-ui-north-star.md#runtime-proof-and-hierarchy)
direction. Maintained documentation to update with behavior:
[Development and Intent](../../../docs/dashboard-development-intent.md) and
[GitHub requests](../../../dashboard/GITHUB-REQUESTS.md).

## Domain rule

One rule for every selection: its contained files are the location's files
under its path (all of them for a location; one for a file). Its statistics
are the file count and, for Gherkin, the scenario rows `scenarioRowsOf` gives
for each read file. The matching-file inventory stays complete; the scenario
total and shared Proof count line cover only successfully read files, using
those rows' latest observations. Whenever that is fewer than the inventory,
label both _Partial_, show contributing
files out of the inventory, and distinguish files still reading from files
that failed. An unknown scenario denominator is never zero or _Not observed_.
A summary's breakdown applies the same rule to each immediate child (subfolder
or file) in the tree's order, so only children with pending or failed reads
are partial. Retry replaces those subtotals and removes partial labels only
where every contained file is read. A file's existing Proof count line stays
unchanged; no separate folder or location recognizer.

## Decisive premises

The following results are retained from the original preparation workspace
`/Users/terryyin/git/open-dough/.worktrees/show-summaries-when-selecting-intent-entries-and`,
as recorded in `362b0b4d`. Its scratch change was reverted. This revision
changes planning records only; it does not claim a fresh product test run.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Existing Intent Gherkin, code, and Proof journeys pass (baseline to extend) | Playwright Intent journeys | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts dashboard/tests/intent-gherkin-browse.spec.ts dashboard/tests/intent-code-browse.spec.ts` in the original preparation workspace after `node scripts/setup-native.mjs npm` and `browser` | 9 passed (2026-11-02), including the count line "5 scenarios: 2 passed, 1 passed after retry, 1 failed, 1 not observed" |
| Which journeys rely on a location entry click keeping a selected file's Purpose | Intent journeys with a scratch edit making the entry click clear the selection | Scratch edit to `IntentBrowser.tsx` `onToggle` (`setSelection({ path: "" }); setView("purpose")`), then `... --reporter=list dashboard/tests/intent-*.spec.ts dashboard/tests/development-intent*.spec.ts`; edit reverted | 2 failed, 29 passed: `intent-gherkin-groups.spec.ts` step "select file, collapse its group: Purpose keeps it" and `intent-gherkin-unusable.spec.ts` step "kind java … others still browse" (file Purpose after opening another location). Slice 1 preserves both keep-Purpose assertions using caret clicks; the failed scratch result explains why toggle and selection must remain separate |
| Review changes folder disclosure is proven and stays unchanged | `story-review-tree-collapse.spec.ts`, `story-review-tree.spec.ts` | `... --reporter=list dashboard/tests/story-review-tree-collapse.spec.ts dashboard/tests/story-review-tree.spec.ts` | 2 passed; they click `button.story-review-folder` and assert `aria-expanded`, so a changed Review folder row fails them |
| Intent journeys address folders and entries by `button.story-review-folder` and `button.intent-location-toggle` | `dashboard/tests/intentPerspectivePage.ts` helpers, `intent-gherkin-groups.spec.ts` | Read | Located; slice 1 targets the caret disclosure in existing expand/collapse helpers and adds separate name-selection coverage. Preserve path/kind/pattern assertions on the enclosing location row when its label moves off the caret |

No other premise is decisive: summaries reuse the file read and Proof data
paths the baseline journeys exercise.

## Outside-in proof

New Playwright journey `dashboard/tests/intent-entry-folder-summaries.spec.ts`
on Pygardon-like fixtures (extend `intentCucumberProofFixtures.ts` or a sibling
fixture with a `jobs/` folder, several features, and proof), plus a Doughnut-
like no-proof Gherkin location and an Open Dough-like typescript location.
The new journey observes location and folder caret/name controls with keyboard
and pointer use, preserves the reader on caret navigation, and distinguishes
unselected-name selection from selected-name toggling. Slice 2 observes
partial statistics and Proof at the selection and affected child boundaries,
including Gherkin statistics without declared proof and recovery to complete
totals. Existing keep-Purpose assertions stay intact; adjust their control
locators to use the caret, not their promised behavior.
Run each slice's focused journeys with `--reporter=list`, unsetting
`NO_COLOR`/`FORCE_COLOR`, then all `dashboard/tests/intent-*.spec.ts`,
`development-intent*.spec.ts`, and `story-review-tree*.spec.ts` before
delivery, because the slice changes the shared tree and selection owner.

## Ordered slices

### 1. Select a location or folder and see its summary page
Type: Behavior
Status: planned
Proof: new journey steps for location and folder caret/name controls and file
selection, including keyboard operation, closed-name selection, selected-name
toggles, exclusive location expansion, and reader preservation on caret clicks.
Review changes journeys unchanged; keep-Purpose assertions in
`intent-gherkin-groups` and `intent-gherkin-unusable` preserved with caret
locators, including the failed-read retry journey in the latter.

Behavior: Intent open on a configured project → for both locations and
folders, click the caret, an unselected name, the selected name, and a file →
the caret toggles without moving selection or changing the reader; an
unselected name selects keeping its open state; the selected name toggles and
keeps selection. Select a closed location name while another is open: its
summary appears, it stays closed, and the other stays open; toggling it open
then closes the other location. With a file selected, collapse its location,
open another by caret, and re-expand the original: Purpose and Proof remain
on the file and its row is still selected when visible. A file shows Purpose
and Proof as today; the summary page names the selection's path and file
count; non-Gherkin kinds and unusable locations show their Proof-absent or
location explanation. Both controls on each location and folder work by
keyboard; the selected name reads as pressed, the caret as expanded or
collapsed. Review changes folders still only toggle. Update
[Development and Intent](../../../docs/dashboard-development-intent.md) for
the shared caret/name model and preserved reader during caret navigation.

### 2. Summarize a Gherkin selection's scenarios and Proof
Type: Behavior
Status: planned
Proof: new journey steps on the Pygardon-like and Doughnut-like fixtures:
reading progress, scenario totals, the aggregate count line including
_Not observed_, per-child breakdown, partial scenario and Proof totals while a
file is pending or failed (for parent and affected child, complete siblings
unchanged), nonempty selections with no readable files show unavailable totals,
and one failed file named with a retry that reads only it and restores complete
totals. No-proof Gherkin
statistics also label partial totals; the file Proof count line is unchanged.

Behavior: A Gherkin location or folder selected → its summary reads each
contained file (bounded concurrency, "N of M files read") → statistics give
files and scenario rows; with declared proof, one count line over every row
and a row per immediate child with its own count; without proof, Proof is not
recorded with the reference. While any required file is pending or unread, scenario
totals and Proof count lines say _Partial_ with contributing-file coverage,
for example "23 scenarios across 8 of 9 files; 1 file unread" after one read
fails. Apply that rule independently to the selection and each affected
child; distinguish reading from failed files, and show scenario total
unavailable when a nonempty selection has no readable files. A proof read
failure keeps its retry; an unread file is named with retry and excluded from
scenario and outcome counts.
A successful retry includes its rows and removes partial labels only where
all files are read. Count-line rule shared with file Proof. Update
[Development and Intent](../../../docs/dashboard-development-intent.md) and
[GitHub requests](../../../dashboard/GITHUB-REQUESTS.md) (one contents read per
contained feature file not already pinned, on selecting a summary).

## Concern evidence

2026-11-02 reassessment after Terry's follow-up: retain both slices, with no
renumbering or replacement slices. Slice 1 owns the consistent interaction
model and summary shell; slice 2 owns complete or explicitly partial Gherkin
aggregation and recovery. Each has one cohesive proof loop and a useful
stopping point. The shared tree opt-in, location-header controls, selection
widening, and count-line extraction stay with the Behavior that needs them.
The cumulative design uses one selection owner and one aggregation rule for
locations, folders, and immediate children; no new architecture direction or
existing-solution decision is needed. No numeric slice target, hard limit,
or sizing exception was supplied.

Remaining slice-specific concerns: none identified in this review.
