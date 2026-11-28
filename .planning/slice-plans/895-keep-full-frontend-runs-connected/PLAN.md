# Keep full Dashboard frontend runs connected to their browser

**Identity:** SEED-413#keep-full-frontend-runs-connected

**Source:** [Keep full Dashboard frontend runs connected to their browser](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#keep-full-frontend-runs-connected)

## Goal and scope

Every full `npm run test:dashboard:frontend` run starts and reports every
selected file, locally and in CI. Capture a natural closure of the Vitest
orchestrator's connection with the event that precedes it, name the cause,
and remove it. The seed's Scope and Key examples are the acceptance source.

Excluded:

- Rerunning dropped files or whole runs as a fix.
- Changing worker counts (two locally, the runner's cores in CI) or
  serializing the two Chromium instances without the coordinator's
  agreement.
- Spec content, test selection, the backend group, and the ordinary failing
  cases seen in the measured window.
- Renderer memory growth, unless the capture shows it causes the closure.

## Current decisions

- **Story Branch Mode.** The hosted probe needs a workflow that runs only on
  the story branch. No slice acts from trunk.
- **A natural closure attributes the cause.** A forced reproduction can show
  a mechanism. Slice 3 starts only from an event captured before a natural
  closure. The seed records why: two mechanisms were reproduced and guarded,
  and the closure continued.
- **Capture and probe are temporary.** The capture is gated by an
  environment variable that only the probe workflow and the local capture
  command set, so `ci.yml` and the ordinary frontend command keep running
  the unchanged path on the same revisions. Both the capture and the probe
  workflow are deleted before the story branch lands. `ci.yml` is not
  edited: Distribution's `ci-browser-groups.test.mjs` and
  `ci-container-workflow.sh` check its frontend job's suite line, and an
  earlier capture that changed that line failed both (run `46026014984`).
- **Hosted is the primary capture route.** The closure rate is measured
  there. Local runs give the pre-change baseline for the seed's local
  example and may capture a closure as well.
- **No hiding.** Accept no fix that retries, reruns, or swallows a closure.
  The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  applies as written, including to any other failure a probe job shows.
- **Timing comparisons are relative.** Compare runs on the same host class
  under similar load, and record load averages with every local timed run.

## Decisive premises

Read at `6baaf31bb` with Vitest 5.1.0, `@vitest/browser` 5.1.0,
`@vitest/browser-playwright` 5.1.0 and Vite 8.3.8. The worktree resolves
`node_modules` from the integration checkout.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The run stops because the orchestrator's Vitest socket closes, not because the heartbeat ends it | Slice 1's capture target | Job `140834871152` (run `46098331829`, `99e48eb35`, 2026-11-28): the error comes from the WebSocket `close` handler at `@vitest/browser/dist/index.js:3101` through `Socket.socketOnClose`, with no heartbeat message. The installed source at that line rejects the orchestrator RPC's pending `createTesters`. | Settled. The TCP socket closed under a live server. |
| The closure occurs often enough in hosted jobs to capture | Slice 2's probe size | `gh run list --workflow ci.yml --limit 120` and each failed `dashboard-frontend` job log, read 2026-11-28: 13 closures in 85 completed runs between 2026-11-27 12:14 and 2026-11-28 02:37 UTC. | Settled at about 15%. Thirty jobs miss it with a chance under 1%. |
| The HMR reload guard does not stop the natural closure | Slice 3's starting point and slice 4 | Same job `140834871152`: `295 passed (332)` on `99e48eb35`, whose config contains `keepVitestOrchestratorOpen`. | Settled. |
| An earlier capture instrument is recoverable | Slice 1 | `git show 4bf8e5f05^:dashboard/test-support/support/frontendDisconnectCapture.ts` returns its 249 lines. It observes provider lifecycle, orchestrator navigations, page close or crash, and Chromium exit. | Settled. It records no Vite server events, which slice 1 adds. |
| A second workflow file on the story branch runs beside `ci.yml` and breaks no repository check | Slice 2's probe | `ci.yml` runs on every story-branch push (the runs above). A search of the test sources found readers of `ci.yml` by name and none that list the workflows directory. | Open in part. The search is presence. Slice 2's first push observes both workflows on one revision, and a red check there stops the slice. |
| The capture does not suppress the closure | Slice 2 | One instrumented hosted job passed on 2026-11-27 (run `46026014984`). One job cannot show a rate. | Open. Bounded by slice 2's stop rule. |
| The closure reproduces locally at two workers | Slice 2's local baseline and the seed's first example | Seed evidence at `67d52b5fa` and neighbors (2026-11-27): five of eight runs. One four-worker run at `003a5f4d0` finished. | Open for the execution revision. Slice 2 re-observes it. Slice 3's local proof discriminates only if this baseline shows closures. |
| What closes the orchestrator socket | Slice 3's repair | Not yet observed. Candidates include a top-level navigation or reload of the orchestrator page, a Vite full-reload message, a closed HMR socket, and a page crash. | Open. Bounded by early probe slices 1 and 2. |

## Outside-in proof

| Promise (seed Key example) | Owner | Observation |
| --- | --- | --- |
| Eight consecutive full local runs each start and report every file | Slice 3 | Eight timed local runs at two workers with load averages, against slice 2's local baseline |
| Thirty consecutive hosted jobs on the repaired revision each report every file | Slice 3 | One probe round of thirty jobs with the capture off |
| A failing file is reported while every other file still runs | Slice 3 | Scratch failing assertion, reverted |
| A real connection drop fails the run and names the unstarted file | Slice 3 | Scratch renderer kill, reverted |
| Worker counts and wall time preserved | Slice 3 | The same local and hosted runs, with unchanged worker settings, against slice 2's durations |
| The HMR reload guard stays only when the cause needs it | Slice 4 | The captured chronology and, on removal, the config without the guard |

## Ordered slices

### 1. The capture records what happens around the orchestrator socket

Type: Behavior (early probe)
Status: planned

Behavior: A frontend run with the capture variable set → one ordered,
timestamped log holds, for the orchestrator page, its main-frame
navigations, page close and crash, browser disconnect and Chromium exit,
each Vitest API connect and disconnect (`DEBUG=vitest:browser*`), and, from
the Vite server, each HMR socket open and close with its close code and
each full-reload message it sends. Without the variable the run is
unchanged.

Proof:

- Restore the instrument from `4bf8e5f05^` behind the environment gate and
  add the Vite server events. Log paths without query strings and no socket
  payloads.
- Run one existing spec with one worker and the capture on. The log shows
  the normal order: connect, tests, provider teardown, HMR close 1001, API
  disconnect, Chromium exit 0.
- Run the same spec with the capture off. The config resolves the ordinary
  provider and writes no capture log.
- `npm run typecheck:dashboard` passes.

### 2. A natural closure is captured with the event that precedes it

Type: Behavior (early probe)
Status: planned

Behavior: Full frontend runs with the capture on, on hosted runners and
locally → at least one run ends with `VITEST_BROWSER_CONNECTION_CLOSED`, and
its capture log shows the first event before the orchestrator socket closed.
The plan records the named cause.

Proof:

- Add `.github/workflows/probe-frontend-connection.yml`. It triggers on
  pushes to the story branch only and runs the `dashboard-frontend` job's
  steps as a matrix of thirty attempts, `fail-fast: false` and
  `max-parallel: 5`, with the capture variable set. It uploads each capture
  log. Five parallel jobs beside the fifteen of `ci.yml` stay inside the
  account's twenty.
- On the first push, confirm that `ci.yml` and the probe both ran on that
  revision and that no `ci.yml` job failed because of the added files.
- Meanwhile run up to eight full local runs at two workers with the capture
  on, under the local gate below. Record each run's result, wall time and
  load. This is the local baseline.
- Cancel the remaining probe jobs once a captured closure names its
  preceding event. Record in this plan the run and job, the revision, and
  the decisive log excerpt. Record the durations of the completed probe
  jobs as the hosted timing baseline.
- Stop rule: if thirty hosted jobs and eight local runs give no closure, or
  a captured closure shows no preceding event, stop. Slice 3 does not start.
  Record what was captured and return the plan for replanning. A probe job
  that fails another way follows the failure policy and does not count as a
  capture.

### 3. Full frontend runs finish every file

Type: Behavior
Status: planned

Behavior: The full frontend group runs under ordinary load, locally at two
workers and on hosted runners → every selected file starts and reports. A
file with a failing test is reported failed while every other file runs. A
connection that really drops still fails the run and names the file that
never ran.

Proof:

- Remove the cause slice 2 names. Change the runner, config, spec setup or
  product code only as that cause requires.
- When a focused check can discriminate the cause, add one that fails
  without the repair, in the style of
  `dashboard/frontend-tests/test-harness/history-traversal-guard.spec.ts`.
  Otherwise record why none can, and the repeated runs below are the proof.
- Delete the capture and set the probe workflow's capture variable off.
  Push once. The probe's thirty jobs each report every file, and the
  ordinary `dashboard-frontend` job passes. Their durations stay within the
  spread of slice 2's hosted baseline.
- Run eight consecutive full local runs at two workers. Each reports every
  file, and wall times stay within the noise of slice 2's local runs at
  comparable load.
- Make one scratch observation that a failing assertion in one file leaves
  the other files running, and one that killing a Chromium renderer mid-run
  fails the run and names the unstarted file. Revert both.
- Delete the probe workflow. `git diff origin/main --stat` then shows
  neither the workflow nor the capture.
- If the cause lies inside Vitest or Vite and needs an upgrade or a
  workaround, return the plan for replanning with slice 2's evidence before
  changing anything.

### 4. The HMR reload guard stays only when the cause needs it

Type: Behavior
Status: planned

Behavior: `keepVitestOrchestratorOpen` is on trunk and slice 2 has named
the cause → the guard stays when the captured natural closure passes
through Vite's disconnect reload, and is removed otherwise. Full runs still
finish every file.

Proof:

- Read slice 2's chronology for an HMR close followed by an orchestrator
  reload. Record the decision and its evidence in this plan.
- On removal, delete the plugin and its imports from
  `dashboard/frontend.vitest.config.mts`. `npm run typecheck:dashboard`
  passes, and the publication's `dashboard-frontend` job reports every
  file.
- When the guard has not reached trunk by this slice, record that and leave
  the decision with SEED-430#follow-published-progress-from-local-git's
  landing. The slice then changes nothing.

## Local gate and delivery

- Run full local frontend runs from a fully awake machine on AC power, per
  [AGENTS.md](../../../AGENTS.md), as
  `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" npm run test:dashboard:frontend`.
  These runs are the story's proof, named here, and not an added gate.
- Before each series, apply
  [choose expensive proof before launch](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#choose-expensive-proof-before-launch).
  Record host load and competing worktree runs. One full local suite runs
  at a time across worktrees, so a series may queue.
- If slice 3 changes shared runner code (`groupVitest.mjs` or
  `dashboard-group-run.mjs`), the backend group shares that path. Run its
  full local suite once before landing.
- Keep the default test timeout. A changed test follows
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md).

North Star:
[Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
The repair keeps the frontend group on Vitest Browser Mode and adds no
Playwright test runner.
[Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
also applies. The capture is temporary and leaves with the story, slice 4
removes a guard that the evidence does not support, and the repair adds no
test-support wrapper.

## Plan review

Refinement was not needed. The four slices each have one outcome and one
proof loop. Slices 1 and 2 are early probes, and slice 3 depends on the
cause that slice 2 names.

This review found no slice-specific concern beyond the open premises above.
Early probe slices 1 and 2 bound each of them, with a stop rule that
returns the plan for replanning. Slice 3's approach and size follow from
the named cause, under
[slice sizing](../../../.agents/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices).
