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

<a id="accept-queued-start-native-behavior"></a>

### Accept queued-start publication in native hosts

**Identity:** SEED-008#accept-queued-start-native-behavior
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/082-accept-queued-start-native/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a849d620f97420cb01172ae10977932266cca3307e207ad6578d6ae9237c49e0","plan":"43bbdacc7d3e89412c60ed24ba762a3758743342a39f083f4264d4ae156b239c"}}
```

**Goal:** Before the startup behavior in `dough-execute-plan` is released, a
maintainer can judge that the installed command and concise instruction produce
the intended queued-start outcome in Codex, Cursor, and Claude Code. This is
native acceptance of the implementation published at `1a63c0c5045703006af621f785e81cf6301873d3`,
not another startup implementation or a tool-by-scenario matrix.

**Value now (Terry, 2026-09-23):** Reliable shared state is the most important
next milestone: the dashboard needs an accurate representation of Taken work
to be useful. The original incident left a story available on remote trunk
while implementation and its claim existed on a story branch. The command is
implemented; this story resolves whether native agents actually follow it.
Retain the preceding superseded-runner correction as preparation of the intended
candidate, not another publication feature. Acceptance takes priority over
the later CI/delivery and dashboard extensions. Host unavailability leaves
acceptance unresolved; it does not turn another story's work into proof.

**Plan:** [Verify native queued startup](../quick/082-accept-queued-start-native/PLAN.md).

**Scope and evidence to reuse:** Mechanical installer, payload, Git race, and
caller checks already pass. Fresh Cursor ordinary Story Branch startup passed.
Fresh Codex same-story rival and retained-claim resume passed. Claude selected-
source refusal passed, and an earlier ordinary Story Branch journey passed
before the setup-order assessor was tightened. Judge whether each observation
still applies to the current installed guidance, adapter, fixture, and command.
Record justified reuse per affected requirement and host under Accepted
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).

**Recorded native gaps:** A fresh Codex ordinary startup ran claim
publication and setup but did not complete implementation because its native
delegation failed. A tightened Claude ordinary startup rerun reached the host
limit before a final verdict, and Claude retained-claim resume was blocked by
the same weekly CLI limit before the command ran. Obtain conclusive native
observations for these requirements when the host is available. Assess whether
the existing Cursor and Codex evidence justifies reuse for their other startup
requirements; run another case only for a material host-specific gap. A failed
behavioral observation routes a product defect to a bounded correction, with
its evidence preserved until assessed.

**Key examples:**

- An authorized prepared story is queued on remote trunk, with unrelated local
  edits present → a fresh native agent starts in Trunk or Story Branch Mode →
  its installed startup command confirms its Taken claim on remote trunk before
  setup and the first implementation change; unrelated edits survive.
- The selected source has unpublished changes, or the same story belongs to a
  rival → native startup refuses before setup or implementation; selected source,
  human work, and any rival's ownership survive.
- This execution's claim was accepted before an interruption and remote trunk
  has since advanced → native resume establishes the same current ownership
  without a second Take, then runs setup and may begin implementation.

The implementation signal is the fixture's small first change, not completion
of a whole feature, CI, or wrap-up. Reassess the recorded Codex delegation failure
against that boundary; do not treat a host error as a product defect or acceptance.
Recheck host availability during execution rather than assuming the old quota
block remains current. Assess the actual candidate after the preceding runner
correction, reusing earlier evidence only for requirements it still proves.

**Completion:** For every affected startup requirement on each of the three
tools, record a fresh passing native result or justified reusable proof with
the tool/runtime, candidate, decisive command/use trace, and remote/local
observations. The claim must be on remote trunk before setup and implementation;
source refusal and rival ownership must stop early; resume must avoid a second
Take. Do not count CLI exit, self-report, another tool's result, or quota refusal
as acceptance. Finish this acceptance before releasing the affected behavior.

**Boundary:** No new publication feature, host mode, blanket native matrix,
version bump, or release in this work item. Existing acceptance runner and
disposable fixture are the verification surface; update them only if a concrete
assessment gap is found. No dashboard UI, ownership naming, CI automation,
execution/closure migration, local coordination, or Claude background-mode
adaptation is included. Missing host evidence stays pending; neither quota
refusal nor a successful check on another host satisfies it.

## Publication delivery boundaries

**Parent problem:** Developers executing concurrent work need reliable shared
claims and delivery with less routine agent coordination. Preserve authority,
user work, and truthful remote/CI evidence while reducing total instructions.

**Reviewed decomposition:** The installed startup operation; ordinary execution publication plus
CI attachment in the existing [CI story](#script-driven-ci-observation);
preparation keep; and closure. The previous separate execution-increment
candidate duplicated the CI story's publication boundary and has been absorbed
there. No library, command-framework, or testing-only story is required.

**Alternatives and limits:** Another instruction-only reminder repeats a rule
already installed during the incident. A single all-caller migration delays the
incident fix behind distinct preparation and closure cases. Keep four bounded
outcomes, but do not treat them as four immediate top priorities. Each includes
only the runtime, concise guidance, payload delivery, and proof its outcome needs.

**Effort hypothesis:** No project S/M/L definitions were found. Startup carries
the greatest initial runtime/native-adoption uncertainty. The combined CI/delivery
story adds candidate revalidation and existing-observer attachment, not a new
observer lifecycle. Preparation should be narrower; closure adds published-history
and cleanup concerns. Estimates remain unassigned pending planning evidence.

<a id="publish-execution-increments-through-shared-operation"></a>

### Execution-increment candidate absorbed into CI delivery

The proposed identity `SEED-008#publish-execution-increments-through-shared-operation`
was never queued. Its outcome is now owned by
[SEED-008#script-driven-ci-observation](#script-driven-ci-observation), avoiding
two stories that each wire the same publication boundary. This is a retired
navigation reference, not another candidate or a claim of delivered behavior.

<a id="publish-preparation-through-shared-operation"></a>

### Keep prepared stories and plans through the shared publication operation

**Identity:** SEED-008#publish-preparation-through-shared-operation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"9239143b63c468cdeff76f2fe96856bd52dc8e88f756f995a5785b8239372b64"}}
```

**Status:** Queued on 2026-09-23 after the remote dashboard outcomes; scope
outlined, refinement and planning pending.

**For / why:** A developer who chooses to keep refinement or planning work sees
that exact retained preparation on remote trunk without another agent-managed
Git procedure or disturbance of unrelated local main work.

**Scope candidate:** Adopt the publisher for authorized preparation keep.
Preserve preparation disposition and source-state recording: leave uncommitted,
keep, and discard remain distinct user choices. Publication does not Take a
story or grant readiness. Replace the preparation publication recipe.

**Evaluation:** A kept preparation changes a story while another writer changes
a sibling story → publish both coherently or stop with the source conflict →
retain the correct preparation facts. A request to leave a draft uncommitted
never invokes remote publication.

**Depends on / boundary:** Needs the shared publisher; no product prerequisite
on execution-increment adoption. Ordering it later is a value/learning choice.
Direct edits in shared main retain the existing access contract; this story does
not add checkout locking or a generic direct-edit workflow.

**Safe stopping point:** Retained preparation is published with an exact receipt
and independent refresh result. Closure adoption may remain deferred.

<a id="publish-closure-through-shared-operation"></a>

### Close completed stories through the shared publication operation

**Identity:** SEED-008#publish-closure-through-shared-operation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"9239143b63c468cdeff76f2fe96856bd52dc8e88f756f995a5785b8239372b64"}}
```

**Status:** Queued on 2026-09-23 after the remote dashboard outcomes; scope
outlined, refinement and planning pending.

**For / why:** A developer finishing a story gets the intended closure on its
authorized remote target, with truthful CI evidence and safe cleanup, without
another agent-managed publication sequence.

**Scope candidate:** Adopt the publisher for closure and authorized integration
of already-published Story Branch history. Preserve human-owned publication
restrictions, semantic backlog completion, published history, actual target
attribution, and the existing completion/cleanup conditions. Consume the shared
CI completion operation owned by the already-Taken sibling story; do not add a
second observer shutdown policy.

**Evaluation:** Story Branch closure integrates published history on trunk →
receipt names the accepted trunk revision → matching CI completion and observer
shutdown precede resource removal. A rejected publication or unconfirmed shutdown
preserves recovery resources; earlier branch success does not cover trunk.

**Depends on / boundary:** Needs shared publication and the existing CI completion
contract. No dependency on preparation adoption. This migration does not decide
when Story Branch work should integrate or authorize otherwise withheld pushes.

**Safe stopping point:** Closure uses the same remote-publication owner while
retaining its distinct completion and cleanup responsibilities.

### Priority rationale and scope reduction

The [product backlog](../PRODUCT-BACKLOG.md) is the sole ordered queue.

- Startup is first: a reproduced claim-visibility failure undermines parallel
  execution and the dashboard's shared source of truth.
- The combined CI/delivery story is second: it removes frequent per-increment
  coordination at the same publication boundary, ahead of adding more workflow
  metadata. The already-Taken CI completion story remains independent and active.
- Published ownership and execution-branch visibility stay next. They directly
  serve the remote-first dashboard direction and retain higher value than
  migrating every occasional publication caller immediately.
- Preparation keep and closure follow those dashboard outcomes, before local
  checkout coordination and the remaining Claude background adaptation. They
  extend the shared publisher without making the incident fix wait for them.
- Local coordination remains below remote work, matching the existing direction.
  The Claude background story consumes the common contracts and owns only the
  remaining host-specific restriction/handoff outcome. Neither warrants a second
  publication or observation implementation.
- Planning-format validation and existing process follow-ups retain their relative
  order below this cluster. They are not prerequisites for publication.

If reducing investment, defer preparation/closure migration first and retain
current shared procedures for those callers. Retain the first story's complete
claim guarantee. Reassess further simplification against actual native use;
no invisible host startup, scheduler, arbitrary-push watcher, or global workflow
registry is selected. No new execution authority or ADR acceptance is implied.

## Existing related stories

<a id="same-machine-merge-queue"></a>

### Coordinate direct edits and refreshes of the default checkout

**Identity:** SEED-008#same-machine-merge-queue
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"9239143b63c468cdeff76f2fe96856bd52dc8e88f756f995a5785b8239372b64"}}
```

**Status:** Scope bounded on 2026-09-23; refinement and planning pending.

**Goal:** Participating local agents safely share the default checkout for
bounded direct edits and refreshes, preserving pending work while other owned
workspaces continue publishing to remote trunk.

**Scope candidate:** One immediate access attempt covers inspection and any
working-tree, index, commit, or branch mutation through the existing checkout
maintenance owner. Re-read state after acquisition. On contention or unclear
ownership, return deferred with enough recovery context; no waiting queue,
fairness policy, automatic takeover, background catch-up, or remote merge queue.
Direct edits use the shared publisher with established authority. Keep access
through the edit and release it at its existing completion/handoff boundary.

**Key examples / evaluation:**

- One participating agent owns a direct edit → another publishes from its own
  worktree → remote acceptance succeeds and local refresh is deferred promptly.
- Two refresh attempts contend → only the owner mutates → the other reports
  deferred; a later explicit attempt rechecks current state before advancing.
- A human has staged work or a prior owner was interrupted → preserve content
  and ownership evidence → report recovery/handoff needed; never steal access
  based solely on a timeout or a missing process.

**Boundary:** Cooperative access cannot prevent edits by humans or tools that
ignore it. Rechecks and preservation still apply. This story adds no agent
scheduler, continuous liveness monitor, new publication policy, or remote lock.

**Depends on:** The production publisher and checkout-maintenance boundary from
[startup](../../src/skills/dough-execute-plan/SKILL.md#take-queued-work). It automates access to that
existing owner; startup can safely defer refresh before this story is delivered.

**Safe stopping point:** Participating direct edits and refreshes share bounded
access and recoverable stops; isolated publication stays independent of it.

<a id="claude-code-background-mode"></a>

### Complete execution and wrap-up in fresh Claude Code background mode

**Identity:** SEED-008#claude-code-background-mode
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"9239143b63c468cdeff76f2fe96856bd52dc8e88f756f995a5785b8239372b64"}}
```

