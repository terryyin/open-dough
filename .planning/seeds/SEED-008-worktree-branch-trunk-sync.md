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

<a id="introduce-trunk-mode"></a>

### 1. Introduce Trunk Mode for plan execution

**Status:** Taken; in execution on `quick/052-introduce-trunk-mode` (authorized 2026-09-16 via `/dough-execute-plan 52`).
**Slice plan:** [Plan 052](../quick/052-introduce-trunk-mode/PLAN.md).

**Goal:** A developer executes planned or authorized planless work in **Trunk Mode**: the agent
works in a retained local branch and worktree, immediately integrates each
verified commit into shared trunk, receives CI feedback from trunk, and closes
the work with safe cleanup. Other contributors can consume its increments
before the story finishes.

#### Scope and required behavior

- **Select and retain the mode.** Record Trunk Mode with the existing execution
  identity so delivery, CI repair, retrospective, wrap-up, and resumption use
  the same policy. Selection is explicit for planned and planless execution,
  preserving the existing default and current-branch behavior. Exact
  invocation syntax is a planning detail; no new configuration system is needed
  just to select the mode.
- **Claim and establish the workspace.** For queued work, reuse the existing
  Taken transition and create one owned local branch/worktree. Publish the claim
  to shared trunk before implementation so collaborators can see it. Preserve
  unrelated staged/unstaged work and existing queue entries. A failed claim
  publication or workspace setup leaves a recoverable state, not permission to
  start unclaimed queued work. Authorized contextual planless work needs no
  fabricated story, plan, or backlog claim; retain its identity in the existing
  conversation. Planned corrections keep their existing plan as their source.
- **Integrate each commit.** Retain the established proof, refactoring,
  formatting, and commit gates. Each execution commit must be a shareable
  increment. Immediately reconcile with current shared trunk, rebase only
  unpublished story work where needed, fast-forward the local integration
  target, and publish to its authorized remote destination. `main` and
  `origin/main` describe the ordinary case; retain project-supplied target and
  remote conventions. Never push the execution branch or rewrite published
  trunk history. Do not accumulate a batch for end-of-story integration.
- **Continue in the same worktree.** Bring integrated trunk changes into the
  execution workspace at delivery boundaries, and before dependent work needs
  them. A successful rebase is not proof of behavioral compatibility: rerun
  checks whose evidence the combined changes invalidate. Reuse unaffected
  proof; no blanket full-suite rerun per synchronization.
- **Handle other contributors.** Preserve both contributors' work when trunk
  advances, including sibling claims and backlog changes. Coordinate mutations
  to a shared local integration checkout. A competing remote push requires
  reconciliation with the newer trunk before retrying; no force-push or blind
  retry. Resolve conflicts from both sides' intent and verify the resolution.
  Unclear product intent or ownership stops the affected integration for a
  human decision. Do not require a new scheduler to make this safe.
- **Observe trunk CI from the execution workspace.** Track the actual published
  revision after any rebase, not an obsolete pre-rebase SHA or a later moving
  HEAD. Keep repair edits in the execution worktree and deliver them through
  the same cycle. Reuse asynchronous CI behavior: ordinary pushes do not wait
  for CI; delivered failures are handled and missing/pending coverage is
  reported truthfully. Sharing a trunk does not confer ownership of every
  failure or permission to duplicate another coordinator's repair. Inspect
  relevant history and current repair context before acting; unresolved
  ownership blocks conflicting repair work.
- **Recover and close coherently.** Distinguish committed, integrated locally,
  published remotely, and CI-observed work on resumption; continue the first
  unfinished obligation without duplicate delivery or a new worktree. Apply
  the same publication policy to review/closure commits. Preserve attribution
  to this story even when other stories' commits are interleaved on trunk or
  rebasing changes commit IDs. Existing retrospective and closure obligations
  remain, including no automatic retrospective for wholly planless execution;
  execution completion alone does not delete the worktree. Wrap-up
  removes only the completed story's clean local branch/worktree after final
  publication, preserving unique work and reporting partial cleanup. There is
  no remote execution branch to delete.

**Meaning of immediately:** Integration/publication is the next delivery
obligation after a commit, before the next dependent implementation increment.
It is not a wall-clock guarantee or an instruction to bypass conflicts,
verification, permissions, or unavailable network access. A blocked delivery
preserves work and reports its exact state.

#### Key examples

1. **Ordinary progression:** Select Trunk Mode for a planned story with two
   increments. Its claim becomes visible on shared trunk; each verified commit
   reaches remote trunk separately, while the same local worktree is retained
   and no remote execution branch is created.
