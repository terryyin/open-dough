# Build Node test repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-backlog-scratch-repositories

**Source:** [Build Node test repositories from explicit MakeMe data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-backlog-scratch-repositories)
**Source review:** [source review](source-review.md)

## Goal and boundaries

A maintainer reading a `tests/support` Node test that needs Git can see at its
call site which repository facts drive it. These are the published backlog,
done records, agent profiles and seeds, the ordered revisions the product
reads, and the developer and committer it credits. The tests get them from
`makeMe.aRepository`, materialized by the shared harness. Node test feedback
must not get slower.

On 2026-11-08 the family was:

- `scratchRepo` in `product-backlog-git-fixture.mjs`: 43 calls in the merge,
  merge conflict, hook, ancestry, agent credit and live profile tests, the
  rebase, clean, accepted, sequence and onto tests, the cherry-pick, clean and
  sequence tests, the driver lifetime test and the three done-catalog tests;
- the setup helpers `completeAndCommit`, `completingBranch` and
  `takeAndCommit` in `product-backlog-git-done-catalog-fixture.mjs`, called
  33 times;
- `gitWorkspace` in `product-backlog-done-fixture.mjs`: 7 calls in the
  done-record, intent coverage and identity evidence tests, including
  `projectWithRemovedAllocation`;
- `committedLintFixture` in `lint-runner-fixture.mjs` (format, lint file set
  and both pre-commit hook tests) and `fixture` in
  `local-test-suite-fixtures.mjs` (both local suite tests);
- `trunk` and `trunkOf` in `dashboard-later-trunk-fixture.mjs` and the inline
  repository in `requested-revision-ci-status.test.mjs`.

Exclusions:

- Skill tests under `src/skills` belong to
  clean-trunk and managed delivery (completed
  `SEED-262#migrate-clean-trunk-fixtures`),
  dashboard helpers to dashboard start origins (completed
  `SEED-262#migrate-dashboard-origin-fixtures`),
  and shell or native fixtures, including the shell-driven
  `story-dependencies-installed-observe.mjs`, to
  [shell release and native fixtures](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures).
- The done-record case that runs `complete` outside any Git repository keeps
  its scratch project. It has no repository to describe.
- Caching beyond the materializer's per-process reuse belongs to
  [faster Git fixture construction](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories).
  The description gains no branch or merge model.

The story records a blocking dependency on
[the shared repository builder](../../../tests/support/repository-fixture.mjs).
Execution starts after `makeMe.aRepository` and its materializer are on trunk,
then extends them.

## Current decisions