**Status:** Retained for its host-specific outcome; scope aligned on 2026-09-23,
renewed refinement and native observation required before planning.

**Goal:** A developer using Claude Code background mode can execute in the
session's owned checkout and finish with committed closure on its execution
branch while retaining developer ownership of branch publication and any PR.

**Scope candidate:** Reuse the common startup, publication, and completion
contracts. Supply only the host's actual workspace, authority, and handoff
context; do not implement a second Take/push/CI lifecycle. A suitable host
worktree is reused without nesting. With shared-claim authority, startup publishes
Taken to trunk before implementation. Execution-branch publication restrictions
remain effective: commit authorized work and closure locally and report the
precise remaining developer publication/integration obligations.

**Key examples / evaluation:**

- Fresh background session supplies a suitable worktree and claim authority →
  shared startup publishes Taken → work and closure stay on the provided branch.
- Shared claim publication is authorized but execution-branch pushes are owned
  by the developer → no forbidden branch push → durable closure commits and an
  explicit developer handoff identify remaining shared-record reconciliation.
- Claim authority or context is missing → preserve preparation and stop before
  implementation with the required decision identified.

Observe actual native background settings, remote history, backlog state, and
closure commits under ADR 0005. Shared claim mechanics are already proved by
startup; this story proves the remaining restricted-publication/closure journey.
Drop any redundant adaptation that those existing native proofs already establish.

