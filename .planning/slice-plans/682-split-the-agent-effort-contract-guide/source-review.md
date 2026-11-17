# Source-only review

Fresh general-purpose reviewer launched on 2026-11-17 without conversation
inheritance. Its input contained only the correction story's Goal and Scope
and the plan's provenance, goal and scope, and preserved promises; no slicing,
proof or implementation. It read no project files and changed none.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | `dashboard/AGENT-EFFORT.md` stays within 250 lines ("Both guides stay within 250 lines.") | slice 1 | observed: wc -l dashboard/AGENT-EFFORT.md: 149 lines |
| C2 | The new output-contract guide stays within 250 lines | slice 1 | observed: wc -l dashboard/AGENT-EFFORT-OUTPUT.md: 112 lines |
| C3 | The three output-contract sections move together into one guide beside `AGENT-EFFORT.md` and leave it | slice 1 | observed: dashboard/AGENT-EFFORT-OUTPUT.md headings Selection/Single-report/Comparison contract; grep of AGENT-EFFORT.md headings shows none of them |
| C4 | `AGENT-EFFORT.md` keeps the command usage, historical sample boundaries, explicit comparison groups and definitions | slice 1 | observed: dashboard/AGENT-EFFORT.md keeps intro usage and options paragraph, Historical sample boundaries, Explicit comparison groups, Definitions and limits; diff of original lines 1-30,109-187,219-253 against it is empty |
| C5 | `AGENT-EFFORT.md` links to the new guide | slice 1 | observed: dashboard/AGENT-EFFORT.md lines 31-34 link AGENT-EFFORT-OUTPUT.md and its three contract anchors |
| C6 | Every documented public name, shape, unit, coverage value, refusal and comparison rule stays word for word | slice 1 | observed: diff of original AGENT-EFFORT.md lines 31-108,188-217 against AGENT-EFFORT-OUTPUT.md from line 5 is empty; kept-content diff also empty |
| C7 | Source comments in the four `dashboard/server/agentEffort*.ts` files cite moved anchors in the new guide | slice 1 | observed: header comments of dashboard/server/agentEffort{Catalog,ComparisonReport,SingleReport,SingleReportFacts}.ts cite AGENT-EFFORT-OUTPUT.md#selection/comparison/single-report-contract |
| C8 | Test readers `dashboard/tests/usage-history/agentEffort{Selection,Cost,Compare}.ts` cite moved anchors in the new guide; no citation still points to a moved anchor in `AGENT-EFFORT.md` | slice 1 | observed: header comments of dashboard/tests/usage-history/agentEffort{Selection,Cost,Compare}.ts cite AGENT-EFFORT-OUTPUT.md anchors; git grep "AGENT-EFFORT.md#" outside .planning finds nothing |
| C9 | `Distribution/evaluation/comparison.md`'s link to the guide keeps working | slice 1 | observed: Distribution/evaluation/comparison.md:171 links ../../dashboard/AGENT-EFFORT.md, which exists |
| C10 | No product, CLI, output or test behavior changes | slice 1 | observed: TS diff is comment-only (no non-comment +/- lines); 73 agent-effort backend specs pass (npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/agent-effort-) |
