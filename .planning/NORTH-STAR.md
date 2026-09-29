# Architectural North Star

Temporary direction for current work; revise when evidence changes it and retire
realized topics after checking affected stories. Accepted ADRs remain authoritative.

## Remote history and optional local refresh

The selected direction uses the project's remote trunk as the integration
boundary for every owned workspace. Before isolated story implementation starts,
publish its Taken claim to that trunk. Fresh workspaces and queued source
selection use fetched remote history. A default checkout is optional and may
remain the developer's playground. Publication, execution ownership,
checkout freshness when applicable, and CI coverage retain their own evidence.

| Concept | Meaning and owner |
| --- | --- |
| Work identity and Taken membership | Stable story identity and queue selection, owned by the backlog contract and mutation/reconciliation scripts. |
| Execution identity and workspace | Mode, owned checkout/branch, base revision, publication destination, and publication authority, owned by execution-location guidance. |
| Publication | Reconcile owned changes with fetched remote history, validate the candidate, publish through the authorized destination, and retain the accepted revision. |
| Optional default checkout | A developer's local checkout, whose content and revision neither supply nor veto owned-worktree startup or remote publication. |
| Checkout freshness | The observed local relationship to fetched trunk and any optional refresh outcome, when a checkout is supplied. |
| CI coverage | Observation of a specific published revision on a particular target, owned by the existing observer. |

Publication, default-checkout maintenance, claim-before-implementation, and
mode destinations are established in the installed execute-plan publication and
checkout-maintenance guidance. Preserve preparation disposition, story-branch
publication ownership, and CI attribution in active plans or conversation
context. Report a coverage gap when the configured observer covers a different
target from a published claim.

[Integrate Story Branch closures through an installed command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration)
owns the remaining alignment under Terry's 2026-09-28 decision. After accepted
trunk publication, attempt a safe fast-forward when a default checkout is
supplied; preserve pending local work and report a skipped, deferred, stopped,
or failed refresh separately. Its absence never blocks owned work. Dough Land
and wrap-up consume one cohesive publication, refresh, and retirement solution,
with their distinct review, history-recovery, and CI duties intact. Explicit
current-checkout work needs no automated ownership or handoff mechanism. Owned
workspaces use the same remote contract across machines and worktrees.

Keep this direction while the selected stories need it; retire it when lasting
behavior is established in authoritative guidance. Describe the intended
contract directly in guidance and proof, with change history retained in Git.
Follow Accepted [ADR 0001](../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
and [ADR 0006](../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
[ADR 0009](../docs/adrs/0009-git-branching-and-integration.md) records the Git
proposal; human-owned ADR status decisions remain separate from this planning
direction.

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
new story lifecycle states. This direction supports the
[story dashboard](../dashboard/README.md) and its later project and readiness work,
following [ADR 0001](../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Agent assignments are published facts like any other: an execution or
preparation assignment is the agent profile on trunk, and the page derives
Taken owners and Preparing from that profile's presence. The agent roster is
one more view of that snapshot, and a commission's human developer is the
committer of the commit that added its profile's current allocation; avatar
images, like every GitHub read, come through the local boundary and never
become assignment evidence. Keep later feature,
structure, and local operational models out until their selected behavior needs
them.
UI choices stay in the separate
[UX/UI North Star](../docs/dashboard-ux-ui-north-star.md).


For the three-project dashboard, every catalog project is read through the
launching person's local `gh` authentication (Terry's decisions of 2026-09-21
for Pygardon and 2026-09-23 for Open Dough and Doughnut). Keep
credential/process responsibility in one narrow loopback read boundary of the
existing local dashboard launch, shared by dev and built preview. It returns
published revision and pinned file data for the same browser interpretation;
no direct browser-to-GitHub path remains. Credentials never enter browser
assets. Catalog identity bounds the local reader's requests; no arbitrary proxy
or new state authority is needed. Selection is transient UI state, with one
project's observation visible at a time. This direction does not create
coordination between the observed projects or adopt Proposed ADR 0008.

## Agent launch as a requested assignment

Starting agent work from the dashboard
([SEED-052](seeds/SEED-052-start-agent-work-from-dashboard.md), beginning with
[launch execution](../dashboard/AGENT-LAUNCH.md)) adds the dashboard's first
action. Model it in the vocabulary the dashboard
already reads, so later launch stories extend one model instead of adding
parallel ones:

- An **agent launch** starts one **workflow** on one work item, through one
  host (`claude` now, `codex` and `cursor` later, from `agentHosts`), with an
  optional developer instruction. A workflow names the skill it runs and the
  published **activity** (from `agentActivities`) whose assignment it asks
  for: execution runs `dough-execute-plan` and asks for an execution
  assignment; refinement runs `dough-story-refinement` and asks for a
  preparation assignment. One activity can host several workflows (planning
  also prepares), which is why the launch names the workflow rather than the
  activity. Workflows are added when a story delivers them, in one table that
  the boundary, host, settlement, and card all read; no per-workflow copy of
  the action, dialog, or settlement is built. The agent's ordinary workflow
  still owns workspaces, Take, preparation, and publication.
- A **launch record** is machine-local operational evidence (ADR 0008's later
  local layer): the request, when it was launched, and the host **session** it
  started. It never becomes story state. A launch *awaits publication* while
  its work item is still in the backlog and does not yet show an assignment of
  its workflow's activity: an execution settles on the Take, a refinement when
  the item shows Preparing. Later stories list, persist, and attach to these
  same records rather than inventing a session registry.
- Each **host** owns how to start and identify its sessions (for Claude Code:
  `claude --bg`, which chooses and prints its own session id, confirmed
  through `claude agents --json`) and how a developer reaches one (`claude attach`).
  Host-specific code stays in one module per host, added when that host is
  delivered; no adapter interface is built ahead of a second host.
- Each catalog project's **local folder** is a machine-local fact held by the
  local server, not by the published catalog the browser shares.

Process and filesystem responsibility stays in the existing local loopback
boundary: the launch endpoint sits beside the read endpoint in the same Vite
launch, reuses its loopback and same-origin refusal before any process starts,
passes fixed argument arrays (never a shell string), and keeps launch records
in the running server process, with no database or daemon. The browser holds
only transient dialog and request state and derives what a card shows from the
published snapshot plus launch records. This extends, and does not replace,
the read boundary topic above and ADR 0008's origin authority.
