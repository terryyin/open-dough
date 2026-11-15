---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="finish-dissolving-integrated-ui-test"></a>

### Move session, terminal, story and observation checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#finish-dissolving-integrated-ui-test
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/632-finish-dissolving-integrated-ui-test/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4d9748da985315a89b217acda3f0bbae9db4590011a0244489894602415a76d1","plan":"7bf63d8e5fde800ceeafef0559a8a61a826a456c6a1df4326d94038328647ae4"}}
```

#### Goal

Developers get detailed feedback from Frontend and Backend unit tests and
confidence from representative E2E workflows for the session, terminal,
story and observation surfaces, continuing the conversion begun by the
configuration, launch and session-lifecycle batches. Every distinct
regression assertion these interim cases provide keeps a home that catches
the same regression, and the `sessions`, `terminals`, `review`, `stories`
and `observation` folders of **Dashboard Integrated UI Test** become empty.

#### Scope

- **Convert this half's behavior.** Final reports and workspace retirement,
  recently done sessions, the sessions sidebar, terminals, story review,
  published-story presentation and progressive done reading, and
  published-fact observation leave the interim group. Include cases added
  after the original inventory, such as `recently-done-returned-sessions.spec.ts`
  and `story-review-diff-line-follow-up.spec.ts`. The inventory classifies
  starting candidates, not the complete set of promises.
- **Place each assertion at its observable boundary.** A representative
  workflow requiring the real page and backend belongs in E2E, preferably an
  existing journey. Detailed UI behavior belongs in Frontend, running the
  built page or production component with controlled backend answers.
  Detailed backend contracts belong in Backend through their public boundary
  without a page. Split mixed cases by the assertions they actually make.
  Run real code and collaborators inside the selected service, substituting
  only external service boundaries needed by the case.
- **Preserve protection.** Compare each converted case with its interim
  assertions, including negative observations such as commands that must not
  run. For representative changed proof boundaries, demonstrate that a
  scratch break of the same rule is caught before and after conversion.
  Remove the replaced interim specs and their duration-list rows together.
  This guards against a cheaper test losing a distinct promise; the previous
  conversion's [completion record](../done/SEED-334_focus-detailed-dashboard-ui-checks.json)
  documents and repairs one such lost no-native-command assertion.
- **Safe stopping point.** A converted batch preserves its complete distinct
  checks and removes its interim copies. The interim runner remains for the
  Intent and navigation cases owned by
  [the retirement story](#retire-dashboard-integrated-ui-test).

**Scope limits.** No Intent or navigation conversion and no runner
retirement; [the retirement story](#retire-dashboard-integrated-ui-test)
owns them. No new browser group, speed or shard-count target, or product
behavior change. [SEED-341](SEED-341-simplify-session-tests.md#simplify-remaining-session-tests)
owns later session-test simplification. No wholesale re-inventory is required
before conversion. Align affected cases with existing page-object work rather
than preserving competing rewrites.

**Inputs.** The former whole-dissolution story's Goal, Scope, Key examples
and Architecture are recoverable at `788c5a64ca128ee64bc10ffe752f617633a28127`
in this seed; earlier inputs at `245c4feedb5a59e5d138df5a2b3c41700667786b`.
Starting classifications and conversion batches are at
`125c45649fa587c78ed7445deff35db87604489d` in
`.planning/slice-plans/608-product-wide-end-to-end-tests/migration-purpose.json`,
`migration-conversion-batches.json` and `migration-trunk-merge.json`.
The [associated plan](../slice-plans/632-finish-dissolving-integrated-ui-test/PLAN.md)
retains delivered substitute families and sizing learning.

#### Key examples

1. A final-report case asserts touch reading and focus, plus passive native
   behavior and persisted session state. When converted, Frontend observes
   UI against controlled report/session answers, while a representative E2E
   journey and/or Backend contract retains the persistence and no-native-work
   assertions. No distinct assertion disappears with the interim copy.
2. A Recently done, sidebar, terminal, review or story case has mixed
   workflow and UI assertions. Conversion places each at its real boundary;
   frontend details no longer start a backend or synthetic native host, and
   integration assertions still exercise the real connecting services.
3. A spec absent from the old inventory still exists when its batch is
   converted. Its actual assertions determine placement and preservation;
   omission from the inventory never permits leaving it behind or deleting
   its regression protection.
4. When this story completes, no product spec remains under
   `dashboard/tests/{sessions,terminals,review,stories,observation}`, and the
   interim runner still runs the remaining Intent and navigation cases.

#### Architecture

Reuse the existing built-app Frontend fixture and service-family substitutes,
the public Backend harness, and representative E2E journeys. Extend substitutes
by the service responsibility needed now, keeping one representation rather
than creating a new test tier. Follow
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for maintained procedures versus observed proof, and
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
for regression preservation against the interim baseline. The existing
[North Star](../NORTH-STAR.md) remains applicable; this conversion needs no new
architectural direction.

#### Story boundary

Terry asked on 2026-11-15 to split the whole-dissolution story in half so each
half fits the eight-slice plan limit and 15-active-minute slices. This story
keeps the original identity and converts the session, terminal, review, story
and observation folders (102 specs, about 15.9k lines). Its sibling
[Move Intent and navigation checks out and retire Dashboard Integrated UI Test](#retire-dashboard-integrated-ui-test)
converts the remaining 113 specs (about 17.5k lines) and retires the group.
Together they keep the whole original outcome; nothing is dropped.

<a id="retire-dashboard-integrated-ui-test"></a>

### Move Intent and navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-dashboard-integrated-ui-test
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from SEED-334#finish-dissolving-integrated-ui-test on 2026-11-15; that
story's [Story boundary](#finish-dissolving-integrated-ui-test) records why.

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
  [the first half](#finish-dissolving-integrated-ui-test).
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
