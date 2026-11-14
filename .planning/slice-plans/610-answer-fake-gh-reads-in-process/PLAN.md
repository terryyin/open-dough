# Dashboard checks answer fake GitHub reads without a process per call

**Source:** [selected story](../../seeds/SEED-332-answer-fake-gh-in-process.md#answer-fake-gh-reads-in-process)
**Identity:** SEED-332#answer-fake-gh-reads-in-process

## Goal and scope

Ordinary dashboard checks use the existing fake GitHub without starting a
process per simulated API call. The named loaded failures and landed CI repeat
checks pass at natural CPU-bound load 30–50 with two workers and the default
30-second case timeout. Preserve production behavior, all current observations,
and native process proof. The seed owns the scope and key examples.

No production transport changes, timeout increases, removed journeys, reduced
assertions, second GitHub answer model, or general runner redesign. Processes
for server/owner startup and login discovery remain allowed. No percentage
speedup or hosted runner headroom is inferred from local measurements.

## Existing solution and direction

PFE: `dashboard/tests/support/fakeGitHub.ts` owns repository answers, request
counts, held responses and isolation; `ghRequest.ts` and `ghReply.ts` own argv
interpretation and CLI answer semantics. Reuse them unchanged wherever possible.
Its current NUL-delimited HTTP request and byte-framed response can carry an
in-process client without inventing another provider or HTTP representation.

`fakeGh.ts` owns each private request-owner root and teardown.
`dashboardServer.ts` and `fakeGhEnv` own environment propagation. Extend those
owners with an explicit transport choice. Keep real `GitHubRequests`, admission,
sharing, rate-limit parsing and answer interpretation. Replace only simulated
API execution inside the already-running private owner, using test support.

A narrowly scoped test preload can arrange an explicit `--import` when that
test starts `github-request-owner.mjs`, then intercept only that owner's fake
`gh api` execution. The production starter deliberately deletes `NODE_OPTIONS`;
do not change that safeguard or assume environment inheritance reaches it.
Do not patch general `execFile` behavior across server/test processes. Preserve
unmatched calls, function overloads and promisification behavior. An in-process
call has no OS PID: never fabricate one or register the owner's PID as a call.
The real owner still owns call bounds, turns and waiter lifetime.

`inProcessAuthenticatedRead.ts` serves the boundary in the worker but still
runs CLI calls; reuse its boundary harness, not its name as proof of a transport.
`listingReuseWithOwnerClock.ts` already starts an owner with an explicit preload;
compose with it or select CLI explicitly where that scenario proves native owner
behavior. `sharedRequestOwner.ts` deliberately shares a private root: preserve
that sharing and scope rather than allocating one fast fake per server.

This is test-support design within [ADR 0008, Project dashboard domain and
architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The real local authenticated boundary remains authoritative. The existing
[North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
already supports this; no new architectural direction is needed.

Expected existing edits: `fakeGh.ts` (105 lines), `dashboardServer.ts` (245),
`dashboardServerOptions.ts` (64), `dashboard/tests/README.md` (243) and
`writing-journeys.md` (213), plus transport selection at affected consumers.
None is already over 250 lines. Keep transport/activation in cohesive new
support modules; if server startup grows, extract its environment composition
rather than mixing transport mechanics into startup. Apply the maintained
250-line check to every actual proposed edit before implementation.

## Decisive premises and preparation observations

All local observations: this owned checkout at `94ebb9180`, 2026-11-13,
macOS arm64, Node 24.21.0, AC power. Scratch support under
`node_modules/.seed332-observation` was removed before recording preparation;
no implementation is retained. These are feasibility observations, not final
acceptance of the unimplemented candidate.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The current CLI still has avoidable per-call transport cost | 21 sequential `execFile('./dashboard/tests/fixtures/fake-gh', ['api','--include','repos/test/repo/commits/main'])` calls against `startFakeGitHub`: 1658.8 ms before answerer arrival plus 463.5 ms from arrival through process completion. Same argv and answer via 21 sequential `fetch` POSTs: 14.7 + 8.5 ms. All 42 calls returned the expected body. Natural load was in the 30s; no burners. | Diagnostic on a small answer; not the complete comparison journey or hosted timing. |
| A native owner can run the fake API in process without a production seam | Scratch `node .../observe.mjs` called real `GitHubRequests.request(['api','repos/test/repo/commits/main'], signal)` with an isolated owner and a CLI that answers auth but exits 99 for every API call: failure, zero fake calls. Same command with `NODE_OPTIONS=--import=<owned scratch>/gh-preload.mjs`: body `from-fake`, one fake call. The preload explicitly added `--import` to the owner spawn and intercepted only owner API execution. | Full transport contracts belong to slice 1; no fabricated child PID was needed. |
| The real preview journey reaches and can use that transport | `npm run test:dashboard -- tests/intent/intent-project-scope-timing-refresh.spec.ts --workers=2 --reporter=list`, with the scoped scratch preload: 2 passed, 27.6 s total; case durations 9.0 and 10.8 s. Real server, request owner and page ran. | Not a controlled end-to-end speedup comparison; other work and baseline work overlapped. Boundary/dev and custom-owner consumers remain slice 2 rollout proof, not assumed equivalent. |
| Native process proof remains available independently | `npm run test:dashboard -- backend-tests/runtime/fake-gh-client.spec.ts backend-tests/runtime/fake-gh-client-lifecycle.spec.ts tests/intent/intent-project-scope-timing-refresh.spec.ts --workers=2 --reporter=list`: 13 passed in 47.0 s, including real SIGTERM/SIGINT, auth hold, binary argv/body and orphan cleanup; refresh cases 17.2 and 20.5 s. | Retain this CLI path; rerun its observations after selecting it explicitly. |
| Existing hosted profile runs the same fixture and keeps timing evidence | Read `ci.yml`, `playwright.config.ts`, `tests/shards.md`; queried [successful main run 43336803436](https://github.com/terryyin/open-dough/actions/runs/43336803436), revision `15377f89304821fdb8bc29c71b45e1d30926e0a7`, created 2026-11-13 00:24:22 UTC. All 13 dashboard jobs, lint, three repository shares and CI proof succeeded; all 13 `dashboard-times-*` artifacts were listed unexpired. | Candidate Linux behavior and timing are final hosted proof, not established by this baseline. |

The first overly broad scratch preload broke promisified `execFile` during
origin preparation (`stdout.trim` on undefined). Scoping interception to the
owner and adding its preload explicitly fixed both refresh cases. Preserve that
lesson in the implementation boundary; the failed experiment is not a product
failure left for another owner.

Hosted baseline browser-step seconds, shards 1–13 respectively:
209, 235, 243, 205, 196, 276, 225, 199, 160, 189, 263, 238, 174.
Whole job seconds: 237, 256, 264, 235, 220, 300, 247, 221, 180, 208,
293, 273, 198. Source command:
`gh run view 43336803436 --repo terryyin/open-dough --json jobs`;
differences of each browser step's and job's start/end timestamps. These are
observed durations, not spare CPU capacity. Retrieve retained artifacts before
their 2026-11-20 expiry, or select a newer comparable successful baseline.

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| No per-read process with faithful argv, stdout/stderr, binary, exit/status, headers and bounds | 1 | New backend transport spec drives real `GitHubRequests`/owner with fake API executable poisoned; succeeds only through in-process transport. Parameterize applicable CLI contract examples and use independent expected bytes, not the implementation's decoder. Exercise oversized output, malformed frame, missing/closed endpoint and nonzero exit. |
| Held reads, cancellation, admission, rate limits and shutdown retain meaning | 1 | New backend spec holds/releases answers and observes arrival, last-waiter departure, server close and zero unanswered calls; real owner handles sharing/limits. Retain existing `authenticated-read-turns`, shared-waiters and subprocess-lifecycle specs on CLI as native controls. |
| Ordinary preview/boundary/dev and direct support consumers use the new default without leaking scope | 2 | Consumer trace plus affected observation/configuration/launch journeys, including two isolated servers, shared owner, restart, custom clock, in-process boundary and an installed-script consumer. Poison API execution in fast mode, observe each fake's distinct calls and answers, then close all resources. |
| Physical process promises remain observed | 2 | Explicit CLI selection; unchanged PID, signal, replacement and cleanup assertions pass. Never replace process observations with transport counters. |
| Named loaded journeys and landed CI repeat checks retain their observations within default budgets | 2 | Loaded selection below, natural CPU-bound load 30–50, two workers, no timeout overrides; all cases pass and proof record supplies case durations. |
| Shared fixture works across the suite and hosted shards | 2 | One admitted full dashboard run; final published CI all thirteen shards pass under current worker/deadline rules. Compare per-spec times and browser-step durations with the hosted baseline, explain workload changes and retain actual results. |

## Ordered slices

### 1. A dashboard can answer faithful fake API calls without launching a process
Type: Behavior
Status: planned
Proof: New `dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts` plus
the existing two `runtime/fake-gh-client*.spec.ts` files, through
`npm run test:dashboard -- <three spec paths> --workers=2`.

Behavior: a server or direct read harness explicitly selects in-process fake
API transport → real request-owner operations reach the existing fake GitHub →
the same framed answers, holds, failures and cancellations reach the real
reader, while a poisoned API executable proves no per-call process was used.

Add the bounded test-support transport, scoped activation and explicit CLI
choice. Keep CLI as the ordinary default until slice 2. Native auth remains
native. Implement abort/error and output-bound handling with one terminal
settlement and request cleanup; closing a response must not leave a request
pending. Test failed fake endpoints without contacting real GitHub. Reuse
existing contract fixtures and answerers rather than reimplementing GitHub.
This optional path is a safe delivered increment; slice 2 replaces its opt-in
status for ordinary checks. Cleanup/refactoring belongs to this slice.

### 2. Ordinary dashboard checks use the fast transport and native checks keep their process proof
Type: Behavior
Status: planned
Proof: Consumer trace, loaded selection, one full local dashboard run and final
hosted CI, with existing observations and budgets preserved.

Behavior: ordinary checks start their usual dashboard or read harness → fake
API calls use the in-process transport by default, including shared and
restarted servers → loaded journeys finish inside default case budgets;
native process scenarios explicitly choose CLI and still observe real exits.

Follow every `fakeGhEnv`, `installFakeGh`, `ghPid`, `ghExitedBy`, `pidPath`,
`requestOwnerRoot`, `NODE_OPTIONS`, and custom owner-start consumer. Direct
callers include `fakeGhClient`, `agent-terminal-close`,
`authenticated-read-owner-failures`, `inProcessAuthenticatedRead`,
`listingReuseWithOwnerClock`, `projectAdditionFixture`, `publishedMainFixture`
and `sharedRequestOwner`. Physical PID readers additionally include
`project-add-boundary`, `authenticated-read-plugin-hooks`,
`authenticated-read-done-catalog-refusal`, shared
failures/listing/listing-failures/waiters, subprocess-lifecycle and turns.
Inspect each scenario's purpose before selecting its mode. Keep installed
runtime/host-process proof native when the native boundary is what it proves.
Prove mode propagation through plain boundary, dev, preview, run-artifact
preparation and explicitly started owners; do not rely on a preview-only pass.
Update the test README and journey guidance to describe precisely what runs
for real. Preserve CLI transport checks as the control, then complete the
loaded and whole-suite gates. Any final comparison remains evidence, not a
reason to relax existing assertions or deadlines.

## Verification and delivery

- Follow [the failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written; a base failure is attribution, never an exemption. Respect an
  active repair owner's files and report that exact owner/gate boundary.
- Before test edits, run installed `test-entry-rules.mjs` for actual paths.
  Preparation resolved the new backend spec to MakeMe only, and the refresh
  browser spec to MakeMe plus page objects. Use existing builders, focused
  objects and independent expected bytes. Tests wait on observable events or
  controlled clocks: no sleeps, `test.slow()` or group/hook timeout overrides.
- Per-slice local gate: mapped focused proof, `npm run typecheck:dashboard`,
  post-change refactoring, staged lint and ordinary execution commit/delivery.
  Use installed `consumer-trace.mjs --checkout <workspace> --base HEAD` with
  the effects/exports above; follow every helper to its observing journey and
  disposition each consumer as run, reused or excluded with a boundary reason.
- Loaded selection: `backend-tests/launches/start-origin-isolation.spec.ts`;
  under `tests/intent/`, `intent-summary-story-comparison-sort.spec.ts`,
  `intent-story-changes-landed-run.spec.ts`,
  `intent-done-default-answer-selection.spec.ts`,
  `intent-scope-collected-file-timing-gaps.spec.ts`,
  `intent-scope-collected-file-timing-history.spec.ts`,
  `intent-scope-collected-timing-history.spec.ts`,
  `intent-scope-prior-build-states.spec.ts`,
  `intent-scope-glance.spec.ts` (SEED-331 replaced the source's
  `intent-scope-prior-build-average.spec.ts` with it at `92574ccd3`, keeping
  its collected-artifact, raw-prior and authenticated-read journey; after
  merging trunk, prove that spec's commitment through it, since Playwright
  silently skips a deleted path among others),
  `intent-project-scope-timing-refresh.spec.ts`,
  `recently-done-ci-automatic-repeat.spec.ts`, and the four
  `intent-ci-follow-up{,-proof,-return,-custom}.spec.ts` files;
  under `backend-tests/intent/`, `landed-ci-automatic-repeat.spec.ts` and
  `landed-ci-repeat-{accepted-request,verdict,reconciliation,admission}.spec.ts`.
  Run `bash scripts/dashboard-repeat.sh 3 <expanded spec paths>` with local
  two-worker defaults and `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<absolute path>`.
  Count three consecutive passing natural-load 30–50 runs, recording load and
  CPU contention before/after; out-of-profile runs remain diagnostic evidence.
  Failures are repaired, not retried until green. Do not start burners as a
  substitute for acceptance or remove work owned by another session.
- Because the default shared fixture reaches distributed consumers, slice 2
  requires one full `npm run test:dashboard` through maintained admission.
  Before long runs, inspect current load, CPU/memory and competing work.
  Preparation saw natural load 31–37, memory 39% free, other worktrees and
  another project's tests active. Focused two-worker observation was viable;
  this does not establish headroom for a later full run or remote runner.
  Start fully awake on AC under maintained `caffeinate -s -i`; on battery,
  plug in or use `caffeinate -i` awake with lid open and inspect sleep logs,
  per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Preview the thirteen-shard deal before publishing new/renamed specs using
  `node scripts/test-shares.mjs preview --split-count 13 --spec-dir dashboard`.
  Preserve current hosted counts, concurrency and deadlines. Execution owns
  CI repair through final `ci.yml` push proof and ordinary review/wrap-up.

## Current decisions and plan review

Both slices have one capability outcome and its proof loop; the opt-in increment
contains the mechanics it needs and the default increment owns all consumer
selection and load/hosted proof. No separate Structure slice, new North Star,
numeric slice target, hard limit, trunk-only step or human checkpoint is needed.
Slice-plan refinement was not needed: no unresolved boundary, cumulative design,
sizing or proof-ownership concern was identified. Final candidate contracts,
other startup profiles and performance are implementation acceptance work with
explicit owners above, not claimed complete by the scratch preview experiment.
