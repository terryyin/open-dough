# Slice 3 implementation return

Outcome: dashboard proof fixtures arrange canonical MakeMe entries/evidence, then the actual collector supplies the summary and real ZIP/Origin helpers supply its artifact. Positional ProofPart/declaration tuples, counts/ProofUnit adapters, mixedEntryParts and broad unknown casts are removed from these setups. proofInputsForEntries encodes canonical entries directly as the production fragment constructor and declaration objects; summarize remains real. collectedSummary accepts the collector's named declaration fields. Dashboard runner-record construction delegates to aDashboardProofRecord while real report/CLI conversion stays in the harness.

No production code, workflow, schema, dependency, timeout, collector policy or sibling run/adapter construction changed. Exact legacy JSON, malformed archive/listing/summary inputs, unavailable reasons and independent expectations stay literal. GitHub artifact listing remains on existing aCiProofArtifact owner. No builder API extension needed in this slice.

## Owned paths

- dashboard/backend-tests/intent/landed-ci-proof-collection.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-build-provenance.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-later-build.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-pending-order.spec.ts
- dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts
- dashboard/tests/intent/intent-ci-proof-reasons.spec.ts
- dashboard/tests/intent/intent-ci-proof-sources.spec.ts
- dashboard/tests/intent/intent-ci-proof-units.spec.ts
- dashboard/tests/intent/intent-ci-proof.spec.ts
- dashboard/tests/intent/intent-ci-status-execution-time.spec.ts
- dashboard/tests/intent/intent-ci-status-sort.spec.ts
- dashboard/tests/intent/intent-summary-ci-proof-gaps.spec.ts
- dashboard/tests/intent/intent-summary-ci-proof-sort.spec.ts
- dashboard/tests/intent/intent-summary-ci-proof-table.spec.ts
- dashboard/tests/intentCiAdapterProofProject.ts
- dashboard/tests/intentSummaryCiProofFixtures.ts
- dashboard/tests/support/ciProofArtifacts.ts
- dashboard/tests/support/ciProofCollected.ts
- dashboard/tests/support/ciProofEntryInputs.ts
- dashboard/tests/support/intentSummaryStoryComparisonProofs.ts
- dashboard/tests/support/scopeHistoryProofs.ts
- dashboard/tests/support/storyCiComparisonAdapterAnswers.ts
- dashboard/tests/support/storyCiComparisonEntryProofs.ts
- dashboard/tests/support/storyCiComparisonFixture.ts
- dashboard/tests/intent/intent-ci-proof-accessibility.spec.ts

Root's execution.md edit is preserved and not owned by this return. intent-ci-proof.spec.ts's existing zoom/keyboard journey moved unchanged to intent-ci-proof-accessibility.spec.ts when projected formatting grew the original to265 lines; no scenario or assertion removed. All owned formatted projections now <=246; helpers shrank materially (Artifacts117 current lines, EntryInputs54, Collected160 before formatting).

## Commands, selections and terminal observations

All commands ran from the assigned checkout on Node24.21.0. Primary browser driver owned session98540 to terminal exit0: **103 passed (6.5m)** across64 explicitly selected files. Two additional discovered actual consumers ran separately to terminal exit0: **2 passed (8.3s)**. No failing/flaky browser or Node test was observed, no retries, sleeps, test.slow or timeout override used. AGENTS.md#failing-and-flaky-tests remains applicable as written through final CI.

