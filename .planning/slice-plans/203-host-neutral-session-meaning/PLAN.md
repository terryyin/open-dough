# Session meaning and wording follow the host

**Identity:** SEED-075#host-neutral-session-meaning
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#host-neutral-session-meaning)
**Authority:** Planning only; Terry accepted the recommended Codex alert policy
and requested a slice plan on 2026-10-01.
**Preparation:** Reuse the established workspace
`/Users/terryyin/git/open-dough/.worktrees/session-meaning-and-wording-are-host-neutral`,
branch `codex/session-meaning-and-wording-are-host-neutral`, agent `mrsn-chan`,
starting revision and published assignment
`4f4a7d2bacd8d6de2e60f1b79c635de5c20e1cb6`, remote `origin`, target `main`,
integration checkout `/Users/terryyin/git/open-dough`. Branch, HEAD, worktree
listing and `refs/worktree/dough/created-for/` confirmed this identity.

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

The prerequisite [one host description](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#one-host-description)
is still undelivered: fetched `origin/main` at
`a04edf85d0af3abb39f1734401305e008cc5b81b` still has host-name branches in
`dashboard/src/sessionCapabilities.ts`, and that story remains not-refined /
unselected. Do not implement the sibling's descriptor/dispatch/model work here
or invent its API. Reconcile its published contract before implementing these
slices, then observe the consumers below against that revision and reassess.
This unresolved prerequisite is a preparation-readiness concern, not a new
execution permission gate. The session-record variant story is separate;
preserve its published shape if it integrates during this work.

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
| Unexpected Codex status and failed latest-turn read are distinguishable before presentation/notification | Read `server/hosts/codex/sessions.ts` and `tests/support/fakeCodexObservation.ts`; the reader branches on native status or catches the turn-read failure. The baseline alert spec drives both through real polling and currently observes silence for both. | Slice 1 changes only the explicit-status alert policy. |
| All session surfaces consume the shared reading and preserve conservative unknown/absence meanings | Baseline `agent-launch-codex-observation.spec.ts` reads native replies through HTTP and checks card, Recent and sidebar readings/counts; inspected `SessionEntry`, `SidebarEntry`, `attentionCount`, `alertReading` and `SessionAlerts.poll` consumers. | Slice 1 preserves example 1, example 5's unsettled/count meaning, example 6 and done semantics. |
| Continuation presentation uses the kept record, not a new native resume | Read `src/LaunchSession.tsx`, `shellCommand` and its `SessionEntry` consumer; workspace/args/notice come directly from the saved continuation, while its label is hard-coded Codex. `agent-launch-codex.spec.ts` supplies a real launched/retained record but does not assert every continuation word. | Slice 2 adds the missing visible continuation preservation assertions for example 2. |
| An unavailable recorded session is refused before a PTY starts, and the message crosses the upgrade boundary | Baseline Claude terminal spec proves 410 and no attach for a readable omission; `admittedAttach` uses `attachOpens` and currently says Claude Code for every host. Read `AgentTerminals.refuseUpgrade`: it serializes that message as JSON in the HTTP body. Existing `refusedStatus` discards the body. | Slice 3 captures the actual refusal body and native no-attach result for example 3. |
| Another page can show running-start phase but currently cannot know its host | Baseline start-phases spec starts via HTTP, holds real preparation/native launch, then reloads the page and asserts phase wording. Read all `startPhaseWords` callers and `StartProgress.set/all`, `runningStartSchema`, `useAgentLaunches.startPhaseOf`: host is lost before formatting. Execution and preparation starts both set the progress. | Slice 4 carries host through these consumers for example 4. |
| A shared host description is available for these consumers | `git fetch origin main`; `git show origin/main:dashboard/src/sessionCapabilities.ts` and the source seed show it is not yet available at the fetched SHA above. | All wording slices depend on the sibling contract; readiness remains not-ready. |

The current pure/native-status assertions in
`agent-launch-codex-observation-status.spec.ts` and observation-boundary specs
also consume the live schema. Update expectations for genuine new observation
facts without changing stored-record fixtures. Vendor substitutes must supply
native replies only, not the normalized meaning or final wording being proved.

## Ordered slices

### 1. Interpret unrecognized observations without a host-name exception
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
observations across card, Recent and sidebar. Run the slice 1 command below.

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

### 2. Name the session's host when presenting continuation
Type: Behavior
Status: planned
Proof: Extend the mixed-host browser journey in `agent-launch-codex.spec.ts`
to assert the visible continuation label, exact saved workspace, shell-rendered
args and optional notice in card and Recent entries across reload. A predecessor
record without continuation gains no command; use existing observation-boundary
fixtures. Compare records before/after display and preserve native-call evidence
that rendering did not resume or replace a conversation.

Behavior: Opening an entry with a kept continuation says
"Continue in <the recorded session's host name>" and preserves its saved
context. An entry without continuation keeps its existing actions and gets no
invented command. Derive the label through the same host-description owner as
slice 1, while preserving `shellCommand` and native args as separate concepts.
Do not manufacture a Claude continuation or register Cursor to demonstrate the
generic wording. Correct existing labels have preservation proof; review the
shared renderer's descriptor consumption to establish the structural change.
Safe stop: continuation is presented correctly and no native operation changes.

### 3. Name the recorded host in unavailable-session attach refusals
Type: Behavior
Status: planned
Proof: Extend `agent-terminal-boundary.spec.ts` and
`agent-terminal-codex.spec.ts` to read the JSON body of a real refused upgrade.
After readable Claude omission or exact Codex missing-target evidence, assert
410, the correct host name and no PTY/attach. Preserve successful native resume
and detach, origin/record/capability refusal, unknown observation and done-mark
behavior. Enhance refusal-body observation locally without weakening existing
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

### 4. Show the actual launch host throughout pending progress
Type: Behavior
Status: planned
Proof: Extend existing execution/preparation phase browser journeys for Claude
and Codex. Hold a real start in preparing, then native launching; assert unchanged
"Preparing execution…" / "Preparing refinement…", followed by the actual host
in launching words on the initiating page, a second page/reload and a Taken
card observing the running start. Include a kept Codex retry when the page's
default host differs. Also preserve pending wording for projects without an
installed start. Assertions must consume real HTTP progress, not fulfill that
endpoint with a preformatted sentence. Run the slice 4 checks below.

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

- Slice 1: `env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-observation agent-launch-recent-session-states.spec.ts session-sidebar-state-edge.spec.ts session-alerts.spec.ts`.
- Slice 2: `env -u NO_COLOR npm run test:dashboard -- agent-launch-codex.spec.ts agent-launch-codex-observation-boundary.spec.ts`.
- Slice 3: `env -u NO_COLOR npm run test:dashboard -- agent-terminal-boundary.spec.ts agent-terminal-codex.spec.ts agent-terminal-reopen.spec.ts agent-launch-host-identity.spec.ts`.
- Slice 4: `env -u NO_COLOR npm run test:dashboard -- agent-launch-start-phases.spec.ts agent-launch-preparation-phases.spec.ts agent-launch-start-card.spec.ts agent-launch-start-codex.spec.ts agent-launch-preparation-codex.spec.ts`.
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
  Slice 1 keeps normalization, reading and alerts together because they prove
  one observation distinction through the current shared owners.
- No fixable slice-boundary, cumulative-design, proof-ownership or sizing concern
  was identified. An additional refinement pass is unnecessary.
- Readiness concern: the undelivered host-description prerequisite affects all
  four slices. Its API and integration basis must be observed before recording
  ready. Planning does not absorb that sibling's scope.
- No open human goal/scope decision remains. Execution requires a separate
  instruction; publishing this preparation does not take the story or implement
  these slices.
