# Session meaning and wording follow the host

**Identity:** SEED-075#host-neutral-session-meaning
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#host-neutral-session-meaning)
**Authority:** Preparation only; Terry accepted the recommended Codex alert
policy and requested the original slice plan on 2026-10-01. The current request
authorizes readiness with an agent-owned wait for the prerequisite's first
slice. Implementation will start only on Terry's later execution instruction.
**Preparation:** Established one-shot preparation in the default checkout
`/Users/terryyin/git/open-dough`, branch `main`, starting revision
`11f748a9b0e58263351e18fb37053cb2d6378221`, remote `origin`, target `main`,
integration checkout `/Users/terryyin/git/open-dough`, landing `review`.
No Preparing assignment is published. The original isolated preparation's
observations remain attributed to its revision below.

## Goal and scope

A developer sees a recorded session's own host in observation, continuation,
and refusal wording. Notifications follow the meaning reported by that host,
not a host-name condition in shared presentation. Pending execution and
refinement name the host actually launching the session.

Explicit unrecognized Codex native statuses now alert as Claude Code's do;
unreadable metadata or an incomplete latest-turn read remains quiet. An
unrecognized state stays unsettled and adds nothing to attention counts.
Preserve recognized activity, confirmed absence versus unknown observation,
done marks, notification baseline/deduplication, existing correct host wording,
and saved continuation commands, workspaces and notices.

Correct implicated boundary comments, including the terminal URL's existing
`host` parameter. Defer Cursor integration, new continuation/attachment
capabilities, stored-record changes or legacy-default changes, launch gates,
and notification transport changes. No new store or host framework is needed.

## Architecture and PFE

