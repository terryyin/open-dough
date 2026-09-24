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
{"schemaVersion":1,"refinement":"refined","approach":"unselected","assessment":"not-ready","reasons":["Execution approach remains unselected; confirm Claude access when resuming."],"basis":{"document":"04beda7ca5fbbc6edd8fadafd240a82c1fc49a8d0f807d7dfffdd9a7ce2ffdef"}}
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
passed. Consult accepted judgments and candidate/runtime identities from commit
`820077c3e7fcf16421c97231eb5bc01bb69ea3dc`, directory
`.planning/quick/082-accept-queued-start-native/` (start with `PLAN.md`). The
startup product candidate was `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`;
the delivered change strengthens refusal assessment by checking setup and
command markers separately. Reassess applicability to the intended
candidate and rerun only requirements invalidated by relevant changes.

**Why still queued:** The Claude CLI weekly limit prevented fresh execution;
quota refusal proves no startup behavior. The reported reset was 19:00
Asia/Singapore on 2026-09-23; verify availability when work resumes rather than
assuming the old limit remains. Do not poll quotas or retry without changed
access or a diagnosed cause.

**Evaluation:** Run the existing native journey from a prepared owned checkout:

```sh
GIT_PUBLICATION_KEEP=1 PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native claude --case publication/startup-resume --results-dir <temporary-results-directory>
```

Use Bash 4+ and the runner's 900-second deadline with 15-second termination
grace. Inspect the complete native trace and independent remote Git history:
current owned Taken, retained ancestry, exactly one claim, resumed receipt
before setup/command and first edit, and unchanged human/source bytes. The
pre-created claim is a resume precondition, not proof of initial publication.
Judge the attempt, record its acceptance result or remaining requirement, and
remove spent results and retained fixtures under ADR 0005.

**Completion:** A passing Claude resume observation plus a justified final
candidate reconciliation of all previously accepted host requirements under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). Preserve
truthful missing-proof judgments. Route real product defects to a bounded
correction; do not silently absorb them here.

**Boundary:** No new startup behavior, dashboard work, host integration repair,
CI automation, release, or broad harness cleanup. Use existing runner/fixtures;
change assessment only for a concrete gap. Do not repeat a full host/scenario
matrix or count exit status, self-report, or another host's pass as acceptance.

<a id="accept-execution-ci-native-behavior"></a>

### Accept execution increment CI observation in native hosts

