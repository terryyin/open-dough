# Start from owned repository context and refresh truthfully

## Source and authority

- **Identity:** SEED-008#owned-context-start-and-truthful-refresh.
- **Source:** [correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#owned-context-start-and-truthful-refresh),
  a bounded retrospective correction of
  [SEED-008#same-machine-merge-queue](../../seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue)
  and its [plan 140](../140-remote-history-workflows/PLAN.md) (all six slices done).
- **Provenance:** reviewed commits on `claude/remote-history-workflows`:
  `9597bf61`, `80ab5df2`, `600f5f45` (CI repair), `615df2ad`, `4d0c94a2`,
  `be1ba87f`, `b3dfd569`; claim `5a5087c6`. Findings were rechecked against
  `b3dfd569`.
- **Authority:** the execution retrospective's parent-agent delegation asks
  for slice planning only. It grants no implementation, Take, queueing,
  execution, commit, or publication. This plan is written in the
  retrospective's supplied execution checkout; no preparation workspace or
  assignment was created for it.

## Outcome and boundaries

Developers can start and land owned work from an owned repository context
alone and get a truthful, fast-forwarding refresh. This completes the original
story's example 3 ("an owned worktree has repository access … no default
checkout is supplied → start execution …") and its "clean and behind →
fast-forward" promise. Retirement mechanics and refresh-result guidance keep
one representation each.

Preserved promises and constraints: remote acceptance comes before optional
refresh; refresh never erases acceptance or blocks eligible cleanup; developer
checkout bytes are preserved; existing refusal gates (invalid repository,
remote, authority, mismatched resume, unready remote preparation) remain; Story
Branch history and CI gates are unchanged; no lock, registry, scheduler, or
second publisher. Edit sources only in `src/skills/`, never installed copies.
Guidance follows ADR 0006's executing-agent audience. When behavior is removed,
do not add "no longer" prose.

### Excluded (human decisions; do not plan or implement)

- **F1b:** fast-forwarding a clean, strictly-behind owned or host worktree on
  reuse. Reuse still requires the workspace to equal clean fetched trunk.
- **F3:** whether an explicit current-checkout direct edit stops on unrelated
  staged content (guidance says stop; runtime and tests commit around it).
- **F4:** removing the vestigial declared-owner concept.
- **F7 (payload part):** whether shipped mechanics modules with no entry point
  get one or leave the payload. Slice 5 keeps the existing module locations.
- **F8:** which native-acceptance story owns this story's changed guidance
  (ADR 0005). No native result is claimed here.
- **F5:** checkout-vocabulary unification.
- Splitting `docs/project-visibility-requirements.md`.
- A runtime guard against pushing unrelated unpublished commits on
  current-checkout delivery.

Considered but excluded as outside this outcome: ending a lost preparation
workspace's assignment (`preparation-assignment.mjs abandon --profile`) from an
owned context. It still requires `--integration`. It is neither starting nor
landing, and no finding covers it.

## Current findings (rechecked at `b3dfd569`)

| Code | Finding | Evidence |
| --- | --- | --- |
| F1a | Without `--integration`, a new owned workspace cannot be created; startup and preparation refuse. | `execution-start-request.mjs:87-91`; `preparation-assignment-trunk.mjs:44-51`; refusal encoded at `workspace-publication-startup-owned-context-cases.mjs:184-191` and `preparation-assignment-owned-context.test.mjs:33-40`; fixture `default-checkout-test-fixtures.mjs:26-46` pre-creates the only worktree at `origin/main`. |
| F2 | A leftover `REBASE_HEAD` makes shared refresh defer (`ongoing-operation`) forever. | `maintain-default-checkout.mjs:8-13,102-111`; `publication-checkout-maintenance.test.mjs:146-179` asserts deferral for a planted ref alone. Other recognizers use state directories: `product-backlog-git-operation-state.mjs:34-44` (`rebaseStateDirectory`, not exported) and `dough-land-test-fixtures.mjs:109-128`. |
| F6 | Refresh-result guidance is inconsistent. | Wrap-up `SKILL.md:228-230` names only not applicable or deferred; Land `SKILL.md:93-97` includes stopped; `trunk-publication.md:97-101` omits not applicable. The owner is `maintain-default-checkout.md#independent-maintenance-outcome` (lines 10-33). |
| F7 | Retirement mechanics are modelled twice. | The Land test model `closeOrRetainWorkspace` (`dough-land-test-fixtures.mjs:49-97`) duplicates the shipped `removeExecutionResources` (`closure-resources.mjs:137-249`). It lacks the already-absent rerun handling that Land's "Retire the worktree" requires. |
| F9 | Test redundancy and a missing example. | (a) `workspace-publication-startup-local-copy-cases.mjs:127-137` is subsumed by `:139-190`. (b) The setup plus first-delivery block is repeated in `…owned-context-cases.mjs:103-135`, `…local-copy-cases.mjs:155-189`, and `workspace-publication-startup-journey-cases.mjs:40-90`. (c) `dough-land.test.mjs:220` overlaps `dough-land-rerun.test.mjs:162` and `publication-checkout-unavailable.test.mjs:29`, and `dough-land.test.mjs` is 257 lines. (d) Key example 7 lacks the case of a ready local copy with unready remote preparation (`workspace-publication-startup-source-cases.mjs:17-40` has local HEAD equal to the stale remote). |

## Architecture and existing solutions

- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one representation per concept. It governs the single in-progress recognizer
  (slice 3), the single retirement mechanics (slice 5), and the single owner of
  refresh-result vocabulary (slice 4).
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  changed start/preparation guidance addresses the executing agent and its
  project, and links shared rules rather than repeating them.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  deterministic proof here is not native evidence. Native ownership is F8,
  which is excluded.
- ADR 0004: shipped runtime changes keep the declared payload complete. Run the
  payload checks when imports change.
- Follows [North Star: Remote history and optional local refresh](../../NORTH-STAR.md#remote-history-and-optional-local-refresh):
  a default checkout is optional, and refresh is a separate local outcome.
  This plan needs no new direction.

PFE (reuse, no new mechanism):

- `selectOwnedWorkspace` already creates a worktree from any supplied
  `repository` (`workspace-publication-select.mjs:71-133`), so F1a only needs
  the request to accept a repository context separate from the refreshed
  integration checkout.
- `rebaseStateDirectory` in `product-backlog-git-operation-state.mjs` is the
  existing state-directory rebase detection. It is installed in the same payload
  (`install.sh:87`), and execute-plan already imports from dough-product-backlog.
- `removeExecutionResources` holds the shipped retirement mechanics, including
  already-absent handling. Its wrap-up gates (observer, closure SHAs, remote
  execution branch) wrap a containment-and-removal core that Land's model can
  share.

## Observed premises

Observed on `b3dfd569` (only `DearDough.md` and `ProjectFindings.md` were
uncommitted) on 2026-09-28:

| Premise | Literal observation and result | Consequence |
| --- | --- | --- |
| The Git context of an owned worktree or of the common Git directory is enough to create a new workspace at fetched trunk. | A temporary Node probe under `/Users/terryyin/.claude/jobs/06628f74/tmp` (removed afterwards) built `createQueuedTrunk` plus `ownedWorktreeOnly` and ran the installed `execution-start.mjs start` via `startCliResult`. It passed the new workspace path `start-fresh`, with `--integration` set to (i) `repository.git` and (ii) the owned worktree. Both runs exited 0 with `published`, `created: true`, starting revision equal to trunk, the remote claim equal to `publishedSha`, the retained owned worktree still at trunk, and 3 worktrees listed. Maintenance was misreported: (i) `deferred/refresh-failed` ("must be run in a work tree"), (ii) `stopped/unexpected-branch`. | Slice 2 is a request-level separation: repository context without refresh. Selection, source reading, agent rotation, and claim publication need no change. Passing the context as `--integration` is wrong because it triggers refresh. |
| Git 2.50 leaves `REBASE_HEAD` after a completed conflicting rebase. | In a temporary repository with Git 2.50.1 (Apple Git-155): conflicting `git rebase main`, then resolve, `add`, `GIT_EDITOR=true git rebase --continue`. During the rebase: `rebase-merge` present, `REBASE_HEAD` present. After it: `rebase-merge` absent, `rebase-apply` absent, `REBASE_HEAD` present, status clean. A second probe on `main` then ran `git reset --hard <older base>` and `git merge --ff-only`; `REBASE_HEAD` still verified after each. Directories removed. | Slice 3 detects a rebase by its state directory; the leftover ref alone must not defer refresh. Slice 3's proof can create a clean, strictly-behind checkout that keeps the leftover ref through `reset --hard`. |
| The refresh and Land recognizers differ; only the Land model uses state directories. | Read `maintain-default-checkout.mjs:8-111` and `dough-land-test-fixtures.mjs:109-128`. `rg -n "REBASE_HEAD\|rebase-merge\|ongoingOperation\|unfinishedOperation" src/skills` lists no other production recognizer. `publication-racing-suffix-fixtures.mjs:80` and `one-shot-queued-races.test.mjs:62` are test-only. | Slice 3 changes one production recognizer and the Land model. |
| `ongoing-operation` consumers. | `rg` shows refresh in `publication-checkout-maintenance.test.mjs:141,176` and `workspace-publication-startup-maintenance-cases.mjs:22-83` (index lock and unit reporting only). The Land rerun asserts `unfinished-operation` during a real conflicting rebase (`dough-land-rerun.test.mjs:64`). | These assertions stay. Only the planted-`REBASE_HEAD` expectation changes, and a real rebase still defers. |
| Callers of the two retirement representations. | `rg -n "closeOrRetainWorkspace\|removeExecutionResources\|landWorktree" src/skills` finds the Land model, `dough-land*.test.mjs`, `preparation-assignment-{land,landing-retry,remote-base,reuse}.test.mjs`, `preparation-publication.test.mjs`, `retained-artifacts.test.mjs`, `closure-publication.mjs`, and the `closure-*` tests. | Slice 5 proof covers all of these caller suites. |
| Guidance names `--integration` for creation. | `rg -n -- "--integration" src/skills` finds `dough-execute-plan/SKILL.md:114` and `preparation-assignment.md:36,43-47,192`, plus `admit-accepted-work.md:48` (drafts, unchanged) and `preparation-lost-workspace.md:28` (excluded). | Slice 2 aligns the first two. |
| Focused baseline is green. | `node --test` over `workspace-publication.test.mjs`, `preparation-assignment-owned-context.test.mjs`, `preparation-assignment-remote-base.test.mjs`, `publication-checkout-maintenance.test.mjs`, `publication-checkout-unavailable.test.mjs`, `dough-land.test.mjs`, `dough-land-rerun.test.mjs`, `dough-land-remote-context.test.mjs`, `preparation-publication.test.mjs`, `retained-artifacts.test.mjs`, `closure-resource-cleanup.test.mjs`, and `closure-publication-remote-context.test.mjs`: 59 pass, 0 fail, 46.4 s. | These are the starting boundaries. The old refusal and deferral expectations are a baseline, not proof of the corrected behavior. |
| Sizing context. | Highest allocation across all refs was 141; `142` was free when rechecked. No project slice target or hard limit was supplied. | Size each slice by one cohesive outcome and one proof loop, without an invented timing policy. |

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| A ready-looking local copy never overrides unready or stale remote preparation (key example 7). | 1: installed start CLI refuses with `source-refused` and `needs-reassessment`; no claim or workspace; local bytes unchanged. |
| Startup proof has one setup-and-first-delivery journey, with no subsumed per-layer runs. | 1: the surviving cases keep every prior assertion (all layers, deep-equal local sources, setup markers, accepted first increment). |
| From an owned worktree or common Git directory alone, queued startup and preparation create a new owned workspace at fetched trunk with refresh `not applicable`, leaving the retained worktree unchanged. | 2: installed `execution-start.mjs` and `preparation-assignment.mjs` from `ownedWorktreeOnly` with a new workspace path. Observe `created: true`, starting revision equal to fetched trunk, remote claim or announcement, the retained worktree HEAD and bytes unchanged, then setup and first delivery (start) or first draft plus continue (preparation). |
| Invalid repository, remote, authority, and mismatched-resume refusals still hold without a default checkout. | 2: existing refusal cases, repointed at the new argument where it participates. |
| A clean, strictly-behind default checkout with only a leftover `REBASE_HEAD` advances; a real in-progress rebase still defers and is preserved. | 3: shared refresh unit cases on real Git state, plus the Land model's `unfinished-operation` stop during a real rebase and its success after `--continue`. |
| Refresh-result vocabulary has one owner that callers link. | 4: read-through of Land, wrap-up, and trunk publication. Each links `maintain-default-checkout.md#independent-maintenance-outcome` without a subset enumeration. |
| Land and wrap-up retire through one mechanics representation, including already-absent resources on a rerun. | 5: Land, preparation, bug-fixing, and closure suites pass through the shared core. A new Land rerun case with an already-removed worktree or branch reports already retired from the recorded management context. |
| No redundant unusable-path Land test; `dough-land.test.mjs` is at most 250 lines. | 5: the rerun case and the `publication-checkout-unavailable` unit remain; line count checked. |

## Ordered slices

### 1. Startup proof suite shares one first-delivery journey and covers a ready local copy
Type: Structure
Status: planned

Correction: removes the test-suite weaknesses F9a, F9b, and F9d while product
behavior stays unchanged. It also enables slice 2's creation journey without a
fourth copy of the setup-and-delivery block.

- Extract one test helper in the startup test fixtures (for example
  `workspace-publication-startup-test-fixtures.mjs`) that runs the readiness
  gate in a workspace, asserts setup markers there, commits one increment,
  delivers it through managed delivery, and asserts acceptance on origin with
  its parent. Use it in `…owned-context-cases.mjs`, `…local-copy-cases.mjs`,
  and `…journey-cases.mjs`. Keep each case's own extra assertions, such as
  markers absent from the integration checkout and journey role order.
- Delete the per-layer loop test (`local-copy-cases.mjs:127-137`). The
  all-layers test (`:139-190`) is the surviving coverage: it covers worktree,
  index, and commit layers with deep-equal local sources.
- In `…source-cases.mjs`, extend stale readiness. After pushing the stale
  change, restore the assessed story bytes locally in the integration
  checkout's worktree and index, so the local copy is ready-looking. Start
  still refuses with `needs-reassessment`, creates no claim or workspace, and
  leaves the local bytes deep-equal.

Proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
passes with every prior assertion still present (compare assertion lists before
and after). The new stale-readiness parameter passes because published
readiness governs. Then run the whole `node --test`. Safe stop: the suite is
leaner and key example 7 is proven, with no product change.

### 2. A new owned workspace starts from an owned repository context
Type: Behavior
Status: planned

Behavior: The repository has no default checkout, only an owned worktree and
its common Git directory → run installed queued startup, or preparation
`start`, with `--repository <owned worktree or common Git dir>`, a new
`--workspace` path and `--branch` → a new owned workspace is created at fetched
trunk on that branch, the claim or assignment is published, refresh reports
`not applicable`, and the retained worktree is unchanged. Setup, the first
delivery, the first draft, and continue proceed from the result.

Decision (smallest CLI expression): add one optional `--repository PATH` to
`execution-start.mjs start` and `preparation-assignment.mjs start`. It supplies
Git access only: fetch, source reading, agent rotation, and worktree creation.
It is never refreshed and never read for admission drafts. The request's Git
context is `integration ?? repository ?? workspace`. Refresh and draft reading
stay keyed to `--integration` only. Supplying both flags needs no new gate.
Without either flag, a missing workspace still refuses (`invalid-request`), and
the message names `--repository`. There is no origin-mode flag, registry, or
clone lifecycle.

Changes:

- `execution-start-request.mjs`, `execution-start.mjs` usage,
  `preparation-assignment-ownership.mjs` request normalization,
  `preparation-assignment-trunk.mjs` (fetch and select from the repository
  context), and `preparation-assignment.mjs` usage.
- Replace the refusal expectations in `…owned-context-cases.mjs:184-191` and
  `preparation-assignment-owned-context.test.mjs:33-40` with creation journeys.
  Keep the "neither flag and missing workspace" refusal as a separate
  assertion.
- Guidance: `dough-execute-plan/SKILL.md` (around line 114) and
  `preparation-assignment.md` (lines 36-50 and 192) say to supply
  `--integration` when the project has a default checkout, otherwise
  `--repository` with an owned worktree or common Git directory when creating a
  workspace. Keep the ADR 0006 audience.

Proof: in `…owned-context-cases.mjs`, run the installed start from
`ownedWorktreeOnly` with `--repository` set to (i) `owned.repository` and
(ii) `owned.workspace` (parameterized) and a new workspace path. Observe
`created: true`, `startingRevision` equal to `trunk.trunkSha`, `maintenance`
equal to `not applicable`, the origin claim, the retained worktree's HEAD and
status unchanged, and worktree list equal to repository, owned, and new. Then
run slice 1's setup-and-first-delivery helper in the new workspace. In
`preparation-assignment-owned-context.test.mjs`, the same creation gives
`selection.created: true` at fetched trunk, `refresh` equal to
`not applicable`, and a first draft plus `continued` reuse. Invalid repository,
wrong remote, missing authority, and mismatched-resume refusals stay green.
Run `workspace-publication.test.mjs`,
`workspace-publication-admission.test.mjs`, `one-shot-*.test.mjs`,
`preparation-assignment-*.test.mjs`, and
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` with the
`payload-declaration-links`, `execution-payload-update`, and
`story-payload-update` checks. Then run the whole `node --test`. Walk one
representative guidance use (behavior review in `AGENTS.md`). Safe stop: owned
startup and preparation need no default checkout, including to create a
workspace.

### 3. Refresh recognizes a rebase by Git's rebase state
Type: Behavior
Status: planned

Behavior: A supplied default checkout on the integration branch is clean and
strictly behind fetched trunk, with a leftover `REBASE_HEAD` and no rebase
state directory → refresh after accepted publication → result `advanced`, with
the checkout at fetched trunk. With a real in-progress rebase (a
`rebase-merge` or `rebase-apply` directory) → `deferred`
(`ongoing-operation`), and the rebase and bytes are preserved.

Changes:

- Export the existing state-directory rebase detection from
  `product-backlog-git-operation-state.mjs` (for example
  `rebaseInProgress(repoRoot)` built on `rebaseStateDirectory`).
- In `maintain-default-checkout.mjs`, drop `REBASE_HEAD` from the ref list,
  use that export for rebase, and export the single `ongoingOperation`
  recognizer (index lock, `MERGE_HEAD`, `CHERRY_PICK_HEAD`, `REVERT_HEAD`,
  rebase state).
- Replace `unfinishedOperation` in `dough-land-test-fixtures.mjs` with that
  recognizer.
- Keep guidance wording ("an in-progress … rebase") unchanged, since it
  already states the intent.

The planted-`REBASE_HEAD` expectation in
`publication-checkout-maintenance.test.mjs:146-179` changes. The story promises
"clean and behind → fast-forward". Guidance defers only for an *in-progress*
rebase. The old test's intent (defer during a real rebase) is preserved by a
real-rebase case. Keep the planted `MERGE_HEAD`, `CHERRY_PICK_HEAD`,
`REVERT_HEAD`, and dangling-ref cases.

Proof: in `publication-checkout-maintenance.test.mjs`, (i) run a real
conflicting rebase in the checkout's own history, so the checkout is mid-rebase
→ `deferred`/`ongoing-operation`, with HEAD, the state directory, and bytes
unchanged. (ii) Complete it with `rebase --continue`, then
`git reset --hard` to an ancestor of fetched trunk so it is clean and strictly
behind. Assert that `REBASE_HEAD` still verifies → `advanced` to fetched trunk.
The Land rerun (`dough-land-rerun.test.mjs:64` onward) still stops with
`unfinished-operation` during the real rebase and lands after `--continue`.
Run `publication-checkout-*.test.mjs`, `workspace-publication.test.mjs`
(startup maintenance cases), `dough-land*.test.mjs`, the
`closure-publication*.test.mjs` refresh cases, the product-backlog rebase suites
that import the operation-state module, and `payload-declaration-links` plus
`execution-payload-update` through `scripts/test.sh`. Then run the whole
`node --test`. Safe stop: refresh is truthful, and one recognizer serves refresh
and the Land model.

### 4. Refresh-result guidance links its single owner
Type: Structure
Status: planned

Correction: removes F6's divergent subset enumerations (a guidance
representation weakness). Behavior stays the same:
`maintain-default-checkout.md#independent-maintenance-outcome` already states
that no deferred, stopped, or not-applicable result erases acceptance.

- In `dough-land/SKILL.md` "Refresh the default checkout", state that any
  refresh result other than advanced or already current does not block
  retirement, linking the owner's vocabulary instead of listing examples.
- Point wrap-up `SKILL.md:228-230` at that statement or the owner rather than
  "not applicable or deferred".
- In `trunk-publication.md:97-101`, replace "A deferred or stopped refresh"
  with a link to the owner's independent-outcome rule.
- Where the owner lacks the retirement sentence, it stays with Land, the
  retirement owner, and wrap-up links it. Do not repeat it.

Proof: a read-through of Land, wrap-up, and trunk publication. None enumerates
a subset of results, and each links the owner. `rg -n "not applicable|deferred
or stopped|deferred, or stopped" src/skills --glob '*.md'` shows no remaining
subset list in these three callers. Run `node --test` guidance tests that match
these texts: `dough-land-guidance.test.mjs`,
`ci-completion-lifecycle-guidance.test.mjs`,
`workspace-ownership-lifecycle.test.mjs`, and any wording test found with
`rg -l "Refresh the default checkout|trunk-publication" src/skills --glob
'*.test.mjs'`. Then run the whole `node --test` and `payload-declaration-links`.
Safe stop: one vocabulary owner.

### 5. Land's model retires through the shared retirement mechanics
Type: Structure
Status: planned

Correction: removes F7's duplicated retirement representation (ADR 0002) and
F9c's overlapping Land test. Behavior at Land, preparation, bug-fixing, and
wrap-up boundaries is preserved. The Land model gains the already-absent rerun
handling that Land guidance requires.

- In `closure-resources.mjs`, separate the containment, worktree removal, and
  safe branch deletion core (management context, listed or already-absent
  worktree, dirty or ambiguous preservation, fetch, containment in the tracking
  ref, verified removal) from wrap-up's gates (observer, closure SHAs, remote
  execution branch). `removeExecutionResources` keeps its result shape and
  gates.
- Replace `closeOrRetainWorkspace` in `dough-land-test-fixtures.mjs` with a
  thin adapter. It keeps the model's `confirmedDisposition` and
  `sessionCreated` preconditions and calls the core. Keep caller assertions
  meaningful: update `preparation-publication.test.mjs`,
  `retained-artifacts.test.mjs`, and `preparation-assignment-*.test.mjs` only
  where the result shape changes.
- Keep the core in its current shipped module. Its payload status is excluded
  (F7 human decision). Keep `closure-resources.mjs` at most 250 lines. If a new
  module is unavoidable, declare it in `install.sh` and run the payload checks.
- Delete `dough-land.test.mjs:220` ("reports a failed refresh of an unusable
  default checkout path … retires"). The surviving coverage is
  `dough-land-rerun.test.mjs:162` plus the unit at
  `publication-checkout-unavailable.test.mjs:29`.

Proof: add a Land rerun case to `dough-land-rerun.test.mjs`. After an accepted
landing retired the worktree (and, separately, with only the branch already
deleted), retirement is run again from the management context recorded before
removal. It reports already-absent or already retired, pushes nothing, and
does not throw. Run `dough-land*.test.mjs`, `preparation-publication.test.mjs`,
`preparation-assignment-*.test.mjs`, `retained-artifacts.test.mjs`, and
`closure-*.test.mjs` (in particular `closure-resource-cleanup`,
`closure-story-branch-cleanup`, `closure-publication-remote-context`, and
`closure-named-target`). Check `wc -l dough-land.test.mjs closure-resources.mjs`
is at most 250 each. Run `payload-declaration-links` and `story-payload-update`
through `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh`, then the whole
`node --test`. Safe stop: one retirement representation serves Land's model and
wrap-up.

## Current decisions

- `--repository` is the only new CLI surface. `--integration` keeps meaning a
  default checkout that is refreshed and read for drafts.
- One in-progress recognizer lives in `maintain-default-checkout.mjs`. Its
  rebase detection reuses `product-backlog-git-operation-state.mjs`.
- Retirement mechanics stay in `closure-resources.mjs`, with its payload status
  unchanged.
- Verification: focused suites per slice, then the whole `node --test` before
  each slice returns. Shell checks run only through
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <check>`. Paid native runs
  (`claude --print`, `codex exec`, `cursor agent`) are never part of this plan.
- Use independent post-change refactoring and ordinary managed delivery when
  execution is later authorized. Do not hand-synchronize installed copies.

## Learnings

None yet.

## Concern review

No blocking slice-specific concern was identified in this review. Each slice
has one outcome and one proof loop. The Behavior slices (2, 3) change
one model each: the request's Git context, and the in-progress recognizer. The
Structure slices (1, 4, 5) each remove one evidenced duplicate representation.
They prove preserved behavior at the affected external boundaries and add no
speculative preparation. Slice 1 precedes slice 2, whose proof uses its helper.
Slices 3-5 are independent of slice 2 and of one another, except that slice 5
touches the Land model after slice 3 changes its recognizer. Keep that order.
The request separation and Git's leftover-ref behavior were observed directly.
The proof that the product adopts them is owned by the slices above and is not
claimed as green.
