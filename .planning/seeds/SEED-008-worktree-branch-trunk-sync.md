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
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Complete the remaining Claude Code resume verification so the maintainer
can accept queued-start publication across all three native hosts before release.

**Status:** Returned to the backlog at Terry's request on 2026-09-23. Plan 82's
execution is closed; this acceptance story is not complete. The remaining work
needs a newly selected execution approach when Claude access is available.

**Remaining scope:** One fresh Claude Code `publication/startup-resume` journey.
An owned claim already exists and another writer has advanced remote trunk:
Claude must confirm current ownership without another Take or redundant claim
push, then run setup and the first implementation change. Preserve selected
source and unrelated staged, tracked, and untracked human work. The fixture's
first change is sufficient; full feature delivery is outside this acceptance.

**Accepted evidence to reuse:** Ordinary startup and refused continuation have
accepted observations on Codex, Cursor, and Claude; Codex and Cursor resume also
passed. Recover the complete judgments, exact commands, native traces, runtime
identities, and independent Git inspections from commit
`820077c3e7fcf16421c97231eb5bc01bb69ea3dc`, directory
`.planning/quick/082-accept-queued-start-native/` (start with `PLAN.md`). The
startup product candidate was `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`;
the delivered change strengthens refusal assessment by checking setup and
command markers separately. This Git locator preserves needed acceptance
provenance, not a second active plan. Reassess applicability to the intended
candidate and rerun only requirements invalidated by relevant changes.

**Why still queued:** The Claude CLI weekly limit prevented fresh execution;
quota refusal proves no startup behavior. The reported reset was 19:00
Asia/Singapore on 2026-09-23; verify availability when work resumes rather than
assuming the old limit remains. Do not poll quotas or retry without changed
access or a diagnosed cause.

**Evaluation:** Run the existing native journey from a prepared owned checkout:

```sh
GIT_PUBLICATION_KEEP=1 PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native claude --case publication/startup-resume --results-dir <active-plan-evidence-directory>
```

Use Bash 4+ and the runner's 900-second deadline with 15-second termination
grace. Inspect the complete native trace and independent remote Git history:
current owned Taken, retained ancestry, exactly one claim, resumed receipt
before setup/command and first edit, and unchanged human/source bytes. The
pre-created claim is a resume precondition, not proof of initial publication.
Retain original evidence and runtime/candidate identity until assessment.

**Completion:** A passing Claude resume observation plus a justified final
candidate reconciliation of all previously accepted host requirements under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). Preserve
truthful missing-proof judgments. Route real product defects to a bounded
correction; do not silently absorb them here.

**Boundary:** No new startup behavior, dashboard work, host integration repair,
CI automation, release, or broad harness cleanup. Use existing runner/fixtures;
change assessment only for a concrete gap. Do not repeat a full host/scenario
matrix or count exit status, self-report, or another host's pass as acceptance.

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
attribution, and the existing completion/cleanup conditions. Consume the delivered
shared CI completion operation; do not add a second observer shutdown policy.

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

- Startup addressed the reproduced claim-visibility failure; its remaining native
  acceptance stays ahead of CI/delivery in the current queue.