- **Extend, do not copy.** The call site passes a `makeMe.aRepository`
  description to the shared materializer from plan 510. This plan adds only
  what the family needs: a local checkout without an origin, the configured
  developer, a commit identity per revision, the backlog's near-future
  direction, and init options. No Node-specific builder or Git helper is
  added. [Test data architecture](../../../tests/README.md#test-data-architecture)
- **A local checkout when no remote is read.** The materializer gives a single
  checkout on `main` with no origin when the case reads no remote. Every
  family case works on one local repository today, and the product readers
  under proof read `HEAD` and the configured user name. Per-process reuse
  still applies to identical descriptions.
- **Declared identities.** The configured developer (`user.name` and
  `user.email`) is a checkout fact in the description. A revision's author and
  committer default to the fixed developer identity from plan 510. A case
  whose assertion reads an identity declares it at its call site, as done
  records do for "Terry Yin" and the agent credit cases do for Dana Developer.
  The shared description already states the checkout's configured committer
  through `withCheckoutIdentity`; extend that fact rather than adding a
  second one.
- **Arrangement from encoders, expectations hand-written.** Arrangement
  backlogs are built from `aBacklogEntry` and encoded by production
  rendering. `backlogOf`, `item` and `items` stay as the independent byte
  expectation. A link-only entry line, such as `- [Item A](seeds/A.md#a)` in
  the merge tests, renders from an `aBacklogEntry` whose identity is its link
  (slice 1 learning), so arrangements declare it and expectations keep its
  literal bytes.
- **Declared transitions on Git branches.** A done record comes from
  `aDoneRecord` with `renderDoneRecord`. The catalog comes from
  `catalogDoneRecords` and `renderDoneCatalog` over the rendered records and
  their Git blob hashes. A branch stays a Git operation in the test, and only
  its commit content changes source. A case whose subject is `complete` or
  `catalog-done` still runs it.
- **Harness layers keep today's commit shape.** Copied runner and lint
  tooling, linked dependencies and the local suite runner join the first
  commit, as today, because file-set and hook cases read tracked files. The
  sample files a case checks are declared with their exact bytes. The merge
  driver registration and an init without templates are materializer
  options.
- **Commit graphs stay in Git.** Branches, merges, rebases, cherry-picks,
  conflicts, linked worktrees and staged changes are made with Git after
  materialization.
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed example 1: merge under proof | Slice 1 | All 18 `scratchRepo` test files pass with unchanged assertions, starting from a declared description. Merged bytes still equal `backlogOf` expectations. |
| Seed example 3: transition declared | Slice 2 | The done-catalog, replay, agent credit, driver lifetime and live profile cases pass with no `complete` in setup unless the case proves it. The rebase case still adds the catalog commit as Yui-chan and credits Dana Developer once. |
| Seed examples 2 and 4: developer and history | Slice 3 | The done-record test declares Terry Yin and the record names Terry Yin. The identity evidence case declares three revisions and still names the allocating commit. |
| Seed example 5: harness layer and literal files | Slice 4 | The format, lint file set, pre-commit lint and typecheck hook, and both local suite tests pass with their checked files declared verbatim. |
| Seed examples 6 and 7, evaluation | Slice 5 | The later-trunk build and landed tests and the requested-revision CI test pass. A repository search finds no `tests/support` Node test with its own `git init` for a starting repository. Before and after times are recorded. |

## Decisive premises

Observed on 2026-11-08 at `3cb2bf37e` in this worktree on macOS with Node
24.21.0.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 2 replaces `complete` in setup with encoder writes | `node <job-tmp>/p3.mjs` built `scratchRepo` with Items A, B and C and ran `completingBranch(feature, [B], 2026-10-05)` and `completeAndCommit(A, 2026-10-04)`. It then rendered each record from `aDoneRecord` with the record's identity, title, completedAt and developer, and each catalog with `catalogDoneRecords` and `renderDoneCatalog`, using the Git blob hash `sha1("blob <len>\0" + text)` | Both records and both catalogs were byte for byte equal to what `git show` returned at `feature` and `main`. Without the blob, the catalog differed. The developer was "Test", the fixture's hidden name, so the declared record must state it. |
| Slice 1 renders arrangement entry lines | `node <job-tmp>/p4.mjs`: `renderEntry` of `aBacklogEntry` against `item("A")` from the merge fixture, `items("A")` from the done-catalog fixture and `takenEntry` | All three were the same bytes. Corrected in slice 1: a link-only entry renders when its identity is its link. |
| Slice 1 matches `backlogOf`'s whole-backlog shape | `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/product-backlog-direction.test.mjs tests/support/product-backlog-correction-story.test.mjs`. These tests assert that real command output equals `backlogOf`, with and without direction. | Exit 0, a quiet pass of 7 tests. Production rendering writes `backlogOf`'s heading, direction and list layout. Plan 510's description encoder uses that rendering. Its use through `makeMe.aRepository` is checked when plan 510 lands, by slice 1's first focused run. |
| Slice 1 keeps feedback speed with a local checkout | `node <job-tmp>/t.mjs` twice at load about 5.7. Each shape was built 30 times: a single repository with one commit, a bare origin with a checkout and push, and a copied template | 61.5–63.8 ms, 127.7–130.7 ms and 17.1–17.7 ms. The local checkout runs the same Git operations as `scratchRepo`. In-process encoding adds no Git process, so it cannot change the result materially. |
| No paid run | Search of every `*.sh` and `*.bash` file for the family's fixture module names | No match, so no native evidence input changes |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Never sleep, never use `test.slow()`, and keep the default timeouts. For full
runs on awake macOS with AC power, use `caffeinate -s -i` and put Homebrew Bash
first on `PATH`. On battery, follow the lid-open procedure and check the sleep
log. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs its focused Node selection with
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <paths>`. Run
`npm run typecheck:dashboard` whenever MakeMe changes, because the dashboard
type-check includes its builders. Measure times under comparable load and
record the load. The materializer is shared with plan 510's dashboard and
skill consumers. So once before landing, run the whole `npm test` and the
plan 510 attention spec with
`npm run test:dashboard -- tests/sessions/agent-launch-attention.spec.ts --workers=2`,
with `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and `FORCE_COLOR` unset.

## Slices

### 1. Backlog Git tests declare their starting repository

Type: Behavior
Status: done
Proof: First record the before time of the 18 `scratchRepo` test files in one
`scripts/test.sh` run. After the change the same selection passes with
unchanged assertions, and the after time does not regress beyond run-to-run
noise. `npm run typecheck:dashboard` passes.

Accepted 2026-11-08: 42 call sites in the 18 files (the earlier count of 43
was a miscount) declare `makeMe.aRepository` and use `checkoutOf`, which wraps
the new shared `materializeLocalCheckout` (no origin, per-process template
reuse, `gitTemplates: false` option). Same 18-file run: before 26.9 s (load
15.8) and 21.7 s (17.0); after 16.2 s (12.8), 20.4 s (16.6), 14.9 s (13.2).
Type-check passed; the 187 other importers of the changed fixtures passed;
dashboard `agent-launch-attention`, `backlog-preparing` and
`agent-launch-start-story-card` passed. Learning: the "cannot be rendered"
premise was false; `renderEntry` writes a link-only line when the identity is
the link. Branch commits and setup `complete` now run as the declared or
default checkout identity instead of "Test"; no assertion reads it.

Behavior: a merge, rebase, cherry-pick or driver test that today calls
`scratchRepo(t, backlog)` → it passes a `makeMe.aRepository` description of its
starting backlog, with direction when read, to the materializer's local
checkout → the checkout holds one commit on `main` with the rendered backlog,
and the test's Git operations, real CLI runs and assertions are unchanged.

Add the local checkout, configured developer, revision identity, direction and
init-without-templates options to the shared description and materializer.
`scratchRepo`'s repository creation is removed. The handle helpers
(`linkedWorktree`, `commitBranch`, `commitOn`, `stageResolution`) keep running
Git on the returned checkout.

### 2. Done-catalog branches declare their records and profiles

Type: Behavior
Status: done
Proof: Run the five tests that call the setup helpers: done-catalog,
replay, done-catalog agent credit, driver lifetime and merge live profile. They pass with unchanged
assertions. A search shows `complete` in setup only where the case proves it.
Record before and after times.

Accepted 2026-11-08: `completeAndCommit(repo, record, { released })` and
`completingBranch(repo, branch, records)` commit a declared `doneRecord(name,
completedAt, facts)`, with the entry removed by production
`completeEntry` and the catalog rebuilt by production `rebuildDoneCatalog`.
A scratch equivalence build against the real `complete` gave identical trees,
authors and subjects. Five-file run: before 6.5 s and 6.7 s (load 9.6), after
6.7 s (9.8) and 6.2 s (10.1). Learning: `complete` also releases the
executing profile and copies its agent, host and model into the record, so
live-profile cases declare that through `completedBy(profile)`. The refactor
pass dropped the record developer where no case reads it (the adapters credit
the developer from Git config) and moved the publication-merge case into
`product-backlog-git-done-catalog-publication.test.mjs`; the six files and the
done-records publication consumer passed in 6.1 s at load 3.7.

Behavior: a done-catalog case that arranges "feature completed B at
2026-10-05" → its branch commit holds the declared done record and derived
catalog → the rebase, merge or cherry-pick under proof produces the same
commits, authors, trailers and catalogs as before.

`completeAndCommit` and `completingBranch` commit declared records instead of
running the CLI. `takeAndCommit` already renders `anAgentProfile` and stays a
branch commit.

### 3. Done-record and identity evidence repositories declare their developer and history

Type: Behavior
Status: done
Proof: Run `product-backlog-complete-done-record`,
`product-backlog-complete-intent-coverage` and the identity evidence tests.
They pass with unchanged assertions.

Accepted 2026-11-08: `gitWorkspace` is replaced by slice 1's `checkoutOf`,
which now also returns named `revisions`. The credit tests moved to
`product-backlog-complete-credit.test.mjs`; the three of them that assert the
developer declare Terry Yin with `withCheckoutIdentity`; renaming it failed
exactly those three. The identity evidence case declares its three revisions,
each removing the done catalog because that project publishes none. Four-file
run: before 2.2 s and 2.1 s (load 7.3), after 1.9–2.4 s (load 9.3–17.8); 63
direct and 95 indirect fixture importers passed. Learning: the "No paid run"
premise searched shell files only. Retained native admission records list
`product-backlog-fixture.mjs` and `repositoryTestData.mjs` among their
`input-hash` identity lines. Those lines identify the recorded evidence; no
check compares them with current files, and other listed inputs such as
`makeMe.mjs` changed after recording too, so no paid run follows.

Behavior: the done-record test declares Terry Yin as configured developer →
real `complete` records Terry Yin. The identity evidence case declares
"Active work", "Allocate SEED-090" and "Clean up SEED-090", the last removing
the seed and record → `identity-evidence` names the allocating revision.

`gitWorkspace` is removed. A case that writes files after materializing and
does not commit them keeps doing so.

### 4. Lint and local suite repositories declare their checked files

Type: Behavior
Status: planned
Proof: Record before times, then run the format changed files, lint file set,
pre-commit lint hook, pre-commit typecheck hook, local test suite and local
suite lifecycle tests. They pass with unchanged assertions, and the after time
does not regress beyond noise.

Behavior: a lint or suite case declares its sample files and probe checks with
exact bytes → the materializer adds the runner tooling as a harness layer in
the same first commit, with linked dependencies excluded as today → the file
set, hook outcomes and suite lifecycle are unchanged.

### 5. Ancestry repositories declare their trunk and superseded setup is gone

Type: Behavior
Status: planned
Proof: Run `dashboard-later-trunk-build`, `dashboard-later-trunk-landed` and
`requested-revision-ci-status`. They pass with unchanged verdicts. Search
`tests/support` Node files for `"init"` and the removed helpers and record the
result. Then run the pre-landing gates above.

Behavior: `trunkOf(count)` declares its landing and later revisions, and
`trunk()` declares the landing and first later revision and builds the side
branch, merge and last two revisions with Git. The CI status case declares its
workflow bytes and its base, planning and code revisions → the forward walk
and status verdicts are unchanged, and no family test keeps its own
`git init`.

## Plan concerns

Refinement not needed: each slice has one proof loop over one migration rule,
and the shared description and materializer are extended once in slice 1.
This review found no remaining slice-specific concern. The only waiting
condition is the recorded dependency on plan 510.
