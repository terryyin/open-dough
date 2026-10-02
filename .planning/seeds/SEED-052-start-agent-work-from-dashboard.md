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

<a id="cursor-host-guide-attach"></a>

### State that Cursor supplies embedded attach

**Identity:** SEED-052#cursor-host-guide-attach
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/213-cursor-host-guide-attach/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ff5a6be56fea633912e58ba77a22770b9c9313f489cb649aeca62fb82e3fba58","plan":"e01f332986349d63f446a898b74d16bc38d93f9eb23d753683d82d3d55ec8fb2"}}
```

**Goal:** A maintainer reading the dashboard host guide can see that Cursor
supplies the embedded terminal and does not supply stop.

**Scope:** Correct the Cursor paragraph in `dashboard/AGENT-LAUNCH-HOSTS.md`
so it matches the host this story's predecessor delivered. Launch stays
`create-chat`, then `cursor-agent --workspace` and `--resume`, storing the
id, workspace, and resume command, with no alias or endpoint. The paragraph
says attach is supplied, names `Add a follow-up` as the text that admits the
terminal, and says stop is absent so Mark as done stays absent. It does not
change launch, attach, activity wording, or any other host, and it does not
add stop, rename, or a passive status.

**Plan:** [State Cursor attach in the host guide](../slice-plans/213-cursor-host-guide-attach/PLAN.md).

<a id="cursor-native-activity-and-controls"></a>

### See Cursor activity and use its native controls

**Identity:** SEED-052#cursor-native-activity-and-controls
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected","assessment":"not-ready","reasons":["No implementation approach is selected."],"basis":{"document":"ecedafc3eb96adb8b77feec811e84e6b1347c234059434010b552a84b2fcaa99"}}
```

**Goal:** A developer looking at a Cursor session the dashboard launched can
see that session's own activity, choose a model Cursor lists, and rename or
stop the session when Cursor's CLI provides that operation.

**Scope:** This starts from a Cursor session already launched by
[Use Cursor for the established dashboard workflows](https://github.com/terryyin/open-dough/blob/317d0f1c24fdf3cb7b89960d11c7b259bf862b08/.planning/seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).
Activity comes from a Cursor read that does not resume the conversation or
take its interactive control, and attention uses that activity. The model
menu lists ids from `cursor-agent models`. Default still omits `--model`; a
chosen id is sent as `--model`, and an unknown id is still rejected. Rename
and stop appear only with a Cursor command this story has confirmed. A
missing command stays unavailable.

**Constraints:** Claude Code and Codex evidence does not establish Cursor
behavior. Shared code does not supply their status, rename, or stop
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).

**Deferred promises:** tmux `persist` sessions. Discovering sessions the
dashboard did not launch. Changing Claude Code or Codex controls.

**Key examples:**

1. Cursor can report a session as working without attaching to it. The
   developer views that session's card. The card shows working from that
   Cursor reading, and it does not resume the conversation.
2. The developer opens the model menu for Cursor. The choices are the ids
   `cursor-agent models` lists, plus Default. Starting with Default sends no
   `--model`. Starting with a listed id sends `--model` for that id.
3. This story has not confirmed a rename or stop command. The developer views
   the session. Rename and native stop are absent. Deleting the dashboard's
   own session record remains available.
4. A later confirmed Cursor stop command exists. The developer marks the
   session done. The dashboard uses that command, and the same chat id can
   still be resumed afterward.

**Depends on:** [Use Cursor for the established dashboard workflows](https://github.com/terryyin/open-dough/blob/317d0f1c24fdf3cb7b89960d11c7b259bf862b08/.planning/seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).

**Open decisions:** None for goal or scope. Which Cursor command, if any, can
report activity without attaching remains the story's own proof, not a reason
to borrow another host.

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