The primary launch was:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i node /tmp/slice3-run-browser.mjs
```

That inspectable driver calls the installed Playwright CLI with this exact expanded argument selection (paths read once from /tmp/slice3-browser-paths.json):

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts dashboard/backend-tests/intent/intent-ci-comparison-receipt.spec.ts dashboard/backend-tests/intent/landed-ci-proof-adapter-units.spec.ts dashboard/backend-tests/intent/landed-ci-proof-collection.spec.ts dashboard/backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts dashboard/backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts dashboard/backend-tests/intent/landed-ci-scope-build-provenance.spec.ts dashboard/backend-tests/intent/landed-ci-scope-later-build.spec.ts dashboard/backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts dashboard/backend-tests/intent/landed-ci-scope-pending-order.spec.ts dashboard/backend-tests/intent/landed-ci-scope-pending-proof.spec.ts dashboard/backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts dashboard/backend-tests/intent/landed-ci-scope-proof-completion.spec.ts dashboard/backend-tests/intent/landed-ci-scope-proof-finality.spec.ts dashboard/backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts dashboard/backend-tests/intent/landed-ci-scope-proof-recovery.spec.ts dashboard/backend-tests/intent/landed-ci-scope-retained-window.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter-planning-skip.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter-taken.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts dashboard/tests/intent/intent-ci-comparison-drilldown-relative.spec.ts dashboard/tests/intent/intent-ci-comparison-locations.spec.ts dashboard/tests/intent/intent-ci-comparison-missing-run.spec.ts dashboard/tests/intent/intent-ci-comparison-mounted-legacy.spec.ts dashboard/tests/intent/intent-ci-comparison-mounted-units.spec.ts dashboard/tests/intent/intent-ci-comparison-pending-proof.spec.ts dashboard/tests/intent/intent-ci-comparison-retry.spec.ts dashboard/tests/intent/intent-ci-comparison-skipped-landed.spec.ts dashboard/tests/intent/intent-ci-comparison-taken.spec.ts dashboard/tests/intent/intent-ci-comparison-units-bindings.spec.ts dashboard/tests/intent/intent-ci-comparison.spec.ts dashboard/tests/intent/intent-ci-proof-accessibility.spec.ts dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts dashboard/tests/intent/intent-ci-proof-adapter.spec.ts dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts dashboard/tests/intent/intent-ci-proof-legacy-results.spec.ts dashboard/tests/intent/intent-ci-proof-reasons.spec.ts dashboard/tests/intent/intent-ci-proof-sources.spec.ts dashboard/tests/intent/intent-ci-proof-units.spec.ts dashboard/tests/intent/intent-ci-proof.spec.ts dashboard/tests/intent/intent-ci-status-execution-time.spec.ts dashboard/tests/intent/intent-ci-status-sort.spec.ts dashboard/tests/intent/intent-scope-collected-file-timing-gaps.spec.ts dashboard/tests/intent/intent-scope-collected-file-timing-history.spec.ts dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts dashboard/tests/intent/intent-scope-timing-history-gap-build.spec.ts dashboard/tests/intent/intent-scope-timing-history-gaps.spec.ts dashboard/tests/intent/intent-scope-timing-history-legacy.spec.ts dashboard/tests/intent/intent-scope-timing-history-provenance.spec.ts dashboard/tests/intent/intent-scope-timing-history-reading.spec.ts dashboard/tests/intent/intent-scope-timing-history-segments.spec.ts dashboard/tests/intent/intent-scope-timing-history-units.spec.ts dashboard/tests/intent/intent-summary-ci-proof-gaps.spec.ts dashboard/tests/intent/intent-summary-ci-proof-kept.spec.ts dashboard/tests/intent/intent-summary-ci-proof-sort.spec.ts dashboard/tests/intent/intent-summary-ci-proof-table.spec.ts dashboard/tests/intent/intent-summary-ci-proof.spec.ts dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts dashboard/tests/intent/intent-summary-story-comparison-presentation-bindings.spec.ts dashboard/tests/intent/intent-summary-story-comparison-renamed.spec.ts dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts dashboard/tests/intent/intent-summary-story-comparison-source.spec.ts --workers=1 --reporter=line
```

Separate additional consumers:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-file-purpose-proof.spec.ts dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts --workers=1 --reporter=line
```

Final Node reader/collector helper, typecheck and native-identity proof ran in dependency order through owned session27135 to terminal exit0:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/dashboard-ci-proof-units-read.test.mjs tests/support/story-ci-comparison-entry-summaries.test.mjs
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" npm run typecheck:dashboard
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/native-evidence-identity.sh
git diff --check
```

Resource decision before browser launch: actual local AC-powered Mac, load3.30, memoryfree65%, no known competing owned heavy run. Reduced120 file-level matches before launch to64 named/actual proof journeys; kept one worker and sequenced heavy checks. Reconsidered extra two consumers as smaller unchanged-host workload after the first run passed; no pressure/failure challenged the basis. Generic unchanged zip/listing, observed-job and wall-time/history-only paths are excluded or reuse exact unchanged fixture-route output, not claimed run.

## Real collector output equivalence

