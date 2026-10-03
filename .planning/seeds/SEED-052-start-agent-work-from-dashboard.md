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

<a id="unread-report-apart-from-engagement"></a>

### Show an unread session report apart from a session needing engagement

**Identity:** SEED-052#unread-report-apart-from-engagement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/238-unread-report-apart-from-engagement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b501ac50a853bb7bc91985c953d211d6f00455662eb21c36d437330459c3c416","plan":"56a38d5ec1ebb00a5a0c5fc2c354b7cfc89ee7fc87868812fbf187d6447727bb"}}
```

**Goal:** A developer scanning the Sessions sidebar can trust an entry's left
border, its place in the attention group, and the banner badge to mean that the
session itself has stopped and needs their engagement, and still notices a
completion report they have not yet read. Since completion reports arrived on
2026-10-02, an unread report has replaced the session's native reading
(`sessionShown`): a session working on the developer's next instruction reads
as ready with the green border, and a real "Needs input" is hidden behind an old
report.

**Scope:**

- One shared reading keeps two independent facts for a session: its native
  reading (label, tone, needs attention), as it is without any report, and
  whether it has an unread report — a completion report not yet marked done.
  An unread report no longer changes the label, tone, border, needs-attention
  flag, sidebar group, or badge count.
- Every place that shows a session's state follows that native reading: card
  and sidebar entries, the sidebar's grouping and order, the banner badge, the
  card's attention line, and the macOS alert reading. The badge's count and
  label cover only sessions needing engagement, worded as the card's attention
  line (“1 session needs attention”).
- An unread report adds its own marker, worded “Unread report: <completion
  label>” (for example “Unread report: Completed with attention”) wherever the
  entry states its state: the card entry's state words and the sidebar
  tooltip. A card whose sessions hold unread reports says so in a line of its
  own, “1 unread report” / “N unread reports”, beside, not inside, its
  “needs attention” line.
- A report's arrival still raises the macOS alert, named by the same unread
  report words. A native reading entered while a report is unread alerts as it
  would without the report.
- **Boundary:** No change to how reports are delivered, retained, shown in
  full, or marked done; a new instruction to the same session does not mark
  its report done. Marked done keeps its current reading. The badge does not
  count unread reports.

**Key examples:**

1. A Claude session reports “Completed with attention” and its native state is
   done (“Ready for review”) → its entry shows the ready border in the
   attention group, the unread-report marker, and the tooltip line
   “Unread report: Completed with attention”; the badge counts it once; the
   story card shows “1 session needs attention” and “1 unread report”; the
   report's arrival raised a macOS alert.
2. The developer gives that session a new instruction without Mark as done, and
   native state becomes working → the entry shows “Working” with the working
   border and moves to its launch-time place among sessions not needing
   engagement, keeping the unread-report marker; the badge no longer counts it;
   the card still shows “1 unread report” and no attention line for it.
3. That session then waits for input → the entry shows “Needs input” with the
   needs-input border and moves up into the attention group as any session
   needing engagement does; the badge counts it; a macOS “Needs input” alert
   is raised; the unread-report marker remains.
4. The developer marks the report done → the marker, tooltip line, and the
   card's unread-report line disappear; the entry reads as marked done does
   today.
5. A session whose native observation is unavailable or unknown has an unread
   report → it shows that unsettled reading and the marker, is not counted by
   the badge, and stays out of the attention group.

**UI:** The unread-report marker is a small message icon on the sidebar entry,
before the elapsed time, with a faint background tint across the entry; it is
not a border. Its words are in the tooltip and, hidden from sight, for
assistive technology. Card entries show the same words in their state line.

**Effort hypothesis:** Mostly the shared session reading, its sidebar ordering,
the attention count, the alert reading, and the unread-report wording.

<a id="mark-report-read-keeps-session-state"></a>

### Acknowledge a session report without ending the session's state

**Identity:** SEED-052#mark-report-read-keeps-session-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who has read a session's completion report can
  acknowledge it while the session keeps working on their next instruction, and
  still sees that session's live state and any later request for input.
- **Evaluation:** On a launch with a completion report, the control reads
  **Mark as read**: it acknowledges the report only, clearing the
  unread-report marker without stopping, renaming, or detaching the session.
  The entry keeps showing its live reading: a session marked read while
  working reads Working, and one that later waits for input shows the
  needs-input border, moves into the attention group, is counted by the badge,
  and raises its alert. **Mark as done** then always closes its session.
- **Boundary:** Builds on
  [the unread-report marker](#unread-report-apart-from-engagement). No change
  to how reports are delivered or retained; a new instruction to the same
  session does not mark its report read.
- **Value / learning:** Today a report's Mark as done only records local Done
  (`markSessionDone`), yet the entry then reads Done whatever the native
  session does (`sessionShown`): a running session reads Done, and a later
  "Needs input" is hidden.
- **Effort hypothesis:** Unestimated; mostly the control's wording and the
  marked-done reading for launches with a report.

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
- Terry's 2026-10-03 request: keep the sidebar's left border for sessions that
  stopped and need engagement, mark an unread report another way without
  reordering, keep the report's macOS alert, and queue this as backlog priority
  one; work directly on main and sync with origin.
- Terry's follow-up the same day: a report's Mark as done acknowledges the
  report only, so make it Mark as read and keep the live session state, queued
  as the next backlog item after the taken unread-report story; work directly
  on main and sync with origin.
- [Current dashboard behavior](../../dashboard/README.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
