# Source review: Pilot fluent page objects in dashboard Side panel tests

Launch: a fresh general-purpose sub-agent with no conversation inheritance,
started by the execution coordinator before the first implementation
delegation (2026-11-08). Input: only the story's Goal, Scope, Approach
considered, Architecture, Key examples and Evaluation text from
[the seed section](../../seeds/SEED-263-fluent-dashboard-page-objects.md#pilot-fluent-dashboard-page-objects),
with links reduced to their names, and instructions to read no project files,
change nothing, and return numbered commitments, examples and exclusions
without slicing or acceptance. No plan, return, product or proof was supplied.

Returned exclusions: X1 changes to product behavior, X2 migration of other
journeys, X3 a wider convention, X4 wider adoption, X5 anything beyond these
three journeys and the shared UI responsibilities they exercise. The reviewer
noted that 8's alternatives are context for the choice, not rejection rules.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: a developer reviewing a dashboard browser test can read setup, user actions and expected outcomes in order at the call site | slice 3 | |
| 2 | Goal: a developer changing a shared Side panel control can find the page object that owns it | slice 3 | |
| 3 | Goal: use the three existing journeys to decide whether clearer tests justify the cost of the abstraction and its failure diagnostics | slice 3 | |
| 4 | Convert all three integrated journeys in the two Side panel content specs (Content replacement spec, Content switching spec) to a fluent TypeScript API | slice 3 | |
| 5 | Reuse the same page objects across both specs for their shared interactions | slice 3 | |
| 6 | The pilot ends at these journeys and the shared UI responsibilities they exercise | slice 3 | |
| 7a | Preserve all existing assertions | slice 3 | |
| 7b | Preserve the existing Git integration boundary | slice 3 | |
| 7c | Preserve the existing browser integration boundary | slice 3 | |
| 7d | Preserve the existing synthetic native integration boundary | slice 3 | |
| 8 | Approach: use the cue-sheet discipline with fluent page objects (chosen over plain `await` + locator helpers + `test.step`, and over explicit lists of named callbacks) | slice 1 | observed: dashboard/tests/support/cueSheet.ts phase/CueSheet with dashboard/tests/sidePanelPages.ts fluent page objects; dashboard/tests/navigation/side-panel-content-replacement.spec.ts first test written as eight phases |
| 9 | Typed operations name the dashboard action or observation and share its mechanics | slice 1 | observed: dashboard/tests/sidePanelPages.ts StoryCard.reviewChanges/readFinalReport, StoryReview.expect*, PanelDivider.drag/press/expectSidePanelWidth name each action or observation and own its mechanics |
| 10 | Each awaited phase keeps the order visible | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts first test: eight journey.phase calls awaited in source order |
| 11 | The cue-sheet analogy models only the test's own actions; browser requests and native processes advance independently and still need observable evidence | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts first test: holdReviewOf hold, await heldA.reached, releaseAndDrain, reviewReads counts and keptSession doneAt sit between phases, not in cues |
| 12a | Use the Board vocabulary | slice 1 | observed: dashboard/tests/sidePanelPages.ts Board class; StoryCard scoped by parts(page).board |
| 12b | Use the Story card vocabulary | slice 1 | observed: dashboard/tests/sidePanelPages.ts StoryCard class, cue names 'Story card "<title>": …' |
| 12c | Use the Sessions sidebar vocabulary | slice 3 | |
| 12d | Use the Side panel vocabulary | slice 1 | observed: dashboard/tests/sidePanelPages.ts and sidePanelContentPages.ts SidePanel class (expectItems, expectNotShowing, storyReview, finalReport) |
| 12e | Use the Panel divider vocabulary | slice 1 | observed: dashboard/tests/sidePanelPages.ts PanelDivider class (drag, press, expectSidePanelWidth) |
| 13a | Page objects own scoped locators | slice 1 | observed: dashboard/tests/sidePanelPages.ts and sidePanelContentPages.ts private #card, #reviewChanges, #review, #files, #report locators |
| 13b | Page objects own UI mechanics | slice 1 | observed: dashboard/tests/sidePanelPages.ts reviewChangesByKeyboard focus+Enter, PanelDivider.drag via dragDivider, press focus+keyboard |
| 13c | Page objects own observable browser waits | slice 1 | observed: dashboard/tests/sidePanelPages.ts and sidePanelContentPages.ts expect* cues wait on expect(locator) web-first assertions (toHaveText, toHaveCount, toBeFocused, expectWidth/expectDividerSays) |
| 14a | Each fluent method records a named async operation synchronously | slice 1 | observed: dashboard/tests/support/cueSheet.ts CueSheet.cue pushes {name, run} without running; PageObject.cue in sidePanelPages.ts |
| 14b | Each fluent method returns the current or destination page object | slice 1 | observed: dashboard/tests/sidePanelPages.ts and sidePanelContentPages.ts PageObject.cue returns next: reviewChanges→StoryReview, readFinalReport→FinalReport, close→SidePanel, expect*→this |
| 15a | A single returned or awaited Promise per phase runs the recorded operations in order | slice 1 | observed: dashboard/tests/support/cueSheet.ts phase(): write synchronously (refuses a Promise), then one awaited cues.play() runs cues in written order |
| 15b | Operations run through Playwright `test.step` | slice 1 | observed: dashboard/tests/support/cueSheet.ts play(): each cue is test.step(name, run, {location}) inside the phase's test.step |
| 15c | The phase stops on failure | slice 1 | observed: Slice 1 diagnostic: expectItems(2) mismatch failed at '› a final report replaces the review › Side panel: shows 2 items'; next cue 'Side panel: shows no Story review' and the Panel divider phase did not run (trace test.trace) |
| 16a | Reuse existing UI helpers | slice 1 | observed: dashboard/tests/sidePanelPages.ts and sidePanelContentPages.ts imports parts/storyCardSessions, control/dragDivider/expectWidth/expectDividerSays/panelDivider, reviewBody/reviewFeedback, reviewRegion, sidePanelContents |
| 16b | Consolidate any duplicated locator for the same shared control | slice 3 | |
| 17 | Keep meaningful inputs and expected values visible | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts first test: titles, list and file names, storyBReport, identities, drag(-100) and width+100-keyStep stay in the spec |
| 18 | Arrange valid domain facts through shared MakeMe | slice 3 | |
| 19a | The test harness owns Git | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts first test: storyWorktree/storyBWorktree real Git worktrees in the harness, unchanged |
| 19b | The test harness owns transport holds | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts first test + dashboard/tests/support/holdReviewResponse.ts holdReviewOf: hold opened before phase 1, released and drained in finally |
| 19c | The test harness owns native protocol evidence | slice 1 | observed: dashboard/tests/support/sidePanelContents.ts retiredCodexSession keeps Codex native final report; keptSession doneAt checked between phases |
| 19d | The test harness owns cleanup | slice 1 | observed: holdReviewOf releaseAndDrain in finally unroutes its own handler; held-phase forced failure tore down without hanging (diag-held.log) |
| E1a | Example (held review): a held review for Story A shows its loading state | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts phase 'Story B's review replaces Story A's, still reading': storyReview.expectStory('Story A').expectFeedback('Reading the story's changes…') while A's read is held |
| E1b | Story B's review opens and shows its changed file before A's answer is released | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts same phase: storyCard('Story B').reviewChanges().expectStory('Story B').expectChangedFile('1 changed file','Added story-b.txt') before finally releases A |
| E1c | After the harness releases and drains A's answer, B's review remains the sole Side panel content | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts phase 'a held review of Story A never answers…': after releaseAndDrain, Story B, identity, 1 changed file, no 7 changed files, no unstaged.txt, expectItems(1) |
| E1d | Keep the hold and release explicit between fluent phases | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts: const heldA = await holdReviewOf(...); await heldA.reached; finally heldA.releaseAndDrain() between phases |
| E2a | Example (replacement): a review and a final report replace one another | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts phases 'a final report replaces the review' (report text, 1 item, no Story review) and 'a review replaces the final report' (1 changed file, no Final report, 1 item) |
| E2b | Reopening after a switch reads a fresh snapshot | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts: expect(reviewReads.length).toBe(readsBeforeReopening + 1) after 'a review replaces the final report' |
| E2c | Asking for the review already shown moves focus to it and keeps its snapshot | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts phase 'Review changes for the review shown takes the keyboard…': expectKeyboardInBody, file still chosen, diff visible, 1 item; reviewReads.length unchanged |
| E2d | Keep the mouse and keyboard divider actions and their expected changes visible | slice 1 | observed: dashboard/tests/navigation/side-panel-content-replacement.spec.ts phase 'the Panel divider resizes…': drag(-100).expectSidePanelWidth(width + 100).press('ArrowRight').expectSidePanelWidth(width + 100 - keyStep), width and ARIA via expectWidth/expectDividerSays |
| E2e | With a file selected in a review, switching to Intent and back keeps the review and its selection | slice 2 | |
| E2f | Intent reads its own comparison | slice 2 | |
| E2g | The final report similarly retains its content and session | slice 2 | |
| E3a | Example (Terminal): opening a review replaces the Terminal and detaches it while the native session stays open | slice 3 | |
| E3b | Reopening the same session from the Sessions sidebar reattaches it in the normal split | slice 3 | |
| E3c | Preserve the proof for selection | slice 3 | |
| E3d | Preserve the proof for maximization | slice 3 | |
| E3e | Preserve the proof for session identity | slice 3 | |
| E3f | Preserve the proof for continued access to the Board | slice 3 | |
| V1 | Compare the converted specs with their current versions | slice 3 | |
| V2a | Check the three journeys | slice 3 | |
| V2b | Check affected consumers | slice 3 | |
| V2c | Check dashboard type-check | slice 3 | |
| V3a | Inspect a controlled assertion failure for its named step in the retained Playwright trace | slice 1 | observed: Slice 1 diagnostic trace dashboard/test-results/…/trace.zip test.trace: step 'Side panel: shows 2 items' located at the spec's .expectItems(2) line, inside phase step 'a final report replaces the review', with Expected 2 / Received 1 |
| V3b | Inspect the same failure for its underlying assertion in the failure output | slice 1 | observed: Slice 1 diagnostic failure output: 'Error: expect(locator).toHaveCount(expected) failed, Expected: 2, Received: 1' under the title path '› a final report replaces the review › Side panel: shows 2 items'; restored run passed (run2.log) |
| V4 | Compare the three existing Story card `Review changes` locator sites with the pilot's shared owner by trying a reversible rename | slice 3 | |
| V5a | Record whether developers can follow the setup, actions and expectations | slice 3 | |
| V5b | Record whether developers can find the failing step | slice 3 | |
| V5c | Record whether developers can make the rename from one site in the pilot | slice 3 | |
| V5d | Record the maintenance cost of the helpers | slice 3 | |
| V6 | Use those observations to recommend keeping, adjusting, or extending the pattern | slice 3 | |
| V7a | Follow the test automation rules | slice 3 | |
| V7b | Follow the failing and flaky test policy | slice 3 | |
| V7c | Follow the macOS sleep guard | slice 3 | |
