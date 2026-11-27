# Prove session completion reporting in Node Vitest

**Identity:** SEED-413#prove-session-completion-reporting-on-vitest

**Source:** [Prove session completion reporting in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-completion-reporting-on-vitest)

## Goal and scope

Give Dashboard maintainers fast, typed Node Vitest proof of completion
reporting: the reporting instruction each host receives, which session a
report binds to and closes, what the Dashboard keeps when a report is early,
quiet, late, superseded, unacknowledged or refused, how an admitted session
completes, and what a final report request answers. Move the 11 legacy specs
(20 cases) off backend Playwright and account for each observation. Product
behavior is unchanged. Mark as done and its quiet rename, observation,
terminal attach, the Cursor runner and retention belong to their sibling
stories in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- PFE: completion already has a typed chain.
  [`deliverCompletion`](../../../dashboard/server/completionDelivery.ts)
  takes a parsed submission, the receiving origin and the Done collaborator.
  [`bindRecord` and `keepRecord`](../../../dashboard/server/launchRecordBinding.ts),
  [`verifyLaunch`](../../../dashboard/server/launchVerification.ts),
  [`finalReportRequest`](../../../dashboard/server/finalReportAdmission.ts)
  and the record store operations (`updateRecord`, `deleteRecord`,
  `setRecordDoneAt`) are production functions over the machine stores under
  `HOME`. The installed reporting script exports `reportCompletion(argv)`,
  which keeps its pending submission before its one `fetch`. Use a private
  HOME, MakeMe attempts and records, and these operations. Start no Dashboard
  server and send no HTTP request for the Node cases.
- Run the installed reporting script in process, as
  [`installedPublisher.ts`](../../../dashboard/backend-tests/support/installedPublisher.ts)
  already runs the installed publisher: its existing `fetch` bridge maps a
  request to production admission and the handler. Slice 1 gives completion
  a body-level admission, `admitCompletionRequest`, beside
  [`admitLandingRequest`](../../../dashboard/server/launchLandingAdmission.ts).
  It covers the POST method, local origin metadata, a body matching
  `submissionSchema` and a known project. `submitCompletion` keeps reading the
  HTTP body and calls it. Extend the existing bridge to route the completion
  endpoint through it and `deliverCompletion`. Add no new support file. Narrow
  `deliverCompletion`'s Done collaborator to the existing `ReportedDone`, so a
  case observes the native Done handed on with `vi.fn()`.
- Observe an unacknowledged delivery with a production store write that
  fails (the machine dashboard directory made read-only, premise 2) or a
  bridge that drops the receipt after `deliverCompletion` returns. A receiver
  restart is a fresh `ReportedDone` over the same HOME. These replace the
  legacy write-fault hook, proxy and separate-process receivers.
- Arrange launches with [`attemptRun`](../../../dashboard/server/launchRun.ts)
  and a recording or held native dispatch, as
  [`admitted-session-start`](../../../dashboard/backend-tests/launches/admitted-session-start.spec.ts)
  does. Use `installFakeCodex` (its `afterCreation` control) where the Codex
  host's creation is the observation. Use a kept MakeMe attempt and record
  where only delivery is observed.
- Refusals on the launch boundary use the production `answer` with the
  socket stand-in of
  [`agent-launch-refusal`](../../../dashboard/backend-tests/launches/agent-launch-refusal.spec.ts).
  That spec owns the exact-read origin check (premise 4), so the legacy final
  report cross-site case is retired as its duplicate. The GET-only check of
  exact reads has no Vitest owner, so slice 5 keeps it.
- The admitted-session wrap-up keeps its real Git origin and the installed
  `ci-mailbox` and `trunk-closure` children, which read local evidence and Git
  and never contact the Dashboard. The landing they follow runs the installed
  delivery in process through the same bridge, as
  [`story-bound-landing-capture`](../../../dashboard/backend-tests/launches/story-bound-landing-capture.spec.ts)
  does. The completion report after it runs in process. Slice 8 reuses
  `landNativeWork` and `finishAdmittedClaim` from
  [`admittedSessionCompletion.ts`](../../../dashboard/test-support/support/admittedSessionCompletion.ts),
  which the E2E journey keeps, and admits its claim through `attemptRun`
  instead of the server-bound `admitForCompletion`.
