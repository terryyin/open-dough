---
id: SEED-412
status: active
planted: 2026-11-19
planted_during: Terry asked for a fix story at the top of the backlog after a whole Dashboard Backend Test run read the machine's real Cursor runner
trigger_when: selected from the backlog
scope: one story
---

# SEED-412 — Keep dashboard tests off the developer's real Cursor runner

<a id="keep-dashboard-tests-off-the-developers-real-cursor-runner"></a>

### Keep dashboard tests off the developer's real Cursor runner

**Identity:** SEED-412#keep-dashboard-tests-off-the-developers-real-cursor-runner
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/719-keep-dashboard-tests-off-the-developers-real-cursor-runner/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3060e4e7895187b74c894818033a9b5e6a7859bce48fb3930f7afc10273b3826","plan":"d42ace2be13d5e6016d4c4efc3d1aebecb768801a76881b011c05eeb2b11f543"}}
```

**Goal:** A developer can run dashboard tests (`test:e2e`,
`test:dashboard:frontend`, and `test:dashboard:backend`) on the same machine
where they use the Dashboard and Cursor without any test process reading or
writing the developer's real `HOME` (`~/.open-dough/dashboard/`, live Cursor
runner, credentials, or session records).

**Observed defect and delivered first slice (2026-11-19):**

- `createComparisonRenderer` (`dashboard/test-support/support/comparisonRendering.ts`)
  previously started `dashboard/vite.config.mts`, mounting dashboard server
  boundaries against the worker's inherited `HOME` and sending
  `POST /release-handoffs` and `GET /sessions` to the developer's live Cursor
  runner. Slice 1 (`7ce5da1c7`) moved `createComparisonRenderer` to
  `configFile: false` with the React plugin only and is already integrated on
  `main`.
- Test runner entry points (`runnerConfig.mjs` and
  `dashboard/frontend.vitest.config.mts`) still leave `process.env.HOME` set to
  the invoking shell's real home, so any test, worker, Vitest browser command,
  or child process calling `homedir()` without choosing a scratch home reaches
  the developer's real `~/.open-dough/dashboard/`. Because the Cursor runner
  binds an ephemeral port published only in `~/.open-dough/dashboard/cursor-runner.json`,
  giving each test run a disposable temporary `HOME` keeps tests completely off
  the real runner without network proxies or socket monkey-patches.

**Scope:**

- **Comparison renderer (delivered in `7ce5da1c7`):** Compiles comparison
  markup without mounting the dashboard's local boundaries.
- **Disposable default `HOME` per test run (remaining work):**
  - Every dashboard test run — Playwright (`backend`, `frontend`, and `e2e`
    through `runnerConfig.mjs`, including `--list`) and Vitest Browser Mode
    (`dashboard/frontend.vitest.config.mts`, both standalone and under
    `scripts/test-frontend.mjs`) — resolves `PLAYWRIGHT_BROWSERS_PATH` from the
    pre-change home when unset, then sets `HOME` to a run-owned temporary
    directory under `tmpdir()` before global setup, workers, or test modules
    load, and removes that directory when the owning run exits.
  - Workers, Vitest browser commands, and child processes (`git`, shell fakes,
    spawned servers) inherit that disposable `HOME` instead of the developer's
    real home.
  - Specs and fixtures that explicitly choose their own temporary `HOME`
    (`dashboardServer.ts`, `process.env.HOME = ...`) keep that home, and
    restoring `process.env.HOME` returns to the run's disposable home rather
    than the developer's real home.
- **Strict `test-support` boundary ([Architectural North Star](../NORTH-STAR.md)):**
  Add **zero new wrapper files** to `dashboard/test-support/`. Keep only the
  minimal framework-startup `HOME` and `PLAYWRIGHT_BROWSERS_PATH` seam inside
  the existing runner configuration (`runnerConfig.mjs` and
  `dashboard/frontend.vitest.config.mts`).

**Key examples:**

- *(Delivered in `7ce5da1c7`)* A live runner's address sits in `HOME`'s
  `cursor-runner.json` → `createComparisonRenderer` starts and closes → zero
  requests reach that runner and no `incidents/` or `projects-development.json`
  files are created.
- The invoking environment's `HOME` holds a logging listener in
  `.open-dough/dashboard/cursor-runner.json` → a Playwright run (`backend`,
  `frontend`, or `e2e`) or a Vitest browser run (`frontend.vitest.config.mts` /
  `scripts/test-frontend.mjs`) executes a case that calls `homedir()` and
  `readCursorRunnerAddress()` without setting `HOME` → the case sees a
  disposable `tmpdir()` home, `readCursorRunnerAddress()` returns `undefined`,
  the outer listener receives zero requests, Chromium launches from the
  preserved browser cache, and the disposable run home is removed when the run
  exits.
- A mixed `scripts/test-frontend.mjs` run executes both a retained Playwright
  spec and a `.mounted.spec.ts` Vitest spec → each runner owns and removes only
  its own disposable home without deleting the other's mid-run.
- A spec or fixture sets `process.env.HOME` to its own scratch directory → it
  keeps that directory during the case and restores to the run's disposable
  home afterwards.

**Scope limits:** Production `homedir()` defaults remain unchanged
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md));
passing explicit home/storage parameters into typed server handlers as unit
suites move to plain Vitest belongs to
[`SEED-413`](SEED-413-renovate-dashboard-unit-tests.md). Under the
[Architectural North Star](../NORTH-STAR.md), the earlier canary server,
`NODE_OPTIONS --import` TCP preload, listener registry, and custom Chromium
`CONNECT` proxy are dropped so no test-support firewall framework is built.
