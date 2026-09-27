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

<a id="ci-verdict-round-2"></a>

### Bring the integrated CI verdict back under 120 s by splitting CI's checks across parallel jobs

**Identity:** SEED-046#ci-verdict-round-2
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/122-ci-verdict-parallel-jobs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c6a785b720a4eedede4d7857d3f1d42dbedf48ad6a5aa8b1c043feb77f355437","plan":"90fdb395a2d5ac71eb3b21566c1a1cc3c4b718fef61010ffd523706c1d862208"}}
```

**Goal:** Every revision published to trunk gets its CI verdict — the whole
CI workflow finishing — at a median of at most 120 s over at least five runs,
from about 155–163 s now, with every check still running on CI exactly as
strictly as before. Agents at completion points wait less, and a red trunk
shows sooner to every agent publishing to it.

**Scope:**

1. **Checks split across parallel CI jobs.** CI runs the shell and node
   checks as several jobs on separate runners, two expected. Every check the
   runner discovers, including the self-installation check, runs in exactly
   one of them, without a hand-maintained list, so a new check file is
   covered automatically. A local `npm test` still runs every check.
2. **The dashboard job no longer sets the verdict.** The browser suite
   finishes within the target too, by Playwright's own sharding across CI
   jobs, or within one job when using the runner's cores is enough.
3. **The time budget belongs to CI.** `tests/time-budget` applies to each
   split job and is recalibrated from the split runs by its existing rule
   (1.5× the largest observed values). A breach still fails CI. Local runs no
   longer print the budget report: its ceilings describe CI's runner, and
   local times on a loaded machine measure contention. CI keeps each split
   job's `test-times`, and the `longest-first` refresh instructions cover
   them.

**Key examples:**

1. A revision reaches `main` → CI runs lint, the split test jobs, and the
   dashboard in parallel → across at least five runs the workflow's median
   wall time is at most 120 s, and every discovered check appears in exactly
   one split job's `test-times`.
2. A maintainer adds `tests/new-check.sh` → next CI run → it runs in exactly
   one split job, with no list edited; a local `npm test` runs it too.
3. A check fails in one split job → that job fails naming the check, as the
   `test` job does today, and the verdict is red.
4. A split job's total exceeds its ceiling on CI → that job fails with the
   budget report. The same over-ceiling times in a local `npm test` on a
   loaded laptop print nothing and exit 0 when every check passes.

**Rejection constraints:** no retries, loosened assertions, skips, or longer
timeouts to gain speed; no check is removed or merged away (removing a run
needs another run that observes the same promise at the same boundary, with
the maintainer's approval of the coverage map).

**Out of scope:** reducing test work, including profiling
`tests/git-publication-native.sh`; fewer `git fetch` calls per
`execution-start` (that changes remote-state freshness, a product decision
for its own story); tightening the per-job ceiling or a per-check time
target; local test speed; larger or paid runners; the native adapter check's
silent `run_selected` failure and the copied result-path parse, now
[SEED-049#native-result-path-diagnosis](SEED-049-native-result-path-diagnosis.md#native-result-path-diagnosis).

<a id="ci-verdict-correction"></a>

### Keep the split test runner and CI's split in one place each

**Identity:** SEED-046#ci-verdict-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/126-ci-verdict-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"77e9a2f6983b56ef7661febc70e8f2ec3ccbed0fbfc7561f0ea7c402e8009cb8","plan":"79ed2c42a644ccb93f4e3c80febac51163b7cffd9e6448b5957ede57f4acbc84"}}
```

**Goal:** A maintainer changing the test runner, the CI split, or the time
budget edits each fact in one place: the runner alone decides that the budget
is CI's, one helper copies the runner into test fixtures, the test directory
default is resolved once, the split count is stated once per workflow matrix,
and the contributor documentation describes the split generically and
accurately. This corrects the CI verdict round 2 execution
([ci-verdict-round-2](#ci-verdict-round-2), plan 122) and adds no feature
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

Now: second in the product backlog, after SEED-048, per the maintainer on
2026-09-27.

## Breadcrumbs

- SEED-037 plan 107 and its measurements are recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`; the
  earlier leftovers list is at
  `f10d52e:.planning/slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md`.
- [SEED-048#explicit-test-environment](SEED-048-explicit-test-environment.md#explicit-test-environment)
  also changes `scripts/test.sh` (chosen checks, Git environment) and is
  queued first.
- Tests README "Installation and update coverage gaps" lists four installer
  promises no check observes yet.
