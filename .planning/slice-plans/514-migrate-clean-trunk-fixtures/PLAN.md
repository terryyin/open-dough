# Build clean-trunk and managed delivery repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-clean-trunk-fixtures

**Source:** [Build clean-trunk and managed delivery repositories from explicit MakeMe data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-clean-trunk-fixtures)

**Source review:** [source review](source-review.md)

## Goal and boundaries

A maintainer reading a publication, delivery, closure, Dough Land or CI skill
test can see at its call site which repository facts drive the case: trunk
files and revisions, the workspace's unpublished increment, and the commit
identities the product reads. The facts come from the shared MakeMe
repository description, extended with a linear unpublished workspace suffix,
and the shared harness materializes them as real Git.

On 2026-11-08 the family was:

- `createCleanTrunkFixture`: 56 calls in 33 files.
- `createManagedFixture`: 64 calls in 30 files, with the fresh, owner and
  transport delivery fixtures layered on it.
- `createTrunkClosureFixture`: 27 calls in 14 files, plus the closure owner,
  closure Git, source freshness and racing-suffix fixtures.
- 158 test files load the clean-trunk module directly or transitively.
- Other root builders: CI path applicability, revision coverage,
  integrated-state judge, consumer trace, repair stash, worktree preparation
  and its wrapper, default checkout, target-branch worktree, installed
  checkouts and preparation publication.
- Six skill tests run `git init` inline: `ci-host-hook`,
  `ci-integrated-state-journey`, `ci-mailbox-removed-worktree`,
  `publication`, `resolve-publication-landing-context` and
  `dough-land-remote-context`.

Exclusions:

- Queued and preparation trunks, including the supplier visit fixtures'
  queued trunk and the one-shot refinement trunks, belong to
  [the shared queued fixtures](../../../tests/support/queued-repository.mjs). Where a file uses
  both, this plan changes only the clean-trunk side.
- The one-shot payload installation repository is a harness layer and stays.
- Dashboard start origins, Node backlog repositories and shell or native
  fixtures belong to their sibling stories.
- New cross-description caching belongs to
  [faster Git fixture construction](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories).
- The description gains no general branch or merge model.

The story records a blocking dependency on
[the shared repository builder](../../../tests/support/repository-fixture.mjs).
Execution starts after `makeMe.aRepository` and its materializer are on trunk,
then extends them.

## Current decisions

