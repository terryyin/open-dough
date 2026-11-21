# Source review

Launch: a fresh general-purpose reviewer, spawned 2026-11-21 by the execution
coordinator with no conversation inheritance, fork or resume. Input: only the
Goal, Scope (with its scope limits) and Key examples of
[SEED-413#mount-story-review-changes-panel](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-story-review-changes-panel)
as of `17fe6c2c4`, copied verbatim to a file; no plan, product code or proof.
It was told to read no other file, change nothing, and number independently
observable promises. Its return follows, with the Slice and Observation columns
added by the coordinator.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | "Dashboard developers read the proof of what the Review changes panel names, reveals, lists and keeps as plain Vitest cases on mounted Chromium" — "Move the specs whose behavior the panel owns: `story-review-toolbar-truthful`, `-toolbar-truthful-gaps`, `-details`, `-details-published`, `-details-runs`, `-uncommitted-check`, `-files-divider`, `-files-divider-kept`, `-touch-height`, `-notes` and `-note-context`." | slice 7 |  |
| 2 | "with each review read answered as a typed reply" — "Give it a typed review source behind that hook: one read per endpoint with its query and abort signal, answering the shared `storyReviewContract.ts` shapes or rejecting with the refusal's words." (owner `StoryReview`, reads through `useReviewRead`, four review endpoints) | slice 1 | observed: dashboard/src/reviewSource.ts ReviewSource (review, range, fileDiff, fileText: query + signal → storyReviewContract shapes); story-review-page-source.spec.ts "a refused read rejects with $words" and "leaving a read aborts its request" |
| 3 | "The page supplies the source that speaks to the endpoints." | slice 1 | observed: reviewSource.ts pageReviewSource is ReviewSourceOnPage default; built-app story-review-*, mounted review/intent specs, e2e review/ and Intent story-comparison journeys pass unchanged (slice 1 evidence after-*.json) |
| 4 | "A mounted case supplies the frame's typed state it reads: the projects list, the Sessions sidebar state behind the header's Sessions button, the page's launches behind Follow up, and story notes through `storyNotesState(source)`. These are existing production contexts given typed values, not new wrappers." | slice 6 |  |
| 5 | "Build review answers with page-loadable MakeMe steps (a snapshot, a published review, landed runs, session commits, a range and a file diff) from Node-free builders on `pageMakeMe.mjs`. They replace the `frontendStoryReviewFixtures.ts` shapes for the moved cases." | slice 7 |  |
| 6 | "Operate the panel through small page objects beside the specs. The Playwright `reviewChangesPage.ts` and `reviewControls.ts` stay for the remaining built-app cases and E2E." | slice 7 |  |
| 7 | "Name each retired built-app case and the mounted case that carries its assertions. Remove a case only where an E2E journey proves the same thing, and name that journey." (with "Preserve each distinct assertion") | slice 7 |  |
| 8 | "Retire each `dashboard/test-support/` export or module whose last consumer moves, and keep what the remaining review specs and E2E use." | slice 7 |  |
| 9 | "This story compares the focused selection before and after." | slice 7 |  |
| 10 | Preserve "the toolbar's name before and after a published answer" — *A pending published answer:* "A Done story's review opens before its published answer arrives. The toolbar holds progress with no comparison name and no eye. Once the answer arrives it names the comparison and offers the eye." | slice 2 | observed: dashboard/frontend-tests/review/story-review-toolbar-truthful.spec.ts "a Done card holds progress with no name or eye until a published answer arrives" (expectPending, then expectComparisonNamed + expectEyeBesideComparison); ad hoc landing case names Landed runs |
| 11 | Preserve "a refused first read and its retry" — *A refused first read:* "The first read is refused with `refused for proof`. The panel keeps the problem and Refresh. Refresh reads again, the answer arrives and the problem is gone." | slice 2 | observed: dashboard/frontend-tests/review/story-review-toolbar-truthful.spec.ts "a refused first read keeps the problem and Refresh; retry reveals the answer" (expectRefused + refused for proof, refresh, named answer, expectNoProblem) |
| 12 | *Refresh keeps what is shown:* "While a readable comparison is read again the panel keeps its name, eye and diff and shows progress." | slice 2 | observed: dashboard/frontend-tests/review/story-review-toolbar-truthful.spec.ts "Refresh of a readable comparison keeps its name, eye and diff while progress shows" (Refreshing the review…, name, eye collapsed, diff while held) |
| 13a | *Details behind the eye:* "A workspace review opens on the diff with its details hidden. The eye reveals and hides them without moving the reading place." | slice 4 | observed: dashboard/frontend-tests/review/story-review-details.spec.ts "a workspace review opens on the diff and keeps its place while the eye reveals and hides its details" |
| 13b | "Choosing Commits in the details renames the toolbar" | slice 4 | observed: dashboard/frontend-tests/review/story-review-details.spec.ts "choosing Commits in the details renames the toolbar, and the range and commit list stay when the details hide" (toolbar named Commits) |
| 13c | "the range and commit list stay when the details hide." | slice 4 | observed: dashboard/frontend-tests/review/story-review-details.spec.ts "choosing Commits in the details renames the toolbar, and the range and commit list stay when the details hide" (expectCommitsAndRangeShown after escapeFromComparison hides the details) |
| 13d | "Another story's review opens collapsed with the files shown." | slice 4 | observed: dashboard/frontend-tests/review/story-review-details.spec.ts "another story's review opens collapsed with the files shown, whatever the last one left" (remount by production storyReviewPanelKey; key break failed it) |
| 14a | *Landed runs:* "A Done story with two captured runs opens on the newer one." | slice 3 | observed: dashboard/frontend-tests/review/story-review-details-runs.spec.ts "a Done story opens on the newer of two captured runs and Escape from the picker returns to the eye" (opens on the newer run's diff; scratch break to the older run failed it) |
| 14b | Preserve "focus return to the eye" — "Escape from the run picker returns focus to the eye." | slice 3 | observed: dashboard/frontend-tests/review/story-review-details-runs.spec.ts "a Done story opens on the newer of two captured runs and Escape from the picker returns to the eye" (Escape from the run picker focuses the eye) |
| 14c | "A selected landed gap offers Landed runs and the eye" | slice 3 | observed: dashboard/frontend-tests/review/story-review-toolbar-truthful-gaps.spec.ts "a selected landed gap offers Landed runs and the eye" |
| 14d | "a bare landing gap names Landed runs without an eye." | slice 3 | observed: dashboard/frontend-tests/review/story-review-toolbar-truthful-gaps.spec.ts "a bare landing gap names Landed runs without an eye" |
| 15 | *Uncommitted changes:* "The check leaves uncommitted changes out of All changes and back without reading the snapshot again." | slice 4 | observed: dashboard/frontend-tests/review/story-review-uncommitted-check.spec.ts "the check leaves uncommitted changes out of all changes and back without reading the snapshot again" (snapshotReads unchanged; re-read break failed it) |
| 16a | *The file sidebar width:* "Dragging the Files divider resizes the file sidebar within both minimums." | slice 5 | observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "the Files divider resizes the file sidebar against the diff within both minimums" |
| 16b | Preserve "the kept file sidebar width across reviews" — "The chosen width serves another story's review." | slice 5 | observed: dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts "the chosen file sidebar width serves another story's review" (kept in real localStorage; remount by storyReviewPanelKey reads it; ignore-kept break failed it) |
| 16c | "An unusable kept width gives 16rem" | slice 5 | observed: dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts "an unusable kept file sidebar width gives 16rem" |
| 16d | Preserve the kept width "where storage is refused" — "where storage is refused the sidebar is 16rem and resizes without error." | slice 5 | observed: dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts "where the browser refuses storage, the sidebar is 16rem and resizes without error" |
| 17 | Preserve "the shared height budget on a phone." (`-touch-height`) | slice 5 | observed: dashboard/frontend-tests/review/story-review-touch-height.spec.ts "revealed details and status share one height budget above a usable code pane" (780x390, touch) |
| 18a | *Notes from a review:* "The Notes icon sits with Refresh." | slice 6 |  |
| 18b | "A file's note from a Taken workspace keeps the comparison's words and endpoints" | slice 6 |  |
| 18c | "its line menu offers Add note alone." | slice 6 |  |
| 18d | "A landed run's note keeps the renamed path and exact endpoints." | slice 6 |  |
| 18e | "Closing Notes keeps the diff and returns focus." | slice 6 |  |

## Unnumbered context
- Baseline: "Today 23 built-app cases in eleven `story-review-*` specs load `<App />`, publish a story, open its review from the board and answer the review endpoints through page routes (45.9 summed seconds in CI run 44855532096). After the diff reading moved, Review is still the second-costliest folder per case."
- `StoryReview` "already takes a typed `request`"; `useReviewRead` currently "calls `fetch` on the four review endpoints".
- "The kept-answer memo, rounds and the last answer kept while reading stay where they are." (placement constraint, not a new result)
- "The panel sits inside the page frame." (reason for supplying frame state)
- Scope limits: `story-review-action`, `-files-divider-room` and the three `story-review-diff-syntax-*` specs "stay built-app cases in the parent story, because their behavior belongs to an owner above the panel"; "The full-group timing comparison and the `frontendApp.ts` retirement also stay there."
