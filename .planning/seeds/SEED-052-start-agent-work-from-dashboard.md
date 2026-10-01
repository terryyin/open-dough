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

### Current Codex launch baseline

Claude Code and Codex share host selection, workflow startup, installed options,
workspace preparation and durable launch records. Codex starts native refinement
and provides a command to read and answer in that same conversation. Its launch
also shares execution and ad hoc dispatch; broader workflow acceptance and
lifecycle support remain in the next story. Read the maintained
[launch contract](../../dashboard/AGENT-LAUNCH.md) for current behavior.
Refinement was the first delivery example; keep shared support available without
artificial workflow gates or a second dialog.

<a id="use-codex-from-dashboard"></a>

### Complete Codex support for dashboard workflows and sessions

**Identity:** SEED-052#use-codex-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/192-complete-codex-dashboard-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"671577db0f80f024216372aae606fd0e0a2119056b226c4822b4136d38b9cc36","plan":"33e80364209f168f9f6b4b2155b3c72302c42334c014d6531e10d67445c1e7db"}}
```

#### Goal and value

A developer who chooses Codex can complete the dashboard's established session
journey: start work, notice when to return, answer in the embedded native CLI,
leave and resume the same conversation, and explicitly finish or reopen it.
The external continuation command remains useful, but requiring it for every
interaction leaves the dashboard's return experience incomplete.

#### Current basis (reviewed 2026-10-01)

Terry confirms delivered refinement works. The first story already provides
host-qualified native conversation identity, durable first-input/recovery
evidence, installed skill activation and mechanical preparation. Execution and
ad hoc share dispatch; their useful native outcomes still need acceptance.
Codex's public host currently supplies launch/recovery, whereas observation,
embedded attachment and done controls are absent. Shared session presentation
still reads Claude's state vocabulary. Those are the remaining integration
gaps, rather than another launch dialog or a replacement preparation service.

The [first native acceptance](https://github.com/terryyin/open-dough/blob/719a5ef8525788bd7d9288cff8f97c76bf1f5b6b/.planning/slice-plans/189-start-codex-refinement-from-dashboard/PLAN.md)
proved external CLI answers in the original conversation and useful refinement
in its prepared workspace. It did not prove live state, embedded PTY detachment,
closure of every client, done/reopen, or native execution/ad hoc outcomes.
Fresh read-only observation with CLI and daemon 0.159.3 found that the same
historical conversation is not loaded but its latest completed turn remains
readable. Unloaded does not mean lost or unavailable.

#### Included behavior and key examples

1. **Notice when to return.** A dashboard-recorded Codex session starts working;
   native evidence later reports an approval/input wait, a reply ready for
   review, failure or interruption. Its card, Recent sessions and sidebar show
   the same meaning and use the existing transition-alert contract. Observation
   neither resumes the conversation nor takes interactive control. Ordinary
   completed prose questions are ready for review; Needs input requires native
   waiting evidence, not a guess from the wording.
2. **Answer and reconnect.** Open that session's embedded CLI, read its history
   and answer. Close the panel/page or restart the dashboard, then reconnect to
   the original native thread in its saved workspace and daemon endpoint. Keep
   context and avoid repeating the launch input, creating a fork or killing an
   active turn merely because a terminal client disconnected. Native trust and
   approval prompts retain the developer's configured policy and normal UI.
3. **Finish and reopen.** Mark a session done; keep the local mark and done-prefix
   name, end dashboard attachments and stop an active native turn for that
   conversation. Retain native history. Reopening continues that conversation
   and clears the local mark after successful attachment. A rename, interrupt
   or attachment failure is reported honestly; local intent does not establish
   native stop, story completion or successful reopening.
4. **Use the remaining starts.** Start planned execution with Codex; the native
   skill consumes the applicable established-start handoff and produces useful
   work in that workspace without another claim/setup. Start an ad hoc session
   with text and with an empty field: text reaches Codex once; empty opens a
   conversation awaiting the developer's first instruction. Both enter the same
   session journey, with the configured default model.
5. **Retain trustworthy history.** Earlier Codex launch records still continue
   by their original identity. An unreadable endpoint is state unknown; a
   confirmed missing conversation is unavailable; retained unloaded history
   stays resumable. One host/endpoint failure does not blank other sessions.
   Existing local record deletion remains available under its established
   eligibility rules, never deleting native history or resurrecting a record
   when an asynchronous observer finishes.

#### Boundaries and future alignment

Refinement was an acceptance example, not a workflow restriction. Reuse common
workflow/start/storage, terminal transport, session views and alert polling;
native semantics belong behind one public module per host. Distinguish saved
conversation identity, current activity and the developer's local done mark.
See the updated [North Star](../NORTH-STAR.md#agent-launch-as-a-requested-assignment).

No desktop-app integration, external session discovery, model/authentication
UI or Cursor acceptance is promised. Do not add gates to exclude naturally
supported workflows. [SEED-067](https://github.com/terryyin/open-dough/blob/aa488058c4305bd98c7ea049b5713bc2d8df1c24/.planning/seeds/SEED-067-codex-refinement-launch-reliability.md#resolve-codex-refinement-launch-failures)
records the completed launch/desktop-handoff investigation; reuse its fixes
without duplicating or claiming its unresolved desktop proof. Passive dashboard
observation and native CLI continuity must work regardless of that exclusion.
[SEED-066](SEED-066-composable-lightweight-session-options.md#composable-lightweight-session-options)
owns composable tracking/workspace/landing policy. Consume actual saved session
context when that work lands; lifecycle must not infer an assignment from the
existence of a conversation. CI-monitor event delivery remains separate work.

#### Dependencies, questions and sizing

Delivered refinement is the prerequisite; Cursor is not. Reuse its released
installation/activation proof where unchanged, and independently prove the new
native lifecycle and execution/ad hoc mechanisms. No new guidance release is
assumed merely to implement dashboard lifecycle support.

No unresolved product question was found in this review. Native PTY closure,
interactive ownership, status mapping and per-turn interruption remain empirical
questions, owned by an early isolated lifecycle probe before dependent changes.
Do not restart the shared daemon or alter model/approval/trust settings to pass
it. Failure changes the dependent plan rather than silently reducing the promise.

The planned remainder has eight slices, including feasibility and final native
acceptance. The largest uncertainty is session continuity and truthful state;
launch dispatch is already shared. No project S/M/L definitions or time targets
exist, so no invented band or duration is assigned. Keep one story for now,
reassessing if the probe reveals a broader integration problem. Each delivered
capability remains usable; unfinished promises stay visible in this story.

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
- **Known from launch:** Reuse the common host-qualified launch and record
  boundary in the maintained launch contract. Cursor must prove its native
  identity, observation, attachment and lifecycle independently; Claude's state
  vocabulary and listing read do not establish Cursor behavior.
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
The Codex remainder retains live-state and embedded-reconnect promises.
Refinement launch and recoverable conversation identity are already available;
retain them while assessing the remaining capabilities.

## Open Decisions Before Refinement or Planning

- Define project S/M/L bands before assigning comparative estimates; none were
  found, so there is no defensible numerical or band distribution yet.
- The Codex remainder's native lifecycle probe owns the remaining continuity
  and activity questions before dependent implementation. External continuation
  proof alone does not settle those questions.
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
- Maintainer direction in this chat, 2026-09-30: retain the remaining Codex
  experience as one story, allowing straightforward shared support without
  workflow availability restrictions. Assess Cursor independently.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current dashboard behavior](../../dashboard/README.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
