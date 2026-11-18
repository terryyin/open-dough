# Repository test data

Git starting state for tests, declared through the shared `makeMe` entry that
[Test data architecture](test-data-architecture.md) introduces.

Declare the Git state your test starts from with
`makeMe.aRepository.withRevision(name, facts).please()`. Name the revisions and
state the files, refs, and workspace facts that matter. Extend the shared
builder when it cannot express a starting fact your test needs. Let the fixture
materialize and clean up the repository. Use its named commit IDs when available.
Keep Git actions under test and their observations visible in the case.
[Named revisions in a review test](../../dashboard/backend-tests/review/story-review-stored-runs.spec.ts)

Pass the description as `originRepository` to a dashboard fixture that accepts
it. Use `materializeRepository` for a bare origin and checkout, or
`materializeLocalCheckout(t, description)` for a checkout without a remote.
Both materializers return commit IDs in `revisions`; a dashboard case reads
one as `origin.revision(name)` from its start origin, whether prepared, private
or kept. For merged starting
history, list earlier `parents` in Git order. Files inherit from the first
parent, and the revision states the resolved changes.
[Builder](support/repositoryTestData.mjs) ·
[Repository harness](support/repository-fixture.mjs)

Each caller gets its own mutable copy. To reuse a leading history across
workers, prepare it with `prepareRepositorySnapshot` and register it with
`registerPreparedPrefix`.
`commitDeclaredRevision` adds a later revision to an existing checkout with
the same author, committer and message defaults.
[Revision commit](support/repository-revision-commit.mjs)

A description can also name its trunk branch (`withTrunkBranch`, default
`main`), the integration checkout's committer (`withCheckoutIdentity`), and
one execution workspace: `withWorkspace(branch, { from, checkoutIdentity })`
with ordered `withUnpublishedRevision` commits. The materializer adds that
workspace as an `execution` worktree with its own committer and commits its
revisions without pushing; `candidateSha` names its tip. A start origin
instead checks it out as the linked worktree `.worktrees/<slug>` on its
branch, and a case reads it and its named revisions through
`origin.revision(name)` or `storyWorktree(origin)`. A trunk revision stating
`fetched: false` is published, but a start origin leaves the checkout's trunk
and tracking ref on the revision before it.
`withLocalState(description, { staged, unstaged, untracked, ignored, modes })`
states what the workspace leaves uncommitted; both write it after its
revisions. A revision's
`executables` lists files to commit with the executable mode. The first
revision gets an empty backlog unless it states one, as `backlog` or as bytes
at `.planning/PRODUCT-BACKLOG.md`; `backlog: null` states a trunk without
one. The builder refuses a backlog stated both ways and other descriptions it
cannot materialize, before any Git runs; its comments hold each method's
defaults.
[Local state](support/repository-local-state.mjs) ·
[Story worktrees](../../dashboard/test-support/support/storyReviewWorktree.ts)

When a case needs another agent's claim only as a starting fact, declare it
with `takeRevision`: the agent authors it and the developer commits it under
`Take queued work: <identity>`, so claim readers find it as they find a real
start's claim. Run the real start only where the start, its refusal or its
resume is under proof. A real start commits uncommitted planning edits into
its claim, so declare such facts in the description instead. Record a
story's readiness review after its dependency agreements, which belong to
its readiness basis. [Queued repository](support/queued-repository.mjs)

Intent comparison setups read their endpoints from these named results.
Publish the built baseline with `precedeClaimWithPlanning`, or compose
`withPlanningBeforeClaim` into a CI trunk declared with `aComparisonCiTrunk`;
`publishDeclaredTrunk` pushes it once and answers each SHA by name. `publishTake` answers its `claim`, and
`completedPublishedStory` its `claim`, `completion` and owning `branchSide`.
`completeBacklogStory` runs the real backlog completion; `commitAll` and
`advanceCompletedTrunk` answer the commit they made.
[Baseline and trunk](../../dashboard/test-support/support/storyCiComparisonBaseline.ts) ·
[Completion](../../dashboard/test-support/support/completedStoryPublication.ts)

A revision can also carry one `release`, built with
`makeMe.aRelease.with({ version, taggedAt, marker }).please()` and, where
its payload differs, the managed path prefixes it `withheld` from its
installer declaration, the payload paths it `removed`, and the payload it
`added`. The materializer writes the working tree's installer and payload as
a harness layer, then the release's `VERSION`, changelog entry, marker and
deltas, and tags the commit `v<version>` dated `taggedAt`. A `VERSION` that
disagrees with its tag, or an extra tag name, is stated literally through
`files` and `tags`. A shell install or update check states its release source
as JSON at its call site, read on stdin by
`Distribution/tests/support/release-source.mjs <dest>`, or names a shared description in
`Distribution/tests/support/release-sources.mjs`, such as `latest`; the helper builds it in
place with `materializeLocalCheckout`'s `at`. `release-source.mjs --add
<source>` commits and tags a release that appears after the check has read
the source.
[Release](support/releaseTestData.mjs) · [Helper](support/release-source.mjs)

A dashboard journey that serves a project through the fake GitHub states the
same description and serves its named revisions without Git.
`describedRevisions(description, shaPerName)` returns one published revision
per name, inheriting its first parent's files, or the preceding revision when
parents are implicit, with its own changes and removals applied. One file
renderer writes both these files and the
materialized checkout, so the same facts publish the same bytes, including
the done catalog rebuilt from the records. `describedRevision`,
`describedBacklog` and `describedFiles` serve one revision. Revision SHAs,
commit dates, path histories, unanswered paths and held or failing reads stay
harness inputs. [Served revisions](../../dashboard/test-support/describedRevisions.ts) ·
[Renderer](support/repository-revision-files.mjs)

Add installed skills, CI adapters, mailboxes, ignored local configuration, and
generated install output as harness layers. The Git
publication native fixtures for startup, admission, one-shot and owned-context
journeys materialize their starting trunk from such a description, and their
evidence identities hash the builders and materializer they reach. Dashboard
origins and release sources keep their own harness helpers. Native preparation
fixtures use shared repository facts and local materialization while preserving
their non-bare origin without a remote, sibling execution worktree and actual
project preparation commands.
