---
id: SEED-403
status: active
planted: 2026-11-18
planted_during: Terry set the dashboard backend entry at the mounted boundary and asked to queue the migration as one story
trigger_when: selected from the backlog
scope: one story
---

# SEED-403 — Enable opt-in mounting for dashboard backend checks

<a id="reach-dashboard-backend-checks-through-the-mounted-boundary"></a>

### Enable opt-in mounting for dashboard backend checks

**Identity:** SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/710-reach-dashboard-backend-checks-through-the-mount/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3b1a222f6d3e5ea9cc9ace57d17f50cb8688ec60629bfdab6f89d9dc81b33fad","plan":"4d2081d0a49cd44e4202d7542f5d3086c5b4b67ce15d3bb851f03f92326636ca"}}
```

**Goal:** A developer can send existing Dashboard Backend Test cases through
the dashboard's local boundaries in their test worker when they explicitly
request the mount. The Java intent read, production project-list and synthetic
Claude launch acceptance keep their HTTP answers, kept files and host calls.

**Scope:**

- A boundary-mode start with an explicit mount request installs the dashboard's
  local boundaries other than the incident record on the worker's HTTP server.
  It uses the named project environment and machine directory, a Cursor runner
  stand-in, and the fixture's fake GitHub, host and time controls.
- The mount holds the worker environment until close, restores it on close,
  withdraws the stand-in address, and releases the project configuration so a
  later mount can choose the other environment. It refuses a second mounted
  start while one is active.
- A mounted start names the live option when a case requests a process-only PID
  or output.
- Existing cases with Cursor, separate-process, connection, server-program or
  other demonstrated fixture requirements can explicitly request the live
  server and state why. Live remains the default. Dev, preview, and the
  frontend and E2E groups keep their existing entry.
- Existing product assertions and test layers are preserved.

**Deferred:** The backend-wide mounted default, full-suite and performance
proof, and documentation of that default move to
[SEED-408](SEED-408-default-dashboard-backend-checks-to-the-mounted-boundary.md#default-dashboard-backend-checks-to-the-mounted-boundary).
