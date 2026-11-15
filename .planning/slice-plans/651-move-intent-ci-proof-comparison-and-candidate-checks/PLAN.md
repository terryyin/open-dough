# Move Intent CI proof, comparison and candidate checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-intent-ci-proof-comparison-and-candidate-checks
**Source:** [Move Intent CI proof, comparison and candidate checks](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-intent-ci-proof-comparison-and-candidate-checks)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Preserved scope and mapping

Maps plan 633 slices 6–10 at `4ceb02349033764c7dc0fa842e184180626f99e7`,
where plan 633's slices 1–5 delivered the CI status, wall-time history and
scope timing conversions. The 20 remaining Intent CI specs retain every
distinct assertion. Reuse plan 633's decisions (service-answer families beside
existing substitutes, Backend/E2E for acquisition and request counts, one
representative scratch break per changed boundary) and its delivered families:
`dashboard/tests/support/frontendCiStatusAnswers.ts` (`serveFrontendCiStatus`,
`openFrontendCiStatus`, `openFrontendRunProof` from `makeMe.aCiProof`),
`frontendCiHistoryAnswers.ts` with `makeMe.aCiHistoryAnswer`, and
`summaryScopeHistory.ts`.

Sizing history carried from plan 633: one new Frontend answer family costs most
of a 15-active-minute slice; plan 633 overran at wall-time history (family plus
four specs and home inspection) and at scope glance (unforeseen Done-story
built-app arrangement). Proof (seven specs) carries the same risk; refinement
should split it before execution.

Carried obligation: plan 633 G1 — slice 2 replaced execution-time's collector
ZIP extraction with `makeMe.aCiProof`; the proof slice verifies or adds
Backend/E2E homes for its missing-part/untimed extraction (story clause:
"Backend/E2E keep real parsing, acquisition, refusal and request counts").

## Provisional slices

### 1. Preserve the Done-story scope glance
Type: Behavior
Proof: `intent-scope-glance.spec.ts` (1 / 212): selected landing and folder
values, 7 marks with the failed build's ×, average line position, unit by touch
and keyboard, no removed evidence words, story CI comparison button and Purpose
tab, file Proof "Baseline", dark-mode contrast, no extra `actions-*` calls.
Behavior: open a Done story and drill entry → folder → file Proof → the same
values, marks and destinations remain protected. Needs a built-app Done-story
arrangement (no Frontend fixture opens one with file Proof/Purpose tabs; the
Project twin `intent-project-scope-glance.spec.ts` covers a different journey).
GitHub call accounting goes to Backend/E2E.

### 2. Preserve CI proof reading and query refusal
Type: Behavior
Proof: three `intent-ci-proof*` and four `intent-summary-ci-proof-*` specs
(7 / 1,060): table/grouping/accessibility/kept/gaps/sort; direct Backend
omitted-attempt refusal without an extra GitHub ask.
Behavior: open proof or select a configured entry → the same run, attempt,
counts, timings, gaps, accessible cells and destinations remain protected.
Own one proof-answer family; real ZIP/artifact acquisition and attempt memory
keep Backend/E2E homes. Historical-only entries still have no dead source link;
do not rewrite old entry identities.

### 3. Preserve comparison navigation and preferences
Type: Behavior
Proof: four `intent-ci-comparison-*` and two `intent-summary-story-comparison-*`
specs (6 / 998): count-gaps, drilldown-relative, locations, relative, file, sort.
Behavior: compare a story, change scope/sort/Show %, or open its file → the same
gaps, signed marks, percentages, order, focus and pinned destinations remain
observed across views. Reuse production mounts/bindings; add only missing
full-app answers. Retain real API/upstream counting from comparison-locations
at Backend/E2E, not substitute logs.

### 4. Preserve candidate selection and Purpose targets
Type: Behavior
Proof: `intent-test-optimization-candidates.spec.ts`, `…-case`, `…-open`
(3 / 595): list identity and source/case/Purpose navigation, including refusals.
Behavior: choose a recorded candidate → actual controls open its source and
case at the same revision/reading position. Reuse candidate/file/location
substitutes; any held/failed candidate answer family is owned here. Real
candidate acquisition stays outside Frontend.

### 5. Preserve candidate refresh and close the CI conversion
Type: Behavior
Proof: `intent-test-optimization-candidates-{live,revision,states}` (3 / 339),
all 20 assertion dispositions and remaining interim selection.
Behavior: change project/revision or receive live/failed candidate answers →
the same freshness, state and stale-answer exclusion remain protected; no
selected CI spec remains in the interim group. Reuse slice 4's family. Run
`npm run test:dashboard:integrated -- --list --reporter=line`: only the 37 reading/review
Intent and 41 navigation specs remain (adjust for independent conversions).
Keep `groupRunnerExamples.ts` runnable: when its title example moves, select a
still-interim case and actual title, with focused runner-ownership proof.
