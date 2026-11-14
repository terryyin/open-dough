---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="focus-detailed-dashboard-ui-checks"></a>

### Focus detailed dashboard UI checks on controlled answers

**Identity:** SEED-334#focus-detailed-dashboard-ui-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer reading or changing dashboard presentation,
  interaction or recovery gets that feedback from Dashboard Frontend Test with
  controlled backend answers, instead of from slower integrated journeys, and
  E2E Test keeps only representative product workflows.
- **Evaluation.** Every check in the interim **Dashboard Integrated UI Test**
  group (`dashboard/tests/`) runs in Dashboard Frontend Test with controlled
  answers, or in E2E Test or Dashboard Backend Test where its assertion needs
  that boundary, with each observed rule and meaningful integration proof
  preserved. The interim group, its command and its CI producer are gone.
- **Inputs.** The run that split this story classified 204 detailed-UI specs
  and 59 mixed specs, with per-case splits, effort and conversion batches
  (configuration settings, launch dialog and start, sessions and terminals,
  story review, Intent CI/proof/history, board and navigation), in
  `.planning/slice-plans/608-product-wide-end-to-end-tests/migration-purpose.json`
  and `migration-conversion-batches.json` at commit
  `125c45649fa587c78ed7445deff35db87604489d` (also `migration-trunk-merge.json` there for specs trunk added).
- **Boundary.** Coordinate with the queued SEED-300 page-object stories that
  touch the same specs. Speed optimization stays out of scope.
- **Value / learning.** Completes purpose-owned test groups; the substitute
  answers it adds are reusable for later focused UI checks.
- **Safe stopping point.** Each conversion batch, with its interim specs
  removed, is complete on its own.

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
- **Boundary.** No new release, native agent acceptance or speed work.
- **Value / learning.** Completes the product-wide E2E goal's installed and
  Intent-reading promises on the runners SEED-334 delivered.
- **Safe stopping point.** The tagged journey alone, or the Intent naming and
  history alone, is complete on its own.

<a id="keep-one-browser-test-group-roster"></a>

### Keep one browser test group roster and current placement guidance

**Identity:** SEED-334#keep-one-browser-test-group-roster
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"228aa0edf31bc3576ad6521b8d7271e44dce5d9fce9e5fc5ea4513a39df17aec","plan":"a733a54d4a53c979fe32348b737e9a6f0c13753d0e50ed345c74e8ef9cd3afd4"}}
```

#### Goal

A maintainer who adds, removes or reads the browser test groups delivered by
SEED-334#run-and-observe-product-wide-end-to-end-tests (recoverable at
`125c45649fa587c78ed7445deff35db87604489d`)
changes the group set in one place, finds helpers named for the groups they
run, has each CI producer's setup bounds guarded on their own, and reads
placement guidance that matches the independent groups.

#### Scope

Bounded retrospective correction of that execution's residue. Give the set of
browser test groups one authoritative home that proof-subprocess isolation,
the repeat helper, the container diagnostic and their tests derive from, with
a consistency check against `ci.yml` and `package.json`. Name the repeat
helper, the container option and shared selection helpers for browser test
groups rather than the dashboard. Check each workflow's Node, npm and browser
acquisition bounds separately. Correct the umbrella and placement wording in
`dashboard/tests/README.md`. Preserve every group's selection, settings,
outputs, shards, CI proof and the interim group; historical records keep their
recorded names. No new group, removal of the interim group, runner, CI job or
speed claim.

**Plan:** [Keep one browser test group roster](../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md)
