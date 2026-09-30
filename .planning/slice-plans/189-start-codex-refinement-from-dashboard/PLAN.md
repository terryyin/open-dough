# Start Codex refinement from the dashboard

## Source and authority

- **Identity:** SEED-052#start-codex-refinement-from-dashboard
- **Source:** [refined first story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#start-codex-refinement-from-dashboard).
- **Authority:** Terry's 2026-09-30 request for slice planning and necessary plan
  refinement. No implementation, Take, release, installation update or landing
  is authorized by this plan.
- **Preparation:** Existing owned workspace
  `.worktrees/split-codex-dashboard-stories`, branch
  `codex/split-codex-dashboard-stories`. Continue its existing preparation
  assignment for the original Codex identity while the split remains a draft.

## Goal, boundaries and assumptions

From the dashboard, choose Codex and start refinement of a selected story;
continue that same native conversation in the ordinary CLI, answer a question
or configured approval, and review its useful draft in the recorded workspace.
Keep enough evidence to return after a reload or server restart, resume a kept
preparation after failure, and recover an uncertain first instruction without
blindly creating another conversation.

Refinement is the first acceptance example, not a workflow restriction. Use
the shared dialog, workflow table and launch/start owners. Do not add a
`workflow === refinement` tool-admission rule, a second launch flow, a Codex
options grammar or a separate machine session registry. Extend another workflow
naturally when the same integration handles it; its full proof remains with
the [remaining Codex story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#use-codex-from-dashboard).

Deferred promises are live state/attention/alerts, embedded terminal/reconnect,
done/reopen, external-session discovery, other workflows' acceptance, model
selection, authentication/install UI and desktop-app linkage. A capability that
the selected native integration already delivers simply may be exposed; a
deferred promise is not grounds to reject an otherwise supported launch.
Closing a browser page must not stop refinement. Native runtime termination
need not automatically resume an in-flight turn; the saved conversation and
workspace still need recovery information.

Assume a configured project, authenticated native Codex and the developer's
existing model/permission settings. Do not override approvals, sandbox/trust,
model or authentication to make a check pass. Native approval coverage uses the
configured policy where it actually asks for approval; record policy and
observed behavior rather than inventing an approval under a policy that permits
the operation.

## Upfront design and PFE decisions

Follow the existing North Star topics
[Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
and [A start establishes claim and workspace before the session](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session).
One public host-facing module per delivered host owns native details; common
orchestration imports that boundary. Existing Claude helpers may remain private
behind its module. No speculative host/plugin framework is needed. The native
CLI's own daemon, if selected by slice 1, is native runtime infrastructure, not
a new dashboard daemon or database. No North Star change is warranted now.

| Responsibility | Retain/change the existing owner | Native boundary |
| --- | --- | --- |
| Workflow meaning and start | `src/agentLaunch.ts` workflow table; `server/startWorkflows.ts`, `startLaunch.ts`, `preparationStart.ts`, `executionStart.ts` | Host supplies installed skill location and invocation spelling; the installed script/formatter still owns preparation and its handoff |
| Workspace | Generalize the pure layout now in `claudeWorkspace.ts`, used by `startLaunch.ts` and `startGit.ts` | Common `.worktrees/<slug>` collision rule; host branch prefix (`codex/` or existing `claude/`); never a native tool's managed worktree layout |
| Options | `server/launchOptions.ts`, shared `commandOptions.ts`, existing dialog | Read the selected host's project installation; key offers/capabilities by source + host + workflow; reread on host change and validate again at admission |
| Launch lifetime | `AgentLaunches` and its existing progress/gating | Host starts and confirms native input, supplies identity and continuation; the browser does not own the process |
| Operational evidence | `launchRecordStore.ts`, `startStore.ts`, existing atomic machine JSON helper | Persist opaque native identity and native endpoint only when needed; host does not write another store |
| History and actions | Shared cards, Recent sessions and sidebar; admission, terminal and done/delete boundaries | Read only that record's host. Unsupported operations report their real capability; never invoke Claude for a Codex record |

The minimal host contract supplies installed skill paths, supported model
choices (Codex Default), native instruction construction, launch evidence and
continuation, and supported observations/operations. Add members only as these
examples consume them. Keep catalog admission, workflow selection, options
validation, workspace creation, assignment publication and persistence common.
Move the common `EstablishedLaunch` meaning out of the Claude module. Cursor
remains an undelivered host, with no invented implementation.

### Native transport decision and lifetime

App-server is the leading candidate, not a proven runtime choice. Slice 1 tries
the existing native daemon/connection first, then a dashboard-owned app-server
connection if needed. Choose one transport only after proving ordinary CLI
continuation and approvals while an initial turn is active. A retained
interactive CLI is the fallback comparison. Use `exec --json` only if it passes
the same journey; non-interactive completion alone is insufficient.

Record the chosen startup/continuation commands, supported runtime version,
identity field and process ownership in this plan before slice 2. With an
app-server, implement only the initialization/thread/turn and server-request
handling actually needed. Unhandled approvals must not silently time out or be
auto-approved. Prove whether CLI continuation shares the active runtime or
requires a safe handover. If it requires terminating the active turn, loses
context, or cannot expose a pending approval, stop and revise the transport.
Do not ship multiple speculative transports or hide a failed probe behind an
ID-only success message.

Detach of an HTTP/browser connection does not cancel the native turn. The local
server owns launch communication and observes later child/connection errors;
native runtime owns execution. Server shutdown follows the chosen native
connection's proved lifetime and leaves persisted recovery evidence. Do not
infer turn survival from process spawn, or story completion from native idle.

This follows Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
one domain model and useful increments rather than delivery-specific rules.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
govern the released-installation dependency; source presence does not make a
capability installed. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires native feasibility before dependent implementation and truthful
native acceptance before release. No Accepted ADR conflict or exception was
identified; Proposed ADRs 0008/0009 do not add constraints.

### Compatibility, identity and durable launch evidence

- Retain the existing machine store locations. Decode old Claude launch records
  without rewriting them into a different native identity. Missing host in old
  kept starts means Claude; new starts persist host and requested model context.
  Do not silently change host when retrying a retained assignment.
- Session identity is host + opaque native conversation ID. Preserve the actual
  ID for native commands; do not fabricate a Claude `shortId` for Codex, or
  substitute app-server `sessionId` for `thread.id` without probe evidence.
  One shared identity helper serves page keys/merging/focus, store updates and
  action lookup. Carry host in session action references; legacy requests
  without host retain their Claude meaning. Test identical IDs across hosts.
- Launch confirmation means the first instruction was accepted, not merely
  that a thread was created. In the existing launch store retain the identity
  as soon as the native boundary returns it, before first-turn submission;
  distinguish awaiting confirmation, confirmed and uncertain evidence. Old
  confirmed records decode as confirmed. These are launch facts, not story or
  live native state. The host waits for the common owner's durable write
  before submitting the first input; an unawaited notification is insufficient.
- Preserve a kept preparation until the durable launch record carries its
  established facts; uncertain records retain recovery facts. Store failures
  before submission prevent sending the first instruction and report the known
  conversation/recovery information. No second independent retry registry.
- Once an ID is known, retry inspects/resumes that same conversation. A lost
  acknowledgment is not proof that input was absent. Resubmit only on native
  evidence that it was not accepted; otherwise offer the CLI continuation and
  explain uncertainty. Do not invent native idempotency or resend merely on
  timeout. If creation outcome is unknown before an ID is returned, report
  uncertainty and require reconciliation instead of automatically creating
  another conversation.
- Generate the exact CLI continuation from native arguments and recorded
  workspace/endpoint, with correct quoting for display. Never execute a browser
  shell string. A Codex record without live observation says observation is
  unavailable, not that Codex no longer lists it. Keep origin authoritative for
  story stage; do not fabricate working/waiting/done states or emit alerts.

## Decisive premises observed during planning

Observations are from 2026-09-30 in the preparation workspace, based on
`7e3b212b..2b09d444` and the retained seed/backlog draft. No native conversation
or model turn was created during planning.

| Premise consumed by the plan | Literal observation and result | Consequence |
| --- | --- | --- |
| Shared start/options journeys actually run | `env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-preparation-kept.spec.ts dashboard/tests/agent-launch-options-exclusive.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts` exited 0 quietly after linking root dependencies into the owned workspace; the temporary link was then removed | Reuse their real local bare-origin preparation and page journeys; the earlier `vite ENOENT` was workspace setup failure, not product behavior |
| Preparation fixture establishes its own claim/workspace | Read `dashboard/tests/support/startOrigin.ts` and the start/kept specs: copies source into fixture `.claude/skills`, runs the real installed start command against local bare Git, inspects published profiles, CWD, handoff and retry count | Generalize this fixture's host root; it proves deterministic candidate behavior, not released native integration |
| Common callers still depend on Claude | `rg -n 'installedSkillPath|claudeWorkspace|branchPrefix|shownWorkspace|session\.sessionId|session\.shortId' dashboard scripts tests`; inspect `agentLaunches.ts`, admission, starts, `startGit.ts`, options, terminals/done, launch store and page consumers | Move native ownership and identity coherently. Branch collision scanning must stop assuming only `claude/`; display/store/action consumers need the same session reference |
| Host choice/options/model are not yet supported | Read `LaunchDialog.tsx`, `StartLaunch.tsx`, `agentLaunch.ts`, `agentLaunchAdmission.ts` and `launchOptions.ts`: no host picker; admission refuses non-Claude; offers keyed source/workflow; installed root `.claude`; model aliases are Claude's | Slice 3 changes the whole shared launch path, including host-specific options and default model semantics |
| Retained starts and uncertain launch identity need extension | Read `startStore.ts` (no host) and `AgentLaunches.launch` (record only after native confirmation); store schema validates the whole document | Use backward-compatible decoding, persist identity before submission, preserve retained host and distinguish launch evidence |
| Native API has discovery/identity/turn primitives | `codex --version` reported 0.157.0; `codex resume --help`, `codex app-server --help`, generated JSON schema and initialized stdio `skills/list` inspected: `.agents` refinement enabled, resume accepts native ID/remote/CWD, start/resume/turn operations exist | These observations do not settle active CLI continuation, approvals, handoff or native write; slice 1 owns paid/state-changing feasibility |
| Released installation does not yet supply the positive handoff/options case | `git tag --sort=-version:refname` gives v0.3.50; `git ls-tree -r --name-only v0.3.50 src/skills/dough-story-refinement` lacks established-preparation formatter/reference; `git show v0.3.50:src/skills/dough-story-refinement/references/refinement-options.json` lacks summaries. Installed `.agents` copy has the same capability gaps | Plain fallback can be probed now; full positive native acceptance needs a later released payload. Source copies must not masquerade as that installation |

The options correction completed in `2ffe539a` owns stale-selection wording,
unavailable-reason wording, pure-rule test cost and skill group wording. Reuse
its delivered contract in the current dialog/options code; do not duplicate or
reset its work. Host switching applies its same visible not-offered-selection
rule, rather than silently dropping flags. Recheck current callers/tests before
execution; the spent correction plan is recoverable from Git.

## Outside-in proof ownership

The existing high-level boundaries are the real dashboard page/HTTP server and
its shared start fixtures. A synthetic native process supplies vendor protocol
responses only; it must not prewrite launch records, prepare the worktree or
manufacture origin's assignment. Inspect the actual process arguments/RPC input
and persisted/published output. Test common option rules once, then differences
at the host/installation boundary. Use existing dashboard server/start-origin
support rather than a parallel harness.

| Source promise / example | Owning slice | Observable proof |
| --- | --- | --- |
| Native default settings; read/respond/approve in same conversation; useful write | 1 feasibility, 6 final acceptance | Real CLI conversation and worktree diff; approvals under the recorded native policy; native skill activation and resulting refinement are assessed separately |
| Old Claude records, starts and controls continue working | 2, 4 for starts | Load predecessor machine files; real Claude substitute boundary/start/terminal/done journeys stay green; no unreadable-store quarantine on a valid old document |
| Choose Codex in shared dialog; own installed options; no silent drop; ordinary fallback | 3 | Page chooses Codex; different `.agents`/`.claude` definitions; host change rereads offers; request/record/native input preserve skill, identity, options and optional prompt; invalid selection refused before native process |
| Confirm input and show exact continuation; durable history after page/server reload | 3 | Real launch endpoint writes record, page/server restart reads it, command names the exact native ID and workspace; mixed hosts with equal IDs remain distinct |
| Closing page does not cancel refinement; asynchronous failures are owned | 3, 6 native | Disconnect page/HTTP caller while substitute turn remains active; lifecycle owner observes later failure and retains recovery evidence; native final run closes/reopens page while turn waits |
| Codex Preparing, shared worktree and one established handoff | 4 | Real installed candidate script publishes one Codex profile, `.worktrees` path and `codex/` branch; native substitute receives formatter output once from the established workspace |
| Failed launch retry keeps host/model/assignment/workspace through reload | 4 | Fail first native launch after real preparation, restart server and Start again; one published assignment/workspace, retained Codex context, one successful instruction |
| Lost acknowledgment recovers same conversation without duplicate input | 5 | Native substitute creates ID then loses turn acknowledgment; persistent uncertain evidence survives restart; recovery reads/resumes same ID and creates/submits no duplicate |
| Honest state and actions; no artificial refinement restriction | 3, 5 | Cards/Recent/sidebar say observation unavailable; forged unsupported attach/done refused without Claude command; record deletion touches only selected host; shared host dispatch has no per-refinement eligibility branch |

Native requirements stay owned by the linked first story and slices 1/6; no
third product scope is introduced. If implementation ends with outstanding
native acceptance, ADR 0005 requires a linked acceptance story before that work
can close, with this table's pending requirements carried over explicitly.
Functional completion must not be reported as native acceptance. Complete
required native acceptance before releasing the affected behavior.

## Ordered slices

### 1. Prove a usable native Codex refinement conversation

- **Type:** Behavior (feasibility)
- **Status:** todo
- **Precondition/trigger:** Authenticated Codex with existing configuration in
  an isolated ordinary project/worktree; start the installed refinement skill
  using the candidate native transport. Use a bounded fixture story that needs
  one developer clarification; do not tell the agent the expected answer.
- **Result:** The first instruction is accepted, ordinary CLI continuation
  opens the same conversation, the developer can answer its question and any
  approval the configured policy requests, and the skill produces a real draft
  write in that workspace. Observe active-turn handover, native identity and
  connection lifetime. Plain refinement is sufficient to settle transport;
  new handoff/options proof awaits a released installation.
- **Work/proof:** Exercise the native interface and commands above, not direct
  model API or transcript replay. Record exact commands, native version/config,
  thread/continuation identity, decisive interaction and diff, and selected
  ownership/transport here. Bound the scenario to one conversation per viable
  candidate; investigate failure before trying an alternative. Stop dependent
  slices if none meets the usable-continuation contract. No product code or
  widened story outcome follows from a failed probe.
- **Safe stop:** A justified transport decision or concrete failed feasibility;
  no speculative integration has been committed.

### 2. Put native launch ownership behind the host boundary

- **Type:** Structure
- **Status:** todo
- **Change:** Expose the existing Claude native behavior through one public
  host-facing module; move shared launch facts out of Claude helpers. Introduce
  the minimal dispatch/identity contract slice 3 consumes, including host-aware
  installed path and session references. Align admission, machine reads,
  terminal/done/delete, stores and page identity consumers where they depend
  on this contract. Keep Claude runtime/instructions private and unchanged.
  Workspace/start generalization belongs with the later prepared behavior.
- **Enables:** Slice 3 launches and revisits a second host coherently, with no
  direct Claude dependency in common orchestration.
- **Unchanged behavior/proof:** Old Claude launch records decode from the same
  file, current launch/model/ad-hoc/options and attached terminal/done/deletion
  behavior stay unchanged. Run existing `agent-launch-boundary.spec.ts`,
  `agent-launch-records.spec.ts`, `agent-launch-session-listing.spec.ts`,
  `agent-launch-ad-hoc-boundary.spec.ts`, `agent-launch-model-boundary.spec.ts`,
  `agent-terminal-boundary.spec.ts`, `agent-terminal-lifetime.spec.ts`,
  `agent-launch-done.spec.ts` and `agent-launch-delete.spec.ts` with the dashboard
  Playwright command. Add only missing predecessor compatibility proof.
- **Safe stop:** Claude still works with the common boundary ready for Codex.

### 3. Start and revisit Codex through the shared launch dialog

- **Type:** Behavior
- **Status:** todo
- **Precondition/trigger:** A project without the new preparation capability;
  choose Codex in the existing refinement dialog and Start, then close/reopen
  the page or restart the dashboard.
- **Result:** Its own installed skill/options and optional instruction reach
  one native conversation with default configuration. The first instruction is
  accepted, the record survives reload/restart and shows a usable continuation
  command and recorded workspace. Claude and Codex histories coexist; Codex has
  honest observation/operation availability.
- **Work/proof:** Add the selected native integration, host choice, Default
  model behavior, host-aware offers/admission and instruction spelling. Persist
  ID before submission and acceptance afterward; show pending/uncertain
  recovery information without enabling blind retry. Extend the existing
  server fixture with a Codex substitute matching the observed protocol and a
  `agent-launch-codex.spec.ts` page/HTTP journey. Assert first-input content,
  no model/approval overrides, real record creation and server-restart reading.
  Use conflicting host options definitions to prove the right installation;
  test unavailable options with no selection and a rejected selected flag.
  Exercise equal native IDs in two hosts, all three shared presentations and
  one host-specific action lookup. Forged unsupported terminal/done requests
  invoke no Claude command. Preserve common record deletion semantics.
  Disconnect the caller while the substitute is active; then emit a background
  error and assert the named lifecycle owner retains recovery information and
  disposes the failed connection. Document the behavior in
  `dashboard/AGENT-LAUNCH.md` in this slice.
- **Safe stop:** Ordinary Codex refinement can start and be continued; new
  mechanical preparation remains capability-dependent, not host-forbidden.

### 4. Establish and resume Codex preparation in the shared workspace

- **Type:** Behavior
- **Status:** todo
- **Precondition/trigger:** The project's `.agents` installation supports the
  preparation script/formatter; choose Codex, options and Start. Native launch
  initially refuses; restart the dashboard, resolve the refusal and retry.
- **Result:** One published Preparing assignment names Codex; one shared-layout
  workspace on `codex/<slug>` supplies the native CWD and established handoff.
  The retained start preserves host/model, assignment, workspace and branch
  across restart. Retry resumes the same preparation; the successful session
  receives the handoff once instead of redoing mechanical setup. Its durable
  launch record carries the established facts before the kept start is removed.
  Host-less predecessor starts still mean Claude.
- **Work/proof:** Generalize common workspace/collision choice and start callers,
  pass retained/native host to the installed script, and read the host's
  formatter rather than duplicating its grammar. Extend common retained-start
  schema, capability reads and retry presentation with backward-compatible
  host/model context. Reuse the existing
  `agent-launch-preparation-kept.spec.ts` real-origin page journey with `.agents`
  installed candidate source and the Codex substitute. Assert profile host,
  assignment/workspace/native-call counts, branch, actual CWD, options and
  handoff through refusal/restart/retry. Extend the direct start spec only for
  observations that this journey cannot reach. Include predecessor start-file
  decoding and preserve slow/interrupted preparation recovery with
  `agent-launch-preparation-resume.spec.ts`. Run
  `agent-launch-preparation-start.spec.ts`, `agent-launch-preparation-kept.spec.ts`,
  `agent-launch-preparation-resume.spec.ts`, `agent-launch-start.spec.ts` and
  `agent-launch-start-resume.spec.ts`: execution and Claude refinement are
  consumers of the same changed workspace/start contract. Preserve slug
  collision coverage in the current `claude-workspace.spec.ts`, adapting its
  host-independent owner and covering `codex/` collisions. Source fixture
  copying is deterministic candidate proof only. Document recovery in the guide.
- **Safe stop:** Confirmed preparation and failure recovery both use one shared
  start model; no extra preparation or implicit host change occurs on retry.

### 5. Recover uncertain first input against the known conversation

- **Type:** Behavior
- **Status:** todo
- **Precondition/trigger:** Native creation returned an ID but the first-input
  acknowledgment is lost or the server disconnects; restart and recover.
- **Result:** Persistent evidence identifies the same conversation/workspace
  and accurately says acceptance is uncertain. Inspect/resume it before any
  retry; an already accepted first instruction is never duplicated. Unknown
  creation without an ID remains uncertain with reconciliation advice.
- **Work/proof:** Complete shared launch evidence transitions and host recovery
  using the selected native read/resume mechanism. Extend the Codex page/HTTP
  fixture: lose acknowledgment after accepting input, restart and recover;
  assert exactly one conversation and input. Contrast explicit refusal before
  acceptance with uncertainty, so the permitted retry is evidenced. Cover
  persistence failure before submission (no input sent, known ID explained)
  and interrupted runtime recovery information. Prepared evidence and plain
  fallback use the same recovery rule, not workflow-specific branches.
- **Safe stop:** History and recovery remain truthful at the first-turn boundary.

### 6. Accept the native dashboard-to-draft journey

- **Type:** Behavior (native acceptance)
- **Status:** todo
- **Precondition/trigger:** Delivered dashboard changes and a released target
  installation containing the preparation handoff and usable options; choose
  Codex and start an isolated queued story through the real dashboard.
- **Result/proof:** Preparing names Codex, the shown CLI command continues the
  exact native conversation, a real clarification/approval can be answered and
  a useful refinement draft appears in the established worktree without a
  second announcement. Close/reopen the page during the interaction and restart
  the dashboard after confirmation: continuation still identifies the same
  conversation. Inspect native input/interaction, published assignment and
  worktree diff; assess skill behavior separately from activation. Do not
  supply expected refinement prose in the prompt or accept exit 0/self-report.
- **Ownership/gate:** This first story owns this proof; record selected release,
  dashboard revision, native version/policy and result here. Use a normal
  released installation, never hand-sync managed copies. Missing release or
  failed native proof remains pending; a linked acceptance story is required
  if closing implementation separately under ADR 0005. No release is authorized
  by this slice plan.
- **Safe stop:** The complete first-story promise is evidenced; remaining Codex
  monitoring/workflow parity stays in its existing story.

## Verification, sizing and completion gates

Each deterministic slice runs its named focused proof via
`npx playwright test --config dashboard/playwright.config.ts <named specs>`.
Keep the project's quiet-run contract; in this environment remove conflicting
`NO_COLOR`/`FORCE_COLOR` variables as in the observed baseline. Resolve owned
workspace dependencies before running the server fixtures.

Run `npm run typecheck:dashboard` when shared request/session/host contracts
change, since both server and page consume them. After edits to common server
test support, run its affected launch/start/terminal/history journeys together
once: fixture changes can invalidate those consumers. Do not multiply pure
options-rule tests across hosts or require the unrelated installer/source
suite merely because it exists. CI still owns its configured checks after
publication; CI configuration alone adds no local gate.

When execution is authorized, use the installed
[execution delivery gates](../../../.agents/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change):
post-change refactoring with affected-boundary proof, selective formatting,
staged-change review and hook-owned lint before commit; own asynchronous CI
repair after authorized publication. Do not independently rerun hook-owned
lint. Planning now changes records only. Future source-guidance changes, if
evidenced necessary, use `src/skills` and AGENTS.md behavior review; they do not
authorize copying installed guidance.

No project numeric slice target/hard limit was supplied. Each boundary owns one
cohesive outcome/proof loop including implementation and cleanup; native waits
are bounded by the named scenario, not an invented timing exception. The main
effort risk is slice 1's runtime/continuation choice. If it reveals a broader
product requirement, return to the story rather than commission it here.

## Plan-refinement result

Applied slice-plan refinement in the same plan: consolidated draft slices 4
(preparation success) and 5 (kept-preparation retry) into current slice 4. The
existing start already owns establishment and resumption together; the real
failure/restart/retry journey proves both without a second host-specific rule
or a separate proof-only increment. Old slices 6/7 are now 5/6, with proof
mappings updated. Retained the other boundaries: native feasibility isolates
transport risk; Structure immediately enables second-host launch; ordinary
launch is useful before new preparation capability; uncertain native input
needs a different reconciliation proof from a known refusal.

Result: **6 slices**, no completed slice replaced, no numeric sizing exception,
and no story-resplit recommendation. Cumulatively this extends one launch/start
model with one native boundary. No remaining slice-boundary or speculative
framework concern was identified. The released-installation dependency was
subsequently satisfied as recorded below.

## Remaining concerns and readiness

Native transport remains deliberately probe-bounded; it is not already proven.
The release dependency was freshly reassessed on 2026-09-30 against `v0.3.51`
and the installed `.agents/skills/dough-story-refinement` copy on main. The tag's
installer declares `scripts/established-preparation.mjs`,
`references/established-preparation.md` and `references/refinement-options.json`.
All three installed files match the tagged bytes. Parsing the installed options
with the dashboard's `optionsDefinitionSchema` succeeds, including summaries;
calling the installed formatter with representative preparation facts produces
the expected workspace, agent and published-SHA handoff.

The previous released-installation blocker is satisfied. Record **ready** on
the reviewed current seed/plan digests: no blocking concern remains, and native
feasibility is bounded by slice 1 before dependent implementation. This is
planning readiness, not a claim that native acceptance or implementation passed.

All statuses are todo. No implementation or native acceptance is claimed.
