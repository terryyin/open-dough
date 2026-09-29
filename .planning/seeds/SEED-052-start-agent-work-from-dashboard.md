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
- Tool conventions govern workspaces. Prefer deterministic operations where
  possible, but do not prescribe dashboard worktree creation or require all
  preparation to precede tool launch.
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

<a id="card-session-residue"></a>

### Correction: Prove Mark as done's remaining edges and trim card-session residue

**Identity:** SEED-052#card-session-residue
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/160-card-session-residue/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"05625fa3f4869d70af589778fe6f4106930e1b07140e174c788c519de6c617e6","plan":"41402e5f3f722e2e14b87b409ab5f34dddda121a8745505bdff211957365d995"}}
```

**Goal:** Maintainers can rely on a test for every Mark as done promise the
dashboard documents, read one request shape for the page's session
operations, and change card-session behavior in specs that each own one
concern.

**Scope:** The correction found by the execution retrospective of
SEED-052#keep-story-session-links (commits `30bdc002`..`cbd9b7d6` on
`claude/keep-story-session-links`). It covers the untested Recent sessions
region focus fallback, the unreadable-listing stop, a card entry's refusal
message, the `TerminalOpening` reuse for marking, Started test names, and
overlapping card specs over 250 lines. It adds no feature promise. See the
[plan](../slice-plans/160-card-session-residue/PLAN.md).

<a id="launch-claude-refinement"></a>

### 4. See when a dashboard session needs human attention

**Identity:** SEED-052#launch-claude-refinement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/159-session-attention/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"03fa62946ba00dd9f97a6a9617bacf6daee1faef50eca59010ff5e608bafa559","plan":"fc3cc112a89ab3b9e486f61a7561faaaf33f671f45b788848534a91be1e6a63d"}}
```

**Goal:** A developer who leaves a dashboard-launched Claude Code session
working can notice when it needs an answer, has a result to review, or has
failed or stopped, and open its terminal to respond. The developer need not
open each conversation merely to find out which one needs attention.

**Scope:**

- Apply to dashboard-launched refinement and execution sessions in the selected
  project that the developer has not marked done. Both the Recent sessions
  entry and the session's entry on its linked story card show an attention
  indicator and its reason. The story card also signals that one or more of
  its sessions need attention. Each session keeps its own state; a working
  session does not hide another session's need for attention.
- A session waiting on the developer shows **Needs input**, with the reported
  reason when available, such as an answer, permission decision, or another
  intervention. A session whose last turn has finished shows **Ready for
  review**. A failed or stopped session calls for attention with **Session
  failed** or **Session stopped**. These are local session observations,
  regardless of whether the underlying process is still alive.
- Use the host's reported state, not elapsed inactivity, terminal output
  silence, or process exit alone. A session still driving work, including
  waiting between its own steps or on CI, does not need attention merely
  because its process is idle. Update attention through the existing automatic
  session-state refresh; no page reload or open terminal is required.
- Keep **Open terminal** wherever the session remains attachable. Opening or
  closing the terminal does not acknowledge attention. When the host reports
  that the session has resumed work, its attention indicator clears. The
  developer's explicit **Mark as done** closes it and suppresses its attention
  indicator, including in Recent sessions. No separate acknowledgment flow is
  required.
- An unreadable listing shows **State unknown** with the existing explanation;
  an unlisted session shows **Session unavailable** with its existing controls.
  Neither observation establishes that the session is blocked or has ended.
  Do not invent an attention reason from missing evidence. When the host can
  be read again, show the newly observed state.
- A session's end or readiness for review does not establish that its story
  is refined, accepted, completed, or published. Preserve origin as the source
  of published story facts. When the story is outside all displayed lists,
  its session can still need attention in Recent sessions.
- **Deferred:** A state-aware skill chooser and additional skill-launch
  journeys; reconciliation of completed stories; browser or operating-system
  notifications; discovering sessions not launched by the dashboard; and
  adding Codex or Cursor support. Launching refinement and answering through
  the embedded terminal are already delivered, not new promises of this story.

