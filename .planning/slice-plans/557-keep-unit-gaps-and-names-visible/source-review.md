# Source-only review

Fresh reviewer `/root/source_review` was launched with `fork_turns: none` on 2026-11-10. The launch supplied only the complete selected Goal and Scope from [the correction source](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#keep-unit-gaps-and-names-visible), transcribed verbatim, with instructions to read no project files and change nothing. Its actual launch and numbered return are retained in this execution’s agent conversation. No plan, code, proof, suspected omission, or slice scope was supplied.

The returned examples illustrate naming and are not exhaustive output forms or rejection rules.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Missing parts: Intent’s CI proof and comparisons expose each unit’s missing parts. | slice 1 | observed: tests/support/intent-scope-proof-units.test.mjs missing-part loop at folder/file scopes; intent-scope-comparison-unit-retention.test.mjs missing-part gap endpoint; existing intent-scope-comparison-unit-gaps.test.mjs entry/outside Parts assertions. MakeMe missingPart facts; 13-check implementation proof and two-file refactor proof passed. |
| C2 | Ambiguous parts: Intent’s CI proof and comparisons expose each unit’s ambiguous parts. | slice 1 | observed: tests/support/intent-scope-proof-units.test.mjs ambiguous-part and no-present-part cases; intent-scope-comparison-unit-retention.test.mjs ambiguous-part gap endpoint and Parts text. Actual arrays retain ambiguous gap at folder/file; existing entry Parts behavior unchanged; accepted focused Node proof passed. |
| C3 | Row identity: Every compared row identifies which unit it counts. |  | G3 |
| C4 | Retain units: Below the entry, a qualifying unit remains visible at folder or file scope. |  | G1 |
| C5 | Retain gaps: That unit’s gap remains visible at that scope. | slice 1 | observed: tests/support/intent-scope-proof-units.test.mjs asserts each retained unit’s gaps/completeness and undefined counted results; intent-scope-comparison-unit-retention.test.mjs asserts own gap endpoint, timing, gap arrays, and no cue at both scopes; passing focused Node proof. |
| C6 | Preserve reporting meaning: That unit does not read as unreported. | slice 1 | observed: tests/support/intent-scope-comparison-unit-retention.test.mjs expects no CI result or no file breakdown rather than unreported — and retains test-files row identity at folder/file; no measured zero; focused Node proof passed. |
| C7 | Naming without later measurement: A compared row still names its unit when no later build measured it. | slice 1 | observed: tests/support/intent-scope-comparison-unit-names.test.mjs: real scopeComparisonRowsOf Counts cells, canonical MakeMe facts, all nine cases passed; final independent-refactor 13-file Node command terminated 0. CiProofFigures consumes these Counts cells; complete Intent gate is separately held by G5. |
| C8 | Evidence support: Comparison test support serves the evidence the test arranges. | slice 2 |  |
| C9 | Remove duplication: Remove the duplicate GitHub Actions mixed-unit test. | slice 2 |  |
| Q1 | Audience: Developers reading Intent’s CI proof and comparisons. | slice 2 |  |
| Q2 | Location: The stated goal concerns a location reporting both test cases and test files. | slice 2 |  |
| Q3 | Scope coverage: C1–C3 apply at every scope. | slice 1 | observed: Entry/folder/file loops in intent-scope-comparison-unit-names.test.mjs and folder/file retention cases in intent-scope-proof-units.test.mjs and intent-scope-comparison-unit-retention.test.mjs; final independent-refactor focused Node proof passed all 13 files. |
| Q4 | Below-entry triggers: C4–C6 apply when a unit has missing parts, ambiguous parts, or parts present without a file breakdown. These are alternative qualifying conditions. | slice 1 | observed: tests/support/intent-scope-proof-units.test.mjs and intent-scope-comparison-unit-retention.test.mjs separately arrange missing, ambiguous, unbroken, fully unavailable breakdown, and no-present parts using MakeMe; matching identity/gap assertions passed. |
| Q5 | Scope alternatives: “Folder or file scope” preserves the source’s alternatives; it does not assign particular cases to either scope. | slice 1 | observed: Both retained-unit test files iterate explicit folder and file paths, asserting each scope’s retained evidence and own gap; focused Node proof passed. |
| Q6 | Correction boundary: The correction is bounded to the retrospective findings for SEED-281#distinguish-test-cases-and-files-in-ci-proof. | slice 2 |  |
| J1 | Reading journey: A developer reads proof and comparisons for a mixed-unit location and can see unit gaps and compared-row identities across scopes. | slice 2 |  |
| E1 | No later measurement: 1 test file → — | slice 1 | observed: intent-scope-comparison-unit-names.test.mjs Baseline-only case asserts 1 test file → — at entry, folder and file; passed in final 13-file Node proof. |
| E2 | Removal: 5 test cases → removed | slice 1 | observed: intent-scope-comparison-unit-names.test.mjs removed-row case asserts 5 test cases → removed and 1 test file → removed at entry, folder and file; final focused proof passed. |
| E3 | Nothing counted: nothing counted as test files | slice 1 | observed: intent-scope-comparison-unit-names.test.mjs empty-unit case asserts nothing counted as test files alongside cases; shared CI-status wording is used and focused proof passed. |
| X1 | Undecided arithmetic: Whether a count difference may cross a missing part is not decided by this correction. | slice 2 |  |
