# Source review

Launched 2026-11-18 as a fresh general-purpose reviewer without conversation
inheritance, fork or resume. Input: the correction story's Title, Goal and
Scope from `SEED-383#tell-compared-usage-tools-apart`, and the plan's Current
findings, Preserved promises and constraints, and Current decisions, with no
slicing, proof or product files. Instruction: use only these inputs, read no
other project files, change nothing, and number independently observable
promises.

Unnumbered context returned: the story corrects the delivered comparison and
adds no promise about product intent; finding 1's cause (`problem` stored under
`${selectionKey}#${refreshed}`, written only on failure); finding 2's
colour-only trace style; finding 3's two guards and that a delaying or
reordering spec proves promise 5; why a triangle; a possible tension between
promise 22 and placing the triangle in the shared second trace style, left to
the plan.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | After K fails, switching away and back to K without Refresh (e.g. 30 → 7 → 30 days) shows no old alert at once; "Loading usage…" shows while K is read again | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-selection.spec.ts: 'a failure leaves once its selection is read again' and 'a failure leaves once a day round trip reads its period again' (showsLoading, showsNoProblem while held; red without fix) |
| 2 | Once a read for the shown selection succeeds, no earlier failure alert appears next to the new chart | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-selection.spec.ts: both failure-leaves cases, after release showsPointCount + showsNoProblem |
| 3 | A failed Refresh still keeps the last same-selection result and its check time | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-compare.spec.ts: 'an empty tool says so, a failed read names its tool…' failed Refresh keeps showsPointCount(3) and showsCheckedAt |
| 4 | A failed read for a new selection still shows only the tool-named error | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-compare.spec.ts: same case, Refinement selection showsProblem tool-named and showsPointCount(0) |
| 5 | Answers for an old selection never appear in a newly chosen selection, even when delayed or out of order | slice 1 | observed: dashboard/frontend-tests/system-settings-usage-selection.spec.ts: 'an answer for a selection already left never joins the one shown' (held Claude Code read released after hiding; only Codex, 2 points; premise: fails without guards) |
| 6 | A measured Claude Code task is drawn as a filled triangle | slice 2 | |
| 7 | A partial Claude Code task is drawn as a hollow triangle with the caution stroke | slice 2 | |
| 8 | Codex marks stay a filled circle (measured) and a hollow caution diamond (partial) | slice 2 | |
| 9 | Claude Code's median stays a dashed trend line and Codex's stays solid | slice 2 | |
| 10 | For either tool, the selected task is still the larger diamond labelled "Selected task" | slice 2 | |
| 11 | The open task detail names the tool the task belongs to | slice 2 | |
| 12 | For each shown tool the legend has task mark, partial mark and median entries matching what is drawn | slice 3 | |
| 13 | A hidden tool has no legend entries; with Claude Code alone there is no Codex "Task" swatch | slice 3 | |
| 14 | Each tool summary's heading swatch is that tool's task mark | slice 3 | |
| 15 | The usageTokenIndex.ts comment names UsageToolSummary.tsx as home of the auxiliary-usage note | slice 3 | |
| 16 | USAGE-TOKEN-INDEX.md no longer says coincident large tasks keep date coordinates under equal spacing | slice 3 | |
| 17 | USAGE-TOKEN-INDEX.md says any change of selection or day clears the selected task | slice 3 | |
| 18 | USAGE-TOKEN-INDEX.md's "also reads without colour" matches the delivered shapes and legend | slice 3 | |
| 19 | Each tool's values, units, tariff, median, coverage and unpriced notes are unchanged | slice 3 | |
| 20 | Model and effort choices still offer the union across tools, and their reset is unchanged | slice 3 | |
| 21 | Placement by time and by equal spacing is unchanged | slice 3 | |
| 22 | CI and scope charts render as before, though the triangle goes into the shared second trace style | slice 2 | |
| 23 | Partial marks still use the caution colour for the same meaning | slice 2 | |
| 24 | Large-task marks keep their current meaning | slice 2 | |
| 25 | ↑ overflow marks keep their current meaning | slice 2 | |
