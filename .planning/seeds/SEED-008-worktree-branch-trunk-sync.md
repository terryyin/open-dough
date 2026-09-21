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

Developers and agents prepare changes in owned workspaces and share validated
increments through the project's remote trunk. The same publication contract
serves worktrees on one machine and clones on different machines. The default
local checkout stays useful for starting tasks and making bounded direct edits,
with its freshness and ownership managed separately from remote publication.

The selected direction is described in
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md).
Terry authorized this backlog alignment on 2026-09-21. The ADR retains Proposed
status; this seed records desired outcomes for implementation planning.

## Stories

<a id="migrate-git-branching-and-integration"></a>

### Migrate existing workflows to integration through origin

**Identity:** SEED-008#migrate-git-branching-and-integration

**Status:** Captured; selected for the backlog. Refinement and planning pending.

**Goal:** A developer using any implemented Open Dough workflow gets consistent
branch ownership, reconciliation, and publication through the project's
specified remote, with recoverable work and a separately maintained default
checkout. This supports parallel work across both local worktrees and machines.

**Scope — required behavior:**

- Apply one remote publication contract across implemented preparation,
  execution startup and Taken claims, planned and planless execution,
  retrospective corrections, wrap-up, and interrupted-work recovery. Include
  every affected caller and supported execution context, using its established
  publication authority and destination.
- In Trunk Mode, prepare validated increments on the owned local execution
  branch, reconcile its unpublished commits with freshly fetched remote trunk,
  and publish the candidate to that trunk. In Story Branch Mode, publish progress
  to the recorded remote story branch and integrate at its authorized lifecycle
  boundary, preserving published history. Direct-current-branch and host-owned
  contexts retain their publication owner and explicit task authority.
- Publish shared workflow records through an owned path. A Taken claim reaches
  remote trunk before isolated implementation begins. Preserve work identity,
  backlog reconciliation semantics, preparation disposition, and CI attribution
  to the actual published revision and target.
- Resolve concurrent remote updates through fetch, reconciliation, affected
  validation, and ordinary publication. Recover an ambiguous push by inspecting
  remote history. Record publication success when the candidate is present in
  the destination's history, including after a subsequent writer advances it.
- After trunk publication, attempt a safely coordinated default-checkout refresh.
  Advance a clean checkout by fast-forward; preserve pending edits, unpublished
  commits, and active operations and report deferred refresh. Start new owned
  workspaces from a verified fetched base. Use existing explicit local ownership
  coordination for direct edits and refreshes; the separate coordination story
  owns automating that access and recovery.
- Replace affected source guidance, implementation, references, examples,
  fixtures, and tests as one coherent behavior change. Remove superseded paths
  and assertions. Write the resulting documents, AI instructions, test names,
  and assertions around the intended contract and observable outcomes. Keep
  change history recoverable in Git; retain durable safety and ownership rules
  in language that explains their present purpose.
- Follow the release-owned delivery path for installed guidance. Update the
  shared source and any affected host adaptations, and establish sufficient
  behavior and delivery evidence for Codex, Cursor, and Claude Code under
  ADR 0005. Reuse applicable proof and target fresh native checks at changed
  delivery boundaries.

**Key examples / evaluation:**

1. Two worktrees and a second developer's clone prepare increments from the same
   trunk revision. Their accepted publications preserve all changes, with each
   later candidate reconciled against intervening remote history and checked
   for affected behavior.
2. An execution publishes a validated increment while the default checkout
   contains a developer's unfinished edit. Remote history contains the candidate;
   the edit remains intact; the report identifies publication success and
   deferred local refresh. A later safe refresh brings the checkout current.
3. A queued story's Taken claim is published from an owned workspace and becomes
   visible to an origin reader before implementation starts. Concurrent claims
   preserve the backlog's identity and selection rules.
4. A preparation session publishes its explicitly retained result; a Trunk Mode
   execution publishes increments and closure; a Story Branch execution publishes
   branch progress and later integrates through its authorized lifecycle. Each
   uses the shared contract with attributable revisions and recoverable state.
5. A push succeeds but its response is lost, and another writer advances trunk.
   Resume discovers the candidate in remote history, records that publication,
   and completes the remaining refresh or CI-registration obligation.
6. Representative installed invocations follow the intended ownership and
   publication rules. Documentation and tests describe the supported behavior
   in its own terms, and each maintained assertion protects a current promise.

**Depends on:** Existing branch modes, backlog mutation/reconciliation, and
publication/CI ownership. Use ADR 0009's selected direction when refining this
migration and preserve the separate human-owned ADR acceptance process.

**Safe stopping point:** All implemented publication journeys use the coherent
contract, supported by updated guidance and proof. Developers can use explicit
local coordination while the dedicated default-checkout coordination story
remains queued.

**Effort hypothesis:** Unestimated; breadth lies in the shared publication
callers and their recovery/delivery proof. Refine that inventory before slicing.

