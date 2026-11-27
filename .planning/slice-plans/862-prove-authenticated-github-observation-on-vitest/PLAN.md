# Prove authenticated GitHub observation in Node Vitest

**Source:** [Prove authenticated GitHub observation in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest)

**Identity:** SEED-413#authenticated-github-observation-via-vitest

## Goal and scope

Give Dashboard maintainers fast Node Vitest proof of authenticated GitHub
failure classification, admission under waits, and request sharing and
turns. Account for the ten observation specs and the delivered cases of
two shared specs that the slices below name. Keep existing product
behavior and preserve the proof that needs a real socket, subprocess, Git
repository, or HTTP response.

This story was split after slice 3. Its former slices 4–8 (owned
subprocess lifetime, the shared owner across Dashboards and CI,
diagnostics, and incident evidence) are slices 1–5 of
[Prove GitHub request lifetime and failure evidence in Node Vitest](../890-prove-github-request-lifetime-and-evidence-on-vitest/PLAN.md),
with the G1 obligation and the remaining 13 legacy paths.

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
owns source and published-record read admission. [Plan 887](../887-read-board-records-at-published-pins/PLAN.md)
owns moving further readers to local Git. The installed login-isolation
checks and the browser journeys retain their existing owners.

## Current decisions

- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and the North Star's [direct production seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  guide this migration. Use the installed `ReadAdmission`, `GitHubRequests`
  and answer parser for owner rules, and the Dashboard's `reportedFailure`,
  and `RevisionChecks` for the outcomes they own.
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
  rules. They do not supply Dashboard read selection or HTTP timing. Keep those assertions
  on the relevant production callers. Reuse existing test collaborators
  where the real boundary needs them and add zero wrappers to test support.
  Before removing `turnReads.ts`, `directedWait.ts`, `sharedReads.ts`,
  `inProcessAuthenticatedRead.ts` or `revisionCheckBoundary.ts` support,
  trace every actual caller across Dashboard, Distribution, and E2E. In
  particular, plans 861 and 890 still use `revisionCheckBoundary.ts` or
  its callers, and the runtime family still uses the in-process boundary
  support.
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
| `node --test --test-concurrency=1` on Distribution's `github-request-{answer,owner,disconnect}.test.mjs` | 18/18 passed. The real owner shared one request and capped active calls across processes, applied a shared wait and allowed one first call at expiry, preserved a peer's call and kept a departing call recorded until its CLI process died. These are independent owner-level baselines for slices 2 and 3 here and for plan 890's owner slices. |
| Maintained backend runner with `--workers=1` selecting `observation/shared-observation.spec.ts` and `review/shared-verified-origin-trunk.spec.ts` | 10 Node cases passed, including shared waiter and direct real Git behavior. The mixed runner can select plain Node cases on this checkout without a runner change. |
| E2E `--list --reporter=list` on the four named browser paths above | Nine Chromium cases selected. These are retained browser owners. The 76-case baseline and the migration comparison cover the backend family. |

The baseline above covers the whole family before the split. This story's
before-measurement is its ten retired paths plus the two shared paths;
plan 890 rebaselined its 13 paths at `b0db97567`.

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

## Ordered slices

Legacy names below are relative to `dashboard/backend-tests/observation/`.
The listed paths are the disposition map. Keep each predecessor running
until its named observations are green. A path split across slices retires
when its last replacement is green. Keep each slice within 15 active
minutes.

### 1. Report classified failures and bounded output to the reader

Type: Behavior
Status: done

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

Delivered: `authenticated-read-failure-report.spec.ts` (5 Node cases,
0–7 ms) owns the status, connectivity, timeout, directed-wait and
oversized-answer matrix through `readAnswer` → `ReadAdmission.answered` →
`reportedFailure`. `authenticated-read-output-bound.spec.ts` is now 2 Node
cases with the real CLI fake `gh`: the production `runGh` past 32 MiB with
one call and safe wording, and `RevisionChecks.check` falling back to the
ref alone. They took 8.7 s and 11.2 s at load 38 and carry an essential
per-test 30 s timeout. Final selector:
`observation/authenticated-read-(failure-report|output-bound)\.spec\.ts$`;
0 Chromium cases remain. The retired cap case's incident-history record
(G1) moved with the split to slice 3 of
[plan 890](../890-prove-github-request-lifetime-and-evidence-on-vitest/PLAN.md).

CI repair (run 46002005685): the two-page case in
`e2e/observation/transient-recovery-lifecycle.spec.ts` advanced the clock
before the second page asked, so its read wait never ended. It now waits
for both pages' first read.

### 2. Hold queued reads and resume one read at a time

Type: Behavior
Status: done

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

Delivered: `authenticated-read-admission.spec.ts` (13 Node cases, 0–6 ms)
owns the undirected doubling and reset, directed waits, queued refusal,
one-call-first and ordinary-failure rules through `ReadAdmission` with
`readAnswer` inputs built by `asGhReply`. `authenticated-read-resumption.spec.ts`
(4 Node cases) keeps the production `execGh` → owner → real CLI witness: one
call first after a real 1 s directed wait, then a second project's read, the
revision check and the profile setting held back with one upstream call.
`configuration/project-add-while-held.spec.ts` (1 Node case) shows Add
finding the branch through Git while the wait holds. Times under external
load 6–17: 1.3 s, 0.16 s and 0.44 s. Final selector:
`(observation/authenticated-read-(admission|resumption)|configuration/project-add-while-held)\.spec\.ts$`;
0 Chromium cases remain. `resumingReads.ts` and `heldBackReads.servedRefusing`
lost their last callers and are removed.

