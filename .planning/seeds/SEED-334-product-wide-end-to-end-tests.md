---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="focus-detailed-dashboard-ui-checks"></a>

### Move configuration, launch and session lifecycle checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#focus-detailed-dashboard-ui-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/627-dissolve-dashboard-integrated-ui-test/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84583feaac383742064c6d3bcbe597b8607c2ee262180f04ed6548d41023d7eb","plan":"8eecd3c51256fe982ee28294eb46d325919c2cfeaabf43bbd67a7ecce04caffd"}}
```

#### Goal

Developers get detailed feedback from unit tests for one service and confidence
in representative product workflows from end-to-end tests for the dashboard's
configuration, launch, and session lifecycle checks: the interim **Dashboard
Integrated UI Test** group no longer holds those batches. Every distinct
behavior those batches proved keeps a home that catches the same regressions.

#### Scope

- **Batches.** The configuration batch, the launch dialog and start batch, and
  the session lifecycle and done-terminal part of the sessions batch
  (`agent-launch-ad-hoc-sessions`, `agent-launch-retained-history`,
  `agent-launch-sessions-unanswered`, `agent-launch-story-card-delete` and its
  problems, `agent-launch-story-card-done`, `agent-terminal-done` with its
  pending and question cases, `compact-session-entry`,
  `session-unread-report-message`).
- **E2E.** Promote only the few remaining representative workflows whose
  observable outcome still requires the real dashboard frontend and backend
  together. Prefer an existing E2E workflow when it already proves that outcome.
- **Unit.** Move the majority of these interim checks into Dashboard
  Frontend Test or Dashboard Backend Test. “Unit” here means those service-level
  Playwright groups: exercise one service at its highest practical entry point
  (built UI with controlled answers, or a backend boundary), or a lower entry
  point when the behavior is clear and the dependency stable; run the service’s
  real code and in-boundary collaborators; stay independent of other live
  services; mock only a service boundary the case needs (for example a
  substitute backend answer for a frontend case). Split mixed specs when their
  assertions belong at different boundaries.
- **Placement.** Use the migration inventory at
  `125c45649fa587c78ed7445deff35db87604489d`
  (`.planning/slice-plans/608-product-wide-end-to-end-tests/migration-purpose.json`,
  `migration-conversion-batches.json`, and `migration-trunk-merge.json`) as the
  starting classification. Decide each case by its behavior.
- **Preservation.** Compare representative converted cases with their previous
  versions so the simpler placement keeps the assertions that catch regressions
  ([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)).
- **Coordination.** This story owns interim placement of its batches into E2E /
  Frontend / Backend. [SEED-341#simplify-remaining-session-tests](SEED-341-simplify-session-tests.md#simplify-remaining-session-tests)
  owns later simplification inside those homes. Align touched files with
  queued SEED-300 page-object work rather than migrating a spec that work is
  rewriting in place.
- **Remaining work.** The other interim batches and the retirement of the
  interim entry and its runner belong to
  [SEED-334#finish-dissolving-integrated-ui-test](#finish-dissolving-integrated-ui-test).
- **Safe stopping point.** Each migrated batch preserves its distinct checks and
  removes the interim specs it replaces.

**Scope limits.** No new browser test group or permanent renaming of the
interim tier; no speed or shard-count goal; no wholesale re-inventory before
conversion; no product behavior change.

**Required restrictions.** Do not drop a distinct regression assertion when
relocating a case. Do not mock inside a service except at the boundary the unit
case needs.

**Plan:** [Move configuration, launch and session lifecycle checks](../slice-plans/627-dissolve-dashboard-integrated-ui-test/PLAN.md)

#### Key examples

1. Pre-condition: `dashboard/tests/configuration/` still holds interim specs
   classified for Frontend or split conversion. Trigger: the configuration
   batch is converted. Result: each distinct check runs under
   `npm run test:dashboard:frontend` and/or `npm run test:e2e` as its
   assertions require; those interim files and their duration-list rows are
   gone; a representative Frontend case still fails the same way as its prior
   integrated version when the asserted UI rule is broken.
2. Pre-condition: a mixed launch or session spec asserts both a real
   frontend–backend workflow outcome and detailed UI against answers the page
   alone can own. Trigger: the case is split. Result: the workflow portion
   lives in E2E (or joins an existing E2E journey); the UI portion lives in
   Frontend with controlled substitutes; neither side keeps the other’s
   dependencies.

#### Architecture

Follow [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(fast feedback from unit and end-to-end checks; one representation per
conceptual solution) and [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(Proof distinguishes maintained procedures from particular observed results).
Use existing tests as the improvement baseline under
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

Consequential design, not a new ADR: shared harness modules stay under
`dashboard/tests/` even when that tree holds no interim product specs, because
E2E and Frontend import them. Retiring the interim group belongs to
SEED-334#finish-dissolving-integrated-ui-test. No Accepted ADR conflict: the
path continues the two-layer proof model those decisions already support.

#### Alternatives, borrow, and evidence

Material options compared on the same goal (two layers, every distinct check
kept, interim entry gone):

1. **Strangler conversion by inventory batches** — convert and shrink the
   interim group batch by batch with controlled Frontend substitutes and
   E2E/Backend homes, then retire the entry. Keeps regression coverage while
   learning placement cheaply.
2. **Lift-and-shift into Frontend/E2E folders without substitute rewrite** —
   smaller edit surface, but cases that still start the real server fail the
   unit-layer independence promise.
3. **Delete the interim group and keep only today’s E2E set** — retires the
   entry immediately, but drops hundreds of distinct detailed checks and fails
   the preservation baseline.
4. **Keep a permanent third “detailed UI” group** under another name —
   rejects the stated two-layer goal.

Recommend (1). Borrow a strangler-fig cutover: the interim group is the legacy
surface; E2E / Frontend / Backend are the replacement modules; each batch
migrates traffic while both coexist; cutover removes the legacy Intent/CI/npm
facade when the interim tree has no remaining product cases. The analogy breaks
at permanent coexistence — here the facade must disappear, not remain as a
routing shell.

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