<a id="same-machine-merge-queue"></a>

### Coordinate direct edits and refreshes of the default checkout

**Identity:** SEED-008#same-machine-merge-queue

**Status:** Captured; refinement and planning pending.

**Goal:** A developer running several agents on one machine gets safe,
recoverable access to the default checkout for short direct edits and refreshes,
while agents continue publishing from their owned workspaces to remote trunk.

**Scope candidate:** Automate exclusive access to one repository's default
checkout across participating worktrees. Direct edits and refreshes use the same
coordination mechanism, covering inspection, working-tree and index mutations,
commit, and safe release or explicit handoff. Recheck current state after
acquiring access, preserve human work, and make deferred refresh and recoverable
interruption visible. Apply the migration story's refresh rules and existing
Git publication ownership.

**Key examples / evaluation:**

- Agent A holds the default checkout for a bounded edit. Agent B publishes a
  validated increment from its worktree to remote trunk and reports its local
  refresh as deferred. Once A completes or hands off its owned operation, a
  coordinated refresh reconciles with the current state and advances when safe.
- Two agents request a default-checkout refresh. One writer operates at a time;
  the next reads the resulting state and reports the current revision.
- A human has staged an unrelated edit in the default checkout. A requested
  refresh preserves the staged and working-tree content, reports the pending
  ownership issue, and resumes after that work is resolved.
- An operation is interrupted. The next participant can identify its ownership
  and preserved work, then recover or receive an explicit handoff before
  mutating the checkout.

