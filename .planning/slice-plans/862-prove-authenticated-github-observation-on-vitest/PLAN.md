# Prove authenticated GitHub observation in Node Vitest

**Source:** [Prove authenticated GitHub observation in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest)

**Identity:** SEED-413#authenticated-github-observation-via-vitest

## Goal and scope

Give Dashboard and CI maintainers fast Node Vitest proof of authenticated
GitHub failure classification, admission, request sharing and lifetime, and
bounded diagnostic evidence. Account for all 23 observation specs below.
Keep existing product behavior and preserve the proof that needs a real
socket, subprocess, owner process, Git repository, or durable file.

[Plan 858](https://github.com/terryyin/open-dough/blob/bca2def1a/.planning/slice-plans/858-move-authenticated-read-proofs-off-the-board-ref-read/PLAN.md)
moved the general authenticated-read tests away from the Board's cold
read. [Plan 856](https://github.com/terryyin/open-dough/blob/e4faafbdb/.planning/slice-plans/856-open-the-board-from-the-verified-git-trunk/PLAN.md)
put that read on verified Git trunk. Keep the revision check for listing,
fallback, or branch-head behavior and the pinned content read for
one-attempt failure and attribution. An ordinary failed listing may fall
back to a ref read, so its two attempts are intentional. A rate-limited
listing stops before that fallback. Prepare the pinned revision and
reachable path before recording upstream call counts.

[Plan 861](../861-prove-published-refresh-lifecycle-on-vitest/PLAN.md) owns
revision-listing reuse, revision streams, and retained answers. This plan
keeps the request-sharing interaction those clients rely on, including
caller-specific answers and failure survival. [Plan 860](https://github.com/terryyin/open-dough/blob/ebdf4ebac57a7d7cd41172def1b8089a2d4fd455/.planning/slice-plans/860-prove-published-read-admission-on-vitest/PLAN.md)
owns source and published-record read admission. [Plan 823](../823-follow-published-progress-from-local-git/PLAN.md)
owns moving further readers to local Git. The installed login-isolation
checks and the browser journeys retain their existing owners.

## Current decisions

- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and the North Star's [direct production seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  guide this migration. Use the installed `ReadAdmission`, `GitHubRequests`
  and answer parser for owner rules, and the Dashboard's `reportedFailure`,
  `RevisionChecks`, and `diagnosticsForSource` for the outcomes they own.
  Use typed inputs and the smallest boundary that supplies independent proof.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and the North Star's [shared Git refresh](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  keep origin authoritative and incident data machine-local. Reuse the
  existing boundary chain and plugin hooks for HTTP and close proof.
  Prefer direct production operations for the rest. Use isolated homes and
  a synthetic upstream. Use the CLI transport and independently observe a
  PID and its exit when a case promises actual subprocess termination.
  The in-process transport does not create that PID.
- Reuse the installed Distribution owner tests for equivalent protocol
  rules. They do not supply Dashboard read selection, HTTP timing, receipt
  of failures by both Dashboards, or CI wiring proof. Keep those assertions
  on the relevant production callers. Reuse existing test collaborators
  where the real boundary needs them and add zero wrappers to test support.
  Before removing `turnReads.ts`, `directedWait.ts`, `sharedReads.ts`,
  `readDiagnostics.ts`, `inProcessAuthenticatedRead.ts` or
  `revisionCheckBoundary.ts` support, trace every actual caller across
  Dashboard, Distribution, and E2E. In particular, plan 861 still uses
  `revisionCheckBoundary.ts` and the runtime family still uses the
  in-process boundary support.
- Keep browser behavior with
  [two tabs sharing turns](../../../e2e/observation/read-turns-across-tabs.spec.ts),
  [rate-limit recovery](../../../e2e/observation/auto-refresh-rate-limit.spec.ts),
  [owner failures](../../../e2e/observation/authenticated-read-owner-failures.spec.ts),
  and [authenticated project observation](../../../e2e/observation/authenticated-project-observation.spec.ts).
  Keep production serving and runner migration in their current plans.
  These slices require no new production architecture.

## Premises and baseline

Observed on 27 November 2026 at `d4b27c516` (Node 24.21.0, macOS on
AC, 16 logical CPUs, one worker, load from 17.08 to 19.59). The maintained
selection ran 76 Chromium cases and zero Node cases across 23 paths, all
passing with zero retries. Case times totaled 118.727 s (median 1.111 s).
The selection took 133.03 s wall time.

```sh
proof_dir=$(mktemp -d "${TMPDIR:-/tmp}/dough-862.XXXXXX")
selection='observation/(authenticated-read-(backoff|resumption|transient-eligibility|cooldown(-reach)?|directed-wait|wait-in-turn|shared(-failures|-waiters)?|turns(-timing)?|diagnostics(-bounds)?|incident-record(-bounds|-lifecycle|-restart|-stalls)?|output-bound|plugin-hooks|subprocess-lifecycle)|shared-request-owner)\.spec\.ts$'
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_dir/proof.json" \
OPEN_DOUGH_DASHBOARD_BACKEND_TIMES="$proof_dir/times.txt" \
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:backend -- "$selection" --workers=1
```

| Consuming operation at the baseline revision | Observed result and planning consequence |
| --- | --- |
| Maintained one-worker selection with its proof record | The current check and pinned routes ran the 76 cases below, including the real Add Git read, shared Dashboard/CI owner, CLI process death, same-PID restart, and folded stall. Keep these consumers where the effect or timing must be real. |
| Production `readAnswer` → `reportedFailure` and `ReadAdmission.answered` under Node 24.21.0 | An included 429 with Retry-After 60 reports a 60 s wait, holds another caller unasked and expires at that deadline. A normal CLI failure with stderr `(HTTP n)` carries transient eligibility only for 408/500/502/503/504 among the eight observed statuses. Use the typed seams for the matrix and keep the real caller encoding witness. |
| `node --test --test-concurrency=1` on Distribution's `github-request-{answer,owner,disconnect}.test.mjs` | 18/18 passed. The real owner shared one request and capped active calls across processes, applied a shared wait and allowed one first call at expiry, preserved a peer's call and kept a departing call recorded until its CLI process died. These are independent owner-level baselines for slices 1–5. |
| Maintained backend runner with `--workers=1` selecting `observation/shared-observation.spec.ts` and `review/shared-verified-origin-trunk.spec.ts` | 10 Node cases passed, including shared waiter and direct real Git behavior. The mixed runner can select plain Node cases on this checkout without a runner change. |
| E2E `--list --reporter=list` on the four named browser paths above | Nine Chromium cases selected. These are retained browser owners. The 76-case baseline and the migration comparison cover the backend family. |

Baseline per-case times in runner order (milliseconds). File names below use
the `authenticated-read-` prefix and `.spec.ts` suffix except
`shared-request-owner`, which only takes the suffix.

| File stem | Cases | Each case in ms |
| --- | ---: | --- |
| `backoff` | 3 | 4487, 901, 920 |
| `cooldown-reach` | 6 | 930, 1555, 117, 31, 17, 5011 |
| `cooldown` | 3 | 943, 1093, 2923 |
| `diagnostics-bounds` | 4 | 1415, 866, 1128, 1142 |
| `diagnostics` | 5 | 34, 6, 1483, 202, 723 |
| `directed-wait` | 3 | 5007, 917, 143 |
| `incident-record-bounds` | 1 | 1610 |
| `incident-record-lifecycle` | 2 | 2671, 1846 |
| `incident-record-restart` | 1 | 5335 |
| `incident-record-stalls` | 1 | 5547 |
| `incident-record` | 1 | 1482 |
| `output-bound` | 2 | 6223, 5992 |
| `plugin-hooks` | 1 | 300 |
| `resumption` | 7 | 2098, 2005, 1916, 2049, 2044, 2140, 7033 |
| `shared-failures` | 4 | 359, 2213, 3341, 3151 |
| `shared-waiters` | 3 | 319, 254, 1134 |
| `shared` | 3 | 260, 35, 80 |
| `subprocess-lifecycle` | 6 | 208, 1194, 370, 358, 859, 880 |
| `transient-eligibility` | 10 | 155, 7, 8, 17, 10, 7, 7, 8, 11, 10 |
| `turns-timing` | 1 | 1956 |
| `turns` | 4 | 1441, 987, 6909, 1205 |
| `wait-in-turn` | 1 | 1795 |
| `shared-request-owner` | 4 | 1452, 1404, 2311, 1727 |

## Ordered slices and outside-in proof

Legacy names below are relative to `dashboard/backend-tests/observation/`.
The listed paths are the disposition map. Keep each predecessor running
until its named observations are green. A path split across slices retires
when its last replacement is green. Keep each slice within 15 active
minutes.

### 1. Report classified failures and bounded output to the reader

Type: Behavior
Status: planned

Behavior: GitHub refusals keep their typed recovery eligibility, directed
wait and safe wording as a revision check, pinned content read, directory,
history or branch-head read terminates. The recognized upstream statuses,
connectivity and owned timeout can support transient recovery. Access and
missing answers, opaque failures and oversized output keep their own
classification. An oversized head listing falls back to the ref alone
without presenting unobserved branch heads.

Proof: Drive classified `GhFailure` inputs through `reportedFailure` with
a configured `PublishedSource`. Exercise `readAnswer` or the real CLI
for status, headers and output cap, and one production HTTP read for omitted
response fields and caller failure mapping. Exceed the cap with the CLI
fixture and observe the safe diagnostic, no raw body or invented status, and
the listing/fallback calls and answer through `RevisionChecks`. Keep the
distribution answer parser's existing direction validation.

Legacy: `authenticated-read-transient-eligibility.spec.ts`,
`authenticated-read-directed-wait.spec.ts`,
`authenticated-read-output-bound.spec.ts`.

### 2. Hold queued reads and resume one read at a time

Type: Behavior
Status: planned

Behavior: A directed limit or undirected backoff holds API reads across
projects, including requests already queued. In-flight reads keep their
own results, and the later wait stands. The first undirected wait defaults
to one minute, doubles up to an hour, and resets after success.
When the wait ends, one call goes first. Its new limit holds back the
rest. Its answer, departure, disconnect, or timeout opens the turns.
An optional profile setting held back remains a failed read. Add still
discovers the branch from Git. Ordinary failures leave admission open.

Proof: Use the production admission and owned request path with explicit
clock inputs where available. Assert actual dispatch order and counts with
held answers and abort signals, including simultaneous queued refusal.
Keep caller checks through the admitted pinned/profile and revision routes,
and use the existing local Git fixture to observe Add while the API is held.

Legacy: `authenticated-read-backoff.spec.ts`,
`authenticated-read-cooldown.spec.ts`,
`authenticated-read-cooldown-reach.spec.ts`,
`authenticated-read-wait-in-turn.spec.ts`,
`authenticated-read-resumption.spec.ts`.

### 3. Share matching questions and report the cost of a turn

Type: Behavior
Status: planned

Behavior: Concurrent matching content, directory, history and head-listing
asks share eligible work. Distinct repository, revision, path and kind
remain isolated. Each revision check gets its own result. Successful pinned
answers can be reused, and a failed ask can be made again. At most eight
calls reach GitHub concurrently, and queued calls go in arrival order.
Departures and queued timeouts release the turn without dispatching that
call. Locally refused requests still answer while all turns are busy.

Proof: Drive direct `GitHubRequests.request` calls with fixed argv and
abort signals for turn/order cases. Hold and release the fake upstream and
count calls at dispatch rather than assuming after a delay. Exercise
the production check and pinned read for distinct results, shared failure,
reuse and retry, including a check after the listing reuse window. The
HTTP response must contain `Server-Timing` admission, gh, rest and total
with correct call counts, including zero upstream wait for cached and
locally refused answers. Supply ordered events and assert attribution
relative to those events.

Legacy: `authenticated-read-shared.spec.ts`,
`authenticated-read-turns-timing.spec.ts`, plus shared refusal and later
retry from `authenticated-read-shared-failures.spec.ts` and the admission
cases from `authenticated-read-turns.spec.ts`. Slice 4 owns late-join bounds
and close.

### 4. End owned subprocesses when their last owner leaves

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
`authenticated-read-plugin-hooks.spec.ts`, and the late-join and close
cases assigned here from slice 3.

### 5. Share one authenticated owner across two Dashboards and CI

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

### 6. Expose bounded local diagnostics for admitted readers

Type: Behavior
Status: planned

Behavior: A fresh diagnostic read is empty and does no upstream work.
Admitted failures show typed cause, safe metadata and request attribution,
including a pinned revision, once per shared invocation. Keep the newest
100 failures and filter to the requested source. Ordinary departure,
held-back work, and malformed, oversized or secret-like optional metadata
do not add misleading entries or leak data.

Proof: Drive the production failure observer with an admitted context and
controlled failed answers, and inspect through `diagnosticsForSource`.
Use a shared failed read and a departure case to prove the observer fires
at the invocation boundary. Mount production middleware with a small
Node HTTP witness for route admission, zero upstream calls for inspection,
and the matching dev/preview response. Exercise unknown source, disallowed
origin and non-GET there.

Legacy: `authenticated-read-diagnostics.spec.ts`,
`authenticated-read-diagnostics-bounds.spec.ts`.

### 7. Read bounded incident evidence after shutdown and restart

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

### 8. Report measured stalls and fold excess stalls at close

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
- Recount on the execution base and measure the same 23-path workload
  through the maintained runner after replacement. If a path is
  consolidated or renamed, record its final selector and named replacement.
  Require zero legacy Chromium cases for the 23-path family. Record per-case
  times against roughly 100 ms, counts by runner, summed case time, wall
  time and load. Show the actual cost of the retained process, clock and
  HTTP witnesses, and name and measure any proof moved to E2E under the
  [campaign comparison](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).
  Confirm each old observation has an owner before retirement.

## Plan review

Slice-plan refinement ran. Output bounds stay with failure reporting. The
queue and timing checks share one held-request proof loop. The cases that
need a live child, a second Dashboard plus CI, or durable incident evidence
use their own production boundaries. Splitting stall measurement from
record persistence lets each close against its own observable result.

The eight slices reuse the current request owner and its caller boundaries.
The larger file groups use direct production outcomes for the case matrices
and keep wire, real process, or storage checks only for those effects.
No slice-specific concern remains on the observed basis. No current
production seam needs a preparatory Structure slice.
