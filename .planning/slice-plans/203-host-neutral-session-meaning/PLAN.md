# Session meaning and wording follow the host

**Identity:** SEED-075#host-neutral-session-meaning
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#host-neutral-session-meaning)
**Authority:** Terry invoked `dough-execute-plan` for this identity on 2026-10-01
with an established Story Branch start. Execute this plan, including its
autonomous prerequisite handoff and accepted Codex alert policy.
**Preparation:** Established one-shot preparation in the default checkout
`/Users/terryyin/git/open-dough`, branch `main`, starting revision
`11f748a9b0e58263351e18fb37053cb2d6378221`, remote `origin`, target `main`,
integration checkout `/Users/terryyin/git/open-dough`, landing `review`.
No Preparing assignment is published. The original isolated preparation's
observations remain attributed to its revision below.

**Execution:** Owned checkout
`/Users/terryyin/git/open-dough/.worktrees/session-meaning-and-wording-are-host-neutral`,
branch `codex/session-meaning-and-wording-are-host-neutral`, Story Branch Mode,
publisher `dashboard-mac.lan-open-dough`, agent `ivan-chan`, remote `origin`,
integration target `main`. The accepted claim and first managed delivery base
is `cee792a48d17b1685208b5a335e1755dbf8a6438`; starting revision
`0924aa4f3322c89d9d6cba944b1c3f8d421ac194`. No creation/reuse fact was supplied.
Ordinary increments publish to `refs/heads/codex/session-meaning-and-wording-are-host-neutral`.
The claim's trunk CI coverage is unobserved. Existing planning authority is
retained; no numeric slice target or hard limit is supplied.

`npm ci` completed in this exact checkout and `npm run typecheck:dashboard`
passed before implementation. The integrated prerequisite leaves the locked
dependency metadata unchanged, so this preparation remains applicable.

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
Status: done
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
Status: done
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
Status: done
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
Status: done
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
Status: done
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
and wrap-up; all five slices now have accepted focused proof; the CI ownership decision
blocks the execution/review handoff.

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
- Execution reused the established published claim and completed its autonomous
  handoff without another start or an invented descriptor. See evidence below.

## Execution evidence

### Slice 1 — prerequisite handoff

Fetched trunk advanced to `103ffacb77d41e6a72ab8d6f464d10bdff558e10`.
It contains prerequisite implementation `b6f2cb65`, `4e623e37`, `09d5d98a`,
completion `0e43ebae` and closure `d0bce8ad`. Its spent plan was removed by
closure; accepted delivery evidence was inspected in historical
`.planning/slice-plans/205-one-host-description/OBSERVATIONS.md` at
`0e43ebae12253183d961464f5b064ac0b78f00f3`. Slice 1's descriptor/registry
and preservation proof are both on trunk. The watch ended after a clean
fast-forward from the claim to that trunk revision; no published history was
rewritten and no prerequisite checkout was changed.

The actual browser owner is `dashboard/src/hostDescription.ts`:
`HostDescription`, `hostDescriptions`, `hostDescription`, offered hosts/models,
model aliases/names and shared branch namespaces. The server's explicit
`hostRuntimes` registry and `LaunchHost.description` live in
`dashboard/server/launchHosts.ts`; `claudeHost.ts` and `codexHost.ts` associate
their own descriptions. `LaunchHostModel`, `sessionCapabilities`, workflow
labels and native refusal labels consume these facts. Cursor remains a known
identity without a delivered runtime. Later slices preserve the delivered
`hostOperations` projection and explicit-host interfaces.

Current proof in this execution checkout:

```sh
npm run typecheck:dashboard
env -u NO_COLOR npm run test:dashboard -- agent-launch-model.spec.ts agent-launch-model-boundary.spec.ts agent-launch-codex.spec.ts agent-launch-refusal.spec.ts
```

