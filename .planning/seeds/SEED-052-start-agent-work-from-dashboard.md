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

<a id="safe-cursor-session-stop"></a>

### 2. Stop and acknowledge Cursor sessions safely

**Identity:** SEED-052#safe-cursor-session-stop
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/327-safe-cursor-session-stop/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8b320806d70a1d8211b171631ac1aa3174660b8b74e981ede8ead2c89ccda541","plan":"af04e0fcb532c273b0abcc63b24245ef99ba446bd3c318a0737a1f7041eaedad"}}
```

**Goal:** For a developer stopping Cursor work, the dashboard and the
execution workflow let them distinguish acknowledging a session's dashboard
record from interrupting its execution, know whether execution actually
stopped, and continue without an unnoticed competing writer — including when
the interrupted work is a delegated agent whose return never arrives.

**Scope:**

- Required: a **Stop** action for an active dashboard-launched Cursor session,
  separate from Mark as done. Stop attempts the supported interruption the
  native probe (below) proves, then reports *confirmed* or *unconfirmed* from
  post-stop observation. Stop alone does not mark the record done, complete
  the story, or delete the saved conversation or workspace; a stopped session
  can be reopened through its saved resume.
- Required: **Mark as done stays a local acknowledgement** for Cursor, as the
  report-backed path already is. It never claims the native session stopped.
  Whether native naming can also reflect Done is settled by the probe: where
  a supported rename exists it is attempted and its failure is shown; where
  none exists, the session makes plain that Done is a dashboard-local name
  only. Stop and report/acknowledgement are checked independently.
- Required: where interruption cannot be confirmed, the session explains the
  remaining work/process state (for example runner unreachable, client still
  held, or only a process exit), preserves reopen/recovery, and **blocks a
  replacement writer in the same workspace** until the stop is confirmed or
  the developer explicitly overrides with that risk shown. No wording claims
  termination on weaker evidence.
- Required: **interrupted-delegation recovery** in execution guidance. A
  delegated implementation or refactor agent whose call is interrupted and
  whose return never arrives is treated as incomplete: before any replacement
  writer, formatter, or delivery proceeds in that checkout, the coordinator
  inspects the checkout and the remote branch for the interrupted agent's
  edits, unexpected commits, and plan edits, and re-establishes focused proof
  from the checkout itself. Partial edits without that proof are not accepted
  as a done slice, whatever an interrupted agent later claims.
- Deferred: session-only model scope (story 3); richer native result reading
  beyond story 1; stopping sessions the dashboard did not launch or hold;
  any mechanism the probe shows Cursor does not support (recorded as a limit,
  not simulated).
- Rejection constraints: local Done must not masquerade as native termination;
  a dashboard stop alone must not be assumed to stop every delegated agent;
  an unconfirmed stop must not silently admit a competing writer.

**Key examples:**

1. Active Cursor session is working → developer presses Stop → the supported
   interruption runs and post-stop observation confirms the client is no
   longer held/working → the session reads as stopped, its record stays
   un-done, and reopening resumes the saved conversation without claiming
   the story completed.
2. Developer presses Stop but the runner is unreachable, the client still
   reads as working, or only a process exit is observable → the session
   reports the stop *unconfirmed* with the remaining state named, offers
   reopen/recovery, and blocks starting a replacement writer in that
   workspace until confirmation or an explicit override that shows the
   competing-writer risk.
3. Cursor session submitted its explicit report (or is otherwise
   acknowledgeable) → developer presses Mark as done → the record moves to
   Recently done as a local acknowledgement only; the wording does not claim
   the native session stopped, and a supported native Done naming, where the
   probe proves one, is attempted separately with any failure visible.
4. Session was marked done locally and is later found still held/working →
   that native state is shown as it is; the local mark is never rewritten
   into a termination claim, and Stop remains available on its own terms.
5. Coordinator interrupts a delegated Task and no return arrives → the slice
   is treated as incomplete: the coordinator inspects the uncommitted diff,
   the plan, and the remote branch, re-runs the focused proof from the
   checkout, and only then accepts, repairs, or discards the partial edits;
   no replacement writer or formatter runs in that checkout meanwhile.
6. An interrupted delegated agent later commits and pushes despite its
   no-publication delegation (the ODF-204 pattern) → the unexpected commit is
   detected before delivery builds on it, work pauses, and accepting or
   discarding that commit is the developer's decision; the coordinator does
   not deliver on top of it blindly or mark the slice done on its claim.
7. Claude and Codex stop, rename, and Mark as done behavior is unchanged.

**Architecture:** Two responsibilities, kept distinct because no dashboard
mechanism controls the second. (a) The Cursor host boundary
(`dashboard/server/cursorHost.ts`, today launch/options/sessions/attach only)
gains a stop operation — and a rename only where the probe proves one
supported — following the same optional-operation pattern Codex (RPC
turn/interrupt after verifying the active turn; native rename) and Claude
(`claude stop`; terminal rename) already supply through
`dashboard/server/launchHosts.ts`, so the shared Done orchestration and the
UI's capability facts stay host-neutral. Because Cursor clients live in the
separate runner process, which already holds each PTY and can hang it up
(SIGHUP), a dashboard stop must act through that runner and be *confirmed by
re-observation*, not by the dashboard server's local attachments or by the
request having been sent. (b) Interrupted-delegation recovery is execution
guidance for the coordinator (delegation and proof-acceptance guidance in
`dough-execute-plan`): it cannot rely on a host control the dashboard does
not have over an in-session Task, so it owns detection and proof recovery
instead. Per Accepted
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md),
deterministic fake-runner tests prove the dashboard protocol, not native
Cursor termination; the native probe and retained verification own that
evidence. Guidance wording follows ADR 0006 (written for the executing agent
in its project). [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
is Proposed and binds nothing here; no Accepted ADR conflicts with this scope.

**Investigation (2026-10-20, this refinement):** Facts from this checkout:
the Cursor boundary supplies no `stop`, `rename`, or `readResult`; the UI
therefore offers Mark as done for Cursor only where a completion report
already makes it a local acknowledgement, and the shared Done flow otherwise
requires a native stop. The Cursor runner already holds each session's PTY
and exposes a hangup (SIGHUP to the PTY) used by recovery and shutdown; the
fake Cursor client exits on SIGHUP, which proves the dashboard protocol
only. Locally, `cursor-agent` (2026.10.19) exposes no stop or rename for the
runner-kept `--resume` sessions the dashboard launches; its
`persist stop <session>` manages tmux-backed persisted sessions (tmux is not
installed here) and is not the dashboard's launch mode, so it is not an
established stop source. Execution delegation guidance already forbids the
delegated agent committing, pushing, or marking a slice done and already
makes the coordinator own proof acceptance, but it has no interrupted-return
recovery: nothing yet requires checking for a still-active interrupted
agent, its unexpected remote commits, or re-proving partial edits before a
replacement writer proceeds. Hypotheses the bounded native probe must
settle: whether hanging up (or another supported input to) the runner-kept
`cursor-agent` client actually stops an in-flight turn, including delegated
subagents it spawned, and what observation confirms that; whether any
supported native naming reflects Done; and what an interrupted native Task
call actually leaves running. Terry decided on 2026-10-20: keep the
dashboard and delegated-recovery parts in this one story, keep Stop and
Mark as done as separate actions, and block a replacement writer on an
unconfirmed stop until confirmation or explicit override. Size is
unassigned.

**Retained evidence:** [ODF-204](../../docs/maintainer/findings/ODF-204.md) records
one interrupted delegated refactor that continued, committed and pushed despite
its no-publication instructions while other work began in the checkout. Whether
the interrupt failed or later continuation reached that agent is unknown.
[ODF-229](../../docs/maintainer/findings/ODF-229.md) separately records an
interrupted implementation Task leaving edits without its proof return; no
unauthorized publication was observed there. These do not establish a shared
cause or a failure on every Cursor interruption. After delivery, update each
linked finding with the actual response, release and observation evidence or
explicit remaining uncertainty; queueing resolves neither.

**Depends on / safe stopping point:** No blocking story prerequisite is known.
Safe stop or explicit unconfirmed-stop recovery remains useful without model
selection changes or richer result reading. Story 1's attention reading is
independent: an unconfirmed stop is explained from runner/process evidence
this story owns, not from story 1's normalized activities.

### Correction: An unconfirmed stop still blocks a replacement after local Done

**Identity:** SEED-052#cursor-unconfirmed-stop-after-local-done

**Goal:** For a developer who marked a still-working Cursor session done
locally and then pressed Stop without confirmation, the dashboard still
blocks a replacement writer in that workspace until confirmation or an
explicit override, and offers the local Mark as done from the open terminal
panel as it does from the session entry.

**Scope:** Bounded retrospective correction of
SEED-052#safe-cursor-session-stop (plan 327); adds no feature promise.
Included: the replacement-writer block follows the retained
`stopUnconfirmed` explanation regardless of the local done mark; the
terminal panel's Mark as done follows the same host capability facts as
the entry. Preserved: Stop and Mark as done stay separate, local Done
never claims native termination, Claude and Codex behavior is unchanged,
and native Cursor termination remains unverified. Plan:
[329-cursor-unconfirmed-stop-after-local-done](../slice-plans/329-cursor-unconfirmed-stop-after-local-done/PLAN.md).

<a id="cursor-session-model-scope"></a>

### 3. Choose a Cursor session model without changing later defaults

**Identity:** SEED-052#cursor-session-model-scope
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/329-cursor-session-model-scope/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a0d39f687dccb6b9893df9990816c689e3d2c78a2d15d2c557d6eed327afc47e","plan":"2e0d2b3f85a05af697b7d3cddc1f3d56265a942ecaef1725098d52e0e02d4ab4"}}
```

