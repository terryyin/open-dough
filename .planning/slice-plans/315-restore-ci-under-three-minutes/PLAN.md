# Cut dashboard CI time with once-per-run server bundles

**Source:** [Cut dashboard CI time with once-per-run server bundles](../../seeds/SEED-136-dashboard-test-efficiency.md#restore-ci-under-three-minutes)

**Identity:** SEED-136#restore-ci-under-three-minutes

## Goal and scope

Each dashboard suite run bundles the dashboard's Vite configuration and
boundary server entry once, and every preview or boundary-mode server the run
starts loads that bundle instead of transforming the server graph again.
Coverage, per-test isolation, the twelve-shard workflow and its deadlines stay
as they are. Matched hosted runs must show a saving. The seed owns the key
examples, rejected mechanisms and deferred promises; Terry narrowed the
story to this measured saving on 2026-10-18.

## Evidence and premises

The hosted probe of 2026-10-18 established the mechanism and its size; the
seed records the runs and figures. These are the premises this plan relies on:

| Premise | Observation | Limit |
| --- | --- | --- |
| Bundling halves or better each idle server start | Probe 39106239531 `startup` job, four concurrent starts: preview 1,035 → 404 ms, boundary 1,235 → 241 ms; bundling took 199 ms | Idle runner, not in-suite |
| The saving survives in the suite with every test passing | Probe 39106658930 against concurrent unchanged CI 39106658874 at `94b65843`: suite steps 2,496 → 2,230 s, all tests passed in both | One matched pair; shard variance ±20% |
| Bundled modules keep source-relative behavior | The probe's rolldown plugin replaced `import.meta.url`, `dirname` and `filename` with each module's original location. The full suite passed, including `boundary/serving-modes.spec.ts` | The probe code at `94b65843` was env-gated and is not the delivered shape |
| Bare imports resolve from the bundle | The bundle was written under the repository's `node_modules` in a `mkdtemp` directory | — |

Local relative comparisons (shared machine): preview 252 → 122 ms, boundary
245 → 89 ms. The probe branch is deleted; its commit `94b65843` may remain
fetchable from GitHub for a while, but the plan does not depend on it.

## Architecture and PFE

- Run lifecycle stays in `dashboard/tests/support/globalSetup.ts`, which
  already builds the dashboard once per run, publishes its directory to
  workers through the environment and removes it in teardown. The bundle
  follows the same pattern: a run-unique directory published in one variable
  and removed at teardown, on success or failure.
- Server launch stays in `dashboard/tests/support/serverAddress.ts`.
  `boundaryServerCommand` and the preview arguments read the run's bundle
  variable and fall back to source only when no run set it, such as a nested
  configuration.
- A new `dashboard/tests/support/serverBundle.ts` owns bundling: the entries,
  the `import.meta` preservation plugin and the output location. Reuse
  Vite's own bundler, `rolldown`, which `package-lock.json` already locks at
  1.2.9. Declare it as a direct development dependency at that version
  instead of importing a transitive package.
- Production serving (`npm run preview:dashboard`, the deployment watcher)
  does not change, and dev-mode servers keep serving source.
- Update the test contract's "Two tiers" description of the boundary
  command in `dashboard/tests/README.md`, and the opening comment of
  `boundary/boundary-server.spec.ts`.

## Outside-in proof ownership

| Outcome | Owner | Proof |
| --- | --- | --- |
| Servers start from the run's bundle with the same behavior | Slice 1 | `boundary/boundary-server.spec.ts` names the bundled entry; `boundary/serving-modes.spec.ts`, a preview journey and a source-relative read pass; full local dashboard suite passes |
| Freshness, cleanup, concurrency and truthful bundle failure | Slice 1 | Scratch edit to a server module is served on the next run; the bundle directory is gone after a passing and a failing run; two concurrent runs keep separate directories; a scratch unbundleable module fails global setup naming the error, then is reverted |
| Matched hosted saving | Slice 2 | Two matched pairs, each lower, average ≥ 8% lower summed dashboard suite-step seconds, every check passing; the seed's evidence updated |

## Ordered slices

### 1. Start dashboard servers from a once-per-run bundle
Type: Behavior
Status: planned
Proof: The focused specs and scratch checks in the proof table pass, followed
by the full local dashboard suite under `env -u NO_COLOR -u FORCE_COLOR` with a
fresh `OPEN_DOUGH_DASHBOARD_PROOF_RECORD`.

Behavior: Given a suite run, global setup bundles `dashboard/vite.config.mts`
and `dashboard/server/boundaryServer.ts` from the checkout → every preview
server runs `vite preview --configLoader native --config <bundle>/vite.config.mjs`,
every boundary server runs `node <bundle>/boundaryServer.mjs`, and teardown
removes the bundle.

- Add `rolldown@1.2.9` to `devDependencies` and confirm the lockfile resolves
  only that existing package.
- Bundle before the dashboard build so a bundling failure ends the run early,
  naming the error. Treat `import.meta.url`, `dirname` and `filename` exactly
  as the probe did. External: bare specifiers and anything under
  `node_modules`.
- The broad local run is justified because the change reaches every server
  start in the suite.

Safe stop: the suite passes locally with every server on the bundle.

### 2. Prove the hosted saving and record it
Type: Behavior
Status: planned
Proof: Two matched pairs on `ubuntu-24.04`. Each pair is the candidate's push
run and a `workflow_dispatch` CI run of its unchanged parent, started together.
Report summed dashboard suite-step seconds, summed test seconds, job counts
and cache outcomes for each.

Behavior: Given the delivered candidate and its parent run concurrently twice
→ both pairs show lower summed suite-step seconds, averaging at least 8%, with
every required check passing.

- Dispatch the parent from a temporary branch at the parent commit, and delete
  that branch after recording.
- Replace the seed's hosted probe evidence with the delivered measurements.
  If a pair shows no saving, report it without retrying it away and stop for
  Terry's decision instead of claiming the story complete.

Safe stop: the measured saving is recorded in the seed.

## Current decisions and preparation review

- Required local setup is [native verification setup](../../../tests/native-setup.md).
  During execution, apply the ordinary independent post-change refactor,
  focused proof, agent commit and asynchronous CI ownership from the execution
  workflow. Preparation authorizes none of that execution.
- Hosted runs in slice 2 are part of ordinary delivery CI; the parent dispatch
  is a second free public-repository run of the same workflow.
- Each slice has a concrete observation boundary, and the mechanism's decisive
  premises were observed on hosted runners. No human-owned scope or
  architecture decision remains open.
- The superseded under-three-minute plan is recoverable at
  `7d08bc72:.planning/slice-plans/315-restore-ci-under-three-minutes/PLAN.md`.

## Learnings

The dashboard shards are CPU-bound on four-vCPU runners. Reordering work only
moves contention, so time comes back only by removing CPU work. Per-test server
starts remain the largest measured cost; removing more of them would require
the isolation redesign that Terry deferred.
