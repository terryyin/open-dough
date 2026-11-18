---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests


<a id="keep-navigation-conversion-proof-whole"></a>

### Keep the converted navigation proof whole and time-independent

**Identity:** SEED-334#keep-navigation-conversion-proof-whole
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md"}
```

**Goal:** A maintainer relies on the Frontend navigation checks that
SEED-334#move-navigation-checks-and-retire-integrated-ui-test converted: the
header's non-eager read counts hold however long a journey takes, the paging
view beside a newly arrived session keeps a home, and no live comment points
at a deleted interim spec.

**Scope:** Correct that execution's delivered Frontend specs and the one stale
E2E comment its retrospective found; no product change, no other conversion.

**Plan:** [Converted navigation proof correction](../slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md).

<a id="share-one-executing-agent-roster-arrangement"></a>

### Share one Frontend arrangement of an agent executing Open Dough's Taken story

**Identity:** SEED-334#share-one-executing-agent-roster-arrangement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/694-share-one-executing-agent-roster-arrangement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"988812d5a796704445537efb7f1ff833788727cdd1cd77593445032e169bed83","plan":"1203256add27181caa88d95861d382066fb6d529f1153c0ca2adf639678445bd"}}
```

**Goal:** A maintainer changes the Frontend arrangement of Open Dough with one
agent executing its Taken story in one place, so the roster and story URL
journeys cannot drift apart.

**Scope:** Retrospective correction of
SEED-334#retire-integrated-ui-test-and-its-documents (commit `c2f93725c`):
`publishRosterStory` in `dashboard/tests/support/frontendStoryUrlDestination.ts`
and `openRoster` in
`dashboard/frontend-tests/stories/agent-roster-collection.spec.ts` publish the
same revision through one shared arrangement, keeping each journey's agent
name, optional settings file and every assertion. No product change.

**Plan:** [Shared executing-agent roster arrangement](../slice-plans/694-share-one-executing-agent-roster-arrangement/PLAN.md)

<a id="move-story-reference-checks"></a>

### Move story reference checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-story-reference-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/689-move-story-reference-checks/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and realignment of provisional plan 689."],"basis":{"document":"ee3fc9c8330b4d6983fdeec0f61ef21f987f1e4e1a902d32868a19602da0e199","plan":"0f96086affee62291875a8b9549691a64c6f7a4c63a700b69ef61388c1f39366"}}
```

- **For / why.** A maintainer keeps story-reference navigation protection
  (active and Done references, their identity, cancellation and recovery) in
  maintained homes, leaving source navigation as the interim group's last
  spec.
- **Evaluation.** `story-reference-navigation`, `-identity`, `-recovery`,
  `-done`, `-done-cancellation` and `-done-recovery` (6 specs, 1,075 lines,
  19 tests) keep every distinct assertion at its real boundary. A pending
  Done-story reference superseded by a later move, a pointer down or Tab away
  before its held detail arrives keeps its cancellation, recovery and focus
  assertions in Frontend homes with controlled answers; the Backend keeps any
  request-count or refusal rule. The interim group still runs with
  `source-navigation` alone, its shard declaration reduced to what selects a
  spec.
- **Inputs.** Key example 1 of the earlier scope at
  `87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`; the dependency arrangement
  `putFrontendDependencies` (`dashboard/tests/support/frontendStoryDependencies.ts`),
  which publishes dependency answers for Frontend cases.
- **Boundary.** No product behavior change, retirement or Markdown removal.
- **Safe stopping point.** Active references alone, or Done references alone,
  is complete on its own.

**Plan:** [Provisional story reference conversion](../slice-plans/689-move-story-reference-checks/PLAN.md)

<a id="retire-emptied-integrated-ui-test-group"></a>

### Move source navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-emptied-integrated-ui-test-group
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-334#retire-emptied-integrated-ui-test-group","dependencies":[{"supplier":{"identity":"SEED-334#retire-integrated-ui-test-and-its-documents","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents"},"implementation":"Converts the story destination and card selection specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The four story destination and card selection specs are gone from dashboard/tests/navigation on trunk.","state":"waiting"},{"supplier":{"identity":"SEED-334#move-story-reference-checks","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks"},"implementation":"Converts the six story-reference specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The six story-reference specs are gone from dashboard/tests/navigation on trunk, leaving source-navigation as the group's only spec.","state":"waiting"}]}
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

<a id="carry-dashboard-test-knowledge-in-code"></a>

### Carry dashboard test knowledge in test code and remove its Markdown

**Identity:** SEED-334#carry-dashboard-test-knowledge-in-code
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/691-carry-dashboard-test-knowledge-in-code/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and realignment of provisional plan 691."],"basis":{"document":"0215b0006e143bd4904208a442251596d4506e27083076f8324e48426169730c","plan":"d5b3ab5297baec05dd4d9723317d53f1312d4b5b3b237e31bb449aeac3c7a65f"}}
```