Follow Accepted [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
§§3–5: distinguish domain facts, reuse one owner per responsibility, and add
only current necessary structure. Follow Accepted
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for shared proof and host-specific differences. The ADR index and record
statuses agree; no conflict or exception was found. ADR 0008 is Proposed.

The existing [North Star agent-launch topic](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
already selects host-owned native normalization, shared session presentation,
one host description and shared polling/alerts/transport. Extend that model;
no new direction topic is warranted. Preserve the existing
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) placement and
navigation; this work changes wording and observation meaning, not layouts.

PFE searched host/session/continuation/notification and pending-workflow
responsibilities across dashboard code, tests, docs and source guidance:

| Existing solution | Decision and consuming boundary |
| --- | --- |
| `server/hosts/{claude/runtime,codex/sessions}.ts` → `SessionObservation` → `withStates` | Extend native normalization to carry the unrecognized-observation alert fact. The Codex reader already distinguishes an unexpected status from a failed latest-turn read; shared presentation must consume that meaning without parsing descriptions. |
| `src/sessionShown.ts` → `SessionEntry`, `SidebarEntry`, attention summaries and `server/sessionAlerts.ts` | Keep one reading and one alert decision. Extend the prerequisite host description with the small unknown-reading wording needed here, preserving host-less attention calculations without attributing them to Claude Code. |
| `src/LaunchSession.tsx` → every card/Recent session entry | Reuse its existing continuation presentation and `shellCommand`; derive the label from the session's host description. No new continuation operation. |
| `server/agentLaunchAdmission.ts` → `AgentTerminals` HTTP refusal | Retain capability/record/origin/availability admission. Name the recorded host in the existing refusal; no alternative attach path. |
| `src/launchWorkflow.ts`, `StartLaunch`, `CardLaunches`, `StartProgress` | Keep one workflow wording function. Carry the actual host through existing running-start progress and polling, including kept-start retries, rather than use a browser's independently selected host. |

## Prerequisite handoff and autonomous observation

Terry selected parallel execution on 2026-10-01: this agent may start execution
and watch for **slice 1, Launch choices and answers use the selected host's
description**, of [the host-description plan](https://github.com/terryyin/open-dough/blob/0e43ebae12253183d961464f5b064ac0b78f00f3/.planning/slice-plans/205-one-host-description/PLAN.md).
The whole prerequisite story need not finish. Its slice 1 owns the description
and registry that this story consumes; later capability and explicit-host
slices may run alongside this work.

Fresh `git fetch origin main` and `git rev-parse origin/main` at this review
returned `7f2ce02e41278fafed9df3674b187e822d6b48ed`. The prerequisite is Taken,
but its slice 1 is still planned and its contract is absent. This is an
owner-held future delivery, not an assumed existing API. The early Structure
probe below owns waiting, integration and observation before any dependent
Behavior starts. This replaces the former whole-story readiness blocker.

The executing agent owns the watch in its execution session. Fetch `origin main`,
inspect the published prerequisite plan and candidate code, then wait 30 seconds
between checks while the first slice remains undelivered. Use interruptible
waits of at most 60 seconds; remain responsive to the developer and report
meaningful changes. Remember the last observed SHA in the conversation and
inspect again when it changes. Do not ask Terry to notify the agent, require
another start instruction after delivery, or create a watcher script, service,
scheduled job or parallel status file. Execution's ordinary durable proof and
consequential decisions belong in this plan.

A published slice status alone is insufficient. Confirm that its actual
contract and associated preservation proof are on fetched trunk. If the plan
has been cleaned up after completion, inspect the delivery history and current
code instead of waiting forever for a removed plan. Integrate the delivered
revision through the execution workflow's normal non-force reconciliation in
this story's own checkout. Never modify the prerequisite's checkout or supply
its missing descriptor/dispatch/model implementation here. Fetch failure leaves
the gate closed; retry transient failure and report any access decision that
needs the developer. An unavailable or incompatible contract keeps dependent
work stopped; record the evidence and reassess before changing the approach.

After successful verification, continue automatically with this story's four
Behavior slices. Keep the delivered descriptor and host operations as the
shared owners. Changes to `sessionCapabilities`, `launchWorkflow`, `StartLaunch`,
`LaunchSession`, `agentLaunchAdmission`, tests and maintained launch docs may
intersect with the prerequisite's remaining work: reconcile published changes
before delivery, preserve both stories' promises, and rerun affected proof.
Do not undo capability, explicit-host, launch-gate, workspace-access or native
creation-evidence behavior. Preserve the separately delivered session-record
shape. No new architecture or product scope is selected by this handoff.

## Observed premises and proof ownership

On 2026-10-01, the unchanged product at `4f4a7d2b` passed this isolated
vendor-substitute preservation run (exit 0, quiet reporter):

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-observation.spec.ts agent-launch-codex-observation-alerts.spec.ts agent-terminal-boundary.spec.ts agent-terminal-codex.spec.ts agent-launch-start-phases.spec.ts
```

The worktree lacked dependencies. A temporary symlink to
`/Users/terryyin/git/open-dough/node_modules` enabled the run and was removed
after planning. Tests build this checkout's product and run real browser,
HTTP/store, native adapter, WS/PTY and polling boundaries with vendor replies
and notification delivery substituted. No real host session or notification
was started. This is evidence of the current behavior, not the proposed change.

| Premise and operation consuming it | Literal observation and result | Promise owner |
| --- | --- | --- |
| Unexpected Codex status and failed latest-turn read are distinguishable before presentation/notification | Read `server/hosts/codex/sessions.ts` and `tests/support/fakeCodexObservation.ts`; the reader branches on native status or catches the turn-read failure. The baseline alert spec drives both through real polling and currently observes silence for both. | Slice 2 changes only the explicit-status alert policy. |
| All session surfaces consume the shared reading and preserve conservative unknown/absence meanings | Baseline `agent-launch-codex-observation.spec.ts` reads native replies through HTTP and checks card, Recent and sidebar readings/counts; inspected `SessionEntry`, `SidebarEntry`, `attentionCount`, `alertReading` and `SessionAlerts.poll` consumers. | Slice 2 preserves example 1, example 5's unsettled/count meaning, example 6 and done semantics. |
| Continuation presentation uses the kept record, not a new native resume | Read `src/LaunchSession.tsx`, `shellCommand` and its `SessionEntry` consumer; workspace/args/notice come directly from the saved continuation, while its label is hard-coded Codex. `agent-launch-codex.spec.ts` supplies a real launched/retained record but does not assert every continuation word. | Slice 3 adds the missing visible continuation preservation assertions for example 2. |
| An unavailable recorded session is refused before a PTY starts, and the message crosses the upgrade boundary | Baseline Claude terminal spec proves 410 and no attach for a readable omission; `admittedAttach` uses `attachOpens` and currently says Claude Code for every host. Read `AgentTerminals.refuseUpgrade`: it serializes that message as JSON in the HTTP body. Existing `refusedStatus` discards the body. | Slice 4 captures the actual refusal body and native no-attach result for example 3. |
| Another page can show running-start phase but currently cannot know its host | Baseline start-phases spec starts via HTTP, holds real preparation/native launch, then reloads the page and asserts phase wording. Read all `startPhaseWords` callers and `StartProgress.set/all`, `runningStartSchema`, `useAgentLaunches.startPhaseOf`: host is lost before formatting. Execution and preparation starts both set the progress. | Slice 5 carries host through these consumers for example 4. |
| The prerequisite's first-slice contract will be delivered by its owner before dependent behavior | Fresh `git fetch origin main`; `git rev-parse origin/main`; inspect the published prerequisite plan and backlog at `7f2ce02e`: the story is Taken, first slice is planned, and code still lacks its contract. Read the first slice's promised browser-safe description and server registry handoff. Delivery cannot be observed before its owner implements and publishes it; no API is invented here. | Slice 1 is the early owner-held delivery probe; it watches and verifies actual consumption before slices 2–5. |

The current pure/native-status assertions in
`agent-launch-codex-observation-status.spec.ts` and observation-boundary specs
also consume the live schema. Update expectations for genuine new observation
facts without changing stored-record fixtures. Vendor substitutes must supply
native replies only, not the normalized meaning or final wording being proved.

### Current preservation observations

At `7f2ce02e` on 2026-10-01, reran the original baseline command above in
the default checkout: exit 0 with the quiet reporter. It reaches current native
observation replies, background alert polling, page readings, HTTP terminal
admission and launching/preparation progress. The two product changes since the
original baseline qualify Codex continuation by host and add workspace-aware
access; neither establishes the future descriptor contract.

The following additional current run also exited 0 with the quiet reporter:

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-codex.spec.ts session-workspace-retirement-attach.spec.ts session-workspace-retirement-done.spec.ts
```

Its setup and observations reach the real launch/page/store and HTTP/WS access
boundaries using native protocol substitutes. It confirms current continuation
presentation, missing-workspace passive report fallback and deliberate done
intent. Read `LaunchSession` and `sessionAccess`: continuation commands require
terminal access. Slice 3 preserves that condition; host-neutral labeling must
not restore commands for unavailable workspaces. These are current behavior
observations, not proof of the proposed wording or future handoff. The early
probe owns observation of the owner-held contract after delivery.

## Ordered slices

### 1. Observe and integrate the prerequisite's first-slice contract
Type: Structure
Status: planned
Proof: Observe the published candidate and its first-slice delivery evidence,
integrate it in the execution checkout, inspect its actual description/registry
exports and existing name consumers, then run `npm run typecheck:dashboard` and
`env -u NO_COLOR npm run test:dashboard -- agent-launch-model.spec.ts agent-launch-model-boundary.spec.ts agent-launch-codex.spec.ts agent-launch-refusal.spec.ts`.
The real dialog/HTTP/store journeys must retain each host's name, model choices
and native dispatch. Record the candidate SHA, actual export/consumer locations,
literal commands and results. File presence, a Ready badge, or a done status
without the consumed contract is not sufficient proof.

Internal change: Wait autonomously as specified above, then bring the owner's
delivered description and registry into this execution checkout with unchanged
external behavior. This enables the immediately following observation-meaning
Behavior and supplies the same owner for the later wording slices. Choose the
actual delivered API, including the small wording extension this story needs;
never build a competing descriptor while waiting. If the contract is missing,
keep watching without starting dependent edits. If integration or focused proof
fails, leave this slice planned, diagnose/reassess, and stop dependent slices.
Safe stop: no dependent product changes have started; the executing agent owns
waiting and may resume automatically when the verified contract is available.
External wait is intentional and does not justify inventing a timing deadline.


### 2. Interpret unrecognized observations without a host-name exception
Type: Behavior
Status: planned
Proof: Extend `agent-launch-codex-observation-alerts.spec.ts` through real
background polling and substituted `osascript`: after baseline/working,
unexpected thread, active-flag and turn statuses alert once; unreadable metadata,
missing active flags and failed latest-turn reads stay quiet. A subsequent
recognized transition
still alerts. Preserve startup baseline, deduplication, re-entry and done
suppression with `session-alerts.spec.ts`. Extend the observation page journey
to retain correct unknown wording, provenance and zero attention for these
observations across card, Recent and sidebar. Run the slice 2 command below.

Behavior: A host reports an explicit unrecognized native state or an incomplete
observation; shared presentation shows the host's own explanation and alerting
consumes the host-reported fact. Explicit unexpected Codex statuses now notify,
but partial reads never establish absence, activity needing attention or an
alert. Claude Code retains its existing policy and unknown wording.

Extend the existing live observation/schema and prerequisite host description
only as needed. Do not infer alert eligibility from host name, description text
or availability alone. Keep the shared alert loop and native polling behavior;
no per-host alert loop, new persistent field or stored-record migration. Search
both host adapters, observation producers and test support for schema consumers.
Update maintained session-reading/notification guidance in
`dashboard/AGENT-LAUNCH.md` for the accepted meaning. Include refactoring and
focused proof in this delivery; do not split adapter/schema/browser/tests into
separate deliveries.
Safe stop: the observation meaning and notification change are useful together;
all other presentation and access behavior remains green.

### 3. Name the session's host when presenting continuation
Type: Behavior
Status: planned
Proof: Extend the mixed-host browser journey in `agent-launch-codex.spec.ts`
to assert the visible continuation label, exact saved workspace, shell-rendered
args and optional notice in card and Recent entries across reload. A predecessor
record without continuation gains no command; use existing observation-boundary
fixtures. Use terminal-accessible records for continuation assertions; preserve workspace
limitations and passive final-report access without restoring unavailable
terminal commands. Compare records before/after display and preserve native-call evidence
that rendering did not resume or replace a conversation.

Behavior: Opening an entry with a kept continuation says
"Continue in <the recorded session's host name>" and preserves its saved
context. An entry without continuation keeps its existing actions and gets no
invented command. Derive the label through the same host-description owner as
slice 2, while preserving `shellCommand` and native args as separate concepts.
Do not manufacture a Claude continuation or register Cursor to demonstrate the
generic wording. Correct existing labels have preservation proof; review the
shared renderer's descriptor consumption to establish the structural change.
Safe stop: continuation is presented correctly and no native operation changes.

### 4. Name the recorded host in unavailable-session attach refusals
Type: Behavior
Status: planned
Proof: Extend `agent-terminal-boundary.spec.ts` and
`agent-terminal-codex.spec.ts` to read the JSON body of a real refused upgrade.
After readable Claude omission or exact Codex missing-target evidence, assert
410, the correct host name and no PTY/attach. Preserve successful native resume
and detach, origin/record/capability refusal, unknown observation, workspace
access and done-mark behavior. Enhance refusal-body observation locally without weakening existing
status-only consumers.

Behavior: A recorded session whose host supports attach is confirmed unavailable
when terminal admission checks it; refusal names that host. Claude Code keeps
"Claude Code no longer lists this session"; Codex gets a Codex-specific truthful
refusal. Read the host description, keeping native wording with its host when
necessary; do not imply every host has a session listing. Preserve the ordering
of admission and use the already recorded host, not an independently supplied
display name. Update `agentLaunchPlugin` and `agentTerminal` comments for the
actual shared host boundary and host-qualified URL.
Safe stop: unavailable attachment is correctly explained without changing
access capabilities or losing stored intent.

### 5. Show the actual launch host throughout pending progress
Type: Behavior
Status: planned
Proof: Extend existing execution/preparation phase browser journeys for Claude
and Codex. Hold a real start in preparing, then native launching; assert unchanged
"Preparing execution…" / "Preparing refinement…", followed by the actual host
in launching words on the initiating page, a second page/reload and a Taken
card observing the running start. Include a kept Codex retry when the page's
default host differs. Also preserve pending wording for projects without an
installed start. Assertions must consume real HTTP progress, not fulfill that
endpoint with a preformatted sentence. Run the slice 5 checks below.

Behavior: Starting execution or refinement names the host doing that work on
every page observing it. Workflow words are constructed directly from workflow,
phase and actual host; no literal Claude Code replacement. Carry host through
the existing in-memory `StartProgress`, running-start response/schema and
browser lookup so `StartLaunch` and `CardLaunches` consume the same fact.
Inspect every progress setter in `startLaunch`, `executionStart` and
`preparationStart`; retry uses the kept start's host when appropriate. Preserve
current project/identity/workflow gating and cleanup, with no new durable start
format or legacy host default changes. Correct the implicated workflow comment
and pending-host wording in maintained launch documentation.
Safe stop: all source examples have mapped outside-in proof and the four
surfaces of host wording share established owners.

## Verification and delivery requirements

Commands are from the project root. Extend the named existing specs rather than
add parallel harnesses:

- Slice 2: `env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-observation agent-launch-recent-session-states.spec.ts session-sidebar-state-edge.spec.ts session-alerts.spec.ts`.
- Slice 3: `env -u NO_COLOR npm run test:dashboard -- agent-launch-codex.spec.ts agent-launch-codex-observation-boundary.spec.ts`.
- Slice 4: `env -u NO_COLOR npm run test:dashboard -- agent-terminal-boundary.spec.ts agent-terminal-codex.spec.ts agent-terminal-reopen.spec.ts agent-launch-host-identity.spec.ts`.
- Slice 5: `env -u NO_COLOR npm run test:dashboard -- agent-launch-start-phases.spec.ts agent-launch-preparation-phases.spec.ts agent-launch-start-card.spec.ts agent-launch-start-codex.spec.ts agent-launch-preparation-codex.spec.ts`.
- Changed TypeScript contracts: `npm run typecheck:dashboard`; the in-memory
  progress contract reaches both workflows, so preserve both callers' proof.
- Before an execution commit, apply the installed post-change-refactoring
  workflow and the check-only `.githooks/pre-commit` requirement
  (`npm run lint -- --staged`). Broaden local checks only for newly affected
  consumers or this project's explicit gates, not solely because CI has them.

No numeric slice target or hard limit was supplied. Each slice owns one cohesive
observable result, its proof and cleanup. Unexpected fixture/interface work or
integration evidence that invalidates sizing requires revising remaining slices;
never deliver an intermediate schema/caller mismatch. Execution retains accepted
proof and completion/review context in this plan for the ordinary retrospective
and wrap-up; all slices here remain planned.

## Current decisions and preparation review

- Terry's accepted alert policy is a scoped Codex behavior change; correct
  existing wording, attention counts and conservative observation remain intact.
- Four Behavior slices deliver observation interpretation, continuation wording,
  attachment refusal and pending progress. The latter three have separate action
  boundaries and proof loops, so combining them would hide independent results.
  Slice 2 keeps normalization, reading and alerts together because they prove
  one observation distinction through the current shared owners.
- Retain the four original Behavior boundaries and their mapped proof. Add one
  Structure probe immediately before the observation-meaning Behavior: it owns
  the prerequisite handoff, unchanged behavior and the independent integration
  risk. Five slices result; no slice resplit or numeric sizing exception is
  needed. Waiting is an explicit external dependency, with no invented deadline.
- Terry's selected handoff removes the whole-story completion requirement.
  The missing owner-held first-slice delivery is bounded by the early probe;
  it remains a gate on dependent edits, not an unresolved preparation decision.
- Preserve the existing solution, ADR constraints, goal, scope and six examples.
  The sequence still evolves one description and one shared observation/alert
  model; it adds no speculative host framework or duplicate native operation.
- Readiness means ready to start with the autonomous dependency watch. It does
  not claim the prerequisite is already delivered. After its contract is
  verified, execution continues automatically under the original execution
  instruction. No open goal, scope or handoff decision remains.
- This preparation does not Take or start execution. The one-shot result stays
  for review; the later executing agent owns its watch and integration proof.
