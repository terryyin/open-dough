# Move navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#move-navigation-checks-and-retire-integrated-ui-test
**Source:** [Move navigation checks and retire the group](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-navigation-checks-and-retire-integrated-ui-test)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Preserved scope and mapping

Maps original plan 633 slices 5–8 at `f03e959480b2a04a7194b072cf71aa9da55ee1a9`.
All 41 navigation specs / 6,516 lines retain every distinct assertion in
Frontend, Backend or representative E2E homes. CI and other Intent are owned by
[plan 651](../651-move-intent-ci-proof-comparison-and-candidate-checks/PLAN.md) and
[plan 647](../647-move-intent-reading-and-review-checks/PLAN.md).
Navigation can start independently; retirement requires those outcomes on
trunk and every interim product case to have another maintained home.
The first half's five-folder conversion is delivered (`bfd4e7815`, closed
`7c746e323`); it is not unfinished preparation here.

## Provisional slices

### 1. Preserve board input and kept position
Type: Behavior
Status: provisional
Proof: `accessible-board*`, `board-clamp`, `board-height`, `board-kept`:
keyboard/touch/scroll, geometry and real browser storage/reload assertions.

### 2. Preserve board paging and reading
Type: Behavior
Status: provisional
Proof: remaining `board-*`: native/session reading, paging, launch-dialog,
sidebar, side-panel and scroll; preserve focus and non-eager read counts.

### 3. Preserve dashboard header and frame interaction
Type: Behavior
Status: provisional
Proof: `dashboard-header*`, `development-intent-frame*`: actual controls,
keyboard, selection, frame and session placement.

### 4. Preserve frame appearance, panel width and notifications
Type: Behavior
Status: provisional
Proof: `frame-*`, `side-panel-width*`, `notification-story-navigation`:
appearance, covering/kept width, touch, focus and notification destinations.

### 5. Preserve project, source and story-card selection
Type: Behavior
Status: provisional
Proof: `project-*`, `source-navigation`, `story-card-*`: project keyboard
eligibility/focus, chosen source and dependency/card selection.

### 6. Preserve reference navigation and recovery
Type: Behavior
Status: provisional
Proof: `story-reference-*`, `story-destination-repeat-cue`: stable identity,
done/body cancellation, held/failed recovery, repeated destinations and focus.

### 7. Retire the empty group and preserve historical evidence
Type: Behavior
Status: provisional
Proof: no `dashboard/tests/**/*.spec.ts` product cases remain; only E2E,
Frontend and Backend are current. Remove the Intent location, npm command,
Playwright config, `dashboard-integrated` producer/shards, duration lists and
live tooling/placement references. Keep all still-imported shared support and
`integratedStateCompletion`. Old artifacts/sources remain readable at their
revision, absent from current proof, with gaps instead of fabricated numeric
comparisons or dead links. Use explicit old/current/different-scope fixtures.

## Retirement consumers and refinement inputs

Trace `.planning/open-dough.json`, `package.json`, `.github/workflows/ci.yml`,
`dashboard/integrated.playwright.config.ts`, `integrated.longest-first*`,
`dashboard/tests/support/groupRunnerExamples.ts`, `runnerConfig.mjs`,
`integratedGlobalSetup.ts`, `Distribution/tests/support/browserGroupConfigs.mjs`,
`scripts/{dashboard-repeat.sh,ci-container.sh}`, CI repeat fixtures and current
placement/proof/shard/resource docs. Retain shared setup used by other groups.
Update the shared roster if delivered, otherwise current hard-coded callers;
do not implement the roster story as a prerequisite. Distinguish historical
fixtures and the unrelated integrated-state closure policy.

Focused `Distribution/tests/support/ci-browser-groups.test.mjs`, relevant CI
repeat/declaration tests, `Distribution/tests/test-runner/dashboard-repeat.sh`
and Backend `runtime/runner-ownership.spec.ts` observe remaining group ownership.
Current Intent listing/proof/history and historical-entry cases own old/current
evidence and links. Refine actual setup and discrimination before ready.
Each conversion owns assertion dispositions, paired scratch discrimination,
changed duration rows and affected consumers. Check the one-new-family budget
and 15-active-minute fit rather than treating this mapping as sizing proof.
Apply [AGENTS.md](../../../AGENTS.md#test-automation) and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate uses the maintained macOS
[sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; battery requires plugging in or
an open lid under `caffeinate -i` and a sleep-log check afterwards.
