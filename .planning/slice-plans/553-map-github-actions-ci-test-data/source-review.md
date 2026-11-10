# Source review — SEED-261#map-github-actions-ci-test-data

Launch: fresh general-purpose reviewer (no conversation inheritance), model inherit.
Input: story Goal, Scope, key examples and exclusions only for
SEED-261#map-github-actions-ci-test-data; no plan, product, proof, or slice scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers can read which GitHub Actions run and attempt a test checks, at which revision, with which conclusion and timing, in the same vocabulary across dashboard and execution tests. | slice 5 |  |
| 2 | Shared MakeMe setup owns those arranged facts so a domain change has one construction rule. | slice 5 |  |
| 3 | Existing independent behavioral proof is preserved. | slice 5 |  |
| 4.1 | Convert valid synthetic workflow runs, run attempts, and attempt jobs in: dashboard base-CI judgment | slice 1 | observed: dashboard/tests/support/baseCiActions.ts actionsRunsAnswer→apiRun; dashboard/tests/launches/agent-launch-base-ci*.spec.ts MakeMe runs |
| 4.2 | Convert valid synthetic workflow runs, run attempts, and attempt jobs in: Intent CI status | slice 1 | observed: dashboard/tests/intent/intent-ci-status*.spec.ts + intentCiStoryRecords/intentCiProofPage MakeMe aCiRun |
| 4.3 | Convert valid synthetic workflow runs, run attempts, and attempt jobs in: story comparisons | slice 2 | observed: storyCiComparisonFixture wall→makeMe.aCiRun; attempt/jobs via apiRun/apiJob; fixtures + backend timing consumers |
| 4.4 | Convert valid synthetic workflow runs, run attempts, and attempt jobs in: the execution skill's GitHub observation | slice 3 | observed: watch-ci-test-fixtures run; ci-mailbox releaseRun; ci-github-completed-jobs completedJobs; named REST/failure specs via MakeMe+apiRun/apiJob |
| 4.5 | Convert valid synthetic workflow runs, run attempts, and attempt jobs in: reuse fixtures | slice 4 |  |
| 4.6 | Convert valid synthetic workflow runs, run attempts, and attempt jobs in: integrated-state fixtures | slice 5 |  |
| 4.7 | Convert valid synthetic workflow runs, run attempts, and attempt jobs in: Node support revision selection | slice 1 | observed: tests/support/dashboard-ci-revision-nearest.test.mjs, dashboard-story-branch-ci.test.mjs, requested-revision-ci-status.test.mjs |
| 5 | Include indirect consumers of the shared run and job factories. | slice 5 |  |
| 6 | Remove displaced constructors, or have their harnesses delegate to MakeMe. | slice 5 |  |
| 7 | Align existing `aCiRun` with the production GitHub observation contract (not the dashboard suite-local `CiRunAnswer`). | slice 1 | observed: tests/support/ciRunTestData.mjs CiRunBuilder/githubCiRunFacts; makeMe.aCiRun observed databaseId shape |
| 8 | Reuse the GitHub run facts already built by `aRevisionCiRun` behind one construction rule. | slice 1 | observed: tests/support/ciRunTestData.mjs githubCiRunFacts shared by CiRunBuilder and RevisionCiRunBuilder |
| 9 | Retain the provider-neutral adapter projection as a distinct concept. | slice 1 | observed: RevisionCiRunBuilder keeps adapterAttempt as distinct ListedRun field; ciAdapter wall-time case unchanged |
| 10 | Keep actual GitHub REST responses and observed run/current-attempt projections distinct. | slice 1 | observed: baseCiActions actionsRunsAnswer encodes via apiRun(observedRunForApi(...)); observed facts stay distinct from REST body |
| 11 | Reuse the existing API encoding seam. | slice 1 | observed: dashboard/tests/support/baseCiActions.ts imports apiRun from github-actions-api-test-fixtures.mjs |
| 12.1 | State at the call site whenever they drive the case: revision | slice 1 | observed: call sites e.g. wall-time/nearest/status specs state headSha at MakeMe.with(...) |
| 12.2 | State at the call site whenever they drive the case: run identity | slice 1 | observed: call sites state databaseId (e.g. wall-time databaseId: 41) |
| 12.3 | State at the call site whenever they drive the case: attempt identity | slice 1 | observed: call sites state attempt (e.g. nearest cancelled attempt 2 vs completed attempt 1) |
| 12.4 | State at the call site whenever they drive the case: branch | slice 1 | observed: call sites/state branch via observedRunForApi headBranch or aRevisionCiRun.branch when driving |
| 12.5 | State at the call site whenever they drive the case: event | slice 1 | observed: githubCiRunFacts default event push; overrides at call site when driving |
| 12.6 | State at the call site whenever they drive the case: conclusion | slice 1 | observed: call sites state conclusion (success/cancelled/failure/null for in-progress) |
| 12.7 | State at the call site whenever they drive the case: times | slice 1 | observed: call sites state startedAt/completedAt when driving wall-time (10:00–10:03) |
| 13 | Preserve repository and workflow ownership in reuse. | slice 4 |  |
| 14.1 | Preserve as distinct facts: pending | slice 1 | observed: intent-ci-status pending paths via MakeMe status facts |
| 14.2 | Preserve as distinct facts: queued | slice 1 | observed: queued distractor in status/ancestor selections preserved |
| 14.3 | Preserve as distinct facts: in-progress | slice 1 | observed: in-progress + ancestor wall-time/status cases |
| 14.4 | Preserve as distinct facts: cancelled | slice 1 | observed: cancelled latest → earlier completed in nearest + status |
| 14.5 | Preserve as distinct facts: skipped | slice 2 | observed: Skipped comparison fixtures retain conclusion skipped / empty tip runs |
| 14.6 | Preserve as distinct facts: absent | slice 1 | observed: absent timing / missing run paths remain unavailable (wall-time not recorded) |
| 14.7 | Preserve as distinct facts: completed | slice 1 | observed: completed success paths in base-CI and status |
| 15 | An earlier completed attempt and a current rerun keep separate identities. | slice 1 | observed: tests/support/dashboard-ci-revision-nearest.test.mjs selectRevisionAttempt cancelled attempt 2 vs completed attempt 1 |
| 16 | Synthetic job setup states the facts the consumer needs. | slice 2 | observed: tests/support/ciJobTestData.mjs aGitHubJob.withFacts; ci-time-without-runner-waits synthetic jobs |
| 17 | Conversion adds no new restriction on opaque identities or absent timing. | slice 1 | observed: githubCiRunFacts omits invented timing/ids; absent startedAt/completedAt stay absent |
| 18.1 | Keep in the harness: real Git histories | slice 5 |  |
| 18.2 | Keep in the harness: executed commands | slice 5 |  |
| 18.3 | Keep in the harness: fake GitHub routing | slice 3 | observed: fake GitHub routing retained in existing harnesses (unchanged ownership) |
| 18.4 | Keep in the harness: pagination | slice 3 | observed: pagination retained in harness (second-page failures still harness-owned) |
| 18.5 | Keep in the harness: request counting | slice 3 | observed: request counting retained in harness |
| 18.6 | Keep in the harness: held or failing reads | slice 3 | observed: held/failing reads retained in harness (watch-ci-execution-hold) |
| 18.7 | Keep in the harness: controlled clocks | slice 3 | observed: controlled clocks retained in harness |
| 18.8 | Keep in the harness: process lifetime and teardown | slice 3 | observed: process lifetime/teardown retained in harness |
| 19.1 | Keep literal where their form is under proof: captured job timestamps | slice 2 | observed: storyCiObservedJobs captured baseline/branch/rerun job timestamps left literal |
| 19.2 | Keep literal where their form is under proof: log text | slice 3 | observed: diagnostic log strings left literal in ci-github-diagnostic-logs |
| 19.3 | Keep literal where their form is under proof: malformed/partial responses | slice 1 | observed: unchanged literal malformed/partial response examples (no conversion touch) |
| 19.4 | Keep literal where their form is under proof: exact encoder-input examples | slice 1 | observed: unchanged exact encoder-input examples in github-actions-api-test-fixtures (apiRun reused, examples literal) |
| 20 | Expectations stay independent of arrangement. | slice 5 |  |
| 21.1 | Belong to sibling stories (not converted here as ownership of those domains): CI adapter attempts |  | G1 |
| 21.2 | Belong to sibling stories (not converted here as ownership of those domains): queue and coverage records |  | G1 |
| 21.3 | Belong to sibling stories (not converted here as ownership of those domains): CI proof fragments and summaries |  | G1 |
| 22 | In mixed fixtures, convert GitHub run/job facts only. | slice 5 |  |
| 23 | This story changes test construction and exposed mapping mistakes. | slice 5 |  |
| 24.1 | This story makes no new: UI promise |  | G2 |
| 24.2 | This story makes no new: provider-contract promise |  | G2 |
| 24.3 | This story makes no new: CI-policy promise |  | G2 |
| E1 | A run at the checked revision is in progress while a strict ancestor has completed → base-CI judgment and revision lookup keep running vs completed evidence distinct; use only eligible ancestor results; do not treat a sibling or queued rerun as a completed verdict. For one run whose latest attempt is cancelled, an earlier completed timed attempt at that same revision remains selectable. | slice 1 | observed: dashboard-ci-revision-nearest + intent-ci-proof-ancestor / status in-progress+ancestor selections |
| E2 | Listed run 41, attempt 1, starts 10:00 / completes 10:03 for the shown revision → Intent shows that attempt and CI wall time 3 min; absent timing remains unavailable. A cancelled latest attempt does not erase an earlier completed result's usable time. | slice 1 | observed: intent-ci-status-wall-time.spec.ts run 41 attempt 1 10:00–10:03 → CI wall time 3 min; absent timing not recorded |
| E3 | A story's Branch and Landed results refer to the same attempt → comparison retains correct baseline and both endpoint identities, shows the same attempt-job timing, and reads the shared attempt's jobs once. A refused read can recover; settled evidence stops further reads. | slice 2 | observed: intent-ci-comparison + taken listedAttemptJobPages + backend ci-comparison memory/endpoint one-read sharing |
| E4 | Workflow still running when one attempt's job fails, or a failed earlier attempt is discovered after a later success → observer keeps that failure actionable with its own run, attempt, and job evidence, including a failing job on a second page. Diagnostic log evidence remains the original text. | slice 3 | observed: watch-ci-execution-failures + coverage second-page job; URL/steps via aGitHubJob→apiJob; original logs |
| E5 | Exact-revision run has successful direct job proof with matching repository, workflow, and context → reuse selects its current attempt; a newer pending rerun or a changed/partial read chooses fresh execution. A later successful retry can qualify, preserving an opaque source run ID separately from the target's own completion. | slice 4 |  |
| E6 | Accepted B has a `not_required` basis and no run; descendant C executes the declared check successfully → with the integrated-state policy, the observer can validate B at C while retaining B's own basis; without that policy B stays unresolved, and B's own failure remains a failure beside C's green. Git ancestry and the command producing C's result stay real. | slice 5 |  |
