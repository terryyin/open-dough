# Source review: Build dashboard test repositories from explicit MakeMe data

Launch: a fresh general-purpose sub-agent with no conversation inheritance,
started by the execution coordinator on 2026-11-08 after the developer's
story amendment (split of fake GitHub planning text into
[fake GitHub planning data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#declare-fake-github-planning-data))
and before slice 2 acceptance. It replaces the review obtained before slice 1.
Input: only the story's Goal, Scope, Key examples, Evaluation and Architecture
text from
[the seed section](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-dashboard-origin-fixtures)
at `216d75737`, read from one extracted file, with instructions to read no
other project files, change nothing, and return numbered commitments,
examples and exclusions without slicing or acceptance. No plan, return,
product or proof was supplied.

Reviewer notes: the counts dated 2026-11-08 size the work and are not
promises; the measurement samples in 4 are evidence for the wider "must not
get slower"; whether `test.use` overrides count as named shared descriptions
is left open. Exclusions returned: clean-trunk, Node and shell fixtures;
cross-description caching; branch or merge model; fake GitHub planning text
without a Git repository; native evidence; building the materializer itself;
literal readiness inputs; commit-graph mechanics.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | From a dashboard journey or backend spec, a maintainer can see which repository facts its fixture starts with | slice 3 |  |
| 2 | From the same spec, a maintainer can see which later commits its fixture adds | slice 3 |  |
| 3a | Start origins state their starting facts through the shared repository description | slice 1 | observed: dashboard/tests/support/startOrigin.ts startOrigin(description) and the seven fixture files; 827-case focused run of 352 importing specs passed |
| 3b | Start-origin publishers state their starting facts through the shared description | slice 2 | observed: story-dependencies.spec.ts test.use originRepository with twoDependencies; trunkModeRepository in the four story-review-trunk-own specs; changedReviewRevision in agent-launch-start-codex/phases; 165-case slice 2 run |
| 3c | The standalone readiness fixture and the admission fixture state their starting facts through the shared description | slice 2 | observed: dashboard/tests/storyReadinessFixture.ts openDoughReadiness/doughnutRepository via materializeRepository; dashboard/tests/admittedWork.ts publishedQueue |
| 4 | Dashboard test feedback does not get slower, measured before and after under comparable load for one Playwright journey family and one backend family that use the default origin, and for the standalone readiness and admission specs | slice 3 | G3 |
| 5 | `startOrigin` accepts a MakeMe repository description | slice 1 | observed: dashboard/tests/support/startOrigin.ts startOrigin(description = makeMe.aRepository.please(), options) |
| 6 | Called with no description, `startOrigin` produces exactly one commit holding the installed skills and an empty but valid product backlog, with no story queued | slice 1 | observed: dashboard/backend-tests/launches/start-origin-default.spec.ts rev-list count 1, installed SKILL.md present, .planning holds only PRODUCT-BACKLOG.md, adopt --all reports 0 active entries |
| 7 | Every call site and origin fixture that relies on the queued stories explicitly passes the shared two-Ready-queued-stories description | slice 1 | observed: every startOrigin call site passes queuedReadyRepository().please(); fixtures use queuedOriginRepository built from it; 827-case focused run passed |
| 8 | That two-story description is the one the shared repository builder provides for the skill tests, with no dashboard copy | slice 1 | observed: tests/support/queued-repository.mjs queuedReadyRepository imported by dashboard/tests/support/startOrigin.ts and startOriginPreparation.ts |
| 9 | Each Playwright fixture states its description in its own fixture file, e.g. the `origin` fixture in `startOriginTest.ts` names the shared Stories A/B description | slice 1 | observed: each of the seven fixture files declares originRepository: queuedOriginRepository (Stories A and B queued and Ready, overridable with test.use) |
| 10 | A spec that needs different facts overrides its fixture's description with `test.use` | slice 2 | observed: dashboard/tests/stories/story-dependencies.spec.ts test.use({ originRepository: queuedReadyRepository().withRevision("dependencies", twoDependencies(...)) }) and seven other files, passing in the 165-case slice 2 run |
| 11 | A spec that publishes the shared-stories origin still shows both cards Ready, assertions unchanged | slice 1 | observed: startOriginTest publishing consumers (session-unread-report, done-question) passed with unchanged assertions in the 827-case run |
| 12 | Installed skills remain a harness layer, not a domain fact in the description | slice 1 | observed: dashboard/tests/support/startOriginPreparation.ts withInstallation adds .gitignore and skills to the first revision in the harness; MakeMe description unchanged |
| 13 | The harness adds installed skills to the description's first commit; the origin keeps one root commit holding stories and skills; history shape unchanged | slice 1 | observed: slice 1 first-commit comparison: one commit by Dashboard Developer, all 705 old ls-tree entries identical incl. 100755 modes, only trunk.txt added |
| 14 | Installed skills still come from the current run's working-tree source | slice 1 | observed: dashboard/backend-tests/launches/start-origin-isolation.spec.ts successive preparations install current working-tree source |
| 15 | Global setup keeps its run-wide preparation | slice 1 | observed: startOriginArtifacts() per layout x {default, queued}; start-origin-demand.spec.ts started keys |
| 16 | Run-wide preparation builds each installation layout once per run from the named shared descriptions in use | slice 1 | observed: startOriginArtifacts() keys start-origin-<layout>[-queued]; start-origin-isolation.spec.ts prepared snapshot unchanged |
| 17 | Each test copies the prepared origin as it does today; stories are not committed per test on a skills-only origin | slice 1 | observed: initializeStartOrigin cpSync per test unchanged; start-origin-isolation.spec.ts distinct pack inodes |
| 18 | A description that is not prepared run-wide is materialized by the shared materializer with its per-process reuse on top of the same installed skills | slice 2 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts one root commit with its own seed, backlog entry and installed SKILL.md; second startOrigin has the same root commit SHA |
| 19 | Helpers that hand-write published planning facts declare them in the description instead | slice 2 | observed: slice 2 publishers listed in 19a/19b; search leaves only literal journey steps the readiness specs exercise and real Git steps |
| 19a.1 | Seeds are declared | slice 2 | observed: storySeed for Seed C, doneReferences seeds, story-reference-identity call sites, readiness and admission description files |
| 19a.2 | Story state is declared | slice 2 | observed: readiness storyStates through preparedAs; twoDependencies review storyStates |
| 19a.3 | Backlog membership is declared | slice 2 | observed: readiness, admission, trunkModeRepository, story-card-inspection, queueStoryC, removeQueuedStory, completion closure and sibling projects backlogs via renderPublishedBacklog |
| 19a.4 | Agent profiles are declared | slice 2 | observed: trunkModeRepository agentProfiles in dashboard/tests/support/storyReviewTrunkMode.ts |
| 19a.5 | Dependency agreements are declared | slice 2 | observed: twoDependencies and doneReferences through queuedSeedWithDependencies |
| 19a.6 | Done records are declared | slice 2 | observed: doneReferences doneRecords in dashboard/tests/storyReferenceDone.ts |
| 19b.1 | The story dependency publisher is covered | slice 2 | observed: dashboard/tests/storyDependencyFixture.ts twoDependencies returns RevisionFacts; publishMalformedDependencies removed |
| 19b.2 | The story reference publisher is covered | slice 2 | observed: dashboard/tests/storyReferenceDone.ts doneReferences; publishDoneReferences delegates to publishRevision |
| 19b.3 | The recently done publisher is covered | slice 2 | observed: dashboard/tests/recentlyDoneSessionsSidebarPage.ts sibling backlogs from renderPublishedBacklog |
| 19b.4 | The Trunk Mode review publisher is covered | slice 2 | observed: dashboard/tests/support/storyReviewTrunkMode.ts trunkModeRepository; story-review-trunk-own specs pass |
| 19b.5 | The one-shot review publisher is covered | slice 2 | observed: dashboard/tests/support/oneShotExecutionReview.ts declared remove facts |
| 19b.6 | The completion closure publisher is covered | slice 2 | observed: dashboard/tests/support/completionClosurePublication.ts declared closure backlog |
| 19b.7 | The later-story publisher is covered | slice 2 | observed: laterStoryMergesTrunk writes only later-story.txt, no planning files; backend-tests/review/story-review-completed.spec.ts passes |
| 19b.8 | `publishChangedReview` is covered | slice 2 | observed: dashboard/tests/support/startOrigin.ts changedReviewRevision replaces publishChangedReview; agent-launch-start-codex and phases specs pass |
| 20 | When a case's facts differ, the spec declares them (e.g. a story dependency spec declaring Story B waiting on Story A); backlog, seeds and agreement come from production encoders and the helper no longer writes or commits them | slice 2 | observed: story-dependencies.spec.ts declares Story A waiting on Story B via twoDependencies (renderPublishedBacklog, storySeed, recordStoryState, updateStoryDependency); twoDependencies no longer writes or commits |
| 21 | The starting repositories built through `storyReadinessCli.ts` and `admittedWork.ts` use the same shared description and materializer | slice 2 | observed: storyReadinessFixture.ts readinessRepo() and admittedWork.ts admitInvestigation call materializeRepository; storyReadinessCli.ts scratchRepo/commitAll/commitChanges removed |
| 22a | Literal malformed inputs stay literal where a readiness spec exercises them | slice 2 | observed: malformedSeed in doughnutRepository observed by story-readiness and story-readiness-gaps specs; malformed dependency block literal in story-dependencies.spec.ts test 2 |
| 22b | Stale assessments stay as they are where a readiness spec exercises them | slice 2 | observed: storyReadinessPublications.publishAssessedContentChange unchanged; expectChangedReviewAfterContentChange in story-readiness-gaps.spec.ts:95 |
| 22c | Deliberate local edits stay; an unpushed seed edit stays invisible when the dashboard reads the selected commit | slice 2 | observed: buildOpenDoughReadinessRepo writes the edit after materialization; story-readiness.spec.ts "Unpushed local edit that must stay invisible" |
| 23 | The readiness fixture declares its starting state | slice 2 | observed: dashboard/tests/storyReadinessFixture.ts module-scope descriptions openDoughReadiness and doughnutRepository |
| 24 | The admission fixture declares its published queue and arranges a local draft that stays local until the real `start --admit` publishes the commit; the dashboard shows the investigation in Taken from it | slice 2 | observed: dashboard/tests/admittedWork.ts publishedQueue + writeRevisionFiles draft without commit; taken-admitted-investigation.spec.ts Taken card owned by Yui-chan from receipt.publishedSha |
| 25 | A real `start` used only to arrange a Taken story or claim commit is replaced by a declared revision authored by the agent and committed by the developer | slice 3 |  |
| 26 | A spec whose subject is `start`, its refusal, or its resume still runs the real `start` on the materialized origin | slice 3 |  |
| 27a.1 | Story branches stay real Git operations | slice 3 |  |
| 27a.2 | Worktrees stay real Git operations | slice 3 |  |
| 27a.3 | Merges stay real Git operations | slice 3 |  |
| 27a.4 | Fast-forwards stay real Git operations | slice 3 |  |
| 27a.5 | First-parent rewrites stay real Git operations | slice 3 |  |
| 27a.6 | Held pushes stay real Git operations | slice 3 |  |
| 27a.7 | Isolation stays a real Git operation | slice 3 |  |
| 27a.8 | Older Git behaviour stays a real Git operation | slice 3 |  |
| 28 | A CI comparison or completed-story publisher takes its trunk facts from the description, then builds the commit graph it proves with Git on top | slice 3 |  |
| 29 | Migrated specs keep their verdicts and assertions, including Intent's comparison verdicts | slice 3 |  |
| 30 | Superseded dashboard helpers are removed | slice 3 |  |
| 31 | No dashboard helper calls `writeQueuedStories`; queued identities come from the shared description | slice 1 | observed: grep writeQueuedStories dashboard: no match; dashboard/tests/support/queuedStories.ts identities from storyA/storyB |
| 32 | No dashboard helper that builds a Git repository hand-writes a published planning file that the description can state | slice 2 | observed: slice 2 search; intentStoryWorktree, intentSummaryStoryComparisonShared, retainedReport and sessionsReplayProjects now use writeRevisionFiles; remaining commits are readiness journey steps, production CLI writes, real Git steps, and slice 3 claim publishers |
| 33 | The shared `writeQueuedStories` is removed only when its last consumer goes; kept for the native execution fixture | slice 3 |  |
| 34 | The story extends the existing description and materializer, adding no second one | slice 1 | observed: tests/support/repository-revision-files.mjs executable extension; no dashboard materializer |
| 35 | MakeMe owns stories and records; the harness owns Git, installation and teardown | slice 1 | observed: startOriginPreparation.ts withInstallation and commitDeclaredRevision in the harness; facts from makeMe builders |
| 36 | The description models ordered trunk revisions only | slice 1 | observed: tests/support/repositoryTestData.mjs RepositoryDescription revisions; no branch model added |
| 37 | For each case, a reviewer can name the driving repository facts from its call site or fixture file | slice 3 |  |
