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
interruption visible. Apply the installed default-checkout refresh rules and
existing Git publication ownership.

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
Installed execute-plan publication and default-checkout maintenance guidance
supply the shared remote publication contract and baseline checkout maintenance;
this story supplies automated same-machine access and recovery.

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
Installed execute-plan publication guidance supplies the shared remote
publication contract. The queued local-coordination story supplies automated
access when operating in the default checkout; isolated host-worktree execution
uses the remote contract.

**Safe stopping point:** The proven native session can execute and close work
in its owned workspace, with durable commits and explicit publication ownership.

**Effort hypothesis:** Unestimated pending the fresh host observation and
claim/closure authority refinement.

<a id="reduce-ci-observer-overhead"></a>

### Reduce CI observer overhead across execution and wrap-up

**Identity:** SEED-008#reduce-ci-observer-overhead (retired from the queue on
2026-09-22; not reallocated)

**Status:** Split on 2026-09-22 into the three stories that follow. This
section keeps the observed problem, its evidence, and the developer's goal;
it is no longer a queued work item.

**Goal of the split:** Token efficiency of the agents executing plans. The
ideal, stated by Terry on 2026-09-22, is an observer the agent never has to
think about — armed and fed by scripts and installed hooks, heard from only
when CI fails — reached with a simple overall solution rather than an
elaborate lifecycle. The stories below approach that ideal in order of
saving per effort: first silence non-actionable notifications, then remove
closing bookkeeping, then remove starting and feeding.

**Reported evidence:** Terry supplied these observations from a Pygardon plan
execution in the 2026-09-21 backlog discussion. The execution identity, host,
installed release, and raw event transcript were not supplied; the repetition
and timing below are reported observations, not independently measured facts.

- Probe → start → register-push was reported repeated after every slice, seven
  or more times, including retyping the exact `/tmp/dough-ci-501/watch-XXXX`
  directory. Current Open Dough guidance requires probing and starting once
  per execution and reusing the observer; only registration is required after
  each confirmed push.
- Several pushes reportedly emitted `CI_COVERAGE_UNAVAILABLE` after three
  discovery polls, followed minutes later by a real result for the same SHA.
  Each early notification needed to be treated as provisional, adding repeated
  interpretation overhead. The three-poll notification comes from shared Open
  Dough runtime; Pygardon's CI latency may amplify it.
- Trunk Mode wrap-up reportedly armed another observer for one closure commit
  and stopped it immediately afterward. Current closure guidance explicitly
  requires this when execution already stopped its observer, leaving a short
  useful observation window for the extra setup work.

**Repeated setup is observed, not targeted.** The 2026-09-22 investigation
found no Trunk-Mode-specific guidance or runtime path that repeats probe or
start per slice, and no transcript, DearDough, or finding record of it. It
stays out of every story's goal and is watched instead. Hypothesis to test on
the next multi-slice execution, recording host, model, release, mode, and the
observer commands actually run: the per-slice loop step "Recover an existing
CI observer before considering a new one", read alongside "re-entering setup
… after a publication", invites a setup ritual; the observer handle is kept
only in the conversation by design, so a long execution can lose it; and each
`probe` mints a fresh mailbox directory whose receipt can be mistaken for the
live handle. Trunk Mode amplifies the cost through more publications, a
default-checkout refresh after each, and the wrap-up observer cycle. Story C
below removes the handle from the agent's hands, which would make this moot.

**Related finding:** [ODF-069 — CI discovery gaps obscure later terminal
results](../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results)
is partially addressed, not resolved. Commit `5630b28`, released in 0.3.28,
proves later results can arrive and clarifies in guidance that an early
coverage notification is provisional. It does not change the three-poll
threshold or remove notification noise. ODF-034 records the same per-push
diagnostic repeated across an execution. The catalog's separate GitHub
bounded-listing concern is not established as the cause of this Pygardon
report; later-result delivery here is not evidence of a missed verdict.

**Runtime facts established on 2026-09-22 (main at 0.3.28):** the observer
emits no success event, so on a green run `CI_COVERAGE_UNAVAILABLE` is the
only observer message the coordinator ever receives; the threshold is a
literal `missingRevisionPollLimit = 3` at a 30-second poll, about 90 seconds;
on Claude Code an event arriving at the host's Stop hook is delivered as a
blocking decision that forces another agent turn, and on Cursor as a
follow-up message; publication is prose Git steps followed by a separate
`register-push`, not a script the agent runs; the readiness-gate script the
agent already runs once knows the selected mode and target; the installed
delivery hook already runs after tool use and enumerates this owner's
mailboxes, whose requests record repository, target branch, and checkout
root.

<a id="self-ending-ci-observer"></a>

### End CI observation without agent bookkeeping at execution and wrap-up

**Identity:** SEED-008#self-ending-ci-observer

**Status:** Captured on 2026-09-22 (story B of the split above); outcome
aligned with the developer, refinement pending before planning. Its original
premise that final publications are deliberately left unobserved was superseded
by the later wait-for-applicable-CI story below.

