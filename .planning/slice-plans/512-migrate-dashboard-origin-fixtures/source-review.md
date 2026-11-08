# Source review: Build dashboard test repositories from explicit MakeMe data

Launch: a fresh general-purpose sub-agent with no conversation inheritance,
started by the execution coordinator before slice 1 delegation (2026-11-08).
Input: only the story's Goal, Scope, Key examples, Evaluation and Architecture
text from
[the seed section](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-dashboard-origin-fixtures),
with instructions to read no project files, change nothing, and return
numbered commitments, examples and exclusions without slicing or acceptance.
No plan, return, product or proof was supplied. Compound items are split as
returned (8a, 18a, 19a, 21a, 26a, 51a); the parent rows 8, 18, 19, 21, 26
and 51 only introduced those lists.

Reviewer notes: the counts dated 2026-11-08 and the 115 ms / 95 ms timing
figures are context, not thresholds. "Default origin" in 51a.1 and 51a.2 may
mean the empty default or the default `origin` fixture with Stories A and B.
Exclusions returned: clean-trunk, Node and shell fixtures (sibling stories);
cross-description caching (faster Git fixture construction); no branch or
merge model; no second materializer; the shared writer stays while a native
fixture uses it; real `start` stays where it is the subject; readiness keeps
literal malformed, stale and local inputs; the admission draft stays local;
installed skills are not domain facts; no native evidence change.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer reading a dashboard journey or backend spec can see which repository facts its fixture starts with | slice 3 | |
| 2 | From the same spec, a maintainer can see which later commits the fixture adds | slice 3 | |
| 3 | Start origins state their starting facts through the shared repository description | slice 1 | observed: dashboard/tests/support/startOrigin.ts startOrigin(description) and the seven fixture files pass a description; 827-case focused run of 352 importing specs passed |
| 4 | Start-origin publishers state their starting facts through the shared repository description | slice 2 | |
| 5 | The standalone readiness and admission fixtures state their starting facts through the shared repository description | slice 2 | |
| 6 | Dashboard test feedback does not get slower |  | G3 |
| 7 | `startOrigin` accepts a MakeMe repository description | slice 1 | observed: dashboard/tests/support/startOrigin.ts startOrigin(description = makeMe.aRepository.please(), options) |
| 8a.1 | With no description, `startOrigin` holds exactly one commit | slice 1 | observed: dashboard/backend-tests/launches/start-origin-default.spec.ts: rev-list count 1, installed SKILL.md present, .planning holds only PRODUCT-BACKLOG.md, installed adopt --all reports 0 active entries |
| 8a.2 | With no description, `startOrigin` holds an empty but valid product backlog | slice 1 | observed: dashboard/backend-tests/launches/start-origin-default.spec.ts: rev-list count 1, installed SKILL.md present, .planning holds only PRODUCT-BACKLOG.md, installed adopt --all reports 0 active entries |
| 8a.3 | With no description, `startOrigin` holds the installed skills | slice 1 | observed: dashboard/backend-tests/launches/start-origin-default.spec.ts: rev-list count 1, installed SKILL.md present, .planning holds only PRODUCT-BACKLOG.md, installed adopt --all reports 0 active entries |
| 9 | Every call site and origin fixture that relies on the queued stories passes the shared two-Ready-queued-stories description from the shared repository builder, not a dashboard copy | slice 1 | observed: every startOrigin call site passes queuedReadyRepository().please() from tests/support/queued-repository.mjs; fixtures use queuedOriginRepository built from it; 827-case focused run passed |
| 10 | Each Playwright fixture states its description in its own fixture file | slice 1 | observed: each of the seven fixture files declares originRepository: queuedOriginRepository (Stories A and B queued and Ready, overridable with test.use) from dashboard/tests/support/startOrigin.ts |
| 11 | A spec that needs different facts overrides the fixture's description with `test.use` |  | G1 |
| 12 | Installed skills remain a harness layer, not a domain fact in the description | slice 1 | observed: dashboard/tests/support/startOriginPreparation.ts withInstallation adds .gitignore and skills to the first revision in the harness; MakeMe description unchanged |
| 13 | The harness adds the installed skills to the description's first commit; the origin keeps one root commit holding stories and skills together | slice 1 | observed: slice 1 first-commit comparison: one commit by Dashboard Developer, all 705 old ls-tree entries identical incl. 100755 modes, only trunk.txt added |
| 14 | The installed skills still come from the current run's working-tree source | slice 1 | observed: dashboard/backend-tests/launches/start-origin-isolation.spec.ts successive preparations install current working-tree source |
| 15 | Global setup keeps its run-wide preparation, once per installation layout per run from the named shared descriptions in use | slice 1 | observed: startOriginArtifacts() per layout x {default, queued}; start-origin-demand.spec.ts started keys and start-origin-isolation.spec.ts prepared snapshot unchanged |
| 16 | Each test copies the prepared origin as it does today | slice 1 | observed: initializeStartOrigin cpSync per test unchanged; start-origin-isolation.spec.ts distinct pack inodes |
| 17 | A description not prepared run-wide is materialized through the shared materializer's per-process reuse on top of the same installed skills |  | G2 |
| 18a.1 | Helpers that hand-write published seeds declare them through the description instead | slice 2 | |
| 18a.2 | Helpers that hand-write published story state declare it through the description instead | slice 2 | |
| 18a.3 | Helpers that hand-write published backlog membership declare it through the description instead | slice 2 | |
| 18a.4 | Helpers that hand-write published agent profiles declare them through the description instead | slice 2 | |
| 18a.5 | Helpers that hand-write published dependency agreements declare them through the description instead | slice 2 | |
| 18a.6 | Helpers that hand-write published done records declare them through the description instead | slice 2 | |
| 19a.1 | The story dependency publisher is migrated | slice 2 | |
| 19a.2 | The story reference publisher is migrated | slice 2 | |
| 19a.3 | The recently done publisher is migrated | slice 2 | |
| 19a.4 | The Trunk Mode review publisher is migrated | slice 2 | |
| 19a.5 | The one-shot review publisher is migrated | slice 2 | |
| 19a.6 | The completion closure publisher is migrated | slice 2 | |
| 19a.7 | The later-story publisher is migrated | slice 2 | |
| 19a.8 | `publishChangedReview` is migrated | slice 2 | |
| 20 | The starting repositories built through `storyReadinessCli.ts` and `admittedWork.ts` use the same shared description and materializer | slice 2 | |
| 21a.1 | Malformed inputs stay literal where a readiness spec exercises them | slice 2 | |
| 21a.2 | Stale assessments stay literal where a readiness spec exercises them | slice 2 | |
| 21a.3 | Deliberate local edits stay literal where a readiness spec exercises them; an unpushed seed edit stays invisible when the dashboard reads the selected commit | slice 2 | |
| 22 | In the admission fixture the draft stays local; the real `start --admit` publishes the commit the dashboard reads | slice 2 | |
| 23 | The admission fixture declares its published queue in the description | slice 2 | |
| 24 | A real `start` that only arranges a Taken story or claim commit is replaced by a declared revision with the agent as author and the developer as committer | slice 3 | |
| 25 | A spec whose subject is `start`, its refusal, or its resume still runs the real `start` on the materialized origin | slice 3 | |
| 26a.1 | Story branches stay real Git operations | slice 3 | |
| 26a.2 | Worktrees stay real Git operations | slice 3 | |
| 26a.3 | Merges stay real Git operations | slice 3 | |
| 26a.4 | Fast-forwards stay real Git operations | slice 3 | |
| 26a.5 | First-parent rewrites stay real Git operations | slice 3 | |
| 26a.6 | Held pushes stay real Git operations | slice 3 | |
| 26a.7 | Isolation stays a real Git operation | slice 3 | |
| 26a.8 | Older Git behaviour stays a real Git operation | slice 3 | |
| 27 | A CI comparison or completed-story publisher takes its trunk facts from the description and builds the commit graph it proves with Git on top | slice 3 | |
| 28 | Intent's comparison verdicts do not change | slice 3 | |
| 29 | Superseded dashboard helpers are removed | slice 3 | |
| 30 | No dashboard helper calls `writeQueuedStories` | slice 1 | observed: grep writeQueuedStories dashboard: no match |
| 31 | The dashboard gets the queued story identities from the shared description | slice 1 | observed: dashboard/tests/support/queuedStories.ts queuedIdentity = storyA.identity, otherQueuedIdentity = storyB.identity |
| 32 | No dashboard helper hand-writes a published planning file that the description can state | slice 2 | |
| 33 | The shared `writeQueuedStories` writer is removed once its last consumer is gone | slice 3 | |
| 34 | The story extends the existing shared description and materializer, adding no second one and no dashboard-specific copy | slice 1 | observed: tests/support/repository-revision-files.mjs executable extension; tests/support/repository-fixture.test.mjs described executable file keeps its mode |
| 35 | MakeMe owns stories and records; the harness owns Git, installation and teardown | slice 1 | observed: dashboard/tests/support/startOriginPreparation.ts withInstallation adds .gitignore and skills to the first revision in the harness; MakeMe description unchanged |
| 36 | The description holds only ordered trunk revisions | slice 1 | observed: dashboard/tests/support/startOriginPreparation.ts withInstallation adds .gitignore and skills to the first revision in the harness; MakeMe description unchanged |
| 37 | A backend spec calls `startOrigin()` with no description; the checkout has one commit with the installed skills and an empty valid backlog, and no story is queued | slice 1 | observed: dashboard/backend-tests/launches/start-origin-default.spec.ts: rev-list count 1, installed SKILL.md present, .planning holds only PRODUCT-BACKLOG.md, installed adopt --all reports 0 active entries |
| 38 | The `origin` fixture in `startOriginTest.ts` names the shared description of Stories A and B queued, refined, planned and Ready | slice 1 | observed: dashboard/tests/support/startOriginTest.ts originRepository = queuedReadyRepository(); publishing consumers (session-unread-report, done-question) passed with unchanged assertions in the 827-case run |
| 39 | A spec that publishes that origin still shows both cards Ready, with unchanged assertions | slice 1 | observed: dashboard/tests/support/startOriginTest.ts originRepository = queuedReadyRepository(); publishing consumers (session-unread-report, done-question) passed with unchanged assertions in the 827-case run |
| 40 | That prepared origin still comes from global setup, and the test copies it as before | slice 1 | observed: startOriginArtifacts() per layout x {default, queued}; start-origin-demand.spec.ts started keys and start-origin-isolation.spec.ts prepared snapshot unchanged |
| 41 | A story dependency spec declares Story B waiting on Story A in its description | slice 2 | |
| 42 | That origin's backlog, seeds and agreement come from production encoders | slice 2 | |
| 43 | The helper no longer writes or commits those files itself | slice 2 | |
| 44 | A preparation-resume spec still runs the real `start` on the materialized origin | slice 3 | |
| 45 | A CI comparison fixture that needs only Story A Taken declares the claim revision (agent author, developer committer) and runs no `start` | slice 3 | |
| 46 | A later fast-forward comparison declares its trunk stories, then makes its story branch, merge and first-parent rewrite with Git | slice 3 | |
| 47 | The readiness fixture declares its starting state | slice 2 | |
| 48 | The dashboard shows the admitted investigation in Taken, read from the commit the real `start --admit` published | slice 2 | |
| 49 | Migrated specs keep their verdicts and assertions | slice 3 | |
| 50 | For each case, a reviewer can name the driving repository facts from the call site or fixture file | slice 3 | |
| 51a.1 | Focused run times recorded before and after under comparable load for one Playwright journey family that uses the default origin | slice 3 | |
| 51a.2 | Focused run times recorded before and after under comparable load for one backend family that uses the default origin | slice 3 | |
| 51a.3 | Focused run times recorded before and after under comparable load for the standalone readiness specs | slice 2 | |
| 51a.4 | Focused run times recorded before and after under comparable load for the standalone admission specs | slice 2 | |
| 52 | None of those timings regresses beyond run-to-run noise | slice 3 | |
| 53 | Native evidence does not change, and the story needs no paid native run | slice 3 | |