**Boundary / dependencies:** Consume the startup and subsequent shared delivery
contracts. No new default-checkout editing mode, cloud lifecycle, PR automation,
or general host-workspace manager. Local checkout coordination is not required
for the isolated background journey. Resolve the host's actual restrictions and
closure handoff in refinement rather than assuming them from its name.

**Safe stopping point:** The supported native session leaves durable work and
truthful publication ownership without bypassing host restrictions.

<a id="reduce-ci-observer-overhead"></a>

### Reduce CI observer overhead across execution and wrap-up

The retired identity `SEED-008#reduce-ci-observer-overhead` is not queued or
reallocated. Its remaining outcomes are the delivered
[completion operation](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion)
and queued [CI/delivery story](#script-driven-ci-observation).

Terry's 2026-09-22 Pygardon report described repeated observer setup and handle
transcription, early provisional coverage notifications, and a separate closure
observer cycle. No raw transcript established the repeated-setup cause. The
full investigation is retained in Git at `1352844` and linked findings
[ODF-069](../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results).
Later source review corrected the claimed production readiness command: it was
a test substitute. Current story scope below replaces the earlier idle-expiry
and ref-watching proposals; do not implement those historical mechanisms.

<a id="script-driven-ci-observation"></a>

### Publish execution increments with automatic CI observation

**Identity:** SEED-008#script-driven-ci-observation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"9239143b63c468cdeff76f2fe96856bd52dc8e88f756f995a5785b8239372b64"}}
```

**Status:** Existing identity retained; merged with the proposed execution-
publication candidate on 2026-09-23. Second in the queue; refinement and planning
pending.

**Goal:** A developer's agent delivers each validated execution increment or
authorized repair through one operation and receives actionable CI results,
without separate probe/start/register commands or manually retained mailbox
handles. Remote publication, deferred local refresh, and CI coverage stay honest.

**Scope candidate:** Extend the startup story's real shared publisher to ordinary
execution delivery in both modes. At the first applicable managed publication,
start or reuse the existing scoped observer and attach the exact accepted revision;
later publications reuse it. Keep the matching handle and recovery in the existing
CI owner. Preserve target destinations, candidate validation, published history,
and the already-Taken CI completion contract. One agent invocation supplies
publication intent; Git reconciliation and CI attachment are internal steps.

**Key examples / evaluation:**

- First validated increment → one publication operation → accepted remote SHA
  is attached to matching observation without agent setup/registration commands.
  Later increments reuse that owner; a delayed failure reaches the correct task.
- Remote advances → reconciliation changes the candidate → obtain applicable
  validation before pushing → register the accepted revision, never the old SHA.
- Publication succeeds but observation attachment fails → preserve the accepted
  receipt, report lost coverage, and recover observation without another push.
- Interruption → recover the matching workspace/target/observer context → no
  duplicate ownership, lost applicable failure, or manual handle transcription.

**Attribution and simplification:** The earlier hook proposal inferred a push
from tracking-ref movement, which fetch/fast-forward can also cause. Terry had
accepted possible fresh-base attribution as useful. That tolerance does not
require a second attribution path: managed publication now supplies its exact
receipt directly. Arbitrary raw/manual pushes are outside automatic attachment
in this story; retain explicit existing observation options for them. Do not
build ref watchers or intercept shell commands to pretend otherwise.

**Boundary:** No invisible host startup, new observer daemon, general execution
registry, provider expansion, automatic semantic repair, or new completion policy.
CI starts lazily at the first applicable managed publication; no idle observer
is needed during preparation. Existing claim-target CI policy remains effective;
claim acceptance does not imply coverage by a story-branch observer. Preparation
and closure adoption remain separate callers with their own authority/targets.

**Depends on:** [Startup publication](../../src/skills/dough-execute-plan/SKILL.md#take-queued-work) supplies
the production boundary. Delivered
[CI completion](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion)
supplies bounded completion/shutdown. Neither a new readiness framework nor
checkout coordination is required.

**Safe stopping point:** Ordinary execution and repairs have one publication/
observation path with less agent bookkeeping. Preparation and closure may still
use existing setup until their migrations. The agent still receives truthful
completion evidence; the goal is no routine observer management, not hidden gaps.

**Retrospective response (2026-09-23):** Reuse this queued story for
[ODF-069](../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results),
[ODF-073](../../docs/maintainer/finding-names.md#odf-073--ci-observation-starts-after-the-first-publication),
[ODF-085](../../docs/maintainer/finding-names.md#odf-085--a-missing-host-skill-path-hides-an-available-checkout-runtime), and
[ODF-089](../../docs/maintainer/finding-names.md#odf-089--ended-observers-still-accept-ordinary-push-receipts).
Within the existing attachment/recovery scope, evaluate a missing host alias
with usable same-checkout runtime, an observer already ended after errors,
and delayed discovery of the accepted revision. Do not count registration as
active coverage or widen listing limits on an unverified causal assumption.
A remaining undiscovered revision stays explicitly unproved. On completion,
record the actual response, implementation locator, containing release (or
explicitly pending), and any unaddressed boundary on every supporting finding.
These are linked evaluation inputs; refinement and planning remain pending.

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
