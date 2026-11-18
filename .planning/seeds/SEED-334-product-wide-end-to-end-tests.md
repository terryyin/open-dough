---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="retire-emptied-integrated-ui-test-group"></a>

### Move source navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-emptied-integrated-ui-test-group
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-334#retire-emptied-integrated-ui-test-group","dependencies":[{"supplier":{"identity":"SEED-334#retire-integrated-ui-test-and-its-documents","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents"},"implementation":"Converts the story destination and card selection specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The four story destination and card selection specs are gone from dashboard/tests/navigation on trunk.","state":"satisfied","resolution":{"revision":"7649aea947b870eb8d84da67f0fa63d0a9c6b9bb","path":".planning/seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents","summary":"At accepted trunk 5fa614519, dashboard/tests/navigation holds only source-navigation and the six story-reference specs; notification-story-navigation, story-destination-repeat-cue, story-card-selection and story-card-dependency-selection moved to dashboard/frontend-tests/navigation with all four plan 688 slices done.\nCondition satisfied: The four story destination and card selection specs are gone from dashboard/tests/navigation on trunk.\nAccepted integration: 5fa614519b253763f6153d596b0e35d1fa7472e1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-334#move-story-reference-checks","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks"},"implementation":"Converts the six story-reference specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The six story-reference specs are gone from dashboard/tests/navigation on trunk, leaving source-navigation as the group's only spec.","state":"satisfied","resolution":{"revision":"badcebeb685c551d94f359e8e22cad41dc6e380b","path":".planning/seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks","summary":"At accepted trunk 37bac9d2c, dashboard/tests/navigation holds only source-navigation.spec.ts; the six story-reference specs moved to dashboard/frontend-tests/navigation with all eight plan 689 slices done and the integrated group's --list showing 3 tests in 1 file.\nCondition satisfied: The six story-reference specs are gone from dashboard/tests/navigation on trunk, leaving source-navigation as the group's only spec.\nAccepted integration: 37bac9d2cb857fd1ae88ed599f47ec4dd1a81703 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/690-retire-emptied-integrated-ui-test-group/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and realignment of provisional plan 690."],"basis":{"document":"a0e8b3a7d1ce364e70fa28b488b55af7566a2ec89be47e3c1b4fdf6aed79f25d","plan":"734f6b6985aa0d5b372590cd28d7c0d18b9873d080c8f7a14fb41284bc60aaac"}}
```

- **For / why.** A maintainer keeps source navigation protection in
  maintained homes and runs only the **E2E Test**, **Dashboard Frontend
  Test** and **Dashboard Backend Test** browser groups.
- **Evaluation.** `source-navigation` (246 lines, 3 tests) keeps every
  distinct assertion: link targets, external references and refused targets
  in a Frontend home, the server's exact GitHub read list and "nothing leaves
  the server" in a Backend home. The emptied group retires in the same
  delivery that converts this last spec, because a CI shard pattern or group
  selecting no spec is refused: its Intent location, npm command, Playwright
  config, `dashboard-integrated` CI producer and shards, global setup, and
  live tooling and placement references. Shared support other groups import
  stays, as does `integratedStateCompletion`. Use the browser group roster
  where SEED-334#keep-one-browser-test-group-roster has delivered it,
  otherwise its current hard-coded callers. Every remaining group runs
  unchanged. Old integrated proof stays readable at its original revision,
  absent from current proof, with gaps rather than fabricated numeric
  comparisons or dead source links.
- **Inputs.** Scope item 3 and Key example 2 of the earlier scope at
  `87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`; provisional plan 648 slice 7
  and its retirement consumers at
  `4eb4f8e594ee003a2894c28c8ab2600e1c42b835`.
- **Boundary.** No product behavior change, new group or tier, speed or
  shard target, E2E naming or tagged-install proof. The `dashboard/tests/`
  Markdown keeps only the edits that remove the retired group from it.
- **Safe stopping point.** None before retirement: the conversion and the
  retirement deliver together.

**Plan:** [Provisional source navigation conversion and retirement](../slice-plans/690-retire-emptied-integrated-ui-test-group/PLAN.md)

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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"336ccf3ea5faf948d4e9fd9f8c23622341080fdf457b55e6503fd07ad10e44a2","plan":"52f1257a33e40e7007d41363e4da8ecdf55252473b4ca9c27cc5f3f074ea84e6"}}
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

