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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer using the dashboard can trust disabled Start
  actions to prevent overlapping refinement and execution on the same story.
- **Outcome:** A story has at most one active refinement or execution session
  in total. From the beginning of startup until that session closes, both
  Start refinement and Start execution are actually disabled. The existing
  gray appearance must mean the action cannot be invoked, rather than merely
  discouraging a launch that is still permitted.
- **Key examples:** While refinement is starting, neither workflow can start
  another session. While an already-started refinement session remains open,
  execution and another refinement cannot start. The same exclusion applies
  while execution is starting or its session remains open. Closing the active
  session removes this block, subject to the action's other eligibility rules.
  Separate stories can still have sessions in parallel.
- **Boundary:** Prevent a second launch even from an already-open dialog or
  overlapping launch requests; disabled controls must enforce the outcome.
  Identify startup, open-session, and closed-session states distinctly. An idle
  turn or detached terminal does not by itself mean the session has closed.
- **Refinement questions:** Establish which existing session/claim evidence
  determines that a session remains open or has closed, including failure and
  recovery, and how launch exclusion is enforced across dashboard views and
  machines. No locking design is selected by this capture.
- **Depends on:** No new prerequisite story identified.
- **Capture:** Terry requested this as the highest-priority queued story on
  2026-10-02, replacing the tolerance that leaves gray actions clickable.

<a id="split-session-entry-and-terminal-split"></a>

### Split the session entry and terminal split files along their operations

**Identity:** SEED-052#split-session-entry-and-terminal-split
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A maintainer changing session entries or the terminal panel
  works in files small enough to read whole, one concern each.
- **Evaluation:** `dashboard/src/SessionEntry.tsx` (141 lines) and
  `dashboard/src/TerminalSplit.tsx` (250 lines) each hold one clear
  concern after the change, with every dashboard spec passing unchanged and no
  behavior differing.
- **Current basis:** Session actions now live in `sessionRecordActions.tsx`,
  and navigation in `sessionNavigation.ts`. Reassess remaining responsibilities
  before selecting further extraction; do not repeat these delivered splits.
- **Boundary:** Structure only, along the seams the delete work exposed
  (Mark as done, Delete record, the shared status line, and the panel's session
  operations). No new behavior, wording or styling.
- **Depends on:** None.
- **Capture:** Terry asked on 2026-09-30 to queue the follow-up recorded by the
  delete's execution retrospective.

<a id="cursor-reconnect-leaves-the-task-running"></a>

### Reconnect to a Cursor session without interrupting its running task

