# Source-only review

The fresh-context `source` reviewer received only the selected story's Goal,
Scope, Key examples and exclusions from the [canonical seed](../../seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually).
Its launch brief excluded the plan, project files, and any prior returns.
The reviewer observed that the first example exercises the browser path in a
project with both browser and unit tests.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | A developer can invoke the installed `dough-intent-coverage` skill during ordinary review. | slice 4 | |
| C02 | The invocation probes an existing test against one plausible fault in an important story promise. | slice 2 | observed: the Proposed skill's opening and the returned Caught result in plan 503 Slice 2, tied to one promise, fault and assertion |
| C03 | The result helps the developer decide whether to retain or strengthen that specific protection. | slice 2 | observed: the Proposed skill's opening and the returned Caught result in plan 503 Slice 2, tied to one promise, fault and assertion |
| C04 | Identify the selected story. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C05 | Identify the selected revision. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C06 | Identify the promise. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C07 | Identify the plausible fault. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C08 | Identify the maintained assertion. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C09 | Ask for the missing story source when the promise cannot be established. | slice 2 | observed: the Proposed skill's Choose the check section and the representative missing-source walkthrough |
| C10 | Use the project's focused test command. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C11 | Use an isolated scratch checkout of the selected revision. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C12 | Establish a passing baseline before introducing a fault. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C13 | Introduce one temporary fault. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C14 | Check whether the fault reaches the intended assertion. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C15 | Restore the edit even when the run fails. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C16 | Verify restoration. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C17 | Rerun the focused check after restoration. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C18 | Report the applicable outcome among the alternatives in Q01–Q03. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| C19 | Cite the supporting fixture. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C20 | Cite the supporting assertion. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C21 | Cite the supporting run observations. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C22 | Limit the finding to the selected promise. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C23 | Limit the finding to the selected fault. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C24 | Limit the finding to the observed path. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| C25 | Return the result directly to the caller. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C26 | Report measured elapsed time from invocation through reporting, including setup and runs. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C27 | Show test runtime separately when observed. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C28 | Show human effort separately when supported. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C29 | Show agent effort separately when supported. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C30 | Give the unit for each figure. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C31 | Give the basis for each figure. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C32 | Label each figure as measured or estimated, with C26 requiring measurement for total elapsed time. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C33 | Mark unavailable values explicitly. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C34 | Leave persistence with the caller. This clause cites the Architectural North Star. | slice 2 | observed: the Proposed skill's Return the result section and Slice 2 returned report with the measured harness interval, separate runtime and effort basis |
| C35 | Demonstrate the invocation in a project with browser and unit tests. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| C36 | Demonstrate the same invocation in a project with a different test stack. | slice 3 | |
| C37 | Use one shared source. | slice 4 | |
| C38 | Use the normal versioned delivery path. The delivery clause cites ADR 0003, ADR 0005, and ADR 0006. | slice 4 | |
| E01 | A cancelled landing waiting for later proof can pick up a newly available build. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| E02 | The scratch fault freezes the waiting answer. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| E03 | The focused browser journey passes at baseline. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| E04 | The faulted journey fails at the assertion for the newly available result. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| E05 | The journey passes after restoration. | slice 2 | observed: the Slice 2 native trace, exact one-case command, pass/fail/pass logs and matched scratch snapshots cited in this plan |
| E06 | The report credits that browser assertion for the fault and path observed. | slice 2 | observed: the Slice 2 native returned report and pinned browser fixture, cache guard, and first post-push Landed assertion recorded in this plan |
| E07 | A C lookup table with distinct designated initializer rows should produce no duplicates. | slice 3 | |
| E08 | The scratch fault stops counting designated fields and their values as data. | slice 3 | |
| E09 | The focused pytest case catches that fault. | slice 3 | |
| E10 | The report credits the duplicate-detector extension path exercised by the case. | slice 3 | |
| E11 | The invocation returns its cost evidence. | slice 3 | |
| Q01 | Report that the intended assertion caught the fault when observations support that result. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| Q02 | Report that the intended assertion allowed the observed wrong behavior when observations support that result. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| Q03 | Report insufficient evidence when the observations cannot establish the result. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| Q04 | A green focused run with independent evidence that the fault changed the behavior under test establishes the example's assertion gap. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| Q05 | When setup or reach cannot be established, report the missing observation. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| Q06 | In that insufficient-evidence case, report the cost of the attempt. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| Q07 | A failing baseline ends the probe before any scratch fault is applied. | slice 2 | observed: the Proposed skill's Run and restore and Return the result sections, the representative evidence-limit walkthrough, and both native outcomes in Slice 2 |
| X01 | The wrap-up story owns automatic invocation. | slice 2 | observed: the Proposed skill's opening scope and Slice 2 consumer trace, which includes no automation, persisted assessment, dashboard, test repair or broad review change |
| X02 | The wrap-up story owns done-record storage. | slice 2 | observed: the Proposed skill's opening scope and Slice 2 consumer trace, which includes no automation, persisted assessment, dashboard, test repair or broad review change |
| X03 | The wrap-up story owns dashboard rendering. | slice 2 | observed: the Proposed skill's opening scope and Slice 2 consumer trace, which includes no automation, persisted assessment, dashboard, test repair or broad review change |
| X04 | Test repairs are separate work. | slice 2 | observed: the Proposed skill's opening scope and Slice 2 consumer trace, which includes no automation, persisted assessment, dashboard, test repair or broad review change |
| X05 | Broader assessments are separate work. | slice 2 | observed: the Proposed skill's opening scope and Slice 2 consumer trace, which includes no automation, persisted assessment, dashboard, test repair or broad review change |
