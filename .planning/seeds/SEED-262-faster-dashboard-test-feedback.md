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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/534-migrate-git-publication-native-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"20cc8677d1582fd80bee81b3ddf95bc5240c27fdfc7f5e040c5e555c9bf6a9cd","plan":"78e7844848536c64734d799bc781fe94c2154ca48d14875c5d4f3c61b152ce69"}}
```

#### Goal

A maintainer reading a Git publication native check can tell which published
facts its starting repository contains and which Git operations the check
exercises. The maintainer can assess whether retained native evidence still
applies when an input that builds that fixture changes.

#### Scope

- Startup, admission, one-shot and owned-context fixtures declare their
  starting repository facts through the
  [shared MakeMe description](../../tests/support/repositoryTestData.mjs) and
  [materializer](../../tests/support/repository-fixture.mjs). Name the stories,
  their readiness and the relevant revisions at the call site or in the
  named fixture it selects. Preserve the Git histories, working state and
  existing assessor verdicts that each journey depends on.
- Keep real Git for owned worktrees, competing writers, interrupted and
  resumed publication, and other transitions observed by the checks. Keep
  real installed commands for the prior admissions and claims whose receipts
  or ownership the scenarios consume. Keep literal divergent or dirty data
  visible where the check depends on those exact inputs.
- Remove `createQueuedTrunk`, `createPreparationTrunk`, `createSiblingTrunk`
  and their legacy setup. Remove the last non-dashboard use of
  `writeQueuedStories`. Remove the writer itself when no caller remains.
- Each affected evidence identity covers the repository inputs that its
  fixture uses, including transitive builders and writer helpers. A failed
  required input read cannot yield an apparently complete current identity.
  Historical records retain their original hashes and remain available for
  replay and evidence assessment. Paid native runs remain manual-only.
- Dashboard origins, release-source fixtures and the MakeMe-free native
  worktree-preparation fixtures remain separate. Normalized repository
  hashing as an evidence key is deferred. Its comparison technique serves
  as migration proof.

#### Key examples

1. A startup fixture names Ready queued A and B and the setup and command
   files. When the claim proceeds in a new workspace, the real commands
   leave root markers after the claim, including when the workspace is gone.
2. An admission fixture names its queued trunk and the startup probe. The
   existing investigation still starts with no queued mission. Continuation
   and closure still observe real prior admissions and their ownership.
3. A queued one-shot fixture names Ready B and its unfinished sibling B2.
   Refinement selects B2 while keeping B Ready. The default-main case still
   observes the staged, unstaged and untracked human edits in that checkout.
4. The preparation-land fixture names rough C. Its real retained worktree
   holds the creation ref and the competing writer advances trunk. The
   existing landing verdict still checks that topology and publication.
5. The evidence writer runs after a fixture or transitive input changes.
   The corresponding input hash changes. Generated notes source remains
   fixture data, so its embedded imports cannot break the one-shot identity.

#### Architecture

Use the existing source-hash closure with traceable imports and explicit roots
for inputs loaded outside JavaScript imports. This follows the same dependency
mapping as compiler depfiles. The fixture entry point names the build, its
import and spawn edges identify dependencies, and the retained hashes record
the inputs. A byte change in shared MakeMe can invalidate a record even when
the built fixture behaves identically. Apply the evidence reuse judgment in
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md#5-assess-now-and-delete-spent-evidence)
to that case. An input identity establishes provenance for a recorded result.

A normalized repository digest could reduce those invalidations. Admission
builds in two scratch locations produced different trees even before the probe
commit because the generated scripts contain the fixture path. A reliable
snapshot key would have to normalize those tracked bytes and separately
account for configuration, dirty state, worktrees and writer helpers. Keeping
the existing identities without expanding their input coverage leaves the
observed gaps in startup, one-shot and owned-context.

#### Evaluation

Compare the same credential-free startup and admission selections before and
after under comparable load. Record elapsed time, the executed cases and the
fixture construction or identity work that changed, following the epic's
evaluation rule. Preserve the corresponding one-shot and owned-context
verdicts and verify input sensitivity without credentials.

<a id="share-done-catalog-record-reading"></a>

### Read done records for the catalog through one product rule

**Identity:** SEED-262#share-done-catalog-record-reading
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/542-share-done-catalog-record-reading/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b36c44e0064e5d3634b4374bd22bd82e836ba2626bcc9075b6c0db977faebca6","plan":"3d70f573d0a2802571218b52b086003646a1a1cba612bce9d5a43747cc835178"}}
```

