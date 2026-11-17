# Move source navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-emptied-integrated-ui-test-group
**Source:** [Source navigation and retirement](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-emptied-integrated-ui-test-group)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Preserved scope and mapping

Maps the source-navigation and retirement share of the earlier scope of
SEED-334#retire-integrated-ui-test-and-its-documents at
`87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6` (provisional plan 648 slices 5 and
7 at `4eb4f8e594ee003a2894c28c8ab2600e1c42b835`). Conversion conventions,
proof rule and gates are those of
[plan 688](../688-move-story-destination-and-card-selection-checks/PLAN.md).
The last conversion and the retirement publish as one delivery.

## Provisional slices

### 1. Keep the server's source reads in the Backend group
Type: Behavior
Status: provisional
Proof: `source-navigation` test 1 step 4, the exact GitHub read list and
`leftTheServer() == []`, beside
`backend-tests/observation/authenticated-read-listed-records.spec.ts`. The
interim spec stays until slice 2.

### 2. Convert source navigation and retire the emptied group
Type: Behavior
Status: provisional
Proof: `source-navigation` link targets (blob at revision with hashes, bare
correction plan link, `..` and root paths, `_blank` with `noopener
noreferrer`), external references, and `javascript:`, `data:` and invalid
targets shown as text, in a Frontend home on a Frontend arrangement of the
hostile backlog (`sourceNavigationJourney.ts` data at lines 19–100; its
page-only helpers move to a Frontend module). No Frontend spec or unit test
covers `src/sourceLink.ts` or `RecordedLink.tsx` today. In the same delivery
no `dashboard/tests/**/*.spec.ts` remains and the group leaves: the Intent
location in `.planning/open-dough.json`, `test:dashboard:integrated` in
`package.json`, `dashboard/integrated.playwright.config.ts` and its
`tsconfig.node.json` entry, `integratedGlobalSetup.ts`, the
`dashboard-integrated` job and its `ci-proof` need in
`.github/workflows/ci.yml`, and the group's entry in
`groupRunnerExamples.ts`. Every remaining group lists the same tests as
before.

### 3. Remove the retired group from tooling and guidance
Type: Structure
Status: provisional
Proof: the consumers that name the group: `scripts/dashboard-repeat.sh`,
`scripts/ci-container.sh`, `scripts/ci-shard-balance.mjs`, the
`rebalance-ci-shards` skill, `Distribution/tests/support/`
(`browser-group-shards.test.mjs`, `local-test-suite*.mjs`,
`ci-proof-frontend-report.test.mjs`, `browserGroupConfigs.mjs`), the CI repeat
fixtures, `Distribution/tests/test-runner/dashboard-repeat.sh`, Backend
`runtime/runner-ownership.spec.ts`, `runtime/dashboard-artifact-demand.spec.ts`,
`launches/start-origin-demand.spec.ts`, `observation/run-processes.spec.ts`,
and live placement text (`dashboard/COMMANDS.md`, `e2e/README.md`,
`Distribution/tests/README.md`, `local-test-resources.md`,
`Distribution/evaluation/native-setup.md`, `browser-test-group.yml`, code
comments). Whatever would fail trunk CI without slice 2's removal belongs in
slice 2's delivery; refinement decides the cut from a scratch run.

### 4. Keep old integrated proof readable
Type: Behavior
Status: provisional
Proof: an old Done story's integrated proof still opens at its revision,
absent from current proof, with gaps instead of fabricated numeric
comparisons or dead source links. Current Intent listing, proof, history and
historical-entry cases own this with explicit old, current and
different-scope fixtures.

## Refinement inputs

Retained support: every `dashboard/tests/` module other groups import, and
`integratedStateCompletion` (the unrelated closure policy). Use the browser
group roster if SEED-334#keep-one-browser-test-group-roster has delivered it,
otherwise the hard-coded callers above. Distinguish historical fixtures
(`fixtures/observed-runs-ci.yml`, `node-suite-ci-runs/`, done records) from
live references. `sourceNavigationJourney.ts` becomes unused. Settle before
ready: which removals must share one delivery to keep CI green, and how Intent
reads a location that is no longer declared.
