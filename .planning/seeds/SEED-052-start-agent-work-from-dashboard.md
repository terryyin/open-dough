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

## Cursor follow-up evidence — 2026-10-20

Terry reported that a Cursor session finishing plan execution or becoming ready
for review did not send a notification. He selected the three follow-ups below
for the top of the product backlog and authorized preparation directly on main
and synchronization with origin. This selects queued work; it starts no execution.

The comparison inspected repository revision `70664aaef34cb9bcf302805b1a7493921c2a378d`.
It establishes current integration behavior, not a fresh native Cursor
reproduction or a claim that Cursor itself lacks every underlying capability:

- [Cursor observation](../../dashboard/server/hosts/cursor/sessions.ts) carries
  runner screen labels as unknown activity. [Presentation](../../dashboard/src/nativeSessionShown.ts)
  gives these no attention count, and [alert selection](../../dashboard/src/sessionShown.ts)
  suppresses native activity alerts for unknown observations. This affects input,
  review, failure and interruption awareness as well as the reported completion.
- Unread explicit completion reports can alert independently of native activity.
  [Launch instructions](../../dashboard/server/reportingInstruction.ts) describe
  reporting for Land/Wrap Up; [plan execution handoff](../../src/skills/dough-execute-plan/references/finish-or-stop.md)
  does not require sending that report. A completed report with no attention
  message is deliberately quiet; that is distinct from missing review attention.
- The [Cursor host boundary](../../dashboard/server/cursorHost.ts) supplies no
  native stop, rename or final-answer reader. Codex and Claude supply stop and
  rename; only Codex supplies a native final-answer reader. Cursor and Claude can
  still display an explicitly submitted report. Cursor's report-backed local
  Done acknowledges the record without stopping the native session.
- [Cursor model wording](../../dashboard/src/hostDescription.ts) already warns
  that a chosen model becomes the default for later sessions. Codex supplies its
  choice to conversation creation. Session-only Cursor selection has not been
  established by this comparison.
- [ODF-154](../../docs/maintainer/findings/ODF-154.md) retains the older lost CI
  observation problem and its fix released in 0.3.57. Its native identity-to-hook
  verification remains unestablished. This is a verification gap, not evidence
  that the released fix failed or that it caused the dashboard notification miss.

The interruption evidence remains owned by
[ODF-204](../../docs/maintainer/findings/ODF-204.md) and
[ODF-229](../../docs/maintainer/findings/ODF-229.md), linked from story 2 below.
Their occurrence histories and uncertainty must survive refinement and delivery.

## Story Decomposition

The developer using the dashboard evaluates each story through its visible
journey. All effort bands remain unassigned: the repository supplies no S/M/L
definitions. Each story records its principal sizing uncertainty instead of
inventing a scale. These are candidates for refinement, not executable plans
or claims of readiness.

<a id="cursor-runner-restart-resume"></a>

### 4. Keep Cursor sessions resumable across runner and machine restarts

**Identity:** SEED-052#cursor-runner-restart-resume
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** For a developer returning after the dashboard's Cursor runner
process or the machine restarts, every recorded Cursor session that was
resumable before the restart is resumable again through the dashboard,
running the dashboard's current Cursor code — not whatever runner
happens to still be alive.

**Scope:**

- Required: after a runner restart (including a machine restart), the
  dashboard can resume its recorded Cursor sessions through the ordinary
  attach/recovery paths; the saved conversation and any recorded session
  configuration scope survive, because they live in the launch record
  and the shared Cursor chats, not in the runner process.
- Required: a runner whose code predates the dashboard serving it is
  not silently reused for new keeps or resumes. The dashboard detects
  the stale runner and replaces or works around it in a way that does
  not strand the sessions it held: those sessions end as resumable
  records, never as silently lost work.
- Deferred: resuming sessions the dashboard did not launch; preserving
  a live in-flight turn across a restart (only resumption of the saved
  conversation is required); changing Claude or Codex runner behavior.

**Key examples:**

1. Runner process restarts (or the machine reboots) while Cursor
   sessions are recorded → developer reopens one through the dashboard
   → it resumes its saved conversation, with its recorded configuration
   scope when it has one.
2. A dashboard update changes Cursor runner code while an old runner
   still holds sessions → the next launch or resume runs the current
   code, and the previously held sessions remain resumable records.
3. Claude and Codex session behavior across restarts is unchanged.

**Investigation (2026-10-20, from the model-scope story's native
verification):** the dashboard reuses one machine Cursor runner by
design (`runnerProcess.ts` leaves an already-accepting runner as it
is). During SEED-052#cursor-session-model-scope slice 5, that runner
predated the delivered scope code, so real clients spawned without the
scope environment and the record's scope was dropped — native proof
was skipped by Terry's decision rather than taking the stale runner
down over unrelated sessions. When the runner was later restarted,
the production dashboard respawned it from its own deployment. Launch
records and saved chats already persist outside the runner, and
deterministic recovery specs exist; what is unestablished is native
resumption after a real runner or machine restart and any guard
against silently reusing a stale-code runner.

