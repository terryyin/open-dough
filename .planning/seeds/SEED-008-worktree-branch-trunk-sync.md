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

<a id="separate-bug-exploration-from-execution"></a>

### 6. Separate bug exploration from repair execution

**Status:** Refined; first backlog priority. Planned.
[Slice plan](../quick/056-separate-bug-exploration-from-execution/PLAN.md).

**Goal:** A developer reporting a bug gets a stable, disposable workspace for
standalone investigation, while any later repair starts through
`dough-execute-plan` in a different branch and worktree from the planning state
integrated into `main`.

**Current gap:** `dough-manual-testing` already gives standalone exploration a
temporary branch and paired worktree with retained identity, safe resume, and
safe cleanup. `dough-bug-fixing` instead enters planless execution immediately,
so investigation and repair share an execution identity and an inconclusive or
larger attempt can leave planning evidence entangled with that repair workspace.

**PFE and architecture:** Reuse the manual-testing workspace lifecycle for the
same domain responsibility: a standalone, checkout-bound exploration session
needs one verified branch/worktree identity, reuse on resume, an unchanged
originating checkout during exploration, and safe cleanup or exact retention.
Do not copy those rules into `dough-bug-fixing`. Modularize them into one focused
runtime reference used by both skills, preserving current manual-testing
behavior. Keep bug-specific artifact integration and the handoff to
`dough-execute-plan` in `dough-bug-fixing`; they do not belong to manual
testing. Add no workspace manager, new skill, registry, configuration, or
per-tool behavior copy.

This follows
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by preserving recoverable work and integrating the selected planning state
before later execution, and
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
by keeping the shared lifecycle in one authoritative runtime source. ADR 0007
remains Proposed and is not adopted by this story.

**Scope:** When standalone bug investigation needs a project checkout and no
story, plan, caller selection, or other workflow already supplies one, create a
temporary branch and paired worktree from the verified current revision before
checkout-bound investigation. Retain and verify that workspace identity across
the bounded investigation and any resume. An already-established checkout stays
authoritative and gets no nested workspace.

Use the temporary workspace only to establish the report's validity, evidence,
and routing. Do not repair the product there. A supported no-change conclusion
or a confirmed bounded repair closes exploration before returning its evidence;
an authorized repair then invokes `dough-execute-plan` from the applicable
integrated revision, which creates its own execution branch and worktree under
its existing rules.

If exploration creates or updates a canonical story, executable plan, or other
durable planning evidence under existing authority, commit only those owned
artifacts on the exploration branch. Integrate that commit into `main`, rebase
the exploration branch onto the resulting `main`, and only then remove the
clean worktree and delete its branch. Later execution starts from that updated
`main`; it never reuses or nests the exploration workspace. If integration,
rebase, or cleanup is unsafe or incomplete, retain and report the exact
workspace identity and evidence and do not start repair.

**Key examples:**

- Given a standalone report with no established checkout, investigation creates
  one temporary branch and worktree before reproducing the discrepancy. When a
  bounded repair is confirmed, exploration is cleaned up and
  `dough-execute-plan` performs the repair in a fresh execution workspace.
- Given an investigation that establishes larger or inconclusive work and is
  authorized to create its canonical story and plan, those artifacts are
  committed and integrated into `main`; the exploration branch is rebased onto
  that `main`, then its clean worktree and branch are removed. The queued work
  remains unexecuted until a later execution request creates a fresh workspace.
- Given evidence that the reported behavior is already correct, the skill
  reports the supported no-change result and safely removes the exploration
  workspace without creating a story, plan, or execution workspace.
- Given interruption, dirty state, ambiguous ownership, or failed integration,
  rebase, or cleanup, the skill retains and reports the exact exploration
  branch, worktree, starting revision, and durable evidence. It neither forces
  cleanup nor starts repair from that workspace.
- Given bug investigation already owned by a story, active plan, explicit
  caller-selected checkout, or another workflow, the skill reuses that checkout
  and creates no nested temporary workspace.

**Deferred promises and boundaries:** Preserve the existing ten-minute bound,
report gathering, reproduction standard, routing outcomes, backlog priority,
and execution/refactoring obligations except where separating exploration from
execution necessarily changes their sequencing. Do not add automatic planning
authority, publish or push `main`, change `dough-execute-plan` workspace
semantics, isolate shared accounts/services/databases, alter manual-testing
behavior, or generalize the shared reference beyond these two proven
exploration consumers. Temporary reproduction artifacts are evidence, not
product changes to smuggle into `main`; preserve only the durable evidence
needed by the selected route.

**Safe stopping point:** Standalone bug investigation has one recoverable and
disposable workspace, manual testing retains the same behavior through one
shared source, and every repair starts from integrated state in a separately
owned execution workspace.

**Effort hypothesis:** S–M, medium confidence. The workspace lifecycle already
exists and the smallest cohesive change is a focused extraction plus a
bug-fixing handoff. The main uncertainty is preserving the current bounded
repair and larger/inconclusive routing semantics while moving repair into a
fresh execution workspace.

**Depends on:** No unfinished product prerequisite. Reuse the delivered
manual-testing workspace behavior recoverable at `2df8c8e` and the existing
`dough-execute-plan` workspace lifecycle.

<a id="same-machine-merge-queue"></a>

### 2. Queue trunk integration for agents on the same machine

**Status:** Captured; third backlog priority. Not refined or planned.

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

<a id="script-product-backlog-list-updates"></a>

### 4. Update the product backlog without hand-editing the shared list

**Status:** Captured; middle backlog priority. Not refined or planned.

**For / why:** An Open Dough maintainer coordinating parallel agents can add,
take, reorder, or complete work in the plain-text product backlog through a
stable operation, so concurrent queue changes do not repeatedly require manual
reconstruction of overlapping Markdown-list edits.

**Scope candidate:** Keep the Markdown backlog as the canonical, human-readable
view while introducing script-backed operations over stable work identities and
relative priority. Preserve exact story titles, canonical links, **Taken** and
**Backlog list** semantics, existing unrelated order, and the near-future
direction. Reject stale anchors, ambiguous identities, duplicates, and malformed
sections without partially writing the file. Do not introduce a service,
database, second backlog representation, or automated priority policy.

**Evaluation:** Starting from the same backlog revision, two worktrees add
different middle-priority stories. Integrating their script-expressed changes
retains both entries in the intended relative order without a maintainer
hand-editing `PRODUCT-BACKLOG.md`. A stale or ambiguous operation stops with a
specific diagnostic, and every successful result remains ordinary readable
Markdown.

**Value / learning:** The first useful increment tests whether stable,
script-backed queue operations remove the recurring list-edit hotspot while
retaining the product backlog's low-complexity plain-text form. Direct editing
plus later conflict reconstruction remains available, but it repeats the
coordination cost this story is intended to reduce.

**Effort hypothesis:** S–M, low confidence; local queue operations are small,
but proving compatible concurrent additions and lifecycle transitions may
expose a need for a durable operation representation.

**Depends on:** The existing canonical backlog identity and lifecycle
conventions. No new product prerequisite.

**Architecture and boundaries:** This advances decentralized coordination and
continuous integration under
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
while keeping one canonical representation. ADR 0007 remains Proposed and is
not adopted by this capture.

**Safe stopping point:** Maintainers can apply one validated queue change
without hand-editing the list; later automation can be cancelled without
changing the readable Markdown backlog or its established semantics.

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
