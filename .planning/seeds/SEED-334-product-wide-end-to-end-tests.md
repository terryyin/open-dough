---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests


<a id="retire-dashboard-integrated-ui-test"></a>

### Move Intent and navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-dashboard-integrated-ui-test
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from SEED-334#finish-dissolving-integrated-ui-test on 2026-11-15; that
story's spent Story boundary (recoverable from before-cleanup) records why.

#### Goal

Only Frontend, Backend and representative E2E dashboard test layers remain.
The Intent and board/navigation checks leave **Dashboard Integrated UI Test**
with every distinct regression assertion preserved, and the empty group is
retired without making old integrated proof look current.

#### Scope

- **Convert the remaining behavior.** Intent CI status/history/proof/
  comparison, story and done review, revision, source/Purpose/Gherkin and
  reading-recovery checks, and board, frame/header/side-panel and
  story/project selection and reference navigation checks leave the interim
  group. This includes the direct Backend conversion of
  `intent-ci-status-read-boundary.spec.ts`. Placement, protection and
  scratch-break rules are the same as in
  the first half (SEED-334#finish-dissolving-integrated-ui-test, spent).
- **Retire the empty group.** Once every interim product case, including the
  first half's, has another home, remove its current Intent location,
  `test:dashboard:integrated` npm command, Playwright configuration, CI
  producer and shards, duration lists, and live tooling/placement references.
  Update the roster or its current hard-coded callers to describe E2E,
  Frontend and Backend. Keep shared helpers and fixtures under
  `dashboard/tests/` that those groups still import; the unrelated
  `integratedStateCompletion` setting remains unchanged.
- **Keep historical proof honest.** An integrated artifact from an older
  revision remains readable at that revision. It must not appear as current
  proof after retirement, acquire fabricated numerical comparisons across
  absent or changed scopes, or expose dead source links.
- **Safe stopping point.** A converted batch is complete on its own; the
  story completes only after retirement.

**Scope limits.** No new browser group, speed or shard-count target, product
behavior change, Intent E2E naming or tagged-install proof. The latter belong
to [the installed-workflow and E2E-proof story](#observe-tagged-install-and-read-e2e-proof).

#### Key examples

1. The CI-status read case sends malformed branch, revision and kept-form
   queries through page fetch only to inspect HTTP answers and GitHub calls.
   Conversion sends those requests directly to the Backend boundary and keeps
   every refusal and no-additional-GitHub-call assertion without a browser.
2. An Intent or navigation case with mixed workflow and UI assertions places
   each at its real boundary, keeping representative real server/SSE journeys
   in E2E.
3. Every interim product case has a maintained home. Retirement leaves three
   current browser groups and no integrated producer or npm command. Shared
   support remains usable, and an old integrated proof can still be read at
   its original revision without looking current or inventing comparisons.

#### Readiness note

Retirement needs the first half's conversions on trunk; Intent and
navigation conversion can start independently. The provisional
[plan](../slice-plans/633-retire-dashboard-integrated-ui-test/PLAN.md) maps
the original plan's remaining slices.

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