<a id="cursor-scope-terminal-refusal-explanation"></a>

### 5. Show why a scoped Cursor session's terminal open was refused

**Identity:** SEED-052#cursor-scope-terminal-refusal-explanation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/330-cursor-scope-terminal-refusal/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a9b7c72487a338694b4f1793a3363b3a9c8c023082655fe68e122a969fa28cf7","plan":"89318116f21da9cd8db93f30bc8aba560058bce75c2c2c3ab834cb05e0501a75"}}
```

**Goal:** For a developer opening the terminal of a chosen-model Cursor
session whose recorded configuration scope is missing or unreadable, the
terminal surface shows the scope refusal explanation — the session was not
continued with the shared Cursor configuration and nothing was started —
instead of only the generic attach failure.

**Scope:** Bounded retrospective correction of
SEED-052#cursor-session-model-scope (plan
[330](../slice-plans/330-cursor-scope-terminal-refusal/PLAN.md)). Only the
terminal attach/open surface changes; recovery/resume and cannot-load
replacement already surface the explanation and stay unchanged, other
attach failures keep the generic text, and no continuation falls back to
the shared configuration. Adds no feature promise.

<a id="cursor-chosen-model-unconfirmed-start"></a>

### 6. Start a chosen-model Cursor session again when its first prompt was never confirmed

**Identity:** SEED-052#cursor-chosen-model-unconfirmed-start
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** For a developer whose chosen-model Cursor execution start exits
before Cursor confirms the first prompt, the dashboard lets that story be
started again. The story first confirms that this outcome violates the
intended launch, then repairs the confirmed violation.

**Scope:**

- Required: a chosen-model Cursor start, including Auto, that establishes a
  configuration scope, exits before the first prompt is confirmed, and leaves
  the story protected. After the violation is confirmed, the developer can
  start that story again and the agent receives the execution prompt.
- Required: Continue and Recheck on that stuck start do not leave the story
  protected with no running agent and no way to start.
- Deferred: the terminal-open explanation when a recorded scope is missing or
  unreadable (SEED-052#cursor-scope-terminal-refusal-explanation); Claude and
  Codex launch; a Default Cursor launch that establishes no scope. This story
  does not change the Taken terminal-refusal story.

**Key examples:**

1. A chosen-model Cursor execution start's client exits before the first
   prompt is confirmed, and Cursor has no chat for the printed session → the
   developer can start that story again, and the agent receives the
   execution prompt.
2. Continue and Recheck on that start do not leave the card protected
   forever with the agent not running.
3. Opening the terminal of a session whose recorded scope is missing still
   shows the scope refusal explanation, and a Default Cursor launch is
   unchanged.

**Evidence (2026-10-20):** execution start `598ff2c1` for
SEED-052#cursor-scope-terminal-refusal-explanation published its assignment
at `0f1b0dc` and recorded Cursor session `1a53c2fb`. That resume client
exited about a second after it started. Cursor has no chat for that id, and
this is the only launch record that carries a configuration scope. The
attempt settled uncertain because the first prompt was not confirmed. Cursor
supplies no launch recovery, so Continue starts no other conversation while
that input is unconfirmed, and Recheck cannot list Cursor sessions. The
client's exit text was discarded, so the cause of the one-second exit is
still unknown. Effort is unassigned; the principal uncertainty is that
unknown exit and whether a session that never confirmed its first prompt may
be replaced.

## Ordering and Scope Reduction

On 2026-10-20 Terry selected the Cursor follow-ups above as the top three queued
items, in that order: attention/results first, safe stopping second, model scope
third. They preserve the existing near-future direction and unrelated backlog
order. No technical prerequisite between them has been established. The
following original ordering notes describe earlier delivery choices, not a
deferral of these newly selected Cursor stories.

Stories 2 and 3 make return and interaction useful; refinement launch and
embedded answers are already available. Story 4 now adds attention indicators
so the developer can notice when to return, after story-session links support
the same signal on cards.
Recent-session navigation can be delivered alongside terminal interaction if
refinement shows that separate delivery adds no useful stopping point.

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

## Open Decisions Before Refinement or Planning

- Define project S/M/L bands before assigning comparative estimates; none were
  found, so there is no defensible numerical or band distribution yet.

## When to Surface

The maintainer selected the eight child stories for backlog priorities 4–11
on 2026-09-28, replacing the original epic entry. This selection does not Take any story or authorize
implementation; refinement and executable planning are later selections.

## Breadcrumbs

- Terry's Cursor completion-notification report, comparison with other sessions,
  and instruction to preserve the known gaps as top-priority backlog work,
  2026-10-20. Repository inspection and finding links are retained above.
- Maintainer interview in this chat, 2026-09-28: Claude Code first, launch before
  setup relocation, default model, optional prompt, manual native terminal
  interaction, slight priority for interaction, independent recent sessions and
  recently done stories, and existing local project/tool setup assumed.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current dashboard behavior](../../dashboard/README.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
