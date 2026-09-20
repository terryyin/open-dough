# Architectural North Star

Temporary direction for current work; revise when evidence changes it and retire
realized topics after checking affected stories. Accepted ADRs remain authoritative.

## Shared work publication with replaceable workspace coordination

Keep one domain rule: before isolated story implementation starts, its owned
Taken claim must be published to the authorized integration target. Local
commit, published membership, execution ownership, and CI coverage are different
facts. The unpublished dashboard claim blocked a Trunk Mode delivery and stayed
invisible to the remote dashboard; see
[the claim story](seeds/SEED-008-worktree-branch-trunk-sync.md#publish-shared-backlog-claims).
Use these concepts directly in guidance and retained execution context:

| Concept | Meaning and existing owner |
| --- | --- |
| Work identity and Taken membership | Stable story identity and queue selection; the backlog contract and mutation/reconciliation scripts own these meanings. Membership alone does not identify a running execution. |
| Execution identity and workspace | The selected mode, owned checkout/branch, and publication destination; execution-location guidance owns them. A workspace isolates changes, not authority to mutate shared trunk. |
| Integration turn | Permission to mutate the shared integration checkout from pre-edit inspection through publication or explicit recovery/handoff. Reuse declared-owner coordination now. |
| Publication | Reconcile the owned unpublished change with fetched remote state, publish without force, and retain the confirmed revision and target. The existing publication procedure owns this sequence. |
| CI coverage | Observation of a specific published revision on a particular target; the existing observer owns this evidence. Publication does not imply observed or successful CI. |

Workspace selection, coordination, and publication are distinct responsibilities
in the existing workflow, not new services or interfaces. Keep one publication
sequence for both isolated modes' claims and Trunk Mode increments/closure;
mode chooses which change goes to which target. Preserve Story Branch
implementation delivery and direct-current-branch authority. Keep claim
publication evidence separate from later story-branch delivery evidence within
the existing plan or conversation; introduce no ledger or new backlog fields.
When no matching CI observer covers a Story Branch claim on trunk, report that
gap and preserve story-branch observation; do not register it under the wrong
target or add a multi-target observer framework.

The [workspace story](seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure)
will consolidate where preparation and discussion occur; prepared shared edits
remain short operations. The
[queue story](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue)
will replace manual integration turns and blocked-turn handoff with common local
coordination. Until then, persistent publication failure preserves the claim,
stops implementation, and requires deliberate recovery/handoff before another
writer proceeds. This interim limitation is explicit; no timeout-based release
or automatic takeover is introduced.
Each successor removes superseded guidance while retaining the same domain
meanings and publication rule. Keep this topic while either successor still
needs it; retire it only after checking their active plans and retaining lasting
behavior in its authoritative guidance. Follow Accepted
[ADR 0001](../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
and [ADR 0006](../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
This topic neither adopts Proposed ADRs 0007/0008 nor designs the future queue.

## One backlog interpretation, separate observation and presentation

For the first dashboard, keep the existing pure backlog document, identity, and
direction readers as the owners of those meanings. Their current import graph
has no filesystem dependency. A published spelling those readers refuse is a
read problem, or a bounded compatibility change there, never a second dashboard
grammar. Within a
small `dashboard/` application, distinguish reading a GitHub ref and its pinned
backlog content, projecting the shared reader's result into a typed snapshot
with source evidence, and rendering that snapshot plus transient retrieval state.
The connected-stage presentation derives card membership/order from that
snapshot, keyed by work identity. Start with semantic work cards, simple
connectors, and ordinary layout/reflow; do not build a viewport or animation
framework before this reading goal needs one. When useful, keep zoom/pan,
focused work, and transitions as separate UI state: they neither change
repository facts nor represent machine-local coordination. Zoom reveals
already-read facts; animation explains navigation or observed changes. Neither
requires a new story-state schema or persistence.
Use ordinary functions and components; these responsibilities do not require
services, repositories, plugin interfaces, or separate packages. The browser
must not import filesystem/store/merge orchestration. A snapshot describes
published membership; loading and refresh failure describe observation, not
new story lifecycle states. This direction supports
[SEED-021's first view and subsequent project/readiness work](seeds/SEED-021-observe-published-story-progress.md),
following [ADR 0001](../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Keep later assignment, feature, structure, and local-lock models out until their
selected behavior needs them. UI choices stay in the separate
[UX/UI North Star](../docs/dashboard-ux-ui-north-star.md).
