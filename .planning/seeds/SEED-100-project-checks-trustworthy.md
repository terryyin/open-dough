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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/254-dashboard-specs-deterministic/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"011642d3ff137131deb2ad22e7950143de907295faa04fea11cb464e28a44189","plan":"9ecfabb8b3ee74fd6364a43c7f5b6023c1484571c7396d85036f52d03488c4e7"}}
```

**For / why:** Every agent that publishes to `main` waits on CI's dashboard
jobs. A spec that fails intermittently blocks an unrelated publication's
completion and sends its agent to diagnose someone else's flake.

**Goal:** Each of these specs fails only when the behavior it covers is
broken, so a red dashboard job on `main` points at the publication that broke
it, not at someone else's flake.

**Scope:**

- For each spec, find what its failing assertion actually raced against and
  replace the timing-dependent wait with the signal that establishes the
  precondition, or fix the product race when the product, not the test, is
  wrong. A product race is in scope wherever its fix lives.
- Each cause is shown before it is fixed: the failure is reproduced
  locally, for example by widening the suspected window as `58c93605` did,
  and the same reproduction passes after the fix.
- Rejection constraints (the goal is a trustworthy verdict, which these would
  defeat): no retries, no added sleeps, no wait longer than the awaited
  operation's own bound (for a start's answer, the launch wait the dashboard
  allows it), no weakened or removed assertion, and no skipped or quarantined
  spec.
- Boundary assumption: the four specs have independent causes until a
  reproduction shows otherwise. A spec whose failure cannot be reproduced
  stops with its evidence reported; the others continue.
- Deferred: surveying or fixing other dashboard specs, and CI-wide flake
  detection or retry tooling.

**Key examples** (CI failure → deterministic result):

- `side-panel-width.spec.ts:36`: the test timed out at 30 s inside
  `expectWidth` (`sidePanelWidthPage.ts:87`). After the fix, the width the
  mouse or keyboard chose is asserted once the panel reports it has settled,
  and the spec passes with the suspected window widened.
- `agent-launch-ad-hoc-cursor.spec.ts:43`: the recent-sessions entry showed
  "First input acceptance uncertain — Cursor has not confirmed the first
  prompt" where the spec expected "First input accepted". After the fix,
  either the spec waits for Cursor's confirmation through the signal the
  dashboard uses, or, if the dashboard declares uncertainty before a
  confirmation that does arrive, that product race is fixed. A truly
  unconfirmed first prompt still shows uncertain.
- `story-review-action.spec.ts:31`: `expectOnOneLine`
  (`partArrangement.ts:44`) measured one inspection control 29 px below the
  others. After the fix, the arrangement is measured only once the layout it
  covers has settled; a control that genuinely wraps still fails.
- `agent-launch-acceptance.spec.ts:96`: at line 138 the served attempt carried
  a `reporting` object (command, origin, reference) that the kept attempt read
  for comparison did not. After the fix, the spec compares the two only once
  the attempt record they both describe has reached the state under test, or
  the dashboard keeps and serves the same attempt, whichever reproduction
  shows is wrong.

**Evidence:** one failure each in the last 30 `main` CI runs (2026-10-05):
runs 37239925415, 37207067477, 37173254314, and 37169060163, in the order
above. The same pattern in `agent-launch-duplicate.spec.ts` was a test waiting
on the launch record, which is kept before the attempt settles and releases
the launch gate. It was reproduced by widening that window and fixed in
`58c93605`.
