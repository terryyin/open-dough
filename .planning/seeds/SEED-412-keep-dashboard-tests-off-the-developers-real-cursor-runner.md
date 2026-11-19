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

**Goal:** A developer can run dashboard tests on the same machine where they
use the Dashboard and Cursor. No test reaches that machine's real Cursor
runner, real home, or any other network service outside the test's own
stand-ins. A test that tries to fails with a named cause instead of silently
reading or changing the developer's live sessions.

**Observed defect:** During a whole Dashboard Backend Test run on 2026-11-19,
made while SEED-408 was being made ready, a live test server (pid 21529, started
from the Vite config) sent `GET /sessions` to the Cursor runner twice. Its
`HOME` was the developer's real home, so it reached the machine's real Cursor
runner. The read changed nothing, but the run depended on and could see
production state. The Cursor host code resolves the runner from `homedir()`
by default. Examples are `runnerWire.ts`, `runnerProcess.ts`, `runnerClient.ts`,
`heldSessions.ts`, `sessionScope.ts` and `terminalBridge.ts` under
`dashboard/server/hosts/cursor/`. One server path still lets the real home
through. SEED-408's
[plan](../slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md)
records a related `GET /sessions` that reached the runner stand-in unexpectedly.

**Acceptance:**

- Every dashboard test server, live or mounted, and every test that uses the
  Cursor host directly runs with a test-owned home. Its Cursor runner address
  resolves inside that home or to a test stand-in.
- A test whose code tries to reach the real home's runner, or any network
  service that is not a declared stand-in, fails. The failure names the
  request and the start that made it.
- A whole Dashboard Backend Test run makes no request to the real runner. The
  same holds for the frontend and E2E runs that start dashboard servers. The
  proof is a run whose real-runner socket or port, or a guard on it, records
  zero test contacts.
- The cause is fixed where the real home leaks in: server start, the Vite
  config entry, or a host default. Each test does not opt out separately.

**Scope limits:** This story does not change how the production Dashboard
finds the real runner. It also does not change which tests run live or mounted;
that stays with SEED-408.