**Identity:** SEED-052#cursor-reconnect-leaves-the-task-running
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/218-cursor-turn-survives-detach-and-reconnect/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5752c95a39961930286b24c5a8acc449feb574e5a6181acdeab1e9b90c0004ae","plan":"fda5e0e7f9a32d9f6f29e06978c571bb4a146403826b23ddebf5eae5610ceeec"}}
```

**Goal:** A developer working with a Cursor session the dashboard launched can
close, switch away from, lose, and reconnect its terminal without stopping or
interrupting the turn that session is running. On reconnecting, the
developer can tell the turn is still running and is not led to start a
second agent on the same chat. This brings Cursor in line with the
dashboard's terminal contract, under which detaching keeps native work
running and only Mark as done stops a session.

**Scope:**

- Detaching a Cursor terminal leaves its running turn to finish. Detaching
  here means Close, switching sessions, a dropped connection, and page reload.
  This applies whether the turn runs in the launch process or was started from
  a dashboard terminal.
- Opening or reconnecting the terminal while that turn runs leaves it
  running. The terminal shows that the turn is still working, not an idle
  prompt. While it runs, no second agent runs on the same chat.
- After the turn ends, the terminal shows its result and accepts follow-ups
  as it does today.
- Unchanged: a follow-up typed into the client that is itself running the
  turn keeps Cursor's own follow-up behavior. Mark as done stays absent for
  Cursor, and Delete record stays available.

**Constraints:** Claude Code and Codex attach behavior does not establish
Cursor behavior
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)). Cursor
changelog notes about queued subagent resumes and non-interrupting follow-ups
do not establish this reconnect.

**Deferred promises:** Seeing Cursor activity without attaching, rename, and
stop, which wait for a Cursor command that supplies them. Changing Claude Code
or Codex attach behavior. Keeping turns running when the dashboard server
stops or restarts.

**Key examples:**

1. A launched Cursor session is still working. The developer opens its
   terminal. The launch turn keeps running to its end. The terminal shows it
   is still working, and typing does not start a second agent on that chat.
2. The developer asked a follow-up in the dashboard terminal, and that turn
   is working. The developer closes the terminal or switches to another
   session. The turn keeps running. Reopening later shows it still working,
   or its result.
3. The same working turn loses its terminal connection. The developer clicks
   Reconnect. The turn kept running through the gap, and the terminal shows
   it still working or its result.
4. The session's turn has ended. The developer reconnects. The terminal shows
   the ordinary prompt, and a follow-up runs as it does today.
5. The developer detaches or reconnects a Claude Code or Codex session. Those
   hosts keep their existing attach behavior.

**Evidence:** Observed 2026-10-02. Reconnect uses the stored resume command.
The launch process remains the session while it is running. No product
changelog entry records a non-interrupting Cursor reconnect.

Investigated 2026-10-02 (`cursor-agent` 2026.10.01-e373342), locally and unpaid:

- Facts:
  - Every closed dashboard terminal socket sends SIGHUP to that terminal's
    native client. That covers disconnection before Reconnect, switching
    sessions, Close, reload, and server close
    (`dashboard/server/terminalAttachments.ts`). The terminal contract and
    that code say the native session keeps running
    ([embedded terminals](../../dashboard/AGENT-LAUNCH-TERMINALS.md)). For
    Cursor, that client is `cursor-agent` itself, with its own `worker-server`
    child.
  - An idle `cursor-agent --workspace <path> --resume <uuid>` exited 0.3 s
    after SIGHUP. Its `worker-server` child ended with it.
  - In two dashboard Cursor sessions, a turn running in a dashboard
    terminal stopped partway through a tool call. Then a new client opened
    the chat (14:32:01 and 14:40:27) and the developer typed "continue".
    The developer's report says reconnect "seems to interrupt" the task.
  - A follow-up typed while a tool runs also interrupts that tool. That is
    Cursor's own follow-up behavior, not reconnect.
  - A second resume client does not take the conversation from a launch
    process that is still working. This refinement session was itself
    launched and still working when the developer opened its terminal at
    15:02:37. The launch process kept working: it added transcript entries
    and wrote this seed at 15:03:27. The terminal showed an idle prompt
    without that progress, so the developer typed "continue", and a second
    agent ran in the terminal client on the same chat and worktree at the
    same time. The terminal client's later transcript replaced the entries
    the launch process had written after the reconnect.
  - Launch processes run in the dashboard server's terminal process group
    (observed `S+`, sharing `npm run dev:dashboard`'s group). Dashboard
    terminal clients get their own session.
- Hypotheses:
  - A detach during a running turn ends that turn. Local history and the
    idle probe support this. Seeing it directly costs one paid turn: send
    SIGHUP to a working dashboard terminal client and check whether the turn
    goes on. Planning should settle it first.
  - Ctrl-C on the dashboard server also signals running launch processes,
    because they share its process group.

**Depends on:** The delivered Cursor dashboard launch. Not on the activity,
model, and stop story.

**Decided 2026-10-02 by the developer:**

- Reconnecting must not interrupt a running Cursor turn, and neither must
  detaching. The story owns both the detach case and the reconnect case.
- Stopping or restarting the dashboard server is deferred. This story covers
  the terminal detaches above.
- While a turn runs, the terminal shows its live progress if Cursor allows a
  read-only follow. Otherwise it states that the turn is still working and
  holds input until the turn ends.

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
