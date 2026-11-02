# Source review: SEED-192#inspect-hierarchical-proof-cost

Launch (2026-11-02): fresh general-purpose agent, no conversation inheritance, instructed to use only the supplied text, read no project files, change nothing, and return numbered commitments with compound items split. Input: the selected story's Beneficiary, Goal, Scope, Scope limits, Required restrictions, Key examples, and UX/UI text from [the seed section](../../seeds/SEED-192-review-product-intent.md#inspect-hierarchical-proof-cost) (links reduced to their labels); no plan, return, product, or proof. The table below is its return with this execution's allocation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | From a location or folder summary in Intent, the developer sees where the retained proof's time goes. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 2 | From that summary, the developer sees where proof is missing. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 3 | The developer drills down to the folder, file, or scenario responsible, without opening every file. | slice 3 | |
| 4 | Each figure says what it is: a sum of last successful scenario durations over the scenarios that have one, from observations of differing times and commits. It is never a run's elapsed time or the suite's current cost. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 5 | This completes the North Star's hierarchical Proof report for one runner family. | slice 4 | |
| 6.1 | Summed duration: a Gherkin location or folder summary with readable proof states the sum of the last successful proof durations of its scenarios and outline rows that have one. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 6.2 | It also states how many of its scenarios that sum covers, for example "Summed duration of last successful proof: 51.5 s over 23 of 412 scenarios". | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 6.3 | It says the figure is a sum of separate observations, retries included, and not a run's elapsed time. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 6.4 | Scenarios without successful proof add nothing and are counted as not covered. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 6.5 | The existing count lines' rules for which observations count apply: only scenarios in each file's published text. | slice 1 | observed: intentSummaryCoverage.ts proofCostOf over observationsForFiles (published-text rows); dashboard/tests/intent-summary-proof-cost.spec.ts ex5 re-read at new revision |
| 6.6 | Same rules: read files only. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex7: held file excluded, 6 of 14 scenarios across 8 of 9 files |
| 6.7 | Same rules: Partial labels while any contained file is pending or unread. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex7: Partial sum line until release |
| 7.1 | Observation spread: the summary says when its counted observations finished, from oldest to newest. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 7.2 | It says how many commits the observations come from, so a sum mixing runs reads as mixed. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 7.3 | A single observation reads as one time and commit. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex8 step: one time and commit b2b2b2b |
| 8.1 | Each child's figures: every immediate subfolder and file row keeps its existing lines in tree order. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 8.2 | Each child row adds its own summed duration with its covered-scenario count. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 8.3 | A child with no successful proof says its duration is unknown, never "0 s". | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 9.1 | Slowest scenarios: the summary lists the slowest scenarios and outline rows with successful proof anywhere in the selection, slowest first, up to ten. | slice 2 | |
| 9.2 | Each slowest row names the scenario (with its example values) and its file. | slice 2 | |
| 9.3 | Each slowest row gives its duration, as file Proof does. | slice 2 | |
| 9.4 | Each slowest row gives attempts when retried, as file Proof does. | slice 2 | |
| 9.5 | Each slowest row gives its observation time, as file Proof does. | slice 2 | |
| 9.6 | Each slowest row gives its commit, as file Proof does. | slice 2 | |
| 9.7 | Each slowest row gives same or earlier file version, as file Proof does. | slice 2 | |
| 9.8 | A selection without successful proof shows no list and says no proof has been recorded there. | slice 2 | |
| 10.1 | Drill down: a child row's name selects that folder or file in Intent's one selection and reveals it in the tree, exactly as selecting it in the tree would. | slice 3 | |
| 10.2 | A selected folder shows its own summary. | slice 3 | |
| 10.3 | A selected file shows its Purpose and Proof. | slice 3 | |
| 10.4 | A slowest-scenario row opens its file with Purpose positioned on that scenario, as opening a case from Optimization Candidates does. | slice 3 | |
| 10.5 | These drill-down controls can be operated by keyboard. | slice 3 | |
| 11.1 | Where proof is absent: a location without declared proof keeps the existing explanations and retry and shows no duration or slowest list. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts: no-proof, typescript, unreadable-proof summaries keep explanations and not Summed duration |
| 11.2 | A non-Gherkin kind keeps the existing explanations and retry and shows no duration or slowest list. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts: no-proof, typescript, unreadable-proof summaries keep explanations and not Summed duration |
| 11.3 | A proof read failure keeps the existing explanations and retry and shows no duration or slowest list. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts: no-proof, typescript, unreadable-proof summaries keep explanations and not Summed duration |
| 12.1 | Restriction: never present a sum as elapsed or current suite time. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: note 'not a run's elapsed time' |
| 12.2 | Restriction: never present a folder without successful proof as cheap or 0 s. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 12.3 | Restriction: missing evidence stays explicit (North Star). | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2 step: unknown wording for unproven children |
| 13.1 | UX journey: the developer starts from a location or folder summary already selected in the tree. They scan the sum, coverage, and spread to judge how far the figures can be trusted. Then they either descend through child rows or jump from the slowest list. | slice 4 | |
| 13.2 | Child names in a summary move the same selection as the tree, so the tree, the summary, and the reader never disagree about what is selected. | slice 3 | |
| 13.3 | Caret-only expansion keeps its SEED-217 behavior. | slice 3 | |
| 13.4 | A slowest scenario opens Purpose positioned on its case, matching Optimization Candidates. With Side by side from the Purpose and Proof layout story, its Proof row is also in view. | slice 3 | |
| 13.5 | Wording, number formats, and placement follow the existing summary and file Proof. | slice 2 | |
| 14.1 | Example 1: Doughnut's `e2e_test/features` summary with every file read → reads "Summed duration of last successful proof: 51.5 s over 23 of" its scenario total. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 14.2 | Example 1 → says the sum is of separate observations and not a run's elapsed time. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 14.3 | Example 1 → says the observations finished between 04:52 and 10:30 UTC on 2026-11-02 from 4 commits. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex1 step: sum line, not-elapsed note, spread line |
| 14.4 | Example 1 → the slowest list starts with a `cli/cli_notebook_lfs.feature` scenario. | slice 2 | |
| 15.1 | Example 2: in that summary → the `cli` row shows its sum over its covered scenarios. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 15.2 | Example 2 → a folder with no recorded proof says its duration is unknown. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 15.3 | Example 2 → the rows stay in tree order. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex2/ex6 step: children in tree order with sums; unproven children unknown, no 0 s |
| 16.1 | Example 3: click the `cli` row's name → `cli` becomes selected and revealed in the tree, and its summary shows only its own figures and slowest scenarios. | slice 3 | |
| 16.2 | Example 3: click its `cli_notebook_lfs.feature` row → the file's Purpose and Proof show as when selected in the tree. | slice 3 | |
| 17 | Example 4: from the location summary, click the slowest scenario → its file opens with Purpose positioned on that scenario, and its Proof row gives the same duration, time, and commit. | slice 3 | |
| 18.1 | Example 5: a later focused recording run is published for one feature → its scenarios show the new durations and the newer end of the spread. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex5 step: cli figures and spread end change, others unchanged, 9 without successful proof unchanged |
| 18.2 | Example 5 → every other scenario keeps its earlier duration, time, and commit. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex5 step: cli figures and spread end change, others unchanged, 9 without successful proof unchanged |
| 18.3 | Example 5 → unrecorded scenarios stay uncovered. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex5 step: cli figures and spread end change, others unchanged, 9 without successful proof unchanged |
| 19.1 | Example 6: a retried scenario that passed on its second attempt → it is counted with its total duration across both attempts. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex6 step: cli 17.0 s includes retried row's 12 s total |
| 19.2 | Example 6 → its slowest row says "2 attempts". | slice 2 | |
| 20 | Example 7: a folder of 9 files with 8 read → its sum and covered count are labelled Partial across 8 of 9 files, like its count line, until the last file is read. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex7: Partial sum line across 8 of 9 files, then complete |
| 21.1 | Example 8: Pygardon's `e2e_test/packaged/features` summary with its one observation → reads one scenario's duration and one observation time and commit. | slice 1 | observed: dashboard/tests/intent-summary-proof-cost.spec.ts ex8 step: 800 ms over 1 of 2, one time and commit |
| 21.2 | Example 8: Open Dough's `dashboard/tests` summary → keeps its existing explanation and shows no duration. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts: no-proof, typescript, unreadable-proof summaries keep explanations and not Summed duration |
| 22.1 | Excluded (deferred): ranking or reordering folders and files by their sums. | | G1 |
| 22.2 | Excluded (deferred): a project-wide summary above the locations. | | G1 |
| 22.3 | Excluded (deferred): comparisons across locations. | | G1 |
| 22.4 | Excluded (deferred): comparisons across runner families. | | G1 |
| 22.5 | Excluded (deferred): run wall time. | | G1 |
| 22.6 | Excluded (deferred): shared setup or hook attribution. | | G1 |
| 22.7 | Excluded (deferred): estimating the cost of scenarios without proof. | | G1 |
| 22.8 | Excluded (deferred): counting earlier-file-version observations at folder level. The slowest rows and file Proof still show each scenario's version. | | G1 |
| 22.9 | Excluded (deferred): other producer families, which reuse these rules where their observations support them. | | G1 |
| 22.10 | Excluded (deferred): story-scoped figures for a selected story. | | G1 |
