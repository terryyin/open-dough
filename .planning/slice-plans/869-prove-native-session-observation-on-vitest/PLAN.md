# Prove native session observation and alerts in Node Vitest

**Identity:** SEED-413#prove-native-session-observation-on-vitest

**Source:** [Prove native session observation and alerts in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest)

## Goal and scope

Give Dashboard maintainers fast, typed Node Vitest proof of how the Dashboard
reads Codex and Cursor sessions, shares bounded observations across viewers
and alert polling, invalidates on catalog or machine-document changes, and
raises session alerts. Move the nine legacy specs (19 regular cases plus the
opt-in `DOUGH_SESSIONS_REPLAY=1` measurement) off backend Playwright and
account for each observation. Product behavior is unchanged. Completion
reporting, Done/delete/reopen, terminal attach, Cursor runner lifecycle, and
retention belong to their sibling stories in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- PFE: the production seams these cases need already exist and run on Vitest:
  - [`codexSessions`](../../../dashboard/server/hosts/codex/sessions.ts) takes
    `(records, signal)` directly over [`installFakeCodex`](../../../dashboard/test-support/support/fakeCodex.ts)
    with no Dashboard server.
  - [`withStates`](../../../dashboard/server/launchStates.ts) already accepts
    `hostSessions` for multi-host isolation, and
    [`deleteRecord`](../../../dashboard/server/launchRecordDeletion.ts) removes
    a kept record directly in a private `HOME`.
  - [`MachineSessionObservation`](../../../dashboard/server/machineSessionObservation.ts)
    takes `(read, inputs, { waitMs, reuseMs })` directly, as
    [`agent-launch-sessions-fresh.spec.ts`](../../../dashboard/backend-tests/sessions/agent-launch-sessions-fresh.spec.ts)
    already demonstrates on Vitest.
  - [`SessionAlerts`](../../../dashboard/server/sessionAlerts.ts) takes
    `{ machineSessions }`, `origin`, and `notifier: SessionAlertNotifier`, as
    [`session-alerts-reading.spec.ts`](../../../dashboard/backend-tests/sessions/session-alerts-reading.spec.ts)
    and [`session-alerts-input-continuity.spec.ts`](../../../dashboard/backend-tests/sessions/session-alerts-input-continuity.spec.ts)
    already demonstrate on Vitest.
  - [`heldCursorSessions`](../../../dashboard/server/hosts/cursor/heldSessions.ts)
    and [`heldCursorSessionEvidence`](../../../dashboard/server/hosts/cursor/heldSessions.ts)
    read `GET /sessions` from the port in
    [`cursorRunnerAddressFile(home)`](../../../dashboard/server/hosts/cursor/runnerPaths.ts)
    through `SharedObservation` keyed by `[home, await machineDocumentsRevision()]`.
    An in-process `http.createServer` written to `cursorRunnerAddressFile(home)`
    proves the real wire parser, sharing, settled reuse, and revision
    invalidation without a Dashboard server, runner process, or PTY.
- For Cursor session alerts (slice 4), give
  [`observeCursorSessions`](../../../dashboard/server/hosts/cursor/sessions.ts)
  an optional `readHeld = heldCursorSessionEvidence` parameter so alert cases
  compose `observeCursorSessions`, `withStates`, and `SessionAlerts` over typed
  `HeldCursorSessions` values while existing callers keep the production
  default.
- Consolidate [`cursor-runner-sessions-sharing.spec.ts`](../../../dashboard/backend-tests/sessions/cursor-runner-sessions-sharing.spec.ts)
  (1 case) into [`cursor-held-sessions-revision.spec.ts`](../../../dashboard/backend-tests/sessions/cursor-held-sessions-revision.spec.ts)
  (2 cases) in slice 5: its single case tests the exact same overlapping-ask
  sharing and reuse window, plus `runner === "running"` and
  `sessions.map(({ label }) => label)` equals `["working"]`, which slice 5
  keeps in `cursor-held-sessions-revision.spec.ts` before deleting the
  duplicate file.
- Keep [`sessions-replay.spec.ts`](../../../dashboard/backend-tests/sessions/sessions-replay.spec.ts)
  as an opt-in Node Vitest measurement (`test.skipIf(process.env["DOUGH_SESSIONS_REPLAY"] !== "1")`)
  preserving its individual 120 s timeout and real-server measurement table.