CI on `c1b14609` met the frontend `VITEST_BROWSER_CONNECTION_CLOSED`
closure, which [plan 881](../881-keep-full-frontend-runs-connected/PLAN.md)
owns and is diagnosing; this branch changes no frontend path.

CI repair (run 46007204594, `project-remove-selection.spec.ts`): after a
removal, a stale read of the removed project could land after the selection
cleared. Because fixtures publish every repository at one revision, the
new project's read kept that snapshot and asked its details for the wrong
project. `shownAtRevision` in `dashboard/src/publishedWork.ts` now requires
the same project and revision for both the read and the observation, and
`published-read-of-another-project.spec.ts` reproduces it. At integration,
trunk's `snapshot.unrecorded && shown?.revision === revision` check in
`publishedWorkRead.ts` needs the same `shownAtRevision` test, and its
`sameRevision` block conflicts. Follow-up: the stale read can still show
briefly before the new project's membership replaces it.

### 3. Share matching questions and report the cost of a turn

Type: Behavior
Status: done

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
cases from `authenticated-read-turns.spec.ts`. [Plan 890](../890-prove-github-request-lifetime-and-evidence-on-vitest/PLAN.md)
slice 1 owns late-join bounds and close.

Delivered: `authenticated-read-request-turns.spec.ts` (4 Node cases, 0.2–1.2 s)
drives `GitHubRequests.request` with the real CLI for the eight-call cap,
arrival order, sharing and isolation, queued departure and queued timeout.
`authenticated-read-shared-requests.spec.ts` (5 Node cases) uses the in-process
production boundary over HTTP for shared pinned, directory and history reads,
reuse, per-check listing answers, isolation and retry after a refused or
rate-limited shared ask. `authenticated-read-server-timing.spec.ts`
(1 Node case, 0.3 s) owns `Server-Timing` attribution, including zero
upstream time for cached and locally refused answers. `shared.spec.ts` and
`turns-timing.spec.ts` are retired. Three Chromium cases stay for plan 890's slice 1:
the late-join case (2 cases) in `authenticated-read-shared-failures.spec.ts`
and the close case in `authenticated-read-turns.spec.ts`. Follow-up: a
directed wait of 1 s reads "wait 1 seconds" in the boundary error.

CI on `8263886d` met the plan 881 frontend closure again.

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
- Recount on the execution base and measure this story's workload through
  the maintained runner after replacement: before, the ten retired paths
  plus all cases of `authenticated-read-shared-failures.spec.ts` and
  `authenticated-read-turns.spec.ts` at the baseline (their five delivered
  cases are this story's; their three remaining cases are plan 890's);
  after, the union of the slices' final selectors. If a path is
  consolidated or renamed, record its final selector and named replacement.
  Require zero legacy Chromium cases for the ten retired paths and for the
  delivered cases of the two shared paths; plan 890 owns their remaining
  three Chromium cases and the other 11 paths. Record per-case
  times against roughly 100 ms, counts by runner, summed case time, wall
  time and load. Show the actual cost of the retained process, clock and
  HTTP witnesses, and name and measure any proof moved to E2E under the
  [campaign comparison](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).
  Confirm each old observation has an owner before retirement.

Measured on 27 November 2026 at `b0db97567` (Node 24.21.0, one worker,
load 20.6–30.5) with
`(observation/authenticated-read-(failure-report|output-bound|admission|resumption|request-turns|shared-requests|server-timing)|configuration/project-add-while-held)\.spec\.ts$`:
49 Node cases and 0 Chromium cases passed with zero retries. Case time
summed to 13.46 s (median 0.2 ms) and the selection took 19.8 s wall time.
Before, the ten retired paths took 60.9 s over 39 Chromium cases, and
`shared-failures` and `turns` took 19.6 s over 8. The retained witnesses
cost: the real 32 MiB CLI output 5.8 s, a real 2 s directed wait in
`shared-requests` 3.4 s, a real 1 s wait in `resumption` 1.8 s, real CLI
turns 1.8 s and Add through Git 0.5 s. 17 cases exceed 100 ms, all real
CLI, HTTP or Git witnesses. No proof moved to E2E. Every retired
observation names its owner in its slice's Delivered note.

## Plan review

Slice-plan refinement ran. Output bounds stay with failure reporting. The
queue and timing checks share one held-request proof loop.

The split after slice 3 moved the live-child, shared-owner, diagnostics
and incident-evidence slices, with G1, to plan 890. The three slices here
reuse the current request owner and its caller boundaries.
The larger file groups use direct production outcomes for the case matrices
and keep wire, real process, or storage checks only for those effects.
No slice-specific concern remains on the observed basis. No current
production seam needs a preparatory Structure slice.
