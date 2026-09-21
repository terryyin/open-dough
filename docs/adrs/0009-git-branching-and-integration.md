# 0009 — Git branching and integration

**Status:** Proposed

**Date:** 2026-09-21

**Decision makers:** Terry Yin

**Consulted:** Terry Yin supplied the direction in the branching and integration
discussion; draft review and further advice pending.

## Context

Open Dough supports work in isolated Git worktrees, continuous publication in
Trunk Mode, and publication on a story branch in Story Branch Mode. Multiple
agents on one machine and developers on different machines must reconcile
their work with the same shared product history.

Remote reconciliation is required across machines and worktrees. Each owned
workspace can prepare and validate a candidate against fetched remote history
and publish it to the designated destination. The default local checkout also
serves direct edits and task startup, so it needs its own ownership, refresh,
and recovery rules.

Workspace isolation, shared integration, and maintenance of the default local
checkout are separate responsibilities. Keeping those boundaries explicit
lets the same Git contract serve independent writers while preserving local
work and useful checkout freshness.

[ADR 0007](./0007-software-development-lifecycles.md) concerns the lifecycle of
work from preparation through closure. This proposal defines the Git practices
that support that lifecycle. It does not decide when a story is ready, when
publication is authorized, or when a story is complete.

## Decision

The following is proposed architectural intent, not an accepted decision.

### One remote integration authority

Use the project's designated trunk on its authoritative remote as the shared
integration authority. This record calls those `main` and `origin`; resolve
their actual names from the project. A local `origin/main` ref is a fetched
observation of remote state, not a guarantee that the remote has stopped moving.

Reconcile against freshly fetched remote history. Publish a validated candidate
directly from its owned workspace to the authorized remote destination, without
requiring it to pass through local `main`. Respect branch protection and required
review or hosted merge mechanisms; direct publication does not authorize
bypassing them.

Publishing a story branch makes its progress available to others. Integration
into remote trunk makes that work part of the shared product history. Keep these
facts distinct when reporting progress.

### Owned workspaces and branch modes

Perform substantial or uncertain-duration work in an owned workspace, normally
a worktree with its own branch. A local branch provides isolation and recovery;
its existence does not make it another integration authority. Retain its
identity across interruptions while work remains unfinished.

| Mode | Working branch | Publication and integration |
| --- | --- | --- |
| Trunk Mode | Temporary local execution branch in an owned worktree | Reconcile and publish each validated increment directly to remote trunk. No remote execution branch is required. |
| Story Branch Mode | Story branch in an owned worktree | Publish progress to the corresponding remote story branch. Integrate into remote trunk at the lifecycle's authorized integration boundary. |

For Trunk Mode, rebase only the execution's owned, unpublished commits onto the
fetched trunk before publication when reconciliation is needed. The temporary
branch may remain for the duration of execution; it need not be recreated for
each increment.

For Story Branch Mode, preserve already-published history when bringing in
trunk changes or preparing trunk integration. Merge where needed rather than
silently rebasing published commits. The final integration method must respect
the project's history and review policy. This ADR does not introduce automatic
force-pushing of shared branches or trunk.

Retain recoverable work until publication and the lifecycle's cleanup conditions
are satisfied. Branch and worktree cleanup must not remove another task's active
workspace or unpublished work.

### One publication protocol across machines and worktrees

Use the same publication contract whether writers share a machine or use
separate clones:

1. Resolve the owned changes and authorized remote destination, then fetch its
   current history.
2. Reconcile in the owned workspace and validate the resulting candidate.
   Reconciliation success alone is not behavioral proof; recheck affected
   behavior when the candidate changes.
3. Attempt an ordinary push, or submit through the required hosted integration
   mechanism. Do not overwrite intervening remote work.
4. When a concurrent update prevents publication, fetch again, reconcile, and
   revalidate affected behavior before retrying. Preserve unresolved work and
   report conflicts that require human judgment.
5. Record the accepted revision. After an ambiguous push response, inspect remote
   history before retrying. A candidate already contained in remote history is
   published even if another writer has since advanced the branch.

