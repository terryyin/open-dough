---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="finish-dissolving-integrated-ui-test"></a>

### Finish dissolving Dashboard Integrated UI Test

**Identity:** SEED-334#finish-dissolving-integrated-ui-test
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/632-finish-dissolving-integrated-ui-test/PLAN.md"}
```

- **For / why.** Developers get detailed feedback from Frontend and Backend
  unit tests and confidence from representative E2E workflows, with only those
  dashboard test layers left: the interim **Dashboard Integrated UI Test**
  group's remaining batches move out and the group itself is retired.
- **Evaluation.** The remaining interim specs — final report and workspace
  retirement, recently done sessions, the sessions sidebar, terminals, story
  review (including `story-review-diff-line-follow-up.spec.ts`), Intent
  CI/proof/history/Purpose (including the pending
  `intent-ci-status-read-boundary` server-boundary case), and board,
  navigation, stories and observation (including
  `recently-done-returned-sessions.spec.ts`) — each keep every distinct
  regression assertion in an E2E, Frontend or Backend home and leave
  `dashboard/tests`. Then Intent and CI no longer list **Dashboard Integrated
  UI Test**; `npm run test:dashboard:integrated`, its Playwright configuration,
  CI producer and shards, and current placement guidance naming it are gone;
  the browser-group roster (or its hard-coded callers) describes three groups;
  shared helpers under `dashboard/tests/support/` stay importable; an old
  integrated proof artifact stays readable at its revision without looking
  current or gaining fabricated comparisons or dead links.
- **Inputs.** Goal, Scope, Key examples 3 and 4 and Architecture of
  SEED-334#focus-detailed-dashboard-ui-checks before it was narrowed,
  recoverable at commit `245c4feedb5a59e5d138df5a2b3c41700667786b` from
  `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md`; that story's
  delivered Frontend substitute families and sizing learning; the provisional
  [plan](../slice-plans/632-finish-dissolving-integrated-ui-test/PLAN.md).
- **Boundary.** No new browser test group, speed or shard-count goal, Intent
  E2E naming or tagged-install proof, or product behavior change; SEED-341
  owns later session-test simplification.
- **Value / learning.** Completes the two-layer dashboard proof model the
  configuration, launch and session-lifecycle conversion started.
- **Safe stopping point.** Each converted batch is complete on its own; the
  story is complete when the interim entry and its runner are retired.

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
