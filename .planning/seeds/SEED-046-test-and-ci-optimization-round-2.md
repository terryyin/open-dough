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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/126-ci-verdict-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0158ba38631e33e91923039bf9f29185394b14fbe9c0e6cc5b7b072bdde34914","plan":"29804ac75be4ecc2c3a4f1d25ca9a890dc2cd4a014be6375dcbeec04b0b97eaf"}}
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

### Give each dashboard browser test a server port no other worker can take

**Identity:** SEED-046#dashboard-port-race
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A dashboard browser test always runs against the preview or dev
server it started, or fails saying that server could not start, however many
Playwright workers run at once. A maintainer never chases a failure caused by
another worker's server.

**Expected:** each test's server binds its own port, and a test starts only
once its own server is listening.

**Actual (by mechanism; not yet observed):** `freePort()` in
`dashboard/tests/support/dashboardServer.ts` binds `127.0.0.1:0`, closes the
socket, and returns the number; Vite is spawned later with `--strictPort`,
for an unbuilt preview only after a whole dashboard build. In that window a
concurrent worker's port-0 bind (for example `fakeGitHub.ts`) can take the
port, Vite exits, and `waitUntilListening` accepts any HTTP answer without
checking that its own child is alive, so the test can run against another
worker's server and fail misleadingly.

**Evidence and uncertainty:** found by plan 122's execution retrospective.
Plan 122 raised Playwright to every core per CI shard, widening the window.
No failure seen in 11+ green CI runs (120 of 120 tests each); the collision
rate is unmeasured. Refinement first confirms the race (for example by
occupying a returned port before Vite starts) before repairing it.

**Acceptance examples (to confirm in refinement):**

1. A port returned for a test is taken by another listener before Vite binds
   it → the test fails naming its server's start failure, or its server
   starts on a port it owns; it never runs against the other listener.
2. The dashboard suite runs with every core on CI → every test talks to its
   own server, and the executed count still equals `--list`'s.

## When to Surface

Now: the dashboard port race first and the CI verdict correction second in
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