**Depends on:**
[Migrate existing workflows to integration through origin](#migrate-git-branching-and-integration).
That story supplies publication and baseline checkout maintenance; this story
supplies automated same-machine access and recovery.

**Deferred decisions:** Atomic acquisition, ownership representation, waiting
and fairness, interruption recovery, and detection of intervening human edits.
Choose mechanisms during refinement using demonstrated local contention and
existing suitable solutions. Any remote publication scheduling proposal needs
its own observed contention evidence and scope decision.

**Safe stopping point:** Participating writers coordinate default-checkout
operations and preserve interrupted work. Remote publication remains available
from each owned workspace under the common Git contract.

<a id="claude-code-background-mode"></a>

### Complete execution and wrap-up in fresh Claude Code background mode

**Identity:** SEED-008#claude-code-background-mode

**Status:** Refined outcome aligned on 2026-09-21; host-specific details require
renewed refinement before planning.

**Goal:** A developer using Claude Code background mode can take authorized work,
execute it in the session's owned checkout, and finish with committed closure
on its execution branch. The developer retains ownership of execution-branch
publication and any pull request.

**Scope — required behavior:**

- Reuse a suitable host-provided worktree and branch as the execution workspace.
  Establish its ownership, starting revision, and authorized remote destinations
  from the session and project. Explain the supported configuration through
  installed guidance and prove it in a fresh native session.
- Resolve shared Taken-claim publication separately from execution-branch
  publication. With claim authority established, reconcile and publish the
  claim to remote trunk through an owned path before implementation starts.
  Surface missing authority or target context as a concrete prerequisite for
  the selected work, preserving the prepared state.
- Continue execution and wrap-up in the established workspace. Retain recovery
  identity and close the story through the supported developer-owned publication
  boundary. Report the committed branch, pending publication, and any shared
  record reconciliation needed when the developer publishes or integrates it.
- When a supported session uses the default checkout for direct work, apply
  the common checkout ownership and refresh rules. Express configuration and
  workspace choice through the shared execution contract and the necessary
  Claude-specific adaptation.

**Key examples / evaluation:**

1. A fresh native background session provides an isolated checkout. Open Dough
   records that checkout and branch, publishes an authorized claim through the
   remote contract, and performs implementation in that workspace.
2. Execution-branch publication belongs to the developer while shared-claim
   publication is authorized. The session publishes the claim, commits work and
   closure on the execution branch, and identifies the developer's remaining
   publication and integration obligations with the correct destinations.
3. Claim publication authority is unresolved. The session preserves its prepared
   changes and reports the authority needed before it can start claimed work.
4. Remote trunk advances during setup. Claim publication reconciles the changed
   remote state, and execution starts from the resulting verified base.

Evaluate with a fresh installation and actual Claude Code background settings.
Observe checkout ownership, branch refs, remote history, backlog records, and
closure commits under ADR 0005. Resolve host commit/push restrictions and the
shared-record closure handoff during renewed refinement. Broader host lifecycle
management, cloud sessions, and pull-request automation remain future scope.

**Depends on:**
[Migrate existing workflows to integration through origin](#migrate-git-branching-and-integration).
The queued local-coordination story supplies automated access when operating in
the default checkout; isolated host-worktree execution uses the remote contract.

**Safe stopping point:** The proven native session can execute and close work
in its owned workspace, with durable commits and explicit publication ownership.

**Effort hypothesis:** Unestimated pending the fresh host observation and
claim/closure authority refinement.

<a id="reduce-ci-observer-overhead"></a>

### Reduce CI observer overhead across execution and wrap-up

**Identity:** SEED-008#reduce-ci-observer-overhead

**Status:** Captured on 2026-09-21; queued at the developer's requested second
priority. Not resolved; refinement and planning pending.

**For / why:** Terry and agents executing Open Dough plans need useful,
truthful asynchronous CI observation without repeated manual bookkeeping or
interpreting routine discovery delays as lost coverage. Frequent Trunk Mode
publications make this shared execution cost especially visible.

**Reported evidence:** Terry supplied these observations from a Pygardon plan
execution in the 2026-09-21 backlog discussion. The execution identity, host,
installed release, and raw event transcript were not supplied; the repetition
and timing below are reported observations, not independently measured facts.

- Probe → start → register-push was reported repeated after every slice, seven
  or more times, including retyping the exact `/tmp/dough-ci-501/watch-XXXX`
  directory. Current Open Dough guidance requires probing and starting once
  per execution and reusing the observer; only registration is required after
  each confirmed push. Distinguish unnecessary repeated setup from the real
  registration and handle-management burden during refinement.
- Several pushes reportedly emitted `CI_COVERAGE_UNAVAILABLE` after three
  discovery polls, followed minutes later by a real result for the same SHA.
  Each early notification needed to be treated as provisional, adding repeated
  interpretation overhead. The three-poll notification comes from shared Open
  Dough runtime; Pygardon's CI latency may amplify it.
- Trunk Mode wrap-up reportedly armed another observer for one closure commit
  and stopped it immediately afterward. Current closure guidance explicitly
  requires this when execution already stopped its observer, leaving a short
  useful observation window for the extra setup work.

**Related finding:** [ODF-069 — CI discovery gaps obscure later terminal
results](../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results)
is partially addressed, not resolved. Commit `5630b28`, now merged into `main`
but not released at capture, proves later results can arrive and clarifies
that an early coverage notification is provisional. It does not change the
three-poll threshold or remove notification noise. The catalog's separate
GitHub bounded-listing concern is not established as the cause of this
Pygardon report; later-result delivery here is not evidence of a missed verdict.

**Outcome / scope candidate:** Simplify the shared observer lifecycle and
publication interaction across execution and closure. Reduce repeated manual
registration/handle work, communicate ordinary discovery delay without noisy
coverage-loss implications, and make closure observation useful relative to
its setup cost. Preserve exact published-SHA attribution, owning-session
delivery, actionable failure handling, and honest pending/lost coverage.

**Key examples / evaluation:**

1. A seven-slice execution with frequent pushes retains one observation
   identity through ordinary and repair publications without repeated manual
   setup or retyping its mailbox path for each slice. Every confirmed published
   SHA remains attributable and recoverable after interruption.
2. A run appears after the existing three-poll window. The coordinator receives
   an unambiguous provisional state without repeated false alarms; a later
   failure still reaches its owner. A run that never appears and an observer
   that dies remain distinguishable and truthfully reported at closure.
3. Execution continues into a short Trunk Mode wrap-up. The resulting lifecycle
   avoids a start/register/immediate-stop cycle with negligible observation
   value, while explicitly reporting which closure revisions were observed and
   which remain pending. Routine delivery does not wait for CI completion.

**Boundaries / open decisions:** Choose the concrete registration interface,
discovery-notification policy, and closure lifetime during refinement using
the existing runtime and the supplied execution evidence. Do not assume that
increasing a poll count, suppressing every warning, or adding a persistent
service is the solution. Keep shared behavior coherent across Codex, Cursor,
and Claude Code and both execution modes. Diagnose any Pygardon adapter defect
separately if evidence establishes one. Update ODF-069's disposition only to
the extent that delivered proof addresses its recorded problem.

**Depends on:** Existing publication and CI ownership contracts. Coordinate
with the preceding origin-integration migration story's affected callers;
this record creates no additional prerequisite or execution plan.

**Safe stopping point:** Multi-slice execution and closure demonstrate lower
bookkeeping and notification overhead without losing failure delivery or
overstating coverage. **Effort hypothesis:** Unestimated pending refinement.

## Architectural Context

[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports continuous integration and resolving conflicts through shared intent.
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs behavior and native acceptance evidence.
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires shared behavior written for the executing project, with necessary host
adaptation. Follow the [maintainer guideline](../../AGENTS.md) when authoring.

[ADR 0007 — Software development lifecycles](../../docs/adrs/0007-software-development-lifecycles.md)
owns lifecycle discussion;
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md)
owns the proposed Git contract. Both retain Proposed status. ADR 0007 records
the unresolved relationship between Story Branch Mode's delayed integration and
Accepted ADR 0002; human resolution of that question remains separate from this
Git migration.
