# Dashboard checks answer fake GitHub reads without a process per call

**Source:** [selected story](../../seeds/SEED-332-answer-fake-gh-in-process.md#answer-fake-gh-reads-in-process)
**Source review:** [independent commitments](source-review.md)
**Identity:** SEED-332#answer-fake-gh-reads-in-process

## Goal and scope

Ordinary dashboard checks use the existing fake GitHub without starting a
process per simulated API call. The named loaded failures and landed CI repeat
checks pass under bounded controlled CPU contention with two workers and the
default30-second case timeout. Preserve production behavior, all current observations,
and native process proof. The seed owns the scope and key examples. Terry authorized targeted fixture preparation and Git-backed answer optimization on 2026-11-13; all journeys, assertions and default case budgets remain required.

No production transport changes, timeout increases, removed journeys, reduced
assertions, second GitHub answer model, or general runner redesign. Processes
for server/owner startup and login discovery remain allowed. No percentage
speedup or hosted runner headroom is inferred from local measurements.

## Existing solution and direction

PFE: `fakeGitHub.ts` owns existing answers, holds, counters and isolation;
`ghRequest.ts`/`ghReply.ts` own argv and response conversion. Reuse their
NUL-delimited request/byte-framed reply, with no second provider or answer model.
`fakeGh.ts` owns private owner roots/teardown; `dashboardServer.ts`/`fakeGhEnv`
propagate transport and composed startup preloads. Real `GitHubRequests` retain
admission, sharing, rate limits, bounds, cancellation and shutdown.
The test-only owner preload intercepts only simulated `gh api`; production
NODE_OPTIONS deletion, unmatched native overloads/promisification and real
owner processes stay intact. Explicit CLI preserves physical PID/signal proof;
custom clocks and deliberately shared owners retain their actual scope.
[Execution](execution-evidence.md) and [correction evidence](correction-evidence.md)
retain activation, whole-concept decisions and original/current size checks.
This follows [ADR0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) and the
[North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation).
The accepted [main composition](main-composition-evidence.md) owns current group
paths/settings; preserve its sixteen-shard profile and the250-line source limit.

## Decisive premises and preparation observations

[Retained preparation premises and baseline](preparation-evidence.md) supplies the original feasibility rows, qualified remainders and hosted timing baseline. Current execution results and scope decisions remain in the linked execution evidence.

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| No per-read process with faithful argv, stdout/stderr, binary, exit/status, headers and bounds | 1 | New backend transport spec drives real `GitHubRequests`/owner with fake API executable poisoned; succeeds only through in-process transport. Parameterize applicable CLI contract examples and use independent expected bytes, not the implementation's decoder. Exercise oversized output, malformed frame, missing/closed endpoint and nonzero exit. |
| Held reads, cancellation, admission, rate limits and shutdown retain meaning | 1 | New backend spec holds/releases answers and observes arrival, last-waiter departure, server close and zero unanswered calls; real owner handles sharing/limits. Retain existing `authenticated-read-turns`, shared-waiters and subprocess-lifecycle specs on CLI as native controls. |
| Ordinary preview/boundary/dev and direct support consumers use the new default without leaking scope | 2 | Consumer trace plus affected observation/configuration/launch journeys, including two isolated servers, shared owner, restart, custom clock, in-process boundary and an installed-script consumer. Poison API execution in fast mode, observe each fake's distinct calls and answers, then close all resources. |
| Physical process promises remain observed | 2 | Explicit CLI selection; unchanged PID, signal, replacement and cleanup assertions pass. Never replace process observations with transport counters. |
| Named loaded journeys and landed CI repeat checks retain their observations within default budgets | 2 | Controlled final selection below, two workers, default30s; actual cases and CPU/load/priority/cleanup evidence are retained. |
| Shared fixture works across the suite and hosted shards | 2 | One admitted full dashboard run; final published CI all sixteen browser shards pass under accepted group/worker/deadline rules. Compare per-spec times and browser-step durations with the hosted baseline, explain workload changes and retain actual results. |

## Ordered slices

### 1. A dashboard can answer faithful fake API calls without launching a process
Type: Behavior
Status: done
Proof: New `dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts` plus
the existing two `runtime/fake-gh-client*.spec.ts` files; historical command
and proof remain in execution evidence. Current group: `test:dashboard:backend`.

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
Status: done
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
- Final controlled gate: [accepted confirmation](controlled-conclusion-evidence.md), all27named files/67cases plus earlier failure families, two workers/default30s; one bounded controlled run and retained full/CI replace natural-load waiting under Terry's14Novdirection.
- Retain the accepted [normal-pool full](normal-pool-evidence.md) at its recorded
  boundary and current [receiving composition](main-composition-evidence.md).
  The old `test:dashboard` umbrella is historical; current group commands/settings
  are separate. Before any new long run, inspect load, CPU/memory and competing
  work; old resource observations establish no later local or hosted headroom.
  Start fully awake on AC under maintained `caffeinate -s -i`; on battery,
  plug in or use `caffeinate -i` awake with lid open and inspect sleep logs,
  per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Use current group-rooted discovery/shard previews, as recorded in main
  composition; retain E2E6/integrated5/frontend1/backend4, CPU-derived CI workers
  and current deadlines. Execution owns exact composed-revision CI repair
  through final `ci.yml` push proof and ordinary review/wrap-up.

Original slice-plan review is retained in [preparation evidence](preparation-evidence.md#current-decisions-and-plan-review).

## Execution context and proof
[Retained execution and acceptance evidence](execution-evidence.md) records the established identity, setup, observer, source comparison and literal proof commands. [Slice 2 implementation and proof](slice-2-evidence.md) retains its quiescent handoff and coordinator-owned remaining gates.

## Story obligations

### G1. Loaded current-source preparation times out
Reported: slice 2 — "Coordinator first loaded repetition: start-origin-isolation.spec.ts:140 timed out after30007ms at default30000ms; current-source/no-persistent-cache case; proof24289 and retained trace."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; origin-isolation3, successive-source10189ms; retained full/CI and exact setup/assertions in source-review

### G2. Loaded Done default selection times out
Reported: slice 2 — "Coordinator first loaded repetition: intent-done-default-answer-selection.spec.ts:42 timed out after34040ms with final intentDiff code visibility missing after its case budget; proof24289 and retained trace."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; Done-default11587ms; retained full/CI and exact setup/assertions in source-review

### G3. Full suite production-watcher updates time out
Reported: slice 2 — "Coordinator full run: production-watcher-updates.spec.ts:59 and production-watcher.spec.ts:128 exceeded the default 30000 ms while preparing their second production revisions; proof-36001 and retained traces. Diagnosis is read-only while the full run continues."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; production watcher/imported16 cases, max15553ms; retained full/CI and exact setup/assertions in source-review
### G4. Full suite CI-adapter restart cases fail
Reported: slice 2 — "Before coordinator interruption, landed-ci-adapter-repeat-comparability.spec.ts had invalid-completion/reversed-bounds failures and landed-ci-adapter-repeat-rejections.spec.ts had refused/already-queued/already-running/explicitly-uncertain failures after restart; proof-36001 and pre-repair snapshot retain all six."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; comparability/rejection27 plus adapter4, max9224ms; retained full/CI and exact setup/assertions in source-review

### G5. Three named loaded journeys still use 60-second overrides
Reported: slice 2 — "Evidence mapping found existing 60000ms overrides in intent-scope-collected-file-timing-gaps, intent-scope-collected-file-timing-history and intent-scope-collected-timing-history; proof24289 passed them at45655ms,49087ms and31762ms. Those passes do not satisfy the promised default30000ms budget."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; file gaps/history/entry history12709/14122/13674ms; retained full/CI and exact setup/assertions in source-review

### G6. Full suite scope-proof acquisition remains unobserved
Reported: slice 2 — "Current full proof52807: landed-ci-scope-build-provenance.spec.ts40 failed its retainedProof(run/201/1) poll at146 after29192ms; landed-ci-scope-later-build.spec.ts44 failed retainedProof(run/304/1) at179 after31784ms. Both expected summary proofs remained undefined; acquisition-phase diagnosis is still owed."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; scope build-proof8943ms and later-build9964ms; retained full/CI and exact setup/assertions in source-review


### G7. Prior-build journeys exhaust default budgets
Reported: slice 2 — "Current66 proof14041: prior-build-average51 failed at31187ms in Board continuation; prior-build-states39 timedOut31427ms before expected history. Existing active SEED334 plan608 G8 explicitly owns these load-sensitive cases; preserve that repair and report this receiving evidence."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; prior-state6455ms and canonicalglance6975ms; retained full/CI and exact setup/assertions in source-review

### G8. Landed Review journey exhausts its default budget
Reported: slice 2 — "Current66 proof14041: intent-story-changes-landed-run78 timedOut31600ms; trace and native/API/history phase retained. No next full or repetition launched."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; landed Review8488/9691ms; retained full/CI and exact setup/assertions in source-review

### G9. Summary sort journey exhausts its default budget
Reported: slice 2 — "Current66 proof14041: intent-summary-story-comparison-sort72 timedOut31343ms; trace and native/API/history phase retained. No timeout or observation waived."
Story clause: "the cases named above and SEED-324's landed CI repeat checks pass with the default 30 s case timeout"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; Summarysort10796ms; retained full/CI and exact setup/assertions in source-review
### G10. Relative drilldown exceeds its default budget
Reported: slice 2 — "Independent options-refactor proof95362 selected9:7passed/2timedOut. intent-ci-comparison-drilldown-relative48 timedOut32075ms in its final untilPageRequestsAnswered at197 after signed/scale/preference assertions; no retries or changed observations. File-gaps recurred under G5. Root owns the receiving diagnosis."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; relative drilldown12869ms and final no-reread equality; retained full/CI and exact setup/assertions in source-review

### G11. Full-suite Terminal journeys exceed their default budgets
Reported: slice 2 — "Current full proof17024 completed:2791passed/1failed/1timedOut/1expectedSkipped. agent-terminal-maximize63 timedOut33592ms and agent-terminal-touch-keys53 failed32118ms at its150 scroll expectation; both retain traces and default30000ms. No next proof launched."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; Terminal8575/9521/2320ms; retained full/CI and exact setup/assertions in source-review

### G12. A full-suite revision-reuse burst issues a second comparison
Reported: slice 2 — "Broader full proof8651: authenticated-read-revision-reuse-failures.spec.ts91 failed82ms at135, expecting one compare ae...be and one commit ce but observing an additional compare after commit. Retained trace and log; full still running, no source edits or retry."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: execution-evidence.md#g12-synchronization-repair-accepted — /tmp/seed332-revision-reuse-repair/proof-73259.json whole five-file family23/23, including corrected burst and subsequent serial Retry-After case; typecheck0 and independent refactor complete

### G13. Nested process-cleanup probes miss their intended phases
Reported: slice 2 — "Broader full proof8651: run-processes97 failed17167ms because its passing inner case hit5000ms; run-processes104 failed15557ms because its inner case hit5000ms before the expected page-teardown timeout. Traces/log retained; full continues frozen."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; four nested process probes4790/11788/6294/9541ms; retained full/CI and exact setup/assertions in source-review

### G14. Landing capture admission exhausts its default budget
Reported: slice 2 — "Broader full proof8651: one-shot-landing-capture-admission26 timedOut32712ms at default30000ms, then ECONNREFUSED during teardown. Retained trace/log; no source change or retry."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; capture admission6243ms; retained full/CI and exact setup/assertions in source-review

### G15. Further full-suite landing and recovery cases time out
Reported: slice 2 — "Broader full proof8651 and retained proof-g15-discovery snapshot add landing recovery-deletion/retention, story-branch capture/conflict/later-publication/retained-landing timeouts at default30000ms. Exact cases/durations are in the snapshot; no retry, source change or environmental exemption."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; all11relevant capture/recovery files/17cases, max10484ms; retained full/CI and exact setup/assertions in source-review

### G16. Shared artifact waiter probes exceed the case budget
Reported: slice 2 — "Broader full proof8651 adds three dashboard-artifact-demand60 probes: shared app-build completion30102ms, shared server-bundle completion30100ms and shared server-bundle failure30019ms, all default30000ms. Actual distinct titlePaths remain in proof; no source change or retry."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; all5 artifact-demand waiters5182/2585/2546/4618/3896ms; retained full/CI and exact setup/assertions in source-review

### G17. Owned production deployment and publication gates time out
Reported: slice 2 — "Broader full proof8651: production-deployment62 timedOut30142ms and production-publication-fixture16 timedOut30014ms at default30000ms. SEED334 plan608 G2 names these exact repairs; preserve its pending files and retain this receiving proof gap."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: controlled-conclusion-evidence.md — actual controlled136 strictpass; deployment4/publication3, max11580ms; retained full/CI and exact setup/assertions in source-review


### G18. Accepted main composition still requires current sixteen-shard CI
Reported: slice 2 — "Accepted SEED334 on main0dd89b9ce changes the applicable profile to E2E6/integrated5/frontend1/backend4. Receiving backend59/E2E26 and3Node contracts pass, but no hosted result for the composed current sixteen-shard revision has been observed; historical13CI cannot substitute. Published2d02df0f/run43552606318/attempt1 failed only integrated3/5: revision-stream.spec.ts138, other-page seven-of-eight assertion169 missing; root owns diagnosis/repair and exact final CI."
Story clause: "require the changed suite to pass"
Disposition: proved by slice 2: main-composition-evidence.md - exact repaired 9e4ace82c42c97e29248dced09e9b201749e86b4 CI 43553974482/attempt1 succeeded under the current16browser/4Node profile; deterministic clock red and15-case family proof retain every assertion.

## Final evaluation and continuation
Terry's14Nov direction selected the [controlled confirmation](controlled-conclusion-evidence.md):136cases passed, all27named files/67cases, default30s/two workers and owned CPU/cleanup audit. All17original gaps remain proved; source review now has136clauses, a different unit from136controlled cases. [Accepted main composition](main-composition-evidence.md) preserves current paths/native assertions and observes backend59/E2E26 plus3Node contracts. All18gaps are proved: exact repaired sixteen-shard CI 43553974482/1 passed; [historical13-shard timings](hosted-proof-evidence.md) do not satisfy it. SEED324 remains queued/unfinished; SEED334 is Done on accepted main. Intent Coverage Caught is disposed by retaining existing proof; selected process review is complete in DearDough. Product advice: no change. Complete ordinary delivery and Wrap.
