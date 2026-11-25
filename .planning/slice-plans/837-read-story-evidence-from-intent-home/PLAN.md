# Read CI comparison and Intent coverage from Story Home

**Identity:** SEED-420#read-story-evidence-from-intent-home
**Source:** [Read CI comparison and Intent coverage from Story Home](../../seeds/SEED-420-unified-intent-review.md#read-story-evidence-from-intent-home)

Give a developer one story reading pane for CI comparison, Intent coverage,
and path detail. Opening or leaving a path keeps the evidence tied to the
story and comparison already under review. Preserve the Board's directed
Review changes entry and existing Project Intent behavior. Shared responsive
sidebars, tree unification, new filters, session selection, and new evidence
collection are outside this plan.

## Current decisions

- [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  places Home and file navigation in the sidebar, preserves the Board's
  cumulative diff entry, and keeps browsing filters independent of CI proof.
  Apply those parts with the current file sidebar and inventory.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  gives Intent one scope carrying the story, sessions, comparison and path.
  A path selects the reading. An empty path shows Home. The Home tab choice
  belongs to the current story's reading place. Keep that state disposable
  and keep CI's observed revisions and attribution rules.
- Reuse the existing [workspace selection](../../../dashboard/src/intentWorkspaceSelection.ts),
  [browser and path reader](../../../dashboard/src/IntentBrowser.tsx),
  [CI evidence owner](../../../dashboard/src/IntentCiEvidence.tsx), and
  [coverage reader](../../../dashboard/src/IntentStoryCoverage.tsx).
  Move the existing story evidence panels into the common reading pane.
  Project Intent already uses the empty path for CI status. Its mode and
  candidate navigation have their own lifecycle and stay with Project Intent.
- Reuse the [directed review request](../../../dashboard/src/pageStoryReviewOpening.tsx)
  and [first changed file selection](../../../dashboard/src/useFirstStoryChangedFile.ts).
  A pending directed request can hold the reading until its comparison and
  tree settle. It ends with the remembered file, the first eligible changed
  file, or the existing unavailable feedback. Retire its dependency on the
  Changes tab. Keep the existing source fallback that can show changed files
  in a repository with no configured Intent locations.
- Keep the comparison and evidence providers above the Home/path choice.
  Feed file filters to the existing inventory only. Use the same transition
  to CI for the sidebar Home button and the file Proof link. Preserve direct
  CI entry links to configured locations, the current path on a return to
  the same perspective, and keyboard focus at a visible reading target after
  a directed open or return. Follow the existing session choice if one is
  offered by the time execution starts.

## Outside-in proof

| Promise | Slice | Observation through the rendered Dashboard |
| --- | --- | --- |
| Ordinary story entry shows CI and usefully exposes the tree, including a repo with changed files and no Intent locations | 2 | Select the story without preselecting a path. Assert CI evidence is visible with the sidebar. Choose the existing location or folder, and a changed or unchanged file, and assert its summary, diff or source directly. Use the no-locations fixture for the comparison-only tree. |
| Browsing filters leave CI evidence intact | 2 | With a published story and CI proof that includes an unchanged failing test, toggle the current file filter while Home is visible. Assert the unchanged row leaves the sidebar and its failed result still contributes to the same visible evidence and measured build. Use the actual filter in the story browser and the existing CI fixture builders for the failure. |
| Home defaults to CI, has Intent coverage, and clears the path | 3 | From a fresh story open coverage, open a folder or file, then activate Home by its accessible name. Assert the row is no longer selected, the CI tab is selected, and the old page-level Changes tab is absent. Exercise the file Proof return and a Home activation after reopening hidden files. Preserve the project-only CI home journey. |
| A landed run and evidence qualifications survive Home navigation | 3 | Extend the captured-run and legacy-run mounted journeys. Choose a run, open its file, return Home, and see the same selection and endpoint revisions, or the whole-story fallback. Read the coverage qualification inside Home. Retain the coverage read/retry and absence assertions. |
| Board Review changes opens the correct diff directly or explains a gap | 3 | Use the Board action through the shared review page object. Check the settled first changed file and diff after cold initial sync, the remembered file on re-entry, and a no-comparison or unavailable-read case. Change the focus assertion to the visible review reading, including keyboard activation on a narrow viewport. |

## Baseline and proof routes

Observed at `5c39aaaaff1f` in the preparation worktree on macOS with local
`npm ci` dependencies and AC power. The current feature behavior below is
baseline evidence. The Home assertions above are execution proof.

| Consuming operation and profile | Observation | Result and boundary |
| --- | --- | --- |
| Mounted Dashboard in Chromium reads story and project evidence, paths and keyboard arrival | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-story-coverage.spec.ts dashboard/frontend-tests/intent/intent-home-activation-scope.spec.ts dashboard/frontend-tests/intent/intent-story-compare-evidence.spec.ts dashboard/frontend-tests/intent/intent-story-changes-no-locations.spec.ts dashboard/frontend-tests/intent/intent-ci-comparison-drilldown-relative.spec.ts dashboard/frontend-tests/review/story-review-action-mount.spec.ts` | 18/18 passed. Observed captured builds versus whole-story fallback, coverage qualification and read/retry, project/story reading isolation, comparison-only file reading, summary and Proof continuation, and keyboard entry. The old CI tab keeps its prior file. Home will deliberately clear it. |
| Board card opens Intent during a cold repository sync and waits for the live destination's first diff | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/review/story-review-initial-sync.spec.ts --workers=1 --reporter=line` | 1/1 passed. The remaining review showed the first changed file and diff after sync and read unchanged source at the published completion. This covers a cold published review, not every review state. |
| Mounted card-arrival proof detects landing on CI instead of the directed reading | Temporarily routed `useStoryChangesArrival` to CI and removed the old Changes focus call. Ran `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/review/story-review-action-mount.spec.ts`. Restored the source. | All four offered-action cases failed at the directed-view assertion, and the no-action case passed. The unchanged baseline passed all five. The final assertions must observe diff or feedback and focus, since the old selected-tab assertion is retired. |

## Slices

### 1. Isolate story reading journeys from the page-wide tabs

Type: Structure
Status: done
Proof: Existing mounted story and review journeys keep their current UI
observations. Run the affected Intent files and review helpers' consumers.

Concentrate the existing intent and review navigation in the mounted Intent
page objects and the shared Dashboard review page object. Separate journeys
that only make the sidebar available from assertions that genuinely require
the selected Changes tab. Keep assertions of actual paths, diffs, evidence,
focus, and error states at their current boundaries. Use the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace):
search for `Selected story views`, `chooseTab("Changes")`,
`openIntentReviewChanges`, and helpers that expose the old panel or use its
tab for focus. Inspect [storyCardFocus](../../../dashboard/src/storyCardFocus.ts)
and banner and Side panel callers before changing those marks in slice 3.
This enables slice 2 to change the reading arrangement without rewriting
the same setup across specs.

All 400 mounted and retained frontend cases passed. Of the
152 end-to-end cases, 151 passed on the first run. The retained-run race
case passed after its setup dropped an unused legacy launch, and the legacy
case passed with its original setup. The ad hoc review and TypeScript check
passed. The landed comparison-follow-up changes were integrated at
`ddeb643502a6`. Focused story follow-up, ancestor CI evidence, narrow views,
story notes, and Board arrival checks then passed on the combined candidate.

### 2. Open a path directly from story evidence

Type: Behavior
Status: done
Proof: Mounted path and no-locations journeys plus the unchanged-test filter
example in the proof map. Check existing narrow sidebar and CI recovery
consumers that read the shared layout.

With a story's CI or coverage visible, the developer can browse the same
file sidebar and select a path to read its details. Keep the one browser
mounted and reuse its selection and reading pane. Show the existing
files toggle whenever a story tree is available. Preserve tree state and
the Project Intent layout. Keep evidence-only stories readable while
locations are unavailable. For this increment, the current Changes tab
still leads to path reading and a sidebar open can select it internally.
Slice 3 replaces that interim routing and removes the page-wide row. Keep
the mounted evidence clients and qualification behavior during the move.

406 frontend cases and 11 representative end-to-end cases passed, along
with Dashboard typecheck. The mounted cases chose paths while CI and
coverage were visible, read a diff from the comparison-only tree, and
observed the same failed result and measured build after filtering away
its unchanged file. The end-to-end cases covered the shared pane, directed
arrival, historical source and its unavailable state, and CI proof links.
After consolidating the tabpanel attributes, 27 frontend and three
end-to-end cases reconfirmed labels, visibility, focus, and candidate
navigation. Dashboard typecheck passed again.

CI run `45626623251` exposed two missed consumers of the historical
source explanation. Both published one-shot journeys now verify the
visible explanation in Intent while retaining their captured range,
inventory, and diff checks. The failing observation was reproduced,
and both cases passed with the corrected assertion.

### 3. Return to Story Home and keep Review changes direct

Type: Behavior
Status: planned
Proof: Run the Home, captured-run, coverage and Board arrival cases mapped
above, including cold sync, gaps, and keyboard focus. Re-run affected
project-scope, reading-place and CI drill-down consumers.

Use the selected path to choose between Story Home and path detail. Show
**CI comparison** and **Intent coverage** as Home's tabs. A fresh story
selection starts on CI. Activate the sidebar **Home** button or the file
Proof CI return to clear the path, select CI, and give the keyboard a
visible destination. Keep the toolbar and the evidence providers in place.
Update banner and Side panel focus fallbacks to work whether Home or a
path is visible.

Preserve Review changes as a directed open over this same reading
selection, including pending sync, the settled first or remembered file,
and unavailable feedback. Keep a late request from opening a file after
the developer goes Home or changes story. Remove the temporary routing
from slice 2 and the obsolete Changes tab and focus selectors in the same
slice. Update only the page object interactions and assertions whose
navigation contract changed.

## Verification and plan review

- Run the changed mounted Intent and review specs with
  `npm run test:dashboard:frontend -- <specs>` and the affected Board-to-Intent
  journeys with `npm run test:e2e -- <specs>`. Use the consumer trace to
  account for the test helpers and aggregate view assertions, including
  legacy Playwright consumers that use the shared review page object.
  Run focused type and lint checks for the changed Dashboard contracts.
  For long local runs on macOS use
  `caffeinate -s -i` on AC power.
  On battery use `caffeinate -i` with the lid open and check the sleep
  log afterwards.
- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md),
  the repository's MakeMe and page-object selections for test changes,
  and [post-change refactoring](../../../.agents/skills/dough-post-change-refactor/SKILL.md)
  before each slice commit. `IntentPage.tsx` and `IntentBrowser.tsx` are
  already 247 and 246 lines at the baseline. Slice 2 keeps the evidence
  panel and path reader responsibilities cohesive while making room in
  those modules. Keep Project Intent and the story review entry points
  covered during that move.