- Retained E2E journeys keep the page, real native hosts and receiver
  processes:
  [`agent-completion-quiet`](../../../e2e/sessions/agent-completion-quiet.spec.ts),
  [`agent-completion-attention`](../../../e2e/sessions/agent-completion-attention.spec.ts),
  [`agent-completion-attention-restart`](../../../e2e/sessions/agent-completion-attention-restart.spec.ts),
  [`agent-completion-quiet-done`](../../../e2e/sessions/agent-completion-quiet-done.spec.ts),
  [`final-report-done-native`](../../../e2e/sessions/final-report-done-native.spec.ts)
  and [`admitted-session-completion`](../../../e2e/sessions/admitted-session-completion.spec.ts).
  This plan adds no E2E case.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for attempts,
  records, submissions and reports, and keep malformed wire inputs visible.
  Add zero test-support wrappers. When their last caller goes, remove
  `plantedTrackedExecution.ts`, `completionRecoveryFaults.ts`,
  `completionRecoveryIntent.ts`, `serverFsHook.ts` and the `completionRecovery.ts`
  exports (`completionWriteFault`, `completionProxy`, `postCompletion`,
  `retainedSubmission`, `reportingChild`). Trace the E2E and landing-capture
  consumers first; the consumer lists at `f0e28b64b` show several shared
  callers.

## Decisive premises

Observed in the owned preparation checkout at `f0e28b64b` on 27 November 2026
with Node 24.21.0, one worker, locked dependencies linked from the
integration checkout, and macOS on AC under `caffeinate -s -i`. Load average
was 11–19 from other work. Trunk `e4ad03e0d` changes no `dashboard/`, `e2e/`
or `Distribution/` path since then. Use these runs for behavioral evidence
and take a comparable pair for the execution's performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| 1. The maintained selector reaches all 20 legacy cases | The local-gate selection below passed 20 Chromium cases on the first attempt, with zero retries, in 78.01 s wall. Summed case time is 70.4 s. By spec: `admitted-session-no-change-completion` 1 case 4.5 s, `admitted-session-shared-checkout-completion` 2 12.6 s, `agent-completion-attempt-loss` 2 3.9 s, `-binding` 5 20.3 s, `-early-recovery` 1 3.8 s, `-identity` 2 7.5 s, `-input` 2 2.6 s, `-quiet-closure` 1 5.9 s, `-returned-closure` 2 4.1 s, `-superseded` 1 3.5 s, `final-report-admission` 1 1.8 s. |
| 2. The installed reporting script delivers in process through production delivery, and recovers an unacknowledged write | A scratch Vitest spec (since removed) ran through `npm run test:dashboard:backend -- 'sessions/zz-scratch-completion-probe\.spec\.ts$' --workers=1`. It used a private HOME and copied the four installed `dough-execute-plan` reporting scripts into a workspace. `reportingContext` installed the script under the machine reporting directory for a MakeMe ad hoc Claude attempt (unsettled, with a first input), and `bindRecord` kept its record. `fetch` was stubbed to `submissionSchema.parse` and `deliverCompletion` with a `{ reported: vi.fn() }` collaborator. The installed `reportCompletion` ran with the dashboard directory made read-only. It threw "Completion delivery was not acknowledged…", named the retained file and printed the reporting-only retry. `reportCompletion(["--retry", pending])` then answered `state: "recorded"` with the same delivery. A fresh `keptRecords` read held that receipt, and `reported` was called once, in 30 ms. Two arrangement facts: an attempt's request takes no `title`, and binding before settlement is the only way a record joins a launched attempt. |
| 3. The launch, admission, publisher-bridge and fake Codex compositions run on Vitest | `npm run test:dashboard:backend -- '(launches/(agent-launch-refusal\|admitted-session-start\|story-bound-landing-capture\|agent-launch-codex-lifetime\|declared-blank-launch-publication))\.spec\.ts$' --workers=1` passed all 43 Node cases in 37.09 s wall. They cover the boundary `answer` with the socket stand-in, admitted Start through `attemptRun` on a real Git origin (0.3–3.5 s each), the installed publisher's in-process `fetch` bridge, and `installFakeCodex` with `attemptRun` (2.0–2.6 s each). |
| 4. One Vitest owner proves origin refusal for exact reads | Plan 867 premise 4, at `23c09d6e4`, disabled `verifyLocalOrigin(req)` at the start of `admitted()` and saw `agent-launch-refusal`'s cross-site cases fail. They include the exact-read "attempt change read from another site". The final report is an exact read admitted after the same check (`agentLaunchAdmission.ts` lines 208–213 at `f0e28b64b`, unchanged since). Its own GET-only branch (line 211) has no Vitest case: `agent-launch-refusal`'s 405 cases use the sessions read route. |
| 5. The admitted wrap-up children never contact the Dashboard | `trunk-closure.mjs` and `trunk-closure-admitted-session.mjs` read the landing input files (`readLandingInput`, `currentLandingInput`) and Git, and contain no `fetch`. Only the installed delivery's landing capture and the completion report reach the Dashboard. Both have in-process entries (`deliverManagedExecutionIncrement`, `reportCompletion`) and a bridge precedent (premise 3). Read at `f0e28b64b`. A scratch Vitest spec (since removed), run through `npm run test:dashboard:backend -- 'sessions/zz-scratch-admitted-probe\.spec\.ts$' --workers=1`, imported `admittedSessionCompletion.ts`, started `completionCi` with its mailbox and request-owner environment, released it and ended its requests in 719 ms. The full chain from a Vitest-admitted claim was not run. It stays a proxy because slice 8's claim comes from `attemptRun`, the same production start the server runs for the legacy `launch`, and the children are separate processes whose inputs (Git, the landing input files and that environment) do not depend on the test runner. |

