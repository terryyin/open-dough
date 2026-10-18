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
under three minutes. Reduce redundant work and resource consumption before
seeking more parallel capacity. This capture queues the work; it does not
implement the campaign or create an executable plan.

## Selected Stories

<a id="restore-ci-under-three-minutes"></a>

### Restore GitHub Actions CI feedback to under three minutes

**Identity:** SEED-136#restore-ci-under-three-minutes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers waiting for a complete CI verdict before continuing
or integrating work, and maintainers paying for runner resources.

**Goal:** Reduce the full GitHub Actions CI verdict to below 180 seconds on
representative hosted runs, with fewer dashboard jobs and lower aggregate
runner consumption than the current twelve-shard approach.

**Scope:** Measure and improve the workflow's critical path after the test
campaign. Account for checkout, dependency and browser setup, builds, type
checking, lint, tests, and reporting, including work repeated across jobs.
Choose the job layout, caching, and parallelism from evidence rather than
adding shards to compensate for redundant tests.

**Inputs from the dashboard strategy campaign (measured 2026-10-18, at
0bee7fd8):** the suite is 1,520 tests (801 browser journeys, 719 boundary
tests on the Node boundary server); hosted browser-suite step sums move about
±10 % with runner speed on identical code (main alone ran 2,375–2,645 s in one
day), so compare per-test seconds and their floor over the runners' four
workers (7,158–8,178 s per run, floor 1,790–2,045 s) rather than step sums;
the strategy story's ≤ 1,244 s hosted and ≤ 380 s local targets were not met
because that floor sits above them, and Terry decides whether they carry
over. Levers in evidence: every shard runs the production build in global
setup even for boundary-only selections; `dashboard/tests/longest-first` is a
2026-10-10 record with 45 stale entries and 349 unlisted files, so sorted
order governs most of the split; `prebuilt: builtDashboardDir` is spelled at
44 preview starts and should default in `startDashboardServer` before the
build moves; a worker-scoped fixture declared outside the shared base split
the worker population (fixed at 0bee7fd8, whose hosted run summed 2,207 s
against the 2,474 s baseline); `agent-launch-publication-receipt-failure` and
`agent-launch-preparation-phases` take 13–15 s hosted against 5 s locally
with unchanged specs and deserve one `--trace on` shard.

Current suite input at `f251a069` (2026-10-18): 1,523 tests, comprising 797 browser
journeys and 726 boundary cases. A local four-worker run on the shared machine
passed all tests in 50 min 35.6 s, with zero retries or surviving run processes.
Use this as current suite evidence when refining measurements; it is not a
comparable hosted CI timing or evidence of a runtime improvement.

**Evaluation:** Record a comparable before/after baseline with commit, runner,
job count, per-job timings, and aggregate runner time. Measure from workflow
start until all required checks finish; report queue delay and cache conditions
separately, so the claim cannot describe only the browser test step. Demonstrate
the below-three-minute verdict on representative successful hosted runs, with
fewer than twelve dashboard jobs and reduced runner consumption. Preserve
required checks, meaningful coverage, failure diagnostics, and truthful failure
results; do not omit checks or relax deadlines to obtain the target.

**Questions for refinement:** What dominates the remaining critical path after
the suite improvement, and what hosted-run sample and cache conditions make
the performance claim representative?

**Safe stopping point:** The complete required CI verdict meets the target
without relying on excessive dashboard sharding.

## Ordering

The E2E strategy and suite improvement story is complete (landed 2026-10-18;
its section is recoverable at
`0c96a546:.planning/seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e`).
The CI runtime story is the remaining selected work and carries the campaign's
measured inputs. Queue priority does not authorize execution or create a
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
