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

**Status:** Refined; planned. First backlog priority. Not authorized for
execution.

**Goal:** A developer whose IDE remains on the local integration checkout can
publish a Trunk Mode increment and find local `main` at the exact revision
published to `origin/main`, without pulling or replaying that same publication.
If local `main` has unrelated unpublished commits, ambiguous ownership, or
cannot otherwise become that exact candidate, publication stops before the
remote advances and preserves both bodies of work.

**Why now:** Trunk Mode is the basis of the near-future parallel-agent
direction. In reported use, worktree content reached remote trunk while Cursor
on local `main` still offered synchronization; configured pull-with-rebase then
conflicted. A merge queue must not automate a publication path that leaves the
local trunk unsynchronized.

**Reported observation — Cursor:** The developer kept Cursor on the repository's
local `main` checkout, not on the execution worktree or execution branch. Cursor
was configured to rebase when synchronizing. After Trunk Mode worktree content
was reported as published to remote trunk, Cursor still showed work to sync on
local `main`; invoking sync produced a Git conflict. The incident's exact refs
were not retained.

**Investigation (2026-09-17):** A disposable same-repository fixture (bare
remote, primary `main` checkout, execution worktree, `pull.rebase=true`)
reproduced the Git graphs. Ordinary publication that fast-forwards the primary
checkout with `merge --ff-only` already leaves local `main`, `origin/main`, and
the execution branch at one SHA, 0 ahead and 0 behind. Pushing the candidate
from the execution worktree without that fast-forward leaves local `main`
behind only; Cursor would offer sync, and `git pull --rebase` fast-forwards
without conflict. A pull-rebase **content conflict** after a successful push
requires unique work on both tips: reproduced when local `main` already had an
unpublished commit overlapping the increment path and publication still pushed
the execution SHA to `origin/main`. Disjoint unpublished local commits diverge
(ahead 1, behind 1) but rebase without conflict. A genuinely later remote
commit is behind-only and fast-forwards. `git checkout main` and `git branch
-f main` from the execution worktree fail because `main` is checked out in the
primary worktree; `git update-ref refs/heads/main` succeeds unsafely and leaves
the primary index as a staged inverse of the increment. Current guidance
permits the skip: exclusive-turn and cleanliness checks apply only when
publication mutates the integration checkout, so a SHA push from the execution
worktree can omit inspection; step 5 names a fast-forward without a command
that works from that worktree; step 6 records success after the push without
verifying SHA agreement or 0/0. Historical Cursor SHAs remain unknown, so the
incident may have been that skip plus unrelated local-main commits, or dirty
overlapping files plus autostash; behind-only skip-FF cannot explain the
conflict.

#### Scope

- For a successful queue-claim, verified-increment, or wrap-up publication,
  inspect the integration checkout before advancing remote trunk, even when the
  push is a SHA from the execution worktree. Make that checkout's `main` the
  exact candidate by fast-forwarding its working tree (`git -C
  <integration-checkout> merge --ff-only <candidate>`). Do not use
  `update-ref` or `branch -f` on a branch checked out elsewhere, and do not
  bypass the local candidate by pushing the execution branch or a SHA directly
  onto `origin/main`. Leave local `main` and `origin/main` at the same
  published SHA. Preserve existing execution-branch alignment, exact
  published-SHA tracking, CI registration, proof revalidation, ordinary
  non-force push, and recoverable interruption rules.
- Do not report publication as successful until the local-main SHA, the actual
  remote-trunk SHA, the retained published SHA, and the execution-branch SHA
  agree, and local `main` is zero ahead and zero behind after refreshing the
  remote view. A mismatch is an unfinished publication or a later writer to
  classify, not a successful state for the developer to repair with ordinary
  IDE sync.
- Fetch and reconcile a concurrently advanced remote before publication.
  Rebase only this execution's unpublished suffix, revalidate affected proof,
  update the execution branch and local `main` to the resulting candidate, and
  then publish that candidate. Recovery Git that rewrites the candidate runs on
  the integration checkout, not only on the execution worktree.
- If local `main` has unpublished commits that are not this execution's owned
  suffix, or ownership is ambiguous, stop without advancing `origin/main`.
  Report and preserve the local main state and the execution's unpublished
  work.
- Keep the current dirty-target publication stop as present behavior. This
  story does not promise that stop, prove it, or replace it. Later work may
  publish while local `main` is dirty by rebasing with those uncommitted
  changes; that is out of scope here.
- Distinguish a later independent writer advancing `origin/main` after this
  publication. That later change may make the IDE show incoming work and is
  not a promise this story can prevent.

#### Key examples

1. **Ordinary publication:** Given local `main`, the execution branch, and
   `origin/main` share a published base, and the integration checkout is clean
   with no unpublished local-main commits, publishing one verified increment
   leaves local `main`, `origin/main`, the execution branch, and the retained
   published SHA at that increment. The main checkout has zero
   ahead and zero behind relative to `origin/main`; IDE synchronization is not
   needed for that publication.
2. **Unrelated unpublished local main:** Given local `main` contains unpublished
   commits that are not this execution's owned suffix, a ready execution
   increment does not advance `origin/main`. Both bodies of work remain
   recoverable and the stop identifies the conflicting local commits.
3. **Remote advances during publication:** Given another writer advances
   `origin/main` after the initial fetch, reconcile only this execution's owned
   suffix onto the newer remote, update the execution branch and local `main`,
   revalidate affected behavior, and publish once. After confirmed success the
   four SHAs agree and local `main` is 0/0. A conflict preserves all refs and
   does not invite an ordinary IDE sync as recovery.
4. **Genuinely later publication:** Given all four refs matched after this
   publication, another writer subsequently advances remote trunk. The IDE may
   then show incoming work; this is normal new integration, not recurrence of
   the reported defect.

**Excluded / deferred:** Changing IDE settings or Git's pull-rebase policy;
promising that local `main` never receives later remote work; publishing the
execution branch; Story Branch Mode changes; a merge queue, new lock service,
branch manager, or parallel-agent launcher; hosted-agent workflows; force
pushes; new CI policy; worktree or build-performance optimization; a
publication helper script; and publishing or rebasing while local `main` is
dirty. Dirty-target handling stays as today's stop until a later story owns
rebase-with-dirty-changes. The outcome is branch/ref coherence named for the
executing agent, not a vendor UI test.

**Value retained if later work is cancelled:** Closing the skip-FF and
skip-inspect holes makes current manual Trunk Mode leave local `main` at the
published revision, which the later merge queue can automate.

**Depends on:** The existing Trunk Mode execution identity, proof, publication,
and observer contracts. Do this before the same-machine merge queue.

**Architecture and proof:** Change the existing Trunk Mode publication rule in
`src/skills/dough-execute-plan/references/trunk-publication.md` and align the
restated cleanliness gate in
`src/skills/dough-execute-plan/references/execution-location.md`. Do not add a
second publication sequence or a Git helper. Follow
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one shared behavioral source) and the stop-and-fix, empiricism, and
continuous-integration principles in
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Prove the Git ref and ahead/behind invariants deterministically against the
named command sequence; the IDE symptom does not require a vendor UI test
under
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
