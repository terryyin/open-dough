---
id: SEED-052
status: active
planted: 2026-09-27
planted_during: Maintainer direction for dashboard-initiated agent work
trigger_when: Current smaller backlog items have been cleared and the next product direction is considered
scope: epic
---

# SEED-052: Start agent work from the Open Dough dashboard

## Why This Matters

For developers choosing work in the Open Dough dashboard, selecting a story
should lead directly to an appropriately instructed agent session, without
repeatedly transferring context and coordinating startup. Published story facts
remain authoritative in origin. Local launch and session facts make the
interaction usable without pretending that an intended change is already
published.

The maintainer interview on 2026-09-28 established two benefits: convenient
launch and interaction, and reduced AI usage and uncertainty for mechanical
setup. Launch can deliver value first using the agent's existing workflow;
scripted preparation can follow incrementally. Execution of an existing plan
comes first because it is less likely than refinement to need immediate answers.
This decomposition selects a future direction, not immediate implementation or
a change to global backlog priority.

## Alternatives and Decision

- **Continue starting work manually in the CLI:** remains supported and usable,
  but requires the developer to carry the selected story and workflow context
  out of the dashboard. It does not deliver the desired starting experience.
- **Provide a prompt to copy:** cheaper than session launch and a possible
  fallback, but still makes the developer open and initiate the session. The
  user explicitly selected actual background launch as the first useful result.
- **Launch and let the agent perform its existing setup:** selected first. It
  tests whether dashboard initiation is useful without first relocating the
  entire coordination workflow.
- **Prepare everything in the dashboard before launching:** remains a later
  direction where tool and workspace constraints allow it. Requiring it first
  delays useful launch and interaction unnecessarily.
- **Defer the epic:** compatible with the existing smaller-work priority. There
  is no deadline or instruction to start execution from this interview.

## Agreed Boundaries

- Claude Code CLI first; develop the experience substantially there before
  adding Codex and Cursor. No graphical-app integration is required.
- Each target project already has a usable local project folder and an installed,
  authenticated tool. Installation and authentication flows are outside the
  first stories. Resolving which configured folder belongs to the selected
  project is part of launch refinement.
- The launch dialog selects an applicable skill and tool, uses the configured
  default model, and permits an optional custom prompt, normally empty.
  Relevant unavailable actions have an explanation. Introduce actual launch
  choices as their stories deliver them; the first story needs only planned
  execution and Claude Code.
- The first launch delegates all existing setup, workspace selection, claiming,
  bookkeeping, publication, and execution to the agent's normal workflow.
  Direct IDE/CLI instructions retain that complete path after scripting grows.
- The dashboard creates the worktree for every tool, one layout under
  `<project folder>/.worktrees/`, rather than each tool's own worktree feature
  (decided 2026-09-30 after checking Codex and Cursor; see the
  [Architectural North Star](../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session)).
  A direct CLI start still has the agent create its own workspace.
- Initially launch and forget: report the dashboard's launch operation, then
  derive story progress from origin. No session monitoring, automatic question
  detection, or completion notification is required for that initial delivery.
  Story 3 adds a developer's explicit Mark as done, with its done-prefix name.
  Story 4 subsequently adds attention indicators from reported local session
  state; it does not establish story completion.
- Later embedded interaction exposes the ordinary CLI, opened manually.
  An embedded terminal (xterm.js was suggested) is the leading interaction
  direction, not a selected implementation dependency.
- Recent sessions initially include only dashboard-launched sessions. Preserve
  navigation independently of Backlog, Taken, and Recently done membership.
  A session may have no story in any of those views.
- Origin establishes published story outcomes. A stopped session or an absent
  story does not prove completion. If completion indicators are later added,
  criteria are workflow-specific: for example landed preparation or wrapped-up
  execution. Story Branch Mode's published branch evidence remains distinct
  from final integration on origin's trunk.

## Epic Reference

<a id="start-agent-work-from-dashboard"></a>

### Start agent work from the Open Dough dashboard

**Identity:** SEED-052#start-agent-work-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

