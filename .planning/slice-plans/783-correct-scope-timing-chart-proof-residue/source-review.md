# Source review

A fresh general-purpose reviewer, without conversation inheritance, read only
the seed section `SEED-413#correct-scope-timing-chart-proof-residue` (title,
goal, scope) and this plan's `## Correction input` and `## Goal and scope`
sections, copied verbatim into one input file. It received no slicing, return,
product or proof, read no other project files and changed nothing.

Unnumbered context it returned: the correction's origin (plan 777 at
`5119da43d..91ebbc1fa`, recoverable at `d156695c5`); finding 1's reason for the
fold ("Selected landing" asserted elsewhere, cohort kept at 14 cases); finding
3's Intent Coverage baseline at `973e1faf`; finding 6's CSS-only fault; the
excluded `intent-story-dark-appearance.spec.ts:138-191` duplicate owned by that
file's migration story; and the limit "Change only the files named above".

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The legacy-only unit case has its no-timing check back, so a gap shown as a time fails (Scope; finding 2; Goal "every moved assertion can fail") | slice 1 | observed: intent-scope-timing-history-units.spec.ts:106 no-timing assertion; break check s1-break-units-4 (scratch "0 ms" beside status) fails there |
| 2 | The Project chart-mark dark pass proves the scheme changed, so an app that ignores the scheme entirely and reruns light fails (Scope; finding 3) | slice 1 | observed: intent-project-ci-history-chart-marks.spec.ts:72-88 readout-ink change poll; break check s1-break-dark (dark queries unmatched) fails at line 81 |
| 3 | The Done pointer and keyboard chart-mark case is folded into the Project case, so no chart-mark case repeats another's checks (Scope; Goal; finding 1) | slice 2 | |
| 4 | The Done touch case stays, and the Done chart stays readable by touch through its own entry (Scope; Goal and scope) | slice 2 | |
| 5 | The Project chart stays readable by pointer and keyboard in both the light and dark schemes (Goal and scope) | slice 2 | |
| 6 | The Project chart stays readable at the narrowest width (Goal and scope) | slice 2 | |
| 7 | The spent `historyChart()` members `partial`, `failed` and `averageLabel` are removed from `dashboard/test-support/historyChartPage.ts` (Scope; finding 4) | slice 2 | |
| 8 | The reading spec's copy of the Done comparison check is removed, leaving `expectDoneEntryComparisonKept` as the single reader (Scope; finding 5) | slice 2 | |
| 9 | Feedback stays at least as fast: the two chart-mark specs are compared at two workers before and after, and the after run is no slower (Scope; Goal and scope; finding 1 baseline 2.7–4.3 s) | slice 2 | |
| 10 | `openScopeSummary` stops timing out under load at Vitest's default poll timeout while it waits for the location name control (finding 6) | slice 1 | observed: intent-scope-history-page.ts locationNameDrawn waits on the control, bounded only by the case timeout; s1-consumers 17 files/26 tests passed at load 64→47 |
| 11 | Plan 777's promises stay as written, so its delivered scope history and chart-mark behavior and proof are preserved (seed; Goal and scope) | slice 2 | |
