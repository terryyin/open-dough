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

<a id="one-active-story-session"></a>

### Prevent a second refinement or execution session for an active story

**Identity:** SEED-052#one-active-story-session
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/222-one-active-story-session/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e323cb52d1cb78d046c5a3f7e6107b03d37afc115af9863c0fd1c77d852f65f0","plan":"9d93953e4cdcc9d14fa415459f8c8c6bb88ab10ae7973213ec60ee21d47cbc69"}}
```

**Goal:** A developer starting work from the dashboard can trust that a story
has at most one refinement or execution session from this machine at a time.
While one is starting or open, the story's Start refinement and Start
execution cannot be invoked, and they look unavailable. Gray then always means
"cannot start". This prevents two agents working on the same story and
workspace, as happened with the overlapping Cursor agents recorded under
[the Cursor reconnect story](https://github.com/terryyin/open-dough/blob/c78b9ba0fd30256d145dfe4eb672f3e8e9d7d927/.planning/seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-reconnect-leaves-the-task-running).

**Scope:**

- A story's active session is either a startup on this machine that has not
  reconciled, or a dashboard-launched refinement or execution session for that
  story that has not been closed. Either one blocks both workflows' Starts,
  whichever workflow it runs and whatever its tracking. That includes Standard
  and One-shot sessions and a Taken card's kept-start Start execution.
- The session closes only when the developer marks it done or deletes its
  record. Nothing else counts as a close: not an idle turn, a detached or
  closed terminal, an ended native process, Session unavailable, or the story
  moving between lists. A Cursor session, which offers no Mark as done, closes
  through Delete record. Once the session closes, the Starts return under their
  other existing eligibility rules.
- Every place a Start can be pressed enforces the block, and so does the local
  launch boundary. A dialog that was opened before the session became active,
  another page, and overlapping requests from other dashboard processes on this
  machine all get a refusal that starts nothing. As with other refusals, the
  dialog closes and the refusal stays beside the card's Start. Startup is already enforced this way through the unresolved launch
  attempt, so the open-session state extends that rule rather than adding a
  second one.
- A disabled Start is described by why: the story has an open session, which is
  listed on the card, and closing it lets a new one start. The startup state
  keeps its existing card status. Startup, open session, and closed are
  distinct states in what the developer sees.
- A Start that stays clickable never uses the disabled look. "Being prepared"
  and "Not marked Ready for execution" remain clickable notes, with a look that
  is distinct from disabled. Their wording stays as it is.
- Separate stories, ad hoc sessions, and other projects keep starting in
  parallel.

**Deferred promises:** Excluding sessions on other machines or sessions started
outside the dashboard. Across machines, a published Take already removes a
Backlog card's Starts. A published Preparing from elsewhere leaves Start
clickable with its note. Closing a session automatically from native state.
Refusing to reopen a done session while another session of the story is open.
Adding Mark as done for Cursor.

**Key examples:**

1. A developer presses Start refinement on a Backlog story. During
   "Preparing refinement…", the card's actions stay protected as they are
   today. Once the session is listed on the card, Start refinement and Start
   execution stay disabled and gray. Their description says the story has an
   open session to close first.
2. A refinement session from this dashboard has published Preparing and ended
   its turn idle. The developer closes its terminal. Both Starts stay
   disabled. The developer marks the session done. Start refinement returns
   with its "Being prepared" note, clickable and not gray, and Start execution
   returns under its readiness note.
3. A developer opened the Start execution dialog before another page started
   refinement on the same story. When they press Start, the dialog closes,
   a refusal beside the Start says the story already has an open session,
   and nothing starts. Two pages or servers that press Start at the same moment start one
   session.
4. A Cursor execution session is open on a story. Both Starts stay disabled
   until the developer uses Delete record on that session.
5. Story A has an open execution session. Story B's Starts, and Start session
   on the project, remain available.
6. Another machine published Preparing on a story, and this machine has no
   session for it. Start refinement shows "Being prepared" and stays
   clickable, in the distinct noted look.

**Decided 2026-10-03 by the developer:** Only an explicit close (Mark as done or
Delete record) lifts the block. A published Preparing or a missing Ready mark
with no session on this machine keeps Start clickable, in a look that is not
gray.

**Depends on:** No new prerequisite story identified.

**Open decisions:** None for goal or scope.

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
Tool expansion follows that learning. Assess Cursor independently, using the
maintained [launch contract](../../dashboard/AGENT-LAUNCH.md) as the current
Claude Code and Codex baseline.

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
