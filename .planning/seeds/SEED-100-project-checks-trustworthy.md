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
[project findings](../../ProjectFindings.md#priority-assessment) show two
recurring ways those checks fail them. Dashboard specs fail CI on revisions
that change no code, which leaves trunk red for the next story and costs a
diagnosis the change did not cause. And sessions the dashboard launches
prepare their checkout without the locked dev tools while the readiness check
still passes. Both causes and their fixes live in this repository's dashboard
and its tests, not in the published skills.

## Stories

<a id="dashboard-specs-pass-unchanged-code"></a>

### Dashboard specs pass CI on a revision that changes no code

**Identity:** SEED-100#dashboard-specs-pass-unchanged-code
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** The agent closing a story, and the next agent starting from
trunk, need a red `dashboard` CI job to mean the change broke something. Then
they do not have to diagnose, repair, or work around a failure their change did
not cause.

**Goal:** The dashboard suite passes in CI on a revision that changes no code,
and the specs that failed that way on 2026-10-04 no longer do.

**Findings:**
[dashboard specs whose verdict depends on timing or machine load](../../ProjectFindings.md#dashboard-specs-whose-verdict-depends-on-timing-or-machine-load-first-priority-queued)
(DD-232).

**Evidence:**

- `agent-launch-acceptance.spec.ts:96` failed in CI runs 37169060163 (main,
  `8cb57afc`) and 37206540831 (`2e9d5a70`). Both revisions changed only
  planning records and DearDough.md. Its kept launch record showed an extra
  `reporting` object in one run and a missing `outcome` in the other. It is
  not repaired.
- `agent-launch-ad-hoc-cursor.spec.ts:43` failed in run 37207067477 (main,
  `0cc8895c`, a four-line doc change). It waited 5 s for "First input
  accepted" while the session showed "First input acceptance uncertain",
  the race `aeb9c33d` repaired in another test of the same spec. It is not
  repaired.
- On the same day, `system-settings.spec.ts:127` (`e4bfade5`),
  `story-review-action.spec.ts:31` (`6f0e303c`) and
  `agent-launch-attention.spec.ts:79` (`670e776f`) each failed CI for a read
  taken before the page or record settled, and each was repaired only after
  CI caught it.

**Open question for refinement:** Repairing each spec after CI catches it has
not stopped new failures. Refinement decides whether this story repairs only
the two open specs, or also adds a way to find the remaining races before CI
does, such as running the suite repeatedly on an unchanged revision.

**Boundary:** This repository's dashboard tests and test support. Product
behavior changes only where a spec exposes a real product race.

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
