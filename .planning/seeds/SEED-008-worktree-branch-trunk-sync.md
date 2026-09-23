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

<a id="settle-taken-claims-on-remote-trunk"></a>

### Settle Taken claims on remote trunk through one publication path

**Identity:** SEED-008#settle-taken-claims-on-remote-trunk
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Status:** Captured on 2026-09-23; execution planning pending.

**Goal:** A developer running stories concurrently in Trunk Mode or Story Branch
Mode sees every confirmed Taken claim on the project's authoritative remote
trunk before either execution begins. The default local checkout attempts to
catch up to that accepted revision when it can do so safely.

**Incident:** On 2026-09-23 in Doughnut, `SEED-037#story-3` was committed as
Taken at `8face872f1` and published on its remote story branch while remote
`main` still listed it in Backlog list. A concurrent `SEED-036#story-1` claim
reached remote `main` at `dc29e4525a`, so the two agents saw different shared
queue states. Implementation of SEED-037 had begun in a dirty worktree. The
installed execution guidance at the claim revision already required both modes
to publish the claim to remote trunk before implementation; the claim commit
lacked the shared claim helper's ownership trailer. This shows a bypass of the
required publication boundary, but the exact host or agent decision that led
to it is unconfirmed. The SEED-037 claim was later merged into remote `main` at
`e9ac74a8d9`; that repair is incident history, not this story's completion.
This is a new occurrence of the shared visibility problem recorded in
[ODF-066](../../docs/maintainer/finding-names.md#odf-066--unpublished-story-branch-claims-block-shared-integration)
after the earlier claim-publication response was released.

**Scope:** Give execution startup one reliable, shared path that selects the
owned claim commit, reconciles it with freshly fetched remote trunk, confirms
remote acceptance, and attempts a safe refresh of the default local checkout.
Both execution modes use that same boundary before implementation. Reuse the
same authoritative remote-publication and checkout-maintenance behavior for
other workflows that integrate with remote trunk; remove duplicated procedural
instructions instead of maintaining parallel recipes. A story branch may still
publish implementation progress to its own remote branch, but that destination
does not settle the Taken claim. Report remote acceptance and local refresh as
separate facts, preserving unpublished work and concurrent remote changes.

**Key examples / evaluation:**

- Two executions take different queued stories from the same fetched base,
  one in each mode. Their claims reconcile in either publication order; remote
  trunk shows both exactly once before either starts implementation.
- A Story Branch execution publishes its claim to remote trunk, then publishes
  a later implementation increment to its story branch. The increment does not
  replace or retract the remote-trunk Taken entry.
- After a claim reaches remote trunk, a clean, exclusively available local
  default checkout fast-forwards to the accepted trunk head. A dirty, busy, or
  ambiguous checkout stays intact; the claim remains accepted, and the deferred
  refresh is reported and can be retried when access becomes safe.
- Remote trunk advances between fetch and push. The owned candidate is
  reconciled with the new head and accepted without dropping another claim;
  rejection or interruption leaves recoverable state and does not start
  implementation from an unconfirmed claim.
- A fresh native execution in each supported host demonstrates that the shared
  publication path is actually used, with remote history and local checkout
  state checked independently. Guidance names one authoritative procedure and
  callers link to it rather than restating its steps.

**Architecture constraints:** [Accepted ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires continuous integration on a shared trunk;
[Accepted ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one authoritative home for each behavioral rule. The Git mechanics
draft in [Proposed ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md)
is context, not an accepted decision. The existing
[default-checkout coordination story](#same-machine-merge-queue) owns automated
exclusive access among local writers; this story owns the publication boundary,
safe refresh attempt, and truthful outcome across modes.

**Safe stopping point:** Both modes settle claims on remote trunk before work
starts and use one reusable integration procedure. Local checkout lag is
visible and recoverable when refresh cannot safely advance it.

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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/079-complete-ci-observation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f46a39ca1aeae7e517072d833d50c3bd3eec2f300d12ae904e37ec3ad665429c","plan":"5883ccfb20da262c7269126c83e8445c5819f56c7527af24970db74510a394b4"}}
```

**Status:** Refined with Terry on 2026-09-23; planning authorized, execution
not authorized by this preparation.

**Goal:** A developer's executing agent finishes execution and wrap-up with
trustworthy CI evidence without a separate observer-shutdown procedure or
coverage-report reading ritual. Reduce agent attention and instructions needed
for completion, while preserving failure handling and safe resource cleanup.

**Scope:** Use the existing completion boundary to own bounded observation and
local shutdown together. After success or an unresolved completion outcome, one
operation returns the applicable evidence and shutdown result; the agent handles
that receipt without a separate stop or process-check sequence. A failure stays
under existing diagnosis/repair ownership before completion; explicit stop
remains available for cancellation and human-judgment stops. Keep observer
lifetime bounded when the coordinator disappears.

Execution and wrap-up share this behavior across Trunk and Story Branch modes.
Wrap-up may still need an observer for later publications or a different target;
this story does not promise to eliminate that setup. Ordinary slice delivery
continues observing without waiting or inferring completion from inactivity.
Unconfirmed shutdown prevents removal of resources still needed by the observer.

**Non-behavioral acceptance requirements (Terry, 2026-09-23):**

- Architecture stays consistent and cohesive: reuse the existing coverage,
  mailbox, shutdown, and host-delivery owners; remove duplicate lifecycle policy
  rather than creating a second observer, state representation, or framework.
- The agent's instructions become clearer and shorter. Replace the separate
  wait/stop/report recipe with one authoritative completion rule and necessary
  links. Review the whole reading path, including adapters and recovery, for
  reduced commands, branching, repetition, and interpretation. Moving the same
  burden into another reference or appending more reminders does not satisfy
  this requirement. Preserve precise failure and cleanup safeguards.

**Key examples:**

- Execution reaches completion with pending or already-green applicable CI →
  one completion operation returns its evidence and confirms local shutdown →
  the agent finishes without a separate stop, process check, or report read.
- CI passes between slices and later work takes a long time → the observer
  remains usable for the next registered publication; inactivity is not finish.
- CI fails, including failure whose diagnostics arrive later → diagnosis and
  authorized repair retain their observation owner; no success or premature
  cleanup is claimed. Repair publication reaches a later completion boundary.
- Completion times out or observation becomes unavailable → one receipt retains
  the unresolved reason and shutdown outcome; uncertainty never becomes green.
- Wrap-up publishes final closure, or integrates a story branch into trunk →
  completion uses the exact accepted revision on its actual target before
  deleting the owned checkout; earlier branch success cannot cover trunk.
- Coordinator disappears → the existing finite observer budget bounds polling;
  explicit cancellation still stops only the identified observer.

**Why now / alternatives:** The remaining shutdown recipe is confirmed in
current guidance, but its token/time saving is not measured. Earlier discovery
noise reduction and completion waits shipped in 0.3.29 and 0.3.30. Terry accepted
the narrower completion-operation recommendation on 2026-09-23. Keep this as a
small simplification at its existing priority; if it grows into an idle/restart
lifecycle, revisit priority against published ownership visibility. The original
idle-expiry proposal is superseded: all currently registered revisions being
terminal does not establish that another slice will not publish later.

**Deferred promises:** Automatic startup or registration, elimination of mailbox
handles, session-end hooks, shared cross-agent observers, provider or path-policy
expansion, dashboard CI views, publication changes, and release/version work.
No idle duration or new lifecycle configuration is needed for this outcome.

**Architecture:** Follow Accepted ADRs
[0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(high cohesion and less residual judgment) and
[0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one authoritative, concise runtime rule), and
[0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) for affected host
behavior. Apply [maintainer guidance](../../AGENTS.md) to source skill edits.

**Dependencies and safe stopping point:** Applicable-revision waiting is already
delivered. The agent still starts and registers observation, but routine
completion needs no separate closing procedure even if the next automation
story is cancelled. No unresolved product decision remains. The earlier S label
was an unvalidated hypothesis; the plan owns boundedness and proof.

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
