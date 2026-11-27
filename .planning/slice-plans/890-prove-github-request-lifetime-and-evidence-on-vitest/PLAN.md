# Prove GitHub request lifetime and failure evidence in Node Vitest

**Source:** [Prove GitHub request lifetime and failure evidence in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#github-request-lifetime-and-evidence-via-vitest)

**Identity:** SEED-413#github-request-lifetime-and-evidence-via-vitest

**Split from:** SEED-413#authenticated-github-observation-via-vitest at its
delivered slice 3. These slices continue that story's slices 4–8 of
[plan 862](https://github.com/terryyin/open-dough/blob/71cc76188db2356fd0f4cd2f064cfd27be95c037/.planning/slice-plans/862-prove-authenticated-github-observation-on-vitest/PLAN.md).
Plan 862's slice 4 is slices 1–3 here, split after the first execution
overrun. Plan 862's slice 5 is slice 4 here. Plan 862's slice 6 is
slices 5–8 here, split after the second execution overrun. Slices 9–10
remain plan 862's slices 7–8 in that order.
Plan 862 keeps slices 1–3 (classified failures and the output bound, held
and resumed reads, shared requests and turn timing). After its cleanup,
recover it from Git history at the revision that lands it.

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
- Slice 1 overran on 27 November 2026. The clock pause settled 17.2 active
  minutes (`storyOverruns` 1); the attempt had already stopped at 15.8,
  before any proof. Completed proof: none. The sizing assumption that failed
  is that nine real-CLI lifetime observations can be written and proved in
  one 15-minute slice. Writing three specs used the whole budget and none
  ran. Those unproven files were removed:
  `authenticated-read-owned-lifetime.spec.ts`,
  `authenticated-read-owned-bound.spec.ts`, and
  `authenticated-read-owned-close.spec.ts`. The attempt report remains at
  `open-dough/evidence/slice-1-report.md` in this worktree's Git directory.
  `GitHubRequests` in `dashboard/server/ghRead.ts` captures
  `DOUGH_READ_TIMEOUT_MS` when the module is evaluated, so a short bound has
  to be set before that module loads. `startInProcessAuthenticatedRead` does
  not set `DOUGH_REVISION_CHECK_REUSE_MS`; the predecessor servers set it to
  0. Neither fact was executed. Later slices were left as they were: this
  assumption is about packing those lifetime observations together, not
  about the shared-owner, diagnostics, incident, or stall slices.
- Slice 5 overran on 28 November 2026. The pause settled 15.2 active
  minutes and `storyOverruns` became 2. Completed proof: none. No spec was
  written. The story boundary stays. Slices 1–4 already give maintainers
  the lifetime and shared-owner proof, and the remaining scope is still
  this story's failure-evidence examples: one safe diagnostic, an oversized
  incident record, evidence after restart, and folded stalls. The sizing
  assumption that failed is that one slice can discover the diagnostic
  observer and prove route admission, the in-memory failure list, and the
  CLI incident-history record together. `recordFailedRead` in
  `dashboard/server/readDiagnostics.ts` is the observer
  `diagnosticsForSource` reads. `GitHubRequests` reports a failure once
  per shared invocation and not for a held-back answer or an ordinary
  departure. The in-memory history is one module-level list of 100, so an
  empty read has to come before other cases in the same worker record
  failures. G1 still has to admit a CLI read past the output cap and then
  read the incident history; `authenticated-read-output-bound.spec.ts`
  does not. The next slices use those seams and do not repeat the
  discovery. Report:
  `open-dough/evidence/slice-5-diagnostics-report.md` in this worktree's
  Git directory.
- `dashboard/test-support/support/dashboardServer.ts` value-imports
  `installServerTimeControls`, and that module imports `@playwright/test`.
  A plain Vitest spec cannot use `startDashboardServer` for the production
  diagnostics route. `startInProcessBoundaryHttp` with `"production"` is
  the witness, after a private `HOME`, and it must be closed before a
  development mount. The separate-process stdout check stays in the
  Playwright file until slice 6 retires it.
- Slice 6 overran on 28 November 2026. The pause settled 15.6 active
  minutes and `storyOverruns` became 3. Completed proof: none. The spec
  was deleted before any test ran. The sizing assumption that failed is
  that the timeout, unmarked 403, marked rate limit, shared pin, ordinary
  departure, and held-back observations can be written and proved in one
  15-minute slice. The plan already holds ten slices, the execution
  maximum, so this slice was not split again. Slices 1–5 are delivered.
  The remaining examples still promise safe failure evidence, so narrowing
  the story is a developer decision. Report:
  `open-dough/evidence/slice-6-failure-report.md` in this worktree's Git
  directory.

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
| `node --test --test-concurrency=1` on Distribution's `github-request-{answer,owner,disconnect}.test.mjs` at `d4b27c516` | 18/18 passed. The real owner shared one request and capped active calls across processes, preserved a peer's call and kept a departing call recorded until its CLI process died. These are independent owner-level baselines for the lifetime slices (1–3) and the shared-owner slice (4). |
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

### 1. Leave a shared read alive for its remaining waiter

Type: Behavior
Status: done

Behavior: One departing waiter leaves a shared pinned read alive for its
peer, and the last departure releases that read. A revision check's shared
listing stays alive after its requester leaves. Ending that listing at its
bound or on close belongs to slices 2 and 3.

Proof: Mount the production read path over Node HTTP with the real CLI
child. Observe the child PID still alive after one of two pinned waiters
leaves and gone after the last one leaves, and the staying or later
requester's answer. Observe the listing PID still alive after its
requester leaves. Keep bounded drains and teardown.

Legacy: the two waiter cases in `authenticated-read-shared-waiters.spec.ts`,
and in `authenticated-read-subprocess-lifecycle.spec.ts` the case that
ends a pinned read when its only request is abandoned and the case that
leaves a revision-check listing running after its requester disconnects.
Those files also hold cases for slices 2 and 3; retire a file only when
its last replacement is green.

Accepted at `6935d63e` with this spec uncommitted. Refactor pass skipped:
the only product diff is this slice's new spec, and the predecessor cases
stay until slices 2 and 3 replace them.
`dashboard/backend-tests/observation/authenticated-read-owned-lifetime.spec.ts`
(174 lines) passed 3/3 through the real CLI child:
one waiter leaving left pid alive and the peer received the shared seed;
the last departure exited `SIGTERM` and a later read made a second content
call; the revision-check listing was still `processRunning` after its
requester left. Command: `caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/observation/authenticated-read-owned-lifetime.spec.ts --workers=1`
(exit 0; 150 ms, 147 ms, 110 ms). `npm run typecheck:dashboard` exited 0.
Records: `slice-1-lifetime.log.run.json` and
`slice-1-lifetime-typecheck.log.run.json`.

### 2. End a read at its own bound

Type: Behavior
Status: done

Behavior: The work's own timeout releases a stalled pinned read and a
stalled revision check. A late waiter keeps its own bound and cannot
extend the call's bound.

Proof: Use the real CLI child. `GitHubRequests` captures
`DOUGH_READ_TIMEOUT_MS` when `dashboard/server/ghRead.ts` is evaluated, so
set the short bound before that module loads. Observe the child gone at
that bound, and a late joiner answered inside its own bound without a
second upstream call while the first call is held. Set
`DOUGH_REVISION_CHECK_REUSE_MS=0`, matching the predecessor servers,
because `startInProcessAuthenticatedRead` does not.

Legacy: the bounded-timeout cases in
`authenticated-read-subprocess-lifecycle.spec.ts`, and the late-join cases
in `authenticated-read-shared-failures.spec.ts`. Those files still hold
other slices' cases, so they stay.

Accepted at `b9d068ed` with this spec uncommitted. Refactor pass skipped:
the only new file is this slice's spec, and it uses the production read
boundary rather than a new wrapper.
`dashboard/backend-tests/observation/authenticated-read-owned-bound.spec.ts`
(226 lines) passed 4/4. Each stalled pinned read and revision check saw
its CLI child alive inside a 3 s bound, then HTTP 502 and `SIGTERM`. Each
late join kept one upstream call, answered both waiters before the
joiner's own deadline, and a later read asked again and returned 200.
The short bound was set before `ghRead.ts` loaded. Command:
`caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/observation/authenticated-read-owned-bound.spec.ts --workers=1`
(exit 0). `npm run typecheck:dashboard` exited 0. Records:
`slice-2-bound.log.run.json` and `slice-2-bound-typecheck.log.run.json`.

### 3. Release owned work when the boundary closes

Type: Behavior
Status: done

Behavior: Boundary close releases a held pinned read and a held revision
check, including one read that two requests still wait on. Closing ends
outstanding and queued waits. The close hook acts with the socket still
open, and a later read is refused before asking GitHub.

Proof: Invoke the production close hook with the client connection held
open, so socket close cannot explain cleanup. Observe the child PID gone
before fixture teardown, queued work absent from the upstream calls, and
the following read refused with the upstream call count unchanged.

Legacy: the close case in `authenticated-read-shared-waiters.spec.ts`,
the server-shutdown cases in
`authenticated-read-subprocess-lifecycle.spec.ts`,
`authenticated-read-plugin-hooks.spec.ts`, and the close case in
`authenticated-read-turns.spec.ts`. Those files stay until each one's
last replacement is green.

Accepted at `221d5527` with this spec uncommitted. Refactor pass skipped:
the only new file is this slice's spec. It calls the production close
hook and does not add a test-support wrapper.
`dashboard/backend-tests/observation/authenticated-read-owned-close.spec.ts`
(249 lines) passed 5/5. The held client is an `abandonedRequest` that is
never cut. After `closeBoundary()` and before fixture `close()`, the CLI
child is not running for a held pinned read, a held revision check, one
read two requests still wait on (one upstream call), and eight outstanding
reads whose four queued paths never appear. A later read is HTTP 503
`This dashboard is closing.` with the call count unchanged. Command:
`caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/observation/authenticated-read-owned-close.spec.ts --workers=1`
(exit 0). `npm run typecheck:dashboard` exited 0. Records:
`slice-3-close.log.run.json` and `slice-3-close-typecheck.log.run.json`.

### 4. Share one authenticated owner across two Dashboards and CI

Type: Behavior
Status: done

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

Legacy: `shared-request-owner.spec.ts`. Its Node replacement is green,
so that Playwright file is removed with this slice. Nothing else names it.

Accepted at `9512f637` with the Node specs uncommitted. Refactor pass
skipped: the new files are this slice's specs, both under 250 lines, and
they use the existing owner and CI entry point. No production contract
changed.
`shared-request-owner-node.spec.ts` (198) and
`shared-request-owner-peer-node.spec.ts` (167) passed 5/5. One owner
serves both Dashboards and CI, eight distinct in-flight calls is the
high-water mark, and a shared content read is asked once. A rate limit
holds the other Dashboard and makes CI exit 75 with the call count
unchanged. When the wait ends, one call goes first and the high-water
mark of the rest is 3. Each Dashboard's diagnostics record the shared
403. After one client is cut and one Dashboard closes, the peer reads
return 200 under the same owner. Command:
`caffeinate -s -i npm run test:dashboard:backend -- 'shared-request-owner-.*node\.spec\.ts' --workers=1`
(exit 0, 5.81 s). `npm run typecheck:dashboard` exited 0. Records:
`slice-4-owner.log.run.json` and `slice-4-owner-typecheck.log.run.json`.

### 5. Admit a diagnostic read before any upstream call

Type: Behavior
Status: done

Behavior: A fresh diagnostic read is empty and does no upstream work.
Unknown source, disallowed origin, and non-GET are refused before any
GitHub call. The production environment mounts the same route and also
asks GitHub nothing.

Proof: Use `startInProcessAuthenticatedRead` for the development route
and `startInProcessBoundaryHttp` with `"production"` for the production
environment. Both stay on plain Vitest. Do not import
`dashboardServer.ts`: it loads `@playwright/test` through
`serverTimeControls.ts`. Assert an empty failure list and an unchanged
upstream call count, then the three refusals, then the same empty route
on the production environment. Give that case a private `HOME` before
mounting, so production seeds `open-dough` instead of reading a saved
list. Close one environment before mounting the other. The in-memory
history is one module-level list of 100, so this empty read runs before
any case in the same worker records a failure.

Legacy: the empty-history, refusal, and production-environment cases of
`authenticated-read-diagnostics.spec.ts`. That file also holds the
shared-failure cases, so it stays until slice 6.

Accepted at `bc8fc7f1` with the Node spec uncommitted. Refactor pass
skipped: the new file is this slice's spec, 136 lines, and it uses the
existing in-process boundaries. No production contract changed.
`authenticated-read-diagnostics-admission-node.spec.ts` passed 3/3. A
development read is HTTP 200 with an empty failure list and an unchanged
call count. Unknown source, a disallowed origin, and POST are 404, 403,
and 405 with the call count unchanged. The production environment, mounted
through `configurePreviewServer` on a private home, returns the same empty
200 with its own call count unchanged. Command:
`caffeinate -s -i npm run test:dashboard:backend -- authenticated-read-diagnostics-admission-node.spec.ts --workers=1`
(exit 0). `npm run typecheck:dashboard` exited 0. Records:
`slice-5-admission.log.run.json` and
`slice-5-admission-typecheck.log.run.json`.

### 6. Record one safe diagnostic for an admitted failure

Type: Behavior
Status: planned

Behavior: An admitted failure shows its typed cause, safe metadata, and
request attribution, including a pinned revision, once per shared
invocation. Ordinary departure and a read held back before it fails do
not add an entry.

Proof: Drive `recordFailedRead` through an admitted shared read and
inspect with `diagnosticsForSource`. One upstream call for two waiters
leaves one entry carrying the admitted pin. A departing waiter and a
held-back answer leave the failure list unchanged. A recorded rate-limit
failure is not the held-back observation.

Legacy: the shared timeout, 403, rate-limit, and one-entry cases of
`authenticated-read-diagnostics.spec.ts`, plus the departure and
pinned-failure cases of `authenticated-read-diagnostics-bounds.spec.ts`.
Retire `authenticated-read-diagnostics.spec.ts` when this slice is green.
The bounds file stays until slice 7.

### 7. Keep only the newest safe diagnostic entries

Type: Behavior
Status: planned

Behavior: The history keeps the newest 100 failures and filters to the
requested source. Malformed, oversized, or secret-like optional metadata
is omitted and does not leak.

Proof: Drive the production observer with controlled failed answers and
inspect through `diagnosticsForSource`. Assert length 100 for the
admitted source, the oldest of 101 absent, the other source empty, and
no secret, raw text, oversized request id, or rate-limit object from the
bad optional fields.

Legacy: the newest-100 and metadata cases of
`authenticated-read-diagnostics-bounds.spec.ts`. Retire that file when
this slice is green.

### 8. Leave an incident-history record for an oversized answer

Type: Behavior
Status: planned

Behavior: An oversized answer leaves an incident-history record with its
source, category `content`, and cause `output-bound`, and with no status,
rate limit, or secret. This is G1.

Proof: Exceed the output cap with the CLI fixture in
`authenticated-read-output-bound.spec.ts`, inside an admitted read, and
read the incident history the production path writes. That spec's `runGh`
classification is not this observation. Give the case its essential
per-test timeout inside the individual test.

Legacy: none.

### 9. Read bounded incident evidence after shutdown and restart

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

### 10. Report measured stalls and fold excess stalls at close

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
Disposition: receiving slice 8

## Plan review

Mapped from plan 862's reviewed slices 4–8. Execution split that slice 4
into slices 1–3 after the first overrun, then split the diagnostics slice
into slices 5–8 after the second. Slices 1–4 are delivered. The remaining
scope is still this story's failure evidence. Splitting the overrun slice
takes the plan to ten slices, the execution allowance for the slice in
progress. Route admission, the in-memory failure list, its bounds, and
the CLI incident-history record each close on their own observable
result. G1 is slice 8. No current production seam needs a preparatory
Structure slice, and no outcome of plan 862 must land first: its
delivered slices share only test patterns with these slices.

## Execution context

- Mode: story-branch. Replanning permission: existing planning authority
  (no `--replan` or `--no-replan`).
- Readiness: Changed since readiness review. Take and delivery do not renew it.
- Owned workspace (reused):
  `/Users/terryyin/git/open-dough/.worktrees/prove-github-request-lifetime-and-failure-eviden`,
  branch `cursor/prove-github-request-lifetime-and-failure-eviden`,
  starting revision `44891364bd2c78e5084af84aa8993be191221056`.
- Integration checkout: `/Users/terryyin/git/open-dough` on `main`.
- Publication target: `origin/cursor/prove-github-request-lifetime-and-failure-eviden`.
  Trunk: `origin/main`.
- Published claim: `735c60a52ea2cd88e8746df5e06edfcb1d9f81b2` on that story
  branch. `pendingCi: unobserved` — the claim published before this observer
  was armed. Slice 5 is published at
  `98f31733eaf295a5d88a5e8184f9b69d284d06f0` on the same branch. That SHA
  is the previously published base. Execution is stopped after slice 6
  overran. No next slice is selected. Unpublished candidate: none.
- CI on `98f31733eaf295a5d88a5e8184f9b69d284d06f0`: run `46043952030`,
  job `e2e / shard 2/6`, failed
  `e2e/stories/direction-disclosure.spec.ts:219`. The Near-future direction
  region stayed present after choosing Doughnut. The same product code
  passed CI at `2950e48ddd61bfbe9fde0a130028b414651b1a6e`. This story does
  not change that spec or the direction UI. The failure is not repaired.
- CI: GitHub Actions, workflow `ci.yml` (display name `CI`, id `351271804`),
  repo `terryyin/open-dough`, branch
  `cursor/prove-github-request-lifetime-and-failure-eviden`.
  `integratedStateCompletion` is `{ "check": "ci.yml", "context": "push" }`.
  Observer: `/tmp/dough-ci-501/watch-vX6kgx`.
- Checkout setup: Node `24.21.0`, `node scripts/setup-native.mjs npm` and
  `npm run typecheck:dashboard` passed in this checkout. Bash 5.3.20 is
  `/opt/homebrew/bin/bash`; put it first on `PATH` for shell checks.
- Expensive proof (2026-11-27, this host): macOS on AC, 16 logical CPUs,
  load about 5.4–6.6 while another worktree ran one frontend Vitest file.
  Decision: run a backend selection at `--workers=1` under
  `caffeinate -s -i`. Reconsider if load stays above about 12 or a required
  case times out from contention. The planning baseline at `b0db97567`
  still matches these specs aside from a comment retarget in
  `authenticated-read-subprocess-lifecycle.spec.ts`; do not remeasure the
  whole 13-path family before the lifetime slices. The first attempt's
  unproven specs were removed. Slice 5's second overrun left no specs.
  The next diagnostics slice starts from zero with `--split-from 5`.
