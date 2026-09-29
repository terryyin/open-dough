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

<a id="mark-done-residue"></a>

### Correction: Prove the busy-session rename edge and confirm observer shutdown honestly

**Identity:** SEED-052#mark-done-residue
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/166-mark-done-residue/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f211bd9d67e3057788c5239d6c2dc4c1c542a7393b164b84f4ab491685cfa7a6","plan":"3b5e72ea5adbe98f1bdc532012c06a8550fa5050d760ae700724b2d3df113d9f"}}
```

**Goal:** Maintainers can rely on a test for Mark as done's documented busy
session rename timeout, trust a completion receipt's shutdown claim, and
change Mark as done's page journeys in specs that each own one concern.

**Scope:** The correction found by the execution retrospective of
SEED-052#card-session-residue (commits `26099a6a`..`95fa693c` on
`claude/card-session-residue`). It covers the untested rename wait that
expires, a completion receipt that confirms shutdown while the observer's
identity is unknown, the overlong Mark as done page journey, a duplicated card
attach step, the tests README, and the request-shape wording. It adds no
feature promise. See the [plan](../slice-plans/166-mark-done-residue/PLAN.md).

<a id="session-sidebar-residue"></a>

### Keep the Sessions sidebar's reads and reveals honest

**Identity:** SEED-052#session-sidebar-residue
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/167-session-sidebar-residue/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"96e8221132c3348e773ddbd8a4b039f4ec1525529b79cf20921ac0de62eedb61","plan":"376e9d1f5e1445d71d34f8ecc2aa74da7735a4341e26aab2985328cb0dd3e755"}}
```

- **Goal:** A developer using the Sessions sidebar can trust that it reads
  every session from a folder Claude Code answers the same way, that a list
  still being read never looks complete, and that the page scrolls only where
  they asked it to, correcting what the SEED-052#session-sidebar execution
  left behind.
- **Scope:** Confirm, with Terry's own listing from the home folder, that the
  machine read's listing folder answers every session, and otherwise read it
  in a catalog project's folder; drop a pending reveal once the developer
  shows another project's stories; keep sessions not yet read while a launch
  answers before the first read; bring the navigation specs into the test
  guide and the North Star's keyboard return in line with the narrow-window
  case. No new feature promise.
- **Plan:** [plan 167](../slice-plans/167-session-sidebar-residue/PLAN.md)

<a id="delete-unknown-state-session"></a>

### Delete a session whose state is unknown from the dashboard

**Identity:** SEED-052#delete-unknown-state-session
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer whose story card lists a session that shows
  "State unknown" can remove that session from the dashboard instead of
  keeping a link the dashboard can no longer read or reach.
- **Evaluation:** A session shown with "State unknown" offers a delete option.
  Choosing it removes that session's kept launch record, so the card and the
  Sessions sidebar no longer list it and the story can be launched afresh. A
  session in any other state does not offer the option.
- **Boundary:** Deletes only the dashboard's own record of the session; the
  conversation transcript and Claude Code's own listing are untouched. Whether
  "Session unavailable" (listed by neither) also offers it, and whether the
  choice asks for confirmation, are open for refinement.
- **Depends on:** None; the Sessions and story-card session entries exist.

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
  session `state` and optional `waitingFor` in one reading
  (`dashboard/src/sessionShown.ts` `sessionShown`), and the page reads the host's listing again every 15 seconds; Claude Code's answered
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
