# Source review

Launch: fresh general-purpose sub-agent (no conversation inheritance, fork or resume), 2026-11-13, by the executing coordinator before slice 1 delegation.

Input: only the selected story section's Goal, Scope (Views, History design and response, Scope limits), Architecture and Key examples from
[SEED-331#read-ci-history-at-a-glance](../../seeds/SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance), extracted verbatim from `#### Goal` up to `#### Temporary design reference`. The reviewer was told to read no other project file, change nothing, and return numbered commitments with qualifications, examples and exclusions, without slice ownership.

Reviewer ambiguity note: the fewer-than-five insufficient-history threshold and delta suppression for a failed/unusable selected build appear only in Key example 3; "relevant provenance" (H5.5) and whether the labeled-icon refresh (H3.8) applies to scope views are undefined.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer reviewing a Done story in Dashboard Intent "can see how the landing compares with recent builds" | slice 2 | |
| G2 | …can "spot failed builds" | slice 2 | |
| G3 | …can "drill into test execution cost by entry, folder, and file" | slice 3 | |
| G4 | "The same reading serves test timing in Project Intent" | slice 3 | |
| G5 | "The chart and a few figures carry the answer without asking the reader to scan build records or reference membership" | slice 4 | |
| G6 | A slower landing or a costly test area "is noticed while reviewing rather than left unread" | slice 4 | |
| V1.1 | Done story → CI comparison: add the CI wall-time chart to the reference section | slice 2 | |
| V1.2 | Chart placed "below the Baseline, Branch, and Landed comparison and above the by-entry table" | slice 2 | |
| V1.3 | Keep the comparison's endpoint proof available | slice 2 | |
| V1.4 | Keep "CI time without runner waits" available | slice 2 | |
| V1.5 | Keep the comparison's navigation available | slice 2 | |
| V1.6 | The chart shows the selected published landing and verified retained observations through it | slice 2 | |
| V1.7 | Context: current Done wall-time reference has metrics and an open **Builds and reference evidence** list; existing history chart already renders project wall time and scope execution time | slice 2 | |
| V2.1 | Changed tests → entry or folder Summary: put test execution history above the sortable child table | slice 3 | |
| V2.2 | Immediate folders and files "still opening their own views" | slice 3 | |
| V2.3 | Both depths (entry and folder) use IntentScopeProof, which currently appends history after the table | slice 3 | |
| V2.4 | Apply the same placement in Project Intent's entry and folder Summaries | slice 3 | |
| V3.1 | Test file → Proof: put history above the file's endpoint comparison or proof table | slice 3 | |
| V3.2 | Use one chart with **Test cases** and **Test file** choices "when both measured units exist" | slice 3 | |
| V3.3 | Each choice has its own values | slice 3 | |
| V3.4 | Each choice has its own comparable average | slice 3 | |
| V3.5 | Each choice has its own scale | slice 3 | |
| V3.6 | "A case timing here is the file's test-case aggregate" | slice 3 | |
| V3.7 | Retain **Purpose** | slice 3 | |
| V3.8 | Retain the observed counts and timing comparison | slice 3 | |
| V3.9 | Retain the return to story CI comparison | slice 3 | |
| V3.10 | File Proof and Summary share scope timing history and its unit charts in both story and Project Intent contexts | slice 3 | |
| H1.1 | Same compact reading order and marks across the views | slice 3 | |
| H1.2 | Show the selected timing | slice 2 | |
| H1.3 | Show the prior-build average and count | slice 2 | |
| H1.4 | Show the signed elapsed change | slice 2 | |
| H1.5 | Show the signed percentage change | slice 2 | |
| H1.6 | Green for faster timing, amber for slower timing | slice 2 | |
| H1.7 | "the sign carrying the meaning in either appearance" (light/dark; not color alone) | slice 2 | |
| H1.8 | Label CI wall time explicitly | slice 2 | |
| H1.9 | Label cumulative test execution time explicitly | slice 3 | |
| H1.10 | Plot by build date | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: mark x positions increase with build date; Nov 2 and Nov 8 date labels |
| H1.11 | Readable units | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: axis 0 ms/500 ms/1.0 s; intent-project-ci-history-chart-marks.spec.ts narrowest-width test keeps labels inside |
| H1.12 | A diamond for the selected landing or observed trunk endpoint | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: chart.selected single closed path under the Selected/Endpoint mark |
| H1.13 | A dashed line for the prior average | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: average line has numeric stroke-dasharray |
| H2.1 | Failed builds on a separate row below the duration axis with a red × | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: one failed × centred >8px below the lowest grid line; expectMarksPainted (project spec) stroke = --problem in light and dark; intent-ci-wall-time-history-later.spec.ts top-level × |
| H2.2 | A distinct hollow mark for unavailable timing | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: one hollow unavailable mark on the failed row; expectMarksPainted fill equals chart background |
| H2.3 | Timing line broken at gaps | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: line d breaks (M) at the failed and unavailable gaps within one segment |
| H2.4 | Timing line broken across incompatible scope measurements | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: line d breaks at the selected build's incompatible case/2 segment |
| H2.5 | Each mark offers a short date, timing or status readout | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: each of 7 mark buttons named by its readout and within 1.5px of its drawn mark |
| H2.6 | …via pointer | slice 1 | observed: ciHistoryChartPage.ts inspectMark pointer in both new specs: hover shows the mark's readout |
| H2.7 | …via keyboard | slice 1 | observed: ciHistoryChartPage.ts expectMarksByTab in both new specs: Tab in date order shows each readout; focus indicated (project spec) |
| H2.8 | …via touch | slice 1 | observed: intent-ci-history-chart-marks.spec.ts 'on a touch phone' test: tapping failed, unavailable, selected marks at 390x844 shows each readout |
| H2.9 | Keep actual measured zero on the duration axis | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: zero point centred on the 0 ms grid line, readout 'Nov 5 · 0 ms' |
| H3.1 | Brief status label for pending history | slice 2 | |
| H3.2 | Brief status label for missing history | slice 2 | |
| H3.3 | Brief status label for out-of-retention history | slice 2 | |
| H3.4 | Brief status label for insufficient history | slice 2 | |
| H3.5 | Brief status label for a selected measurement that reused an equivalent or later trunk build | slice 2 | |
| H3.6 | When a later build stands for the landing, say its timing includes later changes | slice 2 | |
| H3.7 | If only the prior average is available, still show it | slice 2 | |
| H3.8 | Keep the Done reference's refresh as a labeled icon | slice 2 | |
| H3.9 | Show a short retry action when a history read fails | slice 3 | |
| H3.10 | Preserve the last successful history when a refresh fails for the same endpoint | slice 3 | |
| H3.11 | …independently of comparison refresh | slice 3 | |
| H4.1 | Remove **Builds and reference evidence** from the affected views | slice 2 | |
| H4.2 | Remove **Builds and evidence** from the affected views | slice 3 | |
| H4.3 | Remove the Included membership rows | slice 3 | |
| H4.4 | Remove the Excluded membership rows | slice 3 | |
| H4.5 | Remove the Selected membership rows | slice 3 | |
| H4.6 | Replace the reference methodology paragraphs with the chart and its compact metrics | slice 3 | |
| H4.7 | Replace repeated provenance paragraphs with the chart and its compact metrics | slice 3 | |
| H4.8 | Affected shared metric and list owners: IntentCiPriorBuildReference and IntentScopePriorBuildReference | slice 3 | |
| H5.1 | Slim the selected and scoped authenticated history responses at the API boundary | slice 4 | |
| H5.2 | Send dated measurements | slice 4 | |
| H5.3 | Send typed gap statuses and reasons | slice 4 | |
| H5.4 | Send compatible segment information | slice 4 | |
| H5.5 | Send the selected endpoint and relevant provenance | slice 4 | |
| H5.6 | Send the compact prior-reference figures | slice 4 | |
| H5.7 | Omit per-build membership | slice 4 | |
| H5.8 | Omit median and filtering details | slice 4 | |
| H5.9 | Omit duplicated run and landing metadata used only by the removed lists | slice 4 | |
| H5.10 | Project Intent's top-level CI status history still consumes the richer response | slice 4 | |
| H5.11 | A dashboard page already open before deployment keeps reading the response it understands | slice 4 | |
| H5.12 | The new reader asks for the slim response explicitly, as the existing gap-reason capability does | slice 4 | |
| H6.1 | Derive the display from the existing retained history and Git-ordered cohort | slice 4 | |
| H6.2 | Keep current measurement eligibility | slice 4 | |
| H6.3 | Keep current retention | slice 4 | |
| H6.4 | Keep current reference math | slice 4 | |
| H6.5 | The automatic follow-up ledger keeps its full decision evidence server-side | slice 4 | |
| H6.6 | Browsing history remains a local read | slice 4 | |
| H6.7 | Update the wall-time and reference specification (currently requires the evidence lists) | slice 2 | |
| H6.8 | Update the applicable CI comparison guidance | slice 2 | |
| H6.9 | Display remains derived under ADR 0008 | slice 4 | |
| S1 | Project Intent's top-level CI status history keeps its lists | slice 4 | |
| S2 | Project Intent's top-level CI status history keeps its richer response | slice 4 | |
| S3 | Story CI follow-up reading keeps its saved reference membership | slice 4 | |
| S4 | Either may show the improved chart marks or compact metrics because it shares them, "with no separate delivery commitment" | slice 4 | |
| A1 | One dated history chart serves Done CI wall time and every scope and file timing view | slice 3 | |
| A2 | One compact comparison readout serves those same views | slice 3 | |
| A3 | The shared history chart gains the failed row, unavailable marks, and per-mark readouts once | slice 1 | observed: IntentCiHistoryChart.tsx MarkReadout + IntentCiHistoryPlot.tsx shared by scope chart (both new specs) and top-level chart (intent-ci-wall-time-history-later.spec.ts ×) |
| A4 | The prior-build metrics both views already share become that compact readout | slice 2 | |
| A5 | Done and scope views stop composing the membership list, which stays only for the follow-up reading | slice 3 | |
| A6 | "no view keeps its own chart or metric copy" | slice 3 | |
| A7 | Slim selected and scoped history is a server projection of existing retained history behind the explicit reader capability | slice 4 | |
| A8 | It "adds no second store or calculation" | slice 4 | |
| E1.1 | Done landing 8m 04s vs six comparable builds averaging 8m 24s → shows −20s and −4% | slice 2 | |
| E1.2 | …with a selected diamond and the dashed average | slice 2 | |
| E1.3 | A failed build and a missing measurement appear as distinct dated marks below the timing plot | slice 2 | |
| E1.4 | Inspecting either shows its status in one line | slice 2 | |
| E1.5 | The chart omits unrelated newer landings | slice 2 | |
| E2.1 | From that story, open the dashboard test entry, drill into a folder, open a test file (journey) | slice 3 | |
| E2.2 | In both Summaries, history is visible before the child table | slice 3 | |
| E2.3 | In file Proof, switching test-case/test-file timings changes selected value, average, and chart scale together | slice 3 | |
| E2.4 | Same layout usable by keyboard and touch | slice 3 | |
| E2.5 | …in light and dark appearance | slice 3 | |
| E3.1 | Selected build failed or has no usable timing → show its status and any usable prior average without a delta | slice 3 | |
| E3.2 | Fewer than five comparable prior builds → show available observations with a short insufficient-history status | slice 3 | |
| E3.3 | A measured zero remains a point | slice 1 | observed: dashboard/tests/support/scopeHistoryMarksScenario.ts expectMarkedScopeHistoryDrawn via frontend-tests/intent-ci-history-chart-marks.spec.ts and intent-project-ci-history-chart-marks.spec.ts: measured zero drawn as a filled point on the axis floor |
| E3.4 | Zero prior average → elapsed difference shown, percentage unavailable | slice 3 | |
| E3.5 | Later trunk build supplies the selected measurement → keep that provenance visible | slice 3 | |
| E4.1 | History refresh fails while the Done comparison or scope Proof remains usable | slice 3 | |
| E4.2 | Retained history and compact retry stay available independently of the endpoint comparison | slice 3 | |
| E4.3 | Selected and scoped responses contain the chart data without the former lists | slice 4 | |
| E4.4 | Saved follow-up reference retains its membership and exact decision evidence | slice 4 | |
