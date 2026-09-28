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
  detection, completion notification, or done-prefix naming is required.
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

<a id="launch-claude-refinement-background"></a>

### 1a. Launch refinement in a Claude Code background session

**Identity:** SEED-052#launch-claude-refinement-background
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer looking at a project's backlog starts refinement
  of a chosen story there, instead of switching to a terminal, changing to the
  project's folder, and typing the refinement instruction with the story's
  identity. It mirrors the delivered execution launch for the other main
  workflow.
- **Evaluation:** Every **Backlog** card offers **Start refinement** beside
  **Start execution**; Taken cards offer neither. The dialog names the story,
  Claude Code, and an optional instruction. Starting launches a Claude Code
  background session in the project's folder with the project's refinement
  skill and the story's identity, followed by any instruction. The card reports
  starting, launched (session id and copyable `claude attach <id>`), failed, or
  uncertain exactly as execution launch does, and shows local **Started** until
  origin publishes what the session does. The developer answers the interview
  by attaching from a terminal; published refinement facts then appear from
  origin.
- **Boundary:** Same scope as the execution launch
  ([Agent launch](../../dashboard/AGENT-LAUNCH.md)): launch and forget, fixed
  project folders, no model, tool, or permission choice, and the same
  same-page-only launch boundary. Launching refinement does not imply Taken,
  completed refinement, acceptance, or execution; preparation, workspace, and
  publication stay with the agent's normal workflow. Answering inside the
  dashboard is story 4.
- **Value / learning:** Tests whether dashboard initiation is used for
  conversational work when answering happens through the ordinary CLI.
- **Effort hypothesis:** Unestimated; reuse of the execution launch is expected
  to dominate. How local **Started** ends for a refinement (a Preparing
  assignment or a refined story rather than Taken) and how the two actions sit
  on one card need refinement.
- **Depends on:** The dashboard launch.
- **Safe stopping point:** Both main workflows start from the dashboard even if
  embedded interaction is never added.

<a id="revisit-dashboard-sessions"></a>

### 2. Find recent dashboard-launched sessions after leaving the story

**Identity:** SEED-052#revisit-dashboard-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can return to a conversation after navigating away,
  refreshing the dashboard, or the story leaving the backlog.
- **Evaluation:** Launch work, later return to Recent sessions, recognize its
  project, story reference, workflow, and session, and obtain the means to open
  it in Claude Code's CLI. The entry remains accessible when no current story
  card or recently done story matches it. Multiple sessions for a story remain
  distinguishable.
- **Boundary:** Only dashboard-launched sessions are included. An unavailable
  tool session is reported as unavailable, not recreated or marked complete.
  A launch record is local navigation evidence, not authoritative story state.
- **Value / learning:** Makes launch useful across visits without depending on
  a completed-story view or an embedded terminal.
- **Effort hypothesis:** Unestimated; persistence, retention, and stale session
  access are the sizing uncertainties.
- **Known from launch:** Started follows Backlog membership only, so a session
  that ends before its Take, or a story returned to the Backlog after a Take,
  keeps Started until the dashboard restarts. Settling or relaunching from
  Claude Code's own state belongs here: `claude agents --json` keeps finished
  sessions with their `state`, which also supports reporting an unavailable
  session.
- **Depends on:** The dashboard launch ([Agent launch](../../dashboard/AGENT-LAUNCH.md))
  provides identified dashboard-launched sessions.
- **Safe stopping point:** Users can find and revisit sessions through the CLI
  without any browser interaction integration.

<a id="interact-with-claude-terminal"></a>

### 3. Interact with a launched Claude Code session inside the dashboard

**Identity:** SEED-052#interact-with-claude-terminal
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can inspect work, answer questions, and intervene
  without leaving the dashboard for a separate terminal.
- **Evaluation:** Manually choose a launched session, including one reached
  through Recent sessions without a current story card, open its ordinary
  Claude Code terminal, answer a question, and see the same conversation
  continue. Closing the panel leaves background work accessible later.
- **Boundary:** Attach to the intended session rather than start another task.
  Unavailable sessions receive an explanation. No automatic needs-attention
  detection, separate chat interface, or completion notification is promised.
- **Value / learning:** Tests whether the native CLI in an embedded terminal
  provides sufficient interaction before designing tool-specific status flows.
- **Effort hypothesis:** Unestimated; attachment behavior, reconnecting, and
  browser terminal usability are the main uncertainties.
- **Known from launch:** A session is reached by the short id `claude --bg`
  prints; `--bg` ignores `--session-id`, so the id cannot be chosen upfront.
- **Depends on:** The dashboard launch; story 2 supplies the promised access after card removal.
- **Safe stopping point:** Existing execution conversations are usable inside
  the dashboard even if refinement launch is never added.

<a id="launch-claude-refinement"></a>

### 4. Start story refinement and answer its questions in the dashboard

**Identity:** SEED-052#launch-claude-refinement
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can begin conversational preparation from an
  unrefined story and continue the interview where they selected it.
- **Evaluation:** Select an unrefined story, choose refinement from the
  state-aware skill chooser, optionally add context, and launch Claude Code.
  Open the embedded terminal to answer its questions and review its result
  through the ordinary workflow. Published refinement facts subsequently
  appear from origin.
- **Boundary:** The agent still owns its normal preparation workflow; launching
  refinement does not imply Taken, completed refinement, acceptance, or execution.
  Unavailable actions explain their prerequisite. Decomposition, planning-only,
  and other independent skill-launch journeys need later selection, not an
  automatic promise to support every installed skill.
- **Value / learning:** Delivers the first conversational launch journey and
  tests whether skill selection and native terminal interaction are sufficient.
- **Effort hypothesis:** Unestimated; skill applicability and interview-to-
  publication behavior need refinement.
- **Depends on:** Story 1a for the refinement launch and story 3 for the
  embedded terminal.
- **Safe stopping point:** Refinement and execution are useful without moving
  preparation responsibilities into the dashboard.

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
- **Depends on:** Story 1a and existing preparation tooling. Story 5 offers reuse
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
  `claude attach`, the `claude agents` advice, `/dough-execute-plan`, and the
  host label. A second host moves them behind the host module.
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
- **Depends on:** The chosen Claude Code experience; no dependency on story 7.
- **Safe stopping point:** Each delivered tool remains usable if later parity
  enhancements are dropped.

## Related Candidate: Recently Done Stories

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

Stories 2 and 3 make return and
interaction useful before story 4 introduces the more conversational workflow.
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
which story 1a already gives refinement. Automatic attention
indicators, completion callbacks, done-prefix naming, model selection, other
skills, externally started sessions, and full project/tool setup remain deferred.
Recently done is related work with its own value and priority decision.

## Open Decisions Before Refinement or Planning

- Define project S/M/L bands before assigning comparative estimates; none were
  found, so there is no defensible numerical or band distribution yet.
- Define recent-session retention and recovery after a dashboard restart. Local
  navigation state must not replace origin as authority for story progress.
- Observe real attachment/reconnection for the embedded terminal; decide its
  smallest usable presentation then, without requiring question detection.
- Select the next story after the first launch from real use. Interaction's
  priority and the order of Codex versus Cursor are not fixed commitments.
- Refine authoritative completion evidence and the recent window separately for
  Recently done; do not infer completion from an absent backlog entry.

## When to Surface

The maintainer selected the eight child stories for backlog priorities 4–11
on 2026-09-28, replacing the original epic entry. On 2026-09-29 the maintainer
inserted story 1a, a launch-and-forget refinement launch matching the delivered
execution launch, ahead of the remaining stories. The related Recently done
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