Both commands reached terminal exit 0; the browser command used the quiet
reporter. The production build and isolated servers use `globalSetup`,
`publishLaunchJourney`, `dashboardTest`/`dashboardServer` and native protocol
substitutes supplying only starting conditions and vendor replies. Inspected
model-spec choice/reset/native-argv assertions, model-boundary stored-request
and forged-model refusal assertions, Codex dialog/default/native thread/turn
dispatch and restart assertions, and refusal-spec no-vendor-call assertions.
Together these reach browser → HTTP → store/native adapter and preserve host
names, model offerings/defaults, dispatch and unavailable runtime refusal.
No real vendor or notification was started.

Independent post-change refactor returned `## REFACTOR COMPLETE`: empty
uncommitted scope, no edits or tests, accepted proof unchanged. The selected
Prettier invocation against this ignored planning path completed as a no-op;
the staged check-only commit hook owns lint. No generation is triggered.

### CI observation and delivery

Source: GitHub Actions; verified selector `ci.yml` (push-triggered for the
execution branch; no existing branch run was returned at verification).
Observer: `/tmp/dough-ci-501/watch-LkPomH`, coordinator `root-ivan-chan`,
yielded cell `26`, session `44395`, PID `24803`, bound to this execution
checkout and `terryyin/open-dough` branch
`codex/session-meaning-and-wording-are-host-neutral`.
The documented Codex yielded stream owns one observer; managed increment
delivery reuses that live matching observer. The runtime has no stream-attach
operation for a detached managed observer, so the supported stream was armed
before managed delivery rather than creating a detached worker without a
notification binding. No separate registration or second observer is used.

Slice 1 publication was accepted at
`4ef487ec5ac683d6cecd9ff1f4618a45b76dbecf` on the execution branch, with
managed observation `reused` for that exact directory. No default-checkout
maintenance applies to branch publication.

CI attempt `36883015606/1` for that revision is incomplete (`cancelled`),
not passing evidence. Bounded job/log inspection found all three shell shares,
lint and seven dashboard shards successful. Dashboard shard 7 was cancelled
while installing Chromium's Ubuntu dependencies; shard 9's dependency install
consumed 5m52s of the six-minute job budget and cancellation interrupted
typecheck before its browser suite ran. Logs show slow package downloads,
without an assertion failure in either cancelled job. This workflow/setup is
unchanged by slice 1; no product repair or rerun was invented. Preserve the
incomplete verdict and require the applicable later registered revision's
completion receipt. Diagnostic locations:
`/tmp/host-neutral-ci-36883015606-job7.log` and
`/tmp/host-neutral-ci-36883015606-job9.log`.

### Slice 2 — observation meaning and alerts

Both native adapters now supply live `unknownReason` (`unrecognized` or
`incomplete`) for unknown activity in `launchRecord.ts`. Claude's unfamiliar
native states and Codex's unfamiliar thread/flag/turn statuses are unrecognized;
missing Codex active flags and failed latest-turn reads are incomplete. Shared
`alertReading` consumes this fact, with no host-name or description condition.
`hostDescription` owns the preserved unknown-observation words; a host-less
attention calculation no longer attributes its unknown note to Claude Code.
The missing-flags explanation now truthfully says Codex did not report active
status flags. No durable record, polling loop or notification transport changed.

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-observation agent-launch-recent-session-states.spec.ts session-sidebar-state-edge.spec.ts session-alerts.spec.ts
npm run typecheck:dashboard
```

Both commands reached terminal exit 0. The browser selection covers 16 test
declarations across seven specs without a grep filter. Native-only replies in
`codexObservation`/`fakeCodexObservation` flow through actual store/HTTP,
background polling and substituted `osascript`. The alert spec observes
baseline, waiting, unfamiliar thread/flag/turn alerts once, deduplication,
working/re-entry, metadata refusal/missing flags/turn-read silence and a
subsequent review alert. The status spec observes reason/provenance and exact
missing-target evidence. The page journey observes card/Recent/sidebar
wording, unsettled tones and no attention for all unfamiliar/incomplete cases
across reload, aggregate six then seven recognized attention readings,
unchanged records, absence and Done. The boundary specs preserve independent
targets, deletion during a pending read, bounded silent endpoints and passive
native methods. Existing Claude reading/sidebar/alert specs preserve wording,
all tones, baselining, deduplication, re-entry, done suppression and shutdown.

Inspected both adapters, their launch/listing confirmation consumers,
`withStates`, live wire schemas, reading/attention/alert consumers,
card/Recent/sidebar, access/done/delete readers and native test support.
Recognized-state producers require no new field. Updated maintained
`AGENT-LAUNCH.md` and its linked `AGENT-LAUNCH-HISTORY.md`, which previously
documented the old silent-Codex policy.

Independent refactor returned `## REFACTOR COMPLETE`: already clean, no
edits/tests, all accepted boundaries unchanged and all ten changed files below
250 lines. Selective Prettier formatting completed successfully; mechanical
formatting leaves the accepted proof applicable. No generation is triggered.

