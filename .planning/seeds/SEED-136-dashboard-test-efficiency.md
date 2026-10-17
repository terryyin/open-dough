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
reported duration is context, not a newly measured baseline.

Terry selected two stories in this order: first unify and improve the dashboard
E2E tests using Donut's testing principles, then restore overall CI feedback to
under three minutes. Reduce redundant work and resource consumption before
seeking more parallel capacity. This capture queues the work; it does not
implement the campaign or create an executable plan.

## Selected Stories

<a id="unify-and-streamline-dashboard-e2e"></a>

### Unify and streamline the dashboard E2E test strategy

**Identity:** SEED-136#unify-and-streamline-dashboard-e2e
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers maintaining dashboard behavior and waiting for
reliable local and hosted test feedback.

**Goal:** Apply one documented test strategy across the current dashboard
suite, reducing the number of E2E tests, duplicated coverage, and runtime while
preserving meaningful regression protection.

**Scope:** A campaign across the existing dashboard tests, not just new-test
guidance. Adapt the principles from Donut's E2E and small-test guidance to
Playwright. Retain Playwright; Cypress/Cucumber syntax and Donut-specific
infrastructure are not part of the requested transfer.

The strategy and resulting tests should:

- Express concise, valuable behavior as observable precondition, user trigger,
  and postcondition. Prefer meaningful user journeys and state changes; place
  presentation checks at the cheapest boundary that proves their purpose.
- Keep representative E2E proof of integrated journeys. Put detailed variants
  at fast, stable public, domain, or component boundaries where they can be
  proved without a full E2E journey, exercising real collaborators and replacing
  external boundaries.
- Prove common behavior and output shape once, then assert each distinct
  behavior's differences. Consolidate duplicate scenarios and setup; merely
  parameterizing the same redundant executions does not count as a reduction.
- Use focused page helpers and explicit user actions. Avoid repeated UI setup
  or full reloads when navigation is only a precondition; exercise real
  navigation when it is the behavior being tested.
- Use observable success, request completion, or loading completion for
  synchronization, owned by the action that starts asynchronous work. Add no
  fixed-duration sleeps or arbitrary waiting. Test intentional time behavior
  with controlled clocks where appropriate.

**Evaluation:** Record the current case count, relevant setup costs, and local
and hosted browser runtimes under stated conditions. Map retained behaviors to
their proof and explain removed or relocated cases. The resulting suite has
fewer E2E cases, less repeated setup, and a measured runtime improvement at
comparable worker/shard capacity, with the meaningful journeys and failure
cases still protected. Publish the unified strategy and apply it to the
existing suite. Do not manufacture a speedup through skipped unique coverage,
weaker assertions, extra retries, or increased parallelism.

**Questions for refinement:** Which scenarios repeat the same proof, which
variants belong below the full E2E boundary, and which setup or synchronization
costs dominate? Set a measured browser-runtime target from that baseline;
the full CI target belongs to the next story.

**Safe stopping point:** A smaller, faster, consistently authored dashboard
suite delivers value even before CI orchestration changes.

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

Queue the E2E strategy and suite improvement first, and the CI runtime story
second, as Terry explicitly requested. Apply learning from the first to the
second. This priority does not assert a technical blocking dependency or
authorize execution of either story. Preserve the existing near-future
direction.

## Breadcrumbs

- Terry's request and revised priority order, 2026-10-17; authorized capture on
  `main` and synchronization with `origin`.
- [Current dashboard test contract](../../dashboard/tests/README.md),
  [Playwright configuration](../../dashboard/playwright.config.ts), and
  [GitHub Actions workflow](../../.github/workflows/ci.yml).
- Donut is the repository named `doughnut`. Its reviewed guidance at revision
  `7178e92d045e56aa37214de82d85a197d456a19c` supplies the principles to adapt:
  [E2E authoring](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/e2e-authoring/SKILL.md#L109-L206)
  and [small tests](https://github.com/nerds-odd-e/doughnut/blob/7178e92d045e56aa37214de82d85a197d456a19c/.agents/skills/unit-testing/SKILL.md#L7-L26).
