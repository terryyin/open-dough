# Plan 052 — Introduce Trunk Mode for plan execution

Status: executed. All 12 slices delivered on `quick/052-introduce-trunk-mode`.

## Execution identity

- Mode: Story Branch Mode (caller invoked `/dough-execute-plan 52` without `--trunk`).
- Replanning permission: allowed (no `--no-replan`).
- Originating checkout/branch: `/Users/terryyin/git/open-dough` on `main`; claim commit `ce145051ca526c8b0343b030e4374d9c7f687ccc` (`Take SEED-008 Trunk Mode for planned execution.`).
- Execution checkout/branch: `/Users/terryyin/git/open-dough/.worktrees/052-introduce-trunk-mode` on `quick/052-introduce-trunk-mode`.
- Integration target: `main`.
- Authorized push destination: `origin` `quick/052-introduce-trunk-mode`.
- Slice budget: none supplied; bound each slice by one Behavior/Structure gate and one proof loop.
- Selective formatter: `npm run format` (`node scripts/lint.mjs --fix`). Commit hooks: absent (sample Git hooks only); check-only contract is understood.
- CI: default GitHub Actions, workflow `ci.yml` display name `CI`. Cursor probe returned only `CI_OBSERVER` (`/tmp/dough-ci-501/watch-widqgL`) without `CI_MONITOR_READY`; bridge treated as unavailable. No observer armed. Pushes through slice 7 are unobserved (`pendingCi: unobserved`).

## Source and outcome

