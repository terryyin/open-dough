# See when a dashboard session needs human attention

## Source and authority

- **Identity:** SEED-052#launch-claude-refinement
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#launch-claude-refinement),
  discussed and refined with Terry on 2026-09-29.
- **Authority:** refinement and slice planning. Terry authorized landing these
  preparation records on 2026-09-29. Execution requires a separate instruction;
  neither this plan nor its assessment grants Take or implementation.

## Outcome and boundaries

A developer notices which dashboard-launched Claude Code sessions need an
answer, have a result to review, or have failed or stopped. Each affected
session explains why, and its linked story card signals attention. The
developer can open the existing terminal to respond or mark the session done.

The story's five examples cover an answered refinement question, an execution
permission decision, a finished turn with a live or exited process, multiple
sessions on one story with an interrupted session, and autonomous work with an
idle process or an unreadable listing. The proof ownership below maps these
examples and their lifecycle boundaries to the slices.

Scope includes the selected project's unclosed refinement and execution
sessions, their Recent sessions and story-card entries, existing automatic
refresh, reason text, resumption, deliberate closure, and honest unknown or
unavailable observations. When a story leaves every displayed list, its
session's attention remains visible in Recent sessions.

Excluded: a state-aware skill chooser, additional skill-launch journeys,
completed-story reconciliation, browser or operating-system notifications,
external-session discovery, and Codex or Cursor support. Session state never
changes a story's published membership, refinement, readiness, or completion.

## Existing solutions and direction

PFE responsibility: interpret the host's current session observation once and
use it to help the developer find conversations requiring attention.

- Reuse `server/claudeCode.ts`'s fixed `claude agents --json --all` query and
  `server/agentLaunches.ts`'s join by recorded session ID. These already own
  local session observation, missing-listing states, and project isolation.
  Extend their existing state value with the optional host `waitingFor` field.
  The same value crosses `sessionStateSchema` in `src/agentLaunch.ts`; add no
  new endpoint, store, poller, callback, or transcript reader.
- Change the existing session presentation. Today `RecentSessions.tsx` owns
  `sessionStateWords`, which maps every running non-busy process to Idle.
  Plan 157 (`c6d9d68a:.planning/slice-plans/157-keep-story-session-links/PLAN.md`) moves that presentation
  into one entry shared with cards. Extend the landed shared entry and its
  state interpretation; do not restore a separate Recent sessions mapper.
- Reuse `useAgentLaunches`'s project-scoped records and refresh schedule,
  `attachOpens`, and the existing Mark as done operation. Card aggregation
  reads the same attention interpretation as the entry. Published assignment,
  readiness, and slice-progress models have a different domain purpose and
  cannot establish session attention.

The selected design follows Accepted
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
one meaning and representation per fact, with story progress derived from
published records. The ADR index and those in-file statuses agree; neither
record is superseded. Proposed ADR 0008 is not binding.

The existing [Architectural North Star](../../NORTH-STAR.md), topics “One
backlog interpretation, separate observation and presentation” and “Agent
launch as a requested assignment,” supports local launch evidence separate
from published progress. Its Started settlement detail is being replaced by
plan 157. Reconcile with that landed direction before product edits. No new
architectural topic or framework is needed. The
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) requires text
to carry statuses conveyed by color; attention will use visible wording and
quiet styling, without a pulsing presence animation.

## Current decisions

1. **One observation and interpretation.** Preserve host `state`, optional
   process `status`, and optional `waitingFor` in the existing transient
   session state. A single pure presentation of that value plus the record's
   `doneAt` supplies visible state/reason and whether attention is needed.
   Both entry rendering and story-card aggregation use it. Do not persist an
   attention flag or infer one from elapsed time or terminal connection state.
2. **Meaning comes from host state.** For an unclosed listed session:

   | Host observation | Visible meaning | Attention |
   | --- | --- | --- |
   | `blocked` | Needs input; include a useful reported waiting reason when present | Yes |
   | `done`, with or without process `status` | Ready for review | Yes |
   | `failed` | Session failed | Yes |
   | `stopped` | Session stopped | Yes |
   | `working`, including `status: idle` between autonomous steps | Working | No |
   | Listing unreadable or session unlisted | Existing State unknown or Session unavailable, with its explanation/controls | No inferred attention |

   Process liveness continues to serve attachment or host operations; it does
   not turn a done session into Working or a working session into Needs input.
   Keep host state fields string-valued and avoid rejecting a whole listing
   merely because a future host adds another spelling. An uninterpretable
   state is shown neutrally rather than guessed to be a question or result.
