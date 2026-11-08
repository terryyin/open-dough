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
{"schemaVersion":1,"identity":"SEED-262#build-explicit-git-fixtures","dependencies":[{"supplier":{"identity":"SEED-261#share-published-agent-profile-builders","href":"seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders"},"implementation":"The pilot creates the one shared MakeMe entry point, tests/support/makeMe.mjs, with anAgentProfile, and types it into the dashboard type-check.","rationale":"The repository description extends that entry point and composes anAgentProfile for every announcement and Take revision. The pilot is Taken and building it now. A second entry point or profile builder created here would duplicate and conflict with that work, and the test data architecture allows only one.","condition":"tests/support/makeMe.mjs with makeMe.anAgentProfile is published on trunk.","state":"waiting"}]}
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
- **Relation to published-work conversion.** Repository construction moves
  to these Git fixture stories. The remaining work in
  [published work domain data conversion](SEED-261-share-domain-test-data.md#map-published-work-test-data)
  uses this description for the domain facts it converts.

[Inventory and profiling evidence](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

<a id="migrate-dashboard-origin-fixtures"></a>

### Build dashboard start origins from explicit MakeMe repository data

**Identity:** SEED-262#migrate-dashboard-origin-fixtures
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-262#migrate-dashboard-origin-fixtures","dependencies":[{"supplier":{"identity":"SEED-262#build-explicit-git-fixtures","href":"seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures"},"implementation":"This story passes makeMe.aRepository descriptions to startOrigin and its publishers, and materializes them through the shared harness materializer with its per-process reuse.","rationale":"The description and materializer are planned in plan 510 and not yet built. The test data architecture allows one MakeMe entry point and one Git harness, so building them here would duplicate and conflict with that story's work.","condition":"makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into a real bare origin and checkout with per-process reuse, are published on trunk.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/512-migrate-dashboard-origin-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"715e4a34c9c41af039ad2e2beea2654566d9a7cdc696a21e1e015de390a8c92a","plan":"241d1bb68450d2d7abd3c2492d414c8148486af29affb31f2acd8727cf5ff66d"}}
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
  queued stories passes a named shared description, such as two Ready queued
  stories, from MakeMe. A Playwright fixture states its description in its
  fixture file, and a spec that needs other facts overrides it with
  `test.use`. On 2026-11-08, 47 files called `startOrigin`, including seven
  Playwright fixtures that create it implicitly. 70 helper modules and 95
  specs imported it.
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
- Remove superseded helpers and `writeQueuedStories`. The queued identities
  and titles live in the named shared description.
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
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer reading a publication, closure or CI skill test can see
which repository facts the case needs at its call site.

**Scope.** Route `createCleanTrunkFixture`, `createManagedFixture` and their
layered fixtures through [the shared repository builder](#build-explicit-git-fixtures).
The layered fixtures include trunk closure, fresh and owner delivery, and
closure Git. Also route the remaining skill root builders: CI path
applicability, revision coverage, integrated state, consumer trace, repair
stash, worktree preparation, default checkout, Dough Land and one-shot
refinement fixtures. Migrate inline setup in skill tests. Keep races, ongoing
operations, stashes and maintenance states under proof as Git operations.

<a id="migrate-backlog-scratch-repositories"></a>

### Build Node test repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-backlog-scratch-repositories
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer reading a `tests/support` Node test that needs Git can
see the repository facts at its call site.

**Scope.** Route the backlog Git and done fixtures' `scratchRepo` and
`gitWorkspace`, the lint-runner, local-test-suite and later-trunk fixtures,
and inline setup in Node tests through
[the shared repository builder](#build-explicit-git-fixtures). Merge, rebase
and conflict states remain real Git operations in the tests that prove them.

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

<a id="prepare-artifacts-on-demand"></a>

### Prepare dashboard test artifacts only when selected tests need them

**Identity:** SEED-262#prepare-artifacts-on-demand
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can run a focused backend, frontend, or integrated
selection without paying to produce run-wide artifacts the selection never uses.

**Scope.** Start with the setup charged to the attention spec and the
in-process count checks. Three count checks took 4ms combined and 3.31s from
the command line. Cover the build, server bundle, and installed-start origin
preparation in the common entry point. Keep required outputs fresh from the
current checkout, shared within their run when safe, and cleaned up.

**Evaluation.** Compare an in-process selection, a frontend-only selection,
and mixed and installed-start selections. Observe which artifacts each
produces and when. Show lower focused wall time and measure mixed-run time
to catch costs that move from startup into the tests.
[Global setup](../../dashboard/tests/support/globalSetup.ts)

<a id="arrange-prerequisite-state"></a>

### Set up test preconditions without replaying unrelated workflows

**Identity:** SEED-262#arrange-prerequisite-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running a journey can get to the behavior it proves
sooner when an unrelated workflow only supplies its initial state.

**Scope.** Start with already-open sessions in the attention and related
session journeys. Each attention case starts three workflows before its
first named assertion step. Arrange valid prerequisite state through shared
builders and the relevant persistence and fake-host boundaries. Extend the
approach to other journeys where the setup workflow has dedicated coverage.
Keep the real actions when launch, the resulting state, or a later change
such as Mark as done is the behavior being proved.

**Evaluation.** Show lower setup time and fewer launch-triggered requests
while keeping the attention, membership, and session-management assertions.
Run the journey that owns starting from a card to confirm its coverage still
holds. [Journey coverage ownership](../../dashboard/tests/native-host-fixtures.md)

<a id="reduce-private-fixture-lifecycle-cost"></a>

### Reduce the cost of private dashboard test fixtures

**Identity:** SEED-262#reduce-private-fixture-lifecycle-cost
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running browser or boundary tests spends less time
starting and stopping private test infrastructure while cases can still run
independently.

**Scope.** Start with per-case preview, browser context, fake service, and
native-host setup and cleanup in the attention profile. Find similar
per-case costs and use the cheapest fixture that still proves the required
boundary. Preserve real preview and restart paths where they provide unique
proof. Run-wide build and Git artifact production belong to the other
setup stories.

**Evaluation.** Compare per-case setup and teardown as well as wall time for
the affected selection. Concurrent cases and runs keep their own mutable
state and fake answers, and all processes and scratch data are cleaned up.
[Dashboard fixture contract](../../dashboard/tests/README.md#what-is-real-and-what-is-replaced)

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
