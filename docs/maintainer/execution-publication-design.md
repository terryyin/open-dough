# Execution and publication with less agent coordination

**Status:** Maintained design context. Queued-start publication uses the
installed `dough-execute-plan/scripts/execution-start.mjs` command; delivery,
preparation, closure, and local checkout coordination remain separate work. Not
an executable plan or a new Accepted ADR. The
[seed](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md)
owns story scope; the [backlog](../../.planning/PRODUCT-BACKLOG.md) owns priority.

## Recommendation

Queued startup uses a small command boundary backed by the existing backlog
semantics, Git publication, and local checkout rules. The agent supplies
authorized intent and handles decisions the command cannot make. Extend shared
publication at actual delivery boundaries without adding a daemon, workflow
engine, or global registry. Existing backlog and CI CLIs keep their low-level
purposes; another public CLI family is unnecessary for an internal seam.

## Critical review and changes

| Finding in the first proposal | Improvement |
| --- | --- |
| Execution publication and CI automation both owned feeding the same result to an observer. | Merge that delivery outcome into the existing CI automation story. One accepted publication feeds one existing observation owner. |
| A broad startup command could grow into an environment/provisioning framework. | Bound it to authorized queued work, source verification, suitable workspace selection, Take, publication, and refresh. Keep project setup and semantic readiness judgment with their existing owners. |
| The CI story assumed a real readiness command and treated remote-tracking movement as proof of this workspace's push. | The readiness script is a test substitute; fetch and fast-forward can also move refs. Use the actual publication receipt for managed delivery, with no raw-Git watcher. |
| A detailed result schema and optional host automation could become speculative infrastructure. | Define only facts the caller needs. Keep one explicit invocation per existing workflow boundary; no promise of invisible startup or arbitrary-command interception. |
| Local coordination included waiting/fairness and could become a scheduler. | One immediate acquisition attempt, preserve work, and return deferred when busy. No queue, fairness policy, automatic takeover, or background catch-up. |
| Four new publication stories plus the existing CI story overstated the migration set. | Retain startup, the existing CI/delivery story, preparation, and closure. Queue the last two below the remote dashboard outcomes; keep each independently useful. |

## Existing owners and constraints

Backlog mutation, startup publication, checkout maintenance, and CI completion
have separate owners. Delivery, preparation, and closure can adopt the shared
publisher at their own boundaries.

| Owner | Reuse and limitation |
| --- | --- |
| Backlog | [`product-backlog.mjs`](../../src/skills/dough-product-backlog/scripts/product-backlog.mjs) is a real CLI. Its domain API owns identity, membership, preparation state, and semantic reconciliation; local Take alone does not publish. Reuse its Git adapters even for textually clean backlog merges. |
| Publication | [`publish-the-candidate.md`](../../src/skills/dough-execute-plan/references/publish-the-candidate.md) owns the shared contract. The startup command uses production Git helpers; other publication callers still have their existing paths. |
| Startup | [`execution-start.mjs`](../../src/skills/dough-execute-plan/scripts/execution-start.mjs) owns queued-start publication. [`execution-worktree-preparation-readiness-gate.mjs`](../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-readiness-gate.mjs) is a separate project-command substitute used by tests. |
| Delivery | [`execution-increment-delivery.mjs`](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs) owns managed execution increment and repair delivery, runtime resolution, and observation attachment. |
| Local checkout | [`maintain-default-checkout.mjs`](../../src/skills/dough-execute-plan/scripts/maintain-default-checkout.mjs) honors a declared competing owner and checks Git state for automatic refresh; missing owner declarations do not block it. Direct edits still require declared access. It does not acquire exclusive interprocess access. |
| CI | [`ci-mailbox.mjs`](../../src/skills/dough-execute-plan/scripts/ci-mailbox.mjs), its worker, host hooks, and Codex stream own observation and delivery. Reuse them and the active completion story's result; no second lifecycle. |

The startup command imports backlog domain functions rather than parsing CLI
output. Production startup does not import fixture setup or test assertions.
Its required local files ship through existing payload declarations, with one
shared implementation and only necessary host adaptation.