2. **No new trunk changes:** Commit an increment while trunk is unchanged.
   Synchronization needs no replay, integration fast-forwards, and execution
   continues without repeating unaffected proof or waiting for CI.
3. **Interleaved stories:** Two worktrees start from the same trunk. A publishes
   an increment; B rebases its unpublished increment onto the new trunk and
   publishes. A then incorporates B's change on its next integration. Both
   increments and both stories' planning/backlog content survive; each review
   attributes only its own work.
4. **Race or conflict:** Another contributor publishes after our fetch, or a
   rebase reports a conflict. Preserve the local increment, reconcile with the
   latest trunk, verify affected behavior, and retry ordinary publication.
   Incompatible intentions remain a reported decision instead of being silently
   discarded. An interrupted retry resumes without duplicating the increment.
5. **Trunk CI failure:** CI fails for the published revision after a rebase.
   Feedback identifies that revision, repair occurs in the retained execution
   worktree, and the repair is integrated into trunk. Unrelated or already-owned
   repair work is distinguished from this execution's responsibility.
6. **Closure and blocked delivery:** Successful closure publishes its final
   commits and removes only owned local resources. If push fails after local
   integration, retain the branch/worktree and report publication as unfinished;
   a retry completes publication before cleanup. Pending CI remains explicitly
   unobserved under the existing completion contract.

7. **Planless execution:** Explicitly select Trunk Mode for an authorized quick
   story or contextual instruction. Its verified increment is published through
   trunk and wrap-up removes its local resources, without creating a plan or
   adding an automatic retrospective. If ordinary replanning rules turn the
   attempt into planned work, preserve the mode and existing workspace.

#### Narrow delivery boundary

Deliver one coherent mode through the existing execution lifecycle, including
its necessary CI, review, and closure adaptations. A happy-path rebase command
alone is insufficient. Reuse existing Git, conflict-resolution, proof, and CI
facilities rather than introducing parallel abstractions by default.

Support local execution in Codex, Cursor, and Claude Code. Worktree creation,
search, indexing, and dependency/build cache optimization remain host/project
concerns. Hosted cloud-agent execution is excluded from the near-future scope,
per Terry on 2026-09-16; revisit only if provider capabilities materially change.

The first delivery does not promise a parallel-story launcher, distributed task
claim service, central merge queue, global CI-repair coordinator, or new Git
worktree manager. Ordinary interleaving and integration races remain required;
excluding orchestration machinery does not exclude correctness with another
contributor. Automatic mode switching, migration of an in-flight Story Branch
Mode execution, PR-based integration, changes to repository protection rules,
and performance benchmarks are deferred. Planned and planless execution share
the mode; their existing source, authority, and review differences remain.

#### Evaluation and decisions

Review the behavior against the examples above and exercise the delivery and
recovery boundaries with real Git state. Check that Story Branch Mode and
caller-selected current-branch execution retain their established behavior.
Use the maintainer behavior review and ADR 0005 to select required native
observations or justified reusable evidence for each host; document missing
coverage rather than inferring it from another host. Outstanding native
acceptance must have an explicit owner before release; do not invent a full
host-by-scenario matrix or treat this refinement as native acceptance.

**Confirmed decisions (2026-09-16):** Explicit selection, with the current
execution default unchanged; both planned and planless execution are included.
No unresolved product decision currently blocks refinement. Invocation syntax,
local integration coordination, and the smallest sufficient adjustments to CI
identity and commit attribution remain implementation-planning concerns. A
concrete feasibility conflict discovered there must be surfaced, not hidden by
weakening these outcomes.

**Existing contracts retained unless explicitly changed:** Asynchronous CI and
its reporting limits; ordinary execution/refinement authority; human ownership
of disputed intent; safe cleanup after closure. This story does not add a
requirement to wait for every CI run to finish before declaring closure.

**Sizing concern:** This crosses execution, CI identity, and closure, so it is
not merely a small Git-command edit. No estimate is asserted before planning.
The safe stopping point is a complete usable mode; wider automation can be
cancelled without losing its value.

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

**Depends on:** [Introduce Trunk Mode for plan execution](#introduce-trunk-mode).
Trunk Mode remains usable through explicit coordination without this queue.

**Deferred decisions:** Queue ordering/fairness, whether a blocked submission
allows later independent work through, admission and cancellation interfaces,
crash recovery, and how an agent knows who owns an integration. Resolve these
when refining this story; no daemon, storage format, or locking design is chosen.

**Boundaries:** One machine and one repository's shared integration target per
queue. Distributed queues, hosted cloud-agent integration, a parallel-agent
launcher, and global CI repair scheduling are not promised. Reuse an existing
solution if suitable; this capture authorizes no queue implementation.

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
