# Slice 8 helper observations and setup

The four assertion maps were written before original deletion. Every direct observing statement, including duplicate occurrences, maps independently. The same named cases preserve these additional helper observations and their causal order:

| Source/calls | Preserved observation and maintained owner |
| --- | --- |
| read-reuse: open(featurePath), open(otherPath), repeated twice | Each original `open` calls `sourceFile.click` then `expect(fileSource).toContainText(text)`, retaining caller values Archive/Report; reopening follows initial reads and observer installation. |
| read-reuse: boundaryReads/pathReads/intentReads | Same browser request listener, authenticated endpoint and path/intent predicates. `featureReads() === 1` twice, `locationsReads() === 1`, candidates record/locations both1. No upstream count claim. |
| read-reuse: readingMoments | Same MutationObserver observes body childList/subtree/characterData and every `.quiet` Reading text after initial reading. Independent `moments() === []` follows both reopen and return. |
| read-reuse: expandIntentGroup | Native `intentPerspectivePage.expandIntentGroup` asserts `aria-expanded === true`; unchanged actual tree click. |
| read-reuse: chooseOptimizationCandidates/expectIntentModeChosen | Native mode owner asserts selected true and file column hidden; same entry visible before and after Development. |
| read-reuse-story: contentReads | Same authenticated path prefixes plus independent diff/text endpoint arrays, installed after comparison. Summary browsing retains `{text:[], diffs:[], texts:[]}`. |
| read-reuse-story: intentDiff called twice | Native `intentStoryPage.intentDiff`: select file, exact caller name, visible code, `aria-busy === false`, then innerText. Independent first contains `more`; second equals first. Exact arrays remain `text:[]`, `diffs:[modifiedPath]`, `texts:[modifiedPath]` in that order. |
| reading-place: readDeepSpec called once per case | Same checkbox check, collapse out, select deepSpec; exact name and busy false assertions; native `scrollIntentReadingHalfway` requires offset greater than20. |
| reading-place: chooseStoryTab/expectStoryTab | Native mode owner asserts chosen `aria-selected === true`. Both CI comparison/Intent coverage hide reading pane; Changed tests returns exact measured offset. |
| reading-place: selectTakenStoryInIntent | Whole-app `frontendIntentVisits`: explicit Story A publication/comparison, original 120-line long diff at original deepSpec, empty CI answer and explicit unconfigured Doughnut. Native openStoryIntent asserts selected card and initial CI comparison; frontendIntentVisits asserts Intent visible, Changed tests selected and comparison loading absent. Native real Take/Git setup remains in E2E; this fixture arranges the selected-story precondition. |
| reading-place: intentReads | Same installed-after-reading browser listener. Return expects `[]`; includes locations, published text and both story endpoints, preserving all negatives. |
| reading-place: project reset | Same actual project chooser, no selected button/source in Doughnut; returning Open Dough opens CI comparison, no Purpose, toggle off, out expanded, deepSpec unpressed, scroll0. |
| selection-reads: holdAuthenticatedReadsOf(featurePath) | Same actual transport hold before selecting jobs after disk; held count1 and Reading jobs before release, no disk text. MutationObserver records every jobs-labelled node and rejects Disk/Report in all frames, nonempty recorded set. |
| selection-reads: holdAuthenticatedReadsOf(seed303) | Same startup detail request held before page.goto; group and feature selected while hold active, exact locations1 before release; release then untilPageReadsAnswered then exact expanded/pressed/Archive and locations1. No settling startup before selection. |
| selection-reads: countLocationsReads | Same native browser endpoint observer; original absolute count1 before and after released startup preserved. |
| all openUntilRead/untilPageReadsAnswered | Native request-noting owner awaits published work while leaving card detail reads alone. Held startup case deliberately uses page.goto directly until the detail release. |

## Substitute and real boundaries

`frontendIntentReuseAnswers` composes existing MakeMe locations, original project/files/candidate data, immutable source+revision snapshots, stream-slot prehold and canonical CI answers. No new response family or acquisition model. Story A uses existing `frontendIntentVisits`; published source revision storage is `frontendIntentRevisionAnswers`, not mutable files pretending to be history.

Frontend observations cover actual browser state, transport requests and holds against controlled answers. Real server/GitHub source judgment and SSE selection remain the earlier slices' Backend/E2E homes. Backend `intent-shared-reads` runs client sharedRead/global-fetch substitute and is supplementary client proof, never upstream evidence. Current real E2E code-browse and story-changes runs re-observe source acquisition and native overlay/diff judgment.

[Failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) applies as written.
