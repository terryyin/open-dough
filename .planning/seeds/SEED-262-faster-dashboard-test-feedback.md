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
  description gains no branch or merge model. Planning text that dashboard
  helpers and specs serve through the fake GitHub, without a Git repository,
  belongs to [fake GitHub planning data](#declare-fake-github-planning-data).

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
   `writeQueuedStories`, and none that builds a Git repository hand-writes
   a published planning file that the description can state.
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

### Build release source repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-shell-release-and-native-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/533-migrate-shell-release-and-native-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"36a26640c7c6873ada32b497278b2ff2ae7685c0b817a19bc66de4740ec650c4","plan":"6223cc04d13d6d67ee686fa52edb41da3632530225aacc2a2233484eabcb6158"}}
```

#### Goal

A maintainer reading a shell install or update check can see, at its call
site, which releases its release source holds. These facts are each release's
version and tag date, and how its payload differs from the current one. The
install and update checks choose, verify and pin releases from these facts.
Today `tests/helpers/release-fixture.bash` states them inside its builders.
`install-latest-release.sh` asserts that `v0.1.10` is chosen. Only
`build_latest_fixture` says that 0.1.10 is tagged 2020-01-01, after 0.1.1 and
0.1.2 by version and before them by date, under an untagged divergent head.
The release sources move onto
[the shared repository description](../../tests/support/repositoryTestData.mjs)
through a small Node helper. Shell check feedback must not get slower.

#### Scope

- MakeMe gains a release concept: a version, a tag date, a payload marker,
  and the managed paths a release withholds from its installer declaration
  or removes from its payload. A repository description revision can carry
  a release, and the materializer tags it with an annotated `v<version>` tag
  at that date. The current working tree's installer and payload are a
  harness layer that the materializer copies into each release revision.
  The release's `VERSION`, changelog entry and marker are facts.
- A Node helper reads a release-source description from the shell call site
  and materializes it. Route `build_latest_fixture`, `build_upgrade_releases`
  and `build_current_tagged_release_fixture` through it. Each caller states
  its releases at the call site, or names a shared description that its
  fixture file states. On 2026-11-08, 18 checks called those builders.
- Route the inline release sources too. On 2026-11-08 these were in
  `install-latest-release.sh`, `update-refuses-unverifiable.sh`,
  `update-force-restores-latest.sh`, `pin-and-inspect.sh`,
  `self-installation-baseline.sh`, `compare-versions.sh`,
  `apply-temp-cleanup.sh` and `update-removes-dropped-files.sh`. They used `write_candidate_payload` and
  `tag_release` after their own `git init`.
- Invalid input under proof stays visible at the call site. Examples are a
  tag whose `VERSION` disagrees with it, two tags on one payload, leading-zero
  versions, non-release tags such as `not-a-release` and `v1.2.3-rc.1`, and a
  head that moves after resolution. The description states a mismatched
  `VERSION` or extra tag name as a literal fact. A later change to a
  materialized source, such as moving `BRANCH_HEAD`, stays a Git operation
  in the check.
- The hand-written backlog in the product-backlog payload check's
  `run_offline_done_catalog_proof` is rendered through
  `render-published-backlog.mjs`, as its merge proof's backlog already is.
  Its Git repositories stay as they are. The merge proof's ancestor holds
  one rendered backlog at a custom path, and its branches are Git under
  proof. The recorder proof publishes what `record-state` wrote. The
  free-form payload seed that `record-state` proves stays literal bytes.
- Remove `release-fixture.bash`'s release-writing builders once no
  consumer needs them. `checkout_tagged_release` stays as a harness
  operation, because it checks out an older release with Git. The native
  ADR-awareness delivery-to-use journey
  (`tests/support/dough-adr-awareness-delivery-to-use.sh`) builds its release
  source with `init_fixture_repo`, `write_candidate_payload`, `commit_all` and
  `tag_release`. Those four keep their behavior for that caller.
- Scope limits:
  - An install target that holds no domain facts, such as an empty project
    or a baseline commit before install, stays harness setup.
  - Installed state, host-hook settings, runner settings and native scenario
    content belong to
    [installation and native test data](SEED-261-share-domain-test-data.md#map-installation-and-native-test-data).
  - Git-publication native fixtures belong to
    [git-publication native fixtures](#migrate-git-publication-native-fixtures).
  - The worktree-preparation native builders stay MakeMe-free under
    [plan 532](../slice-plans/532-tighten-repository-description-facts/PLAN.md).
  - Release sources gain no branch or merge model.
- Boundary assumption: no native evidence identity hashes these helpers or
  the migrated checks, so no paid run is needed.
  `execution-worktree-preparation-native.sh` sources `release-fixture.bash`
  but calls none of its builders. The delivery-to-use journey's identity
  hashes its own file, not `release-fixture.bash`, and its file is not
  migrated. Adding the release fact changes `makeMe.mjs` and the repository
  description. Three identities hash those modules through their import
  closures: the product-backlog native take, git-publication admission and,
  until plan 532 lands, worktree preparation. None of their fixtures builds a
  release, so record that as the reuse reason under
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md#5-assess-now-and-delete-spent-evidence)
  and make no paid refresh.

#### Key examples

1. **Latest by version.** `install-latest-release.sh` declares 0.1.1 tagged
   2026-06-01, 0.1.2 tagged 2026-09-01 and 0.1.10 tagged 2020-01-01, under an
   untagged head with `BRANCH_HEAD`. The installer still resolves
   `v0.1.10`, the installed payload carries `payload-0.1.10`, and
   `BRANCH_HEAD` is absent.
2. **Upgrade with a withheld path.** An update check declares 0.1.1 that
   withholds a managed skill path from its installer and 0.1.2 that is the
   current payload. It checks 0.1.1 out with Git and installs it. The update
   to 0.1.2 adds the withheld files, as today.
3. **Mismatch under proof.** `update-refuses-unverifiable.sh` declares, at
   its call site, release 0.1.1 whose `VERSION` says 0.1.8, then 0.1.10. The
   update still refuses with `baseline metadata mismatch` and writes
   nothing.
4. **Non-release tags.** The branch-only source declares `not-a-release` and
   `v1.2.3-rc.1` as literal lightweight tag names and no release. The
   installer still refuses with `No numeric release tags` and installs
   nothing.
5. **Payload backlog.** The installed done-catalog proof declares
   `CAT#finish` queued in `plans/BACKLOG.md` through the renderer. The
   installed `catalog-done` still leaves the backlog unchanged, and
   `complete` still lists both records at their blob hashes.
6. **Superseded setup removed.** No install or update check runs its own
   `git init` to build a release source. `release-fixture.bash` keeps only
   the builders the native delivery-to-use journey calls, unchanged.

#### Evaluation

Migrated checks keep their verdicts and assertions. A reviewer can name each
check's releases from its call site or fixture file. Record focused run times
before and after under comparable load for `install-latest-release.sh` and
one upgrade family, such as `story-payload-update.sh` and
`update-adds-new-payload-skill.sh`. They must not regress beyond run-to-run
noise.

#### Architecture

- **One description, one materializer.** A release is a revision fact in
  [the repository description](../../tests/support/repositoryTestData.mjs).
  [The materializer](../../tests/support/repository-fixture.mjs) writes its
  tag. No release-specific Git builder is added
  ([test data architecture](../../tests/README.md#test-data-architecture)).
- **Payload is a harness layer.** The copied installer and skills describe
  the source under test, not a release fact. The release's version, date and
  payload differences are facts, so a check that proves selection by version
  states them. Under
  [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  a matching version tag such as `v0.1.0` identifies a release.
- **Shell reaches MakeMe through Node.** The shell call site passes facts as
  JSON to one helper, as `render-published-backlog.mjs` already does.
- **A release source is one local checkout, built in place.** Installers
  read the source by path, so it needs no origin. Each shell build is its
  own Node process, so a per-process template is never reused. On
  2026-11-08, under load 7–9, `build_latest_fixture` took 1.09–1.14 s. Four
  releases materialized through today's path took 2.10–2.35 s, with a bare
  origin and the payload stated as 768 files per revision. A local checkout
  that copies the payload once and commits only release deltas took
  0.88–1.17 s, and copying that as a template added 0.28–0.29 s.

<a id="migrate-git-publication-native-fixtures"></a>

### Build git-publication native fixture repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-git-publication-native-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer reading a git-publication native check can see which
repository facts its fixture arranges. Its retained evidence identity must
still cover every input that builds the fixture.

**Scope.** Route the startup, admission, one-shot and owned-context native
fixtures through the
[shared repository description](../../tests/support/repositoryTestData.mjs).
Remove `createQueuedTrunk`, `createPreparationTrunk`, `createSiblingTrunk`
and the last use of `writeQueuedStories` by a non-dashboard caller.
`ownedWorktreeOnly`, `advanceOriginFromAnotherWriter` and
`cloneAsAnotherWriter` stay Git operations. Today the import-closure walker
does not follow the fixtures' `load(sourceDir, …)` imports. It returns one
module for the admission and owned-context fixtures and fails on the
one-shot fixture with `ENOENT … tests/src/notes.mjs`. So the owned-context
identity does not cover `createQueuedTrunk` or the writer helpers. Repair
that coverage. Choose the identity mechanism at refinement. One candidate
hashes the MakeMe closure, so every MakeMe edit stales native evidence. The
other hashes a normalized digest of the built repository: trees, modes,
messages, authors, refs, configuration and worktree layout, as
[plan 532](../slice-plans/532-tighten-repository-description-facts/PLAN.md)
compares them. The digest excludes commit times and fixture paths and costs
one fixture build per identity. The admission identity already hashes the
queued-trunk modules, so its retained records no longer match their inputs.
Record the literal manual native commands. Paid runs stay manual-only.

<a id="declare-fake-github-planning-data"></a>

### Serve fake GitHub planning files from explicit MakeMe data

**Identity:** SEED-262#declare-fake-github-planning-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/530-declare-fake-github-planning-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e8ace42c9e9d224e19599d13bd01ccb41ac1c5a9057e7d504bdbe9ac46900aef","plan":"1d18ef03c22cf1236be76934b870e82aad5e67093434b02eb04297b754e8c84f"}}
```

#### Goal

A maintainer reading a dashboard journey that serves a project through the
fake GitHub can see which planning facts that project publishes at each
revision. Today about 40 dashboard helpers and specs put literal
`# Product backlog` text, seed headings, profiles or done records into the
fake GitHub's published files, so the facts that drive a case hide inside
Markdown templates. The served files come from the same
[repository description](../../tests/support/repository-fixture.mjs) that
Git fixtures use, rendered with the production encoders. Dashboard feedback
must not get slower.

#### Scope

- A `makeMe.aRepository` description renders to the published files of each
  named revision without Git, as the files the fake GitHub serves
  (`PublishedRevision`). A later revision serves the earlier revisions'
  files with its own changes and removals applied, as Git would publish
  them. Rendering uses the encoders the Git materializer already uses:
  backlog membership, story states, agent profiles, done records and the
  rebuilt done catalog. The Git materializer and this rendering share one
  file renderer.
- Fake GitHub helpers and specs that hand-write published planning files
  declare them instead. On 2026-11-08 these included `refreshJourney.ts`,
  `notificationStoryJourney.ts`, `sessionNavigationJourney.ts`,
  `sourceNavigationJourney.ts`, `doughnutProject.ts`, `recentlyDoneRecords.ts`,
  `accessibleBoard.ts`, `takenAgentProfileRecords.ts`, `agentRosterRecords.ts`,
  `authenticatedAvatarRecords.ts`, the shared, resuming and turn read
  supports, and the specs under `observation`, `sessions`, `stories`,
  `navigation`, `configuration` and `runtime` that build their own backlog
  text. Helpers that already call `renderPublishedBacklog` but hand-write
  seeds or records, such as `catalogProjectRecords.ts`, move to the same
  description. A seed's prose that the dashboard reads, such as a story's
  heading, identity line or purpose, stays a declared file in the revision;
  its story state comes from the declared facts.
- Moving published files (`publishMovingFiles` with `moveTrunk` and
  `moveBranch`) take their revisions from named revisions of one description.
  The fake GitHub's answers, observation and held or failing reads stay in
  the harness.
- Keep literal bytes at the call site where a spec proves them: malformed or
  truncated backlogs, legacy shapes, unreadable records, and deliberately
  invalid input. Build the surrounding valid files from the description.
- Remove superseded literal templates, such as `emptyBacklog` in
  `originAnswers.ts`, once their last consumer declares its facts.
- Boundary assumption: a helper that builds a Git repository belongs to
  [dashboard test repositories](#migrate-dashboard-origin-fixtures). A helper
  doing both migrates its fake GitHub files here and its Git origin there.
- Scope limits: this story adds no new MakeMe concept beyond what the
  description already states, except what a migrated case needs to state its
  driving facts. It changes no dashboard product behavior and no fake GitHub
  answer shape. Git reuse belongs to
  [faster Git fixture construction](#reuse-immutable-git-histories).

#### Key examples

1. **Empty published project.** A journey serves a project with no stated
   planning facts. The fake GitHub serves the description's default revision:
   an empty valid backlog. The board shows no stories, as before, and
   `emptyBacklog` is gone.
2. **Refresh across revisions.** The refresh journey declares revision A with
   one Taken and two queued stories, and revision B moving one queued story to
   Taken. Moving trunk from A to B shows the same titles and order as today.
   Seeds unchanged at B are served from A's files.
3. **Profiles and done records.** A Taken agent profile journey declares its
   profile, and a recently done journey declares its done records. The served
   profile, records and catalog equal what `renderAgentProfile`,
   `renderDoneRecord` and the catalog encoder write, and the cards read as
   today.
4. **Exact bytes kept.** The read-failure spec still serves its malformed
   backlog tail literally at the call site, and its verdict is unchanged.
   A long-title layout case declares the long titles, direction and
   identities as facts instead of a template.
5. **Superseded templates removed.** No dashboard helper or spec that serves
   the fake GitHub writes `# Product backlog` text, except a call site whose
   spec proves those bytes.

#### Evaluation

Migrated specs keep their verdicts and assertions. A reviewer can name each
journey's served planning facts from its call site or fixture file. Record
focused run times before and after under comparable load for one refresh or
navigation family and one recently done or profile family. They must not
regress beyond run-to-run noise.

#### Architecture

- **One description, two outputs.** The same description materializes as a
  Git origin or renders as served files. Both use one file renderer, so a
  journey and a Git spec stating the same facts publish the same bytes
  ([test data architecture](../../tests/README.md#test-data-architecture)).
- **Rendering stays in memory.** Served files need no Git or disk, so the
  done catalog uses the pure catalog encoder rather than a directory rebuild.
- **No native evidence change.** Fake GitHub helpers are not inputs to native
  evidence, so no paid run is needed
  ([native family layers](../../tests/native-family-layers.md)).

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
