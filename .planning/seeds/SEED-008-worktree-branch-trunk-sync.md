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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/080-publish-startup-claims/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f5c66a71df129f71be02f51289688b27a4d18c25a118118ae327482062f11a37","plan":"6b8be90bf65befa307295d4d286d6738e24440b2f0a986a594070c326e25bf47"}}
```

**Status:** Refined on 2026-09-23; goal, scope, and key examples established.
Execution planning authorized; implementation is not authorized by this request.

**Plan:** [Start queued work with a confirmed remote Taken claim](../quick/080-publish-startup-claims/PLAN.md).

**Goal:** A developer starting concurrent stories in Trunk Mode or Story Branch
Mode sees each confirmed Taken claim on authoritative remote trunk before its
implementation starts. Startup uses the intended published story and plan.
Clean, safely available local main normally advances to freshly fetched trunk;
local maintenance may be deferred without invalidating remote acceptance.

**Incident:** On 2026-09-23 in Doughnut, `SEED-037#story-3` was committed as
Taken at `8face872f1` and published on its remote story branch while remote
`main` still listed it in Backlog list. A concurrent `SEED-036#story-1` claim
reached remote `main` at `dc29e4525a`, so the agents saw different shared queue
states. Implementation of SEED-037 had begun in a dirty worktree. Installed
guidance at the claim revision already required both modes to publish Taken
to remote trunk before implementation. The claim lacked the shared helper's
ownership trailer; the exact host or agent decision causing the bypass is
unconfirmed. The later repair at `e9ac74a8d9` is incident history, not this
story's completion. This recurs after the released response to
[ODF-066](../../docs/maintainer/finding-names.md#odf-066--unpublished-story-branch-claims-block-shared-integration).

**Accepted requirements (Terry, 2026-09-23):** Use a CLI boundary backed by shared
mechanics. Make one cohesive publication solution and reduce agent involvement.
Replace repeated instructions with clear, concise intent and result handling;
adding reminders or moving the same recipe to another file is insufficient.
Invest proportionately as models improve. Normal clean-local-main refresh is
accepted; preserving unrelated dirty work and safely deferring local refresh
are accepted. Automatic exclusive access remains separately owned.

**Scope for this first delivery:** One installed startup operation
covers source freshness, owned workspace establishment, backlog Take, remote
claim publication/recovery, and safe local-main refresh attempts at startup and
after acceptance. It returns the accepted claim and execution workspace before
implementation. Both modes use the same boundary. Keep the existing backlog
semantics and Git reconciliation where suitable; make actual native invocation
observable. Ordinary increments and CI attachment belong together in the existing
[CI/delivery story](#script-driven-ci-observation); preparation keep and closure
have later adoption stories. Their omission does not postpone a complete startup
outcome. Reuse the existing workspace contract; do not add general environment
setup, dependency installation, semantic readiness assessment, or host lifecycle
management to this operation.

**Entry and completion boundary:** Applies to authorized queued planned work
or an explicitly authorized queued planless story, in either supported mode.
Resolve actual remote/trunk names and existing caller/host workspace authority;
this story adds no new host mode. Startup success confirms the published claim
and source/workspace context. The existing project-command preparation gate still
runs before implementation; its failure leaves the accepted claim published.
Context-only work without a queue claim keeps its current path. Low-level local
Take remains a domain operation, never proof of remote acceptance.

**Freshness and local-main behavior:** Fetch remote trunk before startup. Use
its selected story section and active plan, checking for unpublished changes to
those sources in the originating checkout, including staged/unstaged edits and
local commits. Such changes stop startup before Take; do not silently execute
an older published source. Unrelated edits, including sibling-story edits in
the same seed, do not themselves block isolated execution from fetched trunk.
Failed fetch or failure to establish the owned execution source stops startup.
A clean, behind local main normally fast-forwards when safe access is established.
Dirty, busy, divergent, or ambiguously owned main stays intact, with explicit
deferred refresh. The observed fetched head is the freshness basis; equality
with a continually moving remote is not a permanent promise.

Check local source edits separately from published preparation readiness. Read
the latter from the fetched remote snapshot, not from a dirty originating seed.
A local sibling-story edit must not create a false selected-source conflict.
If the published readiness assessment itself is stale, preserve its existing
refusal and request renewed preparation; this story does not change readiness
hashing or silently mark work ready. Shared seed context needed to resolve the
selected identity/plan must also remain unambiguous.

**Key examples / evaluation:**

- Two authorized executions take different stories from one base, in different
  modes. Either publication order leaves both claims on remote trunk exactly
  once, before each respective implementation begins. A competing claim for
  the same story stops the losing execution.
- Behind local main has unrelated staged work → startup uses fetched remote
  source in an owned worktree → claim reaches trunk and local work is untouched.
  An unpublished edit to the selected story or plan instead stops before Take.
- Clean, safely owned local main → startup and accepted claim publication each
  attempt refresh → main reaches the latest head observed by that attempt.
  Unclear access defers maintenance without rejecting an accepted claim.
- Remote advances between fetch and push → reconcile the owned candidate and
  recheck selected-source validity → accept on trunk or preserve a recoverable
  stop. No implementation starts on an unconfirmed claim.
- Push response is lost or the process exits after remote acceptance → resume
  verifies remote history and claim ownership → no duplicate claim and no
  confusion between accepted publication and unfinished local maintenance.
- The claim is accepted, then the existing project preparation command fails →
  keep the remote Taken entry and owned workspace → report the setup failure
  without starting implementation or treating it as an unpublished claim.
- A fresh native execution follows the installed concise instruction and
  invokes the operation. Remote history and local state independently establish
  success; a helper test alone does not prove the agent used the boundary.

**Boundary:** No new execution authority, branch-protection bypass, Story Branch
integration timing, automatic conflict judgment, generic test selection, or
background scheduler. Existing CI setup/coverage rules continue until the
[CI automation story](#script-driven-ci-observation) changes them. Automated
exclusive checkout access belongs to
[default-checkout coordination](#same-machine-merge-queue); lack of that facility
must not be represented as safe ownership.

**Architecture:** The proposed responsibilities, interfaces, recovery model,
existing-code assessment, and investment trade-offs are in
[Execution and publication with less agent coordination](../../docs/maintainer/execution-publication-design.md).
Accepted ADRs 0002, 0004, 0005, and 0006 constrain that proposal. ADR 0009 remains
Proposed. Preserve one authoritative source per behavior and remove obsolete
caller recipes as behavior moves into runtime.

**Evaluator / highest learning:** The developer can see remote Taken membership
before execution, preserved local work, and a shorter native startup trace.
The consequential assumption is that a small explicit operation reliably removes
the bypass seen despite existing prose, without imposing a larger agent protocol.

**Safe stopping point:** Both modes start from verified published source and
settle Taken remotely through the operation. This remains useful if every later
migration is cancelled. Local-main lag is explicit and recoverable.

**Refinement conclusion:** No unresolved product choice blocks planning.
Command spelling and module boundaries can be chosen within the reviewed design.
Source comparison, bounded race recovery, and truthful partial success are
implementation/proof obligations, not reasons to expand the story. No automatic
CI attachment, checkout lock, generalized readiness runner, or new publication
caller is included.

## Publication delivery boundaries

**Parent problem:** Developers executing concurrent work need reliable shared
claims and delivery with less routine agent coordination. Preserve authority,
user work, and truthful remote/CI evidence while reducing total instructions.

**Reviewed decomposition:** Startup above; ordinary execution publication plus
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
[startup](#settle-taken-claims-on-remote-trunk). It automates access to that
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
reallocated. Its remaining outcomes are the active
[completion story](#self-ending-ci-observer) and queued
[CI/delivery story](#script-driven-ci-observation).

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

**Depends on:** [Startup publication](#settle-taken-claims-on-remote-trunk) supplies
the production boundary. [CI completion](#self-ending-ci-observer), already Taken,
supplies bounded completion/shutdown. Neither a new readiness framework nor
checkout coordination is required.

**Safe stopping point:** Ordinary execution and repairs have one publication/
observation path with less agent bookkeeping. Preparation and closure may still
use existing setup until their migrations. The agent still receives truthful
completion evidence; the goal is no routine observer management, not hidden gaps.

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