## Ordered slices

### 1. Refuse a report for another launch, and keep the earlier message

Type: Behavior
Status: done
Estimate: 13–15 active minutes.

Proof: Add `admitCompletionRequest` beside `admitLandingRequest`, call it
from `submitCompletion`, route the completion endpoint through it in the
`installedPublisher.ts` bridge, and narrow `deliverCompletion` to
`ReportedDone`. Existing callers stay green. With a private HOME and a kept
Codex attempt and record, the in-process installed script reports
`completed` with an attention message, and a fresh read keeps that message.
Each refusal answers its status and keeps that message: unknown project,
another catalog project, another host, an unknown reference (404); another
session (409); an empty attention message, an invalid outcome and an extra
field (400); and a cross-site origin (403). Convert the second case of
`agent-completion-identity.spec.ts`.

Delivered: `admitCompletionRequest` lives in `completionAdmission.ts`
with the submission schema. The bridge routes completion through it and
`deliverCompletion`, and `installedPublisher.ts` exports `reportInstalled`
and `installPublisherScripts`. The new Node spec
`agent-completion-refusals.spec.ts` (1 case, 47 ms) owns legacy identity
case 2; its selector joins the candidate run. Proof: 71 of 71 consumer cases
(55 Node, 16 Chromium) and typecheck green; the refactor rerun passed 15 of
15. Learnings: MakeMe `aLaunchRecord.adHoc` needs a `title` and takes its
host from `inCodexSession`; Codex scripts install at
`installedSkillPath("codex", …)`; the `production` configuration seeds
`open-dough` and `doughnut`; an attention report also reaches
`ReportedDone.reported`.

### 2. Close only the reporting launch's session, and let no older retry close a newer report

Type: Behavior
Status: planned
Estimate: 13–15 active minutes.

Proof: With two kept launches, the older launch's quiet report closes only
its own session and `ReportedDone` gets its receipt. Retrying that delivery
with the stores read-only answers the same receipt and leaves both store
files byte-identical. A new delivery competing with a reopen written through
`setRecordDoneAt` reserves a second receipt, both duplicate posts answer
alike, and the session stays open. After a developer's Done, a retry keeps
that Done time. In the superseded case, a quiet report and a newer
unfinished report each fail their write and keep their pending files.
Retrying the older answers its original receipt and closes nothing. The
newer retry records its message and stays open, and the older retry after
it changes nothing. Convert the first case of `agent-completion-identity.spec.ts`
and `agent-completion-superseded.spec.ts`.

### 3. Recover an unacknowledged quiet report as reporting only

Type: Behavior
Status: planned
Estimate: 13–15 active minutes.