Slice 2 publication was accepted at
`56f8681f49ace31f30e7d642bdff84f47cdaea03` on the execution branch with
the same managed observer reused. Its CI attempt `36884430030/1` is incomplete
(`cancelled`): bounded logs show the same slow Ubuntu dependency downloads
consuming the six-minute job budget. Shard 5 stopped during installation,
shard 4's browser run was interrupted after setup consumed 5m32s, and shard 8
reported cancellation although its recorded steps, browser suite and artifact
upload completed successfully. Other jobs passed. No assertion failure was
reported; retain the incomplete verdict rather than treating a setup timeout
or successful local proof as passing CI. Diagnostic logs are
`/tmp/host-neutral-ci-36884430030-<job-id>.log` for job IDs
`110443995754`, `110443995830`, `110443995897`.

### Slice 3 — saved continuation presentation

`LaunchSession` now reads the recorded host's name through `hostName` and its
shared description. It preserves `sessionAccess` gating, saved workspace,
`shellCommand` args, optional notice and native operations. Card and Recent
entries consume this same renderer through `SessionEntry`.

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-codex.spec.ts agent-launch-codex-observation-boundary.spec.ts
npm run typecheck:dashboard
```

Both commands reached terminal exit 0; five browser declarations were selected
without a grep filter. The existing mixed-host journey obtains real launch
records from native substitutes; `continuationPage.expectMixedContinuation`
observes exact label/workspace/shell-rendered args and absent/present notice in
card and Recent through reload and server restart. The helper in
`support/codexContinuation.ts` observes native saved args/workspace, executes
the displayed command through `/bin/sh` and checks exact CLI args with quoted
paths, and supplies a native disconnect that the real adapter turns into a
saved notice. The journey compares stored records and native passive calls
before/after rendering. The observation-boundary journey supplies predecessor
records and native retained history: no continuation gains no command, a
missing workspace withholds terminal commands, both surfaces preserve passive
report access, and report reads leave records and native control unchanged.
Existing independent-target/deletion/silent-endpoint assertions remain green.

Independent refactoring extracted the oversized mixed-host spec's saved
continuation/CLI/disconnection proof seam into `support/codexContinuation.ts`,
keeping the existing journey, observation order and production boundaries.
It returned `## REFACTOR COMPLETE` after terminal exit 0 for:

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-codex.spec.ts
npm run typecheck:dashboard
```

The observation-boundary proof stayed unchanged and was reused. Inspected the
new helper assertions and their current spec callers. Selective formatting
passed; all five changed files remain below 250 lines (71–245).

Before publication, fetched trunk advanced to
`1e14e23f` with the responsive-startup story. Its renderer and launch/progress
changes require published-history integration and affected proof before this
slice is delivered. Preserve accepted pre-integration proof as attributed here;
do not treat it as proof of the combined candidate until reverified. Later
slices must retain asynchronous acceptance/reconciliation as well as the
prerequisite host-description/operation owners.

Integration succeeded through the installed product-backlog merge adapter at
`07e90c8b33ab567e0b2c015f227b5a3e0d6401dd`, preserving published histories
and the own slice commit `30fc503cb88aaae7be2dea7abcf972c0c824810b`.
The commit hook's fixture-parameter assignment finding was repaired with a
local alias and selective reformatting; no fixture or behavior was changed.
An attempted merge before recognizing that failed commit was refused without
changing history; the successful merge followed the completed commit.

Combined candidate proof reached terminal exit 0 without repair:

```sh
npm run typecheck:dashboard
env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-observation agent-launch-recent-session-states.spec.ts session-sidebar-state-edge.spec.ts session-alerts.spec.ts agent-launch-codex.spec.ts responsive-session-access.spec.ts
```

The browser selection covers 21 declarations across nine specs without grep.
All slice 2/3 observing assertions above remain present, including new helpers.
Updated HTTP fixtures follow real asynchronous acceptance and attempt
settlement. Three responsive-access journeys preserve reduced-motion behavior,
focus handoff/retention, transition announcements, protected-card descriptions
and actions, working terminals and Recent actions, using actual bare origin and
installed startup scripts with held publication/native replies. Inspected the
merged renderer's shared protected-frame description on Open terminal; the
selected responsive assertions directly observe card and Mark as done
descriptions, not that button's `aria-describedby`. No broader claim is made.
The accepted combined proof preserves both stories' current promises. The
integration introduced no new own edits or refactor candidate.


### Slice 3 — publication and delivered CI failure

Combined evidence publication was accepted at
`7e5d273e1107b079c78d63726b41d83e1b1a229d`, using the same observer.
CI run `36887148326/1` reported a real assertion failure in dashboard shard 3,
job `110453268774`. `agent-launch-attention.spec.ts` captured Story B's
preparation facts while they still said "Reading preparation…", then compared
them after preparation settled. The comparison was last edited by the
responsive-startup execution (`ziqing-chan`) in `1aa5d896`; this execution has
not edited that file. Bounded diagnostic:
`/tmp/host-neutral-ci-36887148326-dashboard3.log`.

The installed CI ownership rule prohibits duplicating a known other owner's
repair. A human coordination question is pending; independent slices continue,
without stashing or changing that owner's test. This failure remains unresolved
and is not passing CI evidence. Further completion requires its disposition.

### Slice 4 — unavailable attachment refusal

`admittedAttach` retains origin, project, recorded-session, capability and
availability ordering. It reads the admitted recorded host's description for
unavailability words: preserved Claude Code omission wording and Codex's own
conversation-unavailable wording. Native operations and durable records stay
unchanged. Updated boundary comments name the existing `host` query parameter
and host-owned observation/attachment responsibilities.

```sh
env -u NO_COLOR npm run test:dashboard -- agent-terminal-boundary.spec.ts agent-terminal-codex.spec.ts agent-terminal-reopen.spec.ts agent-launch-host-identity.spec.ts
npm run typecheck:dashboard
```

Both commands reached terminal exit 0, with 42 browser declarations across
four files and no grep filter. `agentTerminalBoundary.refusedResponse` captures
UTF-8 bodies from real WebSocket unexpected-response events; `refusedStatus`
keeps its prior callers' status-only contract. Claude boundary cases drive
readable native omission, then assert HTTP 410, exact Claude Code JSON error
and no native attach. Codex cases in dev and preview obtain actual launched
records, supply exact native `thread not loaded` evidence, then assert HTTP
410, exact Codex JSON error, no host attach and unchanged stored records.
Fixtures supply native replies only. Existing assertions preserve resume,
input/size, disconnect/process end, origin/unknown-record refusal, conservative
unknown-listing attachment, stopped/done reopening and host-qualified identity.
No new unsupported-runtime capability or generic descriptor-fallback case was
exercised; those unchanged paths are not claimed as newly tested.

Independent refactoring returned `## REFACTOR COMPLETE`. To keep changed files
below 250 lines, it extracted the existing HTTP answer type and response writer
into `server/agentLaunchResponse.ts`, whose sole caller is the plugin's existing
middleware. This stays within the local launch boundary. It shortened the
boundary spec's explanatory header without changing assertions. The relocated
writer invalidated implementation-location proof, so both literal commands
above were rerun to terminal exit 0. Inspected the moved type/writer and sole
caller; admission, native evidence and refused-upgrade assertions remained
unchanged. All eight changed files remain below 250 lines. Selective Prettier
completed; no generation is triggered, and hook-owned lint remains with commit.


