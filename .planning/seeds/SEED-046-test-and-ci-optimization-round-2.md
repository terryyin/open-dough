---
id: SEED-046
status: active
planted: 2026-09-27
planted_during: Wrap-up of SEED-037#fourfold-local-suite (plan 107)
trigger_when: The integrated CI workflow's median wall time exceeds 120 s, or a CI job nears its budget ceiling
scope: 1 story
---

# SEED-046: Keep the CI verdict fast as the suite grows

## Why This Matters

An agent waits for trunk's CI verdict at its completion points: execution
handoff, wrap-up, and trunk integration. Slice deliveries do not wait; CI
repair is asynchronous. A faster verdict therefore saves each story a few
waits, and, with several agents publishing to trunk, it shortens how long
others build on a broken trunk before repair starts.

SEED-037 brought CI's `Run test` step from 174 s to 115 s on its branch, but
trunk's tests grew meanwhile. On `main` after SEED-037 landed (`bfdf893`,
`15362af`, `2b18837`, `199ae44`), `Run test` took 110, 140, 140, and 143 s,
and the whole workflow 154–163 s. The `test` job sets the verdict; the
`dashboard` job follows at 131–137 s (21 s installing Playwright Chromium,
98 s in the browser suite).

## Alternatives and Decision

The runner already keeps CI's four cores busy: `199ae44` ran 569.5
job-seconds in 143 s, about 569.5 / 4. The 45 s
`tests/git-publication-native.sh` starts first and is not on the critical
path, so shortening it saves about 6 s. Reaching 120 s by cutting work would
mean removing about 90 job-seconds across many checks, each needing a
coverage-map approval.

Refinement on 2026-09-27 chose instead to split the work across parallel CI
jobs. The repository is public, so extra standard runners cost nothing, and
no check is removed or weakened. The trade-off is accepted: total work is not
reduced, so growth returns later as longer split jobs, and reducing work
remains test optimization's concern for local feedback. Raising the budget alone keeps CI green but lets
the wait creep back.

Judge progress by CI, not local wall time: local job-seconds on a shared,
loaded machine mostly measure contention. GitHub assigns runner classes up to
about 1.5× apart, so use at least five runs per measurement.

## Stories

<a id="ci-verdict-correction"></a>

### Keep the split test runner and CI's split in one place each

**Identity:** SEED-046#ci-verdict-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/126-ci-verdict-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c1441c84c51c4117988349da0b3e10e8d9422144b4af05c6f591bb3cc7a02635","plan":"29804ac75be4ecc2c3a4f1d25ca9a890dc2cd4a014be6375dcbeec04b0b97eaf"}}
```

**Goal:** A maintainer changing the test runner, the CI split, or the time
budget edits each fact in one place: the runner alone decides that the budget
is CI's, one helper copies the runner into test fixtures, the test directory
default is resolved once, the split count is stated once per workflow matrix,
and the contributor documentation describes the split generically and
accurately. This corrects the CI verdict round 2 execution
(`SEED-046#ci-verdict-round-2`, plan 122, recoverable at `c9585be:.planning/slice-plans/122-ci-verdict-parallel-jobs/PLAN.md`) and adds no feature
promise: every CI job name, split, and budget verdict stays as delivered.

**Scope:** the budget checker's exit rule, the runner's copy in test
fixtures, the test directory default, the CI workflow's split count, and the
split and budget wording in `tests/`, the tests README, and the installation
guide's contributor checks. Correction plan:
[126-ci-verdict-correction](../slice-plans/126-ci-verdict-correction/PLAN.md).

<a id="dashboard-port-race"></a>

### Keep each dashboard test on a server it started, even beside another worktree's suite

**Identity:** SEED-046#dashboard-port-race
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"c1441c84c51c4117988349da0b3e10e8d9422144b4af05c6f591bb3cc7a02635"}}
```

**Goal:** A developer or agent running the dashboard browser suite in one
worktree while another listener already holds a port, such as another
worktree's suite on the same machine, gets tests that talk only to servers
they started, or a failure that says their own server could not start. No one
chases a product-looking assertion failure caused by someone else's server.
This serves the near-future direction's same-machine phase, where several
agents work in worktrees on one machine, and keeps a red CI verdict
trustworthy for trunk-based collaboration.

**Scope:**

- The dashboard test server harness lets Vite bind a free port itself and
  takes the address from its own Vite process's report, so no gap remains
  between choosing a port and binding it.
- The specs that pin fixed ports (4290–4303 in the authenticated read
  boundary and subprocess lifecycle specs) use harness-chosen ports; nothing
  depends on those numbers.
- A test starts only once its own Vite process reports it is listening. If that
  process exits or never reports, the test fails naming the server start
  failure, with Vite's output.
- Deferred: measuring how often the original ephemeral-port race collided;
  retry or fallback-port logic; the fake GitHub, which already binds port 0
  atomically; the developer dashboard's dedicated port; CI and worker-count
  settings. Running two whole suites side by side is proven once by manual
  test, not kept as an automated test (maintainer, 2026-09-27).

**Evidence:** refinement on 2026-09-27 held `127.0.0.1:4290` with an unrelated
HTTP server and ran `authenticated-read-boundary.spec.ts`. Vite could not
bind, the harness accepted the other server's answer, and the test failed as
`Expected: 502, Received: 200` without mentioning its server. Vite 8 accepts
`--port 0` in dev and preview modes and prints the bound `Local:` address.

**Key examples:**

1. Another listener holds a port a test would previously have used → the
   test's own server starts on a port it owns and the test passes; the other
   listener receives no request from it.
2. The test's Vite process exits before reporting it is listening (for
   example, a broken configuration) → the test fails naming its server start
   failure and Vite's output, not a product assertion.
3. Manual proof: two worktrees run the dashboard suite at the same time on one
   machine → both pass.

## When to Surface

Now: the dashboard test server isolation story first and the CI verdict correction second in
the product backlog, per the maintainer on 2026-09-27.

## Breadcrumbs

- SEED-037 plan 107 and its measurements are recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`; the
  earlier leftovers list is at
  `f10d52e:.planning/slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md`.
- SEED-048#explicit-test-environment (recoverable at
  `8de2d7f:.planning/seeds/SEED-048-explicit-test-environment.md`) also
  changed the test runner (chosen checks, Git environment); job selection now
  lives in `scripts/test-jobs.sh`.
- Tests README "Installation and update coverage gaps" lists four installer
  promises no check observes yet.
