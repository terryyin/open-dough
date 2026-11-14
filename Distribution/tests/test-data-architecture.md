# Test data architecture

Every Intent test entry in `.planning/open-dough.json` selects the shared
MakeMe convention, which the installed [`dough-makeme`](../../.agents/skills/dough-makeme/SKILL.md)
skill owns. This guide gives the project's construction boundary and builders.

Use one test-only JavaScript ESM entry point at `Distribution/tests/support/makeMe.mjs`,
exporting `makeMe`. Playwright TypeScript specs and `node:test` JavaScript tests
import it directly. A shell check that arranges domain data invokes a small Node
helper, such as `Distribution/tests/support/release-source.mjs`, that calls MakeMe and writes
it in the product's existing format. The helper and the builders it reaches
follow the convention the shell check selects, though their own paths match no
entry. A test reaches a builder as `makeMe.aThing` or `makeMe.anThing`, and
`.please()` returns the finished product value.

Type builders against the production type, schema, or encoder input with
`@ts-check` and JSDoc imports. Builder modules import no dashboard module at
runtime: native journeys hash makeMe's runtime import closure
(`Distribution/tests/support/native-import-closure.mjs`) as evidence identity, and
`Distribution/tests/native-evidence-identity.sh` fails when that closure reaches outside
`tests/` and `src/`. Include the builder sources in the dashboard
type-check. Organize builders by domain concept behind the one entry point.
Return the canonical shape directly to every caller. Preserve actual storage
and response distinctions, such as a persisted `LaunchRecord` and a live
`LaunchWithState`. Use existing production encoding at file and transport
boundaries. Keep servers, Git, installation, clocks, and teardown in the test
harness; its fixtures delegate domain construction to these builders.
[ADR 0002, Direct domain mapping](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
· [ADR 0008, Durable project state and local operational state](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)

For example, dashboard and skill tests can build the same preparation profile
facts and hand them directly to `renderAgentProfile` when writing a published
profile. [Dashboard setup](../../dashboard/tests/publishedFactsIsolation.ts) ·
[Skill setup](../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs)

```js
const profile = makeMe.anAgentProfile
  .preparing({ name: "Kirara", identity: storyIdentity, host: "claude" })
  .please();
const profileText = renderAgentProfile(profile);
```

[CI test data](ci-test-data.md) covers proof evidence, observed runs and jobs,
adapter attempts, queue entries and stored revision coverage.

Build a project this machine configures with
`makeMe.aConfiguredProject.with({ id, label, repository, localPath }).please()`:
the published source it reads, as `makeMe.aPublishedSource` builds it (ref
`main` and the standard backlog path unless the case states them), plus the
checkout this machine uses. State `ref` or `hidden` at the call site when the
case relies on it. Dashboard harnesses keep the environment, the saved
project list file and its encoding; the default development harness writes
the real production seed only when the development list is missing.
[Builder](support/projectConfigurationTestData.mjs) ·
[Harness](../../dashboard/tests/support/projectConfiguration.ts)

For a real Git starting state, describe the published facts with
`makeMe.aRepository.withRevision(name, facts).please()`. Each revision can
declare membership, files, story state, profiles, done records, and commit
identities. Materialize that description with `materializeRepository` to
get a bare origin, a checkout, named commit IDs, and cleanup, or with
`materializeLocalCheckout(t, description)` to get one checkout with no origin,
removed after test `t`, for a case that reads no remote (`gitTemplates: false`
initializes it without Git's templates; `layer` adds harness files, such as
runner tooling read with `copiedLayer`, to its first commit; `at` builds it
in place at that directory without the shared template, as the shell checks'
release sources do). A revision's optional `parents` names earlier revisions
in their actual Git parent order; its files inherit the first parent and apply
its declared changes. This arranges actual merge topology and explicit resolution
trees, without asking Git to invent a resolution. Published revisions can name
only earlier published parents; a private workspace can also name its earlier
private revisions. Graph histories publish their final tip once; ordinary
linear histories retain their existing publication behavior. Identical
descriptions reuse one template within a process, so they give identical
commit IDs; each caller gets its own mutable copy. A run owner can prepare a
snapshot of a shared leading history once (`prepareRepositorySnapshot`) and
register it in its workers (`registerPreparedPrefix`); a description that
starts with that history is copied from the snapshot and commits only its
remaining revisions, with the same results as a full build. Keep commands and Git
transitions under proof in the case that observes their result.
[Builder](support/repositoryTestData.mjs) ·
[Repository harness](support/repository-fixture.mjs)
`commitDeclaredRevision` adds a later revision to an existing checkout with
the same author, committer and message defaults.
[Revision commit](support/repository-revision-commit.mjs)

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

Arrange native hook settings with `makeMe.hostHookSettings.forHost(host)`.
State unrelated settings through `.with(...)` and handlers through `.handling(...)`;
the builder returns each host's actual document shape. `.registeredWith(...)`
copies the production fragments into a prior registration without running the
merge under test. Keep edited managed handlers and independent byte or semantic
expectations in the case. [Settings builder](support/hostHookSettingsTestData.mjs)

Feedback maintenance keeps the published review (`makeMe.aFeedbackReview`),
saved machine choice (`makeMe.aFeedbackMaintenanceChoice`), observed state
(`makeMe.aMaintenanceObservation`) and due-check session
(`makeMe.aMaintenanceSession`) separate. State review dates and observations
explicitly. Compose existing launch, request, host-session and attempt builders
for their facts; the review document's fence and storage remain harness work.
[Feedback builders](support/feedbackTestData.mjs)

Use `makeMe.jobDurations.with(entries).please()` for recorded job durations.
It returns the runner's `Map<label, seconds>` directly. Keep allocation actions,
expected shares and exact timing-list/parser examples in the case, independent
of the arranged map. [Duration builder](support/jobDurationTestData.mjs)

Build a kept launch with `makeMe.aLaunchRecord`: the requested story or
instruction, the host session (the request takes the session's host), the
workspace its start established, and when it was launched. Dashboard tests keep
such records in the machine launch store only through
`dashboard/tests/support/launchStore.ts`, which writes the store's own
`{ [project]: records }` document under the machine home without retention;
the file and its location stay harness facts. Read the parsed document through
`keptLaunchStore` or one project's records through `keptLaunchRecords`, which
includes unresolved creations. Use `launchStoreFile` when checking exact bytes
or waiting for the file. Write exact store text under proof through
`keepLaunchStoreText`.
[Builder](support/launchTestData.mjs) ·
[Launch store harness](../../dashboard/tests/support/launchStore.ts)

Build the host session a terminal or runner consumes on its own with
`makeMe.aHostSession.claude`, `.codex` or `.cursor`; a kept launch's
`inClaudeSession`, `inCodexSession` and `inCursorSession` use the same
construction. State the conversation's identity and where it continues: a
Codex thread's saved workspace and app-server endpoint, with its notice when
the case needs it, or a Cursor chat's UUID and workspace, with its saved
configuration scope when the case needs it. Resume arguments default to the
host's current resume command for that conversation, so each session resumes
its own identity. A Codex session without a continuation is a predecessor
record. [Host session builder](support/hostSessionTestData.mjs)

A kept launch states what happened after it started through
`.completedWith`, `.withReportRead`, `.landedAt` (or `.withCapturedLanding` for
the complete recorded comparison) and `.markedDoneAt`: its
final report, the developer reading it, the comparison its landing recorded,
and the developer's Done mark. These stay separate facts. Build a final report
on its own with `makeMe.aCompletionReport`, and the body an agent submits with
`makeMe.aCompletionSubmission`. A submission is answered by a delivery receipt
and is not the stored report. State a receipt or receipt time when the case
reads more than one report or controls the clock.
[Outcome builders](support/launchOutcomeTestData.mjs)

A landing shares one comparison across its shapes: the launch's reporting
reference, the remote and target, and the base and revision. Build the
dashboard-prepared context with `makeMe.aLandingContext`, the submission with
`makeMe.aLandingSubmission`, the receiver's answer with
`makeMe.aLandingReceipt`, and the stored evidence with `makeMe.aLaunchLanding`
captured from `makeMe.aLandingAuthority`. A submission and a stored landing
always state `.comparing({ base, revision })` at the call site. Keep real Git,
publication and the capture path in the journeys that observe them.
[Landing builders](support/launchLandingTestData.mjs) ·
[Stored landing](support/launchLandingEvidenceTestData.mjs)

When a case needs another agent's claim only as a starting fact, declare it
with `takeRevision`: the agent authors it and the developer commits it under
`Take queued work: <identity>`, so claim readers find it as they find a real
start's claim. Run the real start only where the start, its refusal or its
resume is under proof. A real start commits uncommitted planning edits into
its claim, so declare such facts in the description instead. Record a
story's readiness review after its dependency agreements, which belong to
its readiness basis. [Queued repository](support/queued-repository.mjs)

A description can also name its trunk branch (`withTrunkBranch`, default
`main`), the integration checkout's committer (`withCheckoutIdentity`), and
one execution workspace: `withWorkspace(branch, { from, checkoutIdentity })`
with ordered `withUnpublishedRevision` commits. The materializer adds that
workspace as an `execution` worktree with its own committer and commits its
revisions without pushing; `candidateSha` names its tip. A revision's
`executables` lists files to commit with the executable mode. The first
revision gets an empty backlog unless it states one, as `backlog` or as bytes
at `.planning/PRODUCT-BACKLOG.md`; `backlog: null` states a trunk without
one. The builder refuses a backlog stated both ways and other descriptions it
cannot materialize, before any Git runs; its comments hold each method's
defaults. [Refusal test](support/repository-description.test.mjs)

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
harness inputs. [Served revisions](../../dashboard/tests/describedRevisions.ts) ·
[Renderer](support/repository-revision-files.mjs)

Other branch refs, competing writers, stashes, dirty files, submodules and
removed worktrees stay Git operations in the case. Run a merge in Git when
the action itself is under proof; declared parents arrange its starting history.
Installed skills, CI adapters, mailboxes, ignored local configuration and generated install output
are harness layers added to the materialized checkout, not description facts.
A case that proves behavior without a remote removes it with Git. The Git
publication native fixtures for startup, admission, one-shot and owned-context
journeys materialize their starting trunk from such a description, and their
evidence identities hash the builders and materializer they reach. Dashboard
origins and release sources keep their own harness helpers. Native preparation
fixtures use shared repository facts and local materialization while preserving
their non-bare origin without a remote, sibling execution worktree and actual
project preparation commands.