### Slice 4 — publication

The hook's shorthand void-arrow finding in the new refused-body helper was
repaired with braces and selective reformatting; behavior and accepted proof
remain unchanged. Slice commit `9d90a7ad9280fae8b43e565068fc3633fd8e09c7`
was reconciled with planning-only trunk `2a7dec40` through the installed backlog
merge adapter. Publication was accepted at
`1a027123c4dbf2930ead6c96be670acd07fa460c`, with the same observer reused.
The integrated queue includes startup recovery advice and CI mirror-stall
resilience; neither is implemented here.

### Slice 5 — actual host in pending progress

`StartProgress` keeps host with phase; all five setters in `startLaunch`,
`executionStart` and `preparationStart` supply the admitted request's host.
The live `runningStartSchema`, machine response, `runningStartOf` lookup and
`CardLaunches` retain that fact. `startPhaseWords` constructs launching words
from workflow/phase/host and preserves preparing words. Current responsive
startup moved the old pending renderer into `StartupStatus`; its progressing
expression therefore consumes the shared function directly. This necessary
consumer edit removes literal Claude Code replacement. The separately queued
startup-advice story still owns reconciliation/recovery advice. Kept-host
admission, matching keys, cleanup, durable starts and browser defaults remain
unchanged. Maintained pending-word documentation and boundary comments agree.

