---
id: SEED-049
status: active
planted: 2026-09-27
planted_during: Dashboard development port conflict report
trigger_when: The dashboard development server uses the same port as the donut project
scope: 1 story
---

# SEED-049: Separate the dashboard development port

## Stories

<a id="dashboard-dev-port"></a>

### Move the dashboard development server to a distinct port

**Identity:** SEED-049#dashboard-dev-port
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Running the dashboard development server does not compete with the donut project's development server for its port.

**Expected behavior:** `npm run dev:dashboard` serves the dashboard on port 43127, a port far from Vite's default 5173, and the dashboard instructions name that address.

**Actual behavior:** The dashboard Vite configuration leaves the development port unspecified, so Vite uses 5173. The dashboard README calls 5173 the normal address. The donut project uses that port for development.

**Evidence:** `dashboard/vite.config.mts` sets `server.host` but no `server.port`; `dashboard/README.md` names `http://localhost:5173`.

**Remaining uncertainty:** Whether the dashboard start command has other port overrides outside this repository; this repair covers the checked-in command and configuration.

**Key examples:**

1. With port 5173 occupied by donut, starting the dashboard binds to port 43127.
2. The dashboard README points a developer to the new port.

**Scope:** Set the dashboard development port explicitly and update its maintained command documentation. The preview server and per-test preview servers retain their independent ports.