- **For / why.** A maintainer reads what the dashboard tests arrange,
  replace, place and record from the test code itself rather than from
  Markdown beside it, so that knowledge cannot drift from the code that
  embodies it.
- **Evaluation.** Every Markdown file under `dashboard/tests/` is removed:
  `README.md`, `feature-groups.md`, `shards.md`, `fixture-origins.md`,
  `intent-ci-comparison-proof.md`, `native-host-fixtures.md`,
  `proof-record.md`, `fluent-side-panel-pilot.md`,
  `fixtures/preparation-assignment-v0.3.51.md` and the whole spent
  `manual/2026-10-13-mobile-dashboard/` folder (report, `findings.json`,
  images and DOM capture; both its discrepancies are closed). Each
  still-current fact is represented in test code: names of specs, builders,
  page objects, fixtures and helpers, their types and configuration
  (`proofRecordTypes.ts`, `runnerConfig.mjs`, Playwright configs, `ci.yml`),
  or an existing or added executable check where the fact is a rule. History,
  measurements and interim-group notes are dropped; Git recovers them.
  Maintainer procedure a skill consumes, such as the shard job-count
  reasoning `rebalance-ci-shards` cites, moves into that skill. Every live
  incoming link (`AGENTS.md`, `e2e/README.md`, `dashboard/README.md`,
  `dashboard/frontend-tests/README.md`, `dashboard/backend-tests/README.md`,
  `Distribution/tests/README.md` and its sibling guides, the
  `rebalance-ci-shards` skill, CI workflow and code comments, findings and
  active seeds) points to the code that now carries the fact, or is dropped.
  Historical records and fixture bytes keep their recorded links.
  `find dashboard/tests -name '*.md'` returns nothing, and no live link
  points at a removed file.
- **Examples.** A maintainer wondering which synthetic hosts stand in for
  Claude, Codex and Cursor finds the answer in the fixture builders and their
  names; one reading a proof record finds its fields in
  `proofRecordTypes.ts`. A frontend-only spec that starts the real dashboard
  server breaks a placement rule the README states today; the rule is carried
  by an executable check or by the support module a frontend spec can import,
  not by prose. AGENTS.md's test-automation entry points at code (the MakeMe
  builders, the page-object entry and the fluent side-panel journeys).
- **Inputs.** Scope item 2 and Key examples 3–5 of the earlier scope at
  `87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`; document removal was requested
  in the refinement of
  SEED-334#move-navigation-checks-and-retire-integrated-ui-test on
  2026-11-17.
- **Boundary.** Other test roots' Markdown stays, gaining only repointed
  links; no product behavior change. Independent of the conversions: it can
  run before or after the retirement, dropping whatever interim-group notes
  remain.
- **Safe stopping point.** Each removed document with its facts rehomed and
  links repointed is complete on its own; `README.md`, the hub, goes last.

**Plan:** [Provisional document removal](../slice-plans/691-carry-dashboard-test-knowledge-in-code/PLAN.md)

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

