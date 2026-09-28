# Start from owned repository context and refresh truthfully

## Source and authority

- **Identity:** SEED-008#owned-context-start-and-truthful-refresh.
- **Source:** [correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#owned-context-start-and-truthful-refresh),
  a bounded retrospective correction of
  `SEED-008#same-machine-merge-queue` (`199c579f:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`)
  and its plan 140 (`199c579f:.planning/slice-plans/140-remote-history-workflows/PLAN.md`) (all six slices done).
- **Provenance:** reviewed commits on `claude/remote-history-workflows`:
  `9597bf61`, `80ab5df2`, `600f5f45` (CI repair), `615df2ad`, `4d0c94a2`,
  `be1ba87f`, `b3dfd569`; claim `5a5087c6`. Findings were rechecked against
  `b3dfd569`.
- **Authority:** the execution retrospective's parent-agent delegation asks
  for slice planning only. It grants no implementation, Take, queueing,
  execution, commit, or publication. This plan was first written in the
  retrospective's supplied execution checkout.
- **Scope revision (2026-09-28):** Terry's decisions add F1b (fast-forward a
  clean, strictly-behind reused workspace) and F8 (native acceptance on all
  three hosts of the startup, preparation, Land, and wrap-up guidance changed by
  plan 140 and this plan), and move the other open findings to queued sibling
  stories. This revision is written in the preparation workspace
  `.worktrees/prep-owned-context-refresh` (branch
  `claude/prep-owned-context-refresh`), announced as agent Yua-chan at
  `c8ab090a`. It is planning only.

## Outcome and boundaries

