# Source review

Launched 2026-11-08 by the coordinator as a fresh general-purpose agent (no conversation inheritance). Input: only the story's Goal, Scope, Key examples and Evaluation from [the seed](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-backlog-scratch-repositories), extracted to a job-temp file; the reviewer was told to read no other project files and change nothing. Returned exclusions X1–X9 restate the story's scope limits and are not commitments.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer reading a `tests/support` Node test that needs Git can see, at its call site, which repository facts drive the case. | slice 5 | |
| 1.1 | The facts that drive the case include the published backlog. | slice 1 | observed: tests/support/product-backlog-git-merge.test.mjs call sites declare backlog via makeMe.aRepository.withRevision(ancestor,{backlog}) |
| 1.2 | They include done records. | slice 2 | observed: done-catalog tests call doneRecord(name,{completedAt,developer}) at call sites (e.g. done-catalog-agent-credit.test.mjs agentWorkspaceReplay) |
| 1.3 | They include agent profiles. | slice 2 | observed: merge-live-profile.test.mjs declares profiles via makeMe.anAgentProfile and completedBy(profile); takeAndCommit writes anAgentProfile |
| 1.4 | They include seeds. | slice 3 | observed: identity-evidence-fixture.mjs projectWithRemovedAllocation declares activeSeeds and SEED-090 seed as files; done-record SEED-200 test declares its seed |
| 1.5 | They include the ordered revisions the product reads. | slice 5 | |
| 1.6 | They include the developer and committer the product credits. | slice 3 | observed: product-backlog-complete-credit.test.mjs declares .withCheckoutIdentity(terryYin) where developer is asserted |
| 2 | Today `scratchRepo` commits the starting backlog as "Test", and `gitWorkspace` configures "Terry Yin" as the developer by default (current state to be replaced by call-site declaration). | slice 3 | observed: grep: no Terry Yin in tests/support fixtures; gitWorkspace removed; scratchRepo removed (slice 1) |
| 3 | Done record tests assert the developer name although only the fixture states it (current problem to remove). | slice 3 | observed: product-backlog-complete-credit.test.mjs: the 3 developer-asserting tests declare terryYin; renaming it failed exactly those 3 (implementer check) |
| 4 | Setup helpers that run the real `complete` or `take` are called 33 times to arrange done records and profiles for cases whose subject is a merge, rebase or cherry-pick (current problem to remove). | slice 2 | observed: grep of done-catalog fixture and 5 tests: only catalog-done in assertCatalogDoneAgrees (observation), no complete/take in setup |
| 5 | The story moves these repositories onto the shared repository description (`tests/support/repository-fixture.mjs`). | slice 5 | |
| 6 | Node test feedback must not get slower. | slice 5 | |
| 7 | Route the starting repository of each `tests/support` Node test that makes one through the shared description and materializer. | slice 5 | |
| 7.1 | `scratchRepo` in the backlog Git fixture (43 calls in 18 merge, rebase, cherry-pick, done-catalog and driver tests) is routed through it (as of 2026-11-08). | slice 1 | observed: grep: no scratchRepo in tests/support; 42 call sites in 18 files use checkoutOf -> materializeLocalCheckout (plan's 43 was a miscount) |
| 7.2 | `gitWorkspace` in the done fixture (7 calls in the done-record, intent-coverage and identity evidence tests) is routed through it. | slice 3 | observed: grep gitWorkspace tests/support: none; its 7 calls use checkoutOf -> materializeLocalCheckout |
| 7.3 | `committedLintFixture` (4 test files) is routed through it. | slice 4 | |
| 7.4 | The local-test-suite `fixture` (2) is routed through it. | slice 4 | |
| 7.5 | The later-trunk `trunk` and `trunkOf` (2) are routed through it. | slice 5 | |
| 7.6 | The inline repository in `requested-revision-ci-status.test.mjs` is routed through it. | slice 5 | |
| 8 | Arrangement backlogs come from `aBacklogEntry` and the production backlog encoder. | slice 1 | observed: linkedEntry/entries build makeMe.aBacklogEntry; repository-revision-files.mjs renders via renderPublishedBacklog |
| 9 | The near-future direction paragraph becomes a backlog fact when a case reads it. | slice 1 | observed: direction stated at each call site (e.g. merge.test.mjs, rebase-onto originalDirection) |
| 10 | `backlogOf` stays the independently written byte expectation and is no longer the arrangement. | slice 1 | observed: assertions unchanged (no assert lines in diff); backlogOf/item/items remain expectations |
| 11 | Exact malformed or legacy lines under proof (such as an entry with no link) stay literal file bytes. | slice 1 | observed: legacy link-only lines stay literal in expectations and branch commits; linkedEntry renders identical bytes |
| 12 | The configured developer, the committer and an agent author are declared at the call site when the product reads them. | slice 3 | observed: developer declared via withCheckoutIdentity at call sites (done-record, agent-credit tests) |
| 13 | Arrange a transition directly when the test does not prove it. | slice 2 | observed: completeAndCommit/completingBranch commit declared records; 5-file scripts/test.sh run exit 0 |
| 13.1 | A done record and catalog come from `aDoneRecord`, `renderDoneRecord` and the catalog derivation instead of running `complete` in setup. | slice 2 | observed: completeAndCommit: makeMe.aDoneRecord + writeRevisionFiles(renderDoneRecord) + production rebuildDoneCatalog |
| 13.2 | A profile comes from `anAgentProfile` instead of running `take` in setup. | slice 2 | observed: takeAndCommit writes anAgentProfile through writeRevisionFiles; no take CLI |
| 13.3 | A case whose subject is one of those commands still runs it for real. | slice 2 | observed: assertCatalogDoneAgrees still runs real catalog-done where the case proves it |
| 14 | Branches, merges, rebases, cherry-picks, conflicts, linked worktrees, ongoing operation states and staged or unstaged changes stay Git operations in the test. | slice 5 | |
| 15 | The file content of those Git-operation cases comes from MakeMe or literal bytes, as the starting revision's does. | slice 5 | |
| 16 | Copied runner and lint tooling, linked dependencies, the merge driver registration and an init without templates are harness layers or materializer options, not description facts. | slice 4 | |
| 17 | The sample files a lint or suite case checks are declared files with their exact bytes. | slice 4 | |
| 18 | Remove a superseded helper or root builder once no consumer needs it. | slice 5 | |
| 19 | Boundary assumption: execution starts after the shared repository builder lands `makeMe.aRepository` and its materializer on trunk. | slice 1 | observed: dependency satisfied at 0eb86657b; materializeRepository on trunk |
| 20 | This story extends that description and materializer rather than adding a second one. | slice 5 | |
| 21 | Example 1, merge under proof: a backlog merge test declares a trunk whose backlog holds Items A and B Taken and Item C queued, commits the `close-a` and `close-b` branches with Git, and runs the real merge. | slice 1 | observed: product-backlog-git-merge.test.mjs 'merge resolves concurrent sibling closures' declares A,B Taken, C queued; close-a/close-b via commitBranch; real run() |
| 21.1 | The merged bytes still equal the `backlogOf` expectation. | slice 1 | observed: same test: repo.read() equals backlogOf([], [itemC]); scripts/test.sh 18 files pass |
| 21.2 | The verdict is unchanged. | slice 1 | observed: same test verdict code 0 unchanged; 18-file run exit 0 |
| 22 | Example 2, developer under proof: the done-record test declares Terry Yin as the configured developer at its call site. | slice 3 | observed: product-backlog-complete-credit.test.mjs 'complete credits the execution agent' declares terryYin |
| 22.1 | The real `complete` records Terry Yin. | slice 3 | observed: same test deep-equals record developer 'Terry Yin'; 25-file scripts/test.sh run exit 0 |
| 22.2 | No fixture default supplies that name. | slice 3 | observed: no fixture file contains Terry Yin; GIT_CONFIG_GLOBAL=/dev/null in isolatedGit |
| 23 | Example 3, transition declared: a done-catalog rebase case declares a `feature` branch holding Story B's done record, completed at 2026-10-05, and the rebuilt catalog. | slice 2 | observed: done-catalog-agent-credit.test.mjs agentWorkspaceReplay: feature branch holds doneRecord B completedAt 2026-10-05 plus rebuilt catalog |
| 23.1 | No `complete` runs during setup. | slice 2 | observed: same setup runs no complete CLI (grep result) |
| 23.2 | The real rebase still adds the same catalog commit as the agent. | slice 2 | observed: done-catalog-agent-credit.test.mjs unchanged assertion: catalog commit authored Yui-chan; passes |
| 23.3 | The real rebase still credits the developer once. | slice 2 | observed: same test unchanged assertion: Dana Developer credited once in Co-authored-by; passes |
| 24 | Example 4, history the product reads: the identity evidence case declares three revisions. | slice 3 | observed: identity-evidence-fixture.mjs projectWithRemovedAllocation declares three named revisions |
| 24.1 | "Active work" holds the active seeds. | slice 3 | observed: 'Active work' revision holds SEED-073/074 seeds and backlog |
| 24.2 | "Allocate SEED-090" adds its seed and done record. | slice 3 | observed: 'Allocate SEED-090' adds seed file and SEED-090#x_y done record |
| 24.3 | "Clean up SEED-090" removes both. | slice 3 | observed: 'Clean up SEED-090' removes seed and record paths |
| 24.4 | The evidence still names the allocating revision. | slice 3 | observed: identity-evidence.test.mjs asserts highest.commit === revisions['Allocate SEED-090']; passes |
| 25 | Example 5, harness layer and literal files: a lint file-set test declares its sample programs with exact bytes. | slice 4 | |
| 25.1 | The runner files and linked dependencies are added by the harness. | slice 4 | |
| 25.2 | The pre-commit hook test still stages its change with Git. | slice 4 | |
| 26 | Example 6, ancestry under proof: `trunkOf(count)` declares its landing and later revisions. | slice 5 | |
| 26.1 | `trunk()` declares the landing and first later revision, then builds the side branch, the merge and the last two revisions with Git. | slice 5 | |
| 26.2 | The forward walk's verdicts are unchanged. | slice 5 | |
| 27 | Example 7, superseded setup removed: no `tests/support` Node test keeps its own `git init` for a starting repository. | slice 5 | |
| 27.1 | No such test runs `complete` or `take` in setup unless it proves that command. | slice 5 | |
| 28 | Evaluation: migrated tests keep their verdicts and assertions. | slice 5 | |
| 29 | A reviewer can name each case's driving repository facts from its call site. | slice 5 | |
| 30 | Record focused run times before and after, under comparable load, for the backlog Git family and the lint-runner family. | slice 4 | |
| 31 | Run times must not regress beyond run-to-run noise. | slice 5 | |