**For / why:** Once execution resolves its bounded wait for applicable CI at completion
boundaries, the observer still should not require explicit closing
bookkeeping. Today the agent stops it, reads its report, and may arm, register,
and stop another observer around Trunk Mode closure commits. That lifecycle
attention adds no product evidence beyond the applicable terminal result.

**Outcome:** The observer ends itself — when every registered revision is
terminal and no registration arrives within a bounded idle period, or at its
budget — and writes its terminal result for anyone who looks. Execution and
Trunk Mode wrap-up run no observer stop or coverage-report bookkeeping after
the applicable result or exceptional wait outcome has been handled; delivered failures are still
handled. Guidance in finish-or-stop, Trunk Mode wrap-up publication, and story
wrap-up loses its explicit closing steps; an explicit stop remains available
for cancellation.

**Constraints and open decisions:** Choose the idle bound during refinement;
an orphaned observer must stay bounded and harmless to the CI API. Keep story
A's advisory and terminal-report semantics. Decide whether a session-end
hook, where a host offers one, should end the observer sooner; do not require
one for correctness.

**Depends on:** the wait-for-applicable-CI story below establishes when an
execution phase may advance; ordered after it by the developer's decision.
**Safe stopping point:** the agent still starts and registers the observer but
never closes it. **Effort hypothesis:** S.

<a id="script-driven-ci-observation"></a>

### Arm and feed CI observation from scripts without agent commands

**Identity:** SEED-008#script-driven-ci-observation

**Status:** Captured on 2026-09-22 (story C of the split above); outcome and
attribution decision aligned with the developer, refinement pending before
planning.

**For / why:** Reaching the split's ideal: the agent runs no `probe`,
`start`, or `register-push`, retains no mailbox handle, and learns that an
observer exists only when a failure is delivered.

**Outcome:** The readiness-gate script the agent already runs once arms the
observer for the selected mode's authorized target. The installed delivery
hook registers this workspace's publications by noticing that the target's
remote-tracking ref has advanced to the owned branch's tip, which happens
only right after this workspace pushes. Probe, start, and register-push leave
the execution guidance; observer recovery after interruption becomes a
runtime concern, not an agent step.

**Attribution decision (Terry, 2026-09-22):** attribution is derived from the
owned workspace rather than explicit registration. It is exact in the normal
case; after a fast-forward refresh of the owned branch onto an advanced
target, that fresh base may be attributed and its failure delivered. This is
accepted as useful information rather than noise.

**Constraints and open decisions:** This reverses the current execution
location decision not to arm at the readiness gate; record that reversal
explicitly. Resolve how Codex, which observes through a stream rather than a
post-tool hook, keeps the same behavior under ADR 0005. Retire ODF-073 and
the repeated-setup hypothesis above to the extent the delivered behavior
makes them moot. Keep the mailbox request as the record of repository,
target, and checkout root that the hook reads.

**Depends on:** story B, since an observer nobody starts must end itself.
**Safe stopping point:** the agent's observer vocabulary is empty; failures
still arrive. **Effort hypothesis:** M.

<a id="wait-for-applicable-ci-before-advancing"></a>

### Wait for the latest applicable CI result before advancing execution

**Identity:** SEED-008#wait-for-applicable-ci-before-advancing

**Status:** Refinement investigated on 2026-09-22; draft for review;
[slice plan](../quick/077-await-applicable-ci/PLAN.md) written. Queue position
remains owned by the product backlog.

**Goal:** A developer normally receives the latest applicable CI verdict before
execution and review finish, without spending agent tokens on routine waiting.
Exceptional outcomes end the wait and remain explicit; this is bounded
observation, not a promise to retry until CI succeeds.

**Purpose and priority:** Published work can otherwise be closed while its
validation is still pending, leaving the developer to recover that obligation.
This supports dependable parallel execution through trunk. It does not prevent
an already-published failure from reaching trunk. Establish the waiting contract
before automating observer lifecycle, but do not infer top priority from that
dependency: the canonical backlog-taking story has repeated dashboard-breaking
evidence, and the current Ubuntu CI defect also competes for immediate attention.
No queue reorder is decided by this refinement.

**Scope — required behavior:**

- Follow the last CI-applicable publication from this execution, on its recorded
  publication target. A later ignored-only `not_required` publication follows
  its recorded earlier applicable attempt. Do not chase unrelated writers'
  newer trunk publications or wait for a skipped run that will never exist.
- Allow the same agent to start retrospective work while the existing non-model
  CI observer continues. Handle an arriving result at a safe boundary; do not
  interrupt useful review just to check status. If review finishes first, wait
  for the result within the final-wait cap before completing the
  execution/review handoff. With retrospective skipped, wait at execution's
  completion boundary instead.
- Use the simple overlap supported by the existing background observer: the
  same agent reviews, then invokes one quiet local wait only if necessary. No
  second agent, review scheduler, or new coordination framework is needed.
