# Slice 5 history assertion dispositions

Original source at a2692caf9c13edd785f452308381fe708002f5aa.
Each row retains an observing occurrence in original order. The same-named
Frontend case preserves its expected expression unless a real boundary is named.
Controlled payloads establish presentation input, never real source judgment.

## intent-ci-done-glance.spec.ts: case 1

Named destination: `dashboard/frontend-tests/intent/intent-ci-done-glance.spec.ts` —
a Done landing's CI wall time reads against its recent builds between the endpoints and the entry table.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 59 | `expect(history.selected).toHaveText( \`Selected landing ${shortSha(setup.completion)} · 8 min 4 s\`, )` | Same named Frontend case |
| 62 | `expect(history.average).toHaveText( "Prior-build average · 8 min 24 s · 6 prior builds used", )` | Same named Frontend case |
| 65 | `expect(history.change).toHaveText("vs. prior average · −20 s (−4%)")` | Same named Frontend case |
| 66 | `expectChangeCue(page, history.region, "faster")` | Same named Frontend case |
| 67 | `expect(history.status).toHaveCount(0)` | Same named Frontend case |
| 68 | `expect(history.refresh).toBeVisible()` | Same named Frontend case |
| 69 | `expect(comparison.entryTable).toBeVisible()` | Same named Frontend case |
| 70 | `expectStackedInOrder([ comparison.endpointTable, history.region, comparison.entryTable, ])` | Same named Frontend case |
| 75 | `expect(comparison.wallTimes.nth(2)).toHaveText("4 min")` | Same named Frontend case |
| 76 | `expect( comparison.endpointTable.getByRole("columnheader", { name: "CI time without runner waits", }), ).toBeVisible()` | Same named Frontend case |
| 84 | `expect(chart.marks).toHaveCount(9)` | Same named Frontend case |
| 85 | `expect(chart.selected).toHaveCount(1)` | Same named Frontend case |
| 86 | `expect(chart.average).toHaveCSS("stroke-dasharray", /\d/)` | Same named Frontend case |
| 87 | `expect(chart.averageLabel).toHaveText("Prior-build average 8 min 24 s")` | Same named Frontend case |
| 88 | `expect(chart.failed).toHaveCount(1)` | Same named Frontend case |
| 89 | `expect(chart.unavailable).toHaveCount(1)` | Same named Frontend case |
| 90 | `expect(chart.readout).toHaveText( "Nov 9 · Selected landing · 8 min 4 s", )` | Same named Frontend case |
| 93 | `inspectMark(chart, "Nov 2 · Failed build", "pointer")` | Same named Frontend case |
| 94 | `inspectMark( chart, "Nov 4 · No timing · No CI proof summary", "pointer", )` | Same named Frontend case |
| 99 | `expect(chart.mark("Nov 8 · 1 min 40 s")).toHaveCount(0)` | Same named Frontend case |
| 101 | `expect(priorBuildReferenceReading(panel).evidence).toHaveCount(0)` | Same named Frontend case |
| 108 | `expect(panel).not.toContainText(removed)` | Same named Frontend case |
| 111 | `expect(history.change).toHaveText("vs. prior average · −20 s (−4%)")` | Same named Frontend case |
| 112 | `expectChangeCue(page, history.region, "faster")` | Same named Frontend case |

## intent-ci-done-reference-lifecycle.spec.ts: case 1

Named destination: `dashboard/frontend-tests/intent/intent-ci-done-reference-lifecycle.spec.ts` —
failed and unavailable CI comparisons keep the local history after their gap, and its failed refresh and retry leave the comparison as it was.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 69 | `expect(gap).toContainText("CI comparison read failed")` | Same named Frontend case |
| 70 | `expect(history.average).toHaveText(average)` | Same named Frontend case |
| 71 | `expectStackedInOrder([gap, history.region])` | Same named Frontend case |
| 75 | `expect(gap).toHaveText("Comparison evidence incomplete")` | Same named Frontend case |
| 77 | `expect(history.average).toHaveText(average)` | Same named Frontend case |
| 83 | `expect(history.alert).toContainText( "The collected CI history could not be read", )` | Same named Frontend case |
| 86 | `expect(history.average).toHaveText(average)` | Same named Frontend case |
| 87 | `expect(gap).toHaveText("Comparison evidence incomplete")` | Same named Frontend case |
| 90 | `expect(history.alert).toHaveCount(0)` | Same named Frontend case |
| 91 | `expect(history.retry).toHaveCount(0)` | Same named Frontend case |
| 92 | `expect(history.average).toHaveText(average)` | Same named Frontend case |
| 93 | `expect(gap).toHaveText("Comparison evidence incomplete")` | Same named Frontend case |
| 94 | `expect(intent).toHaveAttribute("data-selected-story", setup.identity)` | Same named Frontend case |
| 95 | `expect(actions()).toHaveLength(before)` | Backend `intent/ci-done-history-retry`: real corrupt local refresh + restored retry, exact unchanged Actions count |

## intent-ci-done-reference-lifecycle.spec.ts: case 2

Named destination: `dashboard/frontend-tests/intent/intent-ci-done-reference-lifecycle.spec.ts` —
a shown comparison's later CI failure and recovery move the local history without rereading or discarding it.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 125 | `expect(history.average).toHaveText(average)` | Same named Frontend case |
| 126 | `expectStackedInOrder([ reading.endpointTable, history.region, reading.entryTable, ])` | Same named Frontend case |
| 131 | `expect(historyReads).toBe(1)` | Same named Frontend case |
| 134 | `expect(reading.gap).toContainText("CI comparison read failed")` | Same named Frontend case |
| 135 | `expect(history.average).toHaveText(average)` | Same named Frontend case |
| 136 | `expect(history.alert).toHaveCount(0)` | Same named Frontend case |
| 137 | `expect(historyReads).toBe(1)` | Same named Frontend case |
| 141 | `expect(reading.wallTimes.nth(2)).toHaveText("4 min")` | Same named Frontend case |
| 142 | `expect(history.average).toHaveText(average)` | Same named Frontend case |
| 143 | `expectStackedInOrder([ reading.endpointTable, history.region, reading.entryTable, ])` | Same named Frontend case |

Recorded 48 observing occurrences. Scenario setup and helper-derived
observations (diff text/scroll, revision labels, holds and focus) remain in the
named cases; real setup and command results are in [slice-5-proof](slice-5-proof.md).
