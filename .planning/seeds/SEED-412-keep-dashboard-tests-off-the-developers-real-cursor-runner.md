---
id: SEED-412
status: active
planted: 2026-11-19
planted_during: Terry asked for a fix story at the top of the backlog after a whole Dashboard Backend Test run, while SEED-408 was being made ready, read the machine's real Cursor runner
trigger_when: selected from the backlog
scope: one story
---

# SEED-412 — Keep dashboard tests off the developer's real Cursor runner

<a id="keep-dashboard-tests-off-the-developers-real-cursor-runner"></a>

### Keep dashboard tests off the developer's real Cursor runner

**Identity:** SEED-412#keep-dashboard-tests-off-the-developers-real-cursor-runner
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/719-keep-dashboard-tests-off-the-developers-real-cursor-runner/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5a7bb54047dee295a41f834f7e3213b9620ce615c8e635abfaf1169c55e86b0c","plan":"7c47c86980210df5ab31503c9915bf3ca4d036a36ad4792c748cf83103e2a337"}}
```

**Goal:** A developer can run dashboard tests on the same machine where they
use the Dashboard and Cursor. No test reaches that machine's real Cursor
runner, real home, or any other network service outside the test's own
stand-ins. A test that tries to fails with a named cause instead of silently
reading or changing the developer's live sessions.

**Observed defect:** During a whole Dashboard Backend Test run on 2026-11-19,
made while SEED-408 was being made ready, a test process (pid 21529, started
from the Vite config) sent `GET /sessions` to the Cursor runner twice. Its
`HOME` was the developer's real home, so it reached the machine's real Cursor
runner.

**Investigated facts (2026-11-19):**

- The test helper `createComparisonRenderer`
  (`dashboard/test-support/support/comparisonRendering.ts`) starts an
  in-process Vite server from `dashboard/vite.config.mts`. That config mounts
  every local boundary, so the Playwright worker runs the launch, usage and
  other boundaries against the worker's own `HOME`, which is the real home.
  It needs none of them: it only compiles the comparison markup.
- Observed: running
  `backend-tests/runtime/comparison-renderer-vite-cache.spec.ts` with `HOME`
  set to a scratch home whose `cursor-runner.json` named a logging listener
  recorded two `POST /release-handoffs`, one per renderer close. On the
  developer's machine, that request drops the live runner's pending launch
  handoffs. Startup also calls `ensureCursorRunner()`, which spawns a runner
  from the worktree's code into the home when none is accepting. The same
  run also wrote `incidents/` and `projects-development.json` into that
  home's `.open-dough/dashboard/`.
- `dashboardServer.ts` already gives each dashboard server a test-owned home
  (the fake Claude home). Many backend specs set and restore
  `process.env.HOME` one by one. Nothing gives the Playwright main process
  or its workers a test-owned home by default.
- The Cursor host resolves the runner from `homedir()` by default
  (`dashboard/server/hosts/cursor/runnerPaths.ts` and its callers).
- SEED-408's
  [plan](../slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md)
  records a related `GET /sessions` that reached the runner stand-in
  unexpectedly.

**Scope:**

- Every dashboard test process starts with a test-owned home: the Playwright
  main process and workers of the backend, frontend and E2E runs, the Vitest
  mounted run's Node side, and every server or helper they start. Code that
  calls `homedir()` without choosing a home gets that test-owned home, never
  the real one. Specs and fixtures that already choose their own home keep it.
- That default home holds a canary Cursor runner address. Any contact with it
  is recorded with its method, path and the process and test that made it,
  and fails the run. Contact during global setup, fixture teardown or after
  the last test still fails the run.
- A network guard runs in every Node test process: workers, the main process,
  and the Node children they start. Any listener opened by a process of the
  run is a declared stand-in. A TCP connection to any other address, loopback
  or remote, is refused. The error names the destination and the process and
  test that made it. Browser pages opened by the run's Playwright contexts
  follow the same rule.
- The comparison renderer compiles without mounting the dashboard's local
  boundaries.
- The fix lives at the starts: run config, global setup and shared fixtures.
  Individual specs do not opt in.

**Key examples:**

- The developer's real runner is live with pending launch handoffs → a whole
  Dashboard Backend Test run, including the comparison renderer spec → the
  real runner receives nothing and its handoffs remain.
- No real runner is running → the comparison renderer starts and closes → no
  runner process starts under the real home.
- A backend spec calls `readCursorRunnerSessions()` with no home → it reads
  the canary address → the run fails with `GET /sessions`, the worker and the
  spec's title.
- A spec opens `http://127.0.0.1:4173/` (the production Dashboard) from the
  worker or from a test page → the connection is refused, naming
  `127.0.0.1:4173` and the spec.
- A spec starts a fake GitHub and a dashboard server that reads it → both
  listeners belong to the run → every request proceeds as today.
- A spec sets `process.env.HOME` to its own temporary home → it keeps that
  home, and the canary sees nothing.
- The proof run: whole backend, frontend and E2E runs end with zero canary
  contacts and zero guard refusals.

**Scope limits:** This story does not change how the production Dashboard
finds the real runner or any other machine-local state. It also does not
change which tests run live or mounted; that stays with SEED-408. Non-Node
processes that tests start, such as `git` or shell fakes, are not intercepted
by the network guard. They still get the test-owned home, so they cannot read
the developer's credentials. Unix-domain sockets are left to the test-owned home and
temporary directories rather than the network guard. Kernel-level sandboxing
is not attempted.

**Architecture:** The test-owned home and the guard are run-level test
infrastructure, set up once per run where processes start and inherited by
children through the environment (`HOME`, `NODE_OPTIONS`). The listener
register is run-scoped. A process of the run adds a port when it listens, so
fixtures need no declaration step. Playwright's browser cache and other tool
caches that the runner itself needs are located before `HOME` changes, from
explicit variables. The guard is installed in the Playwright main process by
the run config itself, because listeners that global setup opens there must
be registered too. Production code keeps its `homedir()` defaults
(ADR 0008, machine-local operational state under the machine's home).