The original identity remains a historical parent reference, covering the
child stories below. On 2026-09-28 the maintainer replaced its backlog
entry with these children at priorities 4–11, in their listed order. The parent
is no longer separately queued and is not redefined as the first child.

## Story Decomposition

The developer using the dashboard evaluates each story through its visible
journey. All effort bands remain unassigned: the repository supplies no S/M/L
definitions. Each story records its principal sizing uncertainty instead of
inventing a scale. These are candidates for refinement, not executable plans
or claims of readiness.

<a id="announce-record-deletion-first-time"></a>

### Announce a deleted session record to screen readers the first time

**Identity:** SEED-052#announce-record-deletion-first-time
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer using a screen reader hears "Session record
  deleted" after the first deletion in a page visit, not only after later ones.
- **Evaluation:** With a screen reader, open the dashboard, delete a session
  record whose state is unknown, and hear the status; the page keeps exactly
  one polite status region its keyboard and overview specs can rely on.
- **Boundary:** Applies to the status the delete announces today, which appears
  only after the first deletion and so may go unspoken. Routing it into the
  page's existing always-present polite region needs that region's state lifted
  and the single-region locators in `accessible-overview-keyboard.spec.ts` and
  `dashboard/tests/dashboardPage.ts` changed with it. Other announcements stay
  as they are.
- **Depends on:** None; the delete is delivered.
- **Capture:** Terry asked on 2026-09-30 to queue the follow-up recorded by the
  delete's execution retrospective.

<a id="split-session-entry-and-terminal-split"></a>

### Split the session entry and terminal split files along their operations

**Identity:** SEED-052#split-session-entry-and-terminal-split
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A maintainer changing session entries or the terminal panel
  works in files small enough to read whole, one concern each.
- **Evaluation:** `dashboard/src/SessionEntry.tsx` (about 300 lines) and
  `dashboard/src/TerminalSplit.tsx` (about 275 lines) each hold one clear
  concern after the change, with every dashboard spec passing unchanged and no
  behavior differing.
- **Boundary:** Structure only, along the seams the delete work exposed
  (Mark as done, Delete record, the shared status line, and the panel's session
  operations). No new behavior, wording or styling.
- **Depends on:** None.
- **Capture:** Terry asked on 2026-09-30 to queue the follow-up recorded by the
  delete's execution retrospective.

### Codex delivery in two increments

Terry selected this split on 2026-09-30: first start a real refinement session
with Codex, then complete the remaining established experience. Refinement is
the first delivery example, not a rule that the product must reject Codex for
other workflows. Shared behavior may deliver more without adding artificial
availability gates or a second dialog.

**Current baseline:** Refinement now has the same dashboard-owned workspace
direction as execution. Its installed preparation command announces Preparing,
hands the established preparation to the session, and retains a failed start
so the next Start can resume it. The refinement dialog offers the installed
command's composable/exclusive options. Startup gating, progress and retained
start storage are shared across workflows. Host selection, installed skill
paths, instruction spelling, session listing/state, terminal attachment and
done controls still assume Claude Code. The refinement-options correction was
completed in `2ffe539a`; use its delivered selection and wording behavior
without duplicating that work.

<a id="start-codex-refinement-from-dashboard"></a>

### Start Codex refinement from the dashboard