- **One workspace suffix in the shared description.** `makeMe.aRepository`
  gains a workspace: a branch name, the named trunk revision it starts from,
  and ordered unpublished revisions with files, removals, message, author and
  committer. The materializer adds it as a worktree of the integration
  checkout, commits the revisions there without pushing, and returns each
  one's commit beside the trunk revisions. A test that needs more branches,
  merges or competing writers makes them with Git.
  [Test data architecture](../../../tests/README.md#test-data-architecture) ·
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
- **Checkout identity is a declared fact where read.** Each checkout's
  configured committer comes from the description, so commits a test makes
  later carry it. Its default is the fixed developer identity of plan 510.
  A case that asserts an identity, such as the closure agent-credit test,
  states it at its call site.
- **The trunk branch name is a description fact.** Default `main`. Revision
  coverage declares `feature/custom` and the target-branch cases declare their
  target. The materializer pushes the named branch.
- **A named shared description for the publication family.** The clean-trunk
  module exports one named description: a `trunk.txt` trunk commit and a
  workspace on `exec/story` with one unpublished `increment.txt` commit, with
  today's two checkout identities. Its bytes match today's fixture, so
  consumers stay green until their slice declares what they read. `createCleanTrunkFixture`
  takes a description, defaulting to that named one. It keeps returning
  `{ fixture, origin, integration, execution, trunkSha, candidateSha,
  cleanup }`, so consumers that read none of the hidden facts keep their
  call. A consumer that reads a hidden file, content or identity passes its
  own description.
- **Harness layers stay outside the description.** Installed skills, the
  controlled CI adapter, mailbox storage, `.planning/open-dough.json` and
  `info/exclude` entries are added to the materialized checkout by the
  harness, as `installManagedDelivery` does today. Generated install output,
  such as the worktree-preparation fixture's `npm install` lockfile, stays a
  harness step on the materialized checkout.
- **Local-only repositories use the integration checkout.** Fixtures that
  today have no origin use the materialized integration checkout. A case that
  proves behavior without a remote removes it with Git in the test.
- **Native callers keep their helpers.** The native owned-context fixture
  loads `ownedWorktreeOnly` and `advanceOriginFromAnotherWriter`. Their
  behavior stays unchanged, so native evidence and paid runs are untouched.
- **Share builders with plans 508, 510 and 512.** Use the builders and
  materializer those plans land on trunk. Extend them rather than adding a
  parallel one.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed example 1: clean-trunk publication declares trunk and increment | Slice 1 | The workspace suffix materializes with `main` at the trunk commit and the workspace branch one unpublished commit ahead. The publication tests pass with unchanged assertions. All 158 tests that load the clean-trunk module pass in one focused run. |
| Managed and fresh delivery keep their verdicts with declared facts | Slice 2 | The managed delivery, fresh, owner and transport tests pass. Cases that read the increment or trunk content declare it. |
| Seed examples 2, 3 and 5: closure facts, product facts and Git under proof | Slice 3 | The trunk closure, closure Git, Dough Land, done-catalog, completed-identity, source freshness and racing-suffix tests pass. The agent-credit test declares its committer. The completed-identity test declares Story A Taken through MakeMe. The racing push, rejection and rebase stay in the test. |
| Seed examples 4 and 5: CI root builders declare their repositories | Slice 4 | The path applicability, revision coverage, integrated-state, target-branch, installed-checkout and repair-stash tests pass. The same holds for the inline `ci-host-hook`, `ci-integrated-state-journey` and `ci-mailbox-removed-worktree` tests. Workflow text is declared verbatim. Stashes and the dirty submodule stay Git. |
| Seed example 6 and the evaluation | Slice 5 | The worktree preparation, default checkout, consumer trace and preparation publication tests pass. So do the inline `publication`, `resolve-publication-landing-context` and `dough-land-remote-context` tests. A repository search finds no non-native test calling a removed helper or keeping its own `git init` for a starting repository. The native owned-context fixture's helpers are unchanged. Before and after focused times for the managed delivery and closure families are recorded. |

## Decisive premises

Observed on 2026-11-08 in this worktree at `3b9749a91` on macOS with Node
24.21.0. Both runs used `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES
-u NO_COLOR -u FORCE_COLOR bash scripts/test.sh <paths>`, with Homebrew Bash
first on `PATH`. The paths were the 158 test files that load
`publication-clean-trunk-fixtures.mjs` directly or through other modules.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1 focused family run and the evaluation baseline | The 158 files, unchanged | All passed, 313 s wall at load 10–11 |
| Slices 1–3: which consumers read facts that only the clean-trunk module states | Scratch edit, then reverted: the trunk file became an empty valid `.planning/PRODUCT-BACKLOG.md`, the increment `scratch-increment.txt`, and both checkout identities one fixed developer. Same 158 files. | 26 files failed with 71 failing cases; all others passed (397 s, load 9–10). The failures are 7 publication, 12 managed delivery and CI journey, and 5 closure and Dough Land files. They read `trunk.txt` or `increment.txt` or assert "Execution Worktree" as the committer. One shared helper, `ci-reuse-check-command-test-fixtures.mjs`, runs `git show <sha>:increment.txt` inside its CI check, so the increment path must reach it from the description. |
| Slice 1 keeps every consumer green while later slices move them | Same observation | The named shared description must keep `trunk.txt`, `increment.txt` and the two identities until each consuming group declares them. A changed default breaks those 26 files at once. |
| Native evidence is unaffected | `tests/support/git-publication-native-evidence.sh` and the trunk and story closure native run scripts list their inputs; `git-publication-native-owned-context-fixture.mjs` loads its helpers | No native shell fixture loads the family modules. The owned-context fixture loads `ownedWorktreeOnly` and `advanceOriginFromAnotherWriter`, which this plan leaves unchanged. |
| Slice 4: repositories that are not `main` on a bare origin | Read `ci-revision-coverage-test-fixtures.mjs`, `ci-integrated-state-judge-test-fixtures.mjs` and `execution-worktree-preparation-test-fixtures.mjs` | Revision coverage uses trunk branch `feature/custom` with an empty remote. The judge pushes revisions in sequence and makes sibling branches. Worktree preparation runs `npm install` before its only commit, in a non-bare checkout. Branch name, the local-only case and the generated lockfile are covered by the current decisions. |
| Slice 5: the generated lockfile as a harness step after the declared project | Scratch edit, then reverted: `createLockedNodeFixture` committed the declared project before `npm install`, so the lockfile landed in a second commit. Ran `bash scripts/test.sh` on the three `execution-worktree-preparation*` test files. | All passed. |

The description and materializer shape is plan 510's settled decision. Its
own remaining hypothesis, the dashboard consumers' verdicts, does not affect
these skill tests.

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Never sleep, never use `test.slow()`, and keep the default timeouts. For full
runs on awake macOS with AC power, use `caffeinate -s -i` and put Homebrew Bash
first on `PATH`. On battery, follow the lid-open procedure and check the sleep
log. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs its focused selection with `bash scripts/test.sh <paths>`,
with `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and `FORCE_COLOR` unset.
Run `npm run typecheck:dashboard` whenever MakeMe changes, since MakeMe is in
the dashboard type-check.

The clean-trunk module is loaded by 158 test files, and MakeMe by dashboard
and skill tests. So once before landing, run the whole `npm test` suite and
`npm run typecheck:dashboard`. The dashboard suite does not load these
fixtures and needs no full run for this story.

## Slices

### 1. Clean-trunk publication cases declare their trunk and unpublished increment

Type: Behavior

Status: done

Proof: Record the baseline in the premises below, or a fresh one under
comparable load. Add a focused test that materializes a description with a
workspace suffix and checks the origin's `main`, the workspace branch, its
commit's author and committer, and that the suffix is absent from the origin.
Run the publication tests that call `createCleanTrunkFixture` directly. Then
run all 158 tests that load the module in one focused run, and
`npm run typecheck:dashboard`.

Add the workspace suffix, checkout identities and trunk branch name to
`makeMe.aRepository` and the materializer. Rebuild `createCleanTrunkFixture`
on the named shared description. Keep `authorizedRemote` as a harness helper.
The seven publication files that read the hidden facts declare them at
their call site: `publication`, `execution-increment-publication`,
`execution-increment-publication-reconciliation`,
`execution-increment-publication-unresolvable-base`,
`execution-increment-comparison`, `publication-checkout-ongoing-operation`
and `publication-resume-comparison`.

Accepted proof (2026-11-08): `tests/support/repository-fixture.test.mjs`
"a workspace suffix is committed on its branch beside an origin that holds
only the trunk" and "each copy of a described workspace is its own worktree
whose later commits carry the declared checkout identity"; the seven
publication files plus the split-out
`execution-increment-publication-done-records.test.mjs` pass with unchanged
assertions; the 158-file family passed in 334 s at load 16–19 (not
comparable with the 313 s baseline at load 10–11); the 74 other MakeMe and
materializer loaders passed; `npm run typecheck:dashboard` passed. The
refactor pass removed the materializer's duplicate copies of the builder's
revision checks and split the done-records case out of the reconciliation
file; affected tests and the type-check were rerun and passed.

Learnings for later slices:

- `RepositoryBuilder` now has `withTrunkBranch`, `withCheckoutIdentity`,
  `withWorkspace(branch, { from, checkoutIdentity? })` and
  `withUnpublishedRevision`. `materializeRepository` returns `execution`,
  `candidateSha` and every revision's commit; each copy runs
  `git worktree repair`.
- A workspace `checkoutIdentity` is written with plain `git config` from the
  worktree, so it lands in the configuration both checkouts share, as the old
  fixture did. Per-checkout committers would need `--worktree` config.
- Template reuse gives every fixture of one description in a process the same
  SHAs; no consumer depended on unique SHAs.
- `backlog: undefined` on the first revision omits the default backlog; only
  the named shared description uses it.

### 2. Managed and fresh delivery tests declare the facts they read

Type: Behavior

Status: done

Proof: Run the `execution-increment-managed-delivery*`,
`execution-increment-fresh*`, `ci-reuse-*`, `ci-background-*` and
`ci-integrated-state-*` tests that call `createManagedFixture`. Their
assertions are unchanged.

`createManagedFixture` takes a description and passes it to the clean-trunk
fixture. `installManagedDelivery` stays the harness layer. The twelve
managed delivery and CI journey files that read the hidden facts declare
them. `ci-reuse-check-command-test-fixtures.mjs` takes the increment path
from the fixture's description instead of naming `increment.txt`.

Accepted proof (2026-11-08): the managed delivery, fresh, owner,
transport, `ci-reuse-*`, `ci-background-*` and `ci-integrated-state-*`
selection plus the clean-trunk family (163 files) passed in 378 s at load
13–16. A scratch run with the default description's facts changed passed the
51-file managed and CI selection, so no hidden-fact dependency remains there.
The refactor pass extracted a file-local `changedFiles` assertion helper in
the resume test; that file was rerun and passed.

Learnings for later slices:

- 15 files read the hidden facts, not 12; 12 of them read only through the
  shared covered check. `ci-reuse-check-command-test-fixtures.mjs` now reads
  the increment's path and bytes from `fixture.description`
  (`describedIncrement`), so only three tests declare a description:
  managed-delivery resume, reconciliation stops and the managed case of
  unresolvable base.
- `createManagedFixture({ description })` returns `description` beside the
  materialized fixture for harness checks that need it.
- The racing-suffix `assertAffectedCombination` still names `trunk.txt` and
  `increment.txt`; check whether it can read the description the same way.

### 3. Closure, Dough Land and backlog publication tests declare their facts

Type: Behavior

Status: planned

Proof: Run the `dough-story-wrap-up` closure and trunk-closure tests,
`worktree-retirement`, `dough-land-completion`, `dough-land-retained`,
`publication-completed-identity`, `product-backlog-git-done-catalog`, the
source freshness tests and the racing-suffix tests. Also run the
`tests/support` supplier trunk-closure visit tests.

Route the trunk closure, closure owner and closure Git fixtures through
descriptions. Then the named shared description no longer needs to stand in
for any consumer, and the clean-trunk default becomes plan 510's default
repository with a one-commit workspace. The agent-credit case declares the developer committer. The
completed-identity and done-catalog cases declare their backlog and done
records through MakeMe and production encoders. Dough Land completion
declares its seed and plan drafts. The racing-suffix fixture declares the
trunk backlog and owned suffix, and keeps the other writer's advance,
rejection and rebase as Git.

### 4. CI root builders declare their repositories

Type: Behavior

Status: planned

Proof: Run the `ci-path-applicability*`, `ci-revision-coverage*`,
`ci-integrated-state*`, `ci-target-branch-worktree*`,
`ci-installed-checkouts` consumers, `ci-repair-stash*`, `ci-host-hook` and
`ci-mailbox-removed-worktree` tests. Their assertions are unchanged.

Replace `initRepo`, the revision coverage and target-branch roots, the
integrated-state judge's starting history and the installed-checkout and
repair-stash roots with descriptions. Workflow text is declared verbatim.
Pushes after the first, sibling branches, stashes, the dirty submodule and
removed worktrees stay Git operations.

### 5. Checkout and preparation fixtures declare their repositories, and superseded setup is removed

Type: Behavior

Status: planned

Proof: Run the `execution-worktree-preparation*`, `default-checkout*`,
`consumer-trace*` and `preparation-publication*` consumers, `publication`,
`resolve-publication-landing-context` and `dough-land-remote-context`. Show by
`git diff` against the plan's starting revision that `ownedWorktreeOnly` and
`advanceOriginFromAnotherWriter` are unchanged. Search for the removed helpers and inline starting
`git init`. Run the whole `npm test` suite and `npm run typecheck:dashboard`
once. Record before and after times for the 158-file selection, against the
313 s baseline, and for the managed delivery and closure families, under
comparable load.

Route the worktree preparation, default checkout, consumer trace and
preparation publication roots through descriptions, keeping `npm install`
as a harness step. Migrate the remaining inline starting repositories.
Delete helpers with no remaining consumer.

## Plan concerns

Slice-plan refinement was not needed. Each slice moves one consumer group
behind the shared materializer with its own focused proof. Slice 1 keeps the
named description byte-compatible, so later groups stay green until their
own slice. No slice-specific concern remains.

Accepted interim behavior: until slices 2 and 3 land, managed delivery,
CI journey and closure consumers read `trunk.txt`, `increment.txt` and the
checkout identities from the named shared description in the clean-trunk
module rather than their call sites. Slices 2 and 3 replace it.