**Goal:** For a developer choosing a model for one dashboard Cursor launch,
that session — including its later resumption — runs on the chosen model,
while the developer's Cursor default and every later Default session remain
whatever the developer's own Cursor setting says at that time.

**Scope:**

- Required: a Cursor launch with an explicitly chosen model runs that session
  in a **session-scoped Cursor configuration** cloned from the developer's
  current Cursor configuration at launch. Cursor's own persistence for that
  session (its chosen model, and any model the developer later picks inside
  that session) lands in the session's configuration, never in the shared
  Cursor configuration. The mechanism proved for this is the
  `CURSOR_CONFIG_DIR` environment hook (see Investigation); chats, MCP
  configuration, and other shared Cursor state stay in the shared home, so
  the saved conversation and its resumption remain the ordinary ones.
- Required: the launch record remembers the session's configuration scope,
  and every continuation of that session — terminal attach/open,
  recovery/resume, and any replacement resume — reuses the same scope, so a
  resumed chosen-model session still runs on its session model and still
  cannot rewrite the shared default. A continuation that cannot re-establish
  the recorded scope does not silently fall back to running the session
  against the shared configuration.
- Required: the dialog stops warning that a chosen Cursor model becomes the
  developer's Cursor setting for later sessions; its wording states the
  choice applies to this session. Default (no explicit choice) launches are
  unchanged: no session scope is created, no `--model` is sent, and they keep
  following the developer's current Cursor setting.