- No separate refinement pass was needed after construction. The first
  slice contains the consumer setup change, the second owns the shared
  reading arrangement, and the third replaces the interim routing with
  the empty-path rule. Each supplies its own focused proof within the
  existing slice budget. This review found no remaining slice-specific
  concern.

## Story obligations

### G1. Page-wide tabs during direct file browsing

Reported: slice 2 — "For this increment, the current Changes tab still leads to path reading and a sidebar open can select it internally."
Story clause: "The story-level tab row gives way to Home and direct path reading."
Disposition: interim until slices 3

## Execution context

- Story Branch Mode on `codex/read-ci-comparison-and-intent-coverage-from-stor`, with
  `origin/main` as the integration target. The launch owns the isolated
  worktree for this branch under the repository's `.worktrees/` directory.
- Starting revision `3b465056d9add188eb2603b0e1c2802998205bba`.
  The claim was accepted as `e7c2d87fce1d73a62490cd8a25ed22c3f2f73f64`
  on `origin/main` and the story branch. Koharu-chan owns the execution
  under publisher `dashboard-territory.local-open-dough`.
- Slice 1 was accepted on the story branch at `c5397d4790a70a32df073e6e3a0f3502399ff045`.
- The Codex observer for the remote story branch tracks GitHub Actions
  `ci.yml` under coordinator `koharu-420-ed214235` at
  `/tmp/dough-ci-501/watch-fvhWBV`, stream session `30471`, cell `g375:14`.
