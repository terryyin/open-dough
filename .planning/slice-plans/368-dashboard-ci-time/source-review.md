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
| C04 | Reduce browser round trips in exhaustive layout checks. | slice 2 | observed: controlReachability.expectEveryControlReachable keeps all-controls/freshvisibility/native scroll/clipping and reads diagnostic text only on failure |
| C05 | Reduce browser round trips in native touch checks. | slice 2 | observed: touchGestures.readAfterTouchFrame waits then samples the retained browser predicate in one evaluation; native reading guard records every move and frame |
| C06 | Measure the result against the unchanged suite. | slice 2 | |
| C07 | Preserve all current scenarios. | slice 2 | |
| C08 | Preserve all current assertions. | slice 2 | observed: inspected native journey diff preserves original identity/input/layout/attachment assertions; controlReachability retains original clipping/tap assertions |
| C09 | Preserve every-control reachability. | slice 2 | observed: control-reachability-observation.spec.ts covers allcontrolkinds, lateclip, revealedcontrol, unscrollableoverflow andmodal escape;34-casefamily3passes |
| C10 | Preserve native touch moves. | slice 2 | observed: touch-reading-observation.spec.ts forwards realCDPevents and observes five exactonepixelmoves plus touchstart/end; originalphone/tabletjourneys3passes |
| C11 | Preserve per-pixel observations. | slice 2 | observed: native guard observes fivecompletedRAF samples [1,2,3,4,5] and stops atfifthsample; original narrowheader journey3passes |
| C12 | Preserve serial deployment transitions. | slice 1 | observed: unchanged production-watcher*.spec.ts serial transition assertions, 24/24 focused proof; scheduling guard state 0 to 1 |
| C13 | Preserve test isolation. | slice 2 | observed: unchanged testscoped servers/GitHub/HOME; browser reading handles are pertest and disposed in finally; context/RAF observations are testscoped |
| C14 | Preserve strict verdicts. | slice 2 | observed: quietReporter/retries0 unchanged in slice2; all34selectedcases have strictpassed verdict in allthree records |
| C15 | Preserve the 12-shard CI workload. | slice 1 | observed: unchanged .github/workflows/ci.yml matrix12; dashboard-test-files.test.mjs all actual files exactly once across12shares |
| C16 | Preserve the four-worker CI workload. | slice 1 | observed: unchanged availableParallelism worker configuration and no project worker override; hosted final report also owned by slice2 |
| C17 | Include shared setup in timing evidence. | slice 1 | observed: quietReporter.onStepEnd to SpecTimes.addSharedHook; real beforeAll/afterAll guard; hosted baseline weights include exact shared hooks |
| C18 | Avoid double-counting test-scoped fixtures. | slice 1 | observed: spec-times.spec.ts observes2beforeEach and2afterEach but artifact adds only attemptMs plus sharedMs |
| C19 | Compare normal local execution between baseline and candidate. | slice 2 | observed: focused-before97.35s and focused-after92.09s are same24selectedcases, ordinarydefaultworkers, env -uNO_COLOR; scheduling-only88.97s limits attribution |
| C20 | Compare full hosted CI between baseline and candidate. | slice 2 | |
| C21 | Name the baseline revision. | slice 2 | observed: baseline application revision0bffc434 (samecodeas5de6411d); hosted40789926577/40790934008; named local proof records |
| C22 | Name the candidate revision. | slice 2 | |
| C23 | Report case selection. | slice 2 | |
| C24 | Report workers. | slice 2 | |
| C25 | Report queue delay. | slice 2 | |
| C26 | Report job elapsed time. | slice 2 | |
| C27 | Report suite elapsed time. | slice 2 | |
| C28 | Report uncertainty. | slice 2 | |
| C29 | Retain only supported gains. | slice 2 | |
| C30 | Report inconclusive comparisons honestly. | slice 2 | |
| Q01 | The improvement is bounded to the two selected changes: early serial watcher chains with honest weights, and fewer browser round trips. | slice 2 | observed: diff restricted to selected scheduling/reporting and browserobservations/tests; no unrelated product responsibility changed |
| Q02 | A focused speedup alone is insufficient evidence of the requested outcome. | slice 2 | |
| Q03 | Release and trunk integration remain bounded by the ordinary story-branch execution workflow. | slice 2 | observed: implementation published onlyto refs/heads/codex/dashboard-ci-time; main contains explicitlyapprovedpreparation only |
| J01 | Long serial deployment chains begin alongside ordinary tests. | slice 1 | observed: dashboard-scheduling.spec.ts ordinary:start before chain:first, chain:setup before ordinary:later, one globalsetup |
| J02 | Those chains stop holding an otherwise idle shard open. | slice 2 | |
| J03 | Every control still scrolls into view. | slice 2 | observed: reachability guard observes Last fullyinviewport and positive nativescrollTop; originalallcontrols loop retained |
| J04 | Every control still passes clipping checks. | slice 2 | observed: guards reject lateLast/Revealed clips andunscrollable overflow with original diagnostics; modalcontext andtap pass |
| J05 | Every native touch movement is observed after its animation frame. | slice 2 | observed: touch-reading-observation.spec.ts RAF wrapper marks callback completion aftercallback returns; readingFrames equality rejects earlysamples |
| J06 | Native touch observation includes narrow reading windows between complete strokes. | slice 2 | observed: native guard checksonepixelpositions and fifth-sample narrowwindow; existing realphoneheader nativejourney passes3times |
| X01 | Browser-clock changes. | slice 2 | observed: no product clock/test page.clock changes; newRAF guard forwards native callbacks |
| X02 | Fixture-origin reuse. | slice 2 | observed: no origin/fixture sharing changes |
| X03 | Moving cases between test tiers. | slice 2 | observed: no existingcases moved between browser/boundary tiers |
| X04 | Product behavior changes. | slice 2 | observed: all production source unchanged |
| X05 | Skips. | slice 2 | observed: no skips added; focusedproof selected/executed34cases in eachpass |
| X06 | Retries. | slice 2 | observed: no retries added; existingretries0 unchanged |
| X07 | Extra CI shards. | slice 2 | observed: unchanged CI matrix12 |
| X08 | Release integration beyond the ordinary story-branch execution workflow. | slice 2 | observed: no release integration attempted |
| X09 | Trunk integration beyond the ordinary story-branch execution workflow. | slice 2 | observed: no implementation integration to main attempted |
