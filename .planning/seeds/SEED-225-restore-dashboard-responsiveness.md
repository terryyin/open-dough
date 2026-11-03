---
id: SEED-225
status: active
planted: 2026-11-03
planted_during: Terry Yin's report of a less responsive production dashboard and more frequent GitHub access outages
trigger_when: Dashboard interaction stalls or published work becomes temporarily unreadable
scope: story
---

# SEED-225: Restore dashboard responsiveness and reliable GitHub access

## Selected Stories

<a id="restore-dashboard-responsiveness"></a>

### Restore dashboard responsiveness and reliable GitHub access

**Identity:** SEED-225#restore-dashboard-responsiveness
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can open the Board, read Intent, and use Sessions while
published work refreshes. If a temporary read failure interrupts that work,
the dashboard keeps the last successful snapshot labelled with its revision
and retrieval time, recovers eligible reads without a reload, and leaves
enough evidence to locate the failure.

**Why now.** Terry reports a substantial responsiveness regression and more
frequent GitHub access outages. The investigation found measurable costs in
Intent and Sessions, plus a production loopback failure. Their contribution
to the frequency of the reported outages remains open.

#### Evidence and limits

- **Intent summary CPU.** On Doughnut's 94 feature files and 395 scenario
  rows, a local Node replay of one render's calculations per file arrival
  took a median cumulative 120 ms before the feature, 173 ms in deployed
  revision `37f2327e2`, and 61 ms with the active one-walk correction
  `edbaad4a2` (seven trials per version). The replay used synthetic proof
  observations and excluded React, browser input latency, and network time.
  The deployed summary repeatedly parses read files to count scenarios,
  match observations, rank slowest cases, and calculate child figures.
  The correction consolidates each render's passes, while arrivals can
  still trigger a walk over all ready files. The hierarchy feature uses the
  existing feature-file read loop. [Summary](../../dashboard/src/IntentGherkinSummary.tsx) ·
  [Taken correction](SEED-192-review-product-intent.md#summary-figures-one-walk)
- **Intent request demand.** The earlier committed-proof change
  `58350c9dc` makes Intent inventory wait for the configured locations and
  their proof trees and blobs. Each proof directory eagerly submits its
  JSON reads. A cold folder summary also reads its uncached feature files.
  These requests share eight slots per host and login with Board and CI
  reads, and queue time counts toward the 30-second bound. Intent CI
  status adds its own reads while selected. The extra demand is observable
  in code. Its effect on the reported incidents has yet to be measured.
  [Inventory](../../dashboard/server/intentLocationsRead.ts) ·
  [Proof reads](../../dashboard/server/intentProofRead.ts) ·
  [Request accounting](../../dashboard/GITHUB-REQUESTS.md)
- **Sessions polling.** The production response carried 9.2 MiB of JSON
  for 1,021 session records and 1,032 attempts, with 1,016 sessions marked
  done. An initial sample took 515 ms. Three polls outside the one-second
  reuse window returned 96-byte unchanged answers in 394–425 ms because
  the server rebuilt, serialized, and hashed the snapshot first. A Node
  replay of parsing and validating the full response took 34–66 ms before
  rendering. Native observations and per-record workspace checks also
  scale with retained history, and the state join searches the observations
  for each record. These are measured costs and scaling risks. Their role
  in the 502 is unproven. [Snapshot](../../dashboard/server/machineSessionObservation.ts) ·
  [State join](../../dashboard/server/launchStates.ts)
- **Local transport and GitHub request owner.** On November 3 at 09:42
  Jakarta time, the production proxy logged a 33-second loopback dial
  timeout and a 502 on the terminal endpoint, followed by an incomplete
  authenticated read. It logged a broken-pipe 502 on Mark as done at 10:06.
  Similar loopback timeouts occurred October 31. The production watcher
  drains and stops the old preview before binding its replacement, but the
  09:42 failure occurred several minutes after startup. The running shared
  request owner started before the idle-exit greeting race fix
  `30231a246`, which was included in the dashboard deployment. Both
  versions speak the same protocol, so this is exposure to a known race.
  The observed outages have no confirmed owner or upstream cause.
  [Preview replacement](../../scripts/watch-dashboard.mjs) ·
  [Request lifecycle](../../dashboard/GITHUB-REQUESTS.md)
- **Incident history.** At inspection time the current process reported
  no retained failures across six configured sources. It keeps only the
  latest 100 failures in memory and omits held-back reads. A preview
  replacement clears that evidence. Retained-answer cache writes also
  scan thousands of files synchronously on first write and eviction.
  A separate read-only scan took roughly 20 ms warm and 107 ms on an
  initial sample. Measure event-loop delay before attributing the longer
  outages to cache work. [Diagnostics](../../dashboard/server/readDiagnostics.ts) ·
  [Retained answers](../../dashboard/server/retainedAnswers.ts)

#### Proposed response and evaluation

1. **Diagnose and recover from access failures first.** Extend the existing
   diagnostics and Server-Timing with a bounded, owner-only, sanitized
   incident history that survives preview replacement. Correlate proxy
   and loopback health, deployment transitions, event-loop delay, owner
   version and turnover, queue expiry, dispatch phase, and upstream
   response or rate-limit evidence. Preserve the distinction between a
   local failure, an upstream refusal, and an unknown result. Verify a
   controlled owner handoff that preserves rate-limit holds and in-flight
   call ownership. Reuse the existing bounded visible-page recovery for
   confirmed turnover or pre-dispatch disconnects. Leave ambiguous
   post-dispatch loss, protocol incompatibility, and authentication
   failures actionable. A generic 403 alone supplies no retry policy.
   Test mixed-version handoff with a dashboard and a CI observer, initial
   load and refresh recovery without a reload, no duplicate dispatch
   after ambiguous loss, the eight-call cap, and the full GitHub-directed
   cooldown. Exercise localhost and proxy paths across a production-style
   replacement. If the stop-before-bind gap is reproduced as a material
   cause, keep serving until the replacement is ready and verify that an
   unsuccessful candidate leaves service available.
   [Existing recovery](../../dashboard/server/readFailureMessage.ts) ·
   [Reading contract](../../dashboard/PUBLISHED-OBSERVATION.md)
2. **Keep Intent responsive under cold and warm reads.** Reuse the Taken
   correction's single derivation and measure browser interaction latency
   and long tasks during the 94-file journey before and after it. If file
   arrivals still cause pauses, keep parsed rows per file and update figures
   as new files arrive. Preserve Partial coverage, evidence identity, and
   drill-down. Show Intent inventory independently of Proof, then read the
   visible selection's proof at the same published revision. Reuse pinned
   blob caching, shared outstanding reads, and the existing request owner.
   Bound optional fan-out so a cold summary leaves capacity for Board
   membership and CI observation. Hold proof responses in a deterministic
   test and verify that inventory, Board, and CI can progress and that
   concurrent readers share work without bypassing cooldown or the cap.
3. **Take historical Sessions data off the polling path.** Keep the live
   cross-project overview small and load historical detail and fresh native
   status on demand when opening or acting on a retained session. Reuse the
   shared observation boundary and avoid rebuilding the full response to
   establish that nothing visible changed. Measure the native observation,
   workspace checks, and state join separately. Use indexed matching and
   deduplicated checks where those costs are confirmed. Compare startup,
   unchanged polls, and one active state change with roughly 1,000 records
   and attempts, including input responsiveness and an open terminal.
   Verify that historical reports, reattachment, and fresh action-time
   checks remain available.

**Boundaries and stopping points.** Deliver diagnostics and safe recovery
independently of the two performance paths. Reuse the active summary
correction and the previously delivered published-read recovery. Keep the
existing [SEED-118 cache-validation story](SEED-118-dashboard-reading-reliability.md#show-cards-before-expensive-cache-validation)
separate, and avoid making it a prerequisite. Investigate additional
cache or proxy changes only when measured results warrant them. Preserve
published Git as the authority for workflow facts, and keep local session
evidence separate under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Refinement should establish repeatable baselines and performance targets.
Future plans, delegation, and repair handoffs carry the project's
[Failing and flaky tests policy](../../AGENTS.md#failing-and-flaky-tests).
