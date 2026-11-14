# Dashboard checks answer fake GitHub reads without a process per call

**Source:** [selected story](../../seeds/SEED-332-answer-fake-gh-in-process.md#answer-fake-gh-reads-in-process)
**Source review:** [independent commitments](source-review.md)
**Identity:** SEED-332#answer-fake-gh-reads-in-process

## Goal and scope

Ordinary dashboard checks use the existing fake GitHub without starting a
process per simulated API call. The named loaded failures and landed CI repeat
checks pass at natural CPU-bound load 30–50 with two workers and the default
30-second case timeout. Preserve production behavior, all current observations,
and native process proof. The seed owns the scope and key examples. Terry authorized targeted fixture preparation and Git-backed answer optimization on 2026-11-13; all journeys, assertions and default case budgets remain required.

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

A test-only explicit owner preload intercepts only its fake `gh api`; preserve
production `NODE_OPTIONS` deletion, unmatched native calls/overloads/promisification,
real owner bounds/turns/waiters, and no fabricated call PID. The retained
[execution evidence](execution-evidence.md) records the delivered activation choice.

Reuse the existing boundary harness, compose explicit custom-clock preloads,
and retain deliberately shared owner roots. A helper name alone proves no
transport; explicit CLI keeps every physical process observation.

This is test-support design within [ADR 0008, Project dashboard domain and
architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The real local authenticated boundary remains authoritative. The existing
[North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
already supports this; no new architectural direction is needed.

Keep transport, activation and startup environment composition cohesive.
Original and current sizes/decisions remain in linked execution/correction
evidence; apply the250-line check before every proposed edit.

## Decisive premises and preparation observations

[Retained preparation premises and baseline](preparation-evidence.md) supplies the original feasibility rows, qualified remainders and hosted timing baseline. Current execution results and scope decisions remain in the linked execution evidence.

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
Status: done
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
- Loaded gate: [required selection and repetition rules](slice-2-evidence.md#required-loaded-selection). Preserve all27files, natural CPU-bound30–50, two workers, default30s and three consecutive passes; failures are repaired before repetition.
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

Original slice-plan review is retained in [preparation evidence](preparation-evidence.md#current-decisions-and-plan-review).

## Execution context and proof
[Retained execution and acceptance evidence](execution-evidence.md) records the established identity, setup, observer, source comparison and literal proof commands. [Slice 2 implementation and proof](slice-2-evidence.md) retains its quiescent handoff and coordinator-owned remaining gates.

## Story obligations

### G1. Loaded current-source preparation times out
Reported: slice 2 — "Coordinator first loaded repetition: start-origin-isolation.spec.ts:140 timed out after30007ms at default30000ms; current-source/no-persistent-cache case; proof24289 and retained trace."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: return
Commitment: 1c.1

### G2. Loaded Done default selection times out
Reported: slice 2 — "Coordinator first loaded repetition: intent-done-default-answer-selection.spec.ts:42 timed out after34040ms with final intentDiff code visibility missing after its case budget; proof24289 and retained trace."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: return
Commitment: 1c.4

### G3. Full suite production-watcher updates time out
Reported: slice 2 — "Coordinator full run: production-watcher-updates.spec.ts:59 and production-watcher.spec.ts:128 exceeded the default 30000 ms while preparing their second production revisions; proof-36001 and retained traces. Diagnosis is read-only while the full run continues."
Story clause: "require the changed suite to pass"
Disposition: return
Commitment: 6g
### G4. Full suite CI-adapter restart cases fail
Reported: slice 2 — "Before coordinator interruption, landed-ci-adapter-repeat-comparability.spec.ts had invalid-completion/reversed-bounds failures and landed-ci-adapter-repeat-rejections.spec.ts had refused/already-queued/already-running/explicitly-uncertain failures after restart; proof-36001 and pre-repair snapshot retain all six."
Story clause: "require the changed suite to pass"
Disposition: return

### G5. Three named loaded journeys still use 60-second overrides
Reported: slice 2 — "Evidence mapping found existing 60000ms overrides in intent-scope-collected-file-timing-gaps, intent-scope-collected-file-timing-history and intent-scope-collected-timing-history; proof24289 passed them at45655ms,49087ms and31762ms. Those passes do not satisfy the promised default30000ms budget."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: return
Commitment: 1c.5, 1c.6, 1c.7

### G6. Full suite scope-proof acquisition remains unobserved
Reported: slice 2 — "Current full proof52807: landed-ci-scope-build-provenance.spec.ts40 failed its retainedProof(run/201/1) poll at146 after29192ms; landed-ci-scope-later-build.spec.ts44 failed retainedProof(run/304/1) at179 after31784ms. Both expected summary proofs remained undefined; acquisition-phase diagnosis is still owed."
Story clause: "require the changed suite to pass"
Disposition: return


### G7. Prior-build journeys exhaust default budgets
Reported: slice 2 — "Current66 proof14041: prior-build-average51 failed at31187ms in Board continuation; prior-build-states39 timedOut31427ms before expected history. Existing active SEED334 plan608 G8 explicitly owns these load-sensitive cases; preserve that repair and report this receiving evidence."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: return
Commitment: 1c.8, 1c.9

### G8. Landed Review journey exhausts its default budget
Reported: slice 2 — "Current66 proof14041: intent-story-changes-landed-run78 timedOut31600ms; trace and native/API/history phase retained. No next full or repetition launched."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: return
Commitment: 1c.3

### G9. Summary sort journey exhausts its default budget
Reported: slice 2 — "Current66 proof14041: intent-summary-story-comparison-sort72 timedOut31343ms; trace and native/API/history phase retained. No timeout or observation waived."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: return
Commitment: 1c.2
### G10. Relative drilldown exceeds its default budget
Reported: slice 2 — "Independent options-refactor proof95362 selected9:7passed/2timedOut. intent-ci-comparison-drilldown-relative48 timedOut32075ms in its final untilPageRequestsAnswered at197 after signed/scale/preference assertions; no retries or changed observations. File-gaps recurred under G5. Root owns the receiving diagnosis."
Story clause: "require the changed suite to pass"
Disposition: return

### G11. Full-suite Terminal journeys exceed their default budgets
Reported: slice 2 — "Current full proof17024 completed:2791passed/1failed/1timedOut/1expectedSkipped. agent-terminal-maximize63 timedOut33592ms and agent-terminal-touch-keys53 failed32118ms at its150 scroll expectation; both retain traces and default30000ms. No next proof launched."
Story clause: "require the changed suite to pass"
Disposition: return

### G12. A full-suite revision-reuse burst issues a second comparison
Reported: slice 2 — "Broader full proof8651: authenticated-read-revision-reuse-failures.spec.ts91 failed82ms at135, expecting one compare ae...be and one commit ce but observing an additional compare after commit. Retained trace and log; full still running, no source edits or retry."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: execution-evidence.md#g12-synchronization-repair-accepted — /tmp/seed332-revision-reuse-repair/proof-73259.json whole five-file family23/23, including corrected burst and subsequent serial Retry-After case; typecheck0 and independent refactor complete

### G13. Nested process-cleanup probes miss their intended phases
Reported: slice 2 — "Broader full proof8651: run-processes97 failed17167ms because its passing inner case hit5000ms; run-processes104 failed15557ms because its inner case hit5000ms before the expected page-teardown timeout. Traces/log retained; full continues frozen."
Story clause: "require the changed suite to pass"
Disposition: return

### G14. Landing capture admission exhausts its default budget
Reported: slice 2 — "Broader full proof8651: one-shot-landing-capture-admission26 timedOut32712ms at default30000ms, then ECONNREFUSED during teardown. Retained trace/log; no source change or retry."
Story clause: "require the changed suite to pass"
Disposition: return

### G15. Further full-suite landing and recovery cases time out
Reported: slice 2 — "Broader full proof8651 and retained proof-g15-discovery snapshot add landing recovery-deletion/retention, story-branch capture/conflict/later-publication/retained-landing timeouts at default30000ms. Exact cases/durations are in the snapshot; no retry, source change or environmental exemption."
Story clause: "require the changed suite to pass"
Disposition: return

### G16. Shared artifact waiter probes exceed the case budget
Reported: slice 2 — "Broader full proof8651 adds three dashboard-artifact-demand60 probes: shared app-build completion30102ms, shared server-bundle completion30100ms and shared server-bundle failure30019ms, all default30000ms. Actual distinct titlePaths remain in proof; no source change or retry."
Story clause: "require the changed suite to pass"
Disposition: return

### G17. Owned production deployment and publication gates time out
Reported: slice 2 — "Broader full proof8651: production-deployment62 timedOut30142ms and production-publication-fixture16 timedOut30014ms at default30000ms. SEED334 plan608 G2 names these exact repairs; preserve its pending files and retain this receiving proof gap."
Story clause: "require the changed suite to pass"
Disposition: return

## Authorized continuation
Terry's fixture/Git and production-staging scope remains unchanged. [Qualified prior proof](normal-pool-evidence.md) and[receiving75/75](resumed-proof-evidence.md) remain evidence for unchanged boundaries. [Accepted supplier composition](supplier-reconciliation-evidence.md) owns main7fb423492/local65513c7d, preserved refinements, receiving76/76 retaining all27loaded files/67cases, source freshness througha2c601964, independent none—already-clean refactor, all710functional consumer dispositions and observer. Slice2 stays planned with G12proved and16returns open; three qualified natural30–50 family passes, earlier timeout/stability judgment and hosted13-shard acceptance remain unproved. Progress publication seeks exact-revision hosted proof; preserve all125promises, SEED324/334ownership and native controls. No observation is waived.
