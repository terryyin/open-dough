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

<a id="migrate-dashboard-origin-fixtures"></a>

### Build dashboard test repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-dashboard-origin-fixtures
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-262#migrate-dashboard-origin-fixtures","dependencies":[{"supplier":{"identity":"SEED-262#build-explicit-git-fixtures","href":"seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures"},"implementation":"This story passes makeMe.aRepository descriptions to startOrigin, its publishers, and the standalone readiness and admission fixtures, and materializes them through the shared harness materializer with its per-process reuse.","rationale":"The description and materializer are planned in plan 510 and not yet built. The test data architecture allows one MakeMe entry point and one Git harness, so building them here would duplicate and conflict with that story's work.","condition":"makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into a real bare origin and checkout with per-process reuse, are published on trunk.","state":"satisfied","resolution":{"revision":"0eb86657bd2ea248d278f880bb095d91c6427cdc","path":".planning/seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures","summary":"The accepted tree exports makeMe.aRepository and its ordered named revisions. The shared materializer creates a bare origin and checkout, returns each named commit and reuses identical descriptions per process while giving each caller an independent mutable copy. The default repository and copy-isolation checks passed from the accepted checkout.\nCondition satisfied: makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into a real bare origin and checkout with per-process reuse, are published on trunk.\nAccepted integration: d2c6bf36856289b40c9f665ee6f8f813676ab314 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/512-migrate-dashboard-origin-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"46f4016395c3839bb38ac5b72f3bf632ea7ed4e036a517bf1b7d37be45362b97","plan":"6b28b9f625632be28def6a8bd7d84784ddabab0c5f38cb04122a55cc41d8d2ab"}}
```

#### Goal

A maintainer reading a dashboard journey or backend spec can see which
repository facts its fixture starts with and which later commits it adds.
Today every start origin silently holds Stories A and B queued, refined,
planned and Ready. About 200 dashboard files name Story A or its identity,
but those facts live only in `queuedStories.ts`. Start origins, their
publishers, and the standalone readiness and admission fixtures state their
starting facts through [the shared repository description](../../tests/support/repository-fixture.mjs).
Dashboard feedback must not get slower.

#### Scope

- `startOrigin` takes a MakeMe repository description. With none, it holds
  the description's default: one commit with an empty valid backlog and the
  installed skills. Every call site and origin fixture that relies on the
  queued stories passes the shared description of two Ready queued stories
  that [the shared repository builder](../../tests/support/repository-fixture.mjs) provides
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
- Migrate the starting repositories built through `storyReadinessCli.ts` and
  `admittedWork.ts` with the same description and materializer. Keep literal
  malformed inputs, stale assessments, and deliberate local edits where a
  readiness spec exercises them. In the admission fixture, keep the draft
  local until the real `start --admit` publishes the commit the dashboard reads.
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
  [the shared repository builder](../../tests/support/repository-fixture.mjs) lands
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
7. **Standalone readiness and admission.** The readiness fixture declares
   its starting state. A deliberately unpushed seed edit stays invisible
   when the dashboard reads the selected commit. The admission fixture
   declares its published queue and arranges a local draft. The dashboard
   shows the investigation in Taken from the commit the real `start --admit`
   published.

#### Evaluation

Migrated specs keep their verdicts and assertions. A reviewer can name each
case's driving repository facts from its call site or fixture file. Record
focused run times before and after under comparable load for one Playwright
journey family and one backend family that use the default origin, and for
the standalone readiness and admission specs. They must not regress beyond
run-to-run noise.

#### Architecture

- **One description, one materializer.** This story extends the
  [repository description and materializer](../../tests/support/repository-fixture.mjs)
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

<a id="tighten-repository-description-facts"></a>

### State each repository description fact once and keep native preparation evidence MakeMe-free

**Identity:** SEED-262#tighten-repository-description-facts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/532-tighten-repository-description-facts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1f49d1e3e3497c8e7ba50e0cc8a3b11d256a2d8dc4d04c8b9cb68a3dd652b67e","plan":"050536afd538c4f9b596573aaf3165ba290be94f13606861c0120c7429628e50"}}
```

