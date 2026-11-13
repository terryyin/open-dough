# Source review

Reviewer launch: a fresh general-purpose subagent (no conversation
inheritance, fork or resume) on 2026-11-13, told to use only the supplied text,
read no project files and change nothing, and to return numbered commitments,
qualifications, examples and exclusions without slice ownership or acceptance.

Input: the correction story's Goal and Scope from
`.planning/seeds/SEED-331-read-ci-history-at-a-glance.md#make-ci-glance-wording-and-status-one-rule`,
plus the correction input from this plan's "Source and provenance", "Current
findings" and "Preserved promises and constraints" sections (file:line
locations and the plan 609 recovery path shortened; no slicing, premises,
gates or decisions).

The reviewer numbered its exclusions and preserved items 1–9 separately from
the commitments; they are recorded here as X1–X9 to keep ids unique. Its notes:
Goal 1 names Done story, test Summaries and file Proof while Scope names the
Done wall-time and scope history readouts; the source picks no winning word
for 4.1–4.4.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reading CI history "meets one vocabulary for the same marks and statuses" in each of these views: | slice 1 | observed: slice 1: Done story, test Summary and file Proof read one vocabulary (see 1.1–1.3, 4.1–4.4) |
| 1.1 | in a Done story; | slice 1 | observed: dashboard/tests/intent/intent-ci-done-glance.spec.ts: readout 'Nov 9 · Selected landing · 8 min 4 s', chart.averageLabel 'Prior-build average 8 min 24 s' |
| 1.2 | in its test Summaries; | slice 1 | observed: dashboard/tests/intent/intent-scope-glance.spec.ts: entry Summary walkthrough ends 'Nov 7 · Selected landing · 1.4 s', entryChart.averageLabel 'Prior-build average 618 ms'; intent-scope-prior-build-states.spec.ts folder Summary average 'Scope identity unavailable' |
| 1.3 | in its file Proof. | slice 1 | observed: dashboard/tests/intent/intent-scope-glance.spec.ts: file Proof cases.averageLabel 'Prior-build average 103 ms', cases.readout 'Nov 7 · Selected landing · 120 ms'; intent-scope-prior-build-states.spec.ts proofRegion contains 'Scope identity unavailable' line |
| 2 | "a build the dashboard knows failed always reads as failed" | slice 2 | observed: tests/support/ci-failed-build-status.test.mjs 'a failed build and a landing's final failed gap read failed…' (scope answer failed, glance gap.status failed, reference.selected.failed); intent-scope-glance.spec.ts real-server journey: Tab walk 'Nov 6 · Failed build', expectMarkOver(entryChart.failed), expectFailedMarkPainted; compact readout 'Failed build' from selected.failed |
| 3 | "the glance reads the same wherever it appears" | slice 1 | observed: slice 1: the chart layout labels every dashed line from HistoryChartSeries.averageMs (ciHistoryChartLayout.ts) and names the selected build with shared selectedLandingWords (ciHistoryWords.ts); scope gap reasons from shared gapReasonWords (server/ciScopeHistoryGap.ts); Done and scope specs assert identical words |
| 4 | The "Done wall-time and scope history readouts" use: | slice 1 | observed: slice 1: see 4.1–4.4 |
| 4.1 | "one selection word" (wall-time "Selected landing" vs scope "Selected"; the selected-gap marker follows the split) | slice 1 | observed: intentScopeHistoryContext.ts scopeHistorySelectionWords 'Selected landing'; asserted in intent-ci-done-glance.spec.ts and dashboard/tests/intent/intent-scope-glance.spec.ts readouts |
| 4.2 | "one prior-average line label" (`averageLineOf` "Prior-build average 8 min 24 s" vs scope "Prior-build average: 103 ms") | slice 1 | observed: ciHistoryChartLayout.ts labels 'Prior-build average <series timing words>' for both views; averageLabel asserted in intent-ci-done-glance.spec.ts ('8 min 24 s') and intent-scope-glance.spec.ts ('618 ms', '103 ms') |
| 4.3 | "one brief pending wording" (Done "No timing · Pending · CI queued or running" vs scope "Pending CI build" / raw "Pending CI later-build") | slice 1 | observed: intent-scope-timing-history-gaps.spec.ts 'a pending selected build…' fixture via scopeHistoryOf→scopeHistoryGlanceOf asserts status 'Pending · CI queued or running', the Done gapReasonWords wording |
| 4.4 | "a brief missing identity status" (missing scope identity puts a whole sentence where the average belongs) | slice 1 | observed: server/ciScopeHistoryReference.ts reason 'Scope identity unavailable'; intent-scope-prior-build-states.spec.ts average 'Prior-build average · Scope identity unavailable · 0 prior builds used'; tests/support/ci-scope-prior-build-reference.test.mjs |
| 5 | "Carry the failed status from where the build state is known instead of matching reason strings." Rewording a reason must not read a failed build as "No timing". | slice 2 | observed: dashboard/src/ciFailedBuild.ts isKnownFailed/gapStatusOf from build state or final gap reason; reasonStatus and glance string-match gapOf removed; ci-failed-build-status.test.mjs 'a reworded failure reason still reads failed, and failure words never make a build failed' |
| 6 | "Correct the CI and scope reference docs' sentences about the removed date span, evidence and exclusion reasons": | slice 1 | observed: slice 1: see 6.1–6.4 |
| 6.1 | the CI reference doc's "reports … their actual date span"; | slice 1 | observed: docs/dashboard-development-intent-ci-reference.md: 'The compact readout reports how many prior builds the average used.' |
| 6.2 | the CI reference doc's "Four show their evidence"; | slice 1 | observed: docs/dashboard-development-intent-ci-reference.md: 'Fewer show Insufficient history, with the observations still charted.' |
| 6.3 | the scope reference doc's "explicit unavailable difference"; | slice 1 | observed: docs/dashboard-development-intent-scope-reference.md: 'whose average shows beside the selected status without a change' |
| 6.4 | the scope reference doc's "retain their specific exclusion reasons". | slice 1 | observed: docs/dashboard-development-intent-scope-reference.md: 'stay out of the average; the chart still shows each build as a point or a gap with its brief reason' |
| 7 | "Consolidate the overlapping glance specs the review named": | slice 3 |  |
| 7.1 | `intent-ci-done-prior-states.spec.ts` repeats three mounted states of `intent-ci-compact-readout.spec.ts`; | slice 3 |  |
| 7.2 | full mark Tab walkthroughs run in both chart-marks specs and `intent-scope-glance.spec.ts`; | slice 3 |  |
| 7.3 | the default-answer membership check repeats in `ci-history-slim-response.spec.ts` (two tests) and `ci-history-glance-compatibility.spec.ts`; | slice 3 |  |
| 7.4 | the zero-average branch is proved in three browser specs plus `tests/support/ci-prior-build-reference.test.mjs`. | slice 3 |  |
| X1 | "Response compatibility … stay[s] as [it is]." | slice 2 | observed: only optional failed fields added; ci-history-slim-response.spec.ts passes with unchanged assertions |
| X2 | Project Intent's top-level CI status history lists stay as they are. | slice 1 | observed: IntentCiHistory.tsx unchanged; dashboard/frontend-tests/intent-project-ci-history-chart-marks.spec.ts passes unchanged |
| X3 | The follow-up reading stays as it is, including its membership. | slice 3 |  |
| X4.1 | Prior promise stands: "the same compact reading order and marks across the views". | slice 1 | observed: both chart-marks frontend specs and dashboard/tests/intent/intent-scope-glance.spec.ts Tab walkthrough pass with marks and order unchanged |
| X4.2 | Prior promise stands: brief status labels. | slice 1 | observed: brief words: 'Selected landing', 'Pending · CI queued or running', 'Scope identity unavailable' replace sentences/raw enums |
| X4.3 | Prior promise stands: "no view keeps its own chart or metric copy". | slice 1 | observed: scope inlined average label removed: IntentScopeTimingHistoryUnits.tsx passes averageMs to the shared chart layout and uses shared gap words |
| X5.1 | Done and scope glance layout kept. | slice 3 |  |
| X5.2 | Done and scope glance marks kept. | slice 3 |  |
| X5.3 | Readouts by pointer kept. | slice 3 |  |
| X5.4 | Readouts by keyboard kept. | slice 3 |  |
| X5.5 | Readouts by touch kept. | slice 3 |  |
| X5.6 | Light/dark kept. | slice 3 |  |
| X5.7 | Retry kept. | slice 3 |  |
| X5.8 | Retention kept. | slice 3 |  |
| X6 | The `history=glance` contents are kept. | slice 2 | observed: ci-history-slim-response.spec.ts passes unchanged; glance adds optional reference.selected.failed only |
| X7 | The default response stays unchanged for pages opened before deployment (frozen readers stay frozen). | slice 2 | observed: ci-history-glance-compatibility.spec.ts (frozen previousScopeHistoryOf parses a default answer carrying failed: true) and ci-history-reader-compatibility.spec.ts pass; default reason strings unchanged; previousCiHistoryReader untouched |
| X8.1 | Reference math unchanged. | slice 2 | observed: priorBuildReferenceOf only copies failed onto selected; ci-prior-build-reference.test.mjs and ci-prior-build-boundaries.test.mjs pass |
| X8.2 | Eligibility unchanged. | slice 2 | observed: eligibility filtering untouched; ci-prior-build-reference.test.mjs, intent-ci-prior-build-states.spec.ts pass |
| X8.3 | Retention unchanged. | slice 2 | observed: retention untouched; landed-ci-history-* tests and ci-follow-up-ledger.test.mjs pass |
| X9 | ADR 0008 still applies: a derived local read. | slice 2 | observed: no acquisition or store added; reads derive from retained local history (ciScopeHistoryTiming.ts, ciWallTimeReference.ts) |