- Terry retained CI/delivery's current priority on 2026-09-23 after comparing
  execution reliability with dashboard visibility and delivery-proof acceptance.
  Its benefit is reliable feedback at frequent publication boundaries, not a
  prerequisite for those other stories. CI completion is already delivered.
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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/083-publish-execution-ci/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0f431f79ba2abd6ef2758afef89d2ef6452954cb14b9025a79dee86ee0048a77","plan":"dbd867056be88696c1067a46f7550903e03a8b828f65131bd2477be0742db6f3"}}
```

**Status:** Refined with Terry on 2026-09-23. Existing identity and current
backlog priority retained. Execution planning is authorized; implementation is
not. The product backlog remains the sole ordering authority.

**Goal:** A developer can rely on each managed execution publication either
having observation attached to its exact accepted revision, with applicable CI
failures delivered to the owning execution, or having an explicit, actionable
coverage gap. Reduce routine agent setup and handle bookkeeping without hiding
uncertainty or waiting after every increment.

**Why now:** Reliable feedback supports frequent remote publication by parallel
agents. Recorded runtime-resolution misses and registration against ended
observers show concrete gaps; they do not establish that all historical failures
persist on today's candidate. Terry retained the current priority after comparing
this outcome with dashboard visibility and delivery-proof acceptance. Neither
of those stories depends on this migration. Command-count or token savings are
not acceptance claims.

**Alternatives:** Existing publication and manual observer setup remain usable.
Targeted runtime-discovery and ended-observer fixes alone would remove some risk,
but leave the routine publication-to-observation handoff with the agent. The
selected outcome connects that handoff using existing owners. Another prose
reminder alone does not remove the demonstrated opportunity for omission.

**Scope:** Ordinary validated execution increments and already-authorized repairs
in both existing execution modes use the shared publication mechanics and existing
CI observer/host adapters. Establish or reuse observation at the first applicable
managed publication; attach the accepted revision and retain matching execution,
checkout, repository, and target context with the existing CI owner. Later
publications reuse that owner. Resolve usable same-checkout runtime even when a
host-specific alias is absent. Registration alone never establishes active
coverage; ended or unavailable observation must produce an actionable gap.

Reliable feedback and no manual handle transcription are the promise, not a
literal single shell command. Necessary host notification binding may remain;
remove separate routine agent probe/start/register decisions from managed delivery.
No notification promise exists without a verified host bridge. Lazy setup belongs
at the publication boundary, before the first push it must cover where available;
attachment uses the exact receipt after remote acceptance.

**Preserved constraints and decisions:**

- Preserve existing publication authority, mode destinations, checkout ownership,
  published history, and semantic backlog reconciliation. An invocation does not
  authorize a push or repair. Local-only work stays local.
- A reconciled candidate whose proof is no longer applicable returns for validation
  before publication. A clean rebase is not behavioral proof. Preserve bounded
  race recovery rather than retrying indefinitely.
- Remote acceptance, local refresh, and CI coverage are separate facts. An unavailable
  observer may leave publication accepted with a reported gap under existing policy;
  no new pre-publication CI availability gate is introduced.
- Recover observation after accepted publication without another push. Recover only
  unambiguously matching ownership and retain unread failures. Ended observation
  does not become active by accepting another receipt. Follow existing lifecycle
  eligibility for rearming; otherwise report the gap and next action. Do not
  silently restart a terminal finished observer or adopt a guessed newest mailbox.
- Preserve the delivered bounded completion/shutdown operation and existing repair
  ownership. No wait after ordinary or repair publication. Missing discovery stays
  pending/unproved; later discovered applicable failures still reach their owner.
- Keep existing claim-target CI policy. A Story Branch claim on trunk is not covered
  by an execution-branch observer merely because both belong to one story.

**Key examples:**

1. No observer exists; an authorized validated increment is ready → managed
   publication → the exact accepted target/revision is attached to observation,
   or accepted publication explicitly reports missing coverage. With a usable
   bridge, a later failure reaches the owning execution without manual registration.
   A second increment or authorized repair reuses that same matching live owner.
2. The host alias is absent but the execution checkout contains the usable runtime
   → first managed delivery → resolve that runtime and establish observation without
   copying another checkout's installation or declaring coverage unavailable solely
   from the missing alias.
3. Another writer advances the target → reconciliation changes the candidate →
   require applicable validation before pushing; attach only the accepted result,
   never the old SHA or the other writer's revision. Preserve published history and
   unrelated staged, tracked, and untracked work; report deferred local refresh.
4. Remote accepts the increment but CI attachment fails, or the response is lost
   → resume from remote evidence and matching execution context → retain acceptance
   and repair only the missing observation obligation, without duplicate publication.
5. An observer ended after errors, or recovered ownership is ambiguous → a new
   publication/attachment attempt → explicitly report unavailable coverage and the
   supported recovery action; neither a writable mailbox nor an old handle proves
   active observation. Preserve existing failed/unread evidence.
6. An accepted revision is initially undiscovered → observation continues → deliver
   its later failure once to its owner. Another execution's failure stays separate;
   a revision never discovered remains explicitly unproved at existing completion.

**Deferred promises:** No arbitrary raw/manual-push attachment or interception,
new providers, daemon, execution registry, automatic semantic repair, dashboard CI
presentation, checkout locking, preparation/closure caller migration, or changed
completion policy. Keep explicit existing observation options for manual pushes.
Do not promise universal discovery under arbitrary branch traffic or widen listing
limits without diagnosis. Naturally supported cases need no artificial rejection.

**Dependencies and safe stopping point:** Delivered startup supplies production Git
mechanics and delivered CI completion supplies bounded wait/shutdown. Native startup
acceptance remains a separate queued story, not evidence of a missing publisher.
Ordinary execution and repairs gain reliable attachment or explicit gaps while
preparation and closure retain their existing procedures. No readiness-framework
or local-coordination prerequisite is added.

**Retrospective response:** Evaluate
[ODF-069](../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results),
[ODF-073](../../docs/maintainer/finding-names.md#odf-073--ci-observation-starts-after-the-first-publication),
[ODF-085](../../docs/maintainer/finding-names.md#odf-085--a-missing-host-skill-path-hides-an-available-checkout-runtime), and
[ODF-089](../../docs/maintainer/finding-names.md#odf-089--ended-observers-still-accept-ordinary-push-receipts)
as distinct mechanisms. ODF-069's remaining suspected bounded-listing cause is not
promised repaired here; prove preserved late delivery and truthful gaps. On actual
completion, record response, implementation locator, containing release or pending
release, and remaining boundaries on each supporting finding. Refinement resolves
none of those findings by itself.

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
