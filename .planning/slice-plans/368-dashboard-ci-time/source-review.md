# Independent source review

Fresh reviewer `/root/source_contract_review`, fork_turns `none`, received only
the original selected story Goal, Scope, Examples, Evaluation and Excluded text
and instructions to read no files, change nothing, and number individual
commitments, qualifications, journey examples and exclusions. Its actual return
is retained verbatim by id below. No implementation or plan was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Reduce the dashboard suite’s CI elapsed time. | slice 2 | |
| C02 | Start serial production watcher chains early. | slice 1 | observed: dashboard/tests/boundary/dashboard-scheduling.spec.ts native dispatch event gates; first production project in dashboardTestProjects |
| C03 | Use honest shared-hook weights. | slice 1 | observed: dashboard/tests/boundary/spec-times.spec.ts exact artifact = attemptMs + sharedMs; hosted hook-inclusive duration-list refresh |
| C04 | Reduce browser round trips in exhaustive layout checks. | slice 2 | |
| C05 | Reduce browser round trips in native touch checks. | slice 2 | |
| C06 | Measure the result against the unchanged suite. | slice 2 | |
| C07 | Preserve all current scenarios. | slice 2 | |
| C08 | Preserve all current assertions. | slice 2 | |
| C09 | Preserve every-control reachability. | slice 2 | |
| C10 | Preserve native touch moves. | slice 2 | |
| C11 | Preserve per-pixel observations. | slice 2 | |
| C12 | Preserve serial deployment transitions. | slice 1 | observed: unchanged production-watcher*.spec.ts serial transition assertions, 24/24 focused proof; scheduling guard state 0 to 1 |
| C13 | Preserve test isolation. | slice 2 | |
| C14 | Preserve strict verdicts. | slice 2 | |
| C15 | Preserve the 12-shard CI workload. | slice 1 | observed: unchanged .github/workflows/ci.yml matrix12; dashboard-test-files.test.mjs all actual files exactly once across12shares |
| C16 | Preserve the four-worker CI workload. | slice 1 | observed: unchanged availableParallelism worker configuration and no project worker override; hosted final report also owned by slice2 |
| C17 | Include shared setup in timing evidence. | slice 1 | observed: quietReporter.onStepEnd to SpecTimes.addSharedHook; real beforeAll/afterAll guard; hosted baseline weights include exact shared hooks |
| C18 | Avoid double-counting test-scoped fixtures. | slice 1 | observed: spec-times.spec.ts observes2beforeEach and2afterEach but artifact adds only attemptMs plus sharedMs |
| C19 | Compare normal local execution between baseline and candidate. | slice 2 | |
| C20 | Compare full hosted CI between baseline and candidate. | slice 2 | |
| C21 | Name the baseline revision. | slice 2 | |
| C22 | Name the candidate revision. | slice 2 | |
| C23 | Report case selection. | slice 2 | |
| C24 | Report workers. | slice 2 | |
| C25 | Report queue delay. | slice 2 | |
| C26 | Report job elapsed time. | slice 2 | |
| C27 | Report suite elapsed time. | slice 2 | |
| C28 | Report uncertainty. | slice 2 | |
| C29 | Retain only supported gains. | slice 2 | |
| C30 | Report inconclusive comparisons honestly. | slice 2 | |
| Q01 | The improvement is bounded to the two selected changes: early serial watcher chains with honest weights, and fewer browser round trips. | slice 2 | |
| Q02 | A focused speedup alone is insufficient evidence of the requested outcome. | slice 2 | |
| Q03 | Release and trunk integration remain bounded by the ordinary story-branch execution workflow. | slice 2 | |
| J01 | Long serial deployment chains begin alongside ordinary tests. | slice 1 | observed: dashboard-scheduling.spec.ts ordinary:start before chain:first, chain:setup before ordinary:later, one globalsetup |
| J02 | Those chains stop holding an otherwise idle shard open. | slice 2 | |
| J03 | Every control still scrolls into view. | slice 2 | |
| J04 | Every control still passes clipping checks. | slice 2 | |
| J05 | Every native touch movement is observed after its animation frame. | slice 2 | |
| J06 | Native touch observation includes narrow reading windows between complete strokes. | slice 2 | |
| X01 | Browser-clock changes. | slice 2 | |
| X02 | Fixture-origin reuse. | slice 2 | |
| X03 | Moving cases between test tiers. | slice 2 | |
| X04 | Product behavior changes. | slice 2 | |
| X05 | Skips. | slice 2 | |
| X06 | Retries. | slice 2 | |
| X07 | Extra CI shards. | slice 2 | |
| X08 | Release integration beyond the ordinary story-branch execution workflow. | slice 2 | |
| X09 | Trunk integration beyond the ordinary story-branch execution workflow. | slice 2 | |