Before edits, /tmp/slice3-snapshot.mjs captured19 actual collector boundary outputs. After conversion the same driver captured the current values; deep equality passed. Literal commands:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" node --experimental-transform-types /tmp/slice3-snapshot.mjs /tmp/slice3-before.json
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" node --experimental-transform-types /tmp/slice3-snapshot.mjs /tmp/slice3-after.json
node --input-type=module - <<'JS'
import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs';
assert.deepEqual(JSON.parse(readFileSync('/tmp/slice3-after.json')),JSON.parse(readFileSync('/tmp/slice3-before.json')));console.log('19 real collector boundary outputs unchanged');
JS
```

The inspectable snapshot driver covers mixed baseline/branch/landed, untimed baseline, default comparisons, breakdown/no-breakdown/outside/trunk summaries, adapter regular/by-file, bothEntriesSummary with/without breakdown, measured zero, untimed second part, missing+ambiguous, first broken-down part/files+unassigned and null-label missing/ambiguous legacy evidence. It calls the real collector/CLI, not a duplicated expected constructor. Original record JSON's incidental project/id/status/title/source-line fields disappear or use the existing canonical defaults; observed converted fragment/summary bytes remain identical. Browser assertions remain independently written.

Initial plain Node snapshot import lacked --experimental-transform-types and refused an existing TypeScript parameter property before observation; selected the project's supported transform mode. Initial typecheck identified import renames, one conditional declaration tuple, and JS inferred options omitting supported unit. Renames/tuple were corrected; named options argument preserves the actual supported unit without casts or production change. Typecheck then passed, and final post-split typecheck passed again. These were implementation corrections, not test exemptions.

## Source commitment observations

- C10,C19,Q05,J36: converted Intent specs and comparison/adapter fixtures visibly construct MakeMe entries; proofSummaryForEntries calls real summarize, runArtifactsAnswer uses aCiProofArtifact and summaryZipAnswer/summaryTextZipAnswer serve real zipped bytes. intent-ci-proof.spec.ts failed-run test independently observes exact counts, revision/attempt, request order and retained verdict. Backend landed-ci-proof-collection observes summary/mismatched/expired statuses through real retained collection.
- C30,C31,J38,J39: no ProofPart, ProofDeclaration, proofSummary, counts or mixedEntryParts export/call remains in dashboard proof setup. Direct named declaration objects reach collector/CLI. proofInputsForEntries calls production fragment directly; unnecessary SummarizeFragments/FragmentsFromOutcomes/unknown casts are removed. Typecheck and Node story-ci-comparison-entry-summaries tests exercise the canonical input route, including missing/ambiguous parts and null legacy provenance. Unrelated explicit unknown response reads are unchanged.
- J23,J24,J25: intentSummaryStoryComparisonProofs.noBreakdownBaselineProofs starts from dashboard/tests case4/time12040 and tests file2/time2500, part1 present through canonical builders; snapshot matches old real collector output. intent-summary-story-comparison-file/source/sort journeys independently observe baseline/branch/landed file and aggregate times/counts, gap/relative wording and navigation.
- J26,J28: intent-ci-proof-units.spec.ts "one location's test cases and test files stay apart..." independently checks separate case/file counts/time/parts at CI status, Summary, folder with two source files and each file Proof; inventory paths never become extra test counts. intent-ci-status-execution-time independently checks 4min/2min, never combined6min or wall-time3min; zero and untimed/missing labels remain exact.
- J27,J29: intent-ci-comparison-mounted-units.spec.ts four journeys independently observe case+2 and unchanged files at overall, entry, folder and file/tree levels, never a combined unit. Count-gap and legacy comparison cases independently retain partial/unknown distinctions. These passed within the103 selection.
- Additional actual consumers: intent-file-purpose-proof independently observes Purpose/Proof tabs, case counts550ms and absent-file gap with one evidence read. landed-ci-history-lifecycle independently observes recovered collector-generated case/file summary across collection/restart/two collectors and subsequent retained history read; both passed separately.

No source commitment or actual changed consumer is left uncovered. Later slice4 owns the final displaced-fixture/unused-builder audit; no new scope or unresolved premise introduced.

## Consumer trace

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base HEAD --term proofSummary --term proofSummaryForEntries --term proofSummaryForEntry --term ProofPart --term ProofDeclaration --term proofInputsForEntries --term playwrightRecord --term collectedSummary --term mixedEntryParts --term counts > /tmp/slice3-consumer-trace.md
```

The final trace gives every687 located row a run, covered/reused, or reasoned exclusion. Selected browser/backend consumers and the two direct Node entry-summary readers ran. Changed fixture exports are followed into these journeys and nineteen equivalent collector outputs. Files importing only unchanged zip/listing/observed-job functions do not acquire a changed effect; production, installed-copy, shared-builder and descriptive name matches have no runtime import of the changed dashboard harness. /tmp/slice3-effect-consumers.json and /tmp/slice3-browser-paths.json retain the bounded selection; raw broad import closure alone was not the acceptance criterion.

No formatting, hook-owned lint, independent refactor pass, commit, push, plan/status/source-review edit or observer operation performed. All launched verification commands reached terminal results; no owned watches remain needed. Return is uncommitted for coordinator acceptance/refactor/delivery.

## Coordinator acceptance

Freshness unchanged at46c8b193dd5eb282fca55d7fe19b9909cdedd407. Incoming main commits since prior check are unrelated Take/preparation; no named sibling product changes. Inspected canonical entry-to-production-fragment mapping, actual collector/declaration/record boundary, execution-time and sorting setups and independent assertions, moved accessibility zoom/keyboard scenario, and mixed case/file comparison fixtures and mounted assertions. Actual affected consumers ran; unchanged ZIP/listing-only callers are excluded by function-level effect, and unchanged summary routes reuse19 exact real-collector comparisons. No source gap identified.

Independent refactor `/root/refactor_3`: none — already clean; ## REFACTOR COMPLETE. No edits or invalidated proof; accepted105 browser/backend and2 Node checks retained. Final freshness unchanged at46c8b193d with no sibling product impact.

Delivery formatting/lint stopped before commit on four unsafe any assignments. [Boundary typing repair](slice-3-typing-repair.md) passed typecheck/affected Node checks; emitted JavaScript is identical. Coordinator accepts this as already traced within refactor_3’s exact paths and consumer trace, adding no representation/helper/API/path; original105 tests/19 snapshots remain applicable. Publication still held for named sibling reconciliation G2.

[Named sibling reconciliation](slice-3-reconciliation.md) adopted the accepted canonical adapter owner and relevant shared proof-environment repairs, with focused renewed evidence. G2 closed; current source unchanged at49367c2e4.
