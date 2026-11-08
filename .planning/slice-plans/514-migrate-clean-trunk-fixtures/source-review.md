# Source review: SEED-262#migrate-clean-trunk-fixtures

Reviewer: a fresh general-purpose agent with no conversation inheritance,
launched 2026-11-08 by the execution coordinator before slice 1 delegation.
Input: only the selected story's Goal, Scope, Key examples and Evaluation,
extracted verbatim from
[the seed section](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-clean-trunk-fixtures)
into one file; no plan, product, proof or slice scope. Instruction: use only
that input, change nothing, return numbered commitments with compound items
split and exclusions listed.

Exclusions returned: X1 queued and preparation trunks; X2 one-shot payload
installation; X3 dashboard start origins; X4 Node backlog repositories; X5
shell and native fixtures; X6 caching beyond per-process reuse; X7 no general
branch or merge model.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer reading a publication, delivery, closure, Dough Land or CI skill test can see, at its call site, which repository facts drive the case. | slice 5 | |
| 1a.1 | Those driving facts include the trunk's files and revisions. | slice 5 | |
| 1a.2 | Those driving facts include the unpublished increment that the workspace publishes. | slice 5 | |
| 1a.3 | Those driving facts include the commit identities that the product reads. | slice 5 | |
| 2 | The story moves the existing repository setups onto the shared repository description (`tests/support/repository-fixture.mjs`). Today these setups are: `createCleanTrunkFixture`, which silently supplies a `trunk.txt` base commit, an `exec/story` worktree with one `increment.txt` commit, and fixed "Integration Checkout"/"Execution Worktree" identities, and which about 70 test files use through the managed delivery, trunk closure and closure Git fixtures; about ten skill fixture modules that each run `git init`; and six test files that each run `git init`. | slice 5 | |
| 3 | Skill test feedback must not get slower. | slice 5 | |
| 4 | Extend the shared repository description with an execution workspace. | slice 1 | observed: tests/support/repositoryTestData.mjs withWorkspace/withUnpublishedRevision; tests/support/repository-fixture.test.mjs 'a workspace suffix is committed on its branch…' |
| 4a.1 | The execution workspace is a named branch. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts execution branch --show-current = exec/story |
| 4a.2 | The branch starts from a named trunk revision. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts HEAD^ of workspace = trunk revision 'start' |
| 4a.3 | The branch holds ordered unpublished revisions. | slice 1 | observed: execution-increment-publication-reconciliation.test.mjs multi-commit case declares two ordered unpublished revisions |
| 5 | Each workspace revision states the same facts that trunk revisions state. | slice 1 | observed: tests/support/repositoryTestData.mjs withUnpublishedRevision takes RevisionFacts like withRevision |
| 5a.1 | Each revision states its files. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts diff A increment.txt / D trunk.txt |
| 5a.2 | Each revision states its message. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts subject 'verified increment' |
| 5a.3 | Each revision states its author. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts author Suffix Author |
| 5a.4 | Each revision states its committer. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts committer Workspace Developer |
| 6 | `.please()` still returns plain data. | slice 1 | observed: tests/support/repositoryTestData.mjs please() returns plain objects (workspace.revisions copied) |
| 7 | The materializer adds the workspace worktree beside the integration checkout. | slice 1 | observed: tests/support/repository-fixture.mjs buildTemplate worktree add <fixture>/execution; tests/support/repository-fixture.test.mjs worktree list per copy |
| 8 | The materializer commits the workspace revisions without pushing. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts origin cat-file -e candidate rejects and origin holds only refs/heads/trunk |
| 9 | The materializer returns the commit for each revision. | slice 1 | observed: tests/support/repository-fixture.test.mjs asserts revisions.start = trunkSha, revisions.increment = candidateSha |
| 10 | Route `createCleanTrunkFixture` through the description and the materializer. | slice 1 | observed: src/skills/dough-execute-plan/scripts/publication-clean-trunk-fixtures.mjs createCleanTrunkFixture returns materializeRepository(description) |
| 11 | Route the fixtures layered on `createCleanTrunkFixture` through the description and the materializer. | slice 3 | observed: slice 3 177-file consumer run passed after the clean-trunk default changed (/Users/terryyin/.claude/jobs/c14a6183/tmp/s3-run.txt) |
| 11a.1 | The managed delivery fixture. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs createManagedFixture({ description }) → createCleanTrunkFixture(description); managed delivery tests pass (slice 2 163-file run) |
| 11a.2 | The managed delivery owner fixture. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs createManagedFixture({ description }) → createCleanTrunkFixture(description); owner tests take the description through createManagedFixture and pass |
| 11a.3 | The managed delivery transport fixture. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs createManagedFixture({ description }) → createCleanTrunkFixture(description); transport tests take the description through createManagedFixture and pass |
| 11a.4 | The fresh delivery fixture. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs createManagedFixture({ description }) → createCleanTrunkFixture(description); fresh delivery tests take the description through createManagedFixture and pass |
| 11a.5 | The trunk closure fixture. | slice 3 | observed: src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs createTrunkClosureFixture(t, { description }); trunk-closure.test.mjs declares trunk.txt |
| 11a.6 | The closure owner fixture. | slice 3 | observed: src/skills/dough-story-wrap-up/scripts/trunk-closure-owner-test-fixtures.mjs closureBelowToplevel(t, coordinator, { description }); G2 |
| 11a.7 | The closure Git fixture. | slice 3 | observed: src/skills/dough-story-wrap-up/scripts/closure-git-fixtures.mjs agentStoryBehindTrunk(t, description) |
| 11a.8 | The source freshness fixture. | slice 3 | observed: src/skills/dough-execute-plan/scripts/source-freshness-test-fixtures.mjs takenStoryBranch description (pre-Take trunk, take revision, exec/story workspace); source-freshness tests pass |
| 11a.9 | The racing-suffix backlog fixture. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-racing-suffix-fixtures.mjs createBacklogSuffixFixture(ownedBacklog) materializes a description |
| 12 | The publication family's fixture module names a shared description: a trunk with one unpublished increment. | slice 1 | observed: src/skills/dough-execute-plan/scripts/publication-clean-trunk-fixtures.mjs exports trunkWithOneUnpublishedIncrement |
| 13 | A case that reads a fact of the trunk or increment declares that fact at its call site. | slice 5 | |
| 13a.1 | This applies when the case reads a file name. | slice 5 | |
| 13a.2 | This applies when the case reads file content. | slice 5 | |
| 13a.3 | This applies when the case reads an identity. | slice 5 | |
| 14 | Published planning facts in this family come from the canonical builders and the production encoders. Examples are the backlog, story state and done records used by the completed-identity, done-catalog and Dough Land completion cases. | slice 3 | observed: dough-land-completion.test.mjs and dough-land-retained.test.mjs (backlog via makeMe.aBacklogEntry, agentProfiles fact); publication-completed-identity trunkWithBacklogAt; published-done-branches.mjs done records via doneRecords fact; G3 proved |
| 15 | Qualification: exact malformed or legacy bytes that are under proof stay literal. | slice 3 | observed: publication-completed-identity legacy backlog and empty catalog, racing-suffix and source-freshness entry bytes stay literal |
| 16 | Route the other skill fixtures that make their own starting repository through the description. | slice 5 | |
| 16a.1 | CI path applicability. | slice 4 | |
| 16a.2 | Revision coverage. | slice 4 | |
| 16a.3 | Integrated-state judge. | slice 4 | |
| 16a.4 | Consumer trace. | slice 5 | |
| 16a.5 | Repair stash. | slice 4 | |
| 16a.6 | Worktree preparation. | slice 5 | |
| 16a.7 | The worktree preparation wrapper. | slice 5 | |
| 16a.8 | Default checkout. | slice 5 | |
| 16a.9 | Target-branch worktree. | slice 4 | |
| 16a.10 | Installed checkouts. | slice 4 | |
| 16a.11 | Preparation publication. | slice 5 | |
| 17 | Migrate the inline starting repositories in the six skill tests that run `git init`. | slice 5 | |
| 18 | CI workflow text, lockfiles and project configuration that a case proves are declared files with their exact bytes. | slice 4 | |
| 18a.1 | CI workflow text. | slice 4 | |
| 18a.2 | Lockfiles. | slice 5 | |
| 18a.3 | Project configuration. | slice 5 | |
| 19 | The following stay harness layers added to the materialized checkout and are not description facts. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs installManagedDelivery unchanged, applied to the materialized checkout |
| 19a.1 | Installed skills. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs installManagedDelivery unchanged, applied to the materialized checkout (deploySkill) |
| 19a.2 | The controlled CI adapter. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs installManagedDelivery unchanged, applied to the materialized checkout (controlled CI adapter) |
| 19a.3 | Mailbox storage. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs installManagedDelivery unchanged, applied to the materialized checkout (mailbox storage) |
| 19a.4 | Ignored local configuration. | slice 2 | observed: src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs installManagedDelivery unchanged, applied to the materialized checkout (.planning/open-dough.json, info/exclude) |
| 20 | The following stay real Git operations in the helper or test. | slice 5 | |
| 20a.1 | Competing pushes. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs other writer advance via advanceOriginFromAnotherWriter |
| 20a.2 | Rejected publications. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs 'a rejected push is reconciled once onto the other writer's commit…' |
| 20a.3 | Rebases. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs rebase by the publisher stays Git |
| 20a.4 | Merges. | slice 3 | observed: src/skills/dough-story-wrap-up/scripts/closure-story-integration*.test.mjs merges stay Git; publication-completed-identity manualMerge |
| 20a.5 | Ongoing merge or rebase states. | slice 1 | observed: publication-checkout-ongoing-operation.test.mjs keeps merge/rebase states as Git; passed in slice 1 run |
| 20a.6 | Stashes. | slice 4 | |
| 20a.7 | Dirty and untracked files. | slice 4 | |
| 20a.8 | Submodules. | slice 4 | |
| 20a.9 | Locked or removed worktrees. | slice 4 | |
| 20a.10 | Maintenance states. | slice 5 | |
| 21 | Remove a superseded helper or root builder once no consumer needs it. | slice 5 | |
| 22 | Qualification: `ownedWorktreeOnly` and `advanceOriginFromAnotherWriter` keep their behavior for the native owned-context fixture, which loads them. | slice 5 | |
| 23 | Boundary assumption: execution starts after the shared repository builder has landed `makeMe.aRepository` and its materializer on trunk. | slice 1 | observed: tests/support/repository-fixture.mjs/tests/support/repositoryTestData.mjs landed on trunk before this execution (dependency resolution d2c6bf368) |
| 24 | This story extends that description and materializer; it does not add a second one. | slice 1 | observed: src/skills/dough-execute-plan/scripts/publication-clean-trunk-fixtures.mjs uses materializeRepository; no second materializer |
| 25 | The description gains only a linear unpublished suffix. | slice 1 | observed: tests/support/repositoryTestData.mjs single withWorkspace, linear withUnpublishedRevision list |
| 26 | Example, clean-trunk publication: `publication.test.mjs` names the shared description, which has one trunk commit and a workspace with one unpublished increment. | slice 1 | observed: src/skills/dough-execute-plan/scripts/publication.test.mjs declares trunkWithOneIncrement via makeMe.aRepository |
| 26a.1 | The origin's `main` is the trunk commit. | slice 1 | observed: src/skills/dough-execute-plan/scripts/publication.test.mjs existing origin/main === trunkSha assertions; tests/support/repository-fixture.test.mjs origin ref = trunkSha |
| 26a.2 | The workspace branch is one commit ahead and absent from the origin. | slice 1 | observed: tests/support/repository-fixture.test.mjs origin lacks candidate, HEAD^ = trunk |
| 26a.3 | Publication is accepted as it is today. | slice 1 | observed: src/skills/dough-execute-plan/scripts/publication.test.mjs all cases pass unchanged in slice 1 run |
| 27 | Example, committer under proof: the closure agent-credit test declares, at its call site, the developer who commits in the workspace. | slice 3 | observed: src/skills/dough-story-wrap-up/scripts/closure-story-integration-agent-credit.test.mjs declares workspaceDeveloper as the workspace checkoutIdentity |
| 27a.1 | The merge still credits that developer once. | slice 3 | observed: src/skills/dough-story-wrap-up/scripts/closure-story-integration-agent-credit.test.mjs '…authored by the agent and credits the developer once' passes |
| 27a.2 | No assertion depends on an identity that only a fixture module states. | slice 3 | observed: clean-trunk default carries no fixed identity; 177-file run passed |
| 28 | Example, product facts: the completed-identity test declares Story A as Taken in its trunk's backlog through MakeMe. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-completed-identity.test.mjs bothTaken(file) = trunkWithBacklogAt(file, { backlog: { taken: [storyA, storyB] } }) |
| 28a.1 | The real backlog `complete` still runs on the materialized checkout. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-completed-identity.test.mjs manualMerge runs real complete on the materialized checkout |
| 28a.2 | The done record that the test asserts is unchanged. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-completed-identity.test.mjs A#A done-record assertion unchanged, passes |
| 29 | Example, literal configuration: a path applicability test declares its exact `ci.yml` text as a trunk file, and its classification is unchanged. | slice 4 | |
| 30 | Example, Git under proof: a racing-suffix test takes its trunk and owned backlog suffix from the description. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-racing-suffix-fixtures.mjs trunk backlog A–D and owned backlog suffix from description |
| 30a.1 | The other writer's advance, the rejected push and the rebase stay in the test. | slice 3 | observed: src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs advance, rejected push and rebase stay in the test |
| 30a.2 | The repair-stash test's stash entries and dirty submodule stay Git operations. | slice 4 | |
| 31 | Example, superseded setup removed: no non-native test calls `createCleanTrunkFixture`. | slice 5 | |
| 31a.1 | No non-native test keeps its own `git init` for a starting repository. | slice 5 | |
| 31a.2 | The native owned-context fixture still runs, with unchanged helper behavior. | slice 5 | |
| 32 | Migrated tests keep their verdicts and assertions. | slice 5 | |
| 33 | A reviewer can name each case's driving repository facts from its call site or its fixture module. | slice 5 | |
| 34 | Record focused run times before and after the change, under comparable load. | slice 5 | |
| 34a.1 | Record them for the managed delivery family. | slice 5 | |
| 34a.2 | Record them for the closure family. | slice 5 | |
| 35 | Those run times must not regress beyond run-to-run noise. | slice 5 | |
