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

<a id="use-cursor-from-dashboard"></a>

### Use Cursor for the established dashboard workflows

**Identity:** SEED-052#use-cursor-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/210-use-cursor-from-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b416807a21587f99177ee6392f2462906cb69cf7b41661c6f51e85fe0cbc20ce","plan":"a8b70506e6d9fa59c6da05b623851bfeff2e4e27433474a39e892fd643046757"}}
```

**Goal:** A developer who uses Cursor can run the dashboard workflows Claude
Code and Codex already offer — execution, refinement, and an unattached
session — on Cursor's CLI, then find that session and continue it in the
embedded terminal, in the dashboard's workspace and with the handoff that
workflow already gives the agent.

**Scope:** Cursor becomes a launch choice beside Claude Code and Codex for
those three workflows, through the same dialog, startup handoff, and local
session record. The session starts in the dashboard-created workspace
(`<project folder>/.worktrees/<story slug>`, branch `cursor/<slug>`) with
`cursor-agent --workspace`, never Cursor's own worktree flag (`-w` or
`--worktree`). A worktree under the trusted project folder passed Cursor's
trust gate without `--trust` (observed 2026-09-30, no model call);
`.cursor/worktrees.json` does not run there, so Open Dough's own checkout
setup applies. The dashboard stores the UUID printed by `create-chat` before
the first prompt. That prompt carries the workflow's installed skill from
`.agents/skills` and, when the workflow has one, the established-start
handoff. Default omits `--model`. The developer can find that session later
and attach the embedded CLI with `cursor-agent --workspace <path> --resume
<uuid>`. One committing launch in the dashboard workspace is part of this
story's proof. This story does not read Cursor's native activity.

**Constraints:**
- One tool's success does not establish another's. An operation Cursor's CLI
  does not provide stays unavailable. Shared code never supplies Claude
  Code's or Codex's command, state map, alias, endpoint, or recovery advice
  in its place
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).
- The dashboard does not override Cursor's authentication, trust, approval,
  sandbox, or permission settings, and it does not integrate the graphical
  Cursor app. Starting the same work from the CLI remains available.
- Startup recovery advice comes from Cursor's own host description, or is
  omitted when that description has none. This story does not recreate the
  fallback that borrows another host's advice
  ([Startup recovery advice comes from the host description](SEED-075-host-neutral-dashboard-before-cursor.md#startup-advice-from-host-description)).

**Deferred promises:** Passive native state, attention derived from it, and a
confirmed-absence signal for a valid UUID. Rename, interrupt, native stop,
and tmux `persist` sessions. A model picker beyond Default. Those wait for
[See Cursor activity and use its native controls](#cursor-native-activity-and-controls).
Workflows the dashboard does not already offer for Claude Code and Codex, including CI
monitoring and unattached session workspace or landing choices. Discovering
sessions the dashboard did not launch. Changing Claude Code or Codex
behavior, records, or wording. These exclusions do not remove a local record
action that needs no native operation, such as deleting the dashboard's own
session record. Terry chose this split on 2026-10-02.

**Key examples:**

1. A queued story can start execution, and the project's folder has an
   authenticated Cursor CLI. The developer chooses Cursor, leaves the model
   on Default, and starts execution. The existing accept and startup handoff
   run. The session is in the dashboard workspace on `cursor/<slug>`, started
   with `cursor-agent --workspace`. Its first input contains the execution
   skill and the established-start handoff. The card shows that Cursor
   session. Claude Code and Codex launches still behave as they do now.
2. The same story offers refinement. The developer chooses Cursor and starts
   refinement. The preparation start and its handoff arrive in a Cursor
   session in that workspace layout. Published assignment facts, not the
   launch record, are what can show the story as being prepared. Local
   startup itself does not move the story.
3. The project row offers Start session. The developer chooses Cursor and an
   optional instruction. The dashboard records a session with no story, shows
   it in Recent sessions and the Sessions sidebar, and can open it in the
   embedded terminal in that same conversation after the page is reloaded.
4. A Cursor session was launched and the dashboard server has restarted. The
   developer selects it. The embedded terminal runs `cursor-agent --workspace
   <recorded path> --resume <stored uuid>`. It does not call `claude attach`
   or `codex resume`.
5. Cursor's registered boundary does not offer a native operation the session
   controls would otherwise use. The developer views that session. The
   control is absent, and the page does not run Claude Code's or Codex's
   command for it. Local record actions that do not need the missing
   operation remain.
6. A Cursor session is visible after launch. The sessions view does not show
   a working, waiting, or review state read from Cursor. Any unknown wording
   comes from Cursor's host description, not from Claude Code's listing
   failure or Codex's continuation note.

**Architecture:** Claude Code and Codex already share one launch model:
`LaunchHost` in `dashboard/server/launchHosts.ts`, host facts in
`dashboard/src/hostDescription.ts`, and one private module per host. Cursor
is the first host added after that generalization. It already has an identity
(`cursor`, branch namespace `cursor/`) and no runtime (`hostRuntimes.cursor`
is absent, and it is not offered because it has no skill sigil). This story
fills that slot. It does not add a second launch flow, dialog, or record store.

- Register one Cursor `LaunchHost` and keep its native commands private to
  that module, as Claude Code and Codex already do.
- Add only the shared facts presentation already reads: skill sigil,
  uncertainty hint, and unknown-observation wording. Offered models stay
  empty so the dialog keeps Default. A launch is offered because the
  description has a skill sigil.
- Keep session records a discriminated union on `host`. Add Cursor fields
  only for continuation data Cursor's own evidence needs. Do not copy
  Claude Code's alias or Codex's endpoint into the Cursor variant.
- Shared server and browser code keeps using the registered boundary and the
  host description. Do not add `cursor` branches there.
- If a native Cursor fact does not fit this contract, stop and name the gap
  before inventing a special case. That mismatch is an architectural
  question because this is the first new host on the generalized boundary,
  not a local exception to absorb in shared code.

**Observed** on `cursor-agent` 2026.10.01-e373342, 2026-10-02, without
`--trust`, `--force`, or `--yolo`. `--workspace` pointed at this project's
worktree passed the trust gate from `/tmp`. These facts replace the earlier
open questions they answer. Claude Code and Codex evidence still does not
transfer
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).

- `create-chat` prints a UUID and exits before any prompt. That probe wrote
  no local transcript, so the dashboard keeps the printed id.
- `--print --output-format json --resume <uuid>` returns that same
  `session_id`. `request_id` is one call, not an attach alias. A non-UUID
  fails immediately: `Persistent-session chat ID must be a UUID`. A
  well-formed UUID that was never created is claimed and succeeds, so a
  valid id has no confirmed-absence error.
- `--print` with no prompt exits with `No prompt provided for print mode`
  for both a real id and an unknown id.
- The same id resumed when `--workspace` pointed at a different checkout of
  this repository. The launch still starts in the dashboard workspace so the
  agent edits that tree. The conversation is not locked to the checkout that
  created it.
- An unknown `--model` fails before a reply (`Cannot use this model`).
  `cursor-agent models` lists the selectable ids; `auto` is the named
  default. `about` on this machine reported Claude Opus 5.5 300K High as the
  current model. Default means omitting `--model`.
- `ls` opens an interactive resume UI and fails in a non-TTY. `persist list`
  requires tmux, which this machine does not have. No passive status command
  was available. There is no rename command. `persist attach` and `persist
  stop` are the tmux lifecycle, not the dashboard's.
- `cursor-agent --workspace <path> --resume <uuid>` starts an interactive
  client in a PTY. SIGHUP did not reap that client. Ending it with SIGTERM
  left the same `session_id` resumable. No daemon was held.
- The ordinary continue command is `cursor-agent --workspace <path> --resume
  <uuid>`.

**Open decisions:** None for goal or scope. On 2026-10-02 Terry kept launch,
resume, the embedded resume command, and the skill handoff, including one
committing run, in this story. Passive state, rename and native stop, and a
model picker are the next story. The plan shows the terminal ready frame and
that the first prompt's skill handoff is followed.
**Plan:** [Use Cursor from the dashboard](../slice-plans/210-use-cursor-from-dashboard/PLAN.md).

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
[Use Cursor for the established dashboard workflows](#use-cursor-from-dashboard).
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

**Depends on:** [Use Cursor for the established dashboard workflows](#use-cursor-from-dashboard).

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
