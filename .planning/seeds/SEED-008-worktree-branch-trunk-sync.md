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

<a id="planning-workspace-procedure"></a>

### 6. Prepare stories and slice plans in a clear developer workspace workflow

**Status:** Captured 2026-09-20; not refined or planned.

**Goal:** A developer doing story decomposition, story refinement, slice
planning, or plan refinement knows where to start the work, how to continue
related planning in the same workspace, and how to publish the resulting
records into the shared project without blocking other agents' integration.

**Observed problem:** The September 19 discussion captured workspace intentions
in the [project visibility requirements](../../docs/project-visibility-requirements.md#quick-edits-in-the-default-checkout),
but they do not yet form a coherent developer procedure across the planning
skills. Proposed ADR 0007 places planning on `main`, while proposed ADR 0008
explicitly identifies the need to align that wording with owned workspaces.

**Scope candidate:** Establish and align the developer-facing procedure and
shared skill guidance for choosing or reusing an owned worktree, starting and
continuing a bounded planning session, committing and integrating its records,
publishing when required, and cleaning up temporary resources. Cover decomposition
as well as refinement and slice planning. Distinguish prepared quick edits from
work involving discussion, exploration, or waiting for a developer response.
Explain responsibilities when the host already supplies a worktree and when
local coordination still requires explicit human coordination. Surface the
proposed ADR wording conflict for human resolution; do not accept or supersede
an ADR implicitly.

**Key example / evaluation:** While another agent executes a story, a developer
starts decomposition, refines one resulting story, and makes its slice plan.
The procedure identifies the workspace and branch to use, allows related work
to reuse them, and keeps discussion from occupying the shared integration
checkout. The developer can integrate and publish the planning records, then
remove only disposable owned resources. A separate prepared backlog-field edit
has a clear short path. Existing unrelated edits are preserved, and unpublished
planning progress is honestly described as invisible to the remote-only dashboard.

**Value / learning:** Developers can prepare upcoming work alongside execution
without guessing workspace ownership or treating every skill call as a new
worktree lifecycle.

**Effort hypothesis:** M, low confidence until refinement checks the affected
skills and host-owned workspace cases.

**Depends on:** No unfinished implementation prerequisite. The procedure must be
usable with explicit coordination before the same-machine integration queue
exists; implementing the shared lock and queue remains owned by
[Queue trunk integration for agents on the same machine](#same-machine-merge-queue).

**Safe stopping point / boundaries:** Deliver a usable planning-work procedure
and consistent guidance independently of dashboard or queue implementation.
Do not introduce a dashboard control interface, lock service, or broader
execution-mode redesign. This capture authorizes neither planning nor execution.

**Origin:** Terry Yin's September 20 request to capture the September 19 concern
as a story and place it third in the product backlog; requirements recorded in
commit `903f905`. See also
[ADR 0008's alignment note](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md).

<a id="publish-shared-backlog-claims"></a>

### 7. Publish shared backlog claims before isolated execution

**Status:** Captured 2026-09-20; first backlog priority. Not planned.

**Goal:** A developer running Story Branch and Trunk Mode tasks together can
start either task without leaving its backlog claim unpublished on shared
`main`, blocking another task's otherwise valid publication.

**Observed problem:** Plan 62's Trunk Mode delivery stopped when the Claude
dashboard task left claim `beafc8d` on local `main` without pushing. The owner
pushed it, and plan 62 rebased cleanly and published. This followed the current
instruction: `dough-execute-plan` commits claims on the integration branch in
every mode, but tells Story Branch Mode not to push its claim separately.

**Scope:** Publish an owned claim on the resolved shared integration branch to
its authorized remote before releasing the integration turn and beginning
isolated implementation, in both Story Branch and Trunk modes. Preserve each
mode's subsequent implementation-delivery behavior. Keep ownership checks,
backlog reconciliation, non-force publication, and recoverable failure handling.
Align startup prerequisites, claim rules, workspace creation, recovery, and CI
observation where they depend on this publication boundary. Resolve the existing
direct-current-branch contract explicitly; do not silently expand its push authority.

**Key examples / evaluation:**

1. A Story Branch task takes an item on shared `main`; its claim reaches the
   remote before isolated work starts. A concurrent Trunk task can then publish
   without being blocked by that task's unpublished local claim.
2. A Trunk task retains the same claim-before-implementation behavior. Neither
   mode publishes another writer's unpublished commits or forces a push.
3. A rejected or unavailable claim push preserves the exact claim and queue
   state, reports the remaining publication obligation, and does not begin
   implementation or create a duplicate claim on resume.

**Investigation:** This is not a one-passage edit. Source locations include
`src/skills/dough-execute-plan/SKILL.md` (push prerequisites, mode-specific
claim rebasing, and the explicit no-push rule), `references/execution-location.md`
(workspace starts after local commit), and `references/trunk-publication.md`
(Trunk-only scope). No direct wording assertion for the no-push rule was found;
related coverage includes `ci-target-branch-worktree.test.mjs`,
`trunk-publication-local-main.test.mjs`, and `tests/execution-payload-update.sh`.
Review their actual boundaries when planning; they do not execute this prose.

**Boundaries / safe stopping point:** One consistent claim-publication contract;
no merge queue, lock service, unrelated backlog-workflow redesign, or changes to
installed managed copies. Independent of the same-machine queue story above.
The owner requested this first-priority story if the repair was not confined to
one instruction without bound tests. Capturing it does not authorize execution.

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
