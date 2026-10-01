---
id: SEED-078
status: active
planted: 2026-10-02
scope: story
---

# Restore saved Codex sessions after a computer restart

## Story

<a id="codex-service-on-dashboard-startup"></a>

### Start the Codex service when the dashboard starts

**Identity:** SEED-078#codex-service-on-dashboard-startup
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A developer opening the dashboard after a computer restart can
  observe and reconnect to saved Codex sessions without manually starting the
  Codex background service.

**Scope:** Dashboard server startup ensures the existing vendor-owned Codex
  daemon is running for retained Codex sessions, using its idempotent start
  operation. Preserve saved identities, endpoints, workspaces and conversations.
  A startup failure keeps the dashboard usable and preserves honest unknown
  observation and existing recovery. Never restart or stop an existing daemon.

**Key examples:**
  1. The computer restarts with saved Codex sessions and no service socket →
     starting the dashboard starts the service → the same sessions can be read
     and reopened without launching a new session.
  2. The daemon is already running → dashboard startup reuses it and leaves
     existing turns alone.
  3. Codex is absent or refuses startup → the dashboard remains usable and
     retains saved sessions and their recovery information.

**Evidence:** On 2026-10-02 terminal attachment failed with ENOENT for
  `~/.codex/app-server-control/app-server-control.sock` after a restart.
  Manually running `codex app-server daemon start` restored reads of all four
  saved conversations; their workspaces still existed. New-session launch calls
  the daemon start operation, while saved-session observation and attachment do
  not establish daemon availability.

**Authority:** Terry requested automatic service startup through dashboard
  startup. Dough Bug Fixing supplies one bounded planless repair attempt with
  reproduction first, a ten-minute implementation limit, and no replanning.