The original planned five-spec command selected 13 declarations but failed
new ambiguous Story A locators, which also matched unresolved-creation and
Recent articles. Its six unchanged `agent-launch-start-card.spec.ts` cases
passed, preserving no-installed-start execution/refinement Claude wording and
installed-start preparation behavior. Exact accessible card names corrected
only the four affected journeys. Seven declarations in the corrected four-spec
run passed, and the changed duplicate-start response expectation's two cases
passed separately. Typecheck reached terminal exit 0. No separate Codex
no-installed-start pending journey was added; shared renderer consumption was
inspected rather than claimed as that additional behavioral observation.

Independent refactoring returned `## REFACTOR COMPLETE`. It renamed the
progress map to `starts`, extracted oversized native-host documentation into
`AGENT-LAUNCH-HOSTS.md` while retaining the existing heading/anchor and correcting
stale shared host-branch prose, and consolidated repeated test journeys into
`support/startProgressPage.ts` and `support/codexRetryPage.ts`. The only production
refactor stays within startup progress. No architecture conflict arose.

The moved proof and map implementation invalidated location evidence, so
replacement proof reached terminal exit 0:

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-start-phases.spec.ts agent-launch-preparation-phases.spec.ts agent-launch-start-codex.spec.ts agent-launch-preparation-codex.spec.ts agent-launch-start-duplicate.spec.ts
npm run typecheck:dashboard
git diff --check
```

Nine declarations across five specs selected without grep. Inspected helper
callers and observations: real installed start commands run against bare origin;
held push and held native creation supply preconditions separately. Real HTTP
assertions observe host/phase, while initiating and second pages show preparing
then actual-host launching words across reload. Actual published assignments
produce Taken execution placement and Preparing refinement facts in Backlog;
settlement clears progress. Saved Codex retries retain published workspace and
creation/input evidence, observe host Codex through HTTP and initiating/second
page/reload despite independent Claude browser defaults. Duplicate/simultaneous
starts preserve one claim/workspace/session and cleanup. The six unaffected
start-card cases retain their accepted observations without another run.

Inspected every setter, machine producer, live schema, browser lookup/current
renderer, kept admission and test-support caller. No additional nonempty
running-start fixtures remain without host. Selective Prettier passed; all 18
product/test/doc files are below 250 lines (maximum 242). No generation applies.
Trunk remained `2a7dec40` at the final fetch, with no product integration needed.

### Execution/review handoff remains incomplete

All slices have accepted local proof, but delivered CI failure
`36887148326/1` remains unresolved. Its other twelve jobs finished successfully;
the attention-test preparation-facts race is the sole failed job. The known
responsive-startup repair owner is not duplicated. The human ownership question
remains pending; no repair, completion record or completion marker is invented.
Automatic retrospective and final CI completion are deferred at this required
human-judgment boundary. Retain the plan, checkout, branch and proof for resume.


### Authorized CI repair — preparation-facts capture

Terry answered "you repair", assigning this execution the bounded attention-test
race previously held for the responsive-startup owner. Failure evidence from
`36887148326/1` and `36889702007/1` has the same cause: Story B's loading facts
were captured before its settled preparation reading. The latter run also had
one package-install cancellation, which does not excuse its assertion failure.

All slice/refactor writers were finished and the checkout was clean. Installed
`ci-repair-stash.mjs save` returned `clean`, no OID, with receipt
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-CGg1Ea/record.json`.
No stash entry was created or manually changed. A fresh implementation agent
repaired only `agent-launch-attention.spec.ts`: one atomic browser observation
requires current preparation detail and no loading text before cloning facts.
This prevents both not-yet-read preparation and the gap between readiness and
capture. Existing state/count/fact comparisons remain; no product code changed.

