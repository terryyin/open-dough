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

<a id="cursor-native-activity-and-controls"></a>

### Choose a Cursor model when starting work

**Identity:** SEED-052#cursor-native-activity-and-controls
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/217-choose-cursor-model/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d5897703ffc178faabb30c44409ba3a84db77024433794bcf410ad262e890977","plan":"d0038cfa1f48108aa9db0656fefbf7b45464b17f89156b7de250031e060cc98e"}}
```

**Goal:** A developer starting Cursor work from the dashboard can run it on a
model Cursor lists for their account, rather than only on Cursor's current
setting.

**Scope:** This starts from the Cursor launch delivered by
[Use Cursor for the established dashboard workflows](https://github.com/terryyin/open-dough/blob/317d0f1c24fdf3cb7b89960d11c7b259bf862b08/.planning/seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).
With Cursor selected, the launch dialog's Model menu lists the models
`cursor-agent models` reports, in its order, after Default. Default still omits
`--model`. A chosen id is sent as `--model <id>` on the launch's prompted run
only. The stored resume command stays as today, so the embedded terminal uses
whatever Cursor's setting is then. The record and the agent profile keep the
chosen id. The dialog says that Cursor also saves a chosen model as its
setting. An unreadable list is explained with Retry, and Default stays
startable. Start refuses an id Cursor no longer lists before `create-chat`.
A blank ad hoc start runs no prompt, so it refuses a chosen model and
explains why. Reasoning effort stays Codex-only.

**Constraints:** Cursor's own list decides which ids are offered. Claude Code
and Codex evidence does not establish Cursor behavior
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)). A
record names a model only when the dashboard sent it.

**Deferred promises:** Cursor session activity, rename, and stop, which wait
for a Cursor command that supplies them. tmux `persist` sessions. Restoring
Cursor's setting after a launch. Naming Cursor's current setting in the
Default label. Discovering sessions the dashboard did not launch. Changing
Claude Code or Codex.

**Key examples:**

1. Cursor lists `auto - Auto (default)` and `gpt-5.2 - GPT-5.2`. The
   developer opens Start execution and selects Cursor. The Model choices are
   "Default (your Cursor setting)", "Auto (default)", and "GPT-5.2", and the
   dialog says a chosen model also becomes the Cursor setting.
2. The developer chooses GPT-5.2 and starts. The prompted run is
   `cursor-agent --workspace <ws> --resume <id> --model gpt-5.2 <prompt>`. The
   record's request and the agent profile name `gpt-5.2`. The stored resume
   command has no `--model`.
3. The developer keeps Default and starts. No Cursor invocation carries
   `--model`, as today.
4. `cursor-agent models` fails. The dialog explains that Cursor's model
   choices could not be read and offers Retry. Starting with Default works.
5. A start names an id Cursor no longer lists. The dashboard refuses it before
   `create-chat`, and nothing is recorded.
6. The developer chooses GPT-5.2 for Start session with no instruction. Start
   is refused with an explanation that Cursor applies a chosen model with the
   first instruction. Default with no instruction works as today.

**Depends on:** [Use Cursor for the established dashboard workflows](https://github.com/terryyin/open-dough/blob/317d0f1c24fdf3cb7b89960d11c7b259bf862b08/.planning/seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).

**Current basis:** On 2026-10-02, `cursor-agent` 2026.10.01-e373342 lists
models as `<id> - <name>` lines through `cursor-agent models`. It has no
rename, stop, or status command for an ordinary chat; only tmux `persist`
sessions list and stop. Its interactive client saves `--model` as the global
setting in `~/.cursor/cli-config.json`. On 2026-10-02 the maintainer narrowed
this story to model choice and chose `--model` on the launch run only, with
the side effect disclosed.

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
