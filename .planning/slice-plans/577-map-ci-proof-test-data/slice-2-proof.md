# Slice 2 implementation return

Outcome: canonical MakeMe entries/evidence/summaries now supply Node read, sort, timing, scope and comparison-gap tests. Real collector, zip extraction, retained-summary check, browser parser and artifact-read boundaries remain the actions under proof. Valid listed artifacts (including expired/nonqualifying facts) use aCiProofArtifact; malformed string id and unreadable listing shapes remain literal. Exact legacy JSON, corrupt archives, oversized bytes and independent expectations remain outside builders.

Owned paths:
- src/skills/dough-test-optimization/scripts/ci-proof-read.test.mjs
- src/skills/dough-test-optimization/scripts/ci-proof-scope-units.test.mjs
- tests/support/ciProofEvidenceTestData.mjs
- tests/support/ciProofFiguresTestData.mjs (new)
- tests/support/dashboard-ci-comparison-entry-gaps.test.mjs
- tests/support/dashboard-ci-proof-breakdown-read.test.mjs
- tests/support/dashboard-ci-proof-units-read.test.mjs
- tests/support/intent-ci-proof-sort.test.mjs
- tests/support/intent-ci-proof-timing.test.mjs
- tests/support/intent-scope-proof-units.test.mjs
- tests/support/intent-scope-proof.test.mjs

Root's PLAN.md/execution.md edits are preserved and not owned by this return. No production edit, dependency, schema, timeout, observer, status, commit or publication operation.

## Proof commands and terminal results

All commands completed exit 0 from the assigned checkout, Node24.21.0. The three Node selections contain 52 distinct suites (12 named/changed; 39 additional direct builder consumers; 2 scope suites after their final edits, including one justified repeat whose setup changed).

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/dashboard-ci-proof-units-read.test.mjs tests/support/dashboard-ci-proof-breakdown-read.test.mjs tests/support/dashboard-ci-proof-read.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-read.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-read-adapter.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-archive.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-check.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-scope.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-scope-units.test.mjs tests/support/intent-ci-proof-sort.test.mjs tests/support/intent-ci-proof-timing.test.mjs tests/support/dashboard-ci-comparison-entry-gaps.test.mjs

env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh src/skills/dough-test-optimization/scripts/ci-proof-leads-adapter.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-cli.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-gaps.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-retained.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-table.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-ranking.test.mjs tests/support/ci-prior-build-boundaries.test.mjs tests/support/ci-prior-build-reference-schema.test.mjs tests/support/ci-prior-build-reference.test.mjs tests/support/ci-scope-prior-build-reference.test.mjs tests/support/dashboard-ci-comparison-entries.test.mjs tests/support/frontend-test-proof.test.mjs tests/support/intent-ci-comparison-overall-count-gaps.test.mjs tests/support/intent-ci-comparison-overall-counts.test.mjs tests/support/intent-ci-comparison-signed-sort.test.mjs tests/support/intent-ci-comparison-sort.test.mjs tests/support/intent-ci-scope-history-cohort.test.mjs tests/support/intent-ci-scope-history-gaps.test.mjs tests/support/intent-ci-scope-history-links.test.mjs tests/support/intent-ci-scope-history-matching.test.mjs tests/support/intent-ci-scope-history-provenance.test.mjs tests/support/intent-ci-scope-history-timing.test.mjs tests/support/intent-ci-scope-history-units.test.mjs tests/support/intent-ci-scope-history.test.mjs tests/support/intent-scope-comparison-count-gaps.test.mjs tests/support/intent-scope-comparison-timing.test.mjs tests/support/intent-scope-comparison-unit-gaps.test.mjs tests/support/intent-scope-comparison-unit-names.test.mjs tests/support/intent-scope-comparison-unit-retention.test.mjs tests/support/intent-scope-comparison-units.test.mjs tests/support/intent-scope-comparison-unobserved-counts.test.mjs tests/support/intent-scope-proof-units.test.mjs tests/support/landed-ci-history-identity-subject.test.mjs tests/support/landed-ci-history-identity.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/landed-ci-history-proof-finality.test.mjs tests/support/landed-ci-history-proof-versions.test.mjs tests/support/story-ci-comparison-entry-summaries.test.mjs

env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/intent-scope-proof.test.mjs tests/support/intent-scope-proof-units.test.mjs

env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" npm run typecheck:dashboard

env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/native-evidence-identity.sh