- A subsequent retrospective or wrap-up publication that requires CI creates
  the same bounded wait before its completion. In particular, source changes
  made while resolving a merge conflict require the resulting published
  revision's CI on its actual target; pre-merge branch success is insufficient.
  An ignored-only publication with an already resolved applicable attempt adds
  no wait. Reuse an observer while its target matches. On Story Branch integration,
  use the same observer implementation bound to trunk after branch observation
  ends; never retarget an existing mailbox or borrow branch evidence for trunk.
- End waiting on success, failure, observation timeout, unavailable observation,
  or cancellation. Keep those outcomes distinct. An incomplete terminal result
  is unresolved validation, not success. Exceptions let execution proceed out of
  this waiting step without retries to obtain green. Failure remains available
  to existing failure handling; this story neither suppresses it nor creates an
  automatic repair/retry-until-success loop. Cancelling the whole execution is
  still cancellation, not permission to resume it.
- Report the applicable revision/target and verdict or unresolved reason. Workflow
  progress after an exceptional outcome never claims CI passed. If existing
  authorized repair changes reviewed code, revisit affected review conclusions
  rather than restarting the whole retrospective or retaining invalid conclusions.
- Reuse the existing observer and coverage/attempt representation. Routine
  discovery and waiting run without model calls, periodic agent status turns,
  or independent GitHub polling. Agent involvement is for a consequential result
  or exception. Use a fixed 10-minute final-wait cap (provisional planning
  assumption, not yet a human-selected duration), also ending when observation
  itself ends. Start this cap when the wait is invoked; never reset it on local
  status checks or discovery advisories. Do not add a project configuration
  surface or token-accounting system.

**Key examples / evaluation:**

1. Code revision A is followed by ignored-only B. While A is pending, the agent
   performs retrospective work. If A passes during review, review finishes
   normally; if review finishes first, the agent quietly awaits A within the
   final-wait cap. No B run or unrelated contributor's run is awaited.
2. Retrospective and wrap-up publish only ignored paths after A passed. Neither
   publication adds a wait or a routine agent notification.
3. Wrap-up resolves a conflict by changing source and publishes C. It awaits
   C's applicable CI on the integration target, even if branch CI already passed.
4. CI reports failure while review is running. The agent consumes it at a safe
   boundary and leaves the wait for existing failure handling. Any authorized
   repair invalidates only affected review conclusions; the wait itself never
   retries until green.
5. Exercise timeout, unavailable observation, cancellation, and incomplete
   terminal evidence separately. Each ends waiting with its own explicit outcome
   and no false pass. Observation cancellation releases the wait; execution
   cancellation ends execution. None causes a periodic agent polling loop.
6. With retrospective skipped, pending applicable CI is awaited at execution
   completion under the same bounds and exceptional outcomes.

**Boundaries and deferred promises:** No changes to GitHub path policy, CI
providers, branch protection, deployment validation, dashboard CI presentation,
per-slice waiting, or observer automatic start/register/stop behavior. The
self-ending and script-driven stories retain their separate outcomes. No new
review orchestration or automatic re-review of unaffected work is promised.
Installed managed copies change only through a later release.

**Architecture:** Reuse existing observation and failure handling. Accepted
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favors low transaction cost, fast feedback, and retaining mechanisms only while
their benefit justifies their cost. Ending observation on failure does not
remove existing stop-and-fix responsibilities. Under Accepted
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md), bounded
waiting and explicit unresolved evidence never establish missing validation or
release acceptance. This refinement changes waiting, not those quality claims.

**Feasibility finding (2026-09-22):** Overlap is small enough to include. The
existing worker runs independently, updates coverage on disk, and retains
ignored-only ancestry as `basis.sha` and `basis.state`. Success is deliberately
silent, so notification arrival cannot be the completion condition. Add a quiet
wait over that existing evidence; do not wait for the worker itself to exit.
The current five-second `waitForTerminalResult` is a shutdown receipt wait,
not a CI wait. The observer's eight-hour budget is its whole-execution lifetime,
not automatically an appropriate final-wait limit. The separate provisional
10-minute cap avoids turning an ordinary final wait into hours of inactivity.

The retrospective currently forbids committing or pushing. Preserve that
boundary: its findings do not themselves create a publication or repair loop.
Execution retains CI handling responsibility while retrospective analyzes the
finished implementation. Retrospective must accept delivered implementation
with CI still pending without claiming validation complete. Existing failure
handling remains with the execution owner; review only affected conclusions
again if a separately authorized repair changes the reviewed product.

**Depends on:** The existing path-filter-aware coverage semantics supplying
`not_required` and the earlier applicable attempt. **Safe stopping point:**
execution observes the applicable verdict when available within its bound and
otherwise proceeds with the exceptional outcome explicit, without a model-driven
waiting loop. **Effort hypothesis:** M: one local wait operation and lifecycle caller changes,
including trunk observation after Story Branch integration. No new observer
architecture or North Star change is needed.

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