#### Goal

A maintainer changing how the done catalog selects, orders or hashes record
files changes it in one product place, and every test fixture that publishes
a catalog follows. Bounded correction of SEED-262#declare-fake-github-planning-data
(`ca9edef63:.planning/seeds/SEED-262-faster-dashboard-test-feedback.md#declare-fake-github-planning-data`).

#### Scope

- The product's done-record reading for the catalog (record-name filter, name
  order, text and Git blob hash) becomes one pure operation over named record
  bytes; the directory rebuild and the test renderer's catalog both use it.
- Test helpers that compute a Git blob hash for a published file use the
  product's hash instead of a copy.
- No change to catalog bytes, record bytes, served paths or product behavior.

Plan: [542-share-done-catalog-record-reading](../slice-plans/542-share-done-catalog-record-reading/PLAN.md)

<a id="reuse-immutable-git-histories"></a>

### Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/535-reuse-story-columns-git-history/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"31827b90916904e7b13e06db6bcbc4f29d09ea9d2390dfc43ee52ae88ea10031","plan":"13209d29934e2ea3ae1e31e2e70711019fcc915381442e0cd0646c8699f791c3"}}
```

#### Goal

Developers running dashboard checks get a result sooner when workers can
reuse equivalent Git history from the same MakeMe setup. The attention journey
and the other consumers of its story-columns history are the first place to
prove the gain. Keep the real Git and dashboard observations each case uses.
[Original profile and migration baseline](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

#### Scope

- Reuse the common queued, preparing, and taken history of the
  [story-columns fixture](../../dashboard/tests/launchJourney.ts) within one
  dashboard run. Its completion revision can differ by worker. Preserve the
  exact declared bytes, branch and checkout identities, authorship, ancestry,
  and named revision results. Keep reuse and the private copy inside the
  [shared materializer](../../tests/support/repository-fixture.mjs), with each
  returned fixture owning its mutable origin, refs, config, index, and working
  state. The ordinary per-process path covers requests without a suitable
  shared prefix.
- Compare the same attention and second-consumer selections before and after.
  Record cold build, warm reuse, and two-worker elapsed time alongside the
  executed cases and verdicts. Lower construction time must translate to
  faster test feedback on the affected selection. Both workers can still
  wait for one cold build, so count the wait and the copies in that comparison.
- Defer reuse across runs and additional families until these measurements
  justify their cost. The installed StartOrigin fixture already shares its
  default and queued origins through the run owner. Use its existing
  measurements and the readiness family's as comparison context.

#### Key examples

1. Two workers request the same first three revisions and different
   completion timestamps. Each builds its fixture through MakeMe. The common
   history is built once, and each origin answers its own completion record
   with the right ancestry, refs, and file contents.
2. Two requests materialize from the same prefix. One advances its branch,
   changes its local config and index, or is removed. The peer and a later
   request still read their own pristine state. Removing the shared source
   after materialization leaves both returned copies usable.
3. A request has different declared facts or runs without the dashboard
   owner. The materializer builds the requested history through its existing
   local route. If registered preparation fails mid-build, its callers get
   the setup failure, and a fresh run can build the history again.

#### Architecture

The dashboard run owns the lifetime of a completed snapshot through its
[artifact owner](../../dashboard/tests/support/runArtifacts.ts). The
materializer owns deciding whether the prefix matches and copying it before
applying a caller's suffix. This borrows the immutable-base idea from
container image layers. The Git copy has to remain usable after the shared
base disappears, so Git alternates and writable hardlinks are unsuitable.
Direct MakeMe domain facts and deterministic isolated proof follow
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
The timing comparison and cost of the shared machinery follow
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