3. **Deliberate closure overrides attention.** A record with `doneAt` supplies
   no attention, even if the developer later opens it or its host process
   runs again. Preserve its observed session wording and attachment controls
   under the existing shared entry rules. Attention clears on the next
   observed working state, or on the successful Mark as done response. Opening
   or closing the terminal alone does not clear it.
4. **Story summary is derived from sessions.** An affected card has visible
   wording such as “1 session needs attention,” with plural wording for more.
   Its session entries identify their individual reasons and retain Open
   terminal. Compute the count from that card's unclosed records; one working
   session cannot hide another's attention. This does not change card order,
   stage, or published story facts, and introduces no global attention queue.
5. **Extend current proof seams honestly.** The fake Claude controls can
   publish blocked/waiting states, working/idle, done with a live or exited
   process, and failed/stopped states. When replacing a state, remove obsolete
   `waitingFor` as well as `state` and `status`. The synthetic attach only echoes
   input; changing a fixture to Working proves response to a new host
   observation, not that real Claude resumed because of an answer. Slice 1
   owns that actual host observation.

## Decisive premises and observations

Observed in this preparation workspace at `047a586c`, with only this story's
uncommitted refinement. The host query did not start or change any sessions.

| Premise | Literal observation and inspected locations | Result |
| --- | --- | --- |
| The supported host separates work state from process idleness. | `claude --version`; `claude agents --json --all` through Node `spawnSync`, reporting only state/status/field summaries. | Claude Code 2.1.284. Observed `done` with no status and with `idle`; `working` with `busy` and with `idle`; `stopped` without status. Therefore Idle cannot establish human attention. |
| Human-input state and reason have a supported interface, but this snapshot does not prove their runtime emission. | [Claude Code session-state reference](https://code.claude.com/docs/en/agent-view#read-session-state-from-a-script), inspected 2026-09-29; the same local listing above. | Documentation defines `blocked`, `status: waiting`, and optional `waitingFor`. None of the 494 listed sessions was currently blocked. Creating and answering a representative session consumes the authenticated host; slice 1 bounds that missing observation before dependent changes. |
| The reason is lost today, and can travel through the existing observation path. | Read `server/claudeCode.ts` `listedSessions`/`parsedListing`, `server/agentLaunches.ts` `withStates`, `src/agentLaunch.ts` `sessionStateSchema`, and `src/agentLaunchClient.ts` `readLaunchRecords`. | The parser and browser schema retain state/status only; the ordinary GET already joins every kept record with that parsed value. Optional `waitingFor` can use this same path. |
| The affected state value has other callers with distinct purposes. | `rg -n 'claudeSessions|sessionState|launchWithStateSchema|sessionRuns' dashboard/server dashboard/src dashboard/tests`; read `claudeLaunch.ts`, `doneMarks.ts`, `agentLaunchClient.ts`, and `doneMark.ts` at the named uses. | Launch confirmation, records reads, terminal lookup, and done responses use the same observation/schema. Extra reason data must not alter confirmation, attachment eligibility, stop/rename behavior, or stored launch records. |
| A browser journey can observe an automatically refreshed state without supplying the presentation itself. | Read `tests/agent-launch-recent-session-states.spec.ts`, `tests/agent-launch-session-listing.spec.ts`, `tests/support/fakeClaude.ts`, `src/agentLaunches.ts`, and `src/revisionCheckSchedule.ts`. | The fake controls host listing only; the real server join, HTTP schemas, page refresh, and rendering run. `passOnePace` proves one records read at the existing interval and retains a no-reload marker. The fake lacks blocked, failed, and working/idle variants; extend it inside slice 2. |
| The named focused proof is runnable in this workspace. | `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-session-listing.spec.ts dashboard/tests/agent-launch-recent-session-states.spec.ts`. | Exit 0; the quiet reporter was clean. Dependencies reused the existing installation through a temporary `node_modules` symlink after verifying matching lockfiles; the symlink was removed after observation. The first run failed the quiet reporter on an inherited NO_COLOR/FORCE_COLOR warning; the successful command removes that environment conflict without product changes. |
| Persistent card entries and deliberate closure are available on published trunk. | `git fetch origin`; `git show origin/main:.planning/PRODUCT-BACKLOG.md`; read plan 157 and `src/CardLaunches.tsx`, `src/WorkStages.tsx`, `src/RecentSessions.tsx`. | **Not yet true.** At fetched `047a586c`, the prerequisite story is queued and plan 157's changes are absent: cards still use Started settlement. Product slices 2 and 3 wait for that landing. |

**Start check:** before product edits, fetch the authorized trunk and verify
that SEED-052#keep-story-session-links has landed: persistent session entries
on Backlog/Preparing/Taken cards, one shared entry, `doneAt` closure, and its
focused proof. Reconcile names and proof paths with the landed implementation
and update this same plan if necessary. Stop the dependent path if the
prerequisite is absent; do not reimplement plan 157 here. A separately
authorized host probe may provide learning before that landing.

## Ordered slices

### 1. Confirm the host signals a question, an answer, and a finished turn
Type: Behavior
Status: planned
Proof: bounded manual CLI observation under `dough-manual-testing`, recorded
in this plan with Claude version, exact commands, session identifier, observed
state/status/reason, and what action produced each transition. No product test
or fake state can replace this host observation.

Behavior: A controlled real background Claude Code session asks one simple
question and waits. Its listing reports a state that distinguishes the need
for the developer's answer from working or a finished turn. Attach using the
existing CLI, answer, and observe resumed work and the finished-turn state.
Capture `waitingFor` if the host supplies it; absence of that optional reason
must still allow Needs input from `blocked`.

Use one short conversation in an owned, trusted project folder with existing
authentication and defaults. Request no product edits, preparation assignment,
or execution. Keep a five-minute observation budget, with preparation, question,
answer/result, and confirmation covered; pause for a human-required step rather
than silently changing permissions or credentials. Finish or stop only this
probe's session and preserve its result in the plan. Launching this real
conversation awaits execution or explicit manual-testing authority; planning
has performed only the read-only listing above.

If the host does not distinguish the waiting question reliably, stop dependent
slices and revise the host assumption. Transcript inference, hooks, or another
host integration are not implicit fallbacks. This slice yields the factual
learning needed to trust the existing interface and has no product-code edits.

### 2. Each session shows why it needs attention and clears it on resumption or closure
Type: Behavior
Status: planned
Proof: extend `agent-launch-session-listing.spec.ts` and
`agent-launch-recent-session-states.spec.ts` through the production listing
boundary and browser. Run
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-session-listing.spec.ts dashboard/tests/agent-launch-recent-session-states.spec.ts dashboard/tests/agent-launch-boundary.spec.ts dashboard/tests/agent-launch-done.spec.ts dashboard/tests/agent-terminal-boundary.spec.ts`
and `npm run typecheck:dashboard`.

Behavior: After one automatic read of changed host state, an unclosed session
shows Needs input with the available reason, Ready for review for a done turn
with a live or exited process, or the appropriate failed/stopped reason.
Both shared-entry placements show the same text and non-color attention cue.
Open terminal remains usable, and attaching/detaching does not clear the cue.
When the next listing reports work resumed, or Mark as done succeeds, the cue
clears without reloading. A closed record never regains attention from a later
host state. Working/idle and unknown/unlisted states have no inferred cue.

Carry optional waiting reason through `claudeCode.ts`, the shared schema, and
the existing read/answer path. Extend the landed shared presentation with the
single interpretation above, and render it in the existing entry rather than
creating parallel alert components for each state. Extend fake controls with
explicit host-shaped observations and remove stale waiting reasons on state
replacement. Reuse the current fake terminal to assert an answer reaches the
attached process; host resumption is supplied by a later fixture observation
and the actual causal host behavior is proved by slice 1.

The browser proof covers a missing waiting reason, a permission reason,
blocked while alive, done while alive and exited, failure/stop, resumption,
opening/closing while still blocked, successful Mark as done, and readable →
unknown → readable recovery. Retain existing attachment refusal and unknown
rules. Observe the same projection in a card entry and Recent sessions; test
the presentation once as a shared capability rather than repeating every
state for both placements. Session states remain transient: inspect a records
read after a host change and the unchanged stored launch record.

Update `dashboard/AGENT-LAUNCH.md`'s state descriptions, `dashboard/tests/README.md`'s
fake-control description, and the UX/UI North Star session wording in this
slice. This is the largest slice but has one outside-in outcome: accurate
per-session attention throughout its lifecycle. It includes observation,
transport, interpretation, rendering, proof, and slice-local cleanup together.

### 3. A story card calls out whichever of its sessions need attention
Type: Behavior
Status: planned
Proof: one focused browser journey in
`dashboard/tests/agent-launch-attention.spec.ts`, using the landed card-session
journey setup and the existing host-state controls. Run
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-attention.spec.ts dashboard/tests/agent-launch-recent-session-states.spec.ts`
and `npm run typecheck:dashboard`.

Behavior: One story has two unclosed sessions, one working and one waiting or
interrupted. The card signals the number needing attention and each entry
names its own reason. After answering/resumption or deliberate closure the
summary reflects the remaining affected sessions, and disappears when none
need attention. The same behavior holds when published facts place the story
on a Backlog/Preparing or Taken card. Attention does not change its stage,
position, or published preparation facts. Another project's session does not
contribute to this card.

Compute the summary from the same presentation result used by the entries.
Keep session membership and Mark as done owned by the prerequisite's existing
rules. Extend the journey through origin removing the story from all displayed
lists: its affected session remains reachable with the same reason and Open
terminal in Recent sessions. Unknown/unavailable sessions do not inflate the
summary. Include a reload/project-switch return with fresh host observations
to show that attention is derived rather than persisted or leaked between
projects. Update the feature documentation and UX/UI North Star card-summary
wording alongside this behavior.

## Proof ownership

| Final-state promise | Owning slice and observable proof |
| --- | --- |
| Host genuinely distinguishes a waiting question, resumed work, and a finished turn | 1: real CLI question → reply → result observation |
| Needs input, optional question/permission reason, done alive/exited, failed/stopped | 2: GET listing assertions plus shared-entry state journey |
| Existing interval updates attention without reload | 2: production refresh with `passOnePace` and no-reload marker |
| Same session meaning in Recent sessions and its card entry | 2: shared entry rendered in both placements; 3: summary agrees with entries |
| Answer reaches the session; opening/closing alone does not clear attention | 2: attached fake input and pending-state cue; 1 owns real causal resumption |
| Work resumption clears attention; Mark as done suppresses it even if reopened | 2: host-state change and successful done response, then later live state |
| Working with idle process, unknown/unlisted, and recovery are represented honestly | 2: host-shaped states and listing failure/recovery, existing controls preserved |
| Attention reflects each session; a working one cannot mask another; multiple affected sessions counted | 3: two-session card journey and count reduction to zero |
| Backlog/Preparing/Taken use the same rule; session state never establishes story completion | 3: origin-driven placement and unchanged published facts at each host change |
| Selected-project isolation and return/reload derive fresh attention | 3: switch/reload steps with unrelated project's records |
| Story outside displayed lists retains attention and Open terminal in Recent sessions | 3: origin removal followed by the surviving session entry |
| Schema extension preserves launch confirmation, done responses, and terminal attachment/refusal | 2: focused boundary consumers; no stored attention or reason value |

## Delivery and sizing

Use the installed `dough-execute-plan` workflow only after separate execution
authority. Each product slice includes the independent
`dough-post-change-refactor` pass before commit, focused proof after edits,
and the repository's `npm run format` with its exit status checked directly.
`scripts/lint.mjs` owns that format/check command; the inspected Git hooks
directory has no active commit hook. A formatting failure cannot be hidden by
a successful later command. Published CI and repairs stay owned by execution.

There is no project-supplied numeric slice target or hard limit in AGENTS.md
or `.planning/open-dough.json`; use one cohesive proof loop and the existing
overrun reassessment guidance without inventing a timing policy. The host
probe's five-minute mission budget bounds that observation only. Focused
Playwright tests and dashboard typechecking cover these changes; the entire
dashboard suite, installer checks, and payload tests are not local gates for
this feature. No skill or payload guidance changes are planned.

## Concern review

Three Behavior slices: one early factual probe, one complete per-session
attention capability, then the independently useful story summary. The latter
two extend one host observation, one session presentation, and the same
closure rules. Splitting the state mapper by individual states or splitting
transport from rendering would fragment one result and accumulate parallel
rules; retain the cohesive second slice. No Structure slice is needed after
the prerequisite's shared entry lands.

The host's missing question/reply observation is explicitly bounded by slice 1.
The remaining readiness blocker is the absent story-session-link prerequisite
for slices 2 and 3. Its landed names and behavior must be observed before
clearing that blocker; a plan for them alone does not prove they exist.

## Learnings

- Planning confirmed real working/idle and done/idle observations; process
  liveness and idleness cannot decide attention.
- No paid question/reply probe or product implementation has run in this
  planning session.
