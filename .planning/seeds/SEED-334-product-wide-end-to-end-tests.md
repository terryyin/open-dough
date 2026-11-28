---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="prove-working-tree-origins-hold-no-release"></a>

### Prove working-tree preparation origins hold no released installation

**Identity:** SEED-334#prove-working-tree-origins-hold-no-release
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/894-prove-working-tree-origins-hold-no-release/PLAN.md"}
```
**Plan:** [894](../slice-plans/894-prove-working-tree-origins-hold-no-release/PLAN.md)

#### Goal

A maintainer changing the shared prepared-origin seam learns from the
maintained tests when a working-tree preparation journey would start from the
tagged released installation, so the working-tree journeys keep proving this
run's skills.

#### Scope

Add one maintained observation that a working-tree prepared origin carries the
working-tree installation and no released one. Product behavior, the tagged
journey and the seam's design stay as they are.

<a id="keep-one-browser-test-group-roster"></a>

### Keep one browser test group roster and current placement guidance

**Identity:** SEED-334#keep-one-browser-test-group-roster
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md","assessment":"not-ready","reasons":["Realign plan 617 after SEED-413 moves frontend-tests and backend-tests to plain Vitest, leaving e2e/ as the sole Playwright suite and adding zero wrappers to test-support."],"basis":{"document":"5198aca92522fae45d523c976cfa8c3e154b40aa21d6344478d5c714c75e93e8","plan":"dc206c39c926524881b89f375f08c92d806852b72598afc26e240ac0e4ad0900"}}
```

#### Goal

A maintainer who adds, removes or reads the browser test groups delivered by
SEED-334#run-and-observe-product-wide-end-to-end-tests (recoverable at
`125c45649fa587c78ed7445deff35db87604489d`)
changes the group set in one place, finds helpers named for the groups they
run, has each CI producer's setup bounds guarded on their own, and reads
placement guidance that matches the independent groups.

#### Scope

Bounded retrospective correction of that execution's residue, updated on
2026-11-19 after `cfa20d7a6` delivered `browserTestGroups.mjs` and
[`SEED-413`](SEED-413-renovate-dashboard-unit-tests.md) set both
`dashboard/frontend-tests/` (plain Vitest + embedded Chromium) and
`dashboard/backend-tests/` (plain Node Vitest) moving off `@playwright/test`,
leaving **`e2e/` as the sole Playwright suite**. Sequence after `SEED-413`
retires `frontend.playwright.config.ts` and `backend.playwright.config.ts`:
retire obsolete multi-Playwright-group wrappers from `dashboard/test-support/`
(adding no new wrappers to `test-support` under the
[Architectural North Star](../NORTH-STAR.md)), check each CI workflow's Node,
npm and browser acquisition bounds per file, and align live placement wording
(`Distribution/tests/test-environment.md`, `Distribution/tests/ci/ci-container.md`).
Historical records keep their recorded names.

Use the [Project Intent revision family](https://github.com/terryyin/open-dough/blob/2294ce3f9f4fa243024941f689e862ee01b7d0bf/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#project-intent-revision-family-example)
as a concrete placement example. Its browser component cases use frontend
Vitest, and the composed revision-apply journey belongs to the E2E group.

**Plan:** [Keep one browser test group roster](../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md) (realign during refinement after `cfa20d7a6` and backend runner renovation)