**Identity:** SEED-008#accept-execution-ci-native-behavior
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected","assessment":"not-ready","reasons":["Execution approach and focused native cases remain to be selected."],"basis":{"document":"04beda7ca5fbbc6edd8fadafd240a82c1fc49a8d0f807d7dfffdd9a7ce2ffdef"}}
```

**Goal:** Before the managed delivery and CI observation behavior in
`dough-execute-plan` is released, a maintainer can judge that the installed
delivery entry point and host bridge produce the intended automatic observation,
exact-revision attachment, and truthful coverage gap reporting across Codex,
Cursor, and Claude Code. This is native acceptance under ADR 0005, distinct from
deterministic tests.

**Remaining scope:**
- Fresh ordinary journey verifying that managed execution delivery establishes
  or reuses CI observation and attaches the accepted SHA without manual
  observer probe/start or register-push commands.
- Verify Codex yielded stream and Cursor/Claude PostToolUse hooks.
- On Claude Code, verify missing-alias fallback (`.agents` runtime resolved
  when `.claude/skills` is absent) and ended-observer handling (ended observer
  reports explicit unobserved gap, never active attachment).
- Verify delayed failure delivery reaches the coordinator at the next safe boundary.

**Implementation basis:** Functional implementation and deterministic verification
are complete (all 3 slices + repair 4 pass 63 tests, payload update passes).
Implementation locators and judgments are recoverable from
`463c48a:.planning/quick/083-publish-execution-ci/PLAN.md`.

**Evaluation:** Run the existing native journey from a prepared owned checkout:

```sh
GIT_PUBLICATION_KEEP=1 PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native HOST --case CASE --results-dir <temporary-results-directory>
```

Inspect native traces, independent remote Git history, and coordinator context
for automatic attachment, exact registered SHA, and absence of manual setup or
handle bookkeeping.
Judge each attempt, record its acceptance result or remaining requirement, and
remove spent results and retained fixtures under ADR 0005.

**Completion:** Passing native observations or justified reusable proof per host
under [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
Truthful missing-proof or quota limits remain pending. Route real defects to
bounded corrections.

**Boundary:** No new publication mechanics, daemon, or changed completion policy.

## Publication delivery boundaries

**Parent problem:** Developers executing concurrent work need reliable shared
claims and delivery with less routine agent coordination. Preserve authority,
user work, and truthful remote/CI evidence while reducing total instructions.

**Reviewed decomposition (2026-09-23):** The installed startup operation;
ordinary execution publication plus CI attachment delivered in
[execution publication](#accept-execution-ci-native-behavior); preparation
keep; and closure. The previous separate execution-increment candidate
duplicated the CI story's publication boundary and was absorbed there. On
2026-09-24 the maintainer combined preparation keep and closure adoption into
[Dough Keep](SEED-026-dough-keep.md#keep-reviewed-worktree-changes). No separate
library, command-framework, or testing-only story is required.

**Alternatives and limits:** Another instruction-only reminder repeats a rule
already installed during the incident. The startup and execution-publication
outcomes remain distinct from the combined Dough Keep outcome. Each includes only
the runtime, concise guidance, payload delivery, and proof its outcome needs.

**Effort hypothesis:** No project S/M/L definitions were found. Startup carries
the greatest initial runtime/native-adoption uncertainty. The combined CI/delivery
story adds candidate revalidation and existing-observer attachment, not a new
observer lifecycle. Dough Keep must preserve preparation's narrower authority and
closure's published-history and cleanup concerns. Estimates remain unassigned
pending planning evidence.

<a id="publish-execution-increments-through-shared-operation"></a>

### Execution-increment candidate absorbed into CI delivery

The proposed identity `SEED-008#publish-execution-increments-through-shared-operation`
was never queued. Its outcome is now owned by
[SEED-008#accept-execution-ci-native-behavior](#accept-execution-ci-native-behavior), avoiding
two stories that each wire the same publication boundary. This is a retired
navigation reference, not another candidate or a claim of delivered behavior.

<a id="publish-preparation-through-shared-operation"></a>

### Keep prepared stories and plans through the shared publication operation

**Identity:** SEED-008#publish-preparation-through-shared-operation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"9239143b63c468cdeff76f2fe96856bd52dc8e88f756f995a5785b8239372b64"}}
```

**Status:** Absorbed on 2026-09-24 into
[Dough Keep](SEED-026-dough-keep.md#keep-reviewed-worktree-changes) before execution.
This section retains the original preparation outcome for traceability; it is
not a separate queued story.

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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Story refinement and execution approach selection remain."],"basis":{"document":"04beda7ca5fbbc6edd8fadafd240a82c1fc49a8d0f807d7dfffdd9a7ce2ffdef"}}
```

**Status:** Absorbed on 2026-09-24 into
[Dough Keep](SEED-026-dough-keep.md#keep-reviewed-worktree-changes) before execution.
This section retains the original closure outcome for traceability; it is
not a separate queued story.

**For / why:** A developer finishing a story gets the intended closure on its
authorized remote target, with truthful CI evidence and safe cleanup, without
another agent-managed publication sequence.

**Scope candidate:** Adopt the publisher for closure and authorized integration
of already-published Story Branch history. Preserve human-owned publication
restrictions, semantic backlog completion, published history, actual target
attribution, and the existing completion/cleanup conditions. Consume the delivered
shared CI completion operation; do not add a second observer shutdown policy.
Preserve process findings and their unresolved judgments through closure.

**Evaluation:** Story Branch closure integrates published history on trunk →
receipt names the accepted trunk revision → matching CI completion and observer
shutdown precede resource removal. A rejected publication or unconfirmed shutdown
preserves recovery resources; earlier branch success does not cover trunk.
Successful cleanup removes spent story history while retaining process findings
and active follow-ups.

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
- Preparation keep and closure adoption are now one
  [Dough Keep story](SEED-026-dough-keep.md#keep-reviewed-worktree-changes), placed
  first at the maintainer's direction on 2026-09-24. Their prior positions no
  longer describe the active queue.
- Local coordination remains below remote work, matching the existing direction.
  The Claude background story consumes the common contracts and owns only the
  remaining host-specific restriction/handoff outcome. Neither warrants a second
  publication or observation implementation.
- Planning-format validation and existing process follow-ups retain their relative
  order below this cluster. They are not prerequisites for publication.

If reducing investment, retain the first story's complete claim guarantee and
reassess further simplification against actual native use;
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
and queued [native acceptance story](#accept-execution-ci-native-behavior).

Terry's 2026-09-22 Pygardon report described repeated observer setup and handle
transcription, early provisional coverage notifications, and a separate closure
observer cycle. No raw transcript established the repeated-setup cause. The
full investigation is retained in Git at `1352844` and linked findings
[ODF-069](../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results).
Later source review corrected the claimed production readiness command: it was
a test substitute. Current story scope replaces the earlier idle-expiry
and ref-watching proposals; do not implement those historical mechanisms.

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
