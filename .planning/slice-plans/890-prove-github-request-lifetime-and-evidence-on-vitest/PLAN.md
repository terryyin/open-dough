# Prove GitHub request lifetime and failure evidence in Node Vitest

**Source:** [Prove GitHub request lifetime and failure evidence in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#github-request-lifetime-and-evidence-via-vitest)

**Identity:** SEED-413#github-request-lifetime-and-evidence-via-vitest

**Split from:** SEED-413#authenticated-github-observation-via-vitest at its
delivered slice 3. Slices 1–5 here are that story's slices 4–8 of
[plan 862](../862-prove-authenticated-github-observation-on-vitest/PLAN.md),
mapped unchanged in order. Plan 862 keeps slices 1–3 (classified failures
and the output bound, held and resumed reads, shared requests and turn
timing). After its cleanup, recover it from Git history at the revision
that lands it.

## Goal and scope

Give Dashboard and CI maintainers fast Node Vitest proof that authenticated
GitHub reads end their owned work when the last owner leaves, share one
owner across Dashboards and CI, and leave bounded, safe diagnostic and
incident evidence. Account for all 13 observation paths below. Keep
existing product behavior and preserve the proof that needs a real socket,
subprocess, owner process, Git repository, or durable file.

[Plan 858](https://github.com/terryyin/open-dough/blob/bca2def1a/.planning/slice-plans/858-move-authenticated-read-proofs-off-the-board-ref-read/PLAN.md)
moved the general authenticated-read tests away from the Board's cold
read. [Plan 856](https://github.com/terryyin/open-dough/blob/e4faafbdb/.planning/slice-plans/856-open-the-board-from-the-verified-git-trunk/PLAN.md)
put that read on verified Git trunk. Keep the revision check for listing
and its lifetime, and the pinned content read for one-attempt failure and
attribution. Prepare the pinned revision and reachable path before
recording upstream call counts.

[Plan 861](../861-prove-published-refresh-lifecycle-on-vitest/PLAN.md) owns
revision-listing reuse, revision streams, and retained answers.
[Plan 860](https://github.com/terryyin/open-dough/blob/ebdf4ebac57a7d7cd41172def1b8089a2d4fd455/.planning/slice-plans/860-prove-published-read-admission-on-vitest/PLAN.md)
owns source and published-record read admission. [Plan 887](../887-read-board-records-at-published-pins/PLAN.md)
owns moving further readers to local Git. The installed login-isolation
checks and the browser journeys retain their existing owners.

## Current decisions

- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and the North Star's [direct production seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  guide this migration. Use the installed `GitHubRequests` owner and the
  Dashboard's `RevisionChecks` and `diagnosticsForSource` for the outcomes
  they own. Use typed inputs and the smallest boundary that supplies
  independent proof.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and the North Star's [shared Git refresh](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  keep origin authoritative and incident data machine-local. Reuse the
  existing boundary chain and plugin hooks for HTTP and close proof.
  Prefer direct production operations for the rest. Use isolated homes and
  a synthetic upstream. Use the CLI transport and independently observe a
  PID and its exit when a case promises actual subprocess termination.
  The in-process transport does not create that PID.
- Reuse the installed Distribution owner tests for equivalent protocol
  rules. They do not supply Dashboard read selection, receipt of failures
  by both Dashboards, or CI wiring proof. Keep those assertions on the
  relevant production callers. Reuse existing test collaborators where the
  real boundary needs them and add zero wrappers to test support. Before
  removing `sharedReads.ts`, `readDiagnostics.ts`,
  `inProcessAuthenticatedRead.ts` or `revisionCheckBoundary.ts` support,
  trace every actual caller across Dashboard, Distribution, and E2E.
  Plan 861 still uses `revisionCheckBoundary.ts` and the runtime family
  still uses the in-process boundary support.
- Keep browser behavior with
  [two tabs sharing turns](../../../e2e/observation/read-turns-across-tabs.spec.ts),
  [rate-limit recovery](../../../e2e/observation/auto-refresh-rate-limit.spec.ts),
  [owner failures](../../../e2e/observation/authenticated-read-owner-failures.spec.ts),
  and [authenticated project observation](../../../e2e/observation/authenticated-project-observation.spec.ts).
  Keep production serving and runner migration in their current plans.
  These slices require no new production architecture.

## Learnings from plan 862's delivered slices

- Vitest's 5 s default test timeout is shorter than real-CLI witnesses
  under load (8.7 s and 11.2 s at load 38 in plan 862's slice 1). Give such
  a case an essential per-test timeout inside the individual test; never
  a suite, file, group, or hook override.
- The real CLI fake `gh` runs in Node Vitest with `installFakeGh({transport: "cli"})`,
  `fakeGhEnv`, `startFakeGitHub`, and `withRestoredEnv`. For the HTTP
  boundary, `startInProcessAuthenticatedRead({ghTransport: "cli"})` mounts
  the production read path over Node HTTP with a real child per call.
- `dashboard/backend-tests/observation/revisionCheckBoundary.ts` imports
  the Playwright page test, so Node Vitest specs cannot import it. Plan 861
  still shares it; drive revision checks in Node through the in-process
  boundary instead.
- The story-obligations script reads slices only under the exact heading
  `## Ordered slices`.

## Premises and baseline

Observed on 27 November 2026 at `b0db97567` (Node 24.21.0, macOS on AC,
16 logical CPUs, one worker, load from 13.74 to 30.34). The maintained
selection ran 32 Chromium cases and zero Node cases across 13 paths, all
passing with zero retries. Case times totaled 71.179 s (median 1.591 s).
The selection took 82.97 s wall time.

```sh
proof_dir=$(mktemp -d "${TMPDIR:-/tmp}/dough-890.XXXXXX")
selection='observation/(authenticated-read-(shared-failures|turns|shared-waiters|subprocess-lifecycle|plugin-hooks|diagnostics(-bounds)?|incident-record(-bounds|-lifecycle|-restart|-stalls)?)|shared-request-owner)\.spec\.ts$'
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_dir/proof.json" \
OPEN_DOUGH_DASHBOARD_BACKEND_TIMES="$proof_dir/times.txt" \
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:backend -- "$selection" --workers=1
```

| Consuming operation | Observed result and planning consequence |
| --- | --- |
| Maintained one-worker selection above at `b0db97567` | The 32 cases below passed, including the shared Dashboard/CI owner, CLI process death, same-PID restart, and folded stall. Keep these consumers where the effect or timing must be real. |
| `node --test --test-concurrency=1` on Distribution's `github-request-{answer,owner,disconnect}.test.mjs` at `d4b27c516` | 18/18 passed. The real owner shared one request and capped active calls across processes, preserved a peer's call and kept a departing call recorded until its CLI process died. These are independent owner-level baselines for slices 1 and 2. |
| Maintained backend runner with `--workers=1` selecting `observation/shared-observation.spec.ts` and `review/shared-verified-origin-trunk.spec.ts` at `d4b27c516` | 10 Node cases passed. The mixed runner selects plain Node cases without a runner change; plan 862's slices 1–3 ran their Node replacements through it. |
| E2E `--list --reporter=list` on the four named browser paths above at `d4b27c516` | Nine Chromium cases selected. These are retained browser owners. |

Baseline per-case times in runner order (milliseconds). File names below use
the `authenticated-read-` prefix and `.spec.ts` suffix except
`shared-request-owner`, which only takes the suffix.

| File stem | Cases | Each case in ms |
| --- | ---: | --- |
| `diagnostics-bounds` | 4 | 1295, 1187, 1170, 1285 |
| `diagnostics` | 5 | 34, 4, 2007, 680, 1443 |
| `incident-record-bounds` | 1 | 4207 |
| `incident-record-lifecycle` | 2 | 4641, 5408 |
| `incident-record-restart` | 1 | 9375 |
| `incident-record-stalls` | 1 | 6008 |
| `incident-record` | 1 | 2900 |
| `plugin-hooks` | 1 | 1356 |
| `shared-failures` (late join) | 2 | 3408, 3325 |
| `shared-waiters` | 3 | 856, 513, 2692 |
| `subprocess-lifecycle` | 6 | 391, 1203, 377, 360, 1550, 1591 |
| `turns` (close) | 1 | 1895 |
| `shared-request-owner` | 4 | 2375, 2187, 2960, 2496 |

## Ordered slices

Legacy names below are relative to `dashboard/backend-tests/observation/`.
The listed paths are the disposition map. Keep each predecessor running
until its named observations are green. A path split across slices retires
when its last replacement is green. Keep each slice within 15 active
minutes.

### 1. End owned subprocesses when their last owner leaves

Type: Behavior
Status: planned

Behavior: One departing waiter leaves a shared pinned read alive for its
peer. Last pinned departure, the work's own timeout, and boundary close
release their work. A revision check's shared listing can outlive its
requester and ends at its bound or on close. A late waiter keeps its own
bound and cannot extend the call's. Closing ends outstanding and queued
waits. The close hook acts with the socket still open, and subsequent
reads are refused before asking GitHub.

Proof: Mount the production read middleware or the existing
`localBoundaryPlugin` through Node HTTP. Use the real CLI fixture with
pinned and check requests, observe child PID alive at dispatch and gone on
the named trigger, and verify the peer or later requester gets its answer.
For the hook case invoke the production hook with the client connection
held open so socket close cannot explain cleanup. Keep bounded drains and
teardown in every path.

Legacy: `authenticated-read-shared-waiters.spec.ts`,
`authenticated-read-subprocess-lifecycle.spec.ts`,
`authenticated-read-plugin-hooks.spec.ts`, the late-join cases left in
`authenticated-read-shared-failures.spec.ts`, and the close case left in
`authenticated-read-turns.spec.ts`.

### 2. Share one authenticated owner across two Dashboards and CI

Type: Behavior
Status: planned

Behavior: Two separately running Dashboard consumers and the installed CI
diagnostic share one owner under a single host/login. Together they
respect eight turns and one execution of an eligible duplicate. A wait
entered by one holds the others, and expiry admits one first call. Both
Dashboards record their own observation of a shared refusal. Abandoning
a client or stopping a Dashboard leaves a peer's read running.

Proof: Preserve the existing real owner and CI entry point in a private
machine home with the same fake GitHub route. Assert one owner record,
eight maximum held requests, exact duplicate dispatch and CI exit
outcomes. Read each Dashboard's diagnostics and confirm the peer settles
after the other client departs or closes. This process-level case runs on
Node Vitest with real owners and child processes.

Legacy: `shared-request-owner.spec.ts`.

### 3. Expose bounded local diagnostics for admitted readers

Type: Behavior
Status: planned

Behavior: A fresh diagnostic read is empty and does no upstream work.
Admitted failures show typed cause, safe metadata and request attribution,
including a pinned revision, once per shared invocation. Keep the newest
100 failures and filter to the requested source. Ordinary departure,
held-back work, and malformed, oversized or secret-like optional metadata
do not add misleading entries or leak data. An oversized answer leaves its
incident-history record (G1).

Proof: Drive the production failure observer with an admitted context and
controlled failed answers, and inspect through `diagnosticsForSource`.
Use a shared failed read and a departure case to prove the observer fires
at the invocation boundary. Mount production middleware with a small
Node HTTP witness for route admission, zero upstream calls for inspection,
and the matching dev/preview response. Exercise unknown source, disallowed
origin and non-GET there. For G1, exceed the output cap with the CLI
fixture and read the incident history.

Legacy: `authenticated-read-diagnostics.spec.ts`,
`authenticated-read-diagnostics-bounds.spec.ts`.

### 4. Read bounded incident evidence after shutdown and restart

Type: Behavior
Status: planned

Behavior: A new instance on the same machine reads earlier failures with
original dispatch, failure and owner attribution, newest first. The
entry/byte budget retains the newest records, counts drops and preserves
the start time and private permissions across trim. Clean close flushes
pending writes before the end record. A killed instance is lost, and
restart in the same PID keeps distinct instances.

Proof: Use the production `appendIncident`, `flushIncidents` and
`readIncidentRecord` with a private real directory for budget, modes and
safe bytes. Preserve a real server lifecycle witness using the admitted
pinned read, clean close and forced exit, then read through
`diagnosticsForSource` or the existing route. Exercise the real Vite
restart for same-PID identity. Capture current/ended/lost states from the
reader, never from injected stand-in process records.

Legacy: `authenticated-read-incident-record.spec.ts`,
`authenticated-read-incident-record-bounds.spec.ts`,
`authenticated-read-incident-record-restart.spec.ts`, and the process
lifecycle case of `authenticated-read-incident-record-lifecycle.spec.ts`.

### 5. Report measured stalls and fold excess stalls at close

Type: Behavior
Status: planned

Behavior: The next diagnostic read can report a real event-loop stall
with its delay, start, load, Dashboard revision and process age.
After three individual stalls in a window, later stalls fold into a
single entry with the earliest folded time, longest delay and count.
Close writes that entry.

Proof: Drive `installIncidentLifecycle` and its existing isolated stall
trigger with real Node event-loop sampling and files. Observe the first
stall through `diagnosticsForSource`, then prove the folded evidence on
close via persistent records. Keep the actual clock and event loop for
the measurement witness.

Legacy: `authenticated-read-incident-record-stalls.spec.ts` and the
stall case of `authenticated-read-incident-record-lifecycle.spec.ts`.

## Local gate and delivery

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for selected
  backend specs and [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  if a browser test changes. Keep default test timeouts and use awake
  macOS on AC under `caffeinate -s -i` for long runs per [AGENTS.md](../../../AGENTS.md).
  Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run the exact owned selection with `--workers=1` at each slice. Run
  `npm run typecheck:dashboard` for the migrated TypeScript proofs. For
  changed production seams or removed support, apply
  [consumer tracing](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  and run affected unchanged callers. Include the Distribution owner tests
  if their inputs, rules, or consumer path changes.
- Recount on the execution base and measure the same 13-path workload
  through the maintained runner after replacement. If a path is
  consolidated or renamed, record its final selector and named replacement.
  Require zero legacy Chromium cases for the 13-path family, which retires
  the last Chromium cases of `authenticated-read-shared-failures.spec.ts`
  and `authenticated-read-turns.spec.ts`. Record per-case times against
  roughly 100 ms, counts by runner, summed case time, wall time and load.
  Show the actual cost of the retained process, clock and HTTP witnesses,
  and name and measure any proof moved to E2E under the
  [campaign comparison](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).
  Confirm each old observation has an owner before retirement.

## Story obligations

### G1. Oversized-output incident record (first reported in slice 1 of plan 862)
Reported: slice 1 — "The incident-history record check was not carried over: source, category `content`, cause `output-bound`, no status or rate limit, and no secret in the history."
Story clause: "leave bounded, safe evidence of failures"
Disposition: receiving slice 3

## Plan review

Mapped from plan 862's reviewed slices 4–8 without changing their
boundaries. The cases that need a live child, a second Dashboard plus CI,
or durable incident evidence use their own production boundaries.
Splitting stall measurement from record persistence lets each close
against its own observable result. G1 moved with the diagnostics slice
that owns incident evidence. No current production seam needs a
preparatory Structure slice, and no outcome of plan 862 must land first:
its delivered slices share only test patterns with these slices.
