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

<a id="mark-report-read-keeps-session-state"></a>

### Acknowledge a session report without ending the session's state

**Identity:** SEED-052#mark-report-read-keeps-session-state
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-052#mark-report-read-keeps-session-state","dependencies":[{"supplier":{"identity":"SEED-052#unread-report-apart-from-engagement","href":"seeds/SEED-052-start-agent-work-from-dashboard.md#unread-report-apart-from-engagement"},"implementation":"The unread-report reading in sessionShown (unreadReport beside the native reading), its sidebar marker and card count, and the session-unread-report page journey.","rationale":"Mark as read clears the unread-report marker and keeps the native reading; neither exists before the supplier delivers them, so this story's examples cannot be built or observed until then. Shared direction or reconciliation cannot substitute, because this story changes the supplier's unread rule and extends its journey.","condition":"The supplier's unread-report reading and its page journey are on origin's trunk.","state":"satisfied","resolution":{"revision":"5e8d562b4bdeff7971952872ad2cb338fcafb699","path":".planning/seeds/SEED-052-start-agent-work-from-dashboard.md#unread-report-apart-from-engagement","summary":"Origin's main at 15b7ceae holds sessionShown's unreadReport beside the native reading (dashboard/src/sessionShown.ts), the sidebar marker and card \"N unread reports\" line, and dashboard/tests/session-unread-report.spec.ts; the supplier's planned slices were all done with CI green on its branch.\nCondition satisfied: The supplier's unread-report reading and its page journey are on origin's trunk.\nAccepted integration: 15b7ceae39bc52f98932a9437db3b99627db112c on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/239-mark-report-read-keeps-session-state/PLAN.md","assessment":"not-ready","reasons":["Slice 1 premise unobserved: plan 238's unread rule (sessionShown unreadReport) and session-unread-report.spec.ts are not on trunk yet; observe them once SEED-052#unread-report-apart-from-engagement lands, then reassess."],"basis":{"document":"f728a248811ac7198ba42a8851f37a091a4db8c4f3a1d75309a3f65bb9427ac1","plan":"25033b00f36f89f0bb7d41a50969d63b7d0c872b83ab7ff681ffcfcf667f5ac0"}}
```

**Goal:** A developer who has read a session's completion report can
acknowledge it while the session keeps working on their next instruction, and
still sees that session's live state and any later request for input. Today
acknowledging a report is its Mark as done, which only records local Done
(`server/doneMarks.ts`), so the entry leaves the card and sidebar and reads Done
whatever the native session does: a running session reads Done, and a later
“Needs input” is hidden.

**Scope:**

- A launch whose report is unread offers **Mark as read** where its report's
  Mark as done is offered today: its card entry and its report panel. Mark as
  read records, durably and locally, that the report was read. It clears the
  unread-report marker, its tooltip line, and its share of the card's
  “N unread reports” line, and does nothing else: it does not stop, rename,
  detach, or mark the session done.
- A read session stays an open session: it keeps its card and sidebar entry and
  the native reading every other open session has, including the attention
  group, border, badge count, card attention line, and macOS alerts for
  native readings entered later.
- The report stays retained and readable after Mark as read
  (“Read attention message”).
- Once the report is read, the entry offers **Mark as done**, which does what
  it does for a session without a report: saves local Done, requests native
  rename, closes dashboard attachments, and requests native stop unless the
  session is unavailable. For a host with no native stop (Cursor), it records
  local Done as a reported session's Mark as done does today. The terminal
  panel's Mark as done, offered whatever the report state, behaves the same way.
  Marking a session done also ends any unread report, as today.
- **Boundary:** Builds on
  [the unread-report marker](../../dashboard/AGENT-LAUNCH-COMPLETION.md). No change
  to how reports are delivered or retained; a new instruction to the same
  session does not mark its report read. Quiet completion still records local
  Done on arrival. Records already marked done keep that mark.

**Key examples:**

1. A Claude session reported “Completed with attention”, and the developer gave
   it a new instruction, so it reads Working with the unread-report marker →
   they choose Mark as read on its card → the marker and “1 unread report” go;
   the entry still reads Working with the working border, stays on the card and
   in the sidebar, and the session keeps running.
2. That read session then waits for input → it shows “Needs input” with the
   needs-input border, moves into the attention group, is counted by the badge,
   and raises a macOS “Needs input” alert.
3. The developer opens the read session's report → the retained message is
   still there; the panel offers Mark as done instead of Mark as read.
4. The developer chooses Mark as done on that read Claude session → it is
   renamed with the done prefix, detached, and stopped, and leaves the card and
   sidebar for Recent sessions, as an unreported session does.
5. A Cursor session's report is marked read → its entry stays open with its
   native reading; Mark as done then records local Done and the entry leaves
   the card and sidebar.
6. A reported session that was marked done before this change → it stays in
   Recent sessions as Done; nothing asks to mark it read.

**UI:** Mark as read is a plain button in the place of today's report
Mark as done; it then gives way to Mark as done.

**Effort hypothesis:** A durable read mark beside `doneAt`, the unread rule
reading it, the controls' wording and placement, and Mark as done using the
unreported path for reported sessions.

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
- Terry's follow-up the same day: a report's Mark as done acknowledges the
  report only, so make it Mark as read and keep the live session state, queued
  as the next backlog item after the taken unread-report story; work directly
  on main and sync with origin.
- [Current dashboard behavior](../../dashboard/README.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
