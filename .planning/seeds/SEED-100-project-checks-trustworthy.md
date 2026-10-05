---
id: SEED-100
status: active
planted: 2026-10-05
planted_during: Maintainer request to separate project findings from DearDough.md, prune resolved ones, and queue the two highest priorities
trigger_when: This repository's own checks give a verdict that depends on load, timing, or how the session was started
scope: unknown
---

# SEED-100: This repository's checks stay trustworthy

## Why This Matters

Executing agents and maintainers publish Open Dough work on the strength of
this repository's checks. The
[project findings](../../ProjectFindings.md#priority-assessment) show a
recurring way those checks fail them: sessions the dashboard launches prepare
their checkout without the locked dev tools while the readiness check still
passes. The cause and its fix live in this repository's dashboard and its
tests, not in the published skills.

## Stories

<a id="launched-session-development-environment"></a>

### A session the dashboard launches prepares its checkout as a developer shell would

**Identity:** SEED-100#launched-session-development-environment
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** An agent the dashboard launched to work in a project needs its
checkout preparation and project commands to behave as they would in a
developer's shell. Then a passing readiness check means the checkout's own
locked tools ran.

**Goal:** A Claude, Codex, or Cursor session the dashboard launches does not
inherit the dashboard deployment's `NODE_ENV=production` or its
`node_modules/.bin` on `PATH`. Its `npm ci` installs the locked dev
dependencies, and project commands resolve to the checkout's own tools.

**Findings:**
[checks whose result depends on where or how they are run](../../ProjectFindings.md#checks-whose-result-depends-on-where-or-how-they-are-run-second-priority-queued)
(DD-220).

**Evidence:**

- Four dashboard-launched sessions (plans 228, 233, 240, and the 2026-10-05
  findings review) had `NODE_ENV=production`. In three of them
  `npm ci` installed nothing ("audited 1 package"), and the readiness command
  passed on the deployment's `tsc` or the parent checkout's
  `node_modules`. The fourth unset it only because a recorded reminder said to.
- The deployment runs under `npm run preview:dashboard`.
  `dashboard/server/hosts/cursor/runnerProcess.ts` passes `env: process.env`,
  and the Claude, Codex, and terminal spawns under `dashboard/server` pass no
  `env`, so a launched host inherits the server's environment.
- `dashboard/server/productionDeployment.mjs` already builds with dev
  dependencies "whatever NODE_ENV the shell inherited", so the deployment
  itself does not need the launched session to keep `production`.

**Open question for refinement:** Decide whether the launch removes only the
deployment's own additions (`NODE_ENV`, its `.bin` on `PATH`) or starts from
the environment the dashboard itself was started with, and how a spec observes
the difference without a paid native run.

**Boundary:** The dashboard's session launch environment. The published
readiness guidance is out of scope; DearDough.md's ODF-087 keeps that facet.

<a id="dashboard-specs-deterministic"></a>

### Four intermittently failing dashboard specs pass deterministically

**Identity:** SEED-100#dashboard-specs-deterministic
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** Every agent that publishes to `main` waits on CI's dashboard
jobs. A spec that fails intermittently blocks an unrelated publication's
completion and sends its agent to diagnose someone else's flake.

**Goal:** Each of these specs fails only when the behavior it covers is
broken. Its timing-dependent wait is replaced by the signal that actually
establishes its precondition, or a product race is fixed. No retries or sleeps
are added, and no assertion is weakened.

**Evidence:** one failure each in the last 30 `main` CI runs (2026-10-05):

- `dashboard/tests/side-panel-width.spec.ts:36`, run 37239925415.
- `dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts:43`, run 37207067477.
- `dashboard/tests/story-review-action.spec.ts:31`, run 37173254314.
- `dashboard/tests/agent-launch-acceptance.spec.ts:96`, run 37169060163: a
  deep-equality mismatch in the attempt's `publication` field.

None has been investigated. The same pattern in
`agent-launch-duplicate.spec.ts` was a test waiting on the launch record,
which is kept before the attempt settles and releases the launch gate. It was
reproduced by widening that window and fixed in `58c93605`.

**Boundary:** These four specs and any product race they expose. Other
dashboard specs are not surveyed here.
