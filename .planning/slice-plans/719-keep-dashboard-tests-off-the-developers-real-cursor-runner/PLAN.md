# Keep dashboard tests off the developer's real Cursor runner

**Identity:** SEED-412#keep-dashboard-tests-off-the-developers-real-cursor-runner
**Source:** [Keep dashboard tests off the developer's real Cursor runner](../../seeds/SEED-412-keep-dashboard-tests-off-the-developers-real-cursor-runner.md#keep-dashboard-tests-off-the-developers-real-cursor-runner)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Developers can run Dashboard Backend Test, Dashboard Frontend Test
(Playwright and Vitest mounted), and E2E beside their live Dashboard and
Cursor. Every test process inherits a disposable default home. The default
Cursor canary and refused connections fail the run, even when a test has
passed or the caller handled the error. The seed defines coverage for Node
TCP, browser requests, explicit fixture homes, and native helpers. Which
backend checks run live or mounted stays unchanged.

## Approach and reuse

- Start the default home and isolation for Playwright in
  [prepareFocusedRun](../../../dashboard/test-support/support/runnerConfig.mjs),
  before global setup. Install Node hooks immediately in that process and
  preload them in workers and their Node children. Resolve Playwright's
  browser cache before changing `HOME` and preserve explicit fixture homes.
  A worker reloading the config joins its existing run.
- Let the shared [run lifecycle](../../../dashboard/test-support/support/runLifecycle.ts)
  own the Playwright verdict and resource cleanup. Its current GitHub
  request-owner check is the precedent for a leak affecting the entire run.
  Check the isolation record after fixtures, artifacts, browsers and child
  processes have settled. Preserve cleanup and all diagnosed causes when
  another run failure is present. Cover config and setup failure and the
  `--list` path, which bypasses global setup.
- Use the existing production
  [address writer](../../../dashboard/server/hosts/cursor/runnerPaths.ts)
  in test support for the default home's canary. The
  [runner stand-in](../../../dashboard/test-support/support/cursorRunnerStandIn.ts)
  serves protocol tests, including permitted release calls. The canary
  counts every request, including those calls, before replying. Record its
  method and path and associate the caller with the process and case or
  phase. Run the test's own server fixture with its
  [private home](../../../dashboard/test-support/support/dashboardServer.ts)
  as today.
- Give Node and the browser proxy one run-scoped rule for live TCP
  destinations. Register the bound address and port before listen callers
  can connect, and remove the registration when the listener closes or its
  process ends. Validate the actual loopback endpoint, including address
  family and localhost resolution. A different local bind address, a
  closed listener, or another run cannot grant access by port alone.
- Set the browser proxy at Chromium launch through the shared runner
  options. Fresh contexts and popups inherit it. Disable Chromium's
  implicit loopback bypass. Authorize each HTTP request or CONNECT target
  before forwarding. Both adapters use the same listener rule and
  violation record. `noteRequestsInEveryPage` observes fetch timing by
  init script and remains a timing observer. The
  [completion fault proxy](../../../dashboard/test-support/support/completionRecovery.ts)
  is tied to a fixed receiver and its fault sequence. It is a forwarding
  reference, while the run needs its own destination policy and lifecycle.
- Start the mounted Node side before
  [prepareMounted](../../../dashboard/test-support/support/frontendMounted.mjs)
  imports Vitest or discovers tests. Its final check follows provider close.
  Keep ownership explicit when the frontend coordinator launches retained
  Playwright alongside the mounted path. A run ends only the resources it
  owns. Leave browser task attribution in the runner integration and reuse
  the Node-side lookup and recorder.
- Start the comparison renderer with `configFile: false`, the dashboard
  root and the compilation plugins the fixture needs. Keep the private Vite
  optimizer cache, rendered markup, and production CSS reading.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
places operational state on the dashboard machine. Isolation belongs to test
entry points and leaves production resolution intact. The responsibility fits
the existing runner lifecycle and needs no North Star topic.

`scripts/test-frontend.mjs` is already 253 lines. Keep the mounted lifecycle
in the mounted support path. If its coordinator needs an edit, extract its
retained Playwright spawn and title selection together in slice 6. Preserve
retained-only selection, mixed run and list behavior, interruption forwarding,
and proof and timing records through the same frontend command.

## Decisive premises

Retained preparation observations on 2026-11-19 at `a35acb326` used Node
24.21.0, an isolated home, a logging Cursor listener, and, where noted,
a preload logging listen and connect operations. Current runner entry points
were reviewed at `120b60826`. The fresh browser observations below used that
checkout, Node 24.21.0, Playwright 1.65.0 and Chromium 158.0.8127.18.

| Consuming operation | Observed result and limit |
| --- | --- |
| Comparison renderer starts and closes in a home with a runner address | Running the backend cache spec with a scratch `HOME` at `a35acb326` sent two `POST /release-handoffs` and created `incidents/` and `projects-development.json` under that home. The renderer and Vite config are unchanged on this path at `120b60826`. |
| Playwright config changes the run home and propagates a preload | The earlier scratch config captured the browser cache, set `HOME` and appended `NODE_OPTIONS=--import …`. The comparison cache and private HTTP stand-in specs passed, the canary saw the two release calls, and the preload logged both `workerProcessEntry.js` and `boundaryServer.mjs`. The main process opened a setup listener absent from the worker preload's record, so it needs a direct install. The shared runner now configures all three groups through `prepareFocusedRun`. |
| Broad discovery of paths that use the default home and local TCP | The previous instrumented backend run from `dashboard/` observed only the renderer's canary requests and no other outside TCP destination. It had 73 usage-history failures from that working directory. The same usage-history group passed from the repository root with zero canary or outside contacts. Full frontend Playwright and E2E runs from the root exited zero. Only frontend's renderer contacted the canary. These observations detect existing paths and leave enforcing verdicts to the slices. |
| Node clients pass the TCP hook before dialing | A scratch `node node-paths.mjs` spawned Node with `NODE_OPTIONS=--import <scratch-refuse.mjs>`. An override of `Socket.prototype.connect` refused `net.connect`, `node:http` and `fetch` aimed at a disposable outside listener, which counted zero TCP connections. `fetch` exposed the refusal as its cause. Slice 3 owns the destination rule and the run verdict. |
| Chromium reaches the guard for additional contexts and redirects | A scratch `node browser.mjs` launched Chromium with `--proxy-server=http://127.0.0.1:<proxy-port>` and `--proxy-bypass-list=<-loopback>`. In a fresh `browser.newPage()`, an owned HTTP listener answered. Direct HTTP, an HTTP redirect and a WebSocket handshake to an unrelated loopback HTTP listener were denied by the proxy. The outside listener counted zero requests or upgrades. |
| The mounted provider can boot and run through the same browser transport | With a scratch `HOME`, browser cache path, and those Chromium arguments added to the shared browser options, `node --import <scratch-mounted-proxy.mjs> scripts/test-frontend.mjs dashboard/frontend-tests/test-harness/mounted-dashboard.mounted.spec.ts` passed five cases. The proxy forwarded 723 HTTP requests and four CONNECT tunnels to listeners registered by the Node side, with zero refusals. This exercised the actual `configLoader: "runner"` entry and Vite's browser channel. Slice 7 proves mounted case attribution and refusal in the final lifecycle. |

## Ordered slices

### 1. The comparison renderer compiles without the dashboard's boundaries

Type: Behavior
Status: done

Behavior: Rendering starts and closes in a scratch home with a runner address.
It compiles normal comparison markup and leaves the runner and that home alone.

Proof: Extend the existing renderer cache proof or add a neighboring focused
journey. Keep a recording listener in the scratch home's address file, assert
zero requests on close and no generated machine-local state beyond the address.
The baseline above shows the existing renderer violates both checks. Exercise
comparison markup and tree rendering in the affected frontend fixtures and
keep the cache cleanup assertion.

Accepted proof: `comparison-renderer-vite-cache.spec.ts` "a comparison
renderer leaves the runner and the machine home alone" failed with
`POST /release-handoffs` before the fix and passes with the renderer on
`configFile: false` and the React plugin. The 15 comparison frontend specs
(84 cases) pass through `pageTest.ts`.

### 2. The backend run owns its default home and canary verdict

Type: Behavior
Status: planned

Behavior: The backend main process, workers and children use the run home
unless their fixture chooses its own. The canary counts every request and the
run owner reports it after cleanup, including traffic during setup or teardown.

Proof: Use a disposable runner harness outside the tested run, with
[distribution runner tests](../../../Distribution/tests/test-runner/) as the
pattern for launching the real command and asserting its status and output.
Prove that a worker and child see the run's home, a fixture keeps its chosen
home, and a no-home `readCursorRunnerSessions()` call yields a failing
command with `GET /sessions`, worker PID and case title. Exercise a late
fixture or global teardown request in a separate invocation and observe the
nonzero exit, phase or case attribution, and removal of the run resources.
Then run the whole backend suite with zero canary contacts. Playwright
browser enforcement arrives in slice 4.

### 3. The backend run refuses Node TCP outside its live listeners

Type: Behavior
Status: planned

Behavior: The main process, workers and Node descendants allow the run's own
live TCP listeners. A refusal survives a caught client error and fails the
command. Concurrent runs own independent listeners and evidence.

Proof: A fake GitHub and its dashboard client still communicate, and a worker
can reach a main-process setup listener. Launch a scratch outside listener
from the harness. Attempt a worker request and a Node-child connection to it,
assert zero hits and a failed run with endpoint and caller details. Cover a
closed listener whose port is reused and two overlapping runs. Run the whole
backend suite with zero refusals. Browser enforcement arrives in slice 4.

### 4. Backend Chromium pages use the same network boundary

Type: Behavior
Status: planned

Behavior: Regular pages, fresh contexts and browser WebSockets reach owned
fixtures through the guard. Attempts to reach an unrelated service fail the
run even when the page handles the error.

Proof: Exercise an owned HTTP request and a terminal WebSocket exchange.
From a fresh browser context, try direct and redirected requests and a
WebSocket to a disposable listener outside the run. Assert zero hits,
nonzero run verdict and the destination and spec in the report. Exercise a
page route that forwards to preserve the existing request substitutions.
Run the whole backend suite with both records empty.

### 5. Frontend Playwright and E2E use the same run isolation

Type: Behavior
Status: planned

Behavior: Both Playwright groups start with the same home, canary, Node guard
and browser policy. The groups retain their own setup, selection and reports.

Proof: Observe the home in a retained frontend worker and an E2E worker.
Prove each entry surfaces a representative refusal, then run the whole
retained frontend Playwright suite and E2E with zero canary contacts and
refusals. Include one E2E production-mode fixture opening a fresh browser
page. Vitest mounted remains outside the guard until slices 6 and 7.

### 6. The mounted frontend run owns its Node isolation and verdict

Type: Behavior
Status: planned

Behavior: The mounted Node side has the same disposable home, canary and
TCP guard before Vitest is created. The owner checks after the provider
closes. A retained Playwright subprocess cannot remove the mounted owner's
resources during a mixed run.

Proof: From the ordinary frontend command, use a mounted browser command to
observe the Node-side home and verify a refused Node request fails the
command with its mounted case and destination. Exercise mounted-only and
mixed selection, list and cleanup. Browser enforcement for the mounted run
arrives in slice 7.

### 7. Mounted frontend pages use the network guard

Type: Behavior
Status: planned

Behavior: Vitest's real Chromium provider reaches the run's Vite server and
WebSocket. Mounted browser requests outside the run fail with their
destination and mounted spec. Use the provider's launch and session
boundaries to correlate browser violations, including parallel specs.

Proof: Run a mounted case through the normal frontend command that reaches
Vite and then attempts a connection to the harness's unrelated listener.
Observe zero outside hits and a failing run with the destination and the
responsible spec. Run the whole frontend command with retained Playwright and
Vitest mounted. Both records are empty, completing the whole-run proof
alongside the backend and E2E checks.

## Proof and local gates

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default timeouts and omit `test.slow()`. Apply
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and
[dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md) to
affected test sources.

- **Focused:** prefix `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`
  and run from the repository root. `bash scripts/test.sh` takes only shell
  and `node --test` files; backend specs use
  `npx playwright test --config dashboard/backend.playwright.config.ts <specs>`
  and frontend specs `node scripts/test-frontend.mjs <specs>`. Proof records
  use the group's `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` or
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`.
- **Whole runs:** use `npm run test:dashboard:backend`,
  `npm run test:dashboard:frontend`, and `npm run test:e2e` as mapped to
  the slices. The retained frontend group can be checked directly with
  `node node_modules/playwright/cli.js test -c dashboard/frontend.playwright.config.ts`.
  These checks cover distributed consumers of the common run setup.
  Use Homebrew bash 5 and run on awake macOS on AC with `caffeinate -s -i`.
  On battery, follow the
  [open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- **Lint and typecheck:** `npm run lint` and `npm run typecheck:dashboard`.

The log and hit counters in the failing-run proofs use disposable external
listeners to represent the real Dashboard or Cursor runner. No regression
command sends traffic to the developer's service.

## Plan review

Slice-plan refinement kept the renderer and backend home outcomes and split
Node admission, browser admission, and mounted lifecycle where each has a
different entry-point verdict. The same destination and reporting rules carry
through seven bounded slices. The unfinished coverage at each intermediate
step is named with its owning slice. The review found no remaining
slice-specific planning blocker.
