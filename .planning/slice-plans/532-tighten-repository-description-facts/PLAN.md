# State each repository description fact once and keep native preparation evidence MakeMe-free

**Identity:** SEED-262#tighten-repository-description-facts

**Source:** [State each repository description fact once and keep native preparation evidence MakeMe-free](../../seeds/SEED-262-faster-dashboard-test-feedback.md#tighten-repository-description-facts)

## Provenance

Retrospective correction of
the clean-trunk migration, recoverable at
`42717b7da:.planning/seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-clean-trunk-fixtures`
(`SEED-262#migrate-clean-trunk-fixtures`). Reviewed commits on base
`db42e79a7`: `1f6adb33a`, `0b6bdb925`, `8f7f8443f`, `15cec64d2` and
`91966e3aa`. Its plan is deleted at that story's wrap-up; cite these commits.
The findings below are current at `91966e3aa`.

## Goal and boundaries

A maintainer reading a
[shared repository description](../../../tests/support/repositoryTestData.mjs)
gets exactly the repository it declares. The description and its
[materializer](../../../tests/support/repository-fixture.mjs) state each fact
once and honestly. The native worktree-preparation journey stops depending on
MakeMe, so MakeMe edits no longer change that journey's evidence identity.

Preserved promises and constraints:

- Migrated tests keep their verdicts and assertions.
- The native worktree-preparation repositories (fresh-node, failed-prep,
  reuse, wrapper) stay identical to `db42e79a7`: tree, file modes, remotes,
  commit count and messages, authors, local config and worktree layout.
- The native owned-context helpers `ownedWorktreeOnly`,
  `advanceOriginFromAnotherWriter` and `cloneAsAnotherWriter` keep their
  behavior.
- No paid or native host run. The credential-free default
  `tests/execution-worktree-preparation-native.sh` and
  `tests/native-evidence-identity.sh` may run.
- [Test automation rules](../../../AGENTS.md#test-automation): MakeMe for
  data, never sleep, never `test.slow()`, default timeouts.

Exclusions:

- The reviewed story's exclusions hold: queued and preparation trunks, the
  one-shot payload installation, dashboard origins, Node backlog
  repositories, shell and native fixture migration
  ([sibling story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures)),
  and new caching
  ([faster Git fixture construction](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories)).
- No general branch or merge model.
- Refreshing retained native evidence is paid and manual-only. It is not part
  of this correction.
- Older weakness recorded for provenance only: the git-publication admission
  identity (`tests/support/git-publication-native-evidence.sh:39-42`) already
  hashed `publication-clean-trunk-fixtures.mjs`, `publication-test-fixtures.mjs`
  and `repositoryTestData.mjs` before the reviewed story. Its retained records
  no longer match current inputs. That refresh belongs to
  [the shell release and native fixture story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures).

## Findings

- **F1 (highest impact): native evidence identity hashes MakeMe.**
  `prep_native_input_hash_lines`
  (`tests/support/execution-worktree-prep-native-run.sh:118-127`) hashes the
  import closure of `tests/support/execution-worktree-prep-native-{assess,observe,fixture}.mjs`.
  That closure is 10 modules at `db42e79a7` and 49 at `91966e3aa`, 27 of
  them MakeMe, repository-fixture or product-backlog modules. The native
  builders (`tests/support/execution-worktree-prep-native-locked-node-repository.mjs`,
  `-wrapper-repository.mjs`) and the observer import `git`, `npmEnv`,
  `integritySnapshot`, `setupTraceCount`, markers and digests from
  `src/skills/dough-execute-plan/scripts/execution-worktree-preparation-test-fixtures.mjs`
  and `execution-worktree-preparation-wrapper-test-fixtures.mjs`, which now
  import `makeMe` and `materializeRepository`. About 200 lines of project and
  wrapper file content are duplicated between the native builders and the
  described builders.
- **F2: a workspace identity leaks into the integration checkout.**
  `buildTemplate` (`tests/support/repository-fixture.mjs:108-111`) writes a
  workspace `checkoutIdentity` with plain `git config` from the worktree, so
  it replaces the integration checkout's identity in the shared config. The
  `withWorkspace` JSDoc says it is configured for that worktree.
- **F3: the no-backlog opt-out is an accident of spreading.**
  `backlog: undefined` appears at 28 code sites in 27 files. It works only
  because `please()` spreads `{ backlog: {}, ...first }`; a merge helper that
  drops undefined keys would silently restore the default backlog.
  `writeRevisionFiles` (`tests/support/repository-revision-files.mjs`) writes
  `backlog` before `files`, so a `files[".planning/PRODUCT-BACKLOG.md"]` entry
  silently overwrites a rendered backlog.
- **F4 (low): the test-data architecture is stale.** `tests/README.md`
  ([test data architecture](../../../tests/README.md#test-data-architecture))
  does not describe the workspace and unpublished revisions, the trunk
  branch, the checkout identity, `executables`, the no-backlog fact, or that
  template reuse gives identical commit IDs within one process.
- **F5 (low): builder refusals are untested.** A duplicate name across trunk
  and unpublished revisions, an unknown `from`, an unpublished revision
  without a workspace and a second workspace each throw, but no test covers
  them.

## Current decisions

- **One MakeMe-free preparation project module.** A new
  `src/skills/dough-execute-plan/scripts/execution-worktree-preparation-project.mjs`
  holds the helpers (`git`, `npmEnv`, markers, digests, traces,
  `executionOwnsInstall`, `integritySnapshot`, `integrityUnchanged`,
  `setupTraceCount`, `artifactName`, `artifactPath`, `originOnly`) and the pure
  file maps (`lockedNodeProject`, `wrapperProject`). It imports only Node
  built-ins. The described builders and the native builders both use it. The
  native builders write the same maps into their own `git init` checkout and
  commit once, so their repositories stay as at `db42e79a7`. The native
  observer imports from it too. The described fixture modules re-export
  nothing they no longer own; consumers import helpers from the project
  module.
  - Considered: restoring the two fixture modules to their `db42e79a7` bytes
    would return the identity to its base value. It keeps the duplication,
    and the sibling native migration changes these identities anyway. Not
    chosen.
- **Per-worktree workspace identity.** When a workspace declares
  `checkoutIdentity`, the materializer enables `extensions.worktreeConfig`
  and writes `user.name` and `user.email` with `git config --worktree` in the
  execution worktree. The integration checkout keeps its own identity. The
  integration checkout is never bare, so
  [`workspaceAuthorship`](../../../src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs)
  still reports it configurable.
- **`backlog: null` is the no-backlog fact.** `RevisionFacts.backlog` is
  `Backlog | null`. `please()` gives the first revision the empty backlog
  only when it states no `backlog` and no file at `.planning/PRODUCT-BACKLOG.md`.
  It refuses a revision whose `backlog` key holds `undefined`, and a revision
  that states a non-null `backlog` together with a file at the backlog path.
  `writeRevisionFiles` writes the backlog only when it is non-null.

## Proof ownership

| Example | Owner |
| --- | --- |
| Native closure has no MakeMe, materializer or product-backlog module; native repositories equal `db42e79a7` | Slice 1 |
| Integration commit after a workspace with its own identity is by the integration identity | Slice 2 |
| Each builder refusal throws its message, without Git | Slice 3 (existing), slice 4 (backlog) |
| A trunk without a backlog has no backlog file; a doubly stated backlog is refused | Slice 4 |
| A reader can name every description fact from the README | Slice 5 |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests),
as written there. On AC power, run long runs under `caffeinate -s -i` with
Homebrew Bash first on `PATH`; on battery, follow the lid-open procedure and
read the sleep log.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Focused runs use:

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR bash scripts/test.sh <paths>
```

A quiet pass is exit 0 with no output. Run `npm run typecheck:dashboard`
whenever `tests/support/repositoryTestData.mjs` or MakeMe changes, since
MakeMe is in the dashboard type-check.

Slices 2 and 4 change the shared description and materializer, which 264
node test files load (premise P5). So once before landing, run the whole
`npm test` suite. The dashboard specs use `makeMe.aRepository` but state no
`backlog: undefined` and no backlog-path file (premise P4), so
`npm run typecheck:dashboard` covers them and the dashboard suite needs no
full run.

## Slices

### 1. Native worktree-preparation evidence loads no MakeMe

Type: Structure

Status: planned

Proof: `node tests/support/native-import-closure.mjs . tests/support/execution-worktree-prep-native-{assess,observe,fixture}.mjs`
lists no `tests/support/makeMe.mjs`, `repository-fixture.mjs`,
`repositoryTestData.mjs`, `repository-revision-files.mjs`,
`published-backlog.mjs` or `src/skills/dough-product-backlog/` module; record
its count. Build each native kind (`fresh-node`, `failed-prep`, `reuse`,
`wrapper`) with `node tests/support/execution-worktree-prep-native-fixture.mjs <kind> <dir>`
from this checkout and from a `git archive db42e79a7` export, one after the
other in the same `<dir>` path (the wrapper bakes its path into its script).
Compare `ls-tree -r HEAD`, `rev-list --count`, `log --format='%an <%ae>|%cn|%s'`,
`remote -v`, `config --local --list`, `worktree list --porcelain` without
`HEAD` lines, and the execution worktree's `status --porcelain`: identical.
Focused run: `src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs`,
`execution-worktree-preparation-wrapper.test.mjs`,
`execution-worktree-preparation-reuse.test.mjs`,
`tests/execution-worktree-preparation-native.sh` and
`tests/native-evidence-identity.sh`.

Correction: add the MakeMe-free project module under Current decisions. Point
the described builders, the native builders, the native observer and the
non-native tests at it. Delete the duplicated file-writing bodies in the
native builders in favor of writing the shared maps. The weakness removed is
a paid evidence identity that changes with every MakeMe edit, and two copies
of the same project content.

### 2. A workspace's checkout identity stays with its worktree

Type: Behavior

Status: planned

Proof: extend `tests/support/repository-fixture.test.mjs` with a description
that states `.withCheckoutIdentity(Integ)` and a workspace with
`checkoutIdentity: Work`. After materializing, an empty commit in the
integration checkout is committed by Integ and one in the execution worktree
by Work. It fails at `91966e3aa` (premise P3). Focused run: that file and
`src/skills/dough-story-wrap-up/scripts/closure-story-integration-agent-credit.test.mjs`.

Behavior: a description whose workspace declares its own checkout identity →
materialize and commit in each checkout → each commit carries its own
checkout's declared identity. Fix the `withWorkspace` JSDoc and the
materializer comment to say so.

### 3. Every repository builder refusal has a Git-free test

Type: Structure

Status: planned

Proof: one table test in `tests/support/repository-fixture.test.mjs` with
rows for a duplicate name across trunk and unpublished revisions, an unknown
`from`, an unpublished revision without a workspace and a second workspace.
Each row asserts its message (premise P6). The test materializes nothing.
Discrimination: with each guard disabled in a scratch edit, its row fails;
revert before commit.

Correction: the builder's refusals become proved behavior rather than
untested branches.

### 4. A trunk without a backlog and a backlog stated twice are explicit

Type: Behavior

Status: planned

Proof: add rows to the slice 3 table: `backlog: undefined` is refused, and a
revision stating both a non-null `backlog` and a `files` entry at
`.planning/PRODUCT-BACKLOG.md` is refused. Add a materialized case: a first
revision with `backlog: null` publishes no `.planning/PRODUCT-BACKLOG.md`,
and a first revision with only backlog file bytes publishes those bytes.
`git grep -n "backlog: undefined" -- src tests dashboard` is empty. Focused
run: the 27 files that stated `backlog: undefined`, the test files that load
them, and `tests/support/repository-fixture.test.mjs`. Then
`npm run typecheck:dashboard`.

Behavior: a description stating `backlog: null` → materialize → no backlog
file; a revision stating a backlog twice → `please()` → refused with the
revision named. Replace every `backlog: undefined` with `backlog: null`
mechanically. Premise P4 found no revision stating both explicitly; the
racing-suffix trunk keeps its bytes because it no longer gets the default.

### 5. The test-data architecture describes the repository description

Type: Structure

Status: planned

Proof: review `tests/README.md#test-data-architecture` against
`tests/support/repositoryTestData.mjs`: it names the workspace and its
unpublished revisions, the trunk branch, the checkout identity per checkout,
`executables`, `backlog: null` and the refused double backlog, and that
identical descriptions give identical commit IDs within one process.
`npm run lint` passes.

Correction: update that paragraph in place, short, with links to the
builder and harness.

## Decisive premises

| # | Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- | --- |
| P1 | The native closure loads MakeMe at HEAD and did not at base | `native_import_closure_input_hash_lines` in `prep_native_input_hash_lines` | `node tests/support/native-import-closure.mjs . <assess, observe, fixture>` in this checkout at `91966e3aa` and in a `git archive db42e79a7` export, 2026-11-08 | 49 modules at HEAD, including `makeMe.mjs`, `repository-fixture.mjs`, `repositoryTestData.mjs` and 25 `dough-product-backlog` modules; 10 at base, none of them. All other inputs of `prep_native_input_hash_lines` are unchanged between the two revisions (`git diff --stat` empty) |
| P2 | Native repositories at HEAD equal base, and the comparison route works | `execution-worktree-prep-native-fixture.mjs <kind> <dir>` as the native run invokes it | Built `fresh-node`, `failed-prep` and `wrapper` from HEAD and base in the same path, compared tree, count, log, remotes, local config, worktree list, execution status, 2026-11-08 | Identical. `reuse` is `fresh-node` plus `hostPrepareCheckout`, whose module is unchanged since base |
| P3 | The workspace identity leaks, and per-worktree config fixes it without breaking consumers | `materializeRepository` then `git commit` in each checkout; the two consumer files under `bash scripts/test.sh` | Scratch test in a `git archive 91966e3aa` copy: integration commit by "Work" (expected "Integ"). With the per-worktree scratch fix: passes, and `repository-fixture.test.mjs` and `closure-story-integration-agent-credit.test.mjs` pass quietly | Symptom reproduced; fix confirmed. The P4 run carried the same scratch fix: all 264 builder-loading files passed quietly (exit 0, no output, 315 s), so no other consumer relies on the leak |
| P4 | Which revisions state both a backlog and backlog file bytes | `writeRevisionFiles` during materialization | Scratch log in `writeRevisionFiles` of every revision with a non-undefined `backlog` and a backlog-path file, in a `git archive 91966e3aa` copy, over the 264 P5 files under `bash scripts/test.sh` (Homebrew Bash, `caffeinate -s -i`, alternates and color variables unset), 2026-11-08 | Only `trunk` in the racing-suffix fixture (`publication-racing-suffix.test.mjs`, `publication-racing-suffix-replay.test.mjs`), where the default `{}` was overwritten by file bytes. Under the decided rule that revision gets no default and keeps its bytes, so no call site is restated for this. No revision states an explicit backlog and backlog bytes. `queued-closure-check.test.mjs` states `backlog: undefined` with backlog bytes; it becomes either `backlog: null` or no backlog key, both giving the same bytes |
| P5 | 264 node test files load the shared description | `bash scripts/test.sh` over them | Reverse closure walk with `native-import-closure.mjs` over 432 tracked `*.test.mjs`, 2026-11-08 | 264 files. Dashboard specs `launchJourney.ts`, `longTitleLaunch.ts` and `preparingJourney.ts` use `makeMe.aRepository`; none states `backlog: undefined` or a backlog-path file |
| P6 | The four builder refusals throw today | `RepositoryBuilder` methods and `please()` | `node --input-type=module` calling each at `91966e3aa` | "Duplicate repository revision: t"; "Workspace w starts from unknown trunk revision x"; "Unpublished revision u needs a workspace: call withWorkspace first"; "The repository already has workspace w" |
| P7 | The credential-free native checks run green before the change | `bash scripts/test.sh tests/execution-worktree-preparation-native.sh tests/native-evidence-identity.sh` | This checkout at `91966e3aa`, 2026-11-08 | Quiet pass |

## Concern evidence

Refinement: not needed. Each slice owns one finding with one proof loop,
Structure slices own evidenced corrections with preserved-behavior proof,
and no premise remains open.

Remaining slice-specific concerns: none identified in this review. Slice 4
touches 27 files, but the change is one mechanical replacement under one
focused selection. The whole `npm test` before landing is the broader check
named under Local gates.
