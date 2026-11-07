# Source review

Fresh general-purpose reviewer launched 2026-11-07 by the Plan 501 coordinator with no conversation inheritance. Input: only the seed story's heading, Goal, Scope, and Key examples from [SEED-258](../../seeds/SEED-258-dough-intent-coverage.md#distinguish-branch-and-landed-summary-figures) (Evidence and state omitted), with instructions to read no project files, change nothing, and return numbered commitments, qualifications and exclusions. The return below is verbatim except light punctuation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: a developer reviewing a completed story's precise CI comparison can trust that the Branch figures come from the Branch build and the Landed figures come from the Landed build. | slice 1 | observed: intent-summary-story-comparison.spec.ts both variants via summaryComparisonExpectedRows.ts entry/folder/file rows + intent-summary-story-comparison-file.spec.ts expectFileComparisonRow(modifiedFileRow); clean 10 passed, scratch probe run 2026-11-07: Summary and file specs fail on Landed/Counts cells |
| 2 | The maintained journeys fail when one build's figures are shown in the other build's column. | slice 1 | observed: scratch probe run 2026-11-07: Summary and file specs fail on Landed/Counts cells (entry line 72, folder/file via narrowed probes, file line 80) |
| 2.1 | This failure applies at entry scope. | slice 1 | observed: scratch probe run 2026-11-07: Summary and file specs fail on Landed/Counts cells: entry Counts got 4 → 6 tests (+2), Landed got 21.5 s |
| 2.2 | It applies at folder scope. | slice 1 | observed: narrowed probe path dashboard/tests/folder: folder/ row Landed got 17.4 s |
| 2.3 | It applies at file scope. | slice 1 | observed: narrowed probe path a.spec.ts: Summary line 84 and intent-summary-story-comparison-file.spec.ts expectFileComparisonRow(modifiedFileRow) line 80 fail |
| 3 | The story closes the gap that the intent-coverage trial verified, and it does so independently of the pilot. | slice 1 | observed: test-only fixture change with no pilot dependency; Summary/file specs now fail under the trial substitution |
| 4 | Distinct endpoint figures: in the precise breakdown proofs, one measured file under `folder/` has a different test count on Branch than on Landed. | slice 1 | observed: intentSummaryStoryComparisonProofs.ts dashboardProducer(branch) adds second folder/a.spec.ts test |
| 5 | The same file has a visibly different duration on Branch than on Landed. | slice 1 | observed: a.spec.ts Branch 17.0 s vs Landed 14.0 s in modifiedFileRow |
| 6 | The difference reaches all three scopes: | slice 1 | observed: entryComparisonRows dashboard/tests and folder/, folderComparisonRows dashboard/tests/folder and a.spec.ts differ in Branch vs Landed |
| 6.1 | that file | slice 1 | observed: folderComparisonRows a.spec.ts modified: Branch 17.0 s, Landed 14.0 s |
| 6.2 | `dashboard/tests/folder` | slice 1 | observed: folderComparisonRows dashboard/tests/folder: Branch 17.4 s, Landed 14.4 s |
| 6.3 | the `dashboard/tests` entry | slice 1 | observed: entryComparisonRows dashboard/tests: Branch 21.5 s, Landed 18.5 s |
| 7 | Summary assertions: for those three scopes (file, folder and entry), the precise Summary journey asserts these exact values: | slice 1 | observed: intent-summary-story-comparison.spec.ts both variants via summaryComparisonExpectedRows.ts: exact Counts/Baseline/Branch/Landed cells for entry, folder, file rows |
| 7.1 | the Baseline duration | slice 1 | observed: intent-summary-story-comparison.spec.ts both variants via summaryComparisonExpectedRows.ts: exact Counts/Baseline/Branch/Landed cells for entry, folder, file rows |
| 7.2 | the Branch duration | slice 1 | observed: intent-summary-story-comparison.spec.ts both variants via summaryComparisonExpectedRows.ts: exact Counts/Baseline/Branch/Landed cells for entry, folder, file rows |
| 7.3 | the Landed duration | slice 1 | observed: intent-summary-story-comparison.spec.ts both variants via summaryComparisonExpectedRows.ts: exact Counts/Baseline/Branch/Landed cells for entry, folder, file rows |
| 7.4 | the Counts cell | slice 1 | observed: intent-summary-story-comparison.spec.ts both variants via summaryComparisonExpectedRows.ts: exact Counts/Baseline/Branch/Landed cells for entry, folder, file rows |
| 8 | File Proof assertions: for that file, the file Proof journey asserts the exact Baseline, Branch and Landed durations and the Counts cell. | slice 1 | observed: intent-summary-story-comparison-file.spec.ts expectFileComparisonRow(modifiedFileRow): exact Baseline/Branch/Landed/Counts cells |
| 8.1 | It makes these assertions in its clean check. | slice 1 | observed: intent-summary-story-comparison-file.spec.ts expectFileComparisonRow(modifiedFileRow) in clean-merges variant |
| 8.2 | It makes them in its refusal check. | slice 1 | observed: intent-summary-story-comparison-file.spec.ts expectFileComparisonRow(modifiedFileRow) in own-conflict-extra (merge-resolution refusal) variant |
| 9 | When the Branch and Landed counts differ, the Counts cell gives Baseline, Branch and Landed as successive steps, so the count comparison is part of the proof. | slice 1 | observed: Counts cells 4 → 6 tests (+2) → 5 tests (+1), 2 → 3 tests (+1) → 2 tests (0), 1 → 2 tests (+1) → 1 tests (0) |
| 10 | Shared fixture consumers: other journeys that use the same proofs keep passing. | slice 1 | observed: four-spec run 10 passed (Trunk Mode, Taken, gaps, cues) |
| 10.1 | Trunk Mode variant | slice 1 | observed: intent-summary-story-comparison.spec.ts Trunk Mode test passes with trunkEntryRows unchanged |
| 10.2 | Taken variant | slice 1 | observed: Taken provisional test passes |
| 10.3 | gap variants | slice 1 | observed: intent-summary-story-comparison-gaps.spec.ts 3 tests pass with noBreakdownEntryRows/runningLandedEntryRows updated |
| 11 | Those other journeys have their expected rows updated to the new figures. | slice 1 | observed: summaryComparisonGapExpectedRows.ts and intent-story-ci-cues.spec.ts location aria-label updated |
| 12 | Evaluation: the changed journeys pass with the original production code. | slice 1 | observed: four-spec run on unchanged dashboard/src: 10 passed; git status dashboard/src empty |
| 13 | In a scratch checkout, the trial's substitution is replayed: `landed = branch` at the start of `scopeComparisonCellsOf` in `dashboard/src/ciScopeComparison.ts`, for precise, distinct summaries. | slice 1 | observed: probe line inserted at start of scopeComparisonCellsOf in scratch run |
| 14 | With that substitution in place, the intended Summary assertions fail. | slice 1 | observed: probe: Summary spec both variants fail at expectComparisonScopeRows |
| 15 | With that substitution in place, the intended file assertions fail. | slice 1 | observed: probe: file spec both variants fail at expectFileComparisonRow |
| 16 | The scratch fault is reverted. | slice 1 | observed: git restore dashboard/src/ciScopeComparison.ts; git status --porcelain dashboard/src empty |
| 17 | Clean run example: Branch and Landed proofs differ for `folder/a.spec.ts` in count and duration. The Summary's entry, folder and file rows, and the file Proof row, show each build's own figures, and the journeys pass. | slice 1 | observed: intent-summary-story-comparison.spec.ts both variants via summaryComparisonExpectedRows.ts + intent-summary-story-comparison-file.spec.ts expectFileComparisonRow(modifiedFileRow), 10 passed |
| 18 | Landed replaced by Branch example: with the substitution applied, the Landed cells and the Counts cell show Branch's figures, and the Summary and file assertions fail on those cells. | slice 1 | observed: probe: Landed got Branch's 21.5 s/17.0 s and Counts lost the Landed step |
| 19 | Single after-build example: in Trunk Mode, or in a Taken story with no landed build, the comparison still shows one after-build. Its expected rows change only where the new figures reach them. | slice 1 | observed: runningLandedEntryRows show one after-build with Branch figures only; trunkEntryRows unchanged |
| Q1 | Implementation chooses which endpoint's figures to change (Branch or Landed); an open choice, not a requirement. | slice 1 | observed: Branch endpoint changed |
| Q2 | `folder/a.spec.ts` illustrates "one measured file under `folder/`"; it does not require that exact file. | slice 1 | observed: folder/a.spec.ts used |
| Q3 | Trunk Mode, Taken and gap variants are examples of shared-fixture consumers, not a closed list: every journey that uses the same proofs must keep passing. | slice 1 | observed: consumer trace: only the four specs import the proofs; all run |
| Q4 | The substitution is replayed only in a scratch checkout and must be reverted; it is not a delivered change. | slice 1 | observed: probe reverted; not in diff |
| Q5 | The fault-injection check covers only precise, distinct summaries. | slice 1 | observed: probe guarded by precise + distinct summaries |
| Q6 | Single after-build comparisons keep their one-after-build shape, and their expected rows change only where the new figures reach them. | slice 1 | observed: runningLandedEntryRows and trunkEntryRows keep one-after-build shape |
| Q7 | Boundary assumption: the tests run under the project's test automation rules and failure policy. | slice 1 | observed: Bash 5 + caffeinate -s -i; no sleeps or timeout changes |
| X1 | No production change. | slice 1 | observed: git diff touches only dashboard/tests |
| X2 | No other SEED-258 test follow-up. | slice 1 | observed: diff limited to breakdown proofs and their expected rows |
| X3 | No new dashboard behavior or wording. | slice 1 | observed: expected text is current production output; no src change |
