---
id: SEED-008
status: active
planted: 2026-09-08
planted_during: unknown
trigger_when: when evaluating or designing branch/worktree workflows for trunk-based development
scope: unknown
---

# SEED-008: Execute stories with continuous trunk integration

## Why This Matters

Developers want agents to work in separate worktrees while sharing small,
verified changes through the team's trunk throughout a story. Workspace
isolation must not postpone integration until the story is complete.

## Stories

<a id="claude-code-background-mode"></a>

### 5. Complete execution and wrap-up in fresh Claude Code background mode

**Status:** Refined 2026-09-18; third backlog priority. Not planned.

**Goal:** A developer running Open Dough work in Claude Code background mode can
take a queued story, execute it, and close it, ending with committed closure on
the branch they already have checked out. The developer keeps ownership of
branch publication and any pull request. This contributes to the seed's parent
goal because background mode is how a developer launches several agents at
once, so Open Dough must be usable there before parallel execution is
worth pursuing.

**Observed problem:** With its default `worktree.bgIsolation` setting, Claude
Code background mode starts work in a host-created Git worktree on a branch
that is not the project's integration branch. Three current rules do not
compose with that checkout:

1. `dough-execute-plan` requires the **Taken** claim to be committed on the
   resolved integration branch, and explicitly stops queued current-branch
   execution when that branch is not available. A host-provided feature-branch
   checkout therefore stops before the backlog changes.
2. Story Branch Mode would create a second, nested worktree inside the
   host-provided one.
3. Story Branch Mode wrap-up integrates the execution branch into `main`
   locally and pushes `origin main`, which is unsafe from a host checkout the
   developer expects to publish themselves.

An earlier capture also asserted that background mode integrates results through
a pull request by default. Review on 2026-09-18 did not confirm that: the
observed background-mode instruction is to commit or push only when asked and to
branch first when on the default branch, with a pull request named only as one
possible reported outcome. This story therefore treats pull-request cooperation
as unproven and out of scope rather than as a requirement.

**Scope — required behavior:**

- Installed Open Dough guidance states the supported background-mode
  configuration, `worktree.bgIsolation` set to `none`, so a fresh installation
  runs in the developer's project checkout rather than a host-created worktree.
- Background-mode execution uses the existing direct-current-branch execution
  location: it records the current checkout and branch for both execution and
  integration and creates no worktree.
- The claim rule resolves for a checkout that is not on the resolved integration
  branch: either the claim is recorded safely, or execution stops before
  changing the backlog with a diagnostic naming the current branch, the
  resolved integration branch, and the action required.
- Wrap-up ends at committed closure, as direct-current-branch mode already
  specifies, and reports the branch the developer must publish.

**Scope — rejection constraints:** Do not create a nested or replacement
worktree inside a host-provided one; ADR 0002 requires recoverable work, and a
second worktree layer hides which checkout the host and the developer own. Do
not advance or push the integration branch from a host-provided checkout. Do not
change Story Branch Mode or Trunk Mode behavior; ADR 0007 remains Proposed and
this story is not authorization to alter the other lifecycles.

**Deferred promises:** This delivery does not build or verify pull-request
creation, merge, or post-merge cleanup; cooperation with the default
`bgIsolation` worktree isolation beyond stopping safely; a host-worktree
detector, registry, or worktree manager; host keep-or-remove worktree exit
handling; Codex or Cursor background equivalents; cloud or remote background
sessions; or cleanup of pre-existing stale worktrees.

**Key examples:**

1. *Documented configuration.* A developer installs Open Dough into a fresh
   project and follows the installed guidance to configure background mode.
   Starting a background session leaves the session working in the project
   checkout, and `git worktree list` gains no host-created entry.
2. *Claim from a non-integration branch.* A background session sits on a feature
   branch while the resolved integration branch is `main`, and the developer
   selects a queued story. Execution either records the claim on the resolved
   integration branch through the recorded originating checkout, or stops with
   the backlog unchanged and reports the current branch, the resolved
   integration branch, and the required action. It does not stall silently and
   does not commit the claim to the wrong branch.
