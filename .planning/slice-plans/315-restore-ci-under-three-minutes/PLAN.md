# Cut dashboard CI time with once-per-run server bundles

**Source:** [Cut dashboard CI time with once-per-run server bundles](../../seeds/SEED-136-dashboard-test-efficiency.md#restore-ci-under-three-minutes)

**Identity:** SEED-136#restore-ci-under-three-minutes

## Goal and scope

Each run bundles Vite configuration, the boundary server and its Cursor child
once; every preview/boundary start loads it. Coverage, per-test isolation,
twelve shards and deadlines stay unchanged. Two hosted pairs must each save
suite-step time, averaging ≥8%. The seed owns examples and rejected/deferred
mechanisms; Terry narrowed scope on 2026-10-18 and retained 8% on continuation.

## Evidence and premises

The 2026-10-18 probe supported the mechanism, not acceptance: four concurrent
idle starts fell from 1,035 → 404 ms (preview), 1,235 → 241 ms (boundary),
with 199 ms bundling. One hosted pair at `94b65843` saved 2,496 → 2,230 s
with all tests passing and ±20% shard variance. Probe history:
`0133c0bf:.planning/slice-plans/315-restore-ci-under-three-minutes/PLAN.md`.
The seed retains delivered measurements and limits.

## Architecture and PFE

- `globalSetup.ts` owns each run's unique build/bundle directories, publishes
  them to workers and removes them at teardown or handled interruption.
- `serverAddress.ts` owns launch arguments and fallback for runs without bundles.
- `serverBundle.ts` owns entries, source-location preservation and output under
  repository `node_modules`, so bare imports resolve as from source. Reuse
  Vite's locked `rolldown@1.2.9`, declared directly as a development dependency.
- Cursor's existing `runnerProcess.ts` locator prefers the adjacent emitted
  runner, retaining source fallback and machine-local lifecycle. Whole-product
  search found no reusable resolver; compile-once extends through the child.
- Dev/public production keep source. `dashboard/tests/README.md` owns the test
  contract; boundary specs observe real commands. ADR 0002 cohesion/empiricism,
  ADR 0005 runner proof and NORTH-STAR loopback/runner ownership stay satisfied.

## Outside-in proof ownership

| Outcome | Owner | Proof |
| --- | --- | --- |
| Servers start from the run's bundle with the same behavior | Slice 1 | `boundary/boundary-server.spec.ts` names the bundled entry; `boundary/serving-modes.spec.ts`, a preview journey and a source-relative read pass; full local dashboard suite passes |
| Freshness, cleanup, concurrency and truthful bundle failure | Slice 1 | Scratch edit to a server module is served on the next run; the bundle directory is gone after a passing and a failing run; two concurrent runs keep separate directories; a scratch unbundleable module fails global setup naming the error, then is reverted |
| Bundled runner launch and lifecycle | Slice 2 | Real process command, preview/boundary behavior, Cursor lifecycle/environment, source fallback, freshness and cleanup, full local suite |
| Matched hosted saving | Slice 3 | Two matched pairs, each lower, average ≥ 8% lower summed dashboard suite-step seconds, every check passing; the seed's evidence updated |

## Ordered slices

### 1. Start dashboard servers from a once-per-run bundle
Type: Behavior
Status: done
Proof: Focused boundary/serving-mode and preview journey assertions, scratch
lifecycle/source-relative checks and the full local dashboard suite.
Behavior: Global setup bundles `dashboard/vite.config.mts` and
`dashboard/server/boundaryServer.ts`; preview uses `--configLoader native
--config <bundle>/vite.config.mjs`, boundary uses `node <bundle>/boundaryServer.mjs`.
Teardown removes the run's bundle. Direct `rolldown@1.2.9` reuses the lock;
bundle before app build, fail setup with the named error, preserve all three
source `import.meta` forms and externalize bare/node_modules dependencies.
Broad local proof is justified because every server start is affected.

Safe stop: the suite passes locally with every server on the bundle.

Accepted proof (2026-10-19): checkout-bound npm/browser/check setup and
`npm run typecheck:dashboard` passed. All ten focused boundary, serving-mode
and keyboard tests passed (`/tmp/seed136-slice1-focused.json`). The scratch
harness below proved all three source-relative `import.meta` forms, next-run
freshness, pass/fail cleanup, unique concurrent bundles, SIGINT isolation,
zero leaks and named setup failure before tests; all source edits were restored:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed136-bundle-proof-ql9rz1rz/run.mjs`.

Final full proof, terminal exit 0:
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed136-slice1-full-repaired-workers4-20261019.json npm run test:dashboard -- --workers=4`.
All 1,537 passed in 1,066.15 s, no skips/retries/leaks, strict/runner pass.
The five storage cases passed (`/tmp/seed136-slice1-storage-deterministic.json`).
Independent refactor changed only test-contract prose; formatter and hooks passed.

### 2. Start the Cursor runner from the same run-owned bundle
Type: Behavior
Status: done
Proof: Real preview and boundary starts report their own address and launch
`runnerMain.mjs` from the run's bundle. Existing Cursor lifetime, one-runner
per HOME, restart and environment assertions pass; dev/public production keep
the source fallback. The full local suite passes with four workers and no
skips/retries, then the candidate is delivered before hosted measurement.

Behavior: Given a preview or boundary server in a suite run with a fresh HOME
→ its real Cursor runner starts from a third entry bundled once in that run,
retaining its detached lifecycle and the same source-relative behavior.

- Add `dashboard/server/hosts/cursor/runnerMain.ts` to `serverBundle.ts`'s
  existing entries, using the same source-location plugin and run directory.
- Change the existing `runnerProcess.ts` entry locator to prefer an adjacent
  compiled `runnerMain.mjs`, resolved from the emitted module, when present.
  Keep current cwd/source-relative fallback when absent. Use the compiled
  entry without the TypeScript transform flag; retain source flags. No test
  environment override, transformed function-source replacement or second
  entry-location policy. Product dev/public-preview behavior remains source.
- Update runner process observations to recognize both actual entry formats,
  retaining the one-runner and environment assertions; add observing proof
  that bundled servers actually start the compiled runner. Update the test
  contract. Do not change runner protocol, readiness, ownership or deadlines.
- Extend scratch freshness/cleanup/failure/concurrency proof to the third
  entry, including nested no-global-setup/source fallback. Verify the changed
  effect through Cursor consumers, not only a process-launch unit assertion.

Safe stop: the delivered candidate preserves behavior locally, and its newly
profiled startup saving is recorded without claiming the hosted threshold.

Accepted proof (2026-10-19): 29 focused tests passed, no skips/retries,
record `/tmp/seed136-slice2-focused.json`; actual process assertions observe
compiled boundary/preview runners and the original dev source command.
`node /tmp/seed136-slice2-runner-bundle-proof-20261019/run.mjs` passed all
third-entry source-relative/freshness, pass/fail/SIGINT/concurrent cleanup,
setup-failure and no-global-setup source-fallback assertions; source restored.
Full terminal exit 0, strict/runner pass:
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed136-slice2-full-workers4-20261019.json npm run test:dashboard -- --workers=4`.
All 1,537 passed, no skips/retries/failures/leaks, 971.386 s versus 1,066.149 s
before (8.888320% lower local wall time; shared-host load limits attribution).
Launch load was 3.88/5.93/5.06 on 16 CPUs. Independent refactor changed only
locator explanation and plan prose; accepted runtime proof stayed unchanged.
`npm run format` passed; hosted acceptance remains with slice 3.

### 3. Prove the hosted saving and record it
Type: Behavior
Status: done
Proof: Two matched pairs on `ubuntu-24.04`. Each pair is the candidate's push
run and a `workflow_dispatch` CI run of original unbundled control
`f4466c10`, started together. Terry authorized continuing toward 8% against
that original control on 2026-10-19 after the first candidate missed it.
Report summed dashboard suite-step seconds, summed test seconds, job counts
and cache outcomes for each.

Behavior: Given the delivered candidate and the original control run concurrently twice
→ both pairs show lower summed suite-step seconds, averaging at least 8%, with
every required check passing.

- Preserve the first candidate's measurements below. Compare the delivered
  three-entry candidate twice against original control `f4466c10`. No unchanged-
  candidate retries and no replacement of measured results.
- Dispatch the control from a temporary branch at the control commit, and delete
  that branch after recording.
- Replace the seed's hosted probe evidence with the delivered measurements.
  If a pair shows no saving, report it without retrying it away and stop for
  Terry's decision instead of claiming the story complete.

Safe stop: the measured saving is recorded in the seed.

First candidate `0133c0bf`: 2,191 → 2,131 s (2.738476%) and 2,456 →
2,256 s (8.143322%); mean **5.440899%, below 8%**. All 16 checks and 1,537
tests passed per run. The seed retains exact runs, caches, queues and cancelled
unpaired 39180107803 / CreateEvent launch repair; no result was replaced.
Raw: `/tmp/seed136-hosted-measurement-20261019/`; watches/owned refs retired.

Runner candidate `2a9ddc10`: control 39188949666 → push 39188970886 took
2,396 → 1,844 s (23.038397%); control 39189551954 → push 39189557466 took
2,335 → 2,000 s (14.346895%). Mean **18.692646%, meeting 8%**.
All 64 jobs passed; each run passed 1,537 tests, no skips/retries/flakiness.
Same image/Node; the seed retains cache inequality, queue and launch limits.
Raw: `/tmp/seed136-hosted-runner-measurement-20261019/` (Jobs API, logs,
twelve HTML reports/run, comparison). All watches/collectors exited 0 and
both exact-SHA guarded owned aliases were removed. Root accepted the proof.

## Execution complete

Product advice: No further product work recommended. The 18.693% suite-step
saving meets 8%; complete-workflow wall time remains unproved under queueing.

## Story obligations

### G1. Local host-capacity limitation
Reported: slice 1 — "With only local concurrency changed to four workers, the same retry passed in 9.11s and all five production failure cases passed."
Story clause: "with unchanged coverage, isolation and job layout"
Disposition: proved by slice 1: final full proof selected and passed all 1,537 tests without skips/retries, using the same assertions and deadlines; the unchanged twelve-shard CI layout passed in all four hosted runs. The production path excludes the test bundle; accepted contention diagnosis and exact commands are retained below.

### G2. Missing second-pair candidate launch
Reported: slice 2 — "If alias branch creation produced no workflow, second-pair proof is uncovered"
Story clause: "Given the candidate revision and its unchanged parent run concurrently on `ubuntu-24.04` with twelve dashboard shards"
Disposition: proved by slice 3: retained genuine push run 39180260655 at 0133c0bf and dispatch 39180257177 at f4466c10 were created three seconds apart and completed all required jobs. Run/ref/event JSON and the cancelled unpaired launch remain in the evidence root; all measured outcomes are retained.

### G3. Measured saving misses the selected threshold
Reported: slice 2 — "Hosted criterion remains unmet: both pairs improved, but the mean reduction was 5.440899%, below 8%."
Story clause: "the candidate's summed dashboard suite-step seconds are lower in each of two matched pairs, by at least 8% on average, with every required check passing"
Disposition: proved by slice 3: control/push pairs 39188949666/39188970886 and 39189551954/39189557466 saved 23.038397% and 14.346895%, averaging 18.692646%; all 64 jobs and 1,537 tests per run passed without skips/retries/flakiness. Root independently verified raw runs/jobs and all HTML reports in `/tmp/seed136-hosted-runner-measurement-20261019/root-independent-verification.json`; `comparison.json` retains the arithmetic mean and exact sources.

## Current decisions and preparation review

- Refinement 2026-10-19 retained completed 1/prior measurements; 2 owns runner
  behavior, 3 hosted acceptance/G3. Terry authorized the three slices.
- The first candidate missed 8% by 2.559101 points (~60 summed suite seconds).
  Terry retained 8%/control `f4466c10`; imports, external bundling and compile
  cache could not close the gap. The child profile justified slice 2.
- Apply [native setup](../../../tests/native-setup.md), independent refactoring,
  proof, agent commit and asynchronous CI ownership. Local broad proof/hosted
  waits are explicit; control dispatch uses the same free public CI workflow.
  Preparation grants no execution. No scope/architecture choice remains open.
  Superseded under-three-minute plan: `7d08bc72` at this plan's repository path.

## Execution context

- Established publisher `dashboard-territory.local-open-dough`, agent
  `ebacky-chan`, story-branch mode; owned/originating checkout
  `/Users/terryyin/git/open-dough/.worktrees/cut-dashboard-ci-time-with-once-per-run-server-b`,
  branch `codex/cut-dashboard-ci-time-with-once-per-run-server-b`.
  Increments publish to origin's execution branch; no integration checkout supplied.
- Starting revision `dca322fb8b7cd91d06f19cb2276391b8a6fc2b14`; published claim
  `c0fa9c15d00587d9251f1f7fa1a7f799b9ec8f40` on `origin/main`.
  Slice 1 accepted `0133c0bfb0197e7681579520d3a4d79924297d44`, suffix base that
  claim, no rewrite. Parent/control `f4466c10ffcfe3697a51a0f829a7ed063d06f2ba`
  contains the fixture repair. Both commits passed staged lint/typecheck.
- Slice 2 accepted `2a9ddc10002ba125cbc5d1aa6c69b6166c237512`, suffix base
  `0133c0bf`, no rewrite, retained observation reused; staged hook passed.
- Node 24.21.0; native setup/typecheck passed 2026-10-19; `npm run format`.
  Hook owns check-only staged lint/typecheck. No numeric budget or replan override.
- CI is GitHub Actions `ci.yml`, workflow 351271804 (`CI`), execution-branch
  target, coordinator `seed136-ebacky`. Initial cell 8 / PTY 88432 / PID 35734 /
  `/tmp/dough-ci-501/watch-lxenZg` stopped at the human-judgment pause with
  unread 0 and process exit confirmed; normal completion was not invoked.
  Earlier trunk claim remains unobserved by this branch stream.
- Resumption verified old stop/exit and native setup. Replacement retained stream:
  cell `65`, PTY `43383`, PID `16232`, `/tmp/dough-ci-501/watch-ZqcPTu`.
  Later delivery reuses it. Worktree, branch and evidence remain owned;
  all slice proof is accepted; closure uses the final registered revision.

## Learnings

At `0133c0bf`, 160 real starts (eight serial/32 four-concurrent per mode/variant)
reduced concurrent boundary startup 353.81 → 210.96 ms and preview 381.33 →
257.25 ms; bundling cost 61.51 vs 44.19 ms once/run. All reached readiness,
runners stopped. Local startup and adjacent-resolution/source-fallback HTTP proof:
`/tmp/seed136-startup-profile-20261019-1/` (`runner-bundle.mjs`,
`runner-results.json`, `runner-resolve.mjs`, `runner-resolve-proof.json`).
External zod/ws bundling/compile cache gave no useful saving; policy stays.
Seventy workers/run and 26.30 ms mean fresh local rolldown import reject tiny
worker-import edits as a ~60-second saving. Runner hosted pairs are above.

The initial full run (`/tmp/seed136-slice1-full-20261019.json`) failed after
920.52 s: 1,531 passed, two failed, four serial successors skipped. The storage
fixture now waits for its begun snapshot and uses a directory obstruction.
An unchanged production retry also timed out under shared-host contention:
source copy/deployment ~22/39 s vs ~4/8 s isolated, observed load 27.53/25.13
on 16 cores. Instrumented ordinary npm proof passed in 24.24 s; four-worker
full proof above passed unchanged assertions/deadlines, retry 9.11 s.
Details remain in `0133c0bf`'s plan and
`/tmp/seed136-slice1-production-diagnostic.json`, with diagnostic script/logs at
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed136-npm-diagnostic-4aobk5x4/`.
No hosted layout or production script changes follow from local contention.
