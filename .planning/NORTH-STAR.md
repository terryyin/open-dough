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

[Finish removing default-checkout coordination](seeds/SEED-008-worktree-branch-trunk-sync.md#finish-removing-checkout-coordination)
and
[Close stories through an installed wrap-up command](seeds/SEED-008-worktree-branch-trunk-sync.md#installed-wrap-up-command)
own the remaining alignment under Terry's 2026-09-28 decision. After accepted
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

## One admission path for accepted work

Queued and emergent work converge on the same story identity, Taken membership,
assignment and execution lifecycle. Extend the existing startup and backlog
owners to admit a new canonical story and publish its claim together; keep remote
publication, recovery and safe default-checkout refresh shared. Current startup
requires an already published queued source, while contextual work bypasses it:
that entry assumption is the gap, not a missing lifecycle or dashboard model.
Keep acceptance/ownership distinct from preparation and execution readiness; do
not manufacture a ready assessment merely to publish a claim. Independent
investigations enter Taken on acceptance and can later attach an implementation
plan to that same story. New corrections use a seed story linked to their plan;
retain compatibility for existing plan-homed identities without migration. New canonical
content must survive claim retry and agent reselection together with the claim.
The dashboard continues to derive its view from those published records. This
direction serves [one-shot escalation](seeds/SEED-053-native-guidance-acceptance.md#shared-one-shot-cases);
it creates no ad hoc entity, origin flag, parallel publisher or speculative
one-shot machinery. Follow the separate-facts and cohesion principles in
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

For explicit one-shot work, reuse planless execution and ordinary verified
publication/cleanup. A queued story can complete directly; an unlisted request
needs no temporary story on success. Growth transfers the same owned edits and
proof into normal admission before further work, then continues within the
original authority. Recheck queued ownership before publishing cleanup so a
concurrent claim is preserved. This is a policy at work entry and completion,
not another execution engine, branch mode or persistent tracking state.

Concretely, the startup command owns all three entries: Take, admission and
one-shot. `--one-shot` reuses its request validation, published-source reading
and owned-workspace selection, then publishes nothing. Its result goes through
ordinary managed increment delivery; a queued story's backlog completion and
spent-record removal join that same candidate, and an ownership guard
rereads each fetched trunk tip before the publisher rewrites anything, since
replaying that completion over a competing Take would otherwise surface as a
backlog merge conflict. On growth the one-shot workspace becomes the admitted story's
checkout: park the attempt's owned edits under a workspace-owned ref, return
the workspace to clean fetched trunk, run the ordinary admission claim there,
then restore the edits over the Take. Admission carrying such an attempt
accepts a queued story too, moving its existing entry to Taken without a
readiness assessment; ordinary queued starts and continuing into
implementation keep the readiness gate. Entry workflows pass the
flag through and keep no one-shot rules of their own.

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
