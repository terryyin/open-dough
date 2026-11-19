---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="observe-tagged-install-and-read-e2e-proof"></a>

### Observe a tagged installed workflow and read E2E proof in Intent

**Identity:** SEED-334#observe-tagged-install-and-read-e2e-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer sees a representative workflow run released
  Open Dough commands in an installed project, and reads **E2E Test** proof in
  Intent under its own name without false continuity from the retired
  `dashboard/tests` evidence.
- **Evaluation.** An isolated project with Open Dough installed from published
  `v0.3.97` (tag, resolved revision and installed version recorded) starts
  story preparation from the dashboard under `npm run test:e2e`, and the
  installed command publishes the assignment to its bare origin; a missing or
  unverifiable pinned release fails clearly without branch fallback. Each E2E
  journey names its real integrations and simulated boundaries. Project
  Intent, Purpose, Proof, story CI comparison and history name the **E2E
  Test** entry, open registering-helper sources, keep old `dashboard/tests`
  evidence readable at its revision, and show absent or changed scopes
  without fabricated numeric comparisons or dead links.
- **Inputs.** Scope 3, 4, 7 and 8 and Key examples 1 and 5 of
  SEED-334#run-and-observe-product-wide-end-to-end-tests, and plan slices 5
  and 6 with their premises and the accepted tagged prerequisite proof in its
  preparation assessment, recoverable at commit
  `d21a0ebc5ee0426f9898d10725c9e7765f49bc8e` from
  `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md` and
  `.planning/slice-plans/608-product-wide-end-to-end-tests/PLAN.md`.
- **Boundary.** No new release, native agent acceptance or speed work. Keep
  only the representative tagged-install workflow in `e2e/` (`@playwright/test`);
  prove single-service Intent, history, and absent/changed-scope reading rules
  in plain Node Vitest on strongly typed backend handlers and plain Vitest +
  embedded headless Chromium on narrow owning Intent UI components, adding no
  wrappers to `test-support` ([Architectural North Star](../NORTH-STAR.md)).
  The [Intent reading contract](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
  should let the unit test suite render a changed scope from its typed proof
  data without arranging an installed workflow or agent launch.
- **Value / learning.** Completes the product-wide E2E goal's installed and
  Intent-reading promises on the runners SEED-334 delivered.
- **Safe stopping point.** The tagged journey alone, or the Intent naming and
  history alone, is complete on its own.

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

**Plan:** [Keep one browser test group roster](../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md) (realign during refinement after `cfa20d7a6` and backend runner renovation)

