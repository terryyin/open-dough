# Prove Dashboard configuration and serving in Node Vitest

**Identity:** SEED-413#prove-dashboard-configuration-and-serving-on-vitest

**Source:** [Prove Dashboard configuration and serving in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-dashboard-configuration-and-serving-on-vitest)

## Goal and scope

Give Dashboard maintainers fast, typed Node Vitest proof for Dashboard
configuration (project membership, machine JSON storage, OpenAI credentials,
terminal theme, feedback maintenance, notifier setup, and published agent
settings) and product-facing serving, deployment, qualification, and
update-watcher behavior. Move all 13 legacy Playwright specs in
`dashboard/backend-tests/configuration/` (39 cases) and all nine
product-facing Playwright specs in `dashboard/backend-tests/runtime/`
(25 cases) off backend Playwright — 22 specs, 64 cases total.

- Run configuration boundary checks through direct production calls or
  in-process HTTP (`startInProcessBoundaryHttp`) on Node Vitest without
  spawning child Dashboard servers where the boundary contract does not
  require a child process.
- Preserve real Git, filesystem, CLI, and process serving boundaries where
  the product contract requires them (`project-add-validation`,
  `project-add-boundary` transport/abort/deadline cases, `notifier-setup`,
  `production-qualification`, `production-update-selection`,
  `production-deployment`, `production-watcher-preview`,
  `production-watcher-refusals`, `boundary-server`,
  `dev-server-cache-ownership`, and `serving-modes`), running them in Node
  Vitest without Playwright's `request` fixture or browser runner.
- Relocate `production-watcher-setup-lifetime.spec.ts` (1 case), which
  exercises `e2e/runtime/productionWatcherMachine.ts` with a real Playwright
  `browser` fixture, to `e2e/runtime/production-watcher-setup-lifetime.spec.ts`
  so its browser proof stays beside its consumer and off the legacy backend
  runner.
- Product behavior is unchanged. Add zero new server, request, or boundary
  wrappers to `dashboard/test-support/`, compose typed state with MakeMe
  where applicable, and remove any test-support helper left with no
  remaining caller.
- Material exclusions: the other 30 test-infrastructure `runtime/` specs and
  backend runner removal belong to
  [runner cutover](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner);
  browser page journeys stay in `e2e/configuration/` and `e2e/runtime/`.

## Current decisions

