---
id: SEED-262
status: active
planted: 2026-11-08
scope: epic
---

# Faster dashboard test feedback

Developers running dashboard checks should get a result sooner while keeping
the integration proof that makes each check worth running. Start with
[`agent-launch-attention.spec.ts`](../../dashboard/tests/sessions/agent-launch-attention.spec.ts).
Both cases passed in 12.02–13.01s wall with two local workers. That profile
separated run startup, shared hooks, and test bodies. Use it to find other
consumers of each cost and prove savings across the affected family.
[Profiling evidence](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

For each story, compare the same ordinary test selection before and after
under comparable conditions. Include the starting example where it bears the
cost and a second consumer or representative selection. Report elapsed time,
executed cases, and the phase or operation each story changes. Keep the
surviving proof explicit and include its runtime when coverage moves to another
tier. Follow the project's
[test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests),
[macOS test gate](../../tests/local-test-resources.md#machine-sleep-on-macos),
and [definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="build-explicit-git-fixtures"></a>

### Build each test’s Git repository from explicit MakeMe data

**Identity:** SEED-262#build-explicit-git-fixtures
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-262#build-explicit-git-fixtures","dependencies":[{"supplier":{"identity":"SEED-261#share-published-agent-profile-builders","href":"seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders"},"implementation":"The pilot creates the one shared MakeMe entry point, tests/support/makeMe.mjs, with anAgentProfile, and types it into the dashboard type-check.","rationale":"The repository description extends that entry point and composes anAgentProfile for every announcement and Take revision. The pilot is Taken and building it now. A second entry point or profile builder created here would duplicate and conflict with that work, and the test data architecture allows only one.","condition":"tests/support/makeMe.mjs with makeMe.anAgentProfile is published on trunk.","state":"satisfied","resolution":{"revision":"b37463488d5cb9640785e56e5f3aebb9483ade33","path":".planning/seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders","summary":"The MakeMe pilot landed at 327b56af4 with the shared tests/support/makeMe.mjs entry point and its anAgentProfile builder. Completed plan 505 records passing skill and dashboard consumers and dashboard type-check. A direct import on current trunk also builds the expected preparation profile. This consumer recorded its dependency in 83b544a81, after the supplier visit resolved the agreements present at landing.\nCondition satisfied: tests/support/makeMe.mjs with makeMe.anAgentProfile is published on trunk.\nAccepted integration: 327b56af4c0505668567087175e7bef9634cb871 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/510-build-explicit-git-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4cec5bc56af4bd81fa6d038a85a36a5aaf5b8c77e018d7b4df153e7ac6fc47c9","plan":"a807c5a793569242ce1aa71a13d925a9dc2f7c8cddddfe32245c6f9ff6312f1e"}}
```

#### Goal

A maintainer reading a test that needs a real Git repository can see, at its
call site, which repository facts drive the case. These facts are its stories,
published records, ordered revisions and the commit facts the product reads. A
test that declares nothing gets a minimal valid project repository. This story
introduces the shared repository builder and real-Git materializer and
migrates the queued-trunk family that dashboard and skill tests share. The
other fixture hubs follow in their own stories. Its fixture and run times
become the baseline for
[faster Git fixture construction](#reuse-immutable-git-histories).

#### Scope

- Extend the shared MakeMe entry point with a repository description. A
  description holds ordered named trunk revisions. Each revision states its
  published facts, composed from the canonical builders and production
  encoders: backlog entries and membership, seeds and story state, agent
  profiles, done records and their catalog. It also states the commit facts
  the product reads: the agent as author and the developer as committer.
  `.please()` returns plain data and touches no Git.
- Add one shared materializer in the test harness. It turns a description
  into a real bare origin, with checkouts when the case needs them, and
  returns each named revision's commit and a cleanup. Git, directories and
  teardown stay in the harness under the
  [test data architecture](../../tests/README.md#test-data-architecture).
- Migrate the queued-trunk family, starting with the attention spec's
  story-columns history. The family is `createQueuedTrunk`,
  `createPreparationTrunk`, the startup, admission and one-shot sibling
  fixtures, the supplier-dependency fixture, the dashboard `launchJourney`,
  and every non-native test that arranges a repository through them. Each
  helper delegates to the shared path or is removed when superseded. The
  per-process reuse of an identical starting repository moves behind the
  materializer instead of being dropped, so feedback does not slow down before
  the reuse story.
- Arrange a transition directly when the test does not prove it, instead of
  replaying start, take or complete. The command a test proves still runs for
  real on the materialized repository. Push races, rejected publications,
  merges and ancestry walks stay as Git operations in the test.
- Exact malformed or legacy input under proof stays literal at the call
  site. The description carries it verbatim as file bytes.
- Boundary assumption: execution starts after
  [the published agent profile pilot](SEED-261-share-domain-test-data.md#share-published-agent-profile-builders)
  lands. That pilot creates `tests/support/makeMe.mjs` and `anAgentProfile`.
- Scope limits: native scenario fixtures keep their current setup, including
  the native startup fixture's call to `createQueuedTrunk`, and move with
  [shell release and native fixtures](#migrate-shell-release-and-native-fixtures).
  Fixture reuse and caching belong to
  [faster Git fixture construction](#reuse-immutable-git-histories). Other
  hubs belong to their sibling stories.

#### Key examples

1. **Default repository.** A test asks for `makeMe.aRepository.please()`
   with no facts. It gets a bare origin whose `main` has one commit and an
   empty but valid product backlog. The backlog CLI reads it without error.
2. **Attention journey.** The spec declares Stories A and B Ready, and
   Story C queued last and not refined. It then declares three named
   revisions: Yui-chan announces preparation of B, Akiho-chan takes B, and C
   is completed. Today's command replay changes only the Yui-chan profile;
   then the backlog and the Akiho-chan profile; then the backlog, the done
   record and the catalog. Each agent commit is authored by the agent and
   committed by the developer the card credits. The materialized origin has
   the same published files, authors and committers at each named revision.
   No production command runs during setup, and the spec's assertions are
   unchanged.
3. **Command under proof.** The announce test declares a rival Yui-chan
   execution profile on trunk and runs the real `start`. The start still
   announces the next free name, and the trunk file has
   `renderAgentProfile`'s bytes.
4. **Git under proof.** A workspace-publication race test gets its starting
   trunk from the builder. The competing push and the rejection it asserts
   stay in the test.
5. **Literal input.** A case that proves recovery from a malformed backlog
   declares those exact bytes as a file in the description. The materializer
   writes them verbatim.
6. **Superseded setup removed.** After migration, no non-native consumer in
   the family calls a superseded helper or keeps its own `git init` for this
   setup. Only the four native scenario fixtures still call
   `createQueuedTrunk` or `createPreparationTrunk`, until
   [their own story](#migrate-shell-release-and-native-fixtures) moves them.

#### Evaluation

The migrated tests keep their verdicts and assertions. A reviewer can name
each case's driving repository facts from its call site. Record the
attention spec's fixture time and focused run time under the same conditions
before and after, and do the same for one migrated skill selection. These
times are the baseline for the reuse story.

#### Architecture

- **Description and materializer are separate.** MakeMe owns the domain
  description and the harness owns Git
  ([test data architecture](../../tests/README.md#test-data-architecture)).
  The other hub stories extend the same description, and the reuse story
  caches behind the same materializer.
- **Production encoders produce the bytes.** Revision content is written
  through `renderBacklog`, `renderAgentProfile`, `recordStoryState`,
  `renderDoneRecord` and the done-catalog derivation. The test model maps
  directly to the product model
  ([ADR 0002 §5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)).
- **Real Git owns relationships.** The published repository at a revision
  stays the authority the dashboard reads
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).
  Commit IDs and ancestry come from Git. The dashboard credits the
  committer and reads committer time for performed work. A case that
  depends on author, committer or time declares it. Otherwise the
  committer is a fixed developer identity and the time is Git's ordinary
  current time.
- **Command proof stays with commands.** Setup no longer replays start, take
  or complete, so the encoders and the command tests own the proof of what
  those commands publish.
- **Native evidence is unchanged.** Native scenario fixtures are untouched
  here, so their evidence identities do not change and this story needs no
  paid run ([native family layers](../../tests/native-family-layers.md)).
- **Published work facts.** These Git fixture stories own repository
  construction. Compose the existing published-work facts through
  [MakeMe](../../tests/support/makeMe.mjs) when describing those repositories.

[Inventory and profiling evidence](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

<a id="migrate-dashboard-origin-fixtures"></a>

### Build dashboard start origins from explicit MakeMe repository data

**Identity:** SEED-262#migrate-dashboard-origin-fixtures
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-262#migrate-dashboard-origin-fixtures","dependencies":[{"supplier":{"identity":"SEED-262#build-explicit-git-fixtures","href":"seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures"},"implementation":"This story passes makeMe.aRepository descriptions to startOrigin and its publishers, and materializes them through the shared harness materializer with its per-process reuse.","rationale":"The description and materializer are planned in plan 510 and not yet built. The test data architecture allows one MakeMe entry point and one Git harness, so building them here would duplicate and conflict with that story's work.","condition":"makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into a real bare origin and checkout with per-process reuse, are published on trunk.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/512-migrate-dashboard-origin-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b5ccc3cc41b0ac32e2efebf0427391e060758b6dcb86e226d0adc780432cc63c","plan":"f4bf88b2cbce44fa2c5ff5b1e3daaefefc0854299e077d523108047f015a6b75"}}
```

#### Goal

A maintainer reading a dashboard journey or backend spec can see at its call
site which repository facts its start origin holds and which later commits
it adds. Today every start origin silently holds Stories A and B queued,
refined, planned and Ready. About 200 dashboard files name Story A or its
identity, but those facts live only in `queuedStories.ts`. This story makes
the start origin and its publishers state their facts through
[the shared repository description](#build-explicit-git-fixtures). Dashboard
feedback must not get slower.

#### Scope

- `startOrigin` takes a MakeMe repository description. With none, it holds
  the description's default: one commit with an empty valid backlog and the
  installed skills. Every call site and origin fixture that relies on the
  queued stories passes the shared description of two Ready queued stories
  that [the shared repository builder](#build-explicit-git-fixtures) provides
  for the skill tests, not a dashboard copy. A Playwright fixture states its
  description in its fixture file, and a spec that needs other facts
  overrides it with `test.use`. On 2026-11-08, 49 files called `startOrigin`,
  including seven Playwright fixtures that create it implicitly. 70 helper
  modules and 95 specs imported it.
- Installed skills stay a harness layer, not a domain fact. The harness adds
  them to the description's first commit, so the origin keeps one root commit
  with the stories and skills together.
- Keep the run-wide preparation that global setup performs. It prepares each
  installation layout once per run from the named shared descriptions in use,
  and each test copies the prepared origin as it does now. A description that
  is not prepared run-wide is materialized through the shared materializer's
  per-process reuse on top of the same installed skills.
- Helpers that hand-write published planning facts declare them instead:
  seeds, story state, backlog membership, agent profiles, dependency
  agreements and done records. These include the story dependency, story
  reference, recently done, Trunk Mode review, one-shot review, completion
  closure and later-story publishers, and `publishChangedReview`.
- Replace a real `start` that only arranges a Taken story or a claim commit
  with a declared revision whose author is the agent and whose committer is
  the developer. A spec whose subject is the start, its refusal or its resume
  still runs it on the materialized origin.
- Keep as real Git operations in the helper or test: story branches,
  worktrees, merges, fast-forwards, first-parent rewrites, held pushes,
  isolation and older Git behaviour. A CI comparison or completed-story
  publisher takes its trunk facts from the description and builds the commit
  graph it proves with Git on top.
- Remove superseded dashboard helpers and the dashboard's use of
  `writeQueuedStories`. The queued identities come from the shared
  description. The shared writer itself goes when its last consumer does; a
  native execution fixture still uses it until
  [shell release and native fixtures](#migrate-shell-release-and-native-fixtures)
  migrate.
- Boundary assumption: execution starts after
  [the shared repository builder](#build-explicit-git-fixtures) lands
  `makeMe.aRepository` and its materializer on trunk. This story extends that
  description and materializer rather than adding a second one.
- Scope limits: clean-trunk, Node and shell fixtures belong to their sibling
  stories. Cross-description caching beyond today's per-process reuse belongs
  to [faster Git fixture construction](#reuse-immutable-git-histories). The
  description gains no branch or merge model.

#### Key examples

1. **Default start origin.** A backend spec calls `startOrigin()` with no
   description. The project checkout has one commit holding the installed
   skills and an empty valid product backlog. No story is queued.
2. **Named shared stories.** The `origin` fixture in `startOriginTest.ts`
   names the shared description of Stories A and B queued, refined, planned
   and Ready. A spec that publishes the origin still shows both cards Ready,
   and its assertions are unchanged. The prepared origin still comes from
   global setup, and the test copies it as before.
3. **Facts that differ.** A story dependency spec declares Story B waiting on
   Story A in its description. Its origin's backlog, seeds and agreement come
   from production encoders, and the helper no longer writes or commits them.
4. **Command under proof.** A preparation-resume spec still runs the real
   `start` on the materialized origin. A CI comparison fixture that only
   needs Story A Taken declares the claim revision, authored by the agent and
   committed by the developer, and runs no `start`.
5. **Git under proof.** A later fast-forward comparison declares its trunk
   stories, then makes its story branch, merge and first-parent rewrite with
   Git. Intent's comparison verdicts are unchanged.
6. **Superseded setup removed.** No dashboard helper calls
   `writeQueuedStories`, and none hand-writes a published planning file
   that the description can state.

#### Evaluation

Migrated specs keep their verdicts and assertions. A reviewer can name each
case's driving repository facts from its call site or fixture file. Record
focused run times before and after under comparable load for one Playwright
journey family and one backend family that use the default origin. They must
not regress beyond run-to-run noise.

#### Architecture

- **One description, one materializer.** This story extends the
  [repository description and materializer](#build-explicit-git-fixtures)
  and adds no dashboard-specific copy. MakeMe owns stories and records; the
  harness owns Git, installation and teardown
  ([test data architecture](../../tests/README.md#test-data-architecture)).
- **Installation is a harness layer.** Installed skills come from this run's
  working-tree source, as today. They join the first commit so the history
  shape the dashboard reads does not change.
- **Prepared once, copied per test.** Run-wide preparation keyed by
  installation layout and named description keeps today's copy cost.
  Committing the stories per test on a prepared skills-only origin was
  observed at about 115 ms extra per test, roughly doubling the 95 ms copy.
- **Commit graphs stay in Git.** The description holds ordered trunk
  revisions only. Intent and CI comparison read ancestry and merges, so
  those stay Git operations
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).
- **No native evidence change.** Dashboard start origins are not inputs to
  native evidence, so no paid run is needed
  ([native family layers](../../tests/native-family-layers.md)).

<a id="migrate-clean-trunk-fixtures"></a>

### Build clean-trunk and managed delivery repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-clean-trunk-fixtures
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-262#migrate-clean-trunk-fixtures","dependencies":[{"supplier":{"identity":"SEED-262#build-explicit-git-fixtures","href":"seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures"},"implementation":"This story adds an unpublished workspace suffix to makeMe.aRepository and its shared materializer, then routes the clean-trunk family and the other skill root builders through them.","rationale":"The description and materializer are planned in plan 510 and not yet built. The test data architecture allows one MakeMe entry point and one Git harness, so building them here would duplicate and conflict with that story's work.","condition":"makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into a real bare origin and integration checkout with per-process reuse, are published on trunk.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/514-migrate-clean-trunk-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d941e07d8a61ca14f69d45eeb41e5499438755856c47dcd21d14f4ebd1bff7c8","plan":"e3ad10bca57813a90b58e3f2ec01b22b06699ff92b719a0b6153527d0ca6470a"}}
```

#### Goal

A maintainer reading a publication, delivery, closure, Dough Land or CI skill
test can see at its call site which repository facts drive the case. These
are the trunk's files and revisions, the unpublished increment the workspace
publishes, and the commit identities the product reads. Today
`createCleanTrunkFixture` silently supplies a `trunk.txt` base commit, an
`exec/story` worktree with one `increment.txt` commit, and fixed
"Integration Checkout" and "Execution Worktree" identities. On 2026-11-08
about 70 test files built on it through the managed delivery, trunk closure
and closure Git fixtures. About ten other skill fixture modules and six test
files each made their own repository with `git init`. This story moves them
onto [the shared repository description](#build-explicit-git-fixtures). Skill
test feedback must not get slower.

#### Scope

- Extend the shared repository description with an execution workspace: a
  named branch started from a named trunk revision, holding ordered
  unpublished revisions. Each revision states its files, message, author and
  committer, as trunk revisions do. `.please()` still returns plain data. The
  materializer adds the worktree beside the integration checkout and commits
  the revisions without pushing. It returns each revision's commit.
- Route `createCleanTrunkFixture` through the description and materializer.
  Route the fixtures layered on it too: managed delivery and its owner and
  transport fixtures, fresh delivery, trunk closure and closure owner,
  closure Git, source freshness and the racing-suffix backlog fixture. The
  publication family names a shared description, a trunk with one
  unpublished increment, in its fixture module. A case that reads a file
  name, content or identity of the trunk or increment declares it at its
  call site.
- Published planning facts in this family come from the canonical builders
  and production encoders. Examples are the backlog, story state and done
  records used by completed-identity, done-catalog and Dough Land completion
  cases. Exact malformed or legacy bytes under proof stay literal.
- Route the other skill fixtures that make their own starting repository
  through the description. They are CI path applicability, revision
  coverage, integrated-state judge, consumer trace, repair stash, worktree
  preparation and its wrapper, default checkout, target-branch worktree,
  installed checkouts and preparation publication. Migrate the inline
  starting repositories in the six skill tests that run `git init`. CI
  workflow text, lockfiles and project configuration that a case proves are
  declared files with their exact bytes.
- Installed skills, the controlled CI adapter, mailbox storage and ignored
  local configuration stay harness layers added to the materialized
  checkout. They are not description facts.
- Keep as real Git operations in the helper or test: competing pushes,
  rejected publications, rebases, merges, ongoing merge or rebase states,
  stashes, dirty and untracked files, submodules, locked or removed
  worktrees and maintenance states.
- Remove a superseded helper or root builder once no consumer needs it. The
  native owned-context fixture loads `ownedWorktreeOnly` and
  `advanceOriginFromAnotherWriter`. Those two keep their behavior for that
  caller.
- Boundary assumption: execution starts after
  [the shared repository builder](#build-explicit-git-fixtures) lands
  `makeMe.aRepository` and its materializer on trunk. This story extends
  that description and materializer rather than adding a second one.
- Scope limits: queued and preparation trunks belong to
  [the shared repository builder](#build-explicit-git-fixtures). These
  include the supplier visit fixtures' queued trunk and the one-shot
  refinement trunks. The one-shot payload installation is a harness layer
  and stays. Dashboard start origins, Node backlog repositories and shell or
  native fixtures belong to their sibling stories. Caching beyond the
  materializer's per-process reuse belongs to
  [faster Git fixture construction](#reuse-immutable-git-histories). The
  description gains a linear unpublished suffix only, with no general branch
  or merge model.

#### Key examples

1. **Clean-trunk publication.** `publication.test.mjs` names the shared
   description: one trunk commit and a workspace with one unpublished
   increment. The origin's `main` is the trunk commit. The workspace branch
   is one commit ahead and absent from the origin. Publication is accepted
   as today.
2. **Committer under proof.** The closure agent-credit test declares the
   developer who commits in the workspace at its call site. The merge still
   credits that developer once. No assertion depends on an identity that
   only a fixture module states.
3. **Product facts.** The completed-identity test declares Story A Taken in
   its trunk's backlog through MakeMe. The real backlog `complete` still runs
   on the materialized checkout, and the done record it asserts is unchanged.
4. **Literal configuration.** A path applicability test declares its exact
   `ci.yml` text as a trunk file. Its classification is unchanged.
5. **Git under proof.** A racing-suffix test takes its trunk and owned
   backlog suffix from the description. The other writer's advance, the
   rejected push and the rebase stay in the test. The repair-stash test's
   stash entries and dirty submodule stay Git operations.
6. **Superseded setup removed.** No non-native test calls
   `createCleanTrunkFixture` or keeps its own `git init` for a starting
   repository. The native owned-context fixture still runs with unchanged
   helper behavior.

#### Evaluation

Migrated tests keep their verdicts and assertions. A reviewer can name each
case's driving repository facts from its call site or fixture module. Record
focused run times before and after under comparable load for the managed
delivery family and the closure family. They must not regress beyond
run-to-run noise.

#### Architecture

- **One description, one materializer.** The workspace suffix extends
  [the repository description and materializer](#build-explicit-git-fixtures).
  No publication-specific copy is added. MakeMe owns the facts, and the
  harness owns Git, worktrees, installation and teardown
  ([test data architecture](../../tests/README.md#test-data-architecture)).
- **The unpublished suffix is a fact; its fate is Git.** Every publication
  and closure case reads the workspace's increment, so the description
  states it. What happens to it next stays Git under proof: push, rejection,
  rebase or merge. The suffix is linear and sits on one named trunk
  revision. Other commit graphs stay Git operations
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).
- **Harness layers stay outside the description.** Installed skills, the CI
  adapter, mailboxes and ignored configuration describe the test machine,
  not the project's published history.
- **No native evidence change.** The native shell fixtures do not load
  these modules. The owned-context fixture loads two Git helpers whose
  behavior stays unchanged. So this story needs no paid run
  ([native family layers](../../tests/native-family-layers.md)).

<a id="migrate-backlog-scratch-repositories"></a>

### Build Node test repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-backlog-scratch-repositories
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-262#migrate-backlog-scratch-repositories","dependencies":[{"supplier":{"identity":"SEED-262#build-explicit-git-fixtures","href":"seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures"},"implementation":"This story describes the backlog Git, done, identity evidence, lint-runner, local-suite and later-trunk starting repositories with makeMe.aRepository, and extends the shared materializer with a local checkout without an origin and a declared configured developer.","rationale":"The description and materializer are planned in plan 510 and not yet built. The test data architecture allows one MakeMe entry point and one Git harness, so building them here would duplicate and conflict with that story's work.","condition":"makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into real Git with per-process reuse, are published on trunk.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/524-migrate-backlog-scratch-repositories/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"beccf6868649f138a6c38d7168f18af89739d9c18d680b664a79935b87a7ddd9","plan":"409b014c7c1b834331a9d21fcdf6a2c2ecf9df87402836ce4bcedfb784971700"}}
```

#### Goal

A maintainer reading a `tests/support` Node test that needs Git can
see, at its call site, which repository facts drive the case. These facts are
the published backlog, done records, agent profiles and seeds, the ordered
revisions the product reads, and the developer and committer it credits.
Today `scratchRepo` commits the starting backlog as "Test", and
`gitWorkspace` configures "Terry Yin" as the developer by default. Done record
tests assert that name although only the fixture states it. Setup helpers that run
the real `complete` or `take` are called 33 times, to arrange done records
and profiles for cases whose subject is a merge, rebase or cherry-pick.
This story moves these repositories onto
[the shared repository description](#build-explicit-git-fixtures). Node test
feedback must not get slower.

#### Scope

- Route the starting repository of each `tests/support` Node test that makes
  one through the shared description and materializer. On 2026-11-08 these
  were `scratchRepo` in the backlog Git fixture (43 calls in 18 merge,
  rebase, cherry-pick, done-catalog and driver tests) and `gitWorkspace` in
  the done fixture (7 calls in the done-record, intent-coverage and identity
  evidence tests). They also included `committedLintFixture` (4 test files),
  the local-test-suite `fixture` (2), the later-trunk `trunk` and `trunkOf`
  (2), and the inline repository in `requested-revision-ci-status.test.mjs`.
- Arrangement backlogs come from `aBacklogEntry` and the production backlog
  encoder. The near-future direction paragraph becomes a backlog fact when a
  case reads it. `backlogOf` stays the independently written byte
  expectation and is no longer the arrangement. Exact malformed or legacy
  lines under proof, such as an entry with no link, stay literal file bytes.
- The configured developer, the committer and an agent author are declared
  at the call site when the product reads them.
- Arrange a transition directly when the test does not prove it. A done
  record and catalog come from `aDoneRecord`, `renderDoneRecord` and the
  catalog derivation, and a profile from `anAgentProfile`, instead of running
  `complete` or `take` in setup. A case whose subject is one of those commands
  still runs it for real.
- Branches, merges, rebases, cherry-picks, conflicts, linked worktrees,
  ongoing operation states and staged or unstaged changes stay Git
  operations in the test. Their file content comes from MakeMe or literal
  bytes, as the starting revision's does.
- Copied runner and lint tooling, linked dependencies, the merge driver
  registration and an init without templates are harness layers or
  materializer options. They are not description facts. The sample files a
  lint or suite case checks are declared files with their exact bytes.
- Remove a superseded helper or root builder once no consumer needs it.
- Boundary assumption: execution starts after
  [the shared repository builder](#build-explicit-git-fixtures) lands
  `makeMe.aRepository` and its materializer on trunk. This story extends that
  description and materializer rather than adding a second one.
- Scope limits: skill tests under `src/skills`, dashboard helpers and shell
  or native fixtures belong to their sibling stories, including the
  shell-driven `story-dependencies-installed-observe.mjs`. Caching beyond the
  materializer's per-process reuse belongs to
  [faster Git fixture construction](#reuse-immutable-git-histories). The
  description gains no branch or merge model.

#### Key examples

1. **Merge under proof.** A backlog merge test declares a trunk whose backlog
   holds Items A and B Taken and Item C queued. It commits the `close-a` and
   `close-b` branches with Git and runs the real merge. The merged bytes
   still equal the `backlogOf` expectation, and the verdict is unchanged.
2. **Developer under proof.** The done-record test declares Terry Yin as the
   configured developer at its call site, and the real `complete` records
   Terry Yin. No fixture default supplies that name.
3. **Transition declared.** A done-catalog rebase case declares a `feature`
   branch holding Story B's done record, completed at 2026-10-05, and the
   rebuilt catalog. No `complete` runs during setup. The real rebase still
   adds the same catalog commit as the agent and credits the developer once.
4. **History the product reads.** The identity evidence case declares three
   revisions. "Active work" holds the active seeds, "Allocate SEED-090" adds
   its seed and done record, and "Clean up SEED-090" removes both. The
   evidence still names the allocating revision.
5. **Harness layer and literal files.** A lint file-set test declares its
   sample programs with exact bytes. The runner files and linked
   dependencies are added by the harness. The pre-commit hook test still
   stages its change with Git.
6. **Ancestry under proof.** `trunkOf(count)` declares its landing and later
   revisions. `trunk()` declares the landing and first later revision, then
   builds the side branch, the merge and the last two revisions with Git.
   The forward walk's verdicts are unchanged.
7. **Superseded setup removed.** No `tests/support` Node test keeps its own
   `git init` for a starting repository, and none runs `complete` or `take`
   in setup unless it proves that command.

#### Evaluation

Migrated tests keep their verdicts and assertions. A reviewer can name each
case's driving repository facts from its call site. Record focused run times
before and after under comparable load for the backlog Git family and the
lint-runner family. They must not regress beyond run-to-run noise.

#### Architecture

- **One description, one materializer.** This story extends
  [the repository description and materializer](#build-explicit-git-fixtures)
  and adds no Node-specific copy. MakeMe owns the facts and the harness owns
  Git, tooling copies and teardown
  ([test data architecture](../../tests/README.md#test-data-architecture)).
- **A local checkout when no remote is read.** On 2026-11-08, under load
  about 5, a single scratch repository with one commit took 62–64 ms. A bare
  origin with a pushed checkout took 128–131 ms, and copying a prepared
  template took 17 ms. Most cases here declare different backlogs, so
  per-process reuse rarely applies. The materializer therefore gives a
  single checkout without an origin when the case reads no remote. The
  product readers these tests prove read `HEAD` and the configured user
  name, so an origin is not a fact under proof.
- **Expectations stay independent.** Arrangement bytes come from production
  encoders. Expected bytes stay hand-written, so an expectation cannot agree
  with a wrongly rendered arrangement
  ([ADR 0002 §5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)).
- **Commit graphs stay in Git.** The description holds ordered trunk
  revisions only. Merge, rebase and cherry-pick inputs and ancestry walks
  are built with Git in the test
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).
- **No native evidence change.** No shell or native check loads these
  fixture modules, so this story needs no paid run
  ([native family layers](../../tests/native-family-layers.md)).

<a id="migrate-shell-release-and-native-fixtures"></a>

### Build shell release and native fixture repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-shell-release-and-native-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer reading a shell install, update or native check can see
which release and repository facts the check arranges.

**Scope.** Use [the shared repository builder](#build-explicit-git-fixtures)
through a small Node helper for `release-fixture.bash`, the native Git fixtures
and inline shell setup, including the native startup fixture's queued trunk.
Remove the remaining `createQueuedTrunk` path. Native evidence identities will
change, so record the literal manual native commands. Paid runs stay
manual-only.

<a id="reuse-immutable-git-histories"></a>

### Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer gets faster test feedback when equivalent repository
requests can reuse immutable Git data behind the same MakeMe setup.

**Scope.** Use the [migrated Git fixtures](#build-explicit-git-fixtures)
to find recurring repository shapes and reusable immutable parts, such
as trees or commit histories. The attention spec's original workers each
spent about 3s preparing the same history. Measure which reuse is worthwhile
with the new builder. Keep reuse inside the shared materializer. Each
test gets its own mutable refs, config, index, and working state.

**Evaluation.** Compare the same selections before and after with cold and
warm setup and parallel workers. Show lower elapsed time and equivalent
file contents, refs, ancestry, and test verdicts. A test that advances or
mutates its repository leaves a concurrent test's repository independent.
[Existing template reuse](../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs#L132)

<a id="drive-polls-with-time-and-replies"></a>

### Make dashboard polling tests advance on controlled time and observed replies

**Identity:** SEED-262#drive-polls-with-time-and-replies
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running observation tests gets results as soon as the
relevant answer is available, with time-dependent behavior still proven.

**Scope.** Start with session polling in the attention spec. Its eight
virtual clock steps took 13ms, while observing the session answers took about
0.42s. Look across session and revision observation tests for repeated waits,
unnecessary polling, and remaining elapsed waits. Use controlled clocks for
cadence and observable events for completed requests. Follow the
[authenticated-read backend clock guidance](../../dashboard/tests/writing-journeys.md#authenticated-read-backend-clocks)
where it applies to the selected cases.
A clock seam in the released GitHub request owner remains a
[separate decision](../TEST-OPTIMIZATION-CANDIDATES.md#auto-refresh-rate-limit-real-waits).

**Evaluation.** Show a measurable reduction in real wait or request cost
across the selected family. Retain checks for the absence of early requests,
the expected cadence, and failure and recovery. Compare wait duration and
request count with the ordinary test verdicts and fixtures intact.
[Synchronization guidance](../../dashboard/tests/writing-journeys.md)