Developers can start and land owned work from an owned repository context
alone, reuse a clean owned workspace that trunk has moved past, and get a
truthful, fast-forwarding refresh. This completes the original story's
example 3 ("an owned worktree has repository access … no default checkout is
supplied → start execution …") and its "clean and behind → fast-forward"
promise. Retirement mechanics and refresh-result guidance keep one
representation each. The startup, preparation, Land, and wrap-up guidance
changed by plan 140 and by this plan is accepted natively on Codex, Cursor,
and Claude Code.

Preserved promises and constraints: remote acceptance comes before optional
refresh; refresh never erases acceptance or blocks eligible cleanup; developer
checkout bytes are preserved; a reused owned workspace is only fast-forwarded,
never reset, so its own commits, edits, and operation state are never lost; existing refusal gates (invalid repository,
remote, authority, mismatched resume, unready remote preparation) remain; Story
Branch history and CI gates are unchanged; no lock, registry, scheduler, or
second publisher. Edit sources only in `src/skills/`, never installed copies.
Guidance follows ADR 0006's executing-agent audience. When behavior is removed,
do not add "no longer" prose.

### Excluded (owned by queued sibling stories; do not plan or implement)

- **F3:** whether an explicit current-checkout direct edit stops on unrelated
  staged content (guidance says stop; runtime and tests commit around it).
  Owned by [SEED-008#finish-removing-checkout-coordination](../../seeds/SEED-008-worktree-branch-trunk-sync.md#finish-removing-checkout-coordination).
- **F4:** removing the vestigial declared-owner concept. Owned by
  SEED-008#finish-removing-checkout-coordination.
- **F5:** checkout-vocabulary unification. Owned by
  SEED-008#finish-removing-checkout-coordination.
- A runtime guard against pushing unrelated unpublished commits on
  current-checkout delivery, and native acceptance of the changed
  current-checkout guidance. Owned by
  SEED-008#finish-removing-checkout-coordination.
- **F7 (payload part):** whether shipped mechanics modules with no entry point
  get one or leave the payload. Owned by
  [SEED-008#installed-wrap-up-command](../../seeds/SEED-008-worktree-branch-trunk-sync.md#installed-wrap-up-command).
  Slice 6 keeps the existing module locations.

Considered but excluded as outside this outcome: ending a lost preparation
workspace's assignment (`preparation-assignment.mjs abandon --profile`) from an
owned context. It still requires `--integration`. It is neither starting nor
landing, and no finding covers it.

## Current findings (rechecked at `b3dfd569`; F1b and F8 at `c8ab090a`)

| Code | Finding | Evidence |
| --- | --- | --- |
| F1b | A reused startup workspace that is clean, has no commits of its own, and is strictly behind fetched trunk is refused instead of fast-forwarded. Preparation already fast-forwards such a workspace but announces from one with an ongoing Git operation. | `workspace-publication-select.mjs:87-109` (refusal unless HEAD equals fetched trunk); `preparation-assignment-start.mjs:147-156` (isolation checks only status and ancestry) and `:60` (`merge --ff-only`). Observed in the probes below. |
| F8 | No native acceptance covers the startup, preparation, Land, and wrap-up guidance changed by plan 140 or by this plan. | Plan 140 slice 1 and 2 learnings and its execution-complete record; the native harness has no journey without a default checkout, none that runs preparation `start`, and none for Land (premises below). |
| F1a | Without `--integration`, a new owned workspace cannot be created; startup and preparation refuse. | `execution-start-request.mjs:87-91`; `preparation-assignment-trunk.mjs:44-51`; refusal encoded at `workspace-publication-startup-owned-context-cases.mjs:184-191` and `preparation-assignment-owned-context.test.mjs:33-40`; fixture `default-checkout-test-fixtures.mjs:26-46` pre-creates the only worktree at `origin/main`. |
| F2 | A leftover `REBASE_HEAD` makes shared refresh defer (`ongoing-operation`) forever. | `maintain-default-checkout.mjs:8-13,102-111`; `publication-checkout-maintenance.test.mjs:146-179` asserts deferral for a planted ref alone. Other recognizers use state directories: `product-backlog-git-operation-state.mjs:34-44` (`rebaseStateDirectory`, not exported) and `dough-land-test-fixtures.mjs:109-128`. |
| F6 | Refresh-result guidance is inconsistent. | Wrap-up `SKILL.md:228-230` names only not applicable or deferred; Land `SKILL.md:93-97` includes stopped; `trunk-publication.md:97-101` omits not applicable. The owner is `maintain-default-checkout.md#independent-maintenance-outcome` (lines 10-33). |
| F7 | Retirement mechanics are modelled twice. | The Land test model `closeOrRetainWorkspace` (`dough-land-test-fixtures.mjs:49-97`) duplicates the shipped `removeExecutionResources` (`closure-resources.mjs:137-249`). It lacks the already-absent rerun handling that Land's "Retire the worktree" requires. |
| F9 | Test redundancy and a missing example. | (a) `workspace-publication-startup-local-copy-cases.mjs:127-137` is subsumed by `:139-190`. (b) The setup plus first-delivery block is repeated in `…owned-context-cases.mjs:103-135`, `…local-copy-cases.mjs:155-189`, and `workspace-publication-startup-journey-cases.mjs:40-90`. (c) `dough-land.test.mjs:220` overlaps `dough-land-rerun.test.mjs:162` and `publication-checkout-unavailable.test.mjs:29`, and `dough-land.test.mjs` is 257 lines. (d) Key example 7 lacks the case of a ready local copy with unready remote preparation (`workspace-publication-startup-source-cases.mjs:17-40` has local HEAD equal to the stale remote). |

## Architecture and existing solutions

- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one representation per concept. It governs the single in-progress recognizer
  (slice 3), the single fast-forward eligibility (slice 4), the single
  retirement mechanics (slice 6), and the single owner of refresh-result
  vocabulary (slice 5).
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  changed start/preparation guidance addresses the executing agent and its
  project, and links shared rules rather than repeating them.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  deterministic proof here is not native evidence. Slices 7 and 8 own native
  acceptance (F8): shared cases defined once, runs selected by unresolved risk,
  per-host evidence or justified reuse for each affected requirement, no full
  host-by-case matrix, and assessors proven by credential-free
  counterexamples. The acceptance shape follows the SEED-053 stories (prompts
  supply the task and authority, not the expected command; decisive Git
  observations, not self-report or exit 0; a failed case stays outstanding with
  its cause) without expanding SEED-053.
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
- `attemptRefresh` in `maintain-default-checkout.mjs` already decides
  fast-forward eligibility after a fetch: ongoing operation, expected branch,
  ancestry (behind, ahead, diverged), clean status, then checkout-aware
  `merge --ff-only` with a post-check. F1b reuses that decision rather than
  adding a second eligibility rule in workspace selection or preparation.
  Preparation's announcement already fast-forwards (`merge --ff-only`); only
  its eligibility gate changes.
- The native harness (`tests/git-publication-native.sh`, its `--native HOST
  --case` mode, `tests/support/git-publication-native-*.sh`, the startup
  fixture and assessor, and the `trunk-closure` fixture) is reused. Only new
  obligations get new journeys.

## Observed premises

Observed on `b3dfd569` (only `DearDough.md` and `ProjectFindings.md` were
uncommitted) on 2026-09-28:

| Premise | Literal observation and result | Consequence |
| --- | --- | --- |
| The Git context of an owned worktree or of the common Git directory is enough to create a new workspace at fetched trunk. | A temporary Node probe under `/Users/terryyin/.claude/jobs/06628f74/tmp` (removed afterwards) built `createQueuedTrunk` plus `ownedWorktreeOnly` and ran the installed `execution-start.mjs start` via `startCliResult`. It passed the new workspace path `start-fresh`, with `--integration` set to (i) `repository.git` and (ii) the owned worktree. Both runs exited 0 with `published`, `created: true`, starting revision equal to trunk, the remote claim equal to `publishedSha`, the retained owned worktree still at trunk, and 3 worktrees listed. Maintenance was misreported: (i) `deferred/refresh-failed` ("must be run in a work tree"), (ii) `stopped/unexpected-branch`. | Slice 2 is a request-level separation: repository context without refresh. Selection, source reading, agent rotation, and claim publication need no change. Passing the context as `--integration` is wrong because it triggers refresh. |
| Git 2.50 leaves `REBASE_HEAD` after a completed conflicting rebase. | In a temporary repository with Git 2.50.1 (Apple Git-155): conflicting `git rebase main`, then resolve, `add`, `GIT_EDITOR=true git rebase --continue`. During the rebase: `rebase-merge` present, `REBASE_HEAD` present. After it: `rebase-merge` absent, `rebase-apply` absent, `REBASE_HEAD` present, status clean. A second probe on `main` then ran `git reset --hard <older base>` and `git merge --ff-only`; `REBASE_HEAD` still verified after each. Directories removed. | Slice 3 detects a rebase by its state directory; the leftover ref alone must not defer refresh. Slice 3's proof can create a clean, strictly-behind checkout that keeps the leftover ref through `reset --hard`. |
| The refresh and Land recognizers differ; only the Land model uses state directories. | Read `maintain-default-checkout.mjs:8-111` and `dough-land-test-fixtures.mjs:109-128`. `rg -n "REBASE_HEAD\|rebase-merge\|ongoingOperation\|unfinishedOperation" src/skills` lists no other production recognizer. `publication-racing-suffix-fixtures.mjs:80` and `one-shot-queued-races.test.mjs:62` are test-only. | Slice 3 changes one production recognizer and the Land model. |
| `ongoing-operation` consumers. | `rg` shows refresh in `publication-checkout-maintenance.test.mjs:141,176` and `workspace-publication-startup-maintenance-cases.mjs:22-83` (index lock and unit reporting only). The Land rerun asserts `unfinished-operation` during a real conflicting rebase (`dough-land-rerun.test.mjs:64`). | These assertions stay. Only the planted-`REBASE_HEAD` expectation changes, and a real rebase still defers. |
| Callers of the two retirement representations. | `rg -n "closeOrRetainWorkspace\|removeExecutionResources\|landWorktree" src/skills` finds the Land model, `dough-land*.test.mjs`, `preparation-assignment-{land,landing-retry,remote-base,reuse}.test.mjs`, `preparation-publication.test.mjs`, `retained-artifacts.test.mjs`, `closure-publication.mjs`, and the `closure-*` tests. | Slice 6 proof covers all of these caller suites. |
| Guidance names `--integration` for creation. | `rg -n -- "--integration" src/skills` finds `dough-execute-plan/SKILL.md:114` and `preparation-assignment.md:36,43-47,192`, plus `admit-accepted-work.md:48` (drafts, unchanged) and `preparation-lost-workspace.md:28` (excluded). | Slice 2 aligns the first two. |
| Focused baseline is green. | `node --test` over `workspace-publication.test.mjs`, `preparation-assignment-owned-context.test.mjs`, `preparation-assignment-remote-base.test.mjs`, `publication-checkout-maintenance.test.mjs`, `publication-checkout-unavailable.test.mjs`, `dough-land.test.mjs`, `dough-land-rerun.test.mjs`, `dough-land-remote-context.test.mjs`, `preparation-publication.test.mjs`, `retained-artifacts.test.mjs`, `closure-resource-cleanup.test.mjs`, and `closure-publication-remote-context.test.mjs`: 59 pass, 0 fail, 46.4 s. | These are the starting boundaries. The old refusal and deferral expectations are a baseline, not proof of the corrected behavior. |
| Sizing context. | Highest allocation across all refs was 141; `142` was free when rechecked. No project slice target or hard limit was supplied. | Size each slice by one cohesive outcome and one proof loop, without an invented timing policy. |

Observed on `c8ab090a` in the preparation workspace on 2026-09-28:

| Premise | Literal observation and result | Consequence |
| --- | --- | --- |
| The premises above still hold. | `git diff --stat b3dfd569 c8ab090a -- src tests scripts` lists only native-harness files under `tests/` (one-shot escalation work); nothing under `src/`. | The earlier observations and baseline carry forward. |
| Startup refuses a clean, strictly-behind reused workspace; preparation fast-forwards one; neither gate recognizes an ongoing operation the same way. | A Node probe under `/Users/terryyin/.claude/jobs/06628f74/tmp` (removed afterwards) used `createQueuedTrunk`, `createPreparationTrunk`, `ownedWorktreeOnly`, and a clone that pushed one commit to origin, with Git 2.50.1. (a) Installed start with no `--integration`, reusing the behind owned worktree: exit 1, `setup-failed`, "existing workspace does not match clean fetched trunk and owned branch", HEAD unchanged. (b) With `--integration` and a behind host worktree: the same `setup-failed`, while maintenance reported `advanced`. (c) Preparation `start` in a behind owned worktree: `announced`, the announcement's parent is the advanced tip, and the workspace HEAD is the announcement. (d) The same with one local commit: `workspace-not-isolated`. (e) A clean owned worktree stopped mid-rebase (`rebase -i` with `break`: detached HEAD, `rebase-merge` present, empty status): `announced`, origin `main` moved to the announcement, and the rebase state remained. | Slice 4 makes startup selection fast-forward through the shared eligibility, and gives preparation the same eligibility. Its preparation change is the ongoing-operation refusal; its fast-forward already exists. |
| Callers of reused-workspace selection. | `rg -n "selectOwnedWorkspace\|does not match clean fetched trunk"` finds `execution-start-operation.mjs:81` (queued and admitted start), `execution-start-source.mjs:32` (one-shot), `preparation-assignment-trunk.mjs:54` (new paths only; an existing path returns early at `:45`), and `workspace-publication-race.test.mjs` (new paths). The only reuse-refusal assertion is `one-shot-escalation.test.mjs:103`, a workspace with edits, which stays refused. | One-shot starts gain the same fast-forward through the shared selection. Slice 4's proof runs the one-shot and admission suites, and the edits assertion is kept, with its message updated if the reason text changes. |
| Size headroom. | `wc -l`: `preparation-assignment-start.mjs` 250, `maintain-default-checkout.mjs` 234, `workspace-publication-select.mjs` 143, `…owned-context-cases.mjs` 222, `preparation-assignment-owned-context.test.mjs` 74; `tests/support/git-publication-native-assess.sh` 250, `…-fixture.sh` 246, `…-one-shot.sh` 249, `…-startup-fixture.sh` 198, `…-host.sh` 160. | Slice 4 replaces preparation's isolation check rather than adding to it, and puts new startup reuse cases in their own cases module. Slice 7 puts new journeys in their own support files. |
| Land and wrap-up are carried out by the agent from guidance. | `ls src/skills/dough-land` shows only `SKILL.md`; wrap-up `SKILL.md` names no closure script entry point. The shipped closure modules have no entry point (F7). | Their changed retirement and refresh-reporting behavior carries native risk that deterministic model tests do not cover. Slice 8 must observe Land and wrap-up natively. |
| Native harness coverage. | Read `git-publication-native-host.sh` (`host_fresh_journeys`, `native_case_known`), `…-prompt.sh`, `…-startup-fixture.sh`, and `trunk-closure-native-fixture.sh`/`-run.sh`. Every `startup-*` fixture supplies `--integration` and a pending human edit. The `preparation` journey only publishes a retained result. No journey runs preparation `start`, Land, or any path without a default checkout. The trunk closure fixture keeps a default checkout with a pending edit. The credential-free default mode runs in the whole `scripts/test.sh` suite and is first in `tests/longest-first`. | Slice 7 adds three journeys for the new obligations and proves their assessors with counterexamples, keeping default-mode cost measured. `trunk-closure/source` is reused unchanged. |
| How native journeys get installed guidance. | `git-publication-native-run.sh:107-160`: `startup-*`, `admission-*`, and `one-shot-*` install with `install.sh --target` into the integration checkout and run the host there. Other journeys install into the fixture workspace. `git_publication_one_shot_publish_install` (`…-one-shot.sh:35-44`) commits and pushes the install to fixture trunk, and `git_publication_record_pushes` logs every accepted push. An uncommitted install would leave a reused worktree dirty. | Slice 7 publishes the install to fixture trunk before creating the retained worktree, and uses the push log for push order and force. |
| Native obligations inherited from plan 140. | `git show 199c579f:.planning/slice-plans/140-remote-history-workflows/PLAN.md`: slice 1 and 2 learnings leave native proof of `startup-selected-source` and of preparation workspace selection pending. The execution-complete record asks for native acceptance of the changed startup, preparation, Land, wrap-up, and current-checkout guidance. The current-checkout part is in the scope of SEED-008#finish-removing-checkout-coordination. | Slice 8 covers startup, preparation, Land, and wrap-up. |

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| A ready-looking local copy never overrides unready or stale remote preparation (key example 7). | 1: installed start CLI refuses with `source-refused` and `needs-reassessment`; no claim or workspace; local bytes unchanged. |
| Startup proof has one setup-and-first-delivery journey, with no subsumed per-layer runs. | 1: the surviving cases keep every prior assertion (all layers, deep-equal local sources, setup markers, accepted first increment). |
| From an owned worktree or common Git directory alone, queued startup and preparation create a new owned workspace at fetched trunk with refresh `not applicable`, leaving the retained worktree unchanged. | 2: installed `execution-start.mjs` and `preparation-assignment.mjs` from `ownedWorktreeOnly` with a new workspace path. Observe `created: true`, starting revision equal to fetched trunk, remote claim or announcement, the retained worktree HEAD and bytes unchanged, then setup and first delivery (start) or first draft plus continue (preparation). |
| Invalid repository, remote, authority, and mismatched-resume refusals still hold without a default checkout. | 2: existing refusal cases, repointed at the new argument where it participates. |
| A clean, strictly-behind default checkout with only a leftover `REBASE_HEAD` advances; a real in-progress rebase still defers and is preserved. | 3: shared refresh unit cases on real Git state, plus the Land model's `unfinished-operation` stop during a real rebase and its success after `--continue`. |
| A reused clean owned or host worktree with no commits of its own that is strictly behind fetched trunk is fast-forwarded, and startup or preparation continues on fetched trunk. | 4: installed start (with and without `--integration`) and preparation `start` in a behind reused worktree. Observe `created: false`, the workspace HEAD and starting revision at the advanced trunk, the claim or announcement parented on it, then setup and first delivery or the first draft. |
| A reused workspace with its own commits, diverged history, pending edits, or an ongoing Git operation is refused with it unchanged and nothing published. | 4: installed start (`setup-failed`) and preparation `start` (`workspace-not-isolated`) for each state, on real Git state including a real rebase stop. HEAD, status, operation state, and origin `main` are unchanged. |
| Refresh-result vocabulary has one owner that callers link. | 5: read-through of Land, wrap-up, and trunk publication. Each links `maintain-default-checkout.md#independent-maintenance-outcome` without a subset enumeration. |
| Land and wrap-up retire through one mechanics representation, including already-absent resources on a rerun. | 6: Land, preparation, bug-fixing, and closure suites pass through the shared core. A new Land rerun case with an already-removed worktree or branch reports already retired from the recorded management context. |
| No redundant unusable-path Land test; `dough-land.test.mjs` is at most 250 lines. | 6: the rerun case and the `publication-checkout-unavailable` unit remain; line count checked. |
| The native harness can observe and assess each new native obligation, and its assessors reject the failures that matter. | 7: credential-free default mode of `tests/git-publication-native.sh` runs each new observer once against a scripted substitute run, and rejects each named counterexample. |
| On each of Codex, Cursor, and Claude Code, the changed startup, preparation, Land, and wrap-up guidance produces its intended outcome, or has justified reuse. | 8: the per-host journey table in slice 8, each run manually triggered and judged from the native trace and independent Git observations. |

## Ordered slices

### 1. Startup proof suite shares one first-delivery journey and covers a ready local copy
Type: Structure
Status: done

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

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
(33 pass) with the first-delivery assertions moved into
`deliverFirstIncrement` (`workspace-publication-startup-delivery-test-fixtures.mjs`)
and slightly strengthened; the all-layers local-copy test survives the deleted
per-layer loop; the stale-readiness case also refuses beside a ready-looking
local worktree and index copy with local bytes deep-equal. Whole `node --test`
698 pass. Setup marker names live once in `workspace-publication-fixtures.mjs`.

### 2. A new owned workspace starts from an owned repository context
Type: Behavior
Status: done

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

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission.test.mjs src/skills/dough-execute-plan/scripts/one-shot-*.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-*.test.mjs`
(91 pass; the six new cases fail on 7e86f615). From `ownedWorktreeOnly`, with
`--repository` naming the owned worktree or the common Git directory and a new
workspace path, startup publishes `created: true` at the fetched (advanced)
trunk with maintenance `not applicable` and delivers a first increment;
preparation announces with `selection` at fetched trunk and continues its
draft; the retained worktree stays deep-equal. A non-repository `--repository`
refuses without changes. Payload checks and whole `node --test` (702) pass.

### 3. Refresh recognizes a rebase by Git's rebase state
Type: Behavior
Status: done

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

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/publication-checkout-*.test.mjs`
(the real-rebase deferral and leftover-`REBASE_HEAD` advance now live in
`publication-checkout-ongoing-operation.test.mjs`; the new case fails on
3ca457cb) plus Land, startup maintenance, closure refresh, and product-backlog
rebase/cherry-pick suites (81, then 23 after refactoring) and payload checks.
Refresh and the Land model share `ongoingOperation`, which reads rebase state
through `rebaseInProgress` in `product-backlog-git-operation-state.mjs`. Land's
model also stops on `index.lock`; Land guidance names only unfinished Git
operations, for slice 5's read-through.

CI repair (run 36398824771, 3ca457cb; the same failure on another branch's run
36394508899): `project-keyboard-navigation-focus.spec.ts` waited for any
Doughnut request although an earlier step had already read `main`, so on slow
runners the held read arrived and the count assertion saw `["main","main"]`; it
now waits for the held read itself and asserts it is never retried. The local
`symlinked-skill-entry.test.mjs` flake was an unhandled `EPIPE` when a refusing
entry point exited before its empty input was written (13 of 180 under load,
0 fixed); `run()` now tolerates only `EPIPE`.

### 4. A clean reused workspace that trunk has moved past is fast-forwarded
Type: Behavior
Status: done

Behavior: An existing owned or host worktree on the requested branch is clean,
has no commits of its own, and is strictly behind fetched trunk, with no
ongoing Git operation → installed queued startup (and one-shot or admitted
start, which share selection), or preparation `start`, names it as
`--workspace` → it is fast-forwarded to fetched trunk, `created` is false, the
claim or announcement is built on fetched trunk, and work continues there.
With commits of its own (ahead or diverged), pending edits, or an ongoing
operation (index lock, merge, cherry-pick, or revert ref, or rebase state) →
startup refuses with `setup-failed` and preparation with
`workspace-not-isolated`, naming the reason. The workspace, its operation
state, and remote trunk are unchanged.

Decision (one eligibility rule): extract the post-fetch eligibility and
fast-forward from `attemptRefresh` in `maintain-default-checkout.mjs` into one
exported operation. It takes a checkout, the fetched trunk ref, and the
expected branch. It returns the existing decision vocabulary (`advanced`,
`already current`, `ongoing-operation`, `pending-edit`,
`unpublished-commits`, `unexpected-branch`, `diverged`) and uses slice 3's
single in-progress recognizer. `attemptRefresh` keeps its owner step and
fetch around it, so refresh results are unchanged.

- `selectOwnedWorkspace` (reuse branch in `workspace-publication-select.mjs`)
  keeps its toplevel check. It calls the operation with the requested branch
  and continues on `advanced` or `already current` with `startingRevision`
  equal to fetched trunk. Any other result becomes `setup-failed` naming the
  reason. The retained-resume path (`verifyRetained`) and carried parks, which
  already reset to `base`, are unchanged.
- In `preparation-assignment-start.mjs`, replace the isolation check (status
  and ancestry) with the same operation, using the workspace's current branch.
  The existing `merge --ff-only` in `commitAnnouncement` and the `unannounced`
  reset stay. Keep the file at most 250 lines.
- Guidance: where `dough-execute-plan/SKILL.md` says startup "selects or reuses
  the workspace", and in `preparation-assignment.md`'s `workspace-not-isolated`
  entry, say that a clean reused workspace that trunk has moved past is
  fast-forwarded, while its own commits, edits, or an ongoing Git operation
  stop. Keep the ADR 0006 audience and link the shared refresh eligibility
  rather than restating it.

Proof: in a new `workspace-publication-startup-reuse-cases.mjs`, imported by
`workspace-publication.test.mjs`, advance origin from another writer after the
owned worktree is created, then:

- (i) run the installed start from `ownedWorktreeOnly` and, separately, with
  `--integration` and a behind host worktree. Observe `published`,
  `created: false`, `startingRevision` equal to the advanced tip, the claim's
  parent equal to it, and the workspace HEAD equal to the claim. Then run
  slice 1's setup-and-first-delivery helper there.
- (ii) parameterize the refusals on real Git state: a local commit (ahead), a
  local commit plus the advance (diverged), an unstaged edit, a planted
  `MERGE_HEAD`, and a real rebase stopped with `break`. Each gives
  `setup-failed` naming its reason, with HEAD, status, operation state, and
  origin `main` unchanged, and no claim.

In `preparation-assignment-owned-context.test.mjs`, a behind owned worktree is
announced on the advanced tip and continues to a first draft. The real
mid-rebase `break` state gives `workspace-not-isolated` with nothing published
and the rebase state preserved; this fails today (probe (e)).
`one-shot-escalation.test.mjs:103` still refuses the workspace with edits. Run
`workspace-publication.test.mjs`, `workspace-publication-admission.test.mjs`,
`one-shot-*.test.mjs`, `preparation-assignment-*.test.mjs`,
`publication-checkout-*.test.mjs`, `dough-land*.test.mjs`, the
`closure-publication*.test.mjs` refresh cases, and `payload-declaration-links`
plus `execution-payload-update` and `story-payload-update` through
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh`. Then run the whole
`node --test`. Walk one representative startup reuse through the guidance
(behavior review in `AGENTS.md`). Safe stop: startup and preparation share
refresh's fast-forward eligibility for a reused workspace.

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
with the new `workspace-publication-startup-reuse-cases.mjs` (7 pass) and
`preparation-assignment-owned-context.test.mjs` (5 pass): a clean behind owned
worktree, with or without `--integration`, is fast-forwarded and continues with
`created: false` through a first delivery; ahead, diverged, edited,
`MERGE_HEAD`, and a real stopped rebase refuse with their reason and unchanged
bytes, and preparation stopped mid-rebase no longer announces. The success and
mid-rebase cases fail on 4d84c270. Focused suites (132), payload checks, and
whole `node --test` (712) pass. `fastForwardToFetchedTrunk` in
`maintain-default-checkout.mjs` owns the rule; it checks an ongoing operation
before the branch so a stopped rebase's detached HEAD reports truthfully.

### 5. Refresh-result guidance links its single owner
Type: Structure
Status: done

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

Accepted proof: read-through of each changed section; `rg` finds refresh-result
lists only in `maintain-default-checkout.md#independent-maintenance-outcome`,
which also states once that no result undoes acceptance or authorizes another
push; Land, wrap-up, trunk and candidate publication, execute-plan startup, and
preparation link it. Land's stop list names an `index.lock`, matching the
shared recognizer. Guidance tests, payload checks, and whole `node --test`
(712) pass.

### 6. Land's model retires through the shared retirement mechanics
Type: Structure
Status: done

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
- Keep the core in its current shipped module. Its payload status belongs to
  SEED-008#installed-wrap-up-command. Keep `closure-resources.mjs` at most 250 lines. If a new
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

Accepted proof: `node --test src/skills/dough-story-refinement/scripts/dough-land*.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-*.test.mjs src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs src/skills/dough-story-wrap-up/scripts/*.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-unavailable.test.mjs`
(69 pass). `retireWorktree` in `closure-resources.mjs` is the one retirement
core; wrap-up's `removeExecutionResources` supplies its gates through
`holdReason`, and the Land model's `closeOrRetainWorkspace` adapts to it. The
new rerun case retires an already-removed worktree and its remaining branch from
the recorded Git directory, then reports both already absent; it failed on
d9f7b9d7 because the old model ran Git inside the removed worktree. The
overlapping unusable-path Land case is gone. Whole `node --test` (712) and
payload checks pass. Git refuses to delete a branch still checked out, so the
reachable partial state is worktree gone with branch remaining.

### 7. The native harness observes owned-context startup, preparation through Land, and wrap-up without a default checkout
Type: Structure
Status: planned

Internal change: extend the existing publication and trunk-closure native
harness with three journeys for obligations no journey covers. External
product behavior is unchanged. This enables slice 8, which runs them. Existing
journeys, prompts, and assessors stay unchanged.

- `publication/startup-owned-context`: a repository with no default checkout,
  built from `createQueuedTrunk` plus `ownedWorktreeOnly`. Its retained owned
  worktree is behind fetched trunk (another writer advanced origin) and holds
  a ready-looking, uncommitted, different local copy of Story A's section. The
  prompt names that worktree as the only checkout, a new owned workspace path
  and branch, and the task and authority. It does not name a command or flag.
  Observations: startup invocation count; `--integration` absent and
  `--repository` present in the observed invocation; the new workspace exists
  on its branch, created at fetched trunk and holding the published source; the
  Taken claim is on origin; setup, command, and the feature edit follow the
  claim; the retained worktree's HEAD, status, and bytes are unchanged; and the
  worktree list is the Git directory, the retained worktree, and the new one.
- `publication/preparation-land`: a preparation trunk with no default
  checkout. A retained owned preparation worktree for queued Story C is clean
  and behind fetched trunk. The prompt asks to refine Story C there and then
  land the result with Dough Land, with keep and publication authority.
  Observations: the announcement on origin is parented on the advanced tip;
  the landed draft changes only Story C's section and the assignment release;
  origin received no force push and no push before the announcement; the
  worktree path and its branch are absent afterwards; the repository's Git
  directory is intact; and no default checkout was created.
- `trunk-closure/owned-context`: a scenario of the existing
  `trunk-closure-native-fixture.sh` with the default checkout removed. Keep its
  CI stub, completion receipt, and shutdown observations. Observations: the
  final-closure candidate is accepted on origin; completion and shutdown are
  observed before cleanup; the retained worktree and branch are retired from
  the repository's Git directory; and no default checkout was created.

The two publication journeys have no default checkout to install into or run
from. Install the candidate and publish that install to fixture trunk before
the retained worktree is created, as `git_publication_one_shot_publish_install`
does. Then advance origin, and run the host in the retained worktree. The
retained worktree stays clean, so the reuse fast-forward is exercised, and
installed guidance is present in every workspace made from trunk. Record
origin pushes with `git_publication_record_pushes` to observe push order and
force.

Register the cases in `native_case_known` and the usage text. Do not add them
to `host_fresh_journeys` defaults: slice 8 selects each run with `--case`. Put
each journey's fixture, observer, and assessor in its own support files, each
at most 250 lines, reusing the existing supervisor, stream, retention, and
host adapters. Add no new runner, selection registry, or host adapter.

Proof: in credential-free default mode, `tests/git-publication-native.sh`
(i) drives each new fixture once with a scripted substitute that invokes the
installed commands and Git directly (no model), and the observer's output
passes its assessor. (ii) It rejects recorded counterexamples. For
startup-owned-context: `--integration` supplied, a changed retained worktree,
workspace source equal to the local copy, and a feature edit before the claim.
For preparation-land: an announcement on the stale base, a draft pushed before
the announcement, a surviving worktree or branch, and a changed file outside
Story C. For trunk-closure/owned-context: cleanup before the completion
receipt, and a surviving worktree. Run the default mode through
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/git-publication-native.sh`, plus `shellcheck` and the harness's
existing unit checks. The default mode is already the suite's longest job, so
measure its elapsed time before and after in paired runs under the same load.
Report the increase, and prefer counterexample-only proof for a new assessor
whose substitute run adds significant time. Safe stop: the new obligations are
observable and assessable, and no paid run has happened.

### 8. The changed guidance is accepted natively on Codex, Cursor, and Claude Code
Type: Behavior
Status: planned

Behavior: the installed candidate that contains slices 1-7, on each of Codex,
Cursor, and Claude Code, in fresh isolated sessions → run each selected
journey, triggered manually by the developer → the decisive Git and trace
observations show the intended outcome for every changed requirement below.
Record evidence or justified reuse per host. A failing or inconclusive case
stays outstanding with its cause and the next decision.

Paid-run rule: every run is launched only on the developer's explicit trigger.
It uses `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh
--native <codex|cursor|claude> --case <case> --results-dir <dir>`, or the same
host and case through the trunk-closure dispatch. It is never part of
`scripts/test.sh`, CI, a loop, or a repeated suite. Run one attempt per host
and case. Investigate any failure before a retry, and retry only on the
developer's trigger. Pin the evaluated candidate revision and each host's CLI
version.

Changed requirements and their journeys (all three hosts run all four
journeys, 12 runs):

| Changed requirement | Source | Journey |
| --- | --- | --- |
| Queued startup follows published preparation, not ready-looking local copies. | 140 slice 1 | `publication/startup-owned-context` (the local copy sits in the retained worktree) |
| Startup needs only an owned repository context, and a new workspace is created from it with refresh `not applicable`. | 140 slice 3; 142 slice 2 | `publication/startup-owned-context` |
| Preparation drafts on fetched trunk from an owned context without a default checkout. A clean behind reused worktree is fast-forwarded. | 140 slices 2-3; 142 slice 4 | `publication/preparation-land` |
| Land publishes first, reports refresh through the single owner's vocabulary, and retires the last worktree from the recorded Git directory. | 140 slice 4; 142 slice 5 | `publication/preparation-land` |
| Wrap-up without a default checkout reports refresh `not applicable` and retires from the retained Git directory after the completion receipt. | 140 slice 5; 142 slice 5 | `trunk-closure/owned-context` |
| Wrap-up with a pending human edit on the default checkout preserves it, and deferred refresh neither erases acceptance nor blocks cleanup. | 140 slice 5; 142 slice 5 | `trunk-closure/source` (existing, unchanged) |

Justified reuse and runs not selected:

- `publication/startup-selected-source` is not run: its obligation is carried
  by startup-owned-context through the same source-selection guidance.
- Startup reuse fast-forward (142 slice 4) adds no agent decision: the agent
  names the same workspace as for plain reuse, and slice 4's deterministic
  proof covers the mechanics. Its native coverage is the preparation-land
  fast-forward.
- The other `startup-*`, `admission-*`, and `one-shot-*` journeys,
  `publication/preparation`, `trunk-closure/ignored-only`, and
  `story-branch-closure/source-conflict` keep their own obligations unchanged.
  Their shared refresh and retirement wording is exercised per host by the
  journeys above. Before relying on this, diff their guidance sections between
  the last accepted candidate and the evaluated candidate. Any other changed
  wording adds that journey on each host.
- Slices 1, 3, and 6 change runtime and tests only, so their proof is
  deterministic.
- Current-checkout guidance belongs to
  SEED-008#finish-removing-checkout-coordination.

Proof: for each host and journey, judge the native trace (installed-guidance
use, the actual invocation, and the next consuming action) and the independent
Git observations, not exit 0 or self-report. Record in this plan the
requirement, result, candidate revision, host CLI and model, the relevant
inputs, and the decisive evidence. Delete the run artifacts after judging
(ADR 0005 §5). If a run shows a guidance defect, stop the dependent path and
report it with the evidence. Do not edit the evaluated guidance to obtain
acceptance. Fixing it within this story needs the developer's decision, and a
guidance change requires reassessing earlier passes on every host. Safe stop:
each host's completed journeys are useful partial acceptance. The story is
complete only when every requirement above has passing evidence or justified
reuse on all three hosts.

## Current decisions

- `--repository` is the only new CLI surface. `--integration` keeps meaning a
  default checkout that is refreshed and read for drafts.
- One in-progress recognizer lives in `maintain-default-checkout.mjs`. Its
  rebase detection reuses `product-backlog-git-operation-state.mjs`.
- One fast-forward eligibility operation lives in
  `maintain-default-checkout.mjs`. Refresh, reused-workspace selection, and
  preparation's announcement gate call it and keep their own result
  vocabularies.
- Retirement mechanics stay in `closure-resources.mjs`, with its payload status
  unchanged.
- Verification: focused suites per slice, then the whole `node --test` before
  each slice returns. Shell checks run only through
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <check>`. Paid native runs
  (`claude --print`, `codex exec`, `cursor agent`) happen only in slice 8, each
  on the developer's explicit trigger, and never in `scripts/test.sh`, CI, or a
  repeated suite.
- Use independent post-change refactoring and ordinary managed delivery when
  execution is later authorized. Do not hand-synchronize installed copies.

## Learnings

None yet.

## Concern review

No blocking slice-specific concern was identified in this review. Each slice
has one outcome and one proof loop. The Behavior slices 2, 3, and 4 change one
model each: the request's Git context, the in-progress recognizer, and
reused-workspace eligibility, which reuses refresh's decision instead of adding
a second rule. The Structure slices 1, 5, and 6 each remove one evidenced
duplicate representation and prove preserved behavior at the affected external
boundaries. Slice 7 is test-harness Structure that enables only slice 8.
Order: slice 1 precedes slice 2, whose proof uses its helper. Slice 4 follows
slice 3, whose recognizer it calls. Slice 6 touches the Land model after
slice 3. Slices 7 and 8 come last, so that native runs evaluate all changed
guidance once. Slice 4 is its own slice, not part of slice 2: it has a
different trigger (reuse rather than creation) and its own refusal proof.
Slice 7 is split from slice 8 because the credential-free assessor proof is
an independent loop and a useful stop before any paid run.

The request separation, Git's leftover-ref behavior, and today's reuse and
preparation behavior were observed directly. The proof that the product adopts
them, and all native results, are owned by the slices above and not claimed.
Slice 8's outcome depends on host behavior that cannot be observed without paid
runs. A failed run is reported as outstanding, and guidance is not changed
within that slice without the developer's decision. That makes it an
evaluation risk, not a readiness gap.
