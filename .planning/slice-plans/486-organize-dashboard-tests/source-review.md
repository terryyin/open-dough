# Source-only acceptance review

Reviewer: `/root/source_review`, launched with `fork_turns: none`. The reviewer
was instructed to use only its supplied source, read no project files, change
nothing, and derive individual commitments without plan, implementation, proof
or slice ownership. The actual launch/input and full return are retained in
that agent's conversation in this execution.

Input: the user's implementation instruction quoted below, the ten accepted
names and browser/boundary distinction, plus the unchanged canonical story's
Goal, Scope, Key examples and Proof at preparation commit
`ac1b9eebf32ad1e7917e5a85bd2efbe615366a4f`. No plan or implementation was supplied.

> For the boundary, let's move it out of the dashboard, the current dashboard
> group, and make it a new group. It's called Dashboard Backend Test. Okay, so
> it becomes an entry by itself. And from folder organization perspective,
> they should not be under the current dashboard test. They should be at the
> same level. And then for the other dashboard test, let's group all the
> existing tests into these ten feature groups. Okay, all the tests belong to
> a feature group, one of the feature groups. Yeah. And make sure the CI still
> pass and all these tests still run in CI properly. And the testing time
> should, I mean the CI wall time should not increase with this.

The table retains each returned commitment, qualification, trigger and exclusion.
Slice ownership and observations are coordinator acceptance decisions, not
reviewer instructions. Conditional slower/incomplete-result commitments remain
with target CI until the applicable result and diagnosis are known.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Expose the backend suite as a separate entry named Dashboard Backend Test. | slice 1 | observed: IntentLocationGroup/IntentSummary plus intent-code-browse.spec.ts guarded journey: exact backend label selects canonical backend source; .planning/open-dough.json declares the independent location. |
| C02 | Move browser-free boundary specs out of dashboard/tests/. | slice 1 | observed: dashboard/backend-tests/ contains all 268 former boundary specs; full discovery retains every original case. |
| C03 | Place those boundary specs in a sibling test directory. | slice 1 | observed: dashboard/tests/ and dashboard/backend-tests/ are siblings under dashboard/. |
| C04 | Organize the remaining dashboard specs using the accepted ten feature groups. | slice 2 | observed: Final combined tree contains 475 browser specs plus eleven case-definition modules in the ten feature folders; 268 backend specs remain separate. |
| C05 | Assign every remaining dashboard spec to exactly one accepted feature group. | slice 2 | observed: All 743 specs have one physical tier/feature owner and one CI shard/project; no browser spec remains at the tests root. |
| C06 | Retain every existing test case. | slice 2 | observed: Own pre-integration move preserved all original 2075 cases; combined current-main discovery has 2088 cases matching successful run 42256249988 per all 755 source paths, with no count differences. |
| C07 | Retain each existing test case’s behavior. | slice 2 | observed: Own move/refactor retained all original definitions and assertions; all 17 concurrent-main changed test/helper ASTs match e6948 after canonical import normalization, and the eight-file 28-case merged family passed. |
| C08 | Keep all existing tests executing properly in CI. | target CI |  |
| C09 | Keep backend tests within the same CI validation. | target CI |  |
| C10 | Do not increase CI wall time. | target CI |  |
| C11 | Preserve existing test parallelism. | slice 1 | observed: playwright.config.ts worker policy and .github/workflows/ci.yml twelve-shard matrix unchanged; discovery tests prove a unique partition. |
| C12 | Preserve shared build costs. | slice 1 | observed: playwright.config.ts retains its one globalSetup/build shared by both selected projects; serving-modes and scheduling focused tests passed. |
| C13 | Preserve shared setup costs. | slice 1 | observed: No project dependencies or second run introduced; existing globalSetup and fixtures retained, focused harness checks passed. |
| C14 | Update test discovery as required by the move. | slice 1 | observed: testFiles.mjs explicitly discovers both roots; 15 discovery/preview cases and complete 2075-case listing passed. |
| C15 | Update shared support as required by the move. | slice 1 | observed: Shared fixture support retained under dashboard/tests; common-root SpecTimes and proof-record-entry focused cases passed; backend-path consumer trace inspected. |
| C16 | Update imports as required by the move. | slice 1 | observed: Typecheck and all-case listing passed after target-preserving import/URL rewrites; selected path-sensitive backend harnesses passed. |
| C17 | Update Intent locations as required by the move. | slice 1 | observed: Independent backend location in .planning/open-dough.json; CI declaration matches configured location paths; label preserves canonical identity. |
| C18 | Update proof attribution as required by the move. | slice 1 | observed: ci-proof-fragments mixed-entry ownership/time tests and actual composite-action regression: 7 files/37 cases pass, new tests discriminated old behavior. |
| C19 | Update timing allocation as required by the move. | slice 2 | observed: Final 743-file timing deal uses current-main run 42256249988; raw measured projection 799.5–800.2 seconds per shard versus observed old-layout peak 903.8. |
| C20 | Update CI configuration as required by the move. | slice 1 | observed: ci.yml declares browser/backend entries across same 12 shards; declaration/action collector tests passed without changing job matrix or worker policy. |
| C21 | Update maintained documentation as required by the move. | slice 2 | observed: README, feature-groups.md, writing-journeys.md, shards.md and necessary current candidate/source references describe the final layout. |
| C22 | Carry timing history forward for renamed specs. | slice 2 | observed: Every spec timing label carries measured current-main history after canonical source-to-feature mapping; all 743 recorded, zero unrecorded. |
| C23 | Avoid a CI allocation regression caused by cold timing history. | slice 2 | observed: No renamed or concurrent-main spec falls back to an assumed duration; existing twelve-shard shared build remains. |
| C24 | Compare discovered cases before and after the move. | slice 2 | observed: after-current-main.json compared with current-main CI proof by source path; all 2088 cases match, plus canonical AST preservation for the changed family. |
| C25 | Establish that the resulting inventory has no missing cases. | slice 2 | observed: No source-path case-count deficit against the complete current-main proof; original task-only 2075-case preservation remains separately recorded. |
| C26 | Establish that the resulting inventory has no duplicate cases. | slice 2 | observed: No source-path case-count surplus/duplicate against current-main proof; all spec files remain uniquely selected across twelve shards. |
| C27 | Compare shard allocation before and after the move. | slice 2 | observed: Measured current-main old-layout peak 903.8 summed test-seconds versus final balanced projection 799.5–800.2; normalized list 886.2–886.4 at factor 0.902 is a different scale. |
| C28 | Run the affected local suite. | slice 2 | observed: Original guarded 41-case batch, invalidated-fixture 16-case batch, watcher six-case recheck, and final merged-family 28-case batch all passed; full 2088-case discovery and proper Node runner checks passed. |
| C29 | Use the maintained macOS sleep guard for that local run. | slice 2 | observed: Accepted seven-file local run used caffeinate -s -i on verified AC power with two workers. |
| C30 | Verify the published revision’s complete CI result. | target CI |  |
| C31 | Compare its CI wall time against a comparable successful baseline. | target CI |  |
| C32 | Diagnose a slower result. | target CI |  |
| C33 | Correct a slower result before completion. | target CI |  |
| C34 | Diagnose an incomplete result. | target CI |  |
| C35 | Correct an incomplete result before completion. | target CI |  |
| Q01 | The accepted feature-group set is exactly Configuration, Stories, Launches, Sessions, Terminals, Review, Intent, Navigation, Observation, Runtime. | slice 2 | observed: Physical folders are configuration, stories, launches, sessions, terminals, review, intent, navigation, observation, runtime. |
| Q02 | Feature-group names must be concise. | slice 2 | observed: Each of the ten agreed folder labels is one domain noun. |
| Q03 | Feature-group names must accurately name their domains. | slice 2 | observed: Feature guide plus independent primary-assertion audit retains domain ownership rather than filename-prefix categories. |
| Q04 | Feature-group names must contain no “and.” | slice 2 | observed: No feature-folder name contains and. |
| Q05 | The feature-group count must not exceed ten. | slice 2 | observed: Exactly ten browser feature folders; support and fixtures contain no discovered browser specs. |
| Q06 | Dashboard Backend Test is the separately requested backend entry; it does not add an eleventh dashboard feature group. | slice 2 | observed: Backend entry remains sibling dashboard/backend-tests, separate from the ten browser feature folders. |
| Q07 | Browser journeys open a real dashboard page. | slice 2 | observed: Existing browser journeys retain page fixtures and assertions; normalized AST comparison found no unintended semantic changes in 483 moved files. |
| Q08 | Boundary tests open no page. | slice 1 | observed: All former browser-free boundary specs moved as a complete directory cohort; browser-opening specs remain in dashboard/tests. |
| Q09 | HTTP, WebSocket, files, commands, and module interfaces are supplied examples of boundary-test surfaces. | slice 1 | observed: Moved backend HTTP/WebSocket/file/command/module suites retained; representative endpoint/harness/serving cases passed. |
| Q10 | Both categories currently sharing one Playwright suite is existing context. | slice 1 | observed: Both roots are selected by the existing Playwright config and single globalSetup; testFiles unique-partition checks passed. |
| Q11 | Discovery, support, import, location, attribution, allocation, CI, and documentation changes are qualified by necessity arising from the move. | slice 2 | observed: Changes are test relocation, necessary references, configured labels/proof attribution, measured scheduling and maintained instructions only. |
| Q12 | The independently applicable failure policy is the supplied AGENTS.md policy; its contents were not supplied for this review. | slice 2 | observed: Failure policy carried in plan and every implementation/refactor/repair brief; CI scheduling failure was diagnosed, causally reproduced and repaired rather than rerun until green. |
| T01 | An existing browser-free HTTP spec belongs in the sibling backend location. | slice 1 | observed: authenticated-read-intent-locations.spec.ts now runs from dashboard/backend-tests; endpoint label/source-path check passed. |
| T02 | An existing journey opening the real dashboard remains within the dashboard feature classification. | slice 2 | observed: Existing Intent/browser and native-session journeys execute from their feature paths; seven-file batch passed. |
| T03 | A remaining dashboard spec without a feature assignment violates C05. | slice 2 | observed: No root-level or unassigned browser spec remains. |
| T04 | A remaining dashboard spec assigned to two feature groups violates C05. | slice 2 | observed: Every moved spec has one physical owner and exactly one CI shard/project selection. |
| T05 | A renamed spec losing its timing history triggers C22–C23. | slice 2 | observed: All 743 final spec paths map to measured current-main duration rows, including the two new Intent files. |
| T06 | Backend tests disappearing from CI violates C08–C09. | target CI |  |
| T07 | A slower comparable CI result triggers C32–C33. | target CI |  |
| T08 | An incomplete CI result triggers C34–C35. | target CI |  |
| X01 | Classifying existing work does not authorize creating new dashboard features. | slice 2 | observed: Taxonomy changes create no new dashboard capability beyond the explicitly requested independent backend entry title. |
| X02 | The accepted group names do not themselves authorize new test cases or new product behavior. | slice 2 | observed: All original 2075 dashboard cases retained; existing Intent journey extended to observe the requested groups, without adding unrelated features. |
| X03 | No exact sibling directory name is supplied. | slice 1 | observed: dashboard/backend-tests is the chosen sibling name; no user-supplied directory spelling was overridden. |
| X04 | No particular replacement test framework or suite arrangement is specified. | slice 1 | observed: Existing Playwright framework and shared suite reused. |
| X05 | No plan, implementation, or slice ownership follows from this classification. | slice 1 | observed: Execution authority comes from the user implementation request and admitted story, not the classification review. |
| X06 | No proof ownership follows from these acceptance requirements. | slice 1 | observed: Proof ownership is recorded by coordinator in the plan and this table; the reviewer supplied no plan or ownership. |