**Key examples:**

1. A refinement session is working. Claude Code then reports that it needs
   an answer. The session and its linked story signal attention with **Needs
   input**. The developer opens its terminal and answers; after Claude Code
   resumes work, the indicator clears.
2. An execution session needs a permission decision. Its entry identifies that
   reason, even though the session process is alive. Opening the terminal alone
   leaves attention visible while the decision remains pending.
3. Claude Code reports that a session's last turn is done, with its process
   either alive or exited. Its entry shows **Ready for review**, while the
   story keeps whatever published state origin establishes. Mark as done
   clears attention and deliberately closes the session's card entry.
4. One story has two unclosed sessions: one working and one failed or stopped.
   The latter names its condition and the story signals attention. The working
   session remains working. The same affected session remains visible in
   Recent sessions if the story later leaves every displayed list.
5. A session is idle between steps while the host still reports it as working;
   it shows no attention indicator. If the host listing becomes unreadable,
   the dashboard instead reports **State unknown**, without claiming a question
   or result is waiting.

**Depends on:** Existing Claude Code launch, Recent sessions, and embedded
terminal behavior in [Agent launch](../../dashboard/AGENT-LAUNCH.md),
including persistent session entries and Mark as done on story cards.

**Feasibility evidence:** The current dashboard reads `claude agents --json
--all`, but presents every live non-busy process as Idle. Claude Code's
[documented session interface](https://code.claude.com/docs/en/agent-view#read-session-state-from-a-script)
distinguishes `blocked`, `working`, `done`, `failed`, and `stopped`, and supplies
`waitingFor` when a live process has a pending prompt. This supports reporting
attention without detecting questions from transcript text. Confirm the relevant
states with the project's installed Claude Code when preparing executable proof.

**Value / learning:** Makes the existing conversational launch journey useful
while the developer attends to other work, and tests whether reported session
state is enough to guide their return.

**Effort hypothesis:** Unestimated; confirming host-state observations and
presenting attention consistently across story cards and Recent sessions are
the remaining sizing uncertainties. No unresolved product-scope question is
required before execution planning.

**Safe stopping point:** Session attention is useful with the existing launch
and terminal workflows, without completed-story reconciliation or additional
tools.

<a id="script-execution-preparation"></a>

### 5. Start execution with mechanical preparation already handled

**Identity:** SEED-052#script-execution-preparation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer launching planned execution spends less agent time
  and usage on routine coordination, with a predictable handoff.
- **Evaluation:** Start execution; deterministic tooling performs the applicable
  preparation and published claim steps, and the agent continues using their
  established results without creating duplicate claims or workspaces. Starting
  the equivalent task directly in the CLI still performs the whole workflow.
- **Boundary:** Respect tool workspace conventions; place scripted steps where
  the chosen workspace is known rather than requiring all setup before launch.
  Show local preparation/publishing progress alongside the last published facts.
  A failed or uncertain preparation/launch leaves an understandable recoverable
  result and must not be represented as successful execution. Concurrent starts
  must respect existing ownership.
- **Value / learning:** Tests actual reduction in agent setup and uncertainty
  without creating two competing startup workflows.
- **Effort hypothesis:** Unestimated; handoff, ownership, publication recovery,
  and tool-selected workspace ordering are consequential uncertainties.
- **Depends on:** The dashboard launch and existing shared execution coordination tooling;
  stories 2–4 are ordering preferences, not technical prerequisites.
- **Safe stopping point:** Planned execution has deterministic preparation while
  refinement and direct CLI startup continue through their existing paths.

<a id="script-refinement-preparation"></a>

### 6. Start refinement with mechanical preparation already handled

**Identity:** SEED-052#script-refinement-preparation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer beginning refinement avoids repeated agent-led
  workspace and preparation-assignment bookkeeping.
- **Evaluation:** Launch refinement; deterministic tooling establishes the
  applicable preparation facts and hands them to the agent, which starts useful
  investigation and discussion without repeating setup. Direct CLI refinement
  still prepares itself.
- **Boundary:** Preparation remains distinct from Taken and human acceptance.
  The dashboard shows pending local operations without asserting publication;
  failure and retry preserve ownership and avoid duplicate assignments. Workspace
  handling follows the tool. Do not automate refinement judgments or acceptance.
- **Value / learning:** Extends the setup benefit to conversational work while
  testing its different lifecycle rather than treating refinement as execution.
- **Effort hypothesis:** Unestimated; preparation handoff and recovery are the
  main uncertainties; reuse execution's proven common behavior where applicable.
- **Depends on:** The dashboard's refinement launch
  ([Agent launch](../../dashboard/AGENT-LAUNCH.md)) and existing preparation
  tooling. Story 5 offers reuse
  and learning but is not established as a required product prerequisite.
- **Safe stopping point:** Both selected workflows reduce setup overhead without
  requiring completion monitoring or support for another tool.

<a id="use-codex-from-dashboard"></a>

### 7. Use Codex for the established dashboard workflows

**Identity:** SEED-052#use-codex-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who prefers Codex can use the dashboard launch,
  return, and interaction experience already established with Claude Code.
- **Evaluation:** Choose Codex and its default model for a supported workflow;
  start it, find its session later, and interact through its CLI in the dashboard.
  Applicable scripted preparation is consumed without duplicate setup; direct
  CLI work remains possible.
- **Boundary:** Verify actual Codex behavior rather than infer parity from Claude
  Code. No desktop-app connection, model picker, or non-dashboard session discovery.
- **Value / learning:** Makes tool choice real for Codex users and tests how much
  of the established experience transfers.
- **Effort hypothesis:** Unestimated; launch/attach continuity and workspace
  conventions require a feasibility observation before planning or further split.
- **Known from launch:** The browser still spells out Claude Code specifics:
  `claude attach`, the uncertain launch's `claude agents` advice,
  `/dough-execute-plan`, and the host label. It also interprets Claude Code's
  session `state` and `status` (`sessionRuns`, `sessionStateWords`), and the
  page reads the host's listing again every 15 seconds; Claude Code's answered
  in about 0.16 s with 469 sessions. A second host moves these behind the host
  module and observes whether its listing is as quick and tells running from
  exited sessions. Claude Code's server code now spans `claudeCode.ts` (every
  `claude` argument array) and `claudeLaunch.ts` (session name, instruction,
  and reading `--bg`'s output), so the North Star's "one module per host"
  needs Terry's decision before a second host is refined.
- **Depends on:** The chosen Claude Code experience; no dependency on Cursor.
- **Safe stopping point:** Claude Code and Codex remain independently usable.

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
Stories 7 and 8 follow that learning, with their mutual order unselected; each
is a separate user outcome, not a generic adapter task. Reassess their breadth
once the Claude experience and each tool's feasibility are known.

For scope reduction, defer tool expansion first, then further scripted setup;
retain launch and useful interaction in Claude Code. If embedded interaction is
too costly, retain launch and recent-session access through the external CLI,
which the dashboard's refinement launch already provides. Story 4 selects
local attention indicators; completion callbacks, notifications, state-aware
skill selection, model selection, other skills, externally started sessions,
and full project/tool setup remain deferred.
Recently done is related work with its own value and priority decision.

## Open Decisions Before Refinement or Planning

- Define project S/M/L bands before assigning comparative estimates; none were
  found, so there is no defensible numerical or band distribution yet.
- Observe real attachment/reconnection for the embedded terminal; decide its
  smallest usable presentation then, without requiring question detection.
- Select the next story after the first launch from real use. Interaction's
  priority and the order of Codex versus Cursor are not fixed commitments.
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
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current dashboard behavior](../../dashboard/README.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