Proof: With a tracked Codex execution record, a planted closure repository
and its retired workspace, an empty `completed` report without landing
records its receipt and stays open. With landing and closure kept, an
unacknowledged quiet report keeps its pending submission and a
reporting-only retry. A failed record write keeps the completion absent, and
later `updateRecord` and `bindRecord` writers import none of the reserved
receipt. A receipt dropped after delivery leaves the durable completion and
its automatic Done, and the retry answers that receipt; a duplicate does
too. Convert the first part of `agent-completion-quiet-closure.spec.ts` and
the observations of `completionRecoveryFaults.ts`.

### 4. Keep later reports and the developer's intent apart from an old receipt

Type: Behavior
Status: planned
Estimate: 13–15 active minutes.

Proof: After slice 3's quiet receipt, a fresh unfinished report replaces
automatic Done and keeps the session working. A fresh quiet report moves
automatic Done to its own receipt, and replaying the old delivery, also
over a fresh `ReportedDone`, answers the old receipt and changes neither.
A newer attention report whose receipt was lost and whose message file was
removed recovers its exact message. A developer's Done stays through an old
replay and through a fresh unfinished report and its retry, across a second
fresh collaborator. A malformed retry is refused (409). After the record is
deleted, the retry is refused and `bindRecord` refuses to recreate it.
Convert the rest of `agent-completion-quiet-closure.spec.ts` and
`completionRecoveryIntent.ts`.

### 5. Close a launch whose story returned to the queue, and answer final report requests

Type: Behavior
Status: planned
Estimate: 13–15 active minutes.

Proof: With tracked Cursor executions whose published backlog shows their
story returned, still Taken or completed, a quiet report closes the returned
launch with `returnedToBacklog` set to its receipt. Taken, unfinished,
attention and still-working launches stay open. A completed story and a
one-shot execution close with no outcome. A developer's earlier Done keeps
its time, and a newer report replaces the outcome. An early report closes
its returned launch when `bindRecord` later binds it, and later writers keep
it. Through `finalReportRequest` and the boundary `answer`: an unknown
project, another host, an unrecorded session and an `endpoint` parameter are
refused before any native read, and so is a POST to the exact read. Claude
Code answers that it cannot read one. Cursor answers its kept message,
explains a quiet or missing one, and adds `productClosureEvidence` only for
a completed story. Codex reads its native report through `installFakeCodex`.
Convert `agent-completion-returned-closure.spec.ts` and
`final-report-admission.spec.ts`; retire the latter's cross-site request
(premise 4).

### 6. Hold an early report until its Claude Code session binds

Type: Behavior
Status: planned
Estimate: 14–15 active minutes.

Proof: With a held native dispatch for an accepted queued Claude Code
execution, the first input names its reporting command and reference. A
report naming an unknown session is refused (409). The in-process installed
script's quiet or attention report answers `pending-native-session`, and
the attempt keeps the receipt while no record exists. After the native
launch binds, through settlement or through `verifyLaunch` after an
uncertain settlement, the record holds the receipt and stays open. Later
`updateRecord` and `bindRecord` writes keep it, and the receipt survives
Mark as done. A legacy quiet receipt binds without closing an unbound
session. If the early record is deleted before settlement, a late
`bindRecord` is refused, the attempt marks reporting deleted, and a later
report is refused. Convert `agent-completion-binding.spec.ts` and
`agent-completion-early-recovery.spec.ts`. The Mark as done step uses the
Claude Code Done composition of plan 867's slice 1.

### 7. Give each host its reporting instruction, and refuse a false binding when attempt evidence is lost

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Convert the pure reporting-instruction case of
`agent-completion-input.spec.ts` in place. A blank Claude Code ad hoc launch
through `attemptRun` dispatches no first input, and its kept record holds a
landing context. With `installFakeCodex`, removing or corrupting the attempt
evidence in `afterCreation` makes the launch answer uncertain. The answer
names the thread, Codex, resume and "No first input was submitted". One
`thread/start` and no `turn/start` reach the fake, no record is kept, and
the unreadable evidence is kept aside. Convert `agent-completion-input.spec.ts`
and `agent-completion-attempt-loss.spec.ts`.

### 8. Complete an admitted session from a borrowed or shared checkout, and retire the legacy setup

Type: Behavior
Status: planned
Estimate: 14–15 active minutes.

