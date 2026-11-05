# Source review — SEED-239#show-ci-status-on-intent-home

**Launch:** fresh general-purpose reviewer (no conversation inheritance), Cursor Task, 2026-11-05.
**Input:** only the selected story Goal, Scope (required behavior and scope limits), and Key examples from `.planning/seeds/SEED-239-intent-home-ci-status.md#show-ci-status-on-intent-home`. No plan, return, product, or proof.
**Reviewer agent:** b570fc91-868a-4a0b-b4d6-1b3ba307470a

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G | Goal: Intent's first content is the judged branch's CI result, proof counts and attempt cost in time, without first choosing a tab or waiting on a cold CI read when an answer is held; shortens the route and keeps freshness visible | slice 5 |  |
| 1 | The Intent reading mode with nothing selected shows CI status in the content area, in place of the empty Purpose and Proof panes | slice 1 | observed: dashboard/src/IntentBrowser.tsx empty-selection IntentCiStatus; dashboard/tests/intent-ci-status-homepage.spec.ts nothing-selected step (CI fills reading; Purpose count 0) |
| 2 | The mode strip keeps Intent and Optimization Candidates | slice 1 | observed: dashboard/src/IntentModeTabs.tsx modes Intent\|Optimization Candidates; homepage spec strip toHaveText |
| 3 | The mode strip no longer offers a separate CI status mode | slice 1 | observed: dashboard/src/IntentModeTabs.tsx IntentMode has no ci-status; homepage spec strip tabs exclude CI status |
| 4 | Selecting a location, folder or file shows its existing Summary or Purpose/Proof reading | slice 1 | observed: IntentBrowser.tsx location/folder IntentSummary and file IntentFileReading; homepage spec file select shows Purpose |
| 5 | The developer can return to the CI homepage from any selection without leaving Intent | slice 1 | observed: IntentBrowser.tsx Return to CI status sets path ""; homepage spec return-home step |
| 6 | The homepage does not depend on Intent locations: it shows when none are configured or their read failed, beside that explanation | slice 1 | observed: IntentPerspective.tsx explained withCi for NotConfigured and failed; homepage not-configured step; intent-ci-status.spec.ts without locations |
| 7 | The homepage judges the same branch the CI status tab judged: the project's trunk, or the selected story's published story branch, with the story gap explained when there is no branch | slice 1 | observed: intentCiTarget.ts + intent-ci-status-story.spec.ts / intent-ci-status-story-gaps.spec.ts judge trunk or story branch with gaps |
| 8 | The homepage keeps the judgment | slice 1 | observed: IntentCiStatus ShownJudgment; intent-ci-status.spec.ts Passed at … |
| 9 | The homepage keeps its proof rows per declared proof entry | slice 1 | observed: IntentCiProof rows; intent-ci-proof.spec.ts entry counts and parts |
| 10 | The homepage keeps the re-read on a new observed head | slice 1 | observed: intent-ci-status-kept.spec.ts / intent-ci-status-story.spec.ts head re-read |
| 11 | The homepage keeps Check again | slice 1 | observed: existing Check again paths in intent-ci-status-reads.spec.ts and proof reasons specs |
| 12 | The GitHub Actions reading path keeps working | slice 1 | observed: intent-ci-status*.spec.ts GitHub Actions fixtures green (30 focused) |
| 13 | The CI-adapter reading path keeps working | slice 1 | observed: intent-ci-proof-adapter*.spec.ts and intent-ci-status-reads ciAdapter path green |
| 14 | For the attempt whose proof the homepage shows, show the elapsed time from that attempt starting to its completion | slice 2 | observed: dashboard/src/IntentCiProof.tsx + ciProofWording.ciWallTimeLine; intent-ci-status-wall-time.spec.ts 10:00→10:03 shows CI wall time 3 min |
| 15 | That elapsed time covers the whole pipeline including setup, checks and final reporting | slice 2 | observed: wall time from attempt startedAt/completedAt (GHA run_started_at/updated_at via observedRun), not test sums — wall-time + proof specs |
| 16 | Overlapping jobs count once | slice 2 | observed: same attempt-bound wall clock (not per-job sums); observedRun/normalizeAttempt carry attempt times only |
| 17 | Wall time comes from the CI read of that attempt, not from summing test or job durations | slice 2 | observed: ci-github-actions observedRun and ci-command-attempts normalizeAttempt → baseCiNearest judgment → Proof |
| 18 | Beside each declared proof entry's counts, show the sum of that entry's individual test execution durations across its parts, shards or parallel workers | slice 4 | observed: IntentCiProof entry rows + entryExecutionTimeLine; intent-ci-status-execution-time.spec.ts 4 min / 2 min beside counts |
| 19 | That figure is cumulative execution time and may exceed wall time | slice 4 | observed: cumulative sum of part durationMs (may exceed wall); E2 wall 3 min with entry 4+2 min |
| 20 | It is named so it does not read as elapsed time | slice 4 | observed: wording "test execution time" in ciProofWording.entryExecutionTimeLine |
| 21 | The CI proof publication path (fragments and the attempt's summary) gains the durations it lacks | slice 3 | observed: ci-proof-fragments/collect/summary + --times/OPEN_DOUGH_TEST_TIMES + Playwright durationMs; focused ci-proof-*.test.mjs and ci-proof-declaration.test.mjs; hosted story-branch summary observation remains post-publish |
| 22 | Timing evidence that was read but not recorded (an older summary, or an adapter attempt without start/completion times) is shown as not recorded with why | slice 4 | observed: older summary: test execution time not recorded with why (execution-time spec); adapter wall not-recorded remains slice 2/E7 |
| 23 | An entry whose parts are missing, ambiguous or partly without durations shows its execution time as partial, never as a complete total | slice 4 | observed: partial from missing/untimed parts with parts named; never complete total — execution-time missing-shard step |
| 24 | An unreadable source keeps the existing unavailable wording | slice 4 | observed: existing unavailable proof wording unchanged (intent-ci-proof-reasons / prior unavailable paths) |
| 25 | No missing timing is shown as zero | slice 4 | observed: no zero for missing duration — not recorded / partial paths; execution-time specs |
| 26 | The dashboard server keeps the last answer it read for each project and judged branch: the judgment, its proof and timings, and when they were retrieved | slice 5 |  |
| 27 | Each homepage show returns any kept answer at once, labelled previously retrieved with its retrieval time | slice 5 |  |
| 28 | Each homepage show also reads CI afresh as the tab did | slice 5 |  |
| 29 | A spinner shows while that fresh read is in progress, from the start when nothing is kept | slice 5 |  |
| 30 | The fresh answer replaces the kept one on screen and in the cache and ends the spinner | slice 5 |  |
| 31 | A failed refresh ends the spinner, shows the failure, and keeps any kept answer labelled previously retrieved, never as newly verified | slice 5 |  |
| 32 | A failed refresh does not overwrite the kept answer | slice 5 |  |
| 33 | Counts, timings and the result shown belong to one repository, branch, revision and attempt | slice 5 |  |
| 34 | A kept or fresh answer for a target other than the one now selected is never shown, including when the project or story changes while a read is in progress | slice 5 |  |
| 35 | The cache lives in the dashboard server process and is rebuilt by reading CI; keeping it across a dashboard server restart is not undertaken | slice 5 |  |
| 36 | No time-based refresh or polling is added: refresh still happens on show, on a new observed head and on Check again, so the per-show GitHub request count does not grow | slice 5 |  |
| 37 | No per-job duration breakdown | slice 4 | observed: no per-job duration UI added; only entry-level test execution time |
| 38 | No trend history | slice 4 | observed: no trend history added |
| 39 | No timing for checks that do not publish CI proof entries | slice 4 | observed: no timing for checks outside CI proof entries |
| 40 | Launch base CI and other CI surfaces keep their current behavior | slice 1 | observed: diff touches dashboard Intent CI homepage only; no Launch base CI surface changes |
| E1 | Opens Intent with locations configured and nothing selected: CI of main fills content; strip is Intent and Optimization Candidates only; select a test file, read Purpose/Proof, return to CI homepage within Intent | slice 1 | observed: dashboard/tests/intent-ci-status-homepage.spec.ts full journey |
| E2 | Attempt 10:00–10:03; tests entry 4 min and dashboard/tests 2 min execution; homepage shows CI wall time 3 min and test execution time 4 min and 2 min; wall time is not 6 min | slice 4 | observed: intent-ci-status-execution-time.spec.ts: wall 3 min + test execution 4 min and 2 min |
| E3 | Reopen after a read 20 minutes ago: kept result appears immediately as previously retrieved with spinner; newer attempt replaces it and spinner stops | slice 5 |  |
| E4 | After server restart, first visit is spinner only until CI answers; later network-down Check again shows failure while earlier answer stays previously retrieved | slice 5 |  |
| E5 | Trunk refresh in progress when selecting a story with a kept story-branch answer: only that story branch's kept and fresh answers appear; late trunk answer never shown | slice 5 |  |
| E6 | Older summary without timing: counts appear, entry execution time not recorded, wall time still from CI read; missing browser-test shard fragment → that entry's execution time partial with the part named | slice 4 | observed: same spec: older not recorded + missing shard partial with part named |
| E7 | CI-adapter project without attempt start/completion times: result and counts show with CI wall time not recorded | slice 2 | observed: intent-ci-status-wall-time.spec.ts adapter without startedAt/completedAt shows CI wall time not recorded with why |
