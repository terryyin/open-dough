# Show summaries when selecting Intent entries and folders

**Identity:** SEED-217#intent-entry-folder-summaries
**Source:** [selected story](../../seeds/SEED-217-intent-entry-folder-summaries.md#intent-entry-folder-summaries).

## Goal and scope

In Intent's file browser, clicking a configured location's entry also selects
it and shows its summary page; a folder's caret toggles it, and its row selects
it (then toggles it once selected) and shows the folder's summary page. A
summary gives the selection's file and scenario statistics and its Proof
summarized over every contained scenario and outline row, never observed rows
counted as _Not observed_, with a breakdown by immediate child.

Exclusions, from the story: durations or run times in a summary, test counts
or Proof for non-Gherkin kinds, opening a child from a summary row, the
selection on the URL, a project-wide summary, and earlier-file-version counts.
Review changes keeps its folders as disclosures only.

Required restriction (North Star
[Runtime proof and hierarchy](../../../docs/dashboard-ux-ui-north-star.md#runtime-proof-and-hierarchy)):
a summary with unobserved, unread, or non-passing rows never reads as
validated; an unread file is named, never counted as passed or unobserved.

Accepted behavior change (Terry's request, observed below): a location entry
click now replaces a selected file's Purpose with that location's summary,
where today collapsing a location or opening another keeps the file's Purpose.

## Existing solutions and decisions

PFE:

- **Folder tree (change, opt-in).** `dashboard/src/StoryReviewFileTree.tsx`
  `FileTree` renders each folder as one disclosure button, shared with Review
  changes. Add an optional folder-selection render path that Intent supplies
  (caret disclosure + selectable name); Review changes passes nothing and keeps
  its rows. No second tree.
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
for each read file. Its count line is the shared count line over those rows'
latest observations. A summary's breakdown applies the same rule to each
immediate child (subfolder or file) in the tree's order. A file's existing
Proof count line is that rule for one file; no separate folder or location
recognizer.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Existing Intent Gherkin, code, and Proof journeys pass here (baseline to extend) | Playwright Intent journeys | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts dashboard/tests/intent-gherkin-browse.spec.ts dashboard/tests/intent-code-browse.spec.ts` in this workspace after `node scripts/setup-native.mjs npm` and `browser` | 9 passed (2026-11-02), including the count line "5 scenarios: 2 passed, 1 passed after retry, 1 failed, 1 not observed" |
| Which journeys rely on a location entry click keeping a selected file's Purpose | Intent journeys with a scratch edit making the entry click clear the selection | Scratch edit to `IntentBrowser.tsx` `onToggle` (`setSelection({ path: "" }); setView("purpose")`), then `... --reporter=list dashboard/tests/intent-*.spec.ts dashboard/tests/development-intent*.spec.ts`; edit reverted | 2 failed, 29 passed: `intent-gherkin-groups.spec.ts` step "select file, collapse its group: Purpose keeps it" and `intent-gherkin-unusable.spec.ts` step "kind java … others still browse" (file Purpose after opening another location). Both are slice 1's to rewrite for the accepted change |
| Review changes folder disclosure is proven and stays unchanged | `story-review-tree-collapse.spec.ts`, `story-review-tree.spec.ts` | `... --reporter=list dashboard/tests/story-review-tree-collapse.spec.ts dashboard/tests/story-review-tree.spec.ts` | 2 passed; they click `button.story-review-folder` and assert `aria-expanded`, so a changed Review folder row fails them |
| Intent journeys address folders and entries by `button.story-review-folder` and `button.intent-location-toggle` | `dashboard/tests/intentPerspectivePage.ts` helpers, `intent-gherkin-groups.spec.ts` | Read | Located; slice 1 keeps the entry control's class and gives Intent's caret the disclosure role so helpers keep working, or updates them in the same slice |

No other premise is decisive: summaries reuse the file read and Proof data
paths the baseline journeys exercise.

## Outside-in proof

New Playwright journey `dashboard/tests/intent-entry-folder-summaries.spec.ts`
on Pygardon-like fixtures (extend `intentCucumberProofFixtures.ts` or a sibling
fixture with a `jobs/` folder, several features, and proof), plus a Doughnut-
like no-proof Gherkin location and an Open Dough-like typescript location.
Run each slice's focused journeys with `--reporter=list`, unsetting
`NO_COLOR`/`FORCE_COLOR`, then all `dashboard/tests/intent-*.spec.ts`,
`development-intent*.spec.ts`, and `story-review-tree*.spec.ts` before
delivery, because the slice changes the shared tree and selection owner.

## Ordered slices

### 1. Select a location or folder and see its summary page
Type: Behavior
Status: planned
Proof: new journey steps for entry, caret, row, and file clicks; Review
changes journeys unchanged; rewritten steps in `intent-gherkin-groups` and
`intent-gherkin-unusable`.

Behavior: Intent open on a configured project → click a location entry, a
folder caret, a folder row, the selected row again, a file, another folder →
the entry toggles and selects; the caret toggles without moving selection; an
unselected row selects keeping its open state; the selected row toggles and
keeps selection; a file shows Purpose and Proof as today; the summary page
names the selection's path and file count; non-Gherkin kinds and unusable
locations show their Proof-absent or location explanation. Both folder
controls work by keyboard; the selected folder reads as pressed. Review
changes folders still only toggle. Update
[Development and Intent](../../../docs/dashboard-development-intent.md) for
the click model and the replaced keep-Purpose behavior.

### 2. Summarize a Gherkin selection's scenarios and Proof
Type: Behavior
Status: planned
Proof: new journey steps on the Pygardon-like and Doughnut-like fixtures:
reading progress, scenario totals, the aggregate count line including
_Not observed_, per-child breakdown, one failed file named with a retry that
reads only it; the file Proof count line unchanged.

Behavior: A Gherkin location or folder selected → its summary reads each
contained file (bounded concurrency, "N of M files read") → statistics give
files and scenario rows; with declared proof, one count line over every row
and a row per immediate child with its own count; without proof, Proof is not
recorded with the reference; a proof read failure keeps its retry; an unread
file is named with retry and excluded from counts. Count-line rule shared with
file Proof. Update
[Development and Intent](../../../docs/dashboard-development-intent.md) and
[GitHub requests](../../../dashboard/GITHUB-REQUESTS.md) (one contents read per
contained feature file not already pinned, on selecting a summary).

## Concern evidence

Refinement: not needed; each slice owns one proof loop, the domain rule is one
recursive rule, and the only Structure (shared tree opt-in, selection widening,
count-line extraction) belongs inside the Behavior that needs it.

Remaining slice-specific concerns: none identified in this review.