3. *Closure without publication.* A story executes to completion in
   direct-current-branch mode. Wrap-up commits the before-cleanup revision and
   the final closure, removes the **Taken** entry, and stops. Local `main` is
   not advanced, nothing is pushed to `origin main`, no branch or worktree is
   deleted, and the report names the branch the developer publishes.
4. *Unsupported configuration, boundary.* A background session starts under the
   default `bgIsolation` inside a host-created worktree. Open Dough reports the
   unsupported configuration and stops rather than nesting a second worktree or
   guessing an integration target.

**Evaluation:** Run the examples above in a scratch repository from an
installation with no prior workflow personalization, meaning default Claude Code
settings for worktree isolation and no retained memory of this maintainer's
preferences. This maintainer's own machine already sets `bgIsolation` to
`none`, so reproducing the default behavior means reverting that setting rather
than using the existing setup. Judge the outcome from the session's working
directory, `git`
refs and worktree list, the backlog file contents, and the presence or absence
of pushes — not from the agent's self-report, per ADR 0005 section 4.

**Value / learning:** The documentation slice establishes cheaply whether a
supported configuration alone makes a fresh installation work, which would
retire the worktree half of this problem. The remaining slices establish whether
the existing direct-current-branch mode is a sufficient host adaptation, and
resolve where a queue claim can be recorded when the executing checkout is not
on the integration branch. That question is shared with the same-machine merge
queue story.

**Effort hypothesis:** S–M, medium confidence. Refinement removed the
pull-request lifecycle unknown and identified an existing execution mode that
already fits, so the remaining cost is the claim-location resolution and one
native background-mode observation.