Deterministic transient proof at the real browser/read boundary:

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-attention.spec.ts --grep 'CI repair reproduces'
```

Old helper: terminal exit 1 with the exact CI loading-versus-settled mismatch.
The scheduling-only hook reloads the actual page after old readiness passed,
holds real canonical/plan file reads, then captures. Same gap with atomic capture:
terminal exit 0; the first observation rejects loading, release permits settled
facts, and capture matches the later native reading. Temporary harness removed
from the final tree; retained diagnostic `/tmp/attention-race-fixed-reproducer.ts`.
No permanent helper-mirroring regression is claimed.

Final restored helper-only proof reached terminal exit 0:

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-attention.spec.ts
npm run typecheck:dashboard
git diff --check
```

Root inspected the atomic helper, all three preparation-stage callers, unchanged
count/fact comparisons and transient native-read setup. Independent refactoring
returned `## REFACTOR COMPLETE`: only the introductory comment shortened,
executable evidence unchanged; no tests rerun. Selective formatting passed,
leaving the spec exactly 250 lines. No generation applies.

The earlier observer was stopped with confirmed PID exit at the human boundary.
On authorized resume, one documented yielded observer was rearmed:
`/tmp/dough-ci-501/watch-4v8x7b`, cell `3`, session `32888`, PID `14248`, same
repository/execution target/coordinator. Managed repair delivery reuses it.
Snapshot evidence for `cef712aa` is incomplete (`36891814721/1`, cancelled):
three dashboard shards stopped during slow Ubuntu package installation before
browser proof, with no assertion failure; ten jobs passed. Diagnostic files:
`/tmp/host-neutral-ci-36891814721-<job-id>.log` for `110469028282`,
`110469028408`, `110469028450`. This is not a CI success claim.

Fresh trunk added planning-only claims through `c220e09d`; integration retains
those other owners' work without attributing it to this story's product change.
The historical human stop above is superseded by this authorized repair. Final
retrospective and CI handoff now resume under the original execution instruction.