[SEED-008 Story 1](../../seeds/SEED-008-worktree-branch-trunk-sync.md#introduce-trunk-mode).
A developer explicitly selects Trunk Mode for planned or authorized planless
work. A retained local branch/worktree delivers verified increments immediately
to shared trunk, receives trunk CI feedback, and closes with correct attribution
and safe local cleanup. Keep the existing execution default unchanged.

[Story 2](../../seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue)
separately owns an automated same-machine merge queue. This plan includes safe
coordination and refusal when exclusive target access is unresolved; it does
not build a queue, scheduler, daemon, distributed claims, or global repair service.
Hosted cloud execution, indexing/build-cache optimization, automatic migration
between modes, PR integration, release, and performance benchmarking are excluded.

## Context, reuse, and architectural decisions

- Root/layout: `.planning/quick/NNN-description/PLAN.md`, planned/done slices.
  Git history allocates through 051; 052 was checked vacant before writing.
  No numeric slice budget or active North Star was found. Do not invent either.
- Edit published behavior at `src/skills/`, never hand-edit installed managed
  `.agents/skills/` or `.claude/skills/` copies. Any new runtime-consumed reference
  must follow existing payload declaration/verification behavior. No version
  bump, tag, installation refresh, or release is authorized by this plan.
- PFE: `dough-execute-plan/SKILL.md` already owns selection, claims, identity,
  resume, and the execution loop. Its `references/wrap-up.md` owns per-increment
  proof, refactoring, commit, publication, and revision registration. Extend
  these owners rather than create a second executor.
- PFE: `references/runtime-setup.md` already selects CI from the push destination;
  `scripts/ci-mailbox.mjs` accepts a branch independently of its checkout-bound
  runtime. `ci-command-adapter.mjs` separately passes branch and working directory.
  `ci-mailbox-store.mjs` owns revision registration/coverage. Reuse these concepts;
  the prose currently conflating observed and execution branches must change.
  Do not infer native behavior proof solely from these source findings.
- PFE: `references/ci-monitor.md` owns asynchronous feedback and pause/repair;
  existing host bridges remain the notification mechanism. The watcher observes
  branch activity, so ownership/registration must distinguish a delivered
  execution revision from another contributor's failure.
- PFE: `dough-execution-retrospective` already manifests attributable SHAs and
  rejects contaminated net diffs. Extend that recovery for rewritten unpublished
  commits and interleaved trunk history. `dough-story-wrap-up` owns durable
  closure, integration checks, and non-force cleanup. Reuse its recovery rules.
- PFE: `dough-product-backlog/references/merge-conflicts.md` already preserves
  independent queue edits. Existing execution-decisions own disputed intent,
  writer pauses, and preservation. Do not invent another conflict policy.
- Relevant Accepted ADRs: [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  requires continuous integration and shared-intent resolution;
  [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) governs useful
  behavior proof and host-specific evidence;
  [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  requires one shared, concise runtime behavior written for the executing project.
  Apply [AGENTS.md](../../../AGENTS.md). ADR 0007 remains Proposed, not a barrier
  to a separate mode and not accepted or rewritten by this work.
- One shared Trunk Mode publication contract should serve execution, claim,
  repair, and closure, with the caller's existing preparation/proof obligations.
  Extract a focused reference only where that avoids duplicated behavior. This
  does not justify a generic Git framework or a new configuration system.

## Execution decisions

1. Use explicit `--trunk` selection (including equivalent clear natural-language
   invocation). Preserve Story Branch Mode as the default and current-branch
   selection. Resolve contradictory selections before changing state. Planned
   corrections and planless contextual instructions keep their existing sources
   and authority; a mode never creates execution authority.
2. Retain execution checkout/branch, integration checkout/branch, remote target,
   mode, and actual published revisions in the existing plan/conversation.
   Claim setup may establish provisional identity; complete it before dispatch.
   No new recovery file or registry. Reuse project naming and target conventions.
3. Acquire an explicit exclusive integration turn through available coordinator
   context before changing a shared target checkout. A clean working directory
   alone does not establish ownership. If another writer cannot be coordinated,
   stop that integration without altering its work. This is a usable manual
   boundary until Story 2 automates admission; do not rely on Git's individual
   lock files as a transaction lock for fetch/rebase/advance/push.
4. In that turn, fetch the authorized remote, reconcile target state, rebase only
   owned unpublished execution work onto current trunk, validate affected
   behavior, fast-forward the local target, and publish the exact candidate.
   Keep the same worktree. Known unrelated local target commits are not silently
   published; ambiguous ownership or dirty target conflicts stop the path.
5. A push race after local integration may leave an owned unpublished suffix on
   local trunk. Reconcile that suffix with the newer remote under exclusive
   ownership, update execution identity/commit attribution, and publish normally.
   Never rewrite remote history or another writer's commits. If local state
   cannot be reconciled safely, retain it and report the precise decision.
6. Rebase changes invalidate affected proof, not every prior observation.
   Reuse unaffected proof, preserve established independent refactoring and
   selective formatting/hook obligations, and avoid deliberate failing commits.
   No force push, no blind retry loop, no replay of already published story work.
7. CI source is the authorized target branch; runtime, edits, and repair remain
   bound to the execution checkout. Retain the exact candidate SHA before push,
   establish publication of that SHA, and register it after success. Fetching a
   newer HEAD is not evidence for a different candidate. Observe claims and all
   subsequent publications when coverage is available; report gaps explicitly.
8. Preserve asynchronous delivery and existing pending/lost coverage reporting.
   Before handling a reported trunk failure, inspect its revision, this execution's
   deliveries, and any known repair owner. Do not infer cause or ownership from
   ancestry alone. Pause owned writers for repair; coordinate with the relevant
   owner or stop conflicting work when ownership is unclear.
9. Execution retains resources for review and wrap-up. Closure commits use the
   same publication contract. If execution's observer has stopped, closure must
   resolve its own observation ownership through the existing lifecycle before
   publishing, then stop only that observer and report remaining coverage.
   Pending CI does not become a new completion wait. Never delete a worktree
   containing an active checkout-bound observer or unique/unpublished work.
10. Implementation follows existing execute-plan proof, independent refactoring,
    formatting, staged-diff, commit, delivery, and review gates. Resolve actual
    checkout, hooks, CI, and push authority at execution. Planning performs no
    implementation, commit, push, or changes to execution state.

## Proof approach

Guidance is the product. Each slice has one behavior review using the changed
instructions and an inspectable outcome, not a wording-match test. For Git
boundaries, use disposable local repositories with a bare remote and separate
worktrees/clones; inspect refs, files, remote heads, and resource state. No live
project or shared remote is a test fixture. A shell reconstruction establishes
Git feasibility only; it does not prove an agent followed the skill.

For changed runtime behavior, extend existing Node tests at the nearest external
boundary and run focused cases first. Relevant existing entries are
`ci-mailbox-launch.test.mjs`, `ci-deployment-layout.test.mjs`,
`watch-ci-execution-coverage.test.mjs`, `ci-custom-host-bridge.test.mjs`, and the
Codex/Cursor/Claude lifecycle tests under `src/skills/dough-execute-plan/scripts/`.
`bash tests/execution-ci-runtime.sh` is the full runtime regression entry; run it
when runtime/shared lifecycle changes justify it, not after every prose edit.
For payload changes, use `bash tests/execution-payload-update.sh` and
`bash tests/dough-update-guidance-payload.sh`. `npm run lint` and `npm test` remain
the repository checks when applicable; unchanged managed-copy expectations are
not permission to self-install unreleased guidance.

Native acceptance ownership: slices 1–2 own selected entry/delivery behavior on
local Codex, Cursor, and Claude Code; slice 7 owns the checkout/target split through
each host's bridge; slice 12 owns local lifecycle closure. Reuse valid existing
integration evidence, but do not equate one host's success or a hand-scripted
fixture with another host's skill behavior. Track each required native result
or justified reuse in this plan during execution. Unavailable checks remain
pending, with a linked acceptance-story owner if implementation closes before
native acceptance under ADR 0005; no such checks are claimed passed here.

## Ordered slices

### 1. Start explicitly selected work with a visible trunk claim
Type: Behavior
Status: done

Behavior: Given authorized planned or planless work and explicit Trunk Mode,
startup produces one retained local execution workspace with the required queue
claim published on trunk before implementation. Context-only planless work starts
without fabricated planning artifacts. Omitted mode retains existing behavior.

Change: Extend selection, provisional/full identity, and startup publication at
the existing entry boundary. Share the minimal publication rule used by slice 2;
claim setup failures preserve exact state. Resolve source/context before mutation.
Proof: Walk a queued startup through visible remote Taken state and inspect its
execution base; contrast contextual planless startup and no-mode selection.
An unavailable destination prevents implementation, preserving existing changes.
Sizing: One startup gate; moderate uncertainty from claim-before-worktree ordering.

Accepted proof (2026-09-16, Story Branch Mode execution of this slice):
- Promise: explicit `--trunk` publishes Taken claim to remote trunk, then creates the local worktree from that SHA; omitted mode keeps Story Branch local-only claim; contextual planless fabricates no queue artifacts; failed publication leaves local Taken and no worktree; later increment push of the execution branch is an explicit stop.
- Boundary: `src/skills/dough-execute-plan/SKILL.md` plus `references/execution-location.md` and `references/trunk-publication.md`.
- Commands: `bash tests/execution-payload-update.sh` (pass); `bash tests/dough-update-guidance-payload.sh` (pass). Setup: execution checkout cwd with uncommitted then refactored payload lists.
- Git walk: disposable fixture `/tmp/trunk-mode-slice1-lLAiL7` (instruction reconstruction, not native skill invocation). Trunk-claim remote has only `main` at `b3332f8` matching `trunk-claim/execution` on `exec/story` with Taken backlog; omitted-mode observer still lists the story on Backlog list and remote `main` stays `29422d7`; contextual execution has no `.planning`; failed push remote `90556c8` ≠ local `b7591cf` with no `fail/execution` worktree.
- Native Codex, Cursor, and Claude Code `--trunk` entry behavior: pending (ADR 0005). This Cursor implementation session does not cover those hosts.

Learnings: publish the claim before creating the worktree so a claim rebase does not require moving an existing worktree; do not reuse Story Branch execution-branch push after a Trunk Mode claim (slice 2 owns increment publication).

### 2. Publish each verified increment from the retained workspace
Type: Behavior
Status: done

Behavior: With unchanged trunk, two separately completed increments each reach
the remote trunk before the next dependent increment; the workspace remains and
no execution branch is published.

Change: Route Trunk Mode slice delivery through rebase/fast-forward publication,
retaining existing preparation gates. Same rule applies to planned, quick, and
contextual work; normal execution retains its current retrospective behavior.
Proof: In a disposable two-increment scenario, inspect remote history after each
boundary, unchanged checkout identity, and absence of a remote workspace branch.
Review no unnecessary proof rerun, no CI wait, and preservation of other modes.
Sizing: One repeated delivery gate; source guidance is the primary change.

Accepted proof (2026-09-16):
- Promise: two unchanged-trunk increments each reach remote `main` before the next; same worktree; no remote execution branch; proof reuse; Story Branch Mode still publishes a workspace branch.
- Boundary: `references/wrap-up.md` delivery + `references/trunk-publication.md#publish-a-verified-increment`.
- Git walk: `/tmp/trunk-mode-slice2-RSDxBA`. Remote `main` at `154facf` (increment 2) with ancestor `5e873ac` (increment 1); execution checkout remains `exec/story` at that SHA; `remote.git` has only `refs/heads/main`. Contrast `sb-remote.git` has `main` and `exec/sb`.
- Native Codex/Cursor/Claude `--trunk` increment delivery: still pending (ADR 0005).

### 3. Incorporate another contributor's increment before continuing
Type: Behavior
Status: done

Behavior: Another worktree publishes while this execution has an unpublished
increment; delivery rebases onto current trunk and preserves both increments,
with the execution workspace observing the combined state for subsequent work.

Change: Reconcile from the fetched target; update rewritten commit attribution
and reverify only affected behavior. Reuse backlog reconciliation for sibling edits.
Proof: A/B/A interleaving in real Git; inspect combined remote files and separate
queue entries, correct execution bases, and survival of previously published SHAs.
Sizing: One interleaving proof; no automatic concurrent admission in this slice.

Accepted proof (2026-09-16):
- Promise: unpublished increment rebases onto fetched newer trunk; both increments and queue entries survive; published SHAs remain ancestors; rewritten candidate is the increment.
- Boundary: `trunk-publication.md` candidate step 3–4; identity unpublished candidate SHA; wrap-up registers rewritten SHA.
- Git walk: `/tmp/trunk-mode-slice3-3zBc` remote `main` `a09f3a2` with `feature-a.txt`, `feature-b.txt`, `feature-a2.txt`; Taken lists Story A and Story B; `81ca425` ancestor; remote only `main`.
- Native still pending.

### 4. Preserve a shared target when integration ownership is unavailable
Type: Behavior
Status: done

Behavior: A target checkout has another active writer or ambiguous local state;
this execution stops its target mutation with its increment recoverable. Once an
exclusive turn is established, ordinary integration can proceed.

Change: Make ownership/cleanliness checks conditional on target mutation and use
existing pause/coordination behavior. Do not create a queue or treat clean status
as proof of exclusivity. Preserve unrelated staged and unstaged content.
Proof: Simulate a declared competing writer with clean and dirty target variants;
inspect unchanged target/index and retained execution commit after the stop.
Sizing: One preservation gate; no distributed locking implementation.

Accepted proof (2026-09-16):
- Promise: competing writer or dirty/ambiguous target stops mutation; unpublished increment remains; target index preserved; clean is not exclusive.
- Boundary: `trunk-publication.md` Preconditions; wrap-up does not register a stopped increment.
- Git walk: `/tmp/trunk-mode-slice4-PJV87L` target `1fe3795` with staged/unstaged/untracked remaining; exec `b743465` not on remote `main`.
- Native pending.

### 5. Recover a rejected push without rewriting published history
Type: Behavior
Status: done

Behavior: Another contributor pushes after our fetch/local integration; publication
is rejected, then succeeds after reconciliation of only our unpublished work.

Change: Retain candidate/base/publication state through a race; refresh actual
remote state, reconcile the owned local suffix, update identities, and retry an
ordinary push. Unknown ownership or persistent failure reports the retained state.
Proof: Inject a competing commit from another clone between integration and push;
assert remote history preserves it and receives our increment exactly once, without
force-push, branch publication, or silently pushing unrelated local commits.
Sizing: One rejection/reconciliation loop; moderate Git-state recovery concern.

Accepted proof (2026-09-16):
- Promise: rejected push after local integration rebases only the owned suffix onto fetched trunk and retries one ordinary push; competing commit remains an ancestor; no force-push or execution-branch publication; second rejection stops.
- Boundary: `trunk-publication.md#recover-a-rejected-push`; wrap-up registers only the confirmed rewritten SHA.
- Git: agent reconstruction plus plan isolated evidence (`rebase --onto` onto fetched trunk from previously published base). Temporary fixture was removed after inspect.
- Native pending.

### 6. Resolve an integration conflict from both contributors' intent
Type: Behavior
Status: done

Behavior: Rebase encounters a conflict; understood intent produces a verified
combined change, while incompatible intent leaves a preserved, reported decision.

Change: Apply existing conflict/human-judgment policy to unpublished rebase work,
including backlog conflict handling. Recheck affected proof before publication.
Proof: Walk one concrete conflicting backlog/code change with known compatible
intent and a countercase lacking the product decision. Inspect both preserved
outcomes or the unresolved work state; no blind ours/theirs choice.
Sizing: One conflict-resolution gate, not an evaluation of general agent competence.

Accepted proof (2026-09-16):
- Promise: compatible unpublished rebase conflict is combined without ours/theirs; incompatible intent keeps markers and unpublished SHA; no publication until affected proof is rechecked.
- Boundary: `trunk-publication.md#resolve-a-publication-rebase-conflict`; wrap-up does not register a conflict stop; `merge-conflicts.md` names fetched trunk vs unpublished suffix.
- Git walk: `.../trunk-mode-slice6-67ng8blr` remote `widget.conf` is `name=widget-pro` / `timeout=30` / `allow_admin=false`; unresolved `UU widget.conf` with remote2 still `4b3c9e5`.
- Native pending.

### 7. Receive CI feedback for the exact published trunk revision
Type: Behavior
Status: done

Behavior: A worktree publishes an increment whose SHA changes during rebase;
its observer runs from the execution checkout but reports coverage/feedback for
the final SHA on trunk, without waiting for CI.

Change: Remove execution-branch assumptions from CI guidance and necessary
callers. Reuse explicit branch and revision registration in the runtime; change
runtime code only for a demonstrated gap. Include claim publication and truthful
unavailable-bridge/registration-failure handling under the existing contract.
Proof: Launch from an installed-layout fixture worktree on a different branch,
observe target-branch request and final SHA registration, and deliver a matching
failure through the applicable bridge. Old SHA/unrelated SHA is not reported as
coverage for our delivery. Required host evidence belongs to this slice.
Sizing: One notification boundary; native bridge evidence may be unavailable and
must remain pending rather than broaden into a new notification framework.

Accepted proof (2026-09-16):
- Promise: observer launched from an `exec/story` worktree requests target `main`; registered claim and rewritten SHA are coverage; old/sibling SHAs are not; delivery does not wait for CI.
- Boundary: `ci-monitor.md` / `runtime-setup.md` target branch; `watch-ci-execution.mjs` `registeredRevisions` filter; `observeRevisionCoverage` walks registered files only.
- Commands: `node --test src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs src/skills/dough-execute-plan/scripts/watch-ci-execution-coverage.test.mjs` (9 pass); `bash tests/execution-payload-update.sh` and `bash tests/dough-update-guidance-payload.sh` after declaring `ci-mailbox-location.mjs`.
- Native Codex/Cursor/Claude bridges: pending (ADR 0005). This session's Cursor probe is `CI_OBSERVER` without `CI_MONITOR_READY`; slice 1–7 pushes are `pendingCi: unobserved`.

### 8. Deliver a trunk CI repair without taking another agent's work
Type: Behavior
Status: done

Behavior: A delivered failure attributable to this execution is repaired from
its retained worktree and published through the same trunk cycle; another known
owner's repair is not duplicated or overwritten.

Change: Extend current pause/stash/repair/restoration behavior with trunk revision
and ownership checks. Queue notifications during repair as already specified;
retain unknown ownership as a coordination stop rather than inventing a registry.
Proof: A notification arrives with unfinished owned work; repair is published,
that work is restored, and the same execution resumes. A known foreign repair
countercase preserves its files and reports coordination instead of duplicate work.
Sizing: One repair lifecycle using existing machinery; no global repair scheduler.

Accepted proof (2026-09-16):
- Promise: owned registered SHA is repaired in the execution worktree and published as a trunk increment; unfinished work is restored; known foreign files are not mutated.
- Boundary: `ci-monitor.md` ownership/stash; wrap-up uses `#publish-a-verified-increment`.
- Git walk: `/tmp/trunk-mode-slice8-fRikt7` remote `main` `84d2876`; exec `?? wip.txt`; foreign `?? foreign-repair.txt`.
- Commands: `node --test src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs src/skills/dough-execute-plan/scripts/ci-custom-guidance.test.mjs` (3 pass).
- Native pending.

### 9. Resume at the first unfinished trunk delivery obligation
Type: Behavior
Status: done

Behavior: After interruption, execution recognizes whether its increment is only
committed, integrated locally, already published, or missing CI registration, and
continues without duplicate commits, pushes, or replacement worktrees.

Change: Extend existing recovery using actual refs, retained rewritten identities,
and observer receipts. Preserve mode when a quick attempt becomes planned.
Proof: Table-driven walkthrough of those four delivery boundaries against real
Git/receipt states. A lost push response with the candidate already on remote
trunk is recognized; ambiguous identity preserves resources and reports the gap.
Sizing: One recovery decision across states of the same publication operation.

Accepted proof (2026-09-16):
- Promise: classify committed / locally integrated / published / missing CI registration; lost push already on remote is published; ambiguous identity preserves worktrees.
- Boundary: `trunk-publication.md#resume-an-interrupted-publication`.
- Git walk: `/tmp/trunk-mode-slice9-ljZ4tg` remote only `main` `c01c1f9`.
- Native pending.

### 10. Review only the selected execution's interleaved changes
Type: Behavior
Status: done

Behavior: Retrospective on a Trunk Mode story identifies its actual delivered
changes even after rebases and interleaved sibling commits, without attributing
the whole trunk range to that story.

Change: Reuse existing SHA manifests, selected-patch review, and recovery of
original intent. Carry published attribution through execution; avoid a second
ledger and preserve normal planned/planless review selection.
Proof: A/B/A history with a rebased unpublished A revision yields only A's delivered
changes in its review; sibling B and stale unpublished SHA are excluded with reasons.
Sizing: One review attribution boundary; no new retrospective process.

Accepted proof (2026-09-16):
- Promise: review uses retained published SHAs only; sibling and rewritten unpublished SHA are excluded with reasons.
- Boundary: `dough-execution-retrospective/SKILL.md` related set; execute-plan identity published revisions.
- Git walk: `/tmp/trunk-mode-slice10-fKLvI9` A1 `2a3e9c9` (`feature-a.txt`), B `64d2c17` (`feature-b.txt`), A2' `31aa759` (`feature-a2.txt`).
- Native pending.

### 11. Publish closure durably before deleting its recoverable history
Type: Behavior
Status: done

Behavior: Wrap-up makes selected review/closure inputs recoverable on shared
trunk, then publishes final cleanup while preserving sibling stories and edits.

Change: Route before-cleanup and final-closure commits through the common Trunk
Mode publication rule. Reconcile observation ownership after execution shutdown;
report exact published closure revisions and pending coverage without waiting.
Proof: Close A while B's backlog/seed work remains active. Inspect remote
before-cleanup recovery, remote final closure, surviving B content, and accurate
CI shutdown/coverage state. Failed publication retains recoverable resources.
Sizing: One durable-closure lifecycle; does not yet claim resource cleanup.

Accepted proof (2026-09-16):
- Promise: before-cleanup then final-closure reach remote trunk; sibling B seed/backlog remains; failed publication keeps local resources; wrap-up observer stops without waiting; worktree not removed.
- Boundary: `dough-story-wrap-up/SKILL.md`; `trunk-publication.md#publish-wrap-up-closure`; `ci-monitor.md` post-shutdown pointer.
- Git walk: `/tmp/trunk-mode-slice11-CcIwC0` remote `main` `d46d4f3` claim, `ec40758` before-cleanup A (recoverable `review-A.md`), `5f08962` final-closure A; B seed remains; A seed gone; remote only `main`. Failed `c047ac2` rejected; `stuck.md` not on remote; worktree remains. `pendingCi: unobserved`.
- Native pending.

### 12. Remove only safely published local execution resources
Type: Behavior
Status: done

Behavior: After durable closure, remove this execution's clean branch/worktree
only when publication and observer shutdown are established; repeated closure
recognizes already-completed steps. Unique work or blocked removal remains intact.

Change: Add Trunk Mode cleanup to the existing wrap-up owner without remote
branch deletion. Keep completion reporting honest and preserve other modes.
Proof: A representative complete local journey ends with remote trunk retaining
all work and owned resources absent. Countercases for unpublished work, active
observer, and dirty/unrelated resources leave those resources intact. Repeated
wrap-up causes no duplicate closure. Native lifecycle evidence belongs here.
Sizing: One resource-lifecycle gate; reuse durable publication evidence from slice 11.

Accepted proof (2026-09-16):
- Promise: published+shutdown removes clean local worktree/branch; no remote execution branch; unpublished, dirty, active observer, unrelated target work remain; retry already-absent; repeat adds no remote commit.
- Boundary: `dough-story-wrap-up/SKILL.md` resource removal; `trunk-publication.md#publish-wrap-up-closure`.
- Git walk: `/tmp/trunk-mode-slice12-U74a3S` remote only `main` `c3e9154` + `dd4cb42`; `exec-ok` absent; unpublished/dirty/observer/unrelated retained.
- Native Codex/Cursor/Claude local lifecycle: pending (ADR 0005).

## Promise coverage and stopping points

| Source promise | Owning slices |
| --- | --- |
| Explicit selection, unchanged defaults, planned/planless/contextual inputs | 1–2 |
| Visible claim, setup failures, existing project conventions | 1 |
| Per-commit publication, local-only branch, unchanged-trunk fast path | 2 |
| Incoming changes, interleaved work, affected proof only | 3 |
| Exclusive target mutation, unrelated work preservation | 4 |
| Push race, failed publication, no remote history rewrite | 5 |
| Conflict intent and human decision boundary | 6 |
| Trunk CI, final SHA, asynchronous and missing coverage reporting | 7 |
| Repair location, restoration, ownership | 8 |
| Interrupted delivery, quick-to-planned continuity, no duplicate work | 9 |
| Story attribution across interleaving and rebase | 10 |
| Review/closure publication, recovery and sibling preservation | 11 |
| Final local-only cleanup, shutdown, retry, truthful completion | 12 |

Every slice must leave existing supported execution modes intact. Intermediate
Trunk Mode capability is not the completed story; make limitations explicit and
preserve execution resources at unsupported boundaries. Do not promote or release
partial lifecycle support as complete. A safe stop retains integrated increments
and recoverable local work; native gaps remain visible. Full story value does not
depend on delivering the later merge queue.

## Plan assessment and evidence

The cumulative design is one mode-aware publication boundary with separate
execution location and publication target. Claims, normal increments, repairs,
and closure reuse it; source type controls its existing lifecycle, not separate
Trunk Mode implementations. Reuse judgments above are based on source inspection,
not completed runtime proof. Slice 1 source and payload proof have run;
native host entry observations remain pending.

Construction separated push-race recovery (5) from interruption recovery (9),
CI observation (7) from repair (8), and durable closure (11) from resource removal
(12), keeping each externally observable gate and proof loop distinct.

### Isolated Git feasibility evidence

On 2026-09-16, Git 2.50.1 (Apple Git-155) passed a disposable local fixture
with a bare remote, a target checkout on `main`, an `execution` worktree, and
a competing clone. The target first fast-forwarded to our execution commit;
the competing clone then pushed an independent commit, rejecting our push.
Both local checkouts were clean and exclusively owned by the fixture.

The tested recovery calls were:

```python
git(target, 'fetch', 'origin')
git(target, 'rebase', '--onto', 'origin/main', base, 'main')
git(execution, 'rebase', '--onto', 'main', old, 'execution')
git(target, 'push', 'origin', 'main')
```

Here `git(where, *args)` invokes `git -C <where> <args>`; `base` is the
previously published base SHA and `old` is our locally integrated, unpublished
candidate SHA. The second rebase moves the execution branch with no remaining
commits beyond that candidate. It is not a recipe for discarding additional work.

Critical postconditions passed: the competing published commit remains an
ancestor, our increment appears exactly once, both checkouts end at the rewritten
candidate with both files, and the remote has only `main`. No force push was used.
The temporary fixture was removed. This proves the clean, exclusively owned
Git-state transition only; it does not prove skill behavior, conflicts, unknown
ownership, additional unfinished work, or native host delivery.

Remaining concerns: slice 5 must prove reconciliation of a locally integrated
but unpublished suffix through the actual skill, beyond the isolated Git proof;
slice 7 must establish checkout/target separation in the
native hosts rather than relying on the runtime signature; slices 4 and 8 must
stop safely where independent coordinators cannot establish ownership. These are
bounded verification concerns, not authorization to add the queued merge service
or weaken ownership guarantees. Native coverage selection/availability is not yet
established. No timing guarantee or claim of zero integration overhead is made.