Proof: Admit an ad hoc Codex launch through `attemptRun` on a real Git
origin. A no-change wrap-up through the installed children, with the
default checkout given as an alias, removes the claim's workspace and keeps
the borrowed checkout's HEAD. Trunk gains the done record and the session
record with its one range. The in-process quiet report answers `recorded`
and pushes nothing. Two admitted launches landing from one checkout, through
the in-process installed delivery, each keep their own landing receipt and
two published ranges after another writer advances trunk. A landing retry
answers the earlier receipt with no Git call. With the accepted evidence
removed, wrap-up is refused with "The native landing has no matching
accepted session range." and the workspace and trunk stay. Convert both
`admitted-session-*-completion.spec.ts`. Delete the retired legacy specs,
remove the test-support files and exports that lost their last caller, and
run the final comparison and the retained E2E journeys.

## Proof ownership and local gate

Files in this map are relative to `dashboard/backend-tests/sessions/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-completion-identity` (1 of 2) | Refusal statuses with the earlier message kept |
| 2 | `agent-completion-identity` (1 of 2), `agent-completion-superseded` (1) | Own session closed, duplicate without writes, reopen and Done kept, older retry inert |
| 3 | `agent-completion-quiet-closure` (first part of 1), `completionRecoveryFaults` | Landing and closure required, pending retry, unimported reservation, lost receipt recovered |
| 4 | `agent-completion-quiet-closure` (rest of 1), `completionRecoveryIntent` | Later reports and Done independent of old receipt, deletion refusals |
| 5 | `agent-completion-returned-closure` (2), `final-report-admission` (1, cross-site request retired) | Returned outcome and closure, final report answers and refusals before native read |
| 6 | `agent-completion-binding` (5), `agent-completion-early-recovery` (1) | Pending receipt bound through settlement or Recheck, kept against late writers, deletion refusals |
| 7 | `agent-completion-input` (2), `agent-completion-attempt-loss` (2) | Host instruction grammar, blank launch, uncertain answer without binding or first input |
| 8 | `admitted-session-no-change-completion` (1), `admitted-session-shared-checkout-completion` (2) | Claim retired, published ranges, receipt retry without Git, held claim |

For the first and final comparisons, use fresh absolute proof paths from the
repo root and one worker. Repeat the baseline at the execution base if
affected paths or the measurement conditions changed. Account for all 20
legacy cases before accepting zero Playwright selections for these 11 files.
If a replacement moves to a new filename, add its exact selector to the
candidate run and record the matching proof owner.

```sh
selection='sessions/(agent-completion-(attempt-loss|binding|early-recovery|identity|input|quiet-closure|returned-closure|superseded)|admitted-session-(no-change|shared-checkout)-completion|final-report-admission)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/sessions/(agent-completion-(quiet|attention|attention-restart|quiet-done)|final-report-done-native|admitted-session-completion)\.spec\.ts$' --workers=1
```

Execution baseline at `2072c2bc7` (27 November 2026, one worker,
`caffeinate -s -i`, load 6–17): 20 Chromium cases passed on the first
attempt in 113.42 s wall, 103.3 s summed case time.

Run the affected consumers from the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
They include `launches/agent-launch-refusal.spec.ts` and every spec that
reaches `submitCompletion`, `deliverCompletion` or the `installedPublisher.ts`
bridge in slice 1. They also include the E2E and landing-capture consumers
of each support file removed in slice 8. Run `npm run typecheck:dashboard`
for changed typed contracts. Record engine and case counts, per-case time
against roughly 100 ms, summed case time, elapsed selection time, and the
separate cost of the retained E2E journeys.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff. Keep default test timeouts.

## Plan review

Slice-plan refinement was not needed. Each Behavior slice owns one
completion family, converts and removes its own legacy cases, and reuses the
same private-HOME composition and in-process installed script. Slice 1's
completion admission and bridge route are the only structure, and they serve
its own Behavior first. Slices 6 and 8 are near the 15-minute limit. Slice 6
converts six cases over a held native dispatch and both binding paths. Slice
8 arranges two admitted launches on a real Git origin and carries the final
cleanup. Slice 8's estimate rests on premise 5's proxy for the admitted wrap-up chain. This review found no other
slice-specific concern.