- Real browser page journeys and real Cursor runner / `cursor-agent` PTY
  observations stay in `e2e/sessions/`:
  [`agent-launch-codex-observation.spec.ts`](../../../e2e/sessions/agent-launch-codex-observation.spec.ts),
  [`agent-session-cursor.spec.ts`](../../../e2e/sessions/agent-session-cursor.spec.ts),
  [`cursor-runner-sessions.spec.ts`](../../../e2e/sessions/cursor-runner-sessions.spec.ts),
  and [`session-alerts.spec.ts`](../../../e2e/sessions/session-alerts.spec.ts).
  This plan adds no E2E case.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for records and
  observed states (note Cursor `sessionId` must be a valid UUID per
  `hostSessionSchema`). Add zero new server, request, or boundary wrappers to
  `dashboard/test-support/`. Remove any test-support export or file left with
  zero remaining callers in slice 6 after checking sibling legacy specs and E2E
  journeys.

## Decisive premises

Observed in the owned preparation checkout at `3a4986059` on 27 November 2026
with Node 24.21.0, one worker, locked dependencies linked from the integration
checkout, and macOS on AC under `caffeinate -s -i`. Load average was ~10–13
from other work. Use these runs for behavioral evidence and take a comparable
pair for the execution's performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| 1. The maintained backend selector reaches all nine legacy specs (20 cases: 19 active + 1 skipped opt-in replay) | The local-gate selection below ran `npm run test:dashboard:backend -- "$selection" --workers=1` under `caffeinate -s -i` and exited 0 in 80.72 s wall (`selectedCount: 20`, 20 entries in proof record, all on legacy backend Playwright). |
| 2. `codexSessions`, `MachineSessionObservation`, `SessionAlerts`, and `cursorSessionLabel` run directly on Node Vitest with no server | `npm run test:dashboard:backend -- 'sessions/(zz-scratch-obs-probe\|session-alerts-reading\|session-alerts-input-continuity\|agent-launch-sessions-fresh\|cursor-session-classification)\.spec\.ts$' --workers=1` passed all 21 existing Vitest cases (`agent-launch-sessions-fresh` 7 ms, `cursor-session-classification` 11 cases in 0–2 ms each, `session-alerts-reading` 5 cases in 103–259 ms each, `session-alerts-input-continuity` 3 cases in 415–515 ms each) plus the scratch `codexSessions` + `installFakeCodex` probe in 11 ms (scratch file removed). |
| 3. `heldCursorSessions` and `heldCursorSessionEvidence` talk to a local HTTP stand-in runner and invalidate on `machineRecordStore.replaceRecords` in Node Vitest | A scratch Vitest probe (since removed) wrote `{ port, pid: process.pid }` to `cursorRunnerAddressFile(home)` under a private `HOME` with a valid UUID `sessionId`, held `GET /sessions` on an in-process `http.createServer`, wrote a Cursor record via `machineRecordStore.replaceRecords`, and observed `reads === 2`, `runner === "running"`, and the held `"working"` session in 82 ms. (Also confirmed `hostSessionSchema` requires a UUID `sessionId` for Cursor records, and `keptRecordsByProject()` runs after `readCursorRunnerSessions` resolves.) |

## Ordered slices

Execution resumed from the accepted Take `7ccce2b093c694183ca758c8cdb1af342316e002`
in the established Sola-chan story worktree. Increment target is
`origin/codex/prove-native-session-observation-and-alerts-in-n`; integration is
`origin/main`. The Codex observer for `terryyin/open-dough`, `ci.yml` (CI), is
`sola-869-1c81d34a` at `/tmp/dough-ci-501/watch-Z1gBWo` (session 1209,
PID 17032, cell `g656:7`).

The fresh locked-install baseline at the Take selected 20 Chromium cases on
one worker. It passed 19 and skipped the opt-in replay, with zero retries and
88.84 s wall time. The case-level record is `baseline-backend.json` in the
checkout's Git evidence directory.

### 1. Prove Codex read concurrency, abort cancellation, and status/failure isolation on Node Vitest

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Convert `agent-launch-codex-observation-concurrency.spec.ts` (2 cases)
and `agent-launch-codex-observation-status.spec.ts` (4 cases) to plain Node
Vitest in place, with no Dashboard server:

- 24 held Codex sessions split across two overlapping `codexSessions` calls
  run at most 4 `thread/read` calls at once and all 24 finish as available
  `review`; aborting a 12-session held batch cancels queued reads (only 4
  `cancel-*` reads start) without losing results for a concurrent 12-session
  recovery batch.
- Status variants preserve native provenance (`systemError`, `inProgress`,
  unrecognized turn/flag, incomplete missing flags) and require the exact
  `-32600` missing-thread error for `unavailable`.
- `withStates` isolates healthy Claude and Codex hosts from refused,
  bad-endpoint, and legacy no-endpoint Codex records while leaving all 5 kept
  records intact.
- Deleting an unreadable saved record via `deleteRecord` while two overlapping
  `MachineSessionObservation` reads are pending never recreates it in the
  store, and the next read returns `[]`.
