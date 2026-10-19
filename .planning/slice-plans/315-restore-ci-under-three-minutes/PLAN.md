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
Status: done
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

Accepted proof (2026-10-19): checkout-bound npm/browser/check setup and
dashboard typecheck passed. Focused boundary command, serving-mode equivalence
and keyboard preview journeys passed all ten tests
(`/tmp/seed136-slice1-focused.json`). The scratch harness
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed136-bundle-proof-ql9rz1rz/run.mjs`
passed real CLI/HTTP assertions for all three source-relative `import.meta`
forms, next-run source freshness, passing/failing cleanup, overlapping unique
bundles, SIGINT preserving the other run, no leaked run processes, and an
invalid entry failing setup before tests with its source named and no bundle.
Its `scratch.spec.ts`, logs and `observations.json` retain the observations;
all injected source edits were restored.

The final full local proof below passed all 1,537 tests, with no skips,
retries, failures or leaked-process reports. The independent refactor changed
only test-contract prose (250 lines), preserving every accepted boundary.
`npm run format` passed; only owned code formatting changed. The existing
five-case reporter-storage proof also passed after the fixture repair below.

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

## Execution context

- Established start: publisher `dashboard-territory.local-open-dough`, agent
  `ebacky-chan`; story-branch mode in
  `/Users/terryyin/git/open-dough/.worktrees/cut-dashboard-ci-time-with-once-per-run-server-b`
  on `codex/cut-dashboard-ci-time-with-once-per-run-server-b`. This owned execution
  checkout is also the originating checkout; no integration checkout is supplied.
- Starting revision: `dca322fb8b7cd91d06f19cb2276391b8a6fc2b14`.
  Published claim/candidate: `c0fa9c15d00587d9251f1f7fa1a7f799b9ec8f40`
  on `origin/main`. Increments publish to the origin execution branch.
- Node 24.21.0; checkout-bound npm/browser setup, prerequisite check and
  `npm run typecheck:dashboard` passed on 2026-10-19. Hook is check-only
  staged lint plus typecheck; selective formatting is `npm run format`.
- No numeric slice budget is supplied; use one bounded behavior/proof loop.
  Existing planning authority is retained; no explicit replan override.
- CI: GitHub Actions `ci.yml` (verified workflow 351271804, name `CI`),
  target `codex/cut-dashboard-ci-time-with-once-per-run-server-b`.
  Codex coordinator `seed136-ebacky`, yielded cell `8`, PTY session `88432`,
  directory `/tmp/dough-ci-501/watch-lxenZg`, PID `35734`.
  The earlier trunk claim is unobserved by this branch observer.

## Learnings

The first full local run (`/tmp/seed136-slice1-full-20261019.json`) selected
1,537 tests: 1,531 passed, two failed, four serial successors skipped, exit 1
after 920.52 s. The storage-failure fixture raced the reporter's begin-snapshot
write; it now waits for that snapshot and uses a directory obstruction that
the reporter's nonrecursive cleanup cannot remove. All five storage cases
passed (`/tmp/seed136-slice1-storage-deterministic.json`). The repair will be
committed before the bundle so the hosted candidate's parent contains it.

The other failure was the unchanged production watcher's 90-second retry
scenario. Its real production checkout never imports the test bundle. In the
broad run four production files overlapped: source copying took about 22 s
versus 4 s isolated, and first deployment about 39 s versus 8 s isolated.
One instrumented focused observation passed in 24.24 s: npm ci took 4.97 s
cold, then 1.39/1.31 s in the same HOME, and successful builds 1.82/1.63 s.
Observed 5/15-minute load was 27.53/25.13 on a 16-core host. This supports
host contention, not a cache or bundle defect. The next full local proof uses
`--workers=4`, ordinary npm and a fresh proof record, with all tests,
assertions and deadlines retained. No hosted workflow or production script
changes are justified; an unexplained recurrence stops diagnosis.

Final complete local verification (PTY `59564`, terminal exit 0):
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed136-slice1-full-repaired-workers4-20261019.json npm run test:dashboard -- --workers=4`.
All 1,537 selected tests passed in 1,066.15 s; strict and runner verdicts
passed. The previously timed-out retry took 9.11 s and all five watcher
failure cases passed with unchanged assertions and deadlines.
The instrumented production observation is retained in
`/tmp/seed136-slice1-production-diagnostic.json` and
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed136-npm-diagnostic-4aobk5x4/`.

The dashboard shards are CPU-bound on four-vCPU runners. Reordering work only
moves contention, so time comes back only by removing CPU work. Per-test server
starts remain the largest measured cost; removing more of them would require
the isolation redesign that Terry deferred.
