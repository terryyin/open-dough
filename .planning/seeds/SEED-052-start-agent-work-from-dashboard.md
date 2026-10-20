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

<a id="cursor-attention-and-results"></a>

### 1. Receive Cursor attention alerts and read the result

**Identity:** SEED-052#cursor-attention-and-results
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/324-cursor-attention-and-results/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"99de78ae398c6c972dcd6fefe0d4af016661404609a5826412ca92318a50a9f4","plan":"91aea72d16c8dba1baed32d49020a1de3c2e64270e98d7f0c4be8c382cc53399"}}
```

**Goal:** For a developer following dashboard-launched Cursor work, the
dashboard notices when the session needs an answer or review, finishes with
attention, fails or is interrupted — where evidence proves that state — and
lets the developer read the question or result without continually opening
its terminal. The card, session entry, and desktop notification agree, and
each actionable transition alerts once.

**Scope:**

- Required: map the Cursor runner's held-screen evidence honestly into the
  shared session reading — a clarifying/waiting screen reads as needing
  input, the follow-up prompt after delivered work reads as ready for
  review, a working screen reads as working. A state the screen cannot
  prove (including failure or interruption shown only by a vanished client
  or process exit) stays unknown/unsettled, never a guessed success,
  failure, or review.
- Required: extend the existing explicit completion-report channel to the
  plan-execution/review handoff (execution complete before Land/Wrap Up),
  so a finished-with-attention or unfinished handoff alerts through the
  already-working unread-report path; intentionally quiet successful
  closure (completed, no attention message) stays quiet.
- Required: let a Cursor session's retained explicit report be read through
  the same passive final-report route other hosts use, and show the waiting
  question's text from the held screen where it is present. Reading never
  takes interactive control, resumes, or marks the session done.
- Required: failure and interruption attention only where a supported
  signal proves it — a failure/interruption screen the runner still holds,
  or an explicit unfinished report from the session. Where the native probe
  (below) proves no such signal, those states remain honestly unknown and
  this limit is recorded, not papered over.
- Deferred: a native Cursor final-answer reader from the local chat store
  or any speculative Cursor API; stopping/renaming Cursor sessions (story
  2); session-only model scope (story 3); new hook registration for
  dashboard attention.
- Rejection constraints: an idle composer or process exit alone must not
  be read as a successful outcome (existing seed boundary); unknown or
  unavailable observation must not alert as if it were activity (existing
  alert-selection rule).

**Key examples:**

1. Working session asks a clarifying question → the held screen shows the
   question → entry/card read *Needs input* with the question text
   readable, and one desktop notification fires; the developer answers in
   the terminal, the session works again, and a later new question can
   alert again.
2. Session finishes its turn to the follow-up prompt after delivered work,
   and plan execution hands off for review with an explicit
   completed-with-attention (or unfinished) report before Land/Wrap Up →
   entry/card read *Ready for review*, the unread report alerts once, and
   its text is readable inline and through the final-report panel without
   opening the terminal.
3. Session completes quietly (completed report, no attention message, or
   Land/Wrap Up's plain completed report) → no attention alert and no
   unread report; successful closure stays intentionally quiet.
4. Session fails or is interrupted and a held screen or explicit unfinished
   report proves it → entry/card read as failed/stopped with a usable
   explanation and alert once. If the client simply vanishes (runner not
   holding it, process exit alone) → the reading stays honest
   unknown/agent-not-running, with no success, failure, or review claim.
5. Runner is not running or cannot be reached → every Cursor session keeps
   its existing runner wording, needs no attention, and sends no alert;
   existing Codex and Claude readings, alerts, and result reading are
   unchanged.

**Architecture:** This story moves one responsibility: the Cursor host
boundary (`dashboard/server/cursorHost.ts`, today launch/options/sessions/
attach only) gains the same normalized observation and passive result
reading the other hosts already supply, instead of carrying raw screen
labels as `unknown` into shared presentation. Consequences that constrain
the promise: (a) shared presentation and alert selection already key on
the normalized `available` activities (waiting/review/failed/interrupted)
and suppress unknown observations, so honest screen→activity mapping is
sufficient for indicators, counts, and notifications to agree without a
second alert path; (b) the runner already holds each client's full screen
text, so classification belongs at the Cursor host boundary, keeping
screen wording private to that host like other hosts' native wording;
(c) the explicit report remains independent of native activity and stays
the only route that proves a *result*, so result reading reuses the
retained report rather than extracting a native final answer; (d) per
Accepted [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md),
deterministic dashboard tests do not prove native Cursor behavior — the
native probe and retained verification below own that evidence.
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
is Proposed and binds nothing here; no Accepted ADR conflicts with this
scope.

**Retained verification:** Confirm the affected notification/report journey
in native Cursor with an early paid probe: a dashboard-launched session
that asks a clarifying question, resumes, finishes to review, plus a
failing/interrupted run, observing which held screens (and failure/
interruption signals) actually occur before later work relies on them.
Include the still-unverified released CI identity-to-hook path from
[ODF-154](../../docs/maintainer/findings/ODF-154.md) when evaluating delivery
of CI attention to that same coordinator. Keep CI observation and developer
desktop alerts distinct. After delivery, update that finding with actual native
evidence or the precise remaining gap; do not rewrite its pre-fix occurrences
as post-fix failures or infer a watch start from installation alone.

**Investigation (2026-10-20, this refinement):** Facts from this checkout:
Cursor observation wraps runner screen labels as `unknown`, so
`nativeSessionShown` grants no attention and `alertReading` suppresses
them (only unread explicit reports alert today); the runner holds full
screen text and classifies only working / waiting-for-an-answer / at the
follow-up prompt; the Cursor boundary supplies no `readResult` (the
final-report request refuses Cursor), no stop and no rename, while Codex
supplies normalized activities and a passive final-answer reader and
Claude supplies normalized activities; explicit report text is already
readable inline for any host, and Land/Wrap Up — not the plan-execution
finish — is the handoff currently instructed to send a report; locally,
`cursor-agent` (2026.10.19) keeps per-chat `~/.cursor/chats/<hash>/<id>/
store.db` blobs whose format is not a supported dashboard source.
Hypotheses the probe must settle: which screens distinguish a clarifying
question, a finished turn, failure, and interruption; whether any held
screen proves failure/interruption at all. Terry selected the hybrid
route (honest screen mapping + execution-handoff reporting + retained-
report reading; no native final-answer extraction, no new hooks) and
authorized the early native probe on 2026-10-20. Size is unassigned.

**Depends on / safe stopping point:** No blocking story prerequisite is known.
Deliver usable attention and result access independently of the later control
and model stories; retain existing Codex and Claude behavior.

<a id="safe-cursor-session-stop"></a>

### 2. Stop and acknowledge Cursor sessions safely

**Identity:** SEED-052#safe-cursor-session-stop
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and outcome:** A developer stopping Cursor work can distinguish
acknowledging its dashboard record from interrupting execution, know whether
execution actually stopped, and continue without an unnoticed competing writer.

**Scope and evaluation:** Establish supported interruption and Done behavior
for an active Cursor session, including whether native naming can reflect Done.
Preserve report-backed local acknowledgement and recovery. Where interruption
cannot be confirmed, explain the remaining work/process state and preserve
recovery rather than claiming termination or starting a replacement writer on
the assumption that the earlier one stopped. Check stop/reopen and
report/acknowledgement independently; local Done must not masquerade as native
termination.

**Retained evidence:** [ODF-204](../../docs/maintainer/findings/ODF-204.md) records
one interrupted delegated refactor that continued, committed and pushed despite
its no-publication instructions while other work began in the checkout. Whether
the interrupt failed or later continuation reached that agent is unknown.
[ODF-229](../../docs/maintainer/findings/ODF-229.md) separately records an
interrupted implementation Task leaving edits without its proof return; no
unauthorized publication was observed there. These do not establish a shared
cause or a failure on every Cursor interruption.

**Evaluation of interrupted delegation:** Use bounded reproduction to establish
what remains active, how partial edits and missing proof are recovered, and what
prevents overlapping writers or unintended publication before work resumes.
Address both findings without relying on a promised agent return. After
delivery, update each linked finding with the actual response, release and
observation evidence or explicit remaining uncertainty; queueing resolves neither.

**Open questions and effort:** Native stop/rename capability, runner-owned
interruption, delegated-agent control and proof recovery need refinement before
choosing a mechanism. Size is unassigned. Do not infer that a dashboard stop
alone also stops every delegated agent.

**Depends on / safe stopping point:** No blocking story prerequisite is known.
Safe stop or explicit unconfirmed-stop recovery remains useful without model
selection changes or richer result reading.

<a id="cursor-session-model-scope"></a>

### 3. Choose a Cursor session model without changing later defaults

**Identity:** SEED-052#cursor-session-model-scope
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and outcome:** A developer choosing a model for one dashboard
Cursor launch gets that choice for the requested session while later sessions
retain the developer's default model.

**Known behavior and evaluation:** The current launch applies the selected
model to the first terminal client, and the UI already warns that Cursor also
saves it as the default. A stored resume omits that model flag. Establish the
actual native behavior before selecting a remedy. Evaluate default model A,
one launch explicitly choosing B, resumption of that session, and a subsequent
default launch: the selected session uses B and the later launch uses A.
Include overlapping launches and a deliberate intervening default change;
restoring a saved value must not overwrite a newer developer or session choice.

**Open decision and effort:** A supported session-only model mechanism has not
been demonstrated. If the host requires a persistent global change, bring the
constraint and product alternatives to the developer during refinement before
settling the promise; the existing warning alone does not satisfy this outcome.
Size is unassigned.

**Depends on / safe stopping point:** No blocking story prerequisite is known.
Model selection is independently evaluable; keep launch, default selection and
same-session continuation usable while its mechanism is resolved.

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
