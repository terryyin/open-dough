# Prove session notifications through typed observations

**Identity:** SEED-413#prove-session-notifications-through-typed-observations

**Source:** [Session notifications](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-notifications-through-typed-observations)

## Goal and scope

A developer changing alerts gets fast Node Vitest proof over typed session
observations, delivery and lifetime. Each of the eight legacy paths listed
below exits the backend Playwright selection. The notifier tests keep real
process behavior where cancellation or command execution is the subject,
using the synthetic notifier. Keep the existing representative dashboard
journeys. Session reading, native host classification, and other launch
features have separate proof owners. This plan can run independently of
the machine-session read plan.

## Current decisions

- Follow the North Star for [directly testable production
  code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  to judge coverage, case simplicity and elapsed cost together.
- [SessionAlerts](../../../dashboard/server/sessionAlerts.ts) already takes
  a typed session reader and origin provider. Exercise that boundary with
  successive MakeMe `LaunchWithState` snapshots. Keep state classification
  in [sessionShown](../../../dashboard/src/sessionShown.ts), polling
  ownership in SessionAlerts and [repeatUntilStopped](../../../dashboard/server/repeatingCheck.ts),
  and argument and process behavior in [terminalNotifier](../../../dashboard/server/terminalNotifier.ts).
  Expose a typed dependency for notification outcomes only where it lets
  the cases drive the production observer independently. Keep default
  runtime wiring in the production boundary. Avoid inventing a polling
  harness or reimplementing the alert rules in test support.
- [dashboardOrigin](../../../dashboard/server/dashboardOrigin.ts) accepts
  address values through the listener's `address` shape. Use that entry
  for origin decisions. The callback source has an independent
  [native API simulator](../../../dashboard/test-support/support/browserActivation.ts).
  Execute the real source against it directly, while the existing
  `session-alerts-activation-command.spec.ts` owns the real emitted inline
  command and destination. Keep the browser journey for the complete
  dashboard-to-notifier delivery.

## Decisive premises and baseline

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Current alert cases and inline-command proof run at the named profile | Maintained backend runner for the eight named legacy files plus `session-alerts-activation-command.spec.ts` | At `4f107f7e7` on 25 November 2026, Node 24.21.0 on macOS AC power. The maintained proof-record run used two workers and included both cohorts. All 24 notification cases passed, with 52.127 s summed case time and six cases at or below 100 ms. The whole 41-case command took 54.358 s. |
| The representative journeys exercise real Dashboard wiring with synthetic notifications | E2E notification delivery and availability | At `4f107f7e7` on 25 November 2026, all six alert E2E cases passed at one worker in the seven-case E2E selection. They cover notification arguments and repeat timing, plus unavailable and recovered status in the sidebar. |

The maintained engine selector classifies the eight paths as Playwright at
`4f107f7e7`. Its closest successful main CI sample
([run 45572446485](https://github.com/terryyin/open-dough/actions/runs/45572446485))
totals 42.4 s across those file timings. The separate activation-command
case already selects Vitest.

## Ordered slices

The filenames below are under `dashboard/backend-tests/sessions/` unless
a different path is given.

### 1. Alert when a session begins needing the developer

Type: Behavior
Status: done
Estimate: 9–13 active minutes.

Given a session already needing attention at startup, baseline it quietly.
A later available reading entering attention alerts once, rises again
after a genuine re-entry, and stays quiet while unavailable or Done.
Use SessionAlerts with a controlled sequence and notification observations.
Move the reading and startup checks from `session-alerts.spec.ts` to
Vitest in this slice. Keep the existing Playwright file for the owned
shutdown check until slice 6 moves it. Reuse this production entry in the
later snapshot-based cases.

### 2. Preserve input-alert continuity across incomplete readings

Type: Behavior
Status: done
Estimate: 9–13 active minutes.

Given a baselined or already-alerted input wait, omit the session, return an
unknown reading or change the wait summary. Observe silence through those
gaps, then a single new alert after a confirmed working reading rearms it.
Move `session-alerts-input-continuity.spec.ts` to typed observations for
Codex and Claude evidence. Keep native listing and parsing proof at the
host's reader.

### 3. Alert on a newly unread report

Type: Behavior
Status: done
Estimate: 6–9 active minutes.

Given an unread report and a native reading, a kept open record produces
one alert with the report's own words. A Done record suppresses it.
Move `session-alerts-unread-report.spec.ts` through SessionAlerts with
composed records and delivery observations.

### 4. Send literal content to the correct destination

Type: Behavior
Status: done
Estimate: 6–9 active minutes.

Given a quoted title, a backslash or a leading character, the helper
receives the literal title and message and the correct callback URL.
Move `session-alerts-delivery.spec.ts` and the helper's encoding case
to typed subjects and the real notifier argument writer with its
synthetic executable. Preserve an independently supported project-only
destination under the current session model. Reconcile the ad hoc
example with the story-linked cutover and record its surviving owner.

### 5. Show and recover from notifier refusal

Type: Behavior
Status: done
Estimate: 7–10 active minutes.

Given a refused send, observe the safe availability reason without
native stderr and its recovery after a new transition. Before a usable
listener address exists, observe no notification and the availability
reason. Move `session-alerts-refused.spec.ts` and the unavailable-address
helper case to SessionAlerts and synthetic helper outcomes. The existing
E2E availability journey retains the dashboard status consumer.

### 6. Retire the alert loop and its owned child

Type: Behavior
Status: done
Estimate: 8–12 active minutes.

Given a held startup probe or delivery, close SessionAlerts. Verify
the owned child exits, the last confirmed result is preserved and no
later reads start. Move the remaining `session-alerts-helper.spec.ts`
and `session-alerts.spec.ts` lifetime cases using the real synthetic
helper process and a bounded observation of child exit. Remove helpers
after their last caller.

### 7. Use an admitted destination from the listening address

Type: Behavior
Status: done
Estimate: 7–11 active minutes.

Given IPv4/IPv6 loopback or wildcard addresses with assigned ports,
observe the exact usable origin from `dashboardOrigin` and pass its
host and origin values through the production admission. Unusable
addresses yield no destination. Move those decisions from
`session-alerts-origin.spec.ts` to typed values on Node Vitest.
Keep the real listener reachability observation as an E2E socket probe
for the bindings that need it, using the existing bind and cleanup logic.
The notification E2E owns the default dashboard listener and emitted URL.

### 8. Activate the selected dashboard tab

Type: Behavior
Status: planned
Estimate: 7–10 active minutes.

Given the production callback source and a story destination, execute it
against the native Safari and Chrome API stand-ins. An existing eligible
tab is reused and raised. Cold launch, ineligible tabs, and denied
automation retain their distinct outcomes. Move
`session-alerts-activation.spec.ts` to Node Vitest without a Dashboard
server setup. Verify the already-Vitest inline-command case still drives
the emitted callback and literal URL. Account for all eight legacy paths.

## Concern evidence

Slice-plan refinement split report eligibility from argument delivery,
and recovery from shutdown, so each has a focused check. SessionAlerts
owns eligibility, delivery and close. The browser callback and listener
have separate observable failures, so each has its own proof. Slice 6
settles the temporary split of the main alert file from slice 1.
No remaining slice-specific concern was identified against the observed
baseline.

## Execution context

### Learnings

- Slice 1 implementation and focused proof finished within the estimate;
  the slice clock later reported 78 active minutes and `storyOverruns: 1`
  because the delegated implementation call was interrupted without a
  pause after proof. Treat that overrun as session-idle inflation, not a
  failed slice size. Remaining slices keep their estimates.
- `SessionAlerts` accepts an optional `SessionAlertNotifier`; production
  keeps the branded helper. Reading/startup cases live in
  `session-alerts-reading.spec.ts`; shutdown stays in
  `session-alerts.spec.ts` until slice 6.

### Slice 1 accepted proof

- Vitest `backend-tests/sessions/session-alerts-reading.spec.ts` — 5
  cases: five alerting readings, quiet unreadable listing observation,
  quiet Done, quiet restart baseline then re-entry alert, first later
  attention alert. Reproved after interrupted delegation
  (`slice1-reprove-vitest.log.run.json`).
- Playwright `backend-tests/sessions/session-alerts.spec.ts` — shutdown
  lifetime only (`slice1-reprove-playwright-proof.json`).
- Production: optional notifier dependency on `SessionAlerts`; shared
  `TerminalNotificationContent`; MakeMe `unknownReason` for unrecognized
  readings.

### Slice 2 accepted proof

- Vitest `backend-tests/sessions/session-alerts-input-continuity.spec.ts`
  — 3 cases: baselined Codex and already-alerted Claude stay quiet
  through unknown/incomplete/omit/changed summary then alert once after
  working rearms; newly listed Codex+Claude each alert once and stay
  quiet through omission until working rearms one
  (`slice2-vitest-continuity-2.log.run.json`). Engine list shows `[node]`
  only. Production unchanged.

### Slice 3 accepted proof

- Vitest `backend-tests/sessions/session-alerts-unread-report.spec.ts` —
  one case: unread report alerts in its own words beside the native
  reading; Done suppresses a further report alert
  (`slice3-vitest-unread.log.run.json`). Engine `[node]` only. Production
  unchanged.

### Delivery dispositions

- Slice 2: skipped fresh refactor — subject-spec-only rewrite; product
  search found no required refactor-check candidate beyond a local
  observe harness duplicated from slice 1, which must not move into
  test-support and is retained for later snapshot cases.
- Slice 3: skipped fresh refactor — subject-spec-only rewrite; same
  local observe harness; no production change.
- Slice 4: skipped fresh refactor — subject-spec rewrite plus encoding
  case removal from the helper Playwright file; no production change.
  Ad hoc project-only destination surviving owner remains
  `session-alerts-delivery.spec.ts`.
- Slice 5: skipped fresh refactor — subject-spec rewrite plus
  unavailable-address helper case removal; no production change.
- Slice 6: skipped fresh refactor — subject-spec lifetime relocation and
  emptied Playwright file deletion; no production change; shared alert
  fixtures retain other callers.
- Slice 7: skipped fresh refactor — subject-spec origin Vitest rewrite
  plus E2E socket probe; no production change; probe is not a browser
  journey so no page-object seam.

### Slice 6 accepted proof

- Vitest `session-alerts-lifetime.spec.ts` — close ends held startup
  probe and held delivery children (SIGTERM), preserves last confirmed
  availability, and stops further reads
  (`slice6-vitest-lifetime.log.run.json`). Emptied
  `session-alerts-helper.spec.ts` and `session-alerts.spec.ts` removed.

### Slice 7 accepted proof

- Vitest `session-alerts-origin.spec.ts` — typed listener address shapes
  yield exact usable origins through `dashboardOrigin` and admission;
  unusable addresses yield none (`slice7-vitest-origin.log.run.json`).
- E2E socket probe `e2e/sessions/session-alerts-origin.spec.ts` — real
  binds for 127.0.0.1 / 0.0.0.0 / ::1 / ::
  (`slice7-e2e-origin-2.log.run.json`).

### Slice 4 accepted proof

- Vitest `session-alerts-delivery.spec.ts` — literal title/message and
  story URL; encoding via real `sendTerminalNotification` + synthetic
  executable; ad hoc project-only destination
  (`slice4-vitest-delivery.log.run.json`). Remaining helper Playwright
  cases still pass (`slice4-helper-remaining-proof.json`).

### Slice 5 accepted proof

- Vitest `session-alerts-refused.spec.ts` — refused send yields the safe
  availability reason without stderr and recovers on a new transition;
  missing origin yields no notification and the no-destination reason
  (`slice5-vitest-refused-2.log.run.json`). Unavailable-address helper
  case removed; remaining helper cases pass.

## Verification and delivery

- Local gate uses the maintained [macOS sleep
  guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power and the shared [failure
  policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Keep the default timeout. Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md)
  for backend data. Apply [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  if modifying a browser journey.
- Run each slice focused. Before and after the cohort run
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- 'backend-tests/sessions/session-alerts(-[^/]+)?\.spec\.ts' --workers=2`
  with distinct absolute `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` paths.
  Record case count, per-case times against about 100 ms, summed case time,
  elapsed time, host load and remaining process costs. Include relocated
  socket proof in the coverage and cost comparison. Confirm all eight
  legacy paths have a typed or E2E owner and none selects backend Playwright.
- Run Dashboard typecheck and staged lint. Run
  `npm run test:e2e -- session-alerts.spec.ts session-alerts-unavailable.spec.ts --workers=1`
  and the relocated socket probe before delivery. Trace remaining consumers
  of the synthetic notifier, activation and alert fixtures before removing
  dead support. Hosted CI runs the groups after publication.
