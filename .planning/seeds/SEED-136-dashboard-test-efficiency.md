---
id: SEED-136
status: active
planted: 2026-10-17
planted_during: Terry's request for a dashboard test improvement campaign and faster CI
trigger_when: Dashboard test redundancy and CI resource use delay feedback
scope: unknown
---

# SEED-136: Efficient dashboard testing and CI feedback

## Why This Matters

Developers and maintainers need quick, trustworthy feedback as the dashboard
grows. Terry reports GitHub Actions CI approaching five minutes despite the
product's modest feature set, and considers the dashboard's twelve parallel
jobs excessive. The current workflow confirms twelve dashboard shards; the
latest successful `main` run on 2026-10-16 took 4 min 28 s; the prior strategy
baseline remains recoverable through the Breadcrumbs below.

Terry selected two stories in this order: first unify and improve the dashboard
E2E tests using Donut's testing principles, then restore overall CI feedback to
under three minutes. A hosted probe showed that target out of reach without
redesigning test isolation or buying capacity, so the second story now
delivers the measured saving. Reduce redundant work and resource consumption before
seeking more parallel capacity. This capture queues the work; it does not
implement the campaign or create an executable plan.

## Selected Stories

<a id="restore-ci-under-three-minutes"></a>

### Cut dashboard CI time with once-per-run server bundles

**Identity:** SEED-136#restore-ci-under-three-minutes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/315-restore-ci-under-three-minutes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"80f9ae334c2440ebb1aba38e30be5591b1be5da37f46cfff760ece262717f8ed","plan":"504ea7ca5c4c71ab111d89dba494a57ebfc290437c23a12353c5b4b0fcaaaaab"}}
```

**Beneficiary:** Developers waiting for a complete CI verdict before continuing
or integrating work, and maintainers paying for runner resources.

**Goal:** Lower the dashboard suite's hosted CI cost and the complete CI
verdict by starting each test's dashboard server from code bundled once per
run, with unchanged coverage, isolation and job layout.

**Scope:**

Required:

- Bundle the dashboard's Vite configuration and boundary server entry once in
  each suite run's global setup, from that run's checkout, into a run-owned
  directory that teardown removes. Preserve each bundled module's own
  `import.meta` location, so path-relative reads behave as from source.
- Start every preview server and boundary-mode server from that bundle: the
  `dashboard` fixture, direct `startDashboardServer` callers, and the boundary
  command spec. Development servers keep serving source.
- Keep the twelve-shard workflow, its checks and deadlines. Prove the effect on
  matched hosted runs and update the measurements this story records.

Preserved constraints, from the
[test contract](../../dashboard/tests/README.md): meaningful coverage,
`retries: 0`, truthful nonzero failures, retained failure diagnostics, build
freshness, per-test server isolation, concurrent-run isolation and the run's
no-leaked-process sweep. A shared mutable server or bundle reused across runs
is out of scope.

Rejected, with the hosted probe below as evidence: starting serial chains
first (the runner is CPU-saturated, so the chain only slows), avoiding private
preview builds (no suite test builds privately), and the native or runner Vite
config loaders (no gain, or slower).

Deferred promises: a below-180-second verdict, fewer dashboard jobs, a new CI
service, larger or paid runners, and a per-worker shared-server isolation
redesign. Terry chose on 2026-10-18 to relax the original targets to what this
measured saving delivers, rather than redesign test isolation or buy capacity.

**Key examples:**

1. *Matched hosted saving.* Given the candidate revision and its unchanged
   parent run concurrently on `ubuntu-24.04` with twelve dashboard shards, the
   candidate's summed dashboard suite-step seconds are lower in each of two
   matched pairs, by at least 8% on average, with every required check
   passing. A pair that shows no saving is reported, not retried away.
2. *Same behavior from the bundle.* Given a preview journey, a boundary spec
   and the real dev/preview serving-mode equivalence cases, each passes against
   the bundled entries. The boundary command spec names the bundled entry, and
   a module reading a file relative to its own source still finds it.
3. *Freshness and cleanup.* Given an edit to a server module, the next run
   serves the edited behavior without a manual step. Given a passing,
   failing or interrupted run, its bundle directory is gone afterwards, and two
   concurrent runs from one checkout never share or remove each other's bundle.
4. *Bundle failure is truthful.* Given a server module that cannot be bundled,
   the run fails in global setup naming the bundling error, before any test
   reports success.

**Hosted probe evidence (2026-10-18):** Terry authorized plan 315's probe.
[Probe 39106658930](https://github.com/terryyin/open-dough/actions/runs/39106658930)
and unchanged [CI 39106658874](https://github.com/terryyin/open-dough/actions/runs/39106658874)
ran concurrently at `94b65843` (preparation `37b3c3e1` plus env-gated probe
code). All tests passed in both. On the idle runner, four concurrent starts
took 1,035 ms for preview and 1,235 ms for boundary from source, against 404 ms
and 241 ms from bundles. Within the suite, preview starts averaged 1.74 s
(1,003 starts) and boundary starts 0.99 s (421 starts) from bundles. The
twelve-shard suite steps fell from 2,496 to 2,230 seconds (−11%) and summed
test seconds from 8,368 to 7,464. Identical shard-3 jobs ranged from 221 to
271 s, so one pair is not proof. The superseded under-three-minute
investigation is recoverable at
`7d08bc72:.planning/seeds/SEED-136-dashboard-test-efficiency.md#restore-ci-under-three-minutes`.

**Architecture:** Keep run lifecycle in `dashboard/tests/support/globalSetup.ts`
and server launch in `dashboard/tests/support/serverAddress.ts`. One new
test-support module owns bundling. It uses `rolldown`, which Vite already
locks at 1.2.9, declared as a direct development dependency rather than
imported transitively. The bundle lives in a run-unique directory under the
repository's `node_modules`, so bare imports resolve as they do from source.
Production serving is unchanged. Accepted ADR 0002 (empirical improvement,
least complexity) applies; no ADR or North Star change is needed.

**Safe stopping point:** Every dashboard server a suite run starts in preview
or boundary mode loads that run's bundle, with the matched hosted saving
recorded.

## Ordering

The E2E strategy and suite improvement story is complete (landed 2026-10-18;
its section is recoverable at
`0c96a546:.planning/seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e`).
The CI runtime story is the remaining selected work, narrowed on 2026-10-18 to
the measured server-bundle saving. Queue priority does not authorize execution or create a
technical blocking dependency. Preserve the existing near-future direction.

## Breadcrumbs

- Terry's request and revised priority order, 2026-10-17; authorized capture on
  `main` and synchronization with `origin`.
- [Current dashboard test contract](../../dashboard/tests/README.md),
  [Playwright configuration](../../dashboard/playwright.config.ts), and
  [GitHub Actions workflow](../../.github/workflows/ci.yml).
- Baseline measurements of 2026-10-17 (hosted run 38838738715 and one local
  full run at 88f6d3f8 with Playwright's proof record) in the completed
  strategy story's section, recoverable at
  `0c96a546:.planning/seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e`.
- Donut is the repository named `doughnut`. Its reviewed guidance at revision
  `7178e92d045e56aa37214de82d85a197d456a19c` supplies the principles to adapt:
  [E2E authoring](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/e2e-authoring/SKILL.md#L109-L206)
  and [small tests](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/unit-testing/SKILL.md#L7-L26).