Accepted [ADR 0002](../adrs/0002-software-development-lifecycle-principles-accepted.md)
requires cohesion, continuous integration, and low cost of changing direction;
[0004](../adrs/0004-client-installation-and-update-accepted.md) governs standalone
payload delivery; [0005](../adrs/0005-cross-tool-validation-accepted.md) governs
mechanical and native evidence; [0006](../adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one authoritative rule and concise agent instructions. Follow
[maintainer guidance](../../AGENTS.md) for eventual source changes.

**ADR conclusion:** No feature-specific ADR is needed. Existing decisions already
constrain this design. The clarification to ADR 0000 records Terry's product-wide
ADR scope rule. [ADR 0009](../adrs/0009-git-branching-and-integration.md) remains the
Proposed home of the global remote-integration direction; command design does
not belong there. This review does not accept it or change Story Branch timing.
The existing tension between delayed integration and ADR 0002 remains separately
recorded in Proposed ADR 0007; this work creates no further exception.

## Startup: one bounded operation

The caller supplies the selected work identity, mode, originating checkout, and
established execution/publication authority. Resolve canonical paths and project
remote names through existing context. An invocation does not itself grant
permission, declare prose ready, or authorize another push destination.

1. Fetch remote trunk. Check the selected story section and active plan against
   local unpublished commits, staged content, and working-tree edits in the
   originating checkout. Stop for unpublished selected-source changes or an
   ambiguous source. Sibling-story edits alone do not block. Use existing
   canonical readers, not another Markdown grammar or dependency analyzer.
2. Select or reuse a suitable owned workspace based on fetched trunk. Preserve
   host-established workspaces and their authority; do not reset them or create
   nested worktrees by default. Stop if reconciling the intended source requires
   judgment. Attempt safe refresh of originating main as described below.
3. Apply the backlog's existing preparation/Take checks, create only the intended
   claim, and publish it to remote trunk in both modes. Existing project setup
   and semantic readiness decisions remain prerequisites owned by execution;
   this command adds no generic installer, arbitrary callback, or test-selection
   system. Recheck source validity if remote reconciliation changes the selected
   story or plan; return for renewed review when necessary.
4. Confirm remote containment plus current claim membership/ownership, attempt
   local refresh, and return the accepted revision and owned workspace before
   implementation. Progress in Story Branch Mode retains its separate target.

Local main normally fast-forwards when clean, behind, and without a declared
competing owner. An unrelated dirty, busy, or ahead/divergent checkout stays intact
with a deferred result. Never stash, reset, or publish unrelated work to make it
current. Failed fetch or failure to establish fresh execution input stops startup;
deferred local maintenance does not. Report the fetched head observed, not a
promise to remain equal to a continuously moving remote.

Startup honors existing declared access where available; missing declarations
do not block automatic refresh. Checkout coordination will establish cooperative
access for direct edits and refreshes when that story is delivered. Remote
publication from another worktree does not acquire local access. Nonparticipating
human/tool edits still require preservation and conservative refusal; a cooperative lock cannot
promise to prevent them.

## Publication, recovery, and CI

The shared publisher receives an owned candidate/base and authorized remote/ref.
Rebase only an owned unpublished suffix; preserve already-published history when
merging. Use the backlog adapters when applicable. Validate the resulting
candidate, push that exact revision without force, fetch, and confirm containment.
Use the existing bounded race recovery: one reconciliation/retry, then preserve
state and return a useful stop. Respect protected-branch integration requirements;
no execution starts while its required claim acceptance is unresolved.

Take's mechanical checks can run internally. Implementation reconciliation may
invalidate behavioral proof; return the changed basis for applicable validation
unless an established check already covers it. Do not infer success from a clean
rebase or add a general validation framework. Semantic conflict and proof judgment
remain agent work.

Keep the result small: accepted revision/target or unresolved publication,
workspace/recovery location, separate refresh outcome, and any CI coverage gap or
required next action. No new general event schema. Accepted publication remains
accepted when refresh or observation attachment fails. Verify remote state after
a lost push response before retrying. Resume from existing Git provenance and
owned context; competing or ambiguous claims stop. Preserve candidate commits
and sequencer state. A local crash never silently releases a remote Taken claim.

The merged CI/delivery story owns observer setup/reuse and feeding the actual
accepted revision for ordinary execution increments and repairs. Existing mailbox
state and scoped host delivery retain the handle; the agent does not copy it or
run probe/start/register separately. Recover only the matching owner, target,
and workspace; use their established completion operation. A tiny association
needed for resume belongs with existing CI ownership, not a new workflow ledger.

Receipt-driven attribution replaces ref-movement inference on this managed path.
Terry previously accepted possible fresh-base attribution by a hook; that tolerance
does not require implementing an additional fallback when the publisher already
knows its exact accepted revision. Raw/manual pushes remain outside automatic
attachment here. They retain explicit existing observation options, and no claim
of automatic coverage. Preparation CI policy and closure target changes stay with
their respective callers.

Successful mechanical steps return compact evidence without extra model turns.
Deferred local refresh stays visible in the receipt and normal report but need
not interrupt implementation. Conflicts, unconfirmed claims, and required coverage
gaps need immediate attention; delayed CI failures use existing scoped delivery.
Completion still returns truthful evidence when CI succeeds or remains unresolved.
“Attention only when needed” does not mean suppressing results needed to proceed.

## Scope, migration, and proof

The first delivery solves startup without new CI automation. The second extends
that concrete publisher to repeated execution delivery and automatic observation,
removing the overlapping CI startup/registration recipe in the same story.
Preparation keep and closure later use the same publisher with their own existing
authority and validation. Keep those separate: preparation has a leave-uncommitted
choice; closure has published-history, target-change, and cleanup obligations.
Shared-main direct edits consume the publisher and the one access owner through
the existing coordination story; there is no fifth publication engine.

Dashboard ownership extends the existing claim domain and startup result when
that story is delivered; it does not add another Git publication path. The first
story must not prebuild name allocation, assignment presentation, or a dashboard
registry. Planning-format validation reuses the same readers and is no prerequisite
for the existing structural checks needed by startup.

For each adopted caller, replace its recipe with authorized intent, one invocation,
and conditional result handling. Remove obsolete steps instead of adding warnings.
Unmigrated callers keep their current single shared reference until their selected
story replaces it. One policy owner does not require one enormous delivery story.

Reuse real Git fixtures and the native publication harness. Check remote history
independently of receipts: competing different/same claims, remote races, lost
responses, selected versus unrelated dirty source, and resumed partial success.
Native evidence must show actual invocation and no early implementation, especially
on the incident's Claude path. Reuse valid host evidence; do not prescribe the
expected command sequence in a native prompt or treat fixture cleanup as runtime
success. No new routine matrix for unaffected behavior.

Measure routine commands, repeated decisions, and recovery burden before/after;
do not promise token savings without observations. Invest in stable Git facts
and preservation guarantees. Keep model-dependent orchestration thin and removable.
Do not build invisible host triggering, an API service, raw-command interception,
a scheduler, automatic conflict repair, new providers, or speculative compatibility.
Reconsider later migration effort after startup and execution delivery are in use.