- A silent second `installFakeCodex` endpoint reaches its 9 s per-endpoint
  deadline and closes its socket (`silent.sockets.size === 0`) without erasing
  a healthy Codex endpoint.

All native calls remain passive (`initialize`, `initialized`, `thread/read`,
`thread/turns/list`).

Accepted proof: six Node cases passed across concurrency, status, and
status-lifetime with zero retries (`slice1-refactor-final-backend.json` in
Git evidence). Dashboard typecheck passed. The lifetime test advances the
production 9,000 ms timeout on a controlled clock and observes the real
socket close while the healthy endpoint remains available. The refactor
keeps the existing Playwright assertion body and shares it with Node tests.

### 2. Prove shared machine-session observation, reuse, catalog invalidation, and read-wait bounds on Node Vitest

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Convert `agent-launch-codex-observation-sharing.spec.ts` (3 cases) and
`agent-launch-codex-observation-wait.spec.ts` (1 case) to plain Node Vitest in
place, driving `MachineSessionObservation` directly over `codexSessions` +
`installFakeCodex` (no Dashboard server, no raw HTTP sockets):

- Eight `answerFor` viewers and `SessionAlerts` polling share one held
  observation (`[1, 1]` native calls, identical serialized body across all 8
  viewers with `review` and `attempts: []`, and further observer polls within
  the reuse window stay `[1, 1]`).
- A settled observation reuses its exact serialized answer within the reuse
  window and observes afresh (`[2, 2]`, `working`) once the window passes
  (using `DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE` or short `reuseMs`).
- Changing the project catalog (`removeProject` under a private `HOME` with
  `machineSessionInputs`) invalidates the settled observation within the reuse
  window and observes `records: []` immediately.
- Waiters share a held observation while a departing waiter aborts only its
  own `AbortController`; waiters past the configured `waitMs` reject with
  `RefusedRequest(503, /not observed within .* Ask again\./)` without starting
  a second observation; a rejoined waiter receives the running observation on
  release, and an ask after the reuse window observes afresh (`[3, 3]`).

### 3. Prove Codex native-transition alerts and review gap continuity on Node Vitest

Type: Behavior
Status: planned
Estimate: 10–12 active minutes.

Proof: Convert `agent-launch-codex-observation-alerts.spec.ts` (2 cases) to
plain Node Vitest in place, driving `SessionAlerts` over `codexSessions` +
`installFakeCodex` with a typed `SessionAlertNotifier` spy and
`DOUGH_ALERT_CHECK_MS=20` (no Dashboard server, no `terminal-notifier`
subprocess):

- Starting from baselined `notLoaded`/`completed`, transitions alert
  `Needs input: Codex is waiting for your input` (with exact project/story
  title), alert `State not recognized` once for each unrecognized status/flag/turn
  and re-arm after `active []`, stay quiet on `metadataError`, missing
  `activeFlags`, and `historyError`, and alert `Ready for review` on
  `idle`/`completed` (6 total alerts, passive calls only).
- Review baselines and notifications survive `metadataError`, incomplete
  `active`, `historyError`, and omitted-record gaps until confirmed `active []`
  or `waitingOnUserInput` re-arms review.

### 4. Prove Cursor session observation and alerts on Node Vitest

Type: Behavior
Status: planned
Estimate: 10–12 active minutes.

Proof: Add an optional `readHeld = heldCursorSessionEvidence` parameter to
`observeCursorSessions` in `dashboard/server/hosts/cursor/sessions.ts`
(preserving default behavior for all existing callers). Convert
`cursor-session-alerts.spec.ts` (4 cases) to plain Node Vitest in place,
driving `SessionAlerts` over `observeCursorSessions` + `withStates` with typed
`HeldCursorSessions` states and a typed `SessionAlertNotifier`:

- A follow-up prompt whose `firstInput` is `awaiting` (unconfirmed) reads
  `awaiting-instruction` and alerts nothing.
- A held Cursor session alerts once on `waiting` (`Needs input: <question>`),
  re-arms after `working`, alerts again on re-entry, alerts `Ready for review`
  on `followUp`, and stays quiet when the agent vanishes
  (`agentNotRunningLabel`) or the runner stops
  (`cursorRunnerSentence("not-running")`).
- Cancelled and failed history settling to the follow-up prompt (classified
  through `cursorSessionLabel`) reads `review`, alerts `Ready for review`
  once with no failure alert, and vanishing stays unknown.
- A finished Cursor record (`completion` set) not held by the runner reads
  `{ kind: "unknown" }` with no `agentNotRunningLabel` claim and alerts
  nothing.