**Depends on:** No hard product prerequisite. Terry Yin sequenced this story
after the now-delivered scripted product backlog updates
and [Queue trunk integration for agents on the same machine](#same-machine-merge-queue)
on 2026-09-18, because both touch the same claim-commit seam: recording a claim
on the integration branch from an executing checkout that is not on it is the
shared-checkout contention the merge queue story owns, and the claim commit is
itself a backlog edit.

**Architecture and boundaries:** Follow
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by preserving recoverable work and leaving publication with its owner;
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires fresh native evidence because background mode is a materially
different activation mode; and
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
is satisfied here by a documented configuration and a mode-selection rule rather
than a second behavior copy. Refinement resolved the previously open ownership
question: the developer owns branch publication and any pull request, and Open
Dough does not take that responsibility in this story. ADR 0007 remains Proposed
and is not adopted by this story.

**Open decision:** The product backlog's near-future direction still reads
"each agent working in its own Git worktree," while this story's chosen answer
is that a background-mode agent works in the developer's existing checkout and
creates no worktree. Refinement did not change that direction; a human decides
whether the direction wording, this story's approach, or neither needs revising.
This affects how this story is justified, not what it delivers.

**Safe stopping point:** After the documentation slice, a fresh installation has
a supported background-mode configuration and never nests a worktree. Cancelling
the later slices leaves every other execution mode unchanged.

<a id="same-machine-merge-queue"></a>

### 2. Queue trunk integration for agents on the same machine

**Status:** Captured; second backlog priority. Not refined or planned.

**Goal:** A developer running multiple agents in separate worktrees on the same
machine gets orderly integration into their shared trunk without manually
arbitrating each agent's turn or letting agents mutate the integration checkout
at the same time.

**Scope candidate:** Introduce a same-machine merge queue for Trunk Mode.
Agents submit ready increments; one integration runs at a time, reconciles with
current trunk, and reports its result to the submitting agent. Preserve the
local execution branches, trunk publication, and CI ownership established by
Trunk Mode. Failed or interrupted integration must preserve the submitted work
and leave a visible state that can be recovered without duplicate publication.

**Key example / evaluation:** Two agents submit increments from different
worktrees while sharing one integration target. Both increments eventually
reach trunk, each is reconciled against preceding integrated work, and neither
agent concurrently modifies the integration checkout. An integration that
cannot proceed reports its blocked state without losing either submission.

**Depends on:** completed Introduce Trunk Mode for plan execution, recoverable
from `ef6a59c:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#introduce-trunk-mode`.
Trunk Mode remains usable through explicit coordination without this queue.

**Deferred decisions:** Queue ordering/fairness, whether a blocked submission
allows later independent work through, admission and cancellation interfaces,
crash recovery, and how an agent knows who owns an integration. Resolve these
when refining this story; no daemon, storage format, or locking design is chosen.

**Boundaries:** One machine and one repository's shared integration target per
queue. Distributed queues, hosted cloud-agent integration, a parallel-agent
launcher, and global CI repair scheduling are not promised. Reuse an existing
solution if suitable; this capture authorizes no queue implementation.

**Continuity reminder (2026-09-20):** When refining this story, revisit
[claim publication's interim coordination](../../src/skills/dough-execute-plan/references/trunk-publication.md#preconditions).
Replace the manual integration-turn arrangement with the chosen common local
coordination mechanism, including prepared direct edits and claim publication,
not only implementation merges. Replace its manual blocked-turn recovery with
the queue's explicit recovery/handoff policy; never release ownership merely
because a timeout elapsed. Preserve the publication-before-implementation rule
and the existing Git publication owner. Remove superseded manual-only guidance
and duplicate coordination paths, and demonstrate that a claim and another
writer cannot concurrently mutate the shared checkout. This is follow-up scope
input, not selection of a lock, daemon, queue API, or automatic recovery design.

<a id="planning-workspace-procedure"></a>

### 6. Prepare stories and slice plans in a clear developer workspace workflow

**Status:** Refined 2026-09-20.
[Slice plan](../quick/065-prepare-stories-in-owned-worktrees/PLAN.md) prepared;
execution not started.

**Goal:** A developer can decompose, refine, and plan upcoming stories alongside
agents executing in worktrees, without leaving planning edits on the shared
integration checkout or occupying it while discussing the work. Retained planning
results reach the shared project through a bounded integration and publication
operation.

**Observed problem and why now:** Terry Yin reports on 2026-09-20 that this
interruption occurs often: executing agents repeatedly need to integrate into
`main`, but ongoing refinement or planning leaves that checkout occupied. The
planning skills never established where their editing belongs. This is a current
obstacle to parallel work, not speculative preparation for a future queue.
Fixing it deserves priority over the second-project dashboard and richer progress
views because it removes a recurring disruption to delivering that work. The
later queue will serialize integrating agents; it cannot compensate for planning
sessions leaving edits on the shared checkout.

**Scope — required behavior:**

- Story decomposition, story refinement, slice planning, and slice-plan
  refinement establish an exclusively owned worktree before editing project
  records. When invoked from the default integration checkout, move the editing
  work into a suitable owned worktree. Do not treat the fact that Git's default
  checkout is technically a worktree as satisfying this separation.
- Reuse a suitable owned worktree for related preparation, including successive
  skill invocations and continuation after discussion. Create one only when no
  suitable workspace is available. A host-provided worktree can be reused when
  its ownership, branch, and integration target are understood; do not nest a
  second worktree merely because another skill is invoked.
- Keep preparation, investigation, discussion, waiting for a developer response,
  and all resulting preparation edits in that workspace. A small or already-decided
  refinement or planning edit does not gain a direct-edit exception on the shared
  integration checkout.
- When the developer's conclusion is to keep the result, that decision authorizes
  committing, integrating, and pushing the retained preparation changes to the
  established project integration target. Do not require a separate push approval
  for those changes. Preserve an explicit instruction to leave work unpublished,
  and do not extend this authority to implementation, unrelated changes, or an
  unknown publication destination. A pause or silence is not a keep decision.
- Reconcile prepared work with current integration state and deliver it through
  one bounded merge/rebase-and-publication operation for the retained result,
  using the existing publication behavior and explicit coordination. This is
  not a promise of a transactional Git operation, a single commit, or conflict-free
  integration. If reconciliation needs further discussion, preserve the work
  and recover or hand off the integration turn explicitly; do not leave another
  planning session occupying the shared checkout.
- Preserve unrelated edits and unfinished preparation. After successful
  integration and required publication, remove only disposable resources owned
  by this session. Host-owned or reused resources are not automatically disposable.
  Unpublished preparation remains invisible to the remote-only dashboard.
- Give the common workspace behavior one authoritative home and align the
  affected preparation-skill entry points. Reuse the existing publication
  sequence rather than creating a planning-specific version. Execution startup
  and its Taken transition remain outside this story.

**Scope — constraints and exclusions:** Terry Yin's September 20 clarification
selects worktree editing for decomposition, refinement, and planning, including
small preparation edits. This is not a universal prohibition on direct edits
in the shared integration checkout.

Moving an item from the backlog list to Taken when executing a plan is explicitly
excluded. That execution-startup operation is intended to edit `main` directly
under the future shared integration lock, preventing competition with other
participating writers. The later
[local coordination story](#same-machine-merge-queue) owns that lock-protected
path. This story neither moves Taken updates into preparation worktrees nor
changes existing claim startup/resume or publication obligations. Until the lock
is delivered, existing explicit coordination continues to apply; this refinement
does not claim that automatic protection already exists.

Align overlapping guidance only for the preparation workflow. Preserve the
separate prepared direct-edit path described in the
[quick-edit requirements](../../docs/project-visibility-requirements.md#quick-edits-in-the-default-checkout)
for execution-startup claims. Proposed ADRs 0007 and 0008 remain Proposed; their
inconsistent planning-workspace wording must be surfaced for human-owned
alignment, not implicitly accepted or superseded.

**Key examples:**

1. *Preparation alongside execution.* Agent A executes in its worktree and
   repeatedly integrates increments. Agent B starts decomposition from `main`,
   then refines a story and prepares its slice plan. Before editing, B establishes
   an owned preparation worktree and reuses it throughout. Waiting for the
   developer's answer leaves no B-owned planning edits on `main`; A can continue
   its coordinated integrations.
2. *Keep and publish.* The developer concludes that B's preparation should be
   kept. B reconciles its retained changes with the now-current integration
   branch and, during an explicitly coordinated turn, integrates and pushes them
   without another push-approval question. Published records describe the agreed
   result; A's intervening work remains present.
3. *Existing workspace and a small edit.* A session already owns a suitable
   worktree and makes a small refinement correction. It reuses that workspace,
   creates no nested or per-invocation worktree, and does not edit the shared
   checkout directly.
4. *Unfinished or conflicting work.* Preparation stops with an unresolved scope
   question, or integration exposes another developer's incompatible change.
   The agent preserves both parties' work and reports the needed decision.
   Unfinished preparation is neither silently published nor deleted, and a
   blocked integration turn is recovered or handed off explicitly before another
   writer proceeds.
5. *Execution-startup boundary.* An agent begins executing a plan and must move
   its backlog item to Taken. That operation is outside this preparation
   workflow. This story does not require a worktree for the claim edit or alter
   its existing behavior; direct editing on `main` under a shared lock belongs
   to the later coordination delivery.

**Evaluation:** Observe these journeys through the affected skills, checking
actual checkout locations, uncommitted changes, Git history, published records,
and retained resources. Updated prose alone does not establish the outcome.
Use the project's existing cross-tool validation boundaries; do not infer host
behavior from one tool's successful run or add a routine discovery matrix.

**Simpler alternatives:** Keeping the current informal procedure leaves the
reported recurring interruption unresolved. Preparing a small refinement edit and applying
it directly on `main` retains an exception the developer has explicitly rejected
for preparation work. The separate execution-startup claim is excluded.
A new worktree per skill invocation adds needless setup and fragments related
work. Reusing one owned preparation workspace, followed by existing integration
and publication behavior, is the smallest selected response. An automated queue
is not necessary to establish this editing boundary.

**Deferred promises:** Execution-startup Taken edits and their lock protection;
automatic serialization, locks, merge queues, fairness,
timeout takeover, and automated crash recovery; dashboard controls or local
visibility; a worktree registry or manager; comprehensive host/background-mode
support; and broader execution-mode redesign. Existing explicit coordination is
still necessary: this story does not claim that two integrating agents can never
collide. Editing isolation also does not resolve conflicting product decisions.

**Value / learning:** Remove an observed source of interrupted integration and
establish whether shared skill guidance plus workspace reuse makes preparation
coexist with execution without unnecessary setup. Useful even if the later queue
or dashboard enhancements are deferred.

**Effort hypothesis:** The original M estimate remains unverified; confidence is
low until planning assesses the shared preparation-workspace guidance and
its affected skill entry points. This refinement does not prescribe slices or a new mechanism.

**Depends on:** No unfinished implementation prerequisite. Reuse the delivered
publication behavior and explicit integration-turn coordination. Automated
same-machine serialization remains owned by
[Queue trunk integration for agents on the same machine](#same-machine-merge-queue),
which must coordinate both integration of prepared worktree changes and
permitted direct edits such as execution-startup Taken transitions.

**Safe stopping point:** The preparation skills use owned worktrees and deliver
retained records through existing coordinated integration/publication. Shared
checkout editing no longer accumulates through planning discussions, even before
an automated queue exists. This refinement authorizes no skill implementation
or executable slice plan.

**Origin and decisions:** Captured at Terry Yin's request on September 20 from
the September 19 concern recorded in `903f905`. Terry's September 20 refinement
supplies the recurring disruption evidence, selects worktree editing for all
changes under this procedure, grants publication authority for results concluded
to be kept, and leaves integration serialization to the later story. His
subsequent clarification explicitly excludes execution-startup Taken updates
and assigns their direct-on-main, lock-protected path to that later work. See also
[ADR 0008's alignment note](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md).

**Architecture:** Follow Accepted
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for current user value, recoverable work, and reuse of existing publication;
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for one shared behavior written for the executing agent. Keep these maintainer
references out of required runtime project context. The two Proposed lifecycle
and dashboard ADRs do not impose a binding requirement to edit on `main`.

## Research and Architectural Context

Research on 2026-09-16 established precedent for frequent mainline integration
from local branches, including after each healthy commit. It did not establish
that this exact worktree lifecycle is a mainstream built-in mode, or measure its
agent overhead. [Fowler's branching patterns](https://martinfowler.com/articles/branching-patterns.html)
and [Git rebase](https://git-scm.com/docs/git-rebase) inform the selected approach.
This resolves the original feasibility concern sufficiently for refinement;
host-specific behavior still needs evidence when implemented.

[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
principle 2, supports continuous integration and resolving conflicts through
shared intent. [ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs proof and native acceptance. [ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one shared behavior with only necessary host adaptation, written for
the executing project. Follow [maintainer guidance](../../AGENTS.md) when authoring.

[ADR 0007 — Software development lifecycles](../../docs/adrs/0007-software-development-lifecycles.md)
remains Proposed. Its Story Branch Mode waits until closure to integrate;
Trunk Mode introduces another mode without accepting or superseding that draft.
The existing source guidance assumes execution-branch publication and end-only
integration; changing those assumptions for Trunk Mode is within this story,
not grounds for silently changing the behavior of the other modes.

## Breadcrumbs

- Original seed: `5e424b7`, 2026-09-08; removed in `ac4519b`, 2026-09-09;
  recovered on 2026-09-16.
- Related historical seed: `5e424b7:.planning/seeds/SEED-002-trunk-based-multi-agent-collaboration.md`.
- Terry Yin named Trunk Mode and requested first backlog priority on 2026-09-16;
  subsequent research and discussion selected rebase followed by trunk
  publication. This seed is planning input, not implementation authorization.
