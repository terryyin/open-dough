# Source-only review

Fresh reviewer: `/root/source_review`, launched through `collaboration.spawn_agent`
with `fork_turns: none` on 2026-11-09. Input: only the selected story's
Goal, Scope, required restrictions, scope limits, key examples and UI, supplied
in the launch; no plan, product, proof or current-slice scope. The reviewer
was instructed to read no files and change nothing. The returned numbered
commitments are retained below, with compound letters as individual ids.
Repeated wording was consolidated. J06 was corrected in a source-only follow-up
using the exact original alternative, preserving Branch or Taken Trunk Mode's
Provisional rather than conflating their labels. Examples remain illustrative,
not additional rejection rules. X rows retain source exclusions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | One Intent page implementation serves Project Intent and selected-story views. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C02a | Both use one layout. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C02b | Both represent one Intent perspective. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C02c | Selected-story context is optional. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C03a | Developers retain their place between project and story evidence. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C03b | CI comparisons remain understandable while drilling into test evidence. | slice 2 | |
| C03c | Evidence does not require relearning the page. | slice 2 | |
| C03d | Project trunk evidence is distinguishable from a selected story’s comparison. | slice 1 | observed: IntentPerspective distinct evidence providers; project-visit published text a 11 excludes worktree more and story diff, main CI plus explicit project context; final affected run passed |
| C04a | The delivered story view supplies the persistent-header reference. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C04b | It supplies the tab-row reference. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C04c | It supplies the content-arrangement reference. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C05a | The header remains stable. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C05b | Views remain stable. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C05c | The revision notice remains stable. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C05d | Reading order remains stable. | slice 1 | observed: IntentPage and IntentHeader single shared arrangement; homepage first step common-frame/header/context assertions and story-changes persistent-header step; full run and final affected run passed |
| C06a | Empty selection provides “No story selected”. | slice 1 | observed: intent-ci-status-homepage first step: No story selected, project CI status and Optimization Candidates, selected CI status and main Passed state; final affected run passed |
| C06b | Empty selection provides project CI status. | slice 1 | observed: intent-ci-status-homepage first step: No story selected, project CI status and Optimization Candidates, selected CI status and main Passed state; final affected run passed |
| C06c | Empty selection provides Optimization Candidates. | slice 1 | observed: intent-ci-status-homepage first step: No story selected, project CI status and Optimization Candidates, selected CI status and main Passed state; final affected run passed |
| C07a | Selected-story context provides title. | slice 1 | observed: intent-story-changes persistent-header step: full title/identity, Project Intent action and three applicable tabs; summary-title/review-return header action and geometry; full run passed |
| C07b | Selected-story context provides actions. | slice 1 | observed: intent-story-changes persistent-header step: full title/identity, Project Intent action and three applicable tabs; summary-title/review-return header action and geometry; full run passed |
| C07c | Selected-story context provides applicable CI comparison. | slice 1 | observed: intent-story-changes persistent-header step: full title/identity, Project Intent action and three applicable tabs; summary-title/review-return header action and geometry; full run passed |
| C07d | Selected-story context provides Changed tests. | slice 1 | observed: intent-story-changes persistent-header step: full title/identity, Project Intent action and three applicable tabs; summary-title/review-return header action and geometry; full run passed |
| C07e | Selected-story context provides Intent coverage. | slice 1 | observed: intent-story-changes persistent-header step: full title/identity, Project Intent action and three applicable tabs; summary-title/review-return header action and geometry; full run passed |
| C08a | Project Intent stays reachable with a story selected. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C08b | Active context is explicit. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C08c | Active evidence is explicit. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C08d | The selected story remains selected during the project visit. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C09a | Back to selected story restores the story view. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C09b | Back to selected story restores its reading place. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C10a | A project visit preserves each context’s file. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C10b | A project visit preserves each context’s Purpose/Proof choice. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C10c | A project visit preserves each context’s expansion. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C10d | A project visit preserves each context’s scroll. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| C10e | A project visit preserves each context’s Hide files state. |  | G2 |
| C11a | Clearing selection returns to project CI status. | slice 1 | observed: intent-project-visit each-new-selection journey: clear/reselect resets story CI comparison, clear after project candidates gives No story selected/project CI status; final affected run passed |
| C11b | A new selection starts at story CI comparison. | slice 1 | observed: intent-project-visit each-new-selection journey: clear/reselect resets story CI comparison, clear after project candidates gives No story selected/project CI status; final affected run passed |
| C12a | The story-level CI model is shared with location Summary. | slice 2 | |
| C12b | The story-level CI model is shared with folder Summary. | slice 2 | |
| C12c | The story-level CI model is shared with individual-file Proof. | slice 2 | |
| C13a | Story-level CI presentation is shared with location Summary. | slice 2 | |
| C13b | Story-level CI presentation is shared with folder Summary. | slice 2 | |
| C13c | Story-level CI presentation is shared with individual-file Proof. | slice 2 | |
| C14a | Shared comparison presentation includes active comparison label. | slice 2 | |
| C14b | Shared comparison presentation includes Baseline timing column. | slice 2 | |
| C14c | Shared comparison presentation includes Branch timing column. | slice 2 | |
| C14d | Shared comparison presentation includes Landed timing column. | slice 2 | |
| C14e | Shared comparison presentation includes signed changes from Baseline. | slice 2 | |
| C14f | Shared comparison presentation includes relative marks. | slice 2 | |
| C14g | Shared comparison presentation includes Show % wherever supported. | slice 2 | |
| C15a | Preserve observed-build framing. | slice 2 | |
| C15b | Preserve unused-endpoint explanations. | slice 2 | |
| C15c | Preserve partial-timing explanations. | slice 2 | |
| C15d | Preserve unavailable-proof explanations. | slice 2 | |
| C16a | Preserve precise times, including subsecond changes, for files. | slice 2 | |
| C16b | Preserve precise times, including subsecond changes, for folders. | slice 2 | |
| C17a | Retain whole seconds for overall comparisons. | slice 2 | |
| C17b | Retain whole seconds for entry comparisons. | slice 2 | |
| C18a | Each displayed comparison uses one symmetric scale for its own figures/rows. | slice 2 | |
| C18b | Each displayed comparison uses a minimum 50% scale. | slice 2 | |
| C18c | Each displayed comparison widens to its largest displayed relative change. | slice 2 | |
| C19a | Faster appears left. | slice 2 | |
| C19b | Slower appears right. | slice 2 | |
| C20a | Show % is one story reading preference. | slice 2 | |
| C20b | Show % is initially off. | slice 2 | |
| C20c | Show % is shared across scopes. | slice 2 | |
| C21a | Show % changes labels. | slice 2 | |
| C21b | Show % preserves values. | slice 2 | |
| C21c | Show % preserves marks. | slice 2 | |
| C21d | Show % preserves order. | slice 2 | |
| C22a | Sort Baseline by measured time. | slice 2 | |
| C22b | Sort Branch by signed change. | slice 2 | |
| C22c | Sort Landed by signed change. | slice 2 | |
| C23a | Sorting keeps noncomparable changes after comparable changes in either direction. | slice 2 | |
| C23b | Sorting keeps supplied order for ties. | slice 2 | |
| C23c | Sorting keeps the outside row last. | slice 2 | |
| C24a | Preserve Counts meaning. | slice 2 | |
| C24b | Preserve Change meaning. | slice 2 | |
| C24c | Preserve sorting while drilling. | slice 2 | |
| C25a | Preserve keyboard navigation. | slice 1 | observed: story-views-narrow Tab/Enter/Space/Home/End and focused tabs; home-activation direct home versus arrow retaining file; project-visit reciprocal focus; sidebar-toggle retained reader; full/final affected run passed |
| C25b | Preserve focus return. | slice 1 | observed: story-views-narrow Tab/Enter/Space/Home/End and focused tabs; home-activation direct home versus arrow retaining file; project-visit reciprocal focus; sidebar-toggle retained reader; full/final affected run passed |
| C25c | Preserve narrow reading. | slice 1 | observed: intent-story-views-narrow selected and no-story tests: 390x560/720x460 control geometry, no sideways overflow, keyboard and reader height; ci-proof/summary-ci-proof short-width geometry; full/final affected run passed |
| C25d | Preserve zoomed reading. | slice 1 | observed: intent-story-views-narrow selected and no-story tests: 390x560/720x460 control geometry, no sideways overflow, keyboard and reader height; ci-proof/summary-ci-proof short-width geometry; full/final affected run passed |
| C25e | Preserve independent tree/reader scrolling. | slice 1 | observed: intent-gherkin-layout independent scroll positions [200,0] then [200,300] and viewport fit; sidebar-toggle tree offset and restored Proof; full run passed |
| C26a | CI remains usable while locations load. |  | G1 |
| C26b | CI remains usable while locations fail. | slice 1 | observed: homepage held-location load/failure/Retry CI and read counts, story ci-comparison-locations held/failure/Retry and unchanged comparison reads, project status Check again; full/final affected run passed |
| C27 | Align maintained Intent documentation. | slice 2 | |
| C28a | Preserve shared comparison words. | slice 2 | |
| C28b | Preserve shared comparison marks. | slice 2 | |
| C28c | Preserve unchanged tree cues. | slice 2 | |
| C29a | Preserve tab keyboard choice. | slice 1 | observed: story-views-narrow Tab/Enter/Space/Home/End and focused tabs; home-activation direct home versus arrow retaining file; project-visit reciprocal focus; sidebar-toggle retained reader; full/final affected run passed |
| C29b | Preserve direct home. | slice 1 | observed: story-views-narrow Tab/Enter/Space/Home/End and focused tabs; home-activation direct home versus arrow retaining file; project-visit reciprocal focus; sidebar-toggle retained reader; full/final affected run passed |
| C29c | Preserve file toggle. | slice 1 | observed: story-views-narrow Tab/Enter/Space/Home/End and focused tabs; home-activation direct home versus arrow retaining file; project-visit reciprocal focus; sidebar-toggle retained reader; full/final affected run passed |
| C29d | Preserve return behavior. | slice 1 | observed: story-views-narrow Tab/Enter/Space/Home/End and focused tabs; home-activation direct home versus arrow retaining file; project-visit reciprocal focus; sidebar-toggle retained reader; full/final affected run passed |
| C30a | Distinguishing test cases/files is independent work. | slice 2 | |
| C30b | It is not a prerequisite. | slice 2 | |
| Q01a | A relative mark requires a positive measured Baseline. | slice 2 | |
| Q01b | It also requires comparable measured after timing. | slice 2 | |
| Q02a | A percentage requires a positive measured Baseline. | slice 2 | |
| Q02b | It also requires comparable measured after timing. | slice 2 | |
| Q03 | A measured zero Baseline permits signed change. | slice 2 | |
| Q04a | Added scope retains measured time. | slice 2 | |
| Q04b | It does not claim change. | slice 2 | |
| Q05a | Gaps retain their reason. | slice 2 | |
| Q05b | Gaps never become zero. | slice 2 | |
| Q06 | Project Intent always shows project evidence, including while a story is selected. | slice 1 | observed: IntentPerspective distinct evidence providers; project-visit published text a 11 excludes worktree more and story diff, main CI plus explicit project context; final affected run passed |
| Q07 | Scale calculation does not scan unseen descendants. | slice 2 | |
| Q08a | Show only applicable names. | slice 1 | observed: IntentPage applicable project/story options and conditional header actions; homepage and no-story narrow exclude story tablist, story-changes excludes project tabs; project-visit reciprocal action; full/final affected run passed |
| Q08b | Show only applicable actions. | slice 1 | observed: IntentPage applicable project/story options and conditional header actions; homepage and no-story narrow exclude story tablist, story-changes excludes project tabs; project-visit reciprocal action; full/final affected run passed |
| J01a | Empty selection shows the no-selection header, project tabs and trunk CI in the shared arrangement. | slice 1 | observed: intent-ci-status-homepage first step: No story selected, project CI status and Optimization Candidates, selected CI status and main Passed state; final affected run passed |
| J01b | Selecting a story shows its title/views. | slice 1 | observed: intent-story-changes persistent-header step: full title/identity, Project Intent action and three applicable tabs; summary-title/review-return header action and geometry; full run passed |
| J01c | Clearing returns to project CI status. | slice 1 | observed: intent-project-visit each-new-selection journey: clear/reselect resets story CI comparison, clear after project candidates gives No story selected/project CI status; final affected run passed |
| J02a | Begin in story Proof with retained tree state. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02b | Begin with retained scroll. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02c | Visit Project Intent and browse a project test. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02d | Project evidence uses published project text. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02e | Project CI uses trunk evidence. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02f | Returning retains story selection. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02g | Returning restores the story file. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02h | Returning restores Proof. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02i | Returning restores reading position. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02j | Keyboard focus reaches outward controls. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J02k | Keyboard focus reaches return controls. | slice 1 | observed: intent-project-visit: real Taken worktree Purpose scroll and file Proof/published candidate/trunk CI restoration with unchanged selected identity and reciprocal focus; exactly one record/text read; final affected run passed |
| J03a | Baseline/Landed comparison continues into location Summary. | slice 2 | |
| J03b | It continues into folder Summary. | slice 2 | |
| J03c | It continues into file Proof. | slice 2 | |
| J03d | Those views retain the comparison endpoints. | slice 2 | |
| J03e | Those views retain signed presentation. | slice 2 | |
| J04a | 340 ms → 410 ms displays +70 ms. | slice 2 | |
| J04b | It receives a slower mark. | slice 2 | |
| J04c | Show % displays +21%. | slice 2 | |
| J04d | Returning retains the preference. | slice 2 | |
| J04e | Each scope applies its own scale rule. | slice 2 | |
| J05a | 600 → 660 seconds gives +60. | slice 2 | |
| J05b | 60 → 90 gives +30. | slice 2 | |
| J05c | 300 → 280 gives −20. | slice 2 | |
| J05d | Branch/Landed ascending order is −20, +30, +60. | slice 2 | |
| J05e | Duration does not determine that order. | slice 2 | |
| J05f | Percentage does not determine that order. | slice 2 | |
| J05g | Added results follow comparable results. | slice 2 | |
| J05h | Partial results follow comparable results. | slice 2 | |
| J05i | Unavailable results follow comparable results. | slice 2 | |
| J06a | Landed is still running or has no usable proof → drill into Summary and Proof. | slice 2 | |
| J06b | The same Branch comparison, or Taken Trunk Mode’s Provisional comparison, applies. | slice 2 | |
| J06c | The unused-Landed explanation applies. | slice 2 | |
| J07a | A rename uses the Baseline old path. | slice 2 | |
| J07b | A gap remains explained. | slice 2 | |
| J07c | Zero Baseline permits signed change. | slice 2 | |
| J07d | Zero Baseline has no ratio. | slice 2 | |
| J07e | Missing breakdown never produces invented timing. | slice 2 | |
| J08a | Under unavailable locations, narrow presentation, or zoom, the header stays keyboard reachable. | slice 1 | observed: intent-story-views-narrow selected and no-story tests: 390x560/720x460 control geometry, no sideways overflow, keyboard and reader height; ci-proof/summary-ci-proof short-width geometry; full/final affected run passed |
| J08b | Under those alternatives, views stay keyboard reachable. | slice 1 | observed: intent-story-views-narrow selected and no-story tests: 390x560/720x460 control geometry, no sideways overflow, keyboard and reader height; ci-proof/summary-ci-proof short-width geometry; full/final affected run passed |
| J08c | Under those alternatives, CI has its own result. | slice 1 | observed: homepage held-location load/failure/Retry CI and read counts, story ci-comparison-locations held/failure/Retry and unchanged comparison reads, project status Check again; full/final affected run passed |
| J08d | Under those alternatives, CI has its own recovery. | slice 1 | observed: homepage held-location load/failure/Retry CI and read counts, story ci-comparison-locations held/failure/Retry and unchanged comparison reads, project status Check again; full/final affected run passed |
| J08e | Under those alternatives, the reader remains usable. | slice 1 | observed: homepage held-location load/failure/Retry CI and read counts, story ci-comparison-locations held/failure/Retry and unchanged comparison reads, project status Check again; full/final affected run passed |
| X01 | Endpoint discovery changes are excluded. | slice 2 | |
| X02 | CI proof collection changes are excluded. | slice 2 | |
| X03 | CI proof schema changes are excluded. | slice 2 | |
| X04 | Revision changes are excluded. | slice 2 | |
| X05 | Freshness changes are excluded. | slice 2 | |
| X06 | Retry changes are excluded. | slice 2 | |
| X07 | Count-unit changes are excluded. | slice 2 | |
| X08 | Intent coverage assessment changes are excluded. | slice 2 | |
| X09 | Project Changed tests is excluded. | slice 2 | |
| X10 | Project Intent coverage is excluded. | slice 2 | |