Successful publication is a remote fact. Local checkout refresh and CI results
are separate facts, with their own reported outcomes. Their remaining obligations
do not erase a publication that has already succeeded.

Git's rejection of conflicting branch updates protects history; it does not
resolve semantic conflicts or guarantee fair scheduling. Add a publication queue
only when observed contention or project requirements justify one. Sharing a
machine alone does not require a second integration queue through local `main`.

### Maintain the default local checkout separately

The default checkout remains a convenient starting point for tasks and a place
for bounded direct edits. Keep it current with remote trunk whenever safe.
After each successful trunk publication, attempt a coordinated refresh. Before
using the checkout's commit as a new task's base, check it against freshly
fetched trunk.

| Checkout state | Required handling |
| --- | --- |
| Clean and equal to, or only behind, fetched trunk | Leave it current or fast-forward it through normal checkout-aware Git operations. |
| Uncommitted edits or unpublished commits | Preserve the work and defer automatic advancement; its owner handles reconciliation and publication. |
| Another writer or operation is using it | Defer refresh until access can be coordinated safely. |
| Diverged, unexpected branch, or unclear ownership | Preserve state and report the unresolved checkout maintenance. |

Deferred refresh must be visible, but must not block another owned workspace's
publication. A new task can start its worktree from the fetched remote trunk
without advancing the default checkout. Including local unpublished work in a
new task's base requires an explicit ownership and dependency decision.

Direct edits and refreshes of the default checkout share one local coordination
boundary. Establish exclusive access before mutating its working tree, index,
or checked-out branch, and retain that access throughout a direct edit. A local
coordination mechanism protects this workspace; agents publishing from other
workspaces do not acquire it merely to publish. Recheck state and preserve work
from humans or tools that do not participate in that mechanism.

Direct edits follow the same remote reconciliation and publication rules. Do
not silently include unrelated local commits in a push, or stash, reset, or
discard another writer's work to make refresh possible. In particular, do not
move a checked-out branch ref without updating its checkout safely.

These rules also apply to shared workflow records, including backlog claims and
preparation publication. Such writes need an owned publication path; they must
not reintroduce a mandatory local-main integration stage. Claim success is
established by its authorized remote publication, not merely a local commit.

## Consequences

- Multiple worktrees and separate clones use the same remote integration
  contract. Worktrees still share local Git resources, so workspace ownership
  and safe local operations remain necessary.
- Dirty or busy default checkouts no longer prevent independent work from
  reaching remote trunk. The checkout can temporarily lag, and that state must
  be reported separately from publication success.
- Remote races remain normal. Reconciliation and validation may need repeating;
  a local lock cannot eliminate updates from other machines.
- Local coordination has a narrower purpose: protecting direct edits and
  refreshes. This proposal selects no lock implementation, daemon, queue service,
  retry limit, or CI scheduling policy. Executable procedures belong in skills.

## Relationship to existing decisions and guidance

[Accepted ADR 0002](./0002-software-development-lifecycle-principles-accepted.md)
requires continuous integration into a shared trunk and favors reducing
coordination cost. Trunk Mode follows that direction. Story Branch Mode's
delayed integration remains the unresolved conflict already recorded in
Proposed ADR 0007. Describing its Git mechanics here neither accepts that delay
nor grants an exception to ADR 0002.

ADR 0007 should reference this record for branching and integration mechanics.
[Proposed ADR 0008](./0008-project-dashboard-domain-and-architecture.md) should
observe remote publication and local checkout maintenance as separate facts;
its shared integration-lock language would need alignment with this boundary.

Installed execute-plan publication and default-checkout maintenance guidance
own the implemented contract for callers, recovery, and proof.
[Default-checkout coordination](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue)
owns automated local access and recovery. The
[visibility requirements](../project-visibility-requirements.md) distinguish
published progress from local operational evidence. These records express the
selected planning direction; execution follows its own authorization.

No Accepted ADR is superseded by this proposal. Human consultation, acceptance,
and communication follow the [ADR process](./README.md). Maintainer guidance and
future skill changes follow [ADR 0006](./0006-write-skills-for-executing-agents-accepted.md)
and the [authoring guideline](../../AGENTS.md).
