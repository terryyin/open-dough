---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests


<a id="move-navigation-checks-and-retire-integrated-ui-test"></a>

### Move board, frame and project navigation checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-navigation-checks-and-retire-integrated-ui-test
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"94fa2e48315a6122dcf5bf68ecc116c119e49d28fdf63157ea429634a0dcd97c","plan":"e60ac3d8293dda12c4a0e81823d18492909fb7682d6a7c6299f3d817ae54ce0b"}}
```

**Goal:** A maintainer keeps Board, side-panel, frame, header and project
navigation protection in maintained Frontend, Backend or E2E homes, so those
checks no longer depend on the interim **Dashboard Integrated UI Test**
group.

**Scope:** Convert 30 of the 41 `dashboard/tests/navigation/` specs (4,627
lines): `accessible-board*`, `board-*`, `side-panel-width*`,
`development-intent-frame*`, `dashboard-header*`, `frame-*-look` and
`project-*`. Every distinct assertion, including keyboard/touch, focus,
geometry, real browser storage/reload, non-eager read counts and held/failed
recovery, keeps a named home at its real boundary. Remove each interim case
only once its replacement passes. The interim group stays runnable for its
remaining specs: its CI shard declarations and runner examples follow the
files that remain.

Scope limits: the source, story-card, notification and story-reference specs
and the group's retirement belong to
SEED-334#retire-integrated-ui-test-and-its-documents. No change to
`integratedStateCompletion`, product behavior, groups or tiers, speed or shard
targets, E2E naming or tagged-install proof.

**Key examples:**

1. `board-kept.spec.ts` checks that the chosen Board columns stay across a
   project switch, a reload and a wide Board, and that a position kept under
   the former key is recovered once. After conversion each assertion runs in a
   named Frontend case against real browser storage, and the interim file is
   gone.
2. `side-panel-width-kept.spec.ts` recovers a divider-chosen width after a
   reload within the room there is now, never replaced by an imposed width or
   Maximize, and starts at half the room where storage is refused or
   unusable. Those rules keep Frontend homes, with the covering variant's
   narrow-window and wide-window recovery beside them.
3. Help, editing, other arrow controls and modified arrows leave the selected
   project unchanged, and focus stays usable across keyboard project switches
   while a held previous read stays isolated. Those rules keep homes at
   their real boundaries; the interim command no longer lists any of the 30 files while its
   other specs still run in their declared shards.

**Plan:** [Board, frame and project navigation conversion](../slice-plans/648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md).

**Provenance:** Split from SEED-334#retire-dashboard-integrated-ui-test.
Refinement on 2026-11-17 sized all 41 navigation specs and retirement beyond
one plan, so the remaining navigation, the retirement and the removal of the
group's test documents moved to
SEED-334#retire-integrated-ui-test-and-its-documents.

<a id="retire-integrated-ui-test-and-its-documents"></a>

### Move story navigation checks out and retire Dashboard Integrated UI Test with its documents

**Identity:** SEED-334#retire-integrated-ui-test-and-its-documents
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** A maintainer keeps source, story-card, notification and
story-reference navigation protection in maintained homes, runs only the
**E2E Test**, **Dashboard Frontend Test** and **Dashboard Backend Test**
browser groups, and reads what the dashboard tests arrange, replace, place and
record from the test code itself rather than from Markdown beside it, so that
knowledge cannot drift from the code that embodies it.

**Scope:**

- Convert the remaining 11 navigation specs (1,885 lines):
  `source-navigation`, `story-card-*`, `notification-story-navigation`,
  `story-destination-repeat-cue` and `story-reference-*`, with every distinct
  assertion kept at its real boundary as
  SEED-334#move-navigation-checks-and-retire-integrated-ui-test does.
- Remove every Markdown file under `dashboard/tests/`: `README.md`,
  `feature-groups.md`, `shards.md`, `fixture-origins.md`,
  `intent-ci-comparison-proof.md`, `native-host-fixtures.md`,
  `proof-record.md`, `fluent-side-panel-pilot.md`,
  `fixtures/preparation-assignment-v0.3.51.md` and the spent
  `manual/2026-10-13-mobile-dashboard/` report with its `findings.json` (both
  its discrepancies are closed). Represent each still-current fact in test
  code: names of specs, builders, page objects, fixtures and helpers, their
  types and configuration (`proofRecordTypes.ts`, `runnerConfig.mjs`,
  Playwright configs, `ci.yml`), or an existing or added executable check
  where the fact is a rule. Drop history, measurements and interim-group
  notes; Git recovers them. Maintainer procedure a skill consumes, such as
  the shard job-count reasoning `rebalance-ci-shards` cites, moves into that
  skill. Repoint every live incoming link (`AGENTS.md`, `e2e/README.md`,
  `dashboard/frontend-tests/README.md`, `dashboard/backend-tests/README.md`,
  `Distribution/tests/README.md` and its sibling guides, the
  `rebalance-ci-shards` skill, CI workflow and code comments, findings and
  active seeds) to the code that now carries the fact, or drop it.
  Historical records keep their recorded links.
- Retire the emptied group in the same delivery that converts its last spec,
  because a CI shard pattern or group selecting no spec is refused: its Intent
  location, npm command, Playwright config, `dashboard-integrated` CI producer
  and shards, and live tooling and placement references. Shared support other
  groups import stays, as does `integratedStateCompletion`. Use the browser
  group roster where SEED-334#keep-one-browser-test-group-roster has
  delivered it, otherwise its current hard-coded callers. Old integrated
  proof stays readable at its original revision, absent from current proof,
  with gaps rather than fabricated numeric comparisons or dead source links.
  Retirement runs once SEED-334#move-navigation-checks-and-retire-integrated-ui-test
  and SEED-334#move-intent-ci-proof-comparison-and-candidate-checks are on
  trunk; the conversion and document work before it can start earlier.

Scope limits: other test roots' Markdown stays, gaining only repointed links;
no product behavior change, new group or tier, speed or shard target, E2E
naming or tagged-install proof.

**Key examples:**

1. A pending Done-story reference is superseded by a later move, a pointer
   down or Tab away before its held detail arrives. The cancellation, recovery
   and focus assertions keep Frontend homes with controlled answers; the
   Backend keeps any request-count or refusal rule.
2. With every other conversion on trunk, the last converted spec and the
   group's command, config, CI producer and Intent location leave together.
   Every remaining group runs unchanged, and an old Done story's integrated
   proof still opens at its revision with gaps where no current proof exists.
3. A maintainer wondering which synthetic hosts stand in for Claude, Codex and
   Cursor finds the answer in the fixture builders and their names; one
   reading a proof record finds its fields in `proofRecordTypes.ts`.
4. A frontend-only spec that starts the real dashboard server breaks a
   placement rule the README states today; the rule is carried by an
   executable check or by the support module a frontend spec can import, not
   by prose.
5. AGENTS.md's test-automation entry points at code (the MakeMe builders, the
   page-object entry and the fluent side-panel journeys) rather than at
   `dashboard/tests/README.md` and the pilot document;
   `find dashboard/tests -name '*.md'` returns nothing, and no live link
   points at a removed file.

**Provenance:** The remaining navigation, retirement scope and
historical-evidence promises come from SEED-334#retire-dashboard-integrated-ui-test
through SEED-334#move-navigation-checks-and-retire-integrated-ui-test
(provisional plan 648 slices 5–7 at `4eb4f8e594ee003a2894c28c8ab2600e1c42b835`);
document removal was requested in that story's refinement on 2026-11-17.

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

<a id="observe-no-stale-candidate-failure-after-show-latest"></a>

### Keep a departed candidate read from showing a failure after Show latest

**Identity:** SEED-334#observe-no-stale-candidate-failure-after-show-latest

**Goal:** A maintainer changing Test Optimization Candidates reading learns from
the Frontend held-answer case when a superseded revision's read can disturb
the record Show latest selected, so the stale-read guard stays protected.

**Scope:** Strengthen
`dashboard/frontend-tests/intent/intent-test-optimization-candidates-revision.spec.ts`
"a held answer for the old revision cannot replace the record Show latest
selected" so it also observes the window between Show latest and the new
record. Keep its existing assertions; no product change.

**Key example:** with both `!controller.signal.aborted && readId ===
activeRead.current` guards in `dashboard/src/IntentCandidatesRecord.tsx`
removed, the old revision's departed read reaches the catch branch and the
panel briefly shows "could not be read at this revision" with Retry before the
new record arrives. The strengthened case fails on that; restored, it passes.

**Provenance:** Intent Coverage check of SEED-334#move-intent-ci-proof-comparison-and-candidate-checks
at `309dacb410f71134bc1ff76b668bed907d541f4d`: assertion gap. The faulted case
passed 4 of 4; an independent MutationObserver witness saw the failure state.
Removing only one of the two conditions is an equivalent mutant there.