### 5. Prove Cursor held-session sharing, reuse, and revision invalidation on Node Vitest

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Convert `cursor-held-sessions-revision.spec.ts` (2 cases) to plain Node
Vitest in place and delete the duplicate `cursor-runner-sessions-sharing.spec.ts`
(1 case), driving `heldCursorSessions` and `heldCursorSessionEvidence` directly
against an in-process HTTP stand-in runner written to
`cursorRunnerAddressFile(home)` under a private `HOME`:

- A Cursor launch record written via `machineRecordStore.replaceRecords` while
  a `GET /sessions` read is held triggers a fresh runner read under the new
  `machineDocumentsRevision()` (`reads === 2`) and labels the session
  `working` rather than `agentNotRunningLabel`.
- Overlapping `heldCursorSessions` (3 calls) and `heldCursorSessionEvidence`
  (1 call) asks under unchanged machine documents share one runner read,
  return `runner: "running"` with `label: ["working"]` and the held
  `sessionId`, reuse the settled result within the reuse window without
  another runner read, and read again once the window expires.

### 6. Convert the opt-in Sessions replay measurement to Node Vitest and retire unused support

Type: Behavior
Status: planned
Estimate: 10–12 active minutes.

Proof: Convert `sessions-replay.spec.ts` (1 opt-in case) to plain Node Vitest
using `test.skipIf(process.env["DOUGH_SESSIONS_REPLAY"] !== "1")` and keeping
its individual 120 s timeout (`{ timeout: 120_000 }`). Inspect callers of
`codexObservation.ts`, `cursorRunnerHeldReads.ts`, `cursorSessionReading.ts`,
`sessionAlerts.ts`, `runningCursorSessionsPage.ts`, and `sessionsReplay*.ts`
across `dashboard/` and `e2e/`; remove any export or file left with zero
remaining callers. Run the final backend Vitest comparison, `npm run
typecheck:dashboard`, and the retained E2E journeys.

## Proof ownership and local gate

Files in the following map are relative to `dashboard/backend-tests/sessions/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-launch-codex-observation-concurrency` (2), `agent-launch-codex-observation-status` (4) | Shared 4-read bound, abort cancellation, provenance & missing-target error, multi-host isolation, deletion during pending read, 9 s silent-endpoint deadline |
| 2 | `agent-launch-codex-observation-sharing` (3), `agent-launch-codex-observation-wait` (1) | 8 viewers + observer share 1 read, settled reuse & expiry, catalog invalidation, departing waiter & 503 read-wait bound |
| 3 | `agent-launch-codex-observation-alerts` (2) | Codex unrecognized vs incomplete transitions, review baseline/notification continuity through gaps |
| 4 | `cursor-session-alerts` (4) | Unconfirmed first input, actionable entry & re-arm, cancelled/failed history to review, finished unheld record |
| 5 | `cursor-held-sessions-revision` (2), `cursor-runner-sessions-sharing` (1, consolidated and deleted) | Revision invalidation on record write during held read, overlapping list/evidence sharing, settled reuse & expiry |
| 6 | `sessions-replay` (1 opt-in) | Opt-in `DOUGH_SESSIONS_REPLAY=1` measurement on Vitest, unused support retired |

For the first and final comparisons, use fresh absolute proof paths from the
repo root and one worker. Repeat the baseline at the execution base if
affected paths or measurement conditions changed. Account for all 20 legacy
cases (19 active + 1 skipped opt-in) before accepting zero Playwright
selections for these files. The `status-lifetime` successor carries two cases
from the status spec and joins the comparison selector. It is absent at the
baseline revision, so the legacy selection remains the same 20 cases.

```sh
selection='sessions/(agent-launch-codex-observation-(alerts|concurrency|sharing|status(-lifetime)?|wait)|cursor-held-sessions-revision|cursor-runner-sessions-sharing|cursor-session-alerts|sessions-replay)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/sessions/(agent-launch-codex-observation|agent-session-cursor|cursor-runner-sessions|session-alerts)\.spec\.ts$' --workers=1
```

Run affected consumers from the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for the optional `readHeld` parameter in slice 4 and any removed test-support
exports in slice 6. Run `npm run typecheck:dashboard` for changed typed
contracts. Record engine and case counts, per-case time against roughly
100 ms, summed case time, elapsed selection time, and the separate cost of the
retained E2E journeys.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff. Keep default test timeouts except the
existing 120 s individual timeout on the opt-in `sessions-replay.spec.ts`
measurement.

## Plan review

Slice-plan refinement was not needed. All six slices are Behavior slices
within the 8-slice and 15-minute limits, each owning a cohesive observation or
alert family and retiring its own legacy Playwright specs. Slice 4's optional
`readHeld` parameter on `observeCursorSessions` is a one-line collaborator
default matching `withStates` and `SessionAlerts`. All three decisive premises
were observed in this checkout. This review found no remaining slice-specific
concern.
