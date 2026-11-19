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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/719-keep-dashboard-tests-off-the-developers-real-cursor-runner/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"37de870630d03eb5b6beb47b963c071318429c6a8021f275cd92ab4cfc5978b6","plan":"c9a22b9bcf8ff05a144e71eff602ad9e492efaa2b7c199c8a4c07cc5740f8759"}}
```

**Goal:** A developer can run dashboard tests on the same machine where they
use the Dashboard and Cursor. Test code gets a disposable default home, and
its Node TCP connections and browser requests reach only the run's own
listeners. An accidental attempt to use the default Cursor runner or an
unrelated listener fails the run with a named cause.

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
  fails the run and is recorded with its method, path, process and test, or
  the active runner phase outside a case. This includes global setup,
  fixture teardown and the time between the last test and run shutdown.
- A network guard covers Node runner processes, workers and their Node
  children, as well as pages opened by the Playwright and Vitest browser
  runs. A connection can reach a live listener owned by that run at the
  destination address and port. A refused connection fails the run even if
  the caller catches the error. The report names the destination, process
  and test, or the active runner phase outside a case.
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
- A run-owned server redirects a test page to an unrelated local service →
  the destination receives nothing and the run reports the refusal.
- A spec starts a fake GitHub and a dashboard server that reads it → both
  listeners belong to the run → every request proceeds as today.
- A spec sets `process.env.HOME` to its own temporary home → it keeps that
  home, and the canary sees nothing.
- Whole backend, frontend (Playwright and Vitest mounted) and E2E runs end
  with zero canary contacts and zero guard refusals.

**Scope limits:** This story does not change how the production Dashboard
finds the real runner or any other machine-local state. It also does not
change which tests run live or mounted; that stays with SEED-408. Non-Node
helpers such as `git` and shell fakes inherit the test-owned home. Unix-domain
sockets use the test-owned home and temporary directories. The guard covers
the test runners' Node TCP and browser traffic. A kernel sandbox that also
restricts arbitrary file paths or native helper traffic is outside this story.

**Architecture:** The test-owned home and the guard are run-level test
infrastructure. Runner entry points establish them before test code loads
and pass them to children. The listener register tracks bound endpoints for
one run and registers fixture listeners automatically. The run owns the
canary and the final verdict through child and browser shutdown. Playwright
uses an explicit browser cache path resolved before `HOME` changes.
Production continues to resolve its machine-local operational state under
its own home as described in [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