- Required: overlapping chosen-model launches each keep their own model and
  scope without disturbing each other or the shared default, and a deliberate
  change the developer makes to their Cursor default between a session's
  launch and its resumption is preserved: the resumed session keeps its own
  model in its own scope and does not overwrite the newer default, and a
  subsequent Default launch uses that newer default.
- Required: the session scope's lifetime follows the launch record that
  remembers it: it is retained while that record keeps the session resumable
  and removed when that record is removed, without touching the shared
  configuration or the saved conversation.
- Deferred: isolating Default sessions or changing their existing resume
  behavior; per-session scope for Claude Code or Codex (each already scopes
  its model choice to its session); carrying a session's frozen non-model
  Cursor settings forward after launch; any Cursor mechanism a future native
  check shows superseding the environment hook.
- Rejection constraints: a chosen-model session must not write its model
  into the shared Cursor configuration, on launch or on any resume; restoring
  or copying back a saved shared value must not overwrite a newer deliberate
  default or another session's choice (no save-and-restore of the shared
  file is the mechanism); a Default launch must not gain a session scope or
  a model flag it did not have.

**Key examples:**

1. Shared Cursor default is A → developer launches a Cursor session choosing
   model B with an instruction → that session runs on B, the shared Cursor
   configuration still says A afterwards, and the launch dialog no longer
   warns that B becomes the setting for later sessions.
2. That B session is later resumed (terminal attach or recovery, after its
   client is no longer held) → the resumed session runs on B again, from its
   recorded scope, and the shared configuration still says A.
3. After the B launch, the developer deliberately changes their Cursor
   default to C → the B session is resumed → it still runs on B and the
   shared configuration still says C; a new Default launch then runs on C.
4. Two chosen-model launches overlap, one choosing B and one choosing C →
   each session runs and resumes on its own model, and the shared default
   remains A throughout.
5. A Default Cursor launch, and Claude Code and Codex launches with chosen
   models, behave exactly as today: no Cursor session scope is created for
   them and their model handling is unchanged.
