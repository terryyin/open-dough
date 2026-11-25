# Prove machine-session reads through typed backend answers

**Identity:** SEED-413#renovate-remaining-backend-families-after-browser-reporter

**Source:** [Machine-session reads](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-backend-families-after-browser-reporter)

## Goal and scope

A developer changing the machine-session read gets a focused Node Vitest
answer for host state, overview and history, revisions, freshness and
transfer encoding. The six named legacy files leave the backend Playwright
selection. Each retained case drives its production owner directly. Keep
session mutations, notifications, launch and review workflows, and runner
retirement with their respective stories. Keep representative browser
proof of reading history in the existing E2E journey.

## Current decisions

- Follow the North Star for [directly testable production
  code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the typing and proof-cost criteria from [ADR 0002, Software
  development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Reuse [withStates](../../../dashboard/server/launchStates.ts) for host
  translation, [SessionsAnswerFragments](../../../dashboard/server/machineSessionsFragments.ts)
  for the two audiences and their revision material,
  [MachineSessionObservation](../../../dashboard/server/machineSessionObservation.ts)
  for sharing and viewer answers, and [SharedGzip and response
  writing](../../../dashboard/server/agentLaunchResponse.ts) for encoding.
  The production adapter supplies request values, disconnect signal and
  current observation inputs. Expose existing decisions over those
  values where a case would otherwise construct a server or a wide fixture.
  Keep the [shared reader contract](../../../dashboard/src/machineSessionsRevision.ts)
  as the assertion boundary. Notifications continue to consume
  `machineSessions(signal)` through the same observation.
- Favor a typed read of already-kept state and independently controlled host
  results. Reuse [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for
  records, attempts and host readings. Reuse the synthetic native host
  where its executable output is the subject. Use the existing
  [shared observation](../../../dashboard/server/sharedObservation.ts)
  and controlled demand in time-sensitive cases. Cleanup follows the
  final caller of each helper. Add no support wrappers.

## Decisive premises and baseline

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Current legacy cases exercise the read outcomes before migration | Maintained backend runner for the six named files at the existing two-worker profile | At `4f107f7e7` on 25 November 2026, Node 24.21.0 on macOS AC power. The maintained proof-record run used two workers and included both cohorts. All 17 read cases passed, with 43.534 s summed case time and four cases at or below 100 ms. The whole 41-case command took 54.358 s. |
| Browser proof observes retained history through the shipped response | Retained-history E2E, from listing to expanded history | At `4f107f7e7` on 25 November 2026, the retained-history case passed in the seven-case E2E selection at one worker. The case expands Recently done sessions and observes one gzip history read and the retained detail. |

The maintained engine selector classifies all six paths as Playwright at
`4f107f7e7`. Its closest successful main CI sample
([run 45572446485](https://github.com/terryyin/open-dough/actions/runs/45572446485))
totals 48.4 s across the six file timings. Measure comparable local runs as
specified below.

## Ordered slices

The filenames below are under `dashboard/backend-tests/sessions/`.

### 1. Read the kept machine sessions with their host states

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Given kept Claude records across projects alongside unrelated native
sessions, read through the production owner of `withStates`. Observe an
empty store without a host call, one listing across projects, the joined
available states, and unknown readings when the host fails followed by
recovery. Preserve clearing the waiting reason when a session resumes.
Move `agent-launch-session-listing.spec.ts` to Node Vitest. Compose records
with MakeMe and use the synthetic Claude output for translation evidence.

Proof (25 November 2026, load ~5–6): six Node cases pass in
`agent-launch-session-listing.spec.ts`, each well under 100 ms, through
`withStates` with a typed `HostSessions` and the production
`parsedListing` and `claudeObservations`. The six-file gate passed 16/16
at two workers (44.654 s summed, 25.731 s elapsed); five paths remain
Playwright selections.

### 2. Separate compact overview from retained detail

Type: Behavior
Status: planned
Estimate: 11–15 active minutes.

Given open and Done sessions, settled attempts and a retained follow-up,
ask for overview and history. The overview carries compact Done entries,
only attempts still needing attention and the independent history
revision. History supplies full Done detail including follow-up context
and the settled attempts. Move
`agent-launch-sessions-history.spec.ts` and
`agent-launch-sessions-listing.spec.ts` through the production audience
projection and shared schemas. Keep one many-record example for the
compact payload property. Compose saved state and move malformed-audience
proof to slice 5.

### 3. Read a held revision until the answer changes

Type: Behavior
Status: planned
Estimate: 9–13 active minutes.

Given a viewer holding an overview or history revision, ask for that
audience again. Observe the small unchanged body for the matching
revision and the full answer with a new revision once the relevant
observed input changes. In
`agent-launch-sessions-unchanged.spec.ts`, replace the Done mutation
setup with an updated observed record. Call the answer owner with typed
audience, held revision and abort signal. Bind response close in the
production HTTP adapter.

### 4. Fresh demand observes after the ask

Type: Behavior
Status: planned
Estimate: 9–13 active minutes.

Given a held recent observation and changed Codex options, ask ordinarily
and with fresh demand. Reuse the held observation for the ordinary
reader. The fresh reader receives the change from an observation started
after its demand. Move `agent-launch-sessions-fresh.spec.ts` through the
same answer owner and the real shared-observation scheduling. Advance
controlled observations by their completion or start, with no sleep used
as the assertion.

### 5. Admit and encode a session read at the adapter

Type: Behavior
Status: planned
Estimate: 10–14 active minutes.

Given full, unchanged and refused answers, pass typed request values
through the production admission and response selection. Observe
malformed audience and existing origin refusal, equivalent gzip and
plain JSON when accepted, plain JSON when gzip is declined, the correct
`Vary`/no-store framing, and plain unchanged and refusal bodies.
Move `agent-launch-sessions-encoding.spec.ts` using a shared answer and
real compression. Follow how the adapter sends the resulting bytes with
the existing `agent-launch-retained-history.spec.ts` E2E. Remove support
used only by the migrated cases after tracing retained consumers.

## Concern evidence

Slice-plan refinement was unnecessary. The six paths map to five proof
loops with one observation and one shared contract. Slice 3 exposes the
answer values first used there and reused by slice 4. Any interim mixed
selection converges at slice 5. No remaining slice-specific concern was
identified against the observed baseline.

## Story obligations

### G1. Machine read's listing command no longer asserted in the session read
Reported: slice 1 — "Nothing remaining asserts the command and folder for the machine read"
Story clause: "Developers changing the dashboard's machine-session read get fast, typed Node Vitest feedback on what an overview or history reader receives."
Disposition: no user cost "Developers changing the dashboard's machine-session read get fast, typed Node Vitest feedback on what an overview or history reader receives.": the listing argv is the shared `listingArgs` of `claudeSessions` (dashboard/server/hosts/claude/runtime.ts), asserted as `agents --json --all` by dashboard/backend-tests/launches/agent-launch-boundary.spec.ts; `--all` lists every folder's sessions, so the folder changes no reader's answer; `withStates` passing its folder is asserted by `listedIn` in agent-launch-session-listing.spec.ts; the default host wiring stays exercised through the synthetic `claude` by e2e/sessions/agent-launch-retained-history.spec.ts.

## Verification and delivery

- Local gate uses the maintained [macOS sleep
  guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power and the shared [failure
  policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Keep the default timeout. Use MakeMe for backend sources.
- Run each slice focused. At the first and final slice, run
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- 'backend-tests/sessions/(agent-launch-session-listing|agent-launch-sessions-(encoding|fresh|history|listing|unchanged))\.spec\.ts' --workers=2`
  with distinct absolute `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` paths.
  Record per-case count and time against about 100 ms, summed case time,
  command elapsed and host load. Map any changed assertion count to its
  surviving owner and account for the host-process proof. Verify zero
  legacy selections among the six paths and trace the consumers of
  changed shared entries and removed support.
- Run Dashboard typecheck and staged lint. Run
  `npm run test:e2e -- agent-launch-retained-history.spec.ts --workers=1`
  for the final answer and transport wiring under the same sleep guard.
  Hosted CI runs the groups after publication.