**Identity:** SEED-052#start-codex-refinement-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/189-start-codex-refinement-from-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"10cc067bda7d46601e9f4e32ebf5874422271802c922ed096b61dd0f2a2033d5","plan":"e47ed350840c7f00eb7bdd4c188adda7c6433a2e8ab199caa6b801d0db0039fe"}}
```

#### Goal

A developer who prefers Codex can start refinement of a selected story from the
same dashboard they use to choose work, then read and answer the agent in that
same conversation and review its resulting draft. This first adoption makes
refinement usable without carrying the story and startup instructions into a
new manually started session. It also establishes the first proven host boundary
for the remaining Codex experience.

#### Scope

- **Launch:** Select Codex in the existing refinement dialog with its configured
  default model; pass the selected story, refinement skill, supported options
  and optional instruction. Read and validate options from that project's
  Codex installation. Preserve the existing empty-options behavior. Use the
  developer's native authentication, model and permission settings; the
  dashboard adds no Codex model picker or permission override.
- **Preparation:** Where the installed skill supports it, establish Preparing
  and the workspace with the existing script, attribute the assignment to Codex,
  and hand its established preparation to the session once. Use the shared
  dashboard `.worktrees/` layout with a Codex branch name. Without that installed
  capability, the skill performs its ordinary startup in the project. Do not
  copy setup or publication rules into a new Codex flow.
- **Usable continuation:** Confirm that the first refinement instruction was
  accepted, retain the host's native conversation identity, and show an exact
  way to continue it in the ordinary Codex CLI, in its recorded workspace.
  The developer can read the initial response, answer a refinement question or
  a native approval request, and review the resulting seed draft. A bare ID or
  an empty conversation without the refinement instruction is insufficient.
  External CLI interaction is the minimum delivery promise; embedded interaction
  may satisfy it when straightforward. Automatic detection of questions is not
  needed for this journey.
- **History and recovery:** Retain the launch's tool, story, conversation and
  workspace in the existing machine-local session history through a page reload
  or dashboard-server restart. Preserve old Claude records. Retrying a failed
  session launch after preparation reuses the same workspace and assignment,
  with the retained host/model context. Once a native conversation was created,
  uncertainty is reconciled against that identity before retrying; do not
  create a second session blindly. Explain failed versus uncertain launches and
  give the known continuation/recovery information.
- **Honest presentation:** Keep the existing launch and session presentation,
  identifying Codex and its continuation action. A retained launch is not
  evidence that a session is working, a tool is waiting, or a story is complete.
  When live observation or an operation is unavailable, explain that capability
  accurately rather than sending Codex records to Claude's listing or controls.
  Closing the page does not cancel the launched refinement. Automatic recovery
  of an in-flight turn after its native runtime terminates is deferred; the
  saved conversation and workspace must remain recoverable.
- **Delivery boundaries:** Live session-state monitoring, attention/alerts,
  dashboard reconnect, done/reopen controls and the remaining workflow proofs
  stay with the remainder. If they fall out of the same proven integration
  simply, they can be delivered here. Refinement is a promised example, not a
  reason to reject Codex for another naturally supported workflow. No separate
  dialog, workflow-specific tool ban or duplicated launch path is required.
  Preserve Claude and direct CLI behavior. Installation/authentication flows,
  desktop-app integration and discovery of externally started sessions remain
  deferred.

#### Key examples

1. **Start and answer:** A queued story in a configured project with installed,
   authenticated Codex and the preparation-handoff capability → choose Codex,
   select refinement options and Start →
   the published Preparing assignment names Codex; one session receives the
   selected skill, story, flags, instruction and established preparation. Use
   the shown CLI continuation → read Codex's question, answer it in the same
   conversation and review a useful refinement draft in the same workspace.
2. **Come back later:** A confirmed Codex launch → reload the page or restart
   the dashboard → the same session entry still identifies the tool, story
   and workspace and gives the continuation information. It makes no live-state
   claim without an observation; origin alone decides the story's stage.
3. **Preparation succeeded, launch failed:** Preparing was published but Codex
   refused to launch → the dashboard names the failure and kept workspace →
   after resolving the reason, Start resumes that preparation with Codex; one
   assignment and workspace remain, with no second announcement. A retry does
   not silently substitute Claude for the retained Codex context.
4. **Launch acknowledgement lost:** Codex returned a conversation identity, but
   acceptance of the first instruction is uncertain → the dashboard gives the
   known identity/workspace and explains uncertainty → recovery checks that
   same conversation before sending again or creating another one. It never
   reports successful refinement merely because a thread was created.
5. **Installed capability differs:** A project has no preparation handoff or
   no usable options definition for Codex → plain refinement remains available
   under the established fallback rules; selected flags that the installed
   definition cannot honor are explained before launch. Neither a Claude
   options file nor a silent flag drop substitutes for the Codex definition.

#### Architecture: first host generalization, with full Codex support in view

This is feature design for discussion and later planning, not an ADR or an
executable plan. The whole-product intent is one dashboard launch/session model
serving multiple tools. Only the responsibilities needed for the journey above
are implemented in this story; look-ahead identifies ownership and consequential
risks without commissioning all later operations.

**Existing solutions to retain (PFE):** The shared workflow table, start-workflow
orchestration, installed preparation command and formatter already own workflow
meaning and startup. Project/catalog admission, progress, kept starts,
launch-record persistence and session navigation already own their respective
meanings. Extend these owners for a second host rather than adding a Codex
workspace/start store, option grammar, story-state reader or session registry.

| Responsibility | Common owner and native-tool boundary | First story / later support |
| --- | --- | --- |
| Workflow and preparation | Shared workflow selects the skill and applicable start script; a host supplies installed skill location and native invocation spelling. Scripts own assignment/publication. | Refinement/options/handoff now; execution and ad hoc reuse that separation later. |
| Workspace and retry | Dashboard chooses one layout; retained startup context preserves host, model, workspace and assignment. | Codex preparation retry now; older host-less kept starts retain their Claude meaning. A tool change is a deliberate recovery decision, not a second claim. |
| Native conversation | A host starts, identifies and continues its native conversation. The dashboard retains host plus an opaque continuation identity and workspace in its existing records. | Confirmed first instruction and CLI continuation now; embedded attach and reconnection later. Do not assume Claude's short ID or equate Codex thread ID with a session-tree root ID. |
| Runtime lifecycle | Native runtime owns conversation execution; the local dashboard boundary owns its connection and launch evidence. | Resolve browser-independent launch and native approvals now; later detach/reconnect/stop act on the same conversation/runtime. Persisted history and a running process are distinct facts. |
| State and controls | Native observations are translated at the host boundary; shared presentation reads honest capabilities and evidence. | No inferred live state now; later implement state, attention, alerts, done/reopen and deletion without forcing Codex into Claude's state vocabulary. An idle turn does not establish story completion. |
| Dialog and machine read | One dialog and record presentation select the host; installed options/capabilities are read for that project and host. Machine reads dispatch recorded sessions to their own host. | Two tools coexist now; later session operations extend this model, without rebuilding shared UI or querying all native conversations for discovery. |

**First design recommendation:** Establish one host-facing module per delivered
host, as the [Architectural North Star](../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
currently directs. Native commands/protocol, instruction spelling, installed
skill location, conversation identity and operation availability belong behind
that boundary. Common orchestration owns neither Claude commands nor Codex RPC
messages. Choose its smallest contract from the observed two-host journey in
slice planning. This recommendation does not resolve a different physical-file
organization or authorize changing the North Star; if the work needs that
change, surface it before implementing it. No plugin framework or speculative
Cursor implementation follows from adding Codex.

**Runtime options to compare before selecting the transport:**

- Codex app-server is the leading candidate because it provides structured
  thread identity, first-turn submission and a route toward native state and
  later interaction. Observe whether the shared native daemon/connection can
  provide the ordinary CLI continuation and approval handling the first story
  needs. A per-dashboard process is an alternative, but introduces runtime
  ownership and reconnect consequences that must be assessed, not hidden.
- Starting the ordinary interactive CLI in a retained terminal may give the
  narrow journey more directly. Assess stable identity, continuation, output
  and process lifetime with the same examples; retain it if it is simpler and
  compatible with the later native lifecycle.
- `codex exec --json` is a possible cheap launch mechanism, not the selected
  design. Its non-interactive initial run is insufficient evidence that normal
  questions and configured approvals are usable. It is viable only if the same
  conversation can be continued interactively without losing context or
  weakening permissions. Copying a prompt remains the existing workaround and
  does not deliver dashboard launch.

**Evidence and limits (2026-09-30):** Codex CLI 0.157.0 exposes `resume` with a
native conversation ID, project directory and remote app-server endpoint.
A local `codex app-server --listen stdio://` observation accepted initialization
and `skills/list` in this preparation workspace; it returned the enabled
`dough-story-refinement` skill from `.agents/skills/` with repository scope.
`codex app-server generate-json-schema` confirmed optional model/cwd settings,
required thread identity for resume/turn submission, and native states
`notLoaded`, `idle`, `systemError`, and `active` with flags. These are interface
and discovery observations, with no created threads or model turns; they prove
neither startup behavior nor a usable refinement conversation. The
[official app-server documentation](https://learn.chatgpt.com/docs/app-server)
describes thread/turn operations, skill input and approval requests. It supports
this direction but is not end-to-end native proof. Prior Codex queued-start
acceptance in [SEED-008](SEED-008-worktree-branch-trunk-sync.md#accept-queued-start-native-behavior)
is supporting evidence for shared startup only, not this new activation and
continuation mechanism.

The repository's installed `.agents/skills/dough-story-refinement` was found
by Codex, but it lacks the new established-preparation formatter/reference;
those are present in `src/skills/`. Its options definition also lacks the
`summary` fields the current dashboard schema requires. Discovery therefore
does not prove that this installation can consume mechanical preparation or
offer options. Detect capabilities from the target project's installed copy
and preserve the ordinary fallback. Positive native proof for the new handoff
and options needs an appropriately released installation; never hand-sync
managed copies to make that proof pass. The completed options correction
does not authorize changing those installed copies either.

Slice planning also checked the latest numeric release tag, `v0.3.50`: its
refinement payload lacks the established-preparation formatter/reference and
the options summaries required by the dashboard. This is a known external
dependency for the full positive native journey, not a reason to add a Codex
restriction or copy source files into a managed installation.

Dependency reassessed on 2026-09-30: release `v0.3.51` declares the formatter,
reference and options definition in its installer payload. The project's
installed Codex files match those tagged bytes; its options validate against
the dashboard schema and its installed formatter produces the expected
established-preparation handoff. The release dependency is satisfied. Native
runtime feasibility remains an early probe in the plan, not completed proof.

Follows Accepted [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)
for consistent domain concepts, [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for a coherent whole-product model and useful increments, and
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) for native
integration proof. No conflict with those decisions was found. ADR 0008/0009
remain Proposed and are not binding. No published skill change or ADR status
change is part of this refinement.

#### Inputs for slice planning and proof before dependent implementation

The [first-story slice plan](../slice-plans/189-start-codex-refinement-from-dashboard/PLAN.md)
maps these requirements to native feasibility, common host ownership, ordinary
launch/history, prepared launch/retry, uncertain-input recovery and final native
acceptance. The selected native transport remains gated by its first probe.

- Observe a representative native journey that accepts the first refinement
  instruction, exposes its response, lets the developer answer/approve in the
  same conversation, and uses the established workspace/handoff without
  duplicate preparation. Include a real write in the linked worktree under the
  developer's configured permissions. No model turn was run in this refinement.
  Planning may begin with a bounded feasibility probe; dependent implementation
  waits for its result. Separate native approval/question usability from native
  skill/handoff behavior so interface discovery cannot stand in for either.
- Select the native runtime/transport from that evidence, including connection
  lifetime, ordinary CLI continuation and pending approvals. If a cheap launch
  cannot make refinement usable, revisit the narrow boundary rather than hide
  the gap behind a successful-launch message.
- In slice planning, work out the minimum host contract, backward-compatible
  records and retained-host recovery, host-aware options/capability reading,
  and launch acknowledgement/retry proof. Map native acceptance ownership under
  ADR 0005 before implementation/release. Detailed operations, file moves,
  schema migrations and executable slices remain planning work.

**Effort hypothesis:** No S/M/L band is assigned because this project has none.
The first story is narrower than full parity, but a usable conversation and
preparation under configured permissions remain decisive uncertainties. The shared startup
and record owners are already present; runtime/continuation proof determines
whether the remaining first-story work stays modest.

**Depends on:** Delivered refinement launch/options and scripted preparation;
reuse the completed options correction without duplicating it.
No dependency on Cursor or completion of Codex monitoring.

**Safe stopping point:** Developers can initiate and continue real Codex
refinement, find its conversation later and review the draft, even if all later
Codex lifecycle work is cancelled. Claude remains usable and published story
facts remain authoritative. The seed's resulting draft and this refinement's
records keep their ordinary review/publication disposition.

<a id="use-codex-from-dashboard"></a>

### Complete Codex support for dashboard workflows and sessions

**Identity:** SEED-052#use-codex-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who prefers Codex can use the remaining dashboard
  launch, return and interaction experience established with Claude Code.
- **Evaluation:** Start the remaining established workflows with Codex and its
  configured default model, including execution and ad hoc sessions. Find each
  dashboard-launched session later, see its reported state and attention
  indicators/alerts, interact through the embedded CLI, close and reconnect to
  the same conversation, mark it done and reopen it. Existing record-deletion
  behavior remains available for unknown/unavailable sessions. Applicable
  scripted setup is consumed without duplication; direct CLI work stays usable.
- **Boundary:** Own every original Codex promise not delivered by the first
  story, including live state, embedded interaction/reconnect and session
  lifecycle controls. Reuse what the first story already proves; if shared code
  delivered execution or another capability there, verify and complete the
  remaining gaps rather than rebuilding it. Session state remains local
  evidence and never establishes story completion. No desktop-app connection,
  Codex model picker or non-dashboard session discovery.
- **Value / learning:** Completes useful Codex parity after the first real
  launch has resolved the initial integration assumptions.
- **Effort hypothesis:** Unestimated; principal uncertainty is native
  launch/attach continuity, state semantics and recovery. Assess those with
  first-story evidence before refining this remainder. The broader lifecycle
  carries more uncertainty than launch alone; no S/M/L band is assigned.
- **Workspace:** Reuse the first story's dashboard-created workspace and
  installed skill handling. Existing no-model trust observations do not prove
  a real refinement can write/commit in a linked worktree under the developer's
  Codex permissions; that remains native proof for the first story.
- **Architecture question:** The Architectural North Star calls for one module
  per host, while Claude's host responsibilities currently span multiple files.
  Resolve that organization when refining the first integration; do not treat
  this split as approval to change the direction or build a speculative host
  framework.
- **Depends on:** The first Codex refinement attempt and its retained evidence;
  no dependency on Cursor.
- **Safe stopping point:** Each delivered Codex capability remains usable,
  independently of Claude Code and Cursor. Undelivered lifecycle promises stay
  in this story rather than being silently dropped.

<a id="use-cursor-from-dashboard"></a>

### 8. Use Cursor for the established dashboard workflows

**Identity:** SEED-052#use-cursor-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who prefers Cursor can use the established dashboard
  workflows with its CLI and configured default model.
- **Evaluation:** Choose Cursor for a supported workflow, launch, find the session
  later, and interact through the embedded CLI with the correct project context
  and applicable preparation handoff.
- **Boundary:** Prove Cursor launch, persistence, attachment, and workspace behavior
  independently. Preserve direct CLI startup; no graphical-app integration.
- **Value / learning:** Completes the intended three-tool choice without claiming
  one tool's integration proves another's.
- **Effort hypothesis:** Unestimated; the same end-to-end feasibility question as
  Codex must be observed on Cursor before planning or further split.
- **Workspace:** The session starts in the dashboard's workspace with
  `cursor-agent --workspace <workspace>`, never `-w`. A worktree under the
  trusted project folder passed Cursor's trust gate without `--trust`, which
  interactive sessions do not accept (observed 2026-09-30, no model call).
  `.cursor/worktrees.json` setup does not run there; Open Dough's own
  checkout setup applies instead. Observe one real launch committing there
  (paid).
- **Known from launch:** The same Claude Code specifics as story 7 live in the
  browser, including its session-state vocabulary and the 15-second listing
  read.
- **Depends on:** The chosen Claude Code experience; no dependency on story 7.
- **Safe stopping point:** Each delivered tool remains usable if later parity
  enhancements are dropped.

<a id="reconcile-recently-done-and-sessions"></a>

### Review recently done stories alongside their available sessions

**Identity:** SEED-052#reconcile-recently-done-and-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can understand recent completed product work and
  revisit its conversations without losing sessions outside visible story lists.
- **Evaluation:** A story with published completion evidence becomes reachable
  in Recently done with its supporting evidence and any known dashboard-launched
  sessions. Recent sessions remains independently accessible, including sessions
  whose stories are in none of Backlog, Taken, or Recently done. One story can
  link multiple sessions. Mere disappearance from the backlog proves nothing.
- **Boundary:** Separate published story facts from local session facts. Session
  stopping does not establish completion. No discovery of externally started
  sessions is included. The completion evidence and meaning of recent require
  refinement before this candidate can be selected for execution planning.
- **Value / learning:** Tests a reconciled view while preserving both histories
  and their different coverage.
- **Effort hypothesis:** Unestimated; reconstructing or recording authoritative
  completion and defining the recent window are unresolved.
- **Depends on:** Published story completion evidence and story 2 for session
  links; not a prerequisite for launch, Recent sessions, or embedded interaction.
- **Safe stopping point:** Recent completed work and available conversations are
  reviewable even without automatic attention notifications.

This related outcome was explicitly valued in the interview but its priority
relative to the launch epic was not selected. It stays here as one canonical
unqueued candidate rather than disappearing from the discussion or being
silently added to the launch critical path.

## Ordering and Scope Reduction

Stories 2 and 3 make return and interaction useful; refinement launch and
embedded answers are already available. Story 4 now adds attention indicators
so the developer can notice when to return, after story-session links support
the same signal on cards.
Recent-session navigation can be delivered alongside terminal interaction if
refinement shows that separate delivery adds no useful stopping point; neither
requires the Recently done view.

Interaction has a slight, explicitly provisional priority over scripted setup.
Stories 5 and 6 may interleave with stories 2–4 when use reveals more value in
reducing setup overhead. The user authorized going far with Claude Code first.
Tool expansion follows that learning. Terry's 2026-09-30 split puts Codex
refinement launch before the remaining Codex workflows and lifecycle, at the
original Codex entry's position; Cursor follows those entries in the current
queue. These are user outcomes, not generic adapter tasks. Reassess the Codex
remainder from the first real launch and assess Cursor independently.

For scope reduction, defer tool expansion first, then further scripted setup;
retain launch and useful interaction in Claude Code. If embedded interaction is
too costly, retain launch and recent-session access through the external CLI,
which the dashboard's refinement launch already provides. Story 4 selects
local attention indicators; completion callbacks, notifications, state-aware
skill selection, model selection, other skills, externally started sessions,
and full project/tool setup remain deferred.
Recently done is related work with its own value and priority decision.
For the two Codex increments, drop expensive live-state and embedded-reconnect
work from the first delivery promise before sacrificing actual refinement
launch and a recoverable session identity. The remainder retains those
promises. Straightforward shared support can be delivered in the first story
without introducing restrictions to enforce the story boundary.

## Open Decisions Before Refinement or Planning

- Define project S/M/L bands before assigning comparative estimates; none were
  found, so there is no defensible numerical or band distribution yet.
- Observe the first Codex launch's native skill activation, session identity
  and prepared-workspace use before planning dependent implementation. Assess
  whether state observation and dashboard reconnect are straightforward enough
  to include in the first story; their deferral is not a product prohibition.
- Resolve the host-module organization question against the current
  Architectural North Star during first-story refinement. This decomposition
  makes no new architectural decision.
- Refine authoritative completion evidence and the recent window separately for
  Recently done; do not infer completion from an absent backlog entry.

## When to Surface

The maintainer selected the eight child stories for backlog priorities 4–11
on 2026-09-28, replacing the original epic entry. The related Recently done
candidate remains unqueued. This selection does not Take any story or authorize
implementation; refinement and executable planning are later selections.

## Breadcrumbs

- Maintainer interview in this chat, 2026-09-28: Claude Code first, launch before
  setup relocation, default model, optional prompt, manual native terminal
  interaction, slight priority for interaction, independent recent sessions and
  recently done stories, and existing local project/tool setup assumed.
- Maintainer direction in this chat, 2026-09-30: extract Codex refinement launch
  as a first attempt; keep the remaining Codex experience as one story; defer
  expensive status/reconnect work but allow straightforward shared support,
  without workflow availability restrictions.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current dashboard behavior](../../dashboard/README.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