- Follow the North Star on
  [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and
  [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Apply [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- PFE: `dashboard/test-support/support/inProcessBoundaryHttp.ts`
  (`startInProcessBoundaryHttp`) already mounts any `LocalBoundary`
  (`installFeedbackMaintenanceMiddleware`,
  `installOpenAIConfigurationMiddleware`, `installTerminalThemeMiddleware`,
  `installProjectConfigurationMiddleware`) on an in-process `node:http`
  server with `mountProjectConfiguration(environment)`. All four boundaries
  share `localJsonEndpoints` (`dashboard/server/localJsonEndpoints.ts`),
  which enforces same-origin, `Cache-Control: no-store`, `readTimeoutMs()`,
  and shutdown abort. Reuse `startInProcessBoundaryHttp` for slices 3 and 4
  instead of spawning child Dashboard servers.
- PFE: `dashboard/test-support/support/backendGlobalSetup.ts` already returns
  `Promise<() => Promise<void>>`, matching Vitest's `globalSetup` contract,
  and registers `server-bundle`, `app`, and `published-application-source`
  lazily on demand. Wiring it into `dashboard/backend.vitest.config.mts`
  gives slices 5–7 the same shared run artifacts in Node Vitest with
  negligible overhead for specs that never request an artifact.
- Keep `systemSettingsMachine.ts`, `projectAddMachine.ts`, `brandIcons.ts`,
  and `localOriginReads.ts` intact because `e2e/configuration/` and
  `e2e/runtime/` still depend on them. In Node Vitest runtime specs, use
  native Node `fetch()` directly instead of Playwright's `request` fixture.
- For individual Node Vitest cases that legitimately run real `npm ci`,
  `vite build`, `codesign`/`iconutil`, or two dev servers (> 5 s Vitest
  default), pass an explicit timeout only on the individual `test(...)` call
  — never suite, file, group, or hook overrides, and never `test.slow()`.
- Execute in a checkout with a real `node_modules/` directory (`npm ci`),
  not a symlinked `node_modules`: `serverBundle.ts` writes
  `.dough-server-bundle-*` inside `node_modules/`, and a symlink causes
  `runnerCommand` (`ps`) to report the realpath target rather than the
  worktree path in `boundary-server.spec.ts` and `serving-modes.spec.ts`.
- Follow the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Run long macOS local-gate checks from a fully awake machine on AC power
  under `caffeinate -s -i`.

## Decisive premises

Observed in the owned preparation checkout at `43b6506e7` on 27 November
2026 with Node 24.21.0, one worker, and macOS on AC under
`caffeinate -s -i` (host load average ~11).

| Premise | Consuming operation and result |
| --- | --- |
| The maintained selector reaches all 22 legacy Playwright specs (64 cases) plus the existing Vitest spec | `npm run test:dashboard:backend -- --list '(configuration/\|runtime/(boundary-server\|dev-server-cache-ownership\|production-deployment\|production-qualification\|production-update-selection\|production-watcher-preview\|production-watcher-refusals\|production-watcher-setup-lifetime\|serving-modes)\.spec\.ts$)'` listed 64 `[chromium]` cases (39 in `configuration/` across 13 specs, 25 in `runtime/` across 9 specs) plus 3 `[node]` entries in `configuration/project-input.spec.ts`. |
| All 39 configuration Playwright cases pass at baseline | `caffeinate -s -i npm run test:dashboard:backend -- 'configuration/.*\.spec\.ts$' --workers=1 --reporter=list` passed all 39 Chromium cases in 27.3 s (plus 5 Node cases in `project-input.spec.ts` in 285 ms). Child-server boundary specs took 541 ms–3.8 s per case; in-process `project-configuration-mount-lifetime.spec.ts` took 4 ms and 30 ms. |
| Product-facing runtime specs pass at baseline except for symlinked-`node_modules` realpath divergence | The 9-spec runtime selection ran all 25 Chromium cases in 57.4 s: 18 passed (including `production-deployment`, `production-qualification`, `production-update-selection`, `production-watcher-preview`, `production-watcher-refusals`, `production-watcher-setup-lifetime`, `dev-server-cache-ownership`, and `boundary-server` case 2). `boundary-server` case 1 and `serving-modes` case 1 failed only because the preparation checkout used a symlinked `node_modules`, causing `runnerMain.mjs` to resolve to the integration checkout's realpath. Execution uses a real `node_modules/` directory (`npm ci`). |
| `backendGlobalSetup.ts` works as Vitest's `globalSetup` with minimal overhead | Scratch-adding `globalSetup: ["./test-support/support/backendGlobalSetup.ts"]` to `dashboard/backend.vitest.config.mts` and running `npm run test:dashboard:backend -- 'configuration/project-input.spec.ts' --workers=1` passed all 5 Node cases in 319 ms (vs 285 ms without `globalSetup`) and tore down cleanly. Reverted before committing. |
| Relocating `production-watcher-setup-lifetime.spec.ts` to `e2e/runtime/` is automatically selected by E2E and CI | `npm run test:e2e -- --list --reporter=list 'runtime/'` listed all 4 existing specs under `e2e/runtime/`, classifying `production-watcher*.spec.ts` into `[chromium-deployments]` (`dashboard/test-support/support/testFiles.mjs` line 161), and `.github/workflows/ci.yml` line 190 assigns `e2e/runtime/**` to E2E shard 3. |

## Outside-in proof map

| Legacy spec (cases) | Target owner | Owning slice |
| --- | --- | --- |
| `runtime/production-watcher-setup-lifetime.spec.ts` (1) | `e2e/runtime/production-watcher-setup-lifetime.spec.ts` (Playwright E2E) | Slice 1 |
| `configuration/machine-json-reuse.spec.ts` (6), `machine-json-revision.spec.ts` (1), `notifier-setup.spec.ts` (5), `project-add-validation.spec.ts` (10) | Same paths on Node Vitest | Slice 2 |
| `configuration/feedback-maintenance-boundary.spec.ts` (1), `openai-configuration-boundary.spec.ts` (1), `openai-configuration-size.spec.ts` (1), `terminal-theme-boundary.spec.ts` (1) | Same paths on Node Vitest (`startInProcessBoundaryHttp`) | Slice 3 |
| `configuration/project-configuration-mount-lifetime.spec.ts` (2), `project-configuration-boundary.spec.ts` (1), `project-remove-boundary.spec.ts` (1), `project-add-boundary.spec.ts` (6), `authenticated-read-agent-settings.spec.ts` (3) | Same paths on Node Vitest (`startInProcessBoundaryHttp` / direct typed reads) | Slice 4 |
| `runtime/production-qualification.spec.ts` (4), `production-update-selection.spec.ts` (3) | Same paths on Node Vitest | Slice 5 |
| `runtime/production-deployment.spec.ts` (4), `production-watcher-preview.spec.ts` (1), `production-watcher-refusals.spec.ts` (3) | Same paths on Node Vitest | Slice 6 |
| `runtime/boundary-server.spec.ts` (2), `dev-server-cache-ownership.spec.ts` (1), `serving-modes.spec.ts` (6) | Same paths on Node Vitest | Slice 7 |

## Ordered slices

### 1. Wire on-demand run artifacts into Node Vitest and relocate the browser watcher-setup spec

Type: Structure
Status: done
Estimate: 10–15 active minutes.

Internal change: add `globalSetup: ["./test-support/support/backendGlobalSetup.ts"]`
to `dashboard/backend.vitest.config.mts` so Node Vitest specs share the same
on-demand run artifacts (`server-bundle`, `app`, `published-application-source`)
and stray-process guard as backend Playwright. Move
`dashboard/backend-tests/runtime/production-watcher-setup-lifetime.spec.ts`
to `e2e/runtime/production-watcher-setup-lifetime.spec.ts` and adjust its
relative imports so its real-browser `ProductionWatcherMachine` check lives
with its consumer in `e2e/runtime/`.

Enables slices 5–7 (runtime deployment, watcher, and serving specs on Node
Vitest).

Proof:
- `npm run test:dashboard:backend -- 'configuration/project-input.spec.ts' --workers=1`
  passes 5 Node cases with clean `globalSetup` teardown.
- `caffeinate -s -i npm run test:e2e -- 'runtime/production-watcher-setup-lifetime.spec.ts' --workers=1 --reporter=list`
  passes 1 `[chromium-deployments]` case.
- `npm run typecheck:dashboard` passes.

Accepted: all three passed at `8b7f3c215` plus the slice diff (5 Node cases;
1 `[chromium-deployments]` case in 2.4 s; typecheck, which also covers `e2e/`).
Learning: Vitest resolves `globalSetup` from the repository root, so the
config anchors it as `${import.meta.dirname}/test-support/...`; anchor any
later path added to that config the same way.

### 2. Prove machine JSON storage, notifier setup, and project addition validation in Node Vitest

Type: Behavior
Status: done
Estimate: 15–20 active minutes.

Behavior: given a private machine home and real Git or synthetic notifier
fixtures, machine JSON reads parse once while unchanged and invalidate on
cross-process rename or unsettled mtime, `machineDocumentsRevision` advances
on writes and renames, `setup-notifier:dashboard` refuses missing/older
helpers and builds/signs/diagnoses/tests the branded macOS app, and
`addProject` refuses invalid URLs, missing/nested/mismatched checkouts,
unreachable/branchless origins, and duplicates while serializing concurrent
additions to one saved entry — all directly in Node Vitest.

Proof: Convert `machine-json-reuse.spec.ts` (6), `machine-json-revision.spec.ts`
(1), `notifier-setup.spec.ts` (5; macOS cases guarded with `describe.runIf(macOS)`),
and `project-add-validation.spec.ts` (10) to plain Vitest. Run:
`caffeinate -s -i npm run test:dashboard:backend -- 'configuration/(machine-json-reuse|machine-json-revision|notifier-setup|project-add-validation)\.spec\.ts$' --workers=1 --reporter=list`
(22 Node cases, 0 Chromium cases) and `npm run typecheck:dashboard`.

Accepted: 22 Node cases passed in 14.5 s on macOS (all three macOS notifier
cases ran) and typecheck passed. Only imports and hooks changed; Vitest's
in-file order replaces Playwright's serial mode.

### 3. Prove local settings boundaries in-process on Node Vitest

Type: Behavior
Status: done
Estimate: 15–20 active minutes.

Behavior: given `installFeedbackMaintenanceMiddleware`,
`installOpenAIConfigurationMiddleware`, and `installTerminalThemeMiddleware`
mounted via `startInProcessBoundaryHttp` against a private `HOME`, foreign
origins, wrong Host headers, cross-site requests, wrong methods, wrong
content types, malformed JSON, unknown choices, and oversized payloads are
refused without modifying saved files, leaking secrets, or making external
network requests; valid saves, exact 32 KiB ASCII/UTF-8 credentials, reads
with `Cache-Control: no-store`, and removals update the machine file.

Proof: Convert `feedback-maintenance-boundary.spec.ts` (1),
`openai-configuration-boundary.spec.ts` (1), `openai-configuration-size.spec.ts`
(1), and `terminal-theme-boundary.spec.ts` (1) to plain Vitest using
`startInProcessBoundaryHttp` and `rawRequest`. Run:
`caffeinate -s -i npm run test:dashboard:backend -- 'configuration/(feedback-maintenance-boundary|openai-configuration-boundary|openai-configuration-size|terminal-theme-boundary)\.spec\.ts$' --workers=1 --reporter=list`
(4 Node cases, 0 Chromium cases) and `npm run typecheck:dashboard`.

Accepted after the refactor pass: 4 Node cases passed in-process (about 3 s)
and typecheck passed. Child-server-only checks became in-process recorders in
`dashboard/backend-tests/support/privateSettingsMachine.ts` (fetch egress,
recording `gh`/`claude` on PATH, console output), each shown to fire by a
scratch check. Specs read production's file-path functions. Slice 4 can reuse
`privateSettingsMachine()`. Node Vitest specs must not import page modules
that pull in `@playwright/test`.

### 4. Prove project configuration boundaries and published agent settings read in Node Vitest

Type: Behavior
Status: done
Estimate: 20–25 active minutes.

Behavior: given `installProjectConfigurationMiddleware` mounted via
`startInProcessBoundaryHttp` with private `HOME`, development/production
mount lifetime refuses concurrent environments and reads seeded projects
after close; list, remove, and add enforce same-origin, method, content-type,
and field validation while omitting `localPath`; pending Git add transports
abort cleanly on client disconnect, boundary deadline, server shutdown, and
unfinished request bodies without writing configuration; and pinned agent
profile reads return published `.planning/open-dough.json` text (or `null`
when absent/unreadable) while client-supplied paths to it are refused with
404.

Proof: Convert `project-configuration-mount-lifetime.spec.ts` (2),
`project-configuration-boundary.spec.ts` (1), `project-remove-boundary.spec.ts`
(1), `project-add-boundary.spec.ts` (6), and
`authenticated-read-agent-settings.spec.ts` (3) to plain Vitest. Run:
`caffeinate -s -i npm run test:dashboard:backend -- 'configuration/.*\.spec\.ts$' --workers=1 --reporter=list`
(44 Node cases, 0 Chromium cases) and `npm run typecheck:dashboard`.

Accepted: 44 Node cases across `configuration/` passed and typecheck passed;
the 8 E2E specs using `projectAddMachine` passed after `serveOn` was exposed.
The remove case joined `project-configuration-boundary.spec.ts` to share its
setup. Server shutdown is proved through the boundary's close hook, the
product path that ends pending transports; signal-to-close wiring stays with
slice 7's serving specs. Agent settings read through the in-process
authenticated-read boundary, since the 404 is an HTTP contract.

### 5. Prove production qualification and update selection in Node Vitest

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Behavior: given real published Git trees and CI workflow push exclusions,
`qualifyPublishedRange` spans deletions, renames, and the selected commit's
policy while removing inspection checkouts without racing Git maintenance,
and `publishedUpdates` keeps the last activated baseline across excluded
ranges, rejected policies, and unactivated candidates until activation
succeeds.

Proof: Convert `production-qualification.spec.ts` (4) and
`production-update-selection.spec.ts` (3) to plain Vitest. Run:
`caffeinate -s -i npm run test:dashboard:backend -- 'runtime/(production-qualification|production-update-selection)\.spec\.ts$' --workers=1 --reporter=list`
(7 Node cases, 0 Chromium cases) and `npm run typecheck:dashboard`.

Accepted: 7 Node cases passed in 7.0 s and typecheck passed; the consumer
E2E `runtime/production-watcher-updates.spec.ts` passed 10 cases. The shared
`productionQualificationFixture.ts` now guards with plain throws instead of
Playwright `expect`, so both runners can use it.

### 6. Prove production deployment, preview lifecycle, and watcher refusals in Node Vitest

Type: Behavior
Status: done
Estimate: 20–25 active minutes.

Behavior: given real published main fixtures, `resolvePublishedMain` and
`verifyPublishedCommit` select and verify `origin/main`, `stageDeployment`
and `startDeploymentPreview` build and serve a pinned commit in isolation
with avatars, brand icons, own-origin reads, and clean process lifecycle
(and clean up on cancellation), `startProductionPreview` reports both causes
when candidate replacement and restoration fail with neither preview running,
and `watch:dashboard` refuses invalid options, unpublished `main`, or an
occupied port and retires its live watcher and detached Cursor runner on
shutdown.

Proof: Convert `production-deployment.spec.ts` (4, calling
`stagePinnedDeployment()` directly and using native Node `fetch()`),
`production-watcher-preview.spec.ts` (1, using native Node `fetch()`), and
`production-watcher-refusals.spec.ts` (3, replacing Playwright's fixture
extension with local `afterEach` cleanup and native Node `fetch()`) to plain
Vitest, with per-test timeout overrides only on individual cases exceeding
Vitest's 5 s default. Run:
`caffeinate -s -i npm run test:dashboard:backend -- 'runtime/(production-deployment|production-watcher-preview|production-watcher-refusals)\.spec\.ts$' --workers=1 --reporter=list`
(8 Node cases, 0 Chromium cases) and `npm run typecheck:dashboard`.

Accepted: 8 Node cases passed three times (33 s) and typecheck passed; the
E2E `runtime/production-watcher*` consumers passed 26 cases. The unused
`pinnedDeployment` worker fixture is removed; `productionDeployments` moved
to `machineRecordNames.ts`. Carried to slice 7: `production-deployment.spec.ts`
copies the brand-icon and own-origin checks because `brandIcons.ts` and
`localOriginReads.ts` take Playwright's request context; make those checks
usable from both runners and remove the copy. The refusals spec's `afterEach`
registry cleans a late resource with the next case rather than refusing it.

### 7. Prove boundary server, dev cache ownership, and serving modes in Node Vitest and remove dead support

Type: Behavior
Status: done
Estimate: 20–25 active minutes.

Behavior: given real bundled `boundaryServer`, `dev`, and `preview` servers,
each environment serves its own project configuration file, two `dev` servers
keep isolated optimized Shiki module caches, and `dev` and `preview` mount
identical launch, authenticated-read, project-configuration, terminal-upgrade,
and icon-export boundaries with Vite HMR only in `dev`. Any test-support
helper left with zero callers after slices 1–7 is removed.

Proof: Convert `boundary-server.spec.ts` (2),
`dev-server-cache-ownership.spec.ts` (1, using native Node `fetch()`), and
`serving-modes.spec.ts` (6, using native Node `fetch()`) to plain Vitest.
Verify no remaining callers for any retired helper (check `pinnedDeployment`
in `publishedMainWorkerFixtures.ts`). Run the full integrated local gate
under `caffeinate -s -i`:
- `caffeinate -s -i npm run test:dashboard:backend -- '(configuration/|runtime/(boundary-server|dev-server-cache-ownership|production-deployment|production-qualification|production-update-selection|production-watcher-preview|production-watcher-refusals|serving-modes)\.spec\.ts$)' --workers=1 --reporter=list`
  (68 Node cases: 63 migrated + 5 existing in `project-input.spec.ts`; 0 Chromium cases; record comparable wall and summed case times against baseline)
- `caffeinate -s -i npm run test:e2e -- 'runtime/production-watcher-setup-lifetime.spec.ts' --workers=1 --reporter=list`
  (1 Chromium case)
- `npm run typecheck:dashboard`

Accepted after the refactor pass: the integrated gate passed 68 Node cases,
0 Chromium, in 44.5 s at load 11–17 and 81.2 s at load 14–22 (baseline
84.7 s for the two Playwright selections); the E2E setup-lifetime case and
the typecheck passed. `brandIcons.ts`, `localOriginReads.ts`,
`cursorRunnerJourney.ts` and `sharedReads.ts` now check with `node:assert`
and `fetch`, so both runners share them and the slice 6 copy is gone.
`serving-modes.spec.ts` starts its servers once inside the first test that
needs them, bounded by each test's own timeout. Cases a loaded machine pushes
past 5 s carry individual timeouts. Learnings: Vitest's `expect.poll` waits
1 s by default, not 5 s, and a hook timeout cannot be overridden here. No
helper this story touched is left without callers. Of the E2E consumers,
four Cursor-session cases (`agent-session-cursor-unavailable`,
`cursor-session-recovery-stops`) failed at load ~20. A clean `53a1e7ab6`
failed the same way, so the cause predates this slice; the repair is owed
under [diagnosis-cursor-taken-session-entry.md](diagnosis-cursor-taken-session-entry.md).
Repaired: `openTakenCursorSession` now waits through the existing
`startedSession` step for local startup to clear, bounded by the shared
launch wait, before counting the Taken entry. At load 17–20 the two failing
files passed 4/4 and all 28 Cursor session cases passed.
CI repair (run 45933156384, Distribution Tests 3/3):
`dashboard-concurrent-runs.sh` required a passing run to print nothing, which
held only for Playwright's silent reporter. It now requires empty standard
error, zero exits, and each run's proof record passing the sampled case
alone, keeping its build-isolation, `dist` and cleanup checks. It failed
locally before the change and passed after.

## Concern evidence

- Slice-plan refinement: not needed; the 7 slices stay within the 8-slice
  limit, separate the `globalSetup` and browser-spec relocation prerequisite
  cleanly from the six cohesive behavioral families, preserve every legacy
  assertion without adding test-support wrappers, and settle all decisive
  premises from direct observation.
- Remaining slice-specific concerns: none.

## Execution complete

Product advice: no change to this story's outcome; all 22 specs (64 cases)
left backend Playwright, and the integrated gate ran 68 Node cases in
44–81 s against the 84.7 s baseline. Carry four conversion learnings into
[runner cutover](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner):
- Vitest's `expect.poll` waits 1 s by default, not 5 s.
- Hook timeouts cannot be overridden here, so expensive shared servers start
  lazily inside each test.
- Shared support must assert with `node:assert`, not Playwright `expect`.
- `dashboard-concurrent-runs.sh` now judges its Vitest sample by proof record
  and standard error.
