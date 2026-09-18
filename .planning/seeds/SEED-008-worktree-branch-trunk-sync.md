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

**Status:** Captured; first backlog priority. Not refined or planned.

**For / why:** A developer starting Open Dough work in Claude Code background
mode on a fresh setup can execute and wrap up a story successfully without
Claude Code first having to learn that developer's preferred workflow.

**Observed problem:** Claude Code background mode starts work in its own Git
worktree and integrates the result through a pull request by default. The
current `dough-execute-plan` and `dough-story-wrap-up` guidance instead assumes
that it owns execution-worktree creation and that Story Branch Mode finishes by
locally integrating the execution branch into the target branch and pushing
that target. Existing learned user behavior can hide this mismatch, so an
already-personalized Claude Code setup is not sufficient evidence.

**Scope candidate:** Reproduce the workflow in a fresh Claude Code background
setup, then adapt execution-location, retained-identity, delivery, integration,
and cleanup behavior so the Open Dough lifecycle composes safely with the
host-provided worktree and pull-request path. Keep one shared behavioral source
and introduce only the smallest necessary host-specific adaptation. Do not
depend on conversation history, learned preferences, manual rescue, or a
nested/replacement worktree.

**Evaluation:** From a fresh setup with no learned workflow preference, start a
representative story in Claude Code background mode. The agent uses the
host-provided worktree, completes `dough-execute-plan`, and runs
`dough-story-wrap-up` through the pull-request integration lifecycle without
attempting an unsafe local-main integration, losing recoverable work, or
claiming completion before required integration and cleanup are complete. The
run produces native evidence of the useful outcome rather than relying on
self-report or an existing personalized session.

**Value / learning:** This establishes whether Open Dough can cooperate with a
materially different native activation and integration mode instead of working
only after Claude Code has inferred one maintainer's intent. It also reveals
which execution and closure rules are truly shared and which require a bounded
host adaptation.

**Effort hypothesis:** M, low confidence; the guidance change may be small, but
fresh background-mode setup, pull-request lifecycle ownership, and cleanup
timing need native observation.

**Depends on:** A fresh Claude Code background environment with repository and
pull-request access. No product prerequisite is known.

**Architecture and boundaries:** Follow
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by preserving recoverable, continuously integrated user-centric work;
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires fresh native evidence because background mode is a materially
different activation mode; and
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires shared behavior with only necessary host adaptation. This capture does
not choose whether Claude Code, Open Dough, or a human owns pull-request merge
and post-merge cleanup; refinement must resolve that boundary from observed
native behavior. ADR 0007 remains Proposed and is not adopted by this story.

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