git diff --check
```

Resource decision confirmed before launch: local AC Mac, load7.35, memoryfree53%, no known competing owned heavy run. Chose sequential one-job focused proof under caffeinate -s -i; no full suite or timeout change. All launched sessions reached terminal exit0, including native identity session56668. No failing/flaky tests were observed. Policy: AGENTS.md#failing-and-flaky-tests as written remains in force through final CI.

## Source commitment observations

- C09,C16,C17,Q03,Q04: direct builders replace local part/entry/present/file construction in intent-ci-proof-sort, intent-ci-proof-timing, intent-scope-proof and dashboard-ci-comparison-entry-gaps; readers use canonical entries/summaries. Existing scope, prior-build reference and history consumers remain on MakeMe and were run.
- C45,C46,C47: intent-scope-proof-units tests named "a unit with a missing/ambiguous..." and "a unit without any file breakdown or any present part..." independently assert displayed gaps at folder/file scopes. intent-scope-proof "each row names its gap" asserts missing part and unbroken part wording.
- C48,C49,J32-J34: intent-ci-proof-timing "complete timing...zero" observes measured 0ms; "summary without durations..." observes No timings; dashboard-ci-comparison-entry-gaps "partial endpoint..." independently expects Part2 untimed for the baseline and measured0 for the endpoint; scope tests independently expect no CI result for a path with no result.
- C51,J30,J31: intent-scope-proof-units "a folder's two source files..." independently distinguishes inventory2 from case5/file1 figures and asserts each unit's cells/parts/time at entry, folder and file. intent-scope-proof computes child/outside file figures once, independent expected counts/time and hidden contributors.
- C54,C55,C56,C57: zipOf, onlyZipEntry, real readGitHubActionsSummary and its request-order assertions remain; archive corruption, wrong zip name, not-JSON, invalid shape, limits and no-download outcomes remain tested literally. dashboard-ci-proof-breakdown-read "read whole...refused above..." independently asserts size and limit on ZipEntryTooLarge, and parser keeps all breakdown fields.
- C63,Q09,Q10,J35,J37: dashboard-ci-proof-units-read builds entries with case/file evidence through MakeMe then actual proofSummaryForEntries collector, zip, checkedRetainedSummary and ciProofSchema; read deep-equals input and independently expects case5/time1500 versus failedfile1/absentduration. Breakdown reader supplies a MakeMe starting summary only because read/parser/size are the boundary under proof; no converter behavior is claimed there.
- Q12,Q13,J16-J19: ci-proof-check tests "valid summary is a run attempt's only..." and "valid summary is a CI adapter attempt's only..." arrange MakeMe summaries with nonqualifying repository, run, attempt, attemptId and revision then independently assert exact refusal reasons. ci-proof-read confirms accepted run identity through real archive read; unit-reader confirms checked identity survives dashboard parser.

## G1 / consumer-needed builder extension

Existing operations could not state a timed first part, an untimed second present part, and an ambiguous third part without changing the case. withPresentPart(part, facts) extends existing aCiProofEvidence, using the same ResultFacts and production part shape. Existing figuresOf/summed numeric construction moved unchanged to ciProofFiguresTestData.mjs, keeping the evidence builder under250 lines. withUnbrokenPart callers remain supported.

G1 proof: intent-ci-proof-timing "partial timing shows short gap labels..." starts from part1 timed900/untimed1, explicit part2 present without duration, part3 ambiguous and independently expects "Part 3 ambiguous, Part 2 untimed, 1 test case untimed" with full explanation. dashboard-ci-comparison-entry-gaps "partial endpoint..." starts from part1 measured0 and explicit part2 untimed or measured0, independently expects Part2 untimed versus measured0 and a partial cue. Both tests passed in the first 12-suite selection. No raw parts override or parallel model was added.

Before/after scratch comparisons (node --input-type=module inline command, exit0) deep-equaled original versus converted unit-reader summary and 3 breakdown summaries (3/500/9000files) and 10 existing evidence routes (counts, zero time, missing/ambiguous, files, unassigned, appended parts, empty breakdown, legacy, repeated parts, first-part missing). Original evidence module was imported from git HEAD as a data URL; current builder came from MakeMe. The figures functions are textually unchanged apart from exports/type import location. Existing callers that do not use withPresentPart retain their exact construction route; new map is empty for them. This leaves prior browser boundary proof applicable without a browser rerun caused solely by this extension/extraction.

Node unit/breakdown reader values stayed identical. Scope/timing tests now arrange coherent canonical aggregate counts: original scope fixtures sometimes left aggregate counts inconsistent with file sums or extra parts; independent scope/timing assertions remain unchanged. The nested ownership fixture now builds its own canonical entry instead of reusing file paths outside that entry. No new proof behavior is asserted by these setup corrections.

## Consumer trace and handoff

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base HEAD --term aCiProofEvidence --term aCiProofEntry --term aCiProofSummary --term aCiProofArtifact --term withPresentPart --term figuresOf --term summed --term proofSummaryForEntries --term part --term entryOf --term present --term file --term nothing > /tmp/slice2-consumer-trace.md
```

Every located consumer row carries a run or reasoned excluded disposition. The generic retired factory names produce many unrelated matches; production and installed copies do not import source test-only helpers. Direct Node builder consumers and scopePriorReferenceTestData importers were run; unchanged browser helper consumers never invoke withPresentPart and preserve the original value-producing route. No unexcluded changed consumer remains unrun. The trace covers root planning edits as descriptive records only.

All owned files have read-only Prettier projections <=250 (largest237, evidence230, numeric helper40). No formatting or refactor pass performed. Whitespace passed. No new runtime dashboard import: types remain JSDoc-only and native closure passed. No missing source commitment, outstanding command, uncovered changed behavior, unresolved failure or remaining slice2 gap identified. Later dashboard journeys/displaced fixture audit remain for slices3-4.

## Coordinator acceptance

Freshness unchanged at af23ca1e5ff11ef31378e45c175e4cfc9d49e8e1; named sibling product changes absent. Inspected actual reader/collector/zip/parser setup and literal result expectations, scope/part factories and independent timing and comparison assertions. Numeric functions are unchanged apart from exports/type location; existing evidence routes deep-equal and use an empty new map, so unaffected browser routes are reused rather than claimed run. No current uncovered consumer. G1 closes on the exact mixed timing/ambiguous test and zero-versus-partial comparison outputs.

Independent refactor `/root/refactor_2`: none — already clean; ## REFACTOR COMPLETE. All accepted proof unchanged; no tests repeated. Final freshness af23ca1e5 unchanged, no sibling product impact.
