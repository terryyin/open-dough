# Declare every worker preparation with its own budget

**Identity:** SEED-340#declare-every-worker-preparation-with-its-own-budget
**Source:** [Worker preparation correction](../../seeds/SEED-340-test-preparation-outside-case-budgets.md#declare-every-worker-preparation-with-its-own-budget)

## Correction input

**Provenance:** retrospective of SEED-340#keep-one-time-test-preparation-out-of-case-budgets
(plan 685, story branch `claude/keep-one-time-browser-test-preparation-out-of-ca`),
range `29c9ce209..b4a3dce32`: slice commits `06eccefa7`, `dc6519dd5`,
`cbc0fb182`, `6a7043c2b`, `938e9cac7`, `b4a3dce32` and CI repairs `d7fbd57e1`,
`d285e9d2b`. Its source promised that one-time preparation for every
`preparationPage` consumer happens outside each case's 30 s budget through one
cohesive mechanism rather than per-spec opt-ins.

**Current findings** (read-only review at `b4a3dce32`; recheck at the current
revision before changing):

1. `dashboard/tests/support/keptComparedStoryBranch.ts` declares the
   worker-scoped `keptComparedStoryBranch` outside `pageTest.ts`, and
   `e2e/intent/intent-ci-comparison-retry.spec.ts` extends `test` with it for
   one case. `pageTest.ts:21-32` requires every worker-scoped fixture there:
   otherwise the specs split into worker populations, and each switch restarts
   a worker, its browser and its preparation. Introduced by `938e9cac7`.
2. `keptStory`, `keptIntentStory`, `keptSummaryComparisonStory`
   (`pageTest.ts`) and `queuedCodexOriginReady`
   (`serverInputWorkerFixtures.ts:101-102`) are plain `{ scope: "worker" }`,
   so their setup still counts against a first case's budget; the
   `queuedCodexOriginReady` comment wrongly says it has the worker's budget.
3. Leftover opt-ins: `queuedClaudePreviewTest` / `queuedCodexPreviewTest`
   aliases of `test` (`preparationPage.ts`, 25 E2E importers; a differently
   meaning `queuedClaudePreviewTest` in `responsiveStart.ts`),
   `queuedClaudeBoundaryTest` (`landedCiHistoryTest.ts`, ~10 backend specs;
   its origin part is now redundant, its bundle part is
   `dashboardBoundaryReady`), and an in-body `queuedCodexOriginReady` wait in
   `agent-launch-preparation-codex-retry.spec.ts`.
4. `codexObservation.ts:150-156` repeats what `appendedFileRecords`
   (`appendedRecords.ts`) now does.
5. `dashboard/backend-tests/runtime/test-preparation-budget.spec.ts` runs its
   nested proof under all three group setups that register the same origin
   artifacts; two of them also build an unused eager history each time.
6. No lasting assertion guards the custom development-mode server profile
   (story Example 6, second sentence): a later edit could request an unused
   preview app unnoticed (plan 685 slice 3).

**Preserved promises and constraints:** every existing assertion stays; no
product code change; default timeouts, no `test.slow()`, no wall-clock waits;
shared inputs immutable, per-case writable state private; files ≤250 lines;
MakeMe for all test roots and page objects in E2E/Integrated/Frontend.

## Proof gates

Each slice: rerun the installed test-entry selector and consumer trace for its
changed support, run the affected specs with the strict reporter (never
`--reporter=list`) through
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent <group script> -- <specs> --workers=1`,
and `npm run --silent typecheck:dashboard`. Local gate: `caffeinate -s -i` on
awake macOS on AC power, per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

## Ordered slices

### 1. Every worker preparation is pooled with its own lifetime
Type: Structure
Status: planned
Proof: findings 1–2. Declare `keptComparedStoryBranch` in `pageTest.ts` (dynamic
import, like `keptStory`) with `coldInputPreparation`, keeping only the
`originRepository` override in its module; give the kept stories and
`queuedCodexOriginReady` `coldInputPreparation` and fix the comment. The
retry spec's both cases run in one worker without a restart (worker index in
the runner's result), and the nested budget proof shows a kept story's
preparation outside the first case's interval.

Behavior: a first case whose worker builds a kept story → that build happens
outside its budget, and specs taking different kept histories share workers.

### 2. No per-spec preparation opt-in remains
Type: Structure
Status: planned
Proof: findings 3–4. Importers take `test` directly; the aliases and
`queuedClaudeBoundaryTest` go (its users await `dashboardBoundaryReady` where a
server starts), as does the in-body wait; `codexObservation` uses
`appendedFileRecords`. Affected specs pass by consumer trace; artifact trace
of one former boundary-opt-in spec shows the bundle and zero app requests.

### 3. Preparation proofs run once and guard the development profile
Type: Structure
Status: planned
Proof: findings 5–6. Keep the budget proof's backend-setup run and replace the
other two with a cheap check that each group setup registers both queued
origin artifacts. Add a nested proof that a development-mode custom server
records zero app and bundle requests; scratch break: request the preview app
in that profile → the new proof fails.