**Goal.** A maintainer reading a
[shared repository description](../../tests/support/repositoryTestData.mjs)
gets exactly the repository it declares, and MakeMe edits no longer change
the native worktree-preparation journey's evidence identity. This corrects
the clean-trunk migration (`SEED-262#migrate-clean-trunk-fixtures`,
recoverable at `42717b7da:.planning/seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-clean-trunk-fixtures`).

**Scope.** The native worktree-preparation modules stop loading MakeMe and
the materializer while their repositories stay as they are. A workspace's
declared checkout identity stays with its worktree. The trunk without a
backlog becomes an explicit fact. A revision that declares both a rendered
backlog and backlog file bytes is refused. The builder's refusals get one
Git-free test. The test-data architecture describes the current repository
facts. No paid or native host run, and no change to the sibling stories'
scope. [Plan](../slice-plans/532-tighten-repository-description-facts/PLAN.md)

<a id="migrate-backlog-scratch-repositories"></a>

### Build Node test repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-backlog-scratch-repositories
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-262#migrate-backlog-scratch-repositories","dependencies":[{"supplier":{"identity":"SEED-262#build-explicit-git-fixtures","href":"seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures"},"implementation":"This story describes the backlog Git, done, identity evidence, lint-runner, local-suite and later-trunk starting repositories with makeMe.aRepository, and extends the shared materializer with a local checkout without an origin and a declared configured developer.","rationale":"The description and materializer are planned in plan 510 and not yet built. The test data architecture allows one MakeMe entry point and one Git harness, so building them here would duplicate and conflict with that story's work.","condition":"makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into real Git with per-process reuse, are published on trunk.","state":"satisfied","resolution":{"revision":"0eb86657bd2ea248d278f880bb095d91c6427cdc","path":".planning/seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures","summary":"The accepted tree exports makeMe.aRepository and its ordered named revisions. The shared materializer creates a bare origin and checkout, returns each named commit and reuses identical descriptions per process while giving each caller an independent mutable copy. The default repository and copy-isolation checks passed from the accepted checkout.\nCondition satisfied: makeMe.aRepository with ordered named trunk revisions, and the shared materializer that turns a description into real Git with per-process reuse, are published on trunk.\nAccepted integration: d2c6bf36856289b40c9f665ee6f8f813676ab314 on origin/refs/heads/main."}}]}
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
[the shared repository description](../../tests/support/repository-fixture.mjs). Node test
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
  [the shared repository builder](../../tests/support/repository-fixture.mjs) lands
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
  [the repository description and materializer](../../tests/support/repository-fixture.mjs)
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

**Scope.** Use [the shared repository builder](../../tests/support/repository-fixture.mjs)
through a small Node helper for `release-fixture.bash`, the native Git fixtures
and inline shell setup, including the native startup fixture's queued trunk.
Remove the remaining `createQueuedTrunk` path. Include the native-only
worktree-preparation repository builders and the `ownedWorktreeOnly`,
`advanceOriginFromAnotherWriter` and `cloneAsAnotherWriter` helpers that
native callers still use. The git-publication admission evidence identity
already hashes the clean-trunk fixture modules, so its retained records no
longer match their inputs. Native evidence identities will change, so record
the literal manual native commands. Paid runs stay manual-only.

<a id="reuse-immutable-git-histories"></a>

### Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer gets faster test feedback when equivalent repository
requests can reuse immutable Git data behind the same MakeMe setup.

**Scope.** Use the [migrated Git fixtures](../../tests/support/repository-fixture.mjs)
to find recurring repository shapes and reusable immutable parts, such
as trees or commit histories. The attention spec's original workers each
spent about 3s preparing the same history. Measure which reuse is worthwhile
with the new builder. Keep reuse inside the shared materializer. Each
test gets its own mutable refs, config, index, and working state.

**Evaluation.** Compare the same selections before and after with cold and
warm setup and parallel workers. Show lower elapsed time and equivalent
file contents, refs, ancestry, and test verdicts. A test that advances or
mutates its repository leaves a concurrent test's repository independent.
[Existing template reuse](../../tests/support/repository-fixture.mjs)