6. The launch record for the B session is removed → its session
   configuration scope is removed with it; the shared configuration and the
   saved Cursor conversation are untouched.
7. A blank ad hoc Cursor start with a chosen model remains refused, as
   today: no Cursor run would apply the choice.

**Architecture:** The Cursor host boundary
(`dashboard/server/cursorHost.ts` and `dashboard/server/hosts/cursor/`)
gains one responsibility: establishing and naming a session-scoped Cursor
configuration for a chosen-model launch and carrying that scope through the
runner keep/attach/recovery protocol, so every process that runs the
session — the first kept client in the separate runner process and any
later resume — inherits it. The launch record's Cursor continuation is the
durable memory of the scope; older records without it keep today's behavior.
This follows the same host-boundary pattern as the other hosts' session-only
model handling (Codex supplies its choice to conversation creation; Claude
sends `--model` per session) without moving any model logic into shared
launch code. Per Accepted
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md),
deterministic fake-runner tests prove the dashboard protocol — scope
creation, inheritance, and non-interference — not native Cursor behavior;
the native probe in the Investigation and retained native verification own
that evidence. Guidance and UI wording follow
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
where skill prose is touched.
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
is Proposed and binds nothing here; no Accepted ADR conflicts with this
scope.

**Investigation (2026-10-20, this refinement):** Facts, each with its source.
(1) From this checkout: the current launch sends `--model` only on the first
terminal client and never in the stored resume command
(`dashboard/server/hosts/cursor/launch.ts`), and the dialog warns that
Cursor also saves a chosen model as the developer's setting
(`dashboard/src/hostDescription.ts`). (2) From the installed
`cursor-agent` 2026.10.19-6bbf2c4 bundle on this machine: a startup
`--model` is an initial model whose handler persists it into the CLI
configuration file (`~/.cursor/cli-config.json`, or
`$CURSOR_CONFIG_DIR/cli-config.json`) with `hasChangedDefaultModel: true`;
each turn records a per-chat `lastUsedModel`; and resuming a chat without
`--model` restores that stored model through a setter that persists it into
the same CLI configuration again. So neither the first launch nor a resume
is session-only today, and a resume can overwrite a deliberate intervening
default change. No session-only model flag appears in `cursor-agent
--help`. (3) From an unpaid native probe run in this refinement (no prompt
was submitted, so no model inference ran): with
`CURSOR_CONFIG_DIR` pointed at a copied `cli-config.json`,
`cursor-agent --workspace <scratch> --model gpt-5.2` showed GPT-5.2 as the
session model and persisted `gpt-5.2` as `model`/`selectedModel` only in the
isolated file; the shared configuration's model fields remained
`default`/Auto, and `cursor-agent models` read the isolated configuration
successfully. The same bundle reads user MCP configuration from
`~/.cursor/mcp.json` by home path, not from the config directory, and chat
storage resolves under the data directory, so config-only isolation leaves
MCP and saved conversations shared. Explored alternatives: save-and-restore
of the shared configuration's model fields (rejected — it needs an unsettled
restore moment, serialization of overlapping launches, and crash recovery,
and fights Cursor's resume re-persistence); isolating the whole Cursor data
directory (rejected — it would also isolate saved chats and break ordinary
resumption); keeping the warning (rejected — it does not deliver the
outcome). Borrowed mechanism: a browser's per-session profile cloned from
the default profile — the session's changes stay in its profile and the
default profile is untouched. Mapped here: profile directory ↔ session
`CURSOR_CONFIG_DIR`, default profile ↔ shared Cursor configuration, cloned
profile contents ↔ the `cli-config.json` copy. The analogy's consequential
limit: the clone also snapshots non-model CLI settings (display,
permissions, caches) at launch, so a resumed session sees those as of launch
rather than the developer's current values; the story defers reconciling
that. Remaining hypothesis, bounded as an early probe in planning rather
than settled here: the environment hook is honored by the installed bundle
and probe, but it is not a documented public flag, so execution must
re-prove it against the then-installed Cursor before dependent slices rely
on it. Terry selected the session-scoped configuration direction on
2026-10-20 over save-and-restore and over dropping the session-only promise.
Size is unassigned.

**Depends on / safe stopping point:** No blocking story prerequisite is
known. Model selection remains independently evaluable; Default launch and
same-session continuation stay usable while the session-scope mechanism is
resolved. This story shares no mechanism with the Cursor attention or safe
stop stories.

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
