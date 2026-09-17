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

<a id="publish-trunk-mode-from-local-main"></a>

### 5. Leave local main synchronized after Trunk Mode publication

**Status:** Refined around a reported discrepancy; first backlog priority. Not
planned or authorized for execution. Reproduce before repair because the exact
incident refs and conflicting commits are no longer available.

**Goal:** A developer whose IDE remains on the local integration checkout can
publish a Trunk Mode increment and find local `main` at the exact revision
published to `origin/main`, without pulling or replaying that same publication.
If local `main` cannot safely become the publication candidate, publication
stops before the remote advances and preserves the work that prevents it.

**Why now:** The newly delivered Trunk Mode is the basis of the near-future
parallel-agent direction. In reported use, the worktree content reached remote
trunk while the IDE on local `main` still offered synchronization; the
configured pull-with-rebase then conflicted. That undermines the local trunk as
the recoverable integration point and should be understood before a merge queue
automates the same publication path. This is observed friction rather than a
preference for one Git command sequence.

**Reported observation — Cursor:** The developer kept Cursor on the repository's
local `main` checkout, not on the execution worktree or execution branch. Cursor
was configured to rebase when synchronizing. After Trunk Mode worktree content
was reported as published to remote trunk, Cursor still showed work to sync on
local `main`; invoking sync produced a Git conflict. The incident's exact refs,
ahead/behind counts, conflicting paths, and pre-sync graph were not retained, so
this observation establishes the discrepancy to investigate but not its cause.

#### Scope

- First reproduce or explain the discrepancy with a real same-repository
  integration checkout and execution worktree. Record the local `main`,
  execution-branch, and fetched `origin/main` identities immediately before
  publication, after local integration, and after push. Before invoking Cursor
  sync, retain the current branch, status, upstream, ahead/behind counts, commit
  graph, pull-rebase configuration, and any uncommitted state so the sync does
  not destroy the evidence. Reproduce the conflict only in a disposable
  fixture. Treat the cause as unconfirmed until the observable divergence is
  reproduced or its historical graph is established.
- For a successful queue-claim, verified-increment, or wrap-up publication,
  make local `main` the exact candidate before pushing and leave local `main`
  and `origin/main` at the same published SHA. Preserve the existing execution
  branch alignment, exact published-SHA tracking, CI registration, proof
  revalidation, ordinary non-force push, and recoverable interruption rules.
- Do not report publication as successful until the local-main SHA, the actual
  remote-trunk SHA, and the retained published SHA agree, and local `main` is
  zero ahead and zero behind after refreshing the remote view. A mismatch is an
  unfinished publication or a later writer to classify, not a successful state
  for the developer to repair with ordinary IDE sync.
- Fetch and reconcile a concurrently advanced remote before publication. Rebase
  only this execution's unpublished suffix, revalidate affected proof, update
  the execution branch and local `main` to the resulting candidate, and then
  publish that candidate.
- If local `main` has unrelated unpublished commits, dirty content, ambiguous
  ownership, or cannot be advanced to the exact candidate, stop without
  advancing `origin/main`. Report and preserve the local main state and the
  execution's unpublished work; do not bypass the stop by pushing a candidate
  SHA or the execution branch directly.
- Distinguish this discrepancy from a later independent writer legitimately
  advancing `origin/main` after publication. That later change may make the IDE
  show incoming work and is not a promise this story can prevent.

#### Key examples

1. **Ordinary publication:** Given local `main`, the execution branch, and
   `origin/main` share a published base, publishing one verified increment
   leaves all three at the exact new published SHA. The main checkout has zero
   ahead and zero behind relative to `origin/main`; IDE synchronization is not
   needed for that publication.
2. **Unsafe local main:** Given local `main` contains unrelated unpublished work
   or dirty content, a ready execution increment does not advance
   `origin/main`. Both bodies of work remain recoverable and the stop identifies
   the conflicting local state.
3. **Remote advances during publication:** Given another writer advances
   `origin/main` after the initial fetch, reconcile only this execution's owned
   suffix onto the newer remote, update the execution branch and local `main`,
   revalidate affected behavior, and publish once. A conflict preserves all
   refs and does not invite an ordinary IDE sync as recovery.
4. **Genuinely later publication:** Given all three refs matched after this
   publication, another writer subsequently advances remote trunk. The IDE may
   then show incoming work; this is normal new integration, not recurrence of
   the reported defect.

**Excluded:** Changing IDE settings or Git's pull-rebase policy; promising that
local `main` never receives later remote work; publishing the execution branch;
Story Branch Mode changes; a merge queue, new lock service, branch manager, or
parallel-agent launcher; hosted-agent workflows; force pushes; new CI policy;
and worktree or build-performance optimization. The outcome is branch/ref
coherence, not a required merge-versus-rebase command recipe.

**Value retained if later work is cancelled:** A reproduced no-change result
establishes that the existing contract already provides the promised local-main
coherence and identifies the incident as a different synchronization case. A
confirmed correction makes current manual Trunk Mode safe to use without the
later merge queue.

**Depends on:** The existing Trunk Mode execution identity, proof, publication,
and observer contracts. Complete this investigation before the same-machine
merge queue so the queue automates a publication path whose local-main behavior
is known.

**Evidence gap and open decision:** The repository currently has local `main`
and `origin/main` at the same SHA, and the incident's pre-sync branch graph is
unavailable. Determine whether publication advanced the remote without first
advancing local `main`, whether unrelated local work made the branches diverge,
or whether a later independent publication caused the IDE signal. A supported
finding that the existing behavior is correct closes the discrepancy without a
repair; do not manufacture a Git change merely to retain this story.

**Architecture and proof:** This applies the stop-and-fix, empiricism, and
continuous-integration principles in
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Prove the Git ref and ahead/behind invariants deterministically; the IDE symptom
does not require a vendor UI test under
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md).
ADR 0007 remains Proposed and is not adopted or changed by this story.

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
