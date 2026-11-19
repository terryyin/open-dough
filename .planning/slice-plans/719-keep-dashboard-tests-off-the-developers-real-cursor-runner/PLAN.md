# Keep dashboard tests off the developer's real Cursor runner

**Identity:** SEED-412#keep-dashboard-tests-off-the-developers-real-cursor-runner
**Source:** [Keep dashboard tests off the developer's real Cursor runner](../../seeds/SEED-412-keep-dashboard-tests-off-the-developers-real-cursor-runner.md#keep-dashboard-tests-off-the-developers-real-cursor-runner)

## Goal and scope

Every Dashboard Backend, Dashboard Frontend and E2E run starts its processes
with a test-owned home. A canary Cursor runner address in that home fails the
run on any contact. A network guard refuses TCP connections to anything other
than the run's own listeners. The comparison renderer stops mounting the
dashboard's local boundaries. The seed owns the key examples and scope
limits: production home resolution is unchanged, the live or mounted choice
stays with SEED-408, and non-Node processes and Unix-domain sockets are not
intercepted by the guard.

## Approach and reuse

- **Existing solutions.** `startDashboardServer`
  ([`dashboardServer.ts`](../../../dashboard/test-support/support/dashboardServer.ts))
  already gives each dashboard server a test-owned home. The runner stand-in
  ([`cursorRunnerStandIn.ts`](../../../dashboard/test-support/support/cursorRunnerStandIn.ts))
  already writes an address file and records unexpected Cursor protocol
  work. The canary reuses that recording and address-writing shape for the
  run's default home instead of adding a second protocol imitation. Specs
  that set and restore `process.env.HOME` keep doing so; the run default
  only replaces the real home underneath them.
- **One run-isolation module.** A new
  `dashboard/test-support/support/testRunIsolation.ts` is imported first by
  each Playwright run config (`dashboard/backend.playwright.config.ts`,
  `dashboard/frontend.playwright.config.ts`, `e2e/playwright.config.ts`)
  and by `scripts/test-frontend.mjs` before it creates the Vitest mounted
  run. The Vitest config itself is bundled by Vite's config loader, so it is
  not the place for this start. It runs once in the main process before
  global setup:
  1. records the real Playwright browser cache in
     `PLAYWRIGHT_BROWSERS_PATH` when unset;
  2. creates a run home under `tmpdir()` and sets `HOME` to it;
  3. starts the canary runner listener and writes its address into that home;
  4. installs the network guard in the main process and adds its
     `--import` preload to `NODE_OPTIONS`, so workers and the Node servers
     they spawn inherit it.
  Global teardown reads the canary and guard records and fails the run with
  each request or destination, the process and the test.
- **Listener register.** The preload records each port a run process
  listens on in a run-scoped register directory named by an environment
  variable. A TCP connect to a port not in the register, or to a
  non-loopback host, throws, naming the destination and the current test.
  Workers publish the current test title to the preload through a fixture
  in the shared `pageTest.ts` base; spawned servers carry the title of the
  test that started them in their environment.
- **Browser pages.** The existing context hook `noteRequestsInEveryPage`
  ([`pageRequestNotes.ts`](../../../dashboard/test-support/pageRequestNotes.ts))
  is where every test page's requests already pass. Add the same rule there:
  a request to a host and port outside the register is aborted and recorded.
- **Comparison renderer.** `createComparisonRenderer`
  ([`comparisonRendering.ts`](../../../dashboard/test-support/support/comparisonRendering.ts))
  creates its Vite server with `configFile: false` and only the React
  plugin and the dashboard root it needs to compile the comparison markup.

ADR 0008 places machine-local operational state under the machine's home;
production defaults stay as they are, so no Accepted decision conflicts. No
North Star topic is needed.

`pageTest.ts` (205 lines) and `pageRequestNotes.ts` (200 lines) gain small
additions. If either would pass 250 lines, the new part moves into
`testRunIsolation.ts` or its own page-request guard module.

## Decisive premises

Observed on 2026-11-19 at `a35acb326`, Node 24.21.0, in this worktree, with
scratch edits reverted afterwards. The scratch preload logged each `listen` and
TCP `connect` with its process; the scratch canary was a logging listener named
in the scratch home's `cursor-runner.json`.

| Operation | Observed result and remaining question |
| --- | --- |
| Comparison renderer reaches the runner of the worker's home | `HOME=<scratch home> npx playwright test -c backend.playwright.config.ts backend-tests/runtime/comparison-renderer-vite-cache.spec.ts`, with a logging listener named in the scratch home's `cursor-runner.json`: two `POST /release-handoffs`. Today that home is the real one. |
| `HOME` set at the top of the run config reaches workers and their in-process boundaries, and browsers still launch | Scratch edit at the top of `backend.playwright.config.ts` set `PLAYWRIGHT_BROWSERS_PATH` from the real home, then `HOME` to a scratch home. `comparison-renderer-vite-cache.spec.ts` and `observation/private-http-stand-in-runner.spec.ts` passed (exit 0). The canary recorded two `POST /release-handoffs`, and the scratch home gained `incidents/` and `projects-development.json`. |
| A `NODE_OPTIONS --import` preload added in the run config reaches workers and spawned dashboard servers | Same scratch run with a connect/listen logging preload: entries from `workerProcessEntry.js` and the spawned `boundaryServer.mjs` bundle. |
| Run processes connect only to run-owned listeners | Same run: every TCP connect went to a port a preloaded process listened on, except the canary port and one port both workers reached that no preloaded process listened on. That port is opened in the Playwright main process during global setup, before the config's `NODE_OPTIONS` change applies. So the main process must install the guard directly, as the approach says. Two Unix-domain sockets under `tmpdir()` were also reached; the guard leaves those alone. |
| Whole Dashboard Backend Test under the scratch run home | Same scratch config and preload, `npx playwright test -c backend.playwright.config.ts` from `dashboard/`: the canary recorded only the comparison renderer's two `POST /release-handoffs`. The only TCP destination outside the run's listeners was the canary port. The 73 `usage-history` failures came from running in `dashboard/` (their CLIs resolve `dashboard/server/...` from the repository root). Rerun from the root with `npx playwright test -c dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history` and a live canary: 0 failures, no canary contact, no outside destination. So slices 2 and 3 have no backend leak beyond slice 1's. |
| Whole Dashboard Frontend Playwright and E2E runs under scratch run homes | Same scratch edit in `dashboard/frontend.playwright.config.ts` and `e2e/playwright.config.ts`, run from the root with `caffeinate -s -i`: both exited 0 with no failures. Frontend: only the comparison renderer's two `POST /release-handoffs`, and the canary was the only outside destination. E2E: no canary contact and no outside destination. |
| Vitest mounted run under a scratch run home | `HOME=<scratch home> NODE_OPTIONS='--import <preload>' npx vitest run --configLoader runner --config dashboard/frontend.vitest.config.mts` (the loader `frontendMounted.mjs` uses): 9 files, 23 tests passed, no canary contact. The only outside destination was `npx` itself reaching `registry.npmjs.org:443`; `scripts/test-frontend.mjs` runs under `node`, so it is not part of the run. Without `--configLoader runner`, Vite's bundled config loader fails on a server module's top-level `await`, with or without the scratch edit. |

## Ordered slices

### 1. The comparison renderer compiles without the dashboard's boundaries

Type: Behavior
Status: planned
Proof: a new spec beside
`backend-tests/runtime/comparison-renderer-vite-cache.spec.ts` sets the
worker's `HOME` to a temporary home whose runner address names a listener
that records every request. A renderer starts and closes. The listener
records nothing, and the home gains no `.open-dough/dashboard` files other
than the address. The runner stand-in in `cursorRunnerStandIn.ts` is not
enough here, because it accepts `POST /release-handoffs` without recording
it. With today's renderer the spec fails on two `POST /release-handoffs`,
as the premise run showed. Frontend specs that use the `comparisonRenderer`
fixture still pass.

Behavior: seed examples 1 and 2 for the observed path. A comparison
renderer starts and closes under a home with a runner address; the runner
receives nothing and no runner starts.

### 2. Dashboard Backend Test runs in a test-owned home with a canary runner

Type: Behavior
Status: planned
Proof: a new `backend-tests/runtime/test-run-isolation.spec.ts` shows that
`homedir()` in the worker is the run home, not the home the run started
with, and that a `readCursorRunnerSessions()` call with no home is recorded
by the canary as `GET /sessions` with that spec's title. The teardown report
is tested directly through its formatting function. Then a whole Dashboard
Backend Test run ends with zero canary contacts.

Behavior: seed examples 3 and 6, and the backend half of example 7. Any
canary contact, including one during global setup or fixture teardown,
fails the run naming the request, the process and the test. Specs that set
their own `HOME` keep it. Leaks the whole run finds are fixed at their
start, not by per-spec opt-outs.

### 3. A network guard refuses connections outside the run's listeners

Type: Behavior
Status: planned
Proof: `test-run-isolation.spec.ts` adds: a worker connect to a loopback
port that no run process listens on is refused with an error naming
`127.0.0.1:<port>` and the spec; a fake GitHub started by the spec and a
dashboard server reading it work as today; a test page fetching an
unregistered loopback port is aborted and recorded. Then a whole Dashboard
Backend Test run ends with zero refusals.

Behavior: seed examples 4 and 5, for the backend run.

### 4. Frontend and E2E runs share the same isolation

Type: Behavior
Status: planned
Proof: whole Dashboard Frontend Test (`npm run test:dashboard:frontend`,
Playwright and Vitest mounted) and whole E2E (`npm run test:e2e`) runs end
with zero canary contacts and zero guard refusals. One frontend spec and one
E2E spec read `homedir()` in the worker and see their run home.

Behavior: the rest of seed example 7. `frontend.playwright.config.ts`,
`e2e/playwright.config.ts` and `scripts/test-frontend.mjs` (for the Vitest
mounted run) start the run-isolation module. `Distribution/tests/README.md` or the dashboard
test documentation names the run home, the canary and the guard where test
infrastructure is described.

## Proof and local gates

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default test timeouts and never use `test.slow()`. Apply
[`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and
[`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md)
to new specs.

- **Focused specs:** `bash scripts/test.sh <paths>`, with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
- **Whole runs:** slices 2 and 3 run the whole Dashboard Backend Test, and
  slice 4 the whole frontend and E2E runs, because this change alters the
  start of every process in those runs. Use Homebrew bash 5 and run on awake
  macOS on AC with `caffeinate -s -i`; on battery, follow the
  [open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- **Lint and typecheck:** `npm run lint` and `npm run typecheck:dashboard`.

## Current decisions

- The guard covers TCP connections from Node processes and requests from
  test pages. Unix-domain sockets and non-Node processes rely on the
  test-owned home (seed scope limits).
- A listener belongs to the run when a run process opened it. Fixtures add
  no declaration step.
- The main process installs the guard itself from the run config, so global
  setup's listeners are registered.

## Plan review

Refinement was not needed: each slice has one outcome and one proof loop,
and slices 2–4 extend one rule (run home, canary, register) to more runs
rather than adding recognizers. The whole-run observations above found only
the comparison renderer's leak, which slice 1 removes, so slices 2–4 carry
no unknown leak work. This review found no remaining slice-specific
concern.
